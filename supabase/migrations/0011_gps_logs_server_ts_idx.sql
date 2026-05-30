-- Wheels Earner — performance index for admin map page.
-- The map query filters gps_logs on server_ts (last 24h) but the only
-- existing index is (contract_id, ts). Without this index that query does a
-- full sequential scan, which degrades as GPS ingest volume grows.

create index if not exists gps_logs_server_ts_idx
  on gps_logs (server_ts desc);
