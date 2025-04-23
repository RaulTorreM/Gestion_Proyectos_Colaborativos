// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import MainLayout from './components/layout/MainLayout'
import LoadingSpinner from './components/common/LoadingSpinner'
import { ThemeProvider } from './context/ThemeContext'
import { ProjectsProvider } from './context/ProjectsContext'

// Importaciones regulares en lugar de lazy para depuración
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import TasksPage from './pages/TasksPage'
import ChatPage from './pages/ChatPage'
import AnalyticsPage from './pages/AnalyticsPage'
import UsersPage from './pages/UsersPage'
import SettingsPage from './pages/SettingsPage'

// Comenta las importaciones lazy temporalmente
// const DashboardPage = lazy(() => import('./pages/DashboardPage'))
// const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
// const TasksPage = lazy(() => import('./pages/TasksPage'))
// const ChatPage = lazy(() => import('./pages/ChatPage'))
// const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
// const UsersPage = lazy(() => import('./pages/UsersPage'))
// const SettingsPage = lazy(() => import('./pages/SettingsPage'))

export default function App() {
  return (
    <ThemeProvider>
      <ProjectsProvider>
        <Router>
          <MainLayout>
            {/* Remueve Suspense temporalmente */}
            {/* <Suspense fallback={<LoadingSpinner fullScreen />}> */}
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<DashboardPage />} />
              </Routes>
            {/* </Suspense> */}
          </MainLayout>
        </Router>
      </ProjectsProvider>
    </ThemeProvider>
  )
}