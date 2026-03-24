require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path');
const { Pool } = require('pg');
const { body, validationResult } = require('express-validator');

function timestamp() {
  const now = new Date();
  return now.toISOString().replace('T', ' ').replace('Z', '');
}

app.use(express.json());

const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

app.get("/", (req, res) => res.sendFile(path.join(publicDir, "index.html")));
app.get('/resources', (req, res) => res.sendFile(path.join(publicDir, 'resources.html')));

const pool = new Pool({});

// STRICT VALIDATION — matching teacher's original intent
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
    .matches(/^[a-zA-Z0-9åäöÅÄÖ ]+$/i)
    .withMessage('resourceName can only contain letters (incl. åäö), numbers and spaces'),

  body('resourceDescription')
    .exists({ checkFalsy: true }).withMessage('resourceDescription is required')
    .isString().withMessage('resourceDescription must be a string')
    .trim()
    .isLength({ min: 10, max: 50 }).withMessage('resourceDescription must be 10–50 characters')
    .matches(/^[a-zA-Z0-9åäöÅÄÖ ]+$/i)
    .withMessage('resourceDescription can only contain letters (incl. åäö), numbers and spaces'),

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

app.post('/api/resources', resourceValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errors: errors.array().map(e => ({ field: e.path, msg: e.msg })),
    });
  }

  let { action, resourceName, resourceDescription, resourceAvailable, resourcePrice, resourcePriceUnit } = req.body;

  // Safe escaping to prevent XSS
  const escapeHtml = (str) => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')   
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const cleanName = escapeHtml(resourceName.trim());
  const cleanDescription = escapeHtml(resourceDescription.trim());

  console.log(`[${timestamp()}] POST /api/resources - Name: ${cleanName}`);

  if (action !== 'create') {
    return res.status(400).json({ ok: false, error: 'Only create is implemented right now' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO resources (name, description, available, price, price_unit)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [cleanName, cleanDescription, Boolean(resourceAvailable), Number(resourcePrice), resourcePriceUnit]
    );

    console.log(`[${timestamp()}] Resource created ID ${rows[0].id}`);
    return res.status(201).json({ ok: true, data: rows[0] });

  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ ok: false, error: "Duplicate resource name" });
    }
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Database error' });
  }
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));