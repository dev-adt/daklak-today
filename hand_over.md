# 📋 TÀI LIỆU BÀN GIAO KỸ THUẬT & HƯỚNG DẪN NHÂN BẢN HỆ THỐNG
# (TECHNICAL HANDOVER & REBRANDING MANUAL FOR *.TODAY PLATFORMS)

> **Dự án chuẩn (Golden Master)**: Nền tảng Cổng thông tin, Dữ liệu, Du lịch, Đầu tư, Nông sản & Hệ sinh thái số Doanh nghiệp (`DakLak.today`)  
> **Đơn vị phát triển & bàn giao**: ADT Quốc tế  
> **Phiên bản Codebase**: Golden Master v2.6 (Tích hợp phân hệ Giá nông sản & Video thị trường 1 hàng phân trang, Top 10 KCN Podium, Top 10 Xuất khẩu 2-3-2, OpenGraph SEO SSR, Auto-clean Assets & Rebranding Tool CLI)  
> **Đối tượng sử dụng**: Lập trình viên Fullstack / Frontend / AI Coding Assistant (Antigravity, Cursor, Windsurf, Claude Code...) tiếp nhận nhân bản dự án sang các tỉnh thành/lĩnh vực mới (VD: `gialai.today`, `lamdong.today`, `phutho.today`, `nghean.today`, `danang.today`...).  
> **Mục tiêu tài liệu**: Hướng dẫn toàn diện cách **tái sử dụng 100% logic backend, CSDL và hệ thống tính năng nghiệp vụ đã được tối ưu hoàn thiện**, chỉ cần thay đổi **Cấu hình Thương hiệu, Bảng màu nhận diện, và Dữ liệu danh mục/đặc thù địa phương** là có ngay một cổng thông tin `.today` mới hoàn chỉnh trong vòng 15-30 phút.

---

## 📑 MỤC LỤC
1. [Tổng quan Kiến trúc & Nguyên lý Thiết kế Golden Master](#1-tổng-quan-kiến-trúc--nguyên-lý-thiết-kế-golden-master)
2. [Cấu trúc Thư mục Toàn dự án Mới nhất](#2-cấu-trúc-thư-mục-toàn-dự-án-mới-nhất)
3. [Quy trình 6 Bước Nhân bản Sang Web `.today` Mới (Rebranding Checklist)](#3-quy-trình-6-bước-nhân-bản-sang-web-today-mới-rebranding-checklist)
4. [Bản đồ Dữ liệu & 13 Phân khu Trang chủ (`Home.jsx`) Mới nhất](#4-bản-đồ-dữ-liệu--13-phân-khu-trang-chủ-homejsx-mới-nhất)
5. [Kiến trúc Phân hệ Giá Nông sản & Video Thị trường (1 Hàng Phân trang & Auto-Fit)](#5-kiến-trúc-phân-hệ-giá-nông-sản--video-thị-trường-1-hàng-phân-trang--auto-fit)
6. [Kiến trúc Header & Bộ chọn Đa Ngôn ngữ Chống Dịch Đè (Anti-Mistranslation)](#6-kiến-trúc-header--bộ-chọn-đa-ngôn-ngữ-chống-dịch-đè-anti-mistranslation)
7. [Cơ chế Chống Dính Cache Toàn diện & Tự Động Dọn Rác Assets](#7-cơ-chế-chống-dính-cache-toàn-diện--tự-động-dọn-rác-assets)
8. [Hạ tầng SEO OpenGraph SSR & Chia sẻ Mạng Xã hội (Zalo, Facebook, LinkedIn)](#8-hạ-tầng-seo-opengraph-ssr--chia-sẻ-mạng-xã-hội-zalo-facebook-linkedin)
9. [Cơ chế Đồng bộ Chuyên mục Tức thì (Realtime Category Sync)](#9-cơ-chế-đồng-bộ-chuyên-mục-tức-thì-realtime-category-sync)
10. [Danh mục hơn 100 API Backend Chuẩn hóa](#10-danh-mục-hơn-100-api-backend-chuẩn-hóa)
11. [Quy trình Build, Khởi tạo CSDL & Triển khai VPS (Production)](#11-quy-trình-build-khởi-tạo-csdl--triển-khai-vps-production)
12. [Các Lỗi Thường Gặp & Cách Khắc Phục (Troubleshooting)](#12-các-lỗi-thường-gặp--cách-khắc-phục-troubleshooting)

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
│  - Khối Podium Top 10 KCN + Top 10 Xuất khẩu Grid 2-3-2                       │
│  - Khối Giá nông sản hàng ngày + Video thị trường (Phân trang 1 hàng, Auto-fit)│
└──────────────────────────────────────┬────────────────────────────────────────┘
                                       │ REST API (/api/*) + SSR OpenGraph
                                       ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                         NODE.JS / EXPRESS BACKEND ENGINE                      │
│  - Phân quyền 5 cấp: Guest, Member (Auto Silver), Creator, Organizer, Admin   │
│  - JWT & Session Auth đa bảng                - API Vé & Soát vé QR thời gian  │
│  - Quản lý Ảnh bảng giá & Video thị trường  - Quản trị Leads & Báo cáo        │
│  - Cache-Control: no-store Chuyên mục        - Proxy ảnh cào /api/og-image    │
│  - SSR Meta Tag Injector (Hỗ trợ Zalo/FB)    - AI Gemini Flash RAG            │
│  - Header Cloudflare-CDN-Cache-Control: no-store (Chống dính bản build cũ)    │
└──────────────────────┬─────────────────────────────────┬──────────────────────┘
                       │ Pool Connection (mysql2)        │ Google Gemini API / OpenRouter
                       ▼                                 ▼
          ┌─────────────────────────┐       ┌────────────────────────┐
          │   MySQL 8.0 / MariaDB   │       │ Google Gemini AI Flash │
          │ (18 bảng chuẩn hóa)     │       │   (RAG Knowledge Base) │
          └─────────────────────────┘       └────────────────────────┘
```

### Các Điểm Mạnh Cốt Lõi Vượt Trội Của Codebase:
1. **Tập trung hóa cấu hình thương hiệu**: 100% thông tin nhận diện (Tên cổng thông tin, tỉnh thành, slogan, logo, màu sắc, hotline, tài khoản VietQR, AI Prompt, nông sản đặc sản) nằm tại **2 file duy nhất**: `frontend/src/brand.config.js` và `config/brand.config.js`.
2. **Công cụ Đổi Thương hiệu CLI Tự Động (`node scripts/rebrand.js`)**: Cho phép nhân bản dự án chỉ bằng 1 câu lệnh với các preset có sẵn (`gialai`, `lamdong`, `phutho`, `nghean`, `danang`, `daklak`) hoặc giao diện Wizard hỏi đáp.
3. **Độc lập Styling (Zero CSS Conflicts)**: 100% sử dụng Vanilla CSS hiện đại và Design Tokens (`index.css`, `HomeDakLak.css`), không phụ thuộc TailwindCSS, tránh lỗi purge class, lỗi xung đột specificity hay lỗi build rollup.
4. **Tự Động Dọn Rác Assets Build**: Plugin `clean-assets-dir` trong `frontend/vite.config.js` tự động dọn sạch file cũ trong `public/assets/` trước mỗi lần build, giữ số file luôn ở mức tối thiểu (~30 file).
5. **Đa ngôn ngữ 5 thứ tiếng (VI, EN, ZH, JA, KO)**:
   - Từ điển giao diện tĩnh chuyển đổi 0ms không độ trễ.
   - Tích hợp engine Google Translate ngầm dịch toàn bộ nội dung động từ cơ sở dữ liệu (tin tức, sự kiện, giới thiệu) sang tiếng Anh, Trung, Nhật, Hàn.
   - Cơ chế **cấm dịch đè (`translate="no"` / `notranslate`)** độc quyền tại thanh chọn ngôn ngữ và logo thương hiệu.
6. **Mở nội dung chi tiết bài viết công khai (SEO First)**: Khách vãng lai xem trọn vẹn nội dung bài viết mà không bị tường chắn ép đăng nhập, tối đa hóa chỉ số thu thập dữ liệu và ranking của Google Search bot.
7. **Hạ tầng OpenGraph SSR thông minh**: Dù là SPA React, link chia sẻ bài viết, sự kiện, doanh nghiệp lên **Zalo, Facebook, Skype, LinkedIn** vẫn tự động bung ảnh đại diện to, tiêu đề và tóm tắt chuẩn xác 100% nhờ engine inject meta server-side tại `server.js`.
8. **Cơ chế Chống Dính Cache Toàn diện**:
   - `PWA Service Worker` cấu hình `daklak-cache-v2`, không precache `'/'` (root), giúp client luôn nhận mã index mới.
   - Server gửi header `Cloudflare-CDN-Cache-Control: no-store` và `CDN-Cache-Control: no-store` giúp máy chủ Cloudflare Edge không bao giờ lưu đè file HTML của trang chủ.
9. **Đồng bộ danh mục thời gian thực (Zero-Cache Sync)**: Khi Admin thêm/sửa/xóa chuyên mục trong Dashboard, thanh Header ngoài trang chủ cập nhật ngay tức thì mà không cần xóa cache trình duyệt.

---

## 📂 2. CẤU TRÚC THƯ MỤC TOÀN DỰ ÁN MỚI NHẤT

```plaintext
daklak-today/
├── config/
│   └── brand.config.js              # ⭐ Cấu hình thương hiệu Backend, VietQR, AI & Chuyên mục
├── frontend/
│   ├── public/                      # Assets tĩnh Frontend
│   │   ├── images/                  # Thư mục ảnh tĩnh
│   │   ├── logo_icon.png            # Logo icon thương hiệu
│   │   ├── favicon.png              # Favicon tab trình duyệt
│   │   └── sw.js                    # Service Worker PWA (daklak-cache-v2)
│   ├── src/
│   │   ├── brand.config.js          # ⭐⭐ FILE CỐT LÕI CẤU HÌNH THƯƠNG HIỆU FRONTEND
│   │   ├── components/              # Các UI Component độc lập
│   │   │   ├── Navbar.jsx           # Header Sticky 72px 1 hàng, đa ngôn ngữ
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
│   │   ├── pages/                   # Các trang ứng dụng chính
│   │   │   ├── Home.jsx             # ⭐ Trang chủ (13 phân khu hoàn chỉnh)
│   │   │   ├── HomeDakLak.css       # Style phân khu trang chủ (Podium grid, 2-3-2 grid)
│   │   │   ├── CoffeePrice.jsx      # ⭐ Trang chuyên mục Giá Nông sản & Video thị trường
│   │   │   ├── Posts.jsx            # Tin bài, cơ hội đầu tư & bộ lọc chuyên mục
│   │   │   ├── PostDetail.jsx       # Chi tiết bài viết (mở công khai, chuẩn SEO)
│   │   │   ├── Events.jsx           # Danh sách sự kiện & đặt vé QR
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
│   │   │   ├── AdminCoffee.jsx      # ⭐ Quản trị Giá Nông sản & Video (Phân trang 1 hàng, sắp xếp STT)
│   │   │   └── Admin*.jsx           # Cụm màn hình Admin (Members, Posts, Events, Categories, Leads...)
│   │   ├── utils/
│   │   │   ├── api.js               # Client fetch an toàn có timeout & dữ liệu fallback
│   │   │   ├── dateUtils.js         # Chuẩn hóa ngày giờ chuẩn ISO cho Safari iOS
│   │   │   ├── videoUtils.js        # ⭐ Xử lý link nhúng, thumbnail auto-fetch, auto-detect tỷ lệ video
│   │   │   └── compressImageForUpload.js # Nén ảnh client trước khi tải lên
│   │   ├── index.css                # Design Tokens màu sắc, typography toàn cục
│   │   ├── App.jsx                  # Routing React Router v6 & Lazy loading
│   │   └── main.jsx                 # Entry point khởi chạy React
│   ├── index.html                   # HTML Shell chính, tích hợp silent Google Translate
│   └── vite.config.js               # Cấu hình Vite build + Tự động dọn rác public/assets
├── public/                          # Thư mục bundle production phục vụ Web server
│   ├── assets/                      # JS, CSS được nén gzip/brotli (Tối ưu ~30 file)
│   ├── uploads/                     # Thư mục chứa ảnh/tài liệu tải lên
│   ├── sw.js                        # Service Worker PWA production
│   └── manifest.json                # PWA Manifest
├── scripts/
│   └── rebrand.js                   # ⭐ CLI Script tự động nhân bản & đổi thương hiệu
├── .env.example                     # Mẫu biến môi trường
├── db.js                            # Kết nối MySQL Connection Pool
├── ecosystem.config.js              # Cấu hình PM2 Cluster trên VPS (Production)
├── nginx.conf                       # Cấu hình Nginx mẫu cho Production (No-cache HTML, 30d Assets)
├── schema.sql                       # ⭐ Cấu trúc CSDL chuẩn hóa 18 bảng kèm dữ liệu mẫu
├── server.js                        # ⭐ Backend Express API: >100 REST Endpoints, AI RAG & SSR OpenGraph
├── CODEBASE_ARCHITECTURE.md         # Tài liệu kiến trúc toàn hệ thống
├── huong_dan_deploy_vps.md          # Cẩm nang triển khai VPS chi tiết
└── hand_over.md                     # Tài liệu bàn giao & nhân bản (Tệp tin này)
```

---

## ⚡ 3. QUY TRÌNH 6 BƯỚC NHÂN BẢN SANG WEB `.TODAY` MỚI (REBRANDING CHECKLIST)

Khi bắt đầu nhân bản codebase này sang một tỉnh thành hoặc thương hiệu mới:

### Bước 1: Chạy Công cụ Đổi Thương hiệu Tự động (`scripts/rebrand.js`)
Mở Terminal tại thư mục gốc của dự án và chạy:

```bash
# Cách 1: Sử dụng preset có sẵn (gialai, lamdong, phutho, nghean, danang)
node scripts/rebrand.js --preset=gialai

# Cách 2: Chạy tương tác (Wizard hỏi đáp từng thông số)
node scripts/rebrand.js

# Cách 3: Chạy với đầy đủ tham số dòng lệnh tùy ý
node scripts/rebrand.js \
  --name="PhuTho.today" \
  --short="PhuTho" \
  --province="Phú Thọ" \
  --domain="phutho.today" \
  --slogan="Về miền Đất Tổ • Kết nối giao thương" \
  --company="Cổng thông tin & Xúc tiến Đầu tư Phú Thọ" \
  --color="#B91C1C" \
  --ai="AI Phú Thọ Assistant" \
  --hotline="0210 3888 999" \
  --email="contact@phutho.today"
```

Script sẽ tự động cập nhật đồng bộ các file:
- `frontend/src/brand.config.js`
- `config/brand.config.js`
- `package.json`
- `ecosystem.config.js`
- `.env.example`
- `frontend/index.html`
- `public/manifest.json`

### Bước 2: Thay thế File Logo & Biểu trưng Mới
Đặt các file hình ảnh nhận diện của tỉnh thành mới vào `frontend/public/` và `public/`:
- `logo_daklak.png` ➔ Logo ngang nền sáng
- `logo_daklak_dark.png` ➔ Logo ngang nền tối (dùng trên thanh Header)
- `logo_icon.png` ➔ Icon vuông biểu trưng
- `favicon.png` / `favicon.svg` ➔ Favicon tab trình duyệt

### Bước 3: Cấu hình File Môi trường `.env`
Sao chép `.env.example` thành `.env`:
```bash
cp .env.example .env
```
Cập nhật các thông số `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `PORT`, và `GEMINI_API_KEY`.

### Bước 4: Khởi tạo Cơ sở Dữ liệu MySQL
```bash
mysql -u root -p -e "CREATE DATABASE ten_db_moi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p ten_db_moi < schema.sql
```
*(CSDL được khởi tạo 18 bảng với tài khoản Admin mặc định: `admin` / `admin123`).*

### Bước 5: Cập nhật Chuyên mục hoặc Đặc sản Địa phương (Nếu cần)
Nếu tỉnh thành mới có đặc sản chủ lực khác (ví dụ: Chè, Hồ tiêu, Sầu riêng, Bưởi, Cam):
- Cập nhật trường `specialty` trong `config/brand.config.js` và `frontend/src/brand.config.js`.
- Đăng nhập trang Admin (`/admin-coffee` hoặc `/admin-categories`) để tải ảnh bảng giá và thêm video thị trường tương ứng.

### Bước 6: Biên dịch Frontend & Khởi chạy Máy chủ
```bash
# 1. Biên dịch frontend (tự động dọn rác public/assets)
npm run build --prefix frontend

# 2. Khởi chạy backend
node server.js
# Hoặc trên VPS chạy bằng PM2:
pm2 start ecosystem.config.js
```

---

## 🗺️ 4. BẢN ĐỒ DỮ LIỆU & 13 PHÂN KHU TRANG CHỦ (`Home.jsx`) MỚI NHẤT

Trang chủ [frontend/src/pages/Home.jsx](file:///frontend/src/pages/Home.jsx) hiện tại bao gồm chuỗi **13 phân khu hoàn chỉnh**:

| STT | Phân khu (Section) | Nguồn Dữ Liệu / Logic | Đặc điểm hiển thị & Quy chuẩn UI |
| :---: | :--- | :--- | :--- |
| **1** | **Spotlight Top Banner** | Bài viết ghim từ `/api/posts?limit=5` | Tự động lấy ảnh bìa bài viết thật làm background, có tiêu đề và nút CTA "Xem chi tiết". |
| **2** | **Hero Search & AI Slider** | `brandConfig.slogan` & `searchQuery` | Tìm kiếm liên thông toàn trang; thẻ AI Special Topic Slider tự động chuyển slide mỗi 5s. |
| **3** | **Khám phá Điểm đến** | Hằng số `TOP_DESTINATIONS` (8 địa danh) | Thiết kế dạng thẻ Globe Trekker; bộ lọc Tab (Tất cả, Thác nước, Văn hóa, Sinh thái). |
| **4** | **Trụ cột Đầu tư** | Hằng số `INVESTMENT_PILLARS` | 3 khối trụ cột liên kết trực tiếp vào đúng chuyên mục tương ứng trên Header. |
| **5** | **Top 10 Khu & Cụm Công Nghiệp** | Hằng số `TOP_INDUSTRIAL_PARKS` | **Bục Podium 3 thẻ** (Top 2 bên trái, Top 1 nhô cao ở giữa, Top 3 bên phải); 2 ô thông tin độc lập (Quy mô trên - Ngành mũi nhọn dưới); **7 cụm CN còn lại xếp lưới 2-3-2** đầy đủ tên 100%. Hiển thị thuần túy không dẫn link. |
| **6** | **Top 10 Xuất khẩu Cà phê / Nông sản** | Hằng số `TOP_EXPORTERS_TAY_NGUYEN` & `WORLD` | Tab chuyển đổi Tây Nguyên và Toàn cầu; Top 3 thẻ có logo SVG thương hiệu; 7 đơn vị tiếp theo xếp lưới **2-3-2**. |
| **7** | **Sự kiện & Diễn đàn Trọng điểm** | API `/api/events?limit=4` | Đồng hồ đếm ngược; nếu chưa có sự kiện thì hiển thị trạng thái trống lịch sự và nút liên hệ hợp tác tổ chức. |
| **8** | **Doanh nghiệp Tiêu biểu** | Hằng số `FEATURED_ENTERPRISES` | Slider 7 doanh nghiệp tự động chạy mỗi 5 giây, tạm dừng khi rê chuột (hover). |
| **9** | **Tin tức & Dự án Đầu tư** | API `/api/posts?limit=6` | Grid tin bài mới nhất; bố cục chuẩn báo chí kinh tế. |
| **10** | **Bảng Giá Nông sản & Video Thị trường** | API `/api/coffee-page-data` & Admin | **1 bên ảnh bảng giá nông sản** (đồng bộ tức thì từ Admin), **1 bên tin tức thị trường**. Hàng dưới: **Video thị trường** hiển thị 1 hàng (3 video) có modal phát tự co khung hình. |
| **11** | **Form Tiếp nhận Đầu tư (Leads)** | Gửi đến endpoint **`/api/leads`** | Tiếp nhận thông tin nhu cầu đầu tư, tự động phân loại nhu cầu và lưu CSDL. |
| **12** | **FAQ Accordion & Bản đồ số** | Hằng số `FAQ_ITEMS` | Hệ thống câu hỏi thường gặp về thủ tục đầu tư, chính sách ưu đãi kèm bản đồ địa lý. |
| **13** | **Trợ lý AI Nổi (`FloatingAIBot`)** | API `/api/chat` (Gemini Flash RAG) | Nút tròn nổi cố định góc phải dưới 24/7, tự động nạp dữ liệu địa phương. |

---

## ☕ 5. KIẾN TRÚC PHÂN HỆ GIÁ NÔNG SẢN & VIDEO THỊ TRƯỜNG (1 HÀNG PHÂN TRANG & AUTO-FIT)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        QUẢN LÝ BẢNG GIÁ & VIDEO                        │
├───────────────────────────────────┬────────────────────────────────────┤
│ 1. ẢNH BẢNG GIÁ NÔNG SẢN          │ 2. VIDEO THỊ TRƯỜNG                │
│ - Tải ảnh từ máy tính hoặc dán link│ - Nhúng YouTube, FB Reels, MP4...  │
│ - Phân trang 1 hàng (4 ảnh/trang) │ - Phân trang 1 hàng (3 video/trang)│
│ - Nút ◀ Dời trước / Dời sau ▶    │ - Nút ◀ Dời trước / Dời sau ▶     │
│ - Ô nhập số thứ tự lưu tức thì    │ - Ô nhập số thứ tự lưu tức thì     │
│ - Chọn ảnh chính hiển thị Home    │ - Tự động nhận diện tỷ lệ video    │
└───────────────────────────────────┴────────────────────────────────────┘
```

1. **Hiển thị Cố định 1 Hàng & Phân trang**:
   - Quản trị viên tải nhiều ảnh hoặc nhiều video mà giao diện vẫn gọn gàng, không bị vỡ thành nhiều tầng.
   - Thao tác chuyển trang nhẹ nhàng với các nút số trang và Trước/Sau.
2. **Sắp xếp Thứ tự Hiển thị Linh hoạt**:
   - Khi không chỉnh sửa, hệ thống tự động đưa mục mới nhất lên đầu.
   - Khi cần ưu tiên mục cụ thể, Admin có thể bấm nút dời hoặc gõ số thứ tự trực tiếp.
3. **Tự động Co Khung Khử Khoảng Đen Video**:
   - Khung modal tự động đo đạc tỷ lệ thực tế từ thumbnail và kích thước nhúng.
   - Video vuông (1:1), chữ nhật ngang (16:9) hoặc video dọc (9:16, 4:5) đều được bao trọn hoàn hảo, không còn dải đen thừa ở đáy.

---

## 🧭 6. KIẾN TRÚC HEADER & BỘ CHỌN ĐA NGÔN NGỮ CHỐNG DỊCH ĐÈ

1. **Nguyên tắc 1 Hàng Duy Nhất (Single-Row Enforcement)**: Chiều cao `72px`, không gãy dòng trên mọi kích thước desktop.
2. **Tự Ngắt Dòng Chống Đè Chữ (`white-space: normal`)**: Nút chuyên mục tự rớt dòng cân đối khi tên dài mà không xô lệch các nút khác.
3. **Cơ chế Chống Dịch Đè (`translate="no"` / `notranslate`)**: Bảo vệ logo và nút chuyển ngôn ngữ không bị Google Translate dịch sai.

---

## 🛡️ 7. CƠ CHẾ CHỐNG DÍNH CACHE TOÀN DIỆN & TỰ ĐỘNG DỌN RÁC ASSETS

1. **Cloudflare & Nginx Cache Control**: Gửi header `no-store, no-cache, must-revalidate` đối với file HTML gốc, bảo đảm client luôn nhận bản mới nhất sau khi deploy.
2. **PWA Service Worker Versioning**: Phiên bản `daklak-cache-v2`, không precache root page.
3. **Tự Động Dọn Sạch Thư Mục `public/assets`**:
   - File `frontend/vite.config.js` cấu hình hook `buildStart()` tự động xóa sạch thư mục `public/assets` trước khi biên dịch chunk mới.
   - Xóa bỏ triệt để tình trạng tích tụ hàng trăm file bundle cũ không sử dụng.

---

## 🚀 8. HẠ TẦNG SEO OPENGRAPH SSR & CHIA SẺ MẠNG XÃ HỘI

Server Node.js tự động nhận diện bot mạng xã hội (Zalo, Facebook, LinkedIn, Google...) để chèn trực tiếp meta tags OpenGraph từ CSDL:
- `og:title`, `og:description`, `og:image`, `og:url`
- Kèm endpoint `/api/og-image` giúp ảnh thumbnail chia sẻ qua Zalo và Facebook luôn hiển thị kích thước lớn, sắc nét.

---

## ⚡ 9. CƠ CHẾ ĐỒNG BỘ CHUYÊN MỤC TỨC THÌ (REALTIME CATEGORY SYNC)

- Endpoint `/api/categories` cấu hình `Cache-Control: no-cache, no-store`.
- Navbar áp dụng mô hình SWR (Stale-While-Revalidate): hiển thị ngay từ local và kiểm tra bản mới ngầm qua timestamp.
- Sự kiện `categories-updated` đồng bộ dữ liệu giữa các tab ngay khi Admin thay đổi chuyên mục.

---

## 📡 10. DANH MỤC HƠN 100 API BACKEND CHUẨN HÓA

### 1. Nhóm Công khai (Public API):
- `GET /api/categories` — Lấy danh mục chính và lĩnh vực con (no-store realtime).
- `GET /api/posts` — Danh sách bài viết, tin tức (hỗ trợ phân trang, lọc chuyên mục, tìm kiếm).
- `GET /api/posts/:slug` — Chi tiết bài viết (mở công khai, chuẩn SEO).
- `GET /api/events` — Lịch sự kiện sắp diễn ra và đã hoàn thành.
- `GET /api/events/:id` — Chi tiết sự kiện và thông tin vé.
- `GET /api/members` — Danh bạ doanh nghiệp hội viên (hỗ trợ lọc hạng Silver/Gold/Diamond).
- `GET /api/coffee-page-data` — Danh sách ảnh bảng giá nông sản đang chọn & video thị trường.
- `GET /api/video-thumbnail` — Tự động lấy thumbnail gốc từ YouTube / Facebook Reels.
- `POST /api/leads` — Gửi thông tin đăng ký tư vấn xúc tiến đầu tư từ trang chủ.
- `POST /api/chat` — Hỏi đáp Trợ lý AI (Gemini Flash RAG).
- `POST /api/event-registrations` — Đăng ký vé sự kiện công khai (sinh mã QR độc nhất).

### 2. Nhóm Xác thực & Hội viên (Auth & Member API):
- `POST /api/register` — Đăng ký hội viên (Tự động duyệt gói Silver).
- `POST /api/login` — Đăng nhập đa vai trò (Member, Creator, Organizer, Admin).
- `POST /api/logout` — Đăng xuất và xóa phiên đăng nhập.
- `GET /api/member/profile` — Lấy hồ sơ doanh nghiệp hội viên hiện tại.
- `PUT /api/member/profile` — Cập nhật thông tin doanh nghiệp, MST, OCOP.
- `GET /api/member/my-tickets` — Danh sách vé sự kiện của cá nhân hội viên.

### 3. Nhóm Quản trị Admin (Admin API):
- `GET /api/admin/coffee-management` — Quản trị toàn bộ ảnh giá & video thị trường.
- `POST /api/admin/coffee-images` — Tải lên / thêm ảnh bảng giá mới.
- `PUT /api/admin/coffee-images/:id` — Cập nhật trạng thái chọn / thứ tự ảnh.
- `PUT /api/admin/coffee-images/reorder` — Sắp xếp lại thứ tự nhiều ảnh cùng lúc.
- `DELETE /api/admin/coffee-images/:id` — Xóa ảnh bảng giá.
- `POST /api/admin/coffee-videos` — Thêm video thị trường mới (tự lấy thumbnail, tỷ lệ).
- `PUT /api/admin/coffee-videos/:id` — Chỉnh sửa thông tin video & tỷ lệ khung hình.
- `PUT /api/admin/coffee-videos/reorder` — Sắp xếp lại thứ tự nhiều video cùng lúc.
- `DELETE /api/admin/coffee-videos/:id` — Xóa video thị trường.
- `GET /api/admin/members` — Danh sách hội viên (duyệt, từ chối, khóa, ghim).
- `GET /api/admin/posts` — Quản lý bài viết toàn hệ thống.
- `GET /api/admin/events` — Quản lý sự kiện và danh sách vé đăng ký.
- `POST /api/admin/checkin` — Quét mã QR soát vé thời gian thực.
- `GET /api/admin/categories` — Thêm/sửa/xóa chuyên mục song ngữ.
- `GET /api/admin/leads` — Danh sách lead khách hàng tiềm năng.
- `POST /api/upload` — Tải lên file ảnh / tài liệu (nén base64 an toàn).

---

## 🚢 11. QUY TRÌNH BUILD & TRIỂN KHAI PRODUCTION

Xem hướng dẫn chi tiết tại [huong_dan_deploy_vps.md](huong_dan_deploy_vps.md).

Tóm tắt lệnh chạy trên VPS:
```bash
# 1. Cài đặt dependencies
npm install && cd frontend && npm install && npm run build && cd ..

# 2. Khởi chạy PM2
pm2 start ecosystem.config.js && pm2 save && pm2 startup
```

---

## 🛠️ 12. CÁC LỖI THƯỜNG GẶP & CÁCH KHẮC PHỤC

1. **Thư mục `public/assets` bị đầy file cũ**:
   - *Nguyên nhân*: Các bản build cũ trước đây không có plugin dọn rác.
   - *Khắc phục*: File `frontend/vite.config.js` đã tích hợp sẵn plugin `clean-assets-dir` tự động dọn sạch trước mỗi lần build.
2. **Video Facebook Reels bị khoảng đen ở dưới**:
   - *Nguyên nhân*: Tỷ lệ video thực tế là vuông (1:1) nhưng container ép 9:16.
   - *Khắc phục*: Hệ thống hiện tại tự động đo tỷ lệ thumbnail gốc và co giãn vừa khít. Admin cũng có thể chọn thủ công tỷ lệ `1:1` trong form sửa video.
3. **Thứ tự ảnh/video không theo ý muốn**:
   - *Khắc phục*: Sử dụng nút `◀ Dời trước` / `Dời sau ▶` hoặc nhập số vào ô `Thứ tự: [ ]` trong trang Admin để định hình vị trí mong muốn.
4. **Không kết nối được Cơ sở Dữ liệu**:
   - *Khắc phục*: Kiểm tra thông tin `DB_NAME`, `DB_USER`, `DB_PASSWORD` trong file `.env` đã khớp với MySQL trên aaPanel chưa.

---

*Tài liệu Bàn giao Kỹ thuật Golden Master v2.6 — Soạn thảo và chuẩn hóa bởi Đội ngũ Kỹ thuật ADT Quốc tế.*
