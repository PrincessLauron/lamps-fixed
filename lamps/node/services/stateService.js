const stateModel = require("../models/stateModel");

const COLLECTIONS = [
  "assets", "bookings", "alerts", "schedules", "customTypes", "hiddenTypes",
  "layouts", "roomSizes", "logs", "labs", "savedRooms"
];

function validateState(state) {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    throw Object.assign(new Error("Request body must contain an application state object."), { status: 400 });
  }
  for (const key of COLLECTIONS) {
    const value = state[key];
    const isRecord = key === "layouts" || key === "roomSizes";
    if (isRecord ? (!value || typeof value !== "object" || Array.isArray(value)) : !Array.isArray(value)) {
      throw Object.assign(new Error(`Invalid or missing state collection: ${key}.`), { status: 400 });
    }
  }
}

function save(state, expectedVersion) {
  validateState(state);
  return stateModel.write(state, expectedVersion);
}

module.exports = { COLLECTIONS, validateState, load: stateModel.read, save };
