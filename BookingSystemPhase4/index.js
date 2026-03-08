// index.js - Complete working backend for Booking System Phase 4

require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const path = require("path");

const app = express();

// ────────────────────────────────────────────────
// Middleware
// ────────────────────────────────────────────────
app.use(express.json());                    // Parse JSON bodies
app.use(express.static(path.join(__dirname, "public"))); // Serve frontend files

// ────────────────────────────────────────────────
// Database connection
// ────────────────────────────────────────────────
const pool = new Pool({
  host: process.env.PGHOST || "database",
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || "booking_dbuser",
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || "booking_db",
});

// Log connection status
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("Database pool error:", err.stack);
});

// ────────────────────────────────────────────────
// Validation helper
// ────────────────────────────────────────────────
function validateResource(body) {
  const errors = [];

  if (body.action !== "create") {
    errors.push({ field: "action", msg: "action must be 'create'" });
  }

  if (!body.resourceName || typeof body.resourceName !== "string" || body.resourceName.trim().length < 3 || body.resourceName.trim().length > 50) {
    errors.push({ field: "resourceName", msg: "resourceName must be 3–50 characters" });
  }

  if (!body.resourceDescription || typeof body.resourceDescription !== "string" || body.resourceDescription.trim().length < 5 || body.resourceDescription.trim().length > 200) {
    errors.push({ field: "resourceDescription", msg: "resourceDescription must be 5–200 characters" });
  }

  if (body.resourceDescription && (body.resourceDescription.includes("<script") || body.resourceDescription.includes("</script>"))) {
    errors.push({ field: "resourceDescription", msg: "Invalid characters in description" });
  }

  const avail = body.resourceAvailable;
  if (avail !== true && avail !== false && avail !== "true" && avail !== "false") {
    errors.push({ field: "resourceAvailable", msg: "resourceAvailable must be boolean (true/false)" });
  }

  const price = Number(body.resourcePrice);
  if (isNaN(price) || price <= 0) {
    errors.push({ field: "resourcePrice", msg: "resourcePrice must be a positive number" });
  }

  const allowedUnits = ["hour", "day", "week", "month"];
  if (!body.resourcePriceUnit || !allowedUnits.includes(String(body.resourcePriceUnit).toLowerCase())) {
    errors.push({ field: "resourcePriceUnit", msg: `resourcePriceUnit must be one of: ${allowedUnits.join(", ")}` });
  }

  return errors;
}

// ────────────────────────────────────────────────
// API Routes
// ────────────────────────────────────────────────

// GET all resources (for frontend list)
app.get("/api/resources", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM resources ORDER BY id DESC");
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error("GET /api/resources error:", err);
    res.status(500).json({ ok: false, error: "Database error" });
  }
});

// CREATE resource
app.post("/api/resources", async (req, res) => {
  console.log("POST /api/resources received:", req.body);

  const errors = validateResource(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ ok: false, errors });
  }

  try {
    const {
      resourceName,
      resourceDescription,
      resourceAvailable,
      resourcePrice,
      resourcePriceUnit
    } = req.body;

    // Convert to proper boolean
    const available = resourceAvailable === true ||
                      resourceAvailable === "true" ||
                      resourceAvailable === 1 ||
                      resourceAvailable === "1";

    const result = await pool.query(`
      INSERT INTO resources (name, description, available, price, price_unit, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `, [
      resourceName.trim(),
      resourceDescription.trim(),
      available,
      Number(resourcePrice),
      resourcePriceUnit
    ]);

    console.log("Created resource:", result.rows[0]);

    res.status(201).json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error("POST /api/resources DB error:", err.stack);
    res.status(500).json({ ok: false, error: "Database insert failed", details: err.message });
  }
});

// ────────────────────────────────────────────────
// Fallback: Serve frontend for all non-API routes
// ────────────────────────────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
  // If your main page is resources.html instead, change to:
  // res.sendFile(path.join(__dirname, "public", "resources.html"));
});

// ────────────────────────────────────────────────
// Start server
// ────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});