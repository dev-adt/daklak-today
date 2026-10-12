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
  brandShortName: 'DakLak Today',    // Tên viết tắt ngắn gọn
  platformName: 'DakLak.today Digital Platform',
  companyLegalName: 'Cổng thông tin, Dữ liệu & Xúc tiến Đầu tư Đắk Lắk',
  partnerLegalName: 'Công ty Cổ phần ADT Quốc tế',
  
  // Slogan & Định vị
  slogan: 'Cổng thông tin, dữ liệu và kết nối đầu tư Đắk Lắk',
  tagline: 'Từ đất bazan đến cơ hội toàn cầu — Khám phá, Kết nối, Đầu tư & Trí tuệ Nhân tạo',
  description: 'Nền tảng số kết nối con người, doanh nghiệp, sản phẩm, du lịch, dữ liệu và cơ hội đầu tư của tỉnh Đắk Lắk trong kỷ nguyên số và AI.',
  
  // Tên miền & Đường dẫn
  domain: 'daklak.today',
  demoDomain: 'demo.daklak.today',
  baseUrl: 'https://daklak.today',
  demoUrl: 'https://demo.daklak.today',
  apiBaseUrl: '/api',

  // Nhận diện hình ảnh & Logo
  logo: {
    primary: '/logo_doanhnghiepvn.png',
    dark: '/logo_doanhnghiepvn_dark.png',
    icon: '/logo_icon.png',
    alt: 'DakLak.today Logo',
    favicon: '/favicon.png',
    defaultThumbnail: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
    fallbackCompanyLogo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80'
  },

  // Hệ màu chủ đạo Tây Nguyên & Đất đỏ Bazan (Tây Nguyên Coffee & Bazan Earth Palette)
  colors: {
    primary: '#7A3E1D',       // Nâu đỏ Bazan đặc trưng
    primaryHover: '#5D3727',  // Nâu cà phê đậm hover
    primaryDark: '#3B2417',   // Nâu hạt cà phê rang
    primaryLight: '#F7F1E8',  // Kem ấm ánh bazan
    secondary: '#1F5A3A',     // Xanh đại ngàn Tây Nguyên
    accent: '#D5A33F',        // Vàng đồng cồng chiêng
    accentGlow: 'rgba(213, 163, 63, 0.4)',
    gold: '#D5A33F',          // Vàng cồng chiêng
    goldLight: '#F3C562',     // Vàng sáng
    goldGlow: 'rgba(213, 163, 63, 0.35)',
    bazanRed: '#A84524',      // Đỏ đất Bazan nhiệt huyết
    bazanBrown: '#7A3E1D',    // Nâu Bazan
    coffee: '#3B2417',        // Nâu hạt cà phê
    forestGreen: '#1F5A3A',   // Xanh rừng đại ngàn
    cream: '#F7F1E8',         // Kem cát bazan nhạt
    darkBg: '#26160E',
    darkCard: '#3B2417'
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
    phone: '0912 480 246',
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
