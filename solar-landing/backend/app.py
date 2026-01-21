from flask import Flask, jsonify, request
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)  # Permite que el Frontend (React) se comunique con este Backend

# --- Datos de Ejemplo (Simulación de Base de Datos) ---

STATS = {
    "energy": {"value": "1,234 MWh", "trend": "+12% vs mes anterior", "trendUp": True},
    "co2": {"value": "850 Ton", "trend": "+5% vs mes anterior", "trendUp": True},
    "income": {"value": "$ 45,200", "trend": "-2% vs mes anterior", "trendUp": False}
}

ACTIVITIES = [
    {"id": 1, "name": "Juan Pérez", "email": "juan@gmail.com",
        "status": "Pendiente", "date": "21 Ene 2026", "amount": "$ 3,500"},
    {"id": 2, "name": "Tech Solutions SA", "email": "contacto@techsol.com",
        "status": "Completado", "date": "20 Ene 2026", "amount": "$ 12,000"},
    {"id": 3, "name": "Maria Garcia", "email": "mgarcia@outlook.com",
        "status": "En Proceso", "date": "19 Ene 2026", "amount": "$ 4,200"},
    {"id": 4, "name": "Hotel Sol y Mar", "email": "admin@solymar.com",
        "status": "Pendiente", "date": "18 Ene 2026", "amount": "$ 25,000"},
]

# --- Rutas de la API ---


@app.route('/')
def home():
    return "Backend de ArSol funcionando correctamente ☀️"


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    # Validación simple (Usuario: admin@arsol.com / Pass: admin123)
    if email == 'admin@arsol.com' and password == 'admin123':
        return jsonify({
            "success": True,
            "token": "fake-jwt-token-123",
            "user": {"name": "Huriel", "role": "Super Admin"}
        }), 200
    else:
        return jsonify({"success": False, "message": "Credenciales incorrectas"}), 401


@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    # Aquí devolvemos tanto las estadísticas como la tabla de actividades
    return jsonify({
        "stats": STATS,
        "activities": ACTIVITIES
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
