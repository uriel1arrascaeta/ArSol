from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import time
import os

app = Flask(__name__)
CORS(app)  # Permite que el Frontend (React) se comunique con este Backend

# --- Configuración de Base de Datos (SQLite) ---
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + \
    os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- Modelos (Tablas) ---


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    # En producción usar hash!
    password = db.Column(db.String(80), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    role = db.Column(db.String(50), nullable=False)


class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.String(50), nullable=False)


class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    time = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), default="Pendiente")

# --- Inicialización de Datos ---


def init_db():
    with app.app_context():
        db.create_all()
        # Crear usuario admin si no existe
        if not User.query.filter_by(email='admin@arsol.com').first():
            admin = User(email='admin@arsol.com', password='admin123',
                         name='Huriel', role='Super Admin')
            db.session.add(admin)

            # Crear actividades de ejemplo iniciales
            activities = [
                Activity(name="Juan Pérez", email="juan@gmail.com",
                         status="Pendiente", date="21 Ene 2026", amount="$ 3,500"),
                Activity(name="Tech Solutions SA", email="contacto@techsol.com",
                         status="Completado", date="20 Ene 2026", amount="$ 12,000"),
                Activity(name="Maria Garcia", email="mgarcia@outlook.com",
                         status="En Proceso", date="19 Ene 2026", amount="$ 4,200"),
                Activity(name="Hotel Sol y Mar", email="admin@solymar.com",
                         status="Pendiente", date="18 Ene 2026", amount="$ 25,000"),
            ]

            # Crear citas de ejemplo
            appointments = [
                Appointment(name="Consultorio Dental", email="dental@mail.com",
                            date="2026-02-10", time="10:00", status="Confirmada"),
            ]
            db.session.add_all(appointments)
            db.session.add_all(activities)
            db.session.commit()
            print("Base de datos inicializada con datos de prueba.")


STATS = {
    "energy": {"value": "1,234 MWh", "trend": "+12% vs mes anterior", "trendUp": True},
    "co2": {"value": "850 Ton", "trend": "+5% vs mes anterior", "trendUp": True},
    "income": {"value": "$ 45,200", "trend": "-2% vs mes anterior", "trendUp": False}
}

# --- Rutas de la API ---


@app.route('/')
def home():
    return "Backend de ArSol funcionando correctamente ☀️"


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    # Buscar usuario en la base de datos
    user = User.query.filter_by(email=email).first()

    if user and user.password == password:
        return jsonify({
            "success": True,
            "token": "fake-jwt-token-123",
            "user": {"name": user.name, "role": user.role}
        }), 200
    else:
        return jsonify({"success": False, "message": "Credenciales incorrectas"}), 401


@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    # Obtener actividades de la base de datos
    activities_query = Activity.query.all()
    activities_data = []

    # Variable para sumar el total de ingresos reales
    total_income = 0

    for act in activities_query:
        activities_data.append({
            "id": act.id,
            "name": act.name,
            "email": act.email,
            "status": act.status,
            "date": act.date,
            "amount": act.amount
        })

        # Calcular suma de ingresos (limpiando el formato "$ 1,200" -> 1200.0)
        try:
            clean_amount = act.amount.replace('$', '').replace(',', '').strip()
            if clean_amount:
                total_income += float(clean_amount)
        except ValueError:
            pass

    # --- Cálculos Dinámicos ---
    # Estimamos la energía y CO2 basándonos en el total de ingresos (tamaño de proyectos).
    # Factores aproximados basados en tus datos de ejemplo ($45k -> 1.2k MWh).

    total_energy = total_income * 0.0273  # Factor de conversión estimado
    total_co2 = total_income * 0.0188     # Factor de conversión estimado

    response_stats = {
        "energy": {
            "value": f"{total_energy:,.0f} MWh",
            "trend": STATS["energy"]["trend"],
            "trendUp": STATS["energy"]["trendUp"]
        },
        "co2": {
            "value": f"{total_co2:,.0f} Ton",
            "trend": STATS["co2"]["trend"],
            "trendUp": STATS["co2"]["trendUp"]
        },
        "income": {
            "value": f"$ {total_income:,.0f}",
            "trend": STATS["income"]["trend"],
            "trendUp": STATS["income"]["trendUp"]
        }
    }

    return jsonify({
        "stats": response_stats,
        "activities": activities_data
    })


@app.route('/api/activities', methods=['POST'])
def add_activity():
    data = request.json
    new_activity = Activity(
        name=data['name'],
        email=data['email'],
        status=data['status'],
        date=data['date'],
        amount=data['amount']
    )
    db.session.add(new_activity)
    db.session.commit()
    return jsonify({"success": True, "message": "Cliente agregado exitosamente"}), 201


@app.route('/api/activities/<int:id>', methods=['PUT'])
def update_activity(id):
    activity = Activity.query.get_or_404(id)
    data = request.json

    activity.name = data.get('name', activity.name)
    activity.email = data.get('email', activity.email)
    activity.status = data.get('status', activity.status)
    activity.date = data.get('date', activity.date)
    activity.amount = data.get('amount', activity.amount)

    db.session.commit()
    return jsonify({"success": True, "message": "Cliente actualizado"}), 200


@app.route('/api/activities/<int:id>', methods=['DELETE'])
def delete_activity(id):
    activity = Activity.query.get_or_404(id)
    db.session.delete(activity)
    db.session.commit()
    return jsonify({"success": True, "message": "Cliente eliminado"}), 200

# --- Rutas de Citas (Appointments) ---


@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    appointments = Appointment.query.all()
    data = []
    for appt in appointments:
        data.append({
            "id": appt.id,
            "name": appt.name,
            "email": appt.email,
            "date": appt.date,
            "time": appt.time,
            "status": appt.status
        })
    return jsonify(data)


@app.route('/api/appointments', methods=['POST'])
def create_appointment():
    data = request.json
    new_appt = Appointment(
        name=data['name'], email=data['email'], date=data['date'], time=data['time'])
    db.session.add(new_appt)
    db.session.commit()
    return jsonify({"success": True, "message": "Cita agendada exitosamente"}), 201


if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
