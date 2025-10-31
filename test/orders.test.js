const request = require('supertest');
const app = require('../src/app');

describe('Order Routes', () => {
    describe('POST /api/orders', () => {
        it('should create order with valid data', async () => {
            const validOrder = {
                userId: 1,
                productId: 1,
                quantity: 1
            };

            const res = await request(app)
                .post('/api/orders')
                .send(validOrder);
            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.userId).toBe(validOrder.userId);
            expect(res.body.data.productId).toBe(validOrder.productId);
            expect(res.body.data.quantity).toBe(validOrder.quantity);
            expect(res.body.data.total).toBeDefined();
        });

        it('should reject order with insufficient stock', async () => {
            const invalidOrder = {
                userId: 1,
                productId: 1,
                quantity: 999 // Quantity greater than available stock
            };

            const res = await request(app)
                .post('/api/orders')
                .send(invalidOrder);
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Insufficient stock');
        });

        it('should reject order with invalid quantity', async () => {
            const invalidOrder = {
                userId: 1,
                productId: 1,
                quantity: 0
            };

            const res = await request(app)
                .post('/api/orders')
                .send(invalidOrder);
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Quantity must be positive');
        });

        it('should reject order with missing required fields', async () => {
            const invalidOrder = {
                userId: 1
            };

            const res = await request(app)
                .post('/api/orders')
                .send(invalidOrder);
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('UserId, productId, and quantity are required');
        });

        it('should update product stock after successful order', async () => {
            // First, get the initial stock
            const initialProduct = await request(app)
                .get('/api/products/1');
            const initialStock = initialProduct.body.data.stock;

            // Create an order
            const validOrder = {
                userId: 1,
                productId: 1,
                quantity: 1
            };

            await request(app)
                .post('/api/orders')
                .send(validOrder);

            // Check updated stock
            const updatedProduct = await request(app)
                .get('/api/products/1');
            expect(updatedProduct.body.data.stock).toBe(initialStock - validOrder.quantity);
        });
    });

    describe('GET /api/orders/user/:userId', () => {
        it('should get orders by valid user ID', async () => {
            const res = await request(app)
                .get('/api/orders/user/1');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.count).toBeDefined();
        });

        it('should return 400 for invalid user ID format', async () => {
            const res = await request(app)
                .get('/api/orders/user/invalid');
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Invalid user ID');
        });
    });
});