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
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/loan_db';
mongoose.connect(mongoURI).then(() => console.log('Loan DB Connected'));

const LoanSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    bookId: { type: String, required: true },
    userName: String,
    bookTitle: String,
    date: { type: Date, default: Date.now }
});
const Loan = mongoose.model('Loan', LoanSchema);

// Service URLs
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL || 'http://localhost:3002';

// GET all loans
app.get('/loans', async (req, res) => {
    try {
        const loans = await Loan.find().sort({ date: -1 });
        res.json(loans);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET loan by ID
app.get('/loans/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid loan ID format' });
        }
        const loan = await Loan.findById(req.params.id);
        if (!loan) return res.status(404).json({ error: 'Loan not found' });
        res.json(loan);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST create loan (borrow book)
app.post('/loans', async (req, res) => {
    const { userId, bookId } = req.body;

    try {
        // Verify User exists
        const userRes = await axios.get(`${USER_SERVICE_URL}/users/${userId}`);
        const user = userRes.data;

        // Verify Book exists
        const bookRes = await axios.get(`${BOOK_SERVICE_URL}/books/${bookId}`);
        const book = bookRes.data;

        // Check if book is already loaned
        const existingLoan = await Loan.findOne({ bookId });
        if (existingLoan) {
            return res.status(400).json({ error: 'Book is already on loan' });
        }

        // Create Loan with user/book details
        const loan = new Loan({
            userId,
            bookId,
            userName: user.name,
            bookTitle: book.title,
            date: new Date()
        });
        await loan.save();
        res.status(201).json({ message: 'Loan created successfully', loan });

    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ error: 'User or Book not found' });
        }
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// DELETE loan (return book)
app.delete('/loans/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid loan ID format' });
        }
        const loan = await Loan.findByIdAndDelete(req.params.id);
        if (!loan) return res.status(404).json({ error: 'Loan not found' });
        res.json({ message: 'Book returned successfully' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// For testing export
if (process.env.NODE_ENV !== 'test') {
    app.listen(3003, () => console.log('Loan Service running on port 3003'));
}
module.exports = app;
