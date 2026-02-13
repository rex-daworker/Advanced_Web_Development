require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");

// PORT fallback so server always runs
const PORT = process.env.PORT || 5000;

// Timestamp helper
function timestamp() {
  const now = new Date();
  return now.toISOString().replace("T", " ").replace("Z", "");
}

// Middleware
app.use(express.json()); // MUST be before routes

// Serve static files
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

// Serve pages
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/resources", (req, res) => {
  res.sendFile(path.join(publicDir, "resources.html"));
});

// POST handler — FIXED
app.post("/api/resources", (req, res) => {
  const {
    action = "",
    resourceName = "",
    resourceDescription = "",
    resourceAvailable = false,
    resourcePrice = "",
    resourcePriceUnit = ""
  } = req.body;

  console.log(`[${timestamp()}] Action = ${action}`);
  console.log(`[${timestamp()}] Name = ${resourceName}`);
  console.log(`[${timestamp()}] Description = ${resourceDescription}`);
  console.log(`[${timestamp()}] Availability = ${resourceAvailable}`);
  console.log(`[${timestamp()}] Price = ${resourcePrice}`);
  console.log(`[${timestamp()}] Price unit = ${resourcePriceUnit}`);

  // Always respond — FIXED
  res.status(200).json({
    status: 200,
    action,
    resourceName,
    resourceDescription,
    resourceAvailable,
    resourcePrice,
    resourcePriceUnit
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
