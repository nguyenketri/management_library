export const BOOK_CATEGORIES = [
  'All',
  'Công nghệ thông tin',
  'Kiến trúc phần mềm',
  'Kỹ năng lập trình',
  'Kinh tế',
  'Khoa học',
  'Văn học',
];

export const INITIAL_BOOK_FORM = {
  title: '',
  author: '',
  isbn: '',
  category: 'Công nghệ thông tin',
  publishedYear: new Date().getFullYear(),
  totalCopies: 1,
  availableCopies: 1,
  description: '',
};

export const MOCK_BOOKS = [
  {
    _id: 'demo-1',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    category: 'Công nghệ thông tin',
    publishedYear: 2008,
    totalCopies: 5,
    availableCopies: 3,
    description: 'Cuốn sách kinh điển giúp bạn viết mã nguồn sạch, dễ đọc và dễ bảo trì.'
  },
  {
    _id: 'demo-2',
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    isbn: '978-0201633610',
    category: 'Kiến trúc phần mềm',
    publishedYear: 1994,
    totalCopies: 4,
    availableCopies: 1,
    description: '23 mẫu thiết kế hướng đối tượng căn bản được áp dụng rộng rãi trong kỹ thuật phần mềm.'
  },
  {
    _id: 'demo-3',
    title: 'The Pragmatic Programmer: Your Journey To Mastery',
    author: 'David Thomas, Andrew Hunt',
    isbn: '978-0135957059',
    category: 'Kỹ năng lập trình',
    publishedYear: 2019,
    totalCopies: 6,
    availableCopies: 6,
    description: 'Hành trình từ lập trình viên nghiệp dư trở thành một kỹ sư thực thụ.'
  }
];
