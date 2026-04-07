import './ProjectSidebar.css';
import { Target, Plus } from 'lucide-react';
import { useAppStore } from '../store';

const ProjectSidebar = () => {
  const { projects, activeProjectId, setActiveProject, createProject } = useAppStore();

  const handleCreateProject = () => {
    const name = window.prompt("Qual o nome do novo projeto?");
    if (name && name.trim()) {
      createProject(name.trim());
    }
  };

  return (
    <nav className="project-sidebar">
      {/* Home/Fixed shortcut */}
      <div className={`project-item ${!activeProjectId ? 'active' : ''}`} onClick={() => setActiveProject('')}>
        <Target size={24} />
      </div>
      <div className="project-separator" />
      
      {/* Dynamic Projects */}
      {projects.map(p => (
        <div 
          key={p.id} 
          className={`project-item ${activeProjectId === p.id ? 'active' : ''}`}
          onClick={() => setActiveProject(p.id)}
          title={p.name}
        >
          <div className="project-icon">{p.iconStr}</div>
        </div>
      ))}

      {/* Create Button */}
      <div className="project-item action" onClick={handleCreateProject}>
        <Plus size={24} />
      </div>
    </nav>
  );
};

export default ProjectSidebar;
