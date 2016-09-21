-- Server upgrade for September 20th, 2016.
ALTER TABLE user ADD COLUMN steam_id TEXT;
ALTER TABLE user ADD COLUMN rl_max_rank INTEGER;