import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';

export const AdminLayout = ({ children, title }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('light-theme');
    document.body.classList.remove('public-body');
    return () => {
      document.body.classList.remove('light-theme');
      document.body.style.overflow = '';
    };
  }, []);

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name.trim().split(/\s+/).map(w => w[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="shell light-theme">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main">
        {/* TOPBAR */}
        <div className="topbar">
          <button 
            type="button" 
            className="btn-admin-menu" 
            onClick={() => setSidebarOpen(true)}
            aria-label="Mở menu quản trị"
            title="Mở menu quản trị"
          >
            <i className="ti ti-menu-2"></i>
          </button>

          <div className="tb-title">
            <i className="ti ti-layout-dashboard"></i> 
            <span>{title || 'Dashboard Quản trị'}</span>
          </div>

          <div className="tb-right" style={{ marginLeft: 'auto' }}>
            <div className="av-sm" title={user?.name || 'Admin'}>
              {getInitials(user?.name || 'Admin')}
            </div>
          </div>
        </div>

        {/* CONTENT VIEW */}
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
};
export default AdminLayout;
