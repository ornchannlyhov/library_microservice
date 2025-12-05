const request = require('supertest');

// Mock mongoose BEFORE requiring the app
jest.mock('mongoose', () => {
    const mockSave = jest.fn().mockResolvedValue({ _id: '123', name: 'Test User', email: 'test@test.com' });
    const mockFindById = jest.fn();
    const mockFind = jest.fn().mockResolvedValue([]);
    const mockFindByIdAndUpdate = jest.fn();
    const mockFindByIdAndDelete = jest.fn();

    const MockModel = function (data) {
        this.name = data.name;
        this.email = data.email;
        this.save = mockSave;
    };
    MockModel.findById = mockFindById;
    MockModel.find = mockFind;
    MockModel.findByIdAndUpdate = mockFindByIdAndUpdate;
    MockModel.findByIdAndDelete = mockFindByIdAndDelete;

    return {
        connect: jest.fn().mockResolvedValue(true),
        model: jest.fn().mockReturnValue(MockModel),
        Schema: jest.fn().mockReturnValue({}),
        Types: {
            ObjectId: {
                isValid: jest.fn().mockReturnValue(true)
            }
        }
    };
});

const app = require('../index');

describe('User Service API', () => {
    afterAll(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('POST /users should return 201 (Created)', async () => {
        const res = await request(app)
            .post('/users')
            .send({ name: 'Test User', email: 'test@test.com' });

        expect(res.statusCode).toBe(201);
    });

    it('GET /users/:id should return 404 for non-existent user', async () => {
        const mongoose = require('mongoose');
        const User = mongoose.model('User');
        User.findById.mockResolvedValue(null);

        const res = await request(app)
            .get('/users/507f1f77bcf86cd799439011');

        expect(res.statusCode).toBe(404);
    });

    it('GET /users should return empty array', async () => {
        const res = await request(app).get('/users');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
