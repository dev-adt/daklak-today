import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import { usePWA } from '../contexts/PWAContext';
import brandConfig from '../brand.config';
import { getCategoryLabel, getSubCategoryLabel, CATEGORIES_DATA } from '../constants/categories';

export const Navbar = () => {
  const { role, user, logout } = useAuth();
  const { currentLang, changeLang, t, availableLanguages } = useTranslation();
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef(null);
  const currentLangObj = (availableLanguages || []).find(l => l.code === currentLang) || {
    code: currentLang,
    label: (currentLang || 'VI').toUpperCase(),
    name: 'Tiếng Việt',
    flag: '🇻🇳'
  };
  // Khởi tạo ngay lập tức từ bộ nhớ đệm hoặc CATEGORIES_DATA chuẩn để Header luôn hiện 0ms không bao giờ bị trắng
  const [categoriesList, setCategoriesList] = useState(() => {
    try {
      const cached = localStorage.getItem('dnvn_cached_categories');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return CATEGORIES_DATA;
  });
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [mobileExpandedCatId, setMobileExpandedCatId] = useState(null);
  const dropdownTimeoutRef = useRef(null);
  const navRef = useRef(null);
  const mobileToggleRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Đóng mobile menu hoặc dropdown khi nhấn phím Escape và trả focus về trigger (F-02)
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          if (mobileToggleRef.current) {
            mobileToggleRef.current.focus();
          }
        }
        if (activeDropdownId) {
          setActiveDropdownId(null);
        }
        if (langDropdownOpen) {
          setLangDropdownOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [mobileMenuOpen, activeDropdownId, langDropdownOpen]);

  // Đồng bộ động Chuyên mục & Lĩnh vực từ Backend / Database ngầm trong nền (SWR Pattern)
  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const res = await fetch(`/api/categories?_t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && isMounted) {
            // Sắp xếp theo order_index tăng dần do admin thiết lập
            const sorted = [...json.data].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
            setCategoriesList(sorted);
            try {
              localStorage.setItem('dnvn_cached_categories', JSON.stringify(sorted));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.warn('Navbar: Không thể tải danh mục từ API.', err.message);
      }
    };
    fetchCategories();

    // Lắng nghe sự kiện cập nhật từ trang Admin hoặc các tab khác
    const handleUpdate = () => fetchCategories();
    window.addEventListener('categories-updated', handleUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === 'dnvn_cached_categories' || !e.key) {
        fetchCategories();
      }
    });

    return () => { 
      isMounted = false; 
      window.removeEventListener('categories-updated', handleUpdate);
    };
  }, []);

  // Xử lý đóng dropdown khi click bên ngoài (hỗ trợ Touch & Click)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdownId(null);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Handle dropdown hover with debounce
  const handleMouseEnter = (catId) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdownId(catId);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdownId(null);
    }, 220);
  };

  // Toggle Dropdown cho Touchscreen & Keyboard
  const handleToggleDropdown = (catId, e) => {
    e.stopPropagation();
    setActiveDropdownId(prev => (prev === catId ? null : catId));
  };

  const handleKeyDown = (catId, e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveDropdownId(prev => (prev === catId ? null : catId));
    } else if (e.key === 'Escape') {
      setActiveDropdownId(null);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'DL';
    return name.trim().split(/\s+/).map(w => w[0]).join('').substring(0, 2).toUpperCase();
  };

  // Tên hiển thị đầy đủ trực tiếp từ Admin thiết lập có hỗ trợ song ngữ tức thì
  const getCategoryName = (cat) => {
    return getCategoryLabel(cat, currentLang);
  };

  const getSubName = (sub) => {
    return getSubCategoryLabel(sub, currentLang);
  };

  // Lấy danh sách chuyên mục con an toàn từ dữ liệu động
  const getSubList = (cat) => {
    if (!cat) return [];
    if (Array.isArray(cat.sub_categories) && cat.sub_categories.length > 0) {
      return cat.sub_categories;
    }
    if (Array.isArray(cat.subcategories) && cat.subcategories.length > 0) {
      return cat.subcategories;
    }
    if (typeof cat.subcategories === 'string') {
      try {
        const parsed = JSON.parse(cat.subcategories);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  return (
    <>
      <style>{`
        /* Reset and enforce immunity from any external styles */
        .dnvn-navbar-header {
          position: -webkit-sticky !important;
          position: sticky !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          z-index: 99999 !important;
          background: #26160E !important;
          background-image: linear-gradient(180deg, #22120A 0%, #160B06 100%) !important;
          border-bottom: 2px solid rgba(213, 163, 63, 0.35) !important;
          box-shadow: 0 4px 20px rgba(20, 10, 5, 0.65) !important;
          width: 100% !important;
          max-width: 100vw !important;
          box-sizing: border-box !important;
        }

        .dnvn-header-container {
          width: 100% !important;
          max-width: 1680px !important;
          margin: 0 auto !important;
          padding: 8px 18px !important;
          min-height: 72px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 10px !important;
          position: relative !important;
          box-sizing: border-box !important;
        }

        /* Brand Styling */
        .dnvn-brand-link {
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          text-decoration: none !important;
          flex-shrink: 0 !important;
        }

        .dnvn-brand-icon {
          width: 42px !important;
          height: 42px !important;
          border-radius: 10px !important;
          background: linear-gradient(135deg, #7A3E1D 0%, #D5A33F 100%) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: #ffffff !important;
          font-weight: 900 !important;
          font-size: 16px !important;
          border: 1.5px solid rgba(213, 163, 63, 0.45) !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35) !important;
          overflow: hidden !important;
          flex-shrink: 0 !important;
        }

        .dnvn-brand-icon-img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }

        .dnvn-brand-text-box {
          display: flex !important;
          flex-direction: column !important;
          line-height: 1.15 !important;
        }

        .dnvn-brand-title {
          font-family: 'Be Vietnam Pro', 'Outfit', sans-serif !important;
          font-weight: 800 !important;
          font-size: 19px !important;
          color: #ffffff !important;
          letter-spacing: -0.3px !important;
        }

        .dnvn-brand-subtitle {
          font-size: 8px !important;
          font-weight: 700 !important;
          color: #D5A33F !important;
          letter-spacing: 0.5px !important;
          text-transform: uppercase !important;
          margin-top: 2px !important;
        }

        /* Navigation Categories (Single row in center, allows text wrapping) */
        .dnvn-nav-categories {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          flex: 1 1 auto !important;
          margin: 0 6px !important;
          overflow: visible !important;
        }

        .dnvn-cat-wrapper {
          position: relative !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .dnvn-nav-item-btn {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: #F1ECE6 !important;
          text-decoration: none !important;
          font-weight: 650 !important;
          font-size: 14.5px !important;
          padding: 6px 10px !important;
          border-radius: 7px !important;
          transition: all 0.18s ease !important;
          cursor: pointer !important;
          background: transparent !important;
          border: 1px solid transparent !important;
          box-sizing: border-box !important;
          user-select: none !important;
          white-space: normal !important;
          word-break: normal !important;
          text-align: center !important;
          line-height: 1.25 !important;
          max-width: 145px !important;
          gap: 4px !important;
        }

        .dnvn-nav-item-btn:hover {
          color: #F3C562 !important;
          background-color: rgba(213, 163, 63, 0.16) !important;
          border-color: rgba(213, 163, 63, 0.35) !important;
        }

        .dnvn-nav-item-btn.active {
          color: #FFFFFF !important;
          background-color: rgba(168, 69, 36, 0.5) !important;
          border-bottom: 2px solid #D5A33F !important;
        }

        .dnvn-nav-text {
          white-space: normal !important;
          word-break: normal !important;
          display: inline !important;
          text-align: center !important;
        }

        .dnvn-dropdown-panel {
          position: absolute !important;
          top: calc(100% + 4px) !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          min-width: 250px !important;
          background-color: #2A170F !important;
          background-image: linear-gradient(180deg, #351E13 0%, #22120B 100%) !important;
          border: 1px solid rgba(213, 163, 63, 0.35) !important;
          border-radius: 10px !important;
          padding: 8px 0 !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(213, 163, 63, 0.2) !important;
          z-index: 999999 !important;
          animation: dnvnFadeIn 0.15s ease-out !important;
        }

        .dnvn-dropdown-panel::before {
          content: '' !important;
          position: absolute !important;
          top: -8px !important;
          left: 0 !important;
          right: 0 !important;
          height: 8px !important;
          background: transparent !important;
        }

        @keyframes dnvnFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dnvn-dropdown-item {
          display: block !important;
          padding: 8px 16px !important;
          color: #F1ECE6 !important;
          font-size: 13.5px !important;
          font-weight: 500 !important;
          text-decoration: none !important;
          transition: all 0.15s ease !important;
          text-align: left !important;
        }

        .dnvn-dropdown-item:hover {
          background-color: rgba(213, 163, 63, 0.2) !important;
          color: #D5A33F !important;
          padding-left: 20px !important;
        }

        /* Right side action container */
        .dnvn-nav-right {
          display: flex !important;
          align-items: center !important;
          gap: 7px !important;
          flex-shrink: 0 !important;
          overflow: visible !important;
        }

        /* Standard Laptops (1201px - 1400px) */
        @media (min-width: 1201px) and (max-width: 1400px) {
          .dnvn-header-container {
            padding: 6px 14px !important;
            min-height: 70px !important;
            gap: 6px !important;
          }
          .dnvn-nav-categories {
            gap: 4px !important;
            margin: 0 4px !important;
          }
          .dnvn-nav-item-btn {
            font-size: 13.5px !important;
            padding: 5px 8px !important;
            max-width: 125px !important;
          }
          .dnvn-brand-title {
            font-size: 17px !important;
          }
          .dnvn-brand-icon {
            width: 38px !important;
            height: 38px !important;
          }
        }

        /* Small laptops / Narrow desktop (1081px - 1200px) */
        @media (min-width: 1081px) and (max-width: 1200px) {
          .dnvn-header-container {
            padding: 6px 8px !important;
            min-height: 68px !important;
            gap: 4px !important;
          }
          .dnvn-nav-categories {
            gap: 2px !important;
            margin: 0 2px !important;
          }
          .dnvn-nav-item-btn {
            font-size: 12.5px !important;
            padding: 4px 6px !important;
            max-width: 110px !important;
          }
          .dnvn-brand-title {
            font-size: 16px !important;
          }
          .dnvn-brand-subtitle {
            font-size: 7px !important;
          }
          .dnvn-brand-icon {
            width: 34px !important;
            height: 34px !important;
          }
        }

        /* Responsive Breakpoints: Tablet & Mobile (<= 1080px) */
        @media (max-width: 1080px) {
          .dnvn-nav-categories {
            display: none !important;
          }
          .dnvn-header-container {
            padding: 0 14px !important;
            min-height: 62px !important;
          }
          .dnvn-mobile-toggle {
            display: flex !important;
          }
          .dnvn-btn-join-desktop {
            display: none !important;
          }
          .dnvn-nav-right {
            gap: 6px !important;
          }
        }

        @media (min-width: 1081px) {
          .dnvn-mobile-toggle {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .dnvn-header-container {
            padding: 0 10px !important;
            min-height: 56px !important;
          }
          .dnvn-brand-subtitle {
            display: none !important;
          }
          .dnvn-brand-title {
            font-size: 16px !important;
          }
          .dnvn-brand-icon {
            width: 32px !important;
            height: 32px !important;
          }
          .dnvn-login-btn {
            display: none !important;
          }
          .dnvn-nav-right {
            gap: 5px !important;
          }
        }
      `}</style>

      {/* Skip Link phục vụ người dùng phím / Screen Reader (F-08) */}
      <a href="#main-content" className="skip-link">
        {currentLang === 'en' ? "Skip to main content" : "Chuyển đến nội dung chính"}
      </a>

      <header className="dnvn-navbar-header">
        <div className="dnvn-header-container">
          
          {/* 1. BRAND LOGO */}
          <Link 
            to="/" 
            className="dnvn-brand-link notranslate"
            translate="no"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            title={brandConfig.brandName}
          >
            <div className="dnvn-brand-icon notranslate" translate="no">
              <img 
                src="/logo_icon.svg" 
                alt="DakLak.today Logo" 
                className="dnvn-brand-icon-img"
                onError={(e) => { 
                  e.target.src = '/logo_icon.png';
                  e.target.onerror = () => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerText = 'DL';
                  };
                }}
              />
            </div>
            <div className="dnvn-brand-text-box notranslate" translate="no">
              <span className="dnvn-brand-title notranslate" translate="no">
                Daklak<span style={{ color: '#D5A33F' }}>.today</span>
              </span>
              <span className="dnvn-brand-subtitle">
                {currentLang === 'en' ? 'DAK LAK INFORMATION, DATA & INVESTMENT' : 'CỔNG THÔNG TIN, DỮ LIỆU & ĐẦU TƯ ĐẮK LẮK'}
              </span>
            </div>
          </Link>

          {/* 2. CENTER: CATEGORIES NAVIGATION (SINGLE ROW - CHO PHÉP XUỐNG DÒNG KHÔNG ĐÈ CHỮ) */}
          <nav 
            ref={navRef}
            className="dnvn-nav-categories" 
            aria-label="Menu chuyên mục"
          >
            {categoriesList.map((cat) => {
              const subs = getSubList(cat);
              const hasSubs = subs.length > 0;
              const isOpen = activeDropdownId === (cat.id || cat.name);
              const isCatActive = location.pathname === '/posts' && location.search.includes(encodeURIComponent(cat.name));
              const catDisplayName = getCategoryName(cat);

              return (
                <div
                  key={cat.id || cat.name}
                  className="dnvn-cat-wrapper"
                  onMouseEnter={() => handleMouseEnter(cat.id || cat.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    to={`/posts?category=${encodeURIComponent(cat.name)}`}
                    className={`dnvn-nav-item-btn ${isCatActive ? 'active' : ''}`}
                    aria-expanded={isOpen}
                    aria-haspopup={hasSubs ? 'true' : 'false'}
                    onClick={(e) => {
                      if (window.innerWidth <= 1080 && hasSubs) {
                        e.preventDefault();
                        handleToggleDropdown(cat.id || cat.name, e);
                      }
                    }}
                    onKeyDown={(e) => handleKeyDown(cat.id || cat.name, e)}
                    title={catDisplayName}
                  >
                    <span className="dnvn-nav-text">{catDisplayName}</span>
                    {hasSubs && (
                      <i 
                        className={`ti ti-chevron-down ${isOpen ? 'rotate' : ''}`}
                        style={{ 
                          fontSize: '10px', 
                          marginLeft: '2px', 
                          opacity: 0.8, 
                          transition: 'transform 0.18s ease',
                          transform: isOpen ? 'rotate(180deg)' : 'none',
                          flexShrink: 0
                        }} 
                      />
                    )}
                  </Link>

                  {/* Mega / Dropdown menu cho lĩnh vực chuyên ngành con */}
                  {hasSubs && isOpen && (
                    <div 
                      className="dnvn-dropdown-panel"
                      role="menu"
                    >
                      {/* Lối vào xem toàn bộ chuyên mục cha */}
                      <Link
                        to={`/posts?category=${encodeURIComponent(cat.name)}`}
                        className="dnvn-dropdown-item"
                        style={{
                          color: '#D5A33F',
                          fontWeight: '700',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onClick={() => setActiveDropdownId(null)}
                      >
                        <i className="ti ti-layout-grid" style={{ fontSize: '13px' }} />
                        <span>{currentLang === 'en' ? `All ${catDisplayName}` : `Tất cả ${catDisplayName}`}</span>
                      </Link>

                      {subs.map((sub, idx) => {
                        const subName = typeof sub === 'object' ? sub.name : sub;
                        const subLabel = getSubName(sub);
                        return (
                          <Link
                            key={idx}
                            to={`/posts?category=${encodeURIComponent(cat.name)}&subCategory=${encodeURIComponent(subName)}`}
                            className="dnvn-dropdown-item"
                            role="menuitem"
                            onClick={() => setActiveDropdownId(null)}
                          >
                            {subLabel}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* 3. RIGHT CONTROLS: COMPACT LANGUAGE (VI, EN...), SEARCH & AUTH */}
          <div className="dnvn-nav-right">
            
            {/* Tìm kiếm nhanh */}
            <Link
              to="/search"
              title={currentLang === 'en' ? 'Search Database' : 'Tìm kiếm dữ liệu'}
              style={{
                color: '#E6DCD2',
                padding: '5px 7px',
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',
                borderRadius: '6px',
                transition: 'color 0.15s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#D5A33F'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#E6DCD2'; }}
            >
              <i className="ti ti-search" style={{ fontSize: '16px' }}></i>
            </Link>

            {/* Bộ chuyển đổi Đa ngôn ngữ (Khung nhỏ gọn: chỉ hiển thị VI, EN, ...) */}
            <div 
              ref={langDropdownRef} 
              className="notranslate"
              translate="no"
              style={{ position: 'relative', display: 'inline-block' }}
            >
              <button
                type="button"
                className="notranslate"
                translate="no"
                onClick={() => setLangDropdownOpen(prev => !prev)}
                aria-expanded={langDropdownOpen}
                aria-haspopup="true"
                title="Chuyển đổi ngôn ngữ / Switch Language"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(213, 163, 63, 0.35)',
                  borderRadius: '7px',
                  padding: '5px 9px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '800',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(213, 163, 63, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(213, 163, 63, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(213, 163, 63, 0.35)';
                }}
              >
                <span className="notranslate" translate="no">{(currentLang || 'VI').toUpperCase()}</span>
                <i 
                  className="ti ti-chevron-down notranslate" 
                  translate="no"
                  style={{ 
                    fontSize: '9px', 
                    color: '#D5A33F', 
                    transition: 'transform 0.2s ease',
                    transform: langDropdownOpen ? 'rotate(180deg)' : 'none'
                  }} 
                />
              </button>

              {langDropdownOpen && (
                <div
                  className="notranslate"
                  translate="no"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    backgroundColor: '#26160E',
                    backgroundImage: 'linear-gradient(180deg, #2D1A10 0%, #1A0D07 100%)',
                    border: '1px solid rgba(213, 163, 63, 0.45)',
                    borderRadius: '10px',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(213, 163, 63, 0.2)',
                    minWidth: '165px',
                    padding: '6px',
                    zIndex: 100001,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  {(availableLanguages || []).map((lang) => {
                    const isActive = currentLang === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        className="notranslate"
                        translate="no"
                        onClick={() => {
                          changeLang(lang.code);
                          setLangDropdownOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '7px 9px',
                          borderRadius: '6px',
                          border: 'none',
                          background: isActive ? 'rgba(213, 163, 63, 0.18)' : 'transparent',
                          color: isActive ? '#F3C562' : '#E6DCD2',
                          fontSize: '12px',
                          fontWeight: isActive ? '700' : '500',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <span className="notranslate" translate="no" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px' }}>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                        {isActive && <i className="ti ti-check notranslate" translate="no" style={{ color: '#D5A33F', fontSize: '13px' }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Nút Đăng ký trải nghiệm / Kết nối (Chỉ hiện khi chưa đăng nhập và trên desktop) */}
            {role === 'guest' && (
              <Link
                to="/register"
                className="dnvn-btn-join-desktop"
                style={{
                  backgroundColor: '#A84524',
                  backgroundImage: 'linear-gradient(135deg, #A84524 0%, #7A3E1D 100%)',
                  color: '#ffffff',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  padding: '5px 11px',
                  borderRadius: '7px',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(168, 69, 36, 0.4)',
                  border: '1px solid rgba(213, 163, 63, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.18s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 69, 36, 0.55)';
                  e.currentTarget.style.backgroundImage = 'linear-gradient(135deg, #B54F2D 0%, #A84524 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(168, 69, 36, 0.4)';
                  e.currentTarget.style.backgroundImage = 'linear-gradient(135deg, #A84524 0%, #7A3E1D 100%)';
                }}
              >
                <span>{currentLang === 'en' ? 'Connect' : 'Kết nối'}</span>
              </Link>
            )}

            {/* Trạng thái Người dùng / Đăng nhập */}
            {role === 'guest' ? (
              <Link
                to="/login"
                className="dnvn-login-btn"
                style={{
                  color: '#F1ECE6',
                  fontSize: '11.5px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  padding: '5px 9px',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.18s',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#D5A33F'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#F1ECE6'; }}
              >
                {currentLang === 'en' ? 'Login' : 'Đăng nhập'}
              </Link>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <Link
                  to={role === 'admin' ? "/admin-dashboard" : role === 'creator' ? "/creator-dashboard" : role === 'organizer' ? "/organizer-dashboard" : "/member-dashboard"}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#7A3E1D',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    border: '1.5px solid #D5A33F',
                    boxShadow: '0 2px 8px rgba(122, 62, 29, 0.5)'
                  }}
                  title={user?.name || 'Dashboard'}
                >
                  {getInitials(user?.name)}
                </Link>
                <button
                  onClick={() => logout()}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#F87171',
                    fontSize: '15px',
                    cursor: 'pointer',
                    padding: '3px'
                  }}
                  title={currentLang === 'en' ? "Logout" : "Đăng xuất"}
                >
                  <i className="ti ti-logout"></i>
                </button>
              </div>
            )}

            {/* Nút Toggle Mobile Drawer (chỉ hiện trên màn hình <= 1080px) (F-02) */}
            <button
              ref={mobileToggleRef}
              className="dnvn-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={mobileMenuOpen ? (currentLang === 'en' ? "Close mobile menu" : "Đóng menu di động") : (currentLang === 'en' ? "Open mobile menu" : "Mở menu di động")}
              aria-label={mobileMenuOpen ? (currentLang === 'en' ? "Close mobile menu" : "Đóng menu di động") : (currentLang === 'en' ? "Open mobile menu" : "Mở menu di động")}
              aria-expanded={mobileMenuOpen}
              aria-controls="dnvn-mobile-drawer"
            >
              <i className={mobileMenuOpen ? "ti ti-x" : "ti ti-menu-2"}></i>
            </button>
          </div>
        </div>

        {/* MOBILE DRAWER: DÙNG CHUNG CÙNG NGUỒN DỮ LIỆU ĐỘNG TỪ ADMIN (F-02) */}
        {mobileMenuOpen && (
          <div 
            id="dnvn-mobile-drawer"
            role="region"
            aria-label={currentLang === 'en' ? "Mobile navigation menu" : "Menu điều hướng di động"}
            style={{
              backgroundColor: '#26160E',
              borderTop: '1px solid rgba(213, 163, 63, 0.2)',
              padding: '1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
          >
            {/* Chuyển ngôn ngữ & Trạng thái trong Drawer */}
            <div className="notranslate" translate="no" style={{ paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '12px', color: '#BFAEA2', marginBottom: '8px' }}>{currentLang === 'en' ? 'Select Language / Chọn ngôn ngữ:' : 'Chọn ngôn ngữ / Select Language:'}</div>
              <div 
                className="notranslate"
                translate="no"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '3px',
                  border: '1px solid rgba(213, 163, 63, 0.25)'
                }}
              >
                {(availableLanguages || []).map((lang) => {
                  const isActive = currentLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      className="notranslate"
                      translate="no"
                      onClick={() => changeLang(lang.code)}
                      style={{
                        background: isActive ? '#A84524' : 'transparent',
                        color: isActive ? '#ffffff' : '#D1C4B9',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 2px',
                        fontSize: '11px',
                        fontWeight: isActive ? '700' : '500',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        boxShadow: isActive ? '0 2px 6px rgba(168, 69, 36, 0.5)' : 'none'
                      }}
                    >
                      <span style={{ fontSize: '14px' }}>{lang.flag}</span>
                      <span className="notranslate" translate="no">{lang.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nút Trợ lý AI trên Mobile */}
            <Link
              to="/ai-chat"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                backgroundColor: 'rgba(213, 163, 63, 0.2)',
                border: '1px solid #D5A33F',
                color: '#F3C562',
                padding: '10px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}
            >
              <i className="ti ti-sparkles" style={{ color: '#D5A33F', fontSize: '16px' }} />
              <span>{currentLang === 'en' ? 'Dak Lak AI Assistant' : 'Trợ lý AI Đắk Lắk'}</span>
            </Link>

            {/* Danh mục cấp 1 & con động trên mobile */}
            {categoriesList.map((cat) => {
              const subs = getSubList(cat);
              const isExpanded = mobileExpandedCatId === (cat.id || cat.name);
              const catDisplayName = getCategoryName(cat);

              return (
                <div key={cat.id || cat.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link
                      to={`/posts?category=${encodeURIComponent(cat.name)}`}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ color: '#ffffff', textDecoration: 'none', fontWeight: '600', fontSize: '13.5px', flex: 1, padding: '6px 0' }}
                    >
                      {catDisplayName}
                    </Link>
                    {subs.length > 0 && (
                      <button
                        onClick={() => setMobileExpandedCatId(isExpanded ? null : (cat.id || cat.name))}
                        style={{ background: 'none', border: 'none', color: '#BFAEA2', padding: '4px 8px', fontSize: '14px', cursor: 'pointer' }}
                        aria-label="Mở danh mục con"
                      >
                        <i className={isExpanded ? "ti ti-chevron-up" : "ti ti-chevron-down"}></i>
                      </button>
                    )}
                  </div>

                  {subs.length > 0 && isExpanded && (
                    <div style={{ paddingLeft: '14px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <Link
                        to={`/posts?category=${encodeURIComponent(cat.name)}`}
                        onClick={() => setMobileMenuOpen(false)}
                        style={{ color: '#D5A33F', fontSize: '12px', textDecoration: 'none', fontWeight: '600' }}
                      >
                        👉 {catDisplayName} ({currentLang === 'en' ? 'All Articles' : 'Xem tất cả'})
                      </Link>
                      {subs.map((sub, idx) => {
                        const subName = typeof sub === 'object' ? sub.name : sub;
                        const subLabel = getSubName(sub);
                        return (
                          <Link
                            key={idx}
                            to={`/posts?category=${encodeURIComponent(cat.name)}&subCategory=${encodeURIComponent(subName)}`}
                            onClick={() => setMobileMenuOpen(false)}
                            style={{ color: '#cbd5e1', fontSize: '12px', textDecoration: 'none', padding: '4px 0' }}
                          >
                            • {subLabel}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Actions trên mobile */}
            <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Cài đặt Ứng dụng PWA trên Mobile */}
              {isInstallable && !isInstalled && (
                <button
                  onClick={() => { installApp(); setMobileMenuOpen(false); }}
                  style={{
                    backgroundColor: 'rgba(213, 163, 63, 0.2)',
                    border: '1px solid #D5A33F',
                    color: '#F3C562',
                    textAlign: 'center',
                    padding: '9px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <i className="ti ti-device-mobile-down" style={{ fontSize: '16px' }}></i>
                  <span>{currentLang === 'en' ? 'Install PWA App' : 'Cài đặt Ứng dụng PWA'}</span>
                </button>
              )}

              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  backgroundColor: '#A84524',
                  backgroundImage: 'linear-gradient(135deg, #A84524 0%, #7A3E1D 100%)',
                  color: '#ffffff',
                  textAlign: 'center',
                  padding: '9px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '13px',
                  boxShadow: '0 2px 8px rgba(168, 69, 36, 0.4)'
                }}
              >
                {currentLang === 'en' ? 'Join Dak Lak Investment Network' : 'Đăng ký Hội viên & Kết nối'}
              </Link>
              {role === 'guest' ? (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    color: '#ffffff',
                    textAlign: 'center',
                    padding: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '13px'
                  }}
                >
                  {currentLang === 'en' ? 'Member Login' : 'Đăng nhập Hội viên'}
                </Link>
              ) : (
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  style={{
                    color: '#f87171',
                    background: 'none',
                    border: '1px solid #f87171',
                    padding: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  {currentLang === 'en' ? 'Logout' : 'Đăng xuất'}
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
