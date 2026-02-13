from flask import Blueprint, jsonify, request

from config import get_connection
from auth import token_required, roles_required

bp = Blueprint('ordenes', __name__, url_prefix='/api')


@bp.route('/ordenes')
@token_required
def get_ordenes():
    conn = get_connection()
    with conn.cursor() as cursor:
        sql = """
            SELECT o.id, o.reporte_id, r.descripcion AS reporte_desc, a.nombreActivo,
                   o.usuario_id, u.nombre AS usuario_nombre, o.descripcion, o.estado, o.fecha_creacion
            FROM ordenes_trabajo o
            JOIN reportes_falla r ON r.id = o.reporte_id
            JOIN activos a ON a.id = r.activo_id
            JOIN usuarios u ON u.id = o.usuario_id
            ORDER BY o.fecha_creacion DESC
        """
        cursor.execute(sql)
        rows = cursor.fetchall()
    conn.close()
    return jsonify(rows)


@bp.route('/ordenes/sin-asignar')
@token_required
def get_ordenes_sin_asignar():
    conn = get_connection()
    with conn.cursor() as cursor:
        sql = """
            SELECT r.id, r.descripcion, a.nombreActivo
            FROM reportes_falla r
            JOIN activos a ON a.id = r.activo_id
            WHERE NOT EXISTS (SELECT 1 FROM ordenes_trabajo o WHERE o.reporte_id = r.id)
            ORDER BY r.fecha DESC
        """
        cursor.execute(sql)
        rows = cursor.fetchall()
    conn.close()
    return jsonify(rows)


@bp.route('/ordenes', methods=['POST'])
@token_required
@roles_required('administrador', 'tecnico')
def crear_orden():
    data = request.get_json() or {}
    if not data.get('reporte_id') or not data.get('usuario_id') or not data.get('descripcion'):
        return jsonify({'error': 'Faltan campos'}), 400

    conn = get_connection()
    with conn.cursor() as cursor:
        sql = "INSERT INTO ordenes_trabajo (reporte_id, usuario_id, descripcion, estado) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (data['reporte_id'], data['usuario_id'], data['descripcion'], 'Asignada'))
        conn.commit()
    conn.close()
    return jsonify({'msg': 'Orden creada'}), 201


@bp.route('/ordenes/<int:id>/estado', methods=['PUT'])
@token_required
@roles_required('administrador', 'tecnico')
def cambiar_estado_orden(id):
    data = request.get_json() or {}
    nuevo_estado = data.get('estado')
    if nuevo_estado not in ['Asignada', 'En proceso', 'Completada']:
        return jsonify({'error': 'Estado inválido'}), 400

    conn = get_connection()
    with conn.cursor() as cursor:
        sql = "UPDATE ordenes_trabajo SET estado=%s WHERE id=%s"
        filas = cursor.execute(sql, (nuevo_estado, id))
        conn.commit()
    conn.close()
    if filas == 0:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({'msg': 'Estado actualizado'})


@bp.route('/ordenes/<int:id>', methods=['DELETE'])
@token_required
@roles_required('administrador')
def borrar_orden(id):
    conn = get_connection()
    with conn.cursor() as cursor:
        filas = cursor.execute("DELETE FROM ordenes_trabajo WHERE id=%s", (id,))
        conn.commit()
    conn.close()
    if filas == 0:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({'msg': 'Borrado'})


@bp.route('/ordenes/<int:id>', methods=['OPTIONS'])
def options_orden(id):
    return '', 200
