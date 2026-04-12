import React, { useState } from 'react';
import './ProjectSidebar.css';

import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import CreateServerModal from './CreateServerModal';

const ProjectSidebar = () => {
  const navigate = useNavigate();
  const { projects, activeProjectId, setActiveProject } = useAppStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSelectProject = (id: string) => {
    setActiveProject(id);
    navigate('/chat');
  };

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  return (
    <nav className="project-sidebar">
      {/* Spacer to push everything to the bottom */}
      <div style={{ flexGrow: 1 }} />
      
      {/* Dynamic Projects */}
      {projects.map((p, index) => {
        // Prepare custom CSS style for the theme color if it exists
        const customStyle = p.themeColor ? { '--neon-cyan': p.themeColor } as React.CSSProperties : undefined;
        
        // Check if this is the first permanent project to show the separator
        const isFirstPermanent = p.isPermanent && (index === 0 || !projects[index - 1].isPermanent);

        return (
          <React.Fragment key={p.id}>
            {isFirstPermanent && (
              <div className="project-neon-separator">
                <div className="neon-line" />
              </div>
            )}
            <div 
              className={`project-item ${activeProjectId === p.id ? 'active' : ''}`}
              onClick={() => handleSelectProject(p.id)}
              title={p.name}
              style={activeProjectId === p.id ? customStyle : undefined}
            >
              <div className="project-icon">
                {p.iconUrl && (
                  <img src={p.iconUrl} alt={p.name} className="project-img" />
                )}
                <span className="project-initials">{p.iconStr || '??'}</span>
              </div>
            </div>
          </React.Fragment>
        );
      })}

      <div className="project-separator" />
      {/* Home/Fixed shortcut — NOW CREATES PROJECTS */}
      <div className={`project-item ${!activeProjectId ? 'active' : ''}`} onClick={handleCreateProject} title="Criar Fragmento do Todo">
        <img src="/favicon.png" alt="Z0" style={{ width: 24, height: 24, objectFit: 'contain' }} />
      </div>

      {showCreateModal && (
        <CreateServerModal 
          onClose={() => setShowCreateModal(false)} 
          onCreated={(id) => {
            setShowCreateModal(false);
            setActiveProject(id);
            navigate('/chat');
          }}
        />
      )}
    </nav>
  );
};

export default ProjectSidebar;
