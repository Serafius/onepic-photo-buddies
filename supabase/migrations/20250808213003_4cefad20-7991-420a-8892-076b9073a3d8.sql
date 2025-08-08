-- Retry migration without IF NOT EXISTS for policies

-- 1) Create image_comments table
create table if not exists public.image_comments (
  id uuid primary key default gen_random_uuid(),
  image_id uuid not null,
  author_user_id uuid,
  author_name text not null,
  author_avatar_url text,
  text text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint fk_image_comments_image
    foreign key (image_id)
    references public.portfolio_images (id)
    on delete cascade
);

-- 2) Create comment_likes table
create table if not exists public.comment_likes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.image_comments(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (comment_id, user_id)
);

-- 3) Enable RLS
alter table public.image_comments enable row level security;
alter table public.comment_likes enable row level security;

-- 4) Policies for image_comments
create policy "Comments are viewable by everyone"
  on public.image_comments
  for select
  using (true);

create policy "Anyone can insert comments"
  on public.image_comments
  for insert
  with check (true);

-- 5) Policies for comment_likes
create policy "Comment likes are viewable by everyone"
  on public.comment_likes
  for select
  using (true);

create policy "Anyone can insert comment likes"
  on public.comment_likes
  for insert
  with check (true);

create policy "Anyone can delete comment likes"
  on public.comment_likes
  for delete
  using (true);

-- 6) Helpful indexes
create index if not exists idx_image_comments_image_id on public.image_comments(image_id);
create index if not exists idx_comment_likes_comment_id on public.comment_likes(comment_id);

-- 7) Seed sample comments for recent images
with selected_images as (
  select id
  from public.portfolio_images
  order by created_at desc nulls last
  limit 50
),
seed as (
  select 
    si.id as image_id,
    (array['Alex Chen','Samira Khan','Liam Rivera','Nora Patel','Maya Thompson','Diego Alvarez','Jules Martin','Zara Lee','Omar Haddad','Sofia Rossi'])[1 + floor(random()*10)::int] as author_name,
    (array[
      'https://i.pravatar.cc/150?img=1','https://i.pravatar.cc/150?img=2','https://i.pravatar.cc/150?img=3','https://i.pravatar.cc/150?img=4','https://i.pravatar.cc/150?img=5',
      'https://i.pravatar.cc/150?img=6','https://i.pravatar.cc/150?img=7','https://i.pravatar.cc/150?img=8','https://i.pravatar.cc/150?img=9','https://i.pravatar.cc/150?img=10'
    ])[1 + floor(random()*10)::int] as author_avatar_url,
    (array[
      'Love the lighting here!','Stunning composition.','This is gorgeous.','Amazing tones and mood.','Great depth of field.',
      'So inspiring!','Beautiful capture.','Fantastic shot.','Incredible work.','Absolutely breathtaking!'
    ])[1 + floor(random()*10)::int] as body,
    gs.n
  from selected_images si
  cross join generate_series(1, 3) as gs(n)
)
insert into public.image_comments (image_id, author_user_id, author_name, author_avatar_url, text)
select image_id, gen_random_uuid(), author_name, author_avatar_url, body
from seed;

-- 8) Seed random likes for the most recent 500 comments
with c as (
  select id
  from public.image_comments
  order by created_at desc
  limit 500
),
series as (
  select c.id as comment_id, generate_series(1, (floor(random()*5))::int) as n
  from c
)
insert into public.comment_likes (comment_id, user_id)
select comment_id, gen_random_uuid()
from series;
