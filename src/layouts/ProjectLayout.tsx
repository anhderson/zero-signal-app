import { Outlet } from 'react-router-dom';
import ProjectSidebar from '../components/ProjectSidebar';
import ProjectContextSidebar from '../components/ProjectContextSidebar';
import MembersSidebar from '../components/MembersSidebar';
import './ProjectLayout.css';

const ProjectLayout = () => {
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
    </div>
  );
};

export default ProjectLayout;
