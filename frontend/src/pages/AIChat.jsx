import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { useTranslation } from '../contexts/LanguageContext';

export const AIChat = () => {
  const { role, token, user, getAuthHeaders } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiConfig, setAiConfig] = useState({ provider: 'Gemini', model: 'gemini-1.5-flash' });
  const [selectedModelOverride, setSelectedModelOverride] = useState(() => {
    const saved = localStorage.getItem('doson_chat_model_override') || '';
    if (saved.includes('gemini-3') || saved.includes('preview')) {
      localStorage.removeItem('doson_chat_model_override');
      return '';
    }
    return saved;
  });
  const [showMobileHistory, setShowMobileHistory] = useState(false);
  const [showMobileConfig, setShowMobileConfig] = useState(false);

  const autoSentRef = useRef(false);

  const handleModelOverrideChange = (val) => {
    setSelectedModelOverride(val);
    localStorage.setItem('doson_chat_model_override', val);
  };

  const messagesEndRef = useRef(null);

  const generateUUID = () => {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  };

  const [configLoaded, setConfigLoaded] = useState(false);

  // Tải cấu hình AI hiển thị từ DB Admin
  useEffect(() => {
    let isMounted = true;

    const loadConfig = async () => {
      try {
        const headers = token ? getAuthHeaders() : {};
        const res = await fetch('/api/admin/get-config', { headers });
        if (res.ok && isMounted) {
          const data = await res.json();
          const providerNames = { anthropic: 'Anthropic', openai: 'OpenAI', gemini: 'Gemini', deepseek: 'DeepSeek', openrouter: 'OpenRouter' };
          const defaultModels = {
            openai: 'gpt-4o-mini',
            anthropic: 'claude-3-5-sonnet-20240620',
            gemini: 'gemini-1.5-flash',
            deepseek: 'deepseek-chat',
            openrouter: 'google/gemini-2.0-flash-001',
            ollama: 'llama3'
          };
          const provKey = (data.provider || 'gemini').toLowerCase();
          setAiConfig({
            provider: providerNames[provKey] || data.provider,
            model: data.model || defaultModels[provKey] || ''
          });
        }
      } catch (e) {
        console.error("Failed to load AI config in chat", e);
      } finally {
        if (isMounted) {
          setConfigLoaded(true);
        }
      }
    };
    loadConfig();

    return () => {
      isMounted = false;
    };
  }, [role, token]);

  // Tải danh sách session
  const loadSessions = async (selectFirst = false) => {
    setLoadingSessions(true);
    try {
      const res = await fetch('/api/chat/sessions', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.data || [];
        setSessions(list);
        
        if (selectFirst) {
          if (list.length > 0) {
            selectSession(list[0].session_id);
          } else {
            newChatSession();
          }
        }
      }
    } catch (e) {
      console.error("Error loading chat sessions", e);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (role === 'guest') return;
    loadSessions(true);
  }, [role, token]);

  // Tải tin nhắn của session được chọn
  const selectSession = async (sessionId) => {
    setShowMobileHistory(false);
    setCurrentSessionId(sessionId);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/chat/history/${sessionId}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.data || []);
      }
    } catch (e) {
      console.error("Error loading messages", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const newChatSession = () => {
    setShowMobileHistory(false);
    setCurrentSessionId(generateUUID());
    setMessages([]);
  };

  const deleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!confirm(t('confirm_delete_session'))) return;

    try {
      const res = await fetch(`/api/chat/session/${sessionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        if (sessionId === currentSessionId) {
          newChatSession();
        }
        loadSessions(false);
      }
    } catch (e) {
      console.error("Error deleting session", e);
    }
  };

  const handleSend = async (textToSend, sessionOverride) => {
    const text = typeof textToSend === 'string' ? textToSend : inputText;
    if (!text.trim() || sending) return;

    setInputText('');
    setSending(true);

    const activeSessionId = sessionOverride || currentSessionId || generateUUID();
    if (!currentSessionId) {
      setCurrentSessionId(activeSessionId);
    }

    const tempUserMsg = { role: 'user', content: text, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      // Build payload including existing history if present
      const currentHistory = sessionOverride ? [] : messages;
      const messagesPayload = [...currentHistory, { role: 'user', content: text }].map(m => ({
        role: m.role,
        content: m.content
      }));

      // Determine provider and model
      let requestProvider = (aiConfig.provider || 'gemini').toLowerCase();
      let requestModel = aiConfig.model || 'gemini-1.5-flash';
      
      const isPremiumTier = user && (user.tier === 'Gold' || user.tier === 'Platinum');
      if (isPremiumTier && selectedModelOverride) {
        if (selectedModelOverride.startsWith('gemini-')) {
          requestProvider = 'gemini';
          requestModel = selectedModelOverride;
        } else if (selectedModelOverride.startsWith('deepseek/') || selectedModelOverride.startsWith('openai/') || selectedModelOverride.startsWith('anthropic/') || selectedModelOverride.startsWith('google/')) {
          requestProvider = 'openrouter';
          requestModel = selectedModelOverride;
        } else {
          requestModel = selectedModelOverride;
        }
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'X-Session-Id': activeSessionId
        },
        body: JSON.stringify({
          provider: requestProvider,
          model: requestModel,
          messages: messagesPayload
        })
      });

      const contentType = res.headers.get('content-type') || '';
      let data = {};
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const rawText = await res.text();
        const cleanSnippet = rawText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
        throw new Error(`Máy chủ phản hồi HTTP ${res.status}: ${cleanSnippet || res.statusText || 'Lỗi định dạng phản hồi'}`);
      }

      if (!res.ok) {
        throw new Error(data.error || t('error_ai_call'));
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.text, created_at: new Date().toISOString() }]);
      
      // Refresh chat session list
      loadSessions(false);
    } catch (e) {
      alert(e.message || t('error_sending_message'));
    } finally {
      setSending(false);
    }
  };

  // Auto-send query parameter `?q=...` from URL (e.g. from homepage AI box or suggestion chips)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialQuery = params.get('q');

    if (initialQuery && initialQuery.trim() && !autoSentRef.current && configLoaded) {
      autoSentRef.current = true;
      const newSessionId = generateUUID();
      setCurrentSessionId(newSessionId);
      setMessages([]);

      // Auto-trigger send after brief state initialization
      setTimeout(() => {
        handleSend(initialQuery.trim(), newSessionId);
      }, 50);
    }
  }, [location.search, configLoaded]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getFriendlyDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return t('date_today');
    if (diffDays === 1) return t('date_yesterday');
    return date.toLocaleDateString('vi-VN');
  };

  const formatAIResponse = (text) => {
    if (!text) return '';
    
    // Split lines
    const lines = text.split('\n');
    let inList = false;
    const formattedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let trimmed = line.trim();
      
      // Escape HTML to prevent XSS
      trimmed = trimmed
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      
      // Inline formatting (bold & markdown links)
      trimmed = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      trimmed = trimmed.replace(/__(.*?)__/g, '<strong>$1</strong>');
      trimmed = trimmed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #0284c7; font-weight: 700; text-decoration: underline;" target="_self">$1</a>');
      
      // Headings
      if (trimmed.startsWith('### ')) {
        if (inList) { formattedLines.push('</ul>'); inList = false; }
        formattedLines.push(`<h4 style="font-size: 14.5px; font-weight: 700; margin: 12px 0 6px; color: var(--text-primary);">${trimmed.substring(4)}</h4>`);
      } else if (trimmed.startsWith('## ')) {
        if (inList) { formattedLines.push('</ul>'); inList = false; }
        formattedLines.push(`<h3 style="font-size: 16px; font-weight: 700; margin: 14px 0 8px; color: var(--text-primary);">${trimmed.substring(3)}</h3>`);
      } else if (trimmed.startsWith('# ')) {
        if (inList) { formattedLines.push('</ul>'); inList = false; }
        formattedLines.push(`<h2 style="font-size: 18px; font-weight: 700; margin: 16px 0 10px; color: var(--text-primary);">${trimmed.substring(2)}</h2>`);
      } 
      // Horizontal Rule
      else if (trimmed === '---' || trimmed === '***') {
        if (inList) { formattedLines.push('</ul>'); inList = false; }
        formattedLines.push('<hr style="border: none; border-top: 1px solid var(--border); margin: 14px 0;" />');
      }
      // List items
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (!inList) {
          formattedLines.push('<ul style="margin: 6px 0; padding-left: 20px; list-style-type: disc;">');
          inList = true;
        }
        formattedLines.push(`<li style="margin: 4px 0;">${trimmed.substring(2)}</li>`);
      }
      // Empty line
      else if (trimmed === '') {
        if (inList) {
          formattedLines.push('</ul>');
          inList = false;
        }
        formattedLines.push('<div style="height: 6px;"></div>');
      }
      // Plain text line
      else {
        if (inList) {
          formattedLines.push('</ul>');
          inList = false;
        }
        formattedLines.push(`<p style="margin: 4px 0; line-height: 1.6; font-size: 13px; color: var(--text-secondary);">${trimmed}</p>`);
      }
    }
    
    if (inList) {
      formattedLines.push('</ul>');
    }
    
    return <div style={{ fontSize: '13px', textAlign: 'left' }} dangerouslySetInnerHTML={{ __html: formattedLines.join('') }} />;
  };

  // Bộ lọc lịch sử chat
  const filteredSessions = sessions.filter(s => {
    if (!searchQuery) return true;
    return s.title && s.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Nếu là Guest, hiển thị overlay yêu cầu đăng nhập
  if (role === 'guest') {
    return (
      <div className="public-body" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '420px', padding: '2.5rem' }}>
            <i className="ti ti-lock" style={{ fontSize: '48px', color: 'var(--primary)', display: 'block', marginBottom: '1.5rem' }}></i>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '22px', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{t('login_ai_chat_title')}</h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '2rem' }}>
              {t('login_ai_chat_desc')}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/login" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '14px', textDecoration: 'none' }}><i className="ti ti-login"></i> {t('login_now')}</Link>
              <Link to="/register" className="btn" style={{ padding: '10px 24px', fontSize: '14px', textDecoration: 'none' }}><i className="ti ti-user-plus"></i> {t('register_new')}</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-body" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="chat-grid-layout" style={{ flex: 1 }}>
        
        {/* Left Side: Chat History & Topics */}
        <div className="chat-left-sidebar" style={{ textAlign: 'left' }}>
          <div className="chat-hist-header">
            <div className="chat-hist-title">{t('chat_history_title')}</div>
            <button className="chat-add-btn" onClick={newChatSession} title={t('new_chat_btn_tooltip')}><i className="ti ti-plus"></i></button>
          </div>
          
          <div className="chat-hist-search">
            <div style={{ position: 'relative' }}>
              <i className="ti ti-search" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'var(--text-muted)' }}></i>
              <input 
                type="text" 
                placeholder={t('search_chat_placeholder')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '28px' }}
              />
            </div>
          </div>
          
          <div className="chat-hist-card-list">
            {loadingSessions ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                <i className="ti ti-loader animate-spin" style={{ fontSize: '14px', display: 'block', margin: '0 auto 6px' }}></i>
                {t('loading_chat_history')}
              </div>
            ) : filteredSessions.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                <i className="ti ti-messages" style={{ fontSize: '18px', display: 'block', margin: '0 auto 6px' }}></i>
                {t('no_chat_history')}
              </div>
            ) : (
              filteredSessions.map((session) => {
                const activeClass = session.session_id === currentSessionId ? 'active' : '';
                const titleText = session.title ? (session.title.length > 22 ? session.title.slice(0, 22) + '...' : session.title) : t('new_chat_session_title');
                const dateLabel = getFriendlyDate(session.last_activity);
                
                return (
                  <div 
                    className={`chat-hist-card ${activeClass}`} 
                    key={session.session_id} 
                    onClick={() => selectSession(session.session_id)}
                    style={{ position: 'relative' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div className="chat-hist-card-title" style={{ flex: 1, textAlign: 'left' }}>{titleText}</div>
                      <button 
                        className="delete-session-btn" 
                        onClick={(e) => deleteSession(e, session.session_id)} 
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', fontSize: '11px', lineHeight: 1 }} 
                        title={t('delete_chat_tooltip')}
                      >
                        <i className="ti ti-trash"></i>
                      </button>
                    </div>
                    <div className="chat-hist-card-meta" style={{ marginTop: '4px' }}>
                      <span>{dateLabel}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div style={{ padding: '1.25rem 1rem 0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="chat-hist-title" style={{ marginBottom: '8px' }}>{t('label_topics')}</div>
            <button className="chat-topic-btn" onClick={() => handleSend(t('ai_suggestion_1_val'))}><i className="ti ti-briefcase" style={{ color: 'var(--neon-cyan)' }}></i> &nbsp;{t('topic_business')}</button>
            <button className="chat-topic-btn" onClick={() => handleSend(t('ai_suggestion_2_val'))}><i className="ti ti-chart-line" style={{ color: 'var(--neon-cyan)' }}></i> &nbsp;{t('topic_investment')}</button>
            <button className="chat-topic-btn" onClick={() => handleSend(t('ai_suggestion_3_val'))}><i className="ti ti-users" style={{ color: 'var(--neon-cyan)' }}></i> &nbsp;{t('topic_connection')}</button>
          </div>
        </div>

        {/* Center: Message Viewport */}
        <div className="chat-main">
          <div className="chat-mobile-header" style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)', padding: '0 1.25rem', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Nút Mobile mở Lịch sử & Tạo chat mới */}
              <div className="mobile-chat-controls">
                <button
                  onClick={() => setShowMobileHistory(true)}
                  style={{
                    padding: '6px 10px',
                    background: 'var(--surface-1)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11.5px',
                    fontWeight: 600
                  }}
                  title={t('chat_history_title')}
                >
                  <i className="ti ti-history" style={{ fontSize: '15px', color: 'var(--primary)' }}></i>
                  <span>Lịch sử</span>
                </button>
                <button
                  onClick={newChatSession}
                  style={{
                    padding: '6px 10px',
                    background: 'var(--primary)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11.5px',
                    fontWeight: 600
                  }}
                  title={t('new_chat_btn_tooltip')}
                >
                  <i className="ti ti-plus" style={{ fontSize: '14px' }}></i>
                  <span>Mới</span>
                </button>
              </div>

              <h1 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <i className="ti ti-robot desktop-chat-title-icon" style={{ color: 'var(--primary)', fontSize: '18px' }}></i>
                <span className="chat-title-text">{t('ai_assistant_title')}</span>
              </h1>
            </div>

            {/* Clickable AI Model pill / Config trigger */}
            <button
              onClick={() => setShowMobileConfig(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                color: '#10B981',
                background: 'rgba(16,185,129,0.08)',
                border: '0.5px solid rgba(16,185,129,0.25)',
                padding: '5px 10px',
                borderRadius: '99px',
                cursor: 'pointer',
                maxWidth: '190px'
              }}
              title="Cài đặt mô hình AI / Đổi model"
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse 2s infinite', flexShrink: 0 }}></span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user && (user.tier === 'Gold' || user.tier === 'Platinum') && selectedModelOverride 
                  ? selectedModelOverride.split('/').pop() 
                  : (aiConfig.model || aiConfig.provider)}
              </span>
              <i className="ti ti-adjustments-horizontal" style={{ fontSize: '12px', marginLeft: '2px', opacity: 0.85 }}></i>
            </button>
          </div>

          {/* Scrollable Messages Area */}
          <div id="chat-msgs" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            <div className="bubble-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {loadingHistory ? (
                <div style={{ padding: '3rem', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <i className="ti ti-loader animate-spin" style={{ fontSize: '16px', display: 'block', margin: '0 auto 6px' }}></i>
                  {t('loading_messages')}
                </div>
              ) : messages.length === 0 ? (
                // Welcome Message
                <div className="chat-bubble ai" style={{ alignSelf: 'flex-start', maxWidth: '85%', padding: '12px 16px', borderRadius: '12px', background: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '13px', lineHeight: '1.6', border: '1px solid var(--border-strong)', textAlign: 'left' }}>
                  {t('ai_welcome_1')}<br/><br/>
                  {t('ai_welcome_2')}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                    <button className="chip" onClick={() => handleSend(t('ai_suggestion_1_val'))} style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '99px', border: '1px solid var(--border-strong)', background: 'rgba(12,35,64,0.06)', color: 'var(--text-primary)', cursor: 'pointer' }}>{t('ai_suggestion_1_lbl')}</button>
                    <button className="chip" onClick={() => handleSend(t('ai_suggestion_2_val'))} style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '99px', border: '1px solid var(--border-strong)', background: 'rgba(12,35,64,0.06)', color: 'var(--text-primary)', cursor: 'pointer' }}>{t('ai_suggestion_2_lbl')}</button>
                    <button className="chip" onClick={() => handleSend(t('ai_suggestion_3_val'))} style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '99px', border: '1px solid var(--border-strong)', background: 'rgba(12,35,64,0.06)', color: 'var(--text-primary)', cursor: 'pointer' }}>{t('ai_suggestion_3_lbl')}</button>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div 
                      key={idx}
                      className={`chat-bubble ${isUser ? 'user' : 'ai'}`} 
                      style={{ 
                        alignSelf: isUser ? 'flex-end' : 'flex-start', 
                        maxWidth: '85%', 
                        padding: '12px 16px', 
                        borderRadius: '12px', 
                        background: isUser ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' : 'var(--surface-2)', 
                        color: isUser ? '#fff' : 'var(--text-primary)', 
                        fontSize: '13px', 
                        lineHeight: '1.6', 
                        border: isUser ? 'none' : '1px solid var(--border-strong)',
                        textAlign: 'left'
                      }}
                    >
                      {isUser ? msg.content : formatAIResponse(msg.content)}
                    </div>
                  );
                })
              )}
              {sending && (
                <div className="chat-bubble ai" style={{ alignSelf: 'flex-start', maxWidth: '85%', padding: '12px 16px', borderRadius: '12px', background: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '13px', border: '1px solid var(--border-strong)', textAlign: 'left' }}>
                  <i className="ti ti-loader animate-spin"></i> {t('ai_thinking')}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Box Container */}
          <div className="chat-input-area">
            <div className="chat-input-inner">
              <textarea 
                className="chat-ta" 
                placeholder={t('chat_input_placeholder')} 
                rows="1"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ height: 'auto' }}
              />
              <button 
                className="send-btn" 
                onClick={() => handleSend()}
                disabled={sending || !inputText.trim()}
              >
                <i className="ti ti-send"></i>
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', padding: '0 4px', fontSize: '10.5px', color: 'var(--text-muted)' }}>
              <span>{t('chat_help_tip')}</span>
              <span>{t('data_retrieval_label')}: <strong id="ctx-summary">Real-Time Database</strong></span>
            </div>
          </div>
        </div>

        {/* Right Side: AI Panel Settings & Suggested Actions */}
        <div className="chat-right-sidebar" style={{ textAlign: 'left' }}>
          
          {/* AI Settings Card */}
          <div className="chat-panel-card">
            <div className="chat-panel-title" style={{ marginBlockStart: 0 }}>
              <i className="ti ti-settings" style={{ color: 'var(--neon-cyan)' }}></i> {t('ai_config_title')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
              <span>{t('status_label')}: <strong style={{ color: 'var(--text-primary)' }}>{t('status_online')}</strong></span>
            </div>
            
            {user && (user.tier === 'Gold' || user.tier === 'Platinum') ? (
              <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  <i className="ti ti-crown" style={{ color: 'var(--amber)', marginRight: '4px' }}></i>
                  {t('premium_model_label')(user.tier)}
                </label>
                <select
                  value={selectedModelOverride}
                  onChange={(e) => handleModelOverrideChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-strong)',
                    color: 'var(--text-primary)',
                    fontSize: '11.5px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">{t('system_default_model')}</option>
                  <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Tốc độ cao)</option>
                  <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Thông minh)</option>
                  <option value="openai/gpt-4o-mini">OpenAI GPT-4o Mini (OpenRouter)</option>
                  <option value="deepseek/deepseek-chat">DeepSeek V3 (OpenRouter)</option>
                  <option value="deepseek/deepseek-r1">DeepSeek R1 (OpenRouter)</option>
                  <option value="anthropic/claude-3-5-sonnet">Claude 3.5 Sonnet (OpenRouter)</option>
                </select>
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.5' }}>
                {t('free_model_desc')}
                {user && (
                  <div style={{ marginTop: '6px', color: 'var(--amber)', fontWeight: 500 }}>
                    <i className="ti ti-crown"></i> {t('upgrade_to_change_models')}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Suggested Actions Card */}
          <div className="chat-panel-card">
            <div className="chat-panel-title" style={{ marginBlockStart: 0 }}>
              <i className="ti ti-sparkles" style={{ color: 'var(--primary)' }}></i> {t('suggested_actions_title')}
            </div>
            
            <div className="chat-panel-item" onClick={() => handleSend(t('suggested_action_1_title') + ' ' + t('category_default'))}>
              <div className="chat-panel-icon"><i className="ti ti-user-plus"></i></div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{t('suggested_action_1_title')}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>{t('suggested_action_1_desc')}</div>
              </div>
            </div>
            
            <div className="chat-panel-item" onClick={() => handleSend(t('suggested_action_2_title'))}>
              <div className="chat-panel-icon"><i className="ti ti-calendar"></i></div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{t('suggested_action_2_title')}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>{t('suggested_action_2_desc')}</div>
              </div>
            </div>
            
            <div className="chat-panel-item" onClick={() => handleSend(t('suggested_action_3_title'))}>
              <div className="chat-panel-icon"><i className="ti ti-building-handshake"></i></div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{t('suggested_action_3_title')}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>{t('suggested_action_3_desc')}</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile History Drawer */}
      {showMobileHistory && (
        <div className="chat-drawer-backdrop" onClick={() => setShowMobileHistory(false)}>
          <div className="chat-drawer-content" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700, fontSize: '14.5px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <i className="ti ti-history" style={{ color: 'var(--primary)', fontSize: '17px' }}></i>
                {t('chat_history_title')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  onClick={newChatSession}
                  style={{ padding: '5px 10px', borderRadius: '6px', background: 'var(--primary)', color: '#fff', border: 'none', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                >
                  <i className="ti ti-plus"></i> {t('new_chat_btn_tooltip')}
                </button>
                <button 
                  onClick={() => setShowMobileHistory(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
                >
                  <i className="ti ti-x"></i>
                </button>
              </div>
            </div>

            {/* Search */}
            <div style={{ padding: '12px 14px' }}>
              <div style={{ position: 'relative' }}>
                <i className="ti ti-search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'var(--text-muted)' }}></i>
                <input
                  type="text"
                  placeholder={t('search_chat_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px 7px 30px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }}
                />
              </div>
            </div>

            {/* Sessions List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 10px' }}>
              {filteredSessions.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                  <i className="ti ti-messages" style={{ fontSize: '20px', display: 'block', margin: '0 auto 6px' }}></i>
                  {t('no_chat_history')}
                </div>
              ) : (
                filteredSessions.map((s) => {
                  const isActive = s.session_id === currentSessionId;
                  const title = s.title ? (s.title.length > 25 ? s.title.slice(0, 25) + '...' : s.title) : t('new_chat_session_title');
                  const dateLabel = getFriendlyDate(s.last_activity);
                  return (
                    <div 
                      key={s.session_id} 
                      className={`chat-hist-card ${isActive ? 'active' : ''}`}
                      onClick={() => selectSession(s.session_id)}
                      style={{ padding: '10px 12px', borderRadius: '8px', marginBottom: '6px', cursor: 'pointer', background: isActive ? 'var(--surface-2)' : 'transparent', border: isActive ? '1px solid var(--primary)' : '1px solid transparent' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: isActive ? 600 : 500, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {title}
                        </div>
                        <button
                          onClick={(e) => deleteSession(e, s.session_id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                          title={t('delete_chat_tooltip')}
                        >
                          <i className="ti ti-trash" style={{ fontSize: '12px' }}></i>
                        </button>
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                        {dateLabel}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Suggested Topics in mobile drawer */}
            <div style={{ padding: '12px', borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>{t('label_topics')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button className="chat-topic-btn" onClick={() => { setShowMobileHistory(false); handleSend(t('ai_suggestion_1_val')); }}><i className="ti ti-briefcase" style={{ color: 'var(--neon-cyan)' }}></i> &nbsp;{t('topic_business')}</button>
                <button className="chat-topic-btn" onClick={() => { setShowMobileHistory(false); handleSend(t('ai_suggestion_2_val')); }}><i className="ti ti-chart-line" style={{ color: 'var(--neon-cyan)' }}></i> &nbsp;{t('topic_investment')}</button>
                <button className="chat-topic-btn" onClick={() => { setShowMobileHistory(false); handleSend(t('ai_suggestion_3_val')); }}><i className="ti ti-users" style={{ color: 'var(--neon-cyan)' }}></i> &nbsp;{t('topic_connection')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Model Selection & Config Sheet */}
      {showMobileConfig && (
        <div className="chat-drawer-backdrop" onClick={() => setShowMobileConfig(false)}>
          <div className="chat-sheet-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="ti ti-settings" style={{ color: 'var(--primary)' }}></i>
                {t('ai_config_title')}
              </div>
              <button 
                onClick={() => setShowMobileConfig(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
              >
                <i className="ti ti-x"></i>
              </button>
            </div>

            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', background: 'var(--surface-2)', marginBottom: '14px' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Trạng thái:</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#10B981' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
                {t('status_online')}
              </span>
            </div>

            {/* Model Selection */}
            {user && (user.tier === 'Gold' || user.tier === 'Platinum') ? (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  <i className="ti ti-crown" style={{ color: 'var(--amber)', marginRight: '6px' }}></i>
                  {t('premium_model_label')(user.tier)}
                </label>
                <select
                  value={selectedModelOverride}
                  onChange={(e) => handleModelOverrideChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-strong)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">{t('system_default_model')} ({aiConfig.provider} {aiConfig.model})</option>
                  <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Tốc độ cao)</option>
                  <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Thông minh)</option>
                  <option value="openai/gpt-4o-mini">OpenAI GPT-4o Mini (OpenRouter)</option>
                  <option value="deepseek/deepseek-chat">DeepSeek V3 (OpenRouter)</option>
                  <option value="deepseek/deepseek-r1">DeepSeek R1 (OpenRouter)</option>
                  <option value="anthropic/claude-3-5-sonnet">Claude 3.5 Sonnet (OpenRouter)</option>
                </select>
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5', padding: '10px', background: 'var(--surface-2)', borderRadius: '8px' }}>
                {t('free_model_desc')}
                <div style={{ marginTop: '6px', color: 'var(--amber)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <i className="ti ti-crown"></i> {t('upgrade_to_change_models')}
                </div>
              </div>
            )}

            {/* Suggested Actions */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <i className="ti ti-sparkles" style={{ color: 'var(--primary)', marginRight: '4px' }}></i>
                {t('suggested_actions_title')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div 
                  className="chat-panel-item" 
                  onClick={() => { setShowMobileConfig(false); handleSend(t('suggested_action_1_title') + ' ' + t('category_default')); }}
                  style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--surface-2)', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center' }}
                >
                  <i className="ti ti-user-plus" style={{ color: 'var(--primary)', fontSize: '18px' }}></i>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{t('suggested_action_1_title')}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{t('suggested_action_1_desc')}</div>
                  </div>
                </div>

                <div 
                  className="chat-panel-item" 
                  onClick={() => { setShowMobileConfig(false); handleSend(t('suggested_action_2_title')); }}
                  style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--surface-2)', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center' }}
                >
                  <i className="ti ti-calendar" style={{ color: 'var(--primary)', fontSize: '18px' }}></i>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{t('suggested_action_2_title')}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{t('suggested_action_2_desc')}</div>
                  </div>
                </div>

                <div 
                  className="chat-panel-item" 
                  onClick={() => { setShowMobileConfig(false); handleSend(t('suggested_action_3_title')); }}
                  style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--surface-2)', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center' }}
                >
                  <i className="ti ti-building-handshake" style={{ color: 'var(--primary)', fontSize: '18px' }}></i>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{t('suggested_action_3_title')}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{t('suggested_action_3_desc')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AIChat;
