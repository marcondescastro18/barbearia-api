import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { getAdminUsers } from '../../services/api'

interface User {
  id: number
  name: string
  email: string
  phone: string
  role: string
  created_at: string
}

function AdminUsuarios() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  
  useEffect(() => {
    loadUsers()
  }, [])
  
  const loadUsers = async () => {
    try {
      const response = await getAdminUsers()
      setUsers(response.data)
    } catch (err: any) {
      setError('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }
  
  const getRoleBadge = (role: string) => {
    const colors: any = {
      admin: '#dc2626',
      client: '#059669'
    }
    
    const labels: any = {
      admin: 'Admin',
      client: 'Cliente'
    }
    
    return (
      <span style={{
        ...styles.badge,
        backgroundColor: colors[role] || '#6b7280'
      }}>
        {labels[role] || role}
      </span>
    )
  }
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(filter.toLowerCase()) ||
    user.email.toLowerCase().includes(filter.toLowerCase())
  )
  
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="card text-center">
            <p>Carregando...</p>
          </div>
        </div>
      </>
    )
  }
  
  return (
    <>
      <Navbar />
      <div className="container">
        <div className="card">
          <h1 style={styles.title}>Gerenciar Usuários</h1>
          
          <div style={styles.filterContainer}>
            <input
              type="text"
              className="input"
              placeholder="Buscar por nome ou email..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          
          {error && <div className="error">{error}</div>}
          
          <div style={styles.stats}>
            <div className="card" style={styles.statCard}>
              <p style={styles.statLabel}>Total de Usuários</p>
              <p style={styles.statValue}>{users.length}</p>
            </div>
            <div className="card" style={styles.statCard}>
              <p style={styles.statLabel}>Clientes</p>
              <p style={styles.statValue}>
                {users.filter(u => u.role === 'client').length}
              </p>
            </div>
            <div className="card" style={styles.statCard}>
              <p style={styles.statLabel}>Administradores</p>
              <p style={styles.statValue}>
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
          
          {filteredUsers.length === 0 ? (
            <p style={styles.empty}>Nenhum usuário encontrado.</p>
          ) : (
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <div>Nome</div>
                <div>Email</div>
                <div>Telefone</div>
                <div>Perfil</div>
                <div>Cadastro</div>
              </div>
              
              {filteredUsers.map((user) => (
                <div key={user.id} style={styles.tableRow}>
                  <div style={styles.userName}>{user.name}</div>
                  <div>{user.email}</div>
                  <div>{user.phone || '-'}</div>
                  <div>{getRoleBadge(user.role)}</div>
                  <div>{formatDate(user.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  title: {
    fontSize: '2rem',
    color: '#1f2937',
    marginBottom: '1.5rem'
  },
  filterContainer: {
    marginBottom: '1.5rem'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  },
  statCard: {
    textAlign: 'center',
    padding: '1.5rem'
  },
  statLabel: {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginBottom: '0.5rem'
  },
  statValue: {
    color: '#1f2937',
    fontSize: '2rem',
    fontWeight: 'bold'
  },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '2rem'
  },
  table: {
    overflowX: 'auto'
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 2fr 1.2fr 1fr 1fr',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '0.5rem'
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 2fr 1.2fr 1fr 1fr',
    gap: '1rem',
    padding: '1rem',
    borderBottom: '1px solid #e5e7eb',
    alignItems: 'center'
  },
  userName: {
    fontWeight: '500',
    color: '#1f2937'
  },
  badge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500',
    display: 'inline-block'
  }
}

export default AdminUsuarios
