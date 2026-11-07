import React, { useState } from 'react';
import useReport from './useReport';
import { formatDate } from './reportCalculator';
import { DateRangeFilter, EmptyRow, EmptyText, FilterBar, ReportStatus, SectionCard, StatCard, BarRow } from './ReportParts';

// Tổng quan hoạt động thư viện
export default function DashboardReport({ context }) {
  const [range, setRange] = useState({ from: '', to: '' });
  const { data, error, loading, source } = useReport('dashboard', range, context);

  const topMax = data?.topBooks.length ? data.topBooks[0].count : 0;

  return (
    <div>
      <FilterBar>
        <DateRangeFilter from={range.from} to={range.to} onChange={setRange} />
        <span className="small text-secondary align-self-end">
          Khoảng ngày áp dụng cho lượt mượn/trả và top sách. Số liệu kho và quá hạn tính tại thời điểm hiện tại.
        </span>
      </FilterBar>

      <ReportStatus source={source} loading={loading} error={error} />

      {data && (
        <>
          <div className="stats-grid">
            <StatCard label="📚 Đầu sách" value={data.books.titles} hint={`${data.books.outOfStockTitles} đầu sách đã hết`} />
            <StatCard
              label="📦 Bản sách còn / tổng"
              value={`${data.books.availableCopies} / ${data.books.totalCopies}`}
              hint={`${data.books.borrowedCopies} bản đang được mượn`}
              tone="info"
            />
            <StatCard
              label="🎓 Bạn đọc"
              value={data.readers.total}
              hint={`${data.readers.withActiveLoans} người đang mượn sách`}
            />
            <StatCard
              label="📝 Lượt mượn / trả trong kỳ"
              value={`${data.borrows.borrowedInPeriod} / ${data.borrows.returnedInPeriod}`}
              hint={`${data.borrows.active} phiếu chưa trả`}
              tone="warning"
            />
            <StatCard label="⏰ Phiếu quá hạn" value={data.borrows.overdue} hint={`Tính đến ${formatDate(data.today)}`} tone="danger" />
          </div>

          <div className="row g-4">
            <div className="col-lg-5">
              <SectionCard title="🔥 Sách được mượn nhiều nhất trong kỳ">
                {data.topBooks.length === 0 ? (
                  <EmptyText />
                ) : (
                  data.topBooks.map((book) => (
                    <BarRow key={book.bookId} label={book.bookTitle} value={book.count} max={topMax} suffix=" lượt" />
                  ))
                )}
              </SectionCard>
            </div>
            <div className="col-lg-7">
              <SectionCard title="⏰ Phiếu quá hạn lâu nhất">
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Bạn đọc</th>
                        <th>Sách</th>
                        <th>Hạn trả</th>
                        <th>Quá hạn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topOverdue.length === 0 ? (
                        <EmptyRow colSpan={4} text="Không có phiếu quá hạn." />
                      ) : (
                        data.topOverdue.map((item) => (
                          <tr key={item._id}>
                            <td>{item.userName}</td>
                            <td>{item.bookTitle}</td>
                            <td>{formatDate(item.dueDate)}</td>
                            <td className="text-danger fw-semibold">{item.overdueDays} ngày</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
