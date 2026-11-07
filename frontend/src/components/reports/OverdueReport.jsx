import React, { useState } from 'react';
import useReport, { useDebouncedValue } from './useReport';
import { formatDate } from './reportCalculator';
import { CategorySelect, EmptyRow, FilterBar, FilterField, ReportStatus, StatCard } from './ReportParts';

// Báo cáo quá hạn: danh sách phiếu cần nhắc trả, kèm thông tin liên hệ
export default function OverdueReport({ context }) {
  const [category, setCategory] = useState('All');
  const [minDaysInput, setMinDaysInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const keyword = useDebouncedValue(keywordInput.trim());
  const minDays = useDebouncedValue(minDaysInput.trim());

  const { data, error, loading, source } = useReport('overdue', { category, keyword, minDays }, context);

  return (
    <div>
      <FilterBar>
        <CategorySelect value={category} categories={context.categories} onChange={setCategory} />
        <FilterField label="Quá hạn tối thiểu (ngày)">
          <input
            type="number"
            min="1"
            step="1"
            placeholder="1"
            value={minDaysInput}
            onChange={(e) => setMinDaysInput(e.target.value)}
            style={{ width: 130 }}
          />
        </FilterField>
        <FilterField label="Bạn đọc / tên sách">
          <input
            type="text"
            placeholder="Nhập từ khóa..."
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
          />
        </FilterField>
      </FilterBar>

      <ReportStatus source={source} loading={loading} error={error} />

      {data && (
        <>
          <div className="stats-grid">
            <StatCard label="⏰ Phiếu quá hạn" value={data.summary.count} tone="danger" />
            <StatCard label="🎓 Bạn đọc bị ảnh hưởng" value={data.summary.readersAffected} />
            <StatCard label="📈 Quá hạn lâu nhất" value={`${data.summary.maxDays} ngày`} tone="warning" />
            <StatCard label="📊 Trung bình" value={`${data.summary.avgDays} ngày`} hint={`Tính đến ${formatDate(data.today)}`} />
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Bạn đọc</th>
                  <th>Liên hệ</th>
                  <th>Sách</th>
                  <th>Ngày mượn</th>
                  <th>Hạn trả</th>
                  <th>Quá hạn</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <EmptyRow colSpan={6} text="Không có phiếu quá hạn nào phù hợp bộ lọc." />
                ) : (
                  data.items.map((item) => (
                    <tr key={item._id}>
                      <td className="fw-semibold">{item.userName}</td>
                      <td>
                        <div className="small">{item.userEmail || '-'}</div>
                        <div className="small text-secondary">{item.userPhone || '-'}</div>
                      </td>
                      <td>
                        <div>{item.bookTitle}</div>
                        <div className="small text-secondary">{item.category}</div>
                      </td>
                      <td>{formatDate(item.borrowDate)}</td>
                      <td>{formatDate(item.dueDate)}</td>
                      <td className="text-danger fw-semibold">{item.overdueDays} ngày</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
