// Người phụ trách: Người 2 (Kho sách)
import { useEffect, useState } from 'react';
import { IconTrash } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import reviewApi from '../../api/reviewApi';

const InteractiveStars = ({ value, onChange }) => (
  <span className="stars fs-2" role="group" aria-label="Chọn điểm đánh giá" style={{ userSelect: 'none' }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        style={{ position: 'relative', display: 'inline-block' }}
      >
        <StaticStars value={Math.max(0, Math.min(1, value - star + 1))} single />
        {[star - 0.5, star].map((score, half) => (
          <button key={score} type="button" aria-label={`${score} sao`} title={`${score} sao`}
            aria-pressed={value === score} onClick={() => onChange(score)}
            style={{ position: 'absolute', top: 0, bottom: 0, left: `${half * 50}%`, width: '50%', padding: 0, border: 0, background: 'transparent', cursor: 'pointer' }} />
        ))}
      </span>
    ))}
  </span>
);

const StaticStars = ({ value, single = false }) => (
  <span className="stars" role="img" aria-label={`${value} sao`} style={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
    <span style={{ opacity: 0.25 }}>{'★'.repeat(single ? 1 : 5)}</span>
    <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, overflow: 'hidden', width: `${Math.max(0, Math.min(1, value / (single ? 1 : 5))) * 100}%`, color: 'var(--amber)' }}>{'★'.repeat(single ? 1 : 5)}</span>
  </span>
);

export default function ReviewSection({ bookId, onReviewAdded }) {
  const { user } = useAuth();
  const canWrite = user?.role === 'member';

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const fetchReviews = () => {
    if (!bookId) return;
    setLoading(true);
    reviewApi.getByBookId(bookId)
      .then((data) => {
        setReviews(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setError(err.message || 'Không thể tải đánh giá');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!comment.trim()) {
      setSubmitError('Vui lòng nhập cảm nhận của bạn về cuốn sách.');
      return;
    }

    if (comment.trim().length > 2000 || !Number.isInteger(rating * 2) || rating < 0.5 || rating > 5) {
      setSubmitError('Nhận xét tối đa 2000 ký tự, điểm từ 0,5 đến 5 sao theo bước 0,5.'); return;
    }
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      await reviewApi.create({
        bookId,
        rating,
        comment: comment.trim(),
      });
      setComment('');
      setSubmitSuccess('Cảm ơn bạn đã gửi đánh giá!');
      fetchReviews();
      onReviewAdded?.();
    } catch (err) {
      setSubmitError(err.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      try {
        await reviewApi.delete(reviewId);
        fetchReviews();
        onReviewAdded?.();
      } catch (err) {
        alert(err.message || 'Lỗi khi xóa đánh giá');
      }
    }
  };

  return (
    <section>
      <h2 className="mb-4">
        Cảm nhận của bạn đọc <span className="text-secondary">({reviews.length})</span>
      </h2>

      <div className="row g-4">
        {canWrite && (
          <div className="col-lg-5">
            <div className="card">
              <form onSubmit={handleSubmit}>
                <div className="card-body">
                  <div className="fw-bold mb-2">Viết cảm nhận của bạn</div>
                  <div className="text-secondary small mb-2">
                    (Chỉ áp dụng khi bạn đã từng mượn cuốn sách này)
                  </div>

                  <div className="mb-3">
                    <InteractiveStars value={rating} onChange={setRating} />
                    <span className="ms-2 small text-secondary">{rating} / 5 sao</span>
                  </div>

                  {submitError && (
                    <div className="alert alert-danger py-2 small mb-3">{submitError}</div>
                  )}
                  {submitSuccess && (
                    <div className="alert alert-success py-2 small mb-3">{submitSuccess}</div>
                  )}

                  <textarea
                    className="form-control mb-3"
                    rows={4}
                    placeholder="Chia sẻ nhận xét hoặc trải nghiệm của bạn về cuốn sách này…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                  <button
                    className="btn btn-primary w-100"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? 'Đang gửi…' : 'Gửi đánh giá'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className={`${canWrite ? 'col-lg-7' : 'col-12'} d-flex flex-column gap-3`}>
          {loading ? (
            <div className="text-secondary py-3">Đang tải các đánh giá…</div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : reviews.length === 0 ? (
            <div className="card">
              <div className="card-body text-center text-secondary py-4">
                Chưa có cảm nhận nào cho cuốn sách này. Hãy là người đầu tiên chia sẻ cảm nhận!
              </div>
            </div>
          ) : (
            reviews.map((r) => {
              const canDelete =
                user &&
                (user.role === 'admin' ||
                  user.role === 'librarian' ||
                  r.userId?._id === user._id ||
                  r.userId === user._id);

              const dateStr = r.createdAt
                ? new Date(r.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : '';

              return (
                <div key={r._id} className="card">
                  <div className="card-body">
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <span className="avatar avatar-sm bg-primary-lt">
                        {(r.userName || 'B').charAt(0).toUpperCase()}
                      </span>
                      <div className="lh-sm">
                        <div className="fw-bold">{r.userName || 'Bạn đọc'}</div>
                        <div className="small text-secondary">{dateStr}</div>
                      </div>
                      <span className="ms-auto">
                        <StaticStars value={r.rating} />
                      </span>
                      {canDelete && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon btn-sm text-secondary ms-2"
                          title="Xóa đánh giá"
                          onClick={() => handleDeleteReview(r._id)}
                        >
                          <IconTrash size={15} />
                        </button>
                      )}
                    </div>
                    <p className="mb-0 text-secondary" style={{ whiteSpace: 'pre-line' }}>
                      {r.comment}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
