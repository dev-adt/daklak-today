# 🚀 HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG LÊN VPS PRODUCTION (AAPANEL / NGINX / PM2 / SSL)
# DÀNH CHO DAKLAK.TODAY VÀ CÁC NỀN TẢNG NHÂN BẢN (*.TODAY)

> **Mục tiêu**: Hướng dẫn từng bước từ A đến Z cách triển khai mã nguồn **Today Platform (Golden Master)** lên máy chủ ảo Linux VPS (Ubuntu 20.04 / 22.04 LTS) sử dụng trình quản trị **aaPanel**, Nginx Reverse Proxy, MySQL 8.0, PM2 Cluster và chứng chỉ SSL miễn phí Let's Encrypt.
>
> Áp dụng trực tiếp cho tên miền chính thức **`daklak.today`** (kèm `www.daklak.today`) hoặc bất kỳ tên miền nhân bản nào (ví dụ: `gialai.today`, `lamdong.today`, `phutho.today`, `nghean.today`...).

---

## 📋 THÔNG SỐ HỆ THỐNG MẪU (CHUẨN HOÁ)

| Thông số | Giá trị DakLak.today (Mặc định) | Giá trị Dự án Nhân bản (*.today) |
| :--- | :--- | :--- |
| **Hệ điều hành VPS** | Ubuntu 20.04 / 22.04 LTS 64-bit | Ubuntu 20.04 / 22.04 LTS 64-bit |
| **Bảng điều khiển** | aaPanel Linux v6.8+ | aaPanel Linux v6.8+ |
| **Môi trường chạy** | Node.js v18.x - v22.x LTS, npm v9+ | Node.js v18.x - v22.x LTS, npm v9+ |
| **Web Server** | Nginx 1.22+ Reverse Proxy | Nginx 1.22+ Reverse Proxy |
| **Cơ sở dữ liệu** | MySQL 8.0 / MariaDB 10.5+ (`utf8mb4`) | MySQL 8.0 / MariaDB 10.5+ (`utf8mb4`) |
| **Tên miền (Domain)** | `daklak.today` và `www.daklak.today` | `<ten-mien-moi>.today` và `www.<ten-mien-moi>.today` |
| **Đường dẫn thư mục**| `/www/wwwroot/daklak.today` | `/www/wwwroot/<ten-mien-moi>.today` |
| **Backend Port** | `5000` (hoặc `3028`, cấu hình trong `.env`) | `5000` (hoặc port riêng nếu chạy chung VPS) |
| **Tiến trình ngầm** | PM2 (`daklak-today-prod`) | PM2 (`<slug-ten-mien>-prod`) |

---

## 🛠️ QUY TRÌNH 9 BƯỚC TRIỂN KHAI CHI TIẾT

```
[1. Trỏ DNS Domain] ➔ [2. Tạo DB MySQL] ➔ [3. Tạo Web trên aaPanel]
       │
       ▼
[4. Kéo Code Git]   ➔ [5. Cấu hình .env] ➔ [6. Build Frontend]
       │
       ▼
[7. Khởi chạy PM2]  ➔ [8. Cấp SSL HTTPS] ➔ [9. Nginx Reverse Proxy Anti-Cache]
```

---

### BƯỚC 1: Trỏ DNS Tên Miền về Địa chỉ IP của VPS
Truy cập trang quản trị DNS của nhà cung cấp tên miền (Cloudflare, Namecheap, PA Việt Nam, Mắt Bão, INET...):

1. **Bản ghi A (Root)**:
   - Host: `@` (hoặc tên miền chính)
   - Value: `IP_VPS_CỦA_BẠN`
   - TTL: Auto hoặc 300s
2. **Bản ghi CNAME / A (WWW)**:
   - Host: `www`
   - Value: `daklak.today` (hoặc `IP_VPS_CỦA_BẠN`)

*(Nếu sử dụng Cloudflare, ban đầu có thể gạt màu cam sang "DNS Only" (màu xám) để việc xác thực cấp phát chứng chỉ SSL Let's Encrypt diễn ra thuận lợi nhất).*

---

### BƯỚC 2: Tạo Cơ sở Dữ liệu MySQL trên aaPanel
1. Đăng nhập vào bảng điều khiển **aaPanel** ➔ Chọn menu **Databases** bên trái.
2. Nhấn nút **Add Database**:
   - **DBName**: `daklak_today` (hoặc tên viết tắt theo tỉnh: `gialai_today`, `lamdong_today`...)
   - **DB User**: Tự động sinh cùng tên DB
   - **Password**: Nhấn nút tạo ngẫu nhiên hoặc đặt mật khẩu mạnh (Lưu lại để điền vào file `.env`)
   - **Character Set**: Chọn **`utf8mb4`** (Bắt buộc để lưu tiếng Việt đầy đủ và icon emoji)
   - **Access Permission**: `Local server` (127.0.0.1)
3. Bấm **Submit**.

---

### BƯỚC 3: Tạo Thư mục Website trên aaPanel
1. Vào menu **Website** ➔ Nhấn **Add site**:
   - **Domain name**:
     ```text
     daklak.today
     www.daklak.today
     ```
   - **Description**: Cổng thông tin DakLak.today
   - **Root directory**: `/www/wwwroot/daklak.today`
   - **FTP**: Không cần tạo
   - **Database**: Đã tạo ở Bước 2
   - **PHP Version**: `pure static` (Vì toàn bộ dự án chạy bằng Node.js và Nginx Reverse Proxy)
2. Bấm **Submit**.

---

### BƯỚC 4: Kéo Mã Nguồn từ GitHub về VPS
Mở **Terminal** trên aaPanel (hoặc SSH vào VPS qua PuTTY, MobaXterm, PowerShell):

```bash
# 1. Truy cập vào thư mục wwwroot
cd /www/wwwroot

# 2. Xóa các file mặc định index.html rỗng do aaPanel vừa sinh
rm -rf /www/wwwroot/daklak.today

# 3. Clone mã nguồn từ kho lưu trữ Git về đúng thư mục
git clone https://github.com/dev-adt/daklak-today.git daklak.today

# 4. Di chuyển vào thư mục dự án
cd /www/wwwroot/daklak.today
```

---

### BƯỚC 5: Cấu hình File Môi Trường `.env` & Import Cơ sở Dữ liệu

1. **Tạo file cấu hình môi trường `.env`**:
   ```bash
   cp .env.example .env
   nano .env
   ```
2. **Nội dung cấu hình chuẩn cho Production**:
   ```env
   NODE_ENV=production
   PORT=5000
   SITE_URL=https://daklak.today
   ALLOWED_ORIGIN=https://daklak.today,https://www.daklak.today

   # Kết nối Cơ sở dữ liệu MySQL đã tạo ở Bước 2
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_NAME=daklak_today
   DB_USER=daklak_today
   DB_PASSWORD=Mật_Khẩu_DB_Của_Bạn_Tại_Bước_2

   # Bảo mật JWT
   JWT_SECRET=TaoMotChuoiBiMatNgauNhienDaiItNhat32KyTu!@#$

   # Khóa AI Trí tuệ nhân tạo (Google Gemini)
   GEMINI_API_KEY=AIzaSy...DienKeyCuaBanVaoDay

   # Cấu hình gửi Mail thông báo & Vé QR (Tùy chọn)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=email-cua-ban@gmail.com
   SMTP_PASS=mat-khau-ung-dung-16-chu
   SMTP_FROM="DakLak.today" <email-cua-ban@gmail.com>
   ```
   *(Nhấn `Ctrl + O` rồi `Enter` để lưu, sau đó nhấn `Ctrl + X` để thoát nano).*

3. **Nạp Cấu trúc Bảng CSDL từ file `schema.sql`**:
   ```bash
   mysql -u daklak_today -p daklak_today < schema.sql
   ```
   *(Nhập mật khẩu database khi được hỏi prompt `Enter password:`. File `schema.sql` chuẩn bị sẵn toàn bộ 18 bảng, dữ liệu danh mục chuẩn và tài khoản Admin mặc định: `admin` / `admin123`).*

---

### BƯỚC 6: Cài đặt Dependencies & Biên dịch Frontend (Build)

```bash
# 1. Cài đặt các thư viện Node.js cho Backend
npm install --production=false

# 2. Cài đặt thư viện và build Frontend React
cd frontend
npm install
npm run build
cd ..
```

> 💡 **Cơ chế Dọn dẹp Thông minh**: Hệ thống đã tích hợp sẵn plugin tự động dọn sạch thư mục `public/assets/` trước mỗi lần build, đảm bảo máy chủ không bao giờ bị tích tụ file rác như các bản cũ.

---

### BƯỚC 7: Khởi chạy Ứng dụng bằng Trình Quản lý Tiến trình PM2

Hệ thống cung cấp sẵn file `ecosystem.config.js` đã tối ưu cho môi trường Production:

```bash
# 1. Cài đặt PM2 toàn cục (nếu VPS chưa có)
npm install -g pm2

# 2. Khởi chạy cụm tiến trình
pm2 start ecosystem.config.js

# 3. Lưu cấu hình PM2 để tự khởi động lại khi VPS reboot
pm2 save
pm2 startup
```

Kiểm tra trạng thái máy chủ:
```bash
pm2 status
```
*(Nếu thấy tiến trình hiển thị trạng thái `online` với màu xanh lá cây là máy chủ Node.js đã chạy ổn định).*

---

### BƯỚC 8: Cài đặt Chứng chỉ SSL Miễn phí (HTTPS) trên aaPanel

1. Trong aaPanel, vào menu **Website** ➔ Bấm vào tên miền **`daklak.today`**.
2. Chọn tab **SSL** ở menu bên trái cửa sổ pop-up ➔ Chọn tab con **Let's Encrypt**:
   - Tích chọn cả 2 tên miền: `daklak.today` và `www.daklak.today`
   - Phương thức xác thực: **File verification**
3. Bấm nút **Apply**.
4. Chờ 15-30 giây khi thông báo cấp phát thành công, gạt công tắc **Force HTTPS** sang trạng thái BẬT để tự động chuyển hướng toàn bộ truy cập HTTP sang HTTPS an toàn.

---

### BƯỚC 9: Cấu hình Nginx Reverse Proxy & Chống Dính Cache

Để Nginx chuyển tiếp lưu lượng từ cổng 80/443 sang ứng dụng Node.js (cổng `5000`), đồng thời áp dụng chính sách **Anti-Cache** độc quyền (file HTML không dính cache, file assets JS/CSS có mã hash được lưu lâu):

1. Trong cửa sổ cấu hình website trên aaPanel, chọn mục **Reverse Proxy** ➔ Nhấn **Add reverse proxy**:
   - **Proxy Name**: `node-backend`
   - **Target URL**: `http://127.0.0.1:5000`
   - **Sent Domain**: `$host`
2. Bấm **Save**.
3. Tiếp theo, chọn mục **Config** (Cấu hình Nginx trực tiếp của website) và kiểm tra/bổ sung đoạn chỉ thị cache bên trong khối `server { ... }`:

```nginx
# ── Chống dính Cache cho File HTML gốc ───────────────────────
location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
    add_header Pragma "no-cache";
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# ── Cache tối ưu cho Tài nguyên tĩnh có mã Hash (/assets/) ────
location ~* ^/assets/ {
    expires 30d;
    add_header Cache-Control "public, max-age=2592000, immutable";
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# ── Bật nén Gzip tăng tốc độ tải trang ────────────────────────
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
gzip_min_length 1000;
```

Bấm **Save**.

---

## 🔄 LỆNH CẬP NHẬT CODE NHANH KHI CÓ BẢN MỚI

Mỗi khi bạn đẩy code cập nhật lên GitHub, chỉ cần mở Terminal trên VPS và chạy tổ hợp lệnh 1 bước sau:

```bash
cd /www/wwwroot/daklak.today && git pull && npm run build --prefix frontend && pm2 restart all
```

Toàn bộ mã nguồn mới sẽ được kéo về, frontend được biên dịch lại sạch sẽ và PM2 khởi động lại tức thì với thời gian gián đoạn dưới 2 giây.

---

## 🛠️ XỬ LÝ CÁC SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

| Sự cố | Nguyên nhân | Cách khắc phục |
| :--- | :--- | :--- |
| **Lỗi 502 Bad Gateway** | Node.js chưa chạy hoặc bị crash | Chạy `pm2 logs` để xem thông báo lỗi chi tiết. Kiểm tra thông số kết nối DB trong `.env`. |
| **Lỗi `ER_ACCESS_DENIED_ERROR`** | Sai `DB_USER` hoặc `DB_PASSWORD` | Kiểm tra lại thông tin database trên aaPanel và đối chiếu với file `.env`. |
| **Client không thấy cập nhật mới** | Trình duyệt hoặc Cloudflare lưu cache | Nhấn `Ctrl + F5` (hoặc `Cmd + Shift + R`). Đăng nhập Cloudflare và chọn **Purge Cache -> Purge Everything**. |
| **Không tải được ảnh lên (Upload error)** | Thư mục `public/uploads` thiếu quyền ghi | Chạy lệnh: `chmod -R 755 /www/wwwroot/daklak.today/public/uploads` |
| **Cổng 5000 bị trùng (EADDRINUSE)** | Có tiến trình khác đang chiếm cổng | Đổi `PORT=5001` trong `.env` và cập nhật lại Target URL trong Reverse Proxy Nginx. |
| **Lỗi SSL không cấp được** | Tên miền chưa trỏ đúng IP VPS hoặc bị Cloudflare chặn | Tắt đám mây cam Cloudflare (chuyển sang DNS Only xám), sau đó nhấn Apply lại SSL. |

---

*Tài liệu được biên soạn và chuẩn hóa bởi Đội ngũ Kỹ thuật ADT Quốc tế — Sẵn sàng phục vụ nhân bản hệ sinh thái Today Platform.*
