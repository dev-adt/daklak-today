/**
 * BACKEND BRAND CONFIGURATION
 * -------------------------------------------------------------
 * File cấu hình thương hiệu tập trung cho Node.js Express Backend.
 * Tự động đồng bộ với biến môi trường (.env) nếu có.
 */

require('dotenv').config();

const brandConfig = {
  appName: process.env.APP_NAME || 'DakLak.today Platform',
  brandName: process.env.BRAND_NAME || 'DakLak.today',
  brandShortName: process.env.BRAND_SHORT_NAME || 'DakLak',
  siteUrl: process.env.SITE_URL || 'https://daklak.today',
  demoSiteUrl: 'https://demo.daklak.today',
  
  // Nhận diện logo thương hiệu
  logo: {
    primary: '/logo_daklak.png',
    dark: '/logo_daklak_dark.png',
    icon: '/logo_icon.svg',
    favicon: '/favicon.svg'
  },
  
  // Thông tin thanh toán ngân hàng (VietQR)
  bankAccount: {
    bankName: 'Techcombank',
    bankBranch: 'PGD Buôn Ma Thuột / PGD Văn Quán',
    accountNumber: '19036730021017',
    accountHolder: 'CONG TY CO PHAN ADT QUOC TE',
    binCode: '970407'
  },

  // AI System Persona Prompt cho Đắk Lắk
  ai: {
    agentName: process.env.AI_AGENT_NAME || 'AI Đắk Lắk Assistant',
    systemPrompt: process.env.AI_SYSTEM_PROMPT || 
      "Bạn là trợ lý AI chuyên nghiệp của nền tảng DakLak.today — Cổng thông tin, dữ liệu và kết nối đầu tư Đắk Lắk. Hãy tư vấn sâu sắc, chuẩn xác, giàu thông tin và truyền cảm hứng về cơ hội đầu tư, quy hoạch vùng, chuỗi giá trị cà phê Buôn Ma Thuột, nông sản Tây Nguyên, văn hóa cồng chiêng và du lịch sinh thái."
  },

  // Email Brand Info
  email: {
    fromName: process.env.SMTP_FROM_NAME || 'Ban Biên Tập DakLak.today',
    fromAddress: process.env.SMTP_FROM || `"DakLak.today" <${process.env.SMTP_USER || 'no-reply@daklak.today'}>`,
    supportEmail: process.env.SUPPORT_EMAIL || 'support@daklak.today'
  },

  // 7 Chuyên mục mặc định Đắk Lắk theo Đặc tả kiến trúc hệ sinh thái số
  defaultCategories: [
    { name: 'Khám phá Đắk Lắk', slug: 'kham-pha-dak-lak', icon: '🌄', description: 'Điểm đến, di tích, danh lam thắng cảnh và văn hóa Tây Nguyên' },
    { name: 'Doanh nghiệp & Sản phẩm', slug: 'doanh-nghiep-san-pham', icon: '🏢', description: 'Hồ sơ doanh nghiệp, nông sản OCOP, showroom số và kết nối thương mại' },
    { name: 'Đầu tư & Dự án', slug: 'dau-tu-du-an', icon: '💰', description: 'Danh mục dự án kêu gọi đầu tư, KCN, vùng nguyên liệu và chính sách' },
    { name: 'Cà phê Đắk Lắk', slug: 'ca-phe-dak-lak', icon: '☕', description: 'Chuỗi giá trị cà phê, công nghệ chế biến sâu, thương hiệu và xuất khẩu' },
    { name: 'Du lịch & Trải nghiệm', slug: 'du-lich-trai-nghiem', icon: '🧭', description: 'Hành trình 2N1Đ, 3N2Đ, du lịch sinh thái, homestay và lễ hội' },
    { name: 'Dữ liệu & Báo cáo', slug: 'du-lieu-bao-cao', icon: '📊', description: 'Chỉ số kinh tế Đắk Lắk, bản đồ cơ hội và phân tích dữ liệu ngành' },
    { name: 'Sự kiện & Diễn đàn', slug: 'su-kien-dien-dan', icon: '📅', description: 'Lễ hội cà phê, diễn đàn xúc tiến đầu tư và kết nối giao thương B2B' }
  ]
};

module.exports = brandConfig;
