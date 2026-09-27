const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT b.*, p.full_name as patient_name FROM billing b
    JOIN patients p ON b.patient_id = p.id ORDER BY b.created_at DESC
  `).all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { patient_id, consultation_charge, lab_charge, pharmacy_charge, admission_charge } = req.body;
  if (!patient_id) return res.status(400).json({ error: 'patient_id required' });
  const c = Number(consultation_charge) || 0;
  const l = Number(lab_charge) || 0;
  const p = Number(pharmacy_charge) || 0;
  const a = Number(admission_charge) || 0;
  const total = c + l + p + a;
  const info = db.prepare(`
    INSERT INTO billing (patient_id, consultation_charge, lab_charge, pharmacy_charge, admission_charge, total)
    VALUES (?,?,?,?,?,?)
  `).run(patient_id, c, l, p, a, total);
  res.status(201).json({ id: info.lastInsertRowid, total });
});

router.post('/:id/payments', (req, res) => {
  const { amount, method } = req.body;
  const bill = db.prepare('SELECT * FROM billing WHERE id = ?').get(req.params.id);
  if (!bill) return res.status(404).json({ error: 'Not found' });
  db.prepare('INSERT INTO payments (billing_id, amount, method) VALUES (?,?,?)').run(req.params.id, amount, method || 'Cash');
  const totalPaid = db.prepare('SELECT COALESCE(SUM(amount),0) s FROM payments WHERE billing_id = ?').get(req.params.id).s;
  const status = totalPaid >= bill.total ? 'Paid' : 'Partially Paid';
  db.prepare('UPDATE billing SET status = ? WHERE id = ?').run(status, req.params.id);
  res.status(201).json({ ok: true, totalPaid, status });
});

module.exports = router;