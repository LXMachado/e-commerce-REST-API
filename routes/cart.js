const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to check session
const sessionChecker = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).send('Unauthorized access. Please login.');
  }
  next();
};

// POST: Add item to cart
router.post('/', sessionChecker, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.session.user.id;
  try {
    // Assuming the cart is created for each user at registration
    const cartResult = await db.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    if (cartResult.rows.length === 0) {
      return res.status(404).send('Cart not found.');
    }
    const cartId = cartResult.rows[0].id;
    await db.query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)', [cartId, productId, quantity]);
    console.log(`Item added to cart: ProductID ${productId} for UserID ${userId}`);
    res.status(201).send('Item added to cart');
  } catch (error) {
    console.error('Error adding item to cart:', error.stack);
    res.status(500).send('Error adding item to cart.');
  }
});

// GET: Retrieve the current cart contents
router.get('/', sessionChecker, async (req, res) => {
  const userId = req.session.user.id;
  try {
    const cartResult = await db.query('SELECT carts.id FROM carts WHERE carts.user_id = $1', [userId]);
    if (cartResult.rows.length === 0) {
      return res.status(404).send('Cart not found.');
    }
    const cartId = cartResult.rows[0].id;
    const itemsResult = await db.query('SELECT product_id, quantity FROM cart_items WHERE cart_id = $1', [cartId]);
    console.log(`Retrieved cart contents for UserID ${userId}`);
    res.json(itemsResult.rows);
  } catch (error) {
    console.error('Error retrieving cart:', error.stack);
    res.status(500).send('Error retrieving cart.');
  }
});

// PUT: Update item quantities in the cart
router.put('/:itemId', sessionChecker, async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  try {
    const result = await db.query('UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *', [quantity, itemId]);
    if (result.rows.length === 0) {
      return res.status(404).send('Item not found in cart.');
    }
    console.log(`Updated item quantity in cart: ItemID ${itemId}`);
    res.status(200).send('Item quantity updated');
  } catch (error) {
    console.error('Error updating item quantity:', error.stack);
    res.status(500).send('Error updating item quantity.');
  }
});

// DELETE: Remove item from the cart
router.delete('/:itemId', sessionChecker, async (req, res) => {
  const { itemId } = req.params;
  try {
    const result = await db.query('DELETE FROM cart_items WHERE id = $1 RETURNING *', [itemId]);
    if (result.rows.length === 0) {
      return res.status(404).send('Item not found in cart.');
    }
    console.log(`Removed item from cart: ItemID ${itemId}`);
    res.status(200).send('Item removed from cart');
  } catch (error) {
    console.error('Error removing item from cart:', error.stack);
    res.status(500).send('Error removing item from cart.');
  }
});

module.exports = router;