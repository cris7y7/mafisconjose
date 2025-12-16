from flask import Blueprint, jsonify, request
import pymysql

bp = Blueprint('ordenes', __name__, url_prefix='/api')

def get_connection():
    return pymysql.connect(
        host='127.0.0.2',
        user='root', password='1234', database='activos',
        charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor
    )

# 1. Listar órdenes con JOIN y sin reportes ya asignados
@bp.route('/ordenes')
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

# 2. Órdenes SIN asignar (para select)
@bp.route('/ordenes/sin-asignar')
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

# 3. Crear orden (asigna reporte a técnico)
@bp.route('/ordenes', methods=['POST'])
def crear_orden():
    data = request.get_json()
    conn = get_connection()
    with conn.cursor() as cursor:
        sql = "INSERT INTO ordenes_trabajo (reporte_id, usuario_id, descripcion, estado) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (data['reporte_id'], data['usuario_id'], data['descripcion'], 'Asignada'))
        conn.commit()
    conn.close()
    return jsonify({'msg': 'Orden creada'}), 201

# 4. Cambiar estado (botón "Iniciar" o "Completar")
@bp.route('/ordenes/<int:id>/estado', methods=['PUT'])
def cambiar_estado_orden(id):
    data = request.get_json()
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

# 5. Eliminar orden
@bp.route('/ordenes/<int:id>', methods=['DELETE'])
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