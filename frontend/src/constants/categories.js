/**
 * Cấu hình Chuyên mục chính và Lĩnh vực con mặc định cho DakLak.today
 * (Đồng bộ theo Đặc tả thiết kế trang chủ và Dự án hệ sinh thái số Đắk Lắk)
 * Lưu ý: Dữ liệu được tải động từ API /api/categories (Quản lý chuyên mục trong Admin).
 */

export const CATEGORIES_DATA = [
  {
    id: 'kham-pha-dak-lak',
    name: 'Khám phá Đắk Lắk',
    name_en: 'Discover Dak Lak',
    order_index: 1,
    subcategories: [
      'Điểm đến & Thắng cảnh',
      'Văn hóa Cồng chiêng',
      'Ẩm thực Tây Nguyên',
      'Di sản & Lịch sử'
    ]
  },
  {
    id: 'doanh-nghiep-san-pham',
    name: 'Doanh nghiệp & Sản phẩm',
    name_en: 'Enterprises & Products',
    order_index: 2,
    subcategories: [
      'Danh bạ Doanh nghiệp',
      'Sản phẩm OCOP & Nông sản',
      'Khởi nghiệp Đổi mới sáng tạo',
      'Showroom số'
    ]
  },
  {
    id: 'dau-tu-du-an',
    name: 'Đầu tư & Dự án',
    name_en: 'Investment & Projects',
    order_index: 3,
    subcategories: [
      'Danh mục Dự án Kêu gọi',
      'Khu & Cụm công nghiệp',
      'Vùng nguyên liệu & Quỹ đất',
      'Chính sách & Ưu đãi Đầu tư'
    ]
  },
  {
    id: 'ca-phe-dak-lak',
    name: 'Cà phê Đắk Lắk',
    name_en: 'Dak Lak Coffee',
    order_index: 4,
    subcategories: [
      'Chuỗi giá trị Cà phê',
      'Công nghệ Chế biến sâu',
      'Thương hiệu & Thị trường',
      'Văn hóa Cà phê'
    ]
  },
  {
    id: 'du-lich-trai-nghiem',
    name: 'Du lịch & Trải nghiệm',
    name_en: 'Tourism & Experiences',
    order_index: 5,
    subcategories: [
      'Hành trình 2N1Đ & 3N2Đ',
      'Du lịch Sinh thái & Bản làng',
      'Lưu trú & Homestay',
      'Lễ hội & Sự kiện'
    ]
  },
  {
    id: 'du-lieu-bao-cao',
    name: 'Dữ liệu & Báo cáo',
    name_en: 'Data & Reports',
    order_index: 6,
    subcategories: [
      'Chỉ số Kinh tế - Xã hội',
      'Bản đồ Cơ hội Đắk Lắk',
      'Báo cáo Ngành hàng',
      'Quy hoạch Tỉnh Đắk Lắk'
    ]
  },
  {
    id: 'su-kien-dien-dan',
    name: 'Sự kiện & Diễn đàn',
    name_en: 'Events & Forums',
    order_index: 7,
    subcategories: [
      'Lễ hội Cà phê Buôn Ma Thuột',
      'Diễn đàn Xúc tiến Đầu tư',
      'Hội thảo Kinh tế',
      'Giao thương & Kết nối B2B'
    ]
  }
];

export const ALL_CATEGORIES = CATEGORIES_DATA.map(c => c.name);

export const getSubcategoriesByCategory = (categoryName) => {
  const cat = CATEGORIES_DATA.find(c => c.name === categoryName);
  return cat ? cat.subcategories : [];
};

export const CATEGORY_LABELS = {
  // Dak Lak Specific Categories
  'Khám phá Đắk Lắk': { vi: 'Khám phá Đắk Lắk', en: 'Discover Dak Lak' },
  'Doanh nghiệp & Sản phẩm': { vi: 'Doanh nghiệp & Sản phẩm', en: 'Enterprises & Products' },
  'Đầu tư & Dự án': { vi: 'Đầu tư & Dự án', en: 'Investment & Projects' },
  'Cà phê Đắk Lắk': { vi: 'Cà phê Đắk Lắk', en: 'Dak Lak Coffee' },
  'Du lịch & Trải nghiệm': { vi: 'Du lịch & Trải nghiệm', en: 'Tourism & Experiences' },
  'Dữ liệu & Báo cáo': { vi: 'Dữ liệu & Báo cáo', en: 'Data & Reports' },
  'Sự kiện & Diễn đàn': { vi: 'Sự kiện & Diễn đàn', en: 'Events & Forums' },
  
  // Legacy / Fallback Categories
  'Tư vấn Vay vốn & Tài chính': { vi: 'Tư vấn Vay vốn', en: 'Loan & Finance' },
  'Truyền thông Thương hiệu': { vi: 'Truyền thông', en: 'Brand & PR' },
  'Marketing & Bán hàng': { vi: 'Marketing & Bán hàng', en: 'Marketing & Sales' },
  'Ứng dụng AI & Công nghệ': { vi: 'Ứng dụng AI', en: 'AI & Tech' },
  'Thực hành ESG & Phát triển bền vững': { vi: 'Thực hành ESG', en: 'ESG Practice' },
  'Hiệp hội & Giao thương': { vi: 'Hiệp hội & Đối tác', en: 'Associations' },
  'Tài chính - Ngân hàng': { vi: 'Tài chính - Ngân hàng', en: 'Finance & Banking' },
  'Bất động sản & Xây dựng': { vi: 'Bất động sản & Xây dựng', en: 'Real Estate & Construction' },
  'Công nghệ - Chuyển đổi số': { vi: 'Công nghệ - Chuyển đổi số', en: 'Tech & Digital Transformation' },
  'Khởi nghiệp - Đổi mới sáng tạo': { vi: 'Khởi nghiệp - Đổi mới sáng tạo', en: 'Startups & Innovation' },
  'Pháp luật - Chính sách': { vi: 'Pháp luật - Chính sách', en: 'Legal & Policy' },
  'Doanh nghiệp & Xã hội': { vi: 'Doanh nghiệp & Xã hội', en: 'Business & Society' },
  'Thị trường - Tiêu dùng': { vi: 'Thị trường - Tiêu dùng', en: 'Market & Consumer' },
  'Nông nghiệp - Môi trường': { vi: 'Nông nghiệp - Môi trường', en: 'Agriculture & Environment' },
  'Công nghiệp - Năng lượng': { vi: 'Công nghiệp - Năng lượng', en: 'Industry & Energy' },
  'Du lịch - Dịch vụ': { vi: 'Du lịch - Dịch vụ', en: 'Tourism & Services' }
};

export const SUBCATEGORY_LABELS = {
  // Dak Lak Subcategories
  'Điểm đến & Thắng cảnh': { vi: 'Điểm đến & Thắng cảnh', en: 'Destinations & Landscapes' },
  'Văn hóa Cồng chiêng': { vi: 'Văn hóa Cồng chiêng', en: 'Gong Culture' },
  'Ẩm thực Tây Nguyên': { vi: 'Ẩm thực Tây Nguyên', en: 'Central Highlands Cuisine' },
  'Di sản & Lịch sử': { vi: 'Di sản & Lịch sử', en: 'Heritage & History' },
  'Danh bạ Doanh nghiệp': { vi: 'Danh bạ Doanh nghiệp', en: 'Business Directory' },
  'Sản phẩm OCOP & Nông sản': { vi: 'Sản phẩm OCOP & Nông sản', en: 'OCOP & Agro-products' },
  'Khởi nghiệp Đổi mới sáng tạo': { vi: 'Khởi nghiệp Đổi mới sáng tạo', en: 'Startups & Innovation' },
  'Showroom số': { vi: 'Showroom số', en: 'Digital Showroom' },
  'Danh mục Dự án Kêu gọi': { vi: 'Danh mục Dự án Kêu gọi', en: 'Invited Projects' },
  'Khu & Cụm công nghiệp': { vi: 'Khu & Cụm công nghiệp', en: 'Industrial Parks' },
  'Vùng nguyên liệu & Quỹ đất': { vi: 'Vùng nguyên liệu & Quỹ đất', en: 'Raw Material Zones' },
  'Chính sách & Ưu đãi Đầu tư': { vi: 'Chính sách & Ưu đãi Đầu tư', en: 'Incentive Policies' },
  'Chuỗi giá trị Cà phê': { vi: 'Chuỗi giá trị Cà phê', en: 'Coffee Value Chain' },
  'Công nghệ Chế biến sâu': { vi: 'Công nghệ Chế biến sâu', en: 'Deep Processing Tech' },
  'Thương hiệu & Thị trường': { vi: 'Thương hiệu & Thị trường', en: 'Brand & Markets' },
  'Văn hóa Cà phê': { vi: 'Văn hóa Cà phê', en: 'Coffee Culture' },
  'Hành trình 2N1Đ & 3N2Đ': { vi: 'Hành trình 2N1Đ & 3N2Đ', en: '2D1N & 3D2N Itineraries' },
  'Du lịch Sinh thái & Bản làng': { vi: 'Du lịch Sinh thái & Bản làng', en: 'Ecotourism & Villages' },
  'Lưu trú & Homestay': { vi: 'Lưu trú & Homestay', en: 'Stays & Homestays' },
  'Lễ hội & Sự kiện': { vi: 'Lễ hội & Sự kiện', en: 'Festivals & Events' },
  'Chỉ số Kinh tế - Xã hội': { vi: 'Chỉ số Kinh tế - Xã hội', en: 'Socio-economic Indicators' },
  'Bản đồ Cơ hội Đắk Lắk': { vi: 'Bản đồ Cơ hội Đắk Lắk', en: 'Opportunity Map' },
  'Báo cáo Ngành hàng': { vi: 'Báo cáo Ngành hàng', en: 'Industry Reports' },
  'Quy hoạch Tỉnh Đắk Lắk': { vi: 'Quy hoạch Tỉnh Đắk Lắk', en: 'Provincial Master Plan' },
  'Lễ hội Cà phê Buôn Ma Thuột': { vi: 'Lễ hội Cà phê Buôn Ma Thuột', en: 'Buon Ma Thuot Coffee Festival' },
  'Diễn đàn Xúc tiến Đầu tư': { vi: 'Diễn đàn Xúc tiến Đầu tư', en: 'Investment Forum' },
  'Hội thảo Kinh tế': { vi: 'Hội thảo Kinh tế', en: 'Economic Seminars' },
  'Giao thương & Kết nối B2B': { vi: 'Giao thương & Kết nối B2B', en: 'B2B Trade & Networking' }
};

export const getCategoryLabel = (cat, lang = 'vi') => {
  if (!cat) return '';
  if (typeof cat === 'object') {
    if (lang === 'en' && cat.name_en) return String(cat.name_en);
    if (cat.name) {
      if (lang === 'en' && CATEGORY_LABELS[cat.name]?.en) {
        return CATEGORY_LABELS[cat.name].en;
      }
      return String(cat.name);
    }
    return '';
  }
  if (typeof cat === 'string') {
    if (lang === 'en' && CATEGORY_LABELS[cat]?.en) {
      return CATEGORY_LABELS[cat].en;
    }
    return cat;
  }
  return String(cat);
};

export const getSubCategoryLabel = (sub, lang = 'vi') => {
  if (!sub) return '';
  if (typeof sub === 'object') {
    if (lang === 'en' && sub.name_en) return String(sub.name_en);
    if (sub.name) {
      if (lang === 'en' && SUBCATEGORY_LABELS[sub.name]?.en) {
        return SUBCATEGORY_LABELS[sub.name].en;
      }
      return String(sub.name);
    }
    return '';
  }
  if (typeof sub === 'string') {
    if (lang === 'en' && SUBCATEGORY_LABELS[sub]?.en) {
      return SUBCATEGORY_LABELS[sub].en;
    }
    return sub;
  }
  return String(sub);
};

export default CATEGORIES_DATA;
