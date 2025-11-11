
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import './App.css'
import Dashboard from './pages/Dashboard'
import { SecurityProvider } from './contexts/SecurityContext'
import Layout from './components/Layout'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Vehicles from './pages/Vehicles'
import RegisterDriver from './pages/RegisterDrivers'
import NotFound from './pages/NotFound'
import Visitors from './pages/Victors'
import Checkpoint from './pages/Checkpoint'
import ManageUsers from './pages/ManageUsers'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Wait for auth state to finish loading before deciding
if (loading) {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Security Shield Logo */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3l8 4v5a9 9 0 11-16 0V7l8-4z"
              />
            </svg>
          </div>

          {/* Spinner around logo */}
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-400 rounded-full animate-spin"></div>
        </div>

        {/* Text below logo */}
        <h1 className="text-2xl font-semibold tracking-wide">Security Portal</h1>
        <p className="text-sm text-gray-300 animate-pulse">
          Checking your session, please wait...
        </p>
      </div>
    </div>
  );
}


  // Once loading is done, either show the content or redirect
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};



function App() {

  return (
    <>
      <AuthProvider>

        <SecurityProvider>

          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>} />
                <Route path="/vehicles" element={<ProtectedRoute><Layout><Vehicles /></Layout></ProtectedRoute>} />
                 <Route path="/register-driver" element={<ProtectedRoute><Layout><RegisterDriver /></Layout></ProtectedRoute>} />
                  <Route path="/visitors" element={<ProtectedRoute><Layout><Visitors /></Layout></ProtectedRoute>} />
                   <Route path="/checkpoint" element={<ProtectedRoute><Layout><Checkpoint /></Layout></ProtectedRoute>} />
                    <Route path="/manage-users" element={<ProtectedRoute><Layout><ManageUsers /></Layout></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
            </Routes>
         
          </BrowserRouter>
        </SecurityProvider>
      </AuthProvider>


    </>
  )
}

export default App
