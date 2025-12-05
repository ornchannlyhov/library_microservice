const request = require('supertest');

// Mock mongoose BEFORE requiring the app
jest.mock('mongoose', () => {
    const mockSave = jest.fn().mockResolvedValue({ _id: '123', title: 'Test Book', author: 'Test Author' });
    const mockFindById = jest.fn();
    const mockFind = jest.fn().mockResolvedValue([]);
    const mockFindByIdAndUpdate = jest.fn();
    const mockFindByIdAndDelete = jest.fn();

    const MockModel = function (data) {
        this.title = data.title;
        this.author = data.author;
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

describe('Book Service API', () => {
    afterAll(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('POST /books should return 201 (Created)', async () => {
        const res = await request(app)
            .post('/books')
            .send({ title: 'Clean Code', author: 'Robert Martin' });

        expect(res.statusCode).toBe(201);
    });

    it('GET /books/:id should return 404 for non-existent book', async () => {
        const mongoose = require('mongoose');
        const Book = mongoose.model('Book');
        Book.findById.mockResolvedValue(null);

        const res = await request(app)
            .get('/books/507f1f77bcf86cd799439011');

        expect(res.statusCode).toBe(404);
    });

    it('GET /books should return empty array', async () => {
        const res = await request(app).get('/books');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
