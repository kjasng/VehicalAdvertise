-- Garage install payout configuration.
-- Admin sets a fixed VND payout applied once when an install proof is approved.

alter type public.ledger_kind add value if not exists 'garage_install_payout';

alter table public.pricing_rules
  add column if not exists install_fee_vnd bigint not null default 0
    check (install_fee_vnd >= 0);

create unique index if not exists ledger_install_proof_ref_uidx
  on public.ledger_entries (ref_type, ref_id)
  where ref_type = 'install_proof' and ref_id is not null;
