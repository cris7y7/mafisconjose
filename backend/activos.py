from flask import Blueprint, jsonify, request

from config import get_connection
from auth import token_required

bp = Blueprint('activos', __name__, url_prefix='/api')


@bp.route('/activos')
@token_required
def get_activos():
    conn = get_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM activos ORDER BY id DESC")
        rows = cursor.fetchall()
    conn.close()
    return jsonify(rows)


@bp.route('/activos', methods=['POST'])
@token_required
def crear_activo():
    data = request.get_json() or {}
    if not data.get('nombreActivo') or not data.get('ubicacion') or not data.get('estado'):
        return jsonify({'error': 'Faltan campos'}), 400

    conn = get_connection()
    with conn.cursor() as cursor:
        sql = "INSERT INTO activos (nombreActivo, ubicacion, estado) VALUES (%s, %s, %s)"
        cursor.execute(sql, (data['nombreActivo'], data['ubicacion'], data['estado']))
        conn.commit()
    conn.close()
    return jsonify({'msg': 'Creado'}), 201


@bp.route('/activos/<int:id>', methods=['PUT'])
@token_required
def actualizar_activo(id):
    data = request.get_json() or {}
    if not data.get('nombreActivo') or not data.get('ubicacion') or not data.get('estado'):
        return jsonify({'error': 'Faltan campos'}), 400

    conn = get_connection()
    with conn.cursor() as cursor:
        sql = "UPDATE activos SET nombreActivo=%s, ubicacion=%s, estado=%s WHERE id=%s"
        filas = cursor.execute(sql, (data['nombreActivo'], data['ubicacion'], data['estado'], id))
        conn.commit()
    conn.close()
    if filas == 0:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({'msg': 'Actualizado'})


@bp.route('/activos/<int:id>', methods=['DELETE'])
@token_required
def borrar_activo(id):
    conn = get_connection()
    with conn.cursor() as cursor:
        filas = cursor.execute("DELETE FROM activos WHERE id=%s", (id,))
        conn.commit()
    conn.close()
    if filas == 0:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({'msg': 'Borrado'})


@bp.route('/activos/<int:id>', methods=['OPTIONS'])
def options_activo(id):
    return '', 200
