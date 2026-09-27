const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT a.*, p.full_name as patient_name, d.full_name as doctor_name
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN doctors d ON a.doctor_id = d.id
    ORDER BY a.appt_date DESC
  `).all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { patient_id, doctor_id, appt_date, appt_time, reason } = req.body;
  if (!patient_id || !doctor_id || !appt_date || !appt_time) {
    return res.status(400).json({ error: 'patient_id, doctor_id, appt_date, appt_time required' });
  }
  const info = db.prepare(`
    INSERT INTO appointments (patient_id, doctor_id, appt_date, appt_time, reason)
    VALUES (?,?,?,?,?)
  `).run(patient_id, doctor_id, appt_date, appt_time, reason || null);
  res.status(201).json({ id: info.lastInsertRowid });
});

router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ ok: true });
});

module.exports = router;