import EpicDetail from './EpicDetail';

const EpicDetailModal = ({ task, onClose, onSave, theme }) => {
  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <EpicDetail 
        task={task} 
        onClose={onClose} 
        onSave={onSave}
        theme={theme}
      />
    </div>
  );
};

export default EpicDetailModal;