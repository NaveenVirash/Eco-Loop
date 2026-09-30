const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const connectDB = require('./config/db');

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
// Vercel-compatible scheduled jobs (triggered by Vercel Cron via vercel.json)
app.use('/api/cron', require('./routes/cronRoutes'));

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () =>
        console.log(`Server running on port ${PORT}`)
    );
}

module.exports = app;