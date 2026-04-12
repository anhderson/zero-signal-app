import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Hash, Volume2, Folder, Calendar, Plus, Settings, Video, LogOut, Palette, Wrench 
} from 'lucide-react';
import { useAppStore, getAchievementName } from '../store';
import type { UserStatus, VoiceParticipant } from '../store';
import ProfileSettings from './ProfileSettings';
import { SidebarWidgets } from './SidebarWidgets';
import ConfirmModal from './ConfirmModal';
import ParticipantActionPanel from './ParticipantActionPanel';
import './ProjectContextSidebar.css';

// ---- Channel icons ----
const channelIcon = (type: string) => {
  switch (type) {
    case 'text':    return <Hash    size={16} className="channel-icon" />;
    case 'voice':   return <Volume2 size={16} className="channel-icon" />;
    case 'video':   return <Video   size={16} className="channel-icon" />;
    case 'storage': return <Folder  size={16} className="channel-icon" />;
    case 'events':  return <Calendar size={16} className="channel-icon" />;
    default:        return <Hash    size={16} className="channel-icon" />;
  }
};

const channelRoute = (type: string) => {
  switch (type) {
    case 'voice':   case 'video': return '/voice';
    case 'storage': return '/storage';
    case 'events':  return '/events';
    default:        return '/chat';
  }
};

// ---- Category metadata ----
const categoryMeta: Record<string, { label: string; icon: React.ReactNode }> = {
  text:    { label: 'Vórtex de texto',  icon: <Hash    size={12} className="category-icon" /> },
  voice:   { label: 'Vórtex de Voz',   icon: <Volume2 size={12} className="category-icon" /> },
  storage: { label: 'Caixa de Pandora', icon: <Folder  size={12} className="category-icon" /> },
  events:  { label: 'Alinhamento',   icon: <Calendar size={12} className="category-icon" /> },
};

// ---- Speaking Avatar (shows photo or initials, ring only when speaking) ----
const SpeakingAvatar = ({ participant, isSpeaking }: { participant: VoiceParticipant; isSpeaking: boolean }) => (
  <div className="speaking-avatar-wrap">
    <div className="speaking-avatar" style={{ overflow: participant.avatarPhoto ? 'hidden' : undefined }}>
      {participant.avatarPhoto ? (
        <img
          src={participant.avatarPhoto}
          alt={participant.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
        />
      ) : (
        participant.avatarStr.substring(0, 2)
      )}
    </div>
    {/* Ring ONLY pulses when speaking */}
    <div className={`speaking-ring ${isSpeaking ? 'speaking' : ''}`} />
  </div>
);

// ---- Voice Channel Members (only real connected participants) ----
const VoiceMembersPreview = ({ channelId }: { channelId: string }) => {
  const voiceParticipants = useAppStore(s => s.voiceParticipants);
  const voiceSpeaking     = useAppStore(s => s.voiceSpeaking);
  const currentUser       = useAppStore(s => s.currentUser);
  const userAliases       = useAppStore(s => s.userAliases);
  const [selectedParticipant, setSelectedParticipant] = React.useState<VoiceParticipant | null>(null);

  const membersHere = voiceParticipants.filter(p => p.channelId === channelId);

  if (membersHere.length === 0) return null;

  return (
    <div className="voice-members-preview">
      {selectedParticipant && (
        <ParticipantActionPanel 
          participant={selectedParticipant}
          isLocal={selectedParticipant.id === currentUser?.id}
          onClose={() => setSelectedParticipant(null)}
        />
      )}
      {membersHere.map((member, index) => {
        const isSpeaking = voiceSpeaking.has(member.id);
        return (
          <div 
            key={member.id} 
            className="voice-member-row" 
            onClick={() => setSelectedParticipant(member)}
            style={{ cursor: 'pointer' }}
          >
            <SpeakingAvatar participant={member} isSpeaking={isSpeaking} />
            <span className="voice-member-name" style={{ color: isSpeaking ? '#ffffff' : undefined }}>
              {userAliases[member.id] || member.name}
              {member.featuredAchievements && member.featuredAchievements.length > 0 && (
                <div className="tiny-featured-medals" style={{ display: 'inline-flex', marginLeft: '6px' }}>
                  {member.featuredAchievements.map(id => (
                    <div key={id} className={`mini-medal-badge ${id}`} title={getAchievementName(id)}>
                      {id === 'creator' ? '☯' : (id.includes('m') || id.includes('a') ? id.toUpperCase() : '★')}
                    </div>
                  ))}
                </div>
              )}
            </span>
            {index === 0 && (
              <span className="voice-participants-badge">
                {membersHere.length} {membersHere.length === 1 ? 'ATIVO' : 'ATIVOS'}
              </span>
            )}
            {isSpeaking && (
              <span className="voice-speaking-label">● FALANDO</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ---- Channel Item ----
interface ChannelItemProps {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  onClick: () => void;
}

const ChannelItem = ({ id, name, type, isActive, onClick }: ChannelItemProps) => {
  const isVoice = type === 'voice' || type === 'video';

  return (
    <div style={{ marginBottom: '1px' }}>
      <div
        className={`channel-item type-${type} ${isActive ? 'active' : ''}`}
        onClick={onClick}
      >
        {channelIcon(type)}
        <span>{name}</span>
      </div>

      {/* Real-time members — only visible if someone is connected */}
      {isVoice && <VoiceMembersPreview channelId={id} />}
    </div>
  );
};

// ---- Channel Category ----
interface ChannelCategoryProps {
  type: string;
  channels: { id: string; name: string; type: string }[];
  activeChannelId: string | null;
  onChannelClick: (id: string, type: string) => void;
  onAdd: () => void;
}

const ChannelCategory = ({ type, channels, activeChannelId, onChannelClick, onAdd }: ChannelCategoryProps) => {
  const meta = categoryMeta[type] ?? { label: type.toUpperCase(), icon: null };

  return (
    <div className={`channel-category ${type}`}>
      <div className="category-header">
        <span className="category-header-left">
          {meta.icon}
          {meta.label}
        </span>
        {!['storage', 'events'].includes(type) && (
          <Plus size={14} className="add-icon" onClick={onAdd} />
        )}
      </div>
      {channels.map(c => (
        <ChannelItem
          key={c.id}
          id={c.id}
          name={c.name}
          type={c.type}
          isActive={activeChannelId === c.id}
          onClick={() => onChannelClick(c.id, c.type)}
        />
      ))}
      {type === 'events' && (
        <div className="sidebar-action-container">
           <button className="sidebar-action-pill gray-version" onClick={onAdd}>
             <Plus size={16} />
           </button>
        </div>
      )}
      {channels.length === 0 && type !== 'events' && (
        <div style={{ padding: '4px 12px', color: 'var(--text-muted)', fontSize: '11px', opacity: 0.5 }}>
          Nenhum canal
        </div>
      )}
    </div>
  );
};

// ---- Main Sidebar ----
import ServerSettingsModal from './ServerSettingsModal';
import CreateChannelModal from './CreateChannelModal';
const ProjectContextSidebar = () => {
  const navigate = useNavigate();
  const {
    projects, channels, activeProjectId, activeChannelId,
    setActiveChannel, joinVoice,
    showProfileSettings, setProfileSettings,
    subscribeToChannels
  } = useAppStore();

  const [showServerSettings, setShowServerSettings] = React.useState(false);
  const [contextDesign, setContextDesign] = React.useState(() => {
    const saved = localStorage.getItem('zs_context_design');
    return saved ? parseInt(saved, 10) : 4; // Default to 4 (Cyan)
  });
  const [showWidgets, setShowWidgets] = React.useState(() => {
    return localStorage.getItem('zs_show_widgets') !== 'false';
  });
  const [showCreateChannel, setShowCreateChannel] = React.useState(false);
  const [createChannelType, setCreateChannelType] = React.useState<'text' | 'voice' | 'storage' | 'events'>('text');

  // ---- Persist Widgets State ----
  React.useEffect(() => {
    localStorage.setItem('zs_show_widgets', showWidgets.toString());
  }, [showWidgets]);

  // ---- Persist Design ----
  React.useEffect(() => {
    localStorage.setItem('zs_context_design', contextDesign.toString());
  }, [contextDesign]);

  // ---- Realtime Vórtex ----
  React.useEffect(() => {
    if (activeProjectId) {
      const unsubscribe = subscribeToChannels(activeProjectId);
      return () => unsubscribe();
    }
  }, [activeProjectId, subscribeToChannels]);

  const activeProject  = projects.find(p => p.id === activeProjectId);
  const projectChannels = channels.filter(c => c.projectId === activeProjectId);

  const textChannels    = projectChannels.filter(c => c.type === 'text');
  const voiceChannels   = projectChannels.filter(c => c.type === 'voice');
  const storageChannels = projectChannels.filter(c => c.type === 'storage');
  const eventChannels   = projectChannels.filter(c => c.type === 'events');

  const activeVoiceChannelId = useAppStore(s => s.activeVoiceChannelId);
  const [pendingChannel, setPendingChannel] = React.useState<{ id: string, type: string } | null>(null);

  const handleChannelClick = (id: string, type: string) => {
    const isVoice = type === 'voice' || type === 'video';

    // If user is in a call and clicks a DIFFERENT voice channel, ask for confirmation
    if (activeVoiceChannelId && isVoice && id !== activeVoiceChannelId) {
      setPendingChannel({ id, type });
      return;
    }
    
    setActiveChannel(id);
    
    // Auto-join if clicking a voice channel and NOT currently in any call
    if (isVoice && !activeVoiceChannelId) {
      joinVoice(id);
    }

    navigate(channelRoute(type));
  };

  const handleAddEvent = () => {
    if (!activeProjectId) return;
    if (useAppStore.getState().canManageSincronicidade(activeProjectId)) {
       useAppStore.getState().setShowEventCreateModal(true);
       navigate('/events');
    } else {
       alert("Você não tem autorização para agendar sincronicidades neste servidor.");
    }
  };

  const confirmChannelSwitch = () => {
    if (pendingChannel) {
      setActiveChannel(pendingChannel.id);
      // Auto-join if switching between voice channels
      if (pendingChannel.type === 'voice' || pendingChannel.type === 'video') {
         joinVoice(pendingChannel.id);
      }
      navigate(channelRoute(pendingChannel.type));
      setPendingChannel(null);
    }
  };

  const handleAddChannel = (type: 'text' | 'voice' | 'storage' | 'events') => {
    if (!activeProjectId) return;
    setCreateChannelType(type);
    setShowCreateChannel(true);
  };

  return (
    <div className={`project-context-sidebar design-${contextDesign}`}>
      <ConfirmModal 
        isOpen={!!pendingChannel}
        title="Troca de Frequência"
        message="A conexão atual será encerrada para entrar neste canal. Confirmar mudança?"
        onConfirm={confirmChannelSwitch}
        onCancel={() => setPendingChannel(null)}
      />
      {/* ---- Header ---- */}
      <div className="sidebar-header">
        <span className="sidebar-project-name">{activeProject?.name ?? 'Projeto'}</span>
        
        <button 
          className="context-design-toggle" 
          onClick={() => setContextDesign((contextDesign + 1) % 9)}
          title="Trocar Design Visual dos Canais"
        >
          <Palette size={14} />
        </button>
      </div>

      {/* ---- Channel list ---- */}
      {activeProjectId ? (
        <>
          <div className="context-scroll-area">
          <ChannelCategory
            type="text"
            channels={textChannels}
            activeChannelId={activeChannelId}
            onChannelClick={handleChannelClick}
            onAdd={() => handleAddChannel('text')}
          />
          <ChannelCategory
            type="voice"
            channels={voiceChannels}
            activeChannelId={activeChannelId}
            onChannelClick={handleChannelClick}
            onAdd={() => handleAddChannel('voice')}
          />
          <ChannelCategory
            type="storage"
            channels={storageChannels}
            activeChannelId={activeChannelId}
            onChannelClick={handleChannelClick}
            onAdd={() => handleAddChannel('storage')}
          />
          <ChannelCategory
            type="events"
            channels={eventChannels}
            activeChannelId={activeChannelId}
            onChannelClick={handleChannelClick}
            onAdd={handleAddEvent}
          />
        </div>
        </>
      ) : (
        <div className="no-project-msg">Selecione um projeto</div>
      )}

      {/* Seção fixa no fundo para Widgets e Rodapés */}
      <div className="sidebar-fixed-footer">
        <div className="widgets-global-control">
          <button 
            className="widgets-toggle-btn" 
            onClick={() => setShowWidgets(!showWidgets)}
            title={showWidgets ? "Recolher Painéis" : "Expandir Painéis"}
          >
            {showWidgets ? <Plus size={10} style={{ transform: 'rotate(45deg)' }} /> : <Plus size={10} />}
          </button>
        </div>
        
        {activeProjectId && showWidgets && <SidebarWidgets />}
        
        {activeProject && (
          <div 
            className="server-footer" 
            onClick={() => setShowServerSettings(true)}
            title="Parâmetros do Servidor"
            style={activeProject.themeColor ? { '--neon-cyan': activeProject.themeColor } as React.CSSProperties : undefined}
          >
            <div className="server-info">
              <span className="server-fragment-label">Fragmento do Todo</span>
              <span className="server-name">{activeProject.name}</span>
              <div className="server-status">
                <span>Parâmetros</span>
                <Wrench size={14} className="server-status-icon" />
              </div>
            </div>
          </div>
        )}

        <UserFooter />
      </div>
      {showServerSettings && <ServerSettingsModal onClose={() => setShowServerSettings(false)} />}
      {showProfileSettings && <ProfileSettings onClose={() => setProfileSettings(false)} />}
      
      {showCreateChannel && activeProjectId && (
        <CreateChannelModal 
          projectId={activeProjectId}
          initialType={createChannelType}
          onClose={() => setShowCreateChannel(false)}
          onCreated={() => navigate(channelRoute(createChannelType))}
        />
      )}
    </div>
  );
};

// ---- User Footer ----
const UserFooter = () => {
  const { currentUser, setUserStatus, logout, setProfileSettings } = useAppStore();
  const [showStatusMenu, setShowStatusMenu] = React.useState(false);

  const avatarPhoto = currentUser?.bannerUrl || null;

  const statuses: { label: UserStatus; color: string }[] = [
    { label: 'Disponível', color: '#00cc44' },
    { label: 'Invisível', color: '#8e9297' },
    { label: 'Discreto', color: '#faff00' },
    { label: 'Focado', color: '#ff3131' },
    { label: 'Dormindo', color: '#7b00ff' }
  ];

  const currentStatus = currentUser?.status || 'Disponível';
  const currentStatusColor = statuses.find(s => s.label === currentStatus)?.color || '#00cc44';

  const handleStatusChange = async (s: UserStatus) => {
    await setUserStatus(s);
    setShowStatusMenu(false);
  };

  return (
    <div className="user-footer" style={{ position: 'relative' }}>
      <div
        className={`user-avatar decoration-${currentUser?.decorationId || 'none'}`}
        onClick={() => setProfileSettings(true)}
        style={{ cursor: 'pointer', overflow: 'hidden', padding: avatarPhoto ? 0 : undefined }}
        title="Perfil"
      >
        {avatarPhoto
          ? <img src={avatarPhoto} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          : (currentUser?.avatarStr ?? '??')
        }
      </div>
      <div className="user-info">
        <div className="user-name-row">
          <span className="user-name" onClick={() => setProfileSettings(true)} style={{ cursor: 'pointer' }}>
            {currentUser?.name ?? 'Usuário'}
            <span className="global-level-tag">LV.{currentUser?.level || 1}</span>
          </span>
          {currentUser?.featuredAchievements && currentUser.featuredAchievements.length > 0 && (
            <div className="tiny-featured-medals">
              {currentUser.featuredAchievements.map(id => (
                <div key={id} className={`mini-medal-badge ${id}`} title={getAchievementName(id)}>
                  {id === 'creator' ? '☯' : (id.includes('m') || id.includes('a') ? id.toUpperCase() : '★')}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="user-status-container">
          <div 
            className="status-dot-btn" 
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            style={{ backgroundColor: currentStatusColor }}
            title={`Status: ${currentStatus}`}
          />
          <div className="xp-progress-wrap" title={`${currentUser?.xp || 0} XP Total`}>
            <div 
              className="xp-progress-bar" 
              style={{ width: `${(currentUser?.xp || 0) % 1000 / 10}%` }} 
            />
          </div>
        </div>
      </div>

      {showStatusMenu && (
        <div className="status-popup">
          {statuses.map(s => (
            <div key={s.label} className="status-option" onClick={() => handleStatusChange(s.label)}>
              <div className="option-dot" style={{ backgroundColor: s.color }} />
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="user-actions">
        <button className="settings-btn" onClick={() => setProfileSettings(true)} title="Configurações">
          <Settings size={16} />
        </button>
        <button className="settings-btn" onClick={logout} title="Sair">
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
};

export default ProjectContextSidebar;
