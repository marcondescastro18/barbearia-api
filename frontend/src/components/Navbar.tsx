import { Link, useLocation, useNavigate } from 'react-router-dom'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const isAdmin = user?.role === 'admin'
  
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }
  
  const isActive = (path: string) => location.pathname === path
  
  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.container}>
        <div style={styles.brand}>
          <Link to="/" style={styles.brandLink}>
            💈 Barbearia
          </Link>
        </div>
        
        <div style={styles.menu}>
          {isAdmin ? (
            <>
              <Link 
                to="/admin" 
                style={{...styles.link, ...(isActive('/admin') && styles.activeLink)}}
              >
                Dashboard
              </Link>
              <Link 
                to="/admin/agendamentos" 
                style={{...styles.link, ...(isActive('/admin/agendamentos') && styles.activeLink)}}
              >
                Agendamentos
              </Link>
              <Link 
                to="/admin/servicos" 
                style={{...styles.link, ...(isActive('/admin/servicos') && styles.activeLink)}}
              >
                Serviços
              </Link>
              <Link 
                to="/admin/barbeiros" 
                style={{...styles.link, ...(isActive('/admin/barbeiros') && styles.activeLink)}}
              >
                Barbeiros
              </Link>
              <Link 
                to="/admin/usuarios" 
                style={{...styles.link, ...(isActive('/admin/usuarios') && styles.activeLink)}}
              >
                Usuários
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/" 
                style={{...styles.link, ...(isActive('/') && styles.activeLink)}}
              >
                Início
              </Link>
              <Link 
                to="/agendamentos" 
                style={{...styles.link, ...(isActive('/agendamentos') && styles.activeLink)}}
              >
                Meus Agendamentos
              </Link>
              <Link 
                to="/novo-agendamento" 
                style={{...styles.link, ...(isActive('/novo-agendamento') && styles.activeLink)}}
              >
                Novo Agendamento
              </Link>
            </>
          )}
          
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Sair
          </button>
        </div>
      </div>
    </nav>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  nav: {
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '1rem 0',
    marginBottom: '2rem'
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  brand: {
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  brandLink: {
    color: 'white',
    textDecoration: 'none'
  },
  menu: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  link: {
    color: '#d1d5db',
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'color 0.2s'
  },
  activeLink: {
    color: 'white',
    fontWeight: '500'
  },
  logoutBtn: {
    background: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.95rem',
    transition: 'background 0.2s'
  }
}

export default Navbar
