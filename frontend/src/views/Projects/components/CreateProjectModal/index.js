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
  IconButton,
  Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CloseIcon from '@mui/icons-material/Close';
import { styles } from './styles';

const CreateProjectModal = ({ open, onClose, onCreate }) => {
  // Estado del formulario - Los datos aquí se enviarán al backend
  const [formData, setFormData] = useState({
    name: '',          // Se enviará al backend
    description: '',   // Se enviará al backend
    startDate: null,   // Se enviará al backend (formato ISO)
    endDate: null      // Se enviará al backend (formato ISO)
  });

  // Maneja cambios en campos de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Maneja cambios en fechas
  const handleDateChange = (name) => (date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  // CONEXIÓN BACKEND #1 - Generación de descripción con IA
  const handleGenerateAI = async () => {
    try {
      // Debe reemplazarse con llamada real al backend:
      // const response = await fetch('/api/ai/generate-description', {
      //   method: 'POST',
      //   body: JSON.stringify({ projectName: formData.name })
      // });
      // const data = await response.json();
      
      // Simulación (esto debe venir del backend):
      const mockAIDescription = `Descripción generada automáticamente para: ${formData.name}. 
      Este proyecto incluye funcionalidades clave y mejores prácticas.`;
      
      setFormData(prev => ({
        ...prev,
        description: mockAIDescription // Usar data.description en producción
      }));
    } catch (error) {
      console.error('Error al generar descripción:', error);
      // Mostrar notificación de error al usuario
    }
  };

  // CONEXIÓN BACKEND #2 - Envío del formulario completo
  const handleSubmit = async () => {
    // Validación básica del frontend
    if (!formData.name || !formData.description || !formData.startDate || !formData.endDate) {
      return; // El backend debe hacer validación adicional
    }

    try {
      // Debe reemplazarse con llamada real al backend:
      // const response = await fetch('/api/projects', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: formData.name,
      //     description: formData.description,
      //     startDate: formData.startDate.toISOString(),
      //     endDate: formData.endDate.toISOString()
      //   })
      // });
      
      // if (!response.ok) throw new Error('Error al crear proyecto');
      // const newProject = await response.json();

      // Simulación (esto debe venir del backend):
      const mockProject = {
        ...formData,
        id: Date.now(),  // El backend debe generar el ID real
        progress: 0,     // El backend debe inicializar esto
        members: []      // El backend debe inicializar esto
      };

      onCreate(mockProject); // En producción pasar newProject
      onClose();
      
      // Mostrar notificación de éxito
    } catch (error) {
      console.error('Error al crear proyecto:', error);
      // Mostrar notificación de error al usuario
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={styles.dialogTitle}>
        <Typography variant="h6">Crear nuevo Proyecto</Typography>
        <IconButton onClick={onClose} sx={styles.closeButton}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" sx={styles.subtitle}>
          Completa los detalles para crear un nuevo proyecto. Se podrá hacer modificaciones más adelante.
        </Typography>
        
        <Stack spacing={3} sx={styles.formContainer}>
          {/* Campo que se enviará al backend como parte del proyecto */}
          <TextField
            name="name"
            label="Nombre del proyecto"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            sx={styles.field}
          />
          
          <Box sx={styles.descriptionContainer}>
            {/* Campo que se enviará al backend como parte del proyecto */}
            <TextField
              name="description"
              label="Descripción"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
              required
              sx={{
                ...styles.field,
                '& .MuiOutlinedInput-root': {
                    paddingRight: '150px'
                }
              }}
            />
            {/* Botón que dispara la conexión con el backend de IA */}
            <Button
              variant="outlined"
              onClick={handleGenerateAI}
              sx={styles.aiButton}
              size="small"
            >
              Usar IA
            </Button>
          </Box>
          
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
        </Stack>
      </DialogContent>
      
      <DialogActions sx={styles.dialogActions}>
        <Button onClick={onClose} sx={styles.cancelButton}>
          Cancelar
        </Button>
        {/* Botón que dispara la conexión principal con el backend */}
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.name || !formData.description || !formData.startDate || !formData.endDate}
          sx={styles.submitButton}
        >
          Crear proyecto
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProjectModal;