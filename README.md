# 🌟 TODAY PLATFORM — WHITE-LABEL DIGITAL ECOSYSTEM (GOLDEN MASTER v2.6)

> **Bộ khung mã nguồn All-in-One chuẩn mực** giúp bạn nhanh chóng khởi tạo, vận hành và nhân bản nền tảng số đa chức năng (Cổng thông tin, Báo chí kinh tế, Dữ liệu xúc tiến đầu tư, Di sản du lịch, Danh bạ doanh nghiệp, Bảng giá nông sản & Trợ lý Trí tuệ Nhân tạo AI) cho **bất kỳ tỉnh thành hoặc thương hiệu nào** chỉ trong vài phút!

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vite.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.5_Flash-purple.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE)

---

## 🚀 ĐIỂM MẠNH VƯỢT TRỘI CỦA TODAY PLATFORM

- ⚡ **White-label 100%**: Toàn bộ định danh thương hiệu (Tên cổng, Slogan, Logo, Tỉnh thành, Bảng màu HEX, Hotline, Tài khoản VietQR, AI Prompt) được quản lý tập trung qua `config/brand.config.js` và `frontend/src/brand.config.js`.
- 🛠️ **Công cụ Rebranding Tự động CLI (`node scripts/rebrand.js`)**: Tích hợp sẵn script đổi thương hiệu thông minh với các Preset tỉnh thành có sẵn (`daklak`, `gialai`, `lamdong`, `phutho`, `nghean`, `danang`) hoặc giao diện Wizard hỏi đáp trực quan.
- ☕ **Phân hệ Giá Nông sản & Video Thị trường Thông minh**:
  - Quản trị bảng giá nông sản hàng ngày đồng bộ tức thì với trang chủ.
  - Video thị trường hiển thị cố định **1 hàng** kèm phân trang chuyên nghiệp, không vỡ layout khi thêm nhiều mục.
  - Thuật toán **tự nhận diện tỷ lệ khung hình video** (1:1, 16:9, 9:16, 4:5), xóa bỏ hoàn toàn dải đen thừa dưới chân video.
  - Công cụ đổi thứ tự hiển thị nhanh bằng nút bấm hoặc gõ số thứ tự lưu tức thì.
- 🧹 **Tự Động Dọn Rác Assets (`clean-assets-dir`)**: Vite plugin tự động dọn sạch thư mục `public/assets/` trước mỗi lần build, giữ số lượng bundle luôn tinh gọn (~30 file), không tích tụ file rác qua thời gian.
- 👥 **Phân quyền 5 Cấp độ Độc lập (RBAC)**: Guest (Xem bài viết công khai tối ưu SEO), Member (Hội viên doanh nghiệp tự động duyệt gói Silver), Creator (Biên tập viên), Organizer (Ban tổ chức sự kiện), Admin (Quản trị toàn quyền).
- 🎫 **Sự kiện & Soát vé QR Thời gian thực**: Đăng ký vé sự kiện, tạo mã QR vé cá nhân, quét camera check-in trực tiếp tại cửa sự kiện.
- 🧠 **Trí tuệ Nhân tạo AI Gemini Flash RAG**: Trợ lý AI nổi 24/7 góc phải màn hình và trang chat toàn màn hình, tự động nạp ngữ cảnh dữ liệu doanh nghiệp và bài viết từ CSDL địa phương.
- 🌐 **Đa ngôn ngữ Đa tầng (5 Ngôn ngữ)**: Từ điển tĩnh 0ms kết hợp Google Translate Silent Engine dịch ngầm CSDL sang VI, EN, ZH, JA, KO; có cơ chế chống dịch đè chữ (`notranslate`) độc quyền.
- 🛡️ **Hạ tầng Chống Dính Cache Toàn diện**: Cơ chế Cloudflare CDN no-store header, PWA Service Worker versioning và Nginx proxy tối ưu.

---

## 📂 HỆ THỐNG TÀI LIỆU HƯỚNG DẪN CHI TIẾT

| Tài liệu | Nội dung & Vai trò |
| :--- | :--- |
| 📋 [**hand_over.md**](hand_over.md) | **Cẩm nang bàn giao kỹ thuật & quy trình 6 bước nhân bản hệ thống** |
| 🏗️ [**CODEBASE_ARCHITECTURE.md**](CODEBASE_ARCHITECTURE.md) | Tài liệu kiến trúc toàn diện (Data flow, API, 18 bảng DB, Gemini RAG, Anti-cache) |
| 🌐 [**huong_dan_deploy_vps.md**](huong_dan_deploy_vps.md) | Hướng dẫn triển khai Production lên VPS (aaPanel / Ubuntu / Nginx / PM2 / SSL) |
| 🛡️ [**huong_dan_admin.md**](huong_dan_admin.md) | Cẩm nang hướng dẫn sử dụng bảng điều khiển Quản trị viên (CMS Admin) |
| 🏢 [**huong_dan_doanh_nghiep.md**](huong_dan_doanh_nghiep.md) | Hướng dẫn dành cho Hội viên doanh nghiệp sử dụng portal |

---

## ⚡ BẮT ĐẦU NHANH TRONG 5 PHÚT (QUICK START)

### 1. Kéo Mã nguồn
```bash
git clone https://github.com/dev-adt/daklak-today.git my-today-platform
cd my-today-platform
```

### 2. Đổi Thương hiệu Tự động
```bash
# Cách A: Dùng Preset tỉnh thành có sẵn
node scripts/rebrand.js --preset=gialai

# Cách B: Chạy tương tác trả lời câu hỏi
node scripts/rebrand.js
```

### 3. Cài đặt Dependencies & Cấu hình Biến môi trường
```bash
# Cài đặt backend & frontend
npm install
cd frontend && npm install && npm run build && cd ..

# Tạo file .env từ mẫu
cp .env.example .env
```
Mở `.env` và điền thông số kết nối MySQL, Port và Gemini API Key.

### 4. Khởi tạo Cơ sở Dữ liệu (MySQL 8.0)
```bash
mysql -u root -p -e "CREATE DATABASE my_today_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p my_today_db < schema.sql
```
*(File `schema.sql` khởi tạo 18 bảng với tài khoản Admin mặc định: `admin` / `admin123`).*

### 5. Khởi chạy Ứng dụng
```bash
# Chạy máy chủ Backend
node server.js

# Hoặc chạy môi trường phát triển Frontend (Hot reload)
cd frontend && npm run dev
```
Truy cập:
- Trình duyệt: `http://localhost:5000` (Backend SPA) hoặc `http://localhost:5173` (Frontend Dev)
- Đăng nhập Admin: `http://localhost:5000/login`

---

## 🏛️ CẤU HÌNH THƯƠNG HIỆU TẬP TRUNG

Toàn bộ thông số thương hiệu nằm tại **2 file duy nhất**:
- **Frontend**: [`frontend/src/brand.config.js`](frontend/src/brand.config.js)
- **Backend**: [`config/brand.config.js`](config/brand.config.js)

```javascript
// Ví dụ cấu hình trong brand.config.js
export const brandConfig = {
  brandName: 'DakLak.today',
  brandShortName: 'DakLak',
  province: 'Đắk Lắk',
  domain: 'daklak.today',
  slogan: 'Khám phá • Kết nối • Phát triển',
  colors: { primary: '#16734A', secondary: '#168BC3', accent: '#E99035', ... },
  aiAssistant: { name: 'AI Đắk Lắk Assistant', ... },
  contact: { hotline: '0262 3888 999', email: 'contact@daklak.today', ... }
};
```

---

## 🚢 TRIỂN KHAI PRODUCTION LÊN VPS (PM2 & NGINX)

```bash
# Khởi chạy bằng PM2 Cluster
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Xem hướng dẫn chi tiết từng bước tại [huong_dan_deploy_vps.md](huong_dan_deploy_vps.md).

---

## 📄 GIẤY PHÉP (LICENSE)
Phát triển và bảo trì bởi **Đội ngũ Kỹ thuật ADT Quốc tế**. Được cấp phép theo giấy phép MIT.
