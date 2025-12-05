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
    const mockFind = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    const mockFindOne = jest.fn().mockResolvedValue(null);
    const mockFindById = jest.fn();
    const mockFindByIdAndDelete = jest.fn();

    const MockModel = function (data) {
        this.userId = data.userId;
        this.bookId = data.bookId;
        this.date = data.date;
        this.save = mockSave;
    };
    MockModel.find = mockFind;
    MockModel.findOne = mockFindOne;
    MockModel.findById = mockFindById;
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
const axios = require('axios');

describe('Loan Service API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('POST /loans should return 201 when user and book exist', async () => {
        axios.get.mockResolvedValue({ data: { _id: '123', name: 'John' } });

        const res = await request(app)
            .post('/loans')
            .send({ userId: 'user123', bookId: 'book123' });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('Loan created successfully');
    });

    it('POST /loans should return 404 when user not found', async () => {
        axios.get.mockRejectedValue({ response: { status: 404 } });

        const res = await request(app)
            .post('/loans')
            .send({ userId: 'nonexistent', bookId: 'book123' });

        expect(res.statusCode).toBe(404);
    });

    it('GET /loans should return array', async () => {
        const res = await request(app).get('/loans');
        expect(res.statusCode).toBe(200);
    });
});
