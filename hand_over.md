# 📋 TÀI LIỆU BÀN GIAO KỸ THUẬT & HƯỚNG DẪN NHÂN BẢN HỆ THỐNG
# (TECHNICAL HANDOVER & REBRANDING MANUAL FOR *.TODAY PLATFORMS)

> **Dự án chuẩn (Golden Master)**: Nền tảng Cổng thông tin, Dữ liệu, Du lịch, Đầu tư & Hệ sinh thái số Doanh nghiệp (`DakLak.today`)  
> **Đơn vị phát triển & bàn giao**: ADT Quốc tế  
> **Đối tượng sử dụng**: Lập trình viên Fullstack / Frontend / AI Coding Assistant (Antigravity, Cursor, Windsurf, Claude Code...) tiếp nhận nhân bản dự án sang các tỉnh thành/lĩnh vực mới (VD: `gialai.today`, `kontum.today`, `lamdong.today`, `danang.today`...).  
> **Mục tiêu tài liệu**: Hướng dẫn toàn diện cách **tái sử dụng 100% logic backend, CSDL và hệ thống tính năng nghiệp vụ đã được tối ưu hoàn thiện**, chỉ cần thay đổi **Cấu hình Thương hiệu, Bảng màu nhận diện, và Dữ liệu danh mục** là có ngay một cổng thông tin `.today` mới hoàn chỉnh trong vòng 30 phút.

---

## 📑 MỤC LỤC
1. [Tổng quan Kiến trúc & Nguyên lý Thiết kế Golden Master](#1-tổng-quan-kiến-trúc--nguyên-lý-thiết-kế-golden-master)
2. [Cấu trúc Thư mục Toàn dự án Mới nhất](#2-cấu-trúc-thư-mục-toàn-dự-án-mới-nhất)
3. [Quy trình 5 Bước Nhân bản Sang Web `.today` Mới (Rebranding Checklist)](#3-quy-trình-5-bước-nhân-bản-sang-web-today-mới-rebranding-checklist)
4. [Kiến trúc Header & Bộ chọn Đa Ngôn ngữ Chống Dịch Đè (Anti-Mistranslation)](#4-kiến-trúc-header--bộ-chọn-đa-ngôn-ngữ-chống-dịch-đè-anti-mistranslation)
5. [Cơ chế Đồng bộ Chuyên mục Tức thì (Realtime Category Sync)](#5-cơ-chế-đồng-bộ-chuyên-mục-tức-thì-realtime-category-sync)
6. [Bản đồ Dữ liệu & Phân khu Trang chủ (`Home.jsx`)](#6-bản-đồ-dữ-liệu--phân-khu-trang-chủ-homejsx)
7. [Khung Code Mẫu Chuẩn (Clean Skeleton) cho `Home.jsx`](#7-khung-code-mẫu-chuẩn-clean-skeleton-cho-homejsx)
8. [Danh mục API Backend Chuẩn hóa](#8-danh-mục-api-backend-chuẩn-hóa)
9. [Quy trình Build, Khởi tạo CSDL & Triển khai VPS (Production)](#9-quy-trình-build-khởi-tạo-csdl--triển-khai-vps-production)
10. [Các Lỗi Thường Gặp & Cách Khắc Phục (Troubleshooting)](#10-các-lỗi-thường-gặp--cách-khắc-phục-troubleshooting)

---

## 🏛️ 1. TỔNG QUAN KIẾN TRÚC & NGUYÊN LÝ THIẾT KẾ GOLDEN MASTER

Dự án được cấu trúc theo mô hình **Monorepo thu gọn (All-in-one)**, tích hợp sẵn toàn bộ frontend React và backend Node.js Express trong một repository duy nhất:

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT / BROWSER RUNTIME                            │
│  React 18 SPA (Vite) + Design Tokens + PWA Service Worker + Dual-Lang Engine  │
│  - Sticky Header 72px (1 hàng, co giãn font 12.5px-14.5px, chống đè chữ)      │
│  - Google Translate Engine Silent Injection (dịch cả DB mà không reload)      │
│  - Trợ lý AI nổi FloatingAIBot đa phiên + Markdown Stream                     │
└──────────────────────────────────────┬────────────────────────────────────────┘
                                       │ REST API (/api/*)
                                       ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                         NODE.JS / EXPRESS BACKEND ENGINE                      │
│  - Phân quyền 5 cấp: Guest, Member (Auto Silver), Creator, Organizer, Admin   │
│  - JWT & Session Auth đa bảng                - API Vé & Soát vé QR thời gian  │
│  - Cache-Control: no-store Chuyên mục tức thì - Quản trị Leads & Báo cáo      │
│  - AI Gemini Flash RAG (Đọc dữ liệu DB hội viên, sự kiện, bài viết)           │
└──────────────────────┬─────────────────────────────────┬──────────────────────┘
                       │ Pool Connection (mysql2)        │ Google Gemini API / OpenRouter
                       ▼                                 ▼
          ┌─────────────────────────┐       ┌────────────────────────┐
          │   MySQL 8.0 / MariaDB   │       │ Google Gemini AI Flash │
          │ (16 bảng chuẩn hóa)     │       │   (RAG Knowledge Base) │
          └─────────────────────────┘       └────────────────────────┘
```

### Điểm mạnh cốt lõi của Codebase:
1. **Tập trung hóa cấu hình thương hiệu**: 90% thông tin địa phương/thương hiệu (Tên web, tỉnh thành, slogan, logo, màu sắc, hotline, tài khoản VietQR, AI Prompt) nằm tại **2 file duy nhất**: `frontend/src/brand.config.js` và `config/brand.config.js`.
2. **Độc lập Styling (Zero CSS Conflicts)**: 100% sử dụng Vanilla CSS hiện đại và Design Tokens (`index.css`), không phụ thuộc TailwindCSS, tránh lỗi build xung đột thư viện hay class purge.
3. **Đa ngôn ngữ 5 thứ tiếng (VI, EN, ZH, JA, KO)**:
   - Từ điển giao diện tĩnh chuyển đổi 0ms không độ trễ.
   - Tích hợp engine Google Translate ngầm dịch toàn bộ nội dung động từ cơ sở dữ liệu (tin tức, sự kiện, giới thiệu) sang tiếng Anh, Trung, Nhật, Hàn.
   - Có cơ chế **cấm dịch đè (`translate="no"` / `notranslate`)** độc quyền tại thanh chọn ngôn ngữ và logo thương hiệu, loại bỏ triệt để hiện tượng mã quốc tế biến thành chữ tiếng Việt (như chữ "Chúng tôi").
4. **Mở nội dung chi tiết bài viết công khai**: Khách vãng lai xem trọn vẹn nội dung bài viết mà không bị tường chắn ép đăng nhập, tối đa hóa chỉ số SEO Google.
5. **Đồng bộ danh mục thời gian thực (Zero-Cache Sync)**: Khi Admin thêm/sửa/xóa chuyên mục trong Dashboard, thanh Header ngoài trang chủ cập nhật ngay tức thì mà không cần xóa cache trình duyệt.

---

## 📂 2. CẤU TRÚC THƯ MỤC TOÀN DỰ ÁN MỚI NHẤT

```plaintext
daklak-today/
├── config/
│   └── brand.config.js              # ⭐ Cấu hình thương hiệu Backend, VietQR & AI Prompt
├── frontend/
│   ├── public/                      # Assets tĩnh Frontend
│   │   ├── images/                  # Ảnh banner, đối tác, ảnh minh họa
│   │   ├── img_guide/               # Ảnh tài liệu hướng dẫn sử dụng
│   │   ├── logo_icon.svg            # Logo icon vector
│   │   ├── logo_icon.png            # Logo icon png
│   │   ├── favicon.svg / .png       # Favicon tab trình duyệt
│   │   └── pwa-192x192.png          # Biểu tượng PWA ứng dụng
│   ├── src/
│   │   ├── brand.config.js          # ⭐⭐ FILE CỐT LÕI CẤU HÌNH THƯƠNG HIỆU FRONTEND
│   │   ├── components/              # Các UI Component độc lập
│   │   │   ├── Navbar.jsx           # ⭐ Thanh Header Sticky 72px 1 hàng, đa ngôn ngữ
│   │   │   ├── Footer.jsx           # Chân trang bản quyền, liên hệ & menu điều hướng
│   │   │   ├── FloatingAIBot.jsx    # Trợ lý AI nổi cố định bên phải màn hình
│   │   │   ├── SpotlightBanner.jsx  # Banner tiêu điểm lấy ảnh bài viết tự động
│   │   │   ├── SEOHead.jsx          # Thẻ meta SEO, OpenGraph tự động
│   │   │   ├── RichTextEditor.jsx   # Soạn thảo bài viết HTML cao cấp
│   │   │   └── ProtectedRoute.jsx   # Phân quyền định tuyến bảo vệ theo Role
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx      # Quản lý đăng nhập 5 Role độc lập
│   │   │   ├── LanguageContext.jsx  # Bộ xử lý đa ngôn ngữ (VI, EN, ZH, JA, KO) & Google Translate
│   │   │   └── PWAContext.jsx       # Xử lý cài đặt ứng dụng Desktop/Mobile
│   │   ├── constants/
│   │   │   ├── categories.js        # Danh mục mặc định fallback có nhãn song ngữ
│   │   │   └── provinces.js         # Danh mục tỉnh thành Việt Nam
│   │   ├── pages/                   # Các trang ứng dụng chính
│   │   │   ├── Home.jsx             # ⭐ Trang chủ (Landing page đa phân khu)
│   │   │   ├── Posts.jsx            # Tin bài, cơ hội đầu tư & bộ lọc chuyên mục
│   │   │   ├── PostDetail.jsx       # Chi tiết bài viết (mở công khai, chuẩn SEO)
│   │   │   ├── Events.jsx           # Danh sách sự kiện & đặt vé QR chống giật dịch
│   │   │   ├── Members.jsx          # Danh bạ hồ sơ doanh nghiệp hội viên
│   │   │   ├── AIChat.jsx           # Trang trò chuyện AI chuyên sâu
│   │   │   ├── Search.jsx           # Tìm kiếm dữ liệu toàn hệ thống
│   │   │   ├── Guide.jsx            # Hướng dẫn sử dụng hệ thống
│   │   │   ├── Login.jsx            # Đăng nhập đa vai trò
│   │   │   ├── Register.jsx         # Đăng ký tài khoản hội viên (Tự duyệt Silver)
│   │   │   ├── MemberDashboard.jsx  # Quản trị hội viên doanh nghiệp
│   │   │   ├── CreatorDashboard.jsx # Quản trị biên tập viên / Creator
│   │   │   ├── OrganizerDashboard.jsx # Quản trị ban tổ chức sự kiện
│   │   │   ├── AdminCheckin.jsx     # Soát vé QR qua camera thời gian thực
│   │   │   └── Admin*.jsx           # Cụm 8 màn hình Admin (Members, Posts, Events, Categories, Leads...)
│   │   ├── utils/
│   │   │   ├── api.js               # Client fetch an toàn có timeout & dữ liệu fallback
│   │   │   └── dateUtils.js         # Chuẩn hóa ngày giờ chuẩn ISO cho Safari iOS
│   │   ├── index.css                # ⭐ Design Tokens màu sắc, typography toàn cục
│   │   ├── App.jsx                  # Routing React Router v6 & Lazy loading
│   │   └── main.jsx                 # Entry point khởi chạy React
│   ├── index.html                   # HTML Shell chính, tích hợp silent Google Translate
│   └── vite.config.js               # Cấu hình Vite build trực tiếp vào thư mục root /public
├── public/                          # Thư mục bundle production phục vụ Web server
│   ├── assets/                      # JS, CSS được nén gzip/brotli
│   ├── sw.js                        # Service Worker PWA
│   └── manifest.json                # PWA Manifest
├── scripts/
│   └── rebrand.js                   # CLI Script tự động thay đổi tên thương hiệu
├── .env.example                     # Mẫu biến môi trường
├── db.js                            # Kết nối MySQL Connection Pool
├── ecosystem.config.js              # Cấu hình PM2 Cluster trên VPS
├── schema.sql                       # ⭐⭐ Cấu trúc CSDL chuẩn hóa 16 bảng kèm dữ liệu mẫu
├── server.js                        # ⭐⭐ Backend Express API: 98 REST Endpoints & AI RAG
└── hand_over.md                     # Tài liệu bàn giao & nhân bản (Tệp tin này)
```

---

## 🎨 3. QUY TRÌNH 5 BƯỚC NHÂN BẢN SANG WEB `.TODAY` MỚI (REBRANDING CHECKLIST)

Khi nhân bản codebase này sang một tỉnh thành hoặc thương hiệu mới (ví dụ: `gialai.today`, `kontum.today`, `danang.today`), bạn chỉ cần làm theo đúng 5 bước sau:

### Bước 1: Khai báo lại cấu hình Frontend (`frontend/src/brand.config.js`)
Mở file [frontend/src/brand.config.js](file:///frontend/src/brand.config.js) và cập nhật thông tin địa phương mới:

```javascript
export const brandConfig = {
  // 1. Tên nhận diện thương hiệu
  brandName: 'GiaLai.today',
  brandShortName: 'Gia Lai Today',
  platformName: 'Gia Lai Digital Investment & Data Hub',
  companyLegalName: 'Cổng thông tin & Xúc tiến Đầu tư tỉnh Gia Lai',

  // 2. Định vị & Khẩu hiệu địa phương
  slogan: 'Khám phá Đại ngàn — Kết nối Doanh nghiệp & Đầu tư Toàn cầu',
  tagline: 'Cổng thông tin kinh tế, nông nghiệp số và dữ liệu tỉnh Gia Lai',
  domain: 'gialai.today',
  baseUrl: 'https://gialai.today',

  // 3. Hình ảnh đại diện
  logo: {
    primary: '/logo_gialai.png',
    dark: '/logo_gialai_dark.png',
    icon: '/logo_icon.svg',
    favicon: '/favicon.svg'
  },

  // 4. Bảng màu chủ đạo (Tùy biến theo bản sắc địa phương)
  // Ví dụ: Gia Lai chọn Xanh Đại ngàn (#1B6B40) hoặc Nâu Đất Đỏ (#7A3E1D)
  colors: {
    primary: '#1B6B40',
    primaryHover: '#145331',
    primaryDark: '#0D3820',
    primaryLight: '#E8F5ED',
    gold: '#D5A33F',
    accent: '#F3C562'
  },

  // 5. Trợ lý Trí tuệ Nhân tạo AI
  aiAssistant: {
    name: 'Gia Lai AI Assistant',
    title: 'Trợ lý AI Cố vấn Dữ liệu & Đầu tư Gia Lai',
    welcomeMessage: 'Xin chào! Tôi là Trợ lý AI của GiaLai.today...',
    systemRole: 'Bạn là chuyên gia tư vấn đầu tư, dữ liệu kinh tế và văn hóa tỉnh Gia Lai...'
  },

  // 6. Tài khoản ngân hàng VietQR (dành cho thu phí vé sự kiện/hội viên)
  bankAccount: {
    bankName: 'Vietcombank',
    bankBranch: 'Chi nhánh Gia Lai',
    accountNumber: '1023456789',
    accountHolder: 'CONG TY CP CONG NGHE GIA LAI TODAY',
    binCode: '970436'
  },

  // 7. Thông tin liên hệ Footer
  contact: {
    hotline: '0269 3888 999',
    phone: '0905 888 999',
    email: 'banbientap@gialai.today',
    address: 'TP. Pleiku, Tỉnh Gia Lai, Việt Nam',
    copyright: '© 2026 GiaLai.today — Phát triển trên nền tảng Today Platform.'
  }
};
export default brandConfig;
```

### Bước 2: Đồng bộ cấu hình Backend (`config/brand.config.js` & `.env`)
1. Mở file [config/brand.config.js](file:///config/brand.config.js) và đồng bộ các trường `appName`, `brandName`, `bankAccount`, `ai.systemPrompt` tương ứng với tỉnh thành mới.
2. Sao chép `.env.example` thành `.env` và khai báo:
```env
PORT=5000
SITE_URL=https://gialai.today
BRAND_NAME=GiaLai.today
AI_AGENT_NAME=Gia Lai AI Assistant
GEMINI_API_KEY=your_gemini_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=gialai_today_db
```

### Bước 3: Thay đổi bảng màu Design Tokens trong `frontend/src/index.css`
Mở [frontend/src/index.css](file:///frontend/src/index.css), cập nhật các mã màu thương hiệu ở thẻ `:root`:
```css
:root {
  /* Màu chủ đạo thương hiệu (Primary) */
  --primary: #1B6B40;
  --primary-hover: #145331;
  --primary-dark: #0D3820;
  --primary-light: #E8F5ED;

  /* Màu vàng ánh kim bổ trợ (Gold Accent) */
  --gold: #D5A33F;
  --gold-glow: rgba(213, 163, 63, 0.35);

  /* Nền Header Navbar */
  --header-bg: #1B120C;
  --header-border: rgba(213, 163, 63, 0.35);
}
```

### Bước 4: Thay thế ảnh Icon, Logo & Favicon trong `frontend/public/`
- Đặt file `logo_icon.svg` hoặc `logo_icon.png` mới vào `frontend/public/`.
- Đặt `favicon.svg` và `favicon.png` đại diện cho biểu trưng tỉnh thành mới.
- Đặt ảnh đại diện AI `ai_robot_avatar-removebg.png` (nếu có nhân vật đại sứ AI riêng).

### Bước 5: Cập nhật Chuyên mục Mặc định trong CSDL (`schema.sql`)
Mở file [schema.sql](file:///schema.sql), cập nhật bảng `categories` và `sub_categories` phù hợp với địa phương (VD: Cà phê Pleiku, Tiêu Gia Lai, Du lịch Biển Hồ, Dự án Điện gió...).

---

## 🧭 4. KIẾN TRÚC HEADER & BỘ CHỌN ĐA NGÔN NGỮ CHỐNG DỊCH ĐÈ

Header của hệ thống (`frontend/src/components/Navbar.jsx`) đã được hoàn thiện đạt tiêu chuẩn cao cấp:

### 1. Bảng quy chuẩn kích thước Header & Typography:
- **Nguyên tắc bất biến**: Thanh Header **luôn nằm trên 1 hàng duy nhất** (không bao giờ tách thành 2 tầng gây vỡ layout).
- **Cơ chế chống đè chữ**: Chữ của chuyên mục sử dụng `white-space: normal; text-align: center; line-height: 1.25;`. Nếu tên chuyên mục dài (VD: *"Doanh nghiệp & Sản phẩm"*), chữ sẽ tự động xuống 2 dòng cân xứng ở giữa nút bấm mà không chạm hoặc đè vào các nút lân cận.
- **Kích thước thích ứng (Responsive Tiers)**:
  - **Màn hình lớn (> 1400px)**: Chiều cao `72px`, cỡ chữ `14.5px`, độ đậm `font-weight: 650`, `max-width: 145px`, padding `6px 10px`.
  - **Laptop tiêu chuẩn (1201px – 1400px)**: Chiều cao `70px`, cỡ chữ `13.5px`, độ đậm `font-weight: 650`, `max-width: 125px`, padding `5px 8px`.
  - **Laptop nhỏ / Màn hình hẹp (1081px – 1200px)**: Chiều cao `68px`, cỡ chữ `12.5px`, độ đậm `font-weight: 600`, `max-width: 110px`, padding `4px 6px`.
  - **Tablet & Mobile (≤ 1080px)**: Chiều cao `62px`, chuyên mục chuyển vào Drawer trượt với kích thước `15px` tiện chạm cảm ứng.

### 2. Cơ chế Chống Dịch Đè (Anti-Mistranslation) độc quyền:
* **Vấn đề đã triệt tiêu**: Khi người dùng dịch sang tiếng Anh hoặc đổi về tiếng Việt, công cụ dịch của Google Translate quét toàn bộ DOM. Các chữ viết tắt ngôn ngữ tiếng Anh như `US` hay `EN` nếu không bảo vệ sẽ bị dịch sang tiếng Việt thành chữ **"Chúng tôi"** (do từ `us` trong tiếng Anh có nghĩa là chúng tôi).
* **Giải pháp áp dụng trên Codebase**:
  - Toàn bộ khối bộ chọn ngôn ngữ, nút bấm, thẻ span nhãn (`VI`, `EN`, `ZH`, `JA`, `KO`) và cờ quốc kỳ được gắn cứng hai thuộc tính:
    `className="notranslate" translate="no"`
  - Khi Google Translate gặp các thẻ này, engine dịch sẽ **bỏ qua 100%**, đảm bảo các nhãn ngôn ngữ và thương hiệu giữ nguyên tuyệt đối, không bao giờ bị biến đổi nội dung.

---

## ⚡ 5. CƠ CHẾ ĐỒNG BỘ CHUYÊN MỤC TỨC THÌ (REALTIME CATEGORY SYNC)

Hệ thống danh mục đã được xóa bỏ hoàn toàn cơ chế cache đệm 2 phút của server:

1. **Backend API (`server.js`)**:
   Endpoint `GET /api/categories` phản hồi với header:
   ```http
   Cache-Control: no-cache, no-store, must-revalidate
   Pragma: no-cache
   Expires: 0
   ```
2. **Frontend Cache Busting & SWR (`Navbar.jsx`)**:
   - Khi vừa tải trang, Header đọc ngay từ `localStorage.getItem('dnvn_cached_categories')` để hiển thị trong **0ms** (không bao giờ bị giật trắng thanh menu).
   - Ngay sau đó, một background request chạy ngầm với query timestamp: `/api/categories?_t=${Date.now()}` để kiểm tra bản cập nhật mới nhất từ database.
3. **Admin Trigger Event (`AdminCategories.jsx`)**:
   Khi Quản trị viên Thêm, Sửa hoặc Xóa chuyên mục trong Dashboard, Admin gửi sự kiện:
   ```javascript
   window.dispatchEvent(new Event('categories-updated'));
   ```
   Thanh Header của tất cả các tab đang mở sẽ tự động nạp lại danh mục mới ngay lập tức mà không cần F5.

---

## 🗺️ 6. BẢN ĐỒ DỮ LIỆU & PHÂN KHU TRANG CHỦ (`Home.jsx`)

Trang chủ [frontend/src/pages/Home.jsx](file:///frontend/src/pages/Home.jsx) được tổ chức theo kiến trúc module hóa:

| Phân khu (Section) | Nguồn dữ liệu / Endpoint | Chức năng nghiệp vụ |
| :--- | :--- | :--- |
| **1. Spotlight Banner** | Bài viết ghim từ `/api/posts?limit=5` | Lấy trực tiếp ảnh bìa bài viết thật để làm nền, có nút "Xem chi tiết". |
| **2. Hero Banner & Search** | `brandConfig.slogan` & `searchQuery` | Tìm kiếm dữ liệu điều hướng `/posts?search=...`, nút CTA cuộn xuống form tư vấn. |
| **3. Dự án Trọng điểm** | Bảng tin dự án kêu gọi đầu tư | Hiển thị dạng lưới **4 cột (Desktop lớn) / 2 cột (Laptop) / 1 cột (Mobile)** cân đối, không bị lệch hàng. |
| **4. Sự kiện & Countdown** | `/api/events?limit=4` | Đồng hồ đếm ngược thời gian thực, đăng ký vé QR (có memoized content chống giật dịch). |
| **5. Tin bài & Cơ hội Giao thương** | `/api/posts?limit=6` | Tin tức mới nhất theo danh mục, hiển thị ảnh bìa, ngày đăng, chuyên mục. |
| **6. Doanh nghiệp Hội viên** | `/api/members?limit=4` | Giới thiệu doanh nghiệp hội viên tiêu biểu đã xác thực. |
| **7. Form Đăng ký Tư vấn** (`id="tu-van"`) | Gửi đến **`/api/leads`** | Tiếp nhận thông tin nhu cầu đầu tư, kết nối giao thương vào CSDL. |
| **8. Trợ lý AI Nổi (`FloatingAIBot`)** | Gửi đến `/api/chat` (Gemini Flash RAG) | Nút tròn cố định góc phải dưới, click mở modal trò chuyện trực tiếp 24/7. |

---

## 💻 7. KHUNG CODE MẪU CHUẨN (CLEAN SKELETON) CHO `Home.jsx`

Khi nhân bản sang một tỉnh thành và muốn vẽ lại phong cách giao diện khác (VD: Bento Grid, Magazine, Minimalism), bạn chỉ cần sao chép khung code mẫu chuẩn dưới đây để đảm bảo **đầy đủ 100% logic API, xử lý form và đa ngôn ngữ**:

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

  // 1. DỮ LIỆU ĐỘNG TỪ BACKEND
  const [latestPosts, setLatestPosts] = useState(FALLBACK_POSTS);
  const [eventsList, setEventsList] = useState(FALLBACK_EVENTS);
  const [featuredMembers, setFeaturedMembers] = useState(FALLBACK_MEMBERS);
  const [searchQuery, setSearchQuery] = useState('');

  // 2. DỮ LIỆU FORM TƯ VẤN (GỬI ĐẾN /api/leads)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    companyName: '',
    serviceNeed: 'Xúc tiến đầu tư & Hợp tác thương mại',
    notes: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadHomeData = async () => {
      try {
        const [resPosts, resEvents, resMembers] = await Promise.allSettled([
          fetchJsonWithTimeout('/api/posts?limit=6'),
          fetchJsonWithTimeout('/api/events?limit=4'),
          fetchJsonWithTimeout('/api/members?limit=4')
        ]);

        if (isMounted) {
          if (resPosts.status === 'fulfilled' && resPosts.value?.data) setLatestPosts(resPosts.value.data);
          if (resEvents.status === 'fulfilled' && resEvents.value?.data) setEventsList(resEvents.value.data);
          if (resMembers.status === 'fulfilled' && resMembers.value?.data) setFeaturedMembers(resMembers.value.data);
        }
      } catch (err) {
        console.warn('Lỗi nạp dữ liệu trang chủ:', err);
      }
    };
    loadHomeData();
    return () => { isMounted = false; };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/posts?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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
        const errJson = await res.json();
        alert(errJson.error || 'Có lỗi xảy ra khi gửi thông tin');
      }
    } catch (err) {
      alert('Không thể kết nối máy chủ, vui lòng thử lại.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SEOHead 
        title={`${brandConfig.brandName} — ${brandConfig.slogan}`}
        description={brandConfig.tagline}
      />
      <SpotlightBanner />
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* ========================================================
            VÙNG TỰ DO SÁNG TẠO GIAO DIỆN MỚI CỦA BẠN TẠI ĐÂY
            ======================================================== */}
        <section className="hero-section">
          <h1>{brandConfig.brandName}</h1>
          <p>{brandConfig.slogan}</p>
          <form onSubmit={handleSearch}>
            <input 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={currentLang === 'en' ? 'Search data & projects...' : 'Tìm kiếm dữ liệu, dự án...'}
            />
            <button type="submit">{currentLang === 'en' ? 'Search' : 'Tìm kiếm'}</button>
          </form>
        </section>

        {/* Form liên hệ tư vấn (Anchor ID "tu-van") */}
        <section id="tu-van" className="consult-section">
          <h2>{currentLang === 'en' ? 'Investment Connection' : 'Kết nối & Xúc tiến Đầu tư'}</h2>
          {formSubmitted ? (
            <p>✅ Đã gửi thông tin thành công! Bộ phận xúc tiến sẽ liên hệ trong 24h.</p>
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
                placeholder="Tên doanh nghiệp / Đơn vị (*)" 
                value={formData.companyName} 
                onChange={e => setFormData({ ...formData, companyName: e.target.value })} 
                required 
              />
              <button type="submit" disabled={formLoading}>
                {formLoading ? 'Đang gửi...' : 'Gửi đăng ký'}
              </button>
            </form>
          )}
        </section>
      </main>

      <Footer />
      <FloatingAIBot />
    </div>
  );
};
export default Home;
```

---

## 🔌 8. DANH MỤC API BACKEND CHUẨN HÓA

Backend Express (`server.js`) cung cấp 98 endpoints RESTful hoàn chỉnh:

| Endpoint | Phương thức | Dữ liệu gửi lên | Mục đích sử dụng |
| :--- | :---: | :--- | :--- |
| **`/api/categories`** | `GET` | Không | Lấy danh sách chuyên mục & lĩnh vực con (Header no-cache tức thì). |
| **`/api/posts`** | `GET` | `limit`, `category`, `search`, `page` | Lấy danh sách bài viết & tin tức kinh tế, đầu tư. |
| **`/api/posts/:id`** | `GET` | `id` (Param) | Chi tiết bài viết (mở công khai cho mọi người đọc). |
| **`/api/events`** | `GET` | `limit`, `status=upcoming` | Lấy danh sách hội thảo, sự kiện xúc tiến. |
| **`/api/events/:id/register`** | `POST` | `fullName`, `phone`, `email`, `quantity` | Đăng ký vé sự kiện, xuất mã vé QR và kiểm tra trùng lặp. |
| **`/api/members`** | `GET` | `limit`, `featured=true` | Lấy danh sách doanh nghiệp hội viên đã xác thực. |
| **`/api/leads`** | `POST` | `fullName`, `phone`, `companyName`, `memberType`, `notes` | Lưu thông tin yêu cầu tư vấn/đầu tư từ trang chủ vào CSDL. |
| **`/api/chat`** | `POST` | `message`, `sessionId` | Gửi câu hỏi đến Trợ lý AI Gemini Flash RAG. |
| **`/api/chat/sessions`** | `GET` | Không (dựa theo Cookie/User) | Danh sách các phiên trò chuyện của người dùng. |
| **`/api/auth/register`** | `POST` | `username`, `password`, `company_name`, `tier` | Đăng ký tài khoản (Gói Silver tự động kích hoạt ngay). |
| **`/api/auth/login`** | `POST` | `username`, `password` | Đăng nhập đa vai trò (Admin, Member, Creator, Organizer). |
| **`/api/admin/checkin`** | `POST` | `ticketCode` | Quét mã QR soát vé sự kiện thời gian thực. |

---

## 🚀 9. QUY TRÌNH BUILD, KHỞI TẠO CSDL & TRIỂN KHAI VPS (PRODUCTION)

### 1. Khởi tạo Cơ sở Dữ liệu MySQL trên VPS:
```bash
# Đăng nhập MySQL và tạo Database mới cho tỉnh thành
mysql -u root -p
CREATE DATABASE gialai_today_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Import toàn bộ cấu trúc 16 bảng và seed data chuẩn
mysql -u root -p gialai_today_db < schema.sql
```

### 2. Cài đặt Dependency & Build Frontend:
```bash
# 1. Cài đặt package backend
npm install

# 2. Cài đặt package frontend và compile bản build production
cd frontend
npm install
npm run build
cd ..
# Kết quả build sẽ được Vite xuất thẳng ra thư mục public/ của project
```

### 3. Cấu hình Vận hành PM2 Cluster:
Mở file [ecosystem.config.js](file:///ecosystem.config.js), đổi tên app tương ứng với domain mới:
```javascript
module.exports = {
  apps: [{
    name: 'gialai-today',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```
Khởi chạy dịch vụ:
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 4. Cấu hình Nginx Reverse Proxy & SSL Let's Encrypt:
Tạo file `/etc/nginx/sites-available/gialai.today`:
```nginx
server {
    server_name gialai.today www.gialai.today;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 50M;
}
```
Kích hoạt Nginx và cấp phát chứng chỉ SSL miễn phí:
```bash
ln -s /etc/nginx/sites-available/gialai.today /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d gialai.today -d www.gialai.today
```

---

## 🛠️ 10. CÁC LỖI THƯỜNG GẶP & CÁCH KHẮC PHỤC (TROUBLESHOOTING)

### 1. Nút ngôn ngữ hoặc nhãn UI bị dịch thành "Chúng tôi"
- **Nguyên nhân**: Sử dụng chữ `US` hoặc không có thuộc tính cấm dịch, khiến Google Translate hiểu nhầm `US` là đại từ nhân xưng tiếng Anh.
- **Cách xử lý**: Đảm bảo bao bọc phần hiển thị ngôn ngữ bằng `className="notranslate" translate="no"`.

### 2. Xóa chuyên mục trong Admin nhưng ngoài Trang chủ vẫn còn
- **Nguyên nhân**: Trình duyệt lưu cache API cũ hoặc trình duyệt giữ service worker.
- **Cách xử lý**: Codebase hiện tại đã cấu hình `Cache-Control: no-cache, no-store, must-revalidate` và phát sự kiện `categories-updated`. Nếu kiểm tra thấy máy khách chưa cập nhật, chỉ cần Hard Refresh (`Ctrl + F5`) một lần duy nhất.

### 3. Đồng hồ Countdown Sự kiện bị nhấp nháy hoặc hiển thị `NaN`
- **Nguyên nhân**: Định dạng ngày tháng MySQL có khoảng cách (`YYYY-MM-DD HH:mm:ss`) gây lỗi trên trình duyệt Safari iOS, hoặc React re-render xung đột với Google Translate DOM.
- **Cách xử lý**: Luôn dùng hàm bọc `parseEventDate` từ `frontend/src/utils/dateUtils.js` và cô lập logic countdown vào component con tách biệt.

### 4. Đổi Logo trong `public/` nhưng trình duyệt không nhận
- **Nguyên nhân**: Trình duyệt lưu cache ảnh tĩnh hoặc Service Worker của PWA lưu giữ bản offline.
- **Cách xử lý**: Đổi tên file ảnh (VD: `/logo_icon_v2.svg`) và cập nhật đường dẫn trong `brand.config.js`.

---

*Tài liệu này là cẩm nang tiêu chuẩn được chuyển giao độc quyền bởi ADT Quốc tế. Mọi thành viên trong nhóm dự án vui lòng tuân thủ đúng các nguyên tắc trên để việc nhân bản sang các tỉnh thành diễn ra nhanh chóng, chuẩn xác và không phát sinh lỗi.*
