-- Migration: 0004_drop_instruments
-- Removes the boilerplate 'instruments' table created by the Supabase template.
drop table if exists public.instruments;
