const DAY_IN_MS = 24 * 60 * 60 * 1000;

const toDateString = (value) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
};

export const getOverdueDays = (dueDate, endDate = new Date()) => {
  const due = toDateString(dueDate);
  const end = toDateString(endDate);
  if (!due || !end) return 0;

  const dueTime = Date.parse(`${due}T00:00:00Z`);
  const endTime = Date.parse(`${end}T00:00:00Z`);
  return Math.max(0, Math.floor((endTime - dueTime) / DAY_IN_MS));
};

export const isOverdue = (dueDate, today = new Date()) => {
  const due = toDateString(dueDate);
  const current = toDateString(today);
  return Boolean(due && current && due < current);
};

export const formatBorrowDate = (value) => {
  const date = toDateString(value);
  if (!date) return '—';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
};

export const addDaysToDate = (dateString, days) => {
  const date = toDateString(dateString);
  if (!date) throw new Error('Ngày hạn trả không hợp lệ!');

  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
};
