const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { connectDb } = require('./DAL/database');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/api', async (req, resp, next) => {
    try {
        resp.status(200).json({ message: 'Welcome Library Management API' });
    } catch (error) {
        next(error);
    }
});

app.use('/api', require('./routes'));

// Bắt lỗi 404 + lỗi chung (luôn đặt cuối cùng)
app.use(notFound);
app.use(errorHandler);

(async () => {
    try {
        await connectDb();
        app.listen(process.env.PORT, () => {
            console.log(`API chạy tại http://localhost:${process.env.PORT}/api`);
        });
    } catch (error) {
        console.error('Không khởi động được server: ', error.message);
        process.exit(1);
    }
})();
