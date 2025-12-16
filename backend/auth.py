import hashlib
import secrets
import datetime
from flask import Blueprint, jsonify, request
import pymysql
import jwt

bp = Blueprint('auth', __name__, url_prefix='/api')
SECRET = "mafis-secret"

def get_connection():
    return pymysql.connect(host='127.0.0.2', user='root', password='1234', database='activos', charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor)

def hash_password(password: str) -> str:
    salt = "mafis-salt"
    return hashlib.sha256((password + salt).encode()).hexdigest()

# ---------- REGISTRO ----------
@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    nombre = data.get('nombre')
    email = data.get('email')
    password = data.get('password')
    rol = data.get('rol', 'solicitante')
    if not nombre or not email or not password:
        return jsonify({'error': 'Faltan campos'}), 400
    conn = get_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT id FROM usuarios WHERE email=%s", (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Email ya registrado'}), 409
        pwd_hash = hash_password(password)
        sql = "INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (nombre, email, pwd_hash, rol))
        conn.commit()
    conn.close()
    return jsonify({'msg': 'Usuario creado'}), 201

# ---------- LOGIN ----------
@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    conn = get_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT id, nombre, email, rol, password_hash FROM usuarios WHERE email=%s", (email,))
        user = cursor.fetchone()
    conn.close()
    if not user or user['password_hash'] != hash_password(password):
        return jsonify({'error': 'Credenciales inválidas'}), 401
    token = jwt.encode({'id': user['id'], 'email': user['email'], 'rol': user['rol'], 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)}, SECRET, algorithm="HS256")
    return jsonify({'token': token, 'user': {'id': user['id'], 'nombre': user['nombre'], 'email': user['email'], 'rol': user['rol']}})

# ---------- RUTA PROTEGIDA ----------
def token_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token faltante'}), 401
        try:
            data = jwt.decode(token, SECRET, algorithms=["HS256"])
            request.user = data
        except Exception:
            return jsonify({'error': 'Token inválido o expirado'}), 401
        return f(*args, **kwargs)
    return decorated

# ---------- DASHBOARD ----------
@bp.route('/dashboard')
@token_required
def dashboard():
    return jsonify({'msg': f"Bienvenido {request.user['nombre']}", 'rol': request.user['rol']})

@bp.route('/dashboard', methods=['OPTIONS'])
def options_dashboard():
    return '', 200