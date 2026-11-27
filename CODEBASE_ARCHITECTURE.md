# 🏗️ TÀI LIỆU KIẾN TRÚC TOÀN HỆ THỐNG (CODEBASE ARCHITECTURE)
# PLATFORM CHUẨN HOÁ: DAKLAK.TODAY & HỆ THỐNG MẪU NHÂN BẢN (*.TODAY)

Tài liệu này cung cấp bức tranh toàn cảnh về kiến trúc kỹ thuật phần mềm, luồng dữ liệu (data flow), phân quyền người dùng (RBAC), giải pháp đa ngôn ngữ độc quyền, hạ tầng SEO OpenGraph SSR, cơ chế chống dính cache đa tầng, cơ chế dọn dẹp asset tự động và thiết kế các phân khu chức năng cốt lõi của nền tảng **Today Platform Codebase** (phiên bản chuẩn hóa hiện tại: `DakLak.today` v2.6 Golden Master).

---

## 🏛️ 1. TỔNG QUAN CÔNG NGHỆ (TECH STACK)

| Phân tầng | Công nghệ / Thư viện | Đặc tính & Vai trò trong hệ thống |
| :--- | :--- | :--- |
| **Frontend Core** | React 18, Vite 8, React Router v6 | Single Page Application (SPA), Code Splitting (`React.lazy`) giảm >65% kích thước tải trang ban đầu. |
| **PWA & Offline** | Service Worker (`public/sw.js`), Web App Manifest | Cache version `daklak-cache-v2`, tách biệt root page, hỗ trợ cài đặt ứng dụng di động/desktop. |
| **Styling & Tokens** | Vanilla CSS, CSS Custom Properties (Design Tokens) | Độc lập hoàn toàn, không phụ thuộc TailwindCSS, tránh lỗi xung đột class và tối ưu 100% quyền kiểm soát layout. |
| **Asset Lifecycle** | Vite Custom Asset Cleaner (`vite.config.js`) | Tự động dọn sạch thư mục `public/assets/` trước mỗi lần build, xóa bỏ hoàn toàn hiện tượng tích tụ file rác qua các phiên bản. |
| **Đa ngôn ngữ Đa tầng** | Dual-Engine: Static UI Dictionary + Silent Google Translate Engine | Chuyển đổi 5 ngôn ngữ (VI, EN, ZH, JA, KO): dịch tức thì UI tĩnh 0ms và dịch ngầm toàn bộ dữ liệu CSDL mà không reload trang. |
| **Typography & Icons** | Tabler Icons, Font Awesome 6, Google Fonts (Be Vietnam Pro, Outfit, Plus Jakarta Sans, Inter) | Bộ font chữ hỗ trợ tiếng Việt hoàn hảo, chống gãy chữ trên mọi thiết bị. |
| **Backend Core** | Node.js, Express.js (RESTful API Engine) | Hơn 100 endpoints RESTful, phục vụ dữ liệu động, xử lý xác thực, thanh toán vé, quản lý lead, video thị trường và phân phối tĩnh. |
| **SEO SSR Engine** | Express User-Agent Inspection & Dynamic Meta Injector | Tự động chèn thẻ OpenGraph to đẹp cho Zalo, Facebook, LinkedIn crawler bots mà không cần chuyển toàn bộ app sang Next.js. |
| **Database** | MySQL 8.0 / MariaDB (Pool via `mysql2/promise`) | CSDL quan hệ chuẩn hóa 18 bảng, tối ưu index, khóa ngoại và tự động duy trì kết nối pool bền bỉ. |
| **AI Intelligence** | Google Gemini API / OpenRouter (`gemini-2.5-flash` / `gemini-1.5-flash`) | RAG tự động nạp dữ liệu hội viên, bài viết và sự kiện từ DB để trả lời người dùng 24/7 theo ngữ cảnh địa phương. |
| **Authentication** | JWT (JSON Web Tokens) & HTTP Session Cookies, Bcrypt | Hệ thống xác thực phân quyền 5 cấp độ độc lập, an toàn. |
| **Email Service** | Nodemailer (SMTP SSL/TLS 465) | Tự động gửi email vé sự kiện có mã QR, thư xác nhận tài khoản và cấp lại mật khẩu. |
| **Process Manager** | PM2 (`ecosystem.config.js`) | Quản lý tiến trình Node.js dạng Cluster/Fork, tự động khôi phục khi gặp sự cố. |
| **Web Server** | Nginx Reverse Proxy & Let's Encrypt SSL | Đảm nhiệm SSL HTTPS, nén gzip/brotli, bảo mật proxy và cân bằng tải. |

---

## 📂 2. CẤU TRÚC THƯ MỤC DỰ ÁN

```plaintext
daklak-today/
├── config/
│   └── brand.config.js              # ⭐ Cấu hình thương hiệu Backend, VietQR, AI Prompt & Chuyên mục
├── frontend/
│   ├── public/                      # Assets tĩnh nguồn phục vụ phát triển
│   │   ├── images/                  # Thư mục ảnh tĩnh
│   │   │   ├── daklak/              # Ảnh danh lam thắng cảnh, trụ cột đầu tư địa phương
│   │   │   ├── industrial/          # Logo vector SVG các Khu & Cụm công nghiệp
│   │   │   └── exporters/           # Logo vector SVG các tập đoàn xuất khẩu hàng đầu
│   │   ├── logo_icon.svg / .png     # Logo icon vector & raster
│   │   ├── favicon.svg / .png       # Favicon tab trình duyệt
│   │   └── sw.js                    # Service Worker PWA (daklak-cache-v2)
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
│   │   │   ├── HomeDakLak.css       # ⭐ Style phân khu trang chủ (Podium grid, 2-3-2 grid)
│   │   │   ├── CoffeePrice.jsx      # ⭐ Chuyên trang Giá Cà Phê, slider bảng giá & video thị trường
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
│   │   │   ├── AdminCoffee.jsx      # ⭐ Quản trị Ảnh bảng giá & Video thị trường (Phân trang 1 hàng, sắp xếp STT)
│   │   │   └── Admin*.jsx           # Cụm màn hình Admin (Members, Posts, Events, Categories, Leads...)
│   │   ├── utils/
│   │   │   ├── api.js               # Client fetch có Timeout, Retry & dữ liệu Fallback
│   │   │   ├── dateUtils.js         # Chuẩn hóa ngày giờ chuẩn ISO cho Safari iOS
│   │   │   ├── videoUtils.js        # ⭐ Xử lý link nhúng, thumbnail auto-fetch, auto-detect tỷ lệ video
│   │   │   └── compressImageForUpload.js # Nén ảnh client-side trước khi tải lên
│   │   ├── index.css                # ⭐ Design Tokens màu sắc, typography toàn cục
│   │   ├── App.jsx                  # Routing React Router v6 & Lazy loading
│   │   └── main.jsx                 # Entry point React
│   ├── index.html                   # HTML Shell chính, tích hợp silent Google Translate
│   └── vite.config.js               # Cấu hình Vite build + Auto-clean public/assets
├── public/                          # Thư mục bundle production phục vụ Web server
│   ├── assets/                      # JS, CSS được nén và gán mã hash (tự động dọn dẹp)
│   ├── uploads/                     # Thư mục chứa file tải lên của người dùng
│   ├── sw.js                        # Service Worker PWA production
│   └── manifest.json                # PWA Manifest
├── scripts/
│   └── rebrand.js                   # ⭐ CLI Script tự động nhân bản & đổi thương hiệu
├── .env.example                     # Mẫu biến môi trường
├── db.js                            # Kết nối MySQL Connection Pool
├── ecosystem.config.js              # Cấu hình PM2 Cluster trên VPS
├── nginx.conf                       # Cấu hình Nginx mẫu cho Production
├── schema.sql                       # ⭐ Cấu trúc CSDL chuẩn hóa 18 bảng & Seed Data
├── server.js                        # ⭐ Backend Express API: >100 REST Endpoints, AI RAG & SSR SEO
├── CODEBASE_ARCHITECTURE.md         # Tài liệu kiến trúc toàn hệ thống (File này)
├── hand_over.md                     # Tài liệu bàn giao & nhân bản kỹ thuật
├── huong_dan_deploy_vps.md          # Hướng dẫn triển khai Production lên VPS
└── README.md                        # Giới thiệu tổng quan dự án
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

1. **Khách vãng lai (Public / Guest)**:
   - Xem Trang chủ, Danh mục, Sự kiện, Danh bạ doanh nghiệp, Bảng giá nông sản & Video thị trường.
   - **Nội dung bài viết mở công khai hoàn toàn (`PostDetail.jsx`)**: Tối ưu hóa chỉ số SEO Google bot.
   - Đăng ký nhận tư vấn xúc tiến đầu tư (`/api/leads`) và đặt vé sự kiện công khai.
2. **Hội viên Doanh nghiệp (`role: 'member'`)**:
   - Tự động phê duyệt gói Silver khi đăng ký (`status = 'approved'`), đăng nhập tại `/login`, quản trị tại `/member-dashboard`.
   - Cập nhật hồ sơ năng lực, sản phẩm OCOP, đăng bài viết và quản lý vé sự kiện cá nhân.
3. **Ban Biên tập / Content Creator (`role: 'creator'`)**:
   - Được Admin cấp tài khoản chuyên biệt trong bảng `content_creators`, làm việc tại `/creator-dashboard`.
   - Soạn thảo và xuất bản bài viết chuyên môn với Rich Text Editor, gắn thẻ tags và chuyên mục.
4. **Ban Tổ chức Sự kiện & Người Soát vé (`role: 'organizer'`)**:
   - Làm việc tại `/organizer-dashboard` và màn hình quét camera soát vé QR thời gian thực tại `/admin/checkin`.
5. **Quản trị viên Hệ thống (`role: 'admin' / 'superadmin'`)**:
   - Toàn quyền tại `/admin-dashboard`: Quản trị hội viên, bài viết, sự kiện, chuyên mục, leads tư vấn, creator, ban tổ chức, cấu hình prompt AI và bảng giá nông sản / video thị trường.

---

## ☕ 4. KIẾN TRÚC PHÂN HỆ GIÁ NÔNG SẢN & VIDEO THỊ TRƯỜNG

Phân hệ được thiết kế để theo dõi diễn biến giá cả hàng ngày và video phân tích thị trường (trong DakLak.today là Cà phê, và có thể chuyển đổi thành Chè, Hồ tiêu, Sầu riêng cho các tỉnh khác):

```
┌───────────────────────────────────────────────────────────────────────────┐
│                      QUẢN LÝ GIÁ NÔNG SẢN & VIDEO                        │
├─────────────────────────────────────┬─────────────────────────────────────┤
│ 1. ẢNH BẢNG GIÁ NÔNG SẢN            │ 2. VIDEO PHÂN TÍCH THỊ TRƯỜNG       │
│ - Tải ảnh từ máy / Dán URL          │ - YouTube, Facebook Reels, MP4...   │
│ - Phân trang cố định 1 hàng (4 ảnh) │ - Phân trang cố định 1 hàng (3 vid) │
│ - Đổi thứ tự: ◀ Dời trước, Dời sau ▶ │ - Đổi thứ tự: ◀ Dời trước, Dời sau ▶ │
│ - Nhập STT trực tiếp lưu tức thì    │ - Nhập STT trực tiếp lưu tức thì    │
│ - Đặt ảnh chính hiển thị Trang chủ  │ - Tự nhận diện tỷ lệ khung hình     │
└─────────────────────────────────────┴─────────────────────────────────────┘
```

### Các Điểm Kỹ Thuật Độc Quyền Của Module:
1. **Phân trang Cố định 1 Hàng**:
   - Ảnh bảng giá: 4 card/hàng trên desktop kèm thanh phân trang (Trang trước, số trang, Trang sau).
   - Video thị trường: 3 card/hàng trên desktop kèm thanh phân trang.
   - Không bị tràn thành nhiều hàng gây mất thẩm mỹ giao diện quản trị.
2. **Cơ chế Sắp xếp Thứ tự Linh hoạt**:
   - Lưu trữ qua cột `order_index` trong CSDL.
   - Mặc định khi không can thiệp: Luôn ưu tiên hiển thị mục mới nhất lên đầu (`ORDER BY order_index ASC, created_at DESC, id DESC`).
   - Hỗ trợ đổi thứ tự nhanh bằng nút bấm hoặc gõ số thứ tự và nhấn `Enter`.
3. **Khử Triệt Để Khoảng Đen Video (Auto Aspect-Ratio Fitting)**:
   - File `frontend/src/utils/videoUtils.js` tích hợp thuật toán đo tỷ lệ khung hình thực từ ảnh thumbnail gốc (`naturalWidth / naturalHeight`) và thẻ nhúng.
   - Khung modal tự động co giãn ôm sát đúng tỷ lệ thực tế (Vuông 1:1, Ngang 16:9, Dọc 9:16 hoặc 4:5), xóa bỏ hoàn toàn khoảng đen thừa dưới chân video.
   - Trang Admin cung cấp thêm menu chọn thủ công: *Tự động, 16:9, 1:1, 9:16, 4:5*.

---

## 🧭 5. KIẾN TRÚC HEADER & BỘ CHỌN ĐA NGÔN NGỮ CHỐNG DỊCH ĐÈ

Header (`frontend/src/components/Navbar.jsx`) áp dụng các quy chuẩn UI/UX khắt khe:

1. **Nguyên tắc 1 Hàng Duy Nhất (Single-Row Enforcement)**:
   - Giữ cố định ở 1 hàng duy nhất (`72px`), không bao giờ bị gãy thành 2 tầng.
2. **Cơ chế Tự Ngắt Dòng Chống Đè Chữ (`white-space: normal`)**:
   - Khi tên chuyên mục dài, chữ tự động xuống 2 dòng cân xứng ở giữa nút bấm, không đè lên nút khác và không đẩy vỡ các nút Tìm kiếm / Ngôn ngữ / Đăng nhập.
3. **Cơ chế Chống Dịch Đè (Anti-Mistranslation)**:
   - Gắn thuộc tính `notranslate` và `translate="no"` cho cụm logo và bộ chọn ngôn ngữ, loại bỏ triệt để việc mã ngôn ngữ quốc tế bị dịch thành từ tiếng Việt sai nghĩa.

---

## ⚡ 6. CƠ CHẾ ĐỒNG BỘ CHUYÊN MỤC TỨC THÌ (REALTIME CATEGORY SYNC)

1. **Loại bỏ Cache Server**: Endpoint `GET /api/categories` sử dụng `Cache-Control: no-cache, no-store, must-revalidate`.
2. **Tải Tức Thì 0ms với SWR**: `Navbar.jsx` nạp ngay từ cache local và kiểm tra bản mới ngầm qua timestamp query `/api/categories?_t=${Date.now()}`.
3. **Phát Sự Kiện Realtime Giữa Các Tab**: Khi Admin chỉnh sửa danh mục, sự kiện `categories-updated` được kích hoạt để đồng bộ giao diện người dùng ngay lập tức.

---

## 🌐 7. ĐA NGÔN NGỮ ĐA TẦNG (DUAL-ENGINE TRANSLATION SYSTEM)

1. **Tầng 1 - Từ điển Cố định (Static UI Dictionary)**: Chuyển đổi tức thì 0ms cho menu, nút bấm, tiêu đề tĩnh 5 ngôn ngữ (VI, EN, ZH, JA, KO).
2. **Tầng 2 - Google Translate Silent Engine**: Tự động dịch toàn bộ nội dung động lấy từ CSDL (bài viết, sự kiện, doanh nghiệp) sang ngôn ngữ đích mà không reload trang.
3. **Khắc phục Xung đột Render**: Tách riêng các thành phần có timer (đồng hồ đếm ngược sự kiện) và bọc khối văn bản tĩnh bằng `React.memo` để triệt tiêu hiện tượng nhấp nháy chữ.

---

## 🤖 8. TRỢ LÝ TRÍ TUỆ NHÂN TẠO (AI AGENT GEMINI FLASH RAG)

1. **Giao diện Trò chuyện Kép**: Cửa sổ chat nổi (`FloatingAIBot.jsx`) 24/7 trên mọi trang và trang chuyên sâu toàn màn hình `/ai-chat`.
2. **RAG Context Enrichment**: Backend tự động trích xuất thông tin doanh nghiệp, bài viết, sự kiện và tài liệu tri thức trong `knowledge_base/` để nạp vào prompt của Google Gemini Flash.
3. **Quản lý Phiên (Session Management)**: Lưu vết lịch sử hỏi đáp theo `session_id` trong bảng `chat_logs`.

---

## 🏛️ 9. KIẾN TRÚC PODIUM TOP 10 KCN & TOP 10 XUẤT KHẨU 2-3-2

1. **Khối Top 10 Khu & Cụm Công Nghiệp**:
   - Bục Podium 3 vị trí dẫn đầu (Hạng 1 ở giữa nhô cao 18px với viền vàng ánh kim).
   - Phân tách 2 ô thông tin độc lập: Quy mô diện tích (`.industrial-scale-pill`) và Ngành nghề trọng tâm (`.industrial-focus-pill`).
   - Lưới 7 Cụm công nghiệp tiếp theo áp dụng cấu trúc 2 - 3 - 2, hiển thị trọn vẹn 100% tên không bị cắt `...`.
2. **Khối Top 10 Xuất khẩu**:
   - Logo thương hiệu vector SVG chuẩn hóa, phân tầng rõ ràng.

---

## 🛡️ 10. CƠ CHẾ CHỐNG DÍNH CACHE & DỌN DẸP ASSET TỰ ĐỘNG

1. **Chỉ thị Cloudflare CDN Edge**: Backend gửi các header `CDN-Cache-Control: no-store` và `Cloudflare-CDN-Cache-Control: no-store`.
2. **PWA Service Worker Versioning**: `public/sw.js` phiên bản `daklak-cache-v2`, không cache đường dẫn root `'/'`.
3. **Tự động Dọn Rác Assets Build**: Plugin `clean-assets-dir` trong `frontend/vite.config.js` tự động xóa sạch file rác trong `public/assets/` trước mỗi lần build, giữ số lượng file assets ở mức tối ưu nhất (~30 file).

---

## 🚀 11. HẠ TẦNG SEO OPENGRAPH SSR

Route `app.get('*')` trong `server.js` phát hiện User-Agent của bot tìm kiếm và bot mạng xã hội (Zalo, Facebook, LinkedIn, Google...) để chèn trực tiếp các thẻ `og:title`, `og:description`, `og:image`, `og:url` từ CSDL, đồng thời có route proxy `/api/og-image` bảo đảm ảnh hiển thị hoàn hảo trên Zalo/Facebook.

---

## 💾 12. MÔ HÌNH CƠ SỞ DỮ LIỆU (18 BẢNG QUAN HỆ TRONG `schema.sql`)

1. `members`: Doanh nghiệp hội viên (xác thực, mã số thuế, hồ sơ năng lực, gói hội viên).
2. `member_sessions`: Phiên đăng nhập hội viên.
3. `admins`: Tài khoản quản trị viên hệ thống.
4. `admin_sessions`: Phiên đăng nhập quản trị viên.
5. `content_creators`: Biên tập viên nội dung.
6. `creator_sessions`: Phiên đăng nhập biên tập viên.
7. `event_organizers`: Ban tổ chức sự kiện & người soát vé.
8. `organizer_sessions`: Phiên đăng nhập ban tổ chức.
9. `posts`: Bài viết, tin tức, dữ liệu chuyên đề, dự án đầu tư.
10. `events`: Sự kiện, hội thảo, số lượng vé, giá vé.
11. `event_registrations`: Vé đã đăng ký, mã QR cá nhân, trạng thái thanh toán và check-in.
12. `event_interests`: Danh sách quan tâm sự kiện.
13. `leads`: Dữ liệu khách hàng tiềm năng gửi từ Form liên hệ/tư vấn trang chủ.
14. `categories`: Chuyên mục chính cấp 1 (hỗ trợ `name_en` song ngữ).
15. `sub_categories`: Lĩnh vực chuyên ngành con cấp 2 (hỗ trợ `name_en`).
16. `coffee_price_images`: Ảnh bảng giá nông sản hàng ngày, trạng thái chọn hiển thị và thứ tự `order_index`.
17. `coffee_videos`: Video thị trường nông sản, thumbnail auto-fetch, tỷ lệ khung hình `aspect_ratio` và thứ tự `order_index`.
18. `chat_logs`: Lưu vết lịch sử hỏi đáp của người dùng với Trợ lý AI.

---

## 🚀 13. TỔNG KẾT VẬN HÀNH & NHÂN BẢN

Mã nguồn được đóng gói theo triết lý **White-label 100%**. Khi nhân bản sang một tỉnh thành mới:
1. Chạy lệnh: `node scripts/rebrand.js --preset=<ten-tinh>` (hoặc chạy tương tác).
2. Cấu hình file `.env` kết nối MySQL và khóa Gemini API.
3. Chạy `npm run build --prefix frontend` và khởi động lại với `pm2 restart all`.
Toàn bộ tính năng từ phân quyền, AI, SEO, sự kiện QR, bảng giá và phân trang đều được kế thừa nguyên vẹn.

---

*Tài liệu kiến trúc Golden Master v2.6 được cập nhật và chuẩn hóa bởi Đội ngũ Kỹ thuật ADT Quốc tế.*
