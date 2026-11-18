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

if database_url and database_url.startswith("postgres://"):
    # SQLAlchemy prefiere 'postgresql://' en lugar de 'postgres://'
    database_url = database_url.replace("postgres://", "postgresql://", 1)

# Log de seguridad para depuración en Render
if database_url:
    masked_url = re.sub(r':\/\/(.*?):(.*?)@', r'://\1:****@', database_url)
    print(f"INFO: Intentando conectar a la base de datos en: {masked_url}")

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# Forzar SSL para conexiones externas en Render
if os.environ.get('RENDER'):
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        "connect_args": {
            "sslmode": "require"
        }
    }

# Configuración JWT
app.config["JWT_SECRET_KEY"] = os.environ.get(
    'JWT_SECRET_KEY', 'dev-only-secret-no-usar-en-produccion')
if os.environ.get('RENDER') and not os.environ.get('JWT_SECRET_KEY'):
    print("⚠️ AVISO DE SEGURIDAD: JWT_SECRET_KEY no está configurada en Render. "
          "Cualquiera podría falsificar sesiones de admin.")
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


class PageEvent(db.Model):
    """Evento anónimo de la landing (visita, clic, sección vista...).
    No guarda IP ni datos personales: solo IDs aleatorios generados en el navegador."""
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, nullable=False,
                           default=datetime.utcnow, index=True)
    visitor_id = db.Column(db.String(40), nullable=False, index=True)
    session_id = db.Column(db.String(40), nullable=False, index=True)
    # pageview | click | section_view | simulator
    event = db.Column(db.String(20), nullable=False)
    # orcamento | whatsapp | instagram | telefone | nav | other
    category = db.Column(db.String(20))
    label = db.Column(db.String(80))
    section = db.Column(db.String(40))
    source = db.Column(db.String(60))
    device = db.Column(db.String(20))

# --- Inicialización de Datos ---


def init_db():
    with app.app_context():
        db.create_all()
        # Crear el administrador inicial solo si no existe.
        # La contraseña se toma de ADMIN_PASSWORD (nunca escrita en el código).
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@arsol.com')
        admin_password = os.environ.get('ADMIN_PASSWORD')
        if not User.query.filter_by(email=admin_email).first():
            if admin_password:
                admin = User(email=admin_email,
                             password=generate_password_hash(
                                 admin_password, method='pbkdf2:sha256'),
                             name='Huriel', role='Super Admin')
                db.session.add(admin)
                print("Usuario administrador creado.")
            else:
                print("AVISO: no existe administrador y ADMIN_PASSWORD no está "
                      "configurada; no se creó ninguno.")

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

        db.session.commit()
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
        if "Até R$ 300" in amount_str:
            return "300"
        if "R$ 300 - R$ 700" in amount_str:
            return "700"
        if "R$ 700 - R$ 1.500" in amount_str:
            return "1500"
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
    isales_fid = os.environ.get('ISALES_FID')
    isales_e = os.environ.get('ISALES_E')
    if not isales_fid or not isales_e:
        print("AVISO: ISALES_FID/ISALES_E no configuradas; el lead no se envió al CRM.")
        return jsonify({"success": True}), 200

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

# --- Analítica de la landing ---

TRACK_EVENTS = {'pageview', 'click', 'section_view', 'simulator'}
TRACK_CATEGORIES = {'orcamento', 'whatsapp',
                    'instagram', 'telefone', 'nav', 'other'}
BOT_PATTERN = re.compile(
    r'bot|crawl|spider|slurp|preview|lighthouse|headless', re.I)
BR_OFFSET = timedelta(hours=-3)  # Brasil (sin horario de verano desde 2019)
MAX_EVENTS_PER_SESSION = 300


def _clip(value, size):
    if value is None:
        return None
    return str(value).strip()[:size] or None


@app.route('/api/track', methods=['POST'])
def track_event():
    """Endpoint público: la landing envía aquí los eventos (vía sendBeacon)."""
    if BOT_PATTERN.search(request.headers.get('User-Agent', '')):
        return '', 204
    try:
        data = json.loads(request.get_data(as_text=True) or '{}')
    except ValueError:
        return '', 400
    if not isinstance(data, dict):
        return '', 400

    event = data.get('event')
    visitor_id = _clip(data.get('visitor_id'), 40)
    session_id = _clip(data.get('session_id'), 40)
    if event not in TRACK_EVENTS or not visitor_id or not session_id:
        return '', 400

    category = data.get('category')
    if category not in TRACK_CATEGORIES:
        category = None

    try:
        if PageEvent.query.filter_by(session_id=session_id).count() >= MAX_EVENTS_PER_SESSION:
            return '', 204
        db.session.add(PageEvent(
            visitor_id=visitor_id,
            session_id=session_id,
            event=event,
            category=category,
            label=_clip(data.get('label'), 80),
            section=_clip(data.get('section'), 40),
            source=_clip(data.get('source'), 60),
            device=_clip(data.get('device'), 20),
        ))
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error guardando evento: {e}")
        return '', 500
    return '', 204


def _is_lead(ev):
    return ev.event == 'click' and ev.category in ('orcamento', 'whatsapp')


def _summarize(events):
    sessions = {}
    for e in events:
        s = sessions.setdefault(e.session_id, {
            'visitor': e.visitor_id, 'events': [], 'source': None, 'device': None})
        s['events'].append(e)
        s['source'] = s['source'] or e.source
        s['device'] = s['device'] or e.device

    lead_sessions = sum(1 for s in sessions.values()
                        if any(_is_lead(ev) for ev in s['events']))
    totals = {
        'visitors': len({e.visitor_id for e in events}),
        'sessions': len(sessions),
        'pageviews': sum(1 for e in events if e.event == 'pageview'),
        'orcamento_clicks': sum(1 for e in events if e.event == 'click' and e.category == 'orcamento'),
        'whatsapp_clicks': sum(1 for e in events if e.event == 'click' and e.category == 'whatsapp'),
        'lead_sessions': lead_sessions,
        'conversion_rate': round(lead_sessions / len(sessions) * 100, 1) if sessions else 0,
    }
    return totals, sessions


@app.route('/api/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    try:
        days = int(request.args.get('days', 30))
    except ValueError:
        days = 30
    days = max(1, min(days, 365))

    now = datetime.utcnow()
    # Inicio del período alineado a la medianoche de Brasil
    today_br = (now + BR_OFFSET).date()
    start_br = today_br - timedelta(days=days - 1)
    start = datetime.combine(start_br, datetime.min.time()) - BR_OFFSET
    prev_start = start - timedelta(days=days)

    events = PageEvent.query.filter(PageEvent.created_at >= start).order_by(
        PageEvent.created_at).all()
    prev_events = PageEvent.query.filter(
        PageEvent.created_at >= prev_start, PageEvent.created_at < start).all()

    totals, sessions = _summarize(events)
    prev_totals, _ = _summarize(prev_events)

    # Serie diaria (hora de Brasil)
    daily = {start_br + timedelta(days=i): {'visitors': set(), 'orcamento': 0, 'whatsapp': 0}
             for i in range(days)}
    for e in events:
        d = (e.created_at + BR_OFFSET).date()
        if d in daily:
            daily[d]['visitors'].add(e.visitor_id)
            if _is_lead(e):
                daily[d][e.category] += 1
    daily_list = [{'date': d.isoformat(), 'visitors': len(v['visitors']),
                   'orcamento': v['orcamento'], 'whatsapp': v['whatsapp']}
                  for d, v in sorted(daily.items())]

    # Clics más frecuentes
    clicks = {}
    for e in events:
        if e.event == 'click':
            key = (e.category or 'other', e.label or '(sin texto)',
                   e.section or '-')
            clicks[key] = clicks.get(key, 0) + 1
    top_clicks = [{'category': k[0], 'label': k[1], 'section': k[2], 'count': c}
                  for k, c in sorted(clicks.items(), key=lambda x: -x[1])[:12]]

    def count_by(field, empty):
        out = {}
        for s in sessions.values():
            key = s[field] or empty
            out[key] = out.get(key, 0) + 1
        return [{'name': k, 'sessions': v} for k, v in sorted(out.items(), key=lambda x: -x[1])]

    section_counts = {}
    for s in sessions.values():
        for sec in {ev.section for ev in s['events'] if ev.event == 'section_view' and ev.section}:
            section_counts[sec] = section_counts.get(sec, 0) + 1

    def sessions_with(pred):
        return sum(1 for s in sessions.values() if any(pred(ev) for ev in s['events']))

    funnel = [
        {'step': 'Entraron a la página', 'sessions': totals['sessions']},
        {'step': 'Llegaron al simulador', 'sessions': sessions_with(
            lambda ev: ev.event == 'section_view' and ev.section == 'calculadora')},
        {'step': 'Usaron el simulador', 'sessions': sessions_with(
            lambda ev: ev.event == 'simulator')},
        {'step': 'Clic en orçamento o WhatsApp',
            'sessions': totals['lead_sessions']},
    ]

    # Visitantes que ya habían venido antes del período
    visitor_ids = {s['visitor'] for s in sessions.values()}
    returning_ids = set()
    if visitor_ids:
        returning_ids = {r[0] for r in db.session.query(PageEvent.visitor_id).filter(
            PageEvent.visitor_id.in_(visitor_ids), PageEvent.created_at < start).distinct()}

    recent = sorted(sessions.items(),
                    key=lambda kv: kv[1]['events'][-1].created_at, reverse=True)[:30]
    recent_sessions = []
    for sid, s in recent:
        first = s['events'][0].created_at
        earlier_session = s['visitor'] in returning_ids or any(
            o['visitor'] == s['visitor'] and o['events'][0].created_at < first
            for o in sessions.values())
        recent_sessions.append({
            'session_id': sid,
            'started_at': first.isoformat() + 'Z',
            'source': s['source'] or 'Directo',
            'device': s['device'] or 'Desconocido',
            'returning': earlier_session,
            'converted': any(_is_lead(ev) for ev in s['events']),
            'sections': [ev.section for ev in s['events'] if ev.event == 'section_view'],
            'events': [{'at': ev.created_at.isoformat() + 'Z', 'event': ev.event, 'category': ev.category,
                        'label': ev.label, 'section': ev.section}
                       for ev in s['events'] if ev.event != 'section_view'][:40],
        })

    return jsonify({
        'days': days,
        'totals': totals,
        'previous': prev_totals,
        'daily': daily_list,
        'top_clicks': top_clicks,
        'sources': count_by('source', 'Directo'),
        'devices': count_by('device', 'Desconocido'),
        'sections': [{'section': k, 'sessions': v} for k, v in section_counts.items()],
        'funnel': funnel,
        'recent_sessions': recent_sessions,
    }), 200


# --- Endpoint para registrar nuevos administradores ---


@app.route('/api/register', methods=['POST'])
@jwt_required()
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


# Inicialización de la base de datos para entornos de producción (Gunicorn)
try:
    init_db()
except Exception as e:
    print(f"❌ ERROR DE INICIALIZACIÓN DE BASE DE DATOS: {e}")
    print("Asegúrate de que la variable DATABASE_URL en Render sea la 'External Database URL'.")

if __name__ == '__main__':
    app.run(debug=True, port=5000)
