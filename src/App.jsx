import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Shop from './components/Shop';
import AuthParams from './components/Auth';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/auth" element={<AuthParams />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/shop" element={<Shop />} />
                  </Routes>
                </>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
