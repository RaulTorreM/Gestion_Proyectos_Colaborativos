const ProjectHeader = ({ name, status }) => {
  const getStatusColor = () => {
    switch(status.toLowerCase()) {
      case 'planned': return 'bg-blue-500';
      case 'in progress': return 'bg-yellow-500';
      case 'released': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-white">{name}</h1>
      <div className="flex items-center mt-2">
        <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor()} mr-2`}></span>
        <span className="text-gray-400 capitalize">{status}</span>
      </div>
    </div>
  );
};

export default ProjectHeader;