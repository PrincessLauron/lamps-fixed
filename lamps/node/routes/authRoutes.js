const express = require("express");
const { rateLimit } = require("express-rate-limit");
const controller = require("../controllers/authController");
const adminModel = require("../models/adminModel");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();
router.post("/login", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many sign-in attempts. Try again in 15 minutes." }
}), controller.login);
router.get("/me", controller.me);
router.post("/logout", requireAuth, controller.logout);
router.get("/profile", requireAuth, (req, res) => res.json({ user: adminModel.getProfile() }));
router.put("/profile", requireAuth, controller.updateProfile);

module.exports = router;
