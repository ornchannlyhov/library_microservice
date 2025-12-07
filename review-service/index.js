const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const app = express();
app.use(express.json());

// CORS for frontend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Connect to database
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/review_db';
mongoose.connect(mongoURI).then(() => console.log('Review DB Connected'));

// Service URLs
const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const BOOK_SERVICE = process.env.BOOK_SERVICE_URL || 'http://localhost:3002';

// Review Schema
const ReviewSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    bookId: { type: String, required: true },
    userName: { type: String, required: true },
    bookTitle: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', ReviewSchema);

// GET all reviews (with optional bookId filter)
app.get('/reviews', async (req, res) => {
    try {
        const { bookId } = req.query;
        const filter = bookId ? { bookId } : {};
        const reviews = await Review.find(filter).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET review by ID
app.get('/reviews/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid review ID format' });
        }
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ error: 'Review not found' });
        res.json(review);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET rating statistics for a book
app.get('/reviews/stats/:bookId', async (req, res) => {
    try {
        const { bookId } = req.params;
        const reviews = await Review.find({ bookId });
        
        if (reviews.length === 0) {
            return res.json({ averageRating: 0, totalReviews: 0 });
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        res.json({
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            totalReviews: reviews.length
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST create review
app.post('/reviews', async (req, res) => {
    try {
        const { userId, bookId, rating, reviewText } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Validate user exists
        try {
            const userRes = await axios.get(`${USER_SERVICE}/users/${userId}`);
            req.body.userName = userRes.data.name;
        } catch (e) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Validate book exists
        try {
            const bookRes = await axios.get(`${BOOK_SERVICE}/books/${bookId}`);
            req.body.bookTitle = bookRes.data.title;
        } catch (e) {
            return res.status(400).json({ error: 'Invalid book ID' });
        }

        // Create review
        const review = new Review({
            userId,
            bookId,
            userName: req.body.userName,
            bookTitle: req.body.bookTitle,
            rating: Number(rating),
            reviewText: reviewText || '',
            createdAt: new Date()
        });

        await review.save();
        res.status(201).json(review);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// PUT update review
app.put('/reviews/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid review ID format' });
        }

        const { rating, reviewText } = req.body;

        // Validate rating if provided
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const updateData = {};
        if (rating) updateData.rating = Number(rating);
        if (reviewText !== undefined) updateData.reviewText = reviewText;

        const review = await Review.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!review) return res.status(404).json({ error: 'Review not found' });
        res.json(review);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// DELETE review
app.delete('/reviews/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid review ID format' });
        }
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ error: 'Review not found' });
        res.json({ message: 'Review deleted successfully' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// For testing export
if (process.env.NODE_ENV !== 'test') {
    app.listen(3004, () => console.log('Review Service running on port 3004'));
}
module.exports = app;
