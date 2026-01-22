import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { getServices, createService, deleteService } from '../../services/api'

interface Service {
  id: number
  name: string
  description: string
  price: number
  duration: number
  active: boolean
}

function AdminServicos() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: ''
  })
  
  useEffect(() => {
    loadServices()
  }, [])
  
  const loadServices = async () => {
    try {
      const response = await getServices()
      setServices(response.data)
    } catch (err: any) {
      setError('Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      await createService({
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        duration: Number(formData.duration)
      })
      setFormData({ name: '', description: '', price: '', duration: '' })
      setShowForm(false)
      loadServices()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar serviço')
    }
  }
  
  const handleDelete = async (id: number) => {
    if (!confirm('Deseja remover este serviço?')) return
    
    try {
      await deleteService(id)
      loadServices()
    } catch (err: any) {
      alert('Erro ao remover serviço')
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
        <div className="card">
          <div style={styles.header}>
            <h1 style={styles.title}>Gerenciar Serviços</h1>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancelar' : '+ Novo Serviço'}
            </button>
          </div>
          
          {showForm && (
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label className="label">Nome do Serviço</label>
                <input
                  type="text"
                  name="name"
                  className="input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div style={styles.inputGroup}>
                <label className="label">Descrição</label>
                <textarea
                  name="description"
                  className="input"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.inputGroup}>
                  <label className="label">Preço (R$)</label>
                  <input
                    type="number"
                    name="price"
                    className="input"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label className="label">Duração (minutos)</label>
                  <input
                    type="number"
                    name="duration"
                    className="input"
                    value={formData.duration}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
              </div>
              
              {error && <div className="error">{error}</div>}
              
              <button type="submit" className="btn btn-primary">
                Cadastrar Serviço
              </button>
            </form>
          )}
          
          <div style={styles.grid}>
            {services.length === 0 ? (
              <p style={styles.empty}>Nenhum serviço cadastrado.</p>
            ) : (
              services.map((service) => (
                <div key={service.id} className="card" style={styles.card}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{service.name}</h3>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: service.active ? '#059669' : '#dc2626'
                    }}>
                      {service.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  
                  <p style={styles.description}>{service.description}</p>
                  
                  <div style={styles.cardDetails}>
                    <div>
                      <span style={styles.label}>💰 Preço:</span>
                      <span style={styles.value}>R$ {service.price.toFixed(2)}</span>
                    </div>
                    <div>
                      <span style={styles.label}>⏱️ Duração:</span>
                      <span style={styles.value}>{service.duration} min</span>
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDelete(service.id)}
                    style={styles.deleteBtn}
                  >
                    Remover
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  title: {
    fontSize: '2rem',
    color: '#1f2937'
  },
  form: {
    padding: '1.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
    marginTop: '1.5rem'
  },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '2rem',
    gridColumn: '1 / -1'
  },
  card: {
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    gap: '0.5rem'
  },
  cardTitle: {
    fontSize: '1.25rem',
    color: '#1f2937'
  },
  badge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500',
    whiteSpace: 'nowrap'
  },
  description: {
    color: '#6b7280',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    minHeight: '3rem'
  },
  cardDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.375rem'
  },
  label: {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginRight: '0.5rem'
  },
  value: {
    color: '#1f2937',
    fontWeight: '500'
  },
  deleteBtn: {
    marginTop: 'auto'
  }
}

export default AdminServicos
