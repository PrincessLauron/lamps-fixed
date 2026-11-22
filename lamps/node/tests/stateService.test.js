const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { after, test } = require("node:test");

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "lams-state-test-"));
process.env.DATABASE_PATH = path.join(tempDir, "state.sqlite");
const db = require("../config/database");
const { validateState } = require("../services/stateService");

after(() => {
  db.close();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

test("accepts every persisted LAMS collection", () => {
  assert.doesNotThrow(() => validateState({
    assets: [],
    bookings: [],
    alerts: [],
    schedules: [],
    customTypes: [],
    hiddenTypes: [],
    layouts: {},
    roomSizes: {},
    logs: [],
    labs: [],
    savedRooms: []
  }));
});

test("rejects malformed or incomplete application state", () => {
  assert.throws(() => validateState(null), { status: 400 });
  assert.throws(() => validateState({ assets: [] }), /Invalid or missing state collection/);
});
