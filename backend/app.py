from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask_cors import CORS
import bcrypt
import json
from datetime import datetime, timedelta
import requests
from config import Config
from db import execute_query, execute_one

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = Config.JWT_ACCESS_TOKEN_EXPIRES

CORS(app)
jwt = JWTManager(app)

# ====================================================================
# AUTH ROUTES
# ====================================================================

@app.route('/auth/register', methods=['POST'])
def register():
    """Registra novo usuário"""
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        phone = data.get('phone', '')
        
        if not name or not email or not password:
            return jsonify({'error': 'Dados incompletos'}), 400
        
        # Verifica se email já existe
        user_exists = execute_one('SELECT id FROM users WHERE email = %s', (email,))
        if user_exists:
            return jsonify({'error': 'Email já cadastrado'}), 409
        
        # Hash da senha
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Insere usuário
        query = '''
            INSERT INTO users (name, email, password, phone, role, created_at)
            VALUES (%s, %s, %s, %s, 'client', NOW())
            RETURNING id, name, email, role
        '''
        execute_query(query, (name, email, hashed.decode('utf-8'), phone), fetch=False)
        
        user = execute_one('SELECT id, name, email, role FROM users WHERE email = %s', (email,))
        
        token = create_access_token(identity=user['id'], additional_claims={'role': user['role']})
        
        return jsonify({
            'token': token,
            'user': dict(user)
        }), 201
        
    except Exception as e:
        print(f"Erro ao registrar: {str(e)}")
        return jsonify({'error': 'Erro ao registrar usuário'}), 500

@app.route('/auth/login', methods=['POST'])
def login():
    """Autentica usuário"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email e senha obrigatórios'}), 400
        
        user = execute_one('SELECT * FROM users WHERE email = %s', (email,))
        
        if not user:
            return jsonify({'error': 'Credenciais inválidas'}), 401
        
        # Verifica senha
        if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            return jsonify({'error': 'Credenciais inválidas'}), 401
        
        token = create_access_token(identity=user['id'], additional_claims={'role': user['role']})
        
        return jsonify({
            'token': token,
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'role': user['role']
            }
        }), 200
        
    except Exception as e:
        print(f"Erro ao logar: {str(e)}")
        return jsonify({'error': 'Erro ao autenticar'}), 500

# ====================================================================
# CLIENT ROUTES
# ====================================================================

@app.route('/services', methods=['GET'])
def get_services():
    """Lista todos os serviços ativos"""
    try:
        services = execute_query('SELECT * FROM services WHERE active = true ORDER BY name')
        return jsonify(list(services)), 200
    except Exception as e:
        print(f"Erro ao buscar serviços: {str(e)}")
        return jsonify({'error': 'Erro ao buscar serviços'}), 500

@app.route('/barbers', methods=['GET'])
def get_barbers():
    """Lista todos os barbeiros ativos"""
    try:
        barbers = execute_query('SELECT * FROM barbers WHERE active = true ORDER BY name')
        return jsonify(list(barbers)), 200
    except Exception as e:
        print(f"Erro ao buscar barbeiros: {str(e)}")
        return jsonify({'error': 'Erro ao buscar barbeiros'}), 500

@app.route('/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    """Lista agendamentos do usuário logado"""
    try:
        user_id = get_jwt_identity()
        
        query = '''
            SELECT 
                a.id, a.date, a.time, a.status,
                s.name as service_name, s.price, s.duration,
                b.name as barber_name
            FROM appointments a
            JOIN services s ON a.service_id = s.id
            JOIN barbers b ON a.barber_id = b.id
            WHERE a.user_id = %s
            ORDER BY a.date DESC, a.time DESC
        '''
        
        appointments = execute_query(query, (user_id,))
        return jsonify(list(appointments)), 200
        
    except Exception as e:
        print(f"Erro ao buscar agendamentos: {str(e)}")
        return jsonify({'error': 'Erro ao buscar agendamentos'}), 500

@app.route('/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    """Cria novo agendamento"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        service_id = data.get('service_id')
        barber_id = data.get('barber_id')
        date = data.get('date')
        time = data.get('time')
        
        if not all([service_id, barber_id, date, time]):
            return jsonify({'error': 'Dados incompletos'}), 400
        
        # Verifica conflito de horário
        conflict = execute_one(
            '''
            SELECT id FROM appointments 
            WHERE barber_id = %s AND date = %s AND time = %s AND status != 'cancelled'
            ''',
            (barber_id, date, time)
        )
        
        if conflict:
            return jsonify({'error': 'Horário indisponível'}), 409
        
        # Insere agendamento
        query = '''
            INSERT INTO appointments (user_id, service_id, barber_id, date, time, status, created_at)
            VALUES (%s, %s, %s, %s, %s, 'confirmed', NOW())
            RETURNING id
        '''
        
        execute_query(query, (user_id, service_id, barber_id, date, time), fetch=False)
        
        return jsonify({'message': 'Agendamento criado com sucesso'}), 201
        
    except Exception as e:
        print(f"Erro ao criar agendamento: {str(e)}")
        return jsonify({'error': 'Erro ao criar agendamento'}), 500

@app.route('/appointments/<int:id>', methods=['DELETE'])
@jwt_required()
def cancel_appointment(id):
    """Cancela agendamento"""
    try:
        user_id = get_jwt_identity()
        
        # Verifica se agendamento pertence ao usuário
        appointment = execute_one(
            'SELECT * FROM appointments WHERE id = %s AND user_id = %s',
            (id, user_id)
        )
        
        if not appointment:
            return jsonify({'error': 'Agendamento não encontrado'}), 404
        
        # Cancela agendamento
        execute_query(
            "UPDATE appointments SET status = 'cancelled' WHERE id = %s",
            (id,),
            fetch=False
        )
        
        return jsonify({'message': 'Agendamento cancelado'}), 200
        
    except Exception as e:
        print(f"Erro ao cancelar agendamento: {str(e)}")
        return jsonify({'error': 'Erro ao cancelar agendamento'}), 500

# ====================================================================
# ADMIN ROUTES
# ====================================================================

def admin_required():
    """Decorator para verificar se usuário é admin"""
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Acesso negado'}), 403
    return None

@app.route('/admin/metrics', methods=['GET'])
@jwt_required()
def get_metrics():
    """Retorna métricas do dashboard admin"""
    error = admin_required()
    if error:
        return error
    
    try:
        # Total de agendamentos
        total = execute_one('SELECT COUNT(*) as count FROM appointments')['count']
        
        # Agendamentos do dia
        today = datetime.now().strftime('%Y-%m-%d')
        today_count = execute_one(
            "SELECT COUNT(*) as count FROM appointments WHERE date = %s AND status != 'cancelled'",
            (today,)
        )['count']
        
        # Receita estimada
        revenue = execute_one(
            '''
            SELECT COALESCE(SUM(s.price), 0) as total
            FROM appointments a
            JOIN services s ON a.service_id = s.id
            WHERE a.status = 'confirmed'
            '''
        )['total']
        
        # Serviços mais usados
        top_services = execute_query(
            '''
            SELECT s.name, COUNT(*) as count
            FROM appointments a
            JOIN services s ON a.service_id = s.id
            WHERE a.status != 'cancelled'
            GROUP BY s.name
            ORDER BY count DESC
            LIMIT 5
            '''
        )
        
        return jsonify({
            'total_appointments': total,
            'today_appointments': today_count,
            'estimated_revenue': float(revenue),
            'top_services': list(top_services)
        }), 200
        
    except Exception as e:
        print(f"Erro ao buscar métricas: {str(e)}")
        return jsonify({'error': 'Erro ao buscar métricas'}), 500

@app.route('/admin/appointments', methods=['GET'])
@jwt_required()
def admin_get_appointments():
    """Lista todos os agendamentos (admin)"""
    error = admin_required()
    if error:
        return error
    
    try:
        query = '''
            SELECT 
                a.id, a.date, a.time, a.status, a.created_at,
                u.name as client_name, u.phone as client_phone,
                s.name as service_name, s.price,
                b.name as barber_name
            FROM appointments a
            JOIN users u ON a.user_id = u.id
            JOIN services s ON a.service_id = s.id
            JOIN barbers b ON a.barber_id = b.id
            ORDER BY a.date DESC, a.time DESC
        '''
        
        appointments = execute_query(query)
        return jsonify(list(appointments)), 200
        
    except Exception as e:
        print(f"Erro ao buscar agendamentos: {str(e)}")
        return jsonify({'error': 'Erro ao buscar agendamentos'}), 500

@app.route('/admin/users', methods=['GET'])
@jwt_required()
def admin_get_users():
    """Lista todos os usuários"""
    error = admin_required()
    if error:
        return error
    
    try:
        users = execute_query(
            'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
        )
        return jsonify(list(users)), 200
        
    except Exception as e:
        print(f"Erro ao buscar usuários: {str(e)}")
        return jsonify({'error': 'Erro ao buscar usuários'}), 500

@app.route('/admin/services', methods=['POST'])
@jwt_required()
def admin_create_service():
    """Cria novo serviço"""
    error = admin_required()
    if error:
        return error
    
    try:
        data = request.get_json()
        name = data.get('name')
        description = data.get('description', '')
        price = data.get('price')
        duration = data.get('duration')
        
        if not all([name, price, duration]):
            return jsonify({'error': 'Dados incompletos'}), 400
        
        query = '''
            INSERT INTO services (name, description, price, duration, active)
            VALUES (%s, %s, %s, %s, true)
            RETURNING id
        '''
        
        execute_query(query, (name, description, price, duration), fetch=False)
        
        return jsonify({'message': 'Serviço criado com sucesso'}), 201
        
    except Exception as e:
        print(f"Erro ao criar serviço: {str(e)}")
        return jsonify({'error': 'Erro ao criar serviço'}), 500

@app.route('/admin/services/<int:id>', methods=['DELETE'])
@jwt_required()
def admin_delete_service(id):
    """Remove serviço"""
    error = admin_required()
    if error:
        return error
    
    try:
        execute_query('UPDATE services SET active = false WHERE id = %s', (id,), fetch=False)
        return jsonify({'message': 'Serviço removido'}), 200
        
    except Exception as e:
        print(f"Erro ao remover serviço: {str(e)}")
        return jsonify({'error': 'Erro ao remover serviço'}), 500

@app.route('/admin/barbers', methods=['POST'])
@jwt_required()
def admin_create_barber():
    """Cadastra novo barbeiro"""
    error = admin_required()
    if error:
        return error
    
    try:
        data = request.get_json()
        name = data.get('name')
        phone = data.get('phone', '')
        
        if not name:
            return jsonify({'error': 'Nome obrigatório'}), 400
        
        query = '''
            INSERT INTO barbers (name, phone, active)
            VALUES (%s, %s, true)
            RETURNING id
        '''
        
        execute_query(query, (name, phone), fetch=False)
        
        return jsonify({'message': 'Barbeiro cadastrado com sucesso'}), 201
        
    except Exception as e:
        print(f"Erro ao cadastrar barbeiro: {str(e)}")
        return jsonify({'error': 'Erro ao cadastrar barbeiro'}), 500

@app.route('/admin/barbers/<int:id>', methods=['DELETE'])
@jwt_required()
def admin_delete_barber(id):
    """Remove barbeiro"""
    error = admin_required()
    if error:
        return error
    
    try:
        execute_query('UPDATE barbers SET active = false WHERE id = %s', (id,), fetch=False)
        return jsonify({'message': 'Barbeiro removido'}), 200
        
    except Exception as e:
        print(f"Erro ao remover barbeiro: {str(e)}")
        return jsonify({'error': 'Erro ao remover barbeiro'}), 500

# ====================================================================
# WHATSAPP WEBHOOK
# ====================================================================

@app.route('/webhook/evolution', methods=['POST'])
def webhook_evolution():
    """Recebe mensagens do WhatsApp via Evolution"""
    try:
        data = request.get_json()
        
        # Extrai dados da mensagem
        event = data.get('event')
        
        if event != 'messages.upsert':
            return jsonify({'status': 'ignored'}), 200
        
        message_data = data.get('data', {})
        key = message_data.get('key', {})
        message = message_data.get('message', {})
        
        from_number = key.get('remoteJid', '').replace('@s.whatsapp.net', '')
        message_text = message.get('conversation') or message.get('extendedTextMessage', {}).get('text', '')
        
        if not from_number or not message_text:
            return jsonify({'status': 'ignored'}), 200
        
        # Processa mensagem
        response = process_whatsapp_message(from_number, message_text)
        
        # Envia resposta
        send_whatsapp_message(from_number, response)
        
        return jsonify({'status': 'processed'}), 200
        
    except Exception as e:
        print(f"Erro no webhook: {str(e)}")
        return jsonify({'error': 'Erro ao processar mensagem'}), 500

def process_whatsapp_message(phone, message):
    """Processa mensagem do WhatsApp e retorna resposta"""
    try:
        # Busca ou cria sessão
        session = execute_one(
            'SELECT * FROM whatsapp_sessions WHERE phone = %s',
            (phone,)
        )
        
        if not session:
            # Cria nova sessão
            execute_query(
                '''
                INSERT INTO whatsapp_sessions (phone, step, created_at, updated_at)
                VALUES (%s, 'menu', NOW(), NOW())
                ''',
                (phone,),
                fetch=False
            )
            session = {'step': 'menu', 'data': {}}
        
        step = session.get('step', 'menu')
        session_data = session.get('data') or {}
        
        # Menu inicial
        if step == 'menu':
            if message == '1':
                update_session(phone, 'service', {})
                services = execute_query('SELECT * FROM services WHERE active = true')
                response = "📋 *Serviços Disponíveis:*\n\n"
                for i, svc in enumerate(services, 1):
                    response += f"{i}. {svc['name']} - R$ {svc['price']} ({svc['duration']} min)\n"
                response += "\nDigite o número do serviço desejado:"
                return response
            else:
                return "🪒 *Bem-vindo à Barbearia!*\n\n1. Agendar horário\n\nDigite *1* para começar:"
        
        # Seleção de serviço
        elif step == 'service':
            services = execute_query('SELECT * FROM services WHERE active = true')
            try:
                idx = int(message) - 1
                if 0 <= idx < len(services):
                    service = services[idx]
                    session_data['service_id'] = service['id']
                    update_session(phone, 'barber', session_data)
                    
                    barbers = execute_query('SELECT * FROM barbers WHERE active = true')
                    response = "💈 *Escolha o barbeiro:*\n\n"
                    for i, barber in enumerate(barbers, 1):
                        response += f"{i}. {barber['name']}\n"
                    response += "\nDigite o número do barbeiro:"
                    return response
                else:
                    return "Opção inválida. Tente novamente:"
            except:
                return "Opção inválida. Tente novamente:"
        
        # Seleção de barbeiro
        elif step == 'barber':
            barbers = execute_query('SELECT * FROM barbers WHERE active = true')
            try:
                idx = int(message) - 1
                if 0 <= idx < len(barbers):
                    barber = barbers[idx]
                    session_data['barber_id'] = barber['id']
                    update_session(phone, 'date', session_data)
                    return "📅 *Digite a data desejada:*\n\nFormato: DD/MM/AAAA\nExemplo: 25/01/2026"
                else:
                    return "Opção inválida. Tente novamente:"
            except:
                return "Opção inválida. Tente novamente:"
        
        # Seleção de data
        elif step == 'date':
            try:
                date_obj = datetime.strptime(message, '%d/%m/%Y')
                date_str = date_obj.strftime('%Y-%m-%d')
                session_data['date'] = date_str
                update_session(phone, 'time', session_data)
                
                return "🕐 *Digite o horário desejado:*\n\nFormato: HH:MM\nExemplo: 14:30"
            except:
                return "Data inválida. Use o formato DD/MM/AAAA\nExemplo: 25/01/2026"
        
        # Seleção de horário
        elif step == 'time':
            try:
                time_obj = datetime.strptime(message, '%H:%M')
                time_str = time_obj.strftime('%H:%M')
                
                # Verifica conflito
                conflict = execute_one(
                    '''
                    SELECT id FROM appointments 
                    WHERE barber_id = %s AND date = %s AND time = %s AND status != 'cancelled'
                    ''',
                    (session_data['barber_id'], session_data['date'], time_str)
                )
                
                if conflict:
                    return "⚠️ Horário indisponível. Tente outro horário:"
                
                session_data['time'] = time_str
                update_session(phone, 'confirm', session_data)
                
                # Busca dados para confirmação
                service = execute_one('SELECT * FROM services WHERE id = %s', (session_data['service_id'],))
                barber = execute_one('SELECT * FROM barbers WHERE id = %s', (session_data['barber_id'],))
                
                return f"""
✅ *Confirme seu agendamento:*

📋 Serviço: {service['name']}
💈 Barbeiro: {barber['name']}
📅 Data: {datetime.strptime(session_data['date'], '%Y-%m-%d').strftime('%d/%m/%Y')}
🕐 Horário: {time_str}
💰 Valor: R$ {service['price']}

Digite *SIM* para confirmar ou *NÃO* para cancelar:
                """
            except:
                return "Horário inválido. Use o formato HH:MM\nExemplo: 14:30"
        
        # Confirmação
        elif step == 'confirm':
            if message.upper() == 'SIM':
                # Busca ou cria usuário na tabela users
                user = execute_one('SELECT * FROM users WHERE phone = %s', (phone,))
                
                if not user:
                    # Cria usuário via WhatsApp
                    hashed = bcrypt.hashpw('whatsapp123'.encode('utf-8'), bcrypt.gensalt())
                    execute_query(
                        '''
                        INSERT INTO users (name, email, password, phone, role, created_at)
                        VALUES (%s, %s, %s, %s, 'client', NOW())
                        RETURNING id
                        ''',
                        (f'Cliente {phone}', f'{phone}@whatsapp.temp', hashed.decode('utf-8'), phone),
                        fetch=False
                    )
                    user = execute_one('SELECT * FROM users WHERE phone = %s', (phone,))
                
                # Registra na tabela whatsapp_users para controle
                whatsapp_user = execute_one('SELECT * FROM whatsapp_users WHERE phone = %s', (phone,))
                if not whatsapp_user:
                    execute_query(
                        'INSERT INTO whatsapp_users (phone, name, created_at) VALUES (%s, %s, NOW())',
                        (phone, user['name']),
                        fetch=False
                    )
                
                # Cria agendamento
                execute_query(
                    '''
                    INSERT INTO appointments (user_id, service_id, barber_id, date, time, status, created_at, origin)
                    VALUES (%s, %s, %s, %s, %s, 'confirmed', NOW(), 'whatsapp')
                    ''',
                    (user['id'], session_data['service_id'], session_data['barber_id'], 
                     session_data['date'], session_data['time']),
                    fetch=False
                )
                
                # Limpa sessão
                execute_query('DELETE FROM whatsapp_sessions WHERE phone = %s', (phone,), fetch=False)
                
                return "✅ *Agendamento confirmado com sucesso!*\n\nVocê receberá uma confirmação em breve.\n\nDigite *1* para fazer outro agendamento."
            else:
                # Limpa sessão
                execute_query('DELETE FROM whatsapp_sessions WHERE phone = %s', (phone,), fetch=False)
                return "❌ Agendamento cancelado.\n\nDigite *1* para começar novamente."
        
        return "Digite *1* para agendar um horário."
        
    except Exception as e:
        print(f"Erro ao processar mensagem: {str(e)}")
        return "Desculpe, ocorreu um erro. Digite *1* para tentar novamente."

def update_session(phone, step, data):
    """Atualiza sessão do WhatsApp"""
    execute_query(
        '''
        UPDATE whatsapp_sessions 
        SET step = %s, data = %s, updated_at = NOW()
        WHERE phone = %s
        ''',
        (step, json.dumps(data), phone),
        fetch=False
    )

def send_whatsapp_message(phone, message):
    """Envia mensagem via Evolution API"""
    try:
        url = f"{Config.EVOLUTION_HOST}/message/sendText/{Config.EVOLUTION_INSTANCE}"
        headers = {
            'apikey': Config.EVOLUTION_API_KEY,
            'Content-Type': 'application/json'
        }
        payload = {
            'number': phone,
            'text': message
        }
        
        response = requests.post(url, json=payload, headers=headers)
        return response.status_code == 200
        
    except Exception as e:
        print(f"Erro ao enviar mensagem: {str(e)}")
        return False

# ====================================================================
# HEALTH CHECK
# ====================================================================

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=Config.PORT, debug=False)
