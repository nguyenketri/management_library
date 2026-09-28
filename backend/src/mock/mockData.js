// Dữ liệu mẫu giả lập (Mock Database) dùng khi chưa kết nối MongoDB thật
const initialUsers = [
  {
    _id: 'usr_001',
    name: 'Nguyễn Văn Quản Trị',
    email: 'admin@library.edu.vn',
    password: 'password123',
    role: 'admin', // Quản trị viên cao nhất
    phone: '0901234567',
    studentId: 'ADMIN-01',
    createdAt: new Date('2026-01-15'),
  },
  {
    _id: 'usr_002',
    name: 'Trần Thị Thủ Thư',
    email: 'librarian@library.edu.vn',
    password: 'password123',
    role: 'librarian', // Thủ thư phụ trách mượn trả
    phone: '0912345678',
    studentId: 'LIB-01',
    createdAt: new Date('2026-02-01'),
  },
  {
    _id: 'usr_003',
    name: 'Lê Hoàng Nam (Độc giả 1)',
    email: 'namlh@fpt.edu.vn',
    password: 'password123',
    role: 'member', // Độc giả / Sinh viên 1
    phone: '0983112233',
    studentId: 'SE170001',
    createdAt: new Date('2026-02-10'),
  },
  {
    _id: 'usr_004',
    name: 'Phạm Minh Anh (Độc giả 2)',
    email: 'anhpm@fpt.edu.vn',
    password: 'password123',
    role: 'member', // Độc giả / Sinh viên 2
    phone: '0984223344',
    studentId: 'SE170002',
    createdAt: new Date('2026-02-20'),
  },
  {
    _id: 'usr_005',
    name: 'Đặng Tuấn Kiệt (Độc giả 3)',
    email: 'kietdt@fpt.edu.vn',
    password: 'password123',
    role: 'member', // Độc giả / Sinh viên 3
    phone: '0985334455',
    studentId: 'SE170003',
    createdAt: new Date('2026-03-01'),
  }
];

const initialBooks = [
  {
    _id: 'bk_001',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    category: 'Công nghệ thông tin',
    publishedYear: 2008,
    totalCopies: 5,
    availableCopies: 3,
    description: 'Cuốn sách kinh điển giúp bạn viết mã nguồn sạch, dễ đọc và dễ bảo trì.',
    createdAt: new Date('2026-01-10'),
  },
  {
    _id: 'bk_002',
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    isbn: '978-0201633610',
    category: 'Kiến trúc phần mềm',
    publishedYear: 1994,
    totalCopies: 4,
    availableCopies: 2,
    description: '23 mẫu thiết kế kinh điển giải quyết các bài toán hướng đối tượng.',
    createdAt: new Date('2026-01-12'),
  },
  {
    _id: 'bk_003',
    title: 'The Pragmatic Programmer: Your Journey To Mastery',
    author: 'David Thomas, Andrew Hunt',
    isbn: '978-0135957059',
    category: 'Kỹ năng lập trình',
    publishedYear: 2019,
    totalCopies: 6,
    availableCopies: 6,
    description: 'Hành trình từ lập trình viên nghiệp dư trở thành kỹ sư thực thụ.',
    createdAt: new Date('2026-01-20'),
  },
  {
    _id: 'bk_004',
    title: 'Node.js Web Development: Server-side development with Node and Express',
    author: 'David Herron',
    isbn: '978-1838987381',
    category: 'Công nghệ thông tin',
    publishedYear: 2020,
    totalCopies: 5,
    availableCopies: 4,
    description: 'Tài liệu hướng dẫn phát triển ứng dụng Server-side toàn diện với Node.js.',
    createdAt: new Date('2026-02-05'),
  },
  {
    _id: 'bk_005',
    title: 'Nhà Giả Kim (The Alchemist)',
    author: 'Paulo Coelho',
    isbn: '978-0062315007',
    category: 'Văn học',
    publishedYear: 1988,
    totalCopies: 8,
    availableCopies: 5,
    description: 'Tiểu thuyết triết lý sâu sắc về việc theo đuổi ước mơ và vận mệnh.',
    createdAt: new Date('2026-02-15'),
  },
  {
    _id: 'bk_006',
    title: 'Kinh Tế Học Hài Hước (Freakonomics)',
    author: 'Steven D. Levitt, Stephen J. Dubner',
    isbn: '978-0060731335',
    category: 'Kinh tế',
    publishedYear: 2005,
    totalCopies: 3,
    availableCopies: 3,
    description: 'Khám phá mặt khuất của thế giới dưới góc nhìn kinh tế học độc đáo.',
    createdAt: new Date('2026-02-25'),
  }
];

const initialBorrows = [
  {
    _id: 'br_001',
    userId: 'usr_003',
    userName: 'Lê Hoàng Nam (Độc giả 1)',
    bookId: 'bk_001',
    bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    borrowDate: '2026-03-10',
    dueDate: '2026-03-24',
    returnDate: null,
    status: 'borrowed', // Đang mượn
    notes: 'Mượn phục vụ làm đồ án môn SDN302',
    createdAt: new Date('2026-03-10'),
  },
  {
    _id: 'br_002',
    userId: 'usr_004',
    userName: 'Phạm Minh Anh (Độc giả 2)',
    bookId: 'bk_002',
    bookTitle: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    borrowDate: '2026-03-12',
    dueDate: '2026-03-26',
    returnDate: null,
    status: 'borrowed', // Đang mượn
    notes: 'Mượn ôn tập kiến trúc phần mềm',
    createdAt: new Date('2026-03-12'),
  },
  {
    _id: 'br_003',
    userId: 'usr_005',
    userName: 'Đặng Tuấn Kiệt (Độc giả 3)',
    bookId: 'bk_005',
    bookTitle: 'Nhà Giả Kim (The Alchemist)',
    borrowDate: '2026-03-01',
    dueDate: '2026-03-15',
    returnDate: '2026-03-14',
    status: 'returned', // Đã trả đúng hạn
    notes: 'Đã trả sách nguyên vẹn',
    createdAt: new Date('2026-03-01'),
  },
  {
    _id: 'br_004',
    userId: 'usr_003',
    userName: 'Lê Hoàng Nam (Độc giả 1)',
    bookId: 'bk_004',
    bookTitle: 'Node.js Web Development: Server-side development with Node and Express',
    borrowDate: '2026-03-15',
    dueDate: '2026-03-29',
    returnDate: null,
    status: 'borrowed', // Đang mượn
    notes: 'Mượn tài liệu thực hành Express',
    createdAt: new Date('2026-03-15'),
  }
];

// Khởi tạo bộ nhớ In-Memory mô phỏng DB
let mockDB = {
  users: [...initialUsers],
  books: [...initialBooks],
  borrows: [...initialBorrows],
};

module.exports = {
  mockDB,
  initialUsers,
  initialBooks,
  initialBorrows,
};
