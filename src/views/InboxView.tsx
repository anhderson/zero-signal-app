import { useState, useEffect, useRef } from 'react';
import { 
  Mail, MessageSquare, Send, Trash2, UserPlus, X, Search, 
  Star, Plus, ImageIcon, Smile
} from 'lucide-react';
import { useAppStore } from '../store';
import type { Contact, Email } from '../store';
import './InboxView.css';

interface InboxViewProps {
  onClose: () => void;
}

const InboxView = ({ onClose }: InboxViewProps) => {
  const { 
    currentUser, emails, loadEmails, sendEmail, deleteEmail, markEmailAsRead,
    contacts, loadContacts, addContact, removeContact, searchUsers,
    dms, loadDMs, sendDM, markDMAsRead, subscribeToDMs
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'chat' | 'email'>('chat');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [dmInput, setDmInput] = useState('');
  
  // Email form
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadEmails();
    loadContacts();
    const unsub = subscribeToDMs();
    return () => unsub();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      loadDMs(selectedContact.contactId);
      markDMAsRead(selectedContact.contactId);
    }
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dms]);

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.length > 2) {
      const results = await searchUsers(val);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSendEmail = async () => {
    if (!emailTo || !emailSubject || !emailBody) return;
    const { error } = await sendEmail(emailTo, emailSubject, emailBody);
    if (!error) {
      setShowCompose(false);
      setEmailTo('');
      setEmailSubject('');
      setEmailBody('');
    }
  };

  const handleSendDM = async () => {
    if (!dmInput.trim() || !selectedContact) return;
    const { error } = await sendDM(selectedContact.contactId, dmInput);
    if (!error) {
      setDmInput('');
      loadDMs(selectedContact.contactId);
    }
  };

  return (
    <div className="inbox-overlay" onClick={onClose}>
      <div className="inbox-container glass-panel neon-border" onClick={e => e.stopPropagation()}>
        <div className="inbox-sidebar">
          <div className="inbox-profile-brief">
            <div className="brief-avatar" style={{ overflow: 'hidden' }}>
              {currentUser?.bannerUrl ? (
                <img src={currentUser.bannerUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                currentUser?.avatarStr || 'U'
              )}
            </div>
            <div className="brief-info">
              <span className="brief-name">{currentUser?.name}</span>
              <span className="brief-status">Conexão Ativa</span>
            </div>
            <button className="inbox-close-top" onClick={onClose}><X size={18} /></button>
          </div>

          <nav className="inbox-nav">
            <button 
              className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquare size={18} />
              <span>Mensagens</span>
              <div className="nav-badge">0</div>
            </button>
            <button 
              className={`nav-item ${activeTab === 'email' ? 'active' : ''}`}
              onClick={() => setActiveTab('email')}
            >
              <Mail size={18} />
              <span>E-mails</span>
              <div className="nav-badge">{emails.filter(e => !e.isRead).length}</div>
            </button>
          </nav>

          <div className="inbox-list-section">
            <div className="section-header">
              <h3>{activeTab === 'chat' ? 'CONTATOS' : 'MENSAGENS'}</h3>
              <button 
                className="add-btn-small" 
                onClick={() => activeTab === 'chat' ? setShowAddContact(true) : setShowCompose(true)}
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="list-scroll">
              {activeTab === 'chat' ? (
                contacts.map(c => (
                  <div 
                    key={c.id} 
                    className={`list-item ${selectedContact?.contactId === c.contactId ? 'active' : ''}`}
                    onClick={() => setSelectedContact(c)}
                  >
                    <div className="item-avatar-mini" style={{ borderLeftColor: c.avatarColor || 'var(--neon-cyan)', overflow: 'hidden' }}>
                      {c.avatarPhoto ? (
                        <img src={c.avatarPhoto} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        c.avatarStr
                      )}
                    </div>
                    <div className="item-info">
                      <span className="item-title">{c.name}</span>
                      <span className="item-subtitle">{c.status || 'Offline'}</span>
                    </div>
                  </div>
                ))
              ) : (
                emails.map(e => (
                  <div 
                    key={e.id} 
                    className={`list-item ${selectedEmail?.id === e.id ? 'active' : ''} ${!e.isRead ? 'unread' : ''}`}
                    onClick={() => {
                      setSelectedEmail(e);
                      markEmailAsRead(e.id);
                    }}
                  >
                    <div className="item-avatar-mini">{e.fromAvatar}</div>
                    <div className="item-info">
                      <span className="item-title">{e.fromName}</span>
                      <span className="item-subtitle">{e.subject}</span>
                    </div>
                    <div className="item-time">
                      {new Date(e.createdAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="inbox-main-area">
          {activeTab === 'chat' ? (
            selectedContact ? (
              <div className="dm-chat-container">
                <div className="dm-header">
                  <div className="dm-header-info">
                    <div className="dm-avatar-large" style={{ overflow: 'hidden' }}>
                      {selectedContact.avatarPhoto ? (
                        <img src={selectedContact.avatarPhoto} alt={selectedContact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        selectedContact.avatarStr
                      )}
                    </div>
                    <div className="dm-name-stack">
                      <h2>{selectedContact.name}</h2>
                      <span className="dm-status-indicator">Ativo no Protocolo</span>
                    </div>
                  </div>
                  <div className="dm-actions">
                    <button className="dm-tool-btn"><Trash2 size={18} onClick={() => removeContact(selectedContact.id)} /></button>
                  </div>
                </div>

                <div className="dm-messages-list">
                  <div className="dm-welcome">
                    <div className="welcome-avatar" style={{ overflow: 'hidden' }}>
                      {selectedContact.avatarPhoto ? (
                        <img src={selectedContact.avatarPhoto} alt={selectedContact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        selectedContact.avatarStr
                      )}
                    </div>
                    <h3>Este é o início da sua conexão com {selectedContact.name}</h3>
                    <p>Todas as transmissões são criptografadas e protegidas pelo protocolo Zero Signal.</p>
                  </div>

                  {dms.map(m => {
                    const isOwn = m.fromId === currentUser?.id;
                    return (
                      <div key={m.id} className={`dm-row ${isOwn ? 'own' : ''}`}>
                        {!isOwn && (
                          <div className="dm-avatar-tiny" style={{ overflow: 'hidden' }}>
                            {selectedContact.avatarPhoto ? (
                              <img src={selectedContact.avatarPhoto} alt={selectedContact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              selectedContact.avatarStr
                            )}
                          </div>
                        )}
                        <div className="dm-bubble">
                          {m.text && <div className="dm-text">{m.text}</div>}
                          {m.imageUrl && <img src={m.imageUrl} className="dm-image" alt="Transmissão" />}
                          <span className="dm-time">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="dm-input-area">
                  <div className="dm-input-wrapper">
                    <button className="dm-input-tool"><Plus size={20} /></button>
                    <input 
                      type="text" 
                      placeholder={`Transmitir para ${selectedContact.name}`}
                      value={dmInput}
                      onChange={e => setDmInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendDM()}
                    />
                    <div className="dm-input-right">
                      <button className="dm-input-tool"><ImageIcon size={18} /></button>
                      <button className="dm-input-tool"><Smile size={18} /></button>
                      <button className="dm-send-btn" onClick={handleSendDM}><Send size={18} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="inbox-empty-view">
                <MessageSquare size={64} className="empty-icon-neon" />
                <h2>CENTRO DE COMUNICAÇÃO</h2>
                <p>Selecione um contato para iniciar uma transmissão direta.</p>
                <button className="action-btn" onClick={() => setShowAddContact(true)}>ADICIONAR CONTATO</button>
              </div>
            )
          ) : (
            selectedEmail ? (
              <div className="email-read-container">
                <div className="email-header">
                  <div className="email-subject-line">
                    <h1>{selectedEmail.subject}</h1>
                    <div className="email-labels">
                      <span className="label-inbox">Caixa de Entrada</span>
                    </div>
                  </div>
                  <div className="email-meta">
                    <div className="sender-info">
                      <div className="sender-avatar">{selectedEmail.fromAvatar}</div>
                      <div className="sender-details">
                        <span className="sender-name"><strong>{selectedEmail.fromName}</strong></span>
                        <span className="sender-address">&lt;{selectedEmail.fromId.slice(0, 8)}@zerosignal.sys&gt;</span>
                      </div>
                    </div>
                    <div className="email-time-actions">
                      <span className="email-date">
                        {new Date(selectedEmail.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      <div className="email-quick-actions">
                        <button><Star size={16} /></button>
                        <button><Trash2 size={16} onClick={() => { deleteEmail(selectedEmail.id); setSelectedEmail(null); }} /></button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="email-body">
                  {selectedEmail.body.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                </div>
                <div className="email-reply-area">
                  <button className="reply-btn">RESPONDER TRANSMISSÃO</button>
                </div>
              </div>
            ) : (
              <div className="inbox-empty-view">
                <Mail size={64} className="empty-icon-neon" />
                <h2>TERMINAL DE E-MAIL</h2>
                <p>Suas transmissões assíncronas aparecerão aqui.</p>
                <button className="action-btn" onClick={() => setShowCompose(true)}>REDA GIR E-MAIL</button>
              </div>
            )
          )}
        </div>

        {/* MODALS */}
        {showAddContact && (
          <div className="inbox-submodal-overlay">
            <div className="submodal-content glass-panel neon-border">
              <div className="submodal-header">
                <h2>ADICIONAR CONTATO</h2>
                <button onClick={() => setShowAddContact(false)}><X size={20} /></button>
              </div>
              <div className="submodal-body">
                <div className="search-field">
                  <Search size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar por nome de usuário..." 
                    value={searchQuery}
                    onChange={e => handleSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="search-results">
                  {searchResults.map(u => {
                    const isAlreadyContact = contacts.some(c => c.contactId === u.contactId);
                    return (
                      <div key={u.contactId} className="search-item">
                        <div className="item-avatar-mini" style={{ overflow: 'hidden' }}>
                          {u.avatarPhoto ? (
                             <img src={u.avatarPhoto} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            u.avatarStr
                          )}
                        </div>
                        <span className="search-name">{u.name}</span>
                        {isAlreadyContact ? (
                          <span className="already-hint">Já é contato</span>
                        ) : (
                          <button className="add-action-btn" onClick={() => { addContact(u.contactId); setShowAddContact(false); }}>
                            <UserPlus size={16} /> ADICIONAR
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {searchQuery && searchResults.length === 0 && <p className="no-results">Nenhum rastro encontrado.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {showCompose && (
          <div className="inbox-submodal-overlay">
            <div className="submodal-content glass-panel neon-border compose-modal">
              <div className="submodal-header">
                <h2>NOVA TRANSMISSÃO</h2>
                <button onClick={() => setShowCompose(false)}><X size={20} /></button>
              </div>
              <div className="submodal-body">
                <div className="form-group">
                  <label>PARA:</label>
                  <select value={emailTo} onChange={e => setEmailTo(e.target.value)}>
                    <option value="">Selecione um contato</option>
                    {contacts.map(c => <option key={c.contactId} value={c.contactId}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>ASSUNTO:</label>
                  <input 
                    type="text" 
                    value={emailSubject} 
                    onChange={e => setEmailSubject(e.target.value)} 
                    placeholder="Resumo do protocolo..."
                  />
                </div>
                <div className="form-group flex-1">
                  <label>MENSAGEM:</label>
                  <textarea 
                    value={emailBody} 
                    onChange={e => setEmailBody(e.target.value)}
                    placeholder="Escreva sua mensagem aqui..."
                  />
                </div>
              </div>
              <div className="submodal-footer">
                <button className="cancel-btn" onClick={() => setShowCompose(false)}>CANCELAR</button>
                <button className="send-btn" onClick={handleSendEmail}>TRANSMITIR</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxView;
