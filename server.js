const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// =========================
// 🔗 MySQL Connection
// =========================
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306,
});

// Test DB connection
(async () => {
  try {
    const [rows] = await pool.execute("SELECT DATABASE()");
    console.log("✅ Connected to DB:", rows[0]["DATABASE()"]);
  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
  }
})();

// =========================
// 🚀 Test API
// =========================
app.get("/", (req, res) => {
  res.json({ message: "API working 🚀" });
});

// =========================
// 📝 REGISTER API
// =========================
app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    console.log("📥 Register:", email);

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    // check duplicate email
    const [existing] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // insert
    const [result] = await pool.execute(
      "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
      [firstName, lastName, email, password]
    );

    console.log("✅ User inserted ID:", result.insertId);

    res.json({ message: "User registered successfully" });

  } catch (err) {
    console.error("❌ Register Error:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
});

// =========================
// 🔐 LOGIN API
// =========================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Login:", email);

    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: rows[0]
    });

  } catch (err) {
    console.error("❌ Login Error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// =========================
// 💊 ADD MEDICINE API
// =========================
app.post("/add-medicine", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { name, dosage, timing, user_id } = req.body;

    if (!name || !dosage || !timing) {
      return res.status(400).json({ error: "All fields required" });
    }

    await pool.execute(
      "INSERT INTO medicines (name, dosage, timing, user_id) VALUES (?, ?, ?, ?)",
      [name, dosage, timing, user_id || 1]
    );

    console.log("✅ Medicine added");

    res.json({ message: "Medicine added successfully" });

  } catch (err) {
    console.error("❌ Add Medicine Error:", err.message);
    res.status(500).json({ error: "Failed to add medicine" });
  }
});

// =========================
// 📋 GET MEDICINES API  (FIXED)
// =========================
app.get("/medicines", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM medicines");

    res.json(rows);

  } catch (err) {
    console.error("❌ Fetch Medicines Error:", err.message);
    res.status(500).json({ error: "Failed to fetch medicines" });
  }
});

// =========================
// 🌐 START SERVER
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});