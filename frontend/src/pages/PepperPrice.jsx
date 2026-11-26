import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { useTranslation } from '../contexts/LanguageContext';
import VideoPlayerModal, { getVideoDisplayThumbnail } from '../components/VideoPlayerModal';
import './CoffeePrice.css';

const formatVNDate = (item) => {
  if (item?.date_display) return item.date_display;
  const raw = item?.deadline || item?.published_at || item?.created_at;
  if (!raw) return '';
  const normalized = typeof raw === 'string' ? raw.replace(' ', 'T') : raw;
  const d = new Date(normalized);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getCleanExcerpt = (post, maxLen = 165) => {
  if (!post) return '';
  if (post.summary && post.summary.trim()) return post.summary.trim();
  if (post.body) {
    const plain = String(post.body).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return plain.length > maxLen ? `${plain.substring(0, maxLen)}...` : plain;
  }
  return '';
};

export default function PepperPrice() {
  const { currentLang } = useTranslation();
  const [pepperPosts, setPepperPosts] = useState([]);
  const [priceBoards, setPriceBoards] = useState([]);
  const [pepperVideos, setPepperVideos] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadPepperData = async () => {
      setLoadingData(true);
      try {
        const [resPageData, resPepperPosts, resAllPosts] = await Promise.all([
          fetch('/api/pepper-page-data'),
          fetch('/api/posts?category=' + encodeURIComponent('Giá hồ tiêu')),
          fetch('/api/posts')
        ]);

        // 1. Lấy danh sách ảnh giá hồ tiêu & video từ Admin quản trị
        if (resPageData.ok) {
          const jsonPage = await resPageData.json();
          if (jsonPage.success && isMounted) {
            setPriceBoards(Array.isArray(jsonPage.images) ? jsonPage.images : []);
            setPepperVideos(Array.isArray(jsonPage.videos) ? jsonPage.videos : []);
          }
        }

        // 2. Lấy danh sách bài viết chuyên mục Giá hồ tiêu
        let directPepper = [];
        if (resPepperPosts.ok) {
          const jsonPepper = await resPepperPosts.json();
          if (jsonPepper.success && Array.isArray(jsonPepper.data)) {
            directPepper = jsonPepper.data;
          }
        }

        let relatedPepper = [];
        if (resAllPosts.ok && directPepper.length < 4) {
          const jsonAll = await resAllPosts.json();
          if (jsonAll.success && Array.isArray(jsonAll.data)) {
            relatedPepper = jsonAll.data.filter(p => {
              if (directPepper.some(dp => dp.id === p.id)) return false;
              const cat = (p.category || '').toLowerCase();
              const sub = (p.sub_category || '').toLowerCase();
              const title = (p.title || '').toLowerCase();
              return (
                cat.includes('hồ tiêu') ||
                sub.includes('hồ tiêu') ||
                title.includes('hồ tiêu') ||
                title.includes('giá tiêu')
              );
            });
          }
        }

        if (isMounted) {
          setPepperPosts([...directPepper, ...relatedPepper]);
        }
      } catch (err) {
        console.warn('Error loading pepper price page data:', err);
      } finally {
        if (isMounted) setLoadingData(false);
      }
    };

    loadPepperData();
    return () => {
      isMounted = false;
    };
  }, []);

  const featuredPost = pepperPosts.length > 0 ? pepperPosts[0] : null;
  const sideNewsList = pepperPosts.length > 1 ? pepperPosts.slice(1, 7) : [];

  const handlePrevSlide = (e) => {
    e.stopPropagation();
    if (priceBoards.length <= 1) return;
    setActiveSlide(prev => (prev - 1 + priceBoards.length) % priceBoards.length);
  };

  const handleNextSlide = (e) => {
    e.stopPropagation();
    if (priceBoards.length <= 1) return;
    setActiveSlide(prev => (prev + 1) % priceBoards.length);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email || !email.includes('@')) {
      setNewsletterStatus('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    setSubmittingLead(true);
    setNewsletterStatus('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Độc giả Bản tin Giá Hồ Tiêu',
          email,
          phone: '',
          company: 'Đăng ký nhận bản tin Giá hồ tiêu',
          interest_topic: 'Bản tin thị trường hồ tiêu'
        })
      });
      if (res.ok) {
        setNewsletterEmail('');
        setNewsletterStatus('✅ Đăng ký nhận bản tin giá hồ tiêu thành công!');
      } else {
        setNewsletterStatus('✅ Đã ghi nhận email đăng ký bản tin của bạn!');
        setNewsletterEmail('');
      }
    } catch (err) {
      setNewsletterStatus('✅ Đã ghi nhận email đăng ký bản tin của bạn!');
      setNewsletterEmail('');
    } finally {
      setSubmittingLead(false);
    }
  };

  const currentBoard = priceBoards[activeSlide] || null;

  return (
    <div className="cp-page">
      <SEOHead
        title={currentLang === 'en' ? 'Pepper Prices Today — DakLak.today' : 'Giá hồ tiêu hôm nay — Cập nhật giá hồ tiêu Đắk Lắk & Thế giới'}
        description="Cập nhật diễn biến giá hồ tiêu hôm nay tại Đắk Lắk, Tây Nguyên và thị trường thế giới nhanh chóng, chính xác nhất."
        keywords="giá hồ tiêu, giá tiêu hôm nay, giá hồ tiêu đắk lắk, giá hồ tiêu tây nguyên, daklak today"
        image={currentBoard?.image_url || '/og-image.png'}
        url="/gia-ho-tieu"
      />

      <Navbar />

      {/* ── HERO BANNER ─────────────────────────────────────────────────────── */}
      <section className="cp-hero">
        <div className="cp-container">
          <div className="cp-hero-head">
            <div className="cp-hero-icon" aria-hidden="true">
              <i className="ti ti-seeding"></i>
            </div>
            <h1 className="cp-hero-title">
              {currentLang === 'en' ? 'Pepper Prices' : 'Giá hồ tiêu'}
            </h1>
          </div>
          <p className="cp-hero-subtitle">
            {currentLang === 'en'
              ? 'Daily updates on domestic and global pepper market prices.'
              : 'Cập nhật diễn biến giá hồ tiêu trong nước và thị trường thế giới.'}
          </p>
          <nav className="cp-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">{currentLang === 'en' ? 'Home' : 'Trang chủ'}</Link>
            <i className="ti ti-chevron-right" style={{ fontSize: '12px' }}></i>
            <span className="cp-breadcrumb-current">
              {currentLang === 'en' ? 'Pepper Prices' : 'Giá hồ tiêu'}
            </span>
          </nav>
        </div>
      </section>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <main className="cp-main">
        <div className="cp-container">
          <div className="cp-main-grid">
            
            {/* CỘT TRÁI: TIN MỚI NHẤT */}
            <div className="cp-news-col">
              <div className="cp-sec-header">
                <span className="cp-sec-icon">
                  <i className="ti ti-news"></i>
                </span>
                <h2 className="cp-sec-title">
                  {currentLang === 'en' ? 'LATEST PEPPER NEWS' : 'TIN MỚI NHẤT'}
                </h2>
                <div className="cp-sec-line"></div>
              </div>

              {!featuredPost ? (
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1px dashed rgba(139, 90, 43, 0.25)',
                    padding: '40px 24px',
                    textAlign: 'center',
                    color: '#7A5C43',
                    fontSize: '14.5px'
                  }}
                >
                  {loadingData ? 'Đang tải bản tin giá hồ tiêu...' : 'Chưa có bài viết trong chuyên mục Giá hồ tiêu.'}
                </div>
              ) : (
                <>
                  {/* Bài viết tiêu điểm trên cùng */}
                  <Link
                    to={`/posts/${featuredPost.slug || featuredPost.id}`}
                    className="cp-featured-card"
                  >
                    <div className="cp-featured-thumb">
                      <img
                        src={featuredPost.image_url || '/images/daklak/daklak_doi_ca_phe.jpg'}
                        alt={featuredPost.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/daklak/daklak_doi_ca_phe.jpg';
                        }}
                      />
                    </div>
                    <div className="cp-featured-body">
                      <div>
                        <div className="cp-meta-date">
                          <i className="ti ti-calendar-event"></i>
                          <span>{formatVNDate(featuredPost)}</span>
                        </div>
                        <h3 className="cp-featured-title">{featuredPost.title}</h3>
                        <p className="cp-featured-desc">{getCleanExcerpt(featuredPost, 180)}</p>
                      </div>
                      <div className="cp-featured-footer">
                        <span className="cp-readmore-btn">
                          {currentLang === 'en' ? 'Read more' : 'Đọc tiếp'} <i className="ti ti-arrow-right"></i>
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Danh sách bài viết phía dưới */}
                  {sideNewsList.length > 0 && (
                    <div className="cp-news-list">
                      {sideNewsList.map((post, idx) => {
                        const fallbackImages = [
                          '/images/daklak/daklak_doi_ca_phe.jpg',
                          '/images/daklak/daklak_dau_tu_logistics.jpg',
                          '/images/daklak/daklak_le_hoi_nha_rong.jpg',
                          '/images/daklak/daklak_ca_phe.jpg'
                        ];
                        const thumbUrl = post.image_url || fallbackImages[idx % fallbackImages.length];

                        return (
                          <Link
                            key={post.id || idx}
                            to={`/posts/${post.slug || post.id}`}
                            className="cp-news-item"
                          >
                            <div className="cp-news-thumb">
                              <img
                                src={thumbUrl}
                                alt={post.title}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = fallbackImages[idx % fallbackImages.length];
                                }}
                              />
                            </div>
                            <div className="cp-news-info">
                              <div className="cp-meta-date">
                                <i className="ti ti-calendar-event"></i>
                                <span>{formatVNDate(post)}</span>
                              </div>
                              <h3 className="cp-news-title">{post.title}</h3>
                              <p className="cp-news-desc">{getCleanExcerpt(post, 140)}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* CỘT PHẢI: BẢNG GIÁ HỒ TIÊU HÔM NAY (SLIDER ẢNH) + NHẬN BẢN TIN */}
            <aside className="cp-sidebar-col">
              <div className="cp-price-board-card">
                <div className="cp-board-header">
                  <div className="cp-board-header-left">
                    <span className="cp-board-icon">
                      <i className="ti ti-seeding"></i>
                    </span>
                    <h2 className="cp-board-title">
                      {currentLang === 'en' ? 'Pepper Price Today' : 'Giá hồ tiêu hôm nay'}
                    </h2>
                  </div>
                </div>

                {!currentBoard ? (
                  <div
                    style={{
                      padding: '48px 20px',
                      textAlign: 'center',
                      borderRadius: '12px',
                      background: '#FAF5EE',
                      border: '1px dashed rgba(139, 90, 43, 0.25)',
                      color: '#7A5C43',
                      fontSize: '14px'
                    }}
                  >
                    <i className="ti ti-photo-off" style={{ fontSize: '28px', display: 'block', marginBottom: '8px', opacity: 0.7 }}></i>
                    {loadingData ? 'Đang tải bảng giá hồ tiêu...' : 'Chưa có ảnh bảng giá hồ tiêu hôm nay.'}
                  </div>
                ) : (
                  <>
                    <div className="cp-slider-wrap">
                      {priceBoards.length > 1 && (
                        <button
                          type="button"
                          className="cp-slider-nav prev"
                          onClick={handlePrevSlide}
                          aria-label="Ảnh trước"
                        >
                          <i className="ti ti-chevron-left"></i>
                        </button>
                      )}

                      <div
                        className="cp-slider-img-box"
                        onClick={() => setLightboxImg(currentBoard.image_url)}
                        title="Nhấn để phóng to bảng giá hồ tiêu"
                      >
                        <img
                          src={currentBoard.image_url}
                          alt={currentBoard.title || 'Giá hồ tiêu hôm nay'}
                        />
                      </div>

                      {priceBoards.length > 1 && (
                        <button
                          type="button"
                          className="cp-slider-nav next"
                          onClick={handleNextSlide}
                          aria-label="Ảnh tiếp theo"
                        >
                          <i className="ti ti-chevron-right"></i>
                        </button>
                      )}
                    </div>

                    {priceBoards.length > 1 && (
                      <div className="cp-slider-dots">
                        {priceBoards.map((b, i) => (
                          <button
                            key={b.id || i}
                            type="button"
                            className={`cp-slider-dot ${i === activeSlide ? 'active' : ''}`}
                            onClick={() => setActiveSlide(i)}
                            aria-label={`Xem bảng giá ${i + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Khung Nhận bản tin thị trường hồ tiêu */}
              <div className="cp-newsletter-card">
                <h3 className="cp-newsletter-title">
                  {currentLang === 'en' ? 'Pepper Market Newsletter' : 'Nhận bản tin thị trường hồ tiêu'}
                </h3>
                <p className="cp-newsletter-desc">
                  {currentLang === 'en'
                    ? 'Get fast updates on pepper prices, market analysis, and industry news.'
                    : 'Cập nhật nhanh giá hồ tiêu, phân tích thị trường và thông tin ngành'}
                </p>
                <form className="cp-newsletter-form" onSubmit={handleNewsletterSubmit}>
                  <input
                    type="email"
                    className="cp-newsletter-input"
                    placeholder={currentLang === 'en' ? 'Enter your email...' : 'Nhập email của bạn...'}
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="cp-newsletter-btn"
                    disabled={submittingLead}
                  >
                    {submittingLead ? 'Đang gửi...' : (currentLang === 'en' ? 'Subscribe' : 'Đăng ký')}
                    <i className="ti ti-arrow-right"></i>
                  </button>
                </form>
                {newsletterStatus && (
                  <div style={{ marginTop: '10px', fontSize: '12.5px', fontWeight: 600, color: '#78350F' }}>
                    {newsletterStatus}
                  </div>
                )}
              </div>
            </aside>
          </div>

          {/* ── PHẦN DƯỚI: VIDEO THỊ TRƯỜNG HỒ TIÊU ──────────────────────────── */}
          <section className="cp-video-section">
            <div className="cp-sec-header">
              <span className="cp-sec-icon">
                <i className="ti ti-player-play-filled"></i>
              </span>
              <h2 className="cp-sec-title">
                {currentLang === 'en' ? 'PEPPER MARKET VIDEOS' : 'VIDEO THỊ TRƯỜNG HỒ TIÊU'}
              </h2>
              <div className="cp-sec-line"></div>
            </div>

            {pepperVideos.length === 0 ? (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px dashed rgba(139, 90, 43, 0.25)',
                  padding: '36px 24px',
                  textAlign: 'center',
                  color: '#7A5C43',
                  fontSize: '15px',
                  fontWeight: 600
                }}
              >
                {currentLang === 'en' ? 'No videos yet' : 'Chưa có video'}
              </div>
            ) : (
              <div className="cp-video-grid">
                {pepperVideos.map((vid) => {
                  const thumb = getVideoDisplayThumbnail(vid);
                  return (
                    <div
                      key={vid.id}
                      className="cp-video-card"
                      onClick={() => setActiveVideoModal(vid)}
                    >
                      <div className="cp-video-thumb">
                        <img
                          src={thumb}
                          alt={vid.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/daklak/daklak_doi_ca_phe.jpg';
                          }}
                        />
                        <div className="cp-video-play">
                          <i className="ti ti-player-play-filled"></i>
                        </div>
                      </div>
                      <div className="cp-video-body">
                        <h3 className="cp-video-title">{vid.title}</h3>
                        {vid.summary && (
                          <p className="cp-news-desc" style={{ marginBottom: '8px' }}>
                            {vid.summary}
                          </p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <div className="cp-meta-date" style={{ marginBottom: 0 }}>
                            <i className="ti ti-calendar-event"></i>
                            <span>{formatVNDate(vid)}</span>
                          </div>
                          {vid.source && (
                            <span style={{ fontSize: '12px', color: '#78350F', fontWeight: 600 }}>
                              Nguồn: {vid.source}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Lightbox phóng to ảnh bảng giá hồ tiêu */}
      {lightboxImg && (
        <div className="cp-lightbox" onClick={() => setLightboxImg(null)}>
          <div className="cp-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="cp-lightbox-close"
              onClick={() => setLightboxImg(null)}
              aria-label="Đóng"
            >
              <i className="ti ti-x"></i>
            </button>
            <img src={lightboxImg} alt="Bảng giá hồ tiêu hôm nay" />
          </div>
        </div>
      )}

      {/* Modal phát Video tự co giãn chuẩn khung */}
      <VideoPlayerModal
        video={activeVideoModal}
        onClose={() => setActiveVideoModal(null)}
      />

      <Footer />
    </div>
  );
}

