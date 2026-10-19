import React, { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import brandConfig from '../brand.config';

export const Sidebar = ({ isOpen = false, onClose }) => {
  const { logout, getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  const [pendingMembers, setPendingMembers] = useState(0);
  const [pendingPosts, setPendingPosts] = useState(0);

  // Khóa cuộn trang khi drawer sidebar đang mở trên mobile và hỗ trợ phím Escape
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose?.();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  // Lấy thống kê số lượng hàng chờ duyệt
  useEffect(() => {
    const fetchPendingCounts = async () => {
      try {
        const res = await fetch('/api/stats', {
          headers: getAuthHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setPendingMembers(data.members.pending || 0);
            setPendingPosts(data.posts.pending || 0);
          }
        }
      } catch (e) {
        console.error("Failed to load pending counts in Sidebar", e);
      }
    };

    fetchPendingCounts();
    // Tạo khoảng thời gian làm mới mỗi 30s
    const timer = setInterval(fetchPendingCounts, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onClose} 
          aria-hidden="true" 
        />
      )}

      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sb-header-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingRight: '1rem' }}>
          <Link 
            to="/admin-dashboard" 
            onClick={handleNavClick}
            className="sb-logo" 
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flex: 1, borderBottom: 'none' }}
          >
            <div className="sb-logo-icon" style={{ overflow: 'hidden', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2A160D', width: '32px', height: '32px', flexShrink: 0, border: '1px solid rgba(213, 163, 63, 0.4)' }}>
              <img src="/logo_icon.svg" alt="DakLak.today" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/logo_icon.png'; }} />
            </div>
            <div>
              <div className="sb-logo-name">DakLak<span style={{ color: '#D5A33F' }}>.today</span></div>
              <div className="sb-logo-sub">Quản trị Hệ thống</div>
            </div>
          </Link>
          <button 
            type="button" 
            className="sb-close-btn" 
            onClick={onClose} 
            aria-label="Đóng thanh điều hướng"
            title="Đóng thanh điều hướng"
          >
            <i className="ti ti-x"></i>
          </button>
        </div>
        
        <div className="sb-sec" style={{ marginTop: '10px' }}>Quản trị</div>
        
        <NavLink 
          to="/admin-dashboard" 
          onClick={handleNavClick}
          className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          <i className="ti ti-layout-dashboard"></i> Dashboard
        </NavLink>
        
        <NavLink 
          to="/admin-members" 
          onClick={handleNavClick}
          className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          <i className="ti ti-users"></i> Duyệt hội viên 
          {pendingMembers > 0 && <span className="sb-badge">{pendingMembers}</span>}
        </NavLink>
        
        <NavLink 
          to="/admin-posts" 
          onClick={handleNavClick}
          className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          <i className="ti ti-clipboard-check"></i> Quản lý & Duyệt bài 
          {pendingPosts > 0 && <span className="sb-badge">{pendingPosts}</span>}
        </NavLink>

        <NavLink 
          to="/admin-leads" 
          onClick={handleNavClick}
          className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          <i className="ti ti-mail-forward"></i> Liên hệ / Đăng ký
        </NavLink>

        <NavLink 
          to="/admin-events" 
          onClick={handleNavClick}
          className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          <i className="ti ti-calendar-event"></i> Quản lý sự kiện
        </NavLink>

        <NavLink 
          to="/admin-categories" 
          onClick={handleNavClick}
          className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          <i className="ti ti-category"></i> Quản lý Chuyên mục
        </NavLink>

        <NavLink 
          to="/admin-creators" 
          onClick={handleNavClick}
          className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          <i className="ti ti-user-check"></i> Biên tập viên
        </NavLink>

        <NavLink 
          to="/admin-organizers" 
          onClick={handleNavClick}
          className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          <i className="ti ti-id-badge-2"></i> Ban tổ chức
        </NavLink>
        
        <NavLink 
          to="/admin-config" 
          onClick={handleNavClick}
          className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          <i className="ti ti-settings"></i> Cài đặt AI
        </NavLink>

        <Link to="/guide?role=admin" target="_blank" onClick={handleNavClick} className="sb-item" style={{ textDecoration: 'none' }}>
          <i className="ti ti-book"></i> Hướng dẫn Admin
        </Link>
        
        <Link to="/" onClick={handleNavClick} className="sb-item" style={{ textDecoration: 'none' }}>
          <i className="ti ti-external-link"></i> Xem Trang chủ
        </Link>

        <div style={{ marginTop: 'auto', paddingBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', flexShrink: 0 }}>
          <button 
            onClick={() => {
              if (confirm('Bạn có muốn đăng xuất tài khoản Admin?')) {
                if (onClose) onClose();
                logout();
              }
            }}
            className="sb-item" 
            style={{ 
              background: 'none', 
              border: 'none', 
              width: '100%', 
              textAlign: 'left', 
              cursor: 'pointer',
              color: 'var(--rose)',
              fontWeight: '600'
            }}
          >
            <i className="ti ti-logout"></i> Đăng xuất Admin
          </button>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
