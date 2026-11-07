import { useEffect, useState } from 'react';
import reportApi from '../../api/reportApi';
import { INITIAL_USERS } from '../../constants/libraryData';
import { buildReport, validateReportQuery } from './reportCalculator';

const API_BY_TYPE = {
  dashboard: reportApi.getDashboard,
  books: reportApi.getBooks,
  readers: reportApi.getReaders,
  borrows: reportApi.getBorrows,
  overdue: reportApi.getOverdue,
};

// Lỗi mất kết nối (backend tắt giữa chừng) -> chuyển sang tính offline
const isNetworkError = (error) => /network error|timeout/i.test(error?.message || '');

const getValidationError = (type, query) => {
  try {
    validateReportQuery(type, query);
    return null;
  } catch (error) {
    return error.message;
  }
};

// Lấy dữ liệu báo cáo: gọi API khi có backend, ngược lại tự tính từ dữ liệu local.
// Trả về { data, error, loading, source: 'server' | 'offline' }
export default function useReport(type, query, { isBackendConnected, books, borrows }) {
  const queryKey = JSON.stringify(query);
  const requestKey = `${type}|${queryKey}`;
  const validationError = getValidationError(type, query);
  const [remote, setRemote] = useState({ key: null, data: null, error: null, offline: false });

  useEffect(() => {
    if (!isBackendConnected || validationError) return undefined;

    // Bỏ qua kết quả của các lần gọi cũ khi bộ lọc đã đổi
    let cancelled = false;
    const key = `${type}|${queryKey}`;
    API_BY_TYPE[type](JSON.parse(queryKey)).then(
      (res) => {
        if (!cancelled) setRemote({ key, data: res.data, error: null, offline: false });
      },
      (err) => {
        if (!cancelled) setRemote({ key, data: null, error: err.message, offline: isNetworkError(err) });
      }
    );

    return () => {
      cancelled = true;
    };
  }, [type, queryKey, isBackendConnected, validationError]);

  const useOffline = !isBackendConnected || (remote.key === requestKey && remote.offline);
  const source = useOffline ? 'offline' : 'server';

  if (validationError) {
    return { data: null, error: validationError, loading: false, source };
  }

  if (useOffline) {
    try {
      const data = buildReport(type, query, { books, users: INITIAL_USERS, borrows });
      return { data, error: null, loading: false, source };
    } catch (error) {
      return { data: null, error: error.message, loading: false, source };
    }
  }

  if (remote.key === requestKey) {
    return { data: remote.data, error: remote.error, loading: false, source };
  }

  // Đang tải: giữ tạm dữ liệu cũ của cùng loại báo cáo để giao diện không bị nháy
  const sameType = remote.key && remote.key.startsWith(`${type}|`);
  return { data: sameType ? remote.data : null, error: null, loading: true, source };
}

// Trì hoãn giá trị (dùng cho ô tìm kiếm, tránh gọi API mỗi lần gõ phím)
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
