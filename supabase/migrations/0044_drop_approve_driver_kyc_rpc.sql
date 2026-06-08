-- 0044_drop_approve_driver_kyc_rpc.sql
-- Manual driver-KYC admin review removed: driver KYC is now auto-approved on
-- submit (see driver/verify/actions.ts). The approve_driver_kyc RPC was the only
-- entry point for admin approve/reject and now has no live caller, so drop it.

drop function if exists public.approve_driver_kyc(uuid, public.kyc_status, text);
