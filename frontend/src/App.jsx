import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Setup from './pages/Setup'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import Tips from './pages/Tips'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login />} 
          />
          <Route 
            path="/signup" 
            element={user ? <Navigate to="/dashboard" /> : <Signup />} 
          />
          <Route 
            path="/setup" 
            element={
              user ? (
                user.isSetupComplete ? <Navigate to="/dashboard" /> : <Setup />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? (
                user.isSetupComplete ? <Dashboard /> : <Navigate to="/setup" />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/reports" 
            element={user ? <Reports /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={user ? <Profile /> : <Navigate to="/login" />} 
          />
          <Route path="/tips" element={<Tips />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}

export default App


