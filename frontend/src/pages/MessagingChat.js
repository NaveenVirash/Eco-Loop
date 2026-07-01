import React, { useState, useEffect, useContext, useRef } from 'react';
import { messageAPI } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import '../pages/Messaging.css';

export default function MessagingChat({ selectedPartner, onClose }) {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const [personalLogins, setPersonalLogins] = useState({});

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversation when partner changes
  useEffect(() => {
    if (selectedPartner?._id) {
      fetchConversation();
    }
  }, [selectedPartner?._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await messageAPI.getConversation(selectedPartner._id);
      setMessages(response.data.data || []);

      // Mark personal login messages (from user to partner)
      const personalLogins = {};
      (response.data.data || []).forEach(msg => {
        if (msg.sender._id === user._id && msg.receiver._id === selectedPartner._id) {
          personalLogins[msg._id] = true;
        }
      });
      setPersonalLogins(personalLogins);
    } catch (err) {
      setError('Failed to load conversation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !body.trim()) {
      setError('Please fill in subject and message');
      return;
    }

    try {
      setSending(true);
      setError('');

      const response = await messageAPI.sendMessage(
        selectedPartner._id,
        subject,
        body
      );

      setMessages([...messages, response.data.data]);
      setSubject('');
      setBody('');
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (!selectedPartner) {
    return null;
  }

  return (
    <div className="message-chat-container">
      {/* Sidebar with conversation */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h3>Conversation</h3>
        </div>
      </div>

      {/* Main chat area */}
      <div className="chat-main">
        {/* Chat header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <h3>{selectedPartner.name}</h3>
            <p>{selectedPartner.role === 'company' ? '♻️ Recycling Partner' : 'User'}</p>
          </div>
          <button
            className="btn-close-chat"
            onClick={onClose}
            title="Close chat"
          >
            ✕
          </button>
        </div>

        {/* Messages area */}
        {loading ? (
          <div className="loading-spinner">Loading conversation...</div>
        ) : (
          <>
            <div className="messages-area">
              {messages.length === 0 ? (
                <div className="empty-chat-state">
                  <p>No messages yet. Start a conversation!</p>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => {
                    const isFromUser = msg.sender._id === user._id;
                    const isPersonalLogin = isFromUser && msg.receiver._id === selectedPartner._id;
                    const showDateSeparator =
                      index === 0 ||
                      formatDate(messages[index - 1].createdAt) !== formatDate(msg.createdAt);

                    return (
                      <div key={msg._id}>
                        {showDateSeparator && (
                          <div style={{
                            textAlign: 'center',
                            fontSize: '12px',
                            color: '#5A5A56',
                            margin: '12px 0'
                          }}>
                            {formatDate(msg.createdAt)}
                          </div>
                        )}
                        {isPersonalLogin && (
                          <div className="personal-login-indicator">
                            <div className="personal-login-badge">👤</div>
                            <p><strong>Personal login message:</strong> This is from your personal account</p>
                          </div>
                        )}
                        <div className={`message-item ${isFromUser ? 'sent' : 'received'}`}>
                          <div className="message-content">
                            <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                              {msg.subject}
                            </div>
                            <div>{msg.body}</div>
                            <div className="message-timestamp">
                              {formatTime(msg.createdAt)}
                            </div>
                            {isFromUser && msg.isRead && (
                              <div className="message-status-read">✓ Read</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message input */}
            <div className="message-input-area">
              <form onSubmit={handleSendMessage} className="message-input-form">
                {error && <div className="chat-error">{error}</div>}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <div className="message-input-group">
                      <label>Subject</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Message subject..."
                        disabled={sending}
                      />
                    </div>
                    <div className="message-input-group">
                      <label>Message</label>
                      <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Type your message..."
                        disabled={sending}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn-send-message"
                    disabled={sending || !subject.trim() || !body.trim()}
                  >
                    {sending ? '📤...' : '📤 Send'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
