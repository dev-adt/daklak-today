import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { usePWA } from '../contexts/PWAContext';
import brandConfig from '../brand.config';

export const Footer = () => {
  const { currentLang } = useTranslation();
  const { isInstalled, installApp } = usePWA();

  return (
    <footer style={{
      backgroundColor: '#1C0F08',
      backgroundImage: 'linear-gradient(180deg, #26160E 0%, #150B06 100%)',
      color: '#BFAEA2',
      padding: '3.5rem 0 1.5rem',
      fontSize: '12.5px',
      borderTop: '1px solid rgba(213, 163, 63, 0.25)',
      lineHeight: '1.65'
    }}>
      <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Main 4-Column Footer Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Column 1: Logo & Brand Title */}
          <div>
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #7A3E1D 0%, #D5A33F 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: '900',
                  fontSize: '16px',
                  border: '1px solid rgba(213, 163, 63, 0.4)'
                }}>
                  DL
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Be Vietnam Pro', 'Outfit', sans-serif",
                    fontSize: '20px',
                    fontWeight: '800',
                    color: '#ffffff',
                    letterSpacing: '-0.3px',
                    lineHeight: '1.1'
                  }}>
                    DakLak<span style={{ color: '#D5A33F' }}>.today</span>
                  </div>
                  <div style={{
                    fontSize: '9px',
                    fontWeight: '700',
                    color: '#D5A33F',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    marginTop: '2px'
                  }}>
                    {currentLang === 'en' ? 'Information, Data & Investment' : 'Cổng thông tin, Dữ liệu & Đầu tư'}
                  </div>
                </div>
              </div>
            </Link>
            <div style={{
              fontSize: '12px',
              color: '#d1c5bc',
              lineHeight: '1.6',
              marginTop: '0.5rem',
              marginBottom: '1rem'
            }}>
              {brandConfig.description}
            </div>
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={installApp}
                title="Cài đặt ứng dụng DakLak.today (PWA)"
                style={{
                  background: 'rgba(213, 163, 63, 0.15)',
                  border: '1px solid rgba(213, 163, 63, 0.4)',
                  color: '#F3C562',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.18s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(213, 163, 63, 0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(213, 163, 63, 0.15)'; }}
              >
                <i className="ti ti-device-mobile-down"></i>
                <span>{isInstalled ? (currentLang === 'en' ? '✓ PWA App Installed' : '✓ Ứng dụng PWA đã cài') : (currentLang === 'en' ? 'Install PWA App' : 'Cài đặt ứng dụng PWA')}</span>
              </button>

              <Link
                to="/guide"
                title={currentLang === 'en' ? 'System User Guide' : 'Hướng dẫn sử dụng hệ thống'}
                style={{
                  background: 'rgba(168, 69, 36, 0.18)',
                  border: '1px solid rgba(168, 69, 36, 0.45)',
                  color: '#f0987d',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.18s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(168, 69, 36, 0.35)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(168, 69, 36, 0.18)'; }}
              >
                <i className="ti ti-book"></i>
                <span>{currentLang === 'en' ? 'User Guide' : 'Hướng dẫn sử dụng'}</span>
              </Link>
            </div>
          </div>

          {/* Column 2: Agency & Platform Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div>
              <span style={{ color: '#8c7a6e' }}>{currentLang === 'en' ? 'Operating Organization:' : 'Đơn vị phát triển & vận hành:'}</span>{' '}
              <strong style={{ color: '#f1f5f9' }}>{brandConfig.companyLegalName}</strong>
            </div>
            <div>
              <span style={{ color: '#8c7a6e' }}>{currentLang === 'en' ? 'Operating Platform:' : 'Nền tảng vận hành:'}</span>{' '}
              <strong style={{ color: '#f1f5f9' }}>{brandConfig.platformName}</strong>
            </div>
            <div>
              <span style={{ color: '#8c7a6e' }}>{currentLang === 'en' ? 'Development Vision:' : 'Định hướng phát triển:'}</span>{' '}
              <span style={{ color: '#cbd5e1' }}>{brandConfig.tagline}</span>
            </div>
            <div style={{ marginTop: '4px' }}>
              <span style={{ color: '#8c7a6e' }}>{currentLang === 'en' ? 'Technology Partner:' : 'Đơn vị công nghệ:'}</span>{' '}
              <span style={{ color: '#f1ece6' }}>{brandConfig.partnerLegalName}</span>
            </div>
          </div>

          {/* Column 3: Contact & Support */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '12px' }}>
            <div>
              <span style={{ color: '#8c7a6e' }}>{currentLang === 'en' ? 'Platform Management:' : 'Ban Quản trị Cổng thông tin:'}</span>{' '}
              <strong style={{ color: '#f1f5f9' }}>{currentLang === 'en' ? `Editorial Board of ${brandConfig.brandShortName}` : `Ban Biên Tập ${brandConfig.brandShortName}`}</strong>
            </div>
            <div>
              <span style={{ color: '#8c7a6e' }}>{currentLang === 'en' ? 'Working Hours:' : 'Giờ làm việc:'}</span>{' '}
              <span style={{ color: '#cbd5e1' }}>{brandConfig.contact.workingHours}</span>
            </div>
            <div style={{ marginTop: '2px' }}>
              <span style={{ color: '#8c7a6e' }}>{currentLang === 'en' ? 'Support Hotline:' : 'Hotline hỗ trợ:'}</span>{' '}
              <span style={{ color: '#f3c562', fontWeight: '700' }}>{brandConfig.contact.hotline}</span>
            </div>
            <div>
              <span style={{ color: '#8c7a6e' }}>{currentLang === 'en' ? 'Mobile / Zalo:' : 'Di động / Zalo:'}</span>{' '}
              <span style={{ color: '#cbd5e1' }}>{brandConfig.contact.phone}</span>
            </div>
            <div>
              <span style={{ color: '#8c7a6e' }}>Email:</span>{' '}
              <a href={`mailto:${brandConfig.contact.email}`} style={{ color: '#f3c562', textDecoration: 'none' }}>{brandConfig.contact.email}</a>
            </div>
          </div>

          {/* Column 4: Address & Social Media */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '13px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              {currentLang === 'en' ? 'Headquarters & Connection' : 'Trụ sở & Xúc tiến Đầu tư'}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <i className="ti ti-map-pin" style={{ color: '#D5A33F', marginTop: '3px', flexShrink: 0 }}></i>
              <span><strong>{currentLang === 'en' ? 'Address:' : 'Địa chỉ:'}</strong> {brandConfig.contact.address}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
              <a href={`tel:${brandConfig.contact.phone.replace(/\s+/g, '')}`} style={{ color: '#f3c562', textDecoration: 'none', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="ti ti-phone"></i> {brandConfig.contact.phone}
              </a>
              <span style={{ color: '#64544b' }}>|</span>
              <a href={`mailto:${brandConfig.contact.supportEmail}`} style={{ color: '#dedede', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="ti ti-mail"></i> {brandConfig.contact.supportEmail}
              </a>
            </div>

            {/* Social Media Links */}
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '11px', color: '#8c7a6e', marginBottom: '6px' }}>
                {currentLang === 'en' ? 'Follow on social platforms:' : 'Theo dõi trên các nền tảng số:'}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a 
                  href={brandConfig.socials.facebook} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', textDecoration: 'none', transition: 'transform 0.2s' }}
                  title={`Facebook ${brandConfig.brandShortName}`}
                >
                  <i className="ti ti-brand-facebook" style={{ fontSize: '16px' }}></i>
                </a>
                <a 
                  href={brandConfig.socials.youtube} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', textDecoration: 'none', transition: 'transform 0.2s' }}
                  title={`YouTube ${brandConfig.brandShortName}`}
                >
                  <i className="ti ti-brand-youtube" style={{ fontSize: '16px' }}></i>
                </a>
                <Link 
                  to="/ai-chat"
                  style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(213, 163, 63, 0.2)', border: '1px solid #D5A33F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D5A33F', textDecoration: 'none', transition: 'transform 0.2s' }}
                  title={brandConfig.aiAssistant.name}
                >
                  <i className="ti ti-sparkles" style={{ fontSize: '15px' }}></i>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontSize: '12px',
          color: '#8c7a6e'
        }}>
          <div>
            {brandConfig.contact.copyright}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
            <Link
              to="/guide"
              style={{
                color: '#f3c562',
                textDecoration: 'none',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 12px',
                borderRadius: '6px',
                background: 'rgba(213, 163, 63, 0.12)',
                border: '1px solid rgba(213, 163, 63, 0.35)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(213, 163, 63, 0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(213, 163, 63, 0.12)'; }}
            >
              <i className="ti ti-book" style={{ fontSize: '14px' }}></i>
              <span>{currentLang === 'en' ? 'User Guide' : 'Hướng dẫn sử dụng'}</span>
            </Link>
            <Link to="/posts" style={{ color: '#BFAEA2', textDecoration: 'none' }}>
              {currentLang === 'en' ? 'Articles & News' : 'Tin tức & Cơ hội'}
            </Link>
            <Link to="/members" style={{ color: '#BFAEA2', textDecoration: 'none' }}>
              {currentLang === 'en' ? 'Enterprises' : 'Doanh nghiệp'}
            </Link>
            <Link to="/events" style={{ color: '#BFAEA2', textDecoration: 'none' }}>
              {currentLang === 'en' ? 'Events' : 'Sự kiện'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
