-- ============================================================
-- High School Pick'em - Full Schema (Custom Auth)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS (custom auth, no Supabase Auth)
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- null until approved and password set
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  is_admin BOOLEAN DEFAULT false NOT NULL,
  coins INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT username_length CHECK (char_length(username) >= 2 AND char_length(username) <= 20),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);

-- Admin user (you) - update the password hash after setup
-- Password is set via the app, this is just a placeholder
INSERT INTO users (username, status, is_admin, coins)
VALUES ('zay', 'approved', true, 0);

-- ============================================================
-- SESSIONS (simple token-based sessions)
-- ============================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- ============================================================
-- SPORTS
-- ============================================================
CREATE TABLE sports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🏆',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

INSERT INTO sports (name, emoji) VALUES
  ('Football', '🏈'),
  ('Basketball', '🏀'),
  ('Baseball', '⚾'),
  ('Soccer', '⚽'),
  ('Volleyball', '🏐'),
  ('Wrestling', '🤼'),
  ('Track & Field', '🏃'),
  ('Swimming', '🏊');

-- ============================================================
-- GAMES
-- ============================================================
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE RESTRICT,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  game_date DATE NOT NULL,
  game_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'final')),
  home_score INTEGER,
  away_score INTEGER,
  winner TEXT CHECK (winner IN ('home', 'away', 'tie') OR winner IS NULL),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_games_game_date ON games(game_date);
CREATE INDEX idx_games_sport_id ON games(sport_id);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_game_time ON games(game_time);

-- ============================================================
-- PICKS
-- ============================================================
CREATE TABLE picks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  pick TEXT NOT NULL CHECK (pick IN ('home', 'away')),
  wager INTEGER NOT NULL DEFAULT 0,
  is_correct BOOLEAN,
  payout INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, game_id)
);

CREATE INDEX idx_picks_user_id ON picks(user_id);
CREATE INDEX idx_picks_game_id ON picks(game_id);

-- ============================================================
-- COIN TRANSACTIONS (audit log)
-- ============================================================
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_coin_tx_user_id ON coin_transactions(user_id);

-- ============================================================
-- LEADERBOARD VIEW
-- ============================================================
CREATE VIEW leaderboard AS
SELECT
  u.id,
  u.username,
  u.coins,
  COUNT(p.id) FILTER (WHERE p.is_correct IS NOT NULL) AS total_graded,
  COUNT(p.id) FILTER (WHERE p.is_correct = true) AS correct_picks,
  CASE
    WHEN COUNT(p.id) FILTER (WHERE p.is_correct IS NOT NULL) > 0
    THEN ROUND(
      COUNT(p.id) FILTER (WHERE p.is_correct = true)::NUMERIC /
      COUNT(p.id) FILTER (WHERE p.is_correct IS NOT NULL) * 100, 1
    )
    ELSE 0
  END AS accuracy
FROM users u
LEFT JOIN picks p ON p.user_id = u.id
WHERE u.status = 'approved' AND u.is_admin = false
GROUP BY u.id, u.username, u.coins
ORDER BY u.coins DESC, correct_picks DESC
LIMIT 50;

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER games_updated_at BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER picks_updated_at BEFORE UPDATE ON picks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AUTO-GRADE PICKS + HANDLE PAYOUTS WHEN SCORE ENTERED
-- ============================================================
CREATE OR REPLACE FUNCTION grade_picks_for_game()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.winner IS NOT NULL AND OLD.winner IS DISTINCT FROM NEW.winner THEN
    -- Mark picks correct/incorrect
    UPDATE picks
    SET
      is_correct = (pick = NEW.winner),
      payout = CASE
        WHEN pick = NEW.winner THEN wager -- win: get wager back as profit
        ELSE -wager -- lose: lose the wager
      END
    WHERE game_id = NEW.id;

    -- Apply coin payouts to users
    UPDATE users u
    SET coins = coins + p.payout
    FROM picks p
    WHERE p.game_id = NEW.id
      AND p.user_id = u.id
      AND p.payout IS NOT NULL;

    -- Log transactions
    INSERT INTO coin_transactions (user_id, amount, reason)
    SELECT
      p.user_id,
      p.payout,
      CASE WHEN p.is_correct THEN 'Won pick: ' || NEW.home_team || ' vs ' || NEW.away_team
           ELSE 'Lost pick: ' || NEW.home_team || ' vs ' || NEW.away_team END
    FROM picks p
    WHERE p.game_id = NEW.id AND p.payout IS NOT NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER grade_picks_on_result
  AFTER UPDATE OF winner ON games
  FOR EACH ROW EXECUTE FUNCTION grade_picks_for_game();

-- ============================================================
-- WEEKLY COINS FUNCTION (+15 per approved user)
-- Run this manually in SQL editor each week or set up a cron
-- ============================================================
CREATE OR REPLACE FUNCTION award_weekly_coins()
RETURNS void AS $$
BEGIN
  UPDATE users
  SET coins = coins + 15
  WHERE status = 'approved' AND is_admin = false;

  INSERT INTO coin_transactions (user_id, amount, reason)
  SELECT id, 15, 'Weekly coin bonus'
  FROM users
  WHERE status = 'approved' AND is_admin = false;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- RLS (disabled since we use custom auth via sessions table)
-- All security is handled in Next.js server actions/middleware
-- ============================================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE sports DISABLE ROW LEVEL SECURITY;
ALTER TABLE games DISABLE ROW LEVEL SECURITY;
ALTER TABLE picks DISABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions DISABLE ROW LEVEL SECURITY;
