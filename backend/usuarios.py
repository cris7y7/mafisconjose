# backend/routes/usuarios.py
from flask import Blueprint, jsonify, request
import pymysql
import hashlib

bp = Blueprint('usuarios', __name__, url_prefix='/api')

def get_connection():
    return pymysql.connect(
        host='127.0.0.2',
        user='root',
        password='1234',
        database='activos',
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

def hash_password(password: str) -> str:
    salt = "mafis-salt"
    return hashlib.sha256((password + salt).encode()).hexdigest()

# 1. Listar (sin passwords)
@bp.route('/usuarios')
def get_usuarios():
    conn = get_connection()
    with conn.cursor() as cursor:
        cursor.execute(
            "SELECT id, nombre, email, rol, fecha_registro "
            "FROM usuarios ORDER BY id DESC"
        )
        rows = cursor.fetchall()
    conn.close()
    return jsonify(rows)

# 2. Crear usuario
@bp.route('/usuarios', methods=['POST'])
def crear_usuario():
    data = request.get_json()
    conn = get_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT id FROM usuarios WHERE email=%s", (data['email'],))
        if cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Email ya registrado'}), 409

        pwd_hash = hash_password(data['password'])
        sql = (
            "INSERT INTO usuarios (nombre, email, password_hash, rol) "
            "VALUES (%s, %s, %s, %s)"
        )
        cursor.execute(
            sql,
            (data['nombre'], data['email'], pwd_hash, data.get('rol', 'solicitante'))
        )
        conn.commit()
    conn.close()
    return jsonify({'msg': 'Usuario creado'}), 201

# 3. Editar usuario (password opcional)
@bp.route('/usuarios/<int:id>', methods=['PUT'])
def actualizar_usuario(id):
    data = request.get_json()
    conn = get_connection()
    with conn.cursor() as cursor:
        # campos básicos
        sql_base = "UPDATE usuarios SET nombre=%s, email=%s, rol=%s"
        params = [data['nombre'], data['email'], data['rol']]

        # ¿llegó nueva contraseña?
        if data.get('password'):
            params.append(hash_password(data['password']))
            sql_base += ", password_hash=%s"

        sql = sql_base + " WHERE id=%s"
        params.append(id)

        filas = cursor.execute(sql, params)
        conn.commit()
    conn.close()
    if filas == 0:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({'msg': 'Actualizado'})

# 4. Eliminar usuario (solo si no tiene órdenes)
@bp.route('/usuarios/<int:id>', methods=['DELETE'])
def borrar_usuario(id):
    conn = get_connection()
    with conn.cursor() as cursor:
        cursor.execute(
            "SELECT COUNT(*) AS total FROM ordenes_trabajo WHERE usuario_id = %s",
            (id,)
        )
        count = cursor.fetchone()['total']
        if count > 0:
            conn.close()
            return jsonify(
                {'error': 'No se puede eliminar: tiene órdenes asociadas'}
            ), 409

        filas = cursor.execute("DELETE FROM usuarios WHERE id=%s", (id,))
        conn.commit()
    conn.close()
    if filas == 0:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({'msg': 'Borrado'})

# 5. CORS pre-flight
@bp.route('/usuarios/<int:id>', methods=['OPTIONS'])
def options_usuario(id):
    return '', 200