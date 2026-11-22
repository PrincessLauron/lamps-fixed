const stateService = require("../services/stateService");

function getState(req, res, next) {
  try {
    res.json(stateService.load());
  } catch (error) {
    next(error);
  }
}

function putState(req, res, next) {
  try {
    const header = req.get("If-Match");
    const expectedVersion = header === undefined ? undefined : Number(header.replaceAll('"', ""));
    if (expectedVersion !== undefined && (!Number.isSafeInteger(expectedVersion) || expectedVersion < 0)) {
      return res.status(400).json({ error: "Invalid state version." });
    }
    const saved = stateService.save(req.body, expectedVersion);
    res.json({ version: saved.version, updatedAt: saved.updatedAt });
  } catch (error) {
    next(error);
  }
}

module.exports = { getState, putState };
