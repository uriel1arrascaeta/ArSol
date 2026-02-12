from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import time
import os
import json
import google.generativeai as genai
import requests

app = Flask(__name__)

# --- Configuración de CORS (Permisos de Conexión) ---
# Lista de dominios que tienen permiso para conectarse a este backend.
origins = [
    "http://localhost:5173",
    "https://www.arsolsolar.com",
    "https://solar-landing-git-main-uriels-projects-78a30a8d.vercel.app",
    "https://arsol.onrender.com"
]
# Es más seguro especificar los orígenes que permitir todos con `CORS(app)`.
CORS(app, resources={r"/api/*": {"origins": origins}},
     supports_credentials=True)

# --- Configuración de Base de Datos (PostgreSQL para Render) ---
# Render proporciona la URL de la base de datos en la variable de entorno DATABASE_URL.
database_url = os.environ.get('DATABASE_URL')

if not database_url:
    database_url = 'postgresql://postgres:postgres123@127.0.0.1:5432/arsol-db'

if database_url and database_url.startswith("postgres://"):
    # SQLAlchemy prefiere 'postgresql://' en lugar de 'postgres://'
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
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

    # Configuración para cálculos de fechas
    today = datetime.now()
    current_month_income = 0
    prev_month_income = 0

    # Mapa de meses en español para parsear las fechas
    months_map = {
        "Ene": 1, "Feb": 2, "Mar": 3, "Abr": 4, "May": 5, "Jun": 6,
        "Jul": 7, "Ago": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dic": 12
    }

    # Determinar mes y año anterior
    if today.month == 1:
        prev_month = 12
        prev_year = today.year - 1
    else:
        prev_month = today.month - 1
        prev_year = today.year

    for act in activities_query:
        activities_data.append({
            "id": act.id,
            "name": act.name,
            "email": act.email,
            "status": act.status,
            "date": act.date,
            "amount": act.amount
        })

        # Limpiar monto
        try:
            clean_amount = float(act.amount.replace(
                '$', '').replace(',', '').strip())
        except ValueError:
            clean_amount = 0

        # Parsear fecha y sumar a mes correspondiente
        try:
            # Formato esperado: "21 Ene 2026"
            parts = act.date.replace('.', '').split()
            if len(parts) >= 3:
                act_day = int(parts[0])
                act_month_str = parts[1].capitalize()
                act_year = int(parts[2])

                act_month_num = months_map.get(act_month_str)

                if act_month_num:
                    # Verificar si es mes actual
                    if act_year == today.year and act_month_num == today.month:
                        current_month_income += clean_amount
                    # Verificar si es mes anterior
                    elif act_year == prev_year and act_month_num == prev_month:
                        prev_month_income += clean_amount
        except Exception as e:
            print(f"Error calculando fecha para actividad {act.id}: {e}")

    # --- Cálculos de Tendencia ---
    if prev_month_income > 0:
        trend_pct = ((current_month_income - prev_month_income) /
                     prev_month_income) * 100
    else:
        # Si no hubo ingresos el mes pasado pero sí este, es un aumento del 100% (o infinito)
        trend_pct = 100 if current_month_income > 0 else 0

    trend_sign = "+" if trend_pct >= 0 else ""
    trend_text = f"{trend_sign}{trend_pct:.0f}% vs mes anterior"
    trend_up = trend_pct >= 0

    # Estimaciones basadas en ingresos del MES ACTUAL
    current_energy = current_month_income * 0.0273
    current_co2 = current_month_income * 0.0188

    response_stats = {
        "energy": {
            "value": f"{current_energy:,.0f} MWh",
            "trend": trend_text,
            "trendUp": trend_up
        },
        "co2": {
            "value": f"{current_co2:,.0f} Ton",
            "trend": trend_text,
            "trendUp": trend_up
        },
        "income": {
            "value": f"$ {current_month_income:,.0f}",
            "trend": trend_text,
            "trendUp": trend_up
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

# --- Ruta para Landing Page (CRM + DB) ---


@app.route('/api/landing/submit', methods=['POST'])
def submit_lead():
    data = request.json

    # 1. Guardar en Base de Datos Local (para que aparezca en el Dashboard)
    try:
        # Formatear fecha actual ej: "06 Feb 2026"
        current_date = datetime.now().strftime("%d %b %Y")

        new_activity = Activity(
            name=data.get('name', 'Cliente Web'),
            email=data.get('email', ''),
            status="Pendiente",
            date=current_date,
            amount=data.get('billAmount', 'N/A')
        )
        db.session.add(new_activity)
        db.session.commit()
    except Exception as e:
        print(f"Error guardando en DB local: {e}")

    # 2. Enviar al CRM Externo
    # --- CONFIGURACIÓN DEL CRM I.Sales ---
    isales_url = "https://app.isales.company/formulario/cliente"
    # Obtener credenciales de variables de entorno (Configurar en Render)
    isales_fid = os.environ.get('ISALES_FID', "UFD158TR951")
    isales_e = os.environ.get('ISALES_E', "HJK1231ISAL567")

    try:
        # Usar multipart/form-data (requerido por curl --form)
        # Usamos 'files' con tuplas (None, valor) para campos de texto
        isales_payload = {
            'e': (None, isales_e),
            'fid': (None, isales_fid),
            'redirect': (None, '1'),
            # 'teste': (None, 'Sim'),
            'nome': (None, data.get('name', '')),
            'email': (None, data.get('email', '')),
            'telefone': (None, data.get('phone', '')),
            'valor_energia': (None, data.get('billAmount', '')),
            'cidade': (None, data.get('address', ''))
        }

        # Enviar solicitud POST
        response = requests.post(isales_url, files=isales_payload)
        print(f"Respuesta CRM: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error enviando a CRM: {e}")

    return jsonify({"success": True}), 200

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


@app.route('/api/appointments/<int:id>', methods=['PUT'])
def update_appointment(id):
    appt = Appointment.query.get_or_404(id)
    data = request.json
    appt.name = data.get('name', appt.name)
    appt.email = data.get('email', appt.email)
    appt.date = data.get('date', appt.date)
    appt.time = data.get('time', appt.time)
    appt.status = data.get('status', appt.status)
    db.session.commit()
    return jsonify({"success": True, "message": "Cita actualizada"}), 200


@app.route('/api/appointments/<int:id>', methods=['DELETE'])
def delete_appointment(id):
    appt = Appointment.query.get_or_404(id)
    db.session.delete(appt)
    db.session.commit()
    return jsonify({"success": True, "message": "Cita eliminada"}), 200

# --- Ruta de Configuración ---


@app.route('/api/user/password', methods=['PUT'])
def update_password():
    data = request.json
    email = data.get('email')  # Asumimos que el email del admin es conocido
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"success": False, "message": "Usuario no encontrado"}), 404

    if user.password != current_password:
        return jsonify({"success": False, "message": "La contraseña actual es incorrecta"}), 400

    user.password = new_password
    db.session.commit()
    return jsonify({"success": True, "message": "Contraseña actualizada con éxito"}), 200

# --- Ruta de IA (Simulación) ---


@app.route('/api/analyze-bill', methods=['POST'])
def analyze_bill():
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No se envió ningún archivo"}), 400

    file = request.files['file']

    # 1. Configuración de IA (Google Gemini)
    # NOTA: Reemplaza "TU_API_KEY_AQUI" con tu clave real si no usas variables de entorno
    api_key = os.environ.get("GEMINI_API_KEY")
    # api_key = "#Hu44195"  # <-- Descomenta y pega tu clave aquí si sigue fallando

    if api_key:
        try:
            genai.configure(api_key=api_key)
            # Modelo rápido y eficiente
            model = genai.GenerativeModel('gemini-1.5-flash')

            # Leer archivo
            image_data = file.read()

            # Prompt para la IA
            prompt = """
            Actúa como un experto en energía solar. Analiza esta imagen de un recibo de luz (fatura de energia).
            Extrae los datos y responde ÚNICAMENTE con un objeto JSON válido (sin markdown ```json).
            
            Datos a extraer:
            1. "unidadConsumo": Número de la unidad consumidora o cliente (ej: 3912760).
            2. "grupoTarifario": Grupo/Subgrupo (ej: B3, Residencial).
            3. "fase": "Monofásica", "Bifásica" o "Trifásica". Busca términos como "TRIFÁSICO", "BIFÁSICO".
            4. "costoFijo": Costo de disponibilidad o cargo fijo si aparece. Si no, estima según la fase (Mono: 30, Bi: 50, Tri: 100).
            5. "tarifa": Precio unitario del kWh (Suma TE + TUSD si están separados).
            6. "meses": Objeto con las claves exactas: "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez".
            
            Instrucciones para el historial:
            - Busca la tabla de "Histórico de Consumo" o "Consumo Faturado".
            - Mapea los meses encontrados a las claves correspondientes (ej: "NOV/25" -> "Nov", "DEZ/24" -> "Dez").
            - El valor debe ser el consumo en kWh (número).
            - Si un mes no aparece, pon 0.
            
            Estructura JSON requerida:
            {
                "unidadConsumo": "número de servicio o cuenta (string)",
                "grupoTarifario": "tarifa detectada (ej: DAC, 1, 01)",
                "fase": "Fase detectada",
                "costoFijo": "cargo fijo mensual (número o string numérico)",
                "tarifa": "precio promedio por kWh (número o string numérico)",
                "meses": {
                    "Jan": "0", "Fev": "0", "Mar": "0", "Abr": "0", "Mai": "0", "Jun": "0",
                    "Jul": "0", "Ago": "0", "Set": "0", "Out": "0", "Nov": "0", "Dez": "0"
                }
            }
            """

            response = model.generate_content([
                {'mime_type': file.content_type, 'data': image_data},
                prompt
            ])

            # Limpiar respuesta
            text_response = response.text.replace(
                '```json', '').replace('```', '').strip()
            real_data = json.loads(text_response)

            return jsonify({"success": True, "data": real_data}), 200

        except Exception as e:
            print(f"Error IA Real: {e}")
            # Si falla, continuamos al mock para no romper la app, pero podrías retornar error 500
            pass
    else:
        print("❌ Error: No se encontró la variable de entorno GEMINI_API_KEY.")

    # 2. Fallback: Simulación (si no hay API Key o falla la IA)
    print("⚠️ Usando datos simulados (Mock). Configura GEMINI_API_KEY para usar IA real.")
    time.sleep(1.5)  # Simular tiempo de procesamiento

    mock_extracted_data = {
        "unidadConsumo": "98765432100",
        "grupoTarifario": "DAC (Doméstica Alto Consumo)",
        "fase": "Bifásica",
        "costoFijo": "150.00",
        "tarifa": "3.85",
        "meses": {
            "Jan": "450", "Fev": "420", "Mar": "380", "Abr": "410", "Mai": "550", "Jun": "600",
            "Jul": "620", "Ago": "590", "Set": "500", "Out": "480", "Nov": "460", "Dez": "470"
        }
    }

    return jsonify({"success": True, "data": mock_extracted_data}), 200


# Ejecutar creación de tablas al iniciar la app (necesario para Render/Gunicorn)
# Esto asegura que las tablas existan antes de recibir peticiones
try:
    init_db()
except Exception as e:
    print(f"Error al inicializar la base de datos: {e}")

if __name__ == '__main__':
    app.run(debug=True, port=5000)
