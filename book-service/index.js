const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

// Connect to OWN database
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/book_db';
mongoose.connect(mongoURI).then(() => console.log('Book DB Connected'));

const BookSchema = new mongoose.Schema({ title: String, author: String });
const Book = mongoose.model('Book', BookSchema);

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

app.listen(3002, () => console.log('Book Service running on port 3002'));
