const request = require('supertest');
const app = require('../src/app');

describe('User Routes', () => {
    describe('GET /api/users', () => {
        it('should get all users', async () => {
            const res = await request(app)
                .get('/api/users');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.count).toBeDefined();
        });
    });

    describe('GET /api/users/:id', () => {
        it('should get user by valid ID', async () => {
            const res = await request(app)
                .get('/api/users/1');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(1);
        });

        it('should return 404 for non-existent user', async () => {
            const res = await request(app)
                .get('/api/users/999');
            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('User not found');
        });

        it('should return 400 for invalid ID format', async () => {
            const res = await request(app)
                .get('/api/users/invalid');
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Invalid user ID');
        });
    });
});