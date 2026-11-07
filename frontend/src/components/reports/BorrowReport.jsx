import React, { useState } from 'react';
import useReport from './useReport';
import { formatDate } from './reportCalculator';
import {
  BarRow,
  CategorySelect,
  DateRangeFilter,
  EmptyRow,
  EmptyText,
  FilterBar,
  FilterField,
  ReportStatus,
  SectionCard,
  StatCard,
  StatusTag,
} from './ReportParts';

// Báo cáo mượn/trả theo thời gian
export default function BorrowReport({ context }) {
  const [range, setRange] = useState({ from: '', to: '' });
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('');
  const [groupBy, setGroupBy] = useState('month');

  const { data, error, loading, source } = useReport('borrows', { ...range, category, status, groupBy }, context);

  const timelineMax = data ? Math.max(0, ...data.timeline.map((t) => Math.max(t.borrowed, t.returned))) : 0;
  const topMax = data?.topBooks.length ? data.topBooks[0].count : 0;
  const categoryMax = data?.byCategory.length ? data.byCategory[0].count : 0;

  return (
    <div>
      <FilterBar>
        <DateRangeFilter from={range.from} to={range.to} onChange={setRange} />
        <CategorySelect value={category} categories={context.categories} onChange={setCategory} />
        <FilterField label="Trạng thái">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="borrowed">Đang mượn (chưa tới hạn)</option>
            <option value="overdue">Quá hạn</option>
            <option value="returned">Đã trả</option>
          </select>
        </FilterField>
        <FilterField label="Thống kê theo">
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="month">Tháng</option>
            <option value="day">Ngày</option>
          </select>
        </FilterField>
      </FilterBar>

      <ReportStatus source={source} loading={loading} error={error} />

      {data && (
        <>
          <div className="stats-grid">
            <StatCard label="📝 Lượt mượn trong kỳ" value={data.summary.borrowed} />
            <StatCard
              label="✅ Lượt trả trong kỳ"
              value={data.summary.returned}
              hint={`${data.summary.returnedLate} lượt trả trễ hạn`}
              tone="success"
            />
            <StatCard label="📖 Phiếu chưa trả" value={data.summary.active} hint="Tại thời điểm hiện tại" tone="warning" />
            <StatCard label="⏰ Phiếu quá hạn" value={data.summary.overdue} hint="Tại thời điểm hiện tại" tone="danger" />
          </div>

          <SectionCard title={`📅 Mượn / trả theo ${data.groupBy === 'day' ? 'ngày' : 'tháng'}`}>
            {data.timeline.length === 0 ? (
              <EmptyText />
            ) : (
              data.timeline.map((point) => (
                <div key={point.period} className="mb-2">
                  <div className="small fw-semibold text-light mb-1">
                    {data.groupBy === 'day' ? formatDate(point.period) : point.period.split('-').reverse().join('/')}
                  </div>
                  <BarRow label="Mượn" value={point.borrowed} max={timelineMax} variant="primary" />
                  <BarRow label="Trả" value={point.returned} max={timelineMax} variant="success" />
                </div>
              ))
            )}
          </SectionCard>

          <div className="row g-4">
            <div className="col-lg-6">
              <SectionCard title="🔥 Sách được mượn nhiều nhất">
                {data.topBooks.length === 0 ? (
                  <EmptyText />
                ) : (
                  data.topBooks.map((book) => (
                    <BarRow key={book.bookId} label={book.bookTitle} value={book.count} max={topMax} suffix=" lượt" />
                  ))
                )}
              </SectionCard>
            </div>
            <div className="col-lg-6">
              <SectionCard title="🗂️ Lượt mượn theo thể loại">
                {data.byCategory.length === 0 ? (
                  <EmptyText />
                ) : (
                  data.byCategory.map((cat) => (
                    <BarRow
                      key={cat.category}
                      label={cat.category}
                      value={cat.count}
                      max={categoryMax}
                      suffix=" lượt"
                      variant="info"
                    />
                  ))
                )}
              </SectionCard>
            </div>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Bạn đọc</th>
                  <th>Sách</th>
                  <th>Ngày mượn</th>
                  <th>Hạn trả</th>
                  <th>Ngày trả</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <EmptyRow colSpan={6} text="Không có phiếu nào phù hợp bộ lọc." />
                ) : (
                  data.items.map((item) => (
                    <tr key={item._id}>
                      <td>{item.userName}</td>
                      <td>
                        <div>{item.bookTitle}</div>
                        <div className="small text-secondary">{item.category}</div>
                      </td>
                      <td>{formatDate(item.borrowDate)}</td>
                      <td>{formatDate(item.dueDate)}</td>
                      <td>{formatDate(item.returnDate)}</td>
                      <td>
                        <StatusTag status={item.status} />
                        {item.overdueDays > 0 && <div className="small text-danger mt-1">{item.overdueDays} ngày</div>}
                      </td>
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
