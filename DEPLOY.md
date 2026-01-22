# DEPLOY EASYPANEL - GUIA RÁPIDO

## Backend

```yaml
name: barbearia-backend
type: app
repository: https://github.com/marcondescastro18/barbearia-api
branch: main
rootDirectory: /backend
buildMethod: nixpacks
port: 3000

environmentVariables:
  - DB_HOST=postgres
  - DB_PORT=5432
  - DB_USER=barber_db
  - DB_PASSWORD=[senha]
  - DB_NAME=barber_db
  - JWT_SECRET=[chave_aleatoria]
  - PORT=3000
  - EVOLUTION_API_KEY=[chave_evolution]
  - EVOLUTION_HOST=http://evolution:8080
  - EVOLUTION_INSTANCE=barbearia
```

## Frontend

```yaml
name: barbearia-frontend
type: app
repository: https://github.com/marcondescastro18/barbearia-api
branch: main
rootDirectory: /frontend
buildMethod: nixpacks
port: 4173

environmentVariables:
  - VITE_API_URL=https://barbearia-backend.[seu-dominio].easypanel.host
```

**⚠️ ATENÇÃO - FRONTEND:**
- Configure APENAS a variável VITE_API_URL
- **NÃO adicione variáveis do backend** (DB_HOST, DB_PASSWORD, JWT_SECRET, EVOLUTION_API_KEY, etc)
- Substitua [seu-dominio] pela URL real do backend no EasyPanel
- Frontend é aplicação React que roda no navegador, não precisa de credenciais do servidor

## PostgreSQL

```yaml
name: postgres
type: database
database: barber_db
user: barber_db
password: [senha_forte]
```

### Executar Schema

```bash
# Via psql
psql -h [host] -U barber_db -d barber_db < banco_dados/schema.sql

# Via pgAdmin
# Copiar e colar conteúdo de schema.sql no Query Tool
```

## Evolution Manager

```yaml
name: evolution
type: app
image: atendai/evolution-api:latest
port: 8080

environmentVariables:
  - AUTHENTICATION_API_KEY=[sua_chave]
  - DATABASE_ENABLED=true
```

### Configurar Webhook

```bash
curl -X POST https://[evolution-host]/webhook/set/barbearia \
  -H "apikey: [sua_chave]" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://barbearia-backend.[dominio].easypanel.host/webhook/evolution",
    "webhook_by_events": false,
    "webhook_base64": false,
    "events": ["MESSAGES_UPSERT"]
  }'
```

## Verificações

```bash
# Backend Health
curl https://barbearia-backend.[dominio].easypanel.host/health

# Login Admin
curl -X POST https://barbearia-backend.[dominio].easypanel.host/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@barbearia.com","password":"admin123"}'

# Evolution Status
curl https://[evolution-host]/instance/fetchInstances \
  -H "apikey: [sua_chave]"
```
