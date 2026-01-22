import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { getAdminAppointments } from '../../services/api'

interface Appointment {
  id: number
  date: string
  time: string
  status: string
  client_name: string
  client_phone: string
  service_name: string
  price: number
  barber_name: string
}

function AdminAgendamentos() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  
  useEffect(() => {
    loadAppointments()
  }, [])
  
  const loadAppointments = async () => {
    try {
      const response = await getAdminAppointments()
      setAppointments(response.data)
    } catch (err: any) {
      setError('Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }
  
  const formatDate = (date: string) => {
    return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')
  }
  
  const getStatusBadge = (status: string) => {
    const colors: any = {
      confirmed: '#059669',
      cancelled: '#dc2626',
      completed: '#6b7280'
    }
    
    const labels: any = {
      confirmed: 'Confirmado',
      cancelled: 'Cancelado',
      completed: 'Concluído'
    }
    
    return (
      <span style={{
        ...styles.badge,
        backgroundColor: colors[status] || '#6b7280'
      }}>
        {labels[status] || status}
      </span>
    )
  }
  
  const filteredAppointments = appointments.filter(app => 
    app.client_name.toLowerCase().includes(filter.toLowerCase()) ||
    app.barber_name.toLowerCase().includes(filter.toLowerCase()) ||
    app.service_name.toLowerCase().includes(filter.toLowerCase())
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
          <h1 style={styles.title}>Gerenciar Agendamentos</h1>
          
          <div style={styles.filterContainer}>
            <input
              type="text"
              className="input"
              placeholder="Buscar por cliente, barbeiro ou serviço..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          
          {error && <div className="error">{error}</div>}
          
          {filteredAppointments.length === 0 ? (
            <p style={styles.empty}>Nenhum agendamento encontrado.</p>
          ) : (
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <div>Cliente</div>
                <div>Serviço</div>
                <div>Barbeiro</div>
                <div>Data</div>
                <div>Horário</div>
                <div>Valor</div>
                <div>Status</div>
              </div>
              
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} style={styles.tableRow}>
                  <div>
                    <strong>{appointment.client_name}</strong>
                    <br />
                    <small>{appointment.client_phone}</small>
                  </div>
                  <div>{appointment.service_name}</div>
                  <div>{appointment.barber_name}</div>
                  <div>{formatDate(appointment.date)}</div>
                  <div>{appointment.time}</div>
                  <div>R$ {appointment.price.toFixed(2)}</div>
                  <div>{getStatusBadge(appointment.status)}</div>
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
    gridTemplateColumns: '1.5fr 1fr 1fr 1fr 0.8fr 0.8fr 1fr',
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
    gridTemplateColumns: '1.5fr 1fr 1fr 1fr 0.8fr 0.8fr 1fr',
    gap: '1rem',
    padding: '1rem',
    borderBottom: '1px solid #e5e7eb',
    alignItems: 'center'
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

export default AdminAgendamentos
