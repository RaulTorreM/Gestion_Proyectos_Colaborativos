import React from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Avatar, 
  Switch,
} from '@mui/material';
import {
  Home as HomeIcon,
  Folder as ProjectsIcon,
  CalendarToday as CalendarIcon,
  People as TeamIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const Dashboard = ({ darkMode, toggleTheme, children }) => {
  const today = format(new Date(), "dd/MM/yyyy");

  // TODO: Reemplazar con datos reales del backend
  // Deberá hacerse una petición a:
  // GET /api/user/me (o similar) para obtener:
  // - Nombre del usuario
  // - Avatar/Imagen de perfil
  // - Roles/Permisos (para mostrar items del menú según permisos)
  const user = {
    name: "Usuario Prueba", // Esto vendrá del backend
    avatar: "https://i.imgur.com/JQ8W5vU.png" // Esto vendrá del backend
  };

  // TODO: Podría obtenerse dinámicamente desde el backend
  // GET /api/menu-items (por ejemplo) para:
  // - Mostrar solo las opciones permitidas para este usuario
  // - Traducir los textos según preferencias del usuario
  const menuItems = [
    { text: 'Inicio', icon: <HomeIcon />, path: '/' },
    { text: 'Proyectos', icon: <ProjectsIcon />, path: '/proyectos' },
    { text: 'Calendario', icon: <CalendarIcon />, path: '/calendario' },
    { text: 'Equipo', icon: <TeamIcon />, path: '/equipo' },
  ];

  const handleLogout = () => {
    // TODO: Implementar logout real con el backend
    // Deberá hacer:
    // POST /api/auth/logout
    // Y luego limpiar el token/localStorage
    console.log("Cerrando sesión...");
    // Después de logout, redirigir a /login
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar superior */}
      <AppBar 
        position="fixed" 
        sx={{ 
          width: `calc(100% - ${drawerWidth}px)`, 
          ml: `${drawerWidth}px`,
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
          height: 64,
          justifyContent: 'center'
        }}
      >
        <Toolbar sx={{ height: 64 }}>
          <Typography 
            variant="h6" 
            component="h1" 
            noWrap 
            sx={{ flexGrow: 1 }}
          >
            {/* TODO: Mensaje dinámico desde backend? */}
            Que tengas un día bonito...
          </Typography>

          <Typography variant="body1" sx={{ mr: 2 }}>
            {today}
          </Typography>

          <Button 
            color="inherit" 
            startIcon={<AccountIcon />} 
            sx={{ mr: 1 }}
            component={Link}
            to="/mi-cuenta"
          >
            Mi Cuenta
          </Button>

          <Button 
            color="inherit" 
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            color: 'text.primary'
          },
        }}
        variant="permanent"
        anchor="left"
      >
        {/* Logo en la parte superior */}
        <Box sx={{ 
          p: 3, 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          height: 64
        }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {/* TODO: Nombre de la app podría venir de configuración del backend */}
            OurApp
          </Typography>
        </Box>

        {/* Menú de navegación (centro) */}
        <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text}
              component={Link}
              to={item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: darkMode ? 'primary.dark' : 'primary.light',
                },
                '&.Mui-selected:hover': {
                  backgroundColor: darkMode ? 'primary.dark' : 'primary.light',
                },
                color: darkMode ? 'text.primary' : 'text.secondary',
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ color: 'inherit' }}
              />
            </ListItem>
          ))}
        </List>
        </Box>

        {/* Sección inferior (usuario + tema) */}
        <Box sx={{ 
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          {/* Perfil del usuario */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mb: 2
          }}>
            <Avatar src={user.avatar} sx={{ mr: 2 }} />
            <Typography variant="body1" noWrap>
              {user.name}
            </Typography>
          </Box>
          
          {/* Switcher de tema (esto es frontend-only) */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center'
          }}>
            <DarkModeIcon sx={{ mr: 1 }} />
            <Typography variant="body2" sx={{ flexGrow: 1 }}>Modo oscuro</Typography>
            <Switch 
              checked={darkMode} 
              onChange={toggleTheme}
              color="primary"
            />
          </Box>
        </Box>
      </Drawer>

      {/* Contenido principal - Aquí se renderizarán las páginas */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          bgcolor: 'background.default',
          p: 3,
          mt: 8,
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Dashboard;