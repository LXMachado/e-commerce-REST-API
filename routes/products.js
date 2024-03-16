const express = require('express');
const router = express.Router();
const db = require('../db');

// Create a new product
router.post('/', async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;
        const result = await db.query('INSERT INTO products (name, description, price, stock) VALUES ($1, $2, $3, $4) RETURNING *', [name, description, price, stock]);
        console.log(`Product created successfully: ${name}`);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating product:', error.stack);
        res.status(500).send('Error creating product.');
    }
});

// Retrieve all products
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM products');
        console.log('Retrieved all products');
        res.json(result.rows);
    } catch (error) {
        console.error('Error retrieving products:', error.stack);
        res.status(500).send('Error retrieving products.');
    }
});

// Retrieve a single product by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            console.log(`Retrieved product with ID: ${id}`);
            res.json(result.rows[0]);
        } else {
            console.log(`Product with ID: ${id} not found.`);
            res.status(404).send('Product not found.');
        }
    } catch (error) {
        console.error('Error retrieving product:', error.stack);
        res.status(500).send('Error retrieving product.');
    }
});

// Update a product
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock } = req.body;
        const result = await db.query('UPDATE products SET name = $1, description = $2, price = $3, stock = $4 WHERE id = $5 RETURNING *', [name, description, price, stock, id]);
        if (result.rows.length > 0) {
            console.log(`Product with ID: ${id} updated successfully.`);
            res.json(result.rows[0]);
        } else {
            console.log(`Product with ID: ${id} not found for update.`);
            res.status(404).send('Product not found.');
        }
    } catch (error) {
        console.error('Error updating product:', error.stack);
        res.status(500).send('Error updating product.');
    }
});

// Delete a product
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            console.log(`Product with ID: ${id} deleted successfully.`);
            res.json({ message: 'Product deleted successfully.' });
        } else {
            console.log(`Product with ID: ${id} not found for deletion.`);
            res.status(404).send('Product not found.');
        }
    } catch (error) {
        console.error('Error deleting product:', error.stack);
        res.status(500).send('Error deleting product.');
    }
});

module.exports = router;