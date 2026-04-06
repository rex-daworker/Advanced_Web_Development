import express from "express";
import pool from "../db/pool.js";
import { requireAuth, requireRole } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM locations ORDER BY name ASC");
    return res.json({ ok: true, locations: result.rows });
  } catch (err) {
    console.error("Error fetching locations:", err);
    return res.status(500).json({ ok: false, error: "Failed to fetch locations" });
  }
});

router.get("/stats", requireAuth, requireRole("administrator"), async (req, res) => {
  try {
    const orders = await pool.query("SELECT COUNT(*) FROM orders");
    const users = await pool.query("SELECT COUNT(*) FROM users");
    const locations = await pool.query("SELECT COUNT(*) FROM locations");

    return res.json({
      ok: true,
      stats: {
        orders: Number(orders.rows[0].count),
        users: Number(users.rows[0].count),
        locations: Number(locations.rows[0].count),
      },
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    return res.status(500).json({ ok: false, error: "Failed to fetch statistics" });
  }
});

export default router;
