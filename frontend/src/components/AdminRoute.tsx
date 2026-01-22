import { Navigate } from 'react-router-dom'

interface AdminRouteProps {
  children: React.ReactNode
}

function AdminRoute({ children }: AdminRouteProps) {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  if (userStr) {
    const user = JSON.parse(userStr)
    if (user.role !== 'admin') {
      return <Navigate to="/" replace />
    }
  }
  
  return <>{children}</>
}

export default AdminRoute
