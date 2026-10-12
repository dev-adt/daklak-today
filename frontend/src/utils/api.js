/**
 * Fast & Resilient API Client with strict timeouts & fallbacks
 * Prevents endless loading spinners when backend/network is slow or recovering.
 */

export const DEFAULT_TIMEOUT_MS = 10000;

export async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Yêu cầu mạng hết thời gian chờ (${timeoutMs}ms): ${url}`);
    }
    throw error;
  }
}

export async function fetchJsonWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const res = await fetchWithTimeout(url, options, timeoutMs);
  if (!res.ok) {
    let errMsg = `HTTP Error ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson && errJson.error) errMsg = errJson.error;
    } catch (_) {}
    throw new Error(errMsg);
  }
  return await res.json();
}

/**
 * Fallback data cho DakLak.today để trang luôn hiển thị nội dung phong phú và hấp dẫn
 */
export const FALLBACK_POSTS = [
  {
    id: 'fb-post-1',
    title: 'Vì sao Đắk Lắk đang vươn lên thành thủ phủ công nghiệp chế biến sâu cà phê của châu Á?',
    slug: 'vi-sao-dak-lak-vuon-len-thanh-thu-phu-che-bien-sau-ca-phe',
    category: 'Cà phê Đắk Lắk',
    sub_category: 'Công nghệ Chế biến sâu',
    summary: 'Phân tích chiến lược chuyển đổi từ xuất khẩu cà phê nhân thô sang chuỗi giá trị chế biến sâu, nâng cao giá trị thặng dư gấp 4 lần và định vị thương hiệu cà phê Buôn Ma Thuột toàn cầu.',
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
    author_name: 'Ban Biên tập DakLak.today',
    company_name: 'Hiệp hội Cà phê Buôn Ma Thuột',
    company_tier: 'Diamond',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    views: 3420,
    is_featured: 1
  },
  {
    id: 'fb-post-2',
    title: 'Bazan Heritage Coffee: Mô hình chuỗi giá trị cà phê đặc sản từ nông trường bazan đến ly cà phê cao cấp',
    slug: 'bazan-heritage-coffee-mo-hinh-chuoi-gia-tri-ca-phe-dac-san',
    category: 'Doanh nghiệp & Sản phẩm',
    sub_category: 'Sản phẩm OCOP & Nông sản',
    summary: 'Case study tiêu biểu về doanh nghiệp Đắk Lắk đầu tư đồng bộ vùng trồng hữu cơ, nhà máy rang xay chuẩn quốc tế và xây dựng câu chuyện thương hiệu đậm bản sắc đại ngàn.',
    image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    author_name: 'Nhóm Nghiên cứu Kinh tế Đắk Lắk',
    company_name: 'Bazan Heritage Coffee',
    company_tier: 'Diamond',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    views: 2850,
    is_featured: 1
  },
  {
    id: 'fb-post-3',
    title: 'Danh mục 15 dự án trọng điểm kêu gọi đầu tư của tỉnh Đắk Lắk giai đoạn 2026 - 2030',
    slug: 'danh-muc-15-du-an-trong-diem-keu-goi-dau-tu-dak-lak',
    category: 'Đầu tư & Dự án',
    sub_category: 'Danh mục Dự án Kêu gọi',
    summary: 'Tập trung các lĩnh vực chế biến nông sản công nghệ cao, hạ tầng logistics Buôn Ma Thuột, khu công nghiệp Hòa Phú mở rộng và các tổ hợp du lịch sinh thái nghỉ dưỡng Hồ Lắk.',
    image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    author_name: 'Trung tâm Xúc tiến Đầu tư',
    company_name: 'Cổng thông tin & Dữ liệu DakLak.today',
    company_tier: 'Gold',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    views: 1980,
    is_featured: 1
  },
  {
    id: 'fb-post-4',
    title: 'Hành trình di sản đại ngàn: Đánh thức không gian văn hóa cồng chiêng và du lịch cộng đồng',
    slug: 'hanh-trinh-di-san-dai-ngan-khong-gian-van-hoa-cong-chieng',
    category: 'Du lịch & Trải nghiệm',
    sub_category: 'Du lịch Sinh thái & Bản làng',
    summary: 'Trải nghiệm văn hóa sống động cùng nghệ nhân bản địa, khám phá thác Dray Nur, vườn quốc gia Yok Đôn và những buôn làng lưu giữ trọn vẹn hồn thiêng sử thi Ê Đê.',
    image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    author_name: 'Ban Văn hóa & Du lịch',
    company_name: 'Tổ hợp Du lịch Sinh thái Hồ Lắk',
    company_tier: 'Gold',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    views: 1650,
    is_featured: 0
  }
];

export const FALLBACK_EVENTS = [
  {
    id: 'fb-evt-1',
    title: 'Lễ hội Cà phê Buôn Ma Thuột — Tôn vinh Hạt ngọc Bazan & Kết nối Giao thương Toàn cầu',
    slug: 'le-hoi-ca-phe-buon-ma-thuot-2026',
    short_desc: 'Sự kiện văn hóa kinh tế tầm vóc quốc tế kết nối hơn 500 nhà xuất nhập khẩu, chuyên gia rang xay và nhà đầu tư trong chuỗi giá trị cà phê.',
    event_date: new Date(Date.now() + 86400000 * 18).toISOString(),
    location: 'Quảng trường 10/3 & Bảo tàng Thế giới Cà phê, TP. Buôn Ma Thuột, Đắk Lắk',
    organizer: 'Ban Tổ chức Lễ hội Cà phê & DakLak.today',
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
    is_paid: 0,
    price: 0,
    remaining_tickets: 450,
    registered_count: 350
  },
  {
    id: 'fb-evt-2',
    title: 'Diễn đàn Xúc tiến Đầu tư Nông nghiệp Công nghệ cao & Logistics Tây Nguyên 2026',
    slug: 'dien-dan-xuc-tien-dau-tu-nong-nghiep-cnc-logistics-tay-nguyen',
    short_desc: 'Đối thoại trực tiếp giữa Lãnh đạo tỉnh, tổ chức tài chính, quỹ đầu tư ESG và cộng đồng doanh nghiệp về cơ chế tiếp cận đất đai và ưu đãi đầu tư.',
    event_date: new Date(Date.now() + 86400000 * 28).toISOString(),
    location: 'Trung tâm Hội nghị Tỉnh Đắk Lắk, TP. Buôn Ma Thuột',
    organizer: 'Trung tâm Xúc tiến Đầu tư & ADT Group',
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    is_paid: 0,
    price: 0,
    remaining_tickets: 180,
    registered_count: 120
  }
];

export const FALLBACK_MEMBERS = [
  {
    id: 1,
    name: 'Công ty Cổ phần Bazan Heritage Coffee',
    company_name: 'Công ty Cổ phần Bazan Heritage Coffee',
    tier: 'Platinum',
    industry: 'Cà phê đặc sản & Chế biến sâu',
    address: 'Khu công nghiệp Tân An, TP. Buôn Ma Thuột, Đắk Lắk',
    logo_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80',
    bio: 'Doanh nghiệp tiên phong ứng dụng công nghệ rang xay hiện đại chuẩn Châu Âu, sở hữu vùng nguyên liệu cà phê hữu cơ bền vững tại Cư M’gar và Krông Năng.'
  },
  {
    id: 2,
    name: 'Tập đoàn Nông nghiệp Công nghệ cao Tây Nguyên',
    company_name: 'Tập đoàn Nông nghiệp Công nghệ cao Tây Nguyên',
    tier: 'Gold',
    industry: 'Nông nghiệp CNC, Sầu riêng & Mắc ca',
    address: 'Xã Hòa Đông, Huyện Krông Pắc, Tỉnh Đắk Lắk',
    logo_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
    bio: 'Đơn vị sở hữu chuỗi liên kết bao tiêu nông sản xuất khẩu chủ lực đạt chuẩn VietGAP & GlobalGAP, cung ứng thị trường Trung Quốc, Nhật Bản và EU.'
  },
  {
    id: 3,
    name: 'Công ty Cổ phần ADT Quốc tế',
    company_name: 'Công ty Cổ phần ADT Quốc tế',
    tier: 'Platinum',
    industry: 'Công nghệ số, AI Agent & Nền tảng Đô thị thông minh',
    address: 'Hà Nội & Chi nhánh Đại diện Tây Nguyên',
    logo_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
    bio: 'Đơn vị kiến trúc và phát triển nền tảng số DakLak.today, hệ thống kết nối đầu tư thông minh và giải pháp chuyển đổi số toàn diện cho doanh nghiệp.'
  }
];
