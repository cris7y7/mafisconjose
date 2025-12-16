from flask import Blueprint, jsonify, request
import pymysql

bp = Blueprint('activos', __name__, url_prefix='/api')

def get_connection():
    return pymysql.connect(host='127.0.0.2', user='root', password='1234', database='activos', charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor)

@bp.route('/activos')
def get_activos():
    conn = get_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM activos ORDER BY id DESC")
        rows = cursor.fetchall()
    conn.close()
    return jsonify(rows)

@bp.route('/activos', methods=['POST'])
def crear_activo():
    data = request.get_json()
    conn = get_connection()
    with conn.cursor() as cursor:
        sql = "INSERT INTO activos (nombreActivo, ubicacion, estado) VALUES (%s, %s, %s)"
        cursor.execute(sql, (data['nombreActivo'], data['ubicacion'], data['estado']))
        conn.commit()
    conn.close()
    return jsonify({'msg': 'Creado'}), 201

@bp.route('/activos/<int:id>', methods=['PUT'])
def actualizar_activo(id):
    data = request.get_json()
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