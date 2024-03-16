const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
    const { userId } = req.body; // Assume userId is sent in the request body for simplicity

    try {
        console.log('Starting checkout process...');
        // Start database transaction
        await db.query('BEGIN');

        // Retrieve user's cart
        const cartResult = await db.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
        if (cartResult.rows.length === 0) {
            console.log('Cart not found for userId:', userId);
            return res.status(404).send('Cart not found.');
        }

        const cartId = cartResult.rows[0].id;

        // Retrieve cart items for total price calculation
        const cartItemsResult = await db.query('SELECT product_id, quantity FROM cart_items WHERE cart_id = $1', [cartId]);

        let totalPrice = 0;
        for (const item of cartItemsResult.rows) {
            const productResult = await db.query('SELECT price FROM products WHERE id = $1', [item.product_id]);
            if (productResult.rows.length === 0) {
                console.log('Product not found during checkout for productId:', item.product_id);
                throw new Error('Product not found during checkout.');
            }

            totalPrice += productResult.rows[0].price * item.quantity;
        }

        // Simulate payment processing (This would be replaced by real payment integration)
        console.log('Simulating payment processing...');

        // Create order
        const orderResult = await db.query('INSERT INTO orders (user_id, total_price, status) VALUES ($1, $2, $3) RETURNING id', [userId, totalPrice, 'completed']);
        const orderId = orderResult.rows[0].id;

        // Move items from cart to order_items
        for (const item of cartItemsResult.rows) {
            await db.query('INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)', [orderId, item.product_id, item.quantity, (totalPrice / cartItemsResult.rows.length)]);
        }

        // Clear the cart
        await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

        // Commit transaction
        await db.query('COMMIT');

        console.log('Checkout successful for userId:', userId, 'orderId:', orderId);
        res.status(201).json({ message: 'Checkout successful', orderId: orderId });
    } catch (error) {
        // Rollback transaction in case of error
        await db.query('ROLLBACK');
        console.error('Error during checkout:', error.stack);
        res.status(500).send('Error during checkout process.');
    }
});

module.exports = router;