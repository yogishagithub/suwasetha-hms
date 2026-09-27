const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT lt.*, p.full_name as patient_name FROM lab_tests lt
    JOIN patients p ON lt.patient_id = p.id
    ORDER BY lt.requested_at DESC
  `).all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { patient_id, doctor_id, test_name } = req.body;
  if (!patient_id || !test_name) return res.status(400).json({ error: 'patient_id and test_name required' });
  const info = db.prepare(`
    INSERT INTO lab_tests (patient_id, doctor_id, test_name) VALUES (?,?,?)
  `).run(patient_id, doctor_id || null, test_name);
  res.status(201).json({ id: info.lastInsertRowid });
});

router.put('/:id/collect', (req, res) => {
  db.prepare(`UPDATE lab_tests SET status='Sample Collected' WHERE id=?`).run(req.params.id);
  res.json({ ok: true });
});

router.put('/:id/result', (req, res) => {
  const { result } = req.body;
  if (!result) return res.status(400).json({ error: 'result required' });
  db.prepare(`UPDATE lab_tests SET result=?, status='Completed' WHERE id=?`).run(result, req.params.id);
  res.json({ ok: true });
});

module.exports = router;