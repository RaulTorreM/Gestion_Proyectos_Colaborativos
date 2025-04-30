import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useState } from 'react';
import TaskDetail from './ProjectKanban/TaskDetail';
import AddTaskModal from './ProjectKanban/AddTaskModal';
import KanbanColumn from './ProjectKanban/KanbanColumn';
import KanbanTask from './ProjectKanban/KanbanTask';

const ProjectKanban = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  const allMembers = [
    { userId: 1, name: "Ana López", role: "Diseñador UX/UI" },
    { userId: 2, name: "Carlos Ruiz", role: "Desarrollador Backend" },
    { userId: 3, name: "María García", role: "Desarrollador Frontend" },
    { userId: 4, name: "Pedro Sánchez", role: "QA Tester" },
    { userId: 5, name: "Laura Martínez", role: "Project Manager" },
    { userId: 6, name: "Javier Moreno", role: "Desarrollador Full Stack" }
  ];

  const [columns, setColumns] = useState({
    todo: {
      id: 'todo',
      title: 'Por hacer',
      tasks: [
        { 
          id: '1', 
          title: 'Diseñar interfaz', 
          description: 'Crear wireframes para el módulo principal',
          assignee: 1,
          startDate: '2025-04-20',
          endDate: '2025-04-25',
          priority: 'Alta',
          userStories: []
        },
        {
          id: '2',
          title: 'Configurar API',
          description: 'Establecer endpoints principales',
          assignee: 2,
          startDate: '2025-04-21',
          endDate: '2025-04-30',
          priority: 'Media',
          userStories: []
        }
      ]
    },
    inProgress: {
      id: 'inProgress',
      title: 'En progreso',
      tasks: [
        {
          id: '3',
          title: 'Desarrollar módulo X',
          description: 'Implementar funcionalidades básicas',
          assignee: 3,
          startDate: '2025-04-18',
          endDate: '2025-04-28',
          priority: 'Alta',
          userStories: []
        }
      ]
    },
    completed: {
      id: 'completed',
      title: 'Completado',
      tasks: [
        {
          id: '4',
          title: 'Documentación inicial',
          description: 'Redactar guía de instalación',
          assignee: 5,
          startDate: '2025-04-10',
          endDate: '2025-04-15',
          priority: 'Baja',
          userStories: []
        }
      ]
    }
  });

  const getMemberById = (userId) => {
    return allMembers.find(member => member.userId === userId) || { name: "Sin asignar", role: "" };
  };

  const openTaskDetail = (task) => setSelectedTask(task);
  const closeTaskDetail = () => setSelectedTask(null);

  const updateTask = (updatedTask) => {
    const updatedColumns = { ...columns };
    Object.keys(updatedColumns).forEach(columnId => {
      updatedColumns[columnId].tasks = updatedColumns[columnId].tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
    });
    setColumns(updatedColumns);
    closeTaskDetail();
  };

  const handleDragStart = (e, taskId, sourceColumnId) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("sourceColumnId", sourceColumnId);
  };

  const handleDrop = (e, targetColumnId) => {
    const taskId = e.dataTransfer.getData("taskId");
    const sourceColumnId = e.dataTransfer.getData("sourceColumnId");
    if (sourceColumnId === targetColumnId) return;

    const sourceColumn = columns[sourceColumnId];
    const targetColumn = columns[targetColumnId];
    const taskToMove = sourceColumn.tasks.find(task => task.id === taskId);
    const updatedSourceTasks = sourceColumn.tasks.filter(task => task.id !== taskId);
    const updatedTargetTasks = [...targetColumn.tasks, taskToMove];

    setColumns({
      ...columns,
      [sourceColumnId]: { ...sourceColumn, tasks: updatedSourceTasks },
      [targetColumnId]: { ...targetColumn, tasks: updatedTargetTasks }
    });
  };

  const handleDragOver = (e) => e.preventDefault();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'bg-red-500';
      case 'Media': return 'bg-yellow-500';
      case 'Baja': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const handleAddTask = (newTask) => {
    const taskId = Date.now().toString();
    const updatedColumns = {
      ...columns,
      todo: {
        ...columns.todo,
        tasks: [...columns.todo.tasks, { ...newTask, id: taskId }]
      }
    };
    setColumns(updatedColumns);
    setShowAddTaskModal(false);
  };

  return (
    <div className="p-4 md:p-6 h-full">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => navigate('/projects')}
          className={`px-4 py-2 rounded-lg flex items-center
            ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
        >
          ← Volver a Proyectos
        </button>
        
        <button
          onClick={() => setShowAddTaskModal(true)}
          className={`px-4 py-2 rounded-lg flex items-center
            ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
        >
          + Agregar Tarea
        </button>
      </div>

      <div className={`rounded-xl p-5 shadow-sm ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`}>
        <h1 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Tablero Kanban - Proyecto: {id}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-6 h-full">
          {Object.entries(columns).map(([columnId, column]) => (
            <KanbanColumn
              key={columnId}
              column={column}
              theme={theme}
              onDragStart={handleDragStart}
              onDrop={(e) => handleDrop(e, columnId)}
              onDragOver={handleDragOver}
              onClickTask={openTaskDetail}
              getPriorityColor={getPriorityColor}
              getMemberById={getMemberById}
            />
          ))}
        </div>
      </div>

      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <AddTaskModal
            allMembers={allMembers}
            onClose={() => setShowAddTaskModal(false)}
            onSave={handleAddTask}
            theme={theme}
          />
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <TaskDetail 
            task={selectedTask}
            allMembers={allMembers}
            getMemberById={getMemberById}
            onClose={closeTaskDetail}
            onSave={updateTask}
            theme={theme}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectKanban;