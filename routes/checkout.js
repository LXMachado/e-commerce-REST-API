const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required to perform checkout.' });
  }

  try {
    await db.query('BEGIN');

    const cartResult = await db.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    if (cartResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ message: 'Cart not found.' });
    }

    const cartId = cartResult.rows[0].id;
    const cartItemsResult = await db.query('SELECT product_id, quantity FROM cart_items WHERE cart_id = $1', [cartId]);

    if (cartItemsResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    const lineItems = [];
    let totalPrice = 0;

    for (const item of cartItemsResult.rows) {
      const productResult = await db.query('SELECT price FROM products WHERE id = $1', [item.product_id]);
      if (productResult.rows.length === 0) {
        throw new Error(`Product ${item.product_id} not found during checkout.`);
      }

      const productPrice = Number(productResult.rows[0].price);
      const quantity = Number(item.quantity) || 0;

      if (quantity <= 0) {
        throw new Error(`Invalid quantity for product ${item.product_id}`);
      }

      lineItems.push({ productId: item.product_id, quantity, price: productPrice });
      totalPrice += productPrice * quantity;
    }

    const orderResult = await db.query(
      'INSERT INTO orders (user_id, total_price, status) VALUES ($1, $2, $3) RETURNING id',
      [userId, totalPrice, 'completed'],
    );
    const orderId = orderResult.rows[0].id;

    for (const lineItem of lineItems) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
        [orderId, lineItem.productId, lineItem.quantity, lineItem.price],
      );
    }

    await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    await db.query('COMMIT');

    return res.status(201).json({ message: 'Checkout successful', orderId });
  } catch (error) {
    try {
      await db.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error rolling back transaction during checkout:', rollbackError.stack);
    }

    console.error('Error during checkout:', error.stack);
    return res.status(500).json({ message: 'Error during checkout process.' });
  }
});

module.exports = router;
