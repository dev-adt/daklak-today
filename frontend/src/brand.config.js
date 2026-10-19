/**
 * BRAND CONFIGURATION (CẤU HÌNH THƯƠNG HIỆU TẬP TRUNG)
 * -------------------------------------------------------------
 * File này quản lý toàn bộ thông tin nhận diện thương hiệu của nền tảng DakLak.today.
 * Định vị: Cổng thông tin, dữ liệu và kết nối đầu tư Đắk Lắk
 * Triết lý: "Từ đất bazan đến cơ hội toàn cầu" (Media + Data + Platform + AI)
 */

export const brandConfig = {
  // Thông tin định danh thương hiệu
  brandName: 'DakLak.today',         // Tên thương hiệu hiển thị chính
  brandShortName: 'DakLak',          // Tên viết tắt ngắn gọn (tránh trùng .today)
  platformName: 'DakLak.today Digital Platform',
  companyLegalName: 'Cổng thông tin, Dữ liệu & Xúc tiến Đầu tư Đắk Lắk',
  partnerLegalName: 'Công ty Cổ phần ADT Quốc tế',
  
  // Slogan & Định vị theo tài liệu thiết kế mới
  slogan: 'Khám phá • Kết nối • Phát triển',
  tagline: 'Đắk Lắk – Từ đại ngàn đến biển xanh',
  description: 'Nền tảng thông tin, khám phá địa phương và kết nối cơ hội kinh doanh Đắk Lắk.',
  
  // Tên miền & Đường dẫn
  domain: 'daklak.today',
  demoDomain: 'dev.daklak.today',
  baseUrl: 'https://daklak.today',
  demoUrl: 'https://dev.daklak.today',
  apiBaseUrl: '/api',

  // Nhận diện hình ảnh & Logo
  logo: {
    primary: '/logo_daklak.png',
    dark: '/logo_daklak_dark.png',
    icon: '/logo_icon.svg',
    alt: 'DakLak.today Logo',
    favicon: '/favicon.svg',
    defaultThumbnail: '/images/daklak/daklak_doi_ca_phe.jpg',
    fallbackCompanyLogo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80'
  },

  // Hệ màu chuẩn theo tài liệu Thiết kế giao diện Daklak.docx
  colors: {
    forestGreen: '#16734A',   // Xanh đại ngàn (Màu chủ đạo, nút hành động)
    coffeeOrange: '#E99035',  // Cam cà phê (Điểm nhấn, nội dung nổi bật)
    oceanBlue: '#168BC3',     // Xanh biển (Du lịch, kinh tế biển)
    creamBg: '#FAF8F2',       // Trắng kem (Nền trang, tạo cảm giác thoáng)
    charcoalDark: '#25312D',  // Than đậm (Tiêu đề và nội dung)
    primary: '#16734A',
    primaryHover: '#125C3A',
    primaryDark: '#0E462C',
    primaryLight: '#FAF8F2',
    secondary: '#168BC3',
    accent: '#E99035',
    accentGlow: 'rgba(233, 144, 53, 0.4)',
    gold: '#E99035',
    bazanBrown: '#7A3E1D',
    coffee: '#3B2417',
    cream: '#FAF8F2',
    darkBg: '#1C2421',
    darkCard: '#25312D'
  },

  // Trợ lý Trí tuệ Nhân tạo (AI Assistant)
  aiAssistant: {
    name: 'AI Đắk Lắk Assistant',
    shortName: 'Đắk Lắk AI',
    title: 'Trợ lý AI Cố vấn Đầu tư & Điểm đến Đắk Lắk',
    avatar: '/ai_robot_avatar-removebg.png',
    welcomeMessage: 'Xin chào! Tôi là Trợ lý AI của DakLak.today. Tôi có thể hỗ trợ quý vị tra cứu cơ hội đầu tư, chuỗi giá trị cà phê, doanh nghiệp địa phương, nông nghiệp công nghệ cao và hành trình khám phá Đắk Lắk 24/7.',
    systemRole: 'Bạn là trợ lý AI chuyên nghiệp của nền tảng DakLak.today — Cổng thông tin, dữ liệu và kết nối đầu tư Đắk Lắk. Hãy tư vấn sâu sắc, chuẩn xác, giàu thông tin và truyền cảm hứng về cơ hội đầu tư, quy hoạch vùng, chuỗi giá trị cà phê Buôn Ma Thuột, nông sản Tây Nguyên, văn hóa cồng chiêng và du lịch sinh thái.',
    quickSuggestions: [
      'Tìm doanh nghiệp chế biến sâu cà phê tại Đắk Lắk',
      'Các dự án nông nghiệp công nghệ cao đang kêu gọi đầu tư',
      'Gợi ý hành trình du lịch sinh thái & văn hóa 2 ngày 1 đêm',
      'Chính sách ưu đãi và thủ tục đầu tư vào cụm công nghiệp Đắk Lắk'
    ]
  },

  // Thông tin liên hệ & Văn phòng
  contact: {
    hotline: '0262 3888 999',
    techHotline: '0986 354 152',
    email: 'contact@daklak.today',
    supportEmail: 'support@daklak.today',
    address: 'Số 01 Lê Duẩn, Phường Tự An, TP. Buôn Ma Thuột, Tỉnh Đắk Lắk',
    techAddress: '26 TT23 Khu đô thị Văn Phú, P. Kiến Hưng, Hà Nội',
    workingHours: '08:00 - 17:30 (Thứ 2 - Thứ 6)',
    copyright: '© 2026 DakLak.today — Nền tảng phát triển & vận hành bởi ADT Quốc tế.'
  },

  // Thông tin thanh toán / Chuyển khoản sự kiện (VietQR)
  bankAccount: {
    bankName: 'Techcombank',
    bankBranch: 'PGD Buôn Ma Thuột / PGD Văn Quán',
    accountNumber: '19036730021017',
    accountHolder: 'CONG TY CO PHAN ADT QUOC TE',
    binCode: '970407'
  },

  // Mạng xã hội
  socials: {
    facebook: 'https://facebook.com/daklak.today',
    youtube: 'https://youtube.com/@daklak.today',
    zalo: 'https://zalo.me/daklaktoday',
    linkedin: 'https://linkedin.com/company/daklak-today'
  },

  // Thông tin Đăng ký Hội viên & Gói dịch vụ
  membership: {
    benefitsTitle: 'Quyền lợi Hội viên DakLak.today',
    badgeText: 'Mạng lưới kết nối doanh nghiệp & nhà đầu tư Đắk Lắk',
    tiers: [
      { id: 'Standard', name: 'Khám phá (Cơ bản)', badge: 'Thành viên Khám phá' },
      { id: 'Silver', name: 'Doanh nghiệp Kết nối', badge: 'Đối tác Bạc' },
      { id: 'Gold', name: 'Doanh nghiệp Tiêu biểu', badge: 'Đối tác Vàng' },
      { id: 'Diamond', name: 'Nhà đầu tư Chiến lược', badge: 'Đối tác Kim Cương' }
    ]
  }
};

export const BRAND_CONFIG = brandConfig;
export default brandConfig;
