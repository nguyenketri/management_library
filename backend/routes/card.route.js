const { getCards, getCardById, createCard, updateCardStatus } = require('../controllers/card.controller');

const router = require('express').Router();

router.get('/', getCards);
router.get('/:id', getCardById);
router.post('/', createCard);
router.patch('/:id/status', updateCardStatus);

module.exports = router;
