// DỮ LIỆU MẪU CHỈ ĐỂ XEM GIAO DIỆN - chưa nối API.
// Khi nối API: thay bằng dữ liệu gọi từ src/api/*.js rồi xóa dần file này.

// Ngày "hôm nay" cố định cho dữ liệu mẫu (tính số ngày còn lại / quá hạn)
export const TODAY = '2026-11-08';

export const ROLE_LABELS = {
  admin: { label: 'Quản trị', color: 'coral' },
  librarian: { label: 'Thủ thư', color: 'sky' },
  member: { label: 'Độc giả', color: 'lime' },
  manager: { label: 'Quản lý', color: 'lilac' },
};

export const BORROW_STATUS = {
  borrowed: { label: 'Đang mượn', color: 'sky' },
  returned: { label: 'Đã trả', color: 'mint' },
  overdue: { label: 'Quá hạn', color: 'coral' },
};

export const CATEGORIES = [
  { _id: 'c1', name: 'Công nghệ thông tin', description: 'Lập trình, mạng, cơ sở dữ liệu', bookCount: 2 },
  { _id: 'c2', name: 'Kiến trúc phần mềm', description: 'Design pattern, kiến trúc hệ thống', bookCount: 1 },
  { _id: 'c3', name: 'Kỹ năng lập trình', description: 'Clean code, kỹ năng nghề', bookCount: 1 },
  { _id: 'c4', name: 'Kinh tế', description: 'Kinh tế học, tài chính', bookCount: 1 },
  { _id: 'c5', name: 'Văn học', description: 'Tiểu thuyết, truyện ngắn', bookCount: 1 },
];

export const BOOKS = [
  { _id: 'b1', publisher: 'Prentice Hall', pages: 431, title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', category: 'Công nghệ thông tin', publishedYear: 2008, totalCopies: 5, availableCopies: 3, color: '#d8ff5c', rating: 4.8, description: 'Cuốn sách kinh điển giúp bạn viết mã nguồn sạch, dễ đọc và dễ bảo trì.' },
  { _id: 'b2', publisher: 'Addison-Wesley', pages: 395, title: 'Design Patterns', author: 'Erich Gamma và cộng sự', isbn: '978-0201633610', category: 'Kiến trúc phần mềm', publishedYear: 1994, totalCopies: 4, availableCopies: 2, color: '#7fb2ff', rating: 4.6, description: '23 mẫu thiết kế kinh điển giải quyết các bài toán hướng đối tượng.' },
  { _id: 'b3', publisher: 'Addison-Wesley', pages: 352, title: 'The Pragmatic Programmer', author: 'David Thomas, Andrew Hunt', isbn: '978-0135957059', category: 'Kỹ năng lập trình', publishedYear: 2019, totalCopies: 6, availableCopies: 6, color: '#f26b4f', rating: 4.7, description: 'Hành trình từ lập trình viên nghiệp dư trở thành kỹ sư thực thụ.' },
  { _id: 'b4', publisher: 'Packt', pages: 760, title: 'Node.js Web Development', author: 'David Herron', isbn: '978-1838987381', category: 'Công nghệ thông tin', publishedYear: 2020, totalCopies: 3, availableCopies: 0, color: '#ffc857', rating: 4.2, description: 'Phát triển server-side với Node.js, Express và MongoDB.' },
  { _id: 'b5', publisher: 'NXB Hội Nhà Văn', pages: 228, title: 'Nhà Giả Kim', author: 'Paulo Coelho', isbn: '978-0062315007', category: 'Văn học', publishedYear: 1988, totalCopies: 8, availableCopies: 7, color: '#c4b5fd', rating: 4.9, description: 'Hành trình theo đuổi ước mơ của chàng chăn cừu Santiago.' },
  { _id: 'b6', publisher: 'NXB Trẻ', pages: 320, title: 'Kinh Tế Học Hài Hước', author: 'Steven D. Levitt', isbn: '978-0060731335', category: 'Kinh tế', publishedYear: 2005, totalCopies: 4, availableCopies: 4, color: '#7ee0b5', rating: 4.3, description: 'Góc nhìn kinh tế học thú vị về những hiện tượng đời thường.' },
];

export const USERS = [
  { _id: 'u1', name: 'Nguyễn Văn Quản Trị', email: 'admin@library.edu.vn', role: 'admin', phone: '0901234567', studentId: 'ADMIN-01', activeBorrows: 0 },
  { _id: 'u2', name: 'Trần Thị Thủ Thư', email: 'librarian@library.edu.vn', role: 'librarian', phone: '0912345678', studentId: 'LIB-01', activeBorrows: 0 },
  { _id: 'u3', name: 'Lê Hoàng Nam', email: 'namlh@fpt.edu.vn', role: 'member', phone: '0983112233', studentId: 'SE170001', activeBorrows: 2 },
  { _id: 'u4', name: 'Phạm Minh Anh', email: 'anhpm@fpt.edu.vn', role: 'member', phone: '0984223344', studentId: 'SE170002', activeBorrows: 1 },
  { _id: 'u5', name: 'Đặng Tuấn Kiệt', email: 'kietdt@fpt.edu.vn', role: 'member', phone: '0985334455', studentId: 'SE170003', activeBorrows: 0 },
  { _id: 'u6', name: 'Võ Thị Quản Lý', email: 'manager@library.edu.vn', role: 'manager', phone: '0906789012', studentId: 'MGR-01', activeBorrows: 0 },
];

export const BORROWS = [
  { _id: 'r1', userName: 'Lê Hoàng Nam', bookId: 'b1', bookTitle: 'Clean Code', borrowDate: '2026-10-20', dueDate: '2026-11-03', returnDate: null, status: 'overdue' },
  { _id: 'r2', userName: 'Phạm Minh Anh', bookId: 'b2', bookTitle: 'Design Patterns', borrowDate: '2026-10-28', dueDate: '2026-11-11', returnDate: null, status: 'borrowed' },
  { _id: 'r3', userName: 'Đặng Tuấn Kiệt', bookId: 'b5', bookTitle: 'Nhà Giả Kim', borrowDate: '2026-10-01', dueDate: '2026-10-15', returnDate: '2026-10-18', status: 'returned', fine: 15000, finePaid: false },
  { _id: 'r4', userName: 'Lê Hoàng Nam', bookId: 'b4', bookTitle: 'Node.js Web Development', borrowDate: '2026-11-01', dueDate: '2026-11-15', returnDate: null, status: 'borrowed' },
  { _id: 'r5', userName: 'Lê Hoàng Nam', bookId: 'b3', bookTitle: 'The Pragmatic Programmer', borrowDate: '2026-09-02', dueDate: '2026-09-16', returnDate: '2026-09-19', status: 'returned', fine: 15000, finePaid: true, finePaidAt: '2026-09-19' },
];

export const CARDS = [
  { _id: 'k1', cardCode: 'LIB-2026-0003', userName: 'Lê Hoàng Nam', studentId: 'SE170001', issueDate: '2026-02-10', expiryDate: '2027-02-10', status: 'active' },
  { _id: 'k2', cardCode: 'LIB-2026-0004', userName: 'Phạm Minh Anh', studentId: 'SE170002', issueDate: '2026-02-20', expiryDate: '2027-02-20', status: 'active' },
  { _id: 'k3', cardCode: 'LIB-2025-0019', userName: 'Đặng Tuấn Kiệt', studentId: 'SE170003', issueDate: '2025-03-01', expiryDate: '2026-03-01', status: 'expired' },
];

export const CARD_STATUS = {
  active: { label: 'Còn hiệu lực', color: 'lime' },
  locked: { label: 'Đã khóa', color: 'coral' },
  expired: { label: 'Hết hạn', color: 'muted' },
};

// Tiền phạt trả trễ (nộp tiền mặt tại quầy)
export const FINE_PER_DAY = 5000;

export const FINE_STATUS = {
  paid: { label: 'Đã nộp', color: 'mint' },
  unpaid: { label: 'Chưa nộp', color: 'coral' },
};

export const USER_STATUS = {
  active: { label: 'Hoạt động', color: 'mint' },
  locked: { label: 'Đã khóa', color: 'coral' },
};

export const REVIEWS = [
  { _id: 'v1', userName: 'Lê Hoàng Nam', rating: 5, comment: 'Sách rất hay, đọc xong code sạch hẳn!', createdAt: '2026-10-30' },
  { _id: 'v2', userName: 'Phạm Minh Anh', rating: 4, comment: 'Nội dung tốt, hơi khó với người mới.', createdAt: '2026-10-12' },
];

export const MONTHLY_BORROWS = [
  { month: 'T6', count: 18 },
  { month: 'T7', count: 25 },
  { month: 'T8', count: 22 },
  { month: 'T9', count: 34 },
  { month: 'T10', count: 41 },
  { month: 'T11', count: 12 },
];
