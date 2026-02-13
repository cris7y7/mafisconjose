from flask import Blueprint, jsonify, request

from config import get_connection
from auth import token_required

bp = Blueprint('reportes', __name__, url_prefix='/api')


@bp.route('/reportes')
@token_required
def get_reportes():
    conn = get_connection()
    with conn.cursor() as cursor:
        sql = """
            SELECT r.id, r.activo_id, a.nombreActivo, r.descripcion, r.prioridad, r.estado, r.fecha,
                   (SELECT COUNT(*) FROM ordenes_trabajo o WHERE o.reporte_id = r.id) AS ordenes_count
            FROM reportes_falla r
            JOIN activos a ON a.id = r.activo_id
            ORDER BY r.fecha DESC
        """
        cursor.execute(sql)
        rows = cursor.fetchall()
    conn.close()
    return jsonify(rows)


@bp.route('/reportes/sin-orden')
@token_required
def get_reportes_sin_orden():
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


@bp.route('/reportes', methods=['POST'])
@token_required
def crear_reporte():
    data = request.get_json() or {}
    if not data.get('activo_id') or not data.get('descripcion') or not data.get('prioridad'):
        return jsonify({'error': 'Faltan campos'}), 400

    conn = get_connection()
    with conn.cursor() as cursor:
        sql = "INSERT INTO reportes_falla (activo_id, descripcion, prioridad, estado) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (data['activo_id'], data['descripcion'], data['prioridad'], 'Reportado'))
        conn.commit()
    conn.close()
    return jsonify({'msg': 'Reporte creado'}), 201


@bp.route('/reportes/<int:id>', methods=['PUT'])
@token_required
def actualizar_reporte(id):
    data = request.get_json() or {}
    if not data.get('activo_id') or not data.get('descripcion') or not data.get('prioridad') or not data.get('estado'):
        return jsonify({'error': 'Faltan campos'}), 400

    conn = get_connection()
    with conn.cursor() as cursor:
        sql = "UPDATE reportes_falla SET activo_id=%s, descripcion=%s, prioridad=%s, estado=%s WHERE id=%s"
        filas = cursor.execute(sql, (data['activo_id'], data['descripcion'], data['prioridad'], data['estado'], id))
        conn.commit()
    conn.close()
    if filas == 0:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({'msg': 'Actualizado'})


@bp.route('/reportes/<int:id>', methods=['DELETE'])
@token_required
def borrar_reporte(id):
    conn = get_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) AS total FROM ordenes_trabajo WHERE reporte_id = %s", (id,))
        count = cursor.fetchone()['total']
        if count > 0:
            conn.close()
            return jsonify({'error': 'No se puede eliminar: tiene órdenes asociadas'}), 409

        filas = cursor.execute("DELETE FROM reportes_falla WHERE id=%s", (id,))
        conn.commit()
    conn.close()
    if filas == 0:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({'msg': 'Borrado'})


@bp.route('/reportes/<int:id>', methods=['OPTIONS'])
def options_reporte(id):
    return '', 200
