import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../contexts/AuthContext';
import { compressImageFileToBase64 } from '../utils/compressImageForUpload';
import { extractYouTubeId, resolveVideoEmbed, getVideoDisplayThumbnail } from '../utils/videoUtils';

export { extractYouTubeId, resolveVideoEmbed, getVideoDisplayThumbnail };

export const AdminCoffee = () => {
  const { getAuthHeaders } = useAuth();
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // State thêm ảnh giá cà phê
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingBoardImg, setUploadingBoardImg] = useState(false);
  const [savingImage, setSavingImage] = useState(false);

  // State thêm / sửa video
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [videoForm, setVideoForm] = useState({
    title: '',
    video_url: '',
    summary: '',
    thumbnail_url: '',
    source: '',
    aspect_ratio: 'auto',
    order_index: 0,
    is_active: 1
  });
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [savingVideo, setSavingVideo] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [previewDetectedRatio, setPreviewDetectedRatio] = useState(null);

  // Phân trang 1 hàng cho Ảnh (4 ảnh/hàng) & Video (3 video/hàng)
  const ITEMS_PER_ROW_IMG = 4;
  const [currentPageImg, setCurrentPageImg] = useState(1);

  const ITEMS_PER_ROW_VID = 3;
  const [currentPageVid, setCurrentPageVid] = useState(1);

  // Tự động đo tỷ lệ khung hình thực tế khi mở Modal Xem thử để khử khoảng đen
  useEffect(() => {
    if (!previewVideo) {
      setPreviewDetectedRatio(null);
      return;
    }
    if (previewVideo.aspect_ratio && previewVideo.aspect_ratio !== 'auto') {
      const exp = String(previewVideo.aspect_ratio).trim();
      if (exp === '1:1') setPreviewDetectedRatio('1 / 1');
      else if (exp === '9:16') setPreviewDetectedRatio('9 / 16');
      else if (exp === '4:5') setPreviewDetectedRatio('4 / 5');
      else if (exp === '16:9') setPreviewDetectedRatio('16 / 9');
      return;
    }

    const thumb = getVideoDisplayThumbnail(previewVideo);
    if (thumb) {
      const probe = new Image();
      probe.src = thumb;
      probe.onload = () => {
        if (probe.naturalWidth > 0 && probe.naturalHeight > 0) {
          const r = probe.naturalWidth / probe.naturalHeight;
          if (Math.abs(r - 1) <= 0.15) {
            setPreviewDetectedRatio('1 / 1');
          } else if (r < 0.72) {
            setPreviewDetectedRatio('9 / 16');
          } else if (r < 0.95) {
            setPreviewDetectedRatio('4 / 5');
          } else {
            setPreviewDetectedRatio('16 / 9');
          }
        }
      };
    }
  }, [previewVideo]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coffee-management', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const imgs = data.images || [];
          setImages(imgs);
          const vids = data.videos || [];
          setVideos(vids);
          try {
            localStorage.setItem('daklak_coffee_videos', JSON.stringify(vids));
            window.dispatchEvent(new CustomEvent('coffee_video_updated', { detail: vids }));
          } catch (e) {}
          const primary = imgs.find(i => i.is_selected) || imgs[0];
          if (primary && primary.image_url) {
            try {
              localStorage.setItem('daklak_coffee_board_img', primary.image_url);
              window.dispatchEvent(new CustomEvent('coffee_image_updated', { detail: primary.image_url }));
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu Quản lý giá cafe:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Upload file ảnh chung qua /api/upload
  const uploadImageFile = async (file, setUploadingState, onSuccessUrl) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Kích thước file ảnh không được vượt quá 10MB');
      return;
    }
    setUploadingState(true);
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
        onSuccessUrl(data.url);
      } else {
        alert(data.error || 'Tải ảnh lên thất bại');
      }
    } catch (err) {
      alert('Lỗi tải ảnh: ' + err.message);
    } finally {
      setUploadingState(false);
    }
  };

  // Thêm ảnh bảng giá cà phê mới
  const handleAddCoffeeImage = async (e) => {
    e.preventDefault();
    if (!newImageUrl.trim()) {
      alert('Vui lòng tải ảnh lên từ máy tính hoặc nhập đường dẫn ảnh bảng giá cà phê!');
      return;
    }
    setSavingImage(true);
    try {
      const res = await fetch('/api/admin/coffee-images', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newImageTitle.trim() || `Bảng giá cà phê ngày ${new Date().toLocaleDateString('vi-VN')}`,
          image_url: newImageUrl.trim(),
          is_selected: 1,
          order_index: 0
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewImageTitle('');
        setNewImageUrl('');
        loadData();
      } else {
        alert(data.error || 'Không thể lưu ảnh bảng giá.');
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
    } finally {
      setSavingImage(false);
    }
  };

  // Bật / Tắt chọn hiển thị ảnh giá cà phê
  const handleToggleSelectImage = async (img) => {
    try {
      const nextSelected = img.is_selected ? 0 : 1;
      const res = await fetch(`/api/admin/coffee-images/${img.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_selected: nextSelected
        })
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      alert('Lỗi cập nhật trạng thái ảnh: ' + err.message);
    }
  };

  // Đặt ảnh lên vị trí ưu tiên số 1 (hiển thị chính ở Trang chủ & đầu slider)
  const handleMakePrimaryImage = async (img) => {
    try {
      // Đặt ảnh này is_selected = 1, order_index = 0 và tăng order_index các ảnh khác
      await Promise.all(
        images.map((item, idx) =>
          fetch(`/api/admin/coffee-images/${item.id}`, {
            method: 'PUT',
            headers: {
              ...getAuthHeaders(),
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              is_selected: item.id === img.id ? 1 : item.is_selected,
              order_index: item.id === img.id ? 0 : idx + 1
            })
          })
        )
      );
      loadData();
    } catch (err) {
      alert('Lỗi sắp xếp thứ tự ảnh: ' + err.message);
    }
  };

  // Thay đổi thứ tự ảnh (Lên / Xuống trong danh sách)
  const handleMoveImage = async (currentIndex, direction) => {
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newImages = [...images];
    const [moved] = newImages.splice(currentIndex, 1);
    newImages.splice(targetIndex, 0, moved);

    // Gán lại order_index tuần tự: 1, 2, 3...
    const items = newImages.map((img, idx) => ({ id: img.id, order_index: idx + 1 }));
    setImages(newImages);

    try {
      await fetch('/api/admin/coffee-images/reorder', {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items })
      });
      loadData();
    } catch (err) {
      console.error('Lỗi sắp xếp ảnh:', err);
      loadData();
    }
  };

  // Cập nhật số thứ tự trực tiếp của ảnh
  const handleUpdateImageOrder = async (imgId, orderVal) => {
    const parsed = parseInt(orderVal, 10);
    if (isNaN(parsed)) return;
    try {
      await fetch(`/api/admin/coffee-images/${imgId}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ order_index: parsed })
      });
      loadData();
    } catch (err) {
      alert('Lỗi cập nhật số thứ tự: ' + err.message);
    }
  };

  const handleDeleteImage = async (img) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ảnh "${img.title}" khỏi thư viện?`)) return;
    try {
      const res = await fetch(`/api/admin/coffee-images/${img.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      alert('Lỗi xóa ảnh: ' + err.message);
    }
  };

  // Thay đổi thứ tự video (Lên / Xuống trong danh sách)
  const handleMoveVideo = async (currentIndex, direction) => {
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= videos.length) return;

    const newVideos = [...videos];
    const [moved] = newVideos.splice(currentIndex, 1);
    newVideos.splice(targetIndex, 0, moved);

    // Gán lại order_index tuần tự: 1, 2, 3...
    const items = newVideos.map((vid, idx) => ({ id: vid.id, order_index: idx + 1 }));
    setVideos(newVideos);

    try {
      await fetch('/api/admin/coffee-videos/reorder', {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items })
      });
      loadData();
    } catch (err) {
      console.error('Lỗi sắp xếp video:', err);
      loadData();
    }
  };

  // Cập nhật số thứ tự trực tiếp của video
  const handleUpdateVideoOrder = async (vidId, orderVal) => {
    const parsed = parseInt(orderVal, 10);
    if (isNaN(parsed)) return;
    try {
      await fetch(`/api/admin/coffee-videos/${vidId}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ order_index: parsed })
      });
      loadData();
    } catch (err) {
      alert('Lỗi cập nhật số thứ tự video: ' + err.message);
    }
  };

  // Lưu Video (Thêm mới hoặc Cập nhật)
  const handleSaveVideo = async (e) => {
    e.preventDefault();
    if (!videoForm.title.trim()) {
      alert('Vui lòng nhập Tiêu đề video!');
      return;
    }
    if (!videoForm.video_url.trim()) {
      alert('Vui lòng nhập Link URL video!');
      return;
    }

    setSavingVideo(true);
    try {
      const isEdit = !!editingVideoId;
      const url = isEdit ? `/api/admin/coffee-videos/${editingVideoId}` : '/api/admin/coffee-videos';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(videoForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditingVideoId(null);
        setVideoForm({
          title: '',
          video_url: '',
          summary: '',
          thumbnail_url: '',
          source: '',
          aspect_ratio: 'auto',
          order_index: 0,
          is_active: 1
        });
        loadData();
      } else {
        alert(data.error || 'Không thể lưu video.');
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
    } finally {
      setSavingVideo(false);
    }
  };

  const handleStartEditVideo = (vid) => {
    setEditingVideoId(vid.id);
    setVideoForm({
      title: vid.title || '',
      video_url: vid.video_url || '',
      summary: vid.summary || '',
      thumbnail_url: vid.thumbnail_url || '',
      source: vid.source || '',
      aspect_ratio: vid.aspect_ratio || 'auto',
      order_index: vid.order_index ?? 0,
      is_active: vid.is_active !== undefined ? vid.is_active : 1
    });
    const formEl = document.getElementById('coffee-video-form-section');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteVideo = async (vid) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa video "${vid.title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/coffee-videos/${vid.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        if (editingVideoId === vid.id) {
          setEditingVideoId(null);
          setVideoForm({ title: '', video_url: '', summary: '', thumbnail_url: '', source: '', aspect_ratio: 'auto', order_index: 0, is_active: 1 });
        }
        loadData();
      }
    } catch (err) {
      alert('Lỗi xóa video: ' + err.message);
    }
  };

  const selectedImagesCount = images.filter(i => i.is_selected === 1).length;

  return (
    <AdminLayout title="Quản lý Giá Cà Phê & Video Thị Trường">
      {/* Header giới thiệu nhanh */}
      <div className="dash-card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', border: '1px solid #FDE68A' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800, color: '#78350F', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-coffee"></i> Quản trị Trang chuyên mục Giá Cà Phê (/gia-ca-phe)
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#92400E' }}>
              Tải lên và tích chọn các <strong>Ảnh bảng giá cà phê</strong> hiển thị ở Trang chủ & trang Giá cà phê, đồng thời quản lý danh sách <strong>Video thị trường cà phê</strong>.
            </p>
          </div>
          <a
            href="/gia-ca-phe"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '9px 16px',
              background: '#78350F',
              color: '#FFFFFF',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="ti ti-external-link"></i> Xem trang /gia-ca-phe
          </a>
        </div>
      </div>

      {/* ====================================================================
          PHẦN 1: QUẢN LÝ ẢNH HIỂN THỊ GIÁ CÀ PHÊ
          ==================================================================== */}
      <div className="dash-card" style={{ marginBottom: '2rem' }}>
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="ti ti-photo" style={{ color: '#D97706', fontSize: '20px' }}></i>
            <span style={{ fontSize: '16px', fontWeight: 700 }}>1. Quản lý Ảnh hiển thị Giá cà phê</span>
          </div>
          <span style={{ fontSize: '12.5px', background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '4px 12px', borderRadius: '999px', fontWeight: 600 }}>
            Đang chọn hiển thị: {selectedImagesCount} ảnh
          </span>
        </div>

        {/* Form tải lên / thêm ảnh mới */}
        <form
          onSubmit={handleAddCoffeeImage}
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}
        >
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1E293B', marginBottom: '12px' }}>
            <i className="ti ti-upload" style={{ color: '#2563EB', marginRight: '5px' }}></i>
            Tải lên ảnh bảng giá cà phê mới
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
                Tiêu đề / Ghi chú ảnh (Tùy chọn)
              </label>
              <input
                type="text"
                value={newImageTitle}
                onChange={(e) => setNewImageTitle(e.target.value)}
                placeholder="VD: Bảng giá cà phê ngày 06/11/2026..."
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>
                Đường dẫn ảnh hoặc Tải ảnh từ máy tính <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Dán link ảnh hoặc bấm Tải ảnh..."
                  style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
                <label
                  style={{
                    padding: '9px 14px',
                    background: uploadingBoardImg ? '#94A3B8' : '#3B82F6',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: uploadingBoardImg ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <i className={uploadingBoardImg ? 'ti ti-loader animate-spin' : 'ti ti-upload'}></i>
                  {uploadingBoardImg ? 'Đang tải...' : 'Chọn file ảnh'}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    disabled={uploadingBoardImg}
                    onChange={(e) => uploadImageFile(e.target.files?.[0], setUploadingBoardImg, (url) => setNewImageUrl(url))}
                  />
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={savingImage || uploadingBoardImg}
                style={{
                  width: '100%',
                  padding: '9px 18px',
                  background: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: savingImage ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <i className="ti ti-plus"></i>
                {savingImage ? 'Đang lưu...' : 'Thêm vào danh sách ảnh'}
              </button>
            </div>
          </div>

          {newImageUrl && (
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <img src={newImageUrl} alt="Preview" style={{ height: '90px', width: 'auto', borderRadius: '6px', objectFit: 'contain' }} />
              <div style={{ fontSize: '12.5px', color: '#334155' }}>
                <div><strong>Ảnh đã chọn:</strong> {newImageUrl}</div>
                <div style={{ color: '#059669', marginTop: '4px' }}>Nhấn nút <strong>"Thêm vào danh sách ảnh"</strong> để lưu và hiển thị.</div>
              </div>
            </div>
          )}
        </form>

        {/* Danh sách các ảnh để chọn / bỏ chọn hiển thị & sắp xếp thứ tự (1 Hàng + Phân trang) */}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Đang tải danh sách ảnh...</div>
        ) : images.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: '10px' }}>
            Chưa có ảnh bảng giá cà phê nào. Hãy tải ảnh lên ở khung bên trên.
          </div>
        ) : (() => {
          const totalPagesImg = Math.ceil(images.length / ITEMS_PER_ROW_IMG) || 1;
          const safePageImg = Math.min(Math.max(currentPageImg, 1), totalPagesImg);
          const displayedImages = images.slice((safePageImg - 1) * ITEMS_PER_ROW_IMG, safePageImg * ITEMS_PER_ROW_IMG);

          return (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px' }}>
                {displayedImages.map((img, pageIdx) => {
                  const globalIdx = (safePageImg - 1) * ITEMS_PER_ROW_IMG + pageIdx;
                  const isSelected = img.is_selected === 1;
                  const isPrimary = isSelected && globalIdx === 0;

                  return (
                    <div
                      key={img.id}
                      style={{
                        border: isSelected ? '2px solid #10B981' : '1px solid #CBD5E1',
                        borderRadius: '12px',
                        background: isSelected ? '#F0FDF4' : '#FFFFFF',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                        position: 'relative'
                      }}
                    >
                      {/* Thanh công cụ sắp xếp thứ tự ở đầu card */}
                      <div style={{
                        padding: '6px 10px',
                        background: '#F1F5F9',
                        borderBottom: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{
                            background: '#0F172A',
                            color: '#FFFFFF',
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            #{globalIdx + 1}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Thứ tự:</span>
                          <input
                            type="number"
                            defaultValue={img.order_index ?? (globalIdx + 1)}
                            onBlur={(e) => handleUpdateImageOrder(img.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateImageOrder(img.id, e.target.value);
                                e.target.blur();
                              }
                            }}
                            title="Nhập số thứ tự hiển thị và nhấn Enter hoặc bấm ra ngoài để lưu"
                            style={{
                              width: '42px',
                              padding: '2px 4px',
                              fontSize: '11.5px',
                              textAlign: 'center',
                              borderRadius: '4px',
                              border: '1px solid #CBD5E1',
                              fontWeight: 700,
                              color: '#0F172A'
                            }}
                          />
                        </div>

                        {/* Nút di chuyển vị trí nhanh: Lên trước / Xuống sau */}
                        <div style={{ display: 'flex', gap: '3px' }}>
                          <button
                            type="button"
                            onClick={() => handleMoveImage(globalIdx, -1)}
                            disabled={globalIdx === 0}
                            title="Dời ảnh sang trước (lên trên)"
                            style={{
                              padding: '3px 7px',
                              borderRadius: '4px',
                              border: '1px solid #CBD5E1',
                              background: globalIdx === 0 ? '#E2E8F0' : '#FFFFFF',
                              color: globalIdx === 0 ? '#94A3B8' : '#1E293B',
                              cursor: globalIdx === 0 ? 'not-allowed' : 'pointer',
                              fontSize: '11px',
                              fontWeight: 700
                            }}
                          >
                            <i className="ti ti-chevron-left"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveImage(globalIdx, 1)}
                            disabled={globalIdx === images.length - 1}
                            title="Dời ảnh sang sau (xuống dưới)"
                            style={{
                              padding: '3px 7px',
                              borderRadius: '4px',
                              border: '1px solid #CBD5E1',
                              background: globalIdx === images.length - 1 ? '#E2E8F0' : '#FFFFFF',
                              color: globalIdx === images.length - 1 ? '#94A3B8' : '#1E293B',
                              cursor: globalIdx === images.length - 1 ? 'not-allowed' : 'pointer',
                              fontSize: '11px',
                              fontWeight: 700
                            }}
                          >
                            <i className="ti ti-chevron-right"></i>
                          </button>
                        </div>
                      </div>

                      {isPrimary && (
                        <div style={{ position: 'absolute', top: '38px', left: '8px', background: '#D97706', color: '#fff', fontSize: '10.5px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', zIndex: 2, boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                          ★ Ảnh chính (Trang chủ)
                        </div>
                      )}

                      <div style={{ position: 'relative', background: '#1E293B', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img
                          src={img.image_url}
                          alt={img.title}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', opacity: isSelected ? 1 : 0.6 }}
                        />
                      </div>

                      <div style={{ padding: '10px 12px' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E293B', marginBottom: '8px', lineHeight: 1.35, minHeight: '34px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {img.title || 'Bảng giá cà phê'}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleSelectImage(img)}
                            style={{
                              width: '100%',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: isSelected ? '1px solid #059669' : '1px solid #94A3B8',
                              background: isSelected ? '#10B981' : '#F1F5F9',
                              color: isSelected ? '#FFFFFF' : '#334155',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '5px'
                            }}
                          >
                            <i className={`ti ${isSelected ? 'ti-checkbox' : 'ti-square'}`}></i>
                            {isSelected ? 'Đang chọn hiển thị' : 'Bấm để chọn hiển thị'}
                          </button>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            {!isPrimary && (
                              <button
                                type="button"
                                onClick={() => handleMakePrimaryImage(img)}
                                style={{
                                  flex: 1,
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #F59E0B',
                                  background: '#FFFBEB',
                                  color: '#B45309',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                                title="Đặt ảnh này lên đầu tiên và hiển thị ở Trang chủ"
                              >
                                <i className="ti ti-star"></i> Đặt lên đầu
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(img)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: '1px solid #FCA5A5',
                                background: '#FEF2F2',
                                color: '#DC2626',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              title="Xóa ảnh này"
                            >
                              <i className="ti ti-trash"></i> Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Thanh phân trang hiển thị 1 hàng ảnh */}
              {totalPagesImg > 1 && (
                <div style={{
                  marginTop: '18px',
                  paddingTop: '14px',
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                    Hiển thị <strong>{(safePageImg - 1) * ITEMS_PER_ROW_IMG + 1} - {Math.min(safePageImg * ITEMS_PER_ROW_IMG, images.length)}</strong> trên tổng số <strong>{images.length}</strong> ảnh
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      disabled={safePageImg <= 1}
                      onClick={() => setCurrentPageImg(prev => Math.max(prev - 1, 1))}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        background: safePageImg <= 1 ? '#F1F5F9' : '#FFFFFF',
                        color: safePageImg <= 1 ? '#94A3B8' : '#334155',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: safePageImg <= 1 ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <i className="ti ti-chevron-left"></i> Trang trước
                    </button>

                    {Array.from({ length: totalPagesImg }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPageImg(pageNum)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          border: pageNum === safePageImg ? '1px solid #059669' : '1px solid #CBD5E1',
                          background: pageNum === safePageImg ? '#10B981' : '#FFFFFF',
                          color: pageNum === safePageImg ? '#FFFFFF' : '#334155',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={safePageImg >= totalPagesImg}
                      onClick={() => setCurrentPageImg(prev => Math.min(prev + 1, totalPagesImg))}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        background: safePageImg >= totalPagesImg ? '#F1F5F9' : '#FFFFFF',
                        color: safePageImg >= totalPagesImg ? '#94A3B8' : '#334155',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: safePageImg >= totalPagesImg ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Trang sau <i className="ti ti-chevron-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* ====================================================================
          PHẦN 2: QUẢN LÝ VIDEO THỊ TRƯỜNG CÀ PHÊ
          ==================================================================== */}
      <div className="dash-card" id="coffee-video-form-section">
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="ti ti-video" style={{ color: '#E11D48', fontSize: '20px' }}></i>
            <span style={{ fontSize: '16px', fontWeight: 700 }}>2. Quản lý Video thị trường cà phê</span>
          </div>
          <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>
            Tổng số: {videos.length} video
          </span>
        </div>

        {/* Form thêm / cập nhật video */}
        <form
          onSubmit={handleSaveVideo}
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>
              <i className={`ti ${editingVideoId ? 'ti-edit' : 'ti-video-plus'}`} style={{ color: '#E11D48', marginRight: '6px' }}></i>
              {editingVideoId ? 'Chỉnh sửa thông tin Video' : 'Thêm Video mới vào chuyên mục Giá cà phê'}
            </div>
            {editingVideoId && (
              <button
                type="button"
                onClick={() => {
                  setEditingVideoId(null);
                  setVideoForm({ title: '', video_url: '', summary: '', thumbnail_url: '', source: '', is_active: 1 });
                }}
                style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
              >
                Hủy chỉnh sửa
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '14px' }}>
            {/* 1. Tiêu đề video */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginBottom: '5px' }}>
                Tiêu đề video <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={videoForm.title}
                onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nhập tiêu đề video..."
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            {/* 2. Link URL video */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginBottom: '5px' }}>
                Link URL video (YouTube, Google Drive, MP4 hoặc link nhúng) <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={videoForm.video_url}
                onChange={(e) => setVideoForm(prev => ({ ...prev, video_url: e.target.value }))}
                placeholder="VD: https://www.youtube.com/watch?v=... hoặc https://drive.google.com/..."
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '14px' }}>
            {/* 4. Ảnh bìa Video (Thumbnail) (nếu có) */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginBottom: '5px' }}>
                Ảnh bìa Video / Thumbnail (Không bắt buộc)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={videoForm.thumbnail_url}
                  onChange={(e) => setVideoForm(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                  placeholder="Để trống tự lấy ảnh YouTube, hoặc dán link / tải ảnh..."
                  style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
                <label
                  style={{
                    padding: '9px 14px',
                    background: uploadingThumb ? '#94A3B8' : '#3B82F6',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: uploadingThumb ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <i className={uploadingThumb ? 'ti ti-loader animate-spin' : 'ti ti-upload'}></i>
                  {uploadingThumb ? 'Đang tải...' : 'Tải ảnh bìa'}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    disabled={uploadingThumb}
                    onChange={(e) => uploadImageFile(e.target.files?.[0], setUploadingThumb, (url) => setVideoForm(prev => ({ ...prev, thumbnail_url: url })))}
                  />
                </label>
              </div>
            </div>

            {/* 5. Nguồn video (nếu có) */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginBottom: '5px' }}>
                Nguồn video (Không bắt buộc)
              </label>
              <input
                type="text"
                value={videoForm.source}
                onChange={(e) => setVideoForm(prev => ({ ...prev, source: e.target.value }))}
                placeholder="VD: Đài PT-TH Đắk Lắk, VTV1, Hiệp hội Cà phê..."
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '14px' }}>
            {/* 6. Tỷ lệ khung hình (Khắc phục triệt để khoảng đen) */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginBottom: '5px' }}>
                Tỷ lệ khung hình (Khắc phục khoảng đen thừa)
              </label>
              <select
                value={videoForm.aspect_ratio || 'auto'}
                onChange={(e) => setVideoForm(prev => ({ ...prev, aspect_ratio: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', background: '#FFFFFF', boxSizing: 'border-box' }}
              >
                <option value="auto">✨ Tự động co giãn theo video / thumbnail (Khuyên dùng)</option>
                <option value="16:9">Chuẩn ngang 16:9 (YouTube, Bản tin VTV, Phóng sự)</option>
                <option value="1:1">Vuông 1:1 (Facebook Video, FB Reels vuông)</option>
                <option value="9:16">Dọc 9:16 (TikTok, YouTube Shorts, FB Reels dọc cao)</option>
                <option value="4:5">Dọc 4:5 (Facebook Portrait)</option>
              </select>
            </div>

            {/* 7. Thứ tự hiển thị */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginBottom: '5px' }}>
                Thứ tự hiển thị (STT)
              </label>
              <input
                type="number"
                value={videoForm.order_index ?? 0}
                onChange={(e) => setVideoForm(prev => ({ ...prev, order_index: e.target.value }))}
                placeholder="0: Mặc định mới nhất lên đầu, hoặc 1, 2, 3..."
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* 3. Tóm tắt video (nếu có) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginBottom: '5px' }}>
              Tóm tắt video (Không bắt buộc)
            </label>
            <textarea
              rows={2}
              value={videoForm.summary}
              onChange={(e) => setVideoForm(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Mô tả ngắn gọn nội dung video (nếu có)..."
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="submit"
              disabled={savingVideo || uploadingThumb}
              style={{
                padding: '10px 22px',
                borderRadius: '8px',
                border: 'none',
                background: '#E11D48',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: savingVideo ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className={`ti ${editingVideoId ? 'ti-device-floppy' : 'ti-plus'}`}></i>
              {savingVideo ? 'Đang lưu...' : (editingVideoId ? 'Cập nhật Video' : 'Thêm Video')}
            </button>
          </div>
        </form>

        {/* Danh sách các video đã thêm & sắp xếp thứ tự (1 Hàng + Phân trang) */}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Đang tải danh sách video...</div>
        ) : videos.length === 0 ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1' }}>
            <i className="ti ti-video-off" style={{ fontSize: '28px', display: 'block', marginBottom: '6px', color: '#94A3B8' }}></i>
            Chưa có video nào. Trên trang <strong>/gia-ca-phe</strong> hiện đang hiển thị dòng chữ <em>"Chưa có video"</em>.
          </div>
        ) : (() => {
          const totalPagesVid = Math.ceil(videos.length / ITEMS_PER_ROW_VID) || 1;
          const safePageVid = Math.min(Math.max(currentPageVid, 1), totalPagesVid);
          const displayedVideos = videos.slice((safePageVid - 1) * ITEMS_PER_ROW_VID, safePageVid * ITEMS_PER_ROW_VID);

          return (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>
                {displayedVideos.map((vid, pageIdx) => {
                  const globalIdx = (safePageVid - 1) * ITEMS_PER_ROW_VID + pageIdx;
                  const thumb = getVideoDisplayThumbnail(vid);

                  return (
                    <div
                      key={vid.id}
                      style={{
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        background: '#FFFFFF',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
                      }}
                    >
                      {/* Thanh công cụ sắp xếp thứ tự ở đầu video card */}
                      <div style={{
                        padding: '6px 12px',
                        background: '#F1F5F9',
                        borderBottom: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{
                            background: '#E11D48',
                            color: '#FFFFFF',
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            #{globalIdx + 1}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Thứ tự:</span>
                          <input
                            type="number"
                            defaultValue={vid.order_index ?? (globalIdx + 1)}
                            onBlur={(e) => handleUpdateVideoOrder(vid.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateVideoOrder(vid.id, e.target.value);
                                e.target.blur();
                              }
                            }}
                            title="Nhập số thứ tự hiển thị và nhấn Enter hoặc bấm ra ngoài để lưu"
                            style={{
                              width: '42px',
                              padding: '2px 4px',
                              fontSize: '11.5px',
                              textAlign: 'center',
                              borderRadius: '4px',
                              border: '1px solid #CBD5E1',
                              fontWeight: 700,
                              color: '#0F172A'
                            }}
                          />
                        </div>

                        {/* Tỷ lệ khung hình badge & nút di chuyển nhanh */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{
                            fontSize: '10.5px',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#E0E7FF',
                            color: '#3730A3'
                          }}>
                            {vid.aspect_ratio && vid.aspect_ratio !== 'auto' ? vid.aspect_ratio : 'Tự động'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleMoveVideo(globalIdx, -1)}
                            disabled={globalIdx === 0}
                            title="Dời video sang trước (lên trên)"
                            style={{
                              padding: '3px 7px',
                              borderRadius: '4px',
                              border: '1px solid #CBD5E1',
                              background: globalIdx === 0 ? '#E2E8F0' : '#FFFFFF',
                              color: globalIdx === 0 ? '#94A3B8' : '#1E293B',
                              cursor: globalIdx === 0 ? 'not-allowed' : 'pointer',
                              fontSize: '11px',
                              fontWeight: 700
                            }}
                          >
                            <i className="ti ti-chevron-left"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveVideo(globalIdx, 1)}
                            disabled={globalIdx === videos.length - 1}
                            title="Dời video sang sau (xuống dưới)"
                            style={{
                              padding: '3px 7px',
                              borderRadius: '4px',
                              border: '1px solid #CBD5E1',
                              background: globalIdx === videos.length - 1 ? '#E2E8F0' : '#FFFFFF',
                              color: globalIdx === images.length - 1 ? '#94A3B8' : '#1E293B',
                              cursor: globalIdx === videos.length - 1 ? 'not-allowed' : 'pointer',
                              fontSize: '11px',
                              fontWeight: 700
                            }}
                          >
                            <i className="ti ti-chevron-right"></i>
                          </button>
                        </div>
                      </div>

                      <div>
                        <div
                          onClick={() => setPreviewVideo(vid)}
                          style={{ position: 'relative', aspectRatio: '16 / 9', background: '#0F172A', cursor: 'pointer', overflow: 'hidden' }}
                          title="Nhấn để xem thử video"
                        >
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={vid.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : null}
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.28)' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#E11D48', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                              <i className="ti ti-player-play-filled"></i>
                            </div>
                          </div>
                        </div>

                        <div style={{ padding: '12px 14px' }}>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginBottom: '4px', lineHeight: 1.4, minHeight: '38px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {vid.title}
                          </div>
                          {vid.source && (
                            <div style={{ fontSize: '11.5px', color: '#B45309', fontWeight: 600, marginBottom: '4px' }}>
                              Nguồn: {vid.source}
                            </div>
                          )}
                          {vid.summary && (
                            <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {vid.summary}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ padding: '10px 14px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', background: '#F8FAFC' }}>
                        <button
                          type="button"
                          onClick={() => setPreviewVideo(vid)}
                          style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#334155', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          <i className="ti ti-player-play"></i> Xem thử
                        </button>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleStartEditVideo(vid)}
                            style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #93C5FD', background: '#EFF6FF', color: '#1D4ED8', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            <i className="ti ti-edit"></i> Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVideo(vid)}
                            style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            <i className="ti ti-trash"></i> Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Thanh phân trang hiển thị 1 hàng video */}
              {totalPagesVid > 1 && (
                <div style={{
                  marginTop: '18px',
                  paddingTop: '14px',
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                    Hiển thị <strong>{(safePageVid - 1) * ITEMS_PER_ROW_VID + 1} - {Math.min(safePageVid * ITEMS_PER_ROW_VID, videos.length)}</strong> trên tổng số <strong>{videos.length}</strong> video
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      disabled={safePageVid <= 1}
                      onClick={() => setCurrentPageVid(prev => Math.max(prev - 1, 1))}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        background: safePageVid <= 1 ? '#F1F5F9' : '#FFFFFF',
                        color: safePageVid <= 1 ? '#94A3B8' : '#334155',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: safePageVid <= 1 ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <i className="ti ti-chevron-left"></i> Trang trước
                    </button>

                    {Array.from({ length: totalPagesVid }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPageVid(pageNum)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          border: pageNum === safePageVid ? '1px solid #E11D48' : '1px solid #CBD5E1',
                          background: pageNum === safePageVid ? '#E11D48' : '#FFFFFF',
                          color: pageNum === safePageVid ? '#FFFFFF' : '#334155',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={safePageVid >= totalPagesVid}
                      onClick={() => setCurrentPageVid(prev => Math.min(prev + 1, totalPagesVid))}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        background: safePageVid >= totalPagesVid ? '#F1F5F9' : '#FFFFFF',
                        color: safePageVid >= totalPagesVid ? '#94A3B8' : '#334155',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: safePageVid >= totalPagesVid ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Trang sau <i className="ti ti-chevron-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Modal Xem thử Video co giãn vừa khớp không thừa khoảng đen */}
      {previewVideo && (() => {
        const embed = resolveVideoEmbed(previewVideo.video_url, previewVideo.aspect_ratio);
        const finalRatio = previewDetectedRatio || embed.aspectRatio || '16 / 9';
        const isSquare = finalRatio === '1 / 1';
        const isVertical = finalRatio === '9 / 16' || finalRatio === '4 / 5';
        const modalMaxWidth = isSquare ? '520px' : isVertical ? '430px' : '860px';

        return (
          <div
            onClick={() => setPreviewVideo(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.82)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                maxWidth: modalMaxWidth,
                width: '100%',
                maxHeight: '92vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
                margin: 'auto',
                transition: 'max-width 0.25s ease'
              }}
            >
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                flexShrink: 0
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#0F172A',
                  lineHeight: 1.35,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {previewVideo.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setPreviewVideo(null)}
                  style={{
                    border: 'none',
                    background: '#F1F5F9',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '16px',
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  aria-label="Đóng"
                >
                  <i className="ti ti-x"></i>
                </button>
              </div>

              {/* Video Player Box - Co giãn vừa vặn, không bị thừa khoảng đen */}
              <div style={{
                position: 'relative',
                width: '100%',
                maxHeight: '75vh',
                aspectRatio: embed.type === 'video' ? 'auto' : finalRatio,
                background: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                margin: '0 auto'
              }}>
                {embed.type === 'video' ? (
                  <video
                    src={embed.src}
                    controls
                    autoPlay
                    style={{
                      maxWidth: '100%',
                      maxHeight: '75vh',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                ) : (
                  <iframe
                    src={embed.src}
                    title={previewVideo.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      display: 'block'
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                  />
                )}
              </div>

              {(previewVideo.summary || previewVideo.source) && (
                <div style={{
                  padding: '12px 18px',
                  background: '#F8FAFC',
                  maxHeight: '110px',
                  overflowY: 'auto',
                  borderTop: '1px solid #E2E8F0',
                  flexShrink: 0
                }}>
                  {previewVideo.source && (
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#B45309', marginBottom: previewVideo.summary ? '4px' : 0 }}>
                      Nguồn: {previewVideo.source}
                    </div>
                  )}
                  {previewVideo.summary && (
                    <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.55 }}>
                      {previewVideo.summary}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </AdminLayout>
  );
};

export default AdminCoffee;
