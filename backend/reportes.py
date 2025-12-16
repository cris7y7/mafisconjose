from flask import Blueprint, jsonify, request
import pymysql

bp = Blueprint('reportes', __name__, url_prefix='/api')

def get_connection():
    return pymysql.connect(host='127.0.0.2', user='root', password='1234', database='activos', charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor)

# 1. Listar con JOIN a activo y cuenta de órdenes
@bp.route('/reportes')
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

# ---------- REPORTES SIN ORDEN (para select) ----------
@bp.route('/reportes/sin-orden')
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

# 2. Crear reporte
@bp.route('/reportes', methods=['POST'])
def crear_reporte():
    data = request.get_json()
    conn = get_connection()
    with conn.cursor() as cursor:
        sql = "INSERT INTO reportes_falla (activo_id, descripcion, prioridad, estado) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (data['activo_id'], data['descripcion'], data['prioridad'], 'Reportado'))
        conn.commit()
    conn.close()
    return jsonify({'msg': 'Reporte creado'}), 201

# 3. Editar reporte
@bp.route('/reportes/<int:id>', methods=['PUT'])
def actualizar_reporte(id):
    data = request.get_json()
    conn = get_connection()
    with conn.cursor() as cursor:
        sql = "UPDATE reportes_falla SET activo_id=%s, descripcion=%s, prioridad=%s, estado=%s WHERE id=%s"
        filas = cursor.execute(sql, (data['activo_id'], data['descripcion'], data['prioridad'], data['estado'], id))
        conn.commit()
    conn.close()
    if filas == 0:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({'msg': 'Actualizado'})

# 4. Eliminar reporte (solo si no tiene órdenes)
@bp.route('/reportes/<int:id>', methods=['DELETE'])
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