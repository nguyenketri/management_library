// Người phụ trách: Người 2 (Kho sách)
// Trang giới thiệu công khai — trang đầu tiên người xem thấy khi mở web
import { Link } from 'react-router-dom';
import { IconArrowRight, IconSearch, IconClockHour4, IconStarFilled } from '@tabler/icons-react';
import BookCover from '../../components/common/BookCover';
import MemberCard from '../../components/common/MemberCard';
import { useAuth } from '../../context/AuthContext';
import { BOOKS, CARDS, BORROWS } from '../../constants/sampleData';

const STATS = [
  ['1.200+', 'đầu sách trên kệ'],
  ['850', 'bạn đọc đang hoạt động'],
  ['14', 'ngày cho mỗi lượt mượn'],
  ['0đ', 'phí làm thẻ sinh viên'],
];

const STEPS = [
  ['01', 'Làm thẻ', 'Đăng ký bằng email sinh viên, thẻ điện tử có ngay trong một phút.'],
  ['02', 'Chọn sách', 'Lướt kho, xem còn bao nhiêu cuốn, đọc cảm nhận rồi bấm mượn.'],
  ['03', 'Nhận & đọc', 'Lấy sách ở quầy, đọc 14 ngày. Hệ thống nhắc trước khi đến hạn.'],
];

export default function LandingPage() {
  const { user } = useAuth();
  return (
    <div className="landing">
      {/* ---------- Thanh điều hướng ---------- */}
      <nav className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
          <Link to="/" className="lp-logo">fu<b>.</b>library</Link>
          <div className="lp-links">
            <a href="#shelf">Kho sách</a>
            <a href="#features">Tính năng</a>
            <a href="#how">Cách mượn</a>
          </div>
          <div className="d-flex gap-2">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary">Vào thư viện →</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">Đăng nhập</Link>
                <Link to="/register" className="btn btn-primary">Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ---------- Hero ---------- */}
      <header className="lp-hero">
        <div className="lp-wrap lp-hero-grid">
          <div>
            <span className="lp-open"><span className="live-dot" /> Đang mở cửa · đến 21:00 hôm nay</span>
            <h1 className="lp-title">
              Sách hay<br />không nằm im<br />trên <span className="hl">kệ.</span>
            </h1>
            <p className="lp-sub">
              Tra cứu hơn 1.200 đầu sách, đặt mượn trực tuyến và theo dõi hạn trả ngay trên điện thoại.
              Thư viện Đại học FPT, phiên bản không cần xếp hàng.
            </p>

            <div className="lp-search">
              <div className="input-pill">
                <IconSearch size={19} className="text-secondary" />
                <input placeholder="Bạn muốn đọc gì hôm nay?" />
                <Link to="/books" className="btn btn-primary">Tìm sách</Link>
              </div>
              <div className="lp-tags">
                <span>Đang hot:</span>
                <a href="#shelf">Clean Code</a>
                <a href="#shelf">Nhà Giả Kim</a>
                <a href="#shelf">Node.js</a>
              </div>
            </div>
          </div>

          <div className="lp-books">
            <div className="float f1"><BookCover book={BOOKS[4]} /></div>
            <div className="float f2"><BookCover book={BOOKS[0]} /></div>
            <div className="float f3"><BookCover book={BOOKS[1]} /></div>

            <div className="lp-chip lp-chip-1">
              <span className="ico"><IconClockHour4 size={18} /></span>
              <div className="lh-sm">
                <div className="fw-bold">Hạn trả 23/11</div>
                <div className="small text-secondary">Clean Code · còn 5 ngày</div>
              </div>
            </div>
            <div className="lp-chip lp-chip-2">
              <IconStarFilled size={16} style={{ color: 'var(--amber)' }} />
              <span><b>4.8</b> <span className="text-secondary">· 320 đánh giá</span></span>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- Số liệu ---------- */}
      <section className="lp-wrap">
        <div className="lp-stats">
          {STATS.map(([n, l]) => (
            <div key={l} className="lp-stat">
              <b>{n}</b>
              <span>{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Kệ sách ---------- */}
      <section id="shelf" className="lp-section">
        <div className="lp-wrap">
          <div className="lp-head">
            <div>
              <div className="lp-eyebrow">Kệ tuần này</div>
              <h2 className="lp-h2">Đang được mượn<br />nhiều nhất.</h2>
            </div>
            <Link to="/books" className="btn btn-outline">Xem cả kho <IconArrowRight size={17} className="ms-1" /></Link>
          </div>
          <div className="lp-shelf">
            {BOOKS.map((b) => (
              <Link key={b._id} to={`/books/${b._id}`} className="book-tile">
                <BookCover book={b} />
                <div className="meta">
                  <div className="t">{b.title}</div>
                  <div className="a">{b.author}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Tính năng (bento) ---------- */}
      <section id="features" className="lp-section">
        <div className="lp-wrap">
          <div className="lp-head">
            <div>
              <div className="lp-eyebrow">Tính năng</div>
              <h2 className="lp-h2">Thư viện, nhưng<br />nhanh như app.</h2>
            </div>
          </div>
          <div className="lp-bento">
            <div className="lp-tile lp-tile-lime">
              <span className="num">01 · Tra cứu</span>
              <div className="mini-search d-flex align-items-center gap-2"><IconSearch size={15} /> “design patterns”</div>
              <h3>Tìm trong 1 giây</h3>
              <p>Theo nhan đề, tác giả hay danh mục. Biết ngay cuốn nào còn trên kệ.</p>
            </div>
            <div className="lp-tile">
              <span className="num">02 · Hạn trả</span>
              <div className="mt-3">
                {BORROWS.slice(0, 3).map((r) => (
                  <div key={r._id} className="due">
                    <span className="text-truncate me-2">{r.bookTitle}</span>
                    <span className={r.status === 'overdue' ? 'fw-bold' : 'text-secondary'} style={r.status === 'overdue' ? { color: 'var(--coral)' } : undefined}>{r.dueDate.slice(5)}</span>
                  </div>
                ))}
              </div>
              <h3>Không lo trễ hạn</h3>
              <p>Nhắc trước 2 ngày, gia hạn một chạm.</p>
            </div>
            <div className="lp-tile">
              <span className="num">03 · Cảm nhận</span>
              <div className="mt-3 fs-2 stars">★★★★★</div>
              <h3>Đọc gì tiếp?</h3>
              <p>Xem bạn bè chấm điểm và viết gì về mỗi cuốn sách.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Các bước ---------- */}
      <section id="how" className="lp-section">
        <div className="lp-wrap">
          <div className="lp-head">
            <div>
              <div className="lp-eyebrow">Cách mượn</div>
              <h2 className="lp-h2">Ba bước, xong.</h2>
            </div>
          </div>
          <div className="lp-steps">
            {STEPS.map(([n, t, d]) => (
              <div key={n} className="lp-step">
                <div className="n">{n}</div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>

          {/* ---------- CTA ---------- */}
          <div className="lp-cta">
            <div>
              <h2>Một tấm thẻ.<br />Cả nghìn cuốn sách.</h2>
              <p className="my-4">Miễn phí cho sinh viên & giảng viên. Mượn tối đa 5 cuốn cùng lúc.</p>
              <div className="d-flex gap-2">
                <Link to="/register" className="btn btn-dark btn-lg">Làm thẻ ngay</Link>
                <Link to="/login" className="btn btn-lg btn-ink-outline">Đã có thẻ</Link>
              </div>
            </div>
            <MemberCard card={CARDS[0]} />
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="lp-footer">
        <div className="lp-wrap">
          <div className="lp-footer-grid">
            <div>
              <div className="lp-logo">fu<b>.</b>library</div>
              <p className="text-secondary mt-2 mb-0" style={{ maxWidth: '20rem' }}>
                Đồ án SDN302 — Node.js, Express, MongoDB & React.
              </p>
            </div>
            <div>
              <h6>Địa chỉ</h6>
              <div className="lp-footer-list"><span>Khu CNC Hòa Lạc</span><span>Tòa Alpha, tầng 2</span></div>
            </div>
            <div>
              <h6>Giờ mở cửa</h6>
              <div className="lp-footer-list"><span>T2 – T6 · 7:30 – 21:00</span><span>T7 – CN · 8:00 – 17:00</span></div>
            </div>
            <div>
              <h6>Liên hệ</h6>
              <div className="lp-footer-list"><span>library@fpt.edu.vn</span><span>024 7300 1866</span></div>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>© 2026 fu.library</span>
            <span>Đọc nhiều hơn, mượn dễ hơn.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
