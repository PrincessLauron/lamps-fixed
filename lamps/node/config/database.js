const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const filename = path.resolve(process.env.DATABASE_PATH || "./database/lams.sqlite");
fs.mkdirSync(path.dirname(filename), { recursive: true });

const db = new Database(filename);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(`
  CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    payload TEXT NOT NULL,
    version INTEGER NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Active', 'Inactive')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

module.exports = db;
