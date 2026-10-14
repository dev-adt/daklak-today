import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { useTranslation } from '../contexts/LanguageContext';

export const NotFound = () => {
  const navigate = useNavigate();
  const { currentLang } = useTranslation();

  return (
    <div className="public-body" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F7F1E8' }}>
      <SEOHead 
        title={currentLang === 'en' ? '404 - Page Not Found | DakLak.today' : '404 - Không Tìm Thấy Trang | DakLak.today'}
        description={currentLang === 'en' ? 'The requested page could not be found on DakLak.today.' : 'Liên kết bạn yêu cầu không tồn tại hoặc đã được chuyển sang địa chỉ mới trên DakLak.today.'}
      />
      <Navbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
        <div style={{
          maxWidth: '620px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '48px 36px',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(59, 36, 23, 0.12), 0 0 0 1px rgba(122, 62, 29, 0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle Accent Glow */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '240px',
            height: '140px',
            background: 'radial-gradient(circle, rgba(213, 163, 63, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* 404 Large Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            backgroundColor: 'rgba(168, 69, 36, 0.1)',
            color: '#A84524',
            fontSize: '44px',
            marginBottom: '20px',
            boxShadow: '0 8px 24px rgba(168, 69, 36, 0.15)'
          }}>
            <i className="ti ti-compass-off" />
          </div>

          <div style={{
            display: 'inline-block',
            padding: '5px 14px',
            borderRadius: '20px',
            backgroundColor: 'rgba(213, 163, 63, 0.15)',
            border: '1px solid rgba(213, 163, 63, 0.35)',
            color: '#B3832B',
            fontWeight: 700,
            fontSize: '12px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '14px'
          }}>
            Error 404 • Not Found
          </div>

          <h1 style={{
            fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)',
            fontWeight: 800,
            color: '#26160E',
            lineHeight: 1.3,
            marginBottom: '12px'
          }}>
            {currentLang === 'en' ? 'Page Not Found' : 'Không Tìm Thấy Trang Yêu Cầu'}
          </h1>

          <p style={{
            fontSize: '14.5px',
            color: '#6B5B52',
            lineHeight: 1.65,
            maxWidth: '480px',
            margin: '0 auto 28px'
          }}>
            {currentLang === 'en'
              ? 'The link you followed may be broken, or the page may have been removed or moved to a new destination.'
              : 'Đường dẫn bạn vừa truy cập không tồn tại, đã bị đổi tên hoặc tạm thời gỡ bỏ khỏi hệ thống DakLak.today.'}
          </p>

          {/* Quick Action Navigation Buttons */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Link
              to="/"
              style={{
                backgroundColor: '#A84524',
                backgroundImage: 'linear-gradient(135deg, #A84524 0%, #7A3E1D 100%)',
                color: '#FFFFFF',
                padding: '12px 24px',
                borderRadius: '30px',
                fontWeight: 700,
                fontSize: '13.5px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(168, 69, 36, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              <i className="ti ti-home" />
              <span>{currentLang === 'en' ? 'Back to Home' : 'Về Trang Chủ'}</span>
            </Link>

            <Link
              to="/search"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#3B2417',
                border: '1.5px solid #D8C8B8',
                padding: '11px 22px',
                borderRadius: '30px',
                fontWeight: 600,
                fontSize: '13.5px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <i className="ti ti-search" />
              <span>{currentLang === 'en' ? 'Search Articles' : 'Tìm kiếm bài viết'}</span>
            </Link>

            <Link
              to="/ai-chat"
              style={{
                backgroundColor: 'rgba(213, 163, 63, 0.12)',
                color: '#8A5D1A',
                border: '1.5px solid rgba(213, 163, 63, 0.4)',
                padding: '11px 22px',
                borderRadius: '30px',
                fontWeight: 700,
                fontSize: '13.5px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <i className="ti ti-robot" />
              <span>{currentLang === 'en' ? 'Ask AI Assistant' : 'Hỏi Trợ lý AI'}</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
