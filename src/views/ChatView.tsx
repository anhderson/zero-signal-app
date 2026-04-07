import React, { useRef, useEffect } from 'react';
import TopBar from '../components/TopBar';
import MembersSidebar from '../components/MembersSidebar';
import { PlusCircle, Smile, Image as ImageIcon } from 'lucide-react';
import { useAppStore } from '../store';
import './ChatView.css';

const ChatView = () => {
  const { messages, addMessage, currentUser, activeChannelId, channels } = useAppStore();
  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const channelMessages = messages.filter(m => m.channelId === activeChannelId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [channelMessages]);

  const handleSendMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '' && currentUser && activeChannelId) {
      addMessage({
        channelId: activeChannelId,
        text: inputValue,
        userId: currentUser.id,
        username: currentUser.name,
        avatarStr: currentUser.avatarStr,
      });
      setInputValue('');
    }
  };

  return (
    <div className="view-container">
      <TopBar title={activeChannel?.name ?? 'geral'} />
      
      <div className="chat-layout-wrapper">
        <div className="chat-content">
          <div className="messages-area">
            <div className="chat-welcome">
              <div className="welcome-icon">#</div>
              <h1>Bem-vindo a #{activeChannel?.name ?? 'geral'}!</h1>
              <p>Este é o início do canal. Diga olá! 👋</p>
            </div>

            {channelMessages.map((msg) => (
              <div key={msg.id} className="message-group">
                <div className={`avatar ${msg.userId === currentUser?.id ? 'user' : ''}`}>
                  {msg.avatarStr}
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="username">{msg.username}</span>
                    <span className="timestamp">{msg.timestamp}</span>
                  </div>
                  <div className="message-text">{msg.text}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <div className="chat-input-wrapper glass-panel">
              <PlusCircle size={24} className="action-icon" />
              <input
                type="text"
                placeholder={`Conversar em #${activeChannel?.name ?? 'geral'}`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleSendMessage}
              />
              <ImageIcon size={24} className="action-icon" />
              <Smile size={24} className="action-icon" />
            </div>
          </div>
        </div>

        <MembersSidebar />
      </div>
    </div>
  );
};

export default ChatView;
