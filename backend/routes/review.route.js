const { getReviews, createReview, deleteReview } = require('../controllers/review.controller');

const router = require('express').Router();

router.get('/', getReviews);
router.post('/', createReview);
router.delete('/:id', deleteReview);

module.exports = router;
