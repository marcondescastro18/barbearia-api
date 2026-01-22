import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getServices, getBarbers, createAppointment } from '../services/api'

interface Service {
  id: number
  name: string
  description: string
  price: number
  duration: number
}

interface Barber {
  id: number
  name: string
}

function NovoAgendamento() {
  const navigate = useNavigate()
  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [formData, setFormData] = useState({
    service_id: '',
    barber_id: '',
    date: '',
    time: ''
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      const [servicesRes, barbersRes] = await Promise.all([
        getServices(),
        getBarbers()
      ])
      setServices(servicesRes.data)
      setBarbers(barbersRes.data)
    } catch (err: any) {
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    
    if (!navigator.onLine) {
      setError('Sem conexão com a internet. Não é possível criar agendamento offline.')
      setSubmitting(false)
      return
    }
    
    try {
      await createAppointment({
        service_id: Number(formData.service_id),
        barber_id: Number(formData.barber_id),
        date: formData.date,
        time: formData.time
      })
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/agendamentos')
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar agendamento')
    } finally {
      setSubmitting(false)
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
  
  return (
    <>
      <Navbar />
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={styles.title}>Novo Agendamento</h1>
          
          {success && (
            <div className="success" style={styles.successBox}>
              ✅ Agendamento criado com sucesso! Redirecionando...
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label className="label">Serviço</label>
              <select
                name="service_id"
                className="input"
                value={formData.service_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecione um serviço</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - R$ {service.price.toFixed(2)} ({service.duration} min)
                  </option>
                ))}
              </select>
            </div>
            
            <div style={styles.inputGroup}>
              <label className="label">Barbeiro</label>
              <select
                name="barber_id"
                className="input"
                value={formData.barber_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecione um barbeiro</option>
                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={styles.inputGroup}>
              <label className="label">Data</label>
              <input
                type="date"
                name="date"
                className="input"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label className="label">Horário</label>
              <input
                type="time"
                name="time"
                className="input"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
            
            {error && <div className="error">{error}</div>}
            
            <div style={styles.buttons}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Criando...' : 'Criar Agendamento'}
              </button>
              
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate('/agendamentos')}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  title: {
    fontSize: '2rem',
    color: '#1f2937',
    marginBottom: '1.5rem',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  buttons: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem'
  },
  successBox: {
    padding: '1rem',
    backgroundColor: '#d1fae5',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    textAlign: 'center'
  }
}

export default NovoAgendamento
