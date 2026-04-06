// src/app.js
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import bikesRoutes from "./routes/bikes.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import locationsRoutes from "./routes/locations.routes.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Middleware ---
app.use(express.json()); // Parse application/json
app.use(express.urlencoded({ extended: true })); // Parse form data

// Serve everything in ./public as static assets
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

// --- Views (HTML pages) ---
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/catalog", (req, res) => {
  res.sendFile(path.join(publicDir, "catalog.html"));
});

app.get("/locations", (req, res) => {
  res.sendFile(path.join(publicDir, "locations.html"));
});

app.get("/order", (req, res) => {
  res.sendFile(path.join(publicDir, "order.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(publicDir, "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(publicDir, "signup.html"));
});

// Protected - User dashboard (optional)
app.get("/dashboard", requireAuth, (req, res) => {
  res.sendFile(path.join(publicDir, "index.html")); // Redirect to main page (you can create dashboard.html later)
});

// Protected - Admin dashboard
app.get("/admin/dashboard", requireAuth, requireRole("administrator"), (req, res) => {
  res.sendFile(path.join(publicDir, "admin/dashboard.html"));
});

// ----------------------------
// API routes
// ----------------------------
app.use("/api/auth", authRoutes);
app.use("/api/bikes", bikesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/locations", locationsRoutes);

// ----------------------------
// API 404 (unknown API routes)
// ----------------------------
app.use("/api", (req, res) => {
  return res.status(404).json({
    ok: false,
    error: "Not found",
    path: req.originalUrl,
  });
});

// ----------------------------
// Frontend 404 (unknown pages)
// ----------------------------
app.use((req, res) => {
  return res.status(404).send("404 - Page not found");
});

// ----------------------------
// Central error handler
// ----------------------------
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  // If a response already started, delegate to Express default handler
  if (res.headersSent) return next(err);

  return res.status(500).json({
    ok: false,
    error: "Internal server error",
  });
});

export default app;
