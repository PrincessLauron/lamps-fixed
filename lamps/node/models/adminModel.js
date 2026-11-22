const db = require("../config/database");

function findByUsername(username) {
  return db.prepare("SELECT id, username, password_hash, status FROM admin_users WHERE username = ?").get(username);
}

function getProfile() {
  const row = db.prepare("SELECT username, status FROM admin_users WHERE id = 1").get();
  return row ? { username: row.username, status: row.status } : null;
}

function create(username, passwordHash) {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO admin_users (id, username, password_hash, status, created_at, updated_at)
    VALUES (1, ?, ?, 'Active', ?, ?)
  `).run(username, passwordHash, now, now);
}

function update({ username, status, passwordHash }) {
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE admin_users
    SET username = ?, status = ?, password_hash = COALESCE(?, password_hash), updated_at = ?
    WHERE id = 1
  `).run(username, status, passwordHash || null, now);
  return getProfile();
}

module.exports = { findByUsername, getProfile, create, update };
