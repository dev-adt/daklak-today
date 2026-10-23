import React, { useState, useEffect, useMemo } from 'react';
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

// Helper format ngày giờ cho sự kiện (Ví dụ: 13:30 Thứ Năm, 22/10/2026)
const formatEventDateTime = (dateVal) => {
  if (!dateVal) return '';
  try {
    let dateStr = String(dateVal).trim();
    if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}(:\d{2})?$/.test(dateStr)) {
      dateStr = dateStr.replace(' ', 'T') + '+07:00';
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateVal);
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const dayName = dayNames[d.getDay()];
    const dateFormatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    return `${timeStr} ${dayName}, ${dateFormatted}`;
  } catch (e) {
    return String(dateVal);
  }
};

// Helper format giá vé sự kiện
const formatEventPrice = (evt) => {
  if (!evt || !evt.is_paid || !evt.price || Number(evt.price) === 0) {
    return 'Miễn phí';
  }
  return `${Number(evt.price).toLocaleString('vi-VN')} đ`;
};

// Sub-component đếm ngược sự kiện trang chủ độc lập
// Tách biệt state để KHÔNG kích hoạt re-render toàn bộ 15 section của trang chủ mỗi giây
const HomeEventCountdown = React.memo(({ eventDate }) => {
  const calculateTimeLeft = (date) => {
    if (!date) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    let dateStr = String(date).trim();
    if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}(:\d{2})?$/.test(dateStr)) {
      dateStr = dateStr.replace(' ', 'T') + '+07:00';
    }
    const target = new Date(dateStr).getTime();
    if (isNaN(target)) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const diff = target - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(eventDate));

  useEffect(() => {
    if (!eventDate) return;
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(eventDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [eventDate]);

  return (
    <div className="daklak-event-countdown-grid">
      <div className="daklak-event-countdown-unit">
        <span className="daklak-event-countdown-num notranslate" translate="no">
          {String(timeLeft.days).padStart(2, '0')}
        </span>
        <span className="daklak-event-countdown-label">NGÀY</span>
      </div>
      <div className="daklak-event-countdown-unit">
        <span className="daklak-event-countdown-num notranslate" translate="no">
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span className="daklak-event-countdown-label">GIỜ</span>
      </div>
      <div className="daklak-event-countdown-unit">
        <span className="daklak-event-countdown-num notranslate" translate="no">
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span className="daklak-event-countdown-label">PHÚT</span>
      </div>
      <div className="daklak-event-countdown-unit">
        <span className="daklak-event-countdown-num notranslate" translate="no">
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <span className="daklak-event-countdown-label">GIÂY</span>
      </div>
    </div>
  );
});

// 7 Doanh nghiệp tiêu biểu (1 Group + 6 công ty thành viên) theo tài liệu "Doanh nghiệp tiêu biểu daklaktoday.docx"
const FEATURED_ENTERPRISES = [
  {
    id: 'minh-dang-group',
    name: 'TẬP ĐOÀN MINH ĐĂNG',
    shortName: 'Minh Đăng Group',
    roleTag: 'Tập đoàn Chủ quản Hệ sinh thái',
    roleTagEn: 'Ecosystem Holding Group',
    year: '2015',
    experience: '10 năm phát triển',
    headquarters: '159 Võ Văn Tần, phường Xuân Hòa, TP. Hồ Chí Minh',
    headquartersEn: '159 Vo Van Tan, Xuan Hoa Ward, Ho Chi Minh City',
    sectors: 'Xuất nhập khẩu nông sản • Chuỗi giá trị cà phê • Dịch vụ y tế • Cảng thủy nội địa & logistics',
    sectorsEn: 'Agri Export • Coffee Value Chain • Healthcare • Inland Port & Logistics',
    philosophy: 'Chất lượng – Đổi mới – Bền vững',
    philosophyEn: 'Quality – Innovation – Sustainability',
    highlight: 'Sau 10 năm phát triển, Minh Đăng Group từng bước trở thành tập đoàn kinh tế đa ngành tại Việt Nam. Tập đoàn chú trọng nâng cao giá trị cà phê Việt Nam, phát triển chuỗi giá trị toàn diện và lan tỏa bản sắc vùng đất Buôn Ma Thuột đến người tiêu dùng trong nước và quốc tế.',
    highlightEn: 'After 10 years of growth, Minh Dang Group has evolved into a prominent multi-industry conglomerate, elevating Vietnamese coffee value and bringing Buon Ma Thuot heritage to global consumers.',
    keyFocus: 'Phát triển hệ sinh thái đa ngành bền vững; hoàn thiện chuỗi giá trị cà phê khép kín từ vùng nguyên liệu, chế biến sâu đến mạng lưới phân phối đa kênh và ứng dụng công nghệ.',
    keyFocusEn: 'Developing a sustainable multi-industry ecosystem; perfecting closed coffee value chains from raw material zones, deep processing to multi-channel distribution and technology.',
    tags: ['Chuỗi giá trị khép kín', 'Phân phối đa kênh', 'Bản sắc Buôn Ma Thuột'],
    tagsEn: ['Closed Value Chain', 'Omni-channel Distribution', 'Buon Ma Thuot Heritage'],
    stats: [
      { label: 'Thành lập', labelEn: 'Founded', value: '2015' },
      { label: 'Quy mô', labelEn: 'Scale', value: 'Đa ngành' },
      { label: 'Thành viên', labelEn: 'Subsidiaries', value: '06 Đơn vị' }
    ],
    logo: '/images/companies/minh-dang-group.jpg',
    color: '#7A3E1D'
  },
  {
    id: 'eakar-vina',
    name: 'CÔNG TY CP XUẤT NHẬP KHẨU EAKAR VINA',
    shortName: 'Eakar Vina',
    roleTag: 'Nông sản Xuất khẩu • Khởi nguồn Ea Kar',
    roleTagEn: 'Agri Export • Ea Kar Heritage',
    year: '2018',
    origin: 'Khởi nguồn từ Ea Kar, Đắk Lắk',
    originEn: 'Originated from Ea Kar, Dak Lak',
    headquarters: 'Tầng 17, Vincom Center, 72 Lê Thánh Tôn, TPHCM | VP: 159 Võ Văn Tần, TPHCM',
    headquartersEn: '17th Fl, Vincom Center, 72 Le Thanh Ton & 159 Vo Van Tan, HCMC',
    sectors: 'Thương mại Cà phê Robusta • Hồ tiêu chất lượng cao • Chuỗi cung ứng nông sản',
    sectorsEn: 'Robusta Coffee • High-grade Pepper • Agricultural Supply Chain',
    philosophy: 'Uy tín – Chất lượng – Đồng hành cùng Nông dân',
    philosophyEn: 'Prestige – Quality – Farmer Partnership',
    highlight: 'Khởi nguồn từ vùng đất Ea Kar (Đắk Lắk), Eakar Vina hướng đến Top 10 doanh nghiệp nông sản hàng đầu Việt Nam. Công ty liên kết chặt chẽ cùng nông hộ địa phương, tạo đầu ra bền vững và đưa nông sản đặc trưng Tây Nguyên vươn tầm quốc tế.',
    highlightEn: 'Rooted in Ea Kar (Dak Lak), aiming for Top 10 agri-enterprises in Vietnam. Partnering closely with local farmers to secure stable output and export Central Highlands produce.',
    keyFocus: 'Tập trung hai ngành hàng chủ lực cà phê và hồ tiêu; đồng hành chặt chẽ cùng nông hộ địa phương, tạo đầu ra ổn định và đưa nông sản đặc trưng Tây Nguyên vươn tầm thế giới.',
    keyFocusEn: 'Focusing on core Robusta coffee & high-grade pepper; closely partnering with local farmers to ensure stable output and elevate Central Highlands produce globally.',
    tags: ['Khởi nguồn Ea Kar - Đắk Lắk', 'Cà phê & Hồ tiêu chủ lực', 'Top 10 Nông sản VN'],
    tagsEn: ['Ea Kar Origin - Dak Lak', 'Key Coffee & Pepper', 'Top 10 Vietnam Agri'],
    stats: [
      { label: 'Xuất phát điểm', labelEn: 'Origin', value: 'Ea Kar, ĐL' },
      { label: 'Chủ lực', labelEn: 'Focus', value: 'Cà phê & Tiêu' },
      { label: 'Mục tiêu', labelEn: 'Target', value: 'Top 10 Nông sản' }
    ],
    logo: '/images/companies/eakar-vina.jpg',
    color: '#1F5A3A'
  },
  {
    id: 'ctp-group',
    name: 'CÔNG TY CP TẬP ĐOÀN CTP GROUP',
    shortName: 'CTP Group (HNX: CTP)',
    roleTag: 'Doanh nghiệp Niêm yết HNX (Mã: CTP)',
    roleTagEn: 'HNX-Listed Enterprise (Stock: CTP)',
    stockCode: 'HNX: CTP',
    year: '2010',
    headquarters: 'Tòa nhà Simco Sông Đà, Vạn Phúc, Hà Đông, Hà Nội | VP: 159 Võ Văn Tần, TPHCM',
    headquartersEn: 'Simco Song Da Bldg, Van Phuc, Ha Dong, Hanoi | Office: 159 Vo Van Tan, HCMC',
    sectors: 'Chế biến & Kinh doanh Cà phê • Bất động sản • Xây dựng & Hạ tầng',
    sectorsEn: 'Coffee Processing & Trade • Real Estate • Construction & Infrastructure',
    philosophy: 'Quy mô vượt trội – Đầu tư chế biến sâu',
    philosophyEn: 'Superior Scale – Deep Processing Investment',
    highlight: 'Doanh nghiệp niêm yết trên sàn chứng khoán HNX, sở hữu hệ thống nhà máy và kho bãi hơn 13.142 m², đầu tư vùng nguyên liệu quy mô lớn và chuỗi giá trị cà phê khép kín gia tăng giá trị.',
    highlightEn: 'Listed on HNX, possessing modern processing facilities and warehouses exceeding 13,142 m², investing in extensive raw material zones and an integrated coffee value chain.',
    keyFocus: 'Doanh nghiệp niêm yết sàn HNX với tiềm lực hạ tầng nhà máy, kho bãi hơn 13.142 m²; đẩy mạnh chế biến sâu, đầu tư vùng nguyên liệu quy mô lớn và phát triển chuỗi giá trị đa ngành.',
    keyFocusEn: 'HNX-listed enterprise boasting modern factory and warehouse facilities exceeding 13,142 m²; accelerating deep agro-processing, extensive plantation zones, and multi-sector investment.',
    tags: ['Niêm yết HNX (Mã: CTP)', 'Kho bãi >13.142 m²', 'Chế biến sâu & Đa ngành'],
    tagsEn: ['HNX-Listed (Stock: CTP)', 'Facilities >13,142 m²', 'Deep Processing & Diversified'],
    stats: [
      { label: 'Mã chứng khoán', labelEn: 'Stock', value: 'HNX: CTP' },
      { label: 'Kho bãi & Nhà máy', labelEn: 'Facilities', value: '13.142 m²' },
      { label: 'Thành lập', labelEn: 'Founded', value: '2010' }
    ],
    logo: '/images/companies/ctp-group.png',
    color: '#A84524'
  },
  {
    id: 'bazan-coffee',
    name: 'NHÀ MÁY BAZAN HERITAGE COFFEE',
    shortName: 'Bazan Heritage Coffee',
    roleTag: 'Nhà máy Chế biến sâu • KCN Hòa Phú',
    roleTagEn: 'Deep-Processing Plant • Hoa Phu IP',
    location: 'Khu công nghiệp Hòa Phú, xã Hòa Phú, TP. Buôn Ma Thuột, Đắk Lắk',
    headquarters: 'KCN Hòa Phú, Buôn Ma Thuột, Đắk Lắk | Trụ sở: 159 Võ Văn Tần, TPHCM',
    headquartersEn: 'Hoa Phu Industrial Park, Buon Ma Thuot, Dak Lak | HQ: 159 Vo Van Tan, HCMC',
    sectors: 'Chế biến sâu Cà phê Robusta Đặc sản • Tinh hoa Hạt Cà phê Đất Đỏ Bazan',
    sectorsEn: 'Specialty Robusta Deep Processing • Red Bazan Soil Heritage',
    philosophy: 'Tôn vinh Giá trị Nguyên bản Hạt Cà phê Việt',
    philosophyEn: 'Honoring Original Value of Vietnamese Coffee',
    highlight: 'Nhà máy tọa lạc tại thủ phủ Đắk Lắk, kế thừa trọn vẹn tinh hoa đất trời bazan với quy trình chế biến hiện đại, gìn giữ hương vị nồng nàn đặc trưng và nâng cao vị thế Robusta Việt Nam trong chuỗi cung ứng toàn cầu.',
    highlightEn: 'Located right in Dak Lak coffee capital, harnessing the rich red basalt soil with advanced processing lines to preserve authentic aroma and elevate Vietnamese Robusta globally.',
    keyFocus: 'Nhà máy hiện đại tọa lạc tại KCN Hòa Phú, Buôn Ma Thuột; chuyên sâu chế biến dòng Robusta đặc sản Tây Nguyên, bảo tồn trọn vẹn hương vị nồng nàn và tinh hoa từ dải đất đỏ bazan màu mỡ.',
    keyFocusEn: 'Modern processing facility in Hoa Phu IP, Buon Ma Thuot; dedicated to premium Central Highlands specialty Robusta, preserving authentic aroma and basalt soil heritage.',
    tags: ['Nhà máy KCN Hòa Phú, BMT', 'Robusta Đặc sản Đắk Lắk', 'Tinh hoa Đất đỏ Bazan'],
    tagsEn: ['Hoa Phu IP Facility, BMT', 'Specialty Dak Lak Robusta', 'Basalt Soil Heritage'],
    stats: [
      { label: 'Vị trí', labelEn: 'Location', value: 'KCN Hòa Phú' },
      { label: 'Dòng sản phẩm', labelEn: 'Products', value: 'Robusta Đặc sản' },
      { label: 'Bản sắc', labelEn: 'Identity', value: 'Đất đỏ Bazan' }
    ],
    logo: '/images/companies/bazan-coffee.jpg',
    color: '#D5A33F'
  },
  {
    id: 'vnt',
    name: 'CÔNG TY TNHH ĐẦU TƯ THƯƠNG MẠI XNK VNT',
    shortName: 'VNT Import Export',
    roleTag: 'Thương mại Quốc tế & Xúc tiến Toàn cầu',
    roleTagEn: 'International Trade & Global Export',
    headquarters: 'Số 11A Hồng Hà, phường Tân Sơn Hòa, TP. Hồ Chí Minh',
    headquartersEn: '11A Hong Ha, Tan Son Hoa Ward, Ho Chi Minh City',
    sectors: 'Thương mại Nông sản • Xuất nhập khẩu Quốc tế • Cung ứng Thị trường',
    sectorsEn: 'Agricultural Trade • Global Import-Export • Market Supply',
    philosophy: 'Chuyên nghiệp – Uy tín – Kết nối Không biên giới',
    philosophyEn: 'Professionalism – Prestige – Borderless Connection',
    highlight: 'Cầu nối xúc tiến thương mại quốc tế uy tín trong hệ sinh thái Minh Đăng Group, chuyên nghiệp hóa chuỗi xuất nhập khẩu và kết nối nông sản Tây Nguyên đến các thị trường tiêu thụ quốc tế.',
    highlightEn: 'A trusted international trade bridge within Minh Dang Group, professionalizing the import-export supply chain and connecting Central Highlands produce globally.',
    keyFocus: 'Cầu nối thương mại quốc tế uy tín trong hệ sinh thái, chuyên nghiệp hóa chuỗi cung ứng xuất nhập khẩu nông sản và mở rộng kênh phân phối đến các thị trường tiêu chuẩn cao toàn cầu.',
    keyFocusEn: 'Trusted international trade gateway within the ecosystem, professionalizing agri import-export supply chains and expanding distribution to high-standard global markets.',
    tags: ['Thương mại Nông sản Quốc tế', 'Chuỗi cung ứng XNK', 'Kết nối Không biên giới'],
    tagsEn: ['International Agri-Trade', 'Import-Export Supply Chain', 'Borderless Connection'],
    stats: [
      { label: 'Lĩnh vực', labelEn: 'Sector', value: 'XNK Nông sản' },
      { label: 'Mạng lưới', labelEn: 'Network', value: 'Quốc tế' },
      { label: 'Tiêu chuẩn', labelEn: 'Standard', value: 'Chuyên nghiệp' }
    ],
    logo: '/images/companies/vnt.png',
    color: '#185FA5'
  },
  {
    id: 'phuc-vinh',
    name: 'CÔNG TY CP ĐẦU TƯ XUẤT NHẬP KHẨU PHÚC VINH',
    shortName: 'Phúc Vinh Port & Logistics',
    roleTag: 'Hạ tầng Cảng thủy Nội địa & Logistics',
    roleTagEn: 'Inland Port & Logistics Infrastructure',
    headquarters: 'Số 322, ấp Phước Trung, xã Phước Vinh, Tỉnh Tây Ninh',
    headquartersEn: '322, Phuoc Trung Hamlet, Phuoc Vinh Commune, Tay Ninh Province',
    sectors: 'Khai thác Cảng thủy Nội địa • Vận tải Hàng hóa • Logistics Nông sản Chuỗi',
    sectorsEn: 'Inland Port Operations • Freight Waterway Transport • Agri-Logistics',
    philosophy: 'Lưu thông Hiệu quả – Kết nối Chuỗi Cung ứng',
    philosophyEn: 'Efficient Circulation – Supply Chain Connectivity',
    highlight: 'Phát triển hạ tầng cảng thủy nội địa hiện đại, tối ưu hóa quy trình lưu thông và giảm thiểu chi phí logistics cho hàng hóa nông sản trong chuỗi giá trị xuất nhập khẩu.',
    highlightEn: 'Developing modern inland port infrastructure, optimizing circulation processes, and reducing logistics costs for agricultural produce in the export supply chain.',
    keyFocus: 'Khai thác cảng thủy nội địa và mạng lưới logistics tổng hợp tại Tây Ninh; kết nối vận tải thủy - bộ thông suốt, giảm thiểu chi phí lưu thông và nâng cao năng lực cạnh tranh cho nông sản xuất khẩu.',
    keyFocusEn: 'Operating modern inland port and logistics hub in Tay Ninh; seamlessly connecting inland waterway & road freight to cut transit costs and boost export competitiveness.',
    tags: ['Cảng thủy nội địa hiện đại', 'Logistics Nông sản tổng hợp', 'Tối ưu Chi phí Chuỗi'],
    tagsEn: ['Modern Inland Port', 'Integrated Agri-Logistics', 'Transit Cost Optimization'],
    stats: [
      { label: 'Hạ tầng', labelEn: 'Infra', value: 'Cảng thủy nội địa' },
      { label: 'Vị trí', labelEn: 'Location', value: 'Tây Ninh' },
      { label: 'Tối ưu', labelEn: 'Role', value: 'Giảm phí Logistics' }
    ],
    logo: '/images/companies/phuc-vinh.png',
    color: '#0F766E'
  },
  {
    id: 'md-homes',
    name: 'CÔNG TY CỔ PHẦN THƯƠNG MẠI MD HOMES',
    shortName: 'MD Homes',
    roleTag: 'Nông sản Hồ tiêu & Đầu tư Bất động sản',
    roleTagEn: 'Pepper Trading & Real Estate',
    headquarters: '159 Võ Văn Tần, phường Xuân Hòa, TP. Hồ Chí Minh',
    headquartersEn: '159 Vo Van Tan, Xuan Hoa Ward, Ho Chi Minh City',
    sectors: 'Kinh doanh & Cung ứng Hồ tiêu xuất khẩu • Đầu tư & Kinh doanh Bất động sản',
    sectorsEn: 'High-grade Pepper Export • Real Estate Investment',
    philosophy: 'Đa dạng hóa Danh mục – Giá trị Bền vững',
    philosophyEn: 'Portfolio Diversification – Sustainable Value',
    highlight: 'Cung ứng nguồn hồ tiêu Tây Nguyên tiêu chuẩn cao cho thị trường trong nước và quốc tế, song song khai thác các cơ hội bất động sản tạo nền tảng tăng trưởng vững chắc dài hạn.',
    highlightEn: 'Supplying high-standard Central Highlands pepper to domestic and foreign markets, alongside real estate investment opportunities for long-term growth.',
    keyFocus: 'Kết hợp song hành hai trụ cột: cung ứng hồ tiêu Tây Nguyên tiêu chuẩn cao cho thị trường trong nước & xuất khẩu, đồng thời khai thác cơ hội đầu tư bất động sản tạo đòn bẩy phát triển dài hạn.',
    keyFocusEn: 'Dual-pillar strategy: supplying high-grade Central Highlands pepper for domestic & export markets, alongside real estate investments to drive sustainable long-term value.',
    tags: ['Cung ứng Hồ tiêu Xuất khẩu', 'Đầu tư & Bất động sản', 'Tăng trưởng Đa dạng hóa'],
    tagsEn: ['Export Pepper Supply', 'Real Estate Investment', 'Diversified Growth'],
    stats: [
      { label: 'Sản phẩm chính', labelEn: 'Main Product', value: 'Hồ tiêu chất lượng' },
      { label: 'Mảng bổ trợ', labelEn: 'Addition', value: 'Bất động sản' },
      { label: 'Thị trường', labelEn: 'Market', value: 'Nội địa & XNK' }
    ],
    logo: '/images/companies/md-homes.png',
    color: '#C2410C'
  }
];

// Danh sách logo đối tác (hiển thị 4 logo trên thanh lướt 1s vô hạn ở dưới cùng)
const PARTNER_COMPANIES = [
  { id: 1, name: 'Minh Đăng Group', logo: '/images/companies/minh-dang-group.jpg' },
  { id: 2, name: 'Eakar Vina', logo: '/images/companies/eakar-vina.jpg' },
  { id: 3, name: 'CTP Group (HNX: CTP)', logo: '/images/companies/ctp-group.png' },
  { id: 4, name: 'Bazan Heritage Coffee', logo: '/images/companies/bazan-coffee.jpg' },
  { id: 5, name: 'VNT Import Export', logo: '/images/companies/vnt.png' },
  { id: 6, name: 'Phúc Vinh Port & Logistics', logo: '/images/companies/phuc-vinh.png' },
  { id: 7, name: 'MD Homes', logo: '/images/companies/md-homes.png' }
];

// Danh sách Trụ cột Đầu tư & Điểm đến Tiêu biểu (Globe Trekker layout)
const TOP_DESTINATIONS = [
  {
    id: 1,
    title: 'Thủ Phủ Cà Phê & Chế Biến Sâu',
    titleEn: 'Global Coffee Capital & Deep Processing',
    location: 'TP. Buôn Ma Thuột & Cư M’gar',
    locationEn: 'Buon Ma Thuot & Cu Mgar',
    image: '/images/daklak/daklak_doi_ca_phe.jpg',
    category: 'coffee',
    link: `/posts?category=${encodeURIComponent('Nông sản & Cà phê')}`
  },
  {
    id: 2,
    title: 'Cụm Công Nghiệp & Trung Tâm Logistics ICD',
    titleEn: 'Inland Port & Logistics Infrastructure',
    location: 'Vành đai Kinh tế Buôn Ma Thuột',
    locationEn: 'Buon Ma Thuot Economic Ring',
    image: '/images/daklak/daklak_dau_tu_logistics.jpg',
    category: 'investment',
    link: `/posts?category=${encodeURIComponent('Dự án & Đầu tư')}`
  },
  {
    id: 3,
    title: 'Vùng Nông Nghiệp Công Nghệ Cao Ea Kar',
    titleEn: 'High-Tech Agri Zone & Global Export',
    location: 'Ea Kar & Krông Pắc, Đắk Lắk',
    locationEn: 'Ea Kar & Krong Pac, Dak Lak',
    image: '/images/daklak/daklak_ca_phe.jpg',
    category: 'agritech',
    link: `/posts?category=${encodeURIComponent('Nông sản & Cà phê')}`
  },
  {
    id: 4,
    title: 'Hành Lang Cao Tốc Buôn Ma Thuột - Khánh Hòa',
    titleEn: 'Expressway Corridor To Deep Seaports',
    location: 'Trục Huyết Mạch Kết Nối Cảng Biển',
    locationEn: 'Arterial Link to International Ports',
    image: '/images/daklak/daklak_bien_ganh_da_dia.jpg',
    category: 'investment',
    link: `/posts?category=${encodeURIComponent('Kinh tế Biển')}`
  },
  {
    id: 5,
    title: 'Thác Dray Nur Hùng Vĩ & Du Lịch Sinh Thái',
    titleEn: 'Majestic Dray Nur & Eco-Tourism Belt',
    location: 'Krông Ana, Đắk Lắk',
    locationEn: 'Krong Ana, Dak Lak',
    image: '/images/daklak/daklak_thac_dray_nur.jpg',
    category: 'tourism',
    link: `/posts?category=${encodeURIComponent('Khám phá Đắk Lắk')}`
  },
  {
    id: 6,
    title: 'Bảo Tàng Thế Giới Cà Phê & Đô Thị Bản Sắc',
    titleEn: 'World Coffee Museum & Eco-Urban Hub',
    location: 'TP. Buôn Ma Thuột, Đắk Lắk',
    locationEn: 'Buon Ma Thuot, Dak Lak',
    image: '/images/daklak/daklak_doi_ca_phe.jpg',
    category: 'coffee',
    link: `/posts?category=${encodeURIComponent('Nông sản & Cà phê')}`
  },
  {
    id: 7,
    title: 'Tổ Hợp Năng Lượng Tái Tạo & Điện Gió',
    titleEn: 'Renewable Wind Energy & Green Power',
    location: 'Ea H\'leo & Krông Búk, Đắk Lắk',
    locationEn: 'Ea Hleo & Krong Buk, Dak Lak',
    image: '/images/daklak/daklak_dau_tu_logistics.jpg',
    category: 'investment',
    link: `/posts?category=${encodeURIComponent('Dự án & Đầu tư')}`
  },
  {
    id: 8,
    title: 'Không Gian Văn Hóa Cồng Chiêng UNESCO',
    titleEn: 'UNESCO Gong Heritage & Lake Lak Ede Village',
    location: 'Huyện Lắk & Buôn Đôn, Đắk Lắk',
    locationEn: 'Lak District & Buon Don, Dak Lak',
    image: '/images/daklak/daklak_cong_chieng.jpg',
    category: 'tourism',
    link: `/posts?category=${encodeURIComponent('Du lịch & Trải nghiệm')}`
  }
];

// Fallback images đa dạng cho bài viết không có ảnh đại diện (tránh 2 bài liên tiếp cùng ảnh)
const FALLBACK_POST_IMAGES = [
  '/images/daklak/daklak_doi_ca_phe.jpg',
  '/images/daklak/daklak_thac_dray_nur.jpg',
  '/images/daklak/daklak_dau_tu_logistics.jpg',
  '/images/daklak/daklak_ca_phe.jpg',
  '/images/daklak/daklak_cong_chieng.jpg',
  '/images/daklak/daklak_le_hoi_nha_rong.jpg',
  '/images/daklak/daklak_bien_ganh_da_dia.jpg',
  '/images/daklak/daklak_nha_rong_ede.jpg'
];

const isGenericOrPlaceholder = (url) => {
  if (!url || typeof url !== 'string' || url.trim() === '') return true;
  const lower = url.toLowerCase();
  return (
    lower.includes('cong_chieng') ||
    lower.includes('doi_ca_phe') ||
    lower.includes('default') ||
    lower.includes('placeholder') ||
    lower.includes('photo-1514432324607-a09d9b4aefdd') ||
    lower.includes('photo-1500382017468') ||
    lower.includes('photo-1506744038136')
  );
};

const getPostThumb = (post, idx = 0) => {
  const url = post?.image_url || post?.cover_image || post?.thumbnail;
  if (url && typeof url === 'string' && url.trim() !== '' && !isGenericOrPlaceholder(url)) {
    return url;
  }
  return FALLBACK_POST_IMAGES[idx % FALLBACK_POST_IMAGES.length];
};

// Dữ liệu Top 10 Doanh nghiệp xuất khẩu cà phê Tây Nguyên
const TOP_EXPORTERS_TAY_NGUYEN = {
  title: 'Top 10 Doanh Nghiệp Xuất Khẩu Cà Phê Tây Nguyên',
  titleEn: 'Top 10 Coffee Exporters in Central Highlands',
  sub: 'Những cánh chim đầu đàn đưa Robusta Buôn Ma Thuột và Tây Nguyên chinh phục thị trường toàn cầu',
  subEn: 'Flagship enterprises elevating Buon Ma Thuot & Central Highlands Robusta globally',
  top3: [
    {
      name: 'Simexco Đắk Lắk',
      sub: 'Công ty TNHH MTV XNK 2-9 Đắk Lắk',
      logo: '/images/exporters/simexco.png',
      highlight: 'Doanh nghiệp nhà nước đầu tàu của Đắk Lắk, kim ngạch hàng trăm triệu USD/năm, liên kết chuỗi bền vững với hơn 40.000 nông hộ Tây Nguyên.',
      highlightEn: 'Leading state enterprise of Dak Lak with hundreds of millions USD export turnover, partnering with 40,000+ local farming families.',
      pill: 'Top 1 Đắk Lắk • Xuất khẩu >100.000 tấn/năm'
    },
    {
      name: 'Trung Nguyên Legend',
      sub: 'Tập đoàn Cà phê Trung Nguyên',
      logo: '/images/exporters/trungnguyen.svg',
      highlight: 'Thương hiệu cà phê quốc gia khởi nguồn từ Buôn Ma Thuột, tiên phong chuỗi Cà phê Năng lượng và văn hóa cà phê Việt Nam tới 80+ quốc gia.',
      highlightEn: 'National coffee champion founded in Buon Ma Thuot, pioneering Energy Coffee and Vietnamese coffee culture across 80+ countries.',
      pill: 'Thương hiệu Quốc gia • Xuất khẩu 80+ nước'
    },
    {
      name: "Vĩnh Hiệp (L'amant)",
      sub: 'Công ty TNHH Vĩnh Hiệp',
      logo: '/images/exporters/vinhhiep.svg',
      highlight: 'Tiên phong xuất khẩu cà phê hữu cơ (Organic USDA/EU) quy mô lớn của Tây Nguyên sang các thị trường khó tính Mỹ, EU, Nhật Bản.',
      highlightEn: 'Pioneer in large-scale Organic USDA/EU coffee exports from Central Highlands to demanding US, EU, and Japanese markets.',
      pill: 'Tiên phong Organic • Vùng trồng chuẩn quốc tế'
    }
  ],
  rest: [
    'Intimex Buôn Ma Thuột',
    'An Thái Group',
    'Phúc Sinh Đắk Lắk',
    'Tín Nghĩa Tây Nguyên',
    'CTP Group',
    'Đắkman Việt Nam',
    'Bazan Heritage Coffee'
  ]
};

// Dữ liệu Top 10 Doanh nghiệp thương mại & xuất khẩu cà phê Thế Giới
const TOP_EXPORTERS_WORLD = {
  title: 'Top 10 Doanh Nghiệp Xuất Khẩu Cà Phê Thế Giới',
  titleEn: 'Top 10 Global Coffee Trading & Export Giants',
  sub: 'Các tập đoàn thương mại đa quốc gia chi phối chuỗi cung ứng và logistics cà phê toàn cầu',
  subEn: 'Multinational trading giants shaping global coffee value chains, logistics, and roastery supplies',
  top3: [
    {
      name: 'Neumann Kaffee Gruppe (NKG)',
      sub: 'Đức (Hamburg)',
      logo: '/images/exporters/nkg.svg',
      highlight: 'Tập đoàn thương mại cà phê xanh số 1 hành tinh với hơn 50 chi nhánh tại 26 quốc gia, chi phối khoảng 10% sản lượng cà phê toàn cầu.',
      highlightEn: 'The world #1 green coffee service group with 50+ companies in 26 countries, handling ~10% of total global coffee output.',
      pill: 'Số 1 Thế Giới • ~15 triệu bao/năm'
    },
    {
      name: 'Volcafe (ED&F Man)',
      sub: 'Thụy Sĩ (Winterthur)',
      logo: '/images/exporters/volcafe.svg',
      highlight: 'Một trong 3 nhà buôn cà phê lớn nhất lịch sử thế giới, đối tác cung ứng chiến lược của hàng triệu trang trại và các hãng rang xay toàn cầu.',
      highlightEn: 'One of the top 3 coffee merchants globally, serving as strategic sourcing partner from millions of farms to top roasting brands.',
      pill: 'Top 3 Toàn Cầu • Chuỗi cung ứng 20+ nước'
    },
    {
      name: 'Sucafina',
      sub: 'Thụy Sĩ (Geneva)',
      logo: '/images/exporters/sucafina.svg',
      highlight: 'Tập đoàn đa quốc gia dẫn dắt số hóa chuỗi cung ứng "Farm to Cup", hiện diện vững chắc tại các vùng nguyên liệu Robusta và Arabica trọng điểm.',
      highlightEn: 'Leading multinational driving digitized "Farm to Cup" sustainable supply chains across 33 key coffee origins.',
      pill: 'Mạng lưới 33 quốc gia • Tiên phong Số hóa'
    }
  ],
  rest: [
    'Louis Dreyfus Company (LDC)',
    'ofi (Olam Food Ingredients)',
    'Ecom Agroindustrial',
    'Starbucks Coffee Trading Co.',
    'Lavazza Group',
    'Tchibo Group',
    'Strauss Coffee'
  ]
};

// Dữ liệu Top 10 Khu & Cụm Công Nghiệp Tiêu Biểu Đắk Lắk
const TOP_INDUSTRIAL_PARKS = {
  title: 'Top 10 Khu & Cụm Công Nghiệp Tiêu Biểu',
  titleEn: 'Top 10 Flagship Industrial Parks & Clusters',
  sub: 'Các trung tâm công nghiệp chế biến sâu, logistics và hạ tầng trọng điểm thu hút đầu tư của tỉnh Đắk Lắk',
  subEn: 'Core hubs for deep agro-processing, logistics corridors, and high-tech manufacturing driving Dak Lak investment',
  top3: [
    {
      id: 'kcn-hoa-phu',
      rank: 1,
      name: 'Khu Công Nghiệp Hòa Phú',
      nameEn: 'Hoa Phu Industrial Park',
      location: 'Xã Hòa Phú, TP. Buôn Ma Thuột',
      locationEn: 'Hoa Phu, Buon Ma Thuot City',
      scale: 'Quy mô 180 ha • Lấp đầy >95%',
      scaleEn: 'Scale: 180 ha • Occupancy >95%',
      logo: '/images/industrial/kcn_hoa_phu.svg',
      highlight: 'KCN tập trung hiện hữu quy mô lớn nhất Đắk Lắk, trung tâm chế biến sâu cà phê, nông lâm sản xuất khẩu và chuỗi dịch vụ phụ trợ năng động.',
      highlightEn: 'The largest active industrial park in Dak Lak, premier hub for deep coffee processing, agro-exports, and dynamic ancillary services.',
      pill: 'Ngành mũi nhọn: Chế biến cà phê & Nông sản xuất khẩu',
      pillEn: 'Core: Coffee Processing & Agro-Exports',
      link: `/posts?category=${encodeURIComponent('Dự án & Đầu tư')}&sub_category=${encodeURIComponent('Khu & Cụm công nghiệp')}`
    },
    {
      id: 'kcn-phu-xuan',
      rank: 2,
      name: 'Khu Công Nghiệp Phú Xuân',
      nameEn: 'Phu Xuan Industrial Park',
      location: 'Xã Ea Drơng, Huyện Cư M\'gar',
      locationEn: 'Ea Drong, Cu M\'gar District',
      scale: 'Quy mô 338 ha • Trọng điểm mới',
      scaleEn: 'Scale: 338 ha • Flagship Eco-Hub',
      logo: '/images/industrial/kcn_phu_xuan.svg',
      highlight: 'Đại dự án KCN sinh thái kiểu mẫu đa ngành, vị trí đắc địa gần trung tâm Buôn Ma Thuột, hạ tầng đồng bộ thu hút chế biến công nghệ cao.',
      highlightEn: 'Flagship modern eco-industrial zone, prime proximity to Buon Ma Thuot, built for high-tech processing and sustainable manufacturing.',
      pill: 'Ngành mũi nhọn: Công nghiệp sinh thái & Chế biến công nghệ cao',
      pillEn: 'Core: Eco-Industrial & High-Tech Manufacturing',
      link: `/posts?category=${encodeURIComponent('Dự án & Đầu tư')}&sub_category=${encodeURIComponent('Khu & Cụm công nghiệp')}`
    },
    {
      id: 'kcn-mdrak',
      rank: 3,
      name: 'Khu Công Nghiệp M\'Đrắk',
      nameEn: 'M\'Drak Industrial Park',
      location: 'Huyện M\'Đrắk (Cửa ngõ Đông Đắk Lắk)',
      locationEn: 'M\'Drak District (Eastern Gateway)',
      scale: 'Quy mô 212 ha • Trục cao tốc Khánh Hòa - Buôn Ma Thuột',
      scaleEn: 'Scale: 212 ha • Khanh Hoa - BMT Expressway',
      logo: '/images/industrial/kcn_mdrak.svg',
      highlight: 'KCN cửa ngõ tiếp giáp trục Cao tốc Buôn Ma Thuột — Khánh Hòa, kết nối trực tiếp hải lộ và Cảng biển nước sâu Nam Vân Phong.',
      highlightEn: 'Strategic gateway park along Buon Ma Thuot - Khanh Hoa Expressway, seamlessly linked to Nam Van Phong deepwater seaport.',
      pill: 'Ngành mũi nhọn: Công nghiệp phụ trợ & Hậu cần Cảng biển',
      pillEn: 'Core: Ancillary Industry & Seaport Logistics',
      link: `/posts?category=${encodeURIComponent('Dự án & Đầu tư')}&sub_category=${encodeURIComponent('Khu & Cụm công nghiệp')}`
    }
  ],
  // 7 KCN / CCN còn lại chia 2 hàng 4 / 3
  rest: [
    { name: 'Cụm Công Nghiệp Tân An 1 & 2', nameEn: 'Tan An 1 & 2 Industrial Cluster', location: 'TP. Buôn Ma Thuột' },
    { name: 'Cụm Công Nghiệp Ea Dar', nameEn: 'Ea Dar Industrial Cluster', location: 'Huyện Ea Kar' },
    { name: 'Cụm Công Nghiệp Cư Kuin', nameEn: 'Cu Kuin Industrial Cluster', location: 'Huyện Cư Kuin' },
    { name: 'Cụm Công Nghiệp Buôn Hồ', nameEn: 'Buon Ho Industrial Cluster', location: 'TX. Buôn Hồ' },
    { name: 'Cụm Công Nghiệp Krông Búk', nameEn: 'Krong Buk Industrial Cluster', location: 'Huyện Krông Búk' },
    { name: 'Cụm Công Nghiệp Cư M\'gar', nameEn: 'Cu M\'gar Industrial Cluster', location: 'Huyện Cư M\'gar' },
    { name: 'Cụm Công Nghiệp Ea H\'leo', nameEn: 'Ea H\'leo Industrial Cluster', location: 'Huyện Ea H\'leo' }
  ]
};

export const Home = () => {
  const { role, user, token } = useAuth();
  let storedMemberUser = null;
  try {
    const raw = localStorage.getItem('doson_member_user');
    if (raw) storedMemberUser = JSON.parse(raw);
  } catch (e) {}
  const memberToken = localStorage.getItem('doson_member_token') || (role === 'member' ? token : null);
  const effectiveUser = (role === 'member' ? user : null) || storedMemberUser || user;
  const isActuallyLoggedIn = Boolean(effectiveUser && (role === 'member' || !!memberToken || (user && role !== 'guest')));
  const isLoggedIn = isActuallyLoggedIn;

  const { currentLang, t } = useTranslation();
  const navigate = useNavigate();

  // Search State & Scope
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState('all');

  // Hero Site-wide Search Bar State
  const [heroSearchQuery, setHeroSearchQuery] = useState('');

  // AI Special Topic Slider (Single Card 5s infinite auto-cycle)
  const [aiSlideIndex, setAiSlideIndex] = useState(0);
  const [isAiSlideHovered, setIsAiSlideHovered] = useState(false);

  useEffect(() => {
    if (isAiSlideHovered) return;
    const interval = setInterval(() => {
      setAiSlideIndex(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAiSlideHovered]);

  // Top Destinations Tab Filter (Globe Trekker layout)
  const [activeDestTab, setActiveDestTab] = useState('all');
  const filteredDestinations = activeDestTab === 'all'
    ? TOP_DESTINATIONS.slice(0, 4)
    : TOP_DESTINATIONS.filter(d => d.category === activeDestTab).concat(TOP_DESTINATIONS.filter(d => d.category !== activeDestTab)).slice(0, 4);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState(0);

  // Investment Projects Filter State
  const [selectedSector, setSelectedSector] = useState('all');

  // State Slider Doanh nghiệp tiêu biểu (7 công ty từ file docx, tự động cuộn mỗi 5s, dừng khi hover)
  const [enterpriseIndex, setEnterpriseIndex] = useState(0);
  const [isEnterpriseHovered, setIsEnterpriseHovered] = useState(false);
  const handlePrevEnterprise = () => {
    setEnterpriseIndex(prev => (prev - 1 + FEATURED_ENTERPRISES.length) % FEATURED_ENTERPRISES.length);
  };
  const handleNextEnterprise = () => {
    setEnterpriseIndex(prev => (prev + 1) % FEATURED_ENTERPRISES.length);
  };

  useEffect(() => {
    if (isEnterpriseHovered) return;
    const interval = setInterval(() => {
      setEnterpriseIndex(prev => (prev + 1) % FEATURED_ENTERPRISES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isEnterpriseHovered]);

  // State Slider Đối tác của chúng tôi (4 logo, tự động chuyển mỗi 1s, dừng khi hover)
  const [partnerIndex, setPartnerIndex] = useState(PARTNER_COMPANIES.length);
  const [isPartnerHovered, setIsPartnerHovered] = useState(false);
  const [withPartnerTransition, setWithPartnerTransition] = useState(true);
  const [partnerVisibleCount, setPartnerVisibleCount] = useState(4);

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth <= 640) setPartnerVisibleCount(2);
      else if (window.innerWidth <= 1024) setPartnerVisibleCount(3);
      else setPartnerVisibleCount(4);
    };
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  // Tự động lướt sang mỗi 1s, tạm dừng khi di chuột
  useEffect(() => {
    if (isPartnerHovered) return;
    const interval = setInterval(() => {
      setPartnerIndex(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPartnerHovered]);

  // Vòng lặp vô hạn mượt mà
  const totalPartners = PARTNER_COMPANIES.length;
  useEffect(() => {
    if (partnerIndex >= totalPartners * 2) {
      const resetTimer = setTimeout(() => {
        setWithPartnerTransition(false);
        setPartnerIndex(totalPartners);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setWithPartnerTransition(true);
          });
        });
      }, 400);
      return () => clearTimeout(resetTimer);
    } else if (partnerIndex < totalPartners) {
      const resetTimer = setTimeout(() => {
        setWithPartnerTransition(false);
        setPartnerIndex(partnerIndex + totalPartners);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setWithPartnerTransition(true);
          });
        });
      }, 400);
      return () => clearTimeout(resetTimer);
    }
  }, [partnerIndex, totalPartners]);

  const handlePrevPartner = () => {
    setPartnerIndex(prev => prev - 1);
  };
  const handleNextPartner = () => {
    setPartnerIndex(prev => prev + 1);
  };

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
  const [regForm, setRegForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    company: '',
    quantity: 1,
    createAccount: false,
    accountLogin: '',
    accountPassword: '',
    accountConfirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [accountNotice, setAccountNotice] = useState('');
  const [accountWarning, setAccountWarning] = useState('');
  const [checkingAccount, setCheckingAccount] = useState(false);
  const [submittingReg, setSubmittingReg] = useState(false);
  const [regSuccessData, setRegSuccessData] = useState(null);
  const [paidFlowStep, setPaidFlowStep] = useState('transfer'); // 'transfer' | 'pending_approval'
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [copiedNote, setCopiedNote] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

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

  // Dynamic Live Events (theo thực tế từ DB, không hiển thị mock demo)
  const [eventsList, setEventsList] = useState(() => {
    try {
      localStorage.removeItem('dnvn_cached_home_events');
      const cached = localStorage.getItem('daklak_cached_home_events');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
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

  // Dữ liệu và ảnh bìa trực tiếp của 3 bài viết chuyên đề AI
  const [aiTopicPosts, setAiTopicPosts] = useState(() => {
    try {
      const cached = localStorage.getItem('dnvn_cached_ai_topic_posts');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {}
    return { wardAi: null, orion: null, edunow: null };
  });

  // Tải dữ liệu song song từ API (Promise.allSettled) có Timeout 8s
  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        const [postsRes, eventsRes, membersRes] = await Promise.allSettled([
          fetchJsonWithTimeout('/api/posts?limit=12', {}, 8000),
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
          if (eventsRes.status === 'fulfilled' && eventsRes.value?.success && Array.isArray(eventsRes.value.data)) {
            setEventsList(eventsRes.value.data);
            try {
              localStorage.setItem('daklak_cached_home_events', JSON.stringify(eventsRes.value.data));
              localStorage.removeItem('dnvn_cached_home_events');
            } catch (e) {}
          }
          if (membersRes.status === 'fulfilled' && membersRes.value?.success && Array.isArray(membersRes.value.data) && membersRes.value.data.length > 0) {
            setFeaturedMembers(membersRes.value.data);
            try {
              localStorage.setItem('dnvn_cached_home_members', JSON.stringify(membersRes.value.data));
            } catch (e) {}
          }
        }

        // Tải đồng thời 3 bài viết chuyên đề AI để lấy ảnh bìa và dữ liệu chính thức
        const aiTargets = [
          { key: 'wardAi', slug: 'tro-ly-ai-phuong-xa' },
          { key: 'orion', slug: 'orion-chat-loc-tinh-hoa-cua-erp-multimodel-ai-va-nen-tang-xay-dung-ai-agent-de-tao-thanh-mot-he-dieu-hanh-quan-tri-thong-minh-danh-cho-doanh-nghiep' },
          { key: 'edunow', slug: 'edunowai-giai-phap-tro-ly-ai-tuyen-sinh-thong-minh-danh-cho-cac-co-so-giao-duc' }
        ];
        Promise.allSettled(
          aiTargets.map(t => fetchJsonWithTimeout(`/api/posts/${encodeURIComponent(t.slug)}`, {}, 6000))
        ).then(aiResults => {
          if (!isMounted) return;
          const aiMap = {};
          aiTargets.forEach((t, i) => {
            const res = aiResults[i];
            if (res.status === 'fulfilled' && res.value?.success && res.value?.data) {
              aiMap[t.key] = res.value.data;
            }
          });
          if (Object.keys(aiMap).length > 0) {
            setAiTopicPosts(prev => {
              const merged = { ...prev, ...aiMap };
              try {
                localStorage.setItem('dnvn_cached_ai_topic_posts', JSON.stringify(merged));
              } catch (e) {}
              return merged;
            });
          }
        }).catch(() => {});
      } catch (err) {
        console.warn('Lỗi tải dữ liệu động trang chủ:', err);
      }
    };
    fetchHomeData();
    return () => { isMounted = false; };
  }, []);

  // Hiệu ứng cuộn lướt (Scroll Reveal) mờ dần khi đến và lướt đi — 0% CPU lag nhờ IntersectionObserver gốc
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          } else {
            // Khi cuộn ra khỏi tầm nhìn, bỏ class để khi lướt lại có hiệu ứng mờ dần và hiện lại
            entry.target.classList.remove('is-revealed');
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    const observeAll = () => {
      const elements = document.querySelectorAll('.scroll-reveal');
      elements.forEach((el) => observer.observe(el));
    };

    observeAll();
    const t1 = setTimeout(observeAll, 300);
    const t2 = setTimeout(observeAll, 1000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      observer.disconnect();
    };
  }, [latestPosts, filteredDestinations, featuredMembers, eventsList]);

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

  // Xử lý mở Modal đăng ký vé (tự động điền nếu đã đăng nhập)
  const handleOpenRegisterModal = (evt) => {
    if (!evt) return;
    setRegisterModalEvent(evt);
    setRegSuccessData(null);
    setPaidFlowStep('transfer');
    setProofFile(null);
    setProofPreview('');
    setAccountNotice('');
    setAccountWarning('');
    if (isActuallyLoggedIn && effectiveUser) {
      setRegForm({
        fullName: effectiveUser.contact_name || effectiveUser.name || '',
        phone: effectiveUser.phone || '',
        email: effectiveUser.email || '',
        company: effectiveUser.name || '',
        quantity: 1,
        createAccount: false,
        accountLogin: '',
        accountPassword: '',
        accountConfirmPassword: ''
      });
    } else {
      setRegForm({
        fullName: '',
        phone: '',
        email: '',
        company: '',
        quantity: 1,
        createAccount: false,
        accountLogin: '',
        accountPassword: '',
        accountConfirmPassword: ''
      });
    }
  };

  // Đóng modal và reset trạng thái tạm
  const handleCloseModal = () => {
    setRegisterModalEvent(null);
    setRegSuccessData(null);
    setPaidFlowStep('transfer');
    setProofFile(null);
    setProofPreview('');
    setAccountNotice('');
    setAccountWarning('');
  };

  // Kiểm tra tài khoản đã tồn tại hay chưa khi chưa đăng nhập
  const verifyAccountNotExists = async (phoneToCheck, emailToCheck, loginToCheck) => {
    if (isActuallyLoggedIn) {
      setAccountWarning('');
      return true;
    }
    const p = (phoneToCheck !== undefined ? phoneToCheck : regForm.phone).trim();
    const e = (emailToCheck !== undefined ? emailToCheck : regForm.email).trim();
    const u = (loginToCheck !== undefined ? loginToCheck : regForm.accountLogin).trim();

    if (!p && !e && !u) {
      setAccountWarning('');
      return true;
    }

    try {
      setCheckingAccount(true);
      const res = await fetch('/api/events/check-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: p, email: e, username: u })
      });
      const data = await res.json();
      if (data.exists) {
        setAccountWarning(data.message || 'Email hoặc Số điện thoại này đã được đăng ký tài khoản trong hệ thống. Vui lòng kiểm tra lại hoặc đăng nhập trước khi mua vé.');
        return false;
      } else {
        setAccountWarning('');
        return true;
      }
    } catch {
      return true;
    } finally {
      setCheckingAccount(false);
    }
  };

  // Sao chép số tài khoản / nội dung chuyển khoản
  const copyToClipboard = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'bank') {
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    } else {
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 2000);
    }
  };

  // Xử lý chọn ảnh chứng từ chuyển khoản
  const handleProofChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert('Dung lượng ảnh vượt quá 20MB. Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  // Gửi ảnh chụp giao dịch chuyển khoản cho vé có phí
  const handleSubmitPaymentProof = async () => {
    if (!proofFile || !regSuccessData?.id) {
      alert('Vui lòng tải lên ảnh chụp màn hình giao dịch chuyển khoản thành công.');
      return;
    }
    setUploadingProof(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result.split(',')[1];
          const res = await fetch(`/api/events/registrations/${regSuccessData.id}/payment-proof`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: proofFile.name,
              base64Data,
              ticket_code: regSuccessData.ticket_code
            })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setPaidFlowStep('pending_approval');
          } else {
            alert(data.error || 'Không thể gửi ảnh chuyển khoản.');
          }
        } catch (err) {
          alert('Lỗi gửi ảnh chuyển khoản: ' + err.message);
        } finally {
          setUploadingProof(false);
        }
      };
      reader.readAsDataURL(proofFile);
    } catch (err) {
      setUploadingProof(false);
      alert('Lỗi đọc tệp ảnh: ' + err.message);
    }
  };

  // Đăng ký vé sự kiện (hỗ trợ cả đã đăng nhập và tạo tài khoản mới)
  const handleQuickRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerModalEvent) return;

    if (!regForm.fullName.trim() || !regForm.phone.trim()) {
      alert('Vui lòng điền Họ và tên và Số điện thoại liên hệ.');
      return;
    }

    // Nếu chưa đăng nhập: Kiểm tra xem SĐT hoặc Email đã có tài khoản chưa
    if (!isActuallyLoggedIn) {
      const isAvailable = await verifyAccountNotExists(regForm.phone, regForm.email, regForm.createAccount ? regForm.accountLogin : '');
      if (!isAvailable) {
        alert(accountWarning || 'Email hoặc Số điện thoại này đã được đăng ký tài khoản trong hệ thống. Vui lòng kiểm tra lại thông tin, đăng nhập tài khoản trước khi mua vé, hoặc sử dụng Email/Số điện thoại khác hợp lệ.');
        return;
      }
    }

    if (!isActuallyLoggedIn && regForm.createAccount) {
      const login = regForm.accountLogin.trim() || regForm.phone.trim() || regForm.email.trim();
      if (!login) {
        alert('Vui lòng nhập Tài khoản (Email hoặc Số điện thoại) để tạo tài khoản theo dõi vé.');
        return;
      }
      if (!regForm.accountPassword) {
        alert('Vui lòng nhập mật khẩu cho tài khoản theo dõi vé.');
        return;
      }
      if (regForm.accountPassword.length < 6) {
        alert('Mật khẩu phải có ít nhất 6 ký tự.');
        return;
      }
      if (regForm.accountPassword !== regForm.accountConfirmPassword) {
        alert('Mật khẩu xác nhận không khớp. Vui lòng nhập lại chính xác.');
        return;
      }
    }

    setSubmittingReg(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      const authToken = memberToken || token;
      if (authToken) headers['Authorization'] = 'Bearer ' + authToken;

      const res = await fetch(`/api/events/${registerModalEvent.id}/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          full_name: regForm.fullName.trim(),
          phone: regForm.phone.trim(),
          email: regForm.email.trim() || null,
          company: regForm.company.trim() || null,
          quantity: parseInt(regForm.quantity, 10) || 1,
          member_id: effectiveUser?.id || user?.id || null,
          create_account: isActuallyLoggedIn ? false : regForm.createAccount,
          account_login: regForm.accountLogin.trim() || regForm.phone.trim() || regForm.email.trim(),
          account_password: regForm.accountPassword,
          account_confirm_password: regForm.accountConfirmPassword
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRegSuccessData(data.registration);
        setPaidFlowStep('transfer');
        setProofFile(null);
        setProofPreview('');
        if (data.account_message) {
          setAccountNotice(data.account_message);
        }
      } else {
        alert(data.error || 'Đăng ký vé chưa thành công');
      }
    } catch (err) {
      console.error('Register ticket error:', err);
      alert('Có lỗi kết nối khi đăng ký vé: ' + err.message);
    } finally {
      setSubmittingReg(false);
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

  // Dữ liệu sự kiện theo thực tế DB (1 Sự kiện Tiêu điểm Hero + tối đa 3 Sự kiện phụ, không chèn fake demo)
  const heroEvent = (eventsList && eventsList.length > 0) ? eventsList[0] : null;
  const subEvents = useMemo(() => {
    return (eventsList && eventsList.length > 1) ? eventsList.slice(1, 4) : [];
  }, [eventsList]);

  return (
    <div className="daklak-home">
      <SEOHead 
        title={`${brandConfig.brandName} — ${brandConfig.slogan}`}
        description={brandConfig.description}
      />
      <Navbar />

      <main id="main-content">
        {/* ========================================================
            SECTION 1: HERO GLOBE TREKKER - THIẾT KẾ TINH TẾ, THOÁNG ĐÃNG
            ======================================================== */}
        <section className="gt-hero-section" id="home">
          {/* Lightweight Ambient Glow Orbs with Prominent Breathing Pulse */}
          <div className="gt-hero-ambient-glow orb-1" aria-hidden="true" />
          <div className="gt-hero-ambient-glow orb-2" aria-hidden="true" />
          <div className="gt-hero-ambient-glow orb-3" aria-hidden="true" />
          <div className="gt-hero-bg-map" aria-hidden="true" />

          <div className="gt-hero-container">
            {/* Left Column: Heading, Subtitle & Action (Enters from Left) */}
            <div className="gt-hero-left scroll-reveal scroll-reveal-left">
              <h1 className="gt-hero-title">
                {currentLang === 'en' ? 'Discover Dak Lak' : 'Khám phá Đắk Lắk'}<br />
                <span className="gt-hero-highlight">
                  {currentLang === 'en' ? 'Heritage of' : 'Bản sắc'}
                  <svg className="gt-highlight-curve" viewBox="0 0 180 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 14C45 4 135 4 176 14" stroke="#E99035" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span> {currentLang === 'en' ? 'Central Highlands' : 'Tây Nguyên'}
              </h1>

              <p className="gt-hero-desc">
                {currentLang === 'en'
                  ? 'Find unique moments and majestic natural wonders across the Buon Ma Thuot coffee capital, mythical waterfalls, and timeless indigenous gong heritage.'
                  : 'Trải nghiệm những khoảnh khắc nguyên sơ và hùng vĩ giữa thủ phủ cà phê Buôn Ma Thuột, thác nước Dray Nur kỳ ảo, văn hóa cồng chiêng ngàn đời và những hành trình bất tận.'}
              </p>

              <div className="gt-hero-action-row">
                <a 
                  href="#tin-tuc-tieu-diem" 
                  className="gt-btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById('tin-tuc-tieu-diem');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <i className="ti ti-chart-arrows-vertical" />
                  <span>{currentLang === 'en' ? 'Investment Opportunities' : 'Cơ Hội Đầu Tư & Tin Tức'}</span>
                </a>
                <Link 
                  to="/members" 
                  className="gt-btn-secondary"
                >
                  <i className="ti ti-building" />
                  <span>{currentLang === 'en' ? 'Enterprise Ecosystem' : 'Hệ Sinh Thái Doanh Nghiệp'}</span>
                </Link>
                <div className="gt-flight-trail">
                  <svg className="gt-flight-svg" viewBox="0 0 140 40" fill="none">
                    <path d="M5 25 C40 45, 80 5, 125 22" stroke="#E99035" strokeWidth="2.5" strokeDasharray="6 6" fill="none" />
                    <polygon points="125,22 135,16 131,28" fill="#E99035" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Column: Signature 3-Photo Staggered Composition (Enters from Right) */}
            <div className="gt-hero-visuals scroll-reveal scroll-reveal-right">
              <div className="gt-photo-group">
                {/* Card 1: Tall Vertical Photo on Left */}
                <div className="gt-photo-card tall" onClick={() => navigate(`/posts?category=${encodeURIComponent('Khám phá Đắk Lắk')}`)}>
                  <img src="/images/daklak/daklak_thac_dray_nur.jpg" alt="Thác Dray Nur Hùng Vĩ" />
                </div>

                {/* Cards 2 & 3: Stack on Right */}
                <div className="gt-photo-right-col">
                  <div className="gt-photo-card medium" onClick={() => navigate(`/posts?category=${encodeURIComponent('Nông sản & Cà phê')}`)}>
                    <img src="/images/daklak/daklak_doi_ca_phe.jpg" alt="Đồi Cà Phê Buôn Ma Thuột" />
                  </div>
                  <div className="gt-photo-card medium" onClick={() => navigate(`/posts?category=${encodeURIComponent('Du lịch & Trải nghiệm')}`)}>
                    <img src="/images/daklak/daklak_cong_chieng.jpg" alt="Không Gian Văn Hóa Cồng Chiêng" />
                  </div>
                </div>

                {/* Vintage Circular Travel Stamp Badge */}
                <div className="gt-stamp-badge">
                  <i className="ti ti-compass" />
                </div>

                {/* Airplane Badge */}
                <div className="gt-plane-badge">
                  <i className="ti ti-plane" />
                </div>
              </div>
            </div>
          </div>

          {/* Hero Site-wide Search Bar (Thay thế Cuộn xuống khám phá) */}
          <div className="gt-hero-search-wrapper scroll-reveal scroll-reveal-up">
            <form 
              className="gt-hero-search-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (heroSearchQuery.trim()) {
                  navigate(`/posts?search=${encodeURIComponent(heroSearchQuery.trim())}`);
                }
              }}
            >
              <div className="gt-hero-search-input-group">
                <i className="ti ti-search gt-hero-search-icon" />
                <input
                  type="text"
                  className="gt-hero-search-input"
                  placeholder={currentLang === 'en' ? 'Search all news, coffee exporters, investment projects, culture...' : 'Tìm kiếm toàn bộ trang web: tin tức, doanh nghiệp cafe, dự án đầu tư...'}
                  value={heroSearchQuery}
                  onChange={(e) => setHeroSearchQuery(e.target.value)}
                />
                {heroSearchQuery && (
                  <button 
                    type="button" 
                    className="gt-hero-search-clear" 
                    onClick={() => setHeroSearchQuery('')}
                    aria-label="Xóa"
                  >
                    <i className="ti ti-x" />
                  </button>
                )}
                <button type="submit" className="gt-hero-search-btn">
                  <span>{currentLang === 'en' ? 'Search' : 'Tìm kiếm'}</span>
                  <i className="ti ti-arrow-right" />
                </button>
              </div>
              <div className="gt-hero-search-tags">
                <span className="gt-search-tag-label">{currentLang === 'en' ? 'Popular:' : 'Chủ đề hot:'}</span>
                {['Cà phê Robusta', 'Xuất khẩu cà phê', 'Đầu tư Đắk Lắk', 'Thác Dray Nur', 'Chuyển đổi số'].map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="gt-search-tag-pill"
                    onClick={() => {
                      setHeroSearchQuery(tag);
                      navigate(`/posts?search=${encodeURIComponent(tag)}`);
                    }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </section>

        {/* ========================================================
            SECTION 2: TOP DESTINATIONS (TOP ĐIỂM ĐẾN)
            ======================================================== */}
        <section className="gt-dest-section" id="top-destinations">
          <div className="gt-dest-container">
            <div className="gt-dest-header scroll-reveal scroll-reveal-down">
              <div className="gt-dest-header-left">
                <h2 className="gt-section-title">
                  {currentLang === 'en' ? 'Key Investment Hubs & Regional Highlights' : 'Trụ Cột Đầu Tư & Điểm Đến Tiêu Biểu'}
                </h2>
                <div className="gt-dest-tabs">
                  <button 
                    className={`gt-filter-pill ${activeDestTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveDestTab('all')}
                  >
                    {currentLang === 'en' ? 'All Hubs' : 'Tất cả lĩnh vực'}
                  </button>
                  <button 
                    className={`gt-filter-pill ${activeDestTab === 'investment' ? 'active' : ''}`}
                    onClick={() => setActiveDestTab('investment')}
                  >
                    {currentLang === 'en' ? 'Investment & Logistics' : 'Đầu tư & Logistics'}
                  </button>
                  <button 
                    className={`gt-filter-pill ${activeDestTab === 'coffee' ? 'active' : ''}`}
                    onClick={() => setActiveDestTab('coffee')}
                  >
                    {currentLang === 'en' ? 'Coffee Capital' : 'Thủ phủ Cà phê'}
                  </button>
                  <button 
                    className={`gt-filter-pill ${activeDestTab === 'agritech' ? 'active' : ''}`}
                    onClick={() => setActiveDestTab('agritech')}
                  >
                    {currentLang === 'en' ? 'High-Tech Agri' : 'Nông nghiệp CNC'}
                  </button>
                  <button 
                    className={`gt-filter-pill ${activeDestTab === 'tourism' ? 'active' : ''}`}
                    onClick={() => setActiveDestTab('tourism')}
                  >
                    {currentLang === 'en' ? 'Heritage & Eco-Tourism' : 'Bản sắc & Sinh thái'}
                  </button>
                </div>
              </div>
              <Link to={`/posts?category=${encodeURIComponent('Dự án & Đầu tư')}`} className="gt-dest-view-all">
                <span>{currentLang === 'en' ? 'Explore all opportunities' : 'Khám phá tất cả cơ hội'}</span>
                <i className="ti ti-arrow-right" />
              </Link>
            </div>

            <div className="gt-dest-grid">
              {filteredDestinations.map((dest, idx) => {
                const animDir = idx % 2 === 0 ? 'scroll-reveal-left' : 'scroll-reveal-right';
                const staggerClass = `stagger-${(idx % 4) + 1}`;
                return (
                  <div 
                    key={dest.id} 
                    className={`gt-dest-card scroll-reveal ${animDir} ${staggerClass}`}
                    onClick={() => navigate(dest.link)}
                  >
                    <div className="gt-dest-img-wrap">
                      <img src={dest.image} alt={dest.title} />
                    </div>
                    <div className="gt-dest-info">
                      <h3 className="gt-dest-name">
                        {currentLang === 'en' ? dest.titleEn : dest.title}
                      </h3>
                      <p className="gt-dest-location">
                        {currentLang === 'en' ? dest.locationEn : dest.location}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 3: TIÊU ĐIỂM & TIN TỨC MỚI NHẤT (THE GLOBAL WIRE STYLE)
            ĐƯA LÊN NỬA TRÊN TRANG CHỦ - GIẢI QUYẾT TRIỆT ĐỂ BÀI MỚI ĐĂNG
            ======================================================== */}
        <section className="news-spotlight-section" id="tin-tuc-tieu-diem">
          <div className="daklak-container">
            <div className="spotlight-header scroll-reveal scroll-reveal-down">
              <div>
                <span className="daklak-section-badge">
                  <i className="ti ti-news" style={{ marginRight: '6px' }} />
                  {currentLang === 'en' ? 'Newsroom & Economic Pulse' : 'Bảng Tin & Tiêu Điểm Thời Sự'}
                </span>
                <h2 className="spotlight-title">
                  {currentLang === 'en' ? 'Latest News & Dak Lak Updates' : 'Tin Tức Mới Nhất & Nhịp Đập Đắk Lắk Hôm Nay'}
                </h2>
              </div>
              <Link to="/posts" className="spotlight-view-all">
                <span>{currentLang === 'en' ? 'View all newsroom' : 'Xem tất cả bài viết'}</span>
                <i className="ti ti-arrow-right" />
              </Link>
            </div>

            {/* Layout dạng tạp chí hiện đại: 1 bài Lead Story lớn bên trái + Feed tin mới bên phải */}
            <div className="spotlight-main-grid">
              {/* Lead Story (Enters from Left) */}
              {latestPosts.length > 0 && (
                <div className="spotlight-lead-card scroll-reveal scroll-reveal-left" onClick={() => navigate(`/posts/${latestPosts[0].slug || latestPosts[0].id}`)}>
                  <div className="spotlight-lead-img-wrap">
                    <img
                      src={getPostThumb(latestPosts[0], 0)}
                      alt={latestPosts[0].title}
                      onError={(e) => { e.target.src = FALLBACK_POST_IMAGES[0]; }}
                    />
                    <span className="spotlight-lead-badge">{latestPosts[0].category || 'Tiêu Điểm Đặc Biệt'}</span>
                  </div>
                  <div className="spotlight-lead-content">
                    <div className="spotlight-meta">
                      <span className="spotlight-meta-item">
                        <i className="ti ti-calendar" />
                        {latestPosts[0].created_at ? new Date(latestPosts[0].created_at).toLocaleDateString('vi-VN') : 'Hôm nay'}
                      </span>
                      {latestPosts[0].author_name && (
                        <span className="spotlight-meta-item">
                          <i className="ti ti-user" />
                          {latestPosts[0].author_name}
                        </span>
                      )}
                      <span className="spotlight-meta-item spotlight-tag-live">
                        <span className="live-dot" /> Mới cập nhật
                      </span>
                    </div>
                    <h3 className="spotlight-lead-title">{latestPosts[0].title}</h3>
                    <p className="spotlight-lead-summary">
                      {latestPosts[0].summary || latestPosts[0].short_desc || 'Bấm để đọc toàn bộ bài viết, phân tích sâu và nhận định chi tiết...'}
                    </p>
                    <div className="spotlight-lead-cta">
                      <span>Đọc toàn bộ bài viết →</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Feed tin mới bên phải (Enters from Right) */}
              <div className="spotlight-feed-list scroll-reveal scroll-reveal-right">
                <div className="spotlight-feed-header">
                  <h4><i className="ti ti-bolt" /> Cập nhật mới nhất</h4>
                  <span className="feed-counter">{latestPosts.length} bài viết</span>
                </div>

                <div className="spotlight-feed-items">
                  {latestPosts.slice(1, 5).map((post, idx) => (
                    <div
                      key={post.id || post.slug || idx}
                      className="spotlight-feed-item"
                      onClick={() => navigate(`/posts/${post.slug || post.id}`)}
                    >
                      <div className="feed-item-thumb">
                        <img
                          src={getPostThumb(post, idx + 1)}
                          alt={post.title}
                          onError={(e) => { e.target.src = FALLBACK_POST_IMAGES[(idx + 1) % FALLBACK_POST_IMAGES.length]; }}
                        />
                      </div>
                      <div className="feed-item-info">
                        <div className="feed-item-cat">{post.category || 'Tin tức'}</div>
                        <h5 className="feed-item-title">{post.title}</h5>
                        <span className="feed-item-time">
                          <i className="ti ti-clock" />
                          {post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : 'Gần đây'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {latestPosts.length <= 1 && (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Đang đồng bộ hóa dữ liệu bài viết mới...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Grid 3 bài tiếp theo dạng cards */}
            {latestPosts.length > 5 && (
              <div className="spotlight-sub-grid">
                {latestPosts.slice(5, 8).map((post, idx) => (
                  <div
                    key={post.id || post.slug || idx}
                    className="spotlight-sub-card"
                    onClick={() => navigate(`/posts/${post.slug || post.id}`)}
                  >
                    <div className="sub-card-img-wrap">
                      <img
                        src={getPostThumb(post, idx + 5)}
                        alt={post.title}
                        onError={(e) => { e.target.src = FALLBACK_POST_IMAGES[(idx + 5) % FALLBACK_POST_IMAGES.length]; }}
                      />
                      <span className="sub-card-cat">{post.category || 'Tin thời sự'}</span>
                    </div>
                    <div className="sub-card-body">
                      <div className="sub-card-date">
                        <i className="ti ti-calendar" />
                        <span>{post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : 'Mới'}</span>
                      </div>
                      <h4 className="sub-card-title">{post.title}</h4>
                      <p className="sub-card-desc">{post.summary || post.short_desc || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ========================================================
            BLOCK: DOANH NGHIỆP TIÊU BIỂU (7 DOANH NGHIỆP HỆ SINH THÁI)
            ======================================================== */}
        <section className="daklak-featured-enterprise-section" id="doanh-nghiep-tieu-bieu">
          <div className="daklak-container">
            <div className="daklak-section-header" style={{ marginBottom: '35px' }}>
              <span className="daklak-section-badge">
                <i className="ti ti-building" style={{ marginRight: '4px' }} />
                {currentLang === 'en' ? 'Dak Lak Business Ecosystem' : 'Hệ Sinh Thái Doanh Nghiệp Tiêu Biểu'}
              </span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'Featured Enterprises' : 'Doanh Nghiệp Tiêu Biểu'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'Discover the prominent multi-industry business ecosystem dedicated to sustainable growth, agricultural processing, and elevating Dak Lak coffee value chains.'
                  : 'Khám phá hệ sinh thái doanh nghiệp đa ngành tiêu biểu đồng hành cùng sự phát triển bền vững, nâng tầm chuỗi giá trị cà phê và nông sản chất lượng cao tỉnh Đắk Lắk.'}
              </p>
            </div>

            {/* Slider Container */}
            <div
              className="daklak-enterprise-slider-wrapper"
              onMouseEnter={() => setIsEnterpriseHovered(true)}
              onMouseLeave={() => setIsEnterpriseHovered(false)}
            >
              {/* Nút lướt Trái */}
              <button
                type="button"
                className="daklak-enterprise-nav-btn prev"
                onClick={handlePrevEnterprise}
                aria-label="Doanh nghiệp trước"
                title={currentLang === 'en' ? 'Previous enterprise' : 'Doanh nghiệp trước'}
              >
                <i className="ti ti-chevron-left" />
              </button>

              {/* Nút lướt Phải */}
              <button
                type="button"
                className="daklak-enterprise-nav-btn next"
                onClick={handleNextEnterprise}
                aria-label="Doanh nghiệp tiếp theo"
                title={currentLang === 'en' ? 'Next enterprise' : 'Doanh nghiệp tiếp theo'}
              >
                <i className="ti ti-chevron-right" />
              </button>

              {/* Thẻ hiển thị doanh nghiệp hiện tại */}
              {(() => {
                const enterprise = FEATURED_ENTERPRISES[enterpriseIndex];
                return (
                  <div className="daklak-enterprise-card">
                    {/* Cột Trái: Thông tin chi tiết */}
                    <div className="daklak-enterprise-left">
                      <div className="daklak-enterprise-header-row">
                        <div className="daklak-enterprise-logo-frame">
                          <img
                            src={enterprise.logo}
                            alt={enterprise.name}
                            className="daklak-enterprise-logo-img"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                        <div>
                          <span className="daklak-enterprise-role-badge">
                            <i className="ti ti-rosette-discount-check" />
                            {currentLang === 'en' ? enterprise.roleTagEn : enterprise.roleTag}
                          </span>
                          <h3 className="daklak-enterprise-name" style={{ marginTop: '6px' }}>
                            {enterprise.name}
                          </h3>
                        </div>
                      </div>

                      <div className="daklak-enterprise-meta-list">
                        <div className="daklak-enterprise-meta-item">
                          <i className="ti ti-map-pin" />
                          <span><strong>{currentLang === 'en' ? 'HQ / Location:' : 'Trụ sở / Địa chỉ:'}</strong> {currentLang === 'en' ? enterprise.headquartersEn : enterprise.headquarters}</span>
                        </div>
                        <div className="daklak-enterprise-meta-item">
                          <i className="ti ti-briefcase" />
                          <span><strong>{currentLang === 'en' ? 'Sectors:' : 'Lĩnh vực cốt lõi:'}</strong> {currentLang === 'en' ? enterprise.sectorsEn : enterprise.sectors}</span>
                        </div>
                      </div>

                      <p className="daklak-enterprise-desc">
                        "{currentLang === 'en' ? enterprise.highlightEn : enterprise.highlight}"
                      </p>

                      <div className="daklak-enterprise-philosophy">
                        <i className="ti ti-sparkles" style={{ color: '#D5A33F' }} />
                        <span>{currentLang === 'en' ? 'Core Philosophy:' : 'Tôn chỉ phát triển:'}</span>
                        <span style={{ color: '#A84524' }}>{currentLang === 'en' ? enterprise.philosophyEn : enterprise.philosophy}</span>
                      </div>
                    </div>

                    {/* Cột Phải: Thống kê, Trọng tâm chiến lược & Nút kết nối */}
                    <div className="daklak-enterprise-right">
                      <div className="daklak-enterprise-right-header">
                        <i className="ti ti-chart-arrows-vertical" />
                        <span>{currentLang === 'en' ? 'KEY HIGHLIGHTS & STRATEGY' : 'CHỈ SỐ & TRỌNG TÂM CHIẾN LƯỢC'}</span>
                      </div>

                      {/* 3 Khối chỉ số chính */}
                      <div className="daklak-enterprise-stats-grid">
                        {enterprise.stats.map((st, sIdx) => (
                          <div key={sIdx} className="daklak-enterprise-stat-box">
                            <div className="daklak-enterprise-stat-val notranslate" translate="no">{st.value}</div>
                            <div className="daklak-enterprise-stat-lbl">{currentLang === 'en' ? st.labelEn : st.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Khối Trọng tâm Chiến lược & Thế mạnh từ tài liệu */}
                      <div className="daklak-enterprise-focus-card">
                        <div className="daklak-enterprise-focus-header">
                          <i className="ti ti-target-arrow" />
                          <span>{currentLang === 'en' ? 'Strategic Direction & Value' : 'Định hướng trọng tâm & Giá trị'}</span>
                        </div>
                        <p className="daklak-enterprise-focus-text">
                          {currentLang === 'en' ? enterprise.keyFocusEn : enterprise.keyFocus}
                        </p>
                        <div className="daklak-enterprise-tags-row">
                          {(currentLang === 'en' ? enterprise.tagsEn : enterprise.tags)?.map((tag, tIdx) => (
                            <span key={tIdx} className="daklak-enterprise-tag-pill">
                              <i className="ti ti-check" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Nút Kết nối Doanh nghiệp */}
                      <div className="daklak-enterprise-action-wrap">
                        <button
                          type="button"
                          className="daklak-enterprise-btn-connect"
                          onClick={() => scrollToConsult(enterprise.shortName)}
                        >
                          <i className="ti ti-mail-forward" />
                          <span>{currentLang === 'en' ? 'Connect with Enterprise' : 'Kết nối & Hợp tác Doanh nghiệp'}</span>
                          <i className="ti ti-arrow-right" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Chấm phân trang nhẹ nhàng bên dưới thay cho hàng tên doanh nghiệp */}
              <div className="daklak-enterprise-dots">
                {FEATURED_ENTERPRISES.map((ent, dIdx) => (
                  <button
                    key={ent.id}
                    type="button"
                    className={`daklak-enterprise-dot ${dIdx === enterpriseIndex ? 'active' : ''}`}
                    onClick={() => setEnterpriseIndex(dIdx)}
                    aria-label={`Chuyển đến ${ent.shortName}`}
                    title={ent.shortName}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            BLOCK: BẢNG XẾP HẠNG TOP XUẤT KHẨU CÀ PHÊ (TÂY NGUYÊN & THẾ GIỚI)
            ======================================================== */}
        <section className="daklak-coffee-exporters-section" id="top-xuat-khau-ca-phe">
          <div className="daklak-container">
            <div className="coffee-exporters-header scroll-reveal scroll-reveal-down">
              <span className="daklak-section-badge">
                <i className="ti ti-trophy" style={{ marginRight: '6px' }} />
                {currentLang === 'en' ? 'Global & Regional Coffee Leadership' : 'Định Vị Thủ Phủ Cà Phê & Chuỗi Giá Trị Toàn Cầu'}
              </span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'Top 10 Coffee Exporters: Central Highlands & World' : 'Top 10 Doanh Nghiệp Xuất Khẩu Cà Phê'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'Strategic overview of flagship Vietnamese exporters and multinational trading houses driving global supply chains.'
                  : 'Bức tranh toàn cảnh về những doanh nghiệp đầu tàu xuất khẩu cà phê của Tây Nguyên và các tập đoàn thương mại nông sản hàng đầu thế giới.'}
              </p>
            </div>

            <div className="coffee-exporters-grid">
              {/* BLOCK 1: TOP TÂY NGUYÊN */}
              <div className="coffee-exporter-column scroll-reveal scroll-reveal-left">
                <div className="exporter-column-header">
                  <div className="exporter-col-icon tay-nguyen">
                    <i className="ti ti-flame" />
                  </div>
                  <div className="exporter-col-titles">
                    <h3>{currentLang === 'en' ? TOP_EXPORTERS_TAY_NGUYEN.titleEn : TOP_EXPORTERS_TAY_NGUYEN.title}</h3>
                    <p>{currentLang === 'en' ? TOP_EXPORTERS_TAY_NGUYEN.subEn : TOP_EXPORTERS_TAY_NGUYEN.sub}</p>
                  </div>
                </div>

                {/* Top 3 Doanh nghiệp đứng đầu (Nổi bật - Logo thay thế cho rank #) */}
                <div className="exporter-top3-list">
                  {TOP_EXPORTERS_TAY_NGUYEN.top3.map((exp, idx) => (
                    <div key={idx} className="exporter-top3-card">
                      <div className="exporter-logo-wrap">
                        <img src={exp.logo} alt={exp.name} className="exporter-brand-logo" />
                      </div>
                      <div className="exporter-top3-body">
                        <div className="exporter-top3-header">
                          <h4 className="exporter-top3-name">{exp.name}</h4>
                          <span className="exporter-top3-sub">{exp.sub}</span>
                        </div>
                        <p className="exporter-top3-highlight">
                          {currentLang === 'en' ? exp.highlightEn : exp.highlight}
                        </p>
                        <span className="exporter-top3-pill">
                          <i className="ti ti-award" /> {exp.pill}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Doanh nghiệp tiêu biểu tiếp theo (Không số 7, không #1-10, xếp 2-3-2) */}
                <div className="exporter-rest-block">
                  <h5 className="exporter-rest-title">
                    <i className="ti ti-building" />
                    <span>{currentLang === 'en' ? 'Other Prominent Exporters' : 'Các doanh nghiệp tiêu biểu tiếp theo'}</span>
                  </h5>
                  <div className="exporter-next-grid-232">
                    {TOP_EXPORTERS_TAY_NGUYEN.rest.map((name, idx) => (
                      <div key={idx} className="exporter-tag-item">
                        <span>{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* BLOCK 2: TOP THẾ GIỚI */}
              <div className="coffee-exporter-column scroll-reveal scroll-reveal-right">
                <div className="exporter-column-header">
                  <div className="exporter-col-icon the-gioi">
                    <i className="ti ti-world" />
                  </div>
                  <div className="exporter-col-titles">
                    <h3>{currentLang === 'en' ? TOP_EXPORTERS_WORLD.titleEn : TOP_EXPORTERS_WORLD.title}</h3>
                    <p>{currentLang === 'en' ? TOP_EXPORTERS_WORLD.subEn : TOP_EXPORTERS_WORLD.sub}</p>
                  </div>
                </div>

                {/* Top 3 Doanh nghiệp đứng đầu (Nổi bật - Logo thay thế cho rank #) */}
                <div className="exporter-top3-list">
                  {TOP_EXPORTERS_WORLD.top3.map((exp, idx) => (
                    <div key={idx} className="exporter-top3-card">
                      <div className="exporter-logo-wrap">
                        <img src={exp.logo} alt={exp.name} className="exporter-brand-logo" />
                      </div>
                      <div className="exporter-top3-body">
                        <div className="exporter-top3-header">
                          <h4 className="exporter-top3-name">{exp.name}</h4>
                          <span className="exporter-top3-sub">{exp.sub}</span>
                        </div>
                        <p className="exporter-top3-highlight">
                          {currentLang === 'en' ? exp.highlightEn : exp.highlight}
                        </p>
                        <span className="exporter-top3-pill">
                          <i className="ti ti-globe" /> {exp.pill}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tập đoàn tiêu biểu tiếp theo (Không số 7, không #1-10, xếp 2-3-2) */}
                <div className="exporter-rest-block">
                  <h5 className="exporter-rest-title">
                    <i className="ti ti-world-latitude" />
                    <span>{currentLang === 'en' ? 'Other Prominent Global Trading Houses' : 'Các tập đoàn tiêu biểu tiếp theo'}</span>
                  </h5>
                  <div className="exporter-next-grid-232">
                    {TOP_EXPORTERS_WORLD.rest.map((name, idx) => (
                      <div key={idx} className="exporter-tag-item">
                        <span>{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            BLOCK: TOP 10 KHU & CỤM CÔNG NGHIỆP TIÊU BIỂU ĐẮK LẮK
            (PODIUM 2-1-3: TOP 1 Ở CHÍNH GIỮA NHỈNH LÊN, TOP 2 TRÁI, TOP 3 PHẢI;
             PHÍA DƯỚI LÀ 2 HÀNG 4/3 CHỈ HIỂN THỊ TÊN 7 KCN CÒN LẠI)
            ======================================================== */}
        <section className="daklak-industrial-parks-section" id="top-khu-cong-nghiep">
          <div className="daklak-container">
            <div className="industrial-header scroll-reveal scroll-reveal-down">
              <span className="daklak-section-badge">
                <i className="ti ti-building-factory-2" style={{ marginRight: '6px' }} />
                {currentLang === 'en' ? 'Key Industrial Infrastructure' : 'Hạ Tầng Công Nghiệp & Động Lực Phát Triển'}
              </span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? TOP_INDUSTRIAL_PARKS.titleEn : TOP_INDUSTRIAL_PARKS.title}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en' ? TOP_INDUSTRIAL_PARKS.subEn : TOP_INDUSTRIAL_PARKS.sub}
              </p>
            </div>

            {/* TOP 3 PODIUM: 1 HÀNG 3 CỘT (BÊN TRÁI - CHÍNH GIỮA NHỈNH LÊN - BÊN PHẢI) */}
            <div className="industrial-podium-grid">
              {/* Cột bên trái (KCN Phú Xuân) */}
              {(() => {
                const kcn2 = TOP_INDUSTRIAL_PARKS.top3[1];
                return (
                  <div 
                    key={kcn2.id} 
                    className="industrial-podium-card rank-2 scroll-reveal scroll-reveal-left"
                  >
                    <div className="industrial-card-top">
                      <div className="exporter-logo-wrap">
                        <img src={kcn2.logo} alt={kcn2.name} className="exporter-brand-logo" />
                      </div>
                      <div className="industrial-title-wrap">
                        <h4 className="industrial-card-title">{currentLang === 'en' ? kcn2.nameEn : kcn2.name}</h4>
                        <span className="industrial-card-loc">
                          <i className="ti ti-map-pin" /> {currentLang === 'en' ? kcn2.locationEn : kcn2.location}
                        </span>
                      </div>
                    </div>
                    <div className="industrial-scale-row">
                      <span className="industrial-scale-pill">
                        <i className="ti ti-chart-area-line" /> {currentLang === 'en' ? kcn2.scaleEn : kcn2.scale}
                      </span>
                    </div>
                    <p className="industrial-highlight">
                      {currentLang === 'en' ? kcn2.highlightEn : kcn2.highlight}
                    </p>
                    <div className="industrial-footer-row">
                      <span className="industrial-focus-pill">
                        <i className="ti ti-leaf" /> {currentLang === 'en' ? kcn2.pillEn : kcn2.pill}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Cột chính giữa (KCN Hòa Phú - Nhỉnh lên 1 chút) */}
              {(() => {
                const kcn1 = TOP_INDUSTRIAL_PARKS.top3[0];
                return (
                  <div 
                    key={kcn1.id} 
                    className="industrial-podium-card rank-1 scroll-reveal scroll-reveal-up"
                  >
                    <div className="industrial-card-top">
                      <div className="exporter-logo-wrap gold-border">
                        <img src={kcn1.logo} alt={kcn1.name} className="exporter-brand-logo" />
                      </div>
                      <div className="industrial-title-wrap">
                        <h4 className="industrial-card-title gold-text">{currentLang === 'en' ? kcn1.nameEn : kcn1.name}</h4>
                        <span className="industrial-card-loc">
                          <i className="ti ti-map-pin" /> {currentLang === 'en' ? kcn1.locationEn : kcn1.location}
                        </span>
                      </div>
                    </div>
                    <div className="industrial-scale-row">
                      <span className="industrial-scale-pill gold-pill">
                        <i className="ti ti-chart-area-line" /> {currentLang === 'en' ? kcn1.scaleEn : kcn1.scale}
                      </span>
                    </div>
                    <p className="industrial-highlight">
                      {currentLang === 'en' ? kcn1.highlightEn : kcn1.highlight}
                    </p>
                    <div className="industrial-footer-row">
                      <span className="industrial-focus-pill gold-highlight">
                        <i className="ti ti-coffee" /> {currentLang === 'en' ? kcn1.pillEn : kcn1.pill}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Cột bên phải (KCN M'Đrắk) */}
              {(() => {
                const kcn3 = TOP_INDUSTRIAL_PARKS.top3[2];
                return (
                  <div 
                    key={kcn3.id} 
                    className="industrial-podium-card rank-3 scroll-reveal scroll-reveal-right"
                  >
                    <div className="industrial-card-top">
                      <div className="exporter-logo-wrap">
                        <img src={kcn3.logo} alt={kcn3.name} className="exporter-brand-logo" />
                      </div>
                      <div className="industrial-title-wrap">
                        <h4 className="industrial-card-title">{currentLang === 'en' ? kcn3.nameEn : kcn3.name}</h4>
                        <span className="industrial-card-loc">
                          <i className="ti ti-map-pin" /> {currentLang === 'en' ? kcn3.locationEn : kcn3.location}
                        </span>
                      </div>
                    </div>
                    <div className="industrial-scale-row">
                      <span className="industrial-scale-pill">
                        <i className="ti ti-chart-area-line" /> {currentLang === 'en' ? kcn3.scaleEn : kcn3.scale}
                      </span>
                    </div>
                    <p className="industrial-highlight">
                      {currentLang === 'en' ? kcn3.highlightEn : kcn3.highlight}
                    </p>
                    <div className="industrial-footer-row">
                      <span className="industrial-focus-pill">
                        <i className="ti ti-truck-delivery" /> {currentLang === 'en' ? kcn3.pillEn : kcn3.pill}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 7 CỤM / KHU CÔNG NGHIỆP CÒN LẠI (BỐ CỤC 2 - 3 - 2 HIỂN THỊ TÊN ĐẦY ĐỦ) */}
            <div className="industrial-rest-wrapper scroll-reveal scroll-reveal-up">
              <h5 className="exporter-rest-title">
                <i className="ti ti-building-community" />
                <span>{currentLang === 'en' ? 'Other Prominent Industrial Parks & Clusters' : 'Các khu & cụm công nghiệp tiêu biểu tiếp theo'}</span>
              </h5>
              <div className="industrial-next-grid-232">
                {TOP_INDUSTRIAL_PARKS.rest.map((park, idx) => (
                  <div 
                    key={idx} 
                    className="industrial-tag-item"
                  >
                    <div className="industrial-tag-content">
                      <i className="ti ti-building-factory" />
                      <span className="industrial-tag-name">{currentLang === 'en' ? (park.nameEn || park.name) : park.name}</span>
                    </div>
                    <span className="industrial-tag-loc">{park.location}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            BLOCK: HOẠT ĐỘNG TRỌNG ĐIỂM - SỰ KIỆN SẮP DIỄN RA
            (Bố cục tham khảo DoanhNghiepVN.Today, màu sắc bản sắc Đắk Lắk)
            ======================================================== */}
        <section className="daklak-home-events-section" id="su-kien">
          <div className="daklak-container">
            {/* Header: Hoạt động trọng điểm / Sự kiện sắp diễn ra */}
            <div className="daklak-events-header">
              <div className="daklak-events-header-left">
                <span className="daklak-events-badge">
                  <i className="ti ti-flame" style={{ marginRight: '5px' }} />
                  {currentLang === 'en' ? 'Key Activities' : 'HOẠT ĐỘNG TRỌNG ĐIỂM'}
                </span>
                <h2 className="daklak-events-title">
                  {currentLang === 'en' ? 'Upcoming Events' : 'SỰ KIỆN SẮP DIỄN RA'}
                </h2>
                <p className="daklak-events-desc">
                  {currentLang === 'en'
                    ? 'Explore key forums, business trade summits, and networking events connecting you with investors and market leaders.'
                    : 'Cập nhật các hội thảo, tọa đàm và chương trình kết nối giúp doanh nghiệp tiếp cận thông tin, chuyên gia và cơ hội hợp tác kinh doanh.'}
                </p>
              </div>
              <div className="daklak-events-header-right">
                <Link to="/events" className="daklak-events-view-all">
                  <span>{currentLang === 'en' ? 'View all events' : 'Xem tất cả sự kiện'}</span>
                  <i className="ti ti-arrow-right" />
                </Link>
              </div>
            </div>

            {/* Nếu có sự kiện thực tế trong hệ thống thì hiển thị Hero & Sub-events */}
            {heroEvent ? (
              <>
                <div className="daklak-event-hero-card">
                  <div className="daklak-event-hero-content">
                    {/* Tags row */}
                    <div className="daklak-event-hero-tags">
                      <span className="daklak-hero-tag highlight">
                        <i className="ti ti-sparkles" />
                        {currentLang === 'en' ? 'Featured Event' : 'SỰ KIỆN NỔI BẬT'}
                      </span>
                      <span className="daklak-hero-tag fee">
                        {formatEventPrice(heroEvent)}
                      </span>
                      <span className="daklak-event-hero-time">
                        <i className="ti ti-clock" />
                        {formatEventDateTime(heroEvent.event_date)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="daklak-event-hero-title">
                      <Link to={`/events/${heroEvent.id}`}>
                        {heroEvent.title}
                      </Link>
                    </h3>

                    {/* Short description */}
                    <p className="daklak-event-hero-desc">
                      {heroEvent.short_desc || heroEvent.description}
                    </p>

                    {/* Countdown Timer */}
                    <div className="daklak-event-hero-countdown-block">
                      <div className="daklak-countdown-title">
                        <i className="ti ti-hourglass-empty" />
                        <span>{currentLang === 'en' ? 'Event starts in' : 'SỰ KIỆN BẮT ĐẦU SAU'}</span>
                      </div>
                      <HomeEventCountdown eventDate={heroEvent.event_date} />
                    </div>

                    {/* Footer Row: Location & CTA */}
                    <div className="daklak-event-hero-footer">
                      <div className="daklak-event-hero-location" title={heroEvent.location || 'TP. Buôn Ma Thuột, Đắk Lắk'}>
                        <i className="ti ti-map-pin" />
                        <span>{heroEvent.location || 'TP. Buôn Ma Thuột, Đắk Lắk'}</span>
                      </div>

                      <div className="daklak-event-hero-actions">
                        <button
                          type="button"
                          onClick={() => handleOpenRegisterModal(heroEvent)}
                          className="btn-daklak-event-register"
                        >
                          <span>{currentLang === 'en' ? 'Details & Register' : 'Xem chi tiết & Đăng ký'}</span>
                          <i className="ti ti-arrow-right" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Poster Image */}
                  <div className="daklak-event-hero-image-wrap">
                    <img
                      src={heroEvent.image_url || heroEvent.poster_url || '/images/daklak/daklak_doi_ca_phe.jpg'}
                      alt={heroEvent.title}
                      className="daklak-event-hero-img"
                      onError={(e) => {
                        e.target.src = '/images/daklak/daklak_doi_ca_phe.jpg';
                      }}
                    />
                    <div className="daklak-event-hero-img-overlay" />
                  </div>
                </div>

                {/* Sub-Events 3-Card Grid */}
                {subEvents.length > 0 && (
                  <div className="daklak-event-sub-grid">
                    {subEvents.map((evt, idx) => (
                      <div key={evt.id || idx} className="daklak-event-sub-card">
                        <div className="daklak-event-sub-thumb-wrap">
                          <img
                            src={evt.image_url || evt.poster_url || '/images/daklak/daklak_dau_tu_logistics.jpg'}
                            alt={evt.title}
                            className="daklak-event-sub-img"
                            onError={(e) => {
                              e.target.src = '/images/daklak/daklak_dau_tu_logistics.jpg';
                            }}
                          />
                          <span className="daklak-event-sub-price-badge">
                            {formatEventPrice(evt)}
                          </span>
                        </div>

                        <div className="daklak-event-sub-body">
                          <div className="daklak-event-sub-time">
                            <i className="ti ti-clock" />
                            <span>{formatEventDateTime(evt.event_date)}</span>
                          </div>

                          <h4 className="daklak-event-sub-title" title={evt.title}>
                            <Link to={`/events/${evt.id}`}>{evt.title}</Link>
                          </h4>

                          <p className="daklak-event-sub-desc">
                            {evt.short_desc || evt.description}
                          </p>

                          <div className="daklak-event-sub-footer">
                            <div className="daklak-event-sub-loc" title={evt.location || 'TP. Buôn Ma Thuột'}>
                              <i className="ti ti-map-pin" />
                              <span>{evt.location || 'TP. Buôn Ma Thuột, Đắk Lắk'}</span>
                            </div>
                            <Link to={`/events/${evt.id}`} className="daklak-event-sub-link">
                              <span>{currentLang === 'en' ? 'Details' : 'Chi tiết'}</span>
                              <i className="ti ti-chevron-right" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Nếu không có sự kiện nào trong hệ thống: hiển thị theo thực tế */
              <div className="daklak-events-empty-box" style={{
                padding: '3.5rem 2rem',
                textAlign: 'center',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px dashed #CBD5E1',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                margin: '1rem 0'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#F8FAFC',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '28px'
                }}>
                  <i className="ti ti-calendar-off" />
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>
                  {currentLang === 'en' ? 'No Upcoming Events At This Time' : 'Hiện tại không có sự kiện nào'}
                </h4>
                <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
                  {currentLang === 'en'
                    ? 'All upcoming trade summits, economic forums, and cultural events will be updated here as soon as announced.'
                    : 'Các hội thảo xúc tiến thương mại, diễn đàn kinh tế và sự kiện văn hóa mới sẽ được cập nhật sớm nhất. Quý vị vui lòng quay lại sau.'}
                </p>
                <Link
                  to="/events"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    backgroundColor: '#3B2417',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '13.5px'
                  }}
                >
                  <i className="ti ti-calendar" />
                  <span>{currentLang === 'en' ? 'View All Events' : 'Xem trang sự kiện'}</span>
                </Link>
              </div>
            )}
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
            SECTION 3.5: LÀM CHỦ AI - BỨT PHÁ TƯƠNG LAI (SPECIAL AI TOPIC)
            ======================================================== */}
        <section className="daklak-section daklak-ai-showcase-section" id="lam-chu-ai">
          <div className="daklak-container">
            {/* Header Chuyên đề */}
            <div className="daklak-ai-section-header">
              <div className="daklak-ai-badge-wrapper">
                <span className="daklak-ai-special-badge">
                  <i className="ti ti-sparkles" /> {currentLang === 'en' ? 'SPECIAL TOPIC • MASTERING AI FOR THE FUTURE' : '« CHUYÊN ĐỀ ĐẶC BIỆT • LÀM CHỦ AI BỨT PHÁ TƯƠNG LAI »'}
                </span>
              </div>
              <h2 className="daklak-ai-section-title">
                {currentLang === 'en' ? 'Mastering AI – ' : 'Làm Chủ AI – '}
                <span className="daklak-ai-title-gradient">
                  {currentLang === 'en' ? 'Unlocking the Future' : 'Bứt Phá Tương Lai'}
                </span>
              </h2>
              <p className="daklak-ai-section-desc">
                {currentLang === 'en'
                  ? 'Knowledge space, digital transformation solutions, and AI technology built on 3 core pillars: Ward AI, Orion Ecosystem, and Edunow.today Digital Training.'
                  : 'Không gian tri thức, giải pháp chuyển đổi số và công nghệ trí tuệ nhân tạo với 3 trụ cột: AI phường xã, Hệ sinh thái Orion và Đào tạo số Edunow.today.'}
              </p>
            </div>

            {/* AI Showcase Single Slide Carousel (1 ô lướt mỗi 5s vô tận) */}
            {(() => {
              const wardAiPost = aiTopicPosts?.wardAi || latestPosts.find(p => p.slug === 'tro-ly-ai-phuong-xa');
              const orionPost = aiTopicPosts?.orion || latestPosts.find(p => p.slug && p.slug.includes('orion-chat-loc'));
              const edunowPost = aiTopicPosts?.edunow || latestPosts.find(p => p.slug && p.slug.includes('edunowai'));

              const wardAiImg = wardAiPost?.image_url || wardAiPost?.cover_image || wardAiPost?.thumbnail;
              const orionImg = orionPost?.image_url || orionPost?.cover_image || orionPost?.thumbnail;
              const edunowImg = edunowPost?.image_url || edunowPost?.cover_image || edunowPost?.thumbnail;

              const aiSlides = [
                {
                  id: 0,
                  tag: currentLang === 'en' ? 'Ward AI Assistant' : 'AI phường xã',
                  pillClass: 'daklak-ai-pill-cyan',
                  img: wardAiImg,
                  alt: wardAiPost?.title || "Trợ lý AI phường xã",
                  catClass: 'daklak-ai-cat-cyan',
                  catIcon: 'ti-robot',
                  catTitle: currentLang === 'en' ? 'Foundation AI Technology' : 'Công nghệ AI cơ sở',
                  title: currentLang === 'en' ? 'Ward & Commune AI Assistant' : 'Trợ lý AI phường xã',
                  link: '/posts/tro-ly-ai-phuong-xa',
                  summary: currentLang === 'en'
                    ? 'Local-level AI application supporting administration, citizen inquiries 24/7, and speeding up digital governance.'
                    : 'Trợ lý AI phường xã phục vụ công tác điều hành, hỗ trợ cán bộ và người dân tra cứu thủ tục, tiếp nhận phản ánh và số hóa dịch vụ công cơ sở 24/7.'
                },
                {
                  id: 1,
                  tag: 'Orion',
                  pillClass: 'daklak-ai-pill-gold',
                  img: orionImg,
                  alt: orionPost?.title || "Hệ sinh thái Orion",
                  catClass: 'daklak-ai-cat-gold',
                  catIcon: 'ti-cpu',
                  catTitle: currentLang === 'en' ? 'Intelligent AI Platform' : 'Nền tảng AI thông minh',
                  title: currentLang === 'en'
                    ? 'Orion: Distilling ERP, Multi-Model AI & AI Agent Platform into an Intelligent Operating System for Enterprises'
                    : 'Orion chắt lọc tinh hoa của ERP, Multi-Model AI và nền tảng xây dựng AI Agent để tạo thành một hệ điều hành quản trị thông minh dành cho doanh nghiệp',
                  link: '/posts/orion-chat-loc-tinh-hoa-cua-erp-multimodel-ai-va-nen-tang-xay-dung-ai-agent-de-tao-thanh-mot-he-dieu-hanh-quan-tri-thong-minh-danh-cho-doanh-nghiep',
                  summary: currentLang === 'en'
                    ? 'Unified intelligent enterprise operating system combining ERP and multi-model AI to automate business workflows.'
                    : 'Orion chắt lọc tinh hoa của ERP, Multi-Model AI và nền tảng xây dựng AI Agent để tạo thành một hệ điều hành quản trị thông minh dành cho doanh nghiệp.'
                },
                {
                  id: 2,
                  tag: 'Edunow.today',
                  pillClass: 'daklak-ai-pill-green',
                  img: edunowImg,
                  alt: edunowPost?.title || "EDUNOW.AI",
                  catClass: 'daklak-ai-cat-green',
                  catIcon: 'ti-school',
                  catTitle: currentLang === 'en' ? 'Training & Digital Skills' : 'Đào tạo & Kỹ năng số',
                  title: currentLang === 'en'
                    ? 'EDUNOW.AI: Smart Admissions AI Assistant Solution for Educational Institutions'
                    : 'EDUNOW.AI Giải pháp Trợ lý AI tuyển sinh thông minh dành cho các cơ sở giáo dục',
                  link: '/posts/edunowai-giai-phap-tro-ly-ai-tuyen-sinh-thong-minh-danh-cho-cac-co-so-giao-duc',
                  summary: currentLang === 'en'
                    ? 'Smart admissions consulting AI assistant and comprehensive digital skills training platform.'
                    : 'EDUNOW.AI Giải pháp Trợ lý AI tuyển sinh thông minh dành cho các cơ sở giáo dục, tư vấn tuyển sinh 24/7 và chuyển đổi số đào tạo.'
                }
              ];

              return (
                <div 
                  className="daklak-ai-slider-container"
                  onMouseEnter={() => setIsAiSlideHovered(true)}
                  onMouseLeave={() => setIsAiSlideHovered(false)}
                >
                  <div className="daklak-ai-slider-viewport">
                    <div 
                      className="daklak-ai-slider-track"
                      style={{ transform: `translateX(-${aiSlideIndex * 100}%)` }}
                    >
                      {aiSlides.map((slide, sIdx) => (
                        <div key={sIdx} className="daklak-ai-slide-card">
                          <div className="daklak-ai-card" style={{ margin: 0, height: '100%' }}>
                            <div className="daklak-ai-card-img-wrap">
                              <span className={`daklak-ai-card-pill ${slide.pillClass}`}>
                                <i className={`ti ${slide.catIcon}`} /> {slide.tag}
                              </span>
                              <div className="daklak-ai-img-container">
                                <img 
                                  src={slide.img || "/images/adt_logo.svg"} 
                                  alt={slide.alt} 
                                  className={`daklak-ai-card-img ${!slide.img ? 'daklak-ai-card-fallback-logo' : ''}`}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/images/adt_logo.svg";
                                    e.target.classList.add('daklak-ai-card-fallback-logo');
                                  }}
                                />
                              </div>
                            </div>
                            <div className="daklak-ai-card-body">
                              <div className={`daklak-ai-card-category ${slide.catClass}`}>
                                <i className={`ti ${slide.catIcon}`} /> {slide.catTitle}
                              </div>
                              <h3 className="daklak-ai-card-title">
                                <Link to={slide.link}>
                                  {slide.title}
                                </Link>
                              </h3>
                              <p className="daklak-ai-card-summary">
                                {slide.summary}
                              </p>
                              <div className="daklak-ai-card-footer">
                                <span className="daklak-ai-card-author">Công ty cổ phần ADT Quốc Tế</span>
                                <Link to={slide.link} className="daklak-ai-card-link">
                                  {currentLang === 'en' ? 'Read More' : 'Đọc chi tiết'} <i className="ti ti-arrow-right" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Arrows & Indicators */}
                  <div className="daklak-ai-slider-nav">
                    <button
                      type="button"
                      className="daklak-ai-nav-arrow"
                      onClick={() => setAiSlideIndex(prev => (prev - 1 + 3) % 3)}
                      aria-label="Bài viết trước"
                    >
                      <i className="ti ti-chevron-left" />
                    </button>
                    <div className="daklak-ai-slider-indicators">
                      {[0, 1, 2].map((idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`daklak-ai-indicator ${aiSlideIndex === idx ? 'active' : ''}`}
                          onClick={() => setAiSlideIndex(idx)}
                          aria-label={`Chuyển đến bài ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      className="daklak-ai-nav-arrow"
                      onClick={() => setAiSlideIndex(prev => (prev + 1) % 3)}
                      aria-label="Bài viết tiếp theo"
                    >
                      <i className="ti ti-chevron-right" />
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Bottom Actions */}
            <div className="daklak-ai-actions">
              <Link
                to="/posts?category=Doanh%20nghi%E1%BB%87p%20%26%20S%E1%BA%A3n%20ph%E1%BA%A9m&sub_category=Showroom%20s%E1%BB%91"
                className="btn-daklak-ai-category"
              >
                <i className="ti ti-layout-grid" />
                <span>{currentLang === 'en' ? 'View all AI Category Articles' : 'Xem toàn bộ bài viết chuyên mục AI'}</span>
              </Link>
              <Link to="/ai-chat" className="btn-daklak-ai-chat">
                <i className="ti ti-messages" />
                <span>{currentLang === 'en' ? 'Chat with AI Assistant' : 'Trò chuyện cùng Trợ lý AI'}</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 4: 4 THẾ MẠNH HỘI TỤ ĐẮK LẮK
            ======================================================== */}
        <section className="daklak-section" style={{ backgroundColor: 'var(--cream-alt)' }}>
          <div className="daklak-container">
            <div className="daklak-section-header scroll-reveal scroll-reveal-down">
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
              {/* Strength 1 (From Left) */}
              <div className="strength-card scroll-reveal scroll-reveal-left stagger-1">
                <div className="strength-img-box">
                  <img src="/images/daklak/daklak_doi_ca_phe.jpg" alt="Cà phê Đắk Lắk" />
                  <span className="strength-tag">{currentLang === 'en' ? 'Strategic Commodity' : 'Trụ cột Kinh tế'}</span>
                </div>
                <div className="strength-body">
                  <h3>{currentLang === 'en' ? 'Coffee & Specialty Agro-Products' : 'Cà Phê & Nông Sản Đặc Hữu'}</h3>
                  <p>{currentLang === 'en' ? 'Over 213,000 hectares of coffee, producing 560,000+ tons annually. Alongside durian, macadamia, and black pepper reaching top global exports.' : 'Hơn 213.000 ha cà phê, sản lượng trên 560.000 tấn/năm. Cùng sầu riêng, mắc ca, hồ tiêu đạt chuẩn xuất khẩu chất lượng cao vào EU, Mỹ, Nhật.'}</p>
                  <Link to={`/posts?category=${encodeURIComponent('Nông sản & Cà phê')}`} className="quick-access-link">{currentLang === 'en' ? 'Explore value chain →' : 'Khám phá chuỗi giá trị →'}</Link>
                </div>
              </div>

              {/* Strength 2 (From Up) */}
              <div className="strength-card scroll-reveal scroll-reveal-up stagger-2">
                <div className="strength-img-box">
                  <img src="/images/daklak/daklak_cong_chieng.jpg" alt="Văn hóa Du lịch Cồng Chiêng" />
                  <span className="strength-tag" style={{ background: 'rgba(31, 90, 58, 0.9)' }}>{currentLang === 'en' ? 'Living Heritage' : 'Di sản Sống'}</span>
                </div>
                <div className="strength-body">
                  <h3>{currentLang === 'en' ? 'Ecotourism & Gong Culture' : 'Du Lịch Sinh Thái & Di Sản Cồng Chiêng'}</h3>
                  <p>{currentLang === 'en' ? 'UNESCO Intangible Cultural Heritage of Humanity, majestic Dray Nur waterfalls, Yok Don National Park, and serene Lake Lak.' : 'Không gian văn hóa cồng chiêng được UNESCO vinh danh, hệ thống thác nước hùng vĩ, Vườn quốc gia Yok Đôn và vẻ đẹp thơ mộng của Hồ Lắk.'}</p>
                  <Link to={`/posts?category=${encodeURIComponent('Du lịch & Trải nghiệm')}`} className="quick-access-link">{currentLang === 'en' ? 'Experience culture →' : 'Trải nghiệm văn hóa →'}</Link>
                </div>
              </div>

              {/* Strength 3 (From Up) */}
              <div className="strength-card scroll-reveal scroll-reveal-up stagger-3">
                <div className="strength-img-box">
                  <img src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80" alt="Năng lượng tái tạo" />
                  <span className="strength-tag" style={{ background: 'rgba(213, 163, 63, 0.9)', color: '#26160E' }}>{currentLang === 'en' ? 'Clean Energy' : 'Năng Lượng Xanh'}</span>
                </div>
                <div className="strength-body">
                  <h3>{currentLang === 'en' ? 'Renewable Energy & Infrastructure' : 'Năng Lượng Tái Tạo & Công Nghiệp'}</h3>
                  <p>{currentLang === 'en' ? 'Centrally positioned wind & solar farm hubs; developing Buon Ma Thuot - Khanh Hoa highway opening swift coastal trade access.' : 'Trung tâm điện gió, điện mặt trời quy mô lớn; tuyến cao tốc Buôn Ma Thuột — Khánh Hòa mở toang cửa ngõ giao thương hướng biển.'}</p>
                  <Link to={`/posts?category=${encodeURIComponent('Dự án & Đầu tư')}`} className="quick-access-link">{currentLang === 'en' ? 'View infrastructure →' : 'Xem hạ tầng KCN →'}</Link>
                </div>
              </div>

              {/* Strength 4 (From Right) */}
              <div className="strength-card scroll-reveal scroll-reveal-right stagger-4">
                <div className="strength-img-box">
                  <img src="/images/daklak/daklak_dau_tu_logistics.jpg" alt="Không gian phát triển Đắk Lắk" />
                  <span className="strength-tag" style={{ background: 'rgba(122, 62, 29, 0.9)' }}>{currentLang === 'en' ? 'Urban Hub' : 'Đô Thị Trung Tâm'}</span>
                </div>
                <div className="strength-body">
                  <h3>{currentLang === 'en' ? 'Open Regional Development Space' : 'Không Gian Phát Triển Vùng Mở'}</h3>
                  <p>{currentLang === 'en' ? 'Buon Ma Thuot is oriented as the center of the Central Highlands region, featuring dynamic innovation, healthcare, and education.' : 'Buôn Ma Thuột định hướng trở thành đô thị trung tâm vùng Tây Nguyên, hạt nhân đổi mới sáng tạo, tài chính, giáo dục và y tế chuyên sâu.'}</p>
                  <Link to={`/posts?category=${encodeURIComponent('Dự án & Đầu tư')}`} className="quick-access-link">{currentLang === 'en' ? 'Economic data →' : 'Không gian phát triển →'}</Link>
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
            <div className="daklak-section-header scroll-reveal scroll-reveal-down">
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
              {/* Layer 1: Media (From Left) */}
              <div className="layer-card scroll-reveal scroll-reveal-left stagger-1">
                <span className="layer-badge">1. MEDIA • Truyền thông</span>
                <h3>{currentLang === 'en' ? 'Media & Storytelling' : 'Tin Tức & Kể Chuyện Địa Phương'}</h3>
                <ul>
                  <li><i className="ti ti-check" /> Phóng sự chuyên sâu về con người, buôn làng và nông sản Đắk Lắk.</li>
                  <li><i className="ti ti-check" /> Chuyên mục phân tích ngành hàng cà phê, hồ tiêu, sầu riêng xuất khẩu.</li>
                  <li><i className="ti ti-check" /> Gương mặt doanh nhân tiêu biểu, mô hình khởi nghiệp đổi mới sáng tạo.</li>
                  <li><i className="ti ti-check" /> Cập nhật chính sách, quy hoạch và chỉ đạo điều hành tỉnh Đắk Lắk.</li>
                </ul>
              </div>

              {/* Layer 2: Data (From Up) */}
              <div className="layer-card layer-data scroll-reveal scroll-reveal-up stagger-2">
                <span className="layer-badge">2. DATA • Cơ sở dữ liệu</span>
                <h3>{currentLang === 'en' ? 'Structured Data Assets' : 'Dữ Liệu Doanh Nghiệp & Dự Án'}</h3>
                <ul>
                  <li><i className="ti ti-check" /> Danh bạ hồ sơ năng lực 12.000+ doanh nghiệp đã xác thực thông tin.</li>
                  <li><i className="ti ti-check" /> Bản đồ dữ liệu quy hoạch quỹ đất công nghiệp, vùng nguyên liệu sạch.</li>
                  <li><i className="ti ti-check" /> Báo cáo biến động giá nông sản, thị trường cà phê thế giới theo ngày.</li>
                  <li><i className="ti ti-check" /> Hồ sơ năng lực các dự án trọng điểm đang kêu gọi dòng vốn đầu tư.</li>
                </ul>
              </div>

              {/* Layer 3: Platform (From Right) */}
              <div className="layer-card layer-platform scroll-reveal scroll-reveal-right stagger-3">
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
            <div className="daklak-section-header scroll-reveal scroll-reveal-down">
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
              <div className="coffee-timeline scroll-reveal scroll-reveal-left">
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
              <div className="coffee-case-box scroll-reveal scroll-reveal-right">
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
                  <Link to={`/posts?category=${encodeURIComponent('Nông sản & Cà phê')}`} className="btn-daklak-gold" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
                    Xem Chuyên mục Nông sản & Cà phê
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
            <div className="daklak-section-header scroll-reveal scroll-reveal-down" style={{ marginBottom: '30px' }}>
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
              <div className="data-stat-card scroll-reveal scroll-reveal-up stagger-1">
                <div className="data-stat-num">213.000+</div>
                <div className="data-stat-label">Hécta Cà phê</div>
                <div className="data-stat-sub">Thủ phủ lớn nhất Việt Nam</div>
              </div>

              <div className="data-stat-card scroll-reveal scroll-reveal-up stagger-2">
                <div className="data-stat-num">560.000+</div>
                <div className="data-stat-label">Tấn Sản lượng/Năm</div>
                <div className="data-stat-sub">Cung ứng hơn 30% sản lượng cả nước</div>
              </div>

              <div className="data-stat-card scroll-reveal scroll-reveal-up stagger-3">
                <div className="data-stat-num">1,6+ Tỷ $</div>
                <div className="data-stat-label">Kim ngạch Xuất khẩu</div>
                <div className="data-stat-sub">Tăng trưởng bền vững 14%/năm</div>
              </div>

              <div className="data-stat-card scroll-reveal scroll-reveal-up stagger-4">
                <div className="data-stat-num">12.500+</div>
                <div className="data-stat-label">Doanh nghiệp</div>
                <div className="data-stat-sub">Cộng đồng hội viên năng động</div>
              </div>

              <div className="data-stat-card scroll-reveal scroll-reveal-up stagger-5">
                <div className="data-stat-num">50+</div>
                <div className="data-stat-label">Dự án Kêu gọi Đầu tư</div>
                <div className="data-stat-sub">Quy hoạch quỹ đất sạch 2026-2030</div>
              </div>

              <div className="data-stat-card scroll-reveal scroll-reveal-up stagger-6">
                <div className="data-stat-num">38,7%</div>
                <div className="data-stat-label">Độ che phủ Rừng</div>
                <div className="data-stat-sub">Lợi thế hấp thụ Carbon & Tín chỉ ESG</div>
              </div>
            </div>
          </div>
        </section>





        {/* ========================================================
            SECTION 10: DOANH NGHIỆP ĐẮK LẮK TIÊU BIỂU (DYNAMIC MEMBERS)
            ======================================================== */}
        <section className="daklak-section">
          <div className="daklak-container">
            <div className="daklak-section-header scroll-reveal scroll-reveal-down">
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
              {featuredMembers.map((m, mIdx) => (
                <div key={m.id} className={`member-card scroll-reveal scroll-reveal-up stagger-${(mIdx % 3) + 1}`}>
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

            <div className="scroll-reveal scroll-reveal-up" style={{ textAlign: 'center', marginTop: '35px' }}>
              <Link to="/members" className="btn-daklak-primary">
                <i className="ti ti-address-book" />
                <span>{currentLang === 'en' ? 'Explore Full Enterprise Directory' : 'Tra cứu Danh bạ Toàn bộ Doanh nghiệp'}</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 15: GÓI THAM GIA MẠNG LƯỚI (MEMBERSHIP TIERS)
            ======================================================== */}
        <section className="daklak-section" style={{ backgroundColor: 'var(--cream-alt)' }}>
          <div className="daklak-container">
            <div className="daklak-section-header scroll-reveal scroll-reveal-down">
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
              <div className="tier-card scroll-reveal scroll-reveal-left">
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
              <div className="tier-card featured scroll-reveal scroll-reveal-up stagger-1">
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
              <div className="tier-card scroll-reveal scroll-reveal-up stagger-2">
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
              <div className="tier-card scroll-reveal scroll-reveal-right">
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
            <div className="daklak-section-header scroll-reveal scroll-reveal-down">
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

            <div className="faq-list scroll-reveal scroll-reveal-left">
              {faqs.map((faq, index) => {
                const isOpen = activeFaq === index;
                const questionId = `faq-q-${index}`;
                const panelId = `faq-panel-${index}`;
                return (
                  <div key={index} className="faq-item">
                    <button 
                      id={questionId}
                      className="faq-question"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                    >
                      <span>{faq.q}</span>
                      <i className={`ti ti-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: 'var(--bazan-red)' }} />
                    </button>
                    {isOpen && (
                      <div 
                        id={panelId}
                        role="region"
                        aria-labelledby={questionId}
                        className="faq-answer"
                      >
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
            <div className="daklak-section-header scroll-reveal scroll-reveal-down">
              <span className="daklak-section-badge">{currentLang === 'en' ? 'Consultation & Partnership' : 'Đăng Ký Tư Vấn'}</span>
              <h2 className="daklak-section-title">
                {currentLang === 'en' ? 'Partner with DakLak.today' : 'Đăng Ký Tư Vấn & Kết Nối HỢP Tác Đầu Tư'}
              </h2>
              <p className="daklak-section-desc">
                {currentLang === 'en'
                  ? 'Submit your enterprise details or project inquiries. Our investment specialists will contact you within 24 hours.'
                  : 'Quý doanh nghiệp và nhà đầu tư vui lòng gửi thông tin yêu cầu. Ban xúc tiến đầu tư sẽ liên hệ hỗ trợ trong vòng 24 giờ làm việc.'}
              </p>
            </div>

            <div className="consult-form-box scroll-reveal scroll-reveal-right">
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
                      <label htmlFor="consult-fullName">Họ và tên người liên hệ (*)</label>
                      <input 
                        id="consult-fullName"
                        type="text"
                        className="daklak-form-input"
                        placeholder="Ví dụ: Nguyễn Văn An"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        aria-required="true"
                      />
                    </div>

                    <div className="daklak-form-group">
                      <label htmlFor="consult-phone">Số điện thoại liên hệ (*)</label>
                      <input 
                        id="consult-phone"
                        type="tel"
                        className="daklak-form-input"
                        placeholder="Ví dụ: 0912 345 678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="daklak-form-group">
                      <label htmlFor="consult-email">Email làm việc</label>
                      <input 
                        id="consult-email"
                        type="email"
                        className="daklak-form-input"
                        placeholder="Ví dụ: contact@doanhnghiep.vn"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="daklak-form-group">
                      <label htmlFor="consult-companyName">Tên Doanh nghiệp / Đơn vị (*)</label>
                      <input 
                        id="consult-companyName"
                        type="text"
                        className="daklak-form-input"
                        placeholder="Ví dụ: Công ty Cổ phần Nông sản Tây Nguyên"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="daklak-form-group">
                      <label htmlFor="consult-city">Tỉnh / Thành phố hoạt động</label>
                      <input 
                        id="consult-city"
                        type="text"
                        className="daklak-form-input"
                        placeholder="Ví dụ: Đắk Lắk, TP.HCM, Hà Nội..."
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>

                    <div className="daklak-form-group">
                      <label htmlFor="consult-serviceNeed">Lĩnh vực quan tâm & nhu cầu hợp tác</label>
                      <select 
                        id="consult-serviceNeed"
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
                    <label htmlFor="consult-notes">Chi tiết nhu cầu & nội dung cần hỗ trợ</label>
                    <textarea 
                      id="consult-notes"
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

        {/* ========================================================
            BLOCK: ĐỐI TÁC CỦA CHÚNG TÔI (CAROUSEL TRÊN FOOTER)
            ======================================================== */}
        <section className="daklak-partners-section" id="doi-tac">
          <div className="daklak-container">
            <h2 className="daklak-partners-title scroll-reveal scroll-reveal-down">
              {currentLang === 'en' ? 'OUR PARTNERS' : 'ĐỐI TÁC CỦA CHÚNG TÔI'}
            </h2>
            <div className="daklak-partners-underline scroll-reveal scroll-reveal-scale" />

            <div
              className="daklak-partners-carousel-container scroll-reveal scroll-reveal-up"
              onMouseEnter={() => setIsPartnerHovered(true)}
              onMouseLeave={() => setIsPartnerHovered(false)}
            >
              {/* Nút lướt Trái */}
              <button
                type="button"
                className="daklak-partner-arrow-btn"
                onClick={handlePrevPartner}
                aria-label="Đối tác trước"
                title={currentLang === 'en' ? 'Previous partner' : 'Đối tác trước'}
              >
                <i className="ti ti-arrow-left" />
              </button>

              {/* Khung nhìn trượt 4 logo */}
              <div className="daklak-partners-viewport">
                <div
                  className="daklak-partners-track"
                  style={{
                    transform: `translateX(-${partnerIndex * (100 / partnerVisibleCount)}%)`,
                    transition: withPartnerTransition ? 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none'
                  }}
                >
                  {[...PARTNER_COMPANIES, ...PARTNER_COMPANIES, ...PARTNER_COMPANIES].map((pt, pIdx) => (
                    <div
                      key={`${pt.id}-${pIdx}`}
                      className="daklak-partner-item-wrap"
                      style={{
                        flex: `0 0 ${100 / partnerVisibleCount}%`,
                        maxWidth: `${100 / partnerVisibleCount}%`
                      }}
                    >
                      <div className="daklak-partner-item" title={pt.name}>
                        <img
                          src={pt.logo}
                          alt={pt.name}
                          className="daklak-partner-logo"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nút lướt Phải */}
              <button
                type="button"
                className="daklak-partner-arrow-btn"
                onClick={handleNextPartner}
                aria-label="Đối tác tiếp theo"
                title={currentLang === 'en' ? 'Next partner' : 'Đối tác tiếp theo'}
              >
                <i className="ti ti-arrow-right" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* QUICK EVENT REGISTRATION MODAL */}
      {registerModalEvent && (
        <div className="daklak-modal-overlay" onClick={handleCloseModal}>
          <div
            className="daklak-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '560px',
              width: '100%',
              padding: 0,
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
              backgroundColor: '#ffffff',
              position: 'relative'
            }}
          >
            <button
              type="button"
              className="daklak-modal-close"
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '14px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.25)',
                border: 'none',
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                cursor: 'pointer',
                zIndex: 10,
                transition: 'background 0.2s'
              }}
              title="Đóng"
            >
              ✕
            </button>

            {/* TRƯỜNG HỢP: ĐÃ ĐĂNG KÝ THÀNH CÔNG (HIỂN THỊ VÉ / THANH TOÁN) */}
            {regSuccessData ? (
              Number(regSuccessData.total_amount) > 0 ? (
                paidFlowStep === 'transfer' ? (
                  // BƯỚC 1 CỦA SỰ KIỆN CÓ PHÍ: THÔNG TIN CHUYỂN KHOẢN & BẮT BUỘC TẢI ẢNH BILL
                  <>
                    <div style={{ background: 'linear-gradient(135deg, #1C0F08 0%, #3B2011 100%)', color: '#ffffff', padding: '1.4rem 1.5rem', textAlign: 'center' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(213, 163, 63, 0.25)',
                        color: 'var(--gong-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 8px',
                        fontSize: '24px'
                      }}>
                        <i className="ti ti-credit-card"></i>
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px 0', color: '#FFFFFF' }}>
                        Thanh Toán & Kích Hoạt Vé
                      </h3>
                      <p style={{ fontSize: '12px', opacity: 0.9, margin: 0, color: '#E0D4CA' }}>
                        {regSuccessData.event_title}
                      </p>
                    </div>

                    <div style={{ padding: '1.25rem 1.5rem', maxHeight: '72vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ fontSize: '12.5px', color: '#334155', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '3px', border: '1px solid #E2E8F0' }}>
                        <div><strong>Khách tham dự:</strong> {regSuccessData.full_name} ({regSuccessData.phone})</div>
                        <div><strong>Số lượng vé:</strong> {regSuccessData.quantity} vé · <strong>Mã đăng ký:</strong> <code style={{ fontWeight: '700', color: '#A84524' }}>{regSuccessData.ticket_code}</code></div>
                      </div>

                      {/* Khối thanh toán Chuyển khoản VietQR */}
                      <div style={{ border: '1px solid #FCD34D', backgroundColor: '#FFFBEB', borderRadius: '12px', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#B45309', fontWeight: '800', fontSize: '14px', marginBottom: '8px' }}>
                          <i className="ti ti-building-bank"></i>
                          <span>Thông tin thanh toán chuyển khoản</span>
                        </div>

                        <div style={{ fontSize: '13px', color: '#78350F', marginBottom: '10px' }}>
                          Tổng số tiền cần thanh toán:{' '}
                          <strong style={{ fontSize: '17px', color: '#B45309' }}>
                            {Number(regSuccessData.total_amount).toLocaleString('vi-VN')} VNĐ
                          </strong>
                        </div>

                        {regSuccessData.vietqr_url && (
                          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                            <img
                              src={regSuccessData.vietqr_url}
                              alt="VietQR Chuyển khoản"
                              style={{ maxWidth: '240px', width: '100%', borderRadius: '8px', border: '1px solid #FDE68A', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
                            />
                            <div style={{ fontSize: '11px', color: '#78350F', marginTop: '4px' }}>
                              Quét mã VietQR bằng ứng dụng ngân hàng bất kỳ để chuyển khoản tự động
                            </div>
                          </div>
                        )}

                        <div style={{ fontSize: '12px', color: '#451A03', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div><strong>Ngân hàng:</strong> {regSuccessData.bank_info?.bank_name} ({regSuccessData.bank_info?.bank_branch})</div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FEF3C7', padding: '6px 8px', borderRadius: '6px' }}>
                            <span><strong>Số tài khoản:</strong> <code style={{ fontSize: '13px', fontWeight: '800' }}>{regSuccessData.bank_info?.account_number}</code></span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(regSuccessData.bank_info?.account_number, 'bank')}
                              style={{ padding: '3px 8px', fontSize: '11px', backgroundColor: '#D97706', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                            >
                              {copiedBank ? 'Đã chép!' : 'Sao chép'}
                            </button>
                          </div>
                          <div><strong>Chủ tài khoản:</strong> {regSuccessData.bank_info?.account_holder}</div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FEF3C7', padding: '6px 8px', borderRadius: '6px' }}>
                            <span><strong>Nội dung CK:</strong> <code style={{ fontSize: '12px', fontWeight: '800', color: '#B45309' }}>{regSuccessData.payment_note}</code></span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(regSuccessData.payment_note, 'note')}
                              style={{ padding: '3px 8px', fontSize: '11px', backgroundColor: '#D97706', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                            >
                              {copiedNote ? 'Đã chép!' : 'Sao chép'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* BẮT BUỘC TẢI ẢNH CHUYỂN KHOẢN */}
                      <div style={{
                        border: '2px dashed #A84524',
                        backgroundColor: '#FDF7F4',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#A84524', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <i className="ti ti-upload"></i>
                          <span>Tải ảnh chuyển khoản thành công (Bắt buộc) *</span>
                        </div>
                        <p style={{ fontSize: '11.5px', color: '#73311A', margin: '0 0 12px', lineHeight: 1.4 }}>
                          Sau khi chuyển khoản qua ngân hàng, quý khách vui lòng tải ảnh biên lai giao dịch thành công để Ban tổ chức kiểm duyệt và kích hoạt vé.
                        </p>

                        {proofPreview ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{ maxHeight: '180px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0', backgroundColor: '#ffffff' }}>
                              <img src={proofPreview} alt="Ảnh chuyển khoản" style={{ width: '100%', maxHeight: '180px', objectFit: 'contain' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', color: '#A84524', fontWeight: '600' }}>✓ Đã chọn ảnh: {proofFile?.name}</span>
                              <label style={{ fontSize: '11px', color: '#2563EB', cursor: 'pointer', textDecoration: 'underline', fontWeight: '600' }}>
                                Đổi ảnh khác
                                <input type="file" accept="image/*" onChange={handleProofChange} style={{ display: 'none' }} />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1.5rem',
                            border: '1px dashed #A84524',
                            borderRadius: '8px',
                            backgroundColor: '#ffffff',
                            cursor: 'pointer',
                            gap: '6px'
                          }}>
                            <i className="ti ti-photo-plus" style={{ fontSize: '30px', color: '#A84524' }}></i>
                            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#A84524' }}>Nhấn vào đây để tải ảnh bill chuyển khoản</span>
                            <span style={{ fontSize: '11px', color: '#64748B' }}>Hỗ trợ định dạng JPG, PNG, WEBP (Tối đa 20MB)</span>
                            <input type="file" accept="image/*" onChange={handleProofChange} style={{ display: 'none' }} />
                          </label>
                        )}
                      </div>
                    </div>

                    <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#ffffff', color: '#64748B', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Đóng
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmitPaymentProof}
                        disabled={!proofFile || uploadingProof}
                        style={{
                          padding: '9px 22px',
                          borderRadius: '8px',
                          border: 'none',
                          background: proofFile ? 'linear-gradient(135deg, #A84524 0%, #7E2D13 100%)' : '#94A3B8',
                          color: '#ffffff',
                          fontSize: '13px',
                          fontWeight: '700',
                          cursor: proofFile && !uploadingProof ? 'pointer' : 'not-allowed',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {uploadingProof ? (<><i className="ti ti-loader animate-spin"></i> Đang gửi ảnh...</>) : (<><i className="ti ti-send"></i> Gửi ảnh xác nhận thanh toán</>)}
                      </button>
                    </div>
                  </>
                ) : (
                  // BƯỚC 2: CHỜ DUYỆT
                  <>
                    <div style={{ background: 'linear-gradient(135deg, #1C0F08 0%, #3B2011 100%)', color: '#ffffff', padding: '1.5rem 1.25rem', textAlign: 'center' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(213, 163, 63, 0.25)', color: 'var(--gong-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '26px' }}>
                        <i className="ti ti-clock"></i>
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px 0', color: '#FFFFFF' }}>Đã Gửi Thông Tin Thanh Toán!</h3>
                      <p style={{ fontSize: '12.5px', opacity: 0.9, margin: 0, color: '#E0D4CA' }}>{regSuccessData.event_title}</p>
                    </div>
                    <div style={{ padding: '1.5rem', maxHeight: '72vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', backgroundColor: '#F59E0B', color: '#ffffff', fontSize: '11.5px', fontWeight: '800', padding: '3px 12px', borderRadius: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>
                          Trạng thái: Chờ duyệt thanh toán
                        </span>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#92400E', marginBottom: '6px' }}>
                          Ban tổ chức đang kiểm tra và đối soát chuyển khoản
                        </div>
                        <p style={{ fontSize: '12.5px', color: '#78350F', margin: 0, lineHeight: 1.5 }}>
                          Chứng từ chuyển khoản của bạn đã được tiếp nhận thành công. Sau khi xác nhận hợp lệ, Ban tổ chức sẽ kích hoạt vé tham dự chính thức.
                        </p>
                      </div>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 14px', fontSize: '12.5px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div><strong>Mã đăng ký:</strong> <code style={{ fontWeight: '700', color: '#0F172A' }}>{regSuccessData.ticket_code}</code></div>
                        <div><strong>Khách tham dự:</strong> {regSuccessData.full_name}</div>
                        <div><strong>Số lượng:</strong> {regSuccessData.quantity} vé · <strong>Tổng tiền:</strong> {Number(regSuccessData.total_amount).toLocaleString('vi-VN')} VNĐ</div>
                      </div>
                      {accountNotice && (
                        <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', lineHeight: 1.45 }}>
                          <strong>Tài khoản theo dõi:</strong> {accountNotice}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', backgroundColor: '#F8FAFC' }}>
                      {isLoggedIn ? (
                        <Link to="/member-dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#A84524', color: '#ffffff', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', textDecoration: 'none' }}>
                          <i className="ti ti-ticket"></i> Vào Dashboard theo dõi
                        </Link>
                      ) : (
                        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#A84524', color: '#ffffff', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', textDecoration: 'none' }}>
                          <i className="ti ti-login"></i> Đăng nhập Dashboard
                        </Link>
                      )}
                      <button type="button" onClick={handleCloseModal} style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #1C0F08 0%, #3B2011 100%)', color: '#ffffff', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                        Hoàn tất
                      </button>
                    </div>
                  </>
                )
              ) : (
                // SỰ KIỆN MIỄN PHÍ: HIỂN THỊ MÃ VÉ VÀ QR CODE
                <>
                  <div style={{ background: 'linear-gradient(135deg, #1C0F08 0%, #3B2011 100%)', color: '#ffffff', padding: '1.4rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: 'rgba(213, 163, 63, 0.25)', color: 'var(--gong-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: '24px' }}>
                      <i className="ti ti-check"></i>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px 0', color: '#FFFFFF' }}>Đăng Ký Tham Gia Thành Công!</h3>
                    <p style={{ fontSize: '12px', opacity: 0.9, margin: 0, color: '#E0D4CA' }}>{regSuccessData.event_title}</p>
                  </div>

                  <div style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Thẻ Vé Điện Tử */}
                    <div style={{ border: '2px dashed #A84524', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#FDF7F4', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#A84524', fontWeight: '700', letterSpacing: '0.6px' }}>
                        MÃ VÉ THAM DỰ CHÍNH THỨC
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: '900', color: '#1C0F08', letterSpacing: '1px', margin: '4px 0 10px' }}>
                        {regSuccessData.ticket_code}
                      </div>

                      {regSuccessData.qr_image ? (
                        <div style={{ width: '180px', height: '180px', margin: '0 auto', backgroundColor: '#ffffff', padding: '8px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                          <img src={regSuccessData.qr_image} alt="Mã QR Check-in" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                      ) : (
                        <div style={{ width: '180px', height: '180px', margin: '0 auto', backgroundColor: '#ffffff', padding: '8px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                          <img src={`/api/events/qr/${encodeURIComponent(regSuccessData.ticket_code)}`} alt="Mã QR Check-in" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                      )}
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '8px' }}>
                        Vui lòng xuất trình mã QR này tại quầy lễ tân để check-in vào sự kiện.
                      </div>
                    </div>

                    {/* Thông tin người tham dự */}
                    <div style={{ fontSize: '12.5px', color: '#334155', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid #E2E8F0' }}>
                      <div><strong>Người tham dự:</strong> {regSuccessData.full_name}</div>
                      <div><strong>Số điện thoại:</strong> {regSuccessData.phone}</div>
                      <div><strong>Số lượng:</strong> {regSuccessData.quantity} vé (Miễn phí)</div>
                      {regSuccessData.company && <div><strong>Đơn vị:</strong> {regSuccessData.company}</div>}
                    </div>

                    {accountNotice && (
                      <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', lineHeight: 1.45, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <i className="ti ti-check-circle" style={{ fontSize: '18px', color: '#1E63E9', flexShrink: 0, marginTop: '2px' }}></i>
                        <div>
                          <strong>Tài khoản theo dõi vé:</strong> {accountNotice} Sau khi Ban quản trị duyệt hồ sơ, bạn có thể đăng nhập bằng tài khoản này để xem và quản lý vé trong Dashboard thành viên.
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', backgroundColor: '#F8FAFC' }}>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#ffffff', color: '#334155', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      <i className="ti ti-printer"></i> In vé
                    </button>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {isLoggedIn ? (
                        <Link to="/member-dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#A84524', color: '#ffffff', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', textDecoration: 'none' }}>
                          <i className="ti ti-ticket"></i> Vào Dashboard
                        </Link>
                      ) : (
                        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#A84524', color: '#ffffff', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', textDecoration: 'none' }}>
                          <i className="ti ti-login"></i> Đăng nhập
                        </Link>
                      )}
                      <button type="button" onClick={handleCloseModal} style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #1C0F08 0%, #3B2011 100%)', color: '#ffffff', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                        Hoàn tất
                      </button>
                    </div>
                  </div>
                </>
              )
            ) : (
              // FORM ĐĂNG KÝ VÉ (CHƯA ĐĂNG KÝ)
              <>
                <div style={{ background: 'linear-gradient(135deg, #1C0F08 0%, #3B2011 100%)', color: '#ffffff', padding: '1.4rem 1.5rem', textAlign: 'left' }}>
                  <span style={{ fontSize: '11px', color: 'var(--gong-gold)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    ĐĂNG KÝ VÉ NHANH
                  </span>
                  <h3 style={{ fontSize: '18px', color: '#FFFFFF', margin: '4px 0 6px', fontWeight: '800', lineHeight: 1.3 }}>
                    {registerModalEvent.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#E0D4CA', margin: 0 }}>
                    {Number(registerModalEvent.is_paid) === 1 && Number(registerModalEvent.price) > 0
                      ? `Giá vé: ${Number(registerModalEvent.price).toLocaleString('vi-VN')} VNĐ / vé • Chuyển khoản VietQR tiện lợi`
                      : 'Vé tham gia: Miễn phí (Free Pass) • Nhận mã QR tức thời.'}
                  </p>
                </div>

                <div style={{ padding: '1.25rem 1.5rem', maxHeight: '72vh', overflowY: 'auto' }}>
                  <form onSubmit={handleQuickRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    
                    {/* Họ và tên */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Họ và tên (*)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nguyễn Văn An"
                        value={regForm.fullName}
                        onChange={(e) => setRegForm(prev => ({ ...prev, fullName: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px',
                          outline: 'none',
                          backgroundColor: '#F8FAFC'
                        }}
                      />
                    </div>

                    {/* Số điện thoại */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Số điện thoại (*)
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0912 345 678"
                        value={regForm.phone}
                        onChange={(e) => {
                          setRegForm(prev => ({ ...prev, phone: e.target.value }));
                          if (accountWarning) setAccountWarning('');
                        }}
                        onBlur={() => {
                          if (!isActuallyLoggedIn) {
                            verifyAccountNotExists(regForm.phone, regForm.email, regForm.createAccount ? regForm.accountLogin : '');
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px',
                          outline: 'none',
                          backgroundColor: '#F8FAFC'
                        }}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Email (để nhận vé điện tử)
                      </label>
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={regForm.email}
                        onChange={(e) => {
                          setRegForm(prev => ({ ...prev, email: e.target.value }));
                          if (accountWarning) setAccountWarning('');
                        }}
                        onBlur={() => {
                          if (!isActuallyLoggedIn) {
                            verifyAccountNotExists(regForm.phone, regForm.email, regForm.createAccount ? regForm.accountLogin : '');
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px',
                          outline: 'none',
                          backgroundColor: '#F8FAFC'
                        }}
                      />
                    </div>

                    {/* Tên đơn vị / Doanh nghiệp */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Tên đơn vị / Doanh nghiệp
                      </label>
                      <input
                        type="text"
                        placeholder="Công ty Cổ phần / Hợp tác xã..."
                        value={regForm.company}
                        onChange={(e) => setRegForm(prev => ({ ...prev, company: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px',
                          outline: 'none',
                          backgroundColor: '#F8FAFC'
                        }}
                      />
                    </div>

                    {/* Số lượng vé */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Số lượng vé tham gia
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={regForm.quantity}
                        onChange={(e) => setRegForm(prev => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value, 10) || 1) }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px',
                          outline: 'none',
                          backgroundColor: '#F8FAFC'
                        }}
                      />
                    </div>

                    {/* Checkbox tạo tài khoản HOẶC Thông báo đã đăng nhập */}
                    {isActuallyLoggedIn ? (
                      <div style={{
                        padding: '10px 14px',
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginTop: '4px'
                      }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: '#DBEAFE',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#1E40AF',
                          flexShrink: 0
                        }}>
                          <i className="ti ti-user-check" style={{ fontSize: '16px' }}></i>
                        </div>
                        <div style={{ fontSize: '12px', color: '#1E40AF', lineHeight: 1.4 }}>
                          Tài khoản: <strong>{effectiveUser?.name || effectiveUser?.username || effectiveUser?.email}</strong>
                          <div style={{ fontSize: '11px', color: '#1E3A8A' }}>Vé đăng ký sẽ tự động gán vào tài khoản này để theo dõi.</div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Checkbox: Tạo tài khoản để theo dõi vé */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <input
                            type="checkbox"
                            id="chkHomeCreateAcc"
                            checked={regForm.createAccount}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setRegForm(prev => ({
                                ...prev,
                                createAccount: checked,
                                accountLogin: checked && !prev.accountLogin ? (prev.email || prev.phone) : prev.accountLogin
                              }));
                              if (checked) {
                                verifyAccountNotExists(regForm.phone, regForm.email, regForm.email || regForm.phone);
                              }
                            }}
                            style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#A84524' }}
                          />
                          <label htmlFor="chkHomeCreateAcc" style={{ fontSize: '12.5px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                            Tạo tài khoản để theo dõi vé
                          </label>
                        </div>

                        {/* Hiển thị 3 ô khi tích chọn tạo tài khoản */}
                        {regForm.createAccount && (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            padding: '10px 12px',
                            backgroundColor: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            borderRadius: '8px',
                            marginTop: '2px'
                          }}>
                            <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <i className="ti ti-user-plus"></i>
                              <span>Thiết lập tài khoản thành viên:</span>
                            </div>

                            {/* Ô 1: Tài khoản (Email hoặc Số điện thoại) */}
                            <div>
                              <input
                                type="text"
                                required={regForm.createAccount}
                                placeholder="Tài khoản (Email hoặc Số điện thoại) *"
                                value={regForm.accountLogin}
                                onChange={(e) => {
                                  setRegForm(prev => ({ ...prev, accountLogin: e.target.value }));
                                  if (accountWarning) setAccountWarning('');
                                }}
                                onBlur={() => {
                                  if (!isActuallyLoggedIn) {
                                    verifyAccountNotExists(regForm.phone, regForm.email, regForm.accountLogin);
                                  }
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #93C5FD',
                                  fontSize: '12.5px',
                                  outline: 'none',
                                  backgroundColor: '#ffffff'
                                }}
                              />
                            </div>

                            {/* Ô 2: Mật khẩu */}
                            <div style={{ position: 'relative' }}>
                              <input
                                type={showPassword ? 'text' : 'password'}
                                required={regForm.createAccount}
                                placeholder="Mật khẩu (tối thiểu 6 ký tự) *"
                                value={regForm.accountPassword}
                                onChange={(e) => setRegForm(prev => ({ ...prev, accountPassword: e.target.value }))}
                                style={{
                                  width: '100%',
                                  padding: '8px 32px 8px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #93C5FD',
                                  fontSize: '12.5px',
                                  outline: 'none',
                                  backgroundColor: '#ffffff'
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(p => !p)}
                                style={{
                                  position: 'absolute',
                                  right: '8px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'none',
                                  border: 'none',
                                  color: '#64748B',
                                  cursor: 'pointer',
                                  padding: '2px',
                                  fontSize: '14px'
                                }}
                                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                              >
                                <i className={showPassword ? "ti ti-eye-off" : "ti ti-eye"}></i>
                              </button>
                            </div>

                            {/* Ô 3: Xác nhận mật khẩu */}
                            <div>
                              <input
                                type={showPassword ? 'text' : 'password'}
                                required={regForm.createAccount}
                                placeholder="Xác nhận mật khẩu *"
                                value={regForm.accountConfirmPassword}
                                onChange={(e) => setRegForm(prev => ({ ...prev, accountConfirmPassword: e.target.value }))}
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #93C5FD',
                                  fontSize: '12.5px',
                                  outline: 'none',
                                  backgroundColor: '#ffffff'
                                }}
                              />
                            </div>

                            <div style={{ fontSize: '10.5px', color: '#1E40AF', lineHeight: 1.35 }}>
                              * Hệ thống sẽ tự động tạo tài khoản như đăng ký thành viên (các trường bắt buộc khác sẽ để mặc định là "Cần bổ sung"). Sau khi admin duyệt, bạn có thể đăng nhập vào để cập nhật thông tin.
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Cảnh báo nếu Email hoặc SĐT đã có tài khoản trên hệ thống */}
                    {accountWarning && (
                      <div style={{
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#991B1B',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        lineHeight: 1.45,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        marginTop: '4px'
                      }}>
                        <i className="ti ti-alert-triangle" style={{ fontSize: '16px', color: '#DC2626', flexShrink: 0, marginTop: '2px' }}></i>
                        <div>
                          <div style={{ fontWeight: '600' }}>{accountWarning}</div>
                          <div style={{ marginTop: '4px', fontSize: '11.5px', color: '#B91C1C' }}>
                            👉 <Link to="/login" style={{ color: '#DC2626', fontWeight: '700', textDecoration: 'underline' }}>Đăng nhập tài khoản tại đây</Link> hoặc nhập Email / SĐT khác hợp lệ.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Nút Đăng ký ngay */}
                    <button
                      type="submit"
                      disabled={submittingReg || checkingAccount}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #A84524 0%, #7E2D13 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: submittingReg || checkingAccount ? 'not-allowed' : 'pointer',
                        marginTop: '8px',
                        boxShadow: '0 4px 12px rgba(168, 69, 36, 0.35)',
                        transition: 'transform 0.15s ease, opacity 0.15s'
                      }}
                    >
                      {submittingReg ? 'Đang cấp vé...' : checkingAccount ? 'Đang kiểm tra tài khoản...' : (Number(registerModalEvent?.is_paid) === 1 && Number(registerModalEvent?.price) > 0 ? 'Tiếp tục thanh toán & Đăng ký' : 'Xác nhận & Cấp vé ngay')}
                    </button>

                    {/* Subtext chú thích */}
                    <div style={{ fontSize: '11px', color: '#64748B', textAlign: 'center', marginTop: '4px', lineHeight: 1.4 }}>
                      {Number(registerModalEvent?.is_paid) === 1 && Number(registerModalEvent?.price) > 0
                        ? 'Sự kiện có phí: Vui lòng chuyển khoản và tải ảnh xác nhận để kích hoạt vé.'
                        : 'Bạn sẽ nhận được mã QR ngay sau khi hoàn tất đăng ký.'}
                      {!isLoggedIn && (
                        <div style={{ marginTop: '2px' }}>
                          Đã có tài khoản?{' '}
                          <Link to="/login" style={{ color: '#D97706', textDecoration: 'none', fontWeight: '600' }}>
                            Tra cứu tại đây
                          </Link>
                        </div>
                      )}
                    </div>

                  </form>
                </div>
              </>
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
