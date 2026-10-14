import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../components/AdminLayout';

export const AdminMembers = () => {
  const { getAuthHeaders } = useAuth();
  
  // States
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, suspended, rejected
  const [tierFilter, setTierFilter] = useState('all'); // all, Silver, Gold, Platinum
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // States for Editing Member Tier/Expiration
  const [editTierModalOpen, setEditTierModalOpen] = useState(false);
  const [selectedMemberToEdit, setSelectedMemberToEdit] = useState(null);
  const [editTierForm, setEditTierForm] = useState({ tier: 'Silver', tier_expires_at: '' });

  const loadMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/members?_t=${Date.now()}`, {
        headers: getAuthHeaders(),
        cache: 'no-store'
      });
      if (!res.ok) throw new Error('Không thể tải danh sách hội viên');
      const data = await res.json();
      setMembers(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, tierFilter, searchQuery, pageSize]);

  const handleApprove = async (id, name) => {
    if (!confirm(`Duyệt hội viên chính thức: "${name}"?`)) return;
    try {
      const res = await fetch(`/api/members/${id}/approve`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'approved' } : m));
        alert('Đã phê duyệt hội viên thành công!');
        await loadMembers();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleReject = async (id, name) => {
    const reason = prompt(`Nhập lý do từ chối hội viên "${name}":`);
    if (reason === null) return;

    try {
      const res = await fetch(`/api/members/${id}/reject`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'rejected' } : m));
        alert('Đã từ chối hội viên.');
        await loadMembers();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleLock = async (id, name) => {
    if (!confirm(`Tạm khóa tài khoản hội viên: "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/members/${id}/lock`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'rejected' } : m));
        alert('Đã tạm khóa tài khoản thành công!');
        await loadMembers();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleUnlock = async (id, name) => {
    if (!confirm(`Mở khóa tài khoản hội viên: "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/members/${id}/unlock`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'approved' } : m));
        alert('Đã mở khóa tài khoản thành công!');
        await loadMembers();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản hội viên "${name}" cùng toàn bộ bài viết của họ?`)) return;
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== id));
        alert('Đã xóa vĩnh viễn hội viên thành công!');
        await loadMembers();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleToggleFeatured = async (id, isCurrentlyFeatured, name) => {
    try {
      const targetState = isCurrentlyFeatured ? 0 : 1;
      const res = await fetch(`/api/admin/members/${id}/featured`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_featured: targetState })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Thao tác không thành công.');
        return;
      }
      setMembers(prev => prev.map(m => m.id === id ? { ...m, is_featured: targetState } : m));
      alert(targetState ? `Đã ghim hội viên "${name}" nổi bật.` : `Đã bỏ ghim hội viên "${name}".`);
      await loadMembers();
    } catch (err) {
      alert('Có lỗi xảy ra: ' + err.message);
    }
  };

  const openEditTierModal = (member) => {
    setSelectedMemberToEdit(member);
    let dateVal = '';
    if (member.tier_expires_at) {
      dateVal = new Date(member.tier_expires_at).toISOString().substring(0, 10);
    }
    setEditTierForm({
      tier: member.tier || 'Silver',
      tier_expires_at: dateVal
    });
    setEditTierModalOpen(true);
  };

  const handleSaveTier = async () => {
    if (!selectedMemberToEdit) return;
    try {
      const res = await fetch(`/api/admin/members/${selectedMemberToEdit.id}/tier`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(editTierForm)
      });
      if (res.ok) {
        alert('Cập nhật hạng thành viên thành công!');
        setEditTierModalOpen(false);
        await loadMembers();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleApproveUpgrade = async (id, name, requestedTier) => {
    if (!confirm(`Duyệt nâng cấp gói ${requestedTier} cho hội viên "${name}"?`)) return;
    try {
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const expiresAt = nextYear.toISOString().substring(0, 10);

      const res = await fetch(`/api/admin/members/${id}/tier`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ tier: requestedTier, tier_expires_at: expiresAt, pending_tier_upgrade: null })
      });
      if (res.ok) {
        alert(`Đã nâng cấp lên gói ${requestedTier} thành công!`);
        loadMembers();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleRejectUpgrade = async (id, name) => {
    if (!confirm(`Hủy yêu cầu nâng cấp gói của hội viên "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/members/${id}/tier`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ pending_tier_upgrade: null })
      });
      if (res.ok) {
        alert('Đã hủy yêu cầu nâng cấp.');
        loadMembers();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const getInitialsColors = (name) => {
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    const colors = [
      { bg: '#E2F1FF', fg: '#0066CC' },
      { bg: '#E6F4EA', fg: '#137333' },
      { bg: '#FEF7E0', fg: '#B06000' },
      { bg: '#FCE8E6', fg: '#C5221F' },
      { bg: '#F3E8FD', fg: '#7627BB' },
      { bg: '#E8F0FE', fg: '#1A73E8' },
      { bg: '#FAECE7', fg: '#712B13' }
    ];
    return colors[sum % colors.length];
  };

  // Filter members
  const filteredMembers = members.filter(m => {
    // 1. Status filter
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;

    // 2. Tier filter
    if (tierFilter !== 'all' && m.tier !== tierFilter) return false;

    // 3. Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = m.name && m.name.toLowerCase().includes(q);
      const matchIndustry = m.industry && m.industry.toLowerCase().includes(q);
      const matchEmail = m.email && m.email.toLowerCase().includes(q);
      const matchContact = m.contact_name && m.contact_name.toLowerCase().includes(q);
      const matchPhone = m.phone && m.phone.toLowerCase().includes(q);
      if (!matchName && !matchIndustry && !matchEmail && !matchContact && !matchPhone) return false;
    }

    return true;
  });

  // Pagination calculations
  const totalItems = filteredMembers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + pageSize);

  return (
    <AdminLayout title="Duyệt & Quản Lý Hội Viên Doanh Nghiệp">
      <div className="card" style={{ textAlign: 'left' }}>
        
        {/* Bộ Lọc Top */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          
          {/* Tabs Trạng thái */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <button className={`btn ${statusFilter === 'all' ? 'btn-primary' : ''}`} onClick={() => setStatusFilter('all')} style={{ fontSize: '12px', padding: '6px 12px' }}>Tất cả ({members.length})</button>
            <button className={`btn ${statusFilter === 'pending' ? 'btn-primary' : ''}`} onClick={() => setStatusFilter('pending')} style={{ fontSize: '12px', padding: '6px 12px' }}>Chờ duyệt ({members.filter(m => m.status === 'pending').length})</button>
            <button className={`btn ${statusFilter === 'approved' ? 'btn-primary' : ''}`} onClick={() => setStatusFilter('approved')} style={{ fontSize: '12px', padding: '6px 12px' }}>Đã duyệt ({members.filter(m => m.status === 'approved').length})</button>
            <button className={`btn ${statusFilter === 'suspended' ? 'btn-primary' : ''}`} onClick={() => setStatusFilter('suspended')} style={{ fontSize: '12px', padding: '6px 12px' }}>Tạm khóa ({members.filter(m => m.status === 'suspended').length})</button>
            <button className={`btn ${statusFilter === 'rejected' ? 'btn-primary' : ''}`} onClick={() => setStatusFilter('rejected')} style={{ fontSize: '12px', padding: '6px 12px' }}>Từ chối ({members.filter(m => m.status === 'rejected').length})</button>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Lọc theo Gói Tier */}
            <select 
              value={tierFilter} 
              onChange={(e) => setTierFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none', background: '#fff' }}
            >
              <option value="all">-- Tất cả các gói --</option>
              <option value="Silver">Silver (Mặc định)</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
            </select>

            {/* Ô tìm kiếm */}
            <input 
              type="text" 
              placeholder="Tìm tên, email, sđt..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', width: '200px', outline: 'none' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light-muted)' }}>
            <i className="ti ti-loader animate-spin" style={{ fontSize: '24px', display: 'block', margin: '0 auto 10px' }}></i> Đang tải danh sách hội viên...
          </div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#EF4444' }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i> Lỗi tải dữ liệu: {error}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light-muted)' }}>
            <i className="ti ti-users" style={{ fontSize: '24px', display: 'block', margin: '0 auto 10px' }}></i> Không có hội viên nào phù hợp bộ lọc.
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', background: '#F8FAFC' }}>
                    <th style={{ padding: '12px 16px' }}>Doanh nghiệp</th>
                    <th style={{ padding: '12px 16px' }}>Mã số thuế</th>
                    <th style={{ padding: '12px 16px' }}>Người đại diện</th>
                    <th style={{ padding: '12px 16px' }}>Ngành nghề</th>
                    <th style={{ padding: '12px 16px' }}>Phân hạng</th>
                    <th style={{ padding: '12px 16px' }}>Nổi bật</th>
                    <th style={{ padding: '12px 16px' }}>Trạng thái</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMembers.map((m) => {
                    const colors = getInitialsColors(m.name);
                    const initials = m.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase();
                    
                    return (
                      <tr key={m.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="av-circle" style={{ background: colors.bg, color: colors.fg, width: '32px', height: '32px', fontSize: '11px', fontWeight: 600 }}>{initials}</div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0F172A' }}>{m.name}</div>
                            <div style={{ fontSize: '10px', color: '#64748B' }}>Đăng ký: {new Date(m.created_at).toLocaleDateString('vi-VN')}</div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#334155' }}>{m.tax_code || 'Chưa cập nhật'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: '500' }}>{m.contact_name}</div>
                          <div style={{ fontSize: '10px', color: '#64748B' }}>{m.phone} | {m.email}</div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#334155' }}>
                          <div>{m.industry || 'Chưa chọn'}</div>
                          <div style={{ fontSize: '10px', color: '#64748B' }}>Quy mô: {m.size}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`badge ${m.tier === 'Platinum' ? 'b-platinum' : m.tier === 'Gold' ? 'b-gold' : 'b-silver'}`}>
                            {m.tier === 'Platinum' ? '💎 Platinum' : m.tier === 'Gold' ? '🏅 Gold' : '🪙 Silver'}
                          </span>
                          {m.tier_expires_at && m.tier !== 'Silver' && (
                            <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
                              Hạn: {new Date(m.tier_expires_at).toLocaleDateString('vi-VN')}
                            </div>
                          )}
                          {m.pending_tier_upgrade && (
                            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', border: '1px dashed var(--amber)', padding: '6px', borderRadius: '4px', background: 'rgba(245,158,11,0.05)', maxWidth: '130px' }}>
                              <div style={{ fontSize: '10px', color: 'var(--amber)', fontWeight: '600' }}>
                                <i className="ti ti-arrow-big-up-lines"></i> Lên {m.pending_tier_upgrade === 'Platinum' ? '💎 Plat' : '🏅 Gold'}
                              </div>
                              <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                                <button 
                                  className="quick-btn quick-btn-approve" 
                                  onClick={() => handleApproveUpgrade(m.id, m.name, m.pending_tier_upgrade)}
                                  style={{ padding: '2px 6px', fontSize: '10px', width: '48px', cursor: 'pointer' }}
                                >
                                  Duyệt
                                </button>
                                <button 
                                  className="quick-btn quick-btn-reject" 
                                  onClick={() => handleRejectUpgrade(m.id, m.name)}
                                  style={{ padding: '2px 6px', fontSize: '10px', width: '48px', cursor: 'pointer' }}
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          {m.status === 'approved' ? (
                            <button 
                              onClick={() => handleToggleFeatured(m.id, m.is_featured === 1, m.name)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: m.is_featured === 1 ? '#F59E0B' : '#CBD5E1',
                                cursor: 'pointer',
                                fontSize: '16px',
                                outline: 'none',
                                padding: 0
                              }}
                              title={m.is_featured === 1 ? "Bỏ ghim nổi bật" : "Ghim nổi bật (Tối đa 3 hội viên)"}
                            >
                              <i className={m.is_featured === 1 ? "ti ti-star-filled" : "ti ti-star"}></i>
                            </button>
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: '11px' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`badge ${m.status === 'approved' ? 'approved' : (m.status === 'rejected' || m.status === 'suspended') ? 'rejected' : 'pending'}`}>
                            {m.status === 'approved' ? 'Đã duyệt' : m.status === 'rejected' ? 'Từ chối' : m.status === 'suspended' ? 'Tạm khóa' : 'Chờ duyệt'}
                          </span>
                          {m.status === 'rejected' && m.reject_reason && (
                            <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '4px', maxWidth: '150px', whiteSpace: 'normal' }}>Lý do: {m.reject_reason}</div>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {m.status === 'pending' && (
                              <button className="quick-btn quick-btn-approve" onClick={() => handleApprove(m.id, m.name)} style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>Duyệt</button>
                            )}
                            {m.status === 'rejected' && (
                              <button className="quick-btn quick-btn-approve" onClick={() => handleApprove(m.id, m.name)} style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>Duyệt lại</button>
                            )}
                            {m.status === 'approved' && (
                              <>
                                <button className="quick-btn" onClick={() => openEditTierModal(m)} style={{ padding: '4px 8px', fontSize: '11px', background: '#10B981', color: '#fff', border: '1px solid #10B981', borderRadius: '4px', cursor: 'pointer' }}>Sửa hạng</button>
                                <button className="quick-btn" onClick={() => handleLock(m.id, m.name)} style={{ padding: '4px 8px', fontSize: '11px', background: '#F59E0B', color: '#fff', border: '1px solid #F59E0B', borderRadius: '4px', cursor: 'pointer' }}>Khóa</button>
                              </>
                            )}
                            {m.status === 'suspended' && (
                              <button className="quick-btn quick-btn-approve" onClick={() => handleUnlock(m.id, m.name)} style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>Mở khóa</button>
                            )}
                            {m.status === 'pending' && (
                              <button className="quick-btn quick-btn-reject" onClick={() => handleReject(m.id, m.name)} style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>Từ chối</button>
                            )}
                            <button className="quick-btn" onClick={() => handleDelete(m.id, m.name)} style={{ padding: '4px 8px', fontSize: '11px', background: '#EF4444', color: '#fff', border: '1px solid #EF4444', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Thanh Phân Trang */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                Hiển thị <strong>{startIndex + 1}</strong> - <strong>{Math.min(startIndex + pageSize, totalItems)}</strong> trên tổng số <strong>{totalItems}</strong> hội viên
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Số mục / trang:</span>
                <select 
                  value={pageSize} 
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none', background: '#fff' }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>

                <div style={{ display: 'flex', gap: '4px', marginLeft: '10px' }}>
                  <button 
                    disabled={validCurrentPage === 1} 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', background: validCurrentPage === 1 ? '#F1F5F9' : '#fff', cursor: validCurrentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '12px' }}
                  >
                    ‹ Trước
                  </button>
                  
                  <span style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600, color: '#1E293B', display: 'flex', alignItems: 'center' }}>
                    {validCurrentPage} / {totalPages}
                  </span>

                  <button 
                    disabled={validCurrentPage >= totalPages} 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', background: validCurrentPage >= totalPages ? '#F1F5F9' : '#fff', cursor: validCurrentPage >= totalPages ? 'not-allowed' : 'pointer', fontSize: '12px' }}
                  >
                    Sau ›
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* EDIT TIER MODAL */}
      {editTierModalOpen && selectedMemberToEdit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px', padding: '1.5rem', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '16px', color: '#0F172A', fontWeight: 700, borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>Thay đổi hạng & thời hạn thành viên</h3>
            
            <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '1.25rem', textAlign: 'left' }}>
              Doanh nghiệp: <strong style={{ color: '#0F172A' }}>{selectedMemberToEdit.name}</strong>
            </div>

            <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Chọn phân hạng</label>
              <select 
                value={editTierForm.tier} 
                onChange={(e) => setEditTierForm(prev => ({ ...prev, tier: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #D8E2EF', outline: 'none', background: '#fff', fontSize: '13px' }}
              >
                <option value="Silver">Silver (Mặc định)</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>

            {editTierForm.tier !== 'Silver' && (
              <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Hạn dùng gói</label>
                <input 
                  type="date" 
                  value={editTierForm.tier_expires_at} 
                  onChange={(e) => setEditTierForm(prev => ({ ...prev, tier_expires_at: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #D8E2EF', outline: 'none', fontSize: '13px' }}
                  required
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
              <button 
                className="btn" 
                onClick={() => setEditTierModalOpen(false)}
                style={{ fontSize: '12px', padding: '6px 14px', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Hủy
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSaveTier}
                style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
export default AdminMembers;
