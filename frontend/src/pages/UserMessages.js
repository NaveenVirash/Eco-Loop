import React, { useState, useEffect, useContext } from 'react';
import { messageAPI } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import MessagingChat from './MessagingChat';
import './Dashboard.css';

export default function UserMessages() {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await messageAPI.getMessages();
      
      // Group messages by conversation partner
      const grouped = {};
      const seen = new Set();
      
      (response.data.data || []).forEach(msg => {
        const partnerId = msg.sender._id === user._id ? msg.receiver._id : msg.sender._id;
        const partnerInfo = msg.sender._id === user._id ? msg.receiver : msg.sender;
        
        if (!seen.has(partnerId)) {
          seen.add(partnerId);
          grouped[partnerId] = {
            partner: partnerInfo,
            lastMessage: msg,
            messages: []
          };
        }
        
        if (!grouped[partnerId].messages) {
          grouped[partnerId].messages = [];
        }
        grouped[partnerId].messages.push(msg);
      });

      // Count unread messages per partner
      const unread = {};
      (response.data.data || []).forEach(msg => {
        if (msg.receiver._id === user._id && !msg.isRead) {
          const senderId = msg.sender._id;
          unread[senderId] = (unread[senderId] || 0) + 1;
        }
      });
      
      setUnreadCounts(unread);
      setConversations(Object.values(grouped).sort((a, b) => 
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
      ));
    } catch (err) {
      setError('Failed to load messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diffTime = now - msgDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return msgDate.toLocaleDateString();
    }
  };

  if (selectedPartner) {
    return (
      <MessagingChat 
        selectedPartner={selectedPartner}
        onClose={() => {
          setSelectedPartner(null);
          fetchConversations();
        }}
      />
    );
  }

  return (
    <>
      {error && <div className="error-banner">{error}</div>}
      
      {loading ? (
        <section className="dashboard-section">
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#5A5A56' }}>
            Loading your messages...
          </div>
        </section>
      ) : conversations.length === 0 ? (
        <section className="dashboard-section">
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ color: '#5A5A56', fontSize: '16px', margin: '0 0 10px 0' }}>
              No messages yet
            </p>
            <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
              Visit <a href="/recycling-partners" style={{ color: '#1E9B6B', textDecoration: 'underline' }}>Recycling Partners</a> to start a conversation
            </p>
          </div>
        </section>
      ) : (
        <section className="dashboard-section">
          <div className="messages-list">
            {conversations.map(conv => (
              <div 
                key={conv.partner._id}
                className="message-item-inbox"
                onClick={() => setSelectedPartner(conv.partner)}
              >
                <div className="message-sender-avatar">
                  {conv.partner.name ? conv.partner.name.charAt(0).toUpperCase() : '?'}
                </div>
                
                <div className="message-content-preview">
                  <div className="message-header-row">
                    <span className="message-sender-name">{conv.partner.name}</span>
                    {conv.partner.role === 'company' && (
                      <span className="message-sender-badge">♻️ Partner</span>
                    )}
                  </div>
                  <p className="message-preview-text">
                    {conv.lastMessage.subject}
                  </p>
                  <span className="message-timestamp">
                    {formatDate(conv.lastMessage.createdAt)}
                  </span>
                </div>

                {unreadCounts[conv.partner._id] > 0 && (
                  <div className="unread-badge-inbox">
                    {unreadCounts[conv.partner._id]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
