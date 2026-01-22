import psycopg2
from psycopg2.extras import RealDictCursor
from config import Config

def get_db_connection():
    """Cria conexão com PostgreSQL"""
    conn = psycopg2.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        cursor_factory=RealDictCursor
    )
    return conn

def execute_query(query, params=None, fetch=True):
    """Executa query com tratamento de erro"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(query, params)
        if fetch:
            result = cursor.fetchall()
            conn.close()
            return result
        else:
            conn.commit()
            conn.close()
            return True
    except Exception as e:
        conn.rollback()
        conn.close()
        raise e

def execute_one(query, params=None):
    """Executa query e retorna um único resultado"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(query, params)
        result = cursor.fetchone()
        conn.close()
        return result
    except Exception as e:
        conn.close()
        raise e
