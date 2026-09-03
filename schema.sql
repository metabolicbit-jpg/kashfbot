CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY, username TEXT, first_name TEXT,
  balance INTEGER DEFAULT 0, staked INTEGER DEFAULT 0,
  trust_score INTEGER DEFAULT 50, interests TEXT DEFAULT '[]',
  ref_code TEXT UNIQUE, referred_by INTEGER,
  streak INTEGER DEFAULT 0, last_daily TEXT,
  total_tasks INTEGER DEFAULT 0, violations INTEGER DEFAULT 0,
  is_banned INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS economy_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  pool_value REAL DEFAULT 0, total_minted INTEGER DEFAULT 0,
  total_burned INTEGER DEFAULT 0, total_locked INTEGER DEFAULT 0,
  weekly_commission REAL DEFAULT 0, reward_budget REAL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, type TEXT,
  amount INTEGER, balance_after INTEGER, ref_type TEXT, ref_id TEXT,
  note TEXT, created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT, owner_id INTEGER, chat_id TEXT,
  username TEXT, chat_type TEXT, title TEXT, niches TEXT DEFAULT '[]',
  budget_coins INTEGER DEFAULT 0, target INTEGER, acquired INTEGER DEFAULT 0,
  bot_is_admin INTEGER DEFAULT 0, violations INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS memberships (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, channel_id INTEGER,
  type TEXT DEFAULT 'membership', status TEXT DEFAULT 'assigned',
  joined_at TEXT, check_at TEXT, coins INTEGER DEFAULT 4,
  created_at TEXT DEFAULT (datetime('now'))
);