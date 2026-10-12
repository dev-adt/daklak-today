# 🏗️ TÀI LIỆU KIẾN TRÚC TOÀN HỆ THỐNG (CODEBASE ARCHITECTURE)

Tài liệu này cung cấp bức tranh tổng thể về mặt kiến trúc phần mềm, luồng dữ liệu, các công nghệ sử dụng, phân quyền 5 cấp và nguyên lý hoạt động của nền tảng **Today Platform Codebase** (`doanhnghiepvn.today`).

---

## 🏛️ 1. TỔNG QUAN CÔNG NGHỆ (TECH STACK)

| Thành phần | Công nghệ / Thư viện | Vai trò |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6 | Single Page Application (SPA) tốc độ cao, Code Splitting (React.lazy) giảm >60% payload |
| **PWA & Offline** | Service Worker (`public/sw.js`), Web App Manifest, `PWAContext.jsx` | Khả năng cài đặt App lên điện thoại/máy tính, lưu cache offline tài nguyên tĩnh |
| **Styling** | Vanilla CSS, Design Tokens, Modern Glassmorphism | Thiết kế giao diện hiện đại, chuẩn UI/UX, độc lập không phụ thuộc Tailwind |
| **Song ngữ** | Instant Bilingual Engine (`LanguageContext.jsx`), `/api/translate` | Chuyển đổi ngôn ngữ tức thì Tiếng Việt / Tiếng Anh không cần reload |
| **Icons & Typography**| Tabler Icons, Google Fonts (Outfit, Plus Jakarta Sans, Inter) | Hệ thống icon sắc nét và kiểu chữ thương hiệu cao cấp |
| **Backend** | Node.js, Express.js (RESTful API) | Xử lý logic nghiệp vụ, API, bảo mật, xác thực và phục vụ SPA |
| **Database** | MySQL 8.0 / MariaDB (Pool Connection via `mysql2/promise`) | Lưu trữ CSDL quan hệ chuẩn hóa 16 bảng, tự động đồng bộ cấu trúc |
| **AI Engine** | Google Gemini API / OpenRouter (`gemini-3-flash-preview`) | Xử lý hỏi đáp thông minh, RAG tìm kiếm ngữ cảnh hội viên, bài viết & sự kiện |
| **Authentication** | JWT (JSON Web Tokens) & Session Cookies, Bcrypt | Xác thực phân quyền 5 cấp độ độc lập, an toàn |
| **Email Service** | Nodemailer (SMTP SSL/TLS 465) | Tự động gửi email cấp vé sự kiện QR, duyệt tài khoản, cấp lại mật khẩu |
| **Process Manager** | PM2 (`ecosystem.config.js`) | Quản lý tiến trình production cluster, tự động restart khi có sự cố |
| **Web Server** | Nginx Reverse Proxy & Let's Encrypt SSL | Chặn DDoS, cân bằng tải, SSL HTTPS, nén gzip |

---

## 📂 2. CẤU TRÚC THƯ MỤC DỰ ÁN

```plaintext
codebase-today/
├── config/
│   └── brand.config.js              # Cấu hình thương hiệu Backend & AI prompt
├── frontend/
│   ├── public/                      # Assets tĩnh Frontend
│   │   ├── images/                  # Ảnh banner, đối tác (vib-business-card.webp)
│   │   ├── img_guide/               # Ảnh chụp màn hình hướng dẫn sử dụng
│   │   ├── logo_doanhnghiepvn.png   # Logo chính (sáng)
│   │   ├── logo_doanhnghiepvn_dark.png # Logo nền tối
│   │   ├── logo_icon.png            # Icon vuông
│   │   └── favicon.png              # Favicon trình duyệt
│   ├── src/
│   │   ├── brand.config.js          # ⭐ CẤU HÌNH THƯƠNG HIỆU TẬP TRUNG FRONTEND
│   │   ├── components/              # Components dùng chung
│   │   │   ├── Navbar.jsx           # Thanh điều hướng đa cấp, hỗ trợ song ngữ & mobile
│   │   │   ├── Footer.jsx           # Chân trang thông tin bản quyền & liên hệ
│   │   │   ├── FloatingAIBot.jsx    # Nút bấm & Modal Trợ lý ảo AI nổi
│   │   │   ├── SpotlightBanner.jsx  # Banner tiêu điểm thông báo đầu trang
│   │   │   ├── SEOHead.jsx          # Thẻ Meta, OpenGraph tự động theo thương hiệu
│   │   │   ├── PWAInstallPrompt.jsx # Popup cài đặt ứng dụng PWA
│   │   │   ├── ProtectedRoute.jsx   # Bảo vệ định tuyến theo Role người dùng
│   │   │   ├── RichTextEditor.jsx   # Bộ soạn thảo bài viết & sự kiện
│   │   │   └── ErrorBoundary.jsx    # Bắt lỗi chống sập ứng dụng
│   │   ├── constants/               # Dữ liệu tĩnh (categories.js, provinces.js, tiers.js)
│   │   ├── contexts/                # React Contexts
│   │   │   ├── AuthContext.jsx      # Quản lý đăng nhập, phiên và vai trò (User/Member/Admin)
│   │   │   ├── LanguageContext.jsx  # Quản lý ngôn ngữ hiển thị (VI / EN)
│   │   │   └── PWAContext.jsx       # Quản lý sự kiện cài đặt PWA
│   │   ├── pages/                   # Các trang ứng dụng
│   │   │   ├── Home.jsx             # ⭐ TRANG CHỦ (Landing page đa phân khu)
│   │   │   ├── Posts.jsx            # Tin tức & Bảng tin cơ hội giao thương
│   │   │   ├── PostDetail.jsx       # Chi tiết bài viết (Kèm khóa xem cho khách)
│   │   │   ├── Events.jsx           # Sự kiện, lịch diễn đàn & đăng ký vé QR
│   │   │   ├── Members.jsx          # Danh bạ hồ sơ doanh nghiệp hội viên
│   │   │   ├── AIChat.jsx           # Giao diện trò chuyện chuyên sâu với Trợ lý AI
│   │   │   ├── Search.jsx           # Tìm kiếm tổng hợp toàn hệ thống
│   │   │   ├── Guide.jsx            # Cẩm nang hướng dẫn sử dụng hệ thống
│   │   │   ├── Login.jsx            # Đăng nhập đa vai trò
│   │   │   ├── Register.jsx         # Đăng ký tài khoản hội viên (Tự động duyệt Silver)
│   │   │   ├── MemberDashboard.jsx  # Dashboard quản trị hội viên doanh nghiệp
│   │   │   ├── CreatorDashboard.jsx # Dashboard dành cho Biên tập viên / Creator
│   │   │   ├── OrganizerDashboard.jsx # Dashboard Ban tổ chức Sự kiện
│   │   │   ├── AdminDashboard.jsx   # Dashboard Quản trị viên hệ thống
│   │   │   ├── AdminCheckin.jsx     # Giao diện quét camera QR & soát vé thời gian thực
│   │   │   ├── AdminEvents.jsx      # Quản lý sự kiện, danh sách vé & thanh toán
│   │   │   ├── AdminMembers.jsx     # Phê duyệt, quản lý hội viên doanh nghiệp
│   │   │   ├── AdminPosts.jsx       # Quản lý, duyệt bài viết trên toàn hệ thống
│   │   │   ├── AdminCategories.jsx  # Quản lý chuyên mục chính & lĩnh vực con song ngữ
│   │   │   ├── AdminCreators.jsx    # Phân quyền & tài khoản Biên tập viên
│   │   │   ├── AdminOrganizers.jsx  # Quản lý tài khoản Ban tổ chức & người soát vé
│   │   │   ├── AdminLeads.jsx       # Quản lý danh sách doanh nghiệp đăng ký tư vấn
│   │   │   └── AdminConfig.jsx      # Cấu hình AI Prompt & thông số vận hành
│   │   ├── utils/
│   │   │   ├── api.js               # API Client có Timeout, Retry & dữ liệu Fallback
│   │   │   └── dateUtils.js         # Chuẩn hóa ngày giờ chuẩn ISO cho Safari/iOS
│   │   ├── App.jsx                  # Định tuyến Routing & Lazy Loading Code-split
│   │   ├── index.css                # Biến màu Design Tokens & Style toàn cục
│   │   └── main.jsx                 # Điểm gắn kết React DOM
│   ├── index.html                   # Shell HTML chính
│   └── vite.config.js               # Cấu hình Vite build ra thư mục root /public
├── public/                          # Thư mục chứa bundle production do Vite build ra
│   ├── assets/                      # JS/CSS được compile & tối ưu
│   ├── sw.js                        # PWA Service Worker
│   └── manifest.json                # PWA Web App Manifest
├── scripts/
│   └── rebrand.js                   # CLI Tool hỗ trợ đổi tên thương hiệu tự động
├── .env.example                     # Mẫu biến môi trường chuẩn
├── db.js                            # Kết nối MySQL Connection Pool
├── ecosystem.config.js              # Cấu hình PM2 Cluster
├── schema.sql                       # ⭐ Cấu trúc CSDL chuẩn hóa 16 bảng & Seed Data
└── server.js                        # ⭐ Backend Express API: 98 REST Endpoints & AI RAG
```

---

## 🔄 3. LUỒNG DỮ LIỆU & PHÂN QUYỀN 5 CẤP (RBAC)

Hệ thống được thiết kế với **5 cấp độ / vai trò người dùng** độc lập và rõ ràng:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CÁC CẤP ĐỘ NGƯỜI DÙNG                           │
├───────────────┬─────────────────┬──────────────┬──────────────┬────────┤
│ 1. GUEST      │ 2. MEMBER       │ 3. CREATOR   │ 4. ORGANIZER │ 5.ADMIN│
│ Khách vãng lai│ Hội viên DN     │ Biên tập viên│ Ban tổ chức  │ Quản trị│
└───────────────┴─────────────────┴──────────────┴──────────────┴────────┘
```

### 1. Khách vãng lai (Public / Guest):
- Xem Trang chủ, Danh sách bài viết, Sự kiện, Danh bạ doanh nghiệp.
- **Quy tắc bảo vệ nội dung**: Khi xem chi tiết bài viết (`PostDetail.jsx`), phần nội dung nâng cao và thông tin liên hệ trực tiếp được che mờ (lock), hiển thị lời kêu gọi đăng nhập hoặc đăng ký hội viên để mở khóa.
- Trò chuyện với Trợ lý ảo AI.
- Đăng ký nhận tư vấn hợp tác doanh nghiệp qua form Trang chủ (`/api/leads`).
- Đăng ký vé sự kiện: Hỗ trợ đăng ký unauthenticated với cơ chế kiểm tra tự động trùng lặp số điện thoại/email trong cùng sự kiện.

### 2. Hội viên Doanh nghiệp (Enterprise Member - `role: 'member'`):
- Đăng ký tại `/register`: **Gói Silver được hệ thống tự động phê duyệt ngay lập tức (`status = 'approved'`)**, cho phép đăng nhập tức thì không phải chờ admin duyệt. Gói Gold/Platinum có thể chờ phê duyệt hoặc nâng cấp sau.
- Đăng nhập tại `/login`, quản trị tại `/member-dashboard`.
- Cập nhật hồ sơ năng lực, mã số thuế, sản phẩm, ngành nghề.
- Đăng bài viết, cơ hội kinh doanh, tìm kiếm đối tác.
- **Quản lý vé sự kiện cá nhân**: Vé được phân lập chặt chẽ theo `member_id`, hiển thị mã vé cá nhân và trạng thái thanh toán/check-in.

### 3. Ban Biên tập / Nhà sáng tạo nội dung (Content Creator - `role: 'creator'`):
- Đăng nhập tại `/login`, làm việc tại `/creator-dashboard`.
- Được Admin cấp tài khoản chuyên biệt trong bảng `content_creators`.
- Đăng tải bài viết chuyên môn, phóng sự doanh nghiệp, tin tức kinh tế với đầy đủ công cụ Rich Text Editor, gắn thẻ tags, chuyên mục và thời hạn.

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

## 🤖 4. CƠ CHẾ HOẠT ĐỘNG CỦA TRỢ LÝ TRÍ TUỆ NHÂN TẠO (AI AGENT)

1. **Prompt Injection & Persona**:
   - Persona được thiết lập trong `config/brand.config.js` hoặc cấu hình động tại bảng `ai_config` trong MySQL.
2. **Context Enrichment (RAG Lite Đa Nguồn)**:
   - Khi người dùng gửi câu hỏi, `server.js` tự động thu thập và gắn thêm ngữ cảnh:
     - Danh sách các doanh nghiệp hội viên đã xác thực trong bảng `members`.
     - 10 bài viết và tin tức mới nhất trong bảng `posts`.
     - Danh sách sự kiện sắp diễn ra trong bảng `events`.
     - Tài liệu mở rộng trong thư mục `knowledge_base/`.
3. **Phục vụ Đa phiên (Session Management)**:
   - Lưu trữ lịch sử hỏi đáp theo `session_id` và `member_id` trong bảng `chat_logs`.
   - Cung cấp API quản lý phiên: lấy danh sách phiên `/api/chat/sessions`, xem lịch sử `/api/chat/history/:sessionId`, xóa phiên `/api/chat/session/:sessionId`.
4. **Mô hình AI**:
   - Mặc định ưu tiên **Google Gemini 3 Flash Preview / Gemini 2.5 Flash** thông qua OpenRouter hoặc Google Gemini Direct SDK, phản hồi văn bản định dạng Markdown sinh động, chuyên sâu.

---

## 💾 5. MÔ HÌNH DỮ LIỆU CSDL (16 BẢNG CHUẨN TRONG `schema.sql`)

1. `members`: Hồ sơ doanh nghiệp hội viên (gồm cả tài khoản đăng nhập `username`, `password_hash`, gói `tier`, tự động duyệt Silver).
2. `member_sessions`: Phiên đăng nhập hội viên.
3. `admins`: Tài khoản ban quản trị hệ thống.
4. `admin_sessions`: Phiên đăng nhập quản trị viên.
5. `content_creators`: Tài khoản ban biên tập / creator.
6. `creator_sessions`: Phiên đăng nhập của creator.
7. `event_organizers`: Tài khoản ban tổ chức sự kiện & nhân viên soát vé.
8. `organizer_sessions`: Phiên đăng nhập của ban tổ chức sự kiện.
9. `posts`: Bài viết, tin tức, cơ hội giao thương (liên kết `member_id` hoặc `creator_id`).
10. `events`: Sự kiện, hội thảo, diễn đàn giao thương, giới hạn số vé, chi phí.
11. `event_registrations`: Danh sách đăng ký vé, mã vé QR độc nhất, trạng thái thanh toán, check-in.
12. `event_interests`: Danh sách quan tâm sự kiện (tương thích ngược).
13. `leads`: Dữ liệu khách hàng tiềm năng gửi từ Form đăng ký tư vấn trang chủ (`/api/leads`).
14. `categories`: Chuyên mục chính (có trường `name_en` hỗ trợ song ngữ).
15. `sub_categories`: Lĩnh vực chuyên ngành con (có trường `name_en`).
16. `ai_config`: Cấu hình API key, Model và System Prompt cho Trợ lý AI.
17. `chat_logs`: Lưu vết toàn bộ lịch sử hỏi đáp người dùng với AI.

---

## 🚀 6. QUY TRÌNH CLONE & TRIỂN KHAI CHO DỰ ÁN MỚI

Khi bạn clone repository này để xây dựng một cổng thông tin thương hiệu mới:

1. **Khởi tạo Cơ sở dữ liệu**:
   ```bash
   mysql -u root -p ten_database_moi < schema.sql
   ```
2. **Cấu hình môi trường**:
   Sao chép `.env.example` thành `.env`, điền thông tin kết nối DB, API Key và tên thương hiệu mới.
3. **Đổi thông tin nhận diện thương hiệu**:
   - Cập nhật [frontend/src/brand.config.js](file:///frontend/src/brand.config.js).
   - Cập nhật [config/brand.config.js](file:///config/brand.config.js).
   - Thay thế các logo và favicon trong [frontend/public/](file:///frontend/public/).
4. **Cài đặt thư viện & Build**:
   ```bash
   npm install
   cd frontend && npm install && npm run build && cd ..
   ```
5. **Chạy thử nghiệm**:
   ```bash
   node server.js
   ```
6. **Vận hành trên VPS Production**:
   Sử dụng Nginx reverse proxy trỏ về port 5000 và PM2 cluster:
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   ```
