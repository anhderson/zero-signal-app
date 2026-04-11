import React, { useState } from 'react';
import './ProjectSidebar.css';
import { Target } from 'lucide-react';
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
      {/* Home/Fixed shortcut — NOW CREATES PROJECTS */}
      <div className={`project-item ${!activeProjectId ? 'active' : ''}`} onClick={handleCreateProject} title="Criar Fragmento do Todo">
        <Target size={24} />
      </div>
      <div className="project-separator" />
      
      {/* Dynamic Projects */}
      {projects.map(p => {
        // Prepare custom CSS style for the theme color if it exists
        const customStyle = p.themeColor ? { '--neon-cyan': p.themeColor } as React.CSSProperties : undefined;
        
        return (
          <div 
            key={p.id} 
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
        );
      })}

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
