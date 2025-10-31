const request = require('supertest');
const app = require('../src/app');

describe('Product Routes', () => {
    describe('GET /api/products', () => {
        it('should get all products', async () => {
            const res = await request(app)
                .get('/api/products');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('GET /api/products/:id', () => {
        it('should get product by valid ID', async () => {
            const res = await request(app)
                .get('/api/products/1');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(1);
        });

        it('should return 404 for non-existent product', async () => {
            const res = await request(app)
                .get('/api/products/999');
            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Product not found');
        });

        it('should return 400 for invalid ID format', async () => {
            const res = await request(app)
                .get('/api/products/invalid');
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Invalid product ID');
        });
    });

    describe('POST /api/products', () => {
        it('should create product with valid data', async () => {
            const newProduct = {
                name: 'Test Product',
                price: 99.99,
                stock: 10,
                minStock: 5
            };

            const res = await request(app)
                .post('/api/products')
                .send(newProduct);
            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(newProduct.name);
        });

        it('should reject product with negative stock', async () => {
            const invalidProduct = {
                name: 'Test Product',
                price: 99.99,
                stock: -1,
                minStock: 5
            };

            const res = await request(app)
                .post('/api/products')
                .send(invalidProduct);
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Price and stock cannot be negative');
        });

        it('should reject product with missing required fields', async () => {
            const invalidProduct = {
                name: 'Test Product'
            };

            const res = await request(app)
                .post('/api/products')
                .send(invalidProduct);
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Name, price, and stock are required');
        });
    });

    describe('GET /api/products/low-stock', () => {
        it('should identify low stock products', async () => {
            const res = await request(app)
                .get('/api/products/low-stock');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.count).toBeDefined();
            
            // Verify each returned product has stock below its minStock
            res.body.data.forEach(product => {
                expect(product.stock).toBeLessThan(product.minStock);
            });
        });
    });
});