const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let resources = [];
let nextId = 1;

// GET all resources
app.get("/api/resources", (req, res) => {
  res.json(resources);
});

// CREATE resource
app.post("/api/resources", (req, res) => {
  const { name, description, available, price, unit } = req.body;

  if (!name || !description || !unit) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const newResource = {
    id: nextId++,
    name,
    description,
    available,
    price,
    unit
  };

  resources.push(newResource);
  res.json(newResource);
});

// UPDATE resource
app.put("/api/resources/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = resources.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Not found" });
  }

  const { name, description, available, price, unit } = req.body;

  resources[index] = { id, name, description, available, price, unit };
  res.json(resources[index]);
});

// DELETE resource
app.delete("/api/resources/:id", (req, res) => {
  const id = Number(req.params.id);
  resources = resources.filter(r => r.id !== id);
  res.json({ success: true });
});

app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});
