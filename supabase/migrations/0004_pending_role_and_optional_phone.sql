-- Wheels Earner — OAuth-friendly profile shape.
-- New 'pending' role for fresh OAuth signups; phone becomes optional (OAuth
-- providers don't always carry one). Phone uniqueness preserved via partial index.

alter type user_role add value if not exists 'pending' before 'driver';

alter table profiles alter column phone_e164 drop not null;

-- Replace the table-level UNIQUE on phone_e164 with a partial unique index so
-- multiple NULL phones are allowed but real phones remain unique.
alter table profiles drop constraint if exists profiles_phone_e164_key;

create unique index if not exists profiles_phone_e164_unique
  on profiles (phone_e164) where phone_e164 is not null;

alter table profiles alter column role set default 'pending';
