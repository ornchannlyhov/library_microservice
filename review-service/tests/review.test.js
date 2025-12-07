const request = require('supertest');

// Mock axios for inter-service calls
jest.mock('axios', () => ({
    get: jest.fn((url) => {
        if (url.includes('/users/')) {
            return Promise.resolve({ data: { _id: '123', name: 'Test User' } });
        }
        if (url.includes('/books/')) {
            return Promise.resolve({ data: { _id: '456', title: 'Test Book' } });
        }
        return Promise.reject(new Error('Not found'));
    })
}));

// Mock mongoose
jest.mock('mongoose', () => {
    const mockSave = jest.fn().mockResolvedValue({
        _id: '789',
        userId: '123',
        bookId: '456',
        userName: 'Test User',
        bookTitle: 'Test Book',
        rating: 5,
        reviewText: 'Great book!',
        createdAt: new Date()
    });

    const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
    });

    const mockFindById = jest.fn();
    const mockFindByIdAndUpdate = jest.fn();
    const mockFindByIdAndDelete = jest.fn();

    const MockModel = function (data) {
        Object.assign(this, data);
        this.save = mockSave;
    };
    MockModel.find = mockFind;
    MockModel.findById = mockFindById;
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

describe('Review Service API', () => {
    afterAll(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('POST /reviews should return 201 with valid data', async () => {
        const res = await request(app)
            .post('/reviews')
            .send({
                userId: '123',
                bookId: '456',
                rating: 5,
                reviewText: 'Excellent read!'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('rating', 5);
    });

    it('POST /reviews should return 400 for invalid rating', async () => {
        const res = await request(app)
            .post('/reviews')
            .send({
                userId: '123',
                bookId: '456',
                rating: 6, // Invalid: > 5
                reviewText: 'Test'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('GET /reviews should return 200', async () => {
        const res = await request(app).get('/reviews');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /reviews?bookId=456 should filter by bookId', async () => {
        const res = await request(app).get('/reviews?bookId=456');
        expect(res.statusCode).toBe(200);
    });

    it('GET /reviews/stats/:bookId should return stats', async () => {
        const mongoose = require('mongoose');
        const Review = mongoose.model('Review');
        
        // Mock finding reviews for stats calculation
        Review.find.mockResolvedValue([
            { rating: 5 },
            { rating: 4 },
            { rating: 5 }
        ]);

        const res = await request(app).get('/reviews/stats/456');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('averageRating');
        expect(res.body).toHaveProperty('totalReviews');
    });
});
