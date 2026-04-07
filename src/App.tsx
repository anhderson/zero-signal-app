import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import ProjectLayout from './layouts/ProjectLayout';
import ChatView from './views/ChatView';
import StorageView from './views/StorageView';
import EventsView from './views/EventsView';
import VideoView from './views/VideoView';
import LoginView from './views/LoginView';
import './App.css';

function App() {
  const currentUser = useAppStore(state => state.currentUser);

  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<ProjectLayout />}>
          <Route index element={<Navigate to="/chat" replace />} />
          <Route path="chat" element={<ChatView />} />
          <Route path="voice" element={<VideoView />} />
          <Route path="storage" element={<StorageView />} />
          <Route path="events" element={<EventsView />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
