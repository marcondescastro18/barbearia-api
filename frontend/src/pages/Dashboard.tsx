import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

function Dashboard() {
  const navigate = useNavigate()
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  
  return (
    <>
      <Navbar />
      <div className="container">
        <div className="card">
          <h1 style={styles.title}>Bem-vindo, {user?.name}!</h1>
          <p style={styles.subtitle}>
            Gerencie seus agendamentos de forma fácil e rápida.
          </p>
          
          <div style={styles.actions}>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/novo-agendamento')}
              style={styles.actionBtn}
            >
              ➕ Novo Agendamento
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/agendamentos')}
              style={styles.actionBtn}
            >
              📋 Ver Agendamentos
            </button>
          </div>
        </div>
        
        <div style={styles.info}>
          <div className="card">
            <h3 style={styles.infoTitle}>📱 Baixe o App</h3>
            <p style={styles.infoText}>
              Instale nosso aplicativo para facilitar seus agendamentos!
            </p>
          </div>
          
          <div className="card">
            <h3 style={styles.infoTitle}>💬 WhatsApp</h3>
            <p style={styles.infoText}>
              Você também pode agendar pelo WhatsApp!
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  title: {
    fontSize: '2rem',
    color: '#1f2937',
    marginBottom: '0.5rem'
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: '2rem'
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  actionBtn: {
    flex: 1,
    minWidth: '200px'
  },
  info: {
    marginTop: '2rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem'
  },
  infoTitle: {
    fontSize: '1.25rem',
    color: '#1f2937',
    marginBottom: '0.5rem'
  },
  infoText: {
    color: '#6b7280',
    lineHeight: '1.5'
  }
}

export default Dashboard
