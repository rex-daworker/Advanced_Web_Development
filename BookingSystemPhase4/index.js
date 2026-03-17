require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.IPORT || 5000;
const path = require('path');
const { Pool } = require('pg');
const { body, validationResult } = require('express-validator');

// Timestamp helper
function timestamp() {
  const now = new Date();
  return now.toISOString().replace('T', ' ').replace('Z', '');
}

// --- Middleware ---
app.use(express.json()); // Parse application/json

// Serve static files from ./public
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

// --- Routes (HTML pages) ---
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.get('/resources', (req, res) => {
  res.sendFile(path.join(publicDir, 'resources.html'));
});

// --- Database connection ---
const pool = new Pool({});

// --- Validation rules ---
const resourceValidators = [
  body('action')
    .exists({ checkFalsy: true }).withMessage('action is required')
    .trim()
    .isIn(['create']).withMessage("action must be 'create'"),

  body('resourceName')
    .exists({ checkFalsy: true }).withMessage('resourceName is required')
    .isString().withMessage('resourceName must be a string')
    .trim()
    .escape()
    .isLength({ min: 5, max: 30 }).withMessage('resourceName must be 5–30 characters'),

  body('resourceDescription')
    .exists({ checkFalsy: true }).withMessage('resourceDescription is required')
    .isString().withMessage('resourceDescription must be a string')
    .trim()
    .isLength({ min: 10, max: 50 }).withMessage('resourceDescription must be 10–50 characters'),

  body('resourceAvailable')
    .exists({ checkFalsy: true }).withMessage('resourceAvailable is required')
    .isBoolean().withMessage('resourceAvailable must be boolean')
    .toBoolean(),

  body('resourcePrice')
    .exists({ checkFalsy: true }).withMessage('resourcePrice is required')
    .isFloat({ min: 0 }).withMessage('resourcePrice must be a non-negative number')
    .toFloat(),

  body('resourcePriceUnit')
    .exists({ checkFalsy: true }).withMessage('resourcePriceUnit is required')
    .isString().withMessage('resourcePriceUnit must be a string')
    .trim()
    .isIn(['hour', 'day', 'week', 'month'])
    .withMessage("resourcePriceUnit must be 'hour', 'day', 'week', or 'month'"),
];

// POST /api/resources - Create resource
app.post('/api/resources', resourceValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errors: errors.array().map(e => ({ field: e.path, msg: e.msg })),
    });
  }

  // Extract validated & coerced values
  let {
    action,
    resourceName,
    resourceDescription,
    resourceAvailable,
    resourcePrice,
    resourcePriceUnit
  } = req.body;

  // Sanitize inputs to prevent XSS / dangerous content
  const cleanName = resourceName.trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  let cleanDescription = resourceDescription.trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // Extra protection: reject if it still looks like a script tag after escaping
  if (cleanDescription.includes('<script') || cleanDescription.includes('alert(')) {
    return res.status(400).json({
      ok: false,
      error: "Invalid description",
      details: "Description contains disallowed content (scripts or executable code)."
    });
  }

  // Optional logging
  console.log(`[${timestamp()}] POST /api/resources`);
  console.log('------------------------------');
  console.log('Action       ➡️', action);
  console.log('Name         ➡️', cleanName);
  console.log('Description  ➡️', cleanDescription);
  console.log('Available    ➡️', resourceAvailable);
  console.log('Price        ➡️', resourcePrice);
  console.log('Unit         ➡️', resourcePriceUnit);
  console.log('------------------------------');

  if (action !== 'create') {
    return res.status(400).json({ ok: false, error: 'Only create is implemented right now' });
  }

  try {
    const insertSql = `
      INSERT INTO resources (name, description, available, price, price_unit)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, description, available, price, price_unit, created_at
    `;

    const params = [
      cleanName,
      cleanDescription,
      Boolean(resourceAvailable),
      Number(resourcePrice),
      resourcePriceUnit
    ];

    const { rows } = await pool.query(insertSql, params);
    const created = rows[0];

    console.log(`[${timestamp()}] Resource created: "${created.name}" (ID: ${created.id})`);

    return res.status(201).json({ ok: true, data: created });

  } catch (err) {
    if (err.code === '23505') { // PostgreSQL unique violation (duplicate name)
      return res.status(409).json({
        ok: false,
        error: "Duplicate resource name",
        details: `A resource named "${resourceName}" already exists. Please choose a different name.`
      });
    }

    console.error('DB insert failed:', err.message);
    return res.status(500).json({ ok: false, error: 'Database error' });
  }
});

// 404 for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server 
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});