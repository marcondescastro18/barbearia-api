# ⚠️ ERRO: Variáveis de Backend no Frontend

## Problema Identificado

Você adicionou variáveis do **BACKEND** no serviço **FRONTEND**:
- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD
- JWT_SECRET, EVOLUTION_API_KEY, etc.

**Isso está causando o erro de build!**

## Solução - Passo a Passo

### 1️⃣ No EasyPanel - Frontend

Acesse o serviço `barbearia-frontend` e:

**Environment Variables → DELETAR TODAS e adicionar apenas:**

```
VITE_API_URL=https://barbearia-backend.[seu-dominio].easypanel.host
```

**Exemplo real:**
```
VITE_API_URL=https://barbearia-backend-7x9k2m.easypanel.host
```

### 2️⃣ Salvar e Rebuild

Clique em **Save** e depois **Rebuild**

---

## Configuração Correta

### Frontend (apenas 1 variável)
```
VITE_API_URL=https://barbearia-backend.[dominio].easypanel.host
```

### Backend (10 variáveis)
```
DB_HOST=postgres
DB_PORT=5432
DB_USER=barber_db
DB_PASSWORD=103f829b00a6538976f9
DB_NAME=barber_db
JWT_SECRET=zMVJrCL0SmQf3b5eKPy2su9kZHqTWNF7
PORT=3000
EVOLUTION_API_KEY=aomQuHkIzClybqVMBJ3A8KFqcEsPgD76h
EVOLUTION_HOST=http://evolution:8080
EVOLUTION_INSTANCE=barbearia
```

---

## Por que isso aconteceu?

- Frontend é aplicação React que roda no **navegador do usuário**
- Backend é API Flask que roda no **servidor**
- Variáveis sensíveis (senhas, secrets) **NUNCA** devem ir para o frontend
- Frontend só precisa saber a URL do backend

## Checklist

- [ ] Frontend tem APENAS VITE_API_URL
- [ ] Backend tem todas as 10 variáveis
- [ ] VITE_API_URL aponta para URL real do backend
- [ ] Rebuild do frontend após remover variáveis
