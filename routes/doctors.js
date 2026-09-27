const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const doctors = db.prepare('SELECT * FROM doctors ORDER BY id DESC').all();
  res.json(doctors);
});

router.post('/', (req, res) => {
  const { full_name, specialization } = req.body;
  if (!full_name) return res.status(400).json({ error: 'full_name required' });
  const info = db.prepare('INSERT INTO doctors (full_name, specialization) VALUES (?,?)')
    .run(full_name, specialization || null);
  res.status(201).json({ id: info.lastInsertRowid });
});

module.exports = router;