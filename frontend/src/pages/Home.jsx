import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingAIBot from '../components/FloatingAIBot';
import SEOHead from '../components/SEOHead';
import brandConfig from '../brand.config';
import { getCategoryLabel } from '../constants/categories';
import { fetchJsonWithTimeout, FALLBACK_POSTS, FALLBACK_EVENTS, FALLBACK_MEMBERS } from '../utils/api';
import './HomeDakLak.css';

export const Home = () => {
  const { role, user } = useAuth();
  const { currentLang, t } = useTranslation();
  const navigate = useNavigate();

  // Search State & Scope
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState('all');

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState(0);

  // Investment Projects Filter State
  const [selectedSector, setSelectedSector] = useState('all');

  // Form Tư vấn & Hợp tác đầu tư (POST /api/leads)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: 'Đắk Lắk',
    serviceNeed: 'Đầu tư nông nghiệp công nghệ cao & chế biến sâu',
    companyName: '',
    notes: '',
    agreeTerms: true
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Quick Event Registration Modal State
  const [registerModalEvent, setRegisterModalEvent] = useState(null);
  const [regFormData, setRegFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    company: '',
    quantity: 1
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(null);

  // Dynamic Live Posts (khởi tạo từ cache)
  const [latestPosts, setLatestPosts] = useState(() => {
    try {
      const cached = localStorage.getItem('dnvn_cached_home_posts');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return FALLBACK_POSTS;
  });
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Dynamic Live Events (khởi tạo từ cache)
  const [eventsList, setEventsList] = useState(() => {
    try {
      const cached = localStorage.getItem('dnvn_cached_home_events');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return FALLBACK_EVENTS;
  });

  // Dynamic Live Members (khởi tạo từ cache)
  const [featuredMembers, setFeaturedMembers] = useState(() => {
    try {
      const cached = localStorage.getItem('dnvn_cached_home_members');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return FALLBACK_MEMBERS;
  });

  // Live countdown timer cho sự kiện nổi bật nhất
  const [timeLeft, setTimeLeft] = useState({ days: 18, hours: 8, minutes: 30, seconds: 0 });

  // Tải dữ liệu song song từ API (Promise.allSettled) có Timeout 8s
  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        const [postsRes, eventsRes, membersRes] = await Promise.allSettled([
          fetchJsonWithTimeout('/api/posts?limit=6', {}, 8000),
          fetchJsonWithTimeout('/api/events?limit=4', {}, 8000),
          fetchJsonWithTimeout('/api/members?limit=3', {}, 8000)
        ]);

        if (isMounted) {
          if (postsRes.status === 'fulfilled' && postsRes.value?.success && Array.isArray(postsRes.value.data) && postsRes.value.data.length > 0) {
            setLatestPosts(postsRes.value.data);
            try {
              localStorage.setItem('dnvn_cached_home_posts', JSON.stringify(postsRes.value.data));
            } catch (e) {}
          }
          if (eventsRes.status === 'fulfilled' && eventsRes.value?.success && Array.isArray(eventsRes.value.data) && eventsRes.value.data.length > 0) {
            setEventsList(eventsRes.value.data);
            try {
              localStorage.setItem('dnvn_cached_home_events', JSON.stringify(eventsRes.value.data));
            } catch (e) {}
          }
          if (membersRes.status === 'fulfilled' && membersRes.value?.success && Array.isArray(membersRes.value.data) && membersRes.value.data.length > 0) {
            setFeaturedMembers(membersRes.value.data);
            try {
              localStorage.setItem('dnvn_cached_home_members', JSON.stringify(membersRes.value.data));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.warn('Lỗi tải dữ liệu động trang chủ:', err);
      }
    };
    fetchHomeData();
    return () => { isMounted = false; };
  }, []);

  // Tính toán Countdown thời gian thực an toàn cho Safari iOS
  useEffect(() => {
    const targetEvent = eventsList && eventsList.length > 0 ? eventsList[0] : null;
    if (!targetEvent || !targetEvent.event_date) return;

    const timer = setInterval(() => {
      try {
        let dateStr = String(targetEvent.event_date).trim();
        if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}(:\d{2})?$/.test(dateStr)) {
          dateStr = dateStr.replace(' ', 'T') + '+07:00';
        }
        const eventTime = new Date(dateStr).getTime();
        const now = new Date().getTime();
        const difference = eventTime - now;

        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
          });
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      } catch (e) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [eventsList]);

  // Xử lý Tìm kiếm
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (searchScope === 'members') {
        navigate(`/members?search=${encodeURIComponent(searchQuery.trim())}`);
      } else if (searchScope === 'events') {
        navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate(`/posts?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  // Cuộn mượt xuống Form Tư vấn & Tự động gán lĩnh vực quan tâm
  const scrollToConsult = (serviceName = '') => {
    if (serviceName) {
      setFormData(prev => ({ ...prev, serviceNeed: serviceName }));
    }
    const el = document.getElementById('tu-van');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Gửi Form Tư vấn chuẩn endpoint /api/leads
  const handleConsultSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.companyName) {
      alert(currentLang === 'en' ? 'Please fill in Name, Phone, and Company (*)' : 'Vui lòng điền Họ tên, Số điện thoại và Tên tổ chức/doanh nghiệp (*)');
      return;
    }
    setFormLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          city: formData.city,
          companyName: formData.companyName,
          memberType: formData.serviceNeed,
          notes: `Lĩnh vực quan tâm: ${formData.serviceNeed}. Ghi chú: ${formData.notes || 'Không có'}`
        })
      });
      if (res.ok) {
        setFormSubmitted(true);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Có lỗi xảy ra khi gửi thông tin');
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Không thể kết nối đến máy chủ, vui lòng thử lại.');
    } finally {
      setFormLoading(false);
    }
  };

  // Đăng ký vé sự kiện nhanh (gọi /api/events/:id/register)
  const handleQuickRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerModalEvent) return;
    if (!regFormData.fullName || !regFormData.phone) {
      alert(currentLang === 'en' ? 'Please fill in Full Name and Phone' : 'Vui lòng nhập Họ tên và Số điện thoại');
      return;
    }
    setRegLoading(true);
    try {
      const res = await fetch(`/api/events/${registerModalEvent.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regFormData.fullName,
          phone: regFormData.phone,
          email: regFormData.email,
          company: regFormData.company,
          quantity: regFormData.quantity || 1
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegSuccess(data);
      } else {
        alert(data.error || 'Đăng ký vé chưa thành công');
      }
    } catch (err) {
      console.error('Register ticket error:', err);
      alert('Có lỗi kết nối khi đăng ký vé.');
    } finally {
      setRegLoading(false);
    }
  };

  // Danh mục dự án đầu tư mẫu chọn lọc
  const investmentProjects = [
    {
      id: 'inv-1',
      title: 'Tổ hợp Nhà máy Chế biến sâu Cà phê & Nông sản xuất khẩu Buôn Ma Thuột',
      sector: 'Chế biến Nông sản',
      sectorKey: 'agro',
      location: 'Khu công nghiệp Hòa Phú, TP. Buôn Ma Thuột',
      scale: '250 tỷ VNĐ (Công suất 15.000 tấn/năm)',
      status: 'Đang kêu gọi hợp tác & đầu tư',
      desc: 'Dự án đầu tư dây chuyền sấy lạnh, chiết xuất cà phê hòa tan cao cấp và hệ thống kiểm định đạt chuẩn châu Âu.'
    },
    {
      id: 'inv-2',
      title: 'Khu Nông nghiệp Ứng dụng Công nghệ cao Cư M’gar',
      sector: 'Nông nghiệp CNC',
      sectorKey: 'hitech',
      location: 'Huyện Cư M’gar, Tỉnh Đắk Lắk',
      scale: '180 tỷ VNĐ (Quy mô 120 ha)',
      status: 'Quỹ đất sạch sẵn sàng',
      desc: 'Canh tác sầu riêng, mắc ca và hồ tiêu hữu cơ kết hợp hệ thống IoT giám sát thổ nhưỡng và truy xuất nguồn gốc số.'
    },
    {
      id: 'inv-3',
      title: 'Trung tâm Dịch vụ Logistics & Kho lạnh Vận tải hàng hóa Tây Nguyên',
      sector: 'Logistics',
      sectorKey: 'logistics',
      location: 'Điểm nối cao tốc Buôn Ma Thuột — Khánh Hòa',
      scale: '320 tỷ VNĐ (Diện tích 25 ha)',
      status: 'Quy hoạch phân khu đã phê duyệt',
      desc: 'Đầu tư cụm kho ngoại quan, kho lạnh bảo quản nông sản tươi và trung tâm logistics kết nối Tây Nguyên với cảng biển Nam Trung Bộ.'
    },
    {
      id: 'inv-4',
      title: 'Khu Nghỉ dưỡng Sinh thái & Bảo tồn Văn hóa Cồng chiêng Hồ Lắk',
      sector: 'Du lịch Sinh thái',
      sectorKey: 'tourism',
      location: 'Huyện Lắk, Tỉnh Đắk Lắk',
      scale: '150 tỷ VNĐ (Resort 4 sao, 80 phòng bungalow)',
      status: 'Kêu gọi nhà đầu tư chiến lược',
      desc: 'Tổ hợp nghỉ dưỡng sinh thái ven hồ kết hợp trải nghiệm làng nghề truyền thống và biểu diễn văn hóa phi vật thể của người M’Nông.'
    }
  ];

  const filteredProjects = selectedSector === 'all' 
    ? investmentProjects 
    : investmentProjects.filter(p => p.sectorKey === selectedSector);

  // 5 Câu hỏi thường gặp
  const faqs = [
    {
      q: currentLang === 'en' ? 'What is DakLak.today and who does it serve?' : 'DakLak.today là gì và phục vụ những đối tượng nào?',
      a: currentLang === 'en' 
        ? 'DakLak.today is the digital gateway, open data hub, and investment promotion platform of Dak Lak Province. We connect travelers, local enterprises, global investors, and diaspora communities across 4 key pillars: Media, Data, Platform, and Artificial Intelligence.'
        : 'DakLak.today là cổng thông tin số, dữ liệu mở và nền tảng xúc tiến đầu tư toàn diện của tỉnh Đắk Lắk. Nền tảng phục vụ du khách khám phá, doanh nghiệp địa phương quảng bá sản phẩm, nhà đầu tư trong và ngoài nước tiếp cận dự án, cùng cộng đồng người Đắk Lắk xa quê theo dõi chuyển động quê hương.'
    },
    {
      q: currentLang === 'en' ? 'How does AI Assistant & AI Matching work on DakLak.today?' : 'Trợ lý AI và tính năng AI Matching hỗ trợ nhà đầu tư như thế nào?',
      a: currentLang === 'en'
        ? 'Our Gemini Flash-powered AI assistant analyzes investment profiles, agricultural raw material maps, and policy data to automatically match prospective investors with suitable projects, industrial zones, and verified local partners.'
        : 'Trợ lý AI tích hợp công nghệ Gemini Flash kết nối trực tiếp với cơ sở dữ liệu doanh nghiệp, quy hoạch tỉnh và chuỗi giá trị nông sản. Nhà đầu tư chỉ cần nhập nhu cầu (ví dụ: cần tìm quỹ đất 50 ha làm nông nghiệp CNC), AI sẽ tự động sàng lọc dự án phù hợp và đề xuất đối tác xác thực.'
    },
    {
      q: currentLang === 'en' ? 'What benefits do member businesses receive?' : 'Doanh nghiệp tham gia nền tảng DakLak.today được hưởng những quyền lợi gì?',
      a: currentLang === 'en'
        ? 'Member enterprises receive a verified Digital Showroom, publish articles & trade opportunities, receive investor inquiries, and enjoy automatic approval for the Silver package upon registration.'
        : 'Doanh nghiệp được cấp trang Hồ sơ năng lực (Showroom số) có dấu xác thực, đăng tải sản phẩm OCOP, tìm kiếm đối tác và kêu gọi vốn. Khi đăng ký gói Silver, hệ thống tự động phê duyệt ngay lập tức để doanh nghiệp bắt đầu sử dụng.'
    },
    {
      q: currentLang === 'en' ? 'How can I register for events and get QR tickets?' : 'Tôi có thể đăng ký tham gia sự kiện và nhận vé QR như thế nào?',
      a: currentLang === 'en'
        ? 'Simply click "Register Ticket" on any featured event. Fill in your name and phone number to receive a unique QR check-in code directly on screen or by email, with zero waiting time.'
        : 'Người dùng chỉ cần nhấn "Đăng ký vé" tại khối sự kiện nổi bật, điền thông tin người tham dự. Hệ thống sẽ tự động cấp mã QR soát vé độc nhất để check-in thời gian thực tại hội trường.'
    },
    {
      q: currentLang === 'en' ? 'Does DakLak.today support mobile app installation (PWA)?' : 'DakLak.today có hỗ trợ cài đặt dạng ứng dụng trên điện thoại (PWA) không?',
      a: currentLang === 'en'
        ? 'Yes! DakLak.today is fully equipped with Progressive Web App (PWA) technology. You can click "Install App" on the navigation bar to add it directly to your phone or computer home screen without App Store downloads.'
        : 'Có. DakLak.today được tối ưu chuẩn PWA hiện đại. Bạn chỉ cần nhấn nút "Cài App" trên thanh điều hướng hoặc popup trên điện thoại để đưa biểu tượng DakLak.today ra màn hình chính, sử dụng mượt mà không cần qua App Store.'
    }
  ];

  return (
    <div className="daklak-home">
      <SEOHead 
        title={`${brandConfig.brandName} — ${brandConfig.slogan}`}
        description={brandConfig.description}
      />
      <Navbar />

      <main>
        {/* ========================================================
            SECTION 1: HERO BANNER ("Hôm nay ở Đắk Lắk có gì?")
            ======================================================== */}
        <section className="daklak-hero" id="home">
          <div className="daklak-hero-content">
            <div className="daklak-hero-badge">
              <i className="ti ti-sparkles" />
              <span>{currentLang === 'en' ? 'Central Highlands Digital Gateway' : 'Cổng Khám Phá & Xúc Tiến Đầu Tư'}</span>
            </div>

            <h1 className="daklak-hero-title">
              DAKLAK.TODAY <br />
              <span>{currentLang === 'en' ? 'From Bazan Earth to Global Horizons' : 'Từ Đất Bazan Đến Cơ Hội Toàn Cầu'}</span>
            </h1>

            <p className="daklak-hero-subtitle">
              {currentLang === 'en'
                ? 'Discover the coffee capital and the majestic Central Highlands; connect with verified enterprises, high-value agricultural projects, and investment opportunities on an AI-powered platform.'
                : 'Khám phá thủ phủ cà phê và đại ngàn Tây Nguyên; kết nối doanh nghiệp, chuỗi giá trị nông sản và cơ hội hợp tác đầu tư trên nền tảng số tích hợp Trí tuệ Nhân tạo.'}
            </p>

            {/* Trending Tags */}
            <div className="daklak-hero-tags">
              <span className="daklak-hero-tag" onClick={() => navigate('/posts?category=Cà%20phê%20Đắk%20Lắk')}>☕ #ThuPhuCaPhe</span>
              <span className="daklak-hero-tag" onClick={() => navigate('/posts?category=Khám%20phá%20Đắk%20Lắk')}>🌄 #BazanDo</span>
              <span className="daklak-hero-tag" onClick={() => navigate('/posts?category=Du%20lịch%20&%20Trải%20nghiệm')}>🥁 #VanHoaCongChieng</span>
              <span className="daklak-hero-tag" onClick={() => navigate('/posts?category=Đầu%20tư%20&%20Dự%20án')}>💰 #KetNoiDauTu</span>
              <span className="daklak-hero-tag" onClick={() => navigate('/posts?category=Doanh%20nghiệp%20&%20Sản%20phẩm')}>🚀 #DoanhNghiepDakLak</span>
              <span className="daklak-hero-tag" onClick={() => navigate('/ai-chat')}>🤖 #AIMatching</span>
            </div>

            {/* Search Box with Scope Tabs */}
            <form className="daklak-hero-search-box" onSubmit={handleSearchSubmit}>
              <i className="ti ti-search" style={{ color: 'var(--bazan-brown)', marginLeft: '14px', fontSize: '1.2rem' }} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={currentLang === 'en' ? 'Search coffee, agricultural projects, enterprises, destinations...' : 'Tìm kiếm cà phê, dự án nông nghiệp, doanh nghiệp, điểm đến...'}
              />
              <button type="submit">
                <span>{currentLang === 'en' ? 'Search' : 'Tìm kiếm'}</span>
                <i className="ti ti-arrow-right" />
              </button>
            </form>

            {/* Action Buttons */}
            <div className="daklak-hero-actions">
              <a href="#kham-pha" className="btn-daklak-primary">
                <i className="ti ti-compass" />
                <span>{currentLang === 'en' ? 'Explore Dak Lak' : 'Khám phá Đắk Lắk'}</span>
              </a>
              <button onClick={() => scrollToConsult()} className="btn-daklak-gold">
                <i className="ti ti-briefcase" />
                <span>{currentLang === 'en' ? 'Connect Investment' : 'Kết nối Đầu tư'}</span>
              </button>
              <Link to="/ai-chat" className="btn-daklak-outline">
                <i className="ti ti-robot" />
                <span>{currentLang === 'en' ? 'Ask AI Assistant' : 'Hỏi Trợ lý AI'}</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 2: 4 LỐI VÀO THEO NHU CẦU (QUICK ACCESS HUB)
            ======================================================== */}
        <section className="daklak-section" style={{ paddingTop: '0', paddingBottom: '50px' }}>
          <div className="daklak-container">
            <div className="quick-access-grid">
              {/* Card 1 */}
              <div className="quick-access-card" onClick={() => navigate('/posts?category=Khám%20phá%20Đắk%20Lắk')}>
                <div>
                  <div className="quick-access-icon">🧭</div>
                  <h3 className="quick-access-title">{currentLang === 'en' ? 'I Want to Explore' : 'Tôi muốn Khám phá'}</h3>
                  <p className="quick-access-desc">
                    {currentLang === 'en' ? 'Discover coffee culture, pristine waterfalls, Lake Lak, and Central Highlands gong heritage.' : 'Khám phá văn hóa cà phê, thác Dray Nur, hồ Lắk, vườn quốc gia Yok Đôn và di sản cồng chiêng.'}
                  </p>
                </div>
                <span className="quick-access-link">{currentLang === 'en' ? 'Start Journey →' : 'Bắt đầu trải nghiệm →'}</span>
              </div>

              {/* Card 2 */}
              <div className="quick-access-card" onClick={() => navigate('/members')}>
                <div>
                  <div className="quick-access-icon">🏢</div>
                  <h3 className="quick-access-title">{currentLang === 'en' ? 'I am a Business' : 'Tôi là Doanh nghiệp'}</h3>
                  <p className="quick-access-desc">
                    {currentLang === 'en' ? 'Join digital showroom, showcase OCOP specialty products, and connect with global trade partners.' : 'Mở showroom số, quảng bá nông sản OCOP, tìm kiếm đối tác cung ứng và mở rộng kênh phân phối.'}
                  </p>
                </div>
                <span className="quick-access-link" style={{ color: 'var(--forest-green)' }}>{currentLang === 'en' ? 'Join Network →' : 'Mở hồ sơ số →'}</span>
              </div>

              {/* Card 3 */}
              <div className="quick-access-card" onClick={() => scrollToConsult('Dự án Đầu tư Trọng điểm')}>
                <div>
                  <div className="quick-access-icon">💰</div>
                  <h3 className="quick-access-title">{currentLang === 'en' ? 'I Seek Investment' : 'Tôi tìm Cơ hội Đầu tư'}</h3>
                  <p className="quick-access-desc">
                    {currentLang === 'en' ? 'Access verified key projects, industrial parks, raw material zones, and investment incentive policies.' : 'Truy cập danh mục dự án trọng điểm, quỹ đất KCN, vùng nguyên liệu và chính sách ưu đãi tỉnh.'}
                  </p>
                </div>
                <span className="quick-access-link" style={{ color: 'var(--gong-gold)' }}>{currentLang === 'en' ? 'View Projects →' : 'Xem danh mục dự án →'}</span>
              </div>

              {/* Card 4 */}
              <div className="quick-access-card" onClick={() => navigate('/ai-chat')}>
                <div>
                  <div className="quick-access-icon">🤖</div>
                  <h3 className="quick-access-title">{currentLang === 'en' ? 'I Want to Connect & Ask AI' : 'Tôi muốn Kết nối & Hỏi AI'}</h3>
                  <p className="quick-access-desc">
                    {currentLang === 'en' ? 'Engage with 24/7 AI Assistant to match business partners, calculate project viability, and receive advice.' : 'Tương tác Trợ lý AI thông minh, giải đáp quy hoạch, phân tích hồ sơ và ghép nối đối tác tức thời.'}
                  </p>
                </div>
                <span className="quick-access-link" style={{ color: 'var(--bazan-brown)' }}>{currentLang === 'en' ? 'Chat with AI →' : 'Trò chuyện ngay →'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 3: SỨ MỆNH & KHÔNG GIAN SỐ CHUNG ĐẮK LẮK
            ======================================================== */}
        <section className="daklak-section" id="kham-pha">
          <div className="daklak-container">
            <div className="daklak-section-header">
              <span className="daklak-section-badge">{currentLang === 'en' ? 'Strategic Mission' : 'Sứ Mệnh Số Hóa'}</span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'A Unified Digital Space for Dak Lak' : 'Một Không Gian Số Chung Dành Cho Đắk Lắk'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'DakLak.today is not merely a news portal, but a collaborative digital ecosystem designed to aggregate, standardize, and amplify the enduring values of Dak Lak.'
                  : 'DakLak.today không chỉ là một website tin tức, mà là một không gian số mở tập hợp, chuẩn hóa và lan tỏa những giá trị bền vững của Đắk Lắk đến bạn bè trong nước và quốc tế.'}
              </p>
            </div>

            <div className="values-grid">
              <div className="value-card">
                <div className="value-card-icon"><i className="ti ti-network" /></div>
                <h3>{currentLang === 'en' ? 'Digital Connectivity' : 'Kết Nối Số'}</h3>
                <p>{currentLang === 'en' ? 'Bridging individuals, enterprises, investors, and local authorities within one unified interactive ecosystem.' : 'Thu hẹp khoảng cách giữa người dân, doanh nghiệp, nhà đầu tư và cơ quan ban ngành trên một giao diện thống nhất.'}</p>
              </div>

              <div className="value-card">
                <div className="value-card-icon"><i className="ti ti-database" /></div>
                <h3>{currentLang === 'en' ? 'Reliable Data' : 'Dữ Liệu Tin Cậy'}</h3>
                <p>{currentLang === 'en' ? 'Standardized, verified information on planning, businesses, agricultural raw material areas, and economic data.' : 'Chuẩn hóa thông tin doanh nghiệp, chỉ số kinh tế, vùng trồng nông sản và quy hoạch dự án từ các nguồn chính thống.'}</p>
              </div>

              <div className="value-card">
                <div className="value-card-icon"><i className="ti ti-cpu" /></div>
                <h3>{currentLang === 'en' ? 'Artificial Intelligence' : 'Trí Tuệ Nhân Tạo'}</h3>
                <p>{currentLang === 'en' ? 'Harnessing generative AI to personalize search, recommend itineraries, and intelligently match investment needs.' : 'Ứng dụng AI thông minh hỗ trợ tìm kiếm ngữ nghĩa, gợi ý hành trình trải nghiệm và ghép nối nhu cầu đối tác chuẩn xác.'}</p>
              </div>

              <div className="value-card">
                <div className="value-card-icon"><i className="ti ti-leaf" /></div>
                <h3>{currentLang === 'en' ? 'Cultural Heritage' : 'Bản Sắc Văn Hóa'}</h3>
                <p>{currentLang === 'en' ? 'Preserving and elevating the UNESCO Gong Culture, coffee pride, and the untamed spirit of the Central Highlands.' : 'Tôn vinh không gian văn hóa cồng chiêng Tây Nguyên, tự hào hạt cà phê Buôn Ma Thuột và vẻ đẹp đại ngàn hùng vĩ.'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 4: 4 THẾ MẠNH HỘI TỤ ĐẮK LẮK
            ======================================================== */}
        <section className="daklak-section" style={{ backgroundColor: 'var(--cream-alt)' }}>
          <div className="daklak-container">
            <div className="daklak-section-header">
              <span className="daklak-section-badge">{currentLang === 'en' ? 'Natural Advantages' : 'Thế Mạnh Nổi Bật'}</span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'Convergence of Coffee, Culture & the Great Highlands' : 'Đắk Lắk – Hội Tụ Cà Phê, Văn Hóa & Đại Ngàn Tây Nguyên'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'Endowed with fertile red basalt soil and a unique climate, Dak Lak possesses immense advantages for comprehensive socio-economic development.'
                  : 'Sở hữu dải đất đỏ bazan màu mỡ cùng khí hậu đặc trưng, Đắk Lắk hội tụ những tiềm năng vượt trội để bứt phá kinh tế trong kỷ nguyên mới.'}
              </p>
            </div>

            <div className="strengths-grid">
              {/* Strength 1 */}
              <div className="strength-card">
                <div className="strength-img-box">
                  <img src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80" alt="Cà phê Đắk Lắk" />
                  <span className="strength-tag">{currentLang === 'en' ? 'Strategic Commodity' : 'Trụ cột Kinh tế'}</span>
                </div>
                <div className="strength-body">
                  <h3>{currentLang === 'en' ? 'Coffee & Specialty Agro-Products' : 'Cà Phê & Nông Sản Đặc Hữu'}</h3>
                  <p>{currentLang === 'en' ? 'Over 213,000 hectares of coffee, producing 560,000+ tons annually. Alongside durian, macadamia, and black pepper reaching top global exports.' : 'Hơn 213.000 ha cà phê, sản lượng trên 560.000 tấn/năm. Cùng sầu riêng, mắc ca, hồ tiêu đạt chuẩn xuất khẩu chất lượng cao vào EU, Mỹ, Nhật.'}</p>
                  <Link to="/posts?category=Cà%20phê%20Đắk%20Lắk" className="quick-access-link">{currentLang === 'en' ? 'Explore value chain →' : 'Khám phá chuỗi giá trị →'}</Link>
                </div>
              </div>

              {/* Strength 2 */}
              <div className="strength-card">
                <div className="strength-img-box">
                  <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" alt="Văn hóa Du lịch" />
                  <span className="strength-tag" style={{ background: 'rgba(31, 90, 58, 0.9)' }}>{currentLang === 'en' ? 'Living Heritage' : 'Di sản Sống'}</span>
                </div>
                <div className="strength-body">
                  <h3>{currentLang === 'en' ? 'Ecotourism & Gong Culture' : 'Du Lịch Sinh Thái & Di Sản Cồng Chiêng'}</h3>
                  <p>{currentLang === 'en' ? 'UNESCO Intangible Cultural Heritage of Humanity, majestic Dray Nur waterfalls, Yok Don National Park, and serene Lake Lak.' : 'Không gian văn hóa cồng chiêng được UNESCO vinh danh, hệ thống thác nước hùng vĩ, Vườn quốc gia Yok Đôn và vẻ đẹp thơ mộng của Hồ Lắk.'}</p>
                  <Link to="/posts?category=Du%20lịch%20&%20Trải%20nghiệm" className="quick-access-link">{currentLang === 'en' ? 'Experience culture →' : 'Trải nghiệm văn hóa →'}</Link>
                </div>
              </div>

              {/* Strength 3 */}
              <div className="strength-card">
                <div className="strength-img-box">
                  <img src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80" alt="Năng lượng tái tạo" />
                  <span className="strength-tag" style={{ background: 'rgba(213, 163, 63, 0.9)', color: '#26160E' }}>{currentLang === 'en' ? 'Clean Energy' : 'Năng Lượng Xanh'}</span>
                </div>
                <div className="strength-body">
                  <h3>{currentLang === 'en' ? 'Renewable Energy & Infrastructure' : 'Năng Lượng Tái Tạo & Công Nghiệp'}</h3>
                  <p>{currentLang === 'en' ? 'Centrally positioned wind & solar farm hubs; developing Buon Ma Thuot - Khanh Hoa highway opening swift coastal trade access.' : 'Trung tâm điện gió, điện mặt trời quy mô lớn; tuyến cao tốc Buôn Ma Thuột — Khánh Hòa mở toang cửa ngõ giao thương hướng biển.'}</p>
                  <Link to="/posts?category=Đầu%20tư%20&%20Dự%20án" className="quick-access-link">{currentLang === 'en' ? 'View infrastructure →' : 'Xem hạ tầng KCN →'}</Link>
                </div>
              </div>

              {/* Strength 4 */}
              <div className="strength-card">
                <div className="strength-img-box">
                  <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" alt="Không gian phát triển" />
                  <span className="strength-tag" style={{ background: 'rgba(122, 62, 29, 0.9)' }}>{currentLang === 'en' ? 'Urban Hub' : 'Đô Thị Trung Tâm'}</span>
                </div>
                <div className="strength-body">
                  <h3>{currentLang === 'en' ? 'Open Regional Development Space' : 'Không Gian Phát Triển Vùng Mở'}</h3>
                  <p>{currentLang === 'en' ? 'Buon Ma Thuot is oriented as the center of the Central Highlands region, featuring dynamic innovation, healthcare, and education.' : 'Buôn Ma Thuột định hướng trở thành đô thị trung tâm vùng Tây Nguyên, hạt nhân đổi mới sáng tạo, tài chính, giáo dục và y tế chuyên sâu.'}</p>
                  <Link to="/posts?category=Dữ%20liệu%20&%20Báo%20cáo" className="quick-access-link">{currentLang === 'en' ? 'Economic data →' : 'Báo cáo kinh tế →'}</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 5: 3 TẦNG GIÁ TRỊ (MEDIA - DATA - PLATFORM)
            ======================================================== */}
        <section className="daklak-section">
          <div className="daklak-container">
            <div className="daklak-section-header">
              <span className="daklak-section-badge">{currentLang === 'en' ? 'Architecture' : 'Kiến Trúc Nền Tảng'}</span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'From Information Portal to Investment Platform' : 'Từ Trang Thông Tin Đến Nền Tảng Kết Nối Đầu Tư'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'DakLak.today builds 3 interconnected value layers that form a compounding growth engine for the local business community.'
                  : 'Mô hình 3 tầng giá trị Media — Data — Platform giúp nền tảng phát triển bền vững, giữ vị thế độc lập và tạo giao dịch kinh tế thực tế.'}
              </p>
            </div>

            <div className="layers-grid">
              {/* Layer 1: Media */}
              <div className="layer-card">
                <span className="layer-badge">1. MEDIA • Truyền thông</span>
                <h3>{currentLang === 'en' ? 'Media & Storytelling' : 'Tin Tức & Kể Chuyện Địa Phương'}</h3>
                <ul>
                  <li><i className="ti ti-check" /> Phóng sự chuyên sâu về con người, buôn làng và nông sản Đắk Lắk.</li>
                  <li><i className="ti ti-check" /> Chuyên mục phân tích ngành hàng cà phê, hồ tiêu, sầu riêng xuất khẩu.</li>
                  <li><i className="ti ti-check" /> Gương mặt doanh nhân tiêu biểu, mô hình khởi nghiệp đổi mới sáng tạo.</li>
                  <li><i className="ti ti-check" /> Cập nhật chính sách, quy hoạch và chỉ đạo điều hành tỉnh Đắk Lắk.</li>
                </ul>
              </div>

              {/* Layer 2: Data */}
              <div className="layer-card layer-data">
                <span className="layer-badge">2. DATA • Cơ sở dữ liệu</span>
                <h3>{currentLang === 'en' ? 'Structured Data Assets' : 'Dữ Liệu Doanh Nghiệp & Dự Án'}</h3>
                <ul>
                  <li><i className="ti ti-check" /> Danh bạ hồ sơ năng lực 12.000+ doanh nghiệp đã xác thực thông tin.</li>
                  <li><i className="ti ti-check" /> Bản đồ dữ liệu quy hoạch quỹ đất công nghiệp, vùng nguyên liệu sạch.</li>
                  <li><i className="ti ti-check" /> Báo cáo biến động giá nông sản, thị trường cà phê thế giới theo ngày.</li>
                  <li><i className="ti ti-check" /> Hồ sơ năng lực các dự án trọng điểm đang kêu gọi dòng vốn đầu tư.</li>
                </ul>
              </div>

              {/* Layer 3: Platform */}
              <div className="layer-card layer-platform">
                <span className="layer-badge">3. PLATFORM • Nền tảng số</span>
                <h3>{currentLang === 'en' ? 'Smart Connection Platform' : 'Kết Nối Đầu Tư & AI Matching'}</h3>
                <ul>
                  <li><i className="ti ti-check" /> Cơ chế gửi yêu cầu kết nối giao thương B2B trực tiếp tới doanh nghiệp.</li>
                  <li><i className="ti ti-check" /> AI Matching: Tự động ghép nối nhà đầu tư với quỹ đất và dự án tối ưu.</li>
                  <li><i className="ti ti-check" /> Hệ thống cấp vé điện tử QR, soát vé thời gian thực cho sự kiện diễn đàn.</li>
                  <li><i className="ti ti-check" /> Dịch vụ Data Room hỗ trợ thẩm định dự án và xúc tiến đầu tư một cửa.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 6: CÀ PHÊ — TRỤ CỘT THƯƠNG HIỆU CỦA DAKLAK.TODAY
            ======================================================== */}
        <section className="daklak-section dark" id="coffee">
          <div className="daklak-container">
            <div className="daklak-section-header">
              <span className="daklak-section-badge">{currentLang === 'en' ? 'Brand Pillar' : 'Trụ Cột Bản Sắc'}</span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'Coffee — The Core Brand Pillar of DakLak.today' : 'Cà Phê — Trụ Cột Thương Hiệu Của DakLak.today'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'Kể câu chuyện hoàn chỉnh từ đất bazan, vùng trồng hữu cơ, bàn tay người nông dân đến công nghệ chế biến sâu và thị trường toàn cầu.'
                  : 'DakLak.today kể câu chuyện hoàn chỉnh của cà phê: từ đất bazan, giọt mồ hôi người nông dân đến công nghệ chế biến sâu và hành trình vươn ra thế giới.'}
              </p>
            </div>

            <div className="coffee-grid">
              {/* Timeline 4 Chặng */}
              <div className="coffee-timeline">
                <div className="coffee-step">
                  <div className="coffee-step-number">01</div>
                  <div className="coffee-step-content">
                    <h4>{currentLang === 'en' ? 'Raw Material Zone' : 'Vùng Nguyên Liệu Đất Đỏ Bazan'}</h4>
                    <p>{currentLang === 'en' ? 'Over 800m altitude, nutrient-dense volcanic soil nurturing top-tier Robusta & Arabica beans.' : 'Độ cao lý tưởng trên 800m, tầng đất bazan màu mỡ giúp hạt cà phê Robusta Buôn Ma Thuột đạt hương vị đậm đà độc bản.'}</p>
                  </div>
                </div>

                <div className="coffee-step">
                  <div className="coffee-step-number">02</div>
                  <div className="coffee-step-content">
                    <h4>{currentLang === 'en' ? 'Coffee Farmers & Cooperatives' : 'Người Làm Cà Phê & HTX Kiểu Mới'}</h4>
                    <p>{currentLang === 'en' ? 'Sustainable farming, 100% selective ripe cherry picking, ensuring high sugar content and transparent traceability.' : 'Mô hình liên kết nông hộ, hái chọn trái chín 100%, canh tác hữu cơ bền vững bảo vệ nguồn nước và đất đai đại ngàn.'}</p>
                  </div>
                </div>

                <div className="coffee-step">
                  <div className="coffee-step-number">03</div>
                  <div className="coffee-step-content">
                    <h4>{currentLang === 'en' ? 'Deep Processing Technology' : 'Công Nghệ Chế Biến Sâu Hiện Đại'}</h4>
                    <p>{currentLang === 'en' ? 'Transitioning from raw green bean trade to specialty roasted beans, instant freeze-dried extracts, and craft coffee.' : 'Chuyển dịch mạnh mẽ từ xuất thô sang chế biến sâu: rang xay tiêu chuẩn châu Âu, sấy lạnh, trích ly tinh chất giá trị cao.'}</p>
                  </div>
                </div>

                <div className="coffee-step">
                  <div className="coffee-step-number">04</div>
                  <div className="coffee-step-content">
                    <h4>{currentLang === 'en' ? 'Global Market Expansion' : 'Chinh Phục Thị Trường Toàn Cầu'}</h4>
                    <p>{currentLang === 'en' ? 'Exporting branded specialty coffee to 80+ countries, raising bean value up to 4x compared to raw exports.' : 'Xây dựng thương hiệu cà phê Đắk Lắk tại Mỹ, EU, Nhật Bản, Trung Quốc; nâng giá trị gia tăng thặng dư gấp 3 - 4 lần.'}</p>
                  </div>
                </div>
              </div>

              {/* Case Study & Chuỗi giá trị */}
              <div className="coffee-case-box">
                <h3>☕ {currentLang === 'en' ? 'Value Chain Case Study' : 'Điển Hình Chuỗi Giá Trị Cà Phê'}</h3>
                
                <div className="coffee-case-highlight">
                  <h4>Bazan Heritage Coffee — Từ Nông Trường Đến Tách Cà Phê</h4>
                  <p>
                    Là minh chứng sống động cho chiến lược đầu tư công nghệ chế biến sâu tại Đắk Lắk. Sở hữu vùng trồng hữu cơ tại Cư M’gar, nhà máy rang xay chuẩn quốc tế và cam kết phát triển cộng đồng bền vững.
                  </p>
                </div>

                <p style={{ fontSize: '0.88rem', color: '#BFAEA2', fontStyle: 'italic', marginBottom: '20px' }}>
                  * DakLak.today cam kết tính minh bạch: Các bài viết thương mại và đối tác tài trợ luôn được gắn nhãn độc lập để bảo vệ tính khách quan lâu dài của nền tảng.
                </p>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Link to="/posts?category=Cà%20phê%20Đắk%20Lắk" className="btn-daklak-gold" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
                    Xem Chuyên mục Cà phê
                  </Link>
                  <button onClick={() => scrollToConsult('Hợp tác Chuỗi giá trị Cà phê')} className="btn-daklak-outline" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
                    Kết nối Doanh nghiệp Cà phê
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 7: ĐẮK LẮK DATA DASHBOARD (6 CHỈ SỐ KINH TẾ)
            ======================================================== */}
        <section className="daklak-section" style={{ backgroundColor: '#F3ECE1' }}>
          <div className="daklak-container">
            <div className="daklak-section-header" style={{ marginBottom: '30px' }}>
              <span className="daklak-section-badge">{currentLang === 'en' ? 'Regional Indicators' : 'Dữ Liệu Kinh Tế'}</span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'Dak Lak by Verified Data' : 'Đắk Lắk Bằng Những Con Số Biết Nói'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'Key indicators illustrating the scale and growth potential of the Central Highlands economic hub.'
                  : 'Các chỉ số tổng hợp minh họa quy mô và tiềm năng phát triển vượt bậc của trung tâm kinh tế Tây Nguyên.'}
              </p>
            </div>

            <div className="data-stats-grid">
              <div className="data-stat-card">
                <div className="data-stat-num">213.000+</div>
                <div className="data-stat-label">Hécta Cà phê</div>
                <div className="data-stat-sub">Thủ phủ lớn nhất Việt Nam</div>
              </div>

              <div className="data-stat-card">
                <div className="data-stat-num">560.000+</div>
                <div className="data-stat-label">Tấn Sản lượng/Năm</div>
                <div className="data-stat-sub">Cung ứng hơn 30% sản lượng cả nước</div>
              </div>

              <div className="data-stat-card">
                <div className="data-stat-num">1,6+ Tỷ $</div>
                <div className="data-stat-label">Kim ngạch Xuất khẩu</div>
                <div className="data-stat-sub">Tăng trưởng bền vững 14%/năm</div>
              </div>

              <div className="data-stat-card">
                <div className="data-stat-num">12.500+</div>
                <div className="data-stat-label">Doanh nghiệp</div>
                <div className="data-stat-sub">Cộng đồng hội viên năng động</div>
              </div>

              <div className="data-stat-card">
                <div className="data-stat-num">50+</div>
                <div className="data-stat-label">Dự án Kêu gọi Đầu tư</div>
                <div className="data-stat-sub">Quy hoạch quỹ đất sạch 2026-2030</div>
              </div>

              <div className="data-stat-card">
                <div className="data-stat-num">38,7%</div>
                <div className="data-stat-label">Độ che phủ Rừng</div>
                <div className="data-stat-sub">Lợi thế hấp thụ Carbon & Tín chỉ ESG</div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 8: CƠ HỘI ĐẦU TƯ & DỰ ÁN TRỌNG ĐIỂM (id="tu-van-linh-vuc")
            ======================================================== */}
        <section className="daklak-section" id="tu-van-linh-vuc">
          <div className="daklak-container">
            <div className="daklak-section-header">
              <span className="daklak-section-badge">{currentLang === 'en' ? 'Open Opportunities' : 'Cơ Hội Đang Mở'}</span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'Key Investment Projects in Dak Lak' : 'Dự Án Trọng Điểm Kêu Gọi Hợp Tác & Đầu Tư'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'Curated list of verified investment projects ready for capital injection and strategic cooperation.'
                  : 'Danh mục các dự án đã được thẩm định quy hoạch, sẵn sàng quỹ đất sạch và chào đón các nhà đầu tư chiến lược.'}
              </p>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '20px' }}>
                <button
                  onClick={() => setSelectedSector('all')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '20px',
                    border: '1px solid var(--bazan-red)',
                    background: selectedSector === 'all' ? 'var(--bazan-red)' : 'transparent',
                    color: selectedSector === 'all' ? '#FFF' : 'var(--primary-coffee)',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Tất cả lĩnh vực ({investmentProjects.length})
                </button>
                <button
                  onClick={() => setSelectedSector('agro')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '20px',
                    border: '1px solid var(--bazan-red)',
                    background: selectedSector === 'agro' ? 'var(--bazan-red)' : 'transparent',
                    color: selectedSector === 'agro' ? '#FFF' : 'var(--primary-coffee)',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Chế biến nông sản
                </button>
                <button
                  onClick={() => setSelectedSector('hitech')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '20px',
                    border: '1px solid var(--bazan-red)',
                    background: selectedSector === 'hitech' ? 'var(--bazan-red)' : 'transparent',
                    color: selectedSector === 'hitech' ? '#FFF' : 'var(--primary-coffee)',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Nông nghiệp CNC
                </button>
                <button
                  onClick={() => setSelectedSector('logistics')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '20px',
                    border: '1px solid var(--bazan-red)',
                    background: selectedSector === 'logistics' ? 'var(--bazan-red)' : 'transparent',
                    color: selectedSector === 'logistics' ? '#FFF' : 'var(--primary-coffee)',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Logistics & Kho bãi
                </button>
                <button
                  onClick={() => setSelectedSector('tourism')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '20px',
                    border: '1px solid var(--bazan-red)',
                    background: selectedSector === 'tourism' ? 'var(--bazan-red)' : 'transparent',
                    color: selectedSector === 'tourism' ? '#FFF' : 'var(--primary-coffee)',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Du lịch Sinh thái
                </button>
              </div>
            </div>

            <div className="projects-grid">
              {filteredProjects.map((project) => (
                <div key={project.id} className="project-card">
                  <div>
                    <div className="project-header-row">
                      <span className="project-sector-badge">{project.sector}</span>
                      <span className="project-status-badge">⭐ {project.status}</span>
                    </div>

                    <h3>{project.title}</h3>

                    <div className="project-meta-list">
                      <div className="project-meta-item">
                        <i className="ti ti-map-pin" />
                        <span><strong>Địa bàn:</strong> {project.location}</span>
                      </div>
                      <div className="project-meta-item">
                        <i className="ti ti-coin" />
                        <span><strong>Quy mô vốn:</strong> {project.scale}</span>
                      </div>
                      <div className="project-meta-item">
                        <i className="ti ti-info-circle" />
                        <span>{project.desc}</span>
                      </div>
                    </div>
                  </div>

                  <div className="project-btn-row">
                    <button 
                      onClick={() => scrollToConsult(`Dự án: ${project.title}`)}
                      className="btn-daklak-primary"
                      style={{ padding: '10px 18px', fontSize: '0.88rem', flex: 1, justifyContent: 'center' }}
                    >
                      Gửi Yêu Cầu Kết Nối
                    </button>
                    <Link
                      to={`/posts?category=Đầu%20tư%20&%20Dự%20án`}
                      className="btn-daklak-outline"
                      style={{ padding: '10px 16px', fontSize: '0.88rem', color: 'var(--primary-coffee)', borderColor: 'var(--border-strong)' }}
                    >
                      Hồ sơ
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 9: BẢNG TIN & CÂU CHUYỆN ĐẮK LẮK HÔM NAY (DYNAMIC POSTS)
            ======================================================== */}
        <section className="daklak-section" style={{ backgroundColor: 'var(--cream-alt)' }}>
          <div className="daklak-container">
            <div className="daklak-section-header">
              <span className="daklak-section-badge">{currentLang === 'en' ? 'Stories & News' : 'Câu Chuyện Hôm Nay'}</span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'Dak Lak Stories & Latest Business Opportunities' : 'Nhịp Đập Kinh Tế & Cơ Hội Giao Thương Mới'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'Real-time updates, economic insights, and enterprise reports published on DakLak.today.'
                  : 'Thông tin phân tích độc lập, câu chuyện sản xuất thực tế và các cơ hội kết nối giao thương được cập nhật liên tục.'}
              </p>
            </div>

            <div className={`posts-grid count-${Math.min(4, latestPosts.length || 4)}`}>
              {latestPosts.map((post) => (
                <div key={post.id || post.slug} className="post-card">
                  <div className="post-card-img-box">
                    <img 
                      src={post.image_url || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'} 
                      alt={post.title}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <span className="post-cat-badge">{post.category || 'Tin nổi bật'}</span>
                  </div>
                  <div className="post-card-body">
                    <div className="post-card-date">
                      <i className="ti ti-calendar" />
                      <span>{post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : 'Mới cập nhật'}</span>
                      {post.author_name && <span style={{ marginLeft: '8px' }}>• {post.author_name}</span>}
                    </div>
                    <h3 className="post-card-title">{post.title}</h3>
                    <p className="post-card-summary">{post.summary || post.short_desc || 'Bấm để đọc toàn bộ bài viết và khám phá cơ hội giao thương...'}</p>
                    <Link to={`/posts/${post.slug || post.id}`} className="quick-access-link" style={{ marginTop: 'auto' }}>
                      {currentLang === 'en' ? 'Read full article →' : 'Đọc toàn văn →'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link to="/posts" className="btn-daklak-outline" style={{ color: 'var(--primary-coffee)', borderColor: 'var(--bazan-red)' }}>
                {currentLang === 'en' ? 'View all articles & opportunities' : 'Xem toàn bộ bảng tin & cơ hội giao thương'} <i className="ti ti-arrow-right" />
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 10: DOANH NGHIỆP ĐẮK LẮK TIÊU BIỂU (DYNAMIC MEMBERS)
            ======================================================== */}
        <section className="daklak-section">
          <div className="daklak-container">
            <div className="daklak-section-header">
              <span className="daklak-section-badge">{currentLang === 'en' ? 'Verified Directory' : 'Hội Viên Tiêu Biểu'}</span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'Leading Enterprises & Ecosystem Partners' : 'Cộng Đồng Doanh Nghiệp Đắk Lắk'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'Verified profiles of top local companies and strategic investment partners in Dak Lak.'
                  : 'Hồ sơ năng lực của các doanh nghiệp đầu ngành đã xác thực, tiên phong nâng tầm chuỗi giá trị và hội nhập quốc tế.'}
              </p>
            </div>

            <div className={`members-grid count-${Math.min(4, featuredMembers.length || 3)}`}>
              {featuredMembers.map((m) => (
                <div key={m.id} className="member-card">
                  <div className="member-card-header">
                    <img 
                      src={m.logo_url || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80'} 
                      alt={m.company_name || m.name} 
                      className="member-logo"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <div className="member-info">
                      <h4>{m.company_name || m.name}</h4>
                      <span className="member-tier-pill">⭐ {m.tier || 'Thành viên'} Partner</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.5', flexGrow: 1 }}>
                    {m.bio || m.description || `Lĩnh vực hoạt động: ${m.industry || 'Sản xuất & kinh doanh nông sản'}.`}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(122, 62, 29, 0.08)' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>📍 {m.address || 'TP. Buôn Ma Thuột'}</span>
                    <Link to="/members" className="quick-access-link" style={{ fontSize: '0.85rem' }}>
                      Xem Showroom →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '35px' }}>
              <Link to="/members" className="btn-daklak-primary">
                <i className="ti ti-address-book" />
                <span>{currentLang === 'en' ? 'Explore Full Enterprise Directory' : 'Tra cứu Danh bạ Toàn bộ Doanh nghiệp'}</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 11: SỰ KIỆN NỔI BẬT & COUNTDOWN (id="su-kien")
            ======================================================== */}
        <section className="daklak-section" id="su-kien" style={{ backgroundColor: '#26160E', color: '#FFF' }}>
          <div className="daklak-container">
            <div className="daklak-section-header">
              <span className="daklak-section-badge" style={{ background: 'rgba(213, 163, 63, 0.2)', color: 'var(--gong-gold)', borderColor: 'var(--gong-gold)' }}>
                {currentLang === 'en' ? 'Upcoming Forum' : 'Sự Kiện Trọng Điểm'}
              </span>
              <h2 className="daklak-section-title" style={{ color: '#FFF' }}>
                {currentLang === 'en' ? 'Upcoming Events & Trade Summits' : 'Lễ Hội & Diễn Đàn Xúc Tiến Sắp Diễn Ra'}
              </h2>
              <p className="daklak-section-desc" style={{ color: '#D1C5BC' }}>
                {currentLang === 'en'
                  ? 'Connect directly with government leaders, international trade delegations, and institutional investors.'
                  : 'Nơi quy tụ các chuyên gia kinh tế, nhà xuất nhập khẩu quốc tế và cơ hội tiếp cận dòng vốn đầu tư trực tiếp.'}
              </p>
            </div>

            {eventsList && eventsList.length > 0 && (
              <div className="featured-event-box">
                <div>
                  <span style={{ display: 'inline-block', background: 'var(--bazan-red)', color: '#FFF', padding: '4px 12px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: '800', marginBottom: '14px' }}>
                    SỰ KIỆN TIÊU ĐIỂM
                  </span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#FFF', marginBottom: '14px', lineHeight: '1.3' }}>
                    {eventsList[0].title}
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: '#E0D4CA', marginBottom: '18px', lineHeight: '1.6' }}>
                    {eventsList[0].short_desc || eventsList[0].description}
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: '#D1C5BC' }}>
                    <div>📍 <strong>Địa điểm:</strong> {eventsList[0].location || 'TP. Buôn Ma Thuột, Tỉnh Đắk Lắk'}</div>
                    <div>🏢 <strong>Đơn vị tổ chức:</strong> {eventsList[0].organizer || 'DakLak.today Platform'}</div>
                  </div>

                  <div style={{ marginTop: '24px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => {
                        setRegisterModalEvent(eventsList[0]);
                        setRegSuccess(null);
                      }}
                      className="btn-daklak-gold"
                    >
                      <i className="ti ti-ticket" />
                      <span>{currentLang === 'en' ? 'Get QR Ticket Now' : 'Đăng Ký Vé QR Miễn Phí'}</span>
                    </button>
                    <Link to={`/events/${eventsList[0].id}`} className="btn-daklak-outline">
                      {currentLang === 'en' ? 'Event Details' : 'Xem chi tiết sự kiện'}
                    </Link>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', color: 'var(--gong-gold)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    ⏳ ĐẾM NGƯỢC THỜI GIAN KHAI MẠC
                  </div>

                  <div className="countdown-timer-grid">
                    <div className="countdown-timer-unit">
                      <div className="countdown-timer-num">{String(timeLeft.days).padStart(2, '0')}</div>
                      <div className="countdown-timer-label">Ngày</div>
                    </div>
                    <div className="countdown-timer-unit">
                      <div className="countdown-timer-num">{String(timeLeft.hours).padStart(2, '0')}</div>
                      <div className="countdown-timer-label">Giờ</div>
                    </div>
                    <div className="countdown-timer-unit">
                      <div className="countdown-timer-num">{String(timeLeft.minutes).padStart(2, '0')}</div>
                      <div className="countdown-timer-label">Phút</div>
                    </div>
                    <div className="countdown-timer-unit">
                      <div className="countdown-timer-num">{String(timeLeft.seconds).padStart(2, '0')}</div>
                      <div className="countdown-timer-label">Giây</div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#BFAEA2' }}>
                    Hệ thống cấp vé QR tự động • Quét mã camera điểm danh trong 1 giây
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================
            SECTION 12: DU LỊCH & TRẢI NGHIỆM ("ĐI ĐÂU CUỐI TUẦN?")
            ======================================================== */}
        <section className="daklak-section" style={{ backgroundColor: '#F8F3EC' }}>
          <div className="daklak-container">
            <div className="daklak-section-header">
              <span className="daklak-section-badge">{currentLang === 'en' ? 'Travel Experiences' : 'Khám Phá Cuối Tuần'}</span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'Touch the Great Forests — Experience Dak Lak Deeper' : 'Chạm Vào Đại Ngàn — Trải Nghiệm Đắk Lắk Sâu Hơn'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'Carefully curated experiential itineraries designed for culture explorers and eco-travelers.'
                  : 'Gợi ý các hành trình trải nghiệm được biên tập chuyên sâu, kết nối ẩm thực bản địa, thiên nhiên hùng vĩ và làng nghề cà phê.'}
              </p>
            </div>

            <div className="itinerary-grid">
              {/* Itinerary 1 */}
              <div className="itinerary-card">
                <div style={{ position: 'relative', height: '200px' }}>
                  <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" alt="Hành trình 2N1Đ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span className="itinerary-badge">Hành trình 2 Ngày 1 Đêm</span>
                </div>
                <div className="itinerary-body">
                  <h3>Hành Trình Di Sản Cà Phê & Thác Nước Đại Ngàn</h3>
                  <div className="itinerary-stops">Buôn Ma Thuột ➔ Thác Dray Nur ➔ Bảo tàng Cà phê</div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', flexGrow: 1 }}>
                    Khám phá ly cà phê nồng nàn tại thủ phủ, thưởng lãm kiến trúc Bảo tàng Thế giới Cà phê và đón hoàng hôn bên cụm thác Dray Nur - Dray Sáp huyền thoại.
                  </p>
                  <Link to="/posts?category=Du%20lịch%20&%20Trải%20nghiệm" className="quick-access-link" style={{ marginTop: '14px' }}>
                    Xem lịch trình chi tiết →
                  </Link>
                </div>
              </div>

              {/* Itinerary 2 */}
              <div className="itinerary-card">
                <div style={{ position: 'relative', height: '200px' }}>
                  <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80" alt="Hành trình 3N2Đ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span className="itinerary-badge" style={{ background: 'var(--bazan-brown)' }}>Hành trình 3 Ngày 2 Đêm</span>
                </div>
                <div className="itinerary-body">
                  <h3>Thảo Nguyên Xanh, Hồ Lắk & Hồn Sử Thi M’Nông</h3>
                  <div className="itinerary-stops">TP. Buôn Ma Thuột ➔ Vườn QG Yok Đôn ➔ Hồ Lắk</div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', flexGrow: 1 }}>
                    Trải nghiệm đi thuyền độc mộc trên Hồ Lắk thơ mộng, nghỉ đêm tại biệt điện Bảo Đại, nghe nghệ nhân kể Khan và thưởng thức cơm lam gà sa lửa.
                  </p>
                  <Link to="/posts?category=Du%20lịch%20&%20Trải%20nghiệm" className="quick-access-link" style={{ marginTop: '14px' }}>
                    Xem lịch trình chi tiết →
                  </Link>
                </div>
              </div>

              {/* Itinerary 3 */}
              <div className="itinerary-card">
                <div style={{ position: 'relative', height: '200px' }}>
                  <img src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80" alt="Cà phê farmstay" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span className="itinerary-badge" style={{ background: 'var(--bazan-red)' }}>Nông nghiệp Sinh thái</span>
                </div>
                <div className="itinerary-body">
                  <h3>Coffee Farm Tour: Một Ngày Làm Nông Dân Hái Cà Phê</h3>
                  <div className="itinerary-stops">Cư M’gar ➔ Nông trường Hữu cơ ➔ Xưởng Rang thủ công</div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', flexGrow: 1 }}>
                    Trực tiếp hái những trái cà phê chín mọng, học kỹ thuật thử nếm Cupping quốc tế và tự tay rang mẻ cà phê kỷ niệm mang về làm quà.
                  </p>
                  <Link to="/posts?category=Du%20lịch%20&%20Trải%20nghiệm" className="quick-access-link" style={{ marginTop: '14px' }}>
                    Xem lịch trình chi tiết →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 13: TRỢ LÝ AI & AI MATCHING ĐẦU TƯ
            ======================================================== */}
        <section className="daklak-section" style={{ backgroundColor: '#1C0F08' }}>
          <div className="daklak-container">
            <div className="ai-box">
              <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
                <span className="daklak-section-badge" style={{ background: 'rgba(213, 163, 63, 0.2)', color: 'var(--gong-gold)', border: '1px solid var(--gong-gold)' }}>
                  🤖 TRÍ TUỆ NHÂN TẠO TÂY NGUYÊN
                </span>
                <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#FFF', margin: '14px 0 16px' }}>
                  Hỏi AI Về Đắk Lắk — Biến Dữ Liệu Thành Cơ Hội Hợp Tác
                </h2>
                <p style={{ color: '#D1C5BC', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '25px' }}>
                  Trợ lý AI Gemini Flash được nạp sẵn tri thức về quy hoạch tỉnh, danh bạ doanh nghiệp, cơ chế thuế, dự án kêu gọi đầu tư và cẩm nang du lịch Đắk Lắk.
                </p>

                {/* AI Input Form */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '50px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  marginBottom: '20px'
                }}>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Tôi muốn đầu tư 50 tỷ vào nông nghiệp công nghệ cao..."
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      padding: '12px 22px',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      color: 'var(--text-dark)',
                      background: 'transparent'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        navigate(`/ai-chat?q=${encodeURIComponent(e.target.value.trim())}`);
                      }
                    }}
                  />
                  <Link 
                    to="/ai-chat"
                    className="btn-daklak-primary"
                    style={{ padding: '12px 26px', borderRadius: '40px' }}
                  >
                    <span>Hỏi AI</span>
                    <i className="ti ti-sparkles" />
                  </Link>
                </div>

                {/* Quick suggestions */}
                <div style={{ fontSize: '0.85rem', color: '#BFAEA2', marginBottom: '8px' }}>
                  Gợi ý câu hỏi thông minh:
                </div>
                <div className="ai-query-chips" style={{ justifyContent: 'center' }}>
                  <span className="ai-query-chip" onClick={() => navigate('/ai-chat?q=Tìm%20doanh%20nghiệp%20chế%20biến%20sâu%20cà%20phê%20uy%20tín')}>
                    ☕ Tìm doanh nghiệp chế biến sâu cà phê
                  </span>
                  <span className="ai-query-chip" onClick={() => navigate('/ai-chat?q=Quy%20hoạch%20khu%20công%20nghiệp%20Hòa%20Phú%20mở%20rộng')}>
                    🏭 Quy hoạch KCN Hòa Phú mở rộng
                  </span>
                  <span className="ai-query-chip" onClick={() => navigate('/ai-chat?q=Lịch%20trình%20du%20lịch%20Buôn%20Ma%20Thuột%202%20ngày%201%20đêm')}>
                    🧭 Gợi ý lịch trình 2 ngày 1 đêm
                  </span>
                  <span className="ai-query-chip" onClick={() => navigate('/ai-chat?q=Chính%20sách%20ưu%20đãi%20thuế%20đầu%20tư%20vào%20Đắk%20Lắk')}>
                    💰 Chính sách ưu đãi thuế đầu tư
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 14: LỘ TRÌNH 6 GIAI ĐOẠN PHÁT TRIỂN HỆ SINH THÁI SỐ
            ======================================================== */}
        <section className="daklak-section">
          <div className="daklak-container">
            <div className="daklak-section-header">
              <span className="daklak-section-badge">{currentLang === 'en' ? 'Digital Roadmap' : 'Lộ Trình Phát Triển'}</span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'From Vision to a Comprehensive Digital Ecosystem' : 'Lộ Trình Xây Dựng Hệ Sinh Thái Số Đắk Lắk'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'A disciplined multi-stage development plan ensuring sustainability, credibility, and lasting commercial value.'
                  : 'Chiến lược phát triển 6 giai đoạn đưa DakLak.today từng bước trở thành cổng kết nối đầu tư hạt nhân của toàn vùng Tây Nguyên.'}
              </p>
            </div>

            <div className="roadmap-grid">
              <div className="roadmap-card">
                <div className="roadmap-stage">Giai đoạn 1 (0 – 6 tháng)</div>
                <h4>Xây Dựng Uy Tín</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Xuất bản tin tức kinh tế chất lượng, văn hóa cà phê, thu hút độc giả tự nhiên và định vị nhận diện thương hiệu số.</p>
              </div>

              <div className="roadmap-card" style={{ borderLeftColor: 'var(--forest-green)' }}>
                <div className="roadmap-stage" style={{ color: 'var(--forest-green)' }}>Giai đoạn 2 (3 – 9 tháng)</div>
                <h4>Cơ Sở Dữ Liệu Nền</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Chuẩn hóa danh mục doanh nghiệp, vùng nguyên liệu, quỹ đất và dự án kêu gọi đầu tư theo cấu trúc số hiện đại.</p>
              </div>

              <div className="roadmap-card" style={{ borderLeftColor: 'var(--gong-gold)' }}>
                <div className="roadmap-stage" style={{ color: '#B3832B' }}>Giai đoạn 3 (6 – 12 tháng)</div>
                <h4>MVP Kết Nối Đầu Tư</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Mở tính năng đăng dự án, gửi yêu cầu kết nối giao thương B2B, quản lý hồ sơ và đặt lịch làm việc với nhà đầu tư.</p>
              </div>

              <div className="roadmap-card" style={{ borderLeftColor: 'var(--bazan-brown)' }}>
                <div className="roadmap-stage" style={{ color: 'var(--bazan-brown)' }}>Giai đoạn 4 (12 – 18 tháng)</div>
                <h4>AI Matching Đa Nguồn</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Ứng dụng AI ghép đôi nhà đầu tư với doanh nghiệp, phân tích khả năng gọi vốn và tự động gợi ý đối tác theo chuỗi giá trị.</p>
              </div>

              <div className="roadmap-card">
                <div className="roadmap-stage">Giai đoạn 5 (18 – 24 tháng)</div>
                <h4>Hệ Sinh Thái Đầu Tư</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Tích hợp mạng lưới ngân hàng, quỹ ESG, kiểm toán, luật sư tư vấn M&A và các công ty logistics hỗ trợ trọn gói.</p>
              </div>

              <div className="roadmap-card" style={{ borderLeftColor: 'var(--gong-gold)' }}>
                <div className="roadmap-stage" style={{ color: '#B3832B' }}>Tầm nhìn 2 – 5 năm</div>
                <h4>Tài Sản Dữ Liệu & AI</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Phát triển chỉ số môi trường đầu tư Đắk Lắk, bản đồ dòng vốn FDI, phòng dữ liệu ảo Data Room phục vụ giao dịch lớn.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 15: GÓI THAM GIA MẠNG LƯỚI (MEMBERSHIP TIERS)
            ======================================================== */}
        <section className="daklak-section" style={{ backgroundColor: 'var(--cream-alt)' }}>
          <div className="daklak-container">
            <div className="daklak-section-header">
              <span className="daklak-section-badge">{currentLang === 'en' ? 'Membership' : 'Gia Nhập Mạng Lưới'}</span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'Flexible Membership Packages' : 'Lựa Chọn Gói Tham Gia Phù Hợp'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'Join our verified business community to expand your network, elevate brand awareness, and capture growth.'
                  : 'Gia nhập cộng đồng doanh nghiệp và đối tác đầu tư Đắk Lắk. Gói Khám phá & Gói Silver được duyệt tự động ngay lập tức.'}
              </p>
            </div>

            <div className="tiers-grid">
              {/* Tier 1 */}
              <div className="tier-card">
                <div>
                  <span className="tier-badge">CƠ BẢN</span>
                  <h3 className="tier-title">Khám Phá</h3>
                  <div className="tier-price">Miễn phí</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', textAlign: 'left', fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>✓ Xem đầy đủ tin tức & sự kiện</li>
                    <li>✓ Tra cứu danh bạ doanh nghiệp</li>
                    <li>✓ Hỏi đáp Trợ lý AI miễn phí</li>
                    <li>✓ Đăng ký vé QR tham gia sự kiện</li>
                  </ul>
                </div>
                <Link to="/register" className="btn-daklak-outline" style={{ color: 'var(--primary-coffee)', borderColor: 'var(--border-strong)', justifyContent: 'center' }}>
                  Đăng ký miễn phí
                </Link>
              </div>

              {/* Tier 2 */}
              <div className="tier-card featured">
                <div>
                  <span className="tier-badge" style={{ background: 'var(--bazan-red)', color: '#FFF' }}>PHỔ BIẾN NHẤT</span>
                  <h3 className="tier-title">Doanh Nghiệp Kết Nối</h3>
                  <div className="tier-price" style={{ color: 'var(--bazan-red)' }}>Silver Partner</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', textAlign: 'left', fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>✓ Tự động duyệt ngay lập tức</li>
                    <li>✓ Cấp Showroom số xác thực</li>
                    <li>✓ Đăng bài viết & cơ hội giao thương</li>
                    <li>✓ Nhận lead liên hệ đối tác trực tiếp</li>
                    <li>✓ Ưu tiên hiển thị trên trang chủ</li>
                  </ul>
                </div>
                <Link to="/register" className="btn-daklak-primary" style={{ justifyContent: 'center' }}>
                  Đăng ký Silver Ngay
                </Link>
              </div>

              {/* Tier 3 */}
              <div className="tier-card">
                <div>
                  <span className="tier-badge" style={{ background: 'rgba(213, 163, 63, 0.2)', color: '#B3832B' }}>CAO CẤP</span>
                  <h3 className="tier-title">Doanh Nghiệp Tiêu Biểu</h3>
                  <div className="tier-price" style={{ color: 'var(--primary-coffee)' }}>Gold Partner</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', textAlign: 'left', fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>✓ Đầy đủ quyền lợi gói Silver</li>
                    <li>✓ Huy hiệu Đối tác Vàng chứng nhận</li>
                    <li>✓ Bài PR chuyên đề phóng sự báo chí</li>
                    <li>✓ Ghép đôi ưu tiên với Nhà đầu tư</li>
                    <li>✓ Hỗ trợ chuẩn hóa hồ sơ gọi vốn</li>
                  </ul>
                </div>
                <button onClick={() => scrollToConsult('Gói Hội viên Gold Partner')} className="btn-daklak-gold" style={{ justifyContent: 'center' }}>
                  Tư vấn Nâng hạng
                </button>
              </div>

              {/* Tier 4 */}
              <div className="tier-card">
                <div>
                  <span className="tier-badge" style={{ background: 'rgba(31, 90, 58, 0.2)', color: 'var(--forest-green)' }}>CHIẾN LƯỢC</span>
                  <h3 className="tier-title">Nhà Đầu Tư Chiến Lược</h3>
                  <div className="tier-price" style={{ color: 'var(--forest-green)' }}>Diamond VIP</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', textAlign: 'left', fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>✓ Tiếp cận hồ sơ dự án bí mật Data Room</li>
                    <li>✓ Kết nối trực tiếp Lãnh đạo ban ngành</li>
                    <li>✓ Tham dự các phiên bàn tròn kín</li>
                    <li>✓ Cố vấn xúc tiến đầu tư 1 kèm 1</li>
                  </ul>
                </div>
                <button onClick={() => scrollToConsult('Gói Đối tác Chiến lược Diamond')} className="btn-daklak-outline" style={{ color: 'var(--forest-green)', borderColor: 'var(--forest-green)', justifyContent: 'center' }}>
                  Liên hệ Chuyên gia
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 16: CÂU HỎI THƯỜNG GẶP (FAQ ACCORDION)
            ======================================================== */}
        <section className="daklak-section">
          <div className="daklak-container">
            <div className="daklak-section-header">
              <span className="daklak-section-badge">{currentLang === 'en' ? 'FAQ' : 'Hỏi & Đáp'}</span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'Frequently Asked Questions' : 'Câu Hỏi Thường Gặp'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'Common inquiries regarding DakLak.today ecosystem features, memberships, and investor services.'
                  : 'Giải đáp những thắc mắc phổ biến về cơ chế hoạt động, bảo mật dữ liệu và quyền lợi tham gia mạng lưới.'}
              </p>
            </div>

            <div className="faq-list">
              {faqs.map((faq, index) => {
                const isOpen = activeFaq === index;
                return (
                  <div key={index} className="faq-item">
                    <button 
                      className="faq-question"
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                    >
                      <span>{faq.q}</span>
                      <i className={`ti ti-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: 'var(--bazan-red)' }} />
                    </button>
                    {isOpen && (
                      <div className="faq-answer">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 17: FORM ĐĂNG KÝ TƯ VẤN & HỢP TÁC ĐẦU TƯ (id="tu-van")
            ======================================================== */}
        <section className="daklak-section" id="tu-van" style={{ backgroundColor: '#F0E6DC' }}>
          <div className="daklak-container">
            <div className="daklak-section-header">
              <span className="daklak-section-badge">{currentLang === 'en' ? 'Consultation & Partnership' : 'Đăng Ký Tư Vấn'}</span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'Partner with DakLak.today' : 'Đăng Ký Tư Vấn & Kết Nối Hợp Tác Đầu Tư'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'Submit your enterprise details or project inquiries. Our investment specialists will contact you within 24 hours.'
                  : 'Quý doanh nghiệp và nhà đầu tư vui lòng gửi thông tin yêu cầu. Ban xúc tiến đầu tư sẽ liên hệ hỗ trợ trong vòng 24 giờ làm việc.'}
              </p>
            </div>

            <div className="consult-form-box">
              {formSubmitted ? (
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <div style={{ fontSize: '3rem', color: 'var(--forest-green)', marginBottom: '14px' }}>✓</div>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-coffee)', marginBottom: '10px' }}>
                    {currentLang === 'en' ? 'Submission Successful!' : 'Đã Tiếp Nhận Thông Tin Thành Công!'}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 20px', lineHeight: '1.6' }}>
                    Cảm ơn quý đơn vị đã quan tâm tới hệ sinh thái số Đắk Lắk. Chuyên viên cố vấn sẽ trực tiếp kết nối qua số điện thoại <strong>{formData.phone}</strong>.
                  </p>
                  <button 
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({
                        fullName: '',
                        phone: '',
                        email: '',
                        city: 'Đắk Lắk',
                        serviceNeed: 'Đầu tư nông nghiệp công nghệ cao & chế biến sâu',
                        companyName: '',
                        notes: '',
                        agreeTerms: true
                      });
                    }}
                    className="btn-daklak-primary"
                  >
                    Gửi yêu cầu khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleConsultSubmit}>
                  <div className="form-grid-2">
                    <div className="daklak-form-group">
                      <label>Họ và tên người liên hệ (*)</label>
                      <input 
                        type="text"
                        className="daklak-form-input"
                        placeholder="Ví dụ: Nguyễn Văn An"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="daklak-form-group">
                      <label>Số điện thoại liên hệ (*)</label>
                      <input 
                        type="tel"
                        className="daklak-form-input"
                        placeholder="Ví dụ: 0912 345 678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="daklak-form-group">
                      <label>Email làm việc</label>
                      <input 
                        type="email"
                        className="daklak-form-input"
                        placeholder="Ví dụ: contact@doanhnghiep.vn"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="daklak-form-group">
                      <label>Tên Doanh nghiệp / Đơn vị (*)</label>
                      <input 
                        type="text"
                        className="daklak-form-input"
                        placeholder="Ví dụ: Công ty Cổ phần Nông sản Tây Nguyên"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="daklak-form-group">
                      <label>Tỉnh / Thành phố hoạt động</label>
                      <input 
                        type="text"
                        className="daklak-form-input"
                        placeholder="Ví dụ: Đắk Lắk, TP.HCM, Hà Nội..."
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>

                    <div className="daklak-form-group">
                      <label>Lĩnh vực quan tâm & nhu cầu hợp tác</label>
                      <select 
                        className="daklak-form-select"
                        value={formData.serviceNeed}
                        onChange={(e) => setFormData({ ...formData, serviceNeed: e.target.value })}
                      >
                        <option value="Đầu tư nông nghiệp công nghệ cao & chế biến sâu">Đầu tư nông nghiệp CNC & chế biến sâu</option>
                        <option value="Chuỗi giá trị cà phê & nông sản đặc hữu">Chuỗi giá trị cà phê & nông sản đặc hữu</option>
                        <option value="Thuê đất KCN & Hạ tầng Logistics">Thuê đất KCN & Hạ tầng Logistics</option>
                        <option value="Du lịch sinh thái & Dịch vụ lưu trú">Du lịch sinh thái & Dịch vụ lưu trú</option>
                        <option value="Mở Showroom số & Quảng bá sản phẩm OCOP">Mở Showroom số & Quảng bá OCOP</option>
                        <option value="Tư vấn tiếp cận vốn vay & Quỹ ESG">Tư vấn tiếp cận vốn vay & Quỹ ESG</option>
                        <option value="Tham gia Mạng lưới Hội viên Doanh nghiệp">Tham gia Mạng lưới Hội viên Doanh nghiệp</option>
                      </select>
                    </div>
                  </div>

                  <div className="daklak-form-group">
                    <label>Chi tiết nhu cầu & nội dung cần hỗ trợ</label>
                    <textarea 
                      rows="3"
                      className="daklak-form-textarea"
                      placeholder="Mô tả cụ thể về quy mô dự án, sản phẩm cần hợp tác hoặc câu hỏi dành cho ban xúc tiến..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
                    <input 
                      type="checkbox" 
                      id="agreeTerms" 
                      checked={formData.agreeTerms} 
                      onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })} 
                      required
                    />
                    <label htmlFor="agreeTerms" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      Tôi đồng ý chia sẻ thông tin để Ban xúc tiến DakLak.today liên hệ tư vấn theo chính sách bảo mật.
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-daklak-primary"
                    disabled={formLoading}
                    style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1.05rem' }}
                  >
                    {formLoading ? 'Đang gửi thông tin...' : 'Gửi Yêu Cầu Kết Nối Ngay'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* QUICK EVENT REGISTRATION MODAL */}
      {registerModalEvent && (
        <div className="daklak-modal-overlay" onClick={() => setRegisterModalEvent(null)}>
          <div className="daklak-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="daklak-modal-close" onClick={() => setRegisterModalEvent(null)}>✕</button>

            {regSuccess ? (
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <div style={{ fontSize: '3rem', color: 'var(--forest-green)', marginBottom: '10px' }}>🎉</div>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-coffee)', marginBottom: '8px' }}>
                  Đăng Ký Vé Thành Công!
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                  Mã vé tham dự của quý vị:
                </p>
                <div style={{
                  background: 'var(--light-cream)',
                  border: '2px dashed var(--gong-gold)',
                  padding: '16px',
                  borderRadius: '12px',
                  fontFamily: 'monospace',
                  fontSize: '1.4rem',
                  fontWeight: '800',
                  color: 'var(--bazan-red)',
                  marginBottom: '18px'
                }}>
                  {regSuccess.ticketCode || 'DLK-TICKET-2026'}
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Vui lòng lưu lại mã vé hoặc xuất trình tại bàn đón tiếp để check-in camera tự động.
                </p>
                <button 
                  onClick={() => setRegisterModalEvent(null)}
                  className="btn-daklak-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Hoàn tất
                </button>
              </div>
            ) : (
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--bazan-red)', fontWeight: '800', textTransform: 'uppercase' }}>
                  ĐĂNG KÝ VÉ NHANH
                </span>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-coffee)', margin: '6px 0 14px', lineHeight: '1.3' }}>
                  {registerModalEvent.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                  Vé tham gia: <strong>Miễn phí (Free Pass)</strong> • Nhận mã QR tức thời.
                </p>

                <form onSubmit={handleQuickRegisterSubmit}>
                  <div className="daklak-form-group">
                    <label>Họ và tên (*)</label>
                    <input 
                      type="text" 
                      className="daklak-form-input" 
                      required
                      placeholder="Nguyễn Văn An"
                      value={regFormData.fullName}
                      onChange={(e) => setRegFormData({ ...regFormData, fullName: e.target.value })}
                    />
                  </div>
                  <div className="daklak-form-group">
                    <label>Số điện thoại (*)</label>
                    <input 
                      type="tel" 
                      className="daklak-form-input" 
                      required
                      placeholder="0912 345 678"
                      value={regFormData.phone}
                      onChange={(e) => setRegFormData({ ...regFormData, phone: e.target.value })}
                    />
                  </div>
                  <div className="daklak-form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      className="daklak-form-input" 
                      placeholder="email@example.com"
                      value={regFormData.email}
                      onChange={(e) => setRegFormData({ ...regFormData, email: e.target.value })}
                    />
                  </div>
                  <div className="daklak-form-group">
                    <label>Tên đơn vị / Công ty</label>
                    <input 
                      type="text" 
                      className="daklak-form-input" 
                      placeholder="Công ty TNHH ABC"
                      value={regFormData.company}
                      onChange={(e) => setRegFormData({ ...regFormData, company: e.target.value })}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-daklak-gold"
                    disabled={regLoading}
                    style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '10px' }}
                  >
                    {regLoading ? 'Đang cấp vé...' : 'Xác Nhận & Lấy Mã Vé QR'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
      <FloatingAIBot />
    </div>
  );
};

export default Home;
