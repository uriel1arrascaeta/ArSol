from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta, date
import time
import os
import json
from google import genai
from urllib.parse import quote_plus
from google.genai import types
from werkzeug.security import generate_password_hash, check_password_hash
import requests
import re
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# --- Configuración de CORS (Permisos de Conexión) ---


def get_allowed_origins():
    # Orígenes base
    origins = [
        "http://localhost:5173",
        "https://www.arsolsolar.com",
        "https://solar-landing-git-main-uriels-projects-78a30a8d.vercel.app",
        "https://arsol.onrender.com",
        "https://solar-landing-uriels-projects.vercel.app"
    ]
    # Permitir agregar orígenes dinámicos mediante variable de entorno en Render
    env_origins = os.environ.get('ALLOWED_ORIGINS')
    if env_origins:
        origins.extend(env_origins.split(','))
    return origins


CORS(app, resources={r"/api/*": {"origins": get_allowed_origins()}},
     supports_credentials=True)

# --- Configuración de Base de Datos (PostgreSQL para Render) ---
# Render proporciona la URL de la base de datos en la variable de entorno DATABASE_URL.
database_url = os.environ.get('DATABASE_URL')

if not database_url:
    db_user = quote_plus(os.environ.get('DB_USER', 'postgres'))
    db_pass = quote_plus(os.environ.get('DB_PASS', 'postgres123'))
    db_host = os.environ.get('DB_HOST', '127.0.0.1')
    db_port = os.environ.get('DB_PORT', '5432')
    db_name = os.environ.get('DB_NAME', 'arsol-db')
    database_url = f'postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}'

# Corregir el prefijo solo si es el formato antiguo 'postgres://' y no es ya 'postgresql://'
# Esto evita transformar incorrectamente URLs que ya tienen el prefijo correcto.
if database_url and database_url.startswith("postgres://") and \
   not database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

# Log para verificar el host en los registros de Render (ocultando la contraseña)
if database_url:
    masked_url = re.sub(r':\/\/(.*?):(.*?)@', r'://\1:****@', database_url)
    print(f"INFO: Configurando conexión a base de datos: {masked_url}")

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# Configuración para asegurar que las conexiones externas usen SSL correctamente
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    "connect_args": {
        "sslmode": "require"
    }
}

# Configuración JWT
app.config["JWT_SECRET_KEY"] = os.environ.get(
    'JWT_SECRET_KEY', 'super-secret-change-me-in-prod')
jwt = JWTManager(app)

db = SQLAlchemy(app)

# --- Modelos (Tablas) ---


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    # En producción usar hash!
    password = db.Column(db.Text, nullable=False)
    name = db.Column(db.String(80), nullable=False)
    role = db.Column(db.String(50), nullable=False)


class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    date = db.Column(db.Date, nullable=False)  # Cambiado a db.Date
    amount = db.Column(db.String(50), nullable=False)


class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    date = db.Column(db.Date, nullable=False)  # Cambiado a db.Date
    time = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), default="Pendiente")

# --- Inicialización de Datos ---


def init_db():
    with app.app_context():
        db.create_all()
        # Buscar el usuario administrador
        admin = User.query.filter_by(email='admin@arsol.com').first()
        hashed_password = generate_password_hash(
            'admin123', method='pbkdf2:sha256')

        if not admin:
            admin = User(email='admin@arsol.com', password=hashed_password,
                         name='Huriel', role='Super Admin')
            db.session.add(admin)
            print("Usuario administrador creado.")
        elif admin.password and len(admin.password) < 100:
            try:
                # Si el hash guardado mide menos de 100 caracteres, es muy probable
                # que esté truncado por el error anterior. Lo corregimos una última vez.
                admin.password = hashed_password
                db.session.flush()
                db.session.commit()  # Guardamos inmediatamente si funciona
            except Exception as e:
                db.session.rollback()  # Importante para limpiar el estado de la transacción
                print(
                    f"Advertencia: No se pudo actualizar el hash del administrador (la columna en BD sigue siendo de 80 caracteres): {e}")

        # Crear actividades de ejemplo iniciales solo si la tabla está vacía
        if Activity.query.count() == 0:
            activities = [
                Activity(name="Juan Pérez ", email="juan@gmail.com",
                         status="Pendiente", date=date(2026, 1, 21), amount="$ 3,500"),
                Activity(name="Tech Solutions SA", email="contacto@techsol.com",
                         status="Completado", date=date(2026, 1, 20), amount="$ 12,000"),
                Activity(name="Maria Garcia", email="mgarcia@outlook.com",
                         status="En Proceso", date=date(2026, 1, 19), amount="$ 4,200"),
                Activity(name="Hotel Sol y Mar", email="admin@solymar.com",
                         status="Pendiente", date=date(2026, 1, 18), amount="$ 25,000"),
            ]
            db.session.add_all(activities)

        if Appointment.query.count() == 0:
            appointments = [
                Appointment(name="Consultorio Dental", email="dental@mail.com",
                            date=date(2026, 2, 10), time="10:00", status="Confirmada"),
            ]
            db.session.add_all(appointments)

        print("Base de datos inicializada correctamente.")


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

    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=user.email)
        return jsonify({
            "success": True,
            "token": access_token,
            "user": {"name": user.name, "role": user.role},
            "message": "Bienvenido al sistema"
        }), 200
    else:
        # Mensaje más descriptivo para depuración
        msg = "Contraseña incorrecta" if user else "Usuario no encontrado"
        return jsonify({"success": False, "message": msg}), 401


@app.route('/api/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    # Obtener actividades de la base de datos
    activities_query = Activity.query.all()
    activities_data = []

    today = datetime.now().date()  # Usar solo la fecha
    current_month_income = 0
    prev_month_income = 0

    # Calcular el primer día del mes actual y del mes anterior
    first_day_current_month = today.replace(day=1)
    first_day_prev_month = (first_day_current_month -
                            timedelta(days=1)).replace(day=1)

    for act in activities_query:
        activities_data.append({
            "id": act.id,
            "name": act.name,
            "email": act.email,
            "status": act.status,  # Convertir la fecha a string para el frontend
            "date": act.date.isoformat(),
            "amount": act.amount
        })

        # Limpiar monto
        try:
            # Quitar símbolos de moneda y letras (R$, $, etc)
            text = re.sub(r'[^\d,.]', '', act.amount)
            # Detectar formato brasileño (1.234,56) vs internacional (1,234.56)
            if ',' in text and '.' in text:
                if text.rfind(',') > text.rfind('.'):  # Formato BR
                    text = text.replace('.', '').replace(',', '.')
                else:  # Formato US
                    text = text.replace(',', '')
            elif ',' in text:  # Solo coma (decimal BR)
                text = text.replace(',', '.')
            clean_amount = float(text)
        except Exception:
            clean_amount = 0

        # Sumar a mes correspondiente verificando que sea un objeto de fecha válido
        if act.date >= first_day_current_month and act.date < (first_day_current_month + timedelta(days=32)).replace(day=1):
            current_month_income += clean_amount
        elif act.date >= first_day_prev_month and act.date < (first_day_prev_month + timedelta(days=32)).replace(day=1):
            prev_month_income += clean_amount

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
@jwt_required()
def add_activity():
    data = request.json
    # Ensure date is parsed from ISO string if provided as string
    activity_date = data.get('date')
    if isinstance(activity_date, str):
        activity_date = datetime.strptime(activity_date, '%Y-%m-%d').date()

    new_activity = Activity(
        name=data['name'],
        email=data['email'],
        status=data['status'],
        date=activity_date or datetime.now().date(),
        amount=data['amount']
    )
    db.session.add(new_activity)
    db.session.commit()
    return jsonify({"success": True, "message": "Cliente agregado exitosamente"}), 201


@app.route('/api/activities/<int:id>', methods=['PUT'])
@jwt_required()
def update_activity(id):
    activity = Activity.query.get_or_404(id)
    data = request.json

    new_date = data.get('date')
    if new_date and isinstance(new_date, str):
        new_date = datetime.strptime(new_date, '%Y-%m-%d').date()

    activity.name = data.get('name', activity.name)
    activity.email = data.get('email', activity.email)
    activity.status = data.get('status', activity.status)
    activity.date = new_date or activity.date
    activity.amount = data.get('amount', activity.amount)

    db.session.commit()
    return jsonify({"success": True, "message": "Cliente actualizado"}), 200


@app.route('/api/activities/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_activity(id):
    activity = Activity.query.get_or_404(id)
    db.session.delete(activity)
    db.session.commit()
    return jsonify({"success": True, "message": "Cliente eliminado"}), 200

# --- Ruta para Landing Page (CRM + DB) ---


@app.route('/api/landing/submit', methods=['POST'])
def submit_lead():
    data = request.json

    # --- Limpieza de Datos ---
    # Eliminar todo lo que no sea número del teléfono (paréntesis, guiones, espacios)
    clean_phone = re.sub(r'\D', '', data.get('phone', ''))

    # Limpiar valor de factura para el CRM (convertir texto a número simple)
    def clean_bill_amount(amount_str):
        if not amount_str:
            return ""
        if "Menos de R$ 1.500" in amount_str:
            return "1500"
        if "R$ 1.500 - R$ 3.000" in amount_str:
            return "3000"
        if "R$ 3.000 - R$ 5.000" in amount_str:
            return "5000"
        if "Mais de R$ 5.000" in amount_str:
            return "5000"
        return amount_str

    clean_amount = clean_bill_amount(data.get('billAmount', ''))

    # 1. Guardar en Base de Datos Local (para que aparezca en el Dashboard)
    try:
        # Formatear fecha actual ej: "06 Feb 2026"
        current_date = datetime.now().date()  # Guardar como objeto Date

        new_activity = Activity(
            name=data.get('name', 'Cliente Web'),
            email=data.get('email', ''),
            status="Pendiente",
            date=current_date,  # Asignar el objeto Date
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
        # Cambiamos a un payload plano para enviar como application/x-www-form-urlencoded
        # Esto es lo que la mayoría de los formularios HTML/CRM esperan por defecto
        isales_payload = {
            'e': isales_e,
            'fid': isales_fid,
            'redirect': '1',
            'nome': data.get('name', ''),
            'email': data.get('email', ''),
            'telefone': clean_phone,
            'valor_energia': clean_amount,
            'cidade': data.get('address', '')
        }

        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

        # Usamos data= en lugar de files= para enviar como formulario estándar
        response = requests.post(
            isales_url, data=isales_payload, headers=headers, timeout=10)
        print(f"Respuesta CRM: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error enviando a CRM: {e}")

    return jsonify({"success": True}), 200

# --- Endpoint para registrar nuevos administradores ---


@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name', 'Admin User')

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "El usuario ya existe"}), 400

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(email=email, password=hashed_password,
                    name=name, role='Admin')
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"success": True, "message": "Usuario creado con éxito"}), 201

# --- Rutas de Citas (Appointments) ---


@app.route('/api/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    appointments = Appointment.query.all()
    data = []
    for appt in appointments:
        data.append({
            "id": appt.id,  # Convertir la fecha a string para el frontend
            "name": appt.name,
            "email": appt.email,
            "date": appt.date,
            "time": appt.time,
            "status": appt.status
        })
    return jsonify(data)


@app.route('/api/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    data = request.json
    new_appt = Appointment(
        # Parsear fecha ISO
        name=data['name'], email=data['email'], date=datetime.strptime(data['date'], '%Y-%m-%d').date(), time=data['time'])
    db.session.add(new_appt)
    db.session.commit()
    return jsonify({"success": True, "message": "Cita agendada exitosamente"}), 201


@app.route('/api/appointments/<int:id>', methods=['PUT'])
@jwt_required()
def update_appointment(id):
    appt = Appointment.query.get_or_404(id)
    data = request.json
    appt.name = data.get('name', appt.name)
    # Asegurarse de que la fecha se parsea si viene como string
    appt.email = data.get('email', appt.email)

    new_date = data.get('date')
    if new_date and isinstance(new_date, str):
        new_date = datetime.strptime(new_date, '%Y-%m-%d').date()
    appt.date = new_date or appt.date

    appt.time = data.get('time', appt.time)
    appt.status = data.get('status', appt.status)
    db.session.commit()
    return jsonify({"success": True, "message": "Cita actualizada"}), 200


@app.route('/api/appointments/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_appointment(id):
    appt = Appointment.query.get_or_404(id)
    db.session.delete(appt)
    db.session.commit()
    return jsonify({"success": True, "message": "Cita eliminada"}), 200

# --- Ruta de Configuración ---


@app.route('/api/user/password', methods=['PUT'])
@jwt_required()
def update_password():
    # Secure: Get user email from the JWT token instead of request body
    current_user_email = get_jwt_identity()
    data = request.json
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')

    user = User.query.filter_by(email=current_user_email).first()

    if not user:
        return jsonify({"success": False, "message": "Usuario no encontrado"}), 404

    if not check_password_hash(user.password, current_password):
        return jsonify({"success": False, "message": "La contraseña actual es incorrecta"}), 400

    # Guardar la nueva contraseña hasheada
    user.password = generate_password_hash(
        new_password, method='pbkdf2:sha256')
    db.session.commit()
    return jsonify({"success": True, "message": "Contraseña actualizada con éxito"}), 200

# --- Ruta de IA (Simulación) ---


@app.route('/api/analyze-bill', methods=['POST'])
@jwt_required()
def analyze_bill():
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No se envió ningún archivo"}), 400

    file = request.files['file']

    # 1. Configuración de IA (Google Gemini)
    # NOTA: Reemplaza "TU_API_KEY_AQUI" con tu clave real si no usas variables de entorno
    api_key = os.environ.get("GEMINI_API_KEY")

    if api_key:
        try:
            client = genai.Client(api_key=api_key)

            # Leer archivo
            image_data = file.read()
            file.seek(0)  # Resetear puntero por si se necesita leer de nuevo

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

            response = client.models.generate_content(
                model='gemini-1.5-flash',
                contents=[
                    types.Part.from_bytes(
                        data=image_data, mime_type=file.content_type),
                    prompt
                ]
            )

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


# Movido fuera de __main__ para que funcione con Gunicorn en Render
try:
    init_db()
except Exception as e:
    print(
        f"Aviso: Error inicializando DB (puede ser normal en el despliegue): {e}")

if __name__ == '__main__':
    app.run(debug=True, port=5000)
