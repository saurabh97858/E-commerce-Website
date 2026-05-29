const express = require('express');
const cors = require('cors');
const compression = require('compression');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

dotenv.config();

// Connect to database
connectDB();

const app = express();

// ===== MIDDLEWARE =====

// HTTP request logger (dev only)
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// CORS — allow frontend dev server and production origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ===== STATIC FILES =====
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const uploadsDir = isVercel ? '/tmp/uploads' : path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir, {
    maxAge: '1d',
    etag: true
}));

// ===== SWAGGER DOCS =====
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ===== API ROUTES =====
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Shoes Shopping API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ===== 404 HANDLER =====
app.use((req, res, next) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ===== GLOBAL ERROR HANDLER =====
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`, err.stack);
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
});

// ===== SERVER START =====
// Vercel serverless support: export the app
module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`\n🚀 Server running at http://localhost:${PORT}`);
        console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
        console.log(`🏥 Health: http://localhost:${PORT}/api/health\n`);
    });
}
