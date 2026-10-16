import React, { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import brandConfig from '../brand.config';

export const Sidebar = () => {
  const { logout, getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  const [pendingMembers, setPendingMembers] = useState(0);
  const [pendingPosts, setPendingPosts] = useState(0);

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

  return (
    <aside className="sidebar">
      <Link to="/admin-dashboard" className="sb-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="sb-logo-icon" style={{ overflow: 'hidden', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2A160D', width: '32px', height: '32px', flexShrink: 0, border: '1px solid rgba(213, 163, 63, 0.4)' }}>
          <img src="/logo_icon.svg" alt="DakLak.today" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/logo_icon.png'; }} />
        </div>
        <div>
          <div className="sb-logo-name">DakLak<span style={{ color: '#D5A33F' }}>.today</span></div>
          <div className="sb-logo-sub">Quản trị Hệ thống</div>
        </div>
      </Link>
      
      <div className="sb-sec" style={{ marginTop: '10px' }}>Quản trị</div>
      
      <NavLink 
        to="/admin-dashboard" 
        className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
        style={{ textDecoration: 'none' }}
      >
        <i className="ti ti-layout-dashboard"></i> Dashboard
      </NavLink>
      
      <NavLink 
        to="/admin-members" 
        className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
        style={{ textDecoration: 'none' }}
      >
        <i className="ti ti-users"></i> Duyệt hội viên 
        {pendingMembers > 0 && <span className="sb-badge">{pendingMembers}</span>}
      </NavLink>
      
      <NavLink 
        to="/admin-posts" 
        className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
        style={{ textDecoration: 'none' }}
      >
        <i className="ti ti-clipboard-check"></i> Quản lý & Duyệt bài 
        {pendingPosts > 0 && <span className="sb-badge">{pendingPosts}</span>}
      </NavLink>

      <NavLink 
        to="/admin-leads" 
        className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
        style={{ textDecoration: 'none' }}
      >
        <i className="ti ti-mail-forward"></i> Liên hệ / Đăng ký
      </NavLink>

      <NavLink 
        to="/admin-events" 
        className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
        style={{ textDecoration: 'none' }}
      >
        <i className="ti ti-calendar-event"></i> Quản lý sự kiện
      </NavLink>

      <NavLink 
        to="/admin-categories" 
        className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
        style={{ textDecoration: 'none' }}
      >
        <i className="ti ti-category"></i> Quản lý Chuyên mục
      </NavLink>

      <NavLink 
        to="/admin-creators" 
        className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
        style={{ textDecoration: 'none' }}
      >
        <i className="ti ti-user-check"></i> Biên tập viên
      </NavLink>

      <NavLink 
        to="/admin-organizers" 
        className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
        style={{ textDecoration: 'none' }}
      >
        <i className="ti ti-id-badge-2"></i> Ban tổ chức
      </NavLink>
      
      <NavLink 
        to="/admin-config" 
        className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
        style={{ textDecoration: 'none' }}
      >
        <i className="ti ti-settings"></i> Cài đặt AI
      </NavLink>

      <Link to="/guide?role=admin" target="_blank" className="sb-item" style={{ textDecoration: 'none' }}>
        <i className="ti ti-book"></i> Hướng dẫn Admin
      </Link>
      
      <Link to="/" className="sb-item" style={{ textDecoration: 'none' }}>
        <i className="ti ti-external-link"></i> Xem Trang chủ
      </Link>

      <div style={{ marginTop: 'auto', paddingBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', flexShrink: 0 }}>
        <button 
          onClick={() => {
            if (confirm('Bạn có muốn đăng xuất tài khoản Admin?')) logout();
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
  );
};
export default Sidebar;
