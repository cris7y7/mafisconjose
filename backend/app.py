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

# ---------------------- CREAR ------------------------
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
        finally:
            conn.close()

        return jsonify({'msg': 'creado'}), 201

    except Exception as e:
        tb = traceback.format_exc()
        print(tb)
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500


# ---------------------- LISTAR ------------------------
@app.route('/activoss', methods=['GET'])
def get_activoss():
    try:
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM activosss")
                rows = cursor.fetchall()
        finally:
            conn.close()
        return jsonify(rows)
    except Exception as e:
        tb = traceback.format_exc()
        print(tb)
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500


# ---------------------- ELIMINAR ------------------------
@app.route('/activoss/<int:id>', methods=['DELETE'])
def eliminar_activo(id):
    try:
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                sql = "DELETE FROM activosss WHERE id = %s"
                cursor.execute(sql, (id,))
                conn.commit()
        finally:
            conn.close()

        return jsonify({'msg': 'eliminado'}), 200

    except Exception as e:
        tb = traceback.format_exc()
        print(tb)
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
