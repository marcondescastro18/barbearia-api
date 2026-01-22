import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Agendamentos from './pages/Agendamentos'
import NovoAgendamento from './pages/NovoAgendamento'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminAgendamentos from './pages/Admin/AdminAgendamentos'
import AdminBarbeiros from './pages/Admin/AdminBarbeiros'
import AdminServicos from './pages/Admin/AdminServicos'
import AdminUsuarios from './pages/Admin/AdminUsuarios'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/agendamentos" element={<ProtectedRoute><Agendamentos /></ProtectedRoute>} />
        <Route path="/novo-agendamento" element={<ProtectedRoute><NovoAgendamento /></ProtectedRoute>} />
        
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/agendamentos" element={<AdminRoute><AdminAgendamentos /></AdminRoute>} />
        <Route path="/admin/barbeiros" element={<AdminRoute><AdminBarbeiros /></AdminRoute>} />
        <Route path="/admin/servicos" element={<AdminRoute><AdminServicos /></AdminRoute>} />
        <Route path="/admin/usuarios" element={<AdminRoute><AdminUsuarios /></AdminRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
