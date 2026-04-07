import { Outlet } from 'react-router-dom';
import ProjectSidebar from '../components/ProjectSidebar';
import ProjectContextSidebar from '../components/ProjectContextSidebar';
import './ProjectLayout.css';

const ProjectLayout = () => {
  return (
    <div className="project-layout">
      <ProjectSidebar />
      <ProjectContextSidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default ProjectLayout;
