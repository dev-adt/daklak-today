import React from 'react';
import brandConfig from '../brand.config';

/**
 * High-Impact Spotlight Banner
 * Styled with Central Highlands Deep Coffee, Bazan Earth, and Gong Bronze Gold theme.
 */
export const SpotlightBanner = ({
  badgeText = 'SỨ MỆNH CHIẾN LƯỢC • DAKLAK.TODAY',
  title = 'DakLak.today — Từ đất bazan đến cơ hội toàn cầu',
  subtitle = 'Nền tảng số kết nối con người, doanh nghiệp, sản phẩm, du lịch, dữ liệu và cơ hội đầu tư của tỉnh Đắk Lắk.',
  buttonText = 'Khám phá Hệ sinh thái',
  link = '/posts',
  variant = 'primary'
}) => {
  return (
    <div style={{
      width: '100%',
      position: 'relative',
      background: 'linear-gradient(135deg, #1C0F08 0%, #3B2417 50%, #7A3E1D 100%)',
      color: '#FFFFFF',
      borderBottom: '2px solid rgba(213, 163, 63, 0.4)',
      boxShadow: '0 8px 30px rgba(28, 15, 8, 0.45), inset 0 1px 0 rgba(213, 163, 63, 0.25)',
      overflow: 'hidden',
      zIndex: 10
    }}>
      {/* Background Coffee Ring Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(rgba(213, 163, 63, 0.15) 1.2px, transparent 1.2px)',
        backgroundSize: '22px 22px',
        opacity: 0.6,
        pointerEvents: 'none'
      }} />

      {/* Glow Orbs */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '15%',
        width: '400px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(213, 163, 63, 0.22) 0%, rgba(38, 22, 14, 0) 70%)',
        pointerEvents: 'none',
        filter: 'blur(30px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-40%',
        right: '10%',
        width: '350px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(168, 69, 36, 0.25) 0%, rgba(38, 22, 14, 0) 70%)',
        pointerEvents: 'none',
        filter: 'blur(35px)'
      }} />

      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '1rem 1.5rem',
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        {/* Left Side: Badge + Title + Subtitle */}
        <div style={{ flex: '1 1 540px', minWidth: '280px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(213, 163, 63, 0.16)',
            border: '1px solid rgba(213, 163, 63, 0.45)',
            borderRadius: '9999px',
            padding: '3px 12px',
            marginBottom: '6px',
            boxShadow: '0 0 12px rgba(213, 163, 63, 0.2)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#D5A33F',
              boxShadow: '0 0 8px #D5A33F',
              display: 'inline-block'
            }} />
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#F3C562',
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              {badgeText}
            </span>
          </div>

          <h2 style={{
            fontFamily: "'Be Vietnam Pro', 'Outfit', sans-serif",
            fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)',
            fontWeight: '800',
            lineHeight: 1.3,
            color: '#FFFFFF',
            marginBottom: '4px',
            letterSpacing: '-0.02em',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)'
          }}>
            {title}
          </h2>

          <p style={{
            fontSize: 'clamp(12px, 1.4vw, 13px)',
            color: '#E6DCD2',
            lineHeight: 1.45,
            margin: 0,
            opacity: 0.95
          }}>
            {subtitle}
          </p>
        </div>

        {/* Right Side: CTA Button */}
        <div style={{ flexShrink: 0 }}>
          <a
            href={link}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '9px',
              padding: '10px 22px',
              background: 'linear-gradient(135deg, #D5A33F 0%, #E6B757 50%, #D5A33F 100%)',
              color: '#26160E',
              fontWeight: '800',
              fontSize: '13px',
              borderRadius: '10px',
              textDecoration: 'none',
              boxShadow: '0 4px 18px rgba(213, 163, 63, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
              transition: 'all 0.22s ease',
              letterSpacing: '0.01em',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(213, 163, 63, 0.55)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 18px rgba(213, 163, 63, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
            }}
          >
            <span>{buttonText}</span>
            <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px' }} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default SpotlightBanner;
