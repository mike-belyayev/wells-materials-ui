import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import HomePage from './pages/HomePage';
import EquipmentPage from './pages/EquipmentPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />          
          {/* Equipment Page - now the main/default after login */}
          <Route path="/equipment" element={
            <ProtectedRoute>
              <EquipmentPage />
            </ProtectedRoute>
          } />
          {/* Add redirect from root to equipment for authenticated users */}
          <Route path="/" element={<HomePage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;