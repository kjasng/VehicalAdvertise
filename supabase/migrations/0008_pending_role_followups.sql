-- Wheels Earner -- OAuth-friendly profile shape (part 2: changes that depend
-- on enum value 'pending' being already committed by migration 0004).

alter table profiles alter column phone_e164 drop not null;

-- Replace the table-level UNIQUE on phone_e164 with a partial unique index so
-- multiple NULL phones are allowed but real phones remain unique.
alter table profiles drop constraint if exists profiles_phone_e164_key;

create unique index if not exists profiles_phone_e164_unique
  on profiles (phone_e164) where phone_e164 is not null;

alter table profiles alter column role set default 'pending';
