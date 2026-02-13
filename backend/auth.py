import hashlib
import datetime
from functools import wraps
from flask import Blueprint, jsonify, request
import jwt

from config import get_connection, JWT_SECRET

bp = Blueprint('auth', __name__, url_prefix='/api')


def hash_password(password: str) -> str:
    salt = "mafis-salt"
    return hashlib.sha256((password + salt).encode()).hexdigest()


@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
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


@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email y contraseña son obligatorios'}), 400

    conn = get_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT id, nombre, email, rol, password_hash FROM usuarios WHERE email=%s", (email,))
        user = cursor.fetchone()
    conn.close()

    if not user or user['password_hash'] != hash_password(password):
        return jsonify({'error': 'Credenciales inválidas'}), 401

    token = jwt.encode(
        {
            'id': user['id'],
            'nombre': user['nombre'],
            'email': user['email'],
            'rol': user['rol'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),
        },
        JWT_SECRET,
        algorithm="HS256",
    )
    return jsonify({'token': token, 'user': {'id': user['id'], 'nombre': user['nombre'], 'email': user['email'], 'rol': user['rol']}})


@bp.route('/recover', methods=['POST'])
def recover():
    data = request.get_json() or {}
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email es obligatorio'}), 400

    conn = get_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT id FROM usuarios WHERE email=%s", (email,))
        user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({'error': 'El correo no existe'}), 404

    return jsonify({'msg': 'Instrucciones de recuperación enviadas (simulado)'}), 200


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token faltante'}), 401

        if token.startswith('Bearer '):
            token = token.split(' ', 1)[1]

        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            request.user = data
        except Exception:
            return jsonify({'error': 'Token inválido o expirado'}), 401
        return f(*args, **kwargs)

    return decorated


def roles_required(*roles):
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            user = getattr(request, 'user', None)
            if not user:
                return jsonify({'error': 'No autenticado'}), 401
            if user.get('rol') not in roles:
                return jsonify({'error': 'No autorizado'}), 403
            return f(*args, **kwargs)

        return wrapped

    return decorator


@bp.route('/dashboard')
@token_required
def dashboard():
    return jsonify({'msg': f"Bienvenido {request.user.get('nombre', request.user.get('email', 'usuario'))}", 'rol': request.user['rol']})


@bp.route('/dashboard', methods=['OPTIONS'])
def options_dashboard():
    return '', 200
