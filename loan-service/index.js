const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios'); // For communicating with other services
const app = express();
app.use(express.json());

// Connect to OWN database
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/loan_db';
mongoose.connect(mongoURI).then(() => console.log('Loan DB Connected'));

const LoanSchema = new mongoose.Schema({ userId: String, bookId: String, date: Date });
const Loan = mongoose.model('Loan', LoanSchema);

// URLs for other services (Environment variables for Docker)
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL || 'http://localhost:3002';

app.post('/loans', async (req, res) => {
    const { userId, bookId } = req.body;

    try {
        // 1. Verify User exists via REST API
        await axios.get(`${USER_SERVICE_URL}/users/${userId}`);

        // 2. Verify Book exists via REST API
        await axios.get(`${BOOK_SERVICE_URL}/books/${bookId}`);

        // 3. Create Loan
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

app.listen(3003, () => console.log('Loan Service running on port 3003'));
