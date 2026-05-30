-- Wheels Earner — admin security-definer RPCs.
-- These are the only path to write columns revoked from the `authenticated`
-- role in 0007_rls_hardening.sql:
--   profiles: kyc_status, kyc_reviewed_by, kyc_reviewed_at, blocked  (C1)
--   campaigns: status, reviewed_by, reviewed_at, reject_reason        (H3)
--
-- Every RPC:
--   1. Guards with is_admin() — raises if caller is not admin.
--   2. Performs the state write.
--   3. Inserts an audit_log row in the same transaction.
--
-- IMPORTANT — audit_log RLS note:
--   audit_log has an unconditional `for insert with check (false)` policy that
--   blocks all client inserts. However, SECURITY DEFINER functions run as their
--   OWNER at execution time. Supabase applies all migrations as the `postgres`
--   role (a superuser with BYPASSRLS), so these functions are owned by postgres
--   and their audit inserts bypass RLS automatically. Do NOT change the function
--   owner to a non-superuser role or audit writes will silently be dropped.
--
-- Grant pattern: revoke from public/anon, grant to authenticated so that
-- the Supabase JS client (anon key + user JWT) can call them while anonymous
-- requests are blocked.

-- ---------------------------------------------------------------------------
-- approve_driver_kyc
-- Writes profiles.kyc_status (+ kyc_reviewed_by/at) for a driver.
-- Re-decisions are intentionally permitted so admins can correct mistakes.
-- ---------------------------------------------------------------------------

create or replace function public.approve_driver_kyc(
  p_driver_id uuid,
  p_decision  kyc_status,
  p_reason    text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'approve_driver_kyc: admin only';
  end if;

  if p_decision not in ('approved', 'rejected') then
    raise exception 'approve_driver_kyc: decision must be approved or rejected, got %', p_decision;
  end if;

  update profiles set
    kyc_status      = p_decision,
    kyc_reviewed_by = auth.uid(),
    kyc_reviewed_at = now()
  where id = p_driver_id;

  if not found then
    raise exception 'approve_driver_kyc: driver % not found', p_driver_id;
  end if;

  insert into audit_log (actor_id, action, entity_type, entity_id, diff)
  values (
    auth.uid(),
    'kyc_' || p_decision::text,
    'profiles',
    p_driver_id,
    jsonb_build_object('reason', p_reason)
  );
end;
$$;

revoke execute on function public.approve_driver_kyc(uuid, kyc_status, text)
  from public, anon;
grant  execute on function public.approve_driver_kyc(uuid, kyc_status, text)
  to authenticated;

-- ---------------------------------------------------------------------------
-- approve_campaign
-- Writes campaigns.status (+ reviewed_by/at/reject_reason).
-- Only campaigns in 'submitted' state can be approved or rejected — prevents
-- state-machine skips (e.g. re-approving cancelled/completed campaigns).
-- ---------------------------------------------------------------------------

create or replace function public.approve_campaign(
  p_campaign_id uuid,
  p_decision    campaign_status,
  p_reason      text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'approve_campaign: admin only';
  end if;

  if p_decision not in ('approved', 'rejected') then
    raise exception 'approve_campaign: decision must be approved or rejected, got %', p_decision;
  end if;

  update campaigns set
    status        = p_decision,
    reviewed_by   = auth.uid(),
    reviewed_at   = now(),
    -- clear reject_reason on approval; set it on rejection
    reject_reason = case when p_decision = 'rejected' then p_reason else null end
  where id = p_campaign_id
    and status = 'submitted';  -- state-machine guard: only submitted campaigns can be reviewed

  if not found then
    -- disambiguate: campaign missing vs wrong state
    perform 1 from campaigns where id = p_campaign_id;
    if not found then
      raise exception 'approve_campaign: campaign % not found', p_campaign_id;
    else
      raise exception 'approve_campaign: campaign % is not in submitted state', p_campaign_id;
    end if;
  end if;

  insert into audit_log (actor_id, action, entity_type, entity_id, diff)
  values (
    auth.uid(),
    'campaign_' || p_decision::text,
    'campaigns',
    p_campaign_id,
    jsonb_build_object('reason', p_reason)
  );
end;
$$;

revoke execute on function public.approve_campaign(uuid, campaign_status, text)
  from public, anon;
grant  execute on function public.approve_campaign(uuid, campaign_status, text)
  to authenticated;

-- ---------------------------------------------------------------------------
-- set_user_blocked
-- Writes profiles.blocked.
-- Guards: cannot block yourself; cannot block another admin.
-- ---------------------------------------------------------------------------

create or replace function public.set_user_blocked(
  p_target_id uuid,
  p_blocked   boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'set_user_blocked: admin only';
  end if;

  if p_target_id = auth.uid() then
    raise exception 'set_user_blocked: cannot block yourself';
  end if;

  -- Prevent admin-on-admin blocking (privilege escalation risk in multi-admin setups)
  if exists (select 1 from profiles where id = p_target_id and role = 'admin') then
    raise exception 'set_user_blocked: cannot block another admin';
  end if;

  update profiles set blocked = p_blocked where id = p_target_id;

  if not found then
    raise exception 'set_user_blocked: user % not found', p_target_id;
  end if;

  insert into audit_log (actor_id, action, entity_type, entity_id, diff)
  values (
    auth.uid(),
    case when p_blocked then 'user_suspended' else 'user_unsuspended' end,
    'profiles',
    p_target_id,
    '{}'::jsonb
  );
end;
$$;

revoke execute on function public.set_user_blocked(uuid, boolean)
  from public, anon;
grant  execute on function public.set_user_blocked(uuid, boolean)
  to authenticated;
