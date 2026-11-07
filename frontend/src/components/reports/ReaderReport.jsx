import React, { useState } from 'react';
import useReport, { useDebouncedValue } from './useReport';
import { formatDate } from './reportCalculator';
import { BarRow, DateRangeFilter, EmptyRow, EmptyText, FilterBar, FilterField, ReportStatus, SectionCard, StatCard } from './ReportParts';

// Báo cáo bạn đọc: ai đang mượn, ai quá hạn, ai mượn nhiều
export default function ReaderReport({ context }) {
  const [range, setRange] = useState({ from: '', to: '' });
  const [hasActiveLoan, setHasActiveLoan] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const keyword = useDebouncedValue(keywordInput.trim());

  const { data, error, loading, source } = useReport('readers', { ...range, keyword, hasActiveLoan }, context);

  const topMax = data?.topReaders.length ? data.topReaders[0].borrowsInPeriod : 0;

  return (
    <div>
      <FilterBar>
        <DateRangeFilter from={range.from} to={range.to} onChange={setRange} />
        <FilterField label="Đang mượn sách">
          <select value={hasActiveLoan} onChange={(e) => setHasActiveLoan(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="true">Đang có sách mượn</option>
            <option value="false">Không mượn sách nào</option>
          </select>
        </FilterField>
        <FilterField label="Tên / email / mã SV">
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
            <StatCard label="🎓 Bạn đọc" value={data.summary.total} />
            <StatCard label="📖 Đang mượn sách" value={data.summary.withActiveLoans} tone="warning" />
            <StatCard label="⏰ Có sách quá hạn" value={data.summary.withOverdue} tone="danger" />
          </div>

          <SectionCard title="🏆 Bạn đọc mượn nhiều nhất trong kỳ">
            {data.topReaders.length === 0 ? (
              <EmptyText />
            ) : (
              data.topReaders.map((reader) => (
                <BarRow key={reader._id} label={reader.name} value={reader.borrowsInPeriod} max={topMax} suffix=" lượt" />
              ))
            )}
          </SectionCard>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Bạn đọc</th>
                  <th>Mã SV</th>
                  <th>Lượt mượn trong kỳ</th>
                  <th>Đang mượn</th>
                  <th>Quá hạn</th>
                  <th>Mượn gần nhất</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <EmptyRow colSpan={6} text="Không có bạn đọc nào phù hợp bộ lọc." />
                ) : (
                  data.items.map((reader) => (
                    <tr key={reader._id}>
                      <td>
                        <div className="fw-semibold">{reader.name}</div>
                        <div className="small text-secondary">{reader.email}</div>
                      </td>
                      <td>{reader.studentId || '-'}</td>
                      <td>{reader.borrowsInPeriod}</td>
                      <td>{reader.activeLoans}</td>
                      <td className={reader.overdueLoans > 0 ? 'text-danger fw-semibold' : ''}>{reader.overdueLoans}</td>
                      <td>{formatDate(reader.lastBorrowDate)}</td>
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
