
-- First, let's create some sample portfolio posts for the test photographer
INSERT INTO portfolio_posts (
  id,
  photographer_id,
  title,
  description,
  location,
  created_at,
  likes_count,
  views_count,
  is_featured
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Golden Hour Portrait Session',
  'Beautiful golden hour session in Central Park with natural lighting and dreamy bokeh effects.',
  'Central Park, New York',
  '2025-01-24T14:30:00.000Z',
  15,
  89,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Urban Street Photography',
  'Candid street photography capturing the energy and rhythm of city life.',
  'Manhattan, New York',
  '2025-01-23T10:15:00.000Z',
  8,
  56,
  false
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Wedding Preparation Moments',
  'Intimate moments captured during wedding preparation, focusing on emotions and details.',
  'Brooklyn, New York',
  '2025-01-22T09:00:00.000Z',
  22,
  134,
  true
);

-- Add some sample post images for these posts
INSERT INTO post_images (
  id,
  post_id,
  image_url,
  alt_text,
  order_index,
  created_at
) VALUES 
-- Images for Golden Hour Portrait Session
(
  '660e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440001',
  'https://images.unsplash.com/photo-1494790108755-2616c395b5b0?w=800&q=80',
  'Golden hour portrait with warm lighting',
  0,
  '2025-01-24T14:30:00.000Z'
),
(
  '660e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440001',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80',
  'Portrait with bokeh background',
  1,
  '2025-01-24T14:30:00.000Z'
),
-- Images for Urban Street Photography
(
  '660e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440002',
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
  'Urban street scene',
  0,
  '2025-01-23T10:15:00.000Z'
),
-- Images for Wedding Preparation
(
  '660e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440003',
  'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80',
  'Wedding preparation details',
  0,
  '2025-01-22T09:00:00.000Z'
),
(
  '660e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440003',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80',
  'Bridal preparation moment',
  1,
  '2025-01-22T09:00:00.000Z'
);
