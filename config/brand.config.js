/**
 * ══════════════════════════════════════════════════════════════════════════════
 * BACKEND BRAND CONFIGURATION — TODAY PLATFORM (GOLDEN MASTER)
 * ══════════════════════════════════════════════════════════════════════════════
 * File cấu hình thương hiệu tập trung cho Node.js Express Backend.
 * Tự động đồng bộ với biến môi trường (.env) và khớp 100% với frontend/src/brand.config.js.
 * Cho phép nhân bản sang bất kỳ tỉnh thành / thương hiệu mới nào chỉ bằng cách đổi .env
 * hoặc chạy lệnh: node scripts/rebrand.js
 */

require('dotenv').config();

const brandConfig = {
  // ── 1. ĐỊNH DANH THƯƠNG HIỆU & DOANH NGHIỆP ────────────────────────────────
  appName: process.env.APP_NAME || 'DakLak.today Platform',
  brandName: process.env.BRAND_NAME || 'DakLak.today',
  brandShortName: process.env.BRAND_SHORT_NAME || 'DakLak',
  platformName: process.env.PLATFORM_NAME || 'DakLak.today Digital Platform',
  companyLegalName: process.env.COMPANY_LEGAL_NAME || 'Cổng thông tin, Dữ liệu & Xúc tiến Đầu tư Đắk Lắk',
  partnerLegalName: process.env.PARTNER_LEGAL_NAME || 'Công ty Cổ phần ADT Quốc tế',

  // ── 2. ĐỊA BÀN HÀNH CHÍNH & KHU VỰC ────────────────────────────────────────
  province: process.env.PROVINCE || 'Đắk Lắk',
  provinceEn: process.env.PROVINCE_EN || 'Dak Lak',
  region: process.env.REGION || 'Tây Nguyên',
  regionEn: process.env.REGION_EN || 'Central Highlands',

  // ── 3. KHẨU HIỆU & MÔ TẢ ĐỊNH VỊ ───────────────────────────────────────────
  slogan: process.env.SLOGAN || 'Khám phá • Kết nối • Phát triển',
  tagline: process.env.TAGLINE || 'Đắk Lắk – Từ đại ngàn đến biển xanh',
  description: process.env.DESCRIPTION || 'Nền tảng thông tin, khám phá địa phương và kết nối cơ hội kinh doanh Đắk Lắk bằng nền tảng số và trí tuệ nhân tạo.',

  // ── 4. TÊN MIỀN & ĐƯỜNG DẪN TRUY CẬP ───────────────────────────────────────
  domain: process.env.DOMAIN || 'daklak.today',
  siteUrl: process.env.SITE_URL || 'https://daklak.today',
  demoSiteUrl: process.env.DEMO_SITE_URL || 'https://dev.daklak.today',
  apiBaseUrl: process.env.API_BASE_URL || '/api',

  // ── 5. NHẬN DIỆN LOGO & HÌNH ẢNH ───────────────────────────────────────────
  logo: {
    primary: process.env.LOGO_PRIMARY || '/logo_daklak.png',
    dark: process.env.LOGO_DARK || '/logo_daklak_dark.png',
    icon: process.env.LOGO_ICON || '/logo_icon.png',
    favicon: process.env.FAVICON || '/favicon.png',
    alt: process.env.LOGO_ALT || 'DakLak.today Logo',
    defaultThumbnail: process.env.DEFAULT_THUMBNAIL || '/images/daklak/daklak_doi_ca_phe.jpg',
    ogImage: process.env.OG_IMAGE || '/images/og-image.jpg'
  },

  // ── 6. BẢNG MÀU THƯƠNG HIỆU (DESIGN TOKENS) ────────────────────────────────
  colors: {
    primary: process.env.COLOR_PRIMARY || '#16734A',       // Xanh đại ngàn / Màu chủ đạo
    primaryHover: process.env.COLOR_PRIMARY_HOVER || '#125C3A',
    secondary: process.env.COLOR_SECONDARY || '#168BC3',   // Xanh biển / Khối du lịch
    accent: process.env.COLOR_ACCENT || '#E99035',         // Cam cà phê / Điểm nhấn nổi bật
    creamBg: '#FAF8F2',
    charcoalDark: '#25312D',
    bazanBrown: '#7A3E1D',
    coffee: '#3B2417'
  },

  // ── 7. NÔNG SẢN & ĐẶC SẢN CHỦ LỰC ĐỊA PHƯƠNG (TÙY BIẾN CHO TỪNG TỈNH) ─────
  specialty: {
    enabled: true,
    id: process.env.SPECIALTY_ID || 'coffee',
    name: process.env.SPECIALTY_NAME || 'Cà phê Đắk Lắk',
    nameEn: process.env.SPECIALTY_NAME_EN || 'Dak Lak Coffee',
    commodityName: process.env.COMMODITY_NAME || 'Giá cà phê',
    commodityNameEn: process.env.COMMODITY_NAME_EN || 'Coffee Price',
    unit: process.env.COMMODITY_UNIT || 'đ/kg',
    defaultPriceText: 'Cập nhật giá Robusta & Arabica hôm nay'
  },

  // ── 8. THÔNG TIN THANH TOÁN NGÂN HÀNG (VIETQR TỰ ĐỘNG) ────────────────────
  bankAccount: {
    bankName: process.env.BANK_NAME || 'Techcombank',
    bankBranch: process.env.BANK_BRANCH || 'PGD Buôn Ma Thuột / PGD Văn Quán',
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || '19036730021017',
    accountHolder: process.env.BANK_ACCOUNT_HOLDER || 'CONG TY CO PHAN ADT QUOC TE',
    binCode: process.env.BANK_BIN_CODE || '970407',
    getVietQRUrl(amount = 0, description = '') {
      const cleanDesc = encodeURIComponent(description.slice(0, 50));
      return `https://img.vietqr.io/image/${this.binCode}-${this.accountNumber}-compact2.png?amount=${amount}&addInfo=${cleanDesc}&accountName=${encodeURIComponent(this.accountHolder)}`;
    }
  },

  // ── 9. TRÍ TUỆ NHÂN TẠO AI ASSISTANT (GEMINI RAG ENGINE) ───────────────────
  ai: {
    agentName: process.env.AI_AGENT_NAME || 'AI Đắk Lắk Assistant',
    shortName: process.env.AI_SHORT_NAME || 'Đắk Lắk AI',
    title: process.env.AI_TITLE || 'Trợ lý AI Cố vấn Đầu tư & Điểm đến Đắk Lắk',
    avatar: process.env.AI_AVATAR || '/ai_robot_avatar-removebg.png',
    welcomeMessage: process.env.AI_WELCOME_MSG || 
      'Xin chào! Tôi là Trợ lý AI của DakLak.today. Tôi có thể hỗ trợ quý vị tra cứu cơ hội đầu tư, chuỗi giá trị cà phê, doanh nghiệp địa phương, nông nghiệp công nghệ cao và hành trình khám phá Đắk Lắk 24/7.',
    systemPrompt: process.env.AI_SYSTEM_PROMPT || 
      'Bạn là trợ lý AI chuyên nghiệp của nền tảng DakLak.today — Cổng thông tin, dữ liệu và kết nối đầu tư Đắk Lắk. Hãy tư vấn sâu sắc, chuẩn xác, giàu thông tin và truyền cảm hứng về cơ hội đầu tư, quy hoạch vùng, chuỗi giá trị cà phê Buôn Ma Thuột, nông sản Tây Nguyên, văn hóa cồng chiêng và du lịch sinh thái.',
    quickSuggestions: [
      'Tìm doanh nghiệp chế biến sâu cà phê tại Đắk Lắk',
      'Các dự án nông nghiệp công nghệ cao đang kêu gọi đầu tư',
      'Gợi ý hành trình du lịch sinh thái & văn hóa 2 ngày 1 đêm',
      'Chính sách ưu đãi và thủ tục đầu tư vào cụm công nghiệp Đắk Lắk'
    ]
  },

  // ── 10. THÔNG TIN LIÊN HỆ & BẢN QUYỀN ─────────────────────────────────────
  contact: {
    hotline: process.env.HOTLINE || '0262 3888 999',
    techHotline: process.env.TECH_HOTLINE || '0986 354 152',
    email: process.env.CONTACT_EMAIL || 'contact@daklak.today',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@daklak.today',
    address: process.env.ADDRESS || 'Số 01 Lê Duẩn, Phường Tự An, TP. Buôn Ma Thuột, Tỉnh Đắk Lắk',
    techAddress: process.env.TECH_ADDRESS || '26 TT23 Khu đô thị Văn Phú, P. Kiến Hưng, Hà Nội',
    workingHours: '08:00 - 17:30 (Thứ 2 - Thứ 6)',
    copyright: process.env.COPYRIGHT || '© 2026 DakLak.today — Nền tảng phát triển & vận hành bởi ADT Quốc tế.'
  },

  // ── 11. CẤU HÌNH EMAIL HỆ THỐNG (SMTP) ─────────────────────────────────────
  email: {
    fromName: process.env.SMTP_FROM_NAME || 'Ban Biên Tập DakLak.today',
    fromAddress: process.env.SMTP_FROM || `"DakLak.today" <${process.env.SMTP_USER || 'no-reply@daklak.today'}>`,
    supportEmail: process.env.SUPPORT_EMAIL || 'support@daklak.today'
  },

  // ── 12. MẠNG XÃ HỘI CHÍNH THỨC ────────────────────────────────────────────
  socials: {
    facebook: process.env.SOCIAL_FACEBOOK || 'https://facebook.com/daklak.today',
    youtube: process.env.SOCIAL_YOUTUBE || 'https://youtube.com/@daklak.today',
    zalo: process.env.SOCIAL_ZALO || 'https://zalo.me/daklaktoday',
    linkedin: process.env.SOCIAL_LINKEDIN || 'https://linkedin.com/company/daklak-today'
  },

  // ── 13. HẠNG THÀNH VIÊN HỘI VIÊN DOANH NGHIỆP ────────────────────────────
  membership: {
    benefitsTitle: 'Quyền lợi Hội viên Doanh nghiệp',
    badgeText: 'Mạng lưới kết nối doanh nghiệp & xúc tiến đầu tư',
    tiers: [
      { id: 'Standard', name: 'Khám phá (Cơ bản)', badge: 'Thành viên Khám phá' },
      { id: 'Silver', name: 'Doanh nghiệp Kết nối', badge: 'Đối tác Bạc' },
      { id: 'Gold', name: 'Doanh nghiệp Tiêu biểu', badge: 'Đối tác Vàng' },
      { id: 'Diamond', name: 'Nhà đầu tư Chiến lược', badge: 'Đối tác Kim Cương' }
    ]
  },

  // ── 14. BỘ 7 CHUYÊN MỤC MẶC ĐỊNH CHUẨN HOÁ HỆ SINH THÁI SỐ ──────────────
  defaultCategories: [
    { name: 'Khám phá Đắk Lắk', nameEn: 'Explore Dak Lak', slug: 'kham-pha-dak-lak', icon: '🌄', description: 'Điểm đến, di tích, danh lam thắng cảnh và văn hóa Tây Nguyên' },
    { name: 'Doanh nghiệp & Sản phẩm', nameEn: 'Enterprises & Products', slug: 'doanh-nghiep-san-pham', icon: '🏢', description: 'Hồ sơ doanh nghiệp, nông sản OCOP, showroom số và kết nối thương mại' },
    { name: 'Đầu tư & Dự án', nameEn: 'Investment & Projects', slug: 'dau-tu-du-an', icon: '💰', description: 'Danh mục dự án kêu gọi đầu tư, KCN, vùng nguyên liệu và chính sách' },
    { name: 'Giá cà phê', nameEn: 'Coffee Prices & Market', slug: 'gia-ca-phe', icon: '☕', description: 'Diễn biến giá cà phê hàng ngày, thị trường thế giới và phân tích sâu' },
    { name: 'Du lịch & Trải nghiệm', nameEn: 'Tourism & Experiences', slug: 'du-lich-trai-nghiem', icon: '🧭', description: 'Hành trình 2N1Đ, 3N2Đ, du lịch sinh thái, homestay và lễ hội' },
    { name: 'Dữ liệu & Báo cáo', nameEn: 'Data & Reports', slug: 'du-lieu-bao-cao', icon: '📊', description: 'Chỉ số kinh tế, bản đồ cơ hội đầu tư và phân tích dữ liệu ngành' },
    { name: 'Sự kiện & Diễn đàn', nameEn: 'Events & Forums', slug: 'su-kien-dien-dan', icon: '📅', description: 'Hội thảo xúc tiến đầu tư, diễn đàn kết nối giao thương B2B' }
  ]
};

module.exports = brandConfig;
