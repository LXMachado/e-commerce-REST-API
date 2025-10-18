const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { userId, items } = req.body;

  if (!userId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'userId and a non-empty items array are required.' });
  }

  try {
    await db.query('BEGIN');

    let totalPrice = 0;
    const lineItems = [];

    for (const item of items) {
      const productResult = await db.query('SELECT price FROM products WHERE id = $1', [item.productId]);
      if (productResult.rows.length === 0) {
        throw new Error(`Product ${item.productId} not found`);
      }

      const productPrice = Number(productResult.rows[0].price);
      const quantity = Number(item.quantity) || 0;

      if (quantity <= 0) {
        throw new Error(`Invalid quantity for product ${item.productId}`);
      }

      lineItems.push({ productId: item.productId, quantity, price: productPrice });
      totalPrice += productPrice * quantity;
    }

    const orderResult = await db.query(
      'INSERT INTO orders (user_id, total_price, status) VALUES ($1, $2, $3) RETURNING id',
      [userId, totalPrice, 'pending'],
    );
    const orderId = orderResult.rows[0].id;

    for (const lineItem of lineItems) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
        [orderId, lineItem.productId, lineItem.quantity, lineItem.price],
      );
    }

    await db.query('COMMIT');

    return res.status(201).json({ message: 'Order placed successfully', orderId });
  } catch (error) {
    try {
      await db.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error rolling back transaction during order placement:', rollbackError.stack);
    }

    console.error('Error placing order:', error.stack);
    return res.status(500).json({ message: 'Error placing order.' });
  }
});

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await db.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving order history:', error.stack);
    return res.status(500).json({ message: 'Error retrieving order history.' });
  }
});

router.put('/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'status is required.' });
  }

  try {
    const result = await db.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, orderId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating order status:', error.stack);
    return res.status(500).json({ message: 'Error updating order status.' });
  }
});

module.exports = router;
