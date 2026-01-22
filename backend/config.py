import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Database
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_USER = os.getenv('DB_USER', 'barber_db')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'senha_forte')
    DB_NAME = os.getenv('DB_NAME', 'barber_db')
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET', 'chave_super_secreta')
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 horas
    
    # Flask
    PORT = int(os.getenv('PORT', 3000))
    
    # Evolution API
    EVOLUTION_API_KEY = os.getenv('EVOLUTION_API_KEY', '')
    EVOLUTION_HOST = os.getenv('EVOLUTION_HOST', 'http://evolution:8080')
    EVOLUTION_INSTANCE = os.getenv('EVOLUTION_INSTANCE', 'barbearia')
