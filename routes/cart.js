const express = require('express');
const router = express.Router();
const db = require('../db');

const sessionChecker = (req, res, next) => {
  const user = req.session?.user;
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized access. Please login.' });
  }

  req.user = user;
  return next();
};

router.post('/', sessionChecker, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  if (!productId || !quantity) {
    return res.status(400).json({ message: 'productId and quantity are required.' });
  }

  try {
    const cartResult = await db.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    if (cartResult.rows.length === 0) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    const cartId = cartResult.rows[0].id;
    await db.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity',
      [cartId, productId, quantity],
    );

    return res.status(201).json({ message: 'Item added to cart.' });
  } catch (error) {
    console.error('Error adding item to cart:', error.stack);
    return res.status(500).json({ message: 'Error adding item to cart.' });
  }
});

router.get('/', sessionChecker, async (req, res) => {
  const userId = req.user.id;

  try {
    const cartResult = await db.query('SELECT carts.id FROM carts WHERE carts.user_id = $1', [userId]);
    if (cartResult.rows.length === 0) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    const cartId = cartResult.rows[0].id;
    const itemsResult = await db.query(
      `SELECT ci.id, ci.product_id AS "productId", ci.quantity, p.name, p.price
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = $1`,
      [cartId],
    );

    return res.json(itemsResult.rows);
  } catch (error) {
    console.error('Error retrieving cart:', error.stack);
    return res.status(500).json({ message: 'Error retrieving cart.' });
  }
});

router.put('/:itemId', sessionChecker, async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity) {
    return res.status(400).json({ message: 'quantity is required.' });
  }

  try {
    const result = await db.query('UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *', [quantity, itemId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found in cart.' });
    }

    return res.status(200).json({ message: 'Item quantity updated.' });
  } catch (error) {
    console.error('Error updating item quantity:', error.stack);
    return res.status(500).json({ message: 'Error updating item quantity.' });
  }
});

router.delete('/:itemId', sessionChecker, async (req, res) => {
  const { itemId } = req.params;

  try {
    const result = await db.query('DELETE FROM cart_items WHERE id = $1 RETURNING *', [itemId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found in cart.' });
    }

    return res.status(200).json({ message: 'Item removed from cart.' });
  } catch (error) {
    console.error('Error removing item from cart:', error.stack);
    return res.status(500).json({ message: 'Error removing item from cart.' });
  }
});

module.exports = router;
