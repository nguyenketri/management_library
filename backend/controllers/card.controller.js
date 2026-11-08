// Người phụ trách: Người 1
// const mongoose = require('mongoose');
// const Card = require('../models/card.model');

// [GET] /api/cards - Lấy danh sách thẻ
exports.getCards = async (req, resp, next) => {
    try {
        // TODO
        return resp.status(501).json({ error: 'Not implemented' });
    } catch (error) {
        next(error);
    }
};

// [GET] /api/cards/:id - Chi tiết thẻ
exports.getCardById = async (req, resp, next) => {
    try {
        // TODO
        return resp.status(501).json({ error: 'Not implemented' });
    } catch (error) {
        next(error);
    }
};

// [POST] /api/cards - Cấp thẻ cho độc giả
exports.createCard = async (req, resp, next) => {
    try {
        // TODO
        return resp.status(501).json({ error: 'Not implemented' });
    } catch (error) {
        next(error);
    }
};

// [PATCH] /api/cards/:id/status - Khóa / mở / gia hạn thẻ
exports.updateCardStatus = async (req, resp, next) => {
    try {
        // TODO
        return resp.status(501).json({ error: 'Not implemented' });
    } catch (error) {
        next(error);
    }
};
