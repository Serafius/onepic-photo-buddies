-- Phase 1: Compatibility layer to use Photographers (integer IDs) while preserving existing data
-- 1) Mapping table from legacy UUID photographer IDs to new integer IDs
create table if not exists public.photographer_mappings (
  old_uuid uuid primary key,
  new_int integer not null references public."Photographers"(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

-- Seed known mapping from current routing util (route 
-- 1 -> f47ac10b-58cc-4372-a567-0e02b2c3d479)
insert into public.photographer_mappings (old_uuid, new_int)
values ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 1)
on conflict (old_uuid) do nothing;

-- 2) Views to read posts/images using Photographers-first IDs
create or replace view public.v_portfolio_posts as
select 
  pp.*, 
  pm.new_int as photographer_int_id
from public.portfolio_posts pp
left join public.photographer_mappings pm
  on pm.old_uuid = pp.photographer_id;

create or replace view public.v_portfolio_images as
select 
  pi.*, 
  pm.new_int as photographer_int_id,
  ph.name as photographer_name
from public.portfolio_images pi
left join public.photographer_mappings pm
  on pm.old_uuid = pi.photographer_id
left join public."Photographers" ph
  on ph.id = pm.new_int;

-- Helpful indexes
create index if not exists idx_photographer_mappings_new_int on public.photographer_mappings (new_int);
