import ProjectsFilter from './ProjectsFilter';
import ProjectsViewToggle from './ProjectsViewToggle';

const ProjectsHeader = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <ProjectsFilter />
      <ProjectsViewToggle />
    </div>
  );
};

export default ProjectsHeader;