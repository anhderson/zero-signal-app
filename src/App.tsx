import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store'
import ProjectLayout from './layouts/ProjectLayout'
import LoginView from './views/LoginView'
import ChatView from './views/ChatView'
import VoiceView from './views/VideoView' // Note: using VideoView because it contains the voice UI
import StorageView from './views/StorageView'
import EventsView from './views/EventsView'
import { Loader2 } from 'lucide-react'

// Auth Guard Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const currentUser = useAppStore(state => state.currentUser)
  const initialized = useAppStore(state => state.initialized)
  
  if (!initialized) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e1f22' }}>
        <Loader2 className="spin-icon" size={48} color="#5865f2" />
      </div>
    )
  }
  
  return currentUser ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  const checkAuth = useAppStore(state => state.checkAuth)
  const initialized = useAppStore(state => state.initialized)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (!initialized) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e1f22' }}>
        <Loader2 className="spin-icon" size={48} color="#5865f2" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginView />} />
        
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
    </BrowserRouter>
  )
}

export default App
