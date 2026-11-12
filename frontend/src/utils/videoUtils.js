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

// Chuyển đổi bất kỳ link video hợp lệ nào sang thông tin nhúng và định dạng khung hình (ngang 16:9, dọc 9:16, vuông 1:1)
// để hiển thị co giãn vừa vặn, không bị lệch hoặc cắt xén
export const resolveVideoEmbed = (rawInput) => {
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

  // Xác định định dạng khung hình của video:
  // - Dọc (vertical: 9/16): Facebook Reels (/reel/), YouTube Shorts (/shorts/), TikTok
  // - Vuông (square: 1/1): Video vuông (chứa width=476&height=476 hoặc 1:1)
  // - Chuẩn ngang (widescreen: 16/9): YouTube thông thường, Vimeo, v.v.
  let isVertical = lower.includes('/reel/') || lower.includes('/reels/') || lower.includes('/shorts/') || lower.includes('tiktok.com');
  let isSquare = !isVertical && (rawLower.includes('height=476') && rawLower.includes('width=476'));

  // 1. YouTube
  const ytId = extractYouTubeId(clean);
  if (ytId) {
    const isShorts = lower.includes('/shorts/');
    return {
      type: 'iframe',
      src: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`,
      format: isShorts ? 'vertical' : 'widescreen',
      aspectRatio: isShorts ? '9 / 16' : '16 / 9',
      modalMaxWidth: isShorts ? '440px' : '860px'
    };
  }

  // 2. Facebook (Reels, Videos, Watch, Facebook Plugin)
  if (clean.includes('facebook.com/') || clean.includes('fb.watch/')) {
    return {
      type: 'iframe',
      src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(clean)}&show_text=false&autoplay=true`,
      format: isVertical ? 'vertical' : isSquare ? 'square' : 'widescreen',
      aspectRatio: isVertical ? '9 / 16' : isSquare ? '1 / 1' : '16 / 9',
      modalMaxWidth: isVertical ? '440px' : isSquare ? '540px' : '860px'
    };
  }

  // 3. Google Drive
  const driveMatch = clean.match(/drive\.google\.com\/file\/d\/([^/]+)/i) || clean.match(/drive\.google\.com\/open\?id=([^&]+)/i);
  if (driveMatch && driveMatch[1]) {
    return {
      type: 'iframe',
      src: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      format: 'widescreen',
      aspectRatio: '16 / 9',
      modalMaxWidth: '860px'
    };
  }

  // 4. Vimeo
  const vimeoMatch = clean.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'iframe',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
      format: 'widescreen',
      aspectRatio: '16 / 9',
      modalMaxWidth: '860px'
    };
  }

  // 5. File video trực tiếp (.mp4, .webm, .ogg, .mov)
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(clean)) {
    return {
      type: 'video',
      src: clean,
      format: 'direct',
      aspectRatio: 'auto',
      modalMaxWidth: isVertical ? '460px' : '860px'
    };
  }

  // 6. Link nhúng iframe khác
  return {
    type: 'iframe',
    src: clean,
    format: isVertical ? 'vertical' : isSquare ? 'square' : 'widescreen',
    aspectRatio: isVertical ? '9 / 16' : isSquare ? '1 / 1' : '16 / 9',
    modalMaxWidth: isVertical ? '440px' : isSquare ? '540px' : '860px'
  };
};
