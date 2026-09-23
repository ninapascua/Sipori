-- Sample data for development.
--
-- This starts with TRUNCATE. That is correct on your laptop and catastrophic
-- against the database your live demo depends on. Check which DATABASE_URL is
-- loaded before you run it.

TRUNCATE TABLE sightings RESTART IDENTITY CASCADE;

INSERT INTO sightings (place, description, spookiness, reported_at) VALUES
  ('Library, third floor',
   'Chairs rearranged overnight, every time. The night guard says he locks the room himself.',
   3, now() - interval '12 days'),
  ('Old gym',
   'Lights flicker in a fixed pattern after 9pm, always three short and one long.',
   4, now() - interval '10 days'),
  ('Parking basement',
   'Footsteps with no one there. Reported separately by three different people in one week, which is what makes this one hard to dismiss. Two of them were alone at the time and did not know about the others. This row is deliberately long, because a seed of four words hides every text-wrapping bug you have.',
   5, now() - interval '8 days'),
  ('Canteen',
   'A cold spot near the back door, every morning before seven.',
   1, now() - interval '7 days'),
  ('AB Building stairwell',
   '',
   2, now() - interval '5 days'),
  ('Chapel garden',
   'Someone humming. Stops the moment you turn around.',
   3, now() - interval '2 days');

-- Sipori sample data matches client/src/api/seed.json. Keep both in sync.
-- Existing cafe and drink entries are preserved when this seed is run again.
BEGIN;

INSERT INTO cafes (id, name) VALUES
  ('cafe-1', 'Matcha Tokyo'),
  ('cafe-2', 'Mori Café'),
  ('cafe-3', 'Kissa House'),
  ('cafe-4', 'Midori'),
  ('cafe-5', 'Tsuki Café')
ON CONFLICT (id) DO NOTHING;

INSERT INTO drinks (id, cafe_id, name, type, price, rating, reorder, notes, date, photo_url) VALUES
  ('drink-1', 'cafe-1', 'Strawberry Matcha Latte', 'matcha', 185, 5, true, 'Creamy matcha with a sweet strawberry layer.', '2026-09-18', ''),
  ('drink-2', 'cafe-1', 'Classic Matcha Latte', 'matcha', 160, 4, true, 'Smooth and not too sweet.', '2026-09-10', ''),
  ('drink-3', 'cafe-1', 'Hojicha Latte', 'hojicha', 170, 4, true, 'Roasty and comforting.', '2026-08-26', ''),
  ('drink-4', 'cafe-2', 'Dirty Matcha', 'matcha', 190, 3, false, 'Good matcha but the coffee overpowered it.', '2026-09-14', ''),
  ('drink-5', 'cafe-2', 'Brown Sugar Hojicha', 'hojicha', 175, 5, true, 'Deep roasted flavour with just enough sweetness.', '2026-08-20', ''),
  ('drink-6', 'cafe-3', 'Matcha Cloud', 'matcha', 195, 5, true, 'Thick matcha with a light cream topping.', '2026-09-08', ''),
  ('drink-7', 'cafe-3', 'Iced Hojicha', 'hojicha', 155, 3, false, 'Refreshing but a little too mild.', '2026-08-12', ''),
  ('drink-8', 'cafe-4', 'Matcha Cream Latte', 'matcha', 180, 4, true, 'Creamy with a slightly bitter finish.', '2026-09-05', ''),
  ('drink-9', 'cafe-4', 'Hojicha Cream Latte', 'hojicha', 180, 4, true, 'Nutty and smooth.', '2026-08-05', ''),
  ('drink-10', 'cafe-5', 'Vanilla Matcha', 'matcha', 165, 3, false, 'A little sweeter than I prefer.', '2026-09-02', ''),
  ('drink-11', 'cafe-5', 'Sea Salt Hojicha', 'hojicha', 185, 5, true, 'The salty cream worked really well with the roasted tea.', '2026-08-01', '')
ON CONFLICT (id) DO NOTHING;

COMMIT;
