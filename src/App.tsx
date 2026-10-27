import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { AgileBoardPage } from './pages/AgileBoardPage';
import { EngineeringPage } from './pages/EngineeringPage';
import { QAManagementPage } from './pages/QAManagementPage';
import { ITSMPage } from './pages/ITSMPage';
import { WorkflowPage } from './pages/WorkflowPage';
import { OperationsPage } from './pages/OperationsPage';
import { AICopilotPage } from './pages/AICopilotPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Workspace Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/agile" element={<AgileBoardPage />} />
            <Route path="/engineering" element={<EngineeringPage />} />
            <Route path="/qa" element={<QAManagementPage />} />
            <Route path="/itsm" element={<ITSMPage />} />
            <Route path="/workflows" element={<WorkflowPage />} />
            <Route path="/operations" element={<OperationsPage />} />
            <Route path="/ai" element={<AICopilotPage />} />
            <Route path="/settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
