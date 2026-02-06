const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
// Allow DB path to be configured for PVC (e.g., /data/links.db)
const dbPath = process.env.DB_PATH || path.join(__dirname, 'links.db');

app.use(cors());
app.use(express.json());

// Initialize DB
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to SQLite database at ' + dbPath);
        db.run(`CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      title TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    }
});

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/links', (req, res) => {
    db.all("SELECT * FROM links ORDER BY created_at DESC", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.post('/api/links', (req, res) => {
    const { url, title } = req.body;
    if (!url) {
        res.status(400).json({ error: "URL is required" });
        return;
    }
    // Simple validation to ensure protocol
    let finalUrl = url;
    if (!url.startsWith('http')) {
        finalUrl = 'https://' + url;
    }

    const sql = "INSERT INTO links (url, title) VALUES (?, ?)";
    const params = [finalUrl, title || finalUrl];
    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id: this.lastID, url: finalUrl, title: title || finalUrl }
        });
    });
});

app.delete('/api/links/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM links WHERE id = ?", id, function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "deleted", changes: this.changes });
    });
});

// Serve static frontend
const frontendPath = process.env.FRONTEND_PATH || path.join(__dirname, '../client/dist');
app.use(express.static(frontendPath));

// Catch-all route to serve React app for non-API requests
app.get(/.*/, (req, res) => {
    // Check if request is for API
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Not Found' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
