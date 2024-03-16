const express = require('express');
const router = express.Router();
const db = require('../db');

// POST: Place an order
router.post('/', async (req, res) => {
    const { userId, items } = req.body; // items should be an array of { productId, quantity }
    try {
        // Start transaction
        await db.query('BEGIN');

        let totalPrice = 0;
        const orderResult = await db.query('INSERT INTO orders (user_id, total_price, status) VALUES ($1, $2, $3) RETURNING id', [userId, 0, 'pending']); // Initially set total_price to 0
        const orderId = orderResult.rows[0].id;

        for (const item of items) {
            const productResult = await db.query('SELECT price FROM products WHERE id = $1', [item.productId]);
            if (productResult.rows.length === 0) {
                throw new Error('Product not found');
            }
            const productPrice = productResult.rows[0].price;
            totalPrice += productPrice * item.quantity;

            await db.query('INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)', [orderId, item.productId, item.quantity, productPrice]);
        }

        // Update order with total price after all items are added
        await db.query('UPDATE orders SET total_price = $1 WHERE id = $2', [totalPrice, orderId]);

        // Commit transaction
        await db.query('COMMIT');

        console.log(`Order placed successfully, Order ID: ${orderId}`);
        res.status(201).json({ message: 'Order placed successfully', orderId: orderId });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error placing order:', error.stack);
        res.status(500).send('Error placing order.');
    }
});

// GET: Retrieve a user's order history
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await db.query('SELECT * FROM orders WHERE user_id = $1', [userId]);
        console.log(`Order history retrieved for User ID: ${userId}`);
        res.json(result.rows);
    } catch (error) {
        console.error('Error retrieving order history:', error.stack);
        res.status(500).send('Error retrieving order history.');
    }
});

// PUT: Update order status
router.put('/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    try {
        const result = await db.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, orderId]);
        if (result.rows.length === 0) {
            console.log(`Order with ID: ${orderId} not found.`);
            return res.status(404).send('Order not found.');
        }
        console.log(`Order status updated, Order ID: ${orderId}, Status: ${status}`);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating order status:', error.stack);
        res.status(500).send('Error updating order status.');
    }
});

module.exports = router;