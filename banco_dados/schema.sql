-- ====================================================================
-- BARBEARIA - SCHEMA SQL
-- ====================================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- TABELA: users
-- ====================================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('admin', 'client')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_phone ON users(phone);

-- ====================================================================
-- TABELA: services
-- ====================================================================
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration INTEGER NOT NULL, -- em minutos
    active BOOLEAN DEFAULT true
);

CREATE INDEX idx_services_active ON services(active);

-- ====================================================================
-- TABELA: barbers
-- ====================================================================
CREATE TABLE IF NOT EXISTS barbers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    active BOOLEAN DEFAULT true
);

CREATE INDEX idx_barbers_active ON barbers(active);

-- ====================================================================
-- TABELA: appointments
-- ====================================================================
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    service_id INTEGER NOT NULL REFERENCES services(id),
    barber_id INTEGER NOT NULL REFERENCES barbers(id),
    date DATE NOT NULL,
    time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    origin VARCHAR(20) DEFAULT 'web' CHECK (origin IN ('web', 'whatsapp')),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(barber_id, date, time)
);

CREATE INDEX idx_appointments_user ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_barber_date ON appointments(barber_id, date);

-- ====================================================================
-- TABELA: whatsapp_users
-- ====================================================================
CREATE TABLE IF NOT EXISTS whatsapp_users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_users_phone ON whatsapp_users(phone);

-- ====================================================================
-- TABELA: whatsapp_sessions
-- ====================================================================
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    step VARCHAR(50) NOT NULL,
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_sessions_phone ON whatsapp_sessions(phone);

-- ====================================================================
-- DADOS INICIAIS
-- ====================================================================

-- Usuário admin padrão (senha: admin123)
INSERT INTO users (name, email, password, role, created_at) 
VALUES (
    'Administrador', 
    'admin@barbearia.com', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lNoX8fhBWwdG',
    'admin',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Serviços padrão
INSERT INTO services (name, description, price, duration, active) VALUES
('Corte Simples', 'Corte tradicional de cabelo', 30.00, 30, true),
('Corte + Barba', 'Corte de cabelo e barba', 50.00, 45, true),
('Barba', 'Apenas barba', 25.00, 20, true),
('Corte Infantil', 'Corte para crianças até 12 anos', 25.00, 25, true),
('Platinado', 'Descoloração completa', 150.00, 120, true)
ON CONFLICT DO NOTHING;

-- Barbeiros padrão
INSERT INTO barbers (name, phone, active) VALUES
('João Silva', '11999999999', true),
('Pedro Santos', '11988888888', true),
('Carlos Oliveira', '11977777777', true)
ON CONFLICT DO NOTHING;

-- ====================================================================
-- VIEWS ÚTEIS
-- ====================================================================

-- View: Agendamentos completos
CREATE OR REPLACE VIEW vw_appointments_full AS
SELECT 
    a.id,
    a.date,
    a.time,
    a.status,
    a.origin,
    a.created_at,
    u.name as client_name,
    u.email as client_email,
    u.phone as client_phone,
    s.name as service_name,
    s.price as service_price,
    s.duration as service_duration,
    b.name as barber_name
FROM appointments a
JOIN users u ON a.user_id = u.id
JOIN services s ON a.service_id = s.id
JOIN barbers b ON a.barber_id = b.id;

-- View: Métricas diárias
CREATE OR REPLACE VIEW vw_daily_metrics AS
SELECT 
    date,
    COUNT(*) as total_appointments,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
    SUM(CASE WHEN status = 'confirmed' THEN s.price ELSE 0 END) as revenue
FROM appointments a
JOIN services s ON a.service_id = s.id
GROUP BY date
ORDER BY date DESC;
