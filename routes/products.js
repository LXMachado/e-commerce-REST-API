const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ message: 'name, price, and stock are required.' });
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (Number.isNaN(numericPrice) || Number.isNaN(numericStock)) {
      return res.status(400).json({ message: 'price and stock must be numeric values.' });
    }

    const result = await db.query(
      'INSERT INTO products (name, description, price, stock) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description ?? '', numericPrice, numericStock],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error.stack);
    return res.status(500).json({ message: 'Error creating product.' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const result = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    return res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving products:', error.stack);
    return res.status(500).json({ message: 'Error retrieving products.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    }

    return res.status(404).json({ message: 'Product not found.' });
  } catch (error) {
    console.error('Error retrieving product:', error.stack);
    return res.status(500).json({ message: 'Error retrieving product.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;

    const result = await db.query(
      'UPDATE products SET name = $1, description = $2, price = $3, stock = $4 WHERE id = $5 RETURNING *',
      [name, description, price, stock, id],
    );

    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    }

    return res.status(404).json({ message: 'Product not found.' });
  } catch (error) {
    console.error('Error updating product:', error.stack);
    return res.status(500).json({ message: 'Error updating product.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length > 0) {
      return res.json({ message: 'Product deleted successfully.' });
    }

    return res.status(404).json({ message: 'Product not found.' });
  } catch (error) {
    console.error('Error deleting product:', error.stack);
    return res.status(500).json({ message: 'Error deleting product.' });
  }
});

module.exports = router;
