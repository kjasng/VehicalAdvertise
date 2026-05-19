-- Wheels Earner — state-machine guard + view skeletons
-- Service-role calls these from API route handlers; clients never UPDATE status directly.

-- (`is_admin()` is defined in 0002_rls.sql so policies in that file can use it.)

-- assert_transition: raises exception on illegal state transition.
create or replace function assert_transition(
  entity_type text,
  from_state  text,
  to_state    text
) returns void
language plpgsql
as $$
declare
  allowed boolean := false;
begin
  if entity_type = 'campaign' then
    allowed := (from_state, to_state) in (
      ('draft','submitted'),
      ('submitted','approved'),
      ('submitted','rejected'),
      ('approved','awaiting_install'),
      ('approved','cancelled'),
      ('awaiting_install','active'),
      ('awaiting_install','cancelled'),
      ('active','paused'),
      ('paused','active'),
      ('active','completed'),
      ('paused','completed'),
      ('active','cancelled'),
      ('paused','cancelled')
    );
  elsif entity_type = 'contract' then
    allowed := (from_state, to_state) in (
      ('matched','awaiting_install'),
      ('matched','terminated'),
      ('awaiting_install','installed'),
      ('awaiting_install','terminated'),
      ('installed','running'),
      ('installed','terminated'),
      ('running','completed'),
      ('running','disputed'),
      ('running','terminated'),
      ('disputed','completed'),
      ('disputed','terminated')
    );
  else
    raise exception 'assert_transition: unknown entity_type %', entity_type;
  end if;

  if not allowed then
    raise exception 'illegal % transition: % -> %', entity_type, from_state, to_state;
  end if;
end;
$$;

-- transition_campaign RPC stub — full body lives in P2.
create or replace function transition_campaign(
  campaign_id uuid,
  new_status  campaign_status
) returns campaigns
language plpgsql
security definer
set search_path = public
as $$
declare
  current_status campaign_status;
  updated_row    campaigns;
begin
  select status into current_status from campaigns where id = campaign_id for update;
  if current_status is null then
    raise exception 'campaign % not found', campaign_id;
  end if;
  perform assert_transition('campaign', current_status::text, new_status::text);
  update campaigns
    set status = new_status,
        -- Only stamp the review timestamp on the initial admin decision.
        reviewed_at = case
          when new_status in ('approved','rejected') then now()
          else reviewed_at
        end
    where id = campaign_id
    returning * into updated_row;
  return updated_row;
end;
$$;

-- transition_contract RPC stub — full body lives in P3/P4.
create or replace function transition_contract(
  contract_id uuid,
  new_status  contract_status
) returns contracts
language plpgsql
security definer
set search_path = public
as $$
declare
  current_status contract_status;
  updated_row    contracts;
begin
  select status into current_status from contracts where id = contract_id for update;
  if current_status is null then
    raise exception 'contract % not found', contract_id;
  end if;
  perform assert_transition('contract', current_status::text, new_status::text);
  update contracts set status = new_status where id = contract_id
    returning * into updated_row;
  return updated_row;
end;
$$;

-- v_contract_daily_distance — view defined in P4 with full PostGIS aggregation.
-- Intentionally NOT created here to avoid masking the real implementation with
-- a zero-returning placeholder. Callers should defer until P4 lands.

-- Lock down the privileged RPCs: only the service-role API may invoke them.
-- Clients never UPDATE status directly; RLS already prevents that, and these
-- transitions must be authorized at the API layer with the actor's role.
revoke execute on function transition_campaign(uuid, campaign_status) from public, anon, authenticated;
grant  execute on function transition_campaign(uuid, campaign_status) to service_role;

revoke execute on function transition_contract(uuid, contract_status) from public, anon, authenticated;
grant  execute on function transition_contract(uuid, contract_status) to service_role;

-- assert_transition is pure logic; safe to expose, but service-role-only keeps a tight surface.
revoke execute on function assert_transition(text, text, text) from public, anon, authenticated;
grant  execute on function assert_transition(text, text, text) to service_role;
