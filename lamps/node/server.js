require("dotenv").config();

const path = require("node:path");
const express = require("express");
const session = require("express-session");
const SQLiteStoreFactory = require("connect-sqlite3");
const helmet = require("helmet");
const bcrypt = require("bcryptjs");
const db = require("./config/database");
const adminModel = require("./models/adminModel");
const authRoutes = require("./routes/authRoutes");
const stateRoutes = require("./routes/stateRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();
const port = Number(process.env.PORT || 3000);
const sessionSecret = process.env.SESSION_SECRET || "";
const adminUsername = process.env.ADMIN_USERNAME || "";
const adminPassword = process.env.ADMIN_PASSWORD || "";

if (sessionSecret.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters.");
if (!adminUsername.trim() || adminPassword.length < 6) {
  throw new Error("Set ADMIN_USERNAME and an ADMIN_PASSWORD of at least 6 characters.");
}
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

if (!adminModel.getProfile()) {
  adminModel.create(adminUsername.trim(), bcrypt.hashSync(adminPassword, 12));
}

const SQLiteStore = SQLiteStoreFactory(session);
app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "4mb", strict: true }));
app.use(session({
  name: "lams.sid",
  store: new SQLiteStore({ db: "sessions.sqlite", dir: path.resolve("./database") }),
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 8 * 60 * 60 * 1000
  }
}));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/state", stateRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api", (req, res) => res.status(404).json({ error: "API endpoint not found." }));
app.use(express.static(path.resolve("public"), { index: "index.html" }));

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status || (error.type === "entity.too.large" ? 413 : 500);
  if (status >= 500) console.error(error);
  res.status(status).json({ error: status === 500 ? "An unexpected server error occurred." : error.message });
});

app.listen(port, () => console.log(`LAMS is listening on http://localhost:${port}`));
