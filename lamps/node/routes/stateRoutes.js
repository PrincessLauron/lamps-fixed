const express = require("express");
const controller = require("../controllers/stateController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();
router.get("/", requireAuth, controller.getState);
router.put("/", requireAuth, controller.putState);

module.exports = router;
