const express = require('express');
const mongoose = require('mongoose');
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
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/book_db';
mongoose.connect(mongoURI).then(() => console.log('Book DB Connected'));

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true }
});
const Book = mongoose.model('Book', BookSchema);

// GET all books
app.get('/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET book by ID
app.get('/books/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid book ID format' });
        }
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json(book);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST create book
app.post('/books', async (req, res) => {
    try {
        const book = new Book(req.body);
        await book.save();
        res.status(201).json(book);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

// PUT update book
app.put('/books/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid book ID format' });
        }
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json(book);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

// DELETE book
app.delete('/books/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid book ID format' });
        }
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json({ message: 'Book deleted successfully' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// For testing export
if (process.env.NODE_ENV !== 'test') {
    app.listen(3002, () => console.log('Book Service running on port 3002'));
}
module.exports = app;
