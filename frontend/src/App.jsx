import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import ResourcePersonnelDashboard from './pages/resource/ResourcePersonnelDashboard';
import EmergencyOperatorDashboard from './pages/operator/EmergencyOperatorDashboard';
import NotFound from './pages/NotFound';
import NovaEmergencia from './pages/emergencies/NovaEmergencia';
import EditorIncidents from './pages/emergencies/EditorIncidents';
import Seguiment from './pages/emergencies/Seguiment';
import GestioUsuaris from './pages/usuaris/GestioUsuaris';
import Resources from './pages/devices/Resources';

// Rutas protegidas
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    // Redirigir a la página correspondiente según el rol
    if (user.role === 'emergency_center') {
      return <Navigate to="/dashboard" replace />;
    } else if (user.role === 'resource_personnel') {
      return <Navigate to="/resource" replace />;
    } else if (user.role === 'emergency_operator') {
      return <Navigate to="/operator" replace />;
    }
  }
  
  return children;
};

function App() {
  const { theme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Rutas de autenticación */}
        <Route path="/" element={<AuthLayout />}>
          <Route index element={
            isAuthenticated ? (
              user.role === 'emergency_center' ? (
                <Navigate to="/dashboard" replace />
              ) : user.role === 'resource_personnel' ? (
                <Navigate to="/resource" replace />
              ) : (
                <Navigate to="/operator" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="login" element={<Login />} />
        </Route>
        
        {/* Rutas principales */}
        <Route path="/" element={<MainLayout />}>
          {/* Dashboard Centro Emergencias */}
          <Route path="dashboard" element={
            <ProtectedRoute requiredRole="emergency_center">
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Rutas de Emergencias */}
          <Route path="emergencies">
            <Route path="nova" element={
              <ProtectedRoute>
                <NovaEmergencia />
              </ProtectedRoute>
            } />
            <Route path="editor" element={
              <ProtectedRoute>
                <EditorIncidents />
              </ProtectedRoute>
            } />
            <Route path="seguiment" element={
              <ProtectedRoute>
                <Seguiment />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Rutas de Dispositivos */}
          <Route path="devices">
            <Route path="resources" element={
              <ProtectedRoute>
                <Resources />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Gestión de Usuarios */}
          <Route path="usuaris" element={
            <ProtectedRoute>
              <GestioUsuaris />
            </ProtectedRoute>
          } />
          
          {/* Vista Personal Recursos */}
          <Route path="resource" element={
            <ProtectedRoute requiredRole="resource_personnel">
              <ResourcePersonnelDashboard />
            </ProtectedRoute>
          } />
          
          {/* Vista Operador Emergencias */}
          <Route path="operator" element={
            <ProtectedRoute requiredRole="emergency_operator">
              <EmergencyOperatorDashboard />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Página 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MuiThemeProvider>
  );
}

export default App; 