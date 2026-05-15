-- Bump default reputation from 50 to 60
-- Gives new users a 10-point buffer above the "normal" threshold (50),
-- so a single negative event won't push them into "restricted" status.

alter table public.users alter column reputation set default 60;
