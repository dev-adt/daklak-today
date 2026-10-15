# 🏗️ TÀI LIỆU KIẾN TRÚC TOÀN HỆ THỐNG (CODEBASE ARCHITECTURE)
# PLATFORM CHUẨN HOÁ: DAKLAK.TODAY & HỆ THỐNG MẪU NHÂN BẢN (*.TODAY)

Tài liệu này cung cấp bức tranh toàn cảnh về kiến trúc kỹ thuật phần mềm, luồng dữ liệu (data flow), phân quyền người dùng (RBAC), giải pháp đa ngôn ngữ độc quyền, và thiết kế tầng hiển thị của nền tảng **Today Platform Codebase** (phiên bản chuẩn hóa hiện tại: `DakLak.today`).

---

## 🏛️ 1. TỔNG QUAN CÔNG NGHỆ (TECH STACK)

| Phân tầng | Công nghệ / Thư viện | Đặc tính & Vai trò trong hệ thống |
| :--- | :--- | :--- |
| **Frontend Core** | React 18, Vite, React Router v6 | Single Page Application (SPA), Code Splitting (React.lazy) giảm >65% kích thước tải trang ban đầu. |
| **PWA & Offline** | Service Worker (`public/sw.js`), Web App Manifest | Hỗ trợ cài đặt trực tiếp thành ứng dụng di động/desktop, lưu đệm tài nguyên tĩnh ngoại tuyến. |
| **Styling & Tokens** | Vanilla CSS, CSS Custom Properties (Tokens) | Độc lập hoàn toàn, không phụ thuộc TailwindCSS, tránh lỗi xung đột class và tối ưu 100% quyền kiểm soát layout. |
| **Đa ngôn ngữ Đa tầng** | Dual-Engine: Static UI Dictionary + Silent Google Translate Engine | Chuyển đổi 5 ngôn ngữ (VI, EN, ZH, JA, KO): dịch tức thì UI tĩnh 0ms và dịch ngầm toàn bộ dữ liệu CSDL (tin tức, sự kiện) mà không cần reload trang. |
| **Typography & Icons** | Tabler Icons, Google Fonts (Be Vietnam Pro, Outfit, Plus Jakarta Sans, Inter) | Bộ font chữ hỗ trợ tiếng Việt hoàn hảo, chống gãy chữ trên mọi thiết bị. |
| **Backend Core** | Node.js, Express.js (RESTful API Engine) | 98 endpoints RESTful, phục vụ dữ liệu động, xử lý xác thực, thanh toán vé, quản lý lead và phân phối tĩnh. |
| **Database** | MySQL 8.0 / MariaDB (Pool via `mysql2/promise`) | CSDL quan hệ chuẩn hóa 16 bảng, tối ưu index, khóa ngoại và tự động duy trì kết nối pool bền bỉ. |
| **AI Intelligence** | Google Gemini API / OpenRouter (`gemini-3-flash` / `gemini-2.5-flash`) | RAG tự động nạp dữ liệu hội viên, bài viết và sự kiện từ DB để trả lời người dùng 24/7 theo ngữ cảnh địa phương. |
| **Authentication** | JWT (JSON Web Tokens) & HTTP Session Cookies, Bcrypt | Hệ thống xác thực phân quyền 5 cấp độ độc lập, an toàn. |
| **Email Service** | Nodemailer (SMTP SSL/TLS 465) | Tự động gửi email vé sự kiện có mã QR, thư xác nhận tài khoản và cấp lại mật khẩu. |
| **Process Manager** | PM2 (`ecosystem.config.js`) | Quản lý tiến trình Node.js dạng Cluster nhiều luồng, tự động khôi phục khi gặp sự cố. |
| **Web Server** | Nginx Reverse Proxy & Let's Encrypt SSL | Đảm nhiệm SSL HTTPS, nén gzip/brotli, bảo mật proxy và cân bằng tải. |

---

## 📂 2. CẤU TRÚC THƯ MỤC DỰ ÁN

```plaintext
daklak-today/
├── config/
│   └── brand.config.js              # ⭐ Cấu hình thương hiệu phía Backend & Prompt AI
├── frontend/
│   ├── public/                      # Assets tĩnh Frontend
│   │   ├── images/                  # Banner, hình ảnh đối tác & chuyên đề
│   │   ├── img_guide/               # Ảnh chụp tài liệu hướng dẫn
│   │   ├── logo_icon.svg            # Biểu trưng vector thương hiệu
│   │   ├── logo_icon.png            # Biểu trưng raster fallback
│   │   └── favicon.svg / .png       # Favicon tab trình duyệt
│   ├── src/
│   │   ├── brand.config.js          # ⭐ CẤU HÌNH THƯƠNG HIỆU TẬP TRUNG FRONTEND
│   │   ├── components/              # Các UI Components dùng chung
│   │   │   ├── Navbar.jsx           # ⭐ Header Sticky 72px 1 hàng, tự co giãn chữ & chống đè
│   │   │   ├── Footer.jsx           # Chân trang thông tin liên hệ, bản quyền & danh mục
│   │   │   ├── FloatingAIBot.jsx    # Trợ lý ảo AI nổi góc phải màn hình 24/7
│   │   │   ├── SpotlightBanner.jsx  # Banner tiêu điểm lấy ảnh bìa bài viết tự động
│   │   │   ├── SEOHead.jsx          # Thẻ meta SEO, OpenGraph tự động theo thương hiệu
│   │   │   ├── RichTextEditor.jsx   # Trình soạn thảo văn bản HTML đa phương tiện
│   │   │   └── ProtectedRoute.jsx   # Bộ bảo vệ định tuyến theo Role người dùng
│   │   ├── constants/               # Dữ liệu tĩnh (categories.js, provinces.js, tiers.js)
│   │   ├── contexts/                # React Contexts quản trị trạng thái toàn cục
│   │   │   ├── AuthContext.jsx      # Quản lý đăng nhập, phiên và 5 Role độc lập
│   │   │   ├── LanguageContext.jsx  # Quản lý 5 ngôn ngữ & điều phối Google Translate
│   │   │   └── PWAContext.jsx       # Xử lý thông báo cài đặt App PWA
│   │   ├── pages/                   # Màn hình ứng dụng
│   │   │   ├── Home.jsx             # ⭐ Trang chủ (Landing page đa phân khu)
│   │   │   ├── Posts.jsx            # Tin bài, cơ hội đầu tư & bộ lọc chuyên mục
│   │   │   ├── PostDetail.jsx       # Chi tiết bài viết (Mở công khai cho mọi độc giả)
│   │   │   ├── Events.jsx           # Lịch sự kiện, hội thảo & đăng ký vé QR
│   │   │   ├── Members.jsx          # Danh bạ doanh nghiệp hội viên
│   │   │   ├── AIChat.jsx           # Trang trò chuyện AI chuyên sâu
│   │   │   ├── Search.jsx           # Tìm kiếm dữ liệu tổng hợp
│   │   │   ├── Guide.jsx            # Hướng dẫn sử dụng hệ thống
│   │   │   ├── Login.jsx            # Đăng nhập đa vai trò
│   │   │   ├── Register.jsx         # Đăng ký tài khoản (Tự động duyệt Silver)
│   │   │   ├── MemberDashboard.jsx  # Quản trị hội viên doanh nghiệp
│   │   │   ├── CreatorDashboard.jsx # Quản trị biên tập viên / Creator
│   │   │   ├── OrganizerDashboard.jsx # Quản trị ban tổ chức sự kiện
│   │   │   ├── AdminCheckin.jsx     # Quét camera QR soát vé thời gian thực
│   │   │   └── Admin*.jsx           # Cụm 8 màn hình Admin (Members, Posts, Events, Categories, Leads...)
│   │   ├── utils/
│   │   │   ├── api.js               # Client fetch có Timeout, Retry & dữ liệu Fallback
│   │   │   └── dateUtils.js         # Chuẩn hóa ngày giờ chuẩn ISO cho Safari iOS
│   │   ├── index.css                # ⭐ Design Tokens màu sắc, typography toàn cục
│   │   ├── App.jsx                  # Routing React Router v6 & Lazy loading
│   │   └── main.jsx                 # Entry point React
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
├── schema.sql                       # ⭐ Cấu trúc CSDL chuẩn hóa 16 bảng & Seed Data
└── server.js                        # ⭐ Backend Express API: 98 REST Endpoints & AI RAG
```

---

## 🔄 3. PHÂN QUYỀN 5 CẤP ĐỘ ĐỘC LẬP (ROLE-BASED ACCESS CONTROL)

Hệ thống quản lý định danh người dùng theo **5 cấp độ / vai trò** tách biệt:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CÁC CẤP ĐỘ NGƯỜI DÙNG                           │
├───────────────┬─────────────────┬──────────────┬──────────────┬────────┤
│ 1. GUEST      │ 2. MEMBER       │ 3. CREATOR   │ 4. ORGANIZER │ 5.ADMIN│
│ Khách vãng lai│ Hội viên DN     │ Biên tập viên│ Ban tổ chức  │ Quản trị│
└───────────────┴─────────────────┴──────────────┴──────────────┴────────┘
```

### 1. Khách vãng lai (Public / Guest):
- Xem Trang chủ, Danh mục, Sự kiện, Danh bạ doanh nghiệp.
- **Nội dung bài viết mở công khai hoàn toàn (`PostDetail.jsx`)**: Khách vãng lai có thể đọc toàn văn chi tiết bài viết, xem ảnh phóng sự và tài liệu đính kèm mà không bị che mờ hay bắt buộc đăng nhập (tối ưu hóa trải nghiệm đọc và chỉ số thu thập dữ liệu của Google Search bot).
- Trò chuyện với Trợ lý AI Đắk Lắk.
- Đăng ký nhận tư vấn xúc tiến đầu tư qua form Trang chủ (`/api/leads`).
- Đăng ký vé sự kiện công khai (có cơ chế kiểm tra tự động trùng lặp số điện thoại/email trong cùng sự kiện).

### 2. Hội viên Doanh nghiệp (Enterprise Member - `role: 'member'`):
- Đăng ký tại `/register`: **Gói Silver được hệ thống tự động phê duyệt ngay lập tức (`status = 'approved'`)**, cho phép đăng nhập tức thì không phải chờ admin duyệt thủ công. Gói Gold/Platinum có thể chờ phê duyệt hoặc nâng cấp sau.
- Đăng nhập tại `/login`, quản trị tại `/member-dashboard`.
- Cập nhật hồ sơ năng lực, mã số thuế, sản phẩm OCOP, ngành nghề.
- Đăng bài viết, cơ hội đầu tư kinh doanh, tìm kiếm đối tác.
- **Quản lý vé sự kiện cá nhân**: Vé được phân lập chặt chẽ theo `member_id`, hiển thị mã vé cá nhân và trạng thái thanh toán/check-in.

### 3. Ban Biên tập / Nhà sáng tạo nội dung (Content Creator - `role: 'creator'`):
- Đăng nhập tại `/login`, làm việc tại `/creator-dashboard`.
- Được Admin cấp tài khoản chuyên biệt trong bảng `content_creators`.
- Đăng tải bài viết chuyên môn, phóng sự địa phương, tin tức kinh tế với đầy đủ công cụ Rich Text Editor, gắn thẻ tags, chuyên mục và thời hạn.

### 4. Ban Tổ chức Sự kiện & Người Soát vé (Organizer & Ticket Inspector - `role: 'organizer'`):
- Đăng nhập tại `/login`, làm việc tại `/organizer-dashboard` và `/admin/checkin` (hoặc `/organizer/checkin`).
- Quản lý danh sách sự kiện do đơn vị tổ chức.
- Xem danh sách người đăng ký vé, cập nhật trạng thái thanh toán chuyển khoản.
- **Check-in thời gian thực**: Sử dụng camera quét mã QR trên vé hoặc nhập mã vé (`ticket_code`) để điểm danh đại biểu tức thì, phòng ngừa vé giả mạo hoặc quét trùng.

### 5. Quản trị viên Hệ thống (System Admin - `role: 'admin' / 'superadmin'`):
- Toàn quyền kiểm soát tại `/admin-dashboard`.
- Quản trị hội viên (`/admin-members`): Phê duyệt, từ chối, khóa/mở khóa, ghim hội viên tiêu biểu, xử lý nâng hạng gói.
- Quản trị bài viết (`/admin-posts`): Biên tập, xuất bản, duyệt/từ chối, ghim bài nổi bật.
- Quản trị sự kiện (`/admin-events`): Tạo sự kiện, cấu hình vé có phí/miễn phí, duyệt xác nhận thanh toán.
- Quản trị chuyên mục (`/admin-categories`): Thêm/sửa/xóa chuyên mục và lĩnh vực con song ngữ.
- Quản trị leads tư vấn (`/admin-leads`): Tiếp nhận các yêu cầu tư vấn từ Form trang chủ.
- Quản trị tài khoản Creator (`/admin-creators`) & Ban tổ chức (`/admin-organizers`).
- Cấu hình hệ thống & Prompt AI (`/admin-config`).

---

## 🧭 4. KIẾN TRÚC HEADER & BỘ CHỌN ĐA NGÔN NGỮ CHỐNG DỊCH ĐÈ

Header (`frontend/src/components/Navbar.jsx`) được thiết kế theo các tiêu chuẩn khắt khe về UI/UX:

```
┌────────────────────────────────────────────────────────────────────────┐
│                              STICKY HEADER                             │
│  [Logo Icon] Brand Title  │  Cat 1  Cat 2  Cat 3  Cat 4  │ [🔍] [VI▾] [Log]│
└────────────────────────────────────────────────────────────────────────┘
```

1. **Nguyên tắc 1 Hàng Duy Nhất (Single-Row Enforcement)**:
   - Header luôn giữ cố định ở 1 hàng duy nhất (`display: flex; align-items: center; justify-content: space-between;`), không bao giờ bị gãy thành 2 tầng.
   - Chiều cao container chuẩn: **`72px`** (màn hình lớn), **`70px`** (laptop tiêu chuẩn), **`68px`** (laptop nhỏ), **`62px`** (mobile).
2. **Cơ chế Tự Ngắt Dòng Chống Đè Chữ (`white-space: normal`)**:
   - Mỗi nút chuyên mục được đặt `max-width: 145px; line-height: 1.25; text-align: center; white-space: normal;`.
   - Khi tên chuyên mục dài (ví dụ: *"Doanh nghiệp & Sản phẩm"*), chữ sẽ tự động xuống 2 dòng cân xứng ở giữa nút bấm, **tuyệt đối không đè lên nút khác và không đẩy vỡ các nút Tìm kiếm / Ngôn ngữ / Đăng nhập**.
3. **Phân tầng Typography Thích ứng**:
   - Màn hình lớn (> 1400px): `font-size: 14.5px`, `font-weight: 650`.
   - Laptop tiêu chuẩn (1201px – 1400px): `font-size: 13.5px`, `font-weight: 650`.
   - Laptop nhỏ (1081px – 1200px): `font-size: 12.5px`, `font-weight: 600`.
   - Tablet & Mobile (≤ 1080px): Ẩn thanh ngang, chuyển toàn bộ chuyên mục vào Mobile Drawer trượt với kích thước `15px`.
4. **Cơ chế Chống Dịch Đè (Anti-Mistranslation) độc quyền**:
   - Khi Google Translate quét trang, nó có xu hướng dịch cả các chuỗi viết tắt tiếng Anh (ví dụ: từ `US` dịch sang tiếng Việt thành chữ `"Chúng tôi"`).
   - Codebase giải quyết triệt để bằng việc gắn thuộc tính:
     ```html
     <div class="notranslate" translate="no">
       <span>{(currentLang || 'VI').toUpperCase()}</span>
     </div>
     ```
   - Google Translate gặp các thẻ này sẽ bỏ qua 100%, giữ nguyên vẹn ký hiệu ngôn ngữ.

---

## ⚡ 5. CƠ CHẾ ĐỒNG BỘ CHUYÊN MỤC TỨC THÌ (REALTIME CATEGORY SYNC)

Để người quản trị thêm/sửa/xóa chuyên mục trong Dashboard và người dùng thấy ngay ngoài trang chủ mà không phải chờ 2 phút như bản cũ:

1. **Loại bỏ Cache Server**:
   Endpoint `GET /api/categories` trong `server.js` cấu hình:
   ```javascript
   res.set({
     'Cache-Control': 'no-cache, no-store, must-revalidate',
     'Pragma': 'no-cache',
     'Expires': '0'
   });
   ```
2. **Tải Ngay Lập Tức 0ms bằng SWR Pattern**:
   Khi `Navbar.jsx` khởi tạo:
   - State `categoriesList` nạp ngay từ `localStorage.getItem('dnvn_cached_categories')` để hiển thị tức thì không có màn hình chờ.
   - Ngay sau đó, một background request chạy ngầm với query timestamp: `/api/categories?_t=${Date.now()}` để cập nhật phiên bản mới nhất từ database.
3. **Phát Sự Kiện Realtime Giữa Các Tab**:
   Trong `AdminCategories.jsx`, sau khi thêm hoặc xóa danh mục thành công:
   ```javascript
   window.dispatchEvent(new Event('categories-updated'));
   ```
   Tất cả các thành phần Navbar lắng nghe sự kiện này và tự động gọi lại API để đồng bộ danh mục tức thì.

---

## 🌐 6. ĐA NGÔN NGỮ ĐA TẦNG (DUAL-ENGINE TRANSLATION SYSTEM)

Hệ thống sử dụng giải pháp dịch thuật 2 tầng:

1. **Tầng 1: Từ điển Cố định (Static UI Dictionary)**:
   - File `frontend/src/contexts/LanguageContext.jsx` chứa từ điển cho 5 ngôn ngữ: Tiếng Việt (`vi`), Tiếng Anh (`en`), Tiếng Trung (`zh`), Tiếng Nhật (`ja`), Tiếng Hàn (`ko`).
   - Cung cấp hàm `t('key')` chuyển đổi tức thì 0ms cho menu, nút bấm, tiêu đề cố định.
2. **Tầng 2: Google Translate Silent Engine**:
   - Tự động kích hoạt thông qua file script ngầm trong `index.html`.
   - Hàm `applyGoogleTranslate(lang)` can thiệp cookie `googtrans` và kích hoạt select ngầm `.goog-te-combo` khi chuyển ngôn ngữ.
   - Dịch toàn bộ nội dung động lấy từ CSDL (bài viết, thông tin chi tiết sự kiện, mô tả doanh nghiệp).
3. **Khắc phục Xung đột Render (Anti-Flicker Protection)**:
   - Trong `frontend/src/pages/Events.jsx`, đồng hồ đếm ngược Countdown được tách độc lập thành component con.
   - Phần nội dung chi tiết bài viết/sự kiện được bọc trong `React.memo` với `translate="yes"`. Khi đồng hồ đếm ngược nhảy từng giây, React chỉ re-render đồng hồ, không chạm vào khối văn bản đang được Google Translate dịch, xóa bỏ hoàn toàn hiện tượng nhấp nháy giật hình.

---

## 🤖 7. TRỢ LÝ TRÍ TUỆ NHÂN TẠO (AI AGENT GEMINI FLASH RAG)

1. **Kiến trúc Trợ lý AI**:
   - Nút bấm và cửa sổ chat nổi (`FloatingAIBot.jsx`) hiển thị cố định ở góc phải dưới trên toàn bộ các trang.
   - Trang trò chuyện toàn màn hình chuyên sâu tại `/ai-chat`.
2. **RAG Context Enrichment**:
   - Khi người dùng gửi câu hỏi qua `/api/chat`, backend Express tự động thu thập:
     - Danh sách doanh nghiệp hội viên trong bảng `members`.
     - 10 bài viết, dữ liệu xúc tiến đầu tư mới nhất trong bảng `posts`.
     - Các sự kiện sắp diễn ra trong bảng `events`.
     - Dữ liệu tri thức bổ trợ trong thư mục `knowledge_base/`.
   - Bơm toàn bộ ngữ cảnh này vào prompt của Google Gemini Flash Preview, giúp AI trả lời chính xác, sát thực tế địa phương và không bị ảo giác (hallucination).
3. **Quản lý Phiên (Session Management)**:
   - Lưu trữ toàn bộ lịch sử hỏi đáp theo `session_id` trong bảng `chat_logs`.
   - Hỗ trợ đổi phiên, xóa phiên và tải lại lịch sử trò chuyện cũ.

---

## 💾 8. MÔ HÌNH DỮ LIỆU CSDL (16 BẢNG QUAN HỆ TRONG `schema.sql`)

1. `members`: Doanh nghiệp hội viên (chứa tài khoản `username`, `password_hash`, thông tin đại diện, MST, trạng thái duyệt tự động Silver).
2. `member_sessions`: Phiên đăng nhập của hội viên.
3. `admins`: Tài khoản quản trị viên hệ thống.
4. `admin_sessions`: Phiên đăng nhập quản trị viên.
5. `content_creators`: Tài khoản biên tập viên nội dung.
6. `creator_sessions`: Phiên đăng nhập của biên tập viên.
7. `event_organizers`: Tài khoản ban tổ chức sự kiện & người soát vé.
8. `organizer_sessions`: Phiên đăng nhập của ban tổ chức.
9. `posts`: Bài viết, tin tức, dữ liệu chuyên đề, dự án trọng điểm (liên kết `member_id` hoặc `creator_id`).
10. `events`: Sự kiện, hội thảo, diễn đàn, số lượng vé, giá vé.
11. `event_registrations`: Danh sách vé đã đăng ký, mã vé QR độc nhất, trạng thái thanh toán và check-in.
12. `event_interests`: Danh sách quan tâm sự kiện.
13. `leads`: Dữ liệu khách hàng tiềm năng gửi từ Form liên hệ/tư vấn trang chủ (`/api/leads`).
14. `categories`: Chuyên mục chính cấp 1 (hỗ trợ `name_en` song ngữ).
15. `sub_categories`: Lĩnh vực chuyên ngành con cấp 2 (hỗ trợ `name_en`).
16. `ai_config`: Cấu hình API key, Model và System Prompt cho Trợ lý AI.
17. `chat_logs`: Lưu vết lịch sử hỏi đáp giữa người dùng và AI.

---

## 🚀 9. QUY TRÌNH BUILD & TRIỂN KHAI PRODUCTION

```bash
# 1. Khởi tạo Cơ sở Dữ liệu từ file schema.sql
mysql -u root -p ten_database_moi < schema.sql

# 2. Cài đặt dependency & build frontend
cd frontend
npm install
npm run build
cd ..
# Vite build trực tiếp ra thư mục /public tại root

# 3. Cài đặt dependency backend
npm install

# 4. Khởi chạy cụm tiến trình PM2 Cluster
pm2 start ecosystem.config.js --env production
pm2 save

# 5. Cấu hình Nginx Reverse Proxy trỏ vào Port 5000 và kích hoạt SSL Certbot
certbot --nginx -d domain.today -d www.domain.today
```

---

*Tài liệu này được đồng bộ và kiểm thử thực tế trên phiên bản Golden Master của DakLak.today bởi ADT Quốc tế.*
