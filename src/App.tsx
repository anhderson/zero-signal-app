import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore, BOT_GUST_ID } from './store'
import ProjectLayout from './layouts/ProjectLayout'
import LoginView from './views/LoginView'
import ChatView from './views/ChatView'
import VoiceView from './views/VideoView'
import StorageView from './views/StorageView'
import EventsView from './views/EventsView'
import { Loader2 } from 'lucide-react'
import PermissionsModal from './components/PermissionsModal'
import IntegrityProtocolModal from './components/IntegrityProtocolModal'
import { GustWelcomeModal } from './components/GustWelcomeModal'
import AchievementModal from './components/AchievementModal'
import UpdateModule from './components/UpdateModule'
import ChangelogModal from './components/ChangelogModal'
import './App.css'

// Auth Guard Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const currentUser = useAppStore(state => state.currentUser)
  const initialized = useAppStore(state => state.initialized)
  
  if (!initialized) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e1f22' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="spin-icon" size={48} style={{ color: 'var(--neon-cyan)' }} />
          <p style={{ color: '#949ba4', marginTop: '16px', fontFamily: 'Inter, sans-serif' }}>Inicializando Matriz...</p>
        </div>
      </div>
    )
  }
  
  return currentUser ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  const checkAuth = useAppStore(state => state.checkAuth)
  const initialized = useAppStore(state => state.initialized)
  const currentUser = useAppStore(state => state.currentUser)
  const globalDesign = useAppStore(state => state.globalDesign)
  const isSecurityCritical = useAppStore(state => state.isSecurityCritical);
  const setSecurityCritical = useAppStore(state => state.setSecurityCritical);
  const activeChannelId = useAppStore(state => state.activeChannelId);
  const addMessage = useAppStore(state => state.addMessage);

  const [timedOut, setTimedOut] = useState(false)
  const [showPermissions, setShowPermissions] = useState(() => {
    return localStorage.getItem('zs_first_run_complete') !== 'true'
  })

  useEffect(() => {
    checkAuth()
    
    // Safety timeout to prevent infinite black screen if auth check hangs
    const timer = setTimeout(() => {
      if (!initialized) {
        setTimedOut(true)
      }
    }, 15000)

    return () => clearTimeout(timer)
  }, [checkAuth, initialized])

  // ---- GUST SECURITY MONITOR ----
  useEffect(() => {
    const handleCapture = (e: KeyboardEvent) => {
      // PrintScreen or Meta+Shift+S (common Windows/Mac screenshot)
      const isScreenshot = e.key === 'PrintScreen' || (e.key === 'S' && e.shiftKey && (e.metaKey || e.ctrlKey));
      const isRecording = (e.key === 'r' || e.key === 'R') && (e.altKey && (e.metaKey || e.ctrlKey));

      if (isScreenshot || isRecording) {
        setSecurityCritical(true);
        
        if (activeChannelId && currentUser) {
          addMessage({
            channelId: activeChannelId,
            text: `[ALERTA CRÍTICO: GUST] Violação de segurança detectada: Tentativa de ${isScreenshot ? 'Captura de Tela' : 'Gravação'} por @${currentUser.name}. Sessão interrompida.`,
            userId: BOT_GUST_ID,
            username: "Gust",
            avatarStr: "GS"
          });
        }
      }
    };

    window.addEventListener('keydown', handleCapture);
    return () => window.removeEventListener('keydown', handleCapture);
  }, [setSecurityCritical, activeChannelId, addMessage, currentUser]);

  // ---- GLOBAL EVENT ALARM MONITOR ----
  useEffect(() => {
    if (!currentUser) return;

    const notifiedEvents = new Set<string>();

    const checkEvents = () => {
      const { globalEvents, eventRSVPs, loadGlobalEvents, loadRSVPs } = useAppStore.getState();
      
      // Ensure data is loaded
      if (globalEvents.length === 0) loadGlobalEvents();
      if (Object.keys(eventRSVPs).length === 0) loadRSVPs();

      const now = new Date();
      const nowStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().substring(0, 5); //HH:MM

      globalEvents.forEach(event => {
        const participants = eventRSVPs[event.id] || [];
        if (participants.includes(currentUser.id) && !notifiedEvents.has(event.id)) {
          // Compare date and time
          if (event.eventDate === nowStr && event.startTime === timeStr) {
            // ALARM TRIGGER
            notifiedEvents.add(event.id);
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/991/991-preview.mp3'); // Alarm sfx
            audio.play().catch(e => console.error("Alarm audio play failed:", e));
            
            // Visual feedback
            alert(`[SINCRONICIDADE] O evento "${event.title}" está iniciando agora!`);
          }
        }
      });
    };

    const interval = setInterval(checkEvents, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [currentUser]);

  if (!initialized && !timedOut) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e1f22' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="spin-icon" size={48} style={{ color: 'var(--neon-cyan)' }} />
          <p style={{ color: '#949ba4', marginTop: '16px', fontFamily: 'Inter, sans-serif' }}>Acessando Frequência...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`global-design-${globalDesign}`} style={{ display: 'contents' }}>
      {showPermissions && <PermissionsModal onComplete={() => setShowPermissions(false)} />}
      <IntegrityProtocolModal />
      <GustWelcomeModal />
      <AchievementModal />
      <UpdateModule />
      <ChangelogModal />
      
      {/* GUST LOCKDOWN OVERLAY */}
      {isSecurityCritical && (
        <div className="gust-lockdown-red-alert">
          <div className="gust-alert-inner">
            <div className="gust-header">GUST [SECURITY] — VIOLAÇÃO DETECTADA</div>
            <div className="gust-content">
              <h1>TERMINAL BLOQUEADO</h1>
              <p>O BOT <strong>Gust</strong> impediu sua intenção de quebrar as regras de segurança.</p>
              <div className="gust-reason">FONTE: Detector de Captura de Tela / Gravação Externa</div>
              <button 
                className="gust-reset-btn"
                onClick={() => setSecurityCritical(false)}
              >
                AUTENTICAR E REINICIAR SESSÃO
              </button>
            </div>
          </div>
        </div>
      )}

      <HashRouter>
        <Routes>
          <Route path="/login" element={currentUser ? <Navigate to="/" /> : <LoginView />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <ProjectLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/chat" />} />
            <Route path="chat" element={<ChatView />} />
            <Route path="voice" element={<VoiceView />} />
            <Route path="storage" element={<StorageView />} />
            <Route path="events" element={<EventsView />} />
          </Route>
        </Routes>
      </HashRouter>
    </div>
  )
}

export default App
