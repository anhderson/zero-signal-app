import React, { useState } from 'react';
import { User, Volume2, MicOff, Music, X, Edit3, Shield, Ban, LogOut, ChevronRight } from 'lucide-react';
import './ParticipantActionPanel.css';
import type { VoiceParticipant } from '../store';
import { useAppStore } from '../store';

interface ParticipantActionPanelProps {
  participant: VoiceParticipant;
  isLocal: boolean;
  onClose: () => void;
}

const ParticipantActionPanel: React.FC<ParticipantActionPanelProps> = ({ 
  participant, 
  isLocal, 
  onClose
}) => {
  const { 
    setProfileSettings, setUserAlias, userAliases, activeProjectId, 
    projects, hasPermission, currentUser, assignRole, removeRole,
    userVolumes, setUserVolume
  } = useAppStore();
  const [isLocalMuted, setIsLocalMuted] = useState(false);
  const [showRoleAssigner, setShowRoleAssigner] = useState(false);

  const volume = userVolumes[participant.id] ?? 80;
  
  const handleVolumeChange = (newVal: number) => {
    setUserVolume(participant.id, newVal);
  };

  const project = projects.find(p => p.id === activeProjectId);
  const userRoleIds = project?.memberRoles?.[participant.id] || [];
  const userRoles = project?.roles?.filter(r => userRoleIds.includes(r.id)) || [];
  const allAvailableRoles = project?.roles || [];

  const handleOpenSettings = (tab: any) => {
    setProfileSettings(true, tab);
    onClose();
  };

  const handleChangeNickname = () => {
    const currentAlias = userAliases[participant.id] || participant.name;
    const newAlias = window.prompt(`Definir apelido local para ${participant.name}:`, currentAlias);
    if (newAlias !== null) {
      setUserAlias(participant.id, newAlias.trim());
    }
  };

  const displayName = userAliases[participant.id] || participant.name;

  return (
    <div className="action-panel-overlay" onClick={onClose}>
      <div className="action-panel animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="action-panel-header">
          <div className="header-info">
            <div className="panel-avatar-wrap">
               {participant.avatarPhoto ? (
                 <img src={participant.avatarPhoto} alt="" />
               ) : (
                 <span>{participant.name.substring(0, 2).toUpperCase()}</span>
               )}
            </div>
            <div className="panel-user-details">
              <h4>{displayName}</h4>
              <span className="user-id">{isLocal ? 'VOCÊ' : `ID: ${participant.id.substring(0, 8)}`}</span>
              {userAliases[participant.id] && <span className="original-name">Original: {participant.name}</span>}
            </div>
          </div>
          <button className="panel-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="action-panel-body">
          <div className="action-section">
            <label>SISTEMA</label>
            <div className="action-grid">
              {isLocal ? (
                <>
                  <button className="action-item" onClick={() => handleOpenSettings('profile')}>
                    <User size={18} />
                    <span>Editar Perfil</span>
                  </button>
                  <button className="action-item" onClick={() => handleOpenSettings('sounds')}>
                    <Music size={18} />
                    <span>Efeitos Sonoros</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className={`action-item ${isLocalMuted ? 'danger' : ''}`} 
                    onClick={() => setIsLocalMuted(!isLocalMuted)}
                  >
                    <MicOff size={18} />
                    <span>{isLocalMuted ? 'Desmutar' : 'Silenciar'}</span>
                  </button>
                  <button className="action-item" onClick={handleChangeNickname}>
                    <Edit3 size={18} />
                    <span>Alterar Apelido</span>
                  </button>
                  
                  {activeProjectId && currentUser && hasPermission(activeProjectId, currentUser.id, 'VOICE_MUTE') && (
                    <button className="action-item danger" onClick={() => alert('Usuário silenciado para todos os participantes.')}>
                      <Ban size={18} />
                      <span>Silenciar Global</span>
                    </button>
                  )}
                  
                  {activeProjectId && currentUser && hasPermission(activeProjectId, currentUser.id, 'VOICE_KICK') && (
                    <button className="action-item danger" onClick={() => alert('Usuário desconectado do canal de voz.')}>
                      <LogOut size={18} />
                      <span>Expulsar</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="action-section volume-section">
            <label>{isLocal ? 'VOLUME DE ENTRADA (MIC)' : 'VOLUME DO USUÁRIO'}</label>
            <div className="volume-slider-wrap">
              <Volume2 size={16} />
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={volume} 
                onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
              />
              <span className="volume-val">{volume}%</span>
            </div>
          </div>

          <div className="action-section">
            <div className="section-header">
              <label>CARGOS</label>
              {activeProjectId && currentUser && hasPermission(activeProjectId, currentUser.id, 'MANAGE_ROLES') && (
                <button className="manage-roles-btn" onClick={() => setShowRoleAssigner(!showRoleAssigner)}>
                  <Shield size={12} /> Gerenciar
                </button>
              )}
            </div>
            
            <div className="roles-list">
              {userRoles.length > 0 ? (
                userRoles.map(r => (
                  <span key={r.id} className="role-chip" style={{ borderLeftColor: r.color }}>
                    {r.name}
                  </span>
                ))
              ) : (
                <span className="no-roles">Nenhum cargo atribuído</span>
              )}
            </div>

            {showRoleAssigner && (
              <div className="role-assigner-dropdown glass-panel animate-fade-in">
                {allAvailableRoles.map(role => {
                  const isAssigned = userRoleIds.includes(role.id);
                  return (
                    <button 
                      key={role.id} 
                      className={`assign-role-item ${isAssigned ? 'assigned' : ''}`}
                      onClick={() => {
                        if (activeProjectId) {
                          if (isAssigned) removeRole(activeProjectId, participant.id, role.id);
                          else assignRole(activeProjectId, participant.id, role.id);
                        }
                      }}
                    >
                      <div className="role-indicator" style={{ backgroundColor: role.color }} />
                      <span>{role.name}</span>
                      {isAssigned ? <X size={12} /> : <ChevronRight size={12} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="action-panel-footer">
          <button className="footer-action-btn" onClick={onClose}>
            FECHAR PROTOCOLO
          </button>
        </div>
        
        <div className="panel-brackets">
          <div className="p-corner tl" />
          <div className="p-corner tr" />
          <div className="p-corner bl" />
          <div className="p-corner br" />
        </div>
      </div>
    </div>
  );
};

export default ParticipantActionPanel;
