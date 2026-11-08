// Người phụ trách: Người 2 (Kho sách)
// TODO: gọi GET /api/reviews?bookId=..., POST /api/reviews
import { useAuth } from '../../context/AuthContext';
import { REVIEWS } from '../../constants/sampleData';

const Stars = ({ value }) => (
  <span className="stars">{'★'.repeat(value)}<span style={{ opacity: 0.25 }}>{'★'.repeat(5 - value)}</span></span>
);

export default function ReviewSection() {
  const canWrite = useAuth().user.role === 'member'; // chỉ độc giả (đã mượn sách) được viết

  return (
    <section>
      <h2 className="mb-4">Cảm nhận của bạn đọc <span className="text-secondary">({REVIEWS.length})</span></h2>
      <div className="row g-4">
        {canWrite && <div className="col-lg-5">
          <div className="card">
            <div className="card-body">
              <div className="fw-bold mb-2">Viết cảm nhận</div>
              <div className="fs-2 mb-3"><Stars value={0} /></div>
              <textarea className="form-control mb-3" rows={4} placeholder="Cuốn sách này thế nào?" />
              <button className="btn btn-primary" type="button">Gửi đánh giá</button>
            </div>
          </div>
        </div>}
        <div className={`${canWrite ? 'col-lg-7' : 'col-12'} d-flex flex-column gap-3`}>
          {REVIEWS.map((r) => (
            <div key={r._id} className="card">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <span className="avatar avatar-sm">{r.userName.charAt(0)}</span>
                  <div className="lh-sm">
                    <div className="fw-bold">{r.userName}</div>
                    <div className="small text-secondary">{r.createdAt}</div>
                  </div>
                  <span className="ms-auto"><Stars value={r.rating} /></span>
                </div>
                <p className="mb-0 text-secondary">{r.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
