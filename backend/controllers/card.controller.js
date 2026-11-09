// Người phụ trách: Người 1
const mongoose = require('mongoose');
const Card = require('../models/card.model');
const User = require('../models/user.model');

const USER_FIELDS = 'name email studentId phone';

// Cộng thêm 1 năm cho một ngày
const addOneYear = (date) => {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + 1);
    return result;
};

// Sinh mã thẻ không trùng: LIB-2026-0001, LIB-2026-0002, ...
const generateCardCode = async () => {
    const prefix = `LIB-${new Date().getFullYear()}-`;
    let number = await Card.countDocuments({ cardCode: { $regex: `^${prefix}` } });
    let code;
    do {
        number += 1;
        code = prefix + String(number).padStart(4, '0');
    } while (await Card.exists({ cardCode: code }));
    return code;
};

// [GET] /api/cards?status=active&keyword=nam (librarian)
exports.getCards = async (req, resp, next) => {
    try {
        const { status, keyword } = req.query;

        const cards = await Card.find().populate('userId', USER_FIELDS).sort({ createdAt: -1 });

        let result = cards;
        if (status && status !== 'all') {
            result = result.filter((c) => c.currentStatus === status);
        }
        if (keyword && keyword.trim() !== '') {
            const kw = keyword.trim().toLowerCase();
            result = result.filter((c) =>
                [c.cardCode, c.userId?.name, c.userId?.studentId].some((v) => v && v.toLowerCase().includes(kw))
            );
        }

        return resp.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// [GET] /api/cards/me - thẻ của người đang đăng nhập
exports.getMyCard = async (req, resp, next) => {
    try {
        const card = await Card.findOne({ userId: req.user.id }).populate('userId', USER_FIELDS);
        if (!card) {
            return resp.status(404).json({ error: 'Bạn chưa có thẻ thư viện' });
        }

        return resp.status(200).json(card);
    } catch (error) {
        next(error);
    }
};

// [GET] /api/cards/:id (librarian)
exports.getCardById = async (req, resp, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return resp.status(400).json({ error: `Invalid cardId: ${id}` });
        }

        const card = await Card.findById(id).populate('userId', USER_FIELDS);
        if (!card) {
            return resp.status(404).json({ error: 'Không tìm thấy thẻ' });
        }

        return resp.status(200).json(card);
    } catch (error) {
        next(error);
    }
};

// [POST] /api/cards (librarian) - cấp thẻ. Body: { userId }
exports.createCard = async (req, resp, next) => {
    try {
        const { userId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return resp.status(400).json({ error: 'Vui lòng chọn độc giả hợp lệ' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return resp.status(404).json({ error: 'Không tìm thấy độc giả' });
        }
        if (user.role !== 'member') {
            return resp.status(400).json({ error: 'Chỉ cấp thẻ cho độc giả' });
        }

        const existed = await Card.findOne({ userId });
        if (existed) {
            return resp.status(400).json({ error: `${user.name} đã có thẻ ${existed.cardCode}` });
        }

        const issueDate = new Date();
        const card = await Card.create({
            userId,
            cardCode: await generateCardCode(),
            issueDate,
            expiryDate: addOneYear(issueDate),
            status: 'active',
        });

        await card.populate('userId', USER_FIELDS);
        return resp.status(201).json(card);
    } catch (error) {
        next(error);
    }
};

// [PATCH] /api/cards/:id/status (librarian) - khóa / mở thẻ. Body: { status: 'active' | 'locked' }
exports.updateCardStatus = async (req, resp, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return resp.status(400).json({ error: `Invalid cardId: ${id}` });
        }
        if (status !== 'active' && status !== 'locked') {
            return resp.status(400).json({ error: `Trạng thái không hợp lệ: ${status}` });
        }

        const card = await Card.findById(id).populate('userId', USER_FIELDS);
        if (!card) {
            return resp.status(404).json({ error: 'Không tìm thấy thẻ' });
        }

        card.status = status;
        await card.save();

        return resp.status(200).json(card);
    } catch (error) {
        next(error);
    }
};

// [PATCH] /api/cards/:id/renew (librarian) - gia hạn thêm 1 năm
exports.renewCard = async (req, resp, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return resp.status(400).json({ error: `Invalid cardId: ${id}` });
        }

        const card = await Card.findById(id).populate('userId', USER_FIELDS);
        if (!card) {
            return resp.status(404).json({ error: 'Không tìm thấy thẻ' });
        }
        if (card.status === 'locked') {
            return resp.status(400).json({ error: 'Thẻ đang bị khóa, hãy mở khóa trước khi gia hạn' });
        }

        // Còn hạn: cộng tiếp từ ngày hết hạn · Đã hết hạn: tính 1 năm từ hôm nay
        const from = card.expiryDate > new Date() ? card.expiryDate : new Date();
        card.expiryDate = addOneYear(from);
        card.status = 'active';
        await card.save();

        return resp.status(200).json(card);
    } catch (error) {
        next(error);
    }
};
