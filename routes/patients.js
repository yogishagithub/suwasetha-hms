const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.use(requireAuth); // methnin passe wena route ekakwath login nathuwa access karann beh

router.get('/', (req, res) => {
  const patients = db.prepare('SELECT * FROM patients ORDER BY id DESC').all();
  res.json(patients);
});

router.post('/', (req, res) => {
  const { full_name, phone } = req.body;
  if (!full_name) return res.status(400).json({ error: 'full_name required' });
  const info = db.prepare('INSERT INTO patients (full_name, phone) VALUES (?,?)').run(full_name, phone || null);
  res.status(201).json({ id: info.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { full_name, phone } = req.body;
  db.prepare('UPDATE patients SET full_name=?, phone=? WHERE id=?').run(full_name, phone, req.params.id);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM patients WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;