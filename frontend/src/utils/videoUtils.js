// Làm sạch và bóc tách URL video chuẩn từ bất kỳ định dạng nào (iframe, Facebook video.php, link trực tiếp...)
export const cleanVideoUrl = (rawInput) => {
  if (!rawInput || typeof rawInput !== 'string') return '';
  let url = rawInput.trim();

  // Nếu người dùng dán thẻ <iframe ... src="...">
  const iframeMatch = url.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    url = iframeMatch[1].trim();
  }

  // Nếu là plugin nhúng Facebook plugins/video.php?href=...
  if (url.includes('facebook.com/plugins/video.php')) {
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https:${url}`);
      const hrefParam = parsed.searchParams.get('href');
      if (hrefParam) {
        url = decodeURIComponent(hrefParam);
      }
    } catch (_) {}
  }

  return url;
};

// Trích xuất YouTube ID nếu là link YouTube để tự động lấy ảnh bìa hoặc tạo link nhúng
export const extractYouTubeId = (inputUrl) => {
  if (!inputUrl || typeof inputUrl !== 'string') return null;
  const url = cleanVideoUrl(inputUrl);
  const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
};

// Lấy ảnh bìa thumbnail mặc định của video:
// 1. Nếu Admin có tải ảnh riêng hoặc database có thumbnail_url -> hiển thị ảnh đó
// 2. Nếu là YouTube -> lấy trực tiếp từ YouTube CDN (hqdefault.jpg)
// 3. Nếu là Facebook / Vimeo / nguồn khác -> gọi endpoint backend để lấy thumbnail gốc (không thay bằng ảnh tạm của web)
export const getVideoDisplayThumbnail = (video) => {
  if (video?.thumbnail_url && String(video.thumbnail_url).trim()) {
    return String(video.thumbnail_url).trim();
  }

  const rawUrl = video?.video_url || '';
  const clean = cleanVideoUrl(rawUrl);

  const ytId = extractYouTubeId(clean);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }

  if (clean && clean.startsWith('http')) {
    // Gọi endpoint backend với redirect=1 để lấy trực tiếp ảnh thumbnail gốc của video
    return `/api/video-thumbnail?url=${encodeURIComponent(clean)}&redirect=1`;
  }

  return '';
};

// Chuyển đổi bất kỳ link video hợp lệ nào sang thông tin nhúng và định dạng khung hình (ngang 16:9, dọc 9:16, vuông 1:1, 4:5)
// để hiển thị co giãn vừa vặn, không bị thừa khoảng đen hoặc cắt xén
export const resolveVideoEmbed = (rawInput, explicitAspectRatio = 'auto') => {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      type: 'unknown',
      src: '',
      format: 'widescreen',
      aspectRatio: '16 / 9',
      modalMaxWidth: '860px'
    };
  }

  const clean = cleanVideoUrl(rawInput);
  const lower = clean.toLowerCase();
  const rawLower = String(rawInput).toLowerCase();

  // 1. Kiểm tra nếu có thiết lập thủ công tỷ lệ khung hình từ Admin
  let forcedFormat = null;
  let forcedRatio = null;
  let forcedMaxWidth = null;

  const exp = String(explicitAspectRatio || 'auto').toLowerCase().trim();
  if (exp === '1:1' || exp === '1/1' || exp === 'square') {
    forcedFormat = 'square';
    forcedRatio = '1 / 1';
    forcedMaxWidth = '520px';
  } else if (exp === '9:16' || exp === '9/16' || exp === 'vertical') {
    forcedFormat = 'vertical';
    forcedRatio = '9 / 16';
    forcedMaxWidth = '430px';
  } else if (exp === '4:5' || exp === '4/5') {
    forcedFormat = 'vertical';
    forcedRatio = '4 / 5';
    forcedMaxWidth = '460px';
  } else if (exp === '16:9' || exp === '16/9' || exp === 'widescreen') {
    forcedFormat = 'widescreen';
    forcedRatio = '16 / 9';
    forcedMaxWidth = '860px';
  }

  // 2. Nếu là 'auto', tự động bóc tách width/height từ mã nhúng hoặc query param
  let autoFormat = 'widescreen';
  let autoRatio = '16 / 9';
  let autoMaxWidth = '860px';

  const widthMatch = rawLower.match(/(?:width=["']?|width=)(\d+)/i);
  const heightMatch = rawLower.match(/(?:height=["']?|height=)(\d+)/i);
  if (widthMatch && heightMatch) {
    const w = parseInt(widthMatch[1], 10);
    const h = parseInt(heightMatch[1], 10);
    if (w > 0 && h > 0) {
      const r = w / h;
      if (Math.abs(r - 1) <= 0.15) {
        autoFormat = 'square';
        autoRatio = '1 / 1';
        autoMaxWidth = '520px';
      } else if (r < 0.72) {
        autoFormat = 'vertical';
        autoRatio = '9 / 16';
        autoMaxWidth = '430px';
      } else if (r < 0.95) {
        autoFormat = 'vertical';
        autoRatio = '4 / 5';
        autoMaxWidth = '460px';
      } else {
        autoFormat = 'widescreen';
        autoRatio = '16 / 9';
        autoMaxWidth = '860px';
      }
    }
  } else {
    // Nếu không có kích thước cụ thể trong chuỗi nhúng:
    const isShorts = lower.includes('/shorts/');
    const isTikTok = lower.includes('tiktok.com');
    const isFbReel = lower.includes('/reel/') || lower.includes('/reels/');

    if (isShorts || isTikTok) {
      autoFormat = 'vertical';
      autoRatio = '9 / 16';
      autoMaxWidth = '430px';
    } else if (isFbReel) {
      // Facebook Reels thường là vuông 1:1 hoặc 4:5 hoặc dọc 9:16.
      // Mặc định vuông 1:1 vừa vặn khung hình nhất, hạn chế tối đa khoảng đen
      autoFormat = 'square';
      autoRatio = '1 / 1';
      autoMaxWidth = '520px';
    } else {
      autoFormat = 'widescreen';
      autoRatio = '16 / 9';
      autoMaxWidth = '860px';
    }
  }

  const finalFormat = forcedFormat || autoFormat;
  const finalRatio = forcedRatio || autoRatio;
  const finalMaxWidth = forcedMaxWidth || autoMaxWidth;

  // 1. YouTube
  const ytId = extractYouTubeId(clean);
  if (ytId) {
    return {
      type: 'iframe',
      src: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`,
      format: finalFormat,
      aspectRatio: finalRatio,
      modalMaxWidth: finalMaxWidth
    };
  }

  // 2. Facebook (Reels, Videos, Watch, Facebook Plugin)
  if (clean.includes('facebook.com/') || clean.includes('fb.watch/')) {
    return {
      type: 'iframe',
      src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(clean)}&show_text=false&autoplay=true&adapt_container_width=true`,
      format: finalFormat,
      aspectRatio: finalRatio,
      modalMaxWidth: finalMaxWidth
    };
  }

  // 3. Google Drive
  const driveMatch = clean.match(/drive\.google\.com\/file\/d\/([^/]+)/i) || clean.match(/drive\.google\.com\/open\?id=([^&]+)/i);
  if (driveMatch && driveMatch[1]) {
    return {
      type: 'iframe',
      src: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      format: finalFormat,
      aspectRatio: finalRatio,
      modalMaxWidth: finalMaxWidth
    };
  }

  // 4. Vimeo
  const vimeoMatch = clean.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'iframe',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
      format: finalFormat,
      aspectRatio: finalRatio,
      modalMaxWidth: finalMaxWidth
    };
  }

  // 5. File video trực tiếp (.mp4, .webm, .ogg, .mov)
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(clean)) {
    return {
      type: 'video',
      src: clean,
      format: 'direct',
      aspectRatio: 'auto',
      modalMaxWidth: finalMaxWidth
    };
  }

  // 6. Link nhúng iframe khác
  return {
    type: 'iframe',
    src: clean,
    format: finalFormat,
    aspectRatio: finalRatio,
    modalMaxWidth: finalMaxWidth
  };
};
