-- One-time cleanup of the unused template table and its data.
-- RESTRICT (the default) refuses to drop any dependent external objects.
DROP TABLE IF EXISTS public.sightings RESTRICT;
