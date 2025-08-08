-- Secure the newly created mapping table with RLS
alter table public.photographer_mappings enable row level security;

-- Allow read-only access to everyone (no insert/update/delete policies)
create policy if not exists "Mappings are viewable by everyone"
  on public.photographer_mappings
  for select
  using (true);
