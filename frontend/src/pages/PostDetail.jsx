import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { getCategoryLabel } from '../constants/categories';
import './PostDetail.css';

export const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, token } = useAuth();
  const { currentLang, t } = useTranslation();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // One Click to Discover: Bài viết liên quan
  const [relatedPosts, setRelatedPosts] = useState([]);

  // One Click to Share: Toast thông báo sao chép
  const [toastMessage, setToastMessage] = useState('');

  // One Click to Act & Connect Modal
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionModalType, setActionModalType] = useState('dossier'); // 'dossier' | 'interest' | 'connect'
  const [actionForm, setActionForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    companyName: '',
    notes: ''
  });
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);

  // Xem chi tiết hội viên đăng tải
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberDetails, setMemberDetails] = useState(null);
  const [loadingMember, setLoadingMember] = useState(false);

  // Trạng thái dịch bài viết
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedSummary, setTranslatedSummary] = useState('');
  const [translatedBody, setTranslatedBody] = useState('');
  const [isTranslated, setIsTranslated] = useState(false);
  const [loadingTranslate, setLoadingTranslate] = useState(false);
  const [translateTargetLang, setTranslateTargetLang] = useState(currentLang === 'vi' ? 'en' : currentLang);
  
  // Trạng thái dịch mô tả hội viên trong Modal
  const [translatedMemberDesc, setTranslatedMemberDesc] = useState('');
  const [isMemberDescTranslated, setIsMemberDescTranslated] = useState(false);
  const [loadingMemberDescTranslate, setLoadingMemberDescTranslate] = useState(false);
  const [memberTranslateTargetLang, setMemberTranslateTargetLang] = useState(currentLang === 'vi' ? 'en' : currentLang);

  // One Click to Share Handlers
  const handleCopyLink = () => {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          setToastMessage(currentLang === 'en' ? 'Article link copied to clipboard!' : 'Đã sao chép liên kết bài viết thành công!');
          setTimeout(() => setToastMessage(''), 2500);
        })
        .catch(() => fallbackCopy(url));
    } else {
      fallbackCopy(url);
    }
  };

  const fallbackCopy = (text) => {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setToastMessage(currentLang === 'en' ? 'Article link copied to clipboard!' : 'Đã sao chép liên kết bài viết thành công!');
      setTimeout(() => setToastMessage(''), 2500);
    } catch (e) {
      alert(currentLang === 'en' ? 'Article link: ' + text : 'Liên kết bài viết: ' + text);
    }
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener,noreferrer,width=640,height=560');
  };

  const handleShareZalo = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://zalo.me/share?url=${url}`, '_blank', 'noopener,noreferrer,width=640,height=560');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post ? (isTranslated ? translatedTitle : post.title) : 'DakLak.today',
          text: post ? (isTranslated ? translatedSummary : post.summary || post.title) : '',
          url: window.location.href
        });
      } catch (e) {}
    } else {
      handleCopyLink();
    }
  };

  // One Click to Act & Connect Open Modal
  const openActionModal = (type) => {
    setActionModalType(type);
    setActionSuccess(false);
    setActionForm({
      fullName: '',
      phone: '',
      email: '',
      companyName: '',
      notes: ''
    });
    setShowActionModal(true);
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!actionForm.fullName || !actionForm.phone || !actionForm.email) {
      alert(currentLang === 'en' ? 'Please fill in Name, Phone, and Email (*)' : 'Vui lòng điền Họ tên, Số điện thoại và Email (*)');
      return;
    }
    setActionSubmitting(true);
    try {
      const leadSubject = `Đăng ký quan tâm bài viết: ${post.title}${post.company_name ? ` (Đơn vị: ${post.company_name})` : ''}`;

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: actionForm.fullName,
          phone: actionForm.phone,
          email: actionForm.email,
          city: 'Đắk Lắk',
          companyName: actionForm.companyName || 'Cá nhân / Nhà đầu tư',
          memberType: 'Quan tâm đầu tư',
          notes: `${leadSubject}. Ghi chú: ${actionForm.notes || 'Không có'}`
        })
      });
      if (res.ok) {
        setActionSuccess(true);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Có lỗi xảy ra khi gửi thông tin');
      }
    } catch (err) {
      alert('Không thể kết nối máy chủ: ' + err.message);
    } finally {
      setActionSubmitting(false);
    }
  };

  useEffect(() => {
    setIsTranslated(false);
    setTranslatedTitle('');
    setTranslatedSummary('');
    setTranslatedBody('');
  }, [translateTargetLang]);

  useEffect(() => {
    setIsMemberDescTranslated(false);
    setTranslatedMemberDesc('');
  }, [memberTranslateTargetLang]);

  useEffect(() => {
    const target = currentLang === 'vi' ? 'en' : currentLang;
    setTranslateTargetLang(target);
    setMemberTranslateTargetLang(target);
  }, [currentLang]);

  const handleTranslatePost = async () => {
    if (isTranslated) {
      setIsTranslated(false);
      return;
    }
    if (translatedTitle && translatedBody) {
      setIsTranslated(true);
      return;
    }
    setLoadingTranslate(true);
    try {
      const resTitle = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: post.title, targetLang: translateTargetLang })
      });
      const dataTitle = await resTitle.json();

      let tSummary = '';
      if (post.summary) {
        const resSum = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: post.summary, targetLang: translateTargetLang })
        });
        const dataSum = await resSum.json();
        tSummary = dataSum.translatedText || '';
      }

      const resBody = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: post.body, targetLang: translateTargetLang })
      });
      const dataBody = await resBody.json();

      if (dataTitle.success && dataBody.success) {
        setTranslatedTitle(dataTitle.translatedText);
        setTranslatedSummary(tSummary);
        setTranslatedBody(dataBody.translatedText);
        setIsTranslated(true);
      } else {
        alert('Lỗi dịch thuật: ' + (dataTitle.error || dataBody.error || 'Lỗi không xác định'));
      }
    } catch (err) {
      alert('Không thể thực hiện dịch: ' + err.message);
    } finally {
      setLoadingTranslate(false);
    }
  };

  const handleTranslateMemberDesc = async () => {
    if (isMemberDescTranslated) {
      setIsMemberDescTranslated(false);
      return;
    }
    if (translatedMemberDesc) {
      setIsMemberDescTranslated(true);
      return;
    }
    if (!memberDetails || !memberDetails.description) return;

    setLoadingMemberDescTranslate(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: memberDetails.description, targetLang: memberTranslateTargetLang })
      });
      const data = await res.json();
      if (data.success) {
        setTranslatedMemberDesc(data.translatedText);
        setIsMemberDescTranslated(true);
      } else {
        alert('Lỗi dịch thuật: ' + (data.error || 'Lỗi không xác định'));
      }
    } catch (err) {
      alert('Không thể thực hiện dịch: ' + err.message);
    } finally {
      setLoadingMemberDescTranslate(false);
    }
  };

  const handleViewMemberDetails = async (memberId) => {
    if (!memberId) return;
    setTranslatedMemberDesc('');
    setIsMemberDescTranslated(false);
    setLoadingMember(true);
    setShowMemberModal(true);
    try {
      const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
      const res = await fetch(`/api/members/${memberId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMemberDetails(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching member details', err);
    } finally {
      setLoadingMember(false);
    }
  };

  const demoImages = [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80'
  ];

  // Ngăn chặn hiện tượng tự động cuộn (giật trang) khi click chuyển Slide trong iframe
  useEffect(() => {
    let savedScrollY = 0;
    const handleScroll = () => {
      savedScrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleBlur = () => {
      if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
        const targetY = savedScrollY;
        requestAnimationFrame(() => {
          window.scrollTo(0, targetY);
        });
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      setTranslatedTitle('');
      setTranslatedSummary('');
      setTranslatedBody('');
      setIsTranslated(false);
      setLoading(true);
      try {
        const activeToken = token || localStorage.getItem('doson_creator_token') || localStorage.getItem('doson_member_token') || localStorage.getItem('doson_admin_token');
        const headers = activeToken ? { 'Authorization': 'Bearer ' + activeToken } : {};
        const res = await fetch(`/api/posts/${id}`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setPost(data.data);
          } else {
            setError('Không tìm thấy bài viết.');
          }
        } else {
          setError('Không tìm thấy bài viết hoặc bạn không có quyền xem.');
        }
      } catch (err) {
        setError('Có lỗi xảy ra: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, token]);

  // One Click to Discover: Tải các bài viết và cơ hội cùng chuyên đề
  useEffect(() => {
    if (!post) return;
    const fetchRelated = async () => {
      try {
        const catQuery = post.category ? `&category=${encodeURIComponent(post.category)}` : '';
        const res = await fetch(`/api/posts?limit=6${catQuery}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            const currentIdentifier = post.slug || String(post.id);
            const filtered = data.data.filter(p => (p.slug || String(p.id)) !== currentIdentifier).slice(0, 3);
            setRelatedPosts(filtered);
          }
        }
      } catch (err) {
        console.warn('Lỗi tải bài viết liên quan:', err);
      }
    };
    fetchRelated();
  }, [post]);

  if (loading) {
    return (
      <div className="public-body" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            <i className="ti ti-loader animate-spin" style={{ fontSize: '32px', display: 'block', margin: '0 auto 15px' }}></i>
            {currentLang === 'en' ? 'Loading post details...' : 'Đang tải chi tiết bài viết...'}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="public-body" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px', padding: '2rem' }} className="glass-card">
            <i className="ti ti-alert-triangle" style={{ fontSize: '48px', color: '#EF4444', display: 'block', marginBottom: '1rem' }}></i>
            <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '10px' }}>{currentLang === 'en' ? 'An error occurred' : 'Đã xảy ra lỗi'}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginBottom: '1.5rem' }}>{error || (currentLang === 'en' ? 'Information not found.' : 'Không tìm thấy thông tin.')}</p>
            <button onClick={() => navigate('/posts')} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>{currentLang === 'en' ? 'Back to Feed' : 'Quay lại Bảng tin'}</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const dateStr = post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : '11/06/2026';
  const hasValidImg = post.image_url && post.image_url !== 'null' && post.image_url !== 'undefined' && post.image_url.trim() !== '';
  const imgUrl = hasValidImg ? post.image_url : demoImages[post.id % demoImages.length];
  const isPlatinum = post.company_tier === 'Platinum';
  const isGold = post.company_tier === 'Gold';

  const plainBodyText = post.body ? post.body.replace(/<[^>]+>/g, '').substring(0, 160) : '';
  const rawDesc = isTranslated ? (translatedSummary || plainBodyText) : (post.summary || plainBodyText || post.title);
  const metaDescription = rawDesc.length > 160 ? rawDesc.substring(0, 157) + '...' : rawDesc;

  // Parse Tags từ khoá SEO
  let parsedTagsStr = '';
  if (post.tags) {
    try {
      const arr = typeof post.tags === 'string' && post.tags.startsWith('[') ? JSON.parse(post.tags) : post.tags;
      parsedTagsStr = Array.isArray(arr) ? arr.join(', ') : String(arr);
    } catch(e) {
      parsedTagsStr = String(post.tags);
    }
  }
  const metaKeywords = [parsedTagsStr, post.category, post.sub_category, 'DakLak.today', 'Cổng thông tin & Dữ liệu DakLak.today', post.title].filter(Boolean).join(', ');

  // Generate NewsArticle JSON-LD schema
  const newsSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": isTranslated ? translatedTitle : post.title,
    "image": [imgUrl],
    "datePublished": post.created_at || post.published_at,
    "dateModified": post.updated_at || post.created_at,
    "author": [{
      "@type": "Organization",
      "name": post.company_name || "Hội viên DakLak.today"
    }],
    "publisher": {
      "@type": "Organization",
      "name": "DakLak.today",
      "logo": {
        "@type": "ImageObject",
        "url": "https://daklak.today/logo_icon.png"
      }
    },
    "description": metaDescription
  };

  return (
    <div className="public-body" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SEOHead 
        title={isTranslated ? translatedTitle : post.title}
        description={metaDescription}
        keywords={metaKeywords}
        image={imgUrl}
        url={`/posts/${post.slug || post.id}`}
        type="article"
        publishedAt={post.created_at}
        updatedAt={post.updated_at}
        author={post.company_name}
        schemaData={newsSchema}
      />

      <Navbar />

      <main className="post-detail-main">
        <div className="post-detail-container">
          
          {/* Breadcrumbs */}
          <div className="post-detail-breadcrumbs">
            <Link to="/">{currentLang === 'en' ? 'Home' : 'Trang chủ'}</Link>
            <i className="ti ti-chevron-right" style={{ fontSize: '10px' }}></i>
            <Link to="/posts">{currentLang === 'en' ? 'Business Opportunities' : 'Bảng tin cơ hội'}</Link>
            <i className="ti ti-chevron-right" style={{ fontSize: '10px' }}></i>
            <span>{post.title}</span>
          </div>

          {/* Single Column Reading Layout */}
          <div className="post-detail-column">
            
            {/* Cover Image */}
            <div className="post-detail-cover-frame">
              <img 
                src={imgUrl} 
                alt={post.title} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = demoImages[post.id % demoImages.length];
                }}
                className="post-detail-cover-img"
              />
            </div>

            {/* Title & Meta Info */}
            <div className="glass-card post-detail-title-card">
              {post.is_featured === 1 && (
                <span style={{ position: 'absolute', top: '24px', right: '24px', fontSize: '10.5px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.3)', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                  {t('badge_featured')} <i className="ti ti-star-filled"></i>
                </span>
              )}
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', background: 'rgba(2, 132, 199, 0.08)', color: 'var(--primary-dark)', border: '1px solid rgba(2, 132, 199, 0.15)', padding: '3px 10px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                  {post.type === 'offer' ? t('type_offer') : post.type === 'demand' ? t('type_demand') : post.type === 'cooperate' ? t('type_cooperate') : (post.type || t('type_general_news'))}
                </span>
                <Link 
                  to={`/posts?category=${encodeURIComponent(post.category || '')}`}
                  className="post-detail-category-link"
                  title={currentLang === 'en' ? 'One Click to explore this category' : 'Một nhấp để khám phá chuyên mục này'}
                >
                  <i className="ti ti-folder" /> {getCategoryLabel(post.category, currentLang) || t('category_default')}
                </Link>
              </div>

              <h1 className="post-detail-title">
                {isTranslated ? translatedTitle : post.title}
              </h1>
              
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {t('date_posted_label')}: <strong style={{ color: 'var(--text-primary)' }}>{dateStr}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '18px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('translate_select_lang')}:</span>
                  <select
                    value={translateTargetLang}
                    onChange={(e) => setTranslateTargetLang(e.target.value)}
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      padding: '5px 10px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="en">🇬🇧 Tiếng Anh (English)</option>
                    <option value="vi">🇻🇳 Tiếng Việt (Vietnamese)</option>
                    <option value="ja">🇯🇵 Tiếng Nhật (Japanese)</option>
                    <option value="zh">🇨🇳 Tiếng Trung (Chinese)</option>
                  </select>
                </div>

                <button
                  onClick={handleTranslatePost}
                  disabled={loadingTranslate}
                  style={{
                    background: isTranslated ? 'rgba(16, 185, 129, 0.1)' : 'rgba(30, 136, 229, 0.1)',
                    border: `1px solid ${isTranslated ? 'rgba(16, 185, 129, 0.3)' : 'rgba(30, 136, 229, 0.3)'}`,
                    color: isTranslated ? 'var(--emerald)' : 'var(--primary-light)',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 600,
                    outline: 'none',
                    transition: 'var(--transition)'
                  }}
                >
                  <i className={loadingTranslate ? "ti ti-loader animate-spin" : "ti ti-language"}></i>
                  {loadingTranslate ? '...' : isTranslated ? t('translate_view_original') : t('translate_button')}
                </button>
              </div>
            </div>

            {/* Summary / Lead Paragraph */}
            {post.summary && (
              <div className="glass-card post-detail-lead-card">
                <p className="post-detail-lead-text">
                  {isTranslated ? translatedSummary : post.summary}
                </p>
              </div>
            )}

            {/* Main Content Body */}
            <div className="glass-card post-detail-body-card">
              {/* Nội dung chi tiết bài viết: mở công khai cho tất cả người đọc */}
              <div 
                className="post-html-body"
                dangerouslySetInnerHTML={{ 
                  __html: (() => {
                    let raw = isTranslated ? translatedBody : post.body;
                    if (!raw) return '';
                    if (raw.includes('&lt;iframe') || raw.includes('&lt;div')) {
                      const txt = document.createElement('textarea');
                      txt.innerHTML = raw;
                      raw = txt.value;
                    }

                    // Tự động chuẩn hóa thụt lề cho danh sách Word (mso-list) và dạng số 1, 2... hay gạch đầu dòng -, –
                    try {
                      raw = raw.replace(/text-indent\s*:\s*-[0-9.]+(pt|px|em)?/gi, 'text-indent:0');
                      raw = raw.replace(/<p([^>]*)>([\s\S]*?)<\/p>/gi, (match, attrs, inner) => {
                        if (/mso-list|MsoListParagraph/i.test(attrs) || /text-indent/i.test(attrs)) {
                          const cleanAttrs = attrs.replace(/text-indent\s*:\s*-[0-9.]+(pt|px|em)?/gi, 'text-indent:0');
                          return `<p${cleanAttrs} class="post-list-item">${inner}</p>`;
                        }
                        const plain = inner.replace(/<[^>]+>/g, '').trim();
                        // Dạng gạch đầu dòng (- , – , — , • , +) hoặc dạng số theo sau bởi dấu chấm (1. , 2. ) nhưng không phải tiêu đề đậm
                        if (/^([–—\-•\*\+]|\d+[\.\)])\s+/.test(plain)) {
                          if (!/^(<b>|<strong>|\d+\.\s+[A-ZÀ-Ỹ0-9\s:?–—\-]{12,})/i.test(inner.trim())) {
                            return `<p${attrs} class="post-list-item">${inner}</p>`;
                          }
                        }
                        return match;
                      });
                    } catch (e) {}

                    return raw;
                  })()
                }}
              />

              {/* Hashtags / Từ khóa hiển thị đẹp mắt cuối bài viết */}
              {post.tags && (
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '24px', paddingTop: '18px', borderTop: '1px dashed var(--border)' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <i className="ti ti-tags"></i> {currentLang === 'en' ? 'Keywords:' : 'Từ khóa:'}
                  </span>
                  {(Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' && post.tags.startsWith('[') ? (function(){ try { return JSON.parse(post.tags); } catch(e) { return post.tags.split(','); } })() : post.tags.split(','))).map((tag, idx) => {
                    const cleanTag = typeof tag === 'string' ? tag.trim() : String(tag);
                    if (!cleanTag) return null;
                    return (
                      <Link 
                        key={idx}
                        to={`/posts?search=${encodeURIComponent(cleanTag.replace(/^#/, ''))}`}
                        className="post-detail-hashtag-link"
                        title={currentLang === 'en' ? `Click to explore #${cleanTag.replace(/^#/, '')}` : `Một nhấp để khám phá từ khóa #${cleanTag.replace(/^#/, '')}`}
                      >
                        #{cleanTag.replace(/^#/, '')}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* One Click to Share: Thanh chia sẻ nhanh cuối bài */}
              <div className="post-share-dock" style={{ marginTop: '24px' }}>
                <span className="post-share-label">
                  <i className="ti ti-share" /> {currentLang === 'en' ? 'Share this article:' : 'Chia sẻ bài viết:'}
                </span>
                <div className="post-share-buttons">
                  <button onClick={handleShareFacebook} className="post-share-btn fb" title="Chia sẻ qua Facebook">
                    <i className="ti ti-brand-facebook" /> Facebook
                  </button>
                  <button onClick={handleShareZalo} className="post-share-btn zalo" title="Chia sẻ qua Zalo">
                    <span className="zalo-text-icon">Z</span> Zalo
                  </button>
                  <button onClick={handleCopyLink} className="post-share-btn copy" title="Sao chép liên kết">
                    <i className="ti ti-link" /> {currentLang === 'en' ? 'Copy Link' : 'Sao chép link'}
                  </button>
                  {typeof navigator !== 'undefined' && navigator.share && (
                    <button onClick={handleNativeShare} className="post-share-btn native" title="Chia sẻ trên thiết bị">
                      <i className="ti ti-device-mobile" /> {currentLang === 'en' ? 'Share' : 'Chia sẻ'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ========================================================
                HÀNH ĐỘNG ĐẦU TƯ: ĐĂNG KÝ QUAN TÂM
                ======================================================== */}
            <div className="post-action-box">
              <div className="post-action-box-inner">
                <div className="post-action-info">
                  <h3 className="post-action-title">
                    {currentLang === 'en' ? 'Register Investment & Partnership Interest' : 'Đăng Ký Quan Tâm Đầu Tư'}
                  </h3>
                  <p className="post-action-desc">
                    {currentLang === 'en'
                      ? 'Interested in business partnerships, agricultural value chains, or investment incentives in Dak Lak? Submit your interest to receive official dossiers and direct support.'
                      : 'Độc giả và nhà đầu tư quan tâm đến cơ hội hợp tác, chuỗi cung ứng hoặc thông tin đầu tư tại Đắk Lắk có thể đăng ký trực tiếp để được kết nối sớm nhất.'}
                  </p>
                </div>
                <div className="post-action-buttons">
                  <button 
                    onClick={() => openActionModal('interest')} 
                    className="post-act-btn primary"
                  >
                    <i className="ti ti-chart-pie" />
                    <span>{currentLang === 'en' ? 'Register Investment Interest' : 'Đăng Ký Quan Tâm'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Horizontal Card: Author & Contact Details */}
            <div className="glass-card post-detail-author-card">
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
                
                {/* Left: Author Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div className="av-circle" style={{ width: '56px', height: '56px', fontSize: '20px', background: isPlatinum ? 'linear-gradient(135deg, #FFD700, #FFA500)' : isGold ? 'var(--amber-glow)' : 'var(--primary-glow)', color: '#fff', fontWeight: '700', flexShrink: 0 }}>
                    {post.company_name ? post.company_name.substring(0, 2).toUpperCase() : 'DN'}
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                      {t('sidebar_author')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '17px', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>{post.company_name || (currentLang === 'en' ? 'Anonymous Member' : 'Hội viên ẩn danh')}</h3>
                      <span style={{ 
                        fontSize: '9.5px',
                        background: isPlatinum ? 'rgba(245,158,11,0.15)' : isGold ? 'rgba(245,158,11,0.1)' : 'var(--surface-0)',
                        color: isPlatinum || isGold ? 'var(--amber-dark)' : 'var(--text-muted)',
                        border: `1px solid ${isPlatinum || isGold ? 'rgba(245,158,11,0.3)' : 'var(--border-strong)'}`,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>
                        {post.company_tier || 'Silver'}
                      </span>
                    </div>
                    {post.member_id && (
                      <button 
                        onClick={() => handleViewMemberDetails(post.member_id)}
                        style={{
                          marginTop: '6px',
                          background: 'rgba(2, 132, 199, 0.08)',
                          border: '1px solid rgba(2, 132, 199, 0.2)',
                          color: 'var(--primary-dark)',
                          padding: '4px 12px',
                          borderRadius: '4px',
                          fontSize: '11.5px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          outline: 'none',
                          fontWeight: 600
                        }}
                      >
                        <i className="ti ti-info-circle"></i> {t('btn_view_details')}
                      </button>
                    )}
                  </div>
                </div>

                {/* Middle: Contact Info */}
                <div style={{ flex: '1 1 300px', padding: '0 10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    {t('contact_info_label')}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <i className="ti ti-info-square" style={{ color: 'var(--primary-dark)' }}></i>
                    {post.contact_info || (currentLang === 'en' ? 'Contact publisher / editorial board' : 'Ban biên tập & Xúc tiến DakLak.today')}
                  </div>
                  
                  {/* Direct Call if phone available */}
                  {post.contact_info && post.contact_info.replace(/[^0-9]/g, '').length >= 9 && (
                    <div className="post-connect-actions">
                      <a href={`tel:${post.contact_info.replace(/[^0-9]/g, '')}`} className="post-connect-btn phone" title="Gọi trực tiếp trong 1 nhấp">
                        <i className="ti ti-phone-call" /> {currentLang === 'en' ? 'Call Directly' : 'Gọi Trực Tiếp'}
                      </a>
                    </div>
                  )}
                </div>

                {/* Right: Back Button */}
                <div>
                  <Link to="/posts" className="btn" style={{ padding: '10px 20px', fontSize: '13px', textDecoration: 'none', background: 'rgba(12,35,64,0.06)', borderColor: 'var(--border-strong)', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <i className="ti ti-arrow-left"></i> {t('btn_back_to_feed')}
                  </Link>
                </div>

              </div>
            </div>

            {/* ========================================================
                ONE CLICK TO DISCOVER: CƠ HỘI & THÔNG TIN CÙNG CHUYÊN ĐỀ
                ======================================================== */}
            {relatedPosts.length > 0 && (
              <div className="post-related-section">
                <div className="post-related-header">
                  <div>
                    <span className="post-related-badge">
                      <i className="ti ti-compass" /> {currentLang === 'en' ? 'One Click to Discover' : 'Một Nhấp Để Khám Phá'}
                    </span>
                    <h3 className="post-related-title">
                      {currentLang === 'en' ? 'Related Articles & Opportunities' : 'Cơ Hội & Thông Tin Cùng Chuyên Đề'}
                    </h3>
                  </div>
                  <Link to="/posts" className="post-related-view-all">
                    <span>{currentLang === 'en' ? 'View all' : 'Xem tất cả bảng tin'}</span>
                    <i className="ti ti-arrow-right" />
                  </Link>
                </div>

                <div className="post-related-grid">
                  {relatedPosts.map((item) => (
                    <Link 
                      key={item.id || item.slug} 
                      to={`/posts/${item.slug || item.id}`}
                      className="post-related-card"
                    >
                      <div className="post-related-thumb">
                        <img 
                          src={item.image_url || '/images/daklak/daklak_doi_ca_phe.jpg'} 
                          alt={item.title} 
                          onError={(e) => { e.target.src = '/images/daklak/daklak_doi_ca_phe.jpg'; }}
                        />
                        <span className="post-related-cat">{item.category || 'Tin nổi bật'}</span>
                      </div>
                      <div className="post-related-info">
                        <div className="post-related-date">
                          <i className="ti ti-calendar" />
                          <span>{item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : 'Mới'}</span>
                        </div>
                        <h4 className="post-related-item-title">{item.title}</h4>
                        <p className="post-related-summary">{item.summary || item.short_desc || ''}</p>
                        <span className="post-related-read-cta">
                          {currentLang === 'en' ? 'Read article →' : 'Đọc bài viết →'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />

      {showMemberModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowMemberModal(false)}>
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '16px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', position: 'relative', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button onClick={() => setShowMemberModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px', padding: '4px' }} className="hover-highlight">
              <i className="ti ti-x"></i>
            </button>

            {loadingMember ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                <i className="ti ti-loader animate-spin" style={{ fontSize: '28px', display: 'block', margin: '0 auto 10px' }}></i>
                {currentLang === 'en' ? 'Loading member information...' : 'Đang tải thông tin hội viên...'}
              </div>
            ) : memberDetails ? (
              <div>
                {/* Header Profile */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
                  <div className="av-circle" style={{ width: '56px', height: '56px', fontSize: '22px', background: memberDetails.tier === 'Platinum' ? 'linear-gradient(135deg, #FFD700, #FFA500)' : memberDetails.tier === 'Gold' ? 'var(--amber-glow)' : 'var(--primary-glow)', color: '#fff', fontWeight: 600 }}>
                    {memberDetails.name ? memberDetails.name.substring(0, 2).toUpperCase() : 'DN'}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>{memberDetails.name}</h2>
                    <span style={{ 
                      display: 'inline-block',
                      marginTop: '4px',
                      fontSize: '9px',
                      background: memberDetails.tier === 'Platinum' ? 'rgba(245,158,11,0.15)' : memberDetails.tier === 'Gold' ? 'rgba(245,158,11,0.1)' : 'var(--surface-0)',
                      color: memberDetails.tier === 'Platinum' || memberDetails.tier === 'Gold' ? 'var(--amber-dark)' : 'var(--text-muted)',
                      border: `1px solid ${memberDetails.tier === 'Platinum' || memberDetails.tier === 'Gold' ? 'rgba(245,158,11,0.3)' : 'var(--border-strong)'}`,
                      padding: '1px 6px',
                      borderRadius: '3px',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {currentLang === 'en' ? 'Tier:' : 'Hạng:'} {memberDetails.tier || 'Silver'}
                    </span>
                  </div>
                </div>

                <div style={{ height: '1px', background: 'var(--border)', marginBottom: '15px' }} />

                {/* Main Information */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{currentLang === 'en' ? 'Industry' : 'Lĩnh vực hoạt động'}</div>
                    <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px' }}>{memberDetails.industry || (currentLang === 'en' ? 'Not specified' : 'Chưa cập nhật')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{currentLang === 'en' ? 'Scale' : 'Quy mô'}</div>
                    <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px' }}>{memberDetails.size || (currentLang === 'en' ? 'Not specified' : 'Chưa cập nhật')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{currentLang === 'en' ? 'Province / City' : 'Tỉnh/Thành phố'}</div>
                    <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px' }}>{memberDetails.city || (currentLang === 'en' ? 'Not specified' : 'Chưa cập nhật')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{currentLang === 'en' ? 'Address' : 'Địa chỉ'}</div>
                    <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px' }}>{memberDetails.address || (currentLang === 'en' ? 'Not specified' : 'Chưa cập nhật')}</div>
                  </div>
                  {memberDetails.website && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Website</div>
                      <a href={memberDetails.website.startsWith('http') ? memberDetails.website : `https://${memberDetails.website}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <i className="ti ti-world"></i> {memberDetails.website}
                      </a>
                    </div>
                  )}
                </div>

                {memberDetails.description && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('label_desc')}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <select
                          value={memberTranslateTargetLang}
                          onChange={(e) => setMemberTranslateTargetLang(e.target.value)}
                          style={{
                            background: 'var(--surface-2)',
                            border: '1px solid var(--border-strong)',
                            borderRadius: '4px',
                            color: 'var(--text-primary)',
                            fontSize: '10.5px',
                            padding: '2px 4px',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="en">🇬🇧 EN</option>
                          <option value="vi">🇻🇳 VI</option>
                          <option value="ja">🇯🇵 JA</option>
                          <option value="zh">🇨🇳 ZH</option>
                        </select>
                        <button
                          onClick={handleTranslateMemberDesc}
                          disabled={loadingMemberDescTranslate}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: isMemberDescTranslated ? 'var(--emerald)' : 'var(--primary-dark)',
                            fontSize: '11.5px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600,
                            padding: 0,
                            outline: 'none'
                          }}
                        >
                          <i className={loadingMemberDescTranslate ? "ti ti-loader animate-spin" : "ti ti-language"}></i>
                          {loadingMemberDescTranslate ? '...' : isMemberDescTranslated ? t('translate_view_original_short') : (currentLang === 'en' ? 'AI Translate' : 'Dịch AI')}
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6', background: 'var(--surface-0)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      {isMemberDescTranslated ? translatedMemberDesc : memberDetails.description}
                    </div>
                  </div>
                )}

                {/* Contact wall check */}
                <div style={{ height: '1px', background: 'var(--border)', marginBottom: '15px' }} />
                
                <h3 style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, margin: '0 0 10px' }}>{t('contact_info_label')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{currentLang === 'en' ? 'Contact Person' : 'Người liên hệ'}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{memberDetails.contact_name || (currentLang === 'en' ? 'Not specified' : 'Chưa cập nhật')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{currentLang === 'en' ? 'Position' : 'Chức vụ'}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{memberDetails.contact_pos || (currentLang === 'en' ? 'Not specified' : 'Chưa cập nhật')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Email</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{memberDetails.email || (currentLang === 'en' ? 'Not specified' : 'Chưa cập nhật')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{currentLang === 'en' ? 'Phone Number' : 'Số điện thoại'}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{memberDetails.phone || (currentLang === 'en' ? 'Not specified' : 'Chưa cập nhật')}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
                {currentLang === 'en' ? 'Member details not found.' : 'Không tìm thấy thông tin hội viên này.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification for Link Copy (One Click to Share) */}
      {toastMessage && (
        <div className="post-toast-notice">
          <i className="ti ti-circle-check" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* One Click to Act & Connect Modal */}
      {showActionModal && (
        <div className="action-modal-backdrop" onClick={() => setShowActionModal(false)}>
          <div className="action-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="action-modal-close" onClick={() => setShowActionModal(false)}>
              <i className="ti ti-x" />
            </button>

            {actionSuccess ? (
              <div className="action-modal-success">
                <div className="action-success-icon">
                  <i className="ti ti-check" />
                </div>
                <h3>{currentLang === 'en' ? 'Request Submitted Successfully!' : 'Gửi Yêu Cầu Thành Công!'}</h3>
                <p>
                  {actionModalType === 'dossier'
                    ? (currentLang === 'en' ? 'Project dossier and investment documentation will be delivered to your contact info shortly.' : 'Hồ sơ dự án chi tiết và tài liệu xúc tiến sẽ được gửi tới Email / Số điện thoại của bạn trong thời gian sớm nhất.')
                    : (currentLang === 'en' ? 'DakLak.today and the relevant team will reach out to you within 24 hours.' : 'Ban xúc tiến đầu tư DakLak.today và đơn vị liên quan sẽ liên hệ trao đổi với bạn trong vòng 24 giờ.')}
                </p>
                <button onClick={() => setShowActionModal(false)} className="post-act-btn primary" style={{ marginTop: '20px' }}>
                  {currentLang === 'en' ? 'Close Window' : 'Đóng cửa sổ'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleActionSubmit} className="action-modal-form">
                <div className="action-modal-header">
                  <h3 className="action-modal-heading">
                    {currentLang === 'en' ? 'Register Investment Interest' : 'Đăng Ký Quan Tâm'}
                  </h3>
                  <p className="action-modal-sub">
                    {post.title}
                  </p>
                </div>

                <div className="action-modal-body">
                  <div className="form-group">
                    <label>{currentLang === 'en' ? 'Full Name (*)' : 'Họ và tên (*)'}</label>
                    <input 
                      type="text" 
                      required
                      placeholder={currentLang === 'en' ? 'E.g. Nguyen Van A' : 'Ví dụ: Nguyễn Văn A'}
                      value={actionForm.fullName}
                      onChange={(e) => setActionForm(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>{currentLang === 'en' ? 'Phone / Zalo (*)' : 'Số điện thoại / Zalo (*)'}</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="0912..."
                        value={actionForm.phone}
                        onChange={(e) => setActionForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email (*)</label>
                      <input 
                        type="email" 
                        required
                        placeholder="investor@company.com"
                        value={actionForm.email}
                        onChange={(e) => setActionForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{currentLang === 'en' ? 'Organization / Investor' : 'Tên doanh nghiệp / Tổ chức đầu tư'}</label>
                    <input 
                      type="text" 
                      placeholder={currentLang === 'en' ? 'Company name or Individual Investor' : 'Ví dụ: Công ty CP Đầu Tư ABC / Nhà đầu tư cá nhân'}
                      value={actionForm.companyName}
                      onChange={(e) => setActionForm(prev => ({ ...prev, companyName: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>{currentLang === 'en' ? 'Specific Requirements / Notes' : 'Nhu cầu cụ thể / Ghi chú'}</label>
                    <textarea 
                      rows={3}
                      placeholder={currentLang === 'en' ? 'Tell us what details or collaboration scope you need...' : 'Ví dụ: Cần hồ sơ quy hoạch chi tiết, chính sách ưu đãi đầu tư, liên kết cung ứng nguyên liệu...'}
                      value={actionForm.notes}
                      onChange={(e) => setActionForm(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="action-modal-footer">
                  <button type="button" onClick={() => setShowActionModal(false)} className="btn-cancel">
                    {currentLang === 'en' ? 'Cancel' : 'Hủy bỏ'}
                  </button>
                  <button type="submit" disabled={actionSubmitting} className="btn-submit">
                    {actionSubmitting ? (
                      <>
                        <i className="ti ti-loader animate-spin" /> {currentLang === 'en' ? 'Submitting...' : 'Đang gửi...'}
                      </>
                    ) : (
                      <>
                        <i className="ti ti-send" /> {currentLang === 'en' ? 'Submit Interest' : 'Gửi Đăng Ký Quan Tâm'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;
