const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = process.env.APP_PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Koneksi ke database
const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error("Gagal terhubung ke database:", err);
    return;
  }
  console.log("Berhasil terhubung ke database.");
});

// Endpoints Ketik Terhubung
app.get('/', (req, res) => {
  db.ping((err) => {
    if (err) {
      res.status(500).json({ success: false, message: 'Database tidak terhubung!', error: err });
    } else {
      res.json({ success: true, message: 'Database berhasil terhubung Awowkwowk!' });
    }
  });
});

// 1. Membuat catatan baru
app.post("/notes", (req, res) => {
  const { title, datetime, note } = req.body;

  // Query dengan placeholder
  const query = "INSERT INTO notes (title, datetime, note) VALUES (?, ?, ?)";

  // Eksekusi query dengan data
  db.query(query, [title, datetime, note], (err, result) => {
    if (err) {
      res.status(500).send({ error: "Gagal menyimpan catatan", details: err });
    } else {
      res.status(201).send({
        id: result.insertId,
        title,
        datetime,
        note,
      });
    }
  });
});


// 2. Menampilkan semua catatan
app.get("/notes", (req, res) => {
  db.query("SELECT * FROM notes", (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(results);
    }
  });
});

// 3. Menampilkan satu catatan
app.get("/notes/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM notes WHERE id = ?", [id], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else if (result.length === 0) {
      res.status(404).send({ message: "Catatan tidak ditemukan" });
    } else {
      res.status(200).send(result[0]);
    }
  });
});

// 4. Mengubah catatan
app.put("/notes/:id", (req, res) => {
  const { id } = req.params;
  const { title, datetime, note } = req.body;
  const query = "UPDATE notes SET title = ?, datetime = ?, note = ? WHERE id = ?";
  db.query(query, [title, datetime, note, id], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else if (result.affectedRows === 0) {
      res.status(404).send({ message: "Catatan tidak ditemukan" });
    } else {
      res.status(200).send({ message: "Catatan berhasil diubah" });
    }
  });
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
