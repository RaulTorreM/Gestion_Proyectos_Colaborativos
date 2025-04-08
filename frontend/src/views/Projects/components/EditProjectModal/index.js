import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { styles } from './styles';

const EditProjectModal = ({ 
  open, 
  onClose, 
  project, 
  onSave,
  availableMembers 
}) => {
  // Estado del formulario - Todos estos datos vendrán/irán al backend
  const [formData, setFormData] = useState({
    name: project.name,                     // Se enviará al backend
    description: project.description,       // Se enviará al backend
    startDate: new Date(project.startDate), // Se enviará al backend (formato ISO)
    endDate: new Date(project.endDate),     // Se enviará al backend (formato ISO)
    members: [...project.members]           // Se enviará al backend
  });
  
  const [newMember, setNewMember] = useState(''); // Estado temporal para nuevo miembro

  // Maneja cambios en campos de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Maneja cambios en fechas
  const handleDateChange = (name) => (date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  // CONEXIÓN BACKEND #1 - Añadir miembro al proyecto
  const handleAddMember = async () => {
    if (newMember.trim() && !formData.members.some(m => m.name === newMember.trim())) {
      try {
        // 1. Primero verificar si el usuario existe en el sistema
        // GET /api/users?search=${newMember.trim()}
        
        // 2. Si existe, añadir al proyecto
        // POST /api/projects/${project.id}/members
        // Body: { userId: "123", role: "member" }
        
        // Simulación temporal (esto debe venir del backend):
        const mockMember = {
          name: newMember.trim(),
          avatar: `https://i.pravatar.cc/150?u=${newMember.trim()}`,
          userId: Date.now().toString() // El backend debe proveer el ID real
        };
        
        setFormData(prev => ({
          ...prev,
          members: [...prev.members, mockMember]
        }));
        setNewMember('');
        
      } catch (error) {
        console.error('Error al añadir miembro:', error);
        // Mostrar notificación de error
      }
    }
  };

  // CONEXIÓN BACKEND #2 - Eliminar miembro del proyecto
  const handleRemoveMember = async (memberName) => {
    try {
      // Buscar el userId del miembro a eliminar
      const memberToRemove = formData.members.find(m => m.name === memberName);
      
      // DELETE /api/projects/${project.id}/members/${memberToRemove.userId}
      
      // Si la llamada es exitosa, actualizar estado local
      setFormData(prev => ({
        ...prev,
        members: prev.members.filter(m => m.name !== memberName)
      }));
      
    } catch (error) {
      console.error('Error al eliminar miembro:', error);
      // Mostrar notificación de error
    }
  };

  // CONEXIÓN BACKEND #3 - Guardar cambios del proyecto
  const handleSubmit = async () => {
    try {
      // PUT /api/projects/${project.id}
      // Body: {
      //   name: formData.name,
      //   description: formData.description,
      //   startDate: formData.startDate.toISOString(),
      //   endDate: formData.endDate.toISOString(),
      //   members: formData.members.map(m => m.userId)
      // }
      
      // Simulación temporal (respuesta del backend):
      const updatedProject = {
        ...project,
        ...formData,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString()
      };
      
      onSave(updatedProject); // En producción pasar la respuesta real del backend
      onClose();
      
      // Mostrar notificación de éxito
    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
      // Mostrar notificación de error
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={styles.dialogTitle}>
        <Typography variant="h6">Editar Proyecto</Typography>
        <IconButton onClick={onClose} sx={styles.closeButton}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={styles.formContainer}>
          {/* Campo que se enviará al backend */}
          <TextField
            name="name"
            label="Nombre del proyecto"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            sx={styles.field}
          />
          
          {/* Campo que se enviará al backend */}
          <TextField
            name="description"
            label="Descripción"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
            required
            sx={styles.field}
          />
          
          {/* Campos de fecha que se enviarán al backend */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack direction="row" spacing={2}>
              <DatePicker
                label="Fecha de inicio"
                value={formData.startDate}
                onChange={handleDateChange('startDate')}
                renderInput={(params) => (
                  <TextField {...params} fullWidth required />
                )}
              />
              <DatePicker
                label="Fecha de fin"
                value={formData.endDate}
                onChange={handleDateChange('endDate')}
                renderInput={(params) => (
                  <TextField {...params} fullWidth required />
                )}
                minDate={formData.startDate}
              />
            </Stack>
          </LocalizationProvider>

          {/* Sección de miembros - Todas las operaciones aquí involucran al backend */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Miembros del equipo
            </Typography>
            <Box sx={styles.membersContainer}>
              {formData.members.map((member) => (
                <Chip
                  key={member.name}
                  avatar={<Avatar src={member.avatar} />}
                  label={member.name}
                  onDelete={() => handleRemoveMember(member.name)}
                  sx={styles.memberChip}
                />
              ))}
            </Box>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <TextField
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                label="Añadir miembro"
                size="small"
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddMember}
                disabled={!newMember.trim()}
              >
                Añadir
              </Button>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={styles.dialogActions}>
        <Button onClick={onClose} sx={styles.cancelButton}>
          Cancelar
        </Button>
        {/* Botón que dispara la actualización en el backend */}
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          sx={styles.submitButton}
        >
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProjectModal;