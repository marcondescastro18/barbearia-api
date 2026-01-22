import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { getAppointments, cancelAppointment } from '../services/api'

interface Appointment {
  id: number
  date: string
  time: string
  status: string
  service_name: string
  price: number
  barber_name: string
}

function Agendamentos() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    loadAppointments()
  }, [])
  
  const loadAppointments = async () => {
    try {
      setLoading(true)
      const response = await getAppointments()
      setAppointments(response.data)
    } catch (err: any) {
      setError('Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }
  
  const handleCancel = async (id: number) => {
    if (!confirm('Deseja cancelar este agendamento?')) return
    
    try {
      await cancelAppointment(id)
      loadAppointments()
    } catch (err: any) {
      alert('Erro ao cancelar agendamento')
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
          <h1 style={styles.title}>Meus Agendamentos</h1>
          
          {error && <div className="error">{error}</div>}
          
          {appointments.length === 0 ? (
            <p style={styles.empty}>Você ainda não tem agendamentos.</p>
          ) : (
            <div style={styles.list}>
              {appointments.map((appointment) => (
                <div key={appointment.id} className="card" style={styles.item}>
                  <div style={styles.itemHeader}>
                    <h3 style={styles.itemTitle}>{appointment.service_name}</h3>
                    {getStatusBadge(appointment.status)}
                  </div>
                  
                  <div style={styles.itemDetails}>
                    <p>👤 Barbeiro: {appointment.barber_name}</p>
                    <p>📅 Data: {formatDate(appointment.date)}</p>
                    <p>🕐 Horário: {appointment.time}</p>
                    <p>💰 Valor: R$ {appointment.price.toFixed(2)}</p>
                  </div>
                  
                  {appointment.status === 'confirmed' && (
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleCancel(appointment.id)}
                      style={styles.cancelBtn}
                    >
                      Cancelar
                    </button>
                  )}
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
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '2rem'
  },
  list: {
    display: 'grid',
    gap: '1rem'
  },
  item: {
    border: '1px solid #e5e7eb'
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  itemTitle: {
    fontSize: '1.25rem',
    color: '#1f2937'
  },
  badge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  itemDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    color: '#6b7280',
    marginBottom: '1rem'
  },
  cancelBtn: {
    marginTop: '0.5rem'
  }
}

export default Agendamentos
