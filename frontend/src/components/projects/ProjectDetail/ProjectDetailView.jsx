import { useState } from 'react';
import ProjectHeader from './ProjectHeader';
import ProjectStats from './ProjectStats';
import ProjectTabs from './ProjectTabs';
import ProjectOverview from './ProjectOverview';
import ProjectMetrics from './ProjectMetrics';
import ProjectActivity from './ProjectActivity';
import ProjectPerformance from './ProjectPerformance';
import ProjectDocuments from './ProjectDocuments';

const ProjectDetailView = ({ project, onBack }) => {
  const [activeTab, setActiveTab] = useState('details');
  
  // Datos de ejemplo basados en el diagrama de BD
  const projectData = {
    ...project,
    progress: project.totalTasks > 0 
      ? Math.round((project.completedTasks / project.totalTasks) * 100)
      : 0,
    duration: Math.ceil(
      (new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24)
    ),
    members: project.members || [],
    epics: project.epics || [],
    userStories: project.userStories || [],
    versions: project.versions || [],
    timeEntries: project.timeEntries || [],
    comments: project.comments || [],
    documents: project.documents || []
  };

  const getProgressColor = (percentage) => {
    if (percentage < 40) return 'bg-red-600';
    if (percentage < 92) return 'bg-yellow-500';
    return 'bg-green-600';
  };

  return (
    <div className="p-6 bg-black border border-gray-600 text-white">
      <ProjectHeader 
        name={projectData.name} 
        status={projectData.status} 
      />
      
      <ProjectStats 
        progress={projectData.progress}
        completedTasks={projectData.completedTasks}
        totalTasks={projectData.totalTasks}
        startDate={projectData.startDate}
        endDate={projectData.endDate}
        duration={projectData.duration}
        members={projectData.members}
        progressColor={getProgressColor(projectData.progress)} 
        
      />
      
      <ProjectTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <ProjectOverview 
            description={projectData.description}
            startDate={projectData.startDate}
            endDate={projectData.endDate}
            duration={projectData.duration}
            createdBy={projectData.createdBy}
            categories={projectData.categories}
          />
          <ProjectMetrics 
            epics={projectData.epics}
            userStories={projectData.userStories}
          />
          <ProjectActivity 
            activities={projectData.activities}
            timeEntries={projectData.timeEntries}
            comments={projectData.comments}
          />
        </div>
      )}
      
      {activeTab === 'performance' && (
        <ProjectPerformance 
          versions={projectData.versions}
          timeEntries={projectData.timeEntries}
        />
      )}
      
      {activeTab === 'documents' && (
        <ProjectDocuments documents={projectData.documents} />
      )}
      
      <div className="flex justify-between mt-8">
        <button 
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          onClick={onBack}
        >
          Volver a Proyectos
        </button>
        <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
          Ir a Tablero
        </button>
      </div>
    </div>
  );
};

export default ProjectDetailView;