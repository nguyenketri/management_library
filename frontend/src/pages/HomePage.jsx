import React, { useState, useEffect } from 'react';
import bookApi from '../api/bookApi';
import borrowApi from '../api/borrowApi';
import { INITIAL_USERS, INITIAL_BOOKS, INITIAL_BORROWS } from '../constants/libraryData';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import BooksView from '../components/BooksView';
import BorrowsView from '../components/BorrowsView';
import BookFormModal from '../components/books/BookFormModal';
import BorrowModal from '../components/BorrowModal';

export default function HomePage() {
  // 1. Quản lý trạng thái Đăng nhập (Lưu vào localStorage để không mất khi F5)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('library_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_USERS[0];
      }
    }
    return INITIAL_USERS[0]; // Mặc định là Admin để dễ test
  });

  // 2. Tab giao diện: 'books' | 'borrows'
  const [activeTab, setActiveTab] = useState('books');

  // 3. Trạng thái Auth Modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  // 4. Trạng thái Dữ liệu (Sách, Phiếu mượn)
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [borrows, setBorrows] = useState(INITIAL_BORROWS);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // Bộ lọc cho sách
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals Quản lý Sách & Mượn sách
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [quickBorrowBook, setQuickBorrowBook] = useState(null);

  // Cập nhật localStorage mỗi khi user thay đổi
  const handleUserChange = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('library_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('library_user');
    }
  };

  const handleLogout = () => {
    handleUserChange(null);
    alert('Bạn đã đăng xuất thành công.');
  };

  const openLoginModal = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthMode('register');
    setIsAuthModalOpen(true);
  };

  // Tải dữ liệu từ Backend (hoặc dùng Mock DB)
  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookRes, borrowRes] = await Promise.all([
        bookApi.getAll({
          keyword: searchTerm || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
        }),
        borrowApi.getAll(),
      ]);

      if (bookRes?.data) setBooks(bookRes.data);
      if (borrowRes?.data) setBorrows(borrowRes.data);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn('Backend chưa bật, tự động kích hoạt Mock Database:', err.message);
      setIsBackendConnected(false);

      // Lọc cục bộ khi chạy Mock
      let filteredBooks = [...INITIAL_BOOKS];
      if (searchTerm) {
        filteredBooks = filteredBooks.filter(
          (b) =>
            b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.author.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (selectedCategory !== 'All') {
        filteredBooks = filteredBooks.filter((b) => b.category === selectedCategory);
      }
      setBooks(filteredBooks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, selectedCategory]);

  // Thao tác Thêm / Sửa Sách
  const handleBookSubmit = async (formData) => {
    try {
      if (isBackendConnected) {
        if (editingBook) {
          await bookApi.update(editingBook._id, formData);
        } else {
          await bookApi.create(formData);
        }
        await fetchData();
      } else {
        if (editingBook) {
          setBooks((prev) =>
            prev.map((b) => (b._id === editingBook._id ? { ...b, ...formData } : b))
          );
        } else {
          const newB = { ...formData, _id: `bk_${Date.now()}` };
          setBooks((prev) => [newB, ...prev]);
        }
      }
      setIsBookModalOpen(false);
      alert(editingBook ? 'Cập nhật sách thành công!' : 'Thêm sách mới thành công!');
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Thao tác Xóa Sách
  const handleDeleteBook = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cuốn sách này?')) return;
    try {
      if (isBackendConnected) {
        await bookApi.delete(id);
        await fetchData();
      } else {
        setBooks((prev) => prev.filter((b) => b._id !== id));
      }
      alert('Đã xóa sách thành công!');
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Thao tác Mượn Sách
  const handleBorrowSubmit = async (borrowData) => {
    try {
      if (isBackendConnected) {
        await borrowApi.borrow(borrowData);
        await fetchData();
      } else {
        const newRecord = {
          _id: `br_${Date.now()}`,
          ...borrowData,
          borrowDate: new Date().toISOString().split('T')[0],
          returnDate: null,
          status: 'borrowed',
        };
        setBorrows((prev) => [newRecord, ...prev]);

        setBooks((prev) =>
          prev.map((b) =>
            b._id === borrowData.bookId
              ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) }
              : b
          )
        );
      }
      alert(`Đã lập phiếu mượn sách thành công cho ${borrowData.userName}!`);
    } catch (err) {
      alert('Lỗi mượn sách: ' + err.message);
    }
  };

  // Thao tác Trả Sách
  const handleReturnBook = async (borrowId) => {
    if (!window.confirm('Xác nhận độc giả đã trả sách nguyên vẹn?')) return;
    try {
      if (isBackendConnected) {
        await borrowApi.returnBook(borrowId);
        await fetchData();
      } else {
        const found = borrows.find((b) => b._id === borrowId);
        if (found) {
          const today = new Date().toISOString().split('T')[0];
          setBorrows((prev) =>
            prev.map((b) => (b._id === borrowId ? { ...b, status: 'returned', returnDate: today } : b))
          );
          setBooks((prev) =>
            prev.map((b) =>
              b._id === found.bookId
                ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) }
                : b
            )
          );
        }
      }
      alert('Trả sách thành công! Đã cộng lại 1 cuốn vào kho.');
    } catch (err) {
      alert('Lỗi trả sách: ' + err.message);
    }
  };

  const handleExtendBorrow = async (borrowId) => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập trước khi gia hạn!');
      openLoginModal();
      return;
    }

    try {
      if (isBackendConnected) {
        await borrowApi.extend(borrowId, currentUser._id);
        await fetchData();
      } else {
        setBorrows((prev) =>
          prev.map((b) =>
            b._id === borrowId && b.userId === currentUser._id
              ? { ...b, dueDate: new Date(new Date(b.dueDate).getTime() + 7 * 86400000).toISOString().split('T')[0] }
              : b
          )
        );
      }
      alert('Gia hạn sách thành công!');
    } catch (err) {
      alert('Lỗi gia hạn: ' + err.message);
    }
  };

  // Khi bấm nút Mượn nhanh ở từng Card sách
  const handleQuickBorrowClick = (book) => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập tài khoản trước khi mượn sách!');
      openLoginModal();
      return;
    }
    setQuickBorrowBook(book);
    setIsBorrowModalOpen(true);
  };

  // Thống kê nhanh
  const totalBooksCount = books.reduce((acc, b) => acc + (Number(b.totalCopies) || 0), 0);
  const availableBooksCount = books.reduce((acc, b) => acc + (Number(b.availableCopies) || 0), 0);
  const activeBorrowsCount = borrows.filter((b) => b.status === 'borrowed').length;

  return (
    <div className="bg-dark text-light min-vh-100 pb-5">
      {/* 1. Header Navbar Bootstrap tích hợp Đăng Nhập / Đăng Ký */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLogin={openLoginModal}
        onOpenRegister={openRegisterModal}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isBackendConnected={isBackendConnected}
      />

      <div className="container">
        {/* 2. Hero Banner chào mừng & vai trò (MERN reference) */}
        <div className="card bg-secondary bg-opacity-25 border-secondary text-light p-4 mb-4 rounded-4 shadow-sm">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h2 className="fw-bold mb-1">
                {currentUser
                  ? `👋 Xin chào, ${currentUser.name}!`
                  : '👋 Chào mừng bạn đến với Thư Viện Đại Học'}
              </h2>
              <p className="text-secondary mb-0">
                {currentUser ? (
                  <>
                    MSSV/Mã NV: <code>{currentUser.studentId || 'Chưa cập nhật'}</code>
                  </>
                ) : (
                  'Bạn đang ở chế độ khách vãng lai. Vui lòng đăng nhập để mượn sách.'
                )}
              </p>
            </div>

            <div className="d-flex gap-2">
              {currentUser?.role === 'admin' || currentUser?.role === 'librarian' ? (
                <button
                  className="btn btn-success"
                  onClick={() => {
                    setEditingBook(null);
                    setIsBookModalOpen(true);
                  }}
                >
                  + Thêm Sách Mới
                </button>
              ) : null}

              <button
                className="btn btn-primary"
                onClick={() => {
                  if (!currentUser) {
                    alert('Vui lòng đăng nhập để lập phiếu mượn sách!');
                    openLoginModal();
                    return;
                  }
                  setQuickBorrowBook(null);
                  setIsBorrowModalOpen(true);
                }}
              >
                ✍️ Lập Phiếu Mượn
              </button>
            </div>
          </div>
        </div>

        {/* 3. Thẻ thống kê nhanh bằng Bootstrap Grid */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card bg-dark border-secondary h-100 shadow-sm p-3">
              <span className="text-secondary small fw-semibold">Tổng đầu sách</span>
              <div className="fs-2 fw-bold text-light mt-1">{books.length}</div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card bg-dark border-secondary h-100 shadow-sm p-3">
              <span className="text-secondary small fw-semibold">Tổng số cuốn</span>
              <div className="fs-2 fw-bold text-light mt-1">{totalBooksCount}</div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card bg-dark border-secondary h-100 shadow-sm p-3">
              <span className="text-secondary small fw-semibold">Đang có sẵn trong kho</span>
              <div className="fs-2 fw-bold text-success mt-1">{availableBooksCount}</div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card bg-dark border-secondary h-100 shadow-sm p-3">
              <span className="text-secondary small fw-semibold">Sách đang được mượn</span>
              <div className="fs-2 fw-bold text-warning mt-1">{activeBorrowsCount}</div>
            </div>
          </div>
        </div>

        {/* 4. Nội dung Tab đang chọn */}
        <main>
          {activeTab === 'books' && (
            <BooksView
              books={books}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              onOpenAddModal={() => {
                if (!currentUser || currentUser.role === 'member') {
                  alert('Chỉ Admin hoặc Thủ thư mới có quyền thêm sách!');
                  return;
                }
                setEditingBook(null);
                setIsBookModalOpen(true);
              }}
              onOpenEditModal={(book) => {
                if (!currentUser || currentUser.role === 'member') {
                  alert('Chỉ Admin hoặc Thủ thư mới có quyền chỉnh sửa sách!');
                  return;
                }
                setEditingBook(book);
                setIsBookModalOpen(true);
              }}
              onDeleteBook={(id) => {
                if (!currentUser || currentUser.role === 'member') {
                  alert('Chỉ Admin hoặc Thủ thư mới có quyền xóa sách!');
                  return;
                }
                handleDeleteBook(id);
              }}
              onQuickBorrow={handleQuickBorrowClick}
              currentUser={currentUser || { role: 'guest' }}
            />
          )}

          {activeTab === 'borrows' && (
            <BorrowsView
              borrows={borrows}
              onReturnBook={handleReturnBook}
              onOpenBorrowModal={() => {
                if (!currentUser) {
                  alert('Vui lòng đăng nhập trước!');
                  openLoginModal();
                  return;
                }
                setQuickBorrowBook(null);
                setIsBorrowModalOpen(true);
              }}
              currentUser={currentUser || { role: 'guest' }}
            />
          )}

        </main>
      </div>

      {/* 5. Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleUserChange}
        initialMode={authMode}
      />

      <BookFormModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSubmit={handleBookSubmit}
        editingBook={editingBook}
      />

      {isBorrowModalOpen && (
        <BorrowModal
          isOpen={isBorrowModalOpen}
          onClose={() => setIsBorrowModalOpen(false)}
          books={books}
          onBorrowSubmit={handleBorrowSubmit}
          defaultUser={currentUser || INITIAL_USERS[2]}
          defaultBook={quickBorrowBook}
        />
      )}
    </div>
  );
}
