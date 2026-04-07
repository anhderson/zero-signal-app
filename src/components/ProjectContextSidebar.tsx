import { useNavigate } from 'react-router-dom';
import { Hash, Volume2, Folder, Calendar, ChevronDown, Plus } from 'lucide-react';
import { useAppStore } from '../store';
import './ProjectContextSidebar.css';

const channelIcon = (type: string) => {
  switch (type) {
    case 'text': return <Hash size={18} className="channel-icon" />;
    case 'voice': return <Volume2 size={18} className="channel-icon" />;
    case 'storage': return <Folder size={18} className="channel-icon" />;
    case 'events': return <Calendar size={18} className="channel-icon" />;
    default: return <Hash size={18} className="channel-icon" />;
  }
};

const channelRoute = (type: string) => {
  switch (type) {
    case 'text': return '/chat';
    case 'voice': return '/voice';
    case 'storage': return '/storage';
    case 'events': return '/events';
    default: return '/chat';
  }
};

const ProjectContextSidebar = () => {
  const navigate = useNavigate();
  const { projects, channels, activeProjectId, activeChannelId, createChannel, setActiveChannel } = useAppStore();

  const activeProject = projects.find(p => p.id === activeProjectId);
  const projectChannels = channels.filter(c => c.projectId === activeProjectId);

  const textChannels = projectChannels.filter(c => c.type === 'text');
  const voiceChannels = projectChannels.filter(c => c.type === 'voice');
  const storageChannels = projectChannels.filter(c => c.type === 'storage');
  const eventChannels = projectChannels.filter(c => c.type === 'events');

  const handleChannelClick = (id: string, type: string) => {
    setActiveChannel(id);
    navigate(channelRoute(type));
  };

  const handleAddChannel = (type: 'text' | 'voice' | 'storage' | 'events') => {
    if (!activeProjectId) return;
    const label = type === 'text' ? 'texto' : type === 'voice' ? 'voz' : type === 'storage' ? 'armazenamento' : 'evento';
    const name = window.prompt(`Nome do novo canal de ${label}:`);
    if (name && name.trim()) {
      createChannel(activeProjectId, name.trim(), type);
    }
  };

  return (
    <div className="context-sidebar">
      <div className="context-header glass-panel">
        <h2 className="project-title">{activeProject?.name ?? 'Selecione um projeto'}</h2>
        <ChevronDown size={18} />
      </div>

      <div className="context-scroll-area">
        {/* Text Channels */}
        <div className="channel-category">
          <div className="category-header">
            <span>Canais de Texto</span>
            <Plus size={16} className="add-icon" onClick={() => handleAddChannel('text')} />
          </div>
          {textChannels.map(c => (
            <div
              key={c.id}
              className={`channel-item ${activeChannelId === c.id ? 'active' : ''}`}
              onClick={() => handleChannelClick(c.id, c.type)}
            >
              {channelIcon(c.type)}
              <span>{c.name}</span>
            </div>
          ))}
        </div>

        {/* Voice Channels */}
        <div className="channel-category">
          <div className="category-header">
            <span>Canais de Voz e Vídeo</span>
            <Plus size={16} className="add-icon" onClick={() => handleAddChannel('voice')} />
          </div>
          {voiceChannels.map(c => (
            <div
              key={c.id}
              className={`channel-item ${activeChannelId === c.id ? 'active' : ''}`}
              onClick={() => handleChannelClick(c.id, c.type)}
            >
              {channelIcon(c.type)}
              <span>{c.name}</span>
            </div>
          ))}
        </div>

        {/* Storage */}
        <div className="channel-category">
          <div className="category-header">
            <span>Armazenamento</span>
            <Plus size={16} className="add-icon" onClick={() => handleAddChannel('storage')} />
          </div>
          {storageChannels.map(c => (
            <div
              key={c.id}
              className={`channel-item ${activeChannelId === c.id ? 'active' : ''}`}
              onClick={() => handleChannelClick(c.id, c.type)}
            >
              {channelIcon(c.type)}
              <span>{c.name}</span>
            </div>
          ))}
        </div>

        {/* Events */}
        <div className="channel-category">
          <div className="category-header">
            <span>Comunidade</span>
            <Plus size={16} className="add-icon" onClick={() => handleAddChannel('events')} />
          </div>
          {eventChannels.map(c => (
            <div
              key={c.id}
              className={`channel-item ${activeChannelId === c.id ? 'active' : ''}`}
              onClick={() => handleChannelClick(c.id, c.type)}
            >
              {channelIcon(c.type)}
              <span>{c.name}</span>
            </div>
          ))}
        </div>

        {/* Bottom profile area */}
      </div>

      <UserFooter />
    </div>
  );
};

const UserFooter = () => {
  const { currentUser, logout } = useAppStore();
  return (
    <div className="user-footer">
      <div className="user-avatar">{currentUser?.avatarStr ?? '??'}</div>
      <div className="user-info">
        <span className="user-name">{currentUser?.name ?? 'Usuário'}</span>
        <span className="user-status">Online</span>
      </div>
      <button className="logout-btn" onClick={logout} title="Sair">✕</button>
    </div>
  );
};

export default ProjectContextSidebar;
