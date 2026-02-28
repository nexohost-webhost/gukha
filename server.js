require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const seedAdmin = require('./config/seed');

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', require('./routes/publicRoutes'));
app.use('/admin', require('./routes/adminRoutes'));

// 404 handler
app.use((req, res) => {
    res.status(404).render('public/404');
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('public/error', { error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong' });
});

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await connectDB();
    await seedAdmin();

    app.listen(PORT, () => {
        console.log(`\n🚀 Multiverse Cloud running on http://localhost:${PORT}`);
        console.log(`📋 Admin panel: http://localhost:${PORT}/admin/login\n`);
    });
};

startServer();
