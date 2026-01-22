import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { getMetrics } from '../../services/api'

interface Metrics {
  total_appointments: number
  today_appointments: number
  estimated_revenue: number
  top_services: Array<{ name: string; count: number }>
}

function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    loadMetrics()
  }, [])
  
  const loadMetrics = async () => {
    try {
      const response = await getMetrics()
      setMetrics(response.data)
    } catch (err: any) {
      setError('Erro ao carregar métricas')
    } finally {
      setLoading(false)
    }
  }
  
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
  
  if (error || !metrics) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="card">
            <p className="error">{error}</p>
          </div>
        </div>
      </>
    )
  }
  
  return (
    <>
      <Navbar />
      <div className="container">
        <h1 style={styles.title}>Dashboard Admin</h1>
        
        <div style={styles.metrics}>
          <div className="card" style={styles.metricCard}>
            <div style={styles.metricIcon}>📊</div>
            <div style={styles.metricContent}>
              <p style={styles.metricLabel}>Total de Agendamentos</p>
              <p style={styles.metricValue}>{metrics.total_appointments}</p>
            </div>
          </div>
          
          <div className="card" style={styles.metricCard}>
            <div style={styles.metricIcon}>📅</div>
            <div style={styles.metricContent}>
              <p style={styles.metricLabel}>Agendamentos Hoje</p>
              <p style={styles.metricValue}>{metrics.today_appointments}</p>
            </div>
          </div>
          
          <div className="card" style={styles.metricCard}>
            <div style={styles.metricIcon}>💰</div>
            <div style={styles.metricContent}>
              <p style={styles.metricLabel}>Receita Estimada</p>
              <p style={styles.metricValue}>
                R$ {metrics.estimated_revenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card" style={styles.topServices}>
          <h2 style={styles.subtitle}>🏆 Serviços Mais Populares</h2>
          {metrics.top_services.length === 0 ? (
            <p style={styles.empty}>Nenhum serviço utilizado ainda</p>
          ) : (
            <div style={styles.servicesList}>
              {metrics.top_services.map((service, index) => (
                <div key={index} style={styles.serviceItem}>
                  <span style={styles.serviceName}>{service.name}</span>
                  <span style={styles.serviceCount}>{service.count} agendamentos</span>
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
  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  },
  metricCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem'
  },
  metricIcon: {
    fontSize: '3rem'
  },
  metricContent: {
    flex: 1
  },
  metricLabel: {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginBottom: '0.25rem'
  },
  metricValue: {
    color: '#1f2937',
    fontSize: '1.75rem',
    fontWeight: 'bold'
  },
  topServices: {
    marginTop: '2rem'
  },
  subtitle: {
    fontSize: '1.5rem',
    color: '#1f2937',
    marginBottom: '1rem'
  },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '2rem'
  },
  servicesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  serviceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem'
  },
  serviceName: {
    color: '#1f2937',
    fontWeight: '500'
  },
  serviceCount: {
    color: '#6b7280',
    fontSize: '0.875rem'
  }
}

export default AdminDashboard
