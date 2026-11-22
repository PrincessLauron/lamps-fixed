const db = require("../config/database");

function read() {
  const row = db.prepare("SELECT payload, version, updated_at FROM app_state WHERE id = 1").get();
  return row ? { state: JSON.parse(row.payload), version: row.version, updatedAt: row.updated_at } : {
    state: null,
    version: 0,
    updatedAt: null
  };
}

function write(state, expectedVersion) {
  const now = new Date().toISOString();
  const commit = db.transaction(() => {
    const current = db.prepare("SELECT version FROM app_state WHERE id = 1").get();
    const version = current ? current.version : 0;
    if (expectedVersion !== undefined && expectedVersion !== version) {
      const error = new Error("The application data changed in another session. Reload before saving.");
      error.status = 409;
      throw error;
    }
    const nextVersion = version + 1;
    db.prepare(`
      INSERT INTO app_state (id, payload, version, updated_at) VALUES (1, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET payload = excluded.payload,
        version = excluded.version, updated_at = excluded.updated_at
    `).run(JSON.stringify(state), nextVersion, now);
    return { state, version: nextVersion, updatedAt: now };
  });
  return commit();
}

module.exports = { read, write };
