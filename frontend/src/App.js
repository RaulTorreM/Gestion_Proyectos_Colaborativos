import React, { useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lightTheme, darkTheme } from './theme';
import Layout from './components/Layout';
import HomeView from './views/HomeView';
import Projects from './views/Projects';

function App() {
  // Estado para controlar el tema oscuro/claro (puramente frontend)
  const [darkMode, setDarkMode] = useState(false);

  return (
    // Proveedor de temas de Material-UI (configuración frontend)
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      {/* Normalizador de estilos CSS (frontend) */}
      <CssBaseline />
      
      {/* Configuración del enrutamiento */}
      <BrowserRouter>
        <Routes>
          {/* 
            Layout principal que envuelve todas las páginas.
            Pasa el estado del tema y la función para alternarlo.
            (Esto es frontend, pero el Layout podría contener elementos
            que necesiten datos del backend como perfil de usuario)
          */}
          <Route path="/" element={<Layout darkMode={darkMode} toggleTheme={() => setDarkMode(!darkMode)} />}>
            
            {/* 
              Ruta de inicio - HomeView
              Aquí se podrían cargar datos iniciales del backend como:
              - Estadísticas generales
              - Notificaciones
              - Contenido destacado
            */}
            <Route index element={<HomeView />} />
            
            {/* 
              Ruta de proyectos - Aquí es donde PRINCIPALMENTE 
              se necesita conexión con el backend
            */}
            <Route path="proyectos">
              {/* 
                Listado de proyectos - Deberá hacer fetch a:
                GET /api/projects
              */}
              <Route index element={<Projects />} />
              
              {/* 
                Detalle de proyecto específico - Deberá hacer fetch a:
                GET /api/projects/:projectId
              */}
              <Route path=":projectId" element={<Projects />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;