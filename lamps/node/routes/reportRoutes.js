const express = require("express");
const controller = require("../controllers/reportController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();
router.get("/summary", requireAuth, controller.summary);

module.exports = router;
