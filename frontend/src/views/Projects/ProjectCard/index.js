import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Typography,
  LinearProgress,
  Chip,
  useTheme,
  Box,
  Stack
} from '@mui/material';
import { format } from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { styles } from './styles';

const ProjectCard = ({ project }) => {
  const theme = useTheme();
  const cardStyles = styles(theme);

  /* 
   * CONEXIÓN BACKEND:
   * Este componente recibe un objeto 'project' que debe contener:
   * - name: Nombre del proyecto (string)
   * - description: Descripción del proyecto (string)
   * - startDate: Fecha de inicio (ISO string)
   * - endDate: Fecha de fin (ISO string)
   * - progress: Progreso del proyecto (number 0-100)
   * - members: Array de objetos con { name: string, avatar: string }
   * 
   * Los datos deben provenir de:
   * GET /api/projects (para listado)
   * GET /api/projects/:id (para detalle)
   */

  return (
    <Card sx={cardStyles.root}>
      <CardHeader
        title={
          <Typography variant="h6" component="div" noWrap sx={cardStyles.title}>
            {project.name} {/* Nombre del proyecto desde backend */}
          </Typography>
        }
        subheader={
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <CalendarTodayIcon fontSize="inherit" sx={cardStyles.dateIcon} />
            <Typography variant="caption" sx={cardStyles.dateText}>
              {format(new Date(project.startDate), 'dd/MM/yyyy')} {/* Fecha formateada */}
            </Typography>
            <Typography variant="caption" sx={cardStyles.dateSeparator}>
              →
            </Typography>
            <Typography variant="caption" sx={cardStyles.dateText}>
              {format(new Date(project.endDate), 'dd/MM/yyyy')} {/* Fecha formateada */}
            </Typography>
          </Stack>
        }
        avatar={
          <Avatar sx={cardStyles.avatar}>
            {project.name.charAt(0)} {/* Inicial del proyecto */}
          </Avatar>
        }
        sx={{ pb: 0 }}
      />

      <CardContent sx={cardStyles.content}>
        <Typography variant="body2" sx={cardStyles.description}>
          {project.description} {/* Descripción desde backend */}
        </Typography>
      </CardContent>

      <Box sx={cardStyles.footer}>
        {/* Sección de progreso - dato numérico del backend */}
        <Box sx={cardStyles.progressContainer}>
          <Typography variant="caption" sx={cardStyles.progressLabel}>
            Progreso
          </Typography>
          <Typography variant="body2" sx={cardStyles.progressValue}>
            {project.progress}% {/* Progreso desde backend */}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={project.progress} /* Progreso desde backend */
          sx={cardStyles.progressBar}
        />
        
        {/* Sección de miembros del equipo - datos del backend */}
        {project.members?.length > 0 && (
          <>
            <Typography variant="caption" sx={cardStyles.teamLabel}>
              Equipo
            </Typography>
            <Box sx={cardStyles.membersContainer}>
              {project.members.map((member, index) => (
                <Chip
                  key={index}
                  avatar={
                    <Avatar 
                      src={member.avatar}  /* Avatar desde backend */
                      sx={cardStyles.memberAvatar} 
                    />
                  }
                  label={member.name} /* Nombre de miembro desde backend */
                  size="small"
                  sx={cardStyles.memberChip}
                />
              ))}
            </Box>
          </>
        )}
      </Box>
    </Card>
  );
};

export default ProjectCard;