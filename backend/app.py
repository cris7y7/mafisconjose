from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# ---------- REGISTRO DE BLUEPRINTS ----------
from auth import bp as auth_bp
from activos import bp as activos_bp
from reportes import bp as reportes_bp
from usuarios import bp as usuarios_bp
from ordenes import bp as ordenes_bp

app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(activos_bp, url_prefix='/api')
app.register_blueprint(reportes_bp, url_prefix='/api')
app.register_blueprint(usuarios_bp, url_prefix='/api')
app.register_blueprint(ordenes_bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True)
    
    
    
    
    
    