import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute, AdminRoute } from './auth/ProtectedRoute';
import HomePage from './pages/HomePage';
import HeliPage from './pages/HeliPage';
import EquipmentPage from './pages/EquipmentPage'; // Import new EquipmentPage
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* Original Heli Page (keep for now until fully migrated) */}
          <Route path="/heli" element={
            <ProtectedRoute>
              <HeliPage />
            </ProtectedRoute>
          } />
          
          {/* NEW Equipment Page */}
          <Route path="/equipment" element={
            <ProtectedRoute>
              <EquipmentPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          } />
          
          {/* Optional: Redirect / to equipment if you want it as default after login */}
          {/* <Route path="/" element={<Navigate to="/equipment" replace />} /> */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;