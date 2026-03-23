require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;        // ← Fixed: was IPORT
const path = require('path');
const { Pool } = require('pg');
const { body, validationResult } = require('express-validator');

// Timestamp helper
function timestamp() {
  const now = new Date();
  return now.toISOString().replace('T', ' ').replace('Z', '');
}

// --- Middleware ---
app.use(express.json());

// Serve static files
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

// --- FIXED Validation Rules (this is the key part) ---
const resourceValidators = [
  body('action')
    .exists({ checkFalsy: true }).withMessage('action is required')
    .trim()
    .isIn(['create']).withMessage("action must be 'create'"),

  body('resourceName')
    .exists({ checkFalsy: true }).withMessage('resourceName is required')
    .isString().withMessage('resourceName must be a string')
    .trim()
    .isLength({ min: 5, max: 30 }).withMessage('resourceName must be 5–30 characters')
   .matches(/^[a-zA-Z0-9åäöÅÄÖ ]+$/)
    .withMessage('resourceName can only contain letters (incl. åäö), numbers, spaces and . , ! ? - \''),

  body('resourceDescription')
    .exists({ checkFalsy: true }).withMessage('resourceDescription is required')
    .isString().withMessage('resourceDescription must be a string')
    .trim()
    .isLength({ min: 10, max: 50 }).withMessage('resourceDescription must be 10–50 characters')
    .matches(/^[a-zA-Z0-9åäöÅÄÖ ]+$/)
    .withMessage('resourceDescription can only contain letters (incl. åäö), numbers, spaces and . , ! ? - \''),

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

  let {
    action,
    resourceName,
    resourceDescription,
    resourceAvailable,
    resourcePrice,
    resourcePriceUnit
  } = req.body;

  // Clean & safe HTML escaping
  const escapeHtml = (str) => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const cleanName = escapeHtml(resourceName.trim());
  const cleanDescription = escapeHtml(resourceDescription.trim());

  // Final safety net (optional but good)
  if (cleanDescription.toLowerCase().includes('<script') || 
      cleanDescription.toLowerCase().includes('alert(')) {
    return res.status(400).json({
      ok: false,
      error: "Invalid description",
      details: "Description contains disallowed content."
    });
  }

  console.log(`[${timestamp()}] POST /api/resources`);
  console.log('Name        ➡️', cleanName);
  console.log('Description ➡️', cleanDescription);
  console.log('Available   ➡️', resourceAvailable);
  console.log('Price       ➡️', resourcePrice);
  console.log('Unit        ➡️', resourcePriceUnit);

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
    if (err.code === '23505') {
      return res.status(409).json({
        ok: false,
        error: "Duplicate resource name",
        details: `A resource named "${resourceName}" already exists.`
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