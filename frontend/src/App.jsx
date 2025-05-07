import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/layout/Sidebar';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Chat from './pages/Chat';
import Analytics from './pages/Analytics';
import Users from './pages/Users';
import Administration from './pages/Administration';
import Settings from './pages/Settings';
import ProjectDetails from './pages/projects/ProjectDetails';
import ProjectVersions from './pages/projects/ProjectVersions';
import ProjectKanban from './pages/projects/ProjectKanban';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoutes';
import HomeRedirect from './components/HomeRedirect';

const App = () => {
  return (
    <ThemeProvider>
      <div className="bg-gray-100 dark:bg-black">
        <Routes>
          {/* Ruta pública */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex w-full h-screen">
                  <Sidebar />
                  <main className="flex-1 overflow-y-auto">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/projects/:id/details" element={<ProjectDetails />} />
                      <Route path="/projects/:id/versions" element={<ProjectVersions />} />
                      <Route path="/projects/:id/kanban" element={<ProjectKanban />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/admin" element={<Administration />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </ThemeProvider>
  );
};

export default App;
