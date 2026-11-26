import React, { useState, useEffect } from 'react';
import {
  cleanVideoUrl,
  extractYouTubeId,
  getVideoDisplayThumbnail as getBaseThumbnail
} from '../utils/videoUtils';

export { cleanVideoUrl, extractYouTubeId };

// Kiểm tra xem video có phải dạng dọc (9:16) hay vuông (1:1) hay 4:5 hay ngang (16:9)
export const detectRatioNumeric = (video) => {
  const exp = String(video?.aspect_ratio || 'auto').toLowerCase().trim();
  if (exp === '1:1' || exp === '1/1' || exp === 'square') return 1;
  if (exp === '9:16' || exp === '9/16' || exp === 'vertical') return 9 / 16;
  if (exp === '4:5' || exp === '4/5') return 4 / 5;
  if (exp === '16:9' || exp === '16/9' || exp === 'widescreen') return 16 / 9;

  const raw = String(video?.video_url || '').toLowerCase();
  const widthMatch = raw.match(/(?:width=["']?|width=)(\d+)/i);
  const heightMatch = raw.match(/(?:height=["']?|height=)(\d+)/i);
  if (widthMatch && heightMatch) {
    const w = parseInt(widthMatch[1], 10);
    const h = parseInt(heightMatch[1], 10);
    if (w > 0 && h > 0) return w / h;
  }

  if (raw.includes('youtube.com/shorts/') || raw.includes('tiktok.com/')) return 9 / 16;
  if (raw.includes('facebook.com/reel/') || raw.includes('facebook.com/reels/')) return 9 / 16;
  return 16 / 9;
};

// Lấy ảnh bìa hiển thị cho video (dùng videoUtils có hỗ trợ /api/video-thumbnail cho Facebook/Vimeo)
export const getVideoDisplayThumbnail = (video, fallbackImg = '/images/daklak/daklak_doi_ca_phe.jpg') => {
  const base = getBaseThumbnail(video);
  return base || fallbackImg;
};

// Chuyển đổi bất kỳ link video hợp lệ nào sang cấu trúc nhúng chuẩn kích thước
export const resolveVideoEmbed = (rawInput, widthPx = 760, heightPx = 428) => {
  if (!rawInput || typeof rawInput !== 'string') {
    return { type: 'unknown', src: '', originalUrl: '' };
  }
  let url = rawInput.trim();
  let originalUrl = url;

  // Nếu admin dán nguyên thẻ <iframe ...>
  const iframeMatch = url.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    url = iframeMatch[1].trim();
    originalUrl = url;
  }

  // 1. YouTube
  const ytId = extractYouTubeId(url);
  if (ytId) {
    return {
      type: 'iframe',
      src: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`,
      originalUrl: `https://www.youtube.com/watch?v=${ytId}`
    };
  }

  // 2. Google Drive
  const driveMatch =
    url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i) ||
    url.match(/drive\.google\.com\/open\?id=([^&]+)/i);
  if (driveMatch && driveMatch[1]) {
    return {
      type: 'iframe',
      src: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      originalUrl: url
    };
  }

  // 3. Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'iframe',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
      originalUrl: url
    };
  }

  // 4. Facebook Video / Reel / Watch (truyền đúng width & height thực tế để Facebook player tự co vừa khung)
  if (
    url.includes('facebook.com/') ||
    url.includes('fb.watch/')
  ) {
    // Nếu admin đã dán trực tiếp link plugins/video.php thì cập nhật lại width/height
    if (url.includes('facebook.com/plugins/video.php')) {
      try {
        const parsed = new URL(url);
        parsed.searchParams.set('width', String(Math.round(widthPx)));
        parsed.searchParams.set('height', String(Math.round(heightPx)));
        parsed.searchParams.set('show_text', 'false');
        return {
          type: 'iframe',
          src: parsed.toString(),
          originalUrl: parsed.searchParams.get('href') || url
        };
      } catch (_) {
        return { type: 'iframe', src: url, originalUrl: url };
      }
    }
    return {
      type: 'iframe',
      src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&width=${Math.round(widthPx)}&height=${Math.round(heightPx)}&show_text=false&autoplay=true`,
      originalUrl: url
    };
  }

  // 5. File video trực tiếp (.mp4, .webm, .ogg, .mov)
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
    return {
      type: 'video',
      src: url,
      originalUrl: url
    };
  }

  // 6. Bất kỳ link nhúng hợp lệ nào khác
  return {
    type: 'iframe',
    src: url,
    originalUrl: url
  };
};

export default function VideoPlayerModal({ video, onClose }) {
  const [viewport, setViewport] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1280,
    h: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!video) return null;

  const ratio = detectRatioNumeric(video);
  const hasFooterMeta = Boolean(video.summary || video.source);
  // Chừa không gian cho Header (~56px), Footer (~96px nếu có) và lề trên/dưới (~48px)
  const reservedVertical = 56 + (hasFooterMeta ? 96 : 24) + 48;
  const maxStageHeight = Math.max(240, Math.min(viewport.h - reservedVertical, 560));
  const maxModalWidth = Math.max(300, Math.min(viewport.w - 32, ratio < 0.9 ? 460 : ratio < 1.15 ? 540 : 860));

  // Co theo cả chiều rộng lẫn chiều cao cửa sổ để luôn hiển thị trọn vẹn khung hình & thanh điều khiển
  const widthByHeight = Math.round(maxStageHeight * ratio);
  const playerWidth = Math.min(maxModalWidth, widthByHeight);
  const playerHeight = Math.round(playerWidth / ratio);

  const embed = resolveVideoEmbed(video.video_url, playerWidth, playerHeight);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.85)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backdropFilter: 'blur(6px)',
        boxSizing: 'border-box'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          width: `${Math.max(playerWidth, Math.min(maxModalWidth, 420))}px`,
          maxWidth: '100%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid rgba(139, 90, 43, 0.14)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0
          }}
        >
          <h3
            style={{
              margin: 0,
              fontFamily: 'var(--font-title)',
              fontSize: '16.5px',
              fontWeight: 800,
              color: '#2C1810',
              lineHeight: 1.35,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={video.title}
          >
            {video.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {embed.originalUrl && (
              <a
                href={embed.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#92400E',
                  textDecoration: 'none',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  background: '#FEF3C7',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Mở video gốc ở tab mới"
              >
                <i className="ti ti-external-link"></i> Mở gốc
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng video"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: '#F3E5D0',
                color: '#3B2314',
                cursor: 'pointer',
                fontSize: '18px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className="ti ti-x"></i>
            </button>
          </div>
        </div>

        {/* Video Stage - luôn tự co vừa khít màn hình */}
        <div
          style={{
            background: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: `${playerHeight}px`,
            maxHeight: `${maxStageHeight}px`,
            overflow: 'hidden',
            flexShrink: 0
          }}
        >
          {embed.type === 'video' ? (
            <video
              src={embed.src}
              controls
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                background: '#000'
              }}
            />
          ) : (
            <iframe
              src={embed.src}
              title={video.title}
              width={playerWidth}
              height={playerHeight}
              scrolling="no"
              style={{
                width: `${playerWidth}px`,
                height: `${playerHeight}px`,
                maxWidth: '100%',
                maxHeight: '100%',
                border: 'none',
                overflow: 'hidden',
                display: 'block'
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
            />
          )}
        </div>

        {/* Footer Info (Nguồn & Tóm tắt nếu có) */}
        {hasFooterMeta && (
          <div
            style={{
              padding: '12px 18px',
              background: '#FBF8F3',
              overflowY: 'auto',
              maxHeight: '110px',
              borderTop: '1px solid rgba(139, 90, 43, 0.12)'
            }}
          >
            {video.source && (
              <div
                style={{
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#B45309',
                  marginBottom: video.summary ? '4px' : 0
                }}
              >
                Nguồn: {video.source}
              </div>
            )}
            {video.summary && (
              <p style={{ margin: 0, fontSize: '13.5px', color: '#4A3B32', lineHeight: 1.55 }}>
                {video.summary}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

