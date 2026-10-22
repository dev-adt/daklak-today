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
    id: 'du-an-dau-tu',
    name: 'Dự án & Đầu tư',
    name_en: 'Investment & Projects',
    order_index: 3,
    subcategories: [
      'Danh mục Dự án Kêu gọi',
      'Khu & Cụm công nghiệp',
      'Chính sách & Ưu đãi Đầu tư'
    ]
  },
  {
    id: 'nong-san-ca-phe',
    name: 'Nông sản & Cà phê',
    name_en: 'Agri & Coffee',
    order_index: 4,
    subcategories: [
      'Chuỗi giá trị Cà phê',
      'Công nghệ Chế biến sâu',
      'Thương hiệu & Thị trường'
    ]
  },
  {
    id: 'du-lich-trai-nghiem',
    name: 'Du lịch & Trải nghiệm',
    name_en: 'Tourism & Experiences',
    order_index: 5,
    subcategories: [
      'Hành trình 2N1Đ & 3N2Đ',
      'Du lịch Sinh thái & Bản làng'
    ]
  },
  {
    id: 'kinh-te-bien',
    name: 'Kinh tế Biển',
    name_en: 'Marine Economy',
    order_index: 6,
    subcategories: [
      'Cảng biển & Logistics',
      'Thủy sản & Kinh tế Biển',
      'Công nghiệp & Đầu tư Ven biển'
    ]
  },
  {
    id: 'su-kien-dien-dan',
    name: 'Sự kiện & Diễn đàn',
    name_en: 'Events & Forums',
    order_index: 7,
    subcategories: [
      'Lễ hội Cà phê Buôn Ma Thuột',
      'Diễn đàn Xúc tiến Đầu tư'
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
  'Khám phá Đắk Lắk': { vi: 'Khám phá Đắk Lắk', en: 'Discover Dak Lak', zh: '探索多乐', ja: 'ダクラク探索', ko: '닥락 탐방' },
  'Doanh nghiệp & Sản phẩm': { vi: 'Doanh nghiệp & Sản phẩm', en: 'Enterprises & Products', zh: '企业与产品', ja: '企業・製品', ko: '기업 및 제품' },
  'Dự án & Đầu tư': { vi: 'Dự án & Đầu tư', en: 'Investment & Projects', zh: '投资与项目', ja: '投資・プロジェクト', ko: '투자 및 프로젝트' },
  'Đầu tư & Dự án': { vi: 'Dự án & Đầu tư', en: 'Investment & Projects', zh: '投资与项目', ja: '投資・プロジェクト', ko: '투자 및 프로젝트' },
  'Nông sản & Cà phê': { vi: 'Nông sản & Cà phê', en: 'Agri & Coffee', zh: '农产品与咖啡', ja: '農産物・コーヒー', ko: '농산물 및 커피' },
  'Cà phê Đắk Lắk': { vi: 'Nông sản & Cà phê', en: 'Agri & Coffee', zh: '农产品与咖啡', ja: '農産物・コーヒー', ko: '농산물 및 커피' },
  'Du lịch & Trải nghiệm': { vi: 'Du lịch & Trải nghiệm', en: 'Tourism & Experiences', zh: '旅游与体验', ja: '観光・体験', ko: '관광 및 체험' },
  'Kinh tế Biển': { vi: 'Kinh tế Biển', en: 'Marine Economy', zh: '海洋经济', ja: '海洋経済', ko: '해양 경제' },
  'Dữ liệu & Báo cáo': { vi: 'Dữ liệu & Báo cáo', en: 'Data & Reports', zh: '数据与报告', ja: 'データ・レポート', ko: '데이터 및 보고서' },
  'Sự kiện & Diễn đàn': { vi: 'Sự kiện & Diễn đàn', en: 'Events & Forums', zh: '活动与论坛', ja: 'イベント・フォーラム', ko: '이벤트 및 포럼' },
  
  // Legacy / Fallback Categories
  'Tư vấn Vay vốn & Tài chính': { vi: 'Tư vấn Vay vốn', en: 'Loan & Finance', zh: '贷款与金融', ja: '融資・金融', ko: '대출 및 금융' },
  'Truyền thông Thương hiệu': { vi: 'Truyền thông', en: 'Brand & PR', zh: '品牌传媒', ja: 'ブランドPR', ko: '브랜드 홍보' },
  'Marketing & Bán hàng': { vi: 'Marketing & Bán hàng', en: 'Marketing & Sales', zh: '营销与销售', ja: '営業・マーケティング', ko: '마케팅 및 영업' },
  'Ứng dụng AI & Công nghệ': { vi: 'Ứng dụng AI', en: 'AI & Tech', zh: 'AI与技术', ja: 'AI・テクノロジー', ko: 'AI 및 기술' },
  'Thực hành ESG & Phát triển bền vững': { vi: 'Thực hành ESG', en: 'ESG Practice', zh: 'ESG实践', ja: 'ESG実践', ko: 'ESG 실천' },
  'Hiệp hội & Giao thương': { vi: 'Hiệp hội & Đối tác', en: 'Associations', zh: '协会与合作', ja: '協会・パートナー', ko: '협회 및 파트너' },
  'Tài chính - Ngân hàng': { vi: 'Tài chính - Ngân hàng', en: 'Finance & Banking', zh: '金融与银行', ja: '金融・銀行', ko: '금융 및 은행' },
  'Bất động sản & Xây dựng': { vi: 'Bất động sản & Xây dựng', en: 'Real Estate & Construction', zh: '房地产与建筑', ja: '不動産・建設', ko: '부동산 및 건설' },
  'Công nghệ - Chuyển đổi số': { vi: 'Công nghệ - Chuyển đổi số', en: 'Tech & Digital Transformation', zh: '数字化转型', ja: 'DX・テクノロジー', ko: '디지털 전환' },
  'Khởi nghiệp - Đổi mới sáng tạo': { vi: 'Khởi nghiệp - Đổi mới sáng tạo', en: 'Startups & Innovation', zh: '创新创业', ja: 'スタートアップ', ko: '스타트업 및 혁신' },
  'Pháp luật - Chính sách': { vi: 'Pháp luật - Chính sách', en: 'Legal & Policy', zh: '法律政策', ja: '法律・政策', ko: '법률 및 정책' },
  'Doanh nghiệp & Xã hội': { vi: 'Doanh nghiệp & Xã hội', en: 'Business & Society', zh: '企业与社会', ja: '企業と社会', ko: '기업과 사회' },
  'Thị trường - Tiêu dùng': { vi: 'Thị trường - Tiêu dùng', en: 'Market & Consumer', zh: '市场与消费', ja: '市場・消費', ko: '시장 및 소비' },
  'Nông nghiệp - Môi trường': { vi: 'Nông nghiệp - Môi trường', en: 'Agriculture & Environment', zh: '农业与环境', ja: '農業・環境', ko: '농업 및 환경' },
  'Công nghiệp - Năng lượng': { vi: 'Công nghiệp - Năng lượng', en: 'Industry & Energy', zh: '工业与能源', ja: '産業・エネルギー', ko: '산업 및 에너지' },
  'Du lịch - Dịch vụ': { vi: 'Du lịch - Dịch vụ', en: 'Tourism & Services', zh: '旅游与服务', ja: '観光・サービス', ko: '관광 및 서비스' }
};

export const SUBCATEGORY_LABELS = {
  // Dak Lak Subcategories
  'Điểm đến & Thắng cảnh': { vi: 'Điểm đến & Thắng cảnh', en: 'Destinations & Landscapes', zh: '景点与景观', ja: '観光名所・風景', ko: '명소 및 경관' },
  'Văn hóa Cồng chiêng': { vi: 'Văn hóa Cồng chiêng', en: 'Gong Culture', zh: '锣鼓文化', ja: 'ゴング文化', ko: '징 문화' },
  'Ẩm thực Tây Nguyên': { vi: 'Ẩm thực Tây Nguyên', en: 'Central Highlands Cuisine', zh: '西原美食', ja: '中部高原料理', ko: '중부고원 요리' },
  'Di sản & Lịch sử': { vi: 'Di sản & Lịch sử', en: 'Heritage & History', zh: '遗产与历史', ja: '遺産・歴史', ko: '유산 및 역사' },
  'Danh bạ Doanh nghiệp': { vi: 'Danh bạ Doanh nghiệp', en: 'Business Directory', zh: '企业名录', ja: '企業名鑑', ko: '기업 디렉토리' },
  'Sản phẩm OCOP & Nông sản': { vi: 'Sản phẩm OCOP & Nông sản', en: 'OCOP & Agro-products', zh: 'OCOP与农产品', ja: 'OCOP・農産物', ko: 'OCOP 및 농산물' },
  'Khởi nghiệp Đổi mới sáng tạo': { vi: 'Khởi nghiệp Đổi mới sáng tạo', en: 'Startups & Innovation', zh: '创新创业', ja: 'スタートアップ・革新', ko: '스타트업 및 혁신' },
  'Showroom số': { vi: 'Showroom số', en: 'Digital Showroom', zh: '数字展厅', ja: 'デジタルショールーム', ko: '디지털 쇼룸' },
  'Danh mục Dự án Kêu gọi': { vi: 'Danh mục Dự án Kêu gọi', en: 'Invited Projects', zh: '招商引资项目', ja: '誘致プロジェクト', ko: '유치 프로젝트' },
  'Khu & Cụm công nghiệp': { vi: 'Khu & Cụm công nghiệp', en: 'Industrial Parks', zh: '工业区与产业集群', ja: '工業団地・集積地', ko: '산업단지 및 클러스터' },
  'Vùng nguyên liệu & Quỹ đất': { vi: 'Vùng nguyên liệu & Quỹ đất', en: 'Raw Material Zones', zh: '原料区与土地基金', ja: '原料地域・用地', ko: '원자재 지역 및 부지' },
  'Chính sách & Ưu đãi Đầu tư': { vi: 'Chính sách & Ưu đãi Đầu tư', en: 'Incentive Policies', zh: '投资优惠政策', ja: '投資優遇政策', ko: '투자 우대 정책' },
  'Chuỗi giá trị Cà phê': { vi: 'Chuỗi giá trị Cà phê', en: 'Coffee Value Chain', zh: '咖啡价值链', ja: 'コーヒーバリューチェーン', ko: '커피 가치 사슬' },
  'Công nghệ Chế biến sâu': { vi: 'Công nghệ Chế biến sâu', en: 'Deep Processing Tech', zh: '深加工技术', ja: '深加工技術', ko: '심가공 기술' },
  'Thương hiệu & Thị trường': { vi: 'Thương hiệu & Thị trường', en: 'Brand & Markets', zh: '品牌与市场', ja: 'ブランド・市場', ko: '브랜드 및 시장' },
  'Văn hóa Cà phê': { vi: 'Văn hóa Cà phê', en: 'Coffee Culture', zh: '咖啡文化', ja: 'コーヒー文化', ko: '커피 문화' },
  'Hành trình 2N1Đ & 3N2Đ': { vi: 'Hành trình 2N1Đ & 3N2Đ', en: '2D1N & 3D2N Itineraries', zh: '2天1夜与3天2夜行程', ja: '2泊3日モデルコース', ko: '2박 3일 추천 일정' },
  'Du lịch Sinh thái & Bản làng': { vi: 'Du lịch Sinh thái & Bản làng', en: 'Ecotourism & Villages', zh: '生态与村落旅游', ja: 'エコツーリズム・集落', ko: '생태 및 마을 관광' },
  'Lưu trú & Homestay': { vi: 'Lưu trú & Homestay', en: 'Stays & Homestays', zh: '住宿与民宿', ja: '宿泊・ホームステイ', ko: '숙박 및 홈스테이' },
  'Lễ hội & Sự kiện': { vi: 'Lễ hội & Sự kiện', en: 'Festivals & Events', zh: '节日与活动', ja: 'フェスティバル・イベント', ko: '축제 및 이벤트' },
  'Chỉ số Kinh tế - Xã hội': { vi: 'Chỉ số Kinh tế - Xã hội', en: 'Socio-economic Indicators', zh: '社会经济指标', ja: '社会経済指標', ko: '사회경제 지표' },
  'Bản đồ Cơ hội Đắk Lắk': { vi: 'Bản đồ Cơ hội Đắk Lắk', en: 'Opportunity Map', zh: '机遇地图', ja: 'オポチュニティマップ', ko: '기회 지도' },
  'Báo cáo Ngành hàng': { vi: 'Báo cáo Ngành hàng', en: 'Industry Reports', zh: '行业报告', ja: '業界レポート', ko: '산업 보고서' },
  'Quy hoạch Tỉnh Đắk Lắk': { vi: 'Quy hoạch Tỉnh Đắk Lắk', en: 'Provincial Master Plan', zh: '省总体规划', ja: '省総合計画', ko: '성 종합 계획' },
  'Lễ hội Cà phê Buôn Ma Thuột': { vi: 'Lễ hội Cà phê Buôn Ma Thuột', en: 'Buon Ma Thuot Coffee Festival', zh: '邦美蜀咖啡节', ja: 'バンメトートコーヒー祭り', ko: '부온마투옷 커피 축제' },
  'Diễn đàn Xúc tiến Đầu tư': { vi: 'Diễn đàn Xúc tiến Đầu tư', en: 'Investment Forum', zh: '投资促进论坛', ja: '投資促進フォーラム', ko: '투자 촉진 포럼' },
  'Hội thảo Kinh tế': { vi: 'Hội thảo Kinh tế', en: 'Economic Seminars', zh: '经济研讨会', ja: '経済セミナー', ko: '경제 세미나' },
  'Giao thương & Kết nối B2B': { vi: 'Giao thương & Kết nối B2B', en: 'B2B Trade & Networking', zh: 'B2B商务对接', ja: 'B2Bビジネスマッチング', ko: 'B2B 무역 및 네트워킹' }
};

export const getCategoryLabel = (cat, lang = 'vi') => {
  if (!cat) return '';
  const l = lang || 'vi';
  if (typeof cat === 'object') {
    if (cat.name) {
      if (CATEGORY_LABELS[cat.name]?.[l]) return CATEGORY_LABELS[cat.name][l];
      if (l === 'en' && cat.name_en) return String(cat.name_en);
      if (l !== 'vi' && CATEGORY_LABELS[cat.name]?.en) return CATEGORY_LABELS[cat.name].en;
      return String(cat.name);
    }
    return '';
  }
  if (typeof cat === 'string') {
    if (CATEGORY_LABELS[cat]?.[l]) return CATEGORY_LABELS[cat][l];
    if (l !== 'vi' && CATEGORY_LABELS[cat]?.en) return CATEGORY_LABELS[cat].en;
    return cat;
  }
  return String(cat);
};

export const getSubCategoryLabel = (sub, lang = 'vi') => {
  if (!sub) return '';
  const l = lang || 'vi';
  if (typeof sub === 'object') {
    if (sub.name) {
      if (SUBCATEGORY_LABELS[sub.name]?.[l]) return SUBCATEGORY_LABELS[sub.name][l];
      if (l === 'en' && sub.name_en) return String(sub.name_en);
      if (l !== 'vi' && SUBCATEGORY_LABELS[sub.name]?.en) return SUBCATEGORY_LABELS[sub.name].en;
      return String(sub.name);
    }
    return '';
  }
  if (typeof sub === 'string') {
    if (SUBCATEGORY_LABELS[sub]?.[l]) return SUBCATEGORY_LABELS[sub][l];
    if (l !== 'vi' && SUBCATEGORY_LABELS[sub]?.en) return SUBCATEGORY_LABELS[sub].en;
    return sub;
  }
  return String(sub);
};

export default CATEGORIES_DATA;
