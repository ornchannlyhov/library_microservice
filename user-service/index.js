const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

// Connect to OWN database
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/user_db';
mongoose.connect(mongoURI).then(() => console.log('User DB Connected'));

const UserSchema = new mongoose.Schema({ name: String, email: String });
const User = mongoose.model('User', UserSchema);

// GET user details
app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (e) { res.status(500).send(e.message); }
});

// POST create user
app.post('/users', async (req, res) => {
    const user = new User(req.body);
    await user.save();
    res.json(user);
});

// For testing export
if (process.env.NODE_ENV !== 'test') {
    app.listen(3001, () => console.log('User Service running on port 3001'));
}
module.exports = app;
