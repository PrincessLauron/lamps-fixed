const bcrypt = require("bcryptjs");
const adminModel = require("../models/adminModel");

async function login(req, res, next) {
  try {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "");
    const user = adminModel.findByUsername(username);
    if (!user || user.status !== "Active" || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid username or password." });
    }
    req.session.regenerate((error) => {
      if (error) return next(error);
      req.session.adminId = user.id;
      req.session.username = user.username;
      res.json({ user: { username: user.username, status: user.status } });
    });
  } catch (error) {
    next(error);
  }
}

function me(req, res) {
  if (!req.session.adminId) return res.status(401).json({ error: "Authentication required." });
  const profile = adminModel.getProfile();
  if (!profile || profile.status !== "Active") {
    return req.session.destroy(() => res.status(401).json({ error: "Administrator account is inactive." }));
  }
  res.json({ user: profile });
}

function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie("lams.sid");
    res.status(204).end();
  });
}

async function updateProfile(req, res, next) {
  try {
    const username = String(req.body.username || "").trim();
    const status = req.body.status;
    const password = String(req.body.password || "");
    if (!username || username.length > 60 || !["Active", "Inactive"].includes(status)) {
      return res.status(400).json({ error: "A username and valid account status are required." });
    }
    if (password && password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }
    const passwordHash = password ? await bcrypt.hash(password, 12) : null;
    const profile = adminModel.update({ username, status, passwordHash });
    req.session.username = profile.username;
    if (profile.status === "Inactive") {
      return req.session.destroy(() => res.json({ user: profile, signedOut: true }));
    }
    res.json({ user: profile });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "That username is already in use." });
    }
    next(error);
  }
}

module.exports = { login, me, logout, updateProfile };
