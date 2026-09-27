const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
router.use(requireAuth);

router.get('/dashboard', (req, res) => {
  const totalPatients = db.prepare('SELECT COUNT(*) c FROM patients').get().c;
  const today = new Date().toISOString().slice(0, 10);
  const todayAppointments = db.prepare('SELECT COUNT(*) c FROM appointments WHERE appt_date = ?').get(today).c;
  const revenueTotal = db.prepare('SELECT COALESCE(SUM(amount),0) s FROM payments').get().s;
  const pendingLab = db.prepare(`SELECT COUNT(*) c FROM lab_tests WHERE status != 'Completed'`).get().c;
  const lowStock = db.prepare('SELECT COUNT(*) c FROM pharmacy_items WHERE stock_qty <= reorder_level').get().c;

  res.json({
    totalPatients,
    todayAppointments,
    revenueTotal,
    pendingLabRequests: pendingLab,
    pharmacyLowStockAlerts: lowStock
  });
});

module.exports = router;