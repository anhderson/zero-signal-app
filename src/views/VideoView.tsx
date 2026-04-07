import { useState } from 'react';
import TopBar from '../components/TopBar';
import { Volume2, Video, VideoOff, Mic, MicOff, MonitorUp, PhoneOff } from 'lucide-react';
import './VideoView.css';

interface VideoUser {
  id: string;
  name: string;
  avatarStr: string;
  isMuted: boolean;
  isVideoOff: boolean;
  color?: string;
  isLocal?: boolean;
}

const initialUsers: VideoUser[] = [
  { id: '1', name: 'Zero Signal Dev', avatarStr: 'ZS', isMuted: false, isVideoOff: false },
  { id: '2', name: 'User', avatarStr: 'US', color: 'var(--accent-success)', isMuted: true, isVideoOff: true, isLocal: true }
];

const VideoView = () => {
  const [users, setUsers] = useState<VideoUser[]>(initialUsers);
  
  // Local user state derived or managed
  const localUser = users.find(u => u.isLocal);
  const isConnected = !!localUser;

  const toggleMic = () => {
    setUsers(prev => prev.map(u => u.isLocal ? { ...u, isMuted: !u.isMuted } : u));
  };

  const toggleVideo = () => {
    setUsers(prev => prev.map(u => u.isLocal ? { ...u, isVideoOff: !u.isVideoOff } : u));
  };

  const leaveCall = () => {
    setUsers(prev => prev.filter(u => !u.isLocal));
  };

  const joinCall = () => {
    const newUser: VideoUser = {
      id: '2',
      name: 'User',
      avatarStr: 'US',
      color: 'var(--accent-success)',
      isMuted: false,
      isVideoOff: false,
      isLocal: true
    };
    setUsers(prev => [...prev, newUser]);
  }

  return (
    <div className="view-container">
      <TopBar title="Lounge Voice" icon={<Volume2 size={24} className="topbar-icon" />} />
      
      <div className="video-content">
        <div className="video-grid">
          {users.map(user => (
            <div key={user.id} className="video-tile">
              {!user.isVideoOff ? (
                // Simulando video ativo - para o mockup mostraremos a cor de fundo pulsando ou vazia
                <div className="video-active-simulation" style={{ width: '100%', height: '100%', backgroundColor: '#202225' }}>
                   <div className="video-avatar" style={{backgroundColor: user.color || 'var(--accent-primary)', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.8}}>
                     {user.avatarStr}
                   </div>
                </div>
              ) : (
                <div className="video-avatar" style={{backgroundColor: user.color || 'var(--accent-primary)'}}>{user.avatarStr}</div>
              )}
              
              <div className="video-overlay">
                <span className="user-name">{user.name}</span>
              </div>
              <div className={`mic-status ${!user.isMuted ? 'active' : ''}`}>
                {user.isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </div>
            </div>
          ))}
          
          {users.length === 0 && (
            <div style={{ color: 'var(--text-muted)' }}>O canal está vazio.</div>
          )}
        </div>

        {isConnected ? (
          <div className="video-controls glass-panel">
            <div className={`control-btn ${localUser?.isVideoOff ? 'muted' : ''}`} onClick={toggleVideo}>
              {localUser?.isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
            </div>
            <div className="control-btn screen">
              <MonitorUp size={24} />
            </div>
            <div className={`control-btn ${localUser?.isMuted ? 'muted' : ''}`} onClick={toggleMic}>
              {localUser?.isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </div>
            <div className="control-btn decline" onClick={leaveCall}>
              <PhoneOff size={24} />
            </div>
          </div>
        ) : (
          <div className="video-controls glass-panel" style={{ justifyContent: 'center' }}>
            <button 
              onClick={joinCall}
              style={{ backgroundColor: 'var(--accent-success)', color: 'white', padding: '12px 24px', borderRadius: '24px', fontWeight: 'bold' }}
            >
              Entrar no Lounge
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoView;
