const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "rit@43",
  database: "admin_panel"
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB connection error:", err);
    process.exit(1);
  }
  console.log("✅ Connected to MySQL database");
});

// -------------------- ROOT --------------------
app.get("/", (req, res) => {
  res.send("🚀 Backend running! Use /api/* routes");
});

// -------------------- USERS --------------------
// Get all users
app.get("/api/users", (req, res) => {
  db.query("SELECT * FROM normal_users", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add new user
app.post("/api/users", async (req, res) => {
  const { name, email, password, address } = req.body;
  if (!name || !email || !password || !address)
    return res.status(400).json({ error: "All fields are required" });

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO normal_users (name, email, password, address) VALUES (?,?,?,?)",
    [name, email, hashedPassword, address],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "User added successfully", id: result.insertId });
    }
  );
});

// -------------------- STORES --------------------
// Add store
app.post("/api/stores", (req, res) => {
  const { name, email, address, rating } = req.body;
  if (!name || !email || !address)
    return res.status(400).json({ error: "All fields are required" });

  db.query(
    "INSERT INTO stores (name, email, address, rating) VALUES (?,?,?,?)",
    [name, email, address, rating || 0],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Store added successfully", id: result.insertId });
    }
  );
});

// Get all stores with ratings
app.get("/api/stores", (req, res) => {
  db.query("SELECT * FROM stores", (err, stores) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query("SELECT * FROM store_ratings", (err, ratings) => {
      if (err) return res.status(500).json({ error: err.message });

      const enriched = stores.map(store => {
        const storeRatings = ratings.filter(r => r.store_id === store.id);
        const avgRating = storeRatings.length
          ? storeRatings.reduce((sum, r) => sum + r.rating, 0) / storeRatings.length
          : 0;
        return { ...store, rating: avgRating, userRatings: storeRatings };
      });

      res.json(enriched);
    });
  });
});

// Submit/update store rating
app.post("/api/stores/:storeId/rate", (req, res) => {
  const { storeId } = req.params;
  const { userId, rating } = req.body;

  if (!userId) return res.status(400).json({ error: "User not logged in" });
  if (!rating || rating < 1 || rating > 5)
    return res.status(400).json({ error: "Invalid rating" });

  db.query(
    `INSERT INTO store_ratings (store_id, user_id, rating)
     VALUES (?,?,?)
     ON DUPLICATE KEY UPDATE rating=?`,
    [storeId, userId, rating, rating],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Rating saved successfully" });
    }
  );
});

// -------------------- DASHBOARD --------------------
app.get("/api/dashboard", (req, res) => {
  db.query("SELECT COUNT(*) AS totalUsers FROM normal_users", (err, usersResult) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query("SELECT COUNT(*) AS totalStores FROM stores", (err, storesResult) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        totalUsers: usersResult[0].totalUsers || 0,
        totalStores: storesResult[0].totalStores || 0
      });
    });
  });
});

// -------------------- 404 --------------------
app.use((req, res) => res.status(404).json({ error: "API route not found" }));

// -------------------- START SERVER --------------------
app.listen(5000, () => console.log("🚀 Server running on port 5000"));
