const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cron = require('node-cron');

const connectDB = require('./config/db');
const expireProducts = require('./jobs/productExpiryJob');
const resetWeeklyPoints = require('./jobs/weeklyResetJob');

// Load env vars
dotenv.config();

// Connect DB
connectDB();

const app = express();

// Middleware
app.use(cors());

app.use(express.json());
// Note: /uploads static route removed — images are stored on Cloudinary and served via their HTTPS URLs.


// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));

// Run every day at midnight — mark expired listings
cron.schedule('0 0 * * *', async () => {
    console.log('Checking expired products...');
    await expireProducts();
});

// Run every Monday at midnight — reset weekly leaderboard points
cron.schedule('0 0 * * 1', async () => {
    console.log('Resetting weekly leaderboard points...');
    await resetWeeklyPoints();
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () =>
        console.log(`Server running on port ${PORT}`)
    );
}

module.exports = app;