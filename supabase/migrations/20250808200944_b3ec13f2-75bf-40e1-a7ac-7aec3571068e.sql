-- Re-run migration with safe policy creation
-- Clean up views to avoid conflicts
create or replace view public.v_portfolio_posts as select 1 as id where false; -- temp to allow replace in some Postgres versions
create or replace view public.v_portfolio_images as select 1 as id where false; -- temp

-- 1) Mapping table from legacy UUID photographer IDs to new integer IDs
create table if not exists public.photographer_mappings (
  old_uuid uuid primary key,
  new_int integer not null references public."Photographers"(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

-- Seed known mapping from current routing util (route 1 -> f47ac10b-58cc-4372-a567-0e02b2c3d479)
insert into public.photographer_mappings (old_uuid, new_int)
values ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 1)
on conflict (old_uuid) do nothing;

-- 2) Views to read posts/images using Photographers-first IDs and profile picture
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
  ph.name as photographer_name,
  ph.profile_picture_url as photographer_profile_url
from public.portfolio_images pi
left join public.photographer_mappings pm
  on pm.old_uuid = pi.photographer_id
left join public."Photographers" ph
  on ph.id = pm.new_int;

-- Helpful index
create index if not exists idx_photographer_mappings_new_int on public.photographer_mappings (new_int);

-- Secure the mapping table with RLS and allow read-only access
alter table public.photographer_mappings enable row level security;
-- Drop and recreate to avoid "if not exists" unsupported
drop policy if exists "Mappings are viewable by everyone" on public.photographer_mappings;
create policy "Mappings are viewable by everyone"
  on public.photographer_mappings
  for select
  using (true);
