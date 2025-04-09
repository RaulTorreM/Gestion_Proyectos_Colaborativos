import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  ClickAwayListener
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { styles } from './styles';

const KanbanBoard = ({ projectMembers }) => {
  // CONEXIÓN BACKEND #1 - Tareas del proyecto
  // Debería cargarse desde: GET /api/projects/:projectId/tasks
  const [tasks, setTasks] = useState([]); 
  
  // Estados para controlar modales
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [memberMenuAnchor, setMemberMenuAnchor] = useState(null);

  // Formulario de tarea - Todos estos datos se enviarán al backend
  const [formData, setFormData] = useState({
    title: '',             // Se enviará al backend
    description: '',       // Se enviará al backend
    status: 'Pendiente',   // Se enviará al backend
    priority: 'Media',     // Se enviará al backend
    dueDate: null,         // Se enviará al backend (formato ISO)
    estimatedHours: '',    // Se enviará al backend
    assignedMembers: []    // Se enviará al backend (array de user IDs)
  });

  // CONEXIÓN BACKEND #2 - Creación de nueva tarea
  const handleAddTask = async () => {
    try {
      // POST /api/projects/:projectId/tasks
      // Body: {
      //   title: formData.title,
      //   description: formData.description,
      //   status: formData.status,
      //   priority: formData.priority,
      //   dueDate: formData.dueDate.toISOString(),
      //   estimatedHours: Number(formData.estimatedHours),
      //   assignedTo: formData.assignedMembers // Array de user IDs
      // }
      
      // Simulación (debe reemplazarse con llamada real):
      const newTask = {
        ...formData,
        id: Date.now(), // El backend debe generar el ID
        dueDate: formData.dueDate?.toISOString()
      };
      
      setTasks([...tasks, newTask]);
      setAddModalOpen(false);
      resetForm();
      
      // Mostrar notificación de éxito
    } catch (error) {
      console.error('Error al crear tarea:', error);
      // Mostrar notificación de error
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'Pendiente',
      priority: 'Media',
      dueDate: null,
      estimatedHours: '',
      assignedMembers: []
    });
  };

  // CONEXIÓN BACKEND #3 - Generación de descripción con IA
  const handleGenerateAI = async () => {
    try {
      // POST /api/ai/generate-task-description
      // Body: { taskTitle: formData.title }
      
      // Simulación (debe reemplazarse):
      setFormData(prev => ({
        ...prev,
        description: `Descripción generada para: "${prev.title}".\nIncluye los pasos necesarios para completar esta tarea.`
      }));
    } catch (error) {
      console.error('Error al generar descripción:', error);
      // Mostrar notificación de error
    }
  };

  // Funciones para manejar miembros (sin conexión directa al backend)
  const handleOpenMemberMenu = (event) => {
    setMemberMenuAnchor(event.currentTarget);
  };

  const handleCloseMemberMenu = () => {
    setMemberMenuAnchor(null);
  };

  const handleSelectMember = (name) => {
    if (!formData.assignedMembers.includes(name)) {
      setFormData({
        ...formData,
        assignedMembers: [...formData.assignedMembers, name]
      });
    }
    handleCloseMemberMenu();
  };

  const handleRemoveMember = (name) => {
    setFormData({
      ...formData,
      assignedMembers: formData.assignedMembers.filter(m => m !== name)
    });
  };

  // Columnas del Kanban (frontend only)
  const columns = [
    { id: 'pending', title: 'Pendiente', status: 'Pendiente' },
    { id: 'in-progress', title: 'En progreso', status: 'En progreso' },
    { id: 'completed', title: 'Completada', status: 'Completada' }
  ];

  return (
    <Box sx={{ mt: 4 }}>
      {/* Botón para abrir modal de nueva tarea */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setAddModalOpen(true)}
        sx={{ mb: 3 }}
      >
        Añadir Tarea
      </Button>

      {/* CONEXIÓN BACKEND #4 - Tablero Kanban debería cargar tareas desde:
          GET /api/projects/:projectId/tasks */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        gap: 2,
        minHeight: '400px'
      }}>
        {columns.map((column) => {
          const columnTasks = tasks.filter(task => task.status === column.status);
          return (
            <Paper key={column.id} elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {column.title} ({columnTasks.length})
              </Typography>
              
              {columnTasks.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                  No hay tareas aquí
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
                        {task.assignedMembers.map(memberId => {
                          const member = projectMembers.find(m => m.name === memberId);
                          return (
                            <Chip
                              key={memberId}
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
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6">Crear nueva tarea</Typography>
          <IconButton onClick={() => setAddModalOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Completa los detalles para la nueva tarea
          </Typography>
          
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Título"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              fullWidth
              required
            />
            
            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Descripción"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                multiline
                rows={4}
                fullWidth
              />
              <Button
                variant="outlined"
                onClick={handleGenerateAI}
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
                  value={formData.status}
                  label="Estado"
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <MenuItem value="Pendiente">Pendiente</MenuItem>
                  <MenuItem value="En progreso">En progreso</MenuItem>
                  <MenuItem value="Completada">Completada</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={formData.priority}
                  label="Prioridad"
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
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
                value={formData.dueDate}
                onChange={(date) => setFormData({...formData, dueDate: date})}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
            
            <TextField
              label="Tiempo estimado (horas)"
              type="number"
              value={formData.estimatedHours}
              onChange={(e) => setFormData({...formData, estimatedHours: e.target.value})}
              fullWidth
              inputProps={{ min: 0 }}
            />
            
            {/* Selector de miembros - Usa datos de projectMembers */}
            <ClickAwayListener onClickAway={handleCloseMemberMenu}>
              <Box>
                <InputLabel shrink>Asignar miembros</InputLabel>
                <Box
                  onClick={handleOpenMemberMenu}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                    cursor: 'pointer',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    minHeight: '56px',
                    gap: 1
                  }}
                >
                  {formData.assignedMembers.length === 0 ? (
                    <Typography color="text.secondary">Selecciona miembros</Typography>
                  ) : (
                    formData.assignedMembers.map((name) => {
                      const member = projectMembers.find((m) => m.name === name);
                      return (
                        <Chip
                          key={name}
                          avatar={<Avatar src={member?.avatar} />}
                          label={member?.name}
                          size="small"
                          onDelete={() => handleRemoveMember(name)}
                        />
                      );
                    })
                  )}
                  <ArrowDropDownIcon sx={{ ml: 'auto' }} />
                </Box>
                <Menu
                  anchorEl={memberMenuAnchor}
                  open={Boolean(memberMenuAnchor)}
                  onClose={handleCloseMemberMenu}
                >
                  {projectMembers
                    .filter(member => !formData.assignedMembers.includes(member.name))
                    .map((member) => (
                      <MenuItem
                        key={member.name}
                        onClick={() => handleSelectMember(member.name)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar src={member.avatar} sx={{ width: 24, height: 24 }} />
                          <Typography>{member.name}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                </Menu>
              </Box>
            </ClickAwayListener>
          </Stack>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setAddModalOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleAddTask}
            variant="contained"
            disabled={!formData.title}
          >
            Crear Tarea
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KanbanBoard;