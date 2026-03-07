require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();

/* ---------------- MIDDLEWARE ---------------- */

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------- DATABASE ---------------- */

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

/* ---------------- TEST ROUTE ---------------- */

app.get('/api', (req, res) => {
  res.json({ message: "Medication API running" });
});

/* ---------------- REGISTER ---------------- */

app.post('/api/auth/register', async (req, res) => {
  try {

    const { firstName, lastName, email, password, dateOfBirth, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const connection = await pool.getConnection();

    const [existing] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.execute(
      `INSERT INTO users 
      (first_name, last_name, email, password, date_of_birth, phone)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, hashedPassword, dateOfBirth, phone]
    );

    connection.release();

    res.json({ message: "User registered successfully" });

  }catch (error) {
  console.error("REGISTER ERROR:", error);
  res.status(500).json({ error: "Registration failed" });
}

/* ---------------- LOGIN ---------------- */

app.post('/api/auth/login', async (req, res) => {

  try {

    const { email, password } = req.body;

    const connection = await pool.getConnection();

    const [users] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

/* ---------------- SERVE FRONTEND ---------------- */

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/* ---------------- SERVER ---------------- */

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});