import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Avatar, 
  Divider,
  Stack,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { format, differenceInDays } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { styles } from './styles';
import EditProjectModal from '../EditProjectModal';  

const ProjectDetail = ({ project, onUpdate }) => {
  // Estado del proyecto - Los datos vienen del backend
  const [currentProject, setCurrentProject] = useState(project);
  
  // Estados para modales
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  
  // CONEXIÓN BACKEND #1 - Tareas del proyecto
  // Debe reemplazarse con datos reales del backend
  const [tasks, setTasks] = useState([]); // Debería cargarse desde GET /api/projects/:id/tasks
  
  // Formulario de tarea - Todos estos datos se enviarán al backend
  const [taskForm, setTaskForm] = useState({
    title: '',             // Se enviará al backend
    description: '',       // Se enviará al backend
    status: 'Pendiente',   // Se enviará al backend
    priority: 'Media',     // Se enviará al backend
    dueDate: null,         // Se enviará al backend (formato ISO)
    estimatedHours: '',    // Se enviará al backend
    assignedMembers: []    // Se enviará al backend (array de user IDs)
  });

  // Calcula la duración en días (frontend only)
  const duration = differenceInDays(
    new Date(currentProject.endDate), 
    new Date(currentProject.startDate)
  );

  // CONEXIÓN BACKEND #2 - Actualización de proyecto
  const handleProjectSave = async (updatedProject) => {
    try {
      // PUT /api/projects/${project.id}
      // Body: updatedProject
      
      // Simulación (debe reemplazarse):
      setCurrentProject(updatedProject);
      if (onUpdate) onUpdate(updatedProject);
      
      // Mostrar notificación de éxito
    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
      // Mostrar notificación de error
    }
  };

  // CONEXIÓN BACKEND #3 - Creación de tarea
  const handleAddTask = async () => {
    try {
      // POST /api/projects/${project.id}/tasks
      // Body: {
      //   title: taskForm.title,
      //   description: taskForm.description,
      //   status: taskForm.status,
      //   priority: taskForm.priority,
      //   dueDate: taskForm.dueDate.toISOString(),
      //   estimatedHours: Number(taskForm.estimatedHours),
      //   assignedTo: taskForm.assignedMembers // Array de user IDs
      // }
      
      // Simulación (debe reemplazarse):
      const newTask = {
        ...taskForm,
        id: Date.now(), // El backend debe generar el ID
        dueDate: taskForm.dueDate?.toISOString()
      };
      
      setTasks([...tasks, newTask]);
      setAddTaskModalOpen(false);
      resetTaskForm();
      
      // Mostrar notificación de éxito
    } catch (error) {
      console.error('Error al crear tarea:', error);
      // Mostrar notificación de error
    }
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      status: 'Pendiente',
      priority: 'Media',
      dueDate: null,
      estimatedHours: '',
      assignedMembers: []
    });
  };

  // CONEXIÓN BACKEND #4 - Generación de descripción con IA
  const handleGenerateAIDescription = async () => {
    try {
      // POST /api/ai/generate-task-description
      // Body: { taskTitle: taskForm.title }
      
      // Simulación (debe reemplazarse):
      setTaskForm(prev => ({
        ...prev,
        description: `Descripción generada para: "${prev.title}".\nEsta tarea incluye los requisitos principales y pasos necesarios.`
      }));
    } catch (error) {
      console.error('Error al generar descripción:', error);
      // Mostrar notificación de error
    }
  };

  // Columnas del Kanban (frontend only)
  const kanbanColumns = [
    { id: 'pending', title: 'Pendiente', status: 'Pendiente' },
    { id: 'in-progress', title: 'En progreso', status: 'En progreso' },
    { id: 'completed', title: 'Completada', status: 'Completada' }
  ];

  return (
    <Box sx={styles.container}>
      {/* Botón de edición de proyecto - Abre modal que conecta con backend */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => setEditModalOpen(true)}
          sx={styles.editButton}
        >
          Editar Proyecto
        </Button>
      </Box>

      {/* Encabezado del proyecto - Muestra datos del backend */}
      <Paper elevation={0} sx={styles.header}>
        <Typography variant="h4" component="h1" sx={styles.title}>
          {currentProject.name}
        </Typography>
        
        <Stack direction="row" spacing={2} sx={styles.dates}>
          <Typography variant="body1">
            <strong>Inicio:</strong> {format(new Date(currentProject.startDate), 'dd/MM/yyyy')}
          </Typography>
          <Typography variant="body1">
            <strong>Fin:</strong> {format(new Date(currentProject.endDate), 'dd/MM/yyyy')}
          </Typography>
          <Typography variant="body1">
            <strong>Duración:</strong> {duration} días
          </Typography>
        </Stack>
      </Paper>

      {/* Descripción del proyecto - Datos del backend */}
      <Paper elevation={0} sx={styles.section}>
        <Typography variant="h6" gutterBottom>
          Descripción
        </Typography>
        <Typography variant="body1" sx={styles.description}>
          {currentProject.description}
        </Typography>
      </Paper>

      {/* Miembros del equipo - Datos del backend */}
      <Paper elevation={0} sx={styles.section}>
        <Typography variant="h6" gutterBottom>
          Equipo ({currentProject.members.length})
        </Typography>
        <Box sx={styles.membersContainer}>
          {currentProject.members.map((member, index) => (
            <Chip
              key={index}
              avatar={<Avatar src={member.avatar} alt={member.name} />}
              label={member.name}
              variant="outlined"
              sx={styles.memberChip}
            />
          ))}
        </Box>
      </Paper>

      <Divider sx={styles.divider} />

      {/* Tablero Kanban - Muestra tareas del backend */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={styles.kanbanTitle}>
          Tablero de Tareas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddTaskModalOpen(true)}
          sx={styles.addButton}
        >
          Nueva Tarea
        </Button>
      </Box>

      {/* CONEXIÓN BACKEND #5 - Tablero Kanban debería actualizarse con:
          GET /api/projects/:id/tasks?status=... */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        gap: 2,
        minHeight: '400px'
      }}>
        {kanbanColumns.map((column) => {
          const columnTasks = tasks.filter(task => task.status === column.status);
          return (
            <Paper key={column.id} elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {column.title} ({columnTasks.length})
              </Typography>
              
              {columnTasks.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                  No hay tareas en esta columna
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {columnTasks.map((task) => (
                    <Paper key={task.id} elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle2">{task.title}</Typography>
                      <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                        {task.description}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        <Chip
                          label={task.priority}
                          size="small"
                          sx={[
                            styles.priorityChip,
                            task.priority === 'Alta' && styles.priorityChip.Alta,
                            task.priority === 'Media' && styles.priorityChip.Media,
                            task.priority === 'Baja' && styles.priorityChip.Baja
                          ]}
                        />
                        {task.assignedMembers.map(memberName => {
                          const member = currentProject.members.find(m => m.name === memberName);
                          return (
                            <Chip
                              key={memberName}
                              avatar={<Avatar src={member?.avatar} />}
                              label={member?.name}
                              size="small"
                            />
                          );
                        })}
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Paper>
          );
        })}
      </Box>

      {/* Modal para añadir tarea - Envía datos al backend */}
      <Dialog open={addTaskModalOpen} onClose={() => setAddTaskModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6">Crear nueva tarea</Typography>
          <IconButton onClick={() => setAddTaskModalOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Completa los detalles para crear una nueva tarea en el proyecto
          </Typography>
          
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Título de la tarea"
              value={taskForm.title}
              onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
              fullWidth
              required
            />
            
            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Descripción"
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                multiline
                rows={4}
                fullWidth
                required
              />
              <Button
                variant="outlined"
                onClick={handleGenerateAIDescription}
                size="small"
                sx={{ position: 'absolute', right: 8, bottom: 8 }}
              >
                Usar IA
              </Button>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={taskForm.status}
                  label="Estado"
                  onChange={(e) => setTaskForm({...taskForm, status: e.target.value})}
                >
                  <MenuItem value="Pendiente">Pendiente</MenuItem>
                  <MenuItem value="En progreso">En progreso</MenuItem>
                  <MenuItem value="Completada">Completada</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={taskForm.priority}
                  label="Prioridad"
                  onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                  renderValue={(selected) => (
                    <Chip
                      label={selected}
                      size="small"
                      sx={[
                        styles.priorityChip,
                        selected === 'Alta' && styles.priorityChip.Alta,
                        selected === 'Media' && styles.priorityChip.Media,
                        selected === 'Baja' && styles.priorityChip.Baja
                      ]}
                    />
                  )}
                >
                  <MenuItem value="Alta">Alta</MenuItem>
                  <MenuItem value="Media">Media</MenuItem>
                  <MenuItem value="Baja">Baja</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Fecha límite"
                value={taskForm.dueDate}
                onChange={(date) => setTaskForm({...taskForm, dueDate: date})}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
            
            <TextField
              label="Tiempo estimado (horas)"
              type="number"
              value={taskForm.estimatedHours}
              onChange={(e) => setTaskForm({...taskForm, estimatedHours: e.target.value})}
              fullWidth
              inputProps={{ min: 1 }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Asignar miembros</InputLabel>
              <Select
                multiple
                value={taskForm.assignedMembers}
                onChange={(e) => setTaskForm({...taskForm, assignedMembers: e.target.value})}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((memberName) => {
                      const member = currentProject.members.find(m => m.name === memberName);
                      return (
                        <Chip 
                          key={memberName}
                          avatar={<Avatar src={member?.avatar} />}
                          label={member?.name}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {currentProject.members.map((member) => (
                  <MenuItem key={member.name} value={member.name}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={member.avatar} sx={{ width: 24, height: 24 }} />
                      <Typography>{member.name}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setAddTaskModalOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleAddTask}
            variant="contained"
            disabled={!taskForm.title || !taskForm.description}
          >
            Crear Tarea
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de edición de proyecto (usa EditProjectModal) */}
      <EditProjectModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        project={currentProject}
        onSave={handleProjectSave}
        availableMembers={currentProject.members}
      />
    </Box>
  );
};

export default ProjectDetail;