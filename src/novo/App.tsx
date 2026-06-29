import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getCurrentUser } from './lib/storage'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Financial from './pages/Financial'
import Todo from './pages/Todo'
import Habit from './pages/Habit'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/app/financial" element={<ProtectedRoute><Financial /></ProtectedRoute>} />
        <Route path="/app/todo" element={<ProtectedRoute><Todo /></ProtectedRoute>} />
        <Route path="/app/habit" element={<ProtectedRoute><Habit /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
