import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../components/AdminLayout';

export const AdminCategories = () => {
  const { getAuthHeaders } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // Main Category Modal state
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null); // null if creating, object if editing
  const [catForm, setCatForm] = useState({ name: '', name_en: '', order_index: 0, status: 'active' });

  // Sub Category Modal state
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [subForm, setSubForm] = useState({ category_id: null, name: '', name_en: '', order_index: 0, status: 'active' });
  const [targetCategoryName, setTargetCategoryName] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories', {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Không thể tải danh sách chuyên mục');
      const data = await res.json();
      setCategories(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // ── HANDLERS CATEGORIES ─────────────────────────────────
  const handleOpenAddCat = () => {
    setEditingCat(null);
    setCatForm({ name: '', name_en: '', order_index: categories.length + 1, status: 'active' });
    setCatModalOpen(true);
  };

  const handleOpenEditCat = (cat) => {
    setEditingCat(cat);
    setCatForm({ name: cat.name, name_en: cat.name_en || '', order_index: cat.order_index || 0, status: cat.status || 'active' });
    setCatModalOpen(true);
  };

  const notifyCategoriesChanged = () => {
    try {
      localStorage.removeItem('dnvn_cached_categories');
      window.dispatchEvent(new Event('categories-updated'));
    } catch (e) {}
  };

  const handleSaveCat = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) return alert('Vui lòng nhập tên Chuyên mục');

    setSubmitting(true);
    try {
      const url = editingCat ? `/api/admin/categories/${editingCat.id}` : '/api/admin/categories';
      const method = editingCat ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(catForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Thao tác thất bại');

      notifyCategoriesChanged();
      showMsg(data.message || 'Đã lưu Chuyên mục thành công!');
      setCatModalOpen(false);
      loadCategories();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleCatStatus = async (cat) => {
    const newStatus = cat.status === 'active' ? 'inactive' : 'active';
    const actionName = newStatus === 'active' ? 'kích hoạt' : 'tạm khóa';
    if (!confirm(`Bạn có chắc chắn muốn ${actionName} Chuyên mục "${cat.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Thao tác thất bại');
      notifyCategoriesChanged();
      showMsg(data.message || `Đã ${actionName} Chuyên mục`);
      loadCategories();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleDeleteCat = async (cat) => {
    if (!confirm(`⚠️ CẢNH BÁO: Xóa Chuyên mục "${cat.name}" sẽ XÓA TOÀN BỘ các Lĩnh vực con trực thuộc!\n\nBạn có thực sự muốn xóa?`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xóa thất bại');
      notifyCategoriesChanged();
      showMsg('Đã xóa Chuyên mục thành công!');
      loadCategories();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // ── HANDLERS SUB-CATEGORIES ─────────────────────────────
  const handleOpenAddSub = (cat) => {
    setEditingSub(null);
    setTargetCategoryName(cat.name);
    setSubForm({
      category_id: cat.id,
      name: '',
      name_en: '',
      order_index: (cat.subcategories ? cat.subcategories.length : 0) + 1,
      status: 'active'
    });
    setSubModalOpen(true);
  };

  const handleOpenEditSub = (sub, parentCatName) => {
    setEditingSub(sub);
    setTargetCategoryName(parentCatName);
    setSubForm({
      category_id: sub.category_id,
      name: sub.name,
      name_en: sub.name_en || '',
      order_index: sub.order_index || 0,
      status: sub.status || 'active'
    });
    setSubModalOpen(true);
  };

  const handleSaveSub = async (e) => {
    e.preventDefault();
    if (!subForm.name.trim()) return alert('Vui lòng nhập tên Lĩnh vực con');

    setSubmitting(true);
    try {
      const url = editingSub ? `/api/admin/sub-categories/${editingSub.id}` : '/api/admin/sub-categories';
      const method = editingSub ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(subForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Thao tác thất bại');

      notifyCategoriesChanged();
      showMsg(data.message || 'Đã lưu Lĩnh vực con thành công!');
      setSubModalOpen(false);
      loadCategories();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSubStatus = async (sub) => {
    const newStatus = sub.status === 'active' ? 'inactive' : 'active';
    const actionName = newStatus === 'active' ? 'kích hoạt' : 'tạm khóa';

    try {
      const res = await fetch(`/api/admin/sub-categories/${sub.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Thao tác thất bại');
      notifyCategoriesChanged();
      showMsg(data.message || `Đã ${actionName} Lĩnh vực con`);
      loadCategories();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleDeleteSub = async (sub) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa Lĩnh vực con "${sub.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/sub-categories/${sub.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xóa thất bại');
      notifyCategoriesChanged();
      showMsg('Đã xóa Lĩnh vực con!');
      loadCategories();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  return (
    <AdminLayout title="Quản lý Chuyên mục & Lĩnh vực">
      <div>
        {/* Header Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Danh sách Chuyên mục & Lĩnh vực con
            </h2>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0' }}>
              Quản lý danh mục hiển thị trên thanh Header, bộ lọc bài viết và form đăng tin.
            </p>
          </div>

          <button 
            onClick={handleOpenAddCat} 
            className="btn" 
            style={{ backgroundColor: '#185FA5', color: '#fff', fontSize: '12.5px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <i className="ti ti-plus"></i> Thêm Chuyên mục mới
          </button>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div style={{ padding: '10px 16px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '13px', backgroundColor: message.type === 'error' ? '#FEE2E2' : '#DCFCE7', color: message.type === 'error' ? '#991B1B' : '#166534', border: `1px solid ${message.type === 'error' ? '#FCA5A5' : '#86EFAC'}` }}>
            <i className={`ti ${message.type === 'error' ? 'ti-alert-circle' : 'ti-circle-check'}`}></i> {message.text}
          </div>
        )}

        {/* Loading / Error / Content */}
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#64748B' }}>
            <i className="ti ti-loader animate-spin" style={{ fontSize: '28px', display: 'block', margin: '0 auto 10px', color: '#185FA5' }}></i>
            Đang tải danh sách chuyên mục...
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#EF4444', background: '#FEF2F2', borderRadius: '8px' }}>
            Lỗi: {error}
          </div>
        ) : categories.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
            Chưa có Chuyên mục nào trong hệ thống. Hãy bấm <strong>Thêm Chuyên mục mới</strong>.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                className="card"
                style={{ 
                  background: '#ffffff', 
                  borderRadius: '12px', 
                  border: '1px solid #E2E8F0', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                  opacity: cat.status === 'inactive' ? 0.75 : 1
                }}
              >
                {/* Category Header */}
                <div 
                  style={{ 
                    padding: '1rem 1.25rem', 
                    background: cat.status === 'inactive' ? '#F1F5F9' : 'linear-gradient(90deg, #F8FAFC 0%, #EFF6FF 100%)', 
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, background: '#185FA5', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>
                      #{cat.order_index}
                    </span>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      {cat.name}
                    </h3>
                    <span 
                      style={{ 
                        fontSize: '10.5px', 
                        fontWeight: 650, 
                        padding: '2px 8px', 
                        borderRadius: '12px',
                        backgroundColor: cat.status === 'active' ? '#DCFCE7' : '#FEE2E2',
                        color: cat.status === 'active' ? '#15803D' : '#B91C1C'
                      }}
                    >
                      {cat.status === 'active' ? '• Hoạt động' : '🔒 Tạm khóa'}
                    </span>
                  </div>

                  {/* Actions for Main Category */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button 
                      onClick={() => handleOpenAddSub(cat)}
                      style={{ padding: '5px 10px', fontSize: '11.5px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                    >
                      <i className="ti ti-plus"></i> Thêm Lĩnh vực con
                    </button>
                    <button 
                      onClick={() => handleToggleCatStatus(cat)}
                      style={{ padding: '5px 10px', fontSize: '11.5px', background: cat.status === 'active' ? '#F59E0B' : '#10B981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                      title={cat.status === 'active' ? "Tạm khóa chuyên mục" : "Kích hoạt chuyên mục"}
                    >
                      <i className={`ti ${cat.status === 'active' ? 'ti-lock' : 'ti-lock-open'}`}></i> {cat.status === 'active' ? 'Tạm khóa' : 'Kích hoạt'}
                    </button>
                    <button 
                      onClick={() => handleOpenEditCat(cat)}
                      style={{ padding: '5px 10px', fontSize: '11.5px', background: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      <i className="ti ti-edit"></i> Sửa
                    </button>
                    <button 
                      onClick={() => handleDeleteCat(cat)}
                      style={{ padding: '5px 10px', fontSize: '11.5px', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FCA5A5', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      <i className="ti ti-trash"></i> Xóa
                    </button>
                  </div>
                </div>

                {/* Subcategories List */}
                <div style={{ padding: '1rem 1.25rem' }}>
                  {(!cat.subcategories || cat.subcategories.length === 0) ? (
                    <div style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic', padding: '8px 0' }}>
                      Chưa có Lĩnh vực con nào thuộc Chuyên mục này. Bấm "+ Thêm Lĩnh vực con" ở góc phải để tạo mới.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                      {cat.subcategories.map((sub) => (
                        <div 
                          key={sub.id} 
                          style={{ 
                            padding: '10px 12px', 
                            borderRadius: '8px', 
                            border: '1px solid #E2E8F0',
                            backgroundColor: sub.status === 'inactive' ? '#F8FAFC' : '#FAFAFA',
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            opacity: sub.status === 'inactive' ? 0.7 : 1
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                            <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>#{sub.order_index}</span>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {sub.name}
                            </span>
                            {sub.status === 'inactive' && (
                              <span style={{ fontSize: '9px', background: '#FEE2E2', color: '#B91C1C', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>
                                Tạm khóa
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                            <button 
                              onClick={() => handleToggleSubStatus(sub)}
                              style={{ background: 'none', border: 'none', color: sub.status === 'active' ? '#D97706' : '#059669', cursor: 'pointer', padding: '2px 4px', fontSize: '13px' }}
                              title={sub.status === 'active' ? 'Tạm khóa lĩnh vực con' : 'Kích hoạt lĩnh vực con'}
                            >
                              <i className={`ti ${sub.status === 'active' ? 'ti-eye-off' : 'ti-eye'}`}></i>
                            </button>
                            <button 
                              onClick={() => handleOpenEditSub(sub, cat.name)}
                              style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', padding: '2px 4px', fontSize: '13px' }}
                              title="Sửa lĩnh vực con"
                            >
                              <i className="ti ti-edit"></i>
                            </button>
                            <button 
                              onClick={() => handleDeleteSub(sub)}
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px 4px', fontSize: '13px' }}
                              title="Xóa lĩnh vực con"
                            >
                              <i className="ti ti-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* MODAL CATEGORY (MAIN) */}
      {catModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '1.5rem', background: '#fff', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                {editingCat ? 'Chỉnh sửa Chuyên mục' : 'Thêm Chuyên mục mới'}
              </h3>
              <button onClick={() => setCatModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748B' }}>&times;</button>
            </div>

            <form onSubmit={handleSaveCat}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 650, color: '#334155', marginBottom: '4px' }}>
                    Tên Chuyên mục (Tiếng Việt) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    value={catForm.name} 
                    onChange={(e) => setCatForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ví dụ: Du lịch, Doanh nghiệp..." 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                    required 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 650, color: '#334155', marginBottom: '4px' }}>
                    Tên Tiếng Anh (English Name)
                  </label>
                  <input 
                    type="text" 
                    value={catForm.name_en} 
                    onChange={(e) => setCatForm(prev => ({ ...prev, name_en: e.target.value }))}
                    placeholder="Ví dụ: Tourism, Enterprises..." 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 650, color: '#334155', marginBottom: '4px' }}>Thứ tự hiển thị</label>
                    <input 
                      type="number" 
                      value={catForm.order_index} 
                      onChange={(e) => setCatForm(prev => ({ ...prev, order_index: e.target.value }))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 650, color: '#334155', marginBottom: '4px' }}>Trạng thái</label>
                    <select 
                      value={catForm.status} 
                      onChange={(e) => setCatForm(prev => ({ ...prev, status: e.target.value }))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Tạm khóa</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
                <button type="button" onClick={() => setCatModalOpen(false)} className="btn" style={{ background: '#F1F5F9', color: '#475569', fontSize: '12.5px' }}>Hủy</button>
                <button type="submit" disabled={submitting} className="btn" style={{ background: '#185FA5', color: '#fff', fontSize: '12.5px' }}>
                  {submitting ? 'Đang lưu...' : (editingCat ? 'Cập nhật' : 'Thêm Chuyên mục')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SUBCATEGORY (CHILD) */}
      {subModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '1.5rem', background: '#fff', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                  {editingSub ? 'Chỉnh sửa Lĩnh vực con' : 'Thêm Lĩnh vực con mới'}
                </h3>
                <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>Thuộc chuyên mục: {targetCategoryName}</span>
              </div>
              <button onClick={() => setSubModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748B' }}>&times;</button>
            </div>

            <form onSubmit={handleSaveSub}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 650, color: '#334155', marginBottom: '4px' }}>
                    Tên Lĩnh vực con (Tiếng Việt) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    value={subForm.name} 
                    onChange={(e) => setSubForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ví dụ: Điểm đến nổi bật, Khách sạn & Resort..." 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                    required 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 650, color: '#334155', marginBottom: '4px' }}>
                    Tên Tiếng Anh (English Name)
                  </label>
                  <input 
                    type="text" 
                    value={subForm.name_en} 
                    onChange={(e) => setSubForm(prev => ({ ...prev, name_en: e.target.value }))}
                    placeholder="Ví dụ: Featured Destinations, Accommodations..." 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 650, color: '#334155', marginBottom: '4px' }}>Thứ tự hiển thị</label>
                    <input 
                      type="number" 
                      value={subForm.order_index} 
                      onChange={(e) => setSubForm(prev => ({ ...prev, order_index: e.target.value }))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 650, color: '#334155', marginBottom: '4px' }}>Trạng thái</label>
                    <select 
                      value={subForm.status} 
                      onChange={(e) => setSubForm(prev => ({ ...prev, status: e.target.value }))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Tạm khóa</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
                <button type="button" onClick={() => setSubModalOpen(false)} className="btn" style={{ background: '#F1F5F9', color: '#475569', fontSize: '12.5px' }}>Hủy</button>
                <button type="submit" disabled={submitting} className="btn" style={{ background: '#0284c7', color: '#fff', fontSize: '12.5px' }}>
                  {submitting ? 'Đang lưu...' : (editingSub ? 'Cập nhật' : 'Thêm Lĩnh vực')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default AdminCategories;
