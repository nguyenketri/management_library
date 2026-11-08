const {
    getDashboard,
    getBookReport,
    getReaderReport,
    getBorrowReport,
    getOverdueReport,
} = require('../controllers/report.controller');

const router = require('express').Router();

router.get('/dashboard', getDashboard);
router.get('/books', getBookReport);
router.get('/readers', getReaderReport);
router.get('/borrows', getBorrowReport);
router.get('/overdue', getOverdueReport);

module.exports = router;
