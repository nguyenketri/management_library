import { useState, useEffect, useCallback } from 'react';
import bookApi from '../api/bookApi';
import { MOCK_BOOKS } from '../constants/bookConstants';

export function useBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Lấy danh sách sách từ backend hoặc fallback sang mock
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm) params.keyword = searchTerm;
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const res = await bookApi.getAll(params);
      setBooks(res.data || []);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn('Backend unavailable, using mock data:', err.message);
      setIsBackendConnected(false);
      
      // Fallback mock filtering
      const filtered = MOCK_BOOKS.filter((b) => {
        const matchesKeyword = !searchTerm ||
          b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
        return matchesKeyword && matchesCat;
      });
      setBooks(filtered);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Thêm sách mới
  const createBook = async (bookData) => {
    if (isBackendConnected) {
      await bookApi.create(bookData);
      await fetchBooks();
    } else {
      const newBook = { ...bookData, _id: `mock-${Date.now()}` };
      setBooks((prev) => [newBook, ...prev]);
    }
  };

  // Cập nhật sách
  const updateBook = async (id, bookData) => {
    if (isBackendConnected) {
      await bookApi.update(id, bookData);
      await fetchBooks();
    } else {
      setBooks((prev) => prev.map((b) => (b._id === id ? { ...b, ...bookData } : b)));
    }
  };

  // Xóa sách
  const deleteBook = async (id) => {
    if (isBackendConnected) {
      await bookApi.delete(id);
      await fetchBooks();
    } else {
      setBooks((prev) => prev.filter((b) => b._id !== id));
    }
  };

  return {
    books,
    loading,
    error,
    isBackendConnected,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    fetchBooks,
    createBook,
    updateBook,
    deleteBook,
  };
}
