import React, { useState } from 'react';
import useReport, { useDebouncedValue } from './useReport';
import { BarRow, CategorySelect, EmptyRow, EmptyText, FilterBar, FilterField, ReportStatus, SectionCard, StatCard } from './ReportParts';

// Báo cáo sách: tồn kho, đang mượn, theo thể loại
export default function BookReport({ context }) {
  const [category, setCategory] = useState('All');
  const [availability, setAvailability] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const keyword = useDebouncedValue(keywordInput.trim());

  const { data, error, loading, source } = useReport('books', { category, keyword, availability }, context);

  return (
    <div>
      <FilterBar>
        <CategorySelect value={category} categories={context.categories} onChange={setCategory} />
        <FilterField label="Tình trạng">
          <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="available">Còn sách</option>
            <option value="out">Đã hết</option>
            <option value="borrowed">Đang được mượn</option>
          </select>
        </FilterField>
        <FilterField label="Tên sách / tác giả">
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
            <StatCard label="📚 Đầu sách" value={data.summary.titles} />
            <StatCard label="📦 Tổng số bản" value={data.summary.totalCopies} />
            <StatCard label="✅ Bản còn trong kho" value={data.summary.availableCopies} tone="success" />
            <StatCard label="📖 Bản đang được mượn" value={data.summary.borrowedCopies} tone="warning" />
            <StatCard label="🚫 Đầu sách đã hết" value={data.summary.outOfStockTitles} tone="danger" />
          </div>

          <SectionCard title="🗂️ Tỉ lệ đang được mượn theo thể loại">
            {data.byCategory.length === 0 ? (
              <EmptyText />
            ) : (
              data.byCategory.map((cat) => (
                <BarRow
                  key={cat.category}
                  label={`${cat.category} (${cat.titles} đầu sách)`}
                  value={cat.borrowedCopies}
                  max={cat.totalCopies}
                  suffix={` / ${cat.totalCopies} bản`}
                  variant="warning"
                />
              ))
            )}
          </SectionCard>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tên sách</th>
                  <th>Thể loại</th>
                  <th>Còn / Tổng</th>
                  <th>Đang mượn</th>
                  <th>Phiếu chưa trả</th>
                  <th>Tổng lượt mượn</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <EmptyRow colSpan={6} text="Không có sách nào phù hợp bộ lọc." />
                ) : (
                  data.items.map((book) => (
                    <tr key={book._id}>
                      <td>
                        <div className="fw-semibold">{book.title}</div>
                        <div className="small text-secondary">{book.author}</div>
                      </td>
                      <td>{book.category}</td>
                      <td className={book.availableCopies <= 0 ? 'text-danger fw-semibold' : ''}>
                        {book.availableCopies} / {book.totalCopies}
                      </td>
                      <td>{book.borrowedCopies}</td>
                      <td>{book.activeLoans}</td>
                      <td>{book.timesBorrowed}</td>
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
