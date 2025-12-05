const request = require('supertest');

// Mock mongoose BEFORE requiring the app
jest.mock('mongoose', () => {
    const mockSave = jest.fn().mockResolvedValue({ _id: '123', name: 'Test User', email: 'test@test.com' });
    const mockFindById = jest.fn();

    const MockModel = function (data) {
        this.name = data.name;
        this.email = data.email;
        this.save = mockSave;
    };
    MockModel.findById = mockFindById;

    return {
        connect: jest.fn().mockResolvedValue(true),
        model: jest.fn().mockReturnValue(MockModel),
        Schema: jest.fn().mockReturnValue({}),
    };
});

const app = require('../index');

describe('User Service API', () => {
    afterAll(async () => {
        // Clean up any open handles
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('POST /users should return 200', async () => {
        const res = await request(app)
            .post('/users')
            .send({ name: 'Test User', email: 'test@test.com' });

        expect(res.statusCode).toBe(200);
    });

    it('GET /users/:id should return 404 for non-existent user', async () => {
        const mongoose = require('mongoose');
        const User = mongoose.model('User');
        User.findById.mockResolvedValue(null);

        const res = await request(app)
            .get('/users/nonexistent123');

        expect(res.statusCode).toBe(404);
    });
});
