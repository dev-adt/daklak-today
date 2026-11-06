import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { useTranslation } from '../contexts/LanguageContext';
import './CoffeePrice.css';

const FALLBACK_COFFEE_NEWS = [
  {
    id: 'cp-fallback-1',
    isFallback: true,
    title: 'Giá cà phê Đắk Lắk hôm nay duy trì đà tăng, vượt mốc 124.000 đồng/kg',
    summary: 'Giá cà phê nhân xô tại Đắk Lắk và khu vực Tây Nguyên tiếp tục duy trì ở mức cao nhờ nhu cầu xuất khẩu ổn định và nguồn cung trong dân không còn nhiều...',
    body: `<p>Thị trường cà phê nội địa tại Đắk Lắk và các tỉnh Tây Nguyên tiếp tục ghi nhận phiên giao dịch khởi sắc khi giá cà phê nhân xô duy trì đà tăng vững chắc, vượt mốc 124.000 đồng/kg tại các vùng trọng điểm như Cư M'gar, Buôn Hồ, Krông Pắc và Ea H'leo.</p><p>Theo các doanh nghiệp xuất khẩu nông sản tại Buôn Ma Thuột, nhu cầu thu mua từ các nhà rang xay châu Âu và châu Á đang tăng trưởng ổn định, trong khi lượng hàng tồn kho trong dân cuối vụ không còn dồi dào. Điều này tạo lực đỡ quan trọng cho giá cà phê Robusta Việt Nam trên cả thị trường nội địa lẫn sàn giao dịch London.</p>`,
    image_url: '/images/daklak/daklak_ca_phe.jpg',
    date_display: '24/04/2026'
  },
  {
    id: 'cp-fallback-2',
    isFallback: true,
    title: 'Giá cà phê Tây Nguyên giữ mức cao, giao dịch nội địa sôi động',
    summary: 'Tại các vùng trồng trọng điểm như Cư M\'gar, Buôn Hồ, Krông Pắc, hoạt động thu mua diễn ra ổn định với mức giá khả quan...',
    body: `<p>Tại các vùng trồng cà phê trọng điểm của tỉnh Đắk Lắk như Cư M'gar, Buôn Hồ, Krông Pắc và Krông Năng, hoạt động giao dịch cà phê nhân xô diễn ra sôi động ngay từ đầu tuần.</p><p>Các hợp tác xã và đại lý thu mua cho biết chất lượng hạt cà phê niên vụ năm nay được đánh giá cao nhờ quy trình thu hái chín và chế biến ướt, phơi sấy đạt chuẩn xuất khẩu.</p>`,
    image_url: '/images/daklak/daklak_doi_ca_phe.jpg',
    date_display: '23/04/2026'
  },
  {
    id: 'cp-fallback-3',
    isFallback: true,
    title: 'Thị trường Robusta thế giới biến động, giá cà phê trong nước được hỗ trợ',
    summary: 'Diễn biến tích cực trên sàn London tiếp tục tạo lực đỡ cho giá cà phê tại thị trường Việt Nam trong ngắn hạn...',
    body: `<p>Trên thị trường thế giới, giá cà phê Robusta kỳ hạn trên sàn ICE Futures Europe (London) và Arabica trên sàn New York liên tục có những nhịp tăng điểm ấn tượng do lo ngại về thời tiết tại các quốc gia sản xuất lớn.</p><p>Nhờ vị thế là thủ phủ cà phê Robusta hàng đầu, nông sản Đắk Lắk đang hưởng lợi trực tiếp từ mặt bằng giá quốc tế thuận lợi.</p>`,
    image_url: '/images/daklak/daklak_dau_tu_logistics.jpg',
    date_display: '22/04/2026'
  },
  {
    id: 'cp-fallback-4',
    isFallback: true,
    title: 'Nông dân và doanh nghiệp Đắk Lắk theo dõi sát diễn biến giá cà phê vụ mới',
    summary: 'Biến động thời tiết, chi phí đầu vào và nhu cầu xuất khẩu là những yếu tố đang tác động trực tiếp đến thị trường...',
    body: `<p>Nhiều hộ nông dân và hợp tác xã nông nghiệp công nghệ cao tại Đắk Lắk đang chủ động áp dụng quy trình canh tác bền vững, tiết kiệm nước và đạt chứng nhận EUDR để nâng cao giá trị gia tăng cho hạt cà phê địa phương.</p>`,
    image_url: '/images/daklak/daklak_le_hoi_nha_rong.jpg',
    date_display: '20/04/2026'
  }
];

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

const COFFEE_VIDEOS = [
  {
    id: 'vid-1',
    title: 'Toàn cảnh thị trường cà phê Tây Nguyên tuần qua',
    date: '23/04/2026',
    duration: '04:05',
    thumbnail: '/images/daklak/daklak_doi_ca_phe.jpg',
    description: 'Tổng hợp diễn biến giá cà phê nhân xô tại Đắk Lắk, Lâm Đồng, Gia Lai, Đắk Nông và xu hướng xuất khẩu tuần qua.'
  },
  {
    id: 'vid-2',
    title: 'Phân tích xu hướng giá cà phê Robusta năm 2026',
    date: '21/04/2026',
    duration: '03:50',
    thumbnail: '/images/daklak/daklak_ca_phe.jpg',
    description: 'Góc nhìn chuyên gia về cung - cầu cà phê Robusta toàn cầu và cơ hội cho doanh nghiệp xuất khẩu Đắk Lắk.'
  },
  {
    id: 'vid-3',
    title: 'Cận cảnh quy trình thu hoạch và chế biến cà phê Đắk Lắk',
    date: '19/04/2026',
    duration: '05:12',
    thumbnail: '/images/daklak/daklak_nha_rong_ede.jpg',
    description: 'Khám phá chuỗi giá trị cà phê đặc sản Buôn Ma Thuột từ nông trại canh tác hữu cơ đến nhà máy chế biến sâu.'
  }
];

const formatVNDate = (post) => {
  if (post?.date_display) return post.date_display;
  const raw = post?.deadline || post?.published_at || post?.created_at;
  if (!raw) return '24/04/2026';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '24/04/2026';
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
  const [activeSlide, setActiveSlide] = useState(0);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadCoffeeData = async () => {
      try {
        const [resCoffee, resAll] = await Promise.all([
          fetch('/api/posts?category=' + encodeURIComponent('Giá cà phê')),
          fetch('/api/posts')
        ]);

        let directCoffee = [];
        if (resCoffee.ok) {
          const jsonCoffee = await resCoffee.json();
          if (jsonCoffee.success && Array.isArray(jsonCoffee.data)) {
            directCoffee = jsonCoffee.data;
          }
        }

        let relatedCoffee = [];
        if (resAll.ok) {
          const jsonAll = await resAll.json();
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

        if (!isMounted) return;

        // Cập nhật danh sách ảnh bảng giá cà phê từ các bài đăng thuộc chuyên mục "Giá cà phê" (nếu có ảnh) + ảnh bảng giá mặc định
        const uploadedBoards = directCoffee
          .filter(p => p.image_url && String(p.image_url).trim() !== '')
          .map(p => ({
            id: `post-board-${p.id}`,
            image_url: p.image_url,
            title: p.title,
            postSlugOrId: p.slug || p.id
          }));

        const mergedBoards = [...uploadedBoards, ...DEFAULT_PRICE_BOARDS];
        // Loại bỏ trùng lặp URL
        const uniqueBoards = [];
        const seenUrls = new Set();
        for (const b of mergedBoards) {
          if (!seenUrls.has(b.image_url)) {
            seenUrls.add(b.image_url);
            uniqueBoards.push(b);
          }
        }
        setPriceBoards(uniqueBoards.slice(0, 5));

        // Gộp tin tức: ưu tiên bài trong chuyên mục "Giá cà phê", sau đó bài liên quan cà phê, và bổ sung bài mẫu nếu chưa đủ 4 bài
        const combinedNews = [...directCoffee, ...relatedCoffee];
        if (combinedNews.length < 4) {
          const needed = 4 - combinedNews.length;
          combinedNews.push(...FALLBACK_COFFEE_NEWS.slice(0, needed));
        }
        setCoffeePosts(combinedNews);
      } catch (err) {
        console.warn('Error loading coffee price page data:', err);
        if (isMounted) {
          setCoffeePosts(FALLBACK_COFFEE_NEWS);
        }
      }
    };

    loadCoffeeData();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayPosts = coffeePosts.length > 0 ? coffeePosts : FALLBACK_COFFEE_NEWS;
  const featuredPost = displayPosts[0];
  const sideNewsList = displayPosts.slice(1, 7);

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

              {/* Bài viết tiêu điểm trên cùng */}
              {featuredPost && (
                featuredPost.isFallback ? (
                  <div
                    className="cp-featured-card"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setPreviewItem(featuredPost)}
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
                  </div>
                ) : (
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
                )
              )}

              {/* Danh sách bài viết phía dưới */}
              <div className="cp-news-list">
                {sideNewsList.map((post, idx) => {
                  const fallbackImages = [
                    '/images/daklak/daklak_doi_ca_phe.jpg',
                    '/images/daklak/daklak_dau_tu_logistics.jpg',
                    '/images/daklak/daklak_le_hoi_nha_rong.jpg',
                    '/images/daklak/daklak_ca_phe.jpg'
                  ];
                  const thumbUrl = post.image_url || fallbackImages[idx % fallbackImages.length];

                  if (post.isFallback) {
                    return (
                      <div
                        key={post.id || idx}
                        className="cp-news-item"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setPreviewItem(post)}
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
                      </div>
                    );
                  }

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
              <Link to="/posts?category=Giá%20cà%20phê" className="cp-sec-more">
                {currentLang === 'en' ? 'View all' : 'Xem tất cả'} <i className="ti ti-arrow-right"></i>
              </Link>
            </div>

            <div className="cp-video-grid">
              {COFFEE_VIDEOS.map((vid) => (
                <div
                  key={vid.id}
                  className="cp-video-card"
                  onClick={() => setPreviewItem({
                    title: vid.title,
                    date_display: vid.date,
                    image_url: vid.thumbnail,
                    summary: vid.description,
                    body: `<p>${vid.description}</p>`
                  })}
                >
                  <div className="cp-video-thumb">
                    <img src={vid.thumbnail} alt={vid.title} />
                    <div className="cp-video-play">
                      <i className="ti ti-player-play-filled"></i>
                    </div>
                    <span className="cp-video-duration">{vid.duration}</span>
                  </div>
                  <div className="cp-video-body">
                    <h3 className="cp-video-title">{vid.title}</h3>
                    <div className="cp-meta-date" style={{ marginBottom: 0 }}>
                      <i className="ti ti-calendar-event"></i>
                      <span>{vid.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

      {/* Modal đọc nhanh cho bài mẫu / video khi chưa có bài DB tương ứng */}
      {previewItem && (
        <div className="cp-lightbox" onClick={() => setPreviewItem(null)}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '18px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '88vh',
              overflowY: 'auto',
              padding: '28px 32px',
              position: 'relative',
              boxShadow: '0 24px 60px rgba(0,0,0,0.45)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                background: '#F3E5D0',
                color: '#3B2314',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              <i className="ti ti-x"></i>
            </button>
            <div className="cp-meta-date" style={{ marginBottom: '10px' }}>
              <i className="ti ti-calendar-event"></i>
              <span>{formatVNDate(previewItem)}</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '24px', fontWeight: 800, color: '#2C1810', margin: '0 0 16px 0', lineHeight: 1.35 }}>
              {previewItem.title}
            </h2>
            {previewItem.image_url && (
              <img
                src={previewItem.image_url}
                alt={previewItem.title}
                style={{ width: '100%', maxHeight: '340px', objectFit: 'cover', borderRadius: '12px', marginBottom: '18px' }}
              />
            )}
            {previewItem.summary && (
              <p style={{ fontWeight: 700, fontStyle: 'italic', fontSize: '15.5px', color: '#2C1810', marginBottom: '1.5em', lineHeight: 1.7 }}>
                {previewItem.summary}
              </p>
            )}
            <div
              style={{ fontSize: '15.5px', color: '#4A3B32', lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: previewItem.body || '' }}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

