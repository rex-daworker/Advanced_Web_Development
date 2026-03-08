require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const { body, validationResult } = require("express-validator");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// -----------------------------
// DATABASE CONNECTION
// -----------------------------
const pool = new Pool({
  host: process.env.PGHOST || "database",
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

// -----------------------------
// VALIDATION RULES
// -----------------------------
const resourceValidators = [
  body("resourceName")
    .exists().withMessage("resourceName is required")
    .isString().withMessage("resourceName must be a string")
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage("resourceName must be 3–50 characters"),

  body("resourceDescription")
    .exists().withMessage("resourceDescription is required")
    .isString().withMessage("resourceDescription must be a string")
    .trim()
    .isLength({ min: 10, max: 50 }).withMessage("resourceDescription must be 10–50 characters"),

  body("resourceAvailable")
    .exists().withMessage("resourceAvailable is required")
    .isBoolean().withMessage("resourceAvailable must be boolean")
    .toBoolean(),

  body("resourcePrice")
    .exists().withMessage("resourcePrice is required")
    .isFloat({ min: 0 }).withMessage("resourcePrice must be a non-negative number")
    .toFloat(),

  body("resourcePriceUnit")
    .exists().withMessage("resourcePriceUnit is required")
    .isString().withMessage("resourcePriceUnit must be a string")
    .trim()
    .isIn(["hour", "day", "week", "month"])
    .withMessage("resourcePriceUnit must be 'hour', 'day', 'week', or 'month'"),
];

// -----------------------------
// GET ALL RESOURCES
// -----------------------------
app.get("/api/resources", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, description, available, price, price_unit, created_at FROM resources ORDER BY id"
    );
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error("DB select error:", err);
    res.status(500).json({ ok: false, error: "Database error" });
  }
});

// -----------------------------
// CREATE RESOURCE
// -----------------------------
app.post("/api/resources", resourceValidators, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errors: errors.array().map(e => ({ field: e.path, msg: e.msg })),
    });
  }

  const {
    resourceName,
    resourceDescription,
    resourceAvailable,
    resourcePrice,
    resourcePriceUnit,
  } = req.body;

  try {
    const insertSql = `
      INSERT INTO resources (name, description, available, price, price_unit)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, description, available, price, price_unit, created_at
    `;

    const params = [
      resourceName.trim(),
      resourceDescription.trim(),
      Boolean(resourceAvailable),
      Number(resourcePrice),
      resourcePriceUnit,
    ];

    const { rows } = await pool.query(insertSql, params);
    return res.status(201).json({ ok: true, data: rows[0] });

  } catch (err) {
    console.error("DB insert error:", err);
    return res.status(500).json({ ok: false, error: "Database error" });
  }
});

// -----------------------------
// 404 HANDLER FOR /api
// -----------------------------
app.use("/api", (req, res) => {
  res.status(404).json({ ok: false, error: "Not found" });
});

// -----------------------------
// START SERVER
// -----------------------------
const port = process.env.EPORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
