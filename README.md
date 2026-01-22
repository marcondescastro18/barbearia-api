# 🪒 Sistema de Agendamento de Barbearia

Sistema completo de agendamento para barbearia com aplicativo web (PWA), integração WhatsApp e painel administrativo.

## 📋 Funcionalidades

### Cliente
- ✅ Cadastro e login
- ✅ Agendar serviços
- ✅ Ver histórico de agendamentos
- ✅ Cancelar agendamentos
- ✅ PWA instalável (funciona como app)

### WhatsApp
- ✅ Agendamento via conversa automática
- ✅ Menu interativo
- ✅ Confirmação de horários
- ✅ Verificação de conflitos

### Administrador
- ✅ Dashboard com métricas
- ✅ Gerenciar agendamentos
- ✅ Gerenciar serviços
- ✅ Gerenciar barbeiros
- ✅ Gerenciar usuários
- ✅ Visualizar receita estimada

## 🛠️ Stack Tecnológica

### Frontend
- **React** 18.2
- **TypeScript**
- **Vite**
- **React Router DOM**
- **Axios**
- **vite-plugin-pwa** (Progressive Web App)

### Backend
- **Python** 3.11
- **Flask** 3.0
- **PostgreSQL**
- **JWT** (autenticação)
- **Bcrypt** (hash de senhas)

### Infraestrutura
- **EasyPanel** (deploy)
- **Nixpacks** (build)
- **Evolution Manager** (WhatsApp)

## 📁 Estrutura do Projeto

```
barbearia-agendamento/
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── pages/         # Páginas
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Agendamentos.tsx
│   │   │   ├── NovoAgendamento.tsx
│   │   │   └── Admin/     # Páginas admin
│   │   ├── components/    # Componentes
│   │   └── services/      # API client
│   ├── public/
│   │   └── icons/         # Ícones PWA
│   ├── package.json
│   └── vite.config.ts
│
├── backend/               # API Flask
│   ├── app.py            # Aplicação principal
│   ├── config.py         # Configurações
│   ├── db.py             # Conexão banco
│   ├── requirements.txt
│   ├── Procfile
│   └── runtime.txt
│
└── banco_dados/
    └── schema.sql        # Schema PostgreSQL
```

## 🚀 Deploy no EasyPanel

### 1. Criar Banco PostgreSQL

1. No EasyPanel, criar serviço PostgreSQL
2. Configurar:
   - **Nome**: `postgres`
   - **Database**: `barber_db`
   - **User**: `barber_db`
   - **Password**: `[senha_forte]`

3. Executar schema SQL:
```bash
psql -h [HOST] -U barber_db -d barber_db < banco_dados/schema.sql
```

### 2. Deploy do Backend

1. Criar **App Service** no EasyPanel
2. Configurar:
   - **Nome**: `barbearia-backend`
   - **Repositório**: [seu-repo]
   - **Branch**: `main`
   - **Root Directory**: `/backend`
   - **Build Method**: Nixpacks
   - **Port**: `3000`

3. Variáveis de Ambiente:
```env
DB_HOST=postgres
DB_PORT=5432
DB_USER=barber_db
DB_PASSWORD=[senha_forte]
DB_NAME=barber_db
JWT_SECRET=[chave_aleatoria_segura]
PORT=3000
EVOLUTION_API_KEY=[sua_chave]
EVOLUTION_HOST=http://evolution:8080
EVOLUTION_INSTANCE=barbearia
```

4. Deploy automático via Procfile

### 3. Deploy do Frontend

1. Criar **App Service** no EasyPanel
2. Configurar:
   - **Nome**: `barbearia-frontend`
   - **Repositório**: [seu-repo]
   - **Branch**: `main`
   - **Root Directory**: `/frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`
   - **Port**: `4173`

3. Variáveis de Ambiente:
```env
VITE_API_URL=https://barbearia-backend.[seudominio].easypanel.host
NODE_VERSION=20
```

### 4. Configurar Evolution Manager

1. Instalar Evolution API no EasyPanel
2. Criar instância WhatsApp
3. Configurar webhook:
   - **URL**: `https://barbearia-backend.[seudominio].easypanel.host/webhook/evolution`
   - **Eventos**: `messages.upsert`

## 🔧 Desenvolvimento Local

### Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Configurar .env
cp .env.example .env
# Editar .env com suas configurações

# Executar
python app.py
```

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env
# Editar .env com URL do backend

# Executar
npm run dev
```

Acesse: `http://localhost:5173`

## 👤 Usuário Admin Padrão

- **Email**: `admin@barbearia.com`
- **Senha**: `admin123`

⚠️ **IMPORTANTE**: Altere a senha após primeiro login!

## 📱 PWA - Instalação

### Android
1. Abra o site no Chrome
2. Toque no menu (⋮)
3. Selecione "Adicionar à tela inicial"

### iOS
1. Abra o site no Safari
2. Toque no botão compartilhar
3. Selecione "Adicionar à Tela de Início"

### Desktop
1. Abra o site no Chrome/Edge
2. Clique no ícone de instalação na barra de endereço
3. Confirme instalação

## 🔌 API Endpoints

### Autenticação
```
POST /auth/register  # Cadastro
POST /auth/login     # Login
```

### Cliente
```
GET  /services              # Listar serviços
GET  /barbers               # Listar barbeiros
GET  /appointments          # Meus agendamentos
POST /appointments          # Criar agendamento
DELETE /appointments/<id>   # Cancelar agendamento
```

### Admin (JWT + role=admin)
```
GET  /admin/metrics         # Métricas dashboard
GET  /admin/appointments    # Todos agendamentos
GET  /admin/users           # Todos usuários
POST /admin/services        # Criar serviço
DELETE /admin/services/<id> # Remover serviço
POST /admin/barbers         # Criar barbeiro
DELETE /admin/barbers/<id>  # Remover barbeiro
```

### WhatsApp
```
POST /webhook/evolution     # Webhook Evolution Manager
```

## 📊 Banco de Dados

### Tabelas Principais

- **users**: Usuários (clientes e admin)
- **services**: Serviços oferecidos
- **barbers**: Barbeiros
- **appointments**: Agendamentos
- **whatsapp_users**: Usuários via WhatsApp
- **whatsapp_sessions**: Sessões de conversa WhatsApp

### Relacionamentos

- appointments → users (user_id)
- appointments → services (service_id)
- appointments → barbers (barber_id)

### Índices

- Unicidade: barbeiro + data + hora
- Índices em: user_id, date, status, barber_id

## 🔒 Segurança

- ✅ JWT para autenticação
- ✅ Bcrypt para hash de senhas
- ✅ CORS configurado
- ✅ Validação de conflitos de horário
- ✅ Role-based access (admin/client)
- ✅ Proteção de rotas sensíveis

## 🐛 Resolução de Problemas

### Backend não conecta ao banco
```bash
# Verificar variáveis de ambiente
echo $DB_HOST
echo $DB_USER

# Testar conexão
psql -h $DB_HOST -U $DB_USER -d $DB_NAME
```

### Frontend não conecta ao backend
```bash
# Verificar VITE_API_URL
cat frontend/.env

# Testar endpoint
curl https://[backend-url]/health
```

### WhatsApp não responde
```bash
# Verificar instância Evolution
curl -X GET https://[evolution-host]/instance/fetchInstances \
  -H "apikey: [sua-chave]"

# Verificar webhook
curl -X GET https://[evolution-host]/webhook/find/[instance] \
  -H "apikey: [sua-chave]"
```

## 📈 Próximos Passos

- [ ] Notificações push
- [ ] Relatórios PDF
- [ ] Integração pagamento
- [ ] Sistema de avaliações
- [ ] Dashboard com gráficos
- [ ] Exportação de dados

## 📄 Licença

Este projeto é proprietário e confidencial.

## 👨‍💻 Suporte

Para suporte, entre em contato com a equipe técnica.

---

**Versão**: 1.0.0  
**Última atualização**: Janeiro 2026
