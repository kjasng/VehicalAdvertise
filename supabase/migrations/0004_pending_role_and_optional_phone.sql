-- Wheels Earner — OAuth-friendly profile shape (part 1: enum value only).
-- ALTER TYPE ... ADD VALUE cannot be used inside the same transaction that
-- adds it (Postgres SQLSTATE 55P04). The follow-up changes that REFERENCE
-- 'pending' (set default, drop not null, partial unique index) live in
-- migration 0008 so this transaction commits first.

alter type user_role add value if not exists 'pending' before 'driver';
