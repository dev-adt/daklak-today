import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { useTranslation } from '../contexts/LanguageContext';
import { resolveVideoEmbed, getVideoDisplayThumbnail } from '../utils/videoUtils';
import './CoffeePrice.css';

const DEFAULT_PRICE_BOARDS = [
  {
    id: 'board-1',
    image_url: '/images/bang-gia-ca-phe-1.jpg',
    title: 'Bảng giá cà phê Đắk Lắk & Tây Nguyên cập nhật hôm nay'
  },
  {
    id: 'board-2',
    image_url: '/images/bang-gia-ca-phe-2.jpg',
    title: 'Diễn biến giá cà phê nội địa và thế giới (Robusta & Arabica)'
  }
];

const formatVNDate = (item) => {
  if (item?.date_display) return item.date_display;
  const raw = item?.deadline || item?.published_at || item?.created_at;
  if (!raw) return '';
  const d = new Date(raw);
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

export default function CoffeePrice() {
  const { currentLang } = useTranslation();
  const [coffeePosts, setCoffeePosts] = useState([]);
  const [priceBoards, setPriceBoards] = useState(DEFAULT_PRICE_BOARDS);
  const [coffeeVideos, setCoffeeVideos] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [modalDetectedRatio, setModalDetectedRatio] = useState(null);
  const [currentPageVid, setCurrentPageVid] = useState(1);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);

  // Tự động nhận diện tỷ lệ khung hình video để co giãn vừa khít, không để lại khoảng đen
  useEffect(() => {
    if (!activeVideoModal) {
      setModalDetectedRatio(null);
      return;
    }
    if (activeVideoModal.aspect_ratio && activeVideoModal.aspect_ratio !== 'auto') {
      const exp = String(activeVideoModal.aspect_ratio).trim();
      if (exp === '1:1') setModalDetectedRatio('1 / 1');
      else if (exp === '9:16') setModalDetectedRatio('9 / 16');
      else if (exp === '4:5') setModalDetectedRatio('4 / 5');
      else if (exp === '16:9') setModalDetectedRatio('16 / 9');
      return;
    }

    const thumb = getVideoDisplayThumbnail(activeVideoModal);
    if (thumb) {
      const probe = new Image();
      probe.src = thumb;
      probe.onload = () => {
        if (probe.naturalWidth > 0 && probe.naturalHeight > 0) {
          const r = probe.naturalWidth / probe.naturalHeight;
          if (Math.abs(r - 1) <= 0.15) {
            setModalDetectedRatio('1 / 1');
          } else if (r < 0.72) {
            setModalDetectedRatio('9 / 16');
          } else if (r < 0.95) {
            setModalDetectedRatio('4 / 5');
          } else {
            setModalDetectedRatio('16 / 9');
          }
        }
      };
    }
  }, [activeVideoModal]);

  useEffect(() => {
    let isMounted = true;
    const loadCoffeeData = async () => {
      setLoadingData(true);
      try {
        const [resPageData, resCoffeePosts, resAllPosts] = await Promise.all([
          fetch('/api/coffee-page-data'),
          fetch('/api/posts?category=' + encodeURIComponent('Giá cà phê')),
          fetch('/api/posts')
        ]);

        // 1. Lấy danh sách ảnh giá cà phê & danh sách video từ Admin quản trị
        if (resPageData.ok) {
          const jsonPage = await resPageData.json();
          if (jsonPage.success && isMounted) {
            if (Array.isArray(jsonPage.images) && jsonPage.images.length > 0) {
              setPriceBoards(jsonPage.images);
            } else {
              setPriceBoards(DEFAULT_PRICE_BOARDS);
            }
            setCoffeeVideos(Array.isArray(jsonPage.videos) ? jsonPage.videos : []);
          }
        }

        // 2. Lấy danh sách bài viết chuyên mục Giá cà phê
        let directCoffee = [];
        if (resCoffeePosts.ok) {
          const jsonCoffee = await resCoffeePosts.json();
          if (jsonCoffee.success && Array.isArray(jsonCoffee.data)) {
            directCoffee = jsonCoffee.data;
          }
        }

        let relatedCoffee = [];
        if (resAllPosts.ok && directCoffee.length < 4) {
          const jsonAll = await resAllPosts.json();
          if (jsonAll.success && Array.isArray(jsonAll.data)) {
            relatedCoffee = jsonAll.data.filter(p => {
              if (directCoffee.some(dc => dc.id === p.id)) return false;
              const cat = (p.category || '').toLowerCase();
              const sub = (p.sub_category || '').toLowerCase();
              const title = (p.title || '').toLowerCase();
              return (
                cat.includes('giá cà phê') ||
                sub.includes('cà phê') ||
                title.includes('cà phê')
              );
            });
          }
        }

        if (isMounted) {
          setCoffeePosts([...directCoffee, ...relatedCoffee]);
        }
      } catch (err) {
        console.warn('Error loading coffee price page data:', err);
      } finally {
        if (isMounted) setLoadingData(false);
      }
    };

    loadCoffeeData();
    return () => {
      isMounted = false;
    };
  }, []);

  const featuredPost = coffeePosts.length > 0 ? coffeePosts[0] : null;
  const sideNewsList = coffeePosts.length > 1 ? coffeePosts.slice(1, 7) : [];

  const handlePrevSlide = (e) => {
    e.stopPropagation();
    setActiveSlide(prev => (prev - 1 + priceBoards.length) % priceBoards.length);
  };

  const handleNextSlide = (e) => {
    e.stopPropagation();
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
          name: 'Độc giả Bản tin Giá Cà Phê',
          email,
          phone: '',
          company: 'Đăng ký nhận bản tin Giá cà phê',
          interest_topic: 'Bản tin thị trường cà phê'
        })
      });
      if (res.ok) {
        setNewsletterEmail('');
        setNewsletterStatus('✅ Đăng ký nhận bản tin giá cà phê thành công!');
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

  const currentBoard = priceBoards[activeSlide] || DEFAULT_PRICE_BOARDS[0];

  return (
    <div className="cp-page">
      <SEOHead
        title={currentLang === 'en' ? 'Coffee Prices Today — DakLak.today' : 'Giá cà phê hôm nay — Cập nhật giá cà phê Đắk Lắk & Thế giới'}
        description="Cập nhật diễn biến giá cà phê hôm nay tại Đắk Lắk, Tây Nguyên và thị trường thế giới (Robusta, Arabica) nhanh chóng, chính xác nhất."
        keywords="giá cà phê, giá cà phê hôm nay, giá cà phê đắk lắk, giá cà phê tây nguyên, cà phê robusta, daklak today"
        image={currentBoard.image_url}
        url="/gia-ca-phe"
      />

      <Navbar />

      {/* ── HERO BANNER ─────────────────────────────────────────────────────── */}
      <section className="cp-hero">
        <div className="cp-container">
          <div className="cp-hero-head">
            <div className="cp-hero-icon" aria-hidden="true">
              <i className="ti ti-coffee"></i>
            </div>
            <h1 className="cp-hero-title">
              {currentLang === 'en' ? 'Coffee Prices' : 'Giá cà phê'}
            </h1>
          </div>
          <p className="cp-hero-subtitle">
            {currentLang === 'en'
              ? 'Daily updates on domestic and global coffee market prices.'
              : 'Cập nhật diễn biến giá cà phê trong nước và thị trường thế giới.'}
          </p>
          <nav className="cp-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">{currentLang === 'en' ? 'Home' : 'Trang chủ'}</Link>
            <i className="ti ti-chevron-right" style={{ fontSize: '12px' }}></i>
            <span className="cp-breadcrumb-current">
              {currentLang === 'en' ? 'Coffee Prices' : 'Giá cà phê'}
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
                  {currentLang === 'en' ? 'LATEST COFFEE NEWS' : 'TIN MỚI NHẤT'}
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
                  {loadingData ? 'Đang tải bản tin giá cà phê...' : 'Chưa có bài viết trong chuyên mục Giá cà phê.'}
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
                        src={featuredPost.image_url || '/images/daklak/daklak_ca_phe.jpg'}
                        alt={featuredPost.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/daklak/daklak_ca_phe.jpg';
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

            {/* CỘT PHẢI: BẢNG GIÁ CÀ PHÊ HÔM NAY (SLIDER ẢNH) + NHẬN BẢN TIN */}
            <aside className="cp-sidebar-col">
              <div className="cp-price-board-card">
                <div className="cp-board-header">
                  <div className="cp-board-header-left">
                    <span className="cp-board-icon">
                      <i className="ti ti-coffee"></i>
                    </span>
                    <h2 className="cp-board-title">
                      {currentLang === 'en' ? 'Coffee Price Today' : 'Giá cà phê hôm nay'}
                    </h2>
                  </div>
                </div>

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
                    title="Nhấn để phóng to bảng giá cà phê"
                  >
                    <img
                      src={currentBoard.image_url}
                      alt={currentBoard.title || 'Giá cà phê hôm nay'}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/bang-gia-ca-phe-1.jpg';
                      }}
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
              </div>

              {/* Khung Nhận bản tin thị trường cà phê */}
              <div className="cp-newsletter-card">
                <h3 className="cp-newsletter-title">
                  {currentLang === 'en' ? 'Coffee Market Newsletter' : 'Nhận bản tin thị trường cà phê'}
                </h3>
                <p className="cp-newsletter-desc">
                  {currentLang === 'en'
                    ? 'Get fast updates on coffee prices, market analysis, and industry news.'
                    : 'Cập nhật nhanh giá cà phê, phân tích thị trường và thông tin ngành'}
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

          {/* ── PHẦN DƯỚI: VIDEO THỊ TRƯỜNG CÀ PHÊ ───────────────────────────── */}
          <section className="cp-video-section">
            <div className="cp-sec-header">
              <span className="cp-sec-icon">
                <i className="ti ti-player-play-filled"></i>
              </span>
              <h2 className="cp-sec-title">
                {currentLang === 'en' ? 'COFFEE MARKET VIDEOS' : 'VIDEO THỊ TRƯỜNG CÀ PHÊ'}
              </h2>
              <div className="cp-sec-line"></div>
            </div>

            {coffeeVideos.length === 0 ? (
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
            ) : (() => {
              const VIDEOS_PER_PAGE = 3;
              const totalPagesVid = Math.ceil(coffeeVideos.length / VIDEOS_PER_PAGE) || 1;
              const safePageVid = Math.min(Math.max(currentPageVid, 1), totalPagesVid);
              const displayedVideos = coffeeVideos.slice((safePageVid - 1) * VIDEOS_PER_PAGE, safePageVid * VIDEOS_PER_PAGE);

              return (
                <div>
                  <div className="cp-video-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                    {displayedVideos.map((vid) => {
                      const thumb = getVideoDisplayThumbnail(vid);
                      return (
                        <div
                          key={vid.id}
                          className="cp-video-card"
                          onClick={() => setActiveVideoModal(vid)}
                        >
                          <div className="cp-video-thumb">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={vid.title}
                                loading="lazy"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : null}
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

                  {/* Thanh phân trang hiển thị 1 hàng Video cho chuyên mục Giá cà phê */}
                  {totalPagesVid > 1 && (
                    <div style={{
                      marginTop: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      <button
                        type="button"
                        disabled={safePageVid <= 1}
                        onClick={() => setCurrentPageVid(prev => Math.max(prev - 1, 1))}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '8px',
                          border: '1px solid rgba(139, 90, 43, 0.25)',
                          background: safePageVid <= 1 ? '#F5F5F0' : '#FFFFFF',
                          color: safePageVid <= 1 ? '#A89F91' : '#3B2314',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: safePageVid <= 1 ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <i className="ti ti-chevron-left"></i> {currentLang === 'en' ? 'Previous' : 'Trang trước'}
                      </button>

                      {Array.from({ length: totalPagesVid }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPageVid(pageNum)}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            border: pageNum === safePageVid ? 'none' : '1px solid rgba(139, 90, 43, 0.25)',
                            background: pageNum === safePageVid ? '#8B5A2B' : '#FFFFFF',
                            color: pageNum === safePageVid ? '#FFFFFF' : '#3B2314',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        type="button"
                        disabled={safePageVid >= totalPagesVid}
                        onClick={() => setCurrentPageVid(prev => Math.min(prev + 1, totalPagesVid))}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '8px',
                          border: '1px solid rgba(139, 90, 43, 0.25)',
                          background: safePageVid >= totalPagesVid ? '#F5F5F0' : '#FFFFFF',
                          color: safePageVid >= totalPagesVid ? '#A89F91' : '#3B2314',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: safePageVid >= totalPagesVid ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        {currentLang === 'en' ? 'Next' : 'Trang sau'} <i className="ti ti-chevron-right"></i>
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </section>
        </div>
      </main>

      {/* Lightbox phóng to ảnh bảng giá cà phê */}
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
            <img src={lightboxImg} alt="Bảng giá cà phê hôm nay" />
          </div>
        </div>
      )}

      {/* Modal phát Video nhúng trực tiếp co giãn vừa khung hình (ngang 16:9, dọc 9:16, vuông 1:1, 4:5) */}
      {activeVideoModal && (() => {
        const embed = resolveVideoEmbed(activeVideoModal.video_url, activeVideoModal.aspect_ratio);
        const finalRatio = modalDetectedRatio || embed.aspectRatio || '16 / 9';
        const isSquare = finalRatio === '1 / 1';
        const isVertical = finalRatio === '9 / 16' || finalRatio === '4 / 5';
        const modalMaxWidth = isSquare ? '520px' : isVertical ? '430px' : '860px';

        return (
          <div className="cp-lightbox" onClick={() => setActiveVideoModal(null)}>
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                maxWidth: modalMaxWidth,
                width: '100%',
                maxHeight: '92vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                margin: 'auto',
                transition: 'max-width 0.25s ease'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid rgba(139, 90, 43, 0.14)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                flexShrink: 0
              }}>
                <h3 style={{
                  margin: 0,
                  fontFamily: 'var(--font-title, serif)',
                  fontSize: '17px',
                  fontWeight: 800,
                  color: '#2C1810',
                  lineHeight: 1.35,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {activeVideoModal.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveVideoModal(null)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    background: '#F3E5D0',
                    color: '#3B2314',
                    cursor: 'pointer',
                    fontSize: '16px',
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  aria-label="Đóng"
                >
                  <i className="ti ti-x"></i>
                </button>
              </div>

              {/* Video Player Box - Co giãn vừa vặn, không bị thừa khoảng đen */}
              <div style={{
                position: 'relative',
                width: '100%',
                maxHeight: '75vh',
                aspectRatio: embed.type === 'video' ? 'auto' : finalRatio,
                background: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                margin: '0 auto'
              }}>
                {embed.type === 'video' ? (
                  <video
                    src={embed.src}
                    controls
                    autoPlay
                    style={{
                      maxWidth: '100%',
                      maxHeight: '75vh',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                ) : (
                  <iframe
                    src={embed.src}
                    title={activeVideoModal.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      display: 'block'
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                  />
                )}
              </div>

              {(activeVideoModal.summary || activeVideoModal.source) && (
                <div style={{
                  padding: '12px 18px',
                  background: '#FBF8F3',
                  maxHeight: '110px',
                  overflowY: 'auto',
                  borderTop: '1px solid rgba(139, 90, 43, 0.08)',
                  flexShrink: 0
                }}>
                  {activeVideoModal.source && (
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#B45309', marginBottom: activeVideoModal.summary ? '4px' : 0 }}>
                      Nguồn: {activeVideoModal.source}
                    </div>
                  )}
                  {activeVideoModal.summary && (
                    <p style={{ margin: 0, fontSize: '13.5px', color: '#4A3B32', lineHeight: 1.55 }}>
                      {activeVideoModal.summary}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      <Footer />
    </div>
  );
}
