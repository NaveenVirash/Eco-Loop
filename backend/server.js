const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cron = require('node-cron');

const connectDB = require('./config/db');
const expireProducts = require('./jobs/productExpiryJob');

// Load env vars
dotenv.config();

// Connect DB
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('Checking expired products...');
    await expireProducts();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);