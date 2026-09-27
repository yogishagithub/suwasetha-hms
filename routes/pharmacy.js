const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM pharmacy_items ORDER BY name').all();
  res.json(rows);
});

router.get('/low-stock', (req, res) => {
  const rows = db.prepare('SELECT * FROM pharmacy_items WHERE stock_qty <= reorder_level').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { name, stock_qty, unit_price, expiry_date, reorder_level } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const info = db.prepare(`
    INSERT INTO pharmacy_items (name, stock_qty, unit_price, expiry_date, reorder_level)
    VALUES (?,?,?,?,?)
  `).run(name, stock_qty || 0, unit_price || 0, expiry_date || null, reorder_level || 10);
  res.status(201).json({ id: info.lastInsertRowid });
});

router.put('/:id/dispense', (req, res) => {
  const { qty } = req.body;
  const item = db.prepare('SELECT * FROM pharmacy_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  if (item.stock_qty < qty) return res.status(400).json({ error: 'Insufficient stock' });
  db.prepare('UPDATE pharmacy_items SET stock_qty = stock_qty - ? WHERE id = ?').run(qty, req.params.id);
  res.json({ ok: true, remaining: item.stock_qty - qty });
});

module.exports = router;