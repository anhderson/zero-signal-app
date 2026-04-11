import { Outlet } from 'react-router-dom';
import ProjectSidebar from '../components/ProjectSidebar';
import ProjectContextSidebar from '../components/ProjectContextSidebar';
import MembersSidebar from '../components/MembersSidebar';
import { ServerLogModal } from '../components/ServerLogModal';
import { useAppStore } from '../store';
import './ProjectLayout.css';

import { useEffect } from 'react';

const ProjectLayout = () => {
  const { 
    showServerLogs, 
    setShowServerLogs, 
    pushToTalk, 
    pushToTalkKey, 
    setPTTPressed 
  } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!pushToTalk) return;
      if (e.key === pushToTalkKey) {
        setPTTPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!pushToTalk) return;
      if (e.key === pushToTalkKey) {
        setPTTPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pushToTalk, pushToTalkKey, setPTTPressed]);

  return (
    <div className="project-layout">
      {/* Aesthetic Decorations */}
      <div className="window-decoration scanline" />
      <div className="window-decoration corner-tl" />
      <div className="window-decoration corner-tr" />
      <div className="window-decoration corner-bl" />
      <div className="window-decoration corner-br" />
      <div className="app-border-glow" />

      <ProjectSidebar />
      <ProjectContextSidebar />
      <div className="main-content">
        <Outlet />
      </div>
      <MembersSidebar />

      {showServerLogs && (
        <ServerLogModal onClose={() => setShowServerLogs(false)} />
      )}
    </div>
  );
};

export default ProjectLayout;
