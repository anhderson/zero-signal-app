import React, { useState, useRef } from 'react';
import { useAppStore, ACHIEVEMENTS, MEMBERSHIP_MEDALS } from '../store';
import { X, UserPlus, Save, Camera, Upload } from 'lucide-react';
import './ProfileSettings.css';

interface ProfileSettingsProps {
  onClose: () => void;
}

const DECORATIONS = [
  { id: 'none',   name: 'Nenhuma',     color: 'transparent' },
  { id: 'red',    name: 'Crítico',     color: '#ff3131' },
  { id: 'orange', name: 'Alerta',      color: '#ff8800' },
  { id: 'yellow', name: 'Voltagem',    color: '#faff00' },
  { id: 'green',  name: 'Bio',         color: '#00ff41' },
  { id: 'cyan',   name: 'Neon',        color: '#00f3ff' },
  { id: 'blue',   name: 'Oceano',      color: '#0055ff' },
  { id: 'purple', name: 'Cósmico',     color: '#7b00ff' },
];

const BANNERS = [
  { id: 'default', name: 'Padrão',    color: '#0a0a0c' },
  { id: 'red',    name: 'Crítico',     color: '#2e0000' },
  { id: 'orange', name: 'Alerta',      color: '#2e1500' },
  { id: 'yellow', name: 'Voltagem',    color: '#2e2e00' },
  { id: 'green',  name: 'Bio',         color: '#002e0f' },
  { id: 'cyan',   name: 'Neon',        color: '#001a2e' },
  { id: 'blue',   name: 'Oceano',      color: '#00082e' },
  { id: 'purple', name: 'Cósmico',     color: '#0d0014' },
];

const ENTRY_SOUNDS = [
  { id: 'default', name: 'Alerta Macio (Padrão)' },
  { id: 'tech',    name: 'Tech Pulse' },
  { id: 'cyber',   name: 'Cyber Chime' },
  { id: 'digital', name: 'Digital Login' },
];

const EXIT_SOUNDS = [
  { id: 'default',  name: 'Echo Fade (Padrão)' },
  { id: 'shutdown', name: 'Soft Shutdown' },
  { id: 'data',     name: 'Data Out' },
  { id: 'fade',     name: 'Digital Exit' },
];

const SOUNDBOARD_EFFECTS = [
  { id: 'blip',    name: 'Cyber Blip', icon: '✨', freq: 880, type: 'sine' },
  { id: 'pop',     name: 'Neon Pop',   icon: '🫧', freq: 440, type: 'square' },
  { id: 'chime',   name: 'Zen Chime',  icon: '🔔', freq: 1100, type: 'triangle' },
  { id: 'bloop',   name: 'Data Drop',  icon: '💧', freq: 330, type: 'sine' },
  { id: 'sparkle', name: 'Glitter',    icon: '⭐', freq: 1500, type: 'sawtooth' },
  { id: 'zap',     name: 'Electrum',   icon: '⚡', freq: 900, type: 'square' },
  { id: 'boing',   name: 'Elastic',    icon: '🌀', freq: 220, type: 'triangle' },
  { id: 'twinkle', name: 'Stardust',   icon: '🌃', freq: 1320, type: 'sine' },
  { id: 'magic',   name: 'Portal',     icon: '🪄', freq: 1760, type: 'sine' },
  { id: 'ping',    name: 'Echo Ping',  icon: '📍', freq: 660, type: 'sine' },
];

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onClose }) => {
  const { currentUser, updateProfile, addFriend, toggleFeaturedAchievement, activeProfileTab, members, addXP } = useAppStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'friends' | 'gamification' | 'sounds'>(activeProfileTab);

  const [name, setName]               = useState(currentUser?.name || '');
  const [decoration, setDecoration]   = useState(currentUser?.decorationId || 'none');
  const [bannerColor, setBannerColor] = useState(currentUser?.bannerColor || '#0a0a0c');
  const [entrySound, setEntrySound]   = useState(currentUser?.entrySoundId || 'default');
  const [exitSound, setExitSound]     = useState(currentUser?.exitSoundId || 'default');
  const [friendId, setFriendId]       = useState('');

  // Avatar photo state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentUser?.bannerUrl || null);
  const [avatarStr, setAvatarStr]         = useState(currentUser?.avatarStr || 'US');
  const [saving, setSaving]               = useState(false);
  const [selectedXpUserId, setSelectedXpUserId] = useState<string>(currentUser?.id || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image type
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecione uma imagem.');
      return;
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Imagem muito grande. Máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarPreview(dataUrl);
      // Extract initials from name as text fallback
      setAvatarStr(name.substring(0, 2).toUpperCase() || 'US');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name,
        avatarStr,
        decorationId: decoration,
        bannerColor,
        entrySoundId: entrySound,
        exitSoundId: exitSound,
        // Store base64 preview as bannerUrl since we don't have storage set up
        ...(avatarPreview ? { bannerUrl: avatarPreview } : {}),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleAddFriend = async () => {
    if (friendId.trim()) {
      await addFriend(friendId.trim());
      setFriendId('');
      alert('Pedido de amizade enviado!');
    }
  };

  const playSFX = (freq: number, type: any) => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(freq / 2, audioCtx.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
  };

  return (
    <div className="profile-settings-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="profile-settings-modal">

        {/* ---- Sidebar ---- */}
        <div className="settings-sidebar">
          <div className="sidebar-section-title">Configurações</div>
          <button
            className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Perfil do Usuário
          </button>
          <button
            className={`sidebar-item ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            Amigos
          </button>
          <button
            className={`sidebar-item ${activeTab === 'gamification' ? 'active' : ''}`}
            onClick={() => setActiveTab('gamification')}
          >
            Nível e Medalhas
          </button>
          <button
            className={`sidebar-item ${activeTab === 'sounds' ? 'active' : ''}`}
            onClick={() => setActiveTab('sounds')}
          >
            Sons de Chamada
          </button>
          <div className="spacer" />
          <button className="sidebar-item logout" onClick={onClose}>Fechar</button>
        </div>

        {/* ---- Content ---- */}
        <div className="settings-content">
          <div className="content-header">
            <h3>{activeTab === 'profile' ? 'Perfil do Usuário' : activeTab === 'friends' ? 'Amigos' : 'Nível e Medalhas'}</h3>
            <button className="close-btn" onClick={onClose}><X size={20} /></button>
          </div>

          <div className="content-scroll">
            {activeTab === 'profile' && (
              <div className="profile-tab">

                {/* ---- Preview Card ---- */}
                <div className="profile-preview-card" style={{ '--banner-color': bannerColor } as React.CSSProperties}>
                  <div className="profile-banner" />
                  <div className="profile-info-section">

                    {/* ---- Avatar with photo upload ---- */}
                    <div className="avatar-preview-container">
                      <div
                        className={`avatar-main decoration-${decoration}`}
                        onClick={() => fileInputRef.current?.click()}
                        title="Clique para trocar foto"
                      >
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar" className="avatar-photo" />
                        ) : (
                          <span className="avatar-initials">{avatarStr}</span>
                        )}
                        <div className="avatar-camera-overlay">
                          <Camera size={20} />
                          <span>TROCAR</span>
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageSelect}
                      />
                    </div>

                    <div className="profile-details-preview">
                      <span className="name-preview">{name || 'Usuário'}</span>
                      <div className="status-preview-wrap">
                        <div 
                          className="status-dot-preview" 
                          style={{ 
                            backgroundColor: {
                              'Disponível': '#00cc44',
                              'Invisível': '#8e9297',
                              'Discreto': '#faff00',
                              'Focado': '#ff3131',
                              'Dormindo': '#7b00ff'
                            }[currentUser?.status || 'Disponível'] 
                          }} 
                        />
                        <span className="status-label-preview">{currentUser?.status || 'Disponível'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ---- Upload button shortcut ---- */}
                <button className="upload-photo-btn" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={16} />
                  Enviar foto de perfil
                </button>

                {/* ---- Display Name ---- */}
                <div className="settings-group">
                  <label>NOME DE EXIBIÇÃO</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="settings-input"
                    placeholder="Seu nome..."
                  />
                </div>

                {/* ---- Avatar Decoration ---- */}
                <div className="settings-group">
                  <label>DECORAÇÃO DO AVATAR</label>
                  <div className="options-grid">
                    {DECORATIONS.map(d => (
                      <button
                        key={d.id}
                        className={`option-item ${decoration === d.id ? 'active' : ''}`}
                        onClick={() => setDecoration(d.id)}
                      >
                        <div className="option-circle" style={{ borderColor: d.color === 'transparent' ? '#444' : d.color, boxShadow: d.color !== 'transparent' ? `0 0 6px ${d.color}` : 'none' }} />
                        <span>{d.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ---- Banner / Card color ---- */}
                <div className="settings-group">
                  <label>COR DO BANNER</label>
                  <div className="options-grid">
                    {BANNERS.map(b => (
                      <button
                        key={b.id}
                        className={`option-item ${bannerColor === b.color ? 'active' : ''}`}
                        onClick={() => setBannerColor(b.color)}
                      >
                        <div className="option-bg" style={{ backgroundColor: b.color }} />
                        <span>{b.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ---- Save ---- */}
                <div className="actions-footer">
                  <button className="save-btn" onClick={handleSave} disabled={saving}>
                    <Save size={16} />
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>

            )}
            
            {activeTab === 'friends' && (
              <div className="friends-tab">
                <div className="add-friend-section">
                  <label>ADICIONAR AMIGO</label>
                  <p className="section-hint">Cole o ID do usuário para enviar pedido de amizade.</p>
                  <div className="add-friend-input-container">
                    <input
                      type="text"
                      placeholder="ID do usuário..."
                      value={friendId}
                      onChange={(e) => setFriendId(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
                    />
                    <button className="add-btn" onClick={handleAddFriend}>
                      <UserPlus size={18} />
                    </button>
                  </div>
                </div>

                <div className="friends-list-section">
                  <label>LISTA DE AMIGOS</label>
                  <div className="friends-list">
                    {(currentUser?.friends || []).length === 0 ? (
                      <div className="empty-friends">
                        <UserPlus size={32} style={{ opacity: 0.2, marginBottom: 8 }} />
                        <p>Nenhum amigo adicionado ainda.</p>
                      </div>
                    ) : (
                      currentUser?.friends?.map(id => (
                        <div key={id} className="friend-item">
                          <div className="friend-info">
                            <span className="friend-avatar">US</span>
                            <span className="friend-id">{id.substring(0, 8)}...</span>
                          </div>
                          <button className="message-btn">Conversar</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'gamification' && (
              <div className="gamification-tab">
                {(() => {
                  const xp = currentUser?.xp || 0;
                  let currentLevel = Math.floor(xp / 1000) + 1;
                  if (currentLevel > 360) currentLevel = 360;
                  
                  const xpForCurrentLevel = (currentLevel - 1) * 1000;
                  const xpForNextLevel = currentLevel * 1000;
                  const progressInLevel = xp - xpForCurrentLevel;
                  const totalNeededInLevel = xpForNextLevel - xpForCurrentLevel;
                  const progressPct = Math.min(100, Math.max(0, (progressInLevel / totalNeededInLevel) * 100));

                  const handleXpCapsule = async () => {
                      if (!selectedXpUserId) return;
                      const targetMember = members.find(m => m.id === selectedXpUserId);
                      if (!targetMember) return;
                      
                      // 1/3 of level progress (1000/3 = 333)
                      const xpGain = 333; 
                      await addXP(selectedXpUserId, xpGain);
                      alert(`Cápsula de XP ativada para ${targetMember.name}!`);
                  };

                  return (
                    <div className="gamification-content">
                      <div className="level-header">
                        <div className="level-badge">Nível {currentLevel}</div>
                        <div className="level-stats">
                           <span>XP Total: {xp}</span>
                           <span>Máximo: Nível 360</span>
                        </div>
                      </div>

                      <div className="xp-bar-container">
                         <div className="xp-bar-info">
                            <span>{progressInLevel} / {totalNeededInLevel} XP para prox nível</span>
                            <span>{progressPct.toFixed(1)}%</span>
                         </div>
                         <div className="xp-bar-track">
                            <div className="xp-bar-fill" style={{ width: `${progressPct}%` }}></div>
                         </div>
                      </div>

                      {currentUser?.name === 'PhantomTroupe' && (
                        <div className="admin-xp-capsule">
                          <label className="admin-label">🧪 Cápsula de XP (PROTOCOLO ADMIN)</label>
                          <div className="admin-xp-controls">
                            <select 
                              value={selectedXpUserId} 
                              onChange={(e) => setSelectedXpUserId(e.target.value)}
                              className="settings-input admin-select"
                            >
                              <option value="">Selecionar Perfil...</option>
                              {members.map(m => (
                                <option key={m.id} value={m.id}>{m.name} (LV.{m.level})</option>
                              ))}
                            </select>
                            <button className="simulate-xp-btn capsule" onClick={handleXpCapsule}>
                               Ativar Cápsula
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="medals-section">
                        <label>MEDALHÕES DE RECOMPENSA</label>
                        <p className="section-hint">Selecione até 4 medalhas para destacar em seu perfil (clique para fixar).</p>
                        
                        <div className="medals-grid">
                          {MEMBERSHIP_MEDALS.map(medal => {
                             const regDate = currentUser?.registeredAt ? new Date(currentUser.registeredAt) : new Date();
                             const now = new Date();
                             const diffTime = Math.abs(now.getTime() - regDate.getTime());
                             const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
                             const isEarned = medal.months === undefined ? true : diffMonths >= medal.months;
                             const isFeatured = currentUser?.featuredAchievements?.includes(medal.id);

                             return (
                               <div 
                                 key={medal.id} 
                                 className={`medal-item ${isEarned ? 'earned' : 'locked'} ${isFeatured ? 'featured' : ''}`}
                                 onClick={() => isEarned && toggleFeaturedAchievement(medal.id)}
                               >
                                 <div className={`medal-icon ${medal.color}`} title={medal.title}>
                                   {medal.id.toUpperCase()}
                                 </div>
                                 <span>{medal.label}</span>
                               </div>
                             );
                          })}
                        </div>
                      </div>

                      <div className="medals-section" style={{ marginTop: '40px' }}>
                         <label>CONQUISTAS DO PROTOCOLO</label>
                         <p className="section-hint">Desbloqueie medalhas ao realizar ações específicas dentro do sistema.</p>
                         
                         <div className="achievements-grid">
                            {ACHIEVEMENTS.map(ach => {
                              const isUnlocked = currentUser?.achievements?.includes(ach.id);
                              const isFeatured = currentUser?.featuredAchievements?.includes(ach.id);
                              return (
                                <div 
                                  key={ach.id} 
                                  className={`achievement-medal-item ${!isUnlocked ? 'locked' : ''} ${isFeatured ? 'featured' : ''}`}
                                  onClick={() => isUnlocked && toggleFeaturedAchievement(ach.id)}
                                >
                                  <div className={`achievement-icon-blob ${ach.color}`} title={ach.hint}>
                                    {ach.icon}
                                    {ach.id.includes('33') && <span className="tier-badge">33</span>}
                                  </div>
                                  <span className="achievement-name">{ach.name}</span>
                                </div>
                              );
                            })}
                         </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
            
            {activeTab === 'sounds' && (
              <div className="sounds-tab animate-slide-in">
                <div className="settings-group">
                  <label>SOUNDBOARD (EXPRESSÃO RÁPIDA)</label>
                  <p className="section-hint">Envie efeitos sonoros divertidos durante as chamadas de voz.</p>
                  <div className="soundboard-grid">
                    {SOUNDBOARD_EFFECTS.map(effect => (
                      <button 
                        key={effect.id} 
                        className="soundboard-btn"
                        onClick={() => playSFX(effect.freq, effect.type)}
                      >
                        <span className="sfx-icon">{effect.icon}</span>
                        <span className="sfx-name">{effect.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-group" style={{ marginTop: '32px' }}>
                  <label>SOM DE ENTRADA (FREQUÊNCIA)</label>
                  <p className="section-hint">Toca para todos quando você entra no canal de voz.</p>
                  <div className="sound-options-list">
                    {ENTRY_SOUNDS.map(s => (
                      <button 
                        key={s.id} 
                        className={`sound-option-card ${entrySound === s.id ? 'active' : ''}`}
                        onClick={() => setEntrySound(s.id)}
                      >
                        <div className="sound-radio" />
                        <span>{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-group" style={{ marginTop: '32px' }}>
                  <label>SOM DE SAÍDA (DESCONEXÃO)</label>
                  <p className="section-hint">Toca suavemente ao se retirar da frequência.</p>
                  <div className="sound-options-list">
                    {EXIT_SOUNDS.map(s => (
                      <button 
                        key={s.id} 
                        className={`sound-option-card ${exitSound === s.id ? 'active' : ''}`}
                        onClick={() => setExitSound(s.id)}
                      >
                        <div className="sound-radio" />
                        <span>{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ---- Save ---- */}
                <div className="actions-footer">
                  <button className="save-btn" onClick={handleSave} disabled={saving}>
                    <Save size={16} />
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
