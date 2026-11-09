const mongoose = require('mongoose');
const Borrow = require('../models/borrow.model');
const Book = require('../models/book.model');
const User = require('../models/user.model');
const Card = require('../models/card.model');

const today = () => new Date().toISOString().split('T')[0];
const FINE_PER_DAY = 5000;
const MAX_ACTIVE_BORROWS = 5;

const daysBetween = (from, to) => Math.max(0, Math.round((Date.parse(to) - Date.parse(from)) / 86400000));
const isValidDate = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const isLate = (borrow, date = today()) =>
    borrow.status !== 'returned' && borrow.dueDate && borrow.dueDate < date;
const toBorrowResponse = (borrow) => {
    const record = borrow.toObject ? borrow.toObject() : borrow;
    if (isLate(record)) {
        const lateDays = daysBetween(record.dueDate, today());
        return {
            ...record,
            status: 'overdue',
            fine: record.status === 'returned' ? record.fine : lateDays * FINE_PER_DAY,
            finePaid: false,
        };
    }
    return record;
};

const getBorrowingBlock = async (userId) => {
    const card = await Card.findOne({ userId });
    if (!card || card.currentStatus !== 'active') {
        return 'Thẻ thư viện không còn hiệu lực, vui lòng liên hệ quầy thủ thư';
    }

    const unpaidFine = await Borrow.exists({ userId, fine: { $gt: 0 }, finePaid: { $ne: true } });
    if (unpaidFine) {
        return 'Độc giả còn tiền phạt chưa nộp, không thể mượn sách mới';
    }

    const overdueBorrow = await Borrow.exists({
        userId,
        status: { $in: ['borrowed', 'overdue'] },
        dueDate: { $lt: today() },
    });
    if (overdueBorrow) {
        return 'Độc giả còn phiếu quá hạn, không thể mượn sách mới';
    }

    const activeCount = await Borrow.countDocuments({
        userId,
        status: { $in: ['pending', 'borrowed', 'overdue'] },
    });
    if (activeCount >= MAX_ACTIVE_BORROWS) {
        return `Mỗi độc giả chỉ được mượn tối đa ${MAX_ACTIVE_BORROWS} cuốn, tính cả yêu cầu đang chờ`;
    }

    return null;
};

// [GET] /api/borrows?status=borrowed|returned|overdue
exports.getBorrows = async (req, resp, next) => {
    try {
        const { status } = req.query;
        const filter = status && status !== 'All' && status !== 'overdue' ? { status } : {};

        const borrows = await Borrow.find(filter).sort({ createdAt: -1 });
        const items = borrows.map(toBorrowResponse)
            .filter((borrow) => !status || status === 'All' || borrow.status === status);
        return resp.status(200).json(items);
    } catch (error) {
        next(error);
    }
};

// [GET] /api/borrows/my - danh sách phiếu của người đang đăng nhập
exports.getMyBorrows = async (req, resp, next) => {
    try {
        const borrows = await Borrow.find({ userId: req.user.id }).sort({ createdAt: -1 });
        return resp.status(200).json(borrows.map(toBorrowResponse));
    } catch (error) {
        next(error);
    }
};

// [POST] /api/borrows/request - độc giả đặt mượn online, chưa trừ sách khỏi kho
exports.requestBorrow = async (req, resp, next) => {
    try {
        const { bookId } = req.body;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return resp.status(400).json({ error: 'Vui lòng chọn sách hợp lệ' });
        }

        const user = await User.findById(userId);
        if (!user || user.role !== 'member') {
            return resp.status(404).json({ error: 'Không tìm thấy độc giả' });
        }

        const block = await getBorrowingBlock(userId);
        if (block) {
            return resp.status(400).json({ error: block });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return resp.status(404).json({ error: 'Không tìm thấy sách' });
        }
        if (book.availableCopies < 1) {
            return resp.status(400).json({ error: `Sách "${book.title}" đã hết, không thể đặt mượn` });
        }

        const borrow = await Borrow.create({
            userId,
            userName: user.name,
            bookId,
            bookTitle: book.title,
            requestDate: today(),
            status: 'pending',
        });
        return resp.status(201).json(toBorrowResponse(borrow));
    } catch (error) {
        next(error);
    }
};

// [DELETE] /api/borrows/:id - độc giả hủy yêu cầu còn chờ
exports.cancelRequest = async (req, resp, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return resp.status(400).json({ error: `Invalid borrowId: ${id}` });
        }

        const cancelled = await Borrow.findOneAndDelete({
            _id: id,
            userId: req.user.id,
            status: 'pending',
        });
        if (!cancelled) {
            return resp.status(404).json({ error: 'Không tìm thấy yêu cầu đang chờ để hủy' });
        }
        return resp.status(200).json({ message: 'Đã hủy yêu cầu mượn' });
    } catch (error) {
        next(error);
    }
};

// [PATCH] /api/borrows/:id/approve - thủ thư duyệt khi độc giả đến nhận sách
exports.approveRequest = async (req, resp, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return resp.status(400).json({ error: `Invalid borrowId: ${id}` });
        }

        const pending = await Borrow.findOne({ _id: id, status: 'pending' });
        if (!pending) {
            return resp.status(404).json({ error: 'Không tìm thấy yêu cầu đang chờ duyệt' });
        }

        const block = await getBorrowingBlock(pending.userId);
        if (block) {
            return resp.status(400).json({ error: block });
        }

        const book = await Book.findOneAndUpdate(
            { _id: pending.bookId, availableCopies: { $gt: 0 } },
            { $inc: { availableCopies: -1 } },
            { new: true }
        );
        if (!book) {
            return resp.status(400).json({ error: 'Sách đã hết, không thể duyệt yêu cầu này' });
        }

        const borrowDate = today();
        const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        let approved;
        try {
            approved = await Borrow.findOneAndUpdate(
                { _id: id, status: 'pending' },
                {
                    $set: { status: 'borrowed', borrowDate, dueDate },
                    $unset: { rejectReason: '' },
                },
                { new: true }
            );
        } catch (error) {
            await Book.updateOne({ _id: book._id }, { $inc: { availableCopies: 1 } });
            throw error;
        }
        if (!approved) {
            await Book.updateOne({ _id: book._id }, { $inc: { availableCopies: 1 } });
            return resp.status(400).json({ error: 'Yêu cầu này đã được xử lý trước đó' });
        }

        return resp.status(200).json(toBorrowResponse(approved));
    } catch (error) {
        next(error);
    }
};

// [PATCH] /api/borrows/:id/reject - thủ thư từ chối và ghi lý do
exports.rejectRequest = async (req, resp, next) => {
    try {
        const { id } = req.params;
        const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return resp.status(400).json({ error: `Invalid borrowId: ${id}` });
        }
        if (!reason) {
            return resp.status(400).json({ error: 'Vui lòng nhập lý do từ chối' });
        }

        const rejected = await Borrow.findOneAndUpdate(
            { _id: id, status: 'pending' },
            { $set: { status: 'rejected', rejectReason: reason } },
            { new: true, runValidators: true }
        );
        if (!rejected) {
            return resp.status(404).json({ error: 'Không tìm thấy yêu cầu đang chờ duyệt' });
        }
        return resp.status(200).json(toBorrowResponse(rejected));
    } catch (error) {
        next(error);
    }
};

// [POST] /api/borrows - lập phiếu mượn, trừ 1 cuốn trong kho
exports.borrowBook = async (req, resp, next) => {
    try {
        const { userId, userName, bookId, dueDate, notes } = req.body;

        if (!userId || !bookId) {
            return resp.status(400).json({ error: 'userId and bookId are required' });
        }
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return resp.status(400).json({ error: `Invalid bookId: ${bookId}` });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return resp.status(400).json({ error: `Invalid userId: ${userId}` });
        }
        if (dueDate && (!isValidDate(dueDate) || dueDate < today())) {
            return resp.status(400).json({ error: 'Hạn trả phải là ngày hợp lệ và không được trước hôm nay' });
        }

        const user = await User.findById(userId);
        if (!user || user.role !== 'member') {
            return resp.status(404).json({ error: `Không tìm thấy độc giả với id = ${userId}` });
        }

        const block = await getBorrowingBlock(userId);
        if (block) {
            return resp.status(400).json({ error: block });
        }

        const book = await Book.findOneAndUpdate(
            { _id: bookId, availableCopies: { $gt: 0 } },
            { $inc: { availableCopies: -1 } },
            { new: true }
        );
        if (!book) {
            const existingBook = await Book.findById(bookId);
            if (!existingBook) {
                return resp.status(404).json({ error: `Book with id = ${bookId} not found` });
            }
            return resp.status(400).json({ error: `Sách "${existingBook.title}" đã hết, không thể mượn` });
        }

        let borrow;
        try {
            borrow = await Borrow.create({
                userId,
                userName: user.name || userName,
                bookId,
                bookTitle: book.title,
                borrowDate: today(),
                dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'borrowed',
                notes,
            });
        } catch (error) {
            await Book.updateOne({ _id: bookId }, { $inc: { availableCopies: 1 } });
            throw error;
        }

        return resp.status(201).json(toBorrowResponse(borrow));
    } catch (error) {
        next(error);
    }
};

// [PUT] /api/borrows/:id/return - trả sách, cộng lại 1 cuốn vào kho
exports.returnBook = async (req, resp, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return resp.status(400).json({ error: `Invalid borrowId: ${id}` });
        }

        const borrow = await Borrow.findById(id);
        if (!borrow) {
            return resp.status(404).json({ error: `Borrow with id = ${id} not found` });
        }
        if (borrow.status === 'returned') {
            return resp.status(400).json({ error: 'Cuốn sách này đã được trả trước đó' });
        }
        if (!['borrowed', 'overdue'].includes(borrow.status)) {
            return resp.status(400).json({ error: 'Chỉ có thể nhận trả sách đã được duyệt' });
        }

        const returnDate = today();
        const lateDays = borrow.dueDate && borrow.dueDate < returnDate
            ? daysBetween(borrow.dueDate, returnDate)
            : 0;
        const returnedBorrow = await Borrow.findOneAndUpdate(
            { _id: id, status: { $ne: 'returned' } },
            {
                $set: {
                    status: 'returned',
                    returnDate,
                    fine: lateDays * FINE_PER_DAY,
                    finePaid: false,
                    finePaidAt: null,
                },
            },
            { new: true }
        );
        if (!returnedBorrow) {
            return resp.status(400).json({ error: 'Cuốn sách này đã được trả trước đó' });
        }

        const book = mongoose.Types.ObjectId.isValid(returnedBorrow.bookId) ? await Book.findById(returnedBorrow.bookId) : null;
        if (book) {
            book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
            await book.save();
        }

        return resp.status(200).json(toBorrowResponse(returnedBorrow));
    } catch (error) {
        next(error);
    }
};

// [PUT] /api/borrows/:id/extend - gia hạn thêm 7 ngày, tối đa một lần
exports.extendBorrow = async (req, resp, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return resp.status(400).json({ error: `Invalid borrowId: ${id}` });
        }

        const borrow = await Borrow.findOne({
            _id: id,
            userId: req.user.id,
            status: 'borrowed',
            renewalCount: { $lt: 1 },
            dueDate: { $gte: today() },
        });
        if (!borrow) {
            return resp.status(400).json({ error: 'Phiếu không tồn tại, đã quá hạn hoặc đã được gia hạn' });
        }

        const newDueDate = new Date(`${borrow.dueDate}T00:00:00.000Z`);
        newDueDate.setUTCDate(newDueDate.getUTCDate() + 7);
        const updated = await Borrow.findOneAndUpdate(
            {
                _id: id,
                userId: req.user.id,
                status: 'borrowed',
                renewalCount: { $lt: 1 },
                dueDate: { $gte: today() },
            },
            { $set: { dueDate: newDueDate.toISOString().slice(0, 10) }, $inc: { renewalCount: 1 } },
            { new: true }
        );
        if (!updated) {
            return resp.status(400).json({ error: 'Phiếu không tồn tại, đã quá hạn hoặc đã được gia hạn' });
        }

        return resp.status(200).json(toBorrowResponse(updated));
    } catch (error) {
        next(error);
    }
};

// [PATCH] /api/borrows/:id/pay-fine - xác nhận đã thu tiền mặt tại quầy
exports.payFine = async (req, resp, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return resp.status(400).json({ error: `Invalid borrowId: ${id}` });
        }

        const borrow = await Borrow.findById(id);
        if (!borrow) {
            return resp.status(404).json({ error: `Borrow with id = ${id} not found` });
        }
        if (borrow.status !== 'returned') {
            return resp.status(400).json({ error: 'Chỉ thu tiền phạt sau khi đã nhận trả sách' });
        }
        if (borrow.fine <= 0) {
            return resp.status(400).json({ error: 'Phiếu này không có tiền phạt cần thu' });
        }
        if (borrow.finePaid) {
            return resp.status(400).json({ error: 'Tiền phạt của phiếu này đã được thu trước đó' });
        }

        borrow.finePaid = true;
        borrow.finePaidAt = today();
        await borrow.save();
        return resp.status(200).json(toBorrowResponse(borrow));
    } catch (error) {
        next(error);
    }
};
