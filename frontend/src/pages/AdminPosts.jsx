import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../components/AdminLayout';
import RichTextEditor from '../components/RichTextEditor';
import { CATEGORIES_DATA } from '../constants/categories';
import { fetchJsonWithTimeout } from '../utils/api';
import { compressImageFileToBase64 } from '../utils/compressImageForUpload';

export const AdminPosts = () => {
  const { getAuthHeaders } = useAuth();

  // States
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected, hidden
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // States for viewing full post
  const [viewPostModalOpen, setViewPostModalOpen] = useState(false);
  const [selectedPostToView, setSelectedPostToView] = useState(null);

  // States for creating & editing post
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categoriesList, setCategoriesList] = useState(CATEGORIES_DATA);

  const initialPostForm = {
    title: '',
    summary: '',
    body: '',
    category: CATEGORIES_DATA[0]?.name || 'Khám phá Đắk Lắk',
    sub_category: CATEGORIES_DATA[0]?.subcategories?.[0] || 'Điểm đến & Thắng cảnh',
    type: 'Tin tức',
    author_name: 'Ban Quản trị DakLak.today',
    contact_info: '',
    source_url: '',
    tags: '',
    deadline: '',
    image_url: '',
    status: 'approved',
    is_featured: false
  };

  const [postForm, setPostForm] = useState(initialPostForm);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetchJsonWithTimeout('/api/categories', {}, 5000);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setCategoriesList(res.data);
        }
      } catch (e) {
        // Fallback to CATEGORIES_DATA
      }
    };
    fetchCats();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/posts?include_body=true&status=all&_t=${Date.now()}`, {
        headers: getAuthHeaders(),
        cache: 'no-store'
      });
      if (!res.ok) throw new Error('Không thể tải danh sách bài viết');
      const data = await res.json();
      setPosts(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenViewPost = async (p) => {
    setSelectedPostToView(p);
    setViewPostModalOpen(true);
    if (!p.body) {
      try {
        const res = await fetch(`/api/posts/${p.id}?_t=${Date.now()}`, { headers: getAuthHeaders(), cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setSelectedPostToView(data.data);
          }
        }
      } catch (e) {
        console.error("Lỗi lấy chi tiết bài viết:", e);
      }
    }
  };

  const handleOpenCreatePost = () => {
    setEditingPostId(null);
    const firstCat = categoriesList[0];
    setPostForm({
      title: '',
      summary: '',
      body: '',
      category: firstCat?.name || 'Khám phá Đắk Lắk',
      sub_category: firstCat?.subcategories?.[0] || 'Điểm đến & Thắng cảnh',
      type: 'Tin tức',
      author_name: 'Ban Quản trị DakLak.today',
      contact_info: '',
      source_url: '',
      tags: '',
      deadline: '',
      image_url: '',
      status: 'approved',
      is_featured: false
    });
    setPostModalOpen(true);
  };

  const handleOpenEditPost = async (p) => {
    setEditingPostId(p.id);
    let fullPost = p;
    if (!p.body) {
      try {
        const res = await fetch(`/api/posts/${p.id}?_t=${Date.now()}`, { headers: getAuthHeaders(), cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) fullPost = data.data;
        }
      } catch (e) {
        console.error("Lỗi lấy chi tiết bài viết để sửa:", e);
      }
    }

    let tagsStr = '';
    if (Array.isArray(fullPost.tags)) {
      tagsStr = fullPost.tags.join(', ');
    } else if (typeof fullPost.tags === 'string') {
      try {
        const parsed = JSON.parse(fullPost.tags);
        if (Array.isArray(parsed)) tagsStr = parsed.join(', ');
        else tagsStr = fullPost.tags;
      } catch (err) {
        tagsStr = fullPost.tags;
      }
    }

    setPostForm({
      title: fullPost.title || '',
      summary: fullPost.summary || '',
      body: fullPost.body || '',
      category: fullPost.category || (categoriesList[0]?.name || 'Khám phá Đắk Lắk'),
      sub_category: fullPost.sub_category || '',
      type: fullPost.type || 'Tin tức',
      author_name: fullPost.author_name || fullPost.company_name || 'Ban Quản trị DakLak.today',
      contact_info: fullPost.contact_info || '',
      source_url: fullPost.source_url || '',
      tags: tagsStr,
      deadline: fullPost.deadline ? String(fullPost.deadline).slice(0, 10) : '',
      image_url: fullPost.image_url || '',
      status: fullPost.status || 'approved',
      is_featured: fullPost.is_featured === 1
    });
    setPostModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Kích thước file ảnh không được vượt quá 10MB");
      return;
    }

    setUploadingImage(true);
    try {
      const compressed = await compressImageFileToBase64(file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName: compressed.fileName,
          fileType: compressed.fileType,
          base64Data: compressed.base64Data
        })
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setPostForm(prev => ({ ...prev, image_url: data.url }));
      } else {
        alert(data.error || 'Tải ảnh lên thất bại');
      }
    } catch (uploadErr) {
      alert('Lỗi tải ảnh: ' + uploadErr.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    if (!postForm.title.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết!');
      return;
    }
    if (!postForm.category) {
      alert('Vui lòng chọn chuyên mục cho bài viết!');
      return;
    }
    if (!postForm.body.trim()) {
      alert('Vui lòng nhập nội dung chi tiết bài viết!');
      return;
    }

    setSubmittingPost(true);
    try {
      const isEdit = !!editingPostId;
      const url = isEdit ? `/api/admin/posts/${editingPostId}` : '/api/admin/posts';
      const method = isEdit ? 'PUT' : 'POST';

      const tagsArray = postForm.tags
        ? (typeof postForm.tags === 'string' ? postForm.tags.split(',').map(t => t.trim()).filter(Boolean) : postForm.tags)
        : [];

      const payload = {
        ...postForm,
        tags: tagsArray
      };

      const res = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(isEdit ? 'Cập nhật bài viết thành công!' : 'Đăng bài viết mới thành công!');
        setPostModalOpen(false);
        await loadPosts();
      } else {
        alert(data.error || 'Lưu bài viết thất bại');
      }
    } catch (err) {
      alert('Lỗi hệ thống: ' + err.message);
    } finally {
      setSubmittingPost(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, categoryFilter, searchQuery, pageSize]);

  const handleApprove = async (id, title) => {
    if (!confirm(`Duyệt xuất bản bài viết: "${title}"?`)) return;
    try {
      const res = await fetch(`/api/posts/${id}/approve`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
        alert('Đã xuất bản bài viết thành công!');
        await loadPosts();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleReject = async (id, title) => {
    const reason = prompt(`Nhập lý do từ chối bài viết "${title}":`);
    if (reason === null) return;
    try {
      const res = await fetch(`/api/posts/${id}/reject`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
        alert('Đã từ chối bài viết.');
        await loadPosts();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleToggleFeatured = async (id, currentFeatured) => {
    try {
      const res = await fetch(`/api/posts/${id}/featured`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_featured: currentFeatured ? 0 : 1 })
      });
      if (res.ok) {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, is_featured: currentFeatured ? 0 : 1 } : p));
        alert(currentFeatured ? 'Đã bỏ ghim bài viết nổi bật.' : 'Đã ghim bài viết nổi bật thành công!');
        await loadPosts();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleHide = async (id, title) => {
    if (!confirm(`Ẩn bài viết: "${title}"? Bài viết sẽ không hiển thị công khai nữa.`)) return;
    try {
      const res = await fetch(`/api/posts/${id}/reject`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason: 'Admin ẩn bài viết' })
      });
      if (res.ok) {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
        alert('Đã ẩn bài viết thành công!');
        await loadPosts();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN bài viết "${title}"? Hành động này không thể hoàn tác!`)) return;
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== id));
        alert('Đã xóa vĩnh viễn bài viết thành công!');
        await loadPosts();
      } else {
        const err = await res.json();
        alert(err.error || 'Thao tác thất bại.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Get unique categories list from posts for filter
  const categoriesOptions = Array.from(new Set(posts.map(p => p.category).filter(Boolean)));

  // Filter posts
  const filteredPosts = posts.filter(p => {
    // 1. Status Filter
    if (statusFilter === 'pending' && p.status !== 'pending') return false;
    if (statusFilter === 'approved' && (p.status !== 'approved' || (p.deadline && new Date(p.deadline) < new Date()))) return false;
    if (statusFilter === 'rejected' && p.status !== 'rejected') return false;
    if (statusFilter === 'hidden' && (p.status === 'hidden' || p.status === 'rejected' || (p.deadline && new Date(p.deadline) < new Date())) === false) return false;

    // 2. Category Filter
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;

    // 3. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title && p.title.toLowerCase().includes(q);
      const matchAuthor = p.company_name && p.company_name.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor) return false;
    }

    return true;
  });

  // Pagination calculation
  const totalItems = filteredPosts.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + pageSize);

  return (
    <AdminLayout title="Duyệt Tin Giao Thương & Tin Tức">
      <div className="card" style={{ textAlign: 'left' }}>
        
        {/* Thanh Bộ Lọc & Tìm Kiếm Top */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          
          {/* Tabs Trạng thái */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <button className={`btn ${statusFilter === 'all' ? 'btn-primary' : ''}`} onClick={() => setStatusFilter('all')} style={{ fontSize: '12px', padding: '6px 12px' }}>Tất cả ({posts.length})</button>
            <button className={`btn ${statusFilter === 'pending' ? 'btn-primary' : ''}`} onClick={() => setStatusFilter('pending')} style={{ fontSize: '12px', padding: '6px 12px' }}>Chờ duyệt ({posts.filter(p => p.status === 'pending').length})</button>
            <button className={`btn ${statusFilter === 'approved' ? 'btn-primary' : ''}`} onClick={() => setStatusFilter('approved')} style={{ fontSize: '12px', padding: '6px 12px' }}>Đã duyệt ({posts.filter(p => p.status === 'approved' && (!p.deadline || new Date(p.deadline) >= new Date())).length})</button>
            <button className={`btn ${statusFilter === 'rejected' ? 'btn-primary' : ''}`} onClick={() => setStatusFilter('rejected')} style={{ fontSize: '12px', padding: '6px 12px' }}>Từ chối ({posts.filter(p => p.status === 'rejected').length})</button>
            <button className={`btn ${statusFilter === 'hidden' ? 'btn-primary' : ''}`} onClick={() => setStatusFilter('hidden')} style={{ fontSize: '12px', padding: '6px 12px' }}>Đã ẩn / Hết hạn ({posts.filter(p => p.status === 'hidden' || (p.deadline && new Date(p.deadline) < new Date())).length})</button>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Bộ lọc Chuyên mục */}
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none', background: '#fff' }}
            >
              <option value="all">-- Tất cả chuyên mục --</option>
              {categoriesOptions.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Tim kiem */}
            <input 
              type="text" 
              placeholder="Tìm theo tiêu đề, tác giả..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', width: '220px', outline: 'none' }}
            />

            {/* Nut Dang Bai Viet Moi */}
            <button 
              className="btn btn-primary"
              onClick={handleOpenCreatePost}
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '12px', 
                padding: '7px 14px', 
                borderRadius: '8px', 
                fontWeight: 600,
                background: '#10B981',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <i className="ti ti-plus" style={{ fontSize: '14px' }}></i> Đăng bài mới
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light-muted)' }}>
            <i className="ti ti-loader animate-spin" style={{ fontSize: '24px', display: 'block', margin: '0 auto 10px' }}></i> Đang tải danh sách bài viết...
          </div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#EF4444' }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i> Lỗi tải dữ liệu: {error}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light-muted)' }}>
            <i className="ti ti-news" style={{ fontSize: '24px', display: 'block', margin: '0 auto 10px' }}></i> Không tìm thấy bài đăng nào phù hợp với bộ lọc.
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', background: '#F8FAFC' }}>
                    <th style={{ padding: '12px 16px' }}>Tác giả / Doanh nghiệp</th>
                    <th style={{ padding: '12px 16px', width: '32%' }}>Tiêu đề tin đăng</th>
                    <th style={{ padding: '12px 16px' }}>Chuyên mục</th>
                    <th style={{ padding: '12px 16px' }}>Nổi bật</th>
                    <th style={{ padding: '12px 16px' }}>Lượt xem</th>
                    <th style={{ padding: '12px 16px' }}>Ngày đăng</th>
                    <th style={{ padding: '12px 16px' }}>Trạng thái</th>
                    <th style={{ padding: '12px 16px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPosts.map((p) => {
                    const isExpired = p.deadline && new Date(p.deadline) < new Date();
                    const isHiddenOrExpired = p.status === 'hidden' || isExpired;

                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, color: '#0F172A' }}>{p.company_name || 'Tác giả ẩn danh'}</div>
                          <span className={`badge ${p.company_tier === 'Platinum' ? 'b-platinum' : p.company_tier === 'Gold' ? 'b-gold' : 'b-silver'}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                            {p.company_tier}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <div style={{ fontWeight: 600, color: '#1E293B', textAlign: 'left' }}>{p.title}</div>
                            {p.featured_requested === 1 && p.is_featured === 0 && (
                              <span style={{ fontSize: '9px', background: 'rgba(245, 158, 11, 0.15)', color: '#D97706', border: '1px solid rgba(245,158,11,0.3)', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                                Yêu cầu ghim <i className="ti ti-star-filled"></i>
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '300px', textAlign: 'left' }}>
                            {p.summary}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>
                          <div>{p.category || 'Chưa phân loại'}</div>
                          <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>{p.sub_category}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {p.status === 'approved' && !isExpired ? (
                            <button 
                              onClick={() => handleToggleFeatured(p.id, p.is_featured === 1)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: p.is_featured === 1 ? '#F59E0B' : '#CBD5E1',
                                fontSize: '18px',
                                padding: 0
                              }}
                              title={p.is_featured === 1 ? "Bỏ ghim bài nổi bật" : "Ghim nổi bật (Tối đa 3 bài)"}
                            >
                              <i className={`ti ${p.is_featured === 1 ? 'ti-star-filled' : 'ti-star'}`}></i>
                            </button>
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: '11px' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}><i className="ti ti-eye"></i> {p.views || 0}</td>
                        <td style={{ padding: '12px 16px', color: '#64748B' }}>
                          {new Date(p.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`badge ${isHiddenOrExpired ? 'rejected' : p.status === 'approved' ? 'approved' : p.status === 'rejected' ? 'rejected' : 'pending'}`}>
                            {isHiddenOrExpired ? '❌ Đã bị ẩn (Hết hạn)' : p.status === 'approved' ? 'Đã duyệt' : p.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                          </span>
                          {p.status === 'rejected' && p.reject_reason && (
                            <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '4px', maxWidth: '150px', whiteSpace: 'normal' }}>Lý do: {p.reject_reason}</div>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button className="quick-btn" onClick={() => handleOpenViewPost(p)} style={{ padding: '4px 8px', fontSize: '11px', background: '#3B82F6', color: '#fff', border: '1px solid #3B82F6', borderRadius: '4px', cursor: 'pointer' }}>Xem</button>
                            <button 
                              className="quick-btn" 
                              onClick={() => handleOpenEditPost(p)} 
                              style={{ padding: '4px 8px', fontSize: '11px', background: '#6366F1', color: '#fff', border: '1px solid #6366F1', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                              title="Toàn quyền sửa bài viết này"
                            >
                              <i className="ti ti-edit"></i> Sửa
                            </button>
                            <a 
                              href={`/posts/${p.slug || p.id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ 
                                padding: '4px 8px', 
                                fontSize: '11px', 
                                background: '#0EA5E9', 
                                color: '#ffffff', 
                                border: '1px solid #0EA5E9', 
                                borderRadius: '4px', 
                                textDecoration: 'none', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '3px', 
                                fontWeight: 600, 
                                whiteSpace: 'nowrap' 
                              }}
                              title="Mở bài viết ngoài trang chủ"
                            >
                              <i className="ti ti-external-link"></i> Xem ở trang chủ
                            </a>
                            {p.status !== 'approved' && !isExpired && (
                              <button className="quick-btn quick-btn-approve" onClick={() => handleApprove(p.id, p.title)} style={{ padding: '4px 8px', fontSize: '11px' }}>Duyệt</button>
                            )}
                            {p.status === 'approved' && !isExpired && (
                              <button className="quick-btn" onClick={() => handleHide(p.id, p.title)} style={{ padding: '4px 8px', fontSize: '11px', background: '#F59E0B', color: '#fff', border: '1px solid #F59E0B', borderRadius: '4px', cursor: 'pointer' }}>Ẩn bài</button>
                            )}
                            {p.status === 'pending' && (
                              <button className="quick-btn quick-btn-reject" onClick={() => handleReject(p.id, p.title)} style={{ padding: '4px 8px', fontSize: '11px' }}>Từ chối</button>
                            )}
                            <button className="quick-btn" onClick={() => handleDelete(p.id, p.title)} style={{ padding: '4px 8px', fontSize: '11px', background: '#EF4444', color: '#fff', border: '1px solid #EF4444', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Thanh Phân Trang (Pagination Controls) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                Hiển thị <strong>{startIndex + 1}</strong> - <strong>{Math.min(startIndex + pageSize, totalItems)}</strong> trên tổng số <strong>{totalItems}</strong> bài viết
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

      {/* VIEW POST DETAIL MODAL */}
      {viewPostModalOpen && selectedPostToView && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ width: '800px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', marginBottom: '1.5rem' }}>
              <div style={{ textAlign: 'left' }}>
                <span className={`badge ${selectedPostToView.company_tier === 'Platinum' ? 'b-platinum' : selectedPostToView.company_tier === 'Gold' ? 'b-gold' : 'b-silver'}`} style={{ fontSize: '10px', padding: '2px 6px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px', display: 'inline-block' }}>
                  {selectedPostToView.company_tier}
                </span>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0F172A', fontWeight: 700 }}>{selectedPostToView.title}</h3>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                  Đăng bởi: <strong>{selectedPostToView.company_name}</strong> | Chuyên mục: <strong>{selectedPostToView.category || 'Chưa xếp'}</strong> | Lĩnh vực: <strong>{selectedPostToView.sub_category || 'Chưa xếp'}</strong>
                </div>
              </div>
              <button 
                onClick={() => setViewPostModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748B', lineHeight: '20px', padding: 0 }}
              >
                &times;
              </button>
            </div>

            <div style={{ textAlign: 'left', fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
              {selectedPostToView.image_url ? (
                <div style={{ width: '100%', maxHeight: '350px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    src={selectedPostToView.image_url} 
                    alt={selectedPostToView.title} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80';
                    }}
                    style={{ width: '100%', maxHeight: '350px', objectFit: 'contain' }} 
                  />
                </div>
              ) : null}

              {selectedPostToView.summary && (
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #3B82F6', marginBottom: '1.5rem', fontWeight: '500' }}>
                  Tóm tắt: {selectedPostToView.summary}
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: '600', color: '#0F172A', marginBottom: '8px', fontSize: '14px', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
                  Nội dung chi tiết
                </div>
                {selectedPostToView.body ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: selectedPostToView.body }} 
                    style={{ padding: '8px 0', fontSize: '14px', lineHeight: 1.7, color: '#334155' }} 
                    className="rich-content-view" 
                  />
                ) : (
                  <div style={{ color: '#94A3B8', fontStyle: 'italic', padding: '12px 0' }}>
                    (Đang tải nội dung hoặc bài viết chưa có nội dung chi tiết...)
                  </div>
                )}
              </div>

              <div style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '15px', background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Thông tin liên hệ trực tiếp</div>
                  <div style={{ fontWeight: '600', color: '#0F172A', marginTop: '2px' }}>{selectedPostToView.contact_info || 'Chưa cung cấp'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Hạn đăng tin</div>
                  <div style={{ fontWeight: '600', color: '#0F172A', marginTop: '2px' }}>
                    {selectedPostToView.deadline ? new Date(selectedPostToView.deadline).toLocaleDateString('vi-VN') : 'Không giới hạn (Hiển thị vĩnh viễn)'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <a 
                href={`/posts/${selectedPostToView.slug || selectedPostToView.id}`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  fontSize: '12px', 
                  padding: '7px 14px', 
                  background: '#0EA5E9', 
                  color: '#ffffff', 
                  border: 'none', 
                  borderRadius: '6px', 
                  textDecoration: 'none', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '5px',
                  fontWeight: 600 
                }}
              >
                <i className="ti ti-external-link"></i> Mở xem trên Web
              </a>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn" 
                  onClick={() => {
                    const post = selectedPostToView;
                    setViewPostModalOpen(false);
                    handleOpenEditPost(post);
                  }}
                  style={{ fontSize: '12px', padding: '7px 14px', background: '#6366F1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <i className="ti ti-edit"></i> Sửa bài viết
                </button>
                <button 
                  className="btn" 
                  onClick={() => setViewPostModalOpen(false)}
                  style={{ fontSize: '12px', padding: '7px 14px', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Đóng
                </button>
                {selectedPostToView.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => {
                        const id = selectedPostToView.id;
                        const title = selectedPostToView.title;
                        setViewPostModalOpen(false);
                        handleReject(id, title);
                      }}
                      style={{ fontSize: '12px', padding: '7px 14px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Từ chối bài
                    </button>
                    <button 
                      onClick={() => {
                        const id = selectedPostToView.id;
                        const title = selectedPostToView.title;
                        setViewPostModalOpen(false);
                        handleApprove(id, title);
                      }}
                      style={{ fontSize: '12px', padding: '7px 16px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      <i className="ti ti-check"></i> Duyệt bài đăng này
                    </button>
                  </>
                )}
                {selectedPostToView.status !== 'pending' && selectedPostToView.status !== 'approved' && (
                  <button 
                    onClick={() => {
                      const id = selectedPostToView.id;
                      const title = selectedPostToView.title;
                      setViewPostModalOpen(false);
                      handleApprove(id, title);
                    }}
                    style={{ fontSize: '12px', padding: '7px 16px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    <i className="ti ti-check"></i> Xuất bản bài viết
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT POST MODAL */}
      {postModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div className="card" style={{ width: '920px', maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '2rem', background: '#fff', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0F172A', fontWeight: 700 }}>
                  {editingPostId ? 'Chỉnh sửa bài viết (Toàn quyền Admin)' : 'Đăng bài viết mới (Admin)'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                  {editingPostId 
                    ? 'Bạn có toàn quyền thay đổi tiêu đề, nội dung chi tiết, trạng thái và hình ảnh của bài viết này.' 
                    : 'Tạo bài viết và xuất bản ngay lên hệ thống DakLak.today mà không cần qua xét duyệt.'}
                </p>
              </div>
              <button 
                onClick={() => setPostModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748B', lineHeight: '20px', padding: 0 }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSavePost}>
              {/* Tiêu đề */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
                  Tiêu đề bài viết <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input 
                  type="text" 
                  value={postForm.title} 
                  onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nhập tiêu đề bài viết rõ ràng, hấp dẫn..." 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>

              {/* Grid 2 cột: Chuyên mục & Lĩnh vực */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
                    Chuyên mục chính <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select 
                    value={postForm.category} 
                    onChange={(e) => {
                      const selectedCatName = e.target.value;
                      const matched = categoriesList.find(c => c.name === selectedCatName);
                      setPostForm(prev => ({
                        ...prev,
                        category: selectedCatName,
                        sub_category: matched?.subcategories?.[0] || ''
                      }));
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                    required
                  >
                    {categoriesList.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
                    Lĩnh vực con / Phân nhóm
                  </label>
                  {(() => {
                    const currentCatObj = categoriesList.find(c => c.name === postForm.category);
                    const subList = currentCatObj?.subcategories || [];
                    if (subList.length > 0) {
                      return (
                        <select 
                          value={postForm.sub_category} 
                          onChange={(e) => setPostForm(prev => ({ ...prev, sub_category: e.target.value }))}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                        >
                          <option value="">-- Chọn lĩnh vực --</option>
                          {subList.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      );
                    }
                    return (
                      <input 
                        type="text" 
                        value={postForm.sub_category} 
                        onChange={(e) => setPostForm(prev => ({ ...prev, sub_category: e.target.value }))}
                        placeholder="Nhập phân nhóm (nếu có)..."
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    );
                  })()}
                </div>
              </div>

              {/* Grid 2 cột: Loại bài & Tên tác giả */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
                    Loại bài viết
                  </label>
                  <select 
                    value={postForm.type} 
                    onChange={(e) => setPostForm(prev => ({ ...prev, type: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="Tin tức">Tin tức & Khám phá</option>
                    <option value="Nhu cầu kết nối">Nhu cầu kết nối / Mua bán</option>
                    <option value="Giới thiệu sản phẩm">Giới thiệu sản phẩm / Dịch vụ</option>
                    <option value="Cung cấp dịch vụ">Cung cấp dịch vụ</option>
                    <option value="Hợp tác kinh doanh">Hợp tác kinh doanh</option>
                    <option value="Tuyển dụng">Tuyển dụng & Việc làm</option>
                    <option value="Thông báo">Thông báo chính thức</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
                    Tên tác giả / Đơn vị đăng
                  </label>
                  <input 
                    type="text" 
                    value={postForm.author_name} 
                    onChange={(e) => setPostForm(prev => ({ ...prev, author_name: e.target.value }))}
                    placeholder="Ban Quản trị DakLak.today..." 
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Ảnh đại diện */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
                  Ảnh bìa đại diện
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input 
                    type="text" 
                    value={postForm.image_url} 
                    onChange={(e) => setPostForm(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="Dán link ảnh trực tiếp hoặc tải ảnh từ máy tính..." 
                    style={{ flex: 1, minWidth: '240px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <label 
                    style={{ 
                      padding: '8px 14px', 
                      background: uploadingImage ? '#94A3B8' : '#3B82F6', 
                      color: '#fff', 
                      borderRadius: '8px', 
                      cursor: uploadingImage ? 'not-allowed' : 'pointer', 
                      fontSize: '12px', 
                      fontWeight: 600, 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '5px' 
                    }}
                  >
                    <i className={uploadingImage ? "ti ti-loader animate-spin" : "ti ti-upload"}></i>
                    {uploadingImage ? 'Đang tải ảnh...' : 'Tải ảnh lên'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      disabled={uploadingImage} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
                {postForm.image_url && (
                  <div style={{ marginTop: '8px', width: '100%', maxHeight: '160px', overflow: 'hidden', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={postForm.image_url} 
                      alt="Xem trước" 
                      style={{ maxHeight: '160px', width: 'auto', objectFit: 'contain' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              {/* Tóm tắt ngắn */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
                  Tóm tắt ngắn (Hiển thị ở danh sách bài viết)
                </label>
                <textarea 
                  rows={2} 
                  value={postForm.summary} 
                  onChange={(e) => setPostForm(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Mô tả súc tích nội dung bài viết trong 1-2 câu..." 
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              {/* Nội dung chi tiết - RichTextEditor */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>
                  Nội dung chi tiết bài viết <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <RichTextEditor 
                  value={postForm.body} 
                  onChange={(val) => setPostForm(prev => ({ ...prev, body: val }))} 
                  placeholder="Soạn thảo nội dung bài viết chi tiết, chèn hình ảnh, định dạng văn bản..." 
                />
              </div>

              {/* Grid 3 cột: Thông tin liên hệ, Hạn đăng, Tags */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1E293B', marginBottom: '5px' }}>
                    Thông tin liên hệ
                  </label>
                  <input 
                    type="text" 
                    value={postForm.contact_info} 
                    onChange={(e) => setPostForm(prev => ({ ...prev, contact_info: e.target.value }))}
                    placeholder="Hotline, Email, Zalo..." 
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1E293B', marginBottom: '5px' }}>
                    Hạn đăng bài (Tùy chọn)
                  </label>
                  <input 
                    type="date" 
                    value={postForm.deadline} 
                    onChange={(e) => setPostForm(prev => ({ ...prev, deadline: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1E293B', marginBottom: '5px' }}>
                    Tags (Phân cách bằng dấu phẩy)
                  </label>
                  <input 
                    type="text" 
                    value={postForm.tags} 
                    onChange={(e) => setPostForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="daklak, dautu, nongnghiep..." 
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Grid 2 cột: Trạng thái & Ghim nổi bật */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#1E293B' }}>Trạng thái:</label>
                  <select 
                    value={postForm.status} 
                    onChange={(e) => setPostForm(prev => ({ ...prev, status: e.target.value }))}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px', outline: 'none', background: '#fff', fontWeight: 600, color: postForm.status === 'approved' ? '#059669' : '#D97706' }}
                  >
                    <option value="approved">Xuất bản công khai (Đã duyệt)</option>
                    <option value="pending">Chờ xét duyệt</option>
                    <option value="rejected">Từ chối / Khóa</option>
                    <option value="hidden">Ẩn bài viết</option>
                  </select>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
                  <input 
                    type="checkbox" 
                    checked={postForm.is_featured} 
                    onChange={(e) => setPostForm(prev => ({ ...prev, is_featured: e.target.checked }))} 
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span>Ghim nổi bật ngoài Trang chủ <i className="ti ti-star-filled" style={{ color: '#F59E0B' }}></i></span>
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
                <button 
                  type="button" 
                  onClick={() => setPostModalOpen(false)}
                  style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F1F5F9', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  disabled={submittingPost}
                  style={{ 
                    padding: '8px 22px', 
                    borderRadius: '6px', 
                    border: 'none', 
                    background: '#10B981', 
                    color: '#fff', 
                    fontSize: '13px', 
                    fontWeight: 600, 
                    cursor: submittingPost ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {submittingPost && <i className="ti ti-loader animate-spin"></i>}
                  {submittingPost ? 'Đang lưu...' : (editingPostId ? 'Lưu thay đổi bài viết' : 'Đăng bài viết ngay')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
export default AdminPosts;
