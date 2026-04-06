// src/routes/orders.routes.js
import express from "express";
import pool from "../db/pool.js";
import { requireAuth, requireRole } from "../../middleware/auth.middleware.js";
import { logActivity } from "../services/log.service.js";

const router = express.Router();

// --- GET ALL ORDERS (protected) ---
router.get("/", requireAuth, async (req, res) => {
  try {
    let query = `
      SELECT o.id, o.user_id, o.bike_id, o.quantity, o.rental_duration_days,
             o.total_price, o.rental_start_date, o.rental_end_date, o.status,
             o.special_requests, o.created_at,
             b.name as bike_name, u.email as customer_email
      FROM orders o
      JOIN bikes b ON o.bike_id = b.id
      JOIN users u ON o.user_id = u.id
    `;
    
    // Non-admin users can only see their own orders
    if (req.user.role !== "administrator") {
      query += ` WHERE o.user_id = $1`;
      const result = await pool.query(query + ` ORDER BY o.created_at DESC`, [req.user.id]);
      return res.json({
        ok: true,
        orders: result.rows,
      });
    }

    // Admins see all orders
    const result = await pool.query(query + ` ORDER BY o.created_at DESC`);
    return res.json({
      ok: true,
      orders: result.rows,
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    return res.status(500).json({
      ok: false,
      error: "Failed to fetch orders",
    });
  }
});

// --- GET SINGLE ORDER (protected) ---
router.get("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT o.id, o.user_id, o.bike_id, o.quantity, o.rental_duration_days,
              o.total_price, o.rental_start_date, o.rental_end_date, o.status,
              o.special_requests, o.created_at,
              b.name as bike_name, u.email as customer_email
       FROM orders o
       JOIN bikes b ON o.bike_id = b.id
       JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Order not found",
      });
    }

    const order = result.rows[0];

    // Check authorization (user can only see their own orders)
    if (req.user.role !== "administrator" && order.user_id !== req.user.id) {
      return res.status(403).json({
        ok: false,
        error: "Not authorized to view this order",
      });
    }

    return res.json({
      ok: true,
      order,
    });
  } catch (err) {
    console.error("Error fetching order:", err);
    return res.status(500).json({
      ok: false,
      error: "Failed to fetch order",
    });
  }
});

// --- CREATE ORDER (protected) ---
router.post("/", requireAuth, async (req, res) => {
  const { bikeId, quantity, rentalDurationDays, rentalStartDate, specialRequests } = req.body;

  if (!bikeId || !rentalDurationDays || !rentalStartDate) {
    return res.status(400).json({
      ok: false,
      error: "Missing required fields",
    });
  }

  try {
    // Get bike info
    const bikeResult = await pool.query(
      "SELECT id, price_per_day, available_units FROM bikes WHERE id = $1",
      [bikeId]
    );

    if (bikeResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Bike not found",
      });
    }

    const bike = bikeResult.rows[0];
    const qty = quantity || 1;

    // Check availability
    if (bike.available_units < qty) {
      await logActivity("create_order", "order", null, `Order failed: Not enough bikes available`, req.user.id, "error");
      return res.status(400).json({
        ok: false,
        error: "Not enough bikes available",
      });
    }

    // Calculate total price
    const totalPrice = bike.price_per_day * rentalDurationDays * qty;

    // Calculate end date
    const startDate = new Date(rentalStartDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + rentalDurationDays);

    // Insert order
    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, bike_id, quantity, rental_duration_days, total_price,
                          rental_start_date, rental_end_date, special_requests, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        req.user.id,
        bikeId,
        qty,
        rentalDurationDays,
        totalPrice,
        rentalStartDate,
        endDate.toISOString().split("T")[0],
        specialRequests,
        "pending",
      ]
    );

    const order = orderResult.rows[0];
    await logActivity("create_order", "order", order.id, `Order created for bike ${bikeId}`, req.user.id, "success");

    return res.status(201).json({
      ok: true,
      message: "Order created successfully",
      order,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    await logActivity("create_order", "order", null, `Server error creating order`, req.user.id, "error");
    return res.status(500).json({
      ok: false,
      error: "Failed to create order",
    });
  }
});

// --- UPDATE ORDER STATUS (admin only) ---
router.put("/:id", requireAuth, requireRole("administrator"), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["pending", "confirmed", "active", "completed", "cancelled"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      ok: false,
      error: "Invalid status",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE orders 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Order not found",
      });
    }

    await logActivity("update_order", "order", id, `Order status updated to: ${status}`, req.user.id, "success");

    return res.json({
      ok: true,
      message: "Order updated successfully",
      order: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating order:", err);
    return res.status(500).json({
      ok: false,
      error: "Failed to update order",
    });
  }
});

// --- CANCEL ORDER (protected) ---
router.post("/:id/cancel", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    // Get order
    const orderResult = await pool.query(
      "SELECT * FROM orders WHERE id = $1",
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Order not found",
      });
    }

    const order = orderResult.rows[0];

    // Check authorization
    if (req.user.role !== "administrator" && order.user_id !== req.user.id) {
      return res.status(403).json({
        ok: false,
        error: "Not authorized to cancel this order",
      });
    }

    // Only allow cancellation of pending orders
    if (order.status !== "pending") {
      return res.status(400).json({
        ok: false,
        error: `Cannot cancel ${order.status} order`,
      });
    }

    // Update order status
    const result = await pool.query(
      `UPDATE orders 
       SET status = 'cancelled', updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    await logActivity("cancel_order", "order", id, `Order cancelled by user`, req.user.id, "success");

    return res.json({
      ok: true,
      message: "Order cancelled successfully",
      order: result.rows[0],
    });
  } catch (err) {
    console.error("Error cancelling order:", err);
    return res.status(500).json({
      ok: false,
      error: "Failed to cancel order",
    });
  }
});

export default router;
