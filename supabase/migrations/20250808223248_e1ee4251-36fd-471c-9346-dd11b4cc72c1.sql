-- Enable required extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Seed randomized likes for each image with a non-zero base (7 to 38 per image)
WITH imgs AS (
  SELECT id FROM public.v_portfolio_images
),
likes_gen AS (
  SELECT 
    i.id AS image_id,
    gen_random_uuid() AS user_id
  FROM imgs i
  CROSS JOIN LATERAL generate_series(1, (7 + floor(random()*32))::int) g(n)
)
INSERT INTO public.user_likes (user_id, image_id)
SELECT lg.user_id, lg.image_id
FROM likes_gen lg
LEFT JOIN public.user_likes ul 
  ON ul.image_id = lg.image_id 
 AND ul.user_id = lg.user_id
WHERE ul.image_id IS NULL;

-- Seed randomized comments from random "people" (1 to 6 per image)
WITH imgs AS (
  SELECT id FROM public.v_portfolio_images
),
comments_gen AS (
  SELECT 
    i.id AS image_id,
    gen_random_uuid() AS author_user_id,
    ('User ' || (100 + floor(random()*900))::int)::text AS author_name,
    ('https://i.pravatar.cc/150?u=' || md5(gen_random_uuid()::text)) AS author_avatar_url,
    (ARRAY[
      'Awesome shot!',
      'Love this',
      'Great composition',
      'Stunning!',
      'So beautiful',
      'Wow',
      'Incredible detail',
      'Great lighting'
    ])[1 + floor(random()*8)] AS text
  FROM imgs i
  CROSS JOIN LATERAL generate_series(1, (1 + floor(random()*6))::int) g(n)
)
INSERT INTO public.image_comments (image_id, author_user_id, author_name, author_avatar_url, text)
SELECT image_id, author_user_id, author_name, author_avatar_url, text
FROM comments_gen;

-- Seed randomized likes for comments (0 to 5 per comment)
WITH likes_gen AS (
  SELECT 
    c.id AS comment_id,
    gen_random_uuid() AS user_id
  FROM public.image_comments c
  CROSS JOIN LATERAL generate_series(1, floor(random()*5)::int) g(n)
)
INSERT INTO public.comment_likes (comment_id, user_id)
SELECT lg.comment_id, lg.user_id
FROM likes_gen lg
LEFT JOIN public.comment_likes cl
  ON cl.comment_id = lg.comment_id
 AND cl.user_id = lg.user_id
WHERE cl.comment_id IS NULL;