import { Volume2, Video, VideoOff, Mic, MicOff, MonitorUp, PhoneOff, PhoneCall, Gamepad2, Monitor, Layout, X, Activity, Music } from 'lucide-react';
import TopBar from '../components/TopBar';
import ActivitiesOverlay from '../components/games/ActivitiesOverlay';
import { useAppStore } from '../store';
import { useVoiceActivity } from '../hooks/useVoiceActivity';
import { useWebRTC } from '../hooks/useWebRTC';
import ParticipantActionPanel from '../components/ParticipantActionPanel';
import RemoteAudio from '../components/RemoteAudio';
import RemoteVideo from '../components/RemoteVideo';
import './VideoView.css';

import { useState, useRef, useEffect } from 'react';

const VideoView = () => {
  const {
    currentUser,
    activeChannelId,
    channels,
    voiceParticipants,
    voiceSpeaking,
    joinVoice,
    leaveVoice,
    toggleMuteSelf,
    logEvent,
    incrementStat,
    activeProjectId,
    setProfileSettings,
    addXP,
    userAliases,
    activeVoiceChannelId,
    userVolumes,
    setStreaming,
    setVideoOn
  } = useAppStore();

  const [selectedParticipant, setSelectedParticipant] = useState<any | null>(null);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);

  const { remoteStreams } = useWebRTC(activeVoiceChannelId, screenStream || webcamStream);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [showActivities, setShowActivities] = useState(false);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [availableSources, setAvailableSources] = useState<any[]>([]);
  const [streamingQuality, setStreamingQuality] = useState<'sd' | 'hd' | 'fullhd'>('hd');

  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const vids = devices.filter(d => d.kind === 'videoinput');
        setCameras(vids);
        if (vids.length > 0 && !selectedCameraId) {
          setSelectedCameraId(vids[0].deviceId);
        }
      } catch (err) {}
    };
    getDevices();
  }, [selectedCameraId]);

  useEffect(() => {
    if (localVideoRef.current && webcamStream) {
      localVideoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream]);

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const localUser     = voiceParticipants.find(p => p.isLocal);
  const isConnected   = !!localUser;
  const isMuted       = localUser?.isMuted ?? false;

  useVoiceActivity(currentUser?.id ?? '', isConnected, isMuted);

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  useEffect(() => {
    if (!isConnected) {
      if (screenStream) {
        screenStream.getTracks().forEach(t => t.stop());
        setScreenStream(null);
      }
      if (webcamStream) {
        webcamStream.getTracks().forEach(t => t.stop());
        setWebcamStream(null);
      }
      setIsVideoOff(true);
    }
  }, [isConnected, screenStream, webcamStream]);

  const toggleCamera = async () => {
    if (!isVideoOff && webcamStream) {
      webcamStream.getTracks().forEach(t => t.stop());
      setWebcamStream(null);
      setIsVideoOff(true);
      setVideoOn(false);
      if (activeProjectId) logEvent(activeProjectId, 'Vídeo: Desligado', 'Câmera foi desativada pelo usuário.');
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: selectedCameraId ? { deviceId: { exact: selectedCameraId } } : true,
          audio: false
        });
        setWebcamStream(stream);
        setIsVideoOff(false);
        setVideoOn(true);
        incrementStat('videoCount');
        if (currentUser) addXP(currentUser.id, 100);
        if (activeProjectId) logEvent(activeProjectId, 'Vídeo: Ligado', 'Câmera foi ativada pelo usuário.');

        const devices = await navigator.mediaDevices.enumerateDevices();
        const vids = devices.filter(d => d.kind === 'videoinput');
        setCameras(vids);
      } catch (err) {
        console.error("Camera error:", err);
        alert("Não foi possível acessar a câmera.");
      }
    }
  };

  const handleCameraChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedCameraId(newId);
    if (!isVideoOff) {
      if (webcamStream) {
        webcamStream.getTracks().forEach(t => t.stop());
      }
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: newId } },
            audio: false
        });
        setWebcamStream(newStream);
      } catch (err) {
        console.error("Erro ao trocar câmera", err);
      }
    }
  };

  const startScreenShare = async (sourceId: string) => {
    try {
      const constraints = {
        sd: { width: 854, height: 480, frameRate: 15 },
        hd: { width: 1280, height: 720, frameRate: 30 },
        fullhd: { width: 1920, height: 1080, frameRate: 60 }
      };
      
      const q = constraints[streamingQuality];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId,
            minWidth: q.width,
            maxWidth: q.width,
            minHeight: q.height,
            maxHeight: q.height,
            minFrameRate: q.frameRate,
            maxFrameRate: q.frameRate
          }
        } as any
      });
      
      setScreenStream(stream);
      setStreaming(true);
      setShowSourcePicker(false);
      if (activeProjectId) logEvent(activeProjectId, 'Transmissão: Iniciada', `Usuário iniciou compartilhamento em ${streamingQuality.toUpperCase()}`);

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          setScreenStream(null);
          setStreaming(false);
          if (activeProjectId) logEvent(activeProjectId, 'Transmissão: Parada', 'O compartilhamento de tela foi encerrado.');
        };
      }
    } catch (err: any) {
      console.error("Erro ao iniciar transmissão:", err);
      alert("Não foi possível iniciar a transmissão. Verifique as permissões do sistema.");
    }
  };

  const handleShareScreen = async () => {
    if (screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
      setScreenStream(null);
      setStreaming(false);
      if (activeProjectId) logEvent(activeProjectId, 'Transmissão: Parada', 'O usuário parou de compartilhar a tela.');
      return;
    }
    
    // Check if we are in Electron and fetch sources
    const isElectron = !!(window as any).electronAPI;
    if (isElectron) {
      try {
        const sources = await (window as any).electronAPI.getScreenSources();
        setAvailableSources(sources);
        setShowSourcePicker(true);
      } catch (err) {
        console.error("Erro ao buscar fontes:", err);
      }
    } else {
      // Basic web fallback
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        setScreenStream(stream);
      } catch (err) {}
    }
  };

  const streamingParticipants = voiceParticipants.filter(p => !p.isLocal && p.isStreaming);

  const totalTiles = voiceParticipants.length + (screenStream ? 1 : 0) + streamingParticipants.length;
  const gridClass  = totalTiles === 0 ? '' : totalTiles === 1 ? 'grid-1' : totalTiles === 2 ? 'grid-2' : totalTiles <= 4 ? 'grid-4' : 'grid-many';

  const handleJoin = () => {
    if (activeChannelId) joinVoice(activeChannelId);
  };

  return (
    <div className="view-container">
      <TopBar
        title={activeChannel?.name ?? 'Lounge'}
        icon={<Volume2 size={20} className="topbar-icon" />}
      />

      <div className="video-content">
        {totalTiles === 0 && (
          <div className="empty-voice-state">
            <Volume2 size={42} style={{ opacity: 0.15, marginBottom: 10 }} />
            <p style={{ fontSize: '16px' }}>Nenhum participante</p>
            <span style={{ fontSize: '13px' }}>Entre na chamada para começar</span>
          </div>
        )}

        {totalTiles > 0 && (
          <div className={`video-grid ${gridClass}`}>
            {screenStream && (
               <div className="video-tile screen-share-tile local-stream" style={{ padding: 0, backgroundColor: '#000' }}>
                  <video
                     ref={screenVideoRef}
                     autoPlay
                     playsInline
                     muted
                     style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                  <div className="video-overlay">
                     <span className="video-user-name">Minha Tela</span>
                  </div>
               </div>
            )}

            {/* Remote Screen Shares */}
            {streamingParticipants.map(participant => (
              <div key={`stream-${participant.id}`} className="video-tile screen-share-tile remote-stream" style={{ padding: 0, backgroundColor: '#000' }}>
                <RemoteVideo stream={remoteStreams[participant.id]} />
                <div className="video-overlay">
                  <span className="video-user-name">{userAliases[participant.id] || participant.name} - Transmitindo</span>
                  <span className="live-badge">AO VIVO</span>
                </div>
              </div>
            ))}

            {voiceParticipants.map(user => {
              const isSpeaking = voiceSpeaking.has(user.id);
              const avatarColor = user.isLocal ? 'var(--neon-cyan)' : 'var(--neon-magenta)';

              return (
                <div
                  key={user.id}
                  className={`video-tile ${isSpeaking ? 'speaking' : ''}`}
                  onClick={() => setSelectedParticipant(user)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`tile-speaking-ring ${isSpeaking ? 'active' : ''}`} />

                  <div className="video-off-state" style={{ padding: (user.isLocal && webcamStream && !isVideoOff) ? 0 : undefined }}>
                    {user.isLocal && webcamStream && !isVideoOff ? (
                       <video 
                         ref={localVideoRef}
                         autoPlay
                         playsInline
                         muted 
                         style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                       />
                    ) : (!user.isLocal && user.isVideoOn && remoteStreams[user.id]) ? (
                        <RemoteVideo stream={remoteStreams[user.id]} isAvatarCover />
                    ) : (
                      <div
                        className={`video-avatar ${isSpeaking ? 'speaking' : ''}`}
                        style={{ '--avatar-color': avatarColor } as React.CSSProperties}
                      >
                        {user.avatarPhoto ? (
                          <img
                            src={user.avatarPhoto}
                            alt={user.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                          />
                        ) : (
                          user.avatarStr
                        )}
                      </div>
                    )}
                    
                    {user.isLocal && isVideoOff && (
                      <span className="video-off-label">Câmera desligada</span>
                    )}
                  </div>

                  <div className="video-overlay">
                    <span className="video-user-name">
                      {userAliases[user.id] || user.name}
                    </span>
                    {isSpeaking && <span className="speaking-badge">● falando</span>}
                  </div>

                  <div className={`mic-status ${!user.isMuted ? 'active' : ''}`}>
                    {user.isMuted ? <MicOff size={14} /> : <Mic size={14} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isConnected ? (
          <div className="video-controls glass-panel">
            <div className="control-group-flex" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div
                className={`control-btn ${isVideoOff ? 'muted' : ''}`}
                onClick={toggleCamera}
                title={isVideoOff ? 'Ligar câmera' : 'Desligar câmera'}
              >
                {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                <span className="control-label">Câmera</span>
              </div>
            {!isVideoOff && (
              <select 
                 className="camera-selector" 
                 value={selectedCameraId}
                 onChange={handleCameraChange}
                 title="Escolher Dispositivo de Vídeo"
              >
                {cameras.length === 0 && <option value="">Sem câmeras</option>}
                {cameras.map((cam, i) => (
                  <option key={cam.deviceId} value={cam.deviceId}>
                    {cam.label || `Câmera ${i + 1}`}
                  </option>
                ))}
              </select>
            )}
            </div>

            <div 
              className={`control-btn ${screenStream ? 'active screen-active' : 'screen'}`} 
              onClick={handleShareScreen}
              title={screenStream ? 'Parar de compartilhar' : 'Compartilhar tela'}
            >
              <MonitorUp size={20} />
              <span className="control-label">Tela</span>
            </div>

            <div 
              className={`control-btn ${showActivities ? 'active' : ''}`} 
              onClick={() => setShowActivities(true)}
              title="Atividades e Jogos"
            >
              <Gamepad2 size={20} />
              <span className="control-label">Jogos</span>
            </div>

            <div
              className={`control-btn ${isMuted ? 'muted' : ''}`}
              onClick={toggleMuteSelf}
              title={isMuted ? 'Ativar microfone' : 'Silenciar'}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              <span className="control-label">Mic</span>
            </div>

            <div className="control-btn" onClick={() => setProfileSettings(true, 'profile')} title="Escolher Status">
              <Activity size={20} />
              <span className="control-label">Status</span>
            </div>

            <div className="control-btn" onClick={() => setProfileSettings(true, 'sounds')} title="Efeitos Sonoros">
              <Music size={20} />
              <span className="control-label">Sons</span>
            </div>

            <div className="control-btn decline" onClick={leaveVoice} title="Sair da chamada">
              <PhoneOff size={20} />
              <span className="control-label">Sair</span>
            </div>
          </div>
        ) : (
          <div className="video-controls glass-panel" style={{ justifyContent: 'center' }}>
            <button className="join-call-btn" onClick={handleJoin}>
              <PhoneCall size={18} />
              Entrar no {activeChannel?.name ?? 'Lounge'}
            </button>
          </div>
        )}
      </div>

      {selectedParticipant && (
        <ParticipantActionPanel 
          participant={selectedParticipant}
          isLocal={selectedParticipant.id === currentUser?.id}
          onClose={() => setSelectedParticipant(null)}
        />
      )}

      {showActivities && <ActivitiesOverlay onClose={() => setShowActivities(false)} />}
      
      {/* Remote Audio Streams */}
      {Object.entries(remoteStreams).map(([userId, stream]) => (
        <RemoteAudio 
          key={userId} 
          stream={stream} 
          volume={userVolumes[userId] ?? 80} 
        />
      ))}

      {showSourcePicker && (
        <div className="source-picker-overlay">
          <div className="source-picker-modal">
            <div className="source-picker-header">
              <h3>Compartilhar Tela</h3>
              <button className="close-btn" onClick={() => setShowSourcePicker(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="quality-selector">
              <span>Qualidade:</span>
              <button 
                className={streamingQuality === 'sd' ? 'active' : ''} 
                data-q="sd"
                onClick={() => setStreamingQuality('sd')}
              >
                480p (SD)
              </button>
              <button 
                className={streamingQuality === 'hd' ? 'active' : ''} 
                data-q="hd"
                onClick={() => setStreamingQuality('hd')}
              >
                720p (HD)
              </button>
              <button 
                className={streamingQuality === 'fullhd' ? 'active' : ''} 
                data-q="fullhd"
                onClick={() => setStreamingQuality('fullhd')}
              >
                1080p (60fps)
              </button>
            </div>

            <div className="sources-container">
              <div className="source-section">
                <h4><Monitor size={16} /> Selecione o Monitor (Tela Cheia)</h4>
                <div className="sources-list">
                  {availableSources.filter(s => s.id.startsWith('screen:')).length > 0 ? (
                    availableSources.filter(s => s.id.startsWith('screen:')).map(source => (
                      <div key={source.id} className="source-item monitor" onClick={() => startScreenShare(source.id)}>
                        <Monitor size={22} className="source-icon neon-cyan" />
                        <div className="source-details">
                          <span className="source-name">{source.name}</span>
                          <span className="source-type">Transmissão completa</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="source-empty">Nenhum monitor detectado</div>
                  )}
                </div>
              </div>

              <div className="source-section">
                <h4><Layout size={16} /> Programas Abertos</h4>
                <div className="sources-list">
                  {availableSources.filter(s => !s.id.startsWith('screen:')).map(source => (
                    <div key={source.id} className="source-item" onClick={() => startScreenShare(source.id)}>
                      {source.appIcon ? (
                        <img src={source.appIcon} className="source-app-icon" />
                      ) : (
                        <Layout size={18} className="source-icon" />
                      )}
                      <span className="source-name">{source.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoView;
