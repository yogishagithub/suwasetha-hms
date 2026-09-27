const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
router.use(requireAuth);

router.get('/patient/:patientId', (req, res) => {
  const rows = db.prepare(`
    SELECT mr.*, d.full_name as doctor_name FROM medical_records mr
    LEFT JOIN doctors d ON mr.doctor_id = d.id
    WHERE mr.patient_id = ? ORDER BY visit_date DESC
  `).all(req.params.patientId);
  res.json(rows);
});

router.post('/', (req, res) => {
  const { patient_id, doctor_id, diagnosis, prescription, notes } = req.body;
  if (!patient_id || !diagnosis) return res.status(400).json({ error: 'patient_id and diagnosis required' });
  const info = db.prepare(`
    INSERT INTO medical_records (patient_id, doctor_id, diagnosis, prescription, notes)
    VALUES (?,?,?,?,?)
  `).run(patient_id, doctor_id || null, diagnosis, prescription || null, notes || null);
  res.status(201).json({ id: info.lastInsertRowid });
});

module.exports = router;