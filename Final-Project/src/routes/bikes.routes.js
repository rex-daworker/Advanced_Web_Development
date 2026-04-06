// src/routes/bikes.routes.js
import express from "express";
import pool from "../db/pool.js";
import { requireAuth, requireRole } from "../../middleware/auth.middleware.js";
import { logActivity } from "../services/log.service.js";

const router = express.Router();

// --- GET ALL BIKES (public) ---
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, price_per_day, price_per_week, bike_type, image_url, 
              total_units, available_units FROM bikes WHERE is_active = true ORDER BY name ASC`
    );

    return res.json({
      ok: true,
      bikes: result.rows,
    });
  } catch (err) {
    console.error("Error fetching bikes:", err);
    return res.status(500).json({
      ok: false,
      error: "Failed to fetch bikes",
    });
  }
});

// --- GET SINGLE BIKE (public) ---
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, name, description, price_per_day, price_per_week, bike_type, image_url, 
              total_units, available_units FROM bikes WHERE id = $1 AND is_active = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Bike not found",
      });
    }

    return res.json({
      ok: true,
      bike: result.rows[0],
    });
  } catch (err) {
    console.error("Error fetching bike:", err);
    return res.status(500).json({
      ok: false,
      error: "Failed to fetch bike",
    });
  }
});

// --- CREATE BIKE (admin only) ---
router.post("/", requireAuth, requireRole("administrator"), async (req, res) => {
  const { name, description, pricePerDay, pricePerWeek, bikeType, imageUrl, totalUnits } = req.body;

  if (!name || !pricePerDay || !pricePerWeek || !bikeType) {
    return res.status(400).json({
      ok: false,
      error: "Missing required fields",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO bikes (name, description, price_per_day, price_per_week, bike_type, image_url, total_units, available_units)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, description, pricePerDay, pricePerWeek, bikeType, imageUrl, totalUnits || 1, totalUnits || 1]
    );

    const bike = result.rows[0];
    await logActivity("create", "bike", bike.id, `New bike created: ${name}`, req.user.id, "success");

    return res.status(201).json({
      ok: true,
      message: "Bike created successfully",
      bike,
    });
  } catch (err) {
    console.error("Error creating bike:", err);
    await logActivity("create", "bike", null, `Error creating bike`, req.user.id, "error");
    return res.status(500).json({
      ok: false,
      error: "Failed to create bike",
    });
  }
});

// --- UPDATE BIKE (admin only) ---
router.put("/:id", requireAuth, requireRole("administrator"), async (req, res) => {
  const { id } = req.params;
  const { name, description, pricePerDay, pricePerWeek, bikeType, imageUrl, totalUnits, isActive } = req.body;

  try {
    const result = await pool.query(
      `UPDATE bikes 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price_per_day = COALESCE($3, price_per_day),
           price_per_week = COALESCE($4, price_per_week),
           bike_type = COALESCE($5, bike_type),
           image_url = COALESCE($6, image_url),
           total_units = COALESCE($7, total_units),
           is_active = COALESCE($8, is_active),
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [name, description, pricePerDay, pricePerWeek, bikeType, imageUrl, totalUnits, isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Bike not found",
      });
    }

    await logActivity("update", "bike", id, `Bike updated: ${name}`, req.user.id, "success");

    return res.json({
      ok: true,
      message: "Bike updated successfully",
      bike: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating bike:", err);
    return res.status(500).json({
      ok: false,
      error: "Failed to update bike",
    });
  }
});

export default router;
