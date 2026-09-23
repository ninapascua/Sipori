-- The complete shape of the database. Safe to run against an empty database,
-- and safe to run twice.
--
-- This file is committed on purpose. Your schema is a fact about your
-- application, not a runtime concern: it should be readable by opening a file
-- rather than by connecting to a server. It is also what lets you move to a
-- hosted database in one command.

CREATE TABLE IF NOT EXISTS sightings (
  id          SERIAL PRIMARY KEY,
  place       TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  spookiness  INTEGER     NOT NULL CHECK (spookiness BETWEEN 1 AND 5),
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The list page always sorts newest first. Without this the database reads
-- every row and sorts it on each request.
CREATE INDEX IF NOT EXISTS sightings_reported_at_idx
  ON sightings (reported_at DESC);

-- Sipori's IDs are strings in both API implementations (for example cafe-1).
-- These additions leave any existing template sightings data intact.
CREATE TABLE IF NOT EXISTS cafes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 120)
);

CREATE TABLE IF NOT EXISTS drinks (
  id TEXT PRIMARY KEY,
  cafe_id TEXT NOT NULL REFERENCES cafes(id),
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 120),
  type TEXT NOT NULL CHECK (type IN ('matcha', 'hojicha')),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  reorder BOOLEAN NOT NULL DEFAULT false,
  notes TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  photo_url TEXT NOT NULL DEFAULT ''
);

-- Support newest-first browsing, both across all drinks and within one cafe.
CREATE INDEX IF NOT EXISTS drinks_date_idx ON drinks (date DESC, id);
CREATE INDEX IF NOT EXISTS drinks_cafe_date_idx ON drinks (cafe_id, date DESC, id);
