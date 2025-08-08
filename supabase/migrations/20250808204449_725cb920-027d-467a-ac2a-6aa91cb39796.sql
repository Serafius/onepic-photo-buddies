-- Distribute provided 100 names across all portfolio images and set matching avatar URLs
WITH name_list AS (
  SELECT name, ord::int AS ord
  FROM unnest(ARRAY[
    'Olivia Carter','Ethan Collins','Amelia Turner','Liam Bennett','Charlotte Hayes','Noah Mitchell','Ava Richardson','Mason Brooks','Sophia Walker','James Foster',
    'Harper Evans','Benjamin Perry','Isabella Hughes','Henry Scott','Mia Adams','Lucas Morgan','Evelyn Cooper','Elijah Ward','Abigail Gray','Alexander Howard',
    'Emily Russell','Daniel Price','Scarlett Barnes','Matthew Long','Lily Simmons','William Phillips','Grace Cox','Samuel Rogers','Chloe Kelly','David Morris',
    'Ella Peterson','Owen Jenkins','Aria Murphy','Jack Bailey','Zoey Sanders','Carter Reed','Nora Patterson','Joseph Ross','Hazel Griffin','Isaac Powell',
    'Penelope Bryant','Gabriel Hughes','Aurora Jenkins','Michael Dean','Stella Wells','Aiden Palmer','Violet Spencer','Julian Hayes','Hannah Crawford','Levi Boyd',
    'Savannah Wheeler','Nathaniel Webb','Lucy Holland','Thomas Bishop','Layla West','Christopher Henry','Eleanor Lawson','Caleb Stephens','Addison Gilbert','Ryan Harper',
    'Natalie Bowen','Adam Ford','Leah Austin','Joshua Chapman','Zoey Burton','Andrew Morrison','Claire Curtis','Isaac Shaw','Audrey Elliott','Jonathan Marshall',
    'Paisley Franklin','Dominic Stone','Kennedy Doyle','Charles Barrett','Ellie Walsh','Lincoln Warren','Skylar Page','Anthony Matthews','Brooklyn Arnold','Miles Beckett',
    'Autumn Lane','Christian Doyle','Sadie Grant','Nicholas Blake','Camila Lambert','Jason Ford','Madison Cross','Patrick Newman','Ruby Banks','Tyler Porter',
    'Lydia Shepherd','Vincent Barton','Naomi Clarke','Zachary Watts','Josephine Rhodes','Brandon Fuller','Ivy Barber','Sean Goodwin','Peyton Briggs','Eric Dawson'
  ]) WITH ORDINALITY AS t(name, ord)
),
name_count AS (
  SELECT COUNT(*) AS cnt FROM name_list
),
numbered_images AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM public.portfolio_images
),
mapped AS (
  SELECT ni.id,
         nl.name,
         'https://api.dicebear.com/7.x/initials/svg?seed=' || regexp_replace(nl.name, '\\s+', '%20', 'g') AS avatar_url
  FROM numbered_images ni
  CROSS JOIN name_count nc
  JOIN name_list nl ON nl.ord = ((ni.rn - 1) % nc.cnt) + 1
)
UPDATE public.portfolio_images pi
SET author_name = m.name,
    author_avatar_url = m.avatar_url
FROM mapped m
WHERE pi.id = m.id;

-- Ensure the view remains in sync and uses these fields primarily (already set)
ALTER VIEW public.v_portfolio_images SET (security_invoker = on);
