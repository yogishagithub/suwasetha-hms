const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM employees ORDER BY id DESC').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { full_name, designation, phone } = req.body;
  if (!full_name) return res.status(400).json({ error: 'full_name required' });
  const info = db.prepare('INSERT INTO employees (full_name, designation, phone) VALUES (?,?,?)')
    .run(full_name, designation || null, phone || null);
  res.status(201).json({ id: info.lastInsertRowid });
});

module.exports = router;