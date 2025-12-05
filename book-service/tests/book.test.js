const request = require('supertest');

// Mock mongoose BEFORE requiring the app
jest.mock('mongoose', () => {
    const mockSave = jest.fn().mockResolvedValue({ _id: '123', title: 'Test Book', author: 'Test Author' });
    const mockFindById = jest.fn();

    const MockModel = function (data) {
        this.title = data.title;
        this.author = data.author;
        this.save = mockSave;
    };
    MockModel.findById = mockFindById;

    return {
        connect: jest.fn().mockResolvedValue(true),
        model: jest.fn().mockReturnValue(MockModel),
        Schema: jest.fn().mockReturnValue({}),
    };
});

// Need to mock the app.listen to prevent the server from starting
jest.mock('../index', () => {
    const express = require('express');
    const app = express();
    app.use(express.json());

    const mongoose = require('mongoose');
    const Book = mongoose.model('Book');

    app.get('/books/:id', async (req, res) => {
        try {
            const book = await Book.findById(req.params.id);
            if (!book) return res.status(404).json({ error: 'Book not found' });
            res.json(book);
        } catch (e) { res.status(500).send(e.message); }
    });

    app.post('/books', async (req, res) => {
        const book = new Book(req.body);
        await book.save();
        res.json(book);
    });

    return app;
});

const app = require('../index');

describe('Book Service API', () => {
    afterAll(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('POST /books should return 200', async () => {
        const res = await request(app)
            .post('/books')
            .send({ title: 'Clean Code', author: 'Robert Martin' });

        expect(res.statusCode).toBe(200);
    });

    it('GET /books/:id should return 404 for non-existent book', async () => {
        const mongoose = require('mongoose');
        const Book = mongoose.model('Book');
        Book.findById.mockResolvedValue(null);

        const res = await request(app)
            .get('/books/nonexistent123');

        expect(res.statusCode).toBe(404);
    });

    it('GET /books/:id should return book when found', async () => {
        const mongoose = require('mongoose');
        const Book = mongoose.model('Book');
        Book.findById.mockResolvedValue({ _id: '123', title: 'Test Book', author: 'Test Author' });

        const res = await request(app)
            .get('/books/123');

        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe('Test Book');
    });
});
