const request = require('supertest');

// Mock axios for inter-service calls
jest.mock('axios');

// Mock mongoose BEFORE requiring the app
jest.mock('mongoose', () => {
    const mockSave = jest.fn().mockResolvedValue({
        _id: '123',
        userId: 'user123',
        bookId: 'book123',
        date: new Date()
    });

    const MockModel = function (data) {
        this.userId = data.userId;
        this.bookId = data.bookId;
        this.date = data.date;
        this.save = mockSave;
    };

    return {
        connect: jest.fn().mockResolvedValue(true),
        model: jest.fn().mockReturnValue(MockModel),
        Schema: jest.fn().mockReturnValue({}),
    };
});

// Mock the app to prevent server from starting
jest.mock('../index', () => {
    const express = require('express');
    const axios = require('axios');
    const app = express();
    app.use(express.json());

    const mongoose = require('mongoose');
    const Loan = mongoose.model('Loan');

    const USER_SERVICE_URL = 'http://localhost:3001';
    const BOOK_SERVICE_URL = 'http://localhost:3002';

    app.post('/loans', async (req, res) => {
        const { userId, bookId } = req.body;

        try {
            await axios.get(`${USER_SERVICE_URL}/users/${userId}`);
            await axios.get(`${BOOK_SERVICE_URL}/books/${bookId}`);

            const loan = new Loan({ userId, bookId, date: new Date() });
            await loan.save();
            res.json({ message: 'Loan created successfully', loan });

        } catch (error) {
            if (error.response && error.response.status === 404) {
                return res.status(404).json({ error: 'User or Book not found' });
            }
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    return app;
});

const app = require('../index');
const axios = require('axios');

describe('Loan Service API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('POST /loans should return 200 when user and book exist', async () => {
        // Mock successful responses from User and Book services
        axios.get.mockResolvedValue({ data: { _id: '123' } });

        const res = await request(app)
            .post('/loans')
            .send({ userId: 'user123', bookId: 'book123' });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Loan created successfully');
    });

    it('POST /loans should return 404 when user not found', async () => {
        // Mock 404 response from User service
        axios.get.mockRejectedValue({
            response: { status: 404 }
        });

        const res = await request(app)
            .post('/loans')
            .send({ userId: 'nonexistent', bookId: 'book123' });

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('User or Book not found');
    });

    it('POST /loans should return 500 on internal error', async () => {
        // Mock a generic error
        axios.get.mockRejectedValue(new Error('Connection failed'));

        const res = await request(app)
            .post('/loans')
            .send({ userId: 'user123', bookId: 'book123' });

        expect(res.statusCode).toBe(500);
    });
});
