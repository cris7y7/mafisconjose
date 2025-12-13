from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql
import traceback

app = Flask(__name__)
CORS(app)

def get_connection():
    return pymysql.connect(
        host='127.0.0.1',
        user='root',
        password='1234',
        database='activoss',
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

# Asegurar que el servidor responde correctamente a preflight OPTIONS
@app.after_request
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

# ---------------------- ACTIVOS ------------------------
@app.route('/activoss', methods=['GET'])
def get_activoss():
    try:
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM activosss ORDER BY id ASC")
                rows = cursor.fetchall()
        finally:
            conn.close()
        return jsonify(rows)
    except Exception as e:
        tb = traceback.format_exc()
        print(tb)
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500

@app.route('/activoss', methods=['POST'])
def crear_activo():
    try:
        data = request.get_json(force=True)
        required = ['nombreActivo', 'ubicacion', 'estado']
        for k in required:
            if k not in data:
                return jsonify({'error': f'Falta campo obligatorio: {k}'}), 400

        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                sql = "INSERT INTO activosss (nombreActivo, ubicacion, estado) VALUES (%s, %s, %s)"
                cursor.execute(sql, (data['nombreActivo'], data['ubicacion'], data['estado']))
                conn.commit()
                new_id = cursor.lastrowid
        finally:
            conn.close()
        return jsonify({'msg': 'creado', 'id': new_id}), 201
    except Exception as e:
        tb = traceback.format_exc()
        print(tb)
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500

@app.route('/activoss/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def activo_por_id(id):
    # GET
    if request.method == 'GET':
        try:
            conn = get_connection()
            try:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT * FROM activosss WHERE id = %s", (id,))
                    row = cursor.fetchone()
            finally:
                conn.close()
            if row is None:
                return jsonify({'error': 'No encontrado'}), 404
            return jsonify(row), 200
        except Exception as e:
            tb = traceback.format_exc()
            print(tb)
            return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500

    # PUT (actualizar)
    if request.method == 'PUT':
        try:
            data = request.get_json(force=True)
            required = ['nombreActivo', 'ubicacion', 'estado']
            for k in required:
                if k not in data:
                    return jsonify({'error': f'Falta campo obligatorio: {k}'}), 400
            conn = get_connection()
            try:
                with conn.cursor() as cursor:
                    sql = """
                        UPDATE activosss 
                        SET nombreActivo = %s,
                            ubicacion = %s,
                            estado = %s
                        WHERE id = %s
                    """
                    cursor.execute(sql, (data['nombreActivo'], data['ubicacion'], data['estado'], id))
                    conn.commit()
                    if cursor.rowcount == 0:
                        return jsonify({'error': 'No encontrado'}), 404
            finally:
                conn.close()
            return jsonify({'msg': 'actualizado'}), 200
        except Exception as e:
            tb = traceback.format_exc()
            print(tb)
            return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500

    # DELETE
    if request.method == 'DELETE':
        try:
            conn = get_connection()
            try:
                with conn.cursor() as cursor:
                    cursor.execute("DELETE FROM activosss WHERE id = %s", (id,))
                    conn.commit()
                    if cursor.rowcount == 0:
                        return jsonify({'error': 'No encontrado'}), 404
            finally:
                conn.close()
            return jsonify({'msg': 'eliminado'}), 200
        except Exception as e:
            tb = traceback.format_exc()
            print(tb)
            return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500


# ---------------------- REPORTES DE FALLA (ahora bajo /reportes_falla) ------------------------
# 1. Listar con LEFT JOIN al nombre del activo (use activosss)
@app.route('/reportes_falla', methods=['GET'])
def get_reportes_falla():
    try:
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                sql = """
                    SELECT r.id, r.activo_id, a.nombreActivo AS nombreActivo,
                           r.descripcion, r.prioridad, r.estado, r.fecha
                    FROM reportes_falla r
                    LEFT JOIN activosss a ON a.id = r.activo_id
                    ORDER BY r.fecha DESC
                """
                cursor.execute(sql)
                rows = cursor.fetchall()
        finally:
            conn.close()
        return jsonify(rows)
    except Exception as e:
        tb = traceback.format_exc()
        print(tb)
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500

# 2. Crear reporte (valida que el activo exista)
@app.route('/reportes_falla', methods=['POST'])
def crear_reporte_falla():
    try:
        data = request.get_json(force=True)
        required = ['activo_id', 'descripcion', 'prioridad']
        for k in required:
            if k not in data:
                return jsonify({'error': f'Falta campo obligatorio: {k}'}), 400

        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                # validar activo existe
                cursor.execute("SELECT id FROM activosss WHERE id = %s", (data['activo_id'],))
                if cursor.fetchone() is None:
                    return jsonify({'error': 'Activo no encontrado'}), 404

                sql = "INSERT INTO reportes_falla (activo_id, descripcion, prioridad, estado) VALUES (%s, %s, %s, %s)"
                estado = data.get('estado', 'Reportado')
                cursor.execute(sql, (data['activo_id'], data['descripcion'], data['prioridad'], estado))
                conn.commit()
                new_id = cursor.lastrowid
        finally:
            conn.close()
        return jsonify({'msg': 'creado', 'id': new_id}), 201
    except Exception as e:
        tb = traceback.format_exc()
        print(tb)
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500

# 3. Actualizar reporte
@app.route('/reportes_falla/<int:id>', methods=['PUT'])
def actualizar_reporte_falla(id):
    try:
        data = request.get_json(force=True)
        required = ['activo_id', 'descripcion', 'prioridad', 'estado']
        for k in required:
            if k not in data:
                return jsonify({'error': f'Falta campo obligatorio: {k}'}), 400

        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                # validar activo existe
                cursor.execute("SELECT id FROM activosss WHERE id = %s", (data['activo_id'],))
                if cursor.fetchone() is None:
                    return jsonify({'error': 'Activo no encontrado'}), 404

                sql = "UPDATE reportes_falla SET activo_id=%s, descripcion=%s, prioridad=%s, estado=%s WHERE id=%s"
                filas = cursor.execute(sql, (data['activo_id'], data['descripcion'], data['prioridad'], data['estado'], id))
                conn.commit()
                if filas == 0:
                    return jsonify({'error': 'Not found'}), 404
        finally:
            conn.close()
        return jsonify({'msg': 'Actualizado'}), 200
    except Exception as e:
        tb = traceback.format_exc()
        print(tb)
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500

# 4. Borrar reporte
@app.route('/reportes_falla/<int:id>', methods=['DELETE'])
def borrar_reporte_falla(id):
    try:
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                # ejemplo: proteger si existen órdenes (tabla ordenes_trabajo)
                cursor.execute("SELECT COUNT(*) AS total FROM ordenes_trabajo WHERE reporte_id = %s", (id,))
                row = cursor.fetchone()
                if row and row.get('total', 0) > 0:
                    return jsonify({'error': 'No se puede eliminar: tiene órdenes asociadas'}), 409

                filas = cursor.execute("DELETE FROM reportes_falla WHERE id=%s", (id,))
                conn.commit()
                if filas == 0:
                    return jsonify({'error': 'Not found'}), 404
        finally:
            conn.close()
        return jsonify({'msg': 'Borrado'}), 200
    except Exception as e:
        tb = traceback.format_exc()
        print(tb)
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500



# ---------- USUARIOS ----------

@app.route('/usuarios', methods=['GET'])
def get_usuarios():
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT id, nombre, email, rol, fecha_registro
                FROM usuarios
                ORDER BY id DESC
            """)
            rows = cursor.fetchall()
        conn.close()
        return jsonify(rows)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/usuarios', methods=['POST'])
def crear_usuario():
    try:
        data = request.get_json(force=True)

        required = ['nombre', 'email', 'password', 'rol']
        for k in required:
            if k not in data or not data[k]:
                return jsonify({'error': f'Falta campo: {k}'}), 400

        conn = get_connection()
        with conn.cursor() as cursor:
            sql = """
                INSERT INTO usuarios (nombre, email, password_hash, rol)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql, (
                data['nombre'],
                data['email'],
                data['password'],  # texto plano
                data['rol']
            ))
            conn.commit()
        conn.close()

        return jsonify({'msg': 'Usuario creado'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/usuarios/<int:id>', methods=['PUT'])
def actualizar_usuario(id):
    try:
        data = request.get_json(force=True)

        conn = get_connection()
        with conn.cursor() as cursor:
            if data.get('password'):
                sql = """
                    UPDATE usuarios
                    SET nombre=%s, email=%s, password_hash=%s, rol=%s
                    WHERE id=%s
                """
                cursor.execute(sql, (
                    data['nombre'],
                    data['email'],
                    data['password'],
                    data['rol'],
                    id
                ))
            else:
                sql = """
                    UPDATE usuarios
                    SET nombre=%s, email=%s, rol=%s
                    WHERE id=%s
                """
                cursor.execute(sql, (
                    data['nombre'],
                    data['email'],
                    data['rol'],
                    id
                ))

            conn.commit()
            if cursor.rowcount == 0:
                return jsonify({'error': 'No encontrado'}), 404

        conn.close()
        return jsonify({'msg': 'Usuario actualizado'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/usuarios/<int:id>', methods=['DELETE'])
def borrar_usuario(id):
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM usuarios WHERE id=%s", (id,))
            conn.commit()
            if cursor.rowcount == 0:
                return jsonify({'error': 'No encontrado'}), 404
        conn.close()
        return jsonify({'msg': 'Usuario eliminado'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
