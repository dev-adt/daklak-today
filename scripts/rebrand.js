#!/usr/bin/env node

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * TODAY PLATFORM — WHITE-LABEL AUTOMATIC REBRANDING CLI TOOL
 * ══════════════════════════════════════════════════════════════════════════════
 * Công cụ tự động nhân bản & chuyển đổi thương hiệu toàn diện cho hệ sinh thái *.today.
 *
 * CÁCH DÙNG:
 *
 * 1. Chạy tương tác từng bước (Interactive Wizard):
 *    node scripts/rebrand.js
 *
 * 2. Sử dụng cấu hình mẫu sẵn (Presets):
 *    node scripts/rebrand.js --preset=gialai
 *    node scripts/rebrand.js --preset=lamdong
 *    node scripts/rebrand.js --preset=phutho
 *    node scripts/rebrand.js --preset=nghean
 *    node scripts/rebrand.js --preset=danang
 *    node scripts/rebrand.js --preset=daklak  (Mặc định)
 *
 * 3. Chạy với tham số dòng lệnh tùy ý (Non-interactive):
 *    node scripts/rebrand.js \
 *      --name="GiaLai.today" \
 *      --short="GiaLai" \
 *      --province="Gia Lai" \
 *      --region="Tây Nguyên" \
 *      --domain="gialai.today" \
 *      --slogan="Đại ngàn hùng vĩ • Điểm hẹn đầu tư" \
 *      --tagline="Gia Lai – Vùng đất bazan huyền thoại" \
 *      --company="Cổng thông tin, Dữ liệu & Xúc tiến Đầu tư Gia Lai" \
 *      --color="#15803D" \
 *      --secondaryColor="#0284C7" \
 *      --accentColor="#D97706" \
 *      --ai="AI Gia Lai Assistant" \
 *      --hotline="0269 3888 999" \
 *      --email="contact@gialai.today" \
 *      --specialty="Hồ tiêu & Cà phê Gia Lai"
 *
 * 4. Chạy thử nghiệm xem trước, không ghi file (Dry run):
 *    node scripts/rebrand.js --preset=gialai --dry-run
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Bảng mẫu thương hiệu định hình sẵn (Built-in Presets)
const PRESETS = {
  daklak: {
    brandName: 'DakLak.today',
    brandShortName: 'DakLak',
    province: 'Đắk Lắk',
    provinceEn: 'Dak Lak',
    region: 'Tây Nguyên',
    regionEn: 'Central Highlands',
    domain: 'daklak.today',
    slogan: 'Khám phá • Kết nối • Phát triển',
    tagline: 'Đắk Lắk – Từ đại ngàn đến biển xanh',
    description: 'Nền tảng thông tin, khám phá địa phương và kết nối cơ hội kinh doanh Đắk Lắk bằng nền tảng số và trí tuệ nhân tạo.',
    companyLegalName: 'Cổng thông tin, Dữ liệu & Xúc tiến Đầu tư Đắk Lắk',
    primaryColor: '#16734A',
    secondaryColor: '#168BC3',
    accentColor: '#E99035',
    hotline: '0262 3888 999',
    email: 'contact@daklak.today',
    aiName: 'AI Đắk Lắk Assistant',
    specialtyName: 'Cà phê Đắk Lắk',
    specialtyCommodity: 'Giá cà phê'
  },
  gialai: {
    brandName: 'GiaLai.today',
    brandShortName: 'GiaLai',
    province: 'Gia Lai',
    provinceEn: 'Gia Lai',
    region: 'Tây Nguyên',
    regionEn: 'Central Highlands',
    domain: 'gialai.today',
    slogan: 'Đại ngàn hùng vĩ • Kiến tạo tương lai',
    tagline: 'Gia Lai – Điểm hẹn đầu tư và văn hóa cồng chiêng',
    description: 'Cổng thông tin số, dữ liệu kinh tế, du lịch và kết nối cơ hội đầu tư tỉnh Gia Lai 24/7.',
    companyLegalName: 'Cổng thông tin, Dữ liệu & Xúc tiến Đầu tư Gia Lai',
    primaryColor: '#15803D',
    secondaryColor: '#0284C7',
    accentColor: '#D97706',
    hotline: '0269 3888 999',
    email: 'contact@gialai.today',
    aiName: 'AI Gia Lai Assistant',
    specialtyName: 'Hồ tiêu & Cà phê Gia Lai',
    specialtyCommodity: 'Giá nông sản'
  },
  lamdong: {
    brandName: 'LamDong.today',
    brandShortName: 'LamDong',
    province: 'Lâm Đồng',
    provinceEn: 'Lam Dong',
    region: 'Tây Nguyên',
    regionEn: 'Central Highlands',
    domain: 'lamdong.today',
    slogan: 'Xứ sở ngàn hoa • Nông nghiệp công nghệ cao',
    tagline: 'Lâm Đồng – Thiên đường sinh thái và đổi mới sáng tạo',
    description: 'Cổng thông tin xúc tiến đầu tư, dữ liệu du lịch Đà Lạt và kết nối chuỗi cung ứng nông sản Lâm Đồng.',
    companyLegalName: 'Cổng thông tin, Dữ liệu & Xúc tiến Đầu tư Lâm Đồng',
    primaryColor: '#047857',
    secondaryColor: '#6366F1',
    accentColor: '#F59E0B',
    hotline: '0263 3888 999',
    email: 'contact@lamdong.today',
    aiName: 'AI Lâm Đồng Assistant',
    specialtyName: 'Trà Oolong & Rau củ Đà Lạt',
    specialtyCommodity: 'Giá nông sản'
  },
  phutho: {
    brandName: 'PhuTho.today',
    brandShortName: 'PhuTho',
    province: 'Phú Thọ',
    provinceEn: 'Phu Tho',
    region: 'Trung du & Miền núi phía Bắc',
    regionEn: 'Northern Midlands & Mountains',
    domain: 'phutho.today',
    slogan: 'Về miền Đất Tổ • Kết nối giao thương',
    tagline: 'Phú Thọ – Cội nguồn dân tộc, tâm điểm công nghiệp phía Bắc',
    description: 'Nền tảng số kết nối công nghiệp phụ trợ, du lịch văn hóa cội nguồn và xúc tiến đầu tư tỉnh Phú Thọ.',
    companyLegalName: 'Cổng thông tin, Dữ liệu & Xúc tiến Đầu tư Phú Thọ',
    primaryColor: '#B91C1C',
    secondaryColor: '#0284C7',
    accentColor: '#D97706',
    hotline: '0210 3888 999',
    email: 'contact@phutho.today',
    aiName: 'AI Phú Thọ Assistant',
    specialtyName: 'Chè Đất Tổ & Bưởi Đoan Hùng',
    specialtyCommodity: 'Nông sản Phú Thọ'
  },
  nghean: {
    brandName: 'NgheAn.today',
    brandShortName: 'NgheAn',
    province: 'Nghệ An',
    provinceEn: 'Nghe An',
    region: 'Bắc Trung Bộ',
    regionEn: 'North Central Coast',
    domain: 'nghean.today',
    slogan: 'Hào khí xứ Nghệ • Hội nhập toàn cầu',
    tagline: 'Nghệ An – Đất thiêng địa linh nhân kiệt, cực tăng trưởng mới',
    description: 'Cổng thông tin kinh tế, hạ tầng KCN VSIP, du lịch Cửa Lò và cơ hội đầu tư tỉnh Nghệ An.',
    companyLegalName: 'Cổng thông tin, Dữ liệu & Xúc tiến Đầu tư Nghệ An',
    primaryColor: '#1D4ED8',
    secondaryColor: '#059669',
    accentColor: '#F59E0B',
    hotline: '0238 3888 999',
    email: 'contact@nghean.today',
    aiName: 'AI Nghệ An Assistant',
    specialtyName: 'Cam Vinh & Hải sản Cửa Lò',
    specialtyCommodity: 'Đặc sản xứ Nghệ'
  },
  danang: {
    brandName: 'DaNang.today',
    brandShortName: 'DaNang',
    province: 'Đà Nẵng',
    provinceEn: 'Da Nang',
    region: 'Duyên hải Nam Trung Bộ',
    regionEn: 'South Central Coast',
    domain: 'danang.today',
    slogan: 'Thành phố đáng sống • Đổi mới sáng tạo',
    tagline: 'Đà Nẵng – Trung tâm tài chính, công nghệ và du lịch quốc tế',
    description: 'Hệ sinh thái số kết nối du lịch biển, vi mạch bán dẫn, logistics và cơ hội đầu tư thành phố Đà Nẵng.',
    companyLegalName: 'Cổng thông tin, Dữ liệu & Xúc tiến Đầu tư Đà Nẵng',
    primaryColor: '#0284C7',
    secondaryColor: '#0D9488',
    accentColor: '#F59E0B',
    hotline: '0236 3888 999',
    email: 'contact@danang.today',
    aiName: 'AI Đà Nẵng Assistant',
    specialtyName: 'Kinh tế biển & Công nghệ số',
    specialtyCommodity: 'Bản tin kinh tế'
  }
};

// Đọc tham số CLI
const args = process.argv.slice(2);
const params = {};
args.forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, ...valParts] = arg.slice(2).split('=');
    params[key] = valParts.join('=') || true;
  }
});

const isDryRun = !!params['dry-run'];
const rootDir = path.resolve(__dirname, '..');

// Helper cập nhật file
function updateFile(filePath, mutator) {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(rootDir, filePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️ Bỏ qua vì không tìm thấy file: ${filePath}`);
    return;
  }
  const original = fs.readFileSync(fullPath, 'utf8');
  const updated = mutator(original);
  if (original !== updated) {
    if (!isDryRun) {
      fs.writeFileSync(fullPath, updated, 'utf8');
    }
    console.log(`✅ [${isDryRun ? 'DRY-RUN' : 'UPDATED'}] ${filePath}`);
  } else {
    console.log(`ℹ️ [UNCHANGED] ${filePath}`);
  }
}

async function promptUser(query, defaultValue) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(`${query} [${defaultValue}]: `, answer => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║        TODAY PLATFORM — WHITE-LABEL REBRANDING AUTOMATION CLI        ║');
  console.log('║        Hệ sinh thái số All-in-One: Media, Data, AI & Investment      ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  if (isDryRun) {
    console.log('🔍 ĐANG CHẠY Ở CHẾ ĐỘ KIỂM TRA THỬ (--dry-run). Không ghi đè file.\n');
  }

  // Xác định dữ liệu nguồn: từ preset hoặc tham số hoặc hỏi tương tác
  const presetKey = params.preset ? String(params.preset).toLowerCase() : null;
  const basePreset = PRESETS[presetKey] || PRESETS.daklak;

  let brandName = params.name || basePreset.brandName;
  let brandShort = params.short || basePreset.brandShortName;
  let province = params.province || basePreset.province;
  let region = params.region || basePreset.region;
  let domain = params.domain || basePreset.domain;
  let slogan = params.slogan || basePreset.slogan;
  let tagline = params.tagline || basePreset.tagline;
  let company = params.company || basePreset.companyLegalName;
  let primaryColor = params.color || basePreset.primaryColor;
  let hotline = params.hotline || basePreset.hotline;
  let email = params.email || basePreset.email;
  let aiName = params.ai || basePreset.aiName;
  let specialty = params.specialty || basePreset.specialtyName;

  // Nếu không chỉ định preset và không có tham số CLI cụ thể -> Bật chế độ Wizard hỏi tương tác
  if (!params.preset && !params.name && process.stdin.isTTY) {
    console.log('💡 Bạn có thể chọn nhanh Preset (daklak, gialai, lamdong, phutho, nghean, danang)');
    const chosenPreset = await promptUser('Chọn Preset mẫu (hoặc để trống để nhập tự do)', 'gialai');
    const selected = PRESETS[chosenPreset.toLowerCase()] || basePreset;

    brandName = await promptUser('1. Tên thương hiệu hiển thị (VD: GiaLai.today)', selected.brandName);
    brandShort = await promptUser('2. Tên viết tắt (VD: GiaLai)', selected.brandShortName);
    province = await promptUser('3. Tên tỉnh / thành phố (VD: Gia Lai)', selected.province);
    domain = await promptUser('4. Tên miền chính (VD: gialai.today)', selected.domain);
    slogan = await promptUser('5. Khẩu hiệu / Slogan chính', selected.slogan);
    tagline = await promptUser('6. Tagline định vị', selected.tagline);
    company = await promptUser('7. Tên đơn vị chủ quản / Cổng xúc tiến', selected.companyLegalName);
    primaryColor = await promptUser('8. Mã màu chủ đạo HEX (VD: #15803D)', selected.primaryColor);
    hotline = await promptUser('9. Số điện thoại Hotline', selected.hotline);
    email = await promptUser('10. Email liên hệ chính', `contact@${domain}`);
    aiName = await promptUser('11. Tên Trợ lý Trí tuệ nhân tạo AI', `AI ${province} Assistant`);
  }

  const slug = brandShort.toLowerCase().replace(/[^a-z0-9]/g, '');
  const slugDashed = brandName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

  console.log('\n🔄 Đang tiến hành đồng bộ nhận diện thương hiệu sang toàn bộ codebase...\n');

  // 1. Cập nhật frontend/src/brand.config.js
  updateFile('frontend/src/brand.config.js', content => {
    return content
      .replace(/brandName:\s*'.*?'/g, `brandName: '${brandName}'`)
      .replace(/brandShortName:\s*'.*?'/g, `brandShortName: '${brandShort}'`)
      .replace(/platformName:\s*'.*?'/g, `platformName: '${brandName} Digital Platform'`)
      .replace(/companyLegalName:\s*'.*?'/g, `companyLegalName: '${company}'`)
      .replace(/slogan:\s*'.*?'/g, `slogan: '${slogan}'`)
      .replace(/tagline:\s*'.*?'/g, `tagline: '${tagline}'`)
      .replace(/domain:\s*'.*?'/g, `domain: '${domain}'`)
      .replace(/baseUrl:\s*'.*?'/g, `baseUrl: 'https://${domain}'`)
      .replace(/demoUrl:\s*'.*?'/g, `demoUrl: 'https://dev.${domain}'`)
      .replace(/hotline:\s*'.*?'/g, `hotline: '${hotline}'`)
      .replace(/email:\s*'.*?'/g, `email: '${email}'`)
      .replace(/supportEmail:\s*'.*?'/g, `supportEmail: 'support@${domain}'`)
      .replace(/forestGreen:\s*'.*?'/g, `forestGreen: '${primaryColor}'`)
      .replace(/primary:\s*'.*?'/g, `primary: '${primaryColor}'`)
      .replace(/name:\s*'AI .*?'/g, `name: '${aiName}'`)
      .replace(/shortName:\s*'.*?AI.*?'/g, `shortName: '${brandShort} AI'`);
  });

  // 2. Cập nhật config/brand.config.js (Backend)
  updateFile('config/brand.config.js', content => {
    return content
      .replace(/appName:\s*process\.env\.APP_NAME \|\|\s*'.*?'/g, `appName: process.env.APP_NAME || '${brandName} Platform'`)
      .replace(/brandName:\s*process\.env\.BRAND_NAME \|\|\s*'.*?'/g, `brandName: process.env.BRAND_NAME || '${brandName}'`)
      .replace(/brandShortName:\s*process\.env\.BRAND_SHORT_NAME \|\|\s*'.*?'/g, `brandShortName: process.env.BRAND_SHORT_NAME || '${brandShort}'`)
      .replace(/province:\s*process\.env\.PROVINCE \|\|\s*'.*?'/g, `province: process.env.PROVINCE || '${province}'`)
      .replace(/slogan:\s*process\.env\.SLOGAN \|\|\s*'.*?'/g, `slogan: process.env.SLOGAN || '${slogan}'`)
      .replace(/tagline:\s*process\.env\.TAGLINE \|\|\s*'.*?'/g, `tagline: process.env.TAGLINE || '${tagline}'`)
      .replace(/domain:\s*process\.env\.DOMAIN \|\|\s*'.*?'/g, `domain: process.env.DOMAIN || '${domain}'`)
      .replace(/siteUrl:\s*process\.env\.SITE_URL \|\|\s*'.*?'/g, `siteUrl: process.env.SITE_URL || 'https://${domain}'`)
      .replace(/primary:\s*process\.env\.COLOR_PRIMARY \|\|\s*'.*?'/g, `primary: process.env.COLOR_PRIMARY || '${primaryColor}'`)
      .replace(/agentName:\s*process\.env\.AI_AGENT_NAME \|\|\s*'.*?'/g, `agentName: process.env.AI_AGENT_NAME || '${aiName}'`)
      .replace(/hotline:\s*process\.env\.HOTLINE \|\|\s*'.*?'/g, `hotline: process.env.HOTLINE || '${hotline}'`)
      .replace(/email:\s*process\.env\.CONTACT_EMAIL \|\|\s*'.*?'/g, `email: process.env.CONTACT_EMAIL || '${email}'`)
      .replace(/supportEmail:\s*process\.env\.SUPPORT_EMAIL \|\|\s*'.*?'/g, `supportEmail: process.env.SUPPORT_EMAIL || 'support@${domain}'`);
  });

  // 3. Cập nhật package.json
  updateFile('package.json', content => {
    try {
      const json = JSON.parse(content);
      json.name = slugDashed;
      json.description = `${brandName} — Cổng thông tin, dữ liệu, du lịch và kết nối xúc tiến đầu tư ${province}`;
      json.scripts = json.scripts || {};
      json.scripts.pm2 = `pm2 start ecosystem.config.js`;
      return JSON.stringify(json, null, 2) + '\n';
    } catch (e) {
      return content;
    }
  });

  // 4. Cập nhật ecosystem.config.js
  updateFile('ecosystem.config.js', content => {
    return content.replace(/name\s*:\s*'.*?'/g, `name        : '${slugDashed}-prod'`);
  });

  // 5. Cập nhật .env.example
  updateFile('.env.example', content => {
    return content
      .replace(/APP_NAME=.*/g, `APP_NAME=${brandName} Platform`)
      .replace(/BRAND_NAME=.*/g, `BRAND_NAME=${brandName}`)
      .replace(/BRAND_SHORT_NAME=.*/g, `BRAND_SHORT_NAME=${brandShort}`)
      .replace(/PROVINCE=.*/g, `PROVINCE=${province}`)
      .replace(/SITE_URL=.*/g, `SITE_URL=https://${domain}`)
      .replace(/AI_AGENT_NAME=.*/g, `AI_AGENT_NAME=${aiName}`)
      .replace(/SUPPORT_EMAIL=.*/g, `SUPPORT_EMAIL=support@${domain}`);
  });

  // 6. Cập nhật frontend/index.html & public/manifest.json
  updateFile('frontend/index.html', content => {
    return content
      .replace(/<title>.*?<\/title>/g, `<title>${brandName} — Cổng thông tin, dữ liệu và kết nối đầu tư ${province}</title>`)
      .replace(/<meta name="apple-mobile-web-app-title" content=".*?" \/>/g, `<meta name="apple-mobile-web-app-title" content="${brandName}" />`);
  });

  updateFile('public/manifest.json', content => {
    try {
      const manifest = JSON.parse(content);
      manifest.name = `${brandName} — Cổng thông tin & Xúc tiến Đầu tư ${province}`;
      manifest.short_name = brandShort;
      manifest.description = `Hệ sinh thái số kết nối dữ liệu kinh tế, du lịch và đầu tư ${province}`;
      manifest.theme_color = primaryColor;
      return JSON.stringify(manifest, null, 2) + '\n';
    } catch (e) {
      return content;
    }
  });

  console.log('\n══════════════════════════════════════════════════════════════════════');
  console.log(`🎉 ĐỒNG BỘ THƯƠNG HIỆU THÀNH CÔNG CHO [${brandName}]!`);
  console.log('══════════════════════════════════════════════════════════════════════');
  console.log(`  • Tên thương hiệu : ${brandName} (${brandShort})`);
  console.log(`  • Địa bàn         : ${province} (${region})`);
  console.log(`  • Tên miền chính  : https://${domain}`);
  console.log(`  • Khẩu hiệu       : ${slogan}`);
  console.log(`  • Màu chủ đạo HEX : ${primaryColor}`);
  console.log(`  • Trợ lý AI       : ${aiName}`);
  console.log(`  • Hotline / Email : ${hotline} | ${email}`);
  console.log('══════════════════════════════════════════════════════════════════════');
  console.log('\n🚀 CÁC BƯỚC TIẾP THEO ĐỂ VẬN HÀNH DỰ ÁN MỚI:');
  console.log('  1. Cung cấp file ảnh logo mới vào: public/ (logo, favicon)');
  console.log('  2. Cấu hình file .env từ .env.example (Database, Port, Gemini API Key)');
  console.log('  3. Build lại frontend để áp dụng nhận diện:');
  console.log('     npm run build --prefix frontend');
  console.log('  4. Khởi động lại máy chủ:');
  console.log('     node server.js   (hoặc: pm2 restart all)\n');
}

main().catch(err => {
  console.error('❌ Lỗi khi thực thi script rebrand:', err);
  process.exit(1);
});
