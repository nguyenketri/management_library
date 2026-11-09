const {
    getBorrows,
    getMyBorrows,
    requestBorrow,
    cancelRequest,
    approveRequest,
    rejectRequest,
    borrowBook,
    returnBook,
    extendBorrow,
    payFine,
} = require('../controllers/borrow.controller');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

const router = require('express').Router();

router.use(verifyToken);
router.get('/my', authorize('member'), getMyBorrows);
router.get('/', authorize('librarian'), getBorrows);
router.post('/request', authorize('member'), requestBorrow);
router.post('/', authorize('librarian'), borrowBook);
router.patch('/:id/approve', authorize('librarian'), approveRequest);
router.patch('/:id/reject', authorize('librarian'), rejectRequest);
router.delete('/:id', authorize('member'), cancelRequest);
router.put('/:id/return', authorize('librarian'), returnBook);
router.patch('/:id/extend', authorize('member'), extendBorrow);
router.patch('/:id/pay-fine', authorize('librarian'), payFine);

module.exports = router;
