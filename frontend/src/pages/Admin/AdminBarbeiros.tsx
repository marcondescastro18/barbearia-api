import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { getBarbers, createBarber, deleteBarber } from '../../services/api'

interface Barber {
  id: number
  name: string
  phone: string
  active: boolean
}

function AdminBarbeiros() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  })
  
  useEffect(() => {
    loadBarbers()
  }, [])
  
  const loadBarbers = async () => {
    try {
      const response = await getBarbers()
      setBarbers(response.data)
    } catch (err: any) {
      setError('Erro ao carregar barbeiros')
    } finally {
      setLoading(false)
    }
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      await createBarber(formData)
      setFormData({ name: '', phone: '' })
      setShowForm(false)
      loadBarbers()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar barbeiro')
    }
  }
  
  const handleDelete = async (id: number) => {
    if (!confirm('Deseja remover este barbeiro?')) return
    
    try {
      await deleteBarber(id)
      loadBarbers()
    } catch (err: any) {
      alert('Erro ao remover barbeiro')
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
            <h1 style={styles.title}>Gerenciar Barbeiros</h1>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancelar' : '+ Novo Barbeiro'}
            </button>
          </div>
          
          {showForm && (
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.inputGroup}>
                  <label className="label">Nome</label>
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
                  <label className="label">Telefone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="input"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              
              {error && <div className="error">{error}</div>}
              
              <button type="submit" className="btn btn-primary">
                Cadastrar Barbeiro
              </button>
            </form>
          )}
          
          <div style={styles.list}>
            {barbers.length === 0 ? (
              <p style={styles.empty}>Nenhum barbeiro cadastrado.</p>
            ) : (
              barbers.map((barber) => (
                <div key={barber.id} className="card" style={styles.item}>
                  <div style={styles.itemContent}>
                    <div>
                      <h3 style={styles.itemTitle}>{barber.name}</h3>
                      <p style={styles.itemPhone}>{barber.phone}</p>
                    </div>
                    
                    <div style={styles.itemActions}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: barber.active ? '#059669' : '#dc2626'
                      }}>
                        {barber.active ? 'Ativo' : 'Inativo'}
                      </span>
                      
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDelete(barber.id)}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
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
    marginBottom: '1.5rem'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  list: {
    display: 'grid',
    gap: '1rem',
    marginTop: '1.5rem'
  },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '2rem'
  },
  item: {
    border: '1px solid #e5e7eb'
  },
  itemContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  itemTitle: {
    fontSize: '1.25rem',
    color: '#1f2937',
    marginBottom: '0.25rem'
  },
  itemPhone: {
    color: '#6b7280',
    fontSize: '0.9rem'
  },
  itemActions: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  badge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500'
  }
}

export default AdminBarbeiros
