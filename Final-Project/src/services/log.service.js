// src/services/log.service.js
import pool from "../db/pool.js";

export async function logActivity(
  action,
  entityType,
  entityId,
  description,
  userId = null,
  status = "success"
) {
  try {
    await pool.query(
      `INSERT INTO logs (action, entity_type, entity_id, description, user_id, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [action, entityType, entityId, description, userId, status]
    );
  } catch (err) {
    console.error("Error logging activity:", err);
  }
}

export async function getActivityLogs(
  filters = {},
  limit = 100,
  offset = 0
) {
  try {
    let query = "SELECT * FROM logs WHERE 1=1";
    const values = [];
    let paramCount = 1;

    if (filters.userId) {
      query += ` AND user_id = $${paramCount}`;
      values.push(filters.userId);
      paramCount++;
    }

    if (filters.entityType) {
      query += ` AND entity_type = $${paramCount}`;
      values.push(filters.entityType);
      paramCount++;
    }

    if (filters.action) {
      query += ` AND action = $${paramCount}`;
      values.push(filters.action);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  } catch (err) {
    console.error("Error fetching logs:", err);
    throw err;
  }
}
