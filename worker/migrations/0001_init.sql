-- KALISO — base D1 (tickets, demandes à la forge, état de la forge, compteurs anti-abus)

CREATE TABLE IF NOT EXISTS tickets (
  id          TEXT PRIMARY KEY,           -- KAL-AAMMJJ-XXXX
  access_key  TEXT NOT NULL,              -- permet au visiteur de suivre son ticket
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'nouveau',
  type        TEXT NOT NULL,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  budget      TEXT,
  deadline    TEXT,
  priority    TEXT,
  message     TEXT NOT NULL,
  lang        TEXT,
  source      TEXT,                       -- terminal | forge
  forge_id    TEXT,
  note        TEXT,                       -- note privée (dashboard uniquement)
  reply       TEXT                        -- message visible par le visiteur (commande status)
);
CREATE INDEX IF NOT EXISTS tickets_created ON tickets (created_at DESC);
CREATE INDEX IF NOT EXISTS tickets_status ON tickets (status);

CREATE TABLE IF NOT EXISTS forges (
  id          TEXT PRIMARY KEY,           -- F-xxxxxxxxxx
  created_at  TEXT NOT NULL,
  lang        TEXT,
  text        TEXT NOT NULL,
  plan        TEXT,                       -- JSON
  estimate    TEXT,                       -- JSON
  model       TEXT,
  ms          INTEGER,
  ok          INTEGER NOT NULL DEFAULT 0,
  ticket_id   TEXT
);
CREATE INDEX IF NOT EXISTS forges_created ON forges (created_at DESC);

CREATE TABLE IF NOT EXISTS settings (
  k TEXT PRIMARY KEY,
  v TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hits (
  k   TEXT PRIMARY KEY,
  n   INTEGER NOT NULL,
  exp INTEGER NOT NULL
);
