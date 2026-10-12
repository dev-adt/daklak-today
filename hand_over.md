# 📋 TÀI LIỆU BÀN GIAO KỸ THUẬT & HƯỚNG DẪN TÁI SỬ DỤNG CODEBASE
# (TECHNICAL HANDOVER & REBRANDING / REDESIGN MANUAL)

> **Dự án gốc**: Nền tảng Cổng thông tin & Hệ sinh thái số Doanh nghiệp (`doanhnghiepvn.today`)  
> **Đơn vị phát triển & bàn giao**: ADT Quốc tế  
> **Đối tượng sử dụng**: Lập trình viên Fullstack / Frontend / AI Coding Assistant (Antigravity, Cursor, Windsurf, Claude Code...) tiếp nhận phát triển phiên bản mới.  
> **Mục tiêu tài liệu**: Hướng dẫn toàn diện cách **tái sử dụng 100% logic backend & tính năng nghiệp vụ có sẵn**, chỉ thay đổi **Tên thương hiệu, Màu sắc nhận diện và Thiết kế lại toàn bộ Giao diện Trang chủ (`Home.jsx`)** mà không lo phát sinh lỗi.

---

## 📑 MỤC LỤC
1. [Tổng quan Kiến trúc & Triết lý Thiết kế](#1-tổng-quan-kiến-trúc--triết-lý-thiết-kế)
2. [Cấu trúc Thư mục & Trọng tâm Cần Lưu Ý](#2-cấu-trúc-thư-mục--trọng-tâm-cần-lưu-ý)
3. [Quy trình 5 Bước Đổi Thương hiệu & Màu sắc (Rebranding)](#3-quy-trình-5-bước-đổi-thương-hiệu--màu-sắc-rebranding)
4. [Bản đồ Dữ liệu & Tính năng Trang chủ (`Home.jsx`)](#4-bản-đồ-dữ-liệu--tính-năng-trang-chủ-homejsx)
5. [Hướng dẫn Chi tiết Thiết kế lại Giao diện Trang chủ](#5-hướng-dẫn-chi-tiết-thiết-kế-lại-giao-diện-trang-chủ)
6. [Khung Code Mẫu Chuẩn (Clean Skeleton) cho `Home.jsx`](#6-khung-code-mẫu-chuẩn-clean-skeleton-cho-homejsx)
7. [Danh mục API Backend Phục vụ Trang chủ & Nghiệp vụ](#7-danh-mục-api-backend-phục-vụ-trang-chủ--nghiệp-vụ)
8. [Checklist Kiểm thử & Quy trình Triển khai (Deploy)](#8-checklist-kiểm-thử--quy-trình-triển-khai-deploy)
9. [Các Lỗi Thường Gặp & Cách Khắc Phục (Troubleshooting)](#9-các-lỗi-thường-gặp--cách-khắc-phục-troubleshooting)

---

## 🏛️ 1. TỔNG QUAN KIẾN TRÚC & TRIẾT LÝ THIẾT KẾ

Codebase được thiết kế theo mô hình **Monorepo thu gọn (All-in-one)** tối ưu cho việc vận hành độc lập, tải nhanh và dễ dàng chuyển giao:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT / BROWSER                              │
│  React 18 SPA (Vite) + Design Tokens + PWA Service Worker + Song ngữ   │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ REST API (/api/*)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        NODE.JS / EXPRESS BACKEND                       │
│  - Phân quyền 5 cấp (Admin, Member, Creator, Organizer, Guest)         │
│  - JWT & Session Auth đa bảng                - API Vé & Soát vé QR     │
│  - Tự động duyệt Hội viên Silver             - API Leads Tư vấn        │
│  - Tích hợp AI Gemini 3 Flash / Flash 2.5    - API Bài viết, Chuyên mục│
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │ Pool Connection                 │ OpenRouter / Google SDK
                   ▼                                 ▼
      ┌─────────────────────────┐       ┌────────────────────────┐
      │   MySQL 8.0 / MariaDB   │       │ Google Gemini AI Flash │
      │ (16 bảng, schema.sql)   │       │   (RAG Knowledge Base) │
      └─────────────────────────┘       └────────────────────────┘
```

### Điểm mạnh cốt lõi cần duy trì:
- **Tập trung hóa cấu hình thương hiệu**: Toàn bộ tên gọi, slogan, logo, hotline, tài khoản ngân hàng VietQR, màu sắc được quy tụ tại [frontend/src/brand.config.js](file:///frontend/src/brand.config.js) và [config/brand.config.js](file:///config/brand.config.js). Tuyệt đối không rải rác hardcode trong từng component.
- **Độc lập Styling**: Sử dụng **Vanilla CSS và Design Tokens** (`index.css`), không phụ thuộc TailwindCSS, giúp lập trình viên thoải mái sáng tạo lại giao diện mà không sợ xung đột class.
- **Hỗ trợ Song ngữ tức thì**: Cơ chế `useTranslation()` (`LanguageContext.jsx`) chuyển đổi mượt mà giữa Tiếng Việt và Tiếng Anh không cần reload trang, kèm API dịch thuật động `/api/translate`.
- **Phân quyền 5 cấp độ độc lập**: Khách (Guest), Hội viên DN (Member - **Tự động duyệt gói Silver**), Biên tập viên (Creator), Ban tổ chức & Soát vé (Organizer & Ticket Inspector), Quản trị viên (Admin).
- **Trợ lý AI Gemini tích hợp sẵn**: Hệ thống RAG tự động học dữ liệu hội viên, bài viết và sự kiện từ DB để trả lời người dùng 24/7, có lưu vết lịch sử chat (`chat_logs`).
- **PWA & Tối ưu tải trang**: Tích hợp sẵn Service Worker (`sw.js`), Web App Manifest (`manifest.json`), Code Splitting (React.lazy) và API Client có Timeout + Dữ liệu tĩnh Fallback chống treo màn hình.

---

## 📂 2. CẤU TRÚC THƯ MỤC & TRỌNG TÂM CẦN LƯU Ý

```plaintext
doanhnghiepvn-today/
├── config/
│   └── brand.config.js          ⭐ Cấu hình thương hiệu Backend, VietQR & AI Prompt
├── frontend/
│   ├── public/                  ⭐ Chứa ảnh Logo, Favicon, PWA icons, Avatar AI
│   │   ├── images/              ⭐ Chứa banner, ảnh đối tác (vib-business-card.webp)
│   │   └── img_guide/           ⭐ Ảnh chụp màn hình hướng dẫn sử dụng hệ thống
│   ├── src/
│   │   ├── brand.config.js      ⭐⭐ TRỌNG TÂM: File cấu hình thương hiệu Frontend
│   │   ├── components/          ⭐ Navbar, Footer, FloatingAIBot, SpotlightBanner, SEOHead...
│   │   ├── contexts/            ⭐ AuthContext (xác thực), LanguageContext (song ngữ), PWAContext (cài app)
│   │   ├── utils/               ⭐ api.js (Fetch an toàn có Fallback chống sập), dateUtils.js (Xử lý ngày iOS)
│   │   ├── pages/
│   │   │   ├── Home.jsx         ⭐⭐ TRỌNG TÂM: Trang chủ cần thiết kế lại
│   │   │   ├── Events.jsx       (Sự kiện & đăng ký vé QR)
│   │   │   ├── Posts.jsx        (Tin tức & bảng tin cơ hội)
│   │   │   ├── PostDetail.jsx   (Chi tiết bài viết - có cơ chế khóa xem với Khách)
│   │   │   ├── Members.jsx      (Danh bạ doanh nghiệp hội viên)
│   │   │   ├── Guide.jsx        (Hướng dẫn sử dụng toàn diện)
│   │   │   ├── MemberDashboard.jsx   (Dashboard hội viên)
│   │   │   ├── CreatorDashboard.jsx  (Dashboard ban biên tập / creator)
│   │   │   ├── OrganizerDashboard.jsx(Dashboard ban tổ chức sự kiện)
│   │   │   ├── AdminCheckin.jsx      (Quét QR / soát vé sự kiện)
│   │   │   └── ... (Admin Dashboards: Members, Posts, Events, Organizers, Creators, Leads, Categories, Config)
│   │   ├── index.css            ⭐⭐ TRỌNG TÂM: Hệ thống biến màu (Tokens) & CSS toàn cục
│   │   ├── App.jsx              (Routing hệ thống & Lazy Loading)
│   │   └── main.jsx
│   ├── index.html               ⭐ Header SEO, Meta tags, Font Google
│   └── vite.config.js           (Cấu hình build ra thư mục root /public)
├── public/                      (Thư mục chứa bundle production do Vite build ra)
│   ├── sw.js                    (PWA Service Worker)
│   └── manifest.json            (PWA Manifest)
├── scripts/
│   └── rebrand.js               (CLI Script tự động đổi tên thương hiệu)
├── .env.example                 ⭐ Mẫu biến môi trường
├── db.js                        (Kết nối MySQL Connection Pool)
├── ecosystem.config.js          (Cấu hình chạy PM2 Cluster trên VPS)
├── schema.sql                   ⭐⭐ Cấu trúc CSDL chuẩn hóa 16 bảng (Chạy khởi tạo DB)
├── server.js                    ⭐⭐ Backend Express: Cung cấp 98 REST API & AI Service
└── hand_over.md                 (Tài liệu này)
```

---

## 🎨 3. QUY TRÌNH 5 BƯỚC ĐỔI THƯƠNG HIỆU & MÀU SẮC (REBRANDING)

Khi bạn muốn biến mã nguồn này thành cổng thông tin của một **Tỉnh thành** (VD: *Đà Nẵng Today*), một **Hiệp hội** (VD: *Hiệp hội Du lịch Việt Nam*) hay một **Tập đoàn**, hãy thực hiện đúng 5 bước sau:

### Bước 1: Khai báo lại cấu hình Frontend (`frontend/src/brand.config.js`)
Mở file [frontend/src/brand.config.js](file:///frontend/src/brand.config.js) và thay đổi các trường dữ liệu:
```javascript
export const brandConfig = {
  // 1. Tên thương hiệu
  brandName: 'DaNang.today',            // Tên đầy đủ
  brandShortName: 'DaNang Today',       // Tên viết tắt
  platformName: 'DaNang Digital Hub',   // Nền tảng
  companyLegalName: 'Hiệp hội Phát triển Kinh tế & Du lịch Đà Nẵng',

  // 2. Định vị & Slogan
  slogan: 'Khám phá thành phố đáng sống — Kết nối giao thương số 1',
  tagline: 'Cổng thông tin & Xúc tiến Đầu tư TP. Đà Nẵng',
  domain: 'danang.today',
  baseUrl: 'https://danang.today',

  // 3. Logo & Hình ảnh
  logo: {
    primary: '/logo_danang.png',         // Đặt ảnh vào frontend/public/
    dark: '/logo_danang_dark.png',
    icon: '/logo_icon.png',
    favicon: '/favicon.png',
  },

  // 4. Bảng màu chủ đạo (Design Tokens)
  colors: {
    primary: '#1E63E9',        // Màu chủ đạo mới (Luminous Royal Blue)
    primaryHover: '#144CB8',
    primaryDark: '#0C3386',
    primaryLight: '#EFF6FF',
    secondary: '#0F172A',
    accent: '#00D2FF',         // Cyan / Vàng hổ phách
    gold: '#F59E0B'
  },

  // 5. Trợ lý Trí tuệ Nhân tạo AI
  aiAssistant: {
    name: 'AI Danang Assistant',
    title: 'Trợ lý AI Cố vấn Đầu tư & Điểm đến Đà Nẵng',
    welcomeMessage: 'Xin chào! Tôi là Trợ lý AI của DaNang.today...',
    systemRole: 'Bạn là trợ lý AI chuyên nghiệp về thành phố Đà Nẵng...'
  },

  // 6. Tài khoản VietQR thanh toán vé sự kiện
  bankAccount: {
    bankName: 'Techcombank',
    bankBranch: 'PGD Da Nang',
    accountNumber: '19036730021017',
    accountHolder: 'HIEP HOI DOANH NGHIEP DA NANG',
    binCode: '970407'
  },

  // 7. Liên hệ & Chân trang
  contact: {
    hotline: '0236 3888 999',
    phone: '0905 123 456',
    email: 'contact@danang.today',
    address: '123 Bạch Đằng, Quận Hải Châu, TP. Đà Nẵng',
    copyright: '© 2026 Danang.today — Nền tảng phát triển bởi ADT Quốc tế.'
  }
};
```

### Bước 2: Đồng bộ cấu hình Backend (`config/brand.config.js` & `.env`)
1. Mở file [config/brand.config.js](file:///config/brand.config.js) cập nhật các giá trị tương ứng (`appName`, `brandName`, `bankAccount`, `ai.systemPrompt`).
2. Mở file `.env` (tạo từ `.env.example`):
```env
PORT=5000
SITE_URL=https://danang.today
BRAND_NAME=DaNang.today
AI_AGENT_NAME=AI Danang Assistant
GEMINI_API_KEY=your_gemini_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=danang_today_db
```

### Bước 3: Thay thế các tài nguyên ảnh trong `frontend/public/`
Đặt các file hình ảnh mới trùng tên (hoặc đổi tên và cập nhật lại đường dẫn trong `brand.config.js`):
- `logo_doanhnghiepvn.png` ➔ Logo nền sáng của thương hiệu mới.
- `logo_doanhnghiepvn_dark.png` ➔ Logo nền tối (dùng trong Navbar / Banner tối).
- `favicon.png` / `favicon.ico` ➔ Biểu tượng Tab trình duyệt.
- `ai_robot_avatar-removebg.png` ➔ Ảnh đại diện trợ lý ảo AI.

### Bước 4: Tùy biến mã màu toàn cục trong `frontend/src/index.css`
Mở [frontend/src/index.css](file:///frontend/src/index.css), chỉnh sửa nhóm biến `:root`:
```css
:root {
  /* Thay đổi màu chủ đạo (Primary Color) - Mặc định hiện tại: Luminous Bamboo Blue */
  --primary: #1E63E9;
  --primary-glow: rgba(30, 99, 233, 0.25);
  --primary-dark: #0C3386;
  --primary-light: #EFF6FF;

  /* Font chữ thương hiệu */
  --font-title: 'Outfit', sans-serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
}
```

### Bước 5: Build và Khởi động
```bash
# 1. Khởi tạo DB nếu chưa có
mysql -u root -p danang_today_db < schema.sql

# 2. Build Frontend
cd frontend
npm install
npm run build
cd ..

# 3. Chạy Backend
npm install
node server.js
```

---

## 🗺️ 4. BẢN ĐỒ DỮ LIỆU & TÍNH NĂNG TRANG CHỦ (`Home.jsx`)

Trang chủ hiện tại ([frontend/src/pages/Home.jsx](file:///frontend/src/pages/Home.jsx)) gồm **9 phân khu chức năng (Sections)**. Khi thiết kế lại giao diện, bạn chỉ cần thay đổi cấu trúc JSX và style, **giữ nguyên phần state, hooks và xử lý logic kết nối API**:

| STT | Tên Khối (Section) | Dữ liệu / State phụ trách | Logic & Hành vi bắt buộc giữ |
| :---: | :--- | :--- | :--- |
| **1** | **Hero Banner & Search** | `searchQuery`<br>`brandConfig.slogan` | Ô tìm kiếm khi nhấn Enter hoặc bấm icon kính lúp sẽ điều hướng sang `/posts?search=...`<br>Nút CTA cuộn mượt xuống form tư vấn qua hàm `scrollToConsult()`. |
| **2** | **Sự kiện nổi bật & Countdown** | `eventsList` (từ `/api/events`)<br>`timeLeft`<br>`showRegisterModal` | Đồng hồ đếm ngược thời gian thực cho sự kiện sắp diễn ra gần nhất.<br>Nút mở Modal đăng ký vé nhanh trực tiếp trên Home (`handleRegisterSubmit` gọi `/api/events/:id/register` có kiểm tra trùng lặp). |
| **3** | **Khối Sứ mệnh Chiến lược** | Nội dung giới thiệu cơ quan / đối tác | Khối sứ mệnh đặt ngay bên dưới Sự kiện để tăng uy tín thương hiệu. |
| **4** | **6 Trụ cột Tư vấn Hỗ trợ** (`id="tu-van-linh-vuc"`) | Danh sách 6 trụ cột chuyên gia | Khi click vào từng trụ cột, gọi `scrollToConsult(pillarTitle)` để tự động cuộn xuống form và điền sẵn trường `serviceNeed`. |
| **5** | **Bảng tin & Phóng sự mới nhất** | `latestPosts` (từ `/api/posts?limit=6`)<br>`loadingPosts` | Hiển thị tin tức động từ CSDL kèm ảnh bìa, chuyên mục, ngày đăng.<br>Có cơ chế Fallback tĩnh từ `api.js` và nạp từ cache `dnvn_cached_home_posts`. |
| **6** | **Cộng đồng Hội viên tiêu biểu** | `featuredMembers` (từ `/api/members`)<br>`loadingMembers` | Hiển thị các doanh nghiệp hội viên nổi bật.<br>Có Fallback tĩnh nếu DB chưa có dữ liệu.<br>Nút mở danh bạ `/members`. |
| **7** | **Khối Đối tác chiến lược (Partner)** | Ảnh `vib-business-card.webp`<br>Link ngoài | Khối giới thiệu thẻ đối tác ngân hàng / tài chính.<br>Hiệu ứng 3D hover phát sáng, click mở link sang tab mới. |
| **8** | **Form Đăng ký Tư vấn & Hợp tác** (`id="tu-van"`) | `formData`<br>`formSubmitted`<br>`formLoading` | Form gửi dữ liệu lên endpoint **`/api/leads`**.<br>Gồm: `fullName`, `phone`, `email`, `city`, `companyName`, `serviceNeed`, `notes`, `agreeTerms`. |
| **9** | **Hỏi đáp thường gặp (FAQ)** | `activeFaq` (ID đang mở)<br>Mảng câu hỏi/trả lời | Accordion đóng/mở câu hỏi thường gặp.<br>Gợi ý câu hỏi nhanh mở Trợ lý AI `/ai-chat`. |

---

## 🎨 5. HƯỚNG DẪN CHI TIẾT THIẾT KẾ LẠI GIAO DIỆN TRANG CHỦ

Khi bạn muốn vẽ một giao diện Trang chủ hoàn toàn mới (VD: Phong cách Bento Grid, Minimalism, Dark Theme, hoặc Phong cách Tạp chí số), hãy tuân thủ các nguyên tắc sau:

### ✅ NGUYÊN TẮC VÀNG (CÁI CẦN GIỮ NGUYÊN):
1. **Giữ nguyên khối Khởi tạo (Header hooks)**:
   ```javascript
   const { role, user } = useAuth();
   const { currentLang, t } = useTranslation();
   const navigate = useNavigate();
   ```
2. **Sử dụng API Client an toàn từ `../utils/api`**:
   Sử dụng `fetchJsonWithTimeout` kèm dữ liệu Fallback (`FALLBACK_POSTS`, `FALLBACK_EVENTS`, `FALLBACK_MEMBERS`) để tránh lỗi màn hình loading vô tận nếu backend khởi động chậm.
3. **Giữ nguyên các Anchor ID**:
   - `id="tu-van"` (dành cho Form đăng ký tư vấn).
   - `id="su-kien"` (dành cho Khối sự kiện).
   - `id="tu-van-linh-vuc"` (dành cho Khối 6 trụ cột tư vấn).
4. **Endpoint gửi Form Tư vấn**: Phải gửi đến **`/api/leads`** với `companyName`, `phone`, `fullName` là các trường bắt buộc.
5. **Giữ nguyên cơ chế đa ngôn ngữ**:
   Mọi tiêu đề và văn bản hiển thị nên viết dưới dạng:
   `currentLang === 'en' ? 'English Text' : 'Văn bản Tiếng Việt'`

### 💡 CÁI BẠN ĐƯỢC TỰ DO SÁNG TẠO:
- **Bố cục (Layout)**: Bạn có thể đổi từ dạng dọc truyền thống sang dạng **Bento Grid**, bố trí thẻ bài viết dạng **Carousel (Slider)**, hoặc đổi thẻ sự kiện thành dạng **Timeline**.
- **Hero Banner**: Thay vì banner tĩnh, bạn có thể thiết kế dạng Video background, dạng 3D Canvas, hoặc dạng 2 cột (Trái text & form nhanh, Phải là mô hình đồ họa).
- **Style & Animation**: Bạn có thể viết CSS trực tiếp inline (`style={{...}}`) hoặc tạo thêm file `frontend/src/pages/HomeCustom.css` và import vào `Home.jsx`.
- **Thứ tự các Sections**: Bạn hoàn toàn có thể đảo thứ tự (VD: đưa Khối Tin tức lên trước Sự kiện, hoặc đưa Khối Đối tác lên gần Hero).

---

## 💻 6. KHUNG CODE MẪU CHUẨN (CLEAN SKELETON) CHO `Home.jsx`

Dưới đây là khung code tinh gọn chuẩn đã đấu nối sẵn 100% logic, state, và đúng endpoint API (`/api/leads`, `/api/posts`, `/api/events`, `/api/members`). Bạn có thể sao chép đoạn này để bắt đầu thiết kế giao diện mới mà không lo lỗi cú pháp hay lỗi API:

```jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingAIBot from '../components/FloatingAIBot';
import SEOHead from '../components/SEOHead';
import SpotlightBanner from '../components/SpotlightBanner';
import { brandConfig } from '../brand.config';
import { fetchJsonWithTimeout, FALLBACK_POSTS, FALLBACK_EVENTS, FALLBACK_MEMBERS } from '../utils/api';

export const Home = () => {
  const { currentLang } = useTranslation();
  const navigate = useNavigate();

  // 1. STATE DỮ LIỆU ĐỘNG TỪ BACKEND
  const [latestPosts, setLatestPosts] = useState(FALLBACK_POSTS);
  const [eventsList, setEventsList] = useState(FALLBACK_EVENTS);
  const [featuredMembers, setFeaturedMembers] = useState(FALLBACK_MEMBERS);
  const [loading, setLoading] = useState(false);

  // 2. STATE TÌM KIẾM & FORM TƯ VẤN (GỬI ĐẾN /api/leads)
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    companyName: '',
    serviceNeed: 'Tư vấn vốn & tiếp cận tín dụng',
    notes: '',
    agreeTerms: true
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // 3. FETCH DỮ LIỆU TỰ ĐỘNG CÓ TIMEOUT & RETRY
  useEffect(() => {
    let isMounted = true;
    const loadHomeData = async () => {
      try {
        const [resPosts, resEvents, resMembers] = await Promise.allSettled([
          fetchJsonWithTimeout('/api/posts?limit=6'),
          fetchJsonWithTimeout('/api/events?limit=4'),
          fetchJsonWithTimeout('/api/members?limit=3')
        ]);

        if (isMounted) {
          if (resPosts.status === 'fulfilled' && resPosts.value?.data) {
            setLatestPosts(resPosts.value.data);
          }
          if (resEvents.status === 'fulfilled' && resEvents.value?.data) {
            setEventsList(resEvents.value.data);
          }
          if (resMembers.status === 'fulfilled' && resMembers.value?.data) {
            setFeaturedMembers(resMembers.value.data);
          }
        }
      } catch (err) {
        console.warn('Lỗi tải dữ liệu trang chủ:', err);
      }
    };
    loadHomeData();
    return () => { isMounted = false; };
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/posts?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Cuộn mượt xuống form tư vấn
  const scrollToConsult = (serviceName = '') => {
    if (serviceName) setFormData(prev => ({ ...prev, serviceNeed: serviceName }));
    const el = document.getElementById('tu-van');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Xử lý gửi Form Tư vấn chuẩn endpoint /api/leads
  const handleConsultSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.companyName) {
      alert(currentLang === 'en' ? 'Please fill in Name, Phone, and Company (*)' : 'Vui lòng điền Họ tên, Số điện thoại và Tên doanh nghiệp (*)');
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
          notes: `Lĩnh vực: ${formData.serviceNeed}. Ghi chú: ${formData.notes || 'Không có'}`
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SEOHead 
        title={`${brandConfig.brandName} — ${brandConfig.slogan}`}
        description={brandConfig.description}
      />
      <SpotlightBanner />
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* ========================================================
            BẮT ĐẦU VÙNG THIẾT KẾ GIAO DIỆN MỚI CỦA BẠN TẠI ĐÂY
            ======================================================== */}

        {/* SECTION 1: HERO BANNER MỚI */}
        <section className="custom-hero-section">
          <h1>{brandConfig.brandName}</h1>
          <p>{brandConfig.slogan}</p>
          <form onSubmit={handleSearch}>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={currentLang === 'en' ? 'Search topics...' : 'Tìm kiếm nội dung...'}
            />
            <button type="submit">{currentLang === 'en' ? 'Search' : 'Tìm kiếm'}</button>
          </form>
          <button onClick={() => scrollToConsult()}>
            {currentLang === 'en' ? 'Get Consulted' : 'Đăng ký tư vấn'}
          </button>
        </section>

        {/* SECTION 2: SỰ KIỆN NỔI BẬT */}
        <section id="su-kien" className="custom-events-section">
          <h2>{currentLang === 'en' ? 'Upcoming Events' : 'Sự kiện sắp diễn ra'}</h2>
          <div className="events-grid">
            {eventsList.map(item => (
              <div key={item.id} className="event-card">
                <h3>{item.title}</h3>
                <Link to={`/events/${item.id}`}>Chi tiết</Link>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: 6 TRỤ CỘT TƯ VẤN */}
        <section id="tu-van-linh-vuc" className="custom-pillars-section">
          <h2>{currentLang === 'en' ? 'Expert Pillars' : 'Lĩnh vực tư vấn trọng điểm'}</h2>
          <button onClick={() => scrollToConsult('Tư vấn Vốn')}>Tư vấn Vốn</button>
          <button onClick={() => scrollToConsult('Ứng dụng AI')}>Ứng dụng AI</button>
        </section>

        {/* SECTION 4: BÀI VIẾT & TIN TỨC */}
        <section className="custom-posts-section">
          <h2>{currentLang === 'en' ? 'Latest Opportunities' : 'Cơ hội giao thương mới'}</h2>
          <div className="posts-grid">
            {latestPosts.map(post => (
              <div key={post.id} className="post-card">
                <h3>{post.title}</h3>
                <Link to={`/posts/${post.id}`}>Xem bài</Link>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: HỘI VIÊN TIÊU BIỂU */}
        <section className="custom-members-section">
          <h2>{currentLang === 'en' ? 'Featured Members' : 'Hội viên tiêu biểu'}</h2>
          <div className="members-grid">
            {featuredMembers.map(m => (
              <div key={m.id} className="member-card">
                <h4>{m.company_name || m.name}</h4>
                <Link to="/members">Xem hồ sơ</Link>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: FORM ĐĂNG KÝ TƯ VẤN (BẮT BUỘC CÓ ID "tu-van") */}
        <section id="tu-van" className="custom-consult-section">
          <h2>{currentLang === 'en' ? 'Register for Consultation' : 'Đăng ký tư vấn doanh nghiệp'}</h2>
          {formSubmitted ? (
            <p>✅ Đăng ký thành công! Chuyên gia sẽ liên hệ trong 24h.</p>
          ) : (
            <form onSubmit={handleConsultSubmit}>
              <input 
                placeholder="Họ và tên (*)" 
                value={formData.fullName} 
                onChange={e => setFormData({ ...formData, fullName: e.target.value })} 
                required 
              />
              <input 
                placeholder="Số điện thoại (*)" 
                value={formData.phone} 
                onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                required 
              />
              <input 
                placeholder="Tên doanh nghiệp (*)" 
                value={formData.companyName} 
                onChange={e => setFormData({ ...formData, companyName: e.target.value })} 
                required 
              />
              <button type="submit" disabled={formLoading}>
                {formLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </form>
          )}
        </section>

        {/* ========================================================
            KẾT THÚC VÙNG THIẾT KẾ GIAO DIỆN
            ======================================================== */}
      </main>

      <Footer />
      <FloatingAIBot />
    </div>
  );
};

export default Home;
```

---

## 🔌 7. DANH MỤC API BACKEND PHỤC VỤ TRANG CHỦ & NGHIỆP VỤ

Khi cần mở rộng thêm tính năng hoặc tùy biến dữ liệu trên Trang chủ, bạn có thể gọi trực tiếp các Endpoint REST API sau:

| Endpoint | Method | Tham số (Query / Body) | Dữ liệu trả về (JSON) | Mục đích sử dụng |
| :--- | :---: | :--- | :--- | :--- |
| `/api/posts` | `GET` | `limit=6`, `category`, `search` | `{ success: true, data: [...] }` | Lấy danh sách tin tức / bài viết mới nhất |
| `/api/events` | `GET` | `limit=4`, `status=upcoming` | `{ success: true, data: [...] }` | Lấy danh sách sự kiện sắp diễn ra kèm ngày giờ |
| `/api/events/:id` | `GET` | `id` (Param) | `{ success: true, data: {...} }` | Lấy chi tiết 1 sự kiện |
| `/api/events/:id/register` | `POST` | `{ fullName, phone, email, company, quantity, paymentProof }` | `{ success: true, ticketCode: "..." }` | Đăng ký vé sự kiện & nhận mã QR (Kiểm tra chống trùng) |
| `/api/events/check-account` | `POST` | `{ phone, email }` | `{ exists: true/false }` | Kiểm tra tài khoản hội viên có trùng với người đăng ký vé |
| `/api/members` | `GET` | `limit=3`, `featured=true` | `{ success: true, data: [...] }` | Lấy danh sách doanh nghiệp hội viên đã xác thực |
| **`/api/leads`** | **`POST`** | `{ fullName, phone, email, city, companyName, memberType, notes }` | `{ success: true, id: ... }` | ⭐ Gửi dữ liệu đăng ký form tư vấn Trang chủ vào CSDL |
| `/api/chat` | `POST` | `{ message, sessionId }` | `{ reply: "...", sessionId: "..." }` | Gửi câu hỏi đến Trợ lý AI Gemini Flash |
| `/api/chat/sessions` | `GET` | Không | `{ success: true, sessions: [...] }` | Lấy danh sách các phiên trò chuyện của người dùng |
| `/api/translate` | `POST` | `{ text, targetLang }` | `{ translatedText: "..." }` | Hỗ trợ dịch nhanh nội dung sang Tiếng Anh/Tiếng Việt |
| `/api/categories` | `GET` | Không | `{ success: true, data: [...] }` | Lấy danh sách chuyên mục chính & lĩnh vực con song ngữ |

---

## 🚀 8. CHECKLIST KIỂM THỬ & QUY TRÌNH TRIỂN KHAI (DEPLOY)

Sau khi hoàn tất chỉnh sửa thương hiệu hoặc thiết kế lại trang chủ, hãy thực hiện kiểm thử theo checklist sau:

### ✅ Checklist Kiểm tra Chức năng Nghiệp vụ:
1. **Kiểm tra Tìm kiếm**: Nhập từ khóa vào ô search ở Hero section ➔ Xác nhận điều hướng sang `/posts?search=...` chính xác.
2. **Kiểm tra Đếm ngược Sự kiện**: Xác nhận bộ đếm ngày / giờ / phút / giây chạy đúng thời gian thực và không bị lỗi `NaN` trên Safari iOS.
3. **Kiểm tra Form Đăng ký Tư vấn**: Điền Họ tên, Số điện thoại, Tên công ty ➔ Bấm Gửi ➔ Kiểm tra hiển thị thông báo thành công và kiểm tra bản ghi được lưu vào bảng `leads` trong MySQL.
4. **Kiểm tra Đăng ký Hội viên Tự động duyệt Silver**: Đăng ký một tài khoản mới tại `/register` với gói Silver ➔ Xác nhận tài khoản được `approved` tức thì và đăng nhập thành công vào `/member-dashboard` mà không cần duyệt thủ công.
5. **Kiểm tra Giới hạn Nội dung Khách**: Truy cập `/posts/:id` dưới tư cách khách chưa đăng nhập ➔ Xác nhận nội dung bài viết hiển thị khóa/che mờ kèm nút kêu gọi đăng nhập.
6. **Kiểm tra Đăng ký Vé Sự kiện**: Đăng ký vé thành công nhận mã QR và kiểm tra không cho phép đăng ký trùng số điện thoại/email trong cùng sự kiện.
7. **Kiểm tra Chuyển đổi Ngôn ngữ**: Bấm nút cờ Anh/Việt trên Navbar ➔ Xác nhận toàn bộ tiêu đề trang chủ đổi ngữ nghĩa tức thì.
8. **Kiểm tra Nút Hướng dẫn & Liên kết Footer**: Kiểm tra nút `Hướng dẫn sử dụng` ở Footer mở đúng trang `/guide`.

### 📦 Quy trình Build & Khởi động Chuẩn:
```bash
# 1. Khởi tạo Database đầy đủ 16 bảng từ schema.sql
mysql -u root -p ten_db_moi < schema.sql

# 2. Cài đặt dependency & build frontend
cd frontend
npm install
npm run build
cd ..

# 3. Cài đặt dependency backend và chạy server
npm install
node server.js
# Truy cập http://localhost:5000 để nghiệm thu

# 4. Khi deploy lên VPS (Production):
pm2 restart ecosystem.config.js --env production
# hoặc
pm2 start ecosystem.config.js --env production
pm2 save
```

---

## 🛠️ 9. CÁC LỖI THƯỜNG GẶP & CÁCH KHẮC PHỤC (TROUBLESHOOTING)

### 1. Lỗi gửi Form tư vấn báo lỗi hoặc 404
- **Nguyên nhân**: Gọi nhầm URL `/api/consultations` (API cũ) hoặc thiếu trường bắt buộc `companyName`, `phone`, `fullName`.
- **Cách xử lý**: Đảm bảo gọi chính xác **`POST /api/leads`** với body gồm `fullName`, `phone`, `companyName`, `memberType`.

### 2. Màn hình trắng sau khi sửa `Home.jsx`
- **Nguyên nhân**: Lỗi cú pháp JSX (chưa đóng thẻ, thiếu dấu ngoặc nhọn, hoặc truy cập thuộc tính của biến `undefined`).
- **Cách xử lý**: Mở F12 Console trên trình duyệt để đọc dòng báo lỗi cụ thể. Kiểm tra xem các biến như `item.title`, `m.company_name` có được dùng toán tử an toàn chưa (VD: `m?.company_name || ''`).

### 3. Sự kiện Countdown hiển thị `00 Ngày 00 Giờ` hoặc `NaN`
- **Nguyên nhân**: Chuỗi ngày tháng từ MySQL trả về định dạng `YYYY-MM-DD HH:mm:ss` có khoảng trắng khiến hàm `new Date()` trên iOS Safari bị lỗi.
- **Cách xử lý**: Luôn dùng hàm bọc chuyển đổi `parseEventDate(dStr)` hoặc import từ `../utils/dateUtils.js` để tự động đổi khoảng trắng thành ký tự `T` chuẩn ISO 8601 trước khi parse.

### 4. Đã sửa ảnh Logo trong `public/` nhưng web vẫn hiện ảnh cũ
- **Nguyên nhân**: Trình duyệt hoặc Service Worker (PWA) lưu cache ảnh tĩnh.
- **Cách xử lý**: Nhấn `Ctrl + F5` (hoặc `Cmd + Shift + R`) để Hard Refresh. Nếu vẫn chưa đổi, vào F12 ➔ Tab **Application** ➔ **Storage** ➔ Bấm **Clear site data**.

### 5. Lỗi kết nối Database khi chạy trên môi trường mới
- **Nguyên nhân**: File `.env` chưa có hoặc bảng CSDL chưa được khởi tạo.
- **Cách xử lý**: Kiểm tra lại file `.env`, chắc chắn đã chạy lệnh `mysql -u root -p ten_database < schema.sql` để khởi tạo cấu trúc 16 bảng chuẩn.

---

*Tài liệu này được đồng bộ và chuẩn hóa toàn diện bởi ADT Quốc tế. Vui lòng lưu trữ tệp tin này tại thư mục gốc của repository để phục vụ các đợt clone và chuyển giao dự án.*
