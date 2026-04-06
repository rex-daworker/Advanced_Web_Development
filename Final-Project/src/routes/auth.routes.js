// src/routes/auth.routes.js
import express from "express";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import pool from "../db/pool.js";
import {
  registerValidator,
  loginValidator,
  handleValidationErrors,
} from "../validators/user.validators.js";
import { logActivity } from "../services/log.service.js";

const router = express.Router();

// --- REGISTER ---
router.post("/register", registerValidator, handleValidationErrors, async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    if (existingUser.rows.length > 0) {
      await logActivity("register", "user", null, `Registration failed: Email already exists`, null, "error");
      return res.status(409).json({
        ok: false,
        error: "Email already registered",
      });
    }

    // Hash password
    const passwordHash = await bcryptjs.hash(password, 10);

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, role`,
      [firstName, lastName, email, passwordHash, "customer", true]
    );

    const user = result.rows[0];
    await logActivity("register", "user", user.id, `User registered: ${email}`, user.id, "success");

    // Generate JWT token
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      ok: true,
      message: "Registration successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      token,
    });
  } catch (err) {
    console.error("Register error:", err);
    await logActivity("register", "user", null, `Server error during registration`, null, "error");
    return res.status(500).json({
      ok: false,
      error: "Registration failed",
    });
  }
});

// --- LOGIN ---
router.post("/login", loginValidator, handleValidationErrors, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const result = await pool.query(
      "SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE LOWER(email) = LOWER($1) AND is_active = true",
      [email]
    );

    if (result.rows.length === 0) {
      await logActivity("login", "user", null, `Login failed: User not found`, null, "error");
      return res.status(401).json({
        ok: false,
        error: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    // Verify password
    const passwordMatch = await bcryptjs.compare(password, user.password_hash);
    if (!passwordMatch) {
      await logActivity("login", "user", user.id, `Login failed: Invalid password`, null, "error");
      return res.status(401).json({
        ok: false,
        error: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await logActivity("login", "user", user.id, `User logged in`, user.id, "success");

    return res.json({
      ok: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    await logActivity("login", "user", null, `Server error during login`, null, "error");
    return res.status(500).json({
      ok: false,
      error: "Login failed",
    });
  }
});

// --- LOGOUT ---
router.post("/logout", (req, res) => {
  // Since we're using JWT, logout is handled on the client (token deletion)
  return res.json({
    ok: true,
    message: "Logged out successfully",
  });
});

// --- GET CURRENT USER (protected) ---
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      ok: false,
      error: "No token provided",
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({
      ok: true,
      user: {
        id: decoded.sub,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        role: decoded.role,
      },
    });
  } catch (err) {
    return res.status(401).json({
      ok: false,
      error: "Invalid token",
    });
  }
});

export default router;
