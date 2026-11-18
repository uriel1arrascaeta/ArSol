import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Users, MousePointerClick, MessageCircle, Percent, Eye, RefreshCw, TrendingUp, TrendingDown,
  Minus, ChevronDown, Smartphone, Monitor, Tablet, Table2, BarChart3, CheckCircle2, Repeat,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Color de las marcas (naranja de marca oscurecido: contraste >= 3:1 sobre blanco)
const MARK = '#E66E00';
const MARK_SOFT = '#FBE3CC';
const GRID = '#EEF0F2';

const RANGES = [7, 30, 90];

const SECTION_NAMES = {
  inicio: 'Portada',
  beneficios: 'Benefícios',
  entenda: 'Cómo funciona la energía solar',
  servicos: 'Serviços',
  calculadora: 'Simulador',
  'como-funciona': 'Proceso / Qué incluye',
  'por-que-agora': 'Por qué ahora',
  faq: 'Preguntas frecuentes',
  contato: 'Contacto final',
  nav: 'Menú',
  footer: 'Pie de página',
  flotante: 'Botón flotante',
};
const SECTION_ORDER = ['inicio', 'beneficios', 'entenda', 'servicos', 'calculadora', 'como-funciona', 'por-que-agora', 'faq', 'contato'];

const CATEGORY_NAMES = {
  orcamento: 'Orçamento',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  telefone: 'Teléfono',
  nav: 'Navegación',
  other: 'Otro',
};

const DEVICE_ICONS = { Celular: Smartphone, Computadora: Monitor, Tablet };

const fmt = (n) => (typeof n === 'number' ? n.toLocaleString('es-ES') : n);
const sectionName = (s) => SECTION_NAMES[s] || s || '-';
const shortDate = (iso) => {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
};
const longDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
const dateTime = (iso) =>
  new Date(iso).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const timeOnly = (iso) => new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

const niceCeil = (v) => {
  if (v <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
};

// --- Piezas ---

const Card = ({ title, subtitle, action, children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>
    {(title || action) && (
      <div className="px-6 pt-5 pb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    <div className="px-6 pb-6">{children}</div>
  </div>
);

const Delta = ({ current, previous, suffix = '' }) => {
  if (previous === undefined || previous === null) return null;
  if (previous === 0 && current === 0) {
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500"><Minus size={12} /> sin cambios</span>;
  }
  if (previous === 0) {
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700"><TrendingUp size={12} /> nuevo</span>;
  }
  const pct = ((current - previous) / previous) * 100;
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? 'text-green-700' : 'text-red-700'}`}>
      <Icon size={12} /> {up ? '+' : ''}{pct.toFixed(0)}%{suffix}
    </span>
  );
};

const StatTile = ({ label, value, current, previous, icon, hint }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <span className="p-2 rounded-lg bg-[#FF7A00]/10 text-[#CC6200]">{React.createElement(icon, { size: 16 })}</span>
    </div>
    <p className="text-3xl font-semibold text-gray-900 tracking-tight tabular-nums">{value}</p>
    <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
      <Delta current={current} previous={previous} />
      <span>{hint}</span>
    </div>
  </div>
);

// Barras horizontales (un solo color; el valor va al final de la barra en color de texto)
const HBars = ({ rows, total, empty = 'Sin datos todavía.' }) => {
  if (!rows.length) return <p className="text-sm text-gray-400 py-6 text-center">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.key ?? r.label}>
          <div className="flex items-center justify-between gap-3 text-sm mb-1">
            <span className="flex items-center gap-2 text-gray-700 truncate">
              {r.icon && <r.icon size={14} className="text-gray-400 shrink-0" />}
              <span className="truncate">{r.label}</span>
              {r.tag && <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 shrink-0">{r.tag}</span>}
            </span>
            <span className="font-semibold text-gray-900 tabular-nums shrink-0">
              {fmt(r.value)}
              {total ? <span className="text-gray-400 font-normal"> · {Math.round((r.value / total) * 100)}%</span> : null}
            </span>
          </div>
          <div className="h-3 rounded-r bg-gray-50">
            <div className="h-3 rounded-r" style={{ width: `${Math.max((r.value / max) * 100, r.value ? 1.5 : 0)}%`, background: MARK }} title={`${r.label}: ${fmt(r.value)}`} />
          </div>
        </li>
      ))}
    </ul>
  );
};

const useWidth = () => {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    if (!ref.current) return undefined;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
};

// Columnas por día con tooltip al pasar el mouse
const DailyChart = ({ data, metric, metricLabel }) => {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const height = 220;
  const pad = { top: 12, right: 8, bottom: 26, left: 36 };
  const innerW = Math.max(width - pad.left - pad.right, 0);
  const innerH = height - pad.top - pad.bottom;
  const values = data.map((d) => d[metric]);
  const yMax = niceCeil(Math.max(...values, 0));
  const ticks = [0, yMax / 4, yMax / 2, (yMax * 3) / 4, yMax];
  const slot = data.length ? innerW / data.length : 0;
  const barW = Math.max(Math.min(24, slot - 2), 1);
  const labelEvery = Math.ceil(data.length / Math.max(Math.floor(innerW / 56), 1));
  const y = (v) => pad.top + innerH - (v / yMax) * innerH;

  const barPath = (x, v) => {
    const top = y(v);
    const h = pad.top + innerH - top;
    if (h <= 0) return '';
    const r = Math.min(4, h, barW / 2);
    const bottom = pad.top + innerH;
    return `M${x},${bottom} V${top + r} Q${x},${top} ${x + r},${top} H${x + barW - r} Q${x + barW},${top} ${x + barW},${top + r} V${bottom} Z`;
  };

  return (
    <div ref={ref} className="relative w-full" onMouseLeave={() => setHover(null)}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={`${metricLabel} por día`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" />
              <text x={pad.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-gray-400 text-[11px] tabular-nums">{fmt(t)}</text>
            </g>
          ))}
          {data.map((d, i) => {
            const x = pad.left + i * slot + (slot - barW) / 2;
            return (
              <g key={d.date}>
                <path d={barPath(x, d[metric])} fill={hover === i ? '#B85800' : MARK} />
                {i % labelEvery === 0 && (
                  <text x={pad.left + i * slot + slot / 2} y={height - 8} textAnchor="middle" className="fill-gray-400 text-[11px]">{shortDate(d.date)}</text>
                )}
                <rect x={pad.left + i * slot} y={pad.top} width={slot} height={innerH} fill="transparent" onMouseEnter={() => setHover(i)} />
              </g>
            );
          })}
        </svg>
      )}
      {hover !== null && data[hover] && (
        <div
          className="absolute z-10 pointer-events-none bg-gray-900 text-white rounded-lg px-3 py-2 text-xs shadow-lg whitespace-nowrap"
          style={{
            left: Math.min(Math.max(pad.left + hover * slot + slot / 2, 70), width - 70),
            top: Math.max(y(data[hover][metric]) - 64, 0),
            transform: 'translateX(-50%)',
          }}
        >
          <p className="font-semibold mb-1 capitalize">{longDate(data[hover].date)}</p>
          <p>Visitantes: <b className="tabular-nums">{fmt(data[hover].visitors)}</b></p>
          <p>Orçamento: <b className="tabular-nums">{fmt(data[hover].orcamento)}</b> · WhatsApp: <b className="tabular-nums">{fmt(data[hover].whatsapp)}</b></p>
        </div>
      )}
    </div>
  );
};

const eventText = (ev) => {
  if (ev.event === 'pageview') return 'Entró a la página';
  if (ev.event === 'simulator') return `Usó el simulador (${ev.label || ''})`;
  if (ev.event === 'click') {
    const cat = CATEGORY_NAMES[ev.category] || 'Clic';
    return `Clic ${cat === 'Otro' ? '' : `en ${cat}`}: “${ev.label || 'sin texto'}”`;
  }
  return ev.event;
};

const eventDot = (ev) => {
  if (ev.event === 'click' && (ev.category === 'orcamento' || ev.category === 'whatsapp')) return 'bg-green-500';
  if (ev.event === 'pageview') return 'bg-gray-900';
  return 'bg-[#E66E00]';
};

const SessionRow = ({ s }) => {
  const [open, setOpen] = useState(false);
  const DeviceIcon = DEVICE_ICONS[s.device] || Monitor;
  const clicks = s.events.filter((e) => e.event === 'click').length;
  return (
    <li className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-4 py-3 text-left hover:bg-gray-50/80 px-2 -mx-2 rounded-lg">
        <DeviceIcon size={18} className="text-gray-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
            {dateTime(s.started_at)}
            <span className="text-xs font-normal text-gray-500">desde {s.source}</span>
            {s.returning && <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"><Repeat size={10} /> Volvió</span>}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Vio {s.sections.length} secciones · {clicks} {clicks === 1 ? 'clic' : 'clics'}
          </p>
        </div>
        {s.converted ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full shrink-0"><CheckCircle2 size={12} /> Pidió contacto</span>
        ) : (
          <span className="text-xs text-gray-400 shrink-0 hidden sm:inline">Solo miró</span>
        )}
        <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pl-10 pb-4 pr-2">
          {s.sections.length > 0 && (
            <p className="text-xs text-gray-500 mb-3">
              <span className="font-semibold text-gray-700">Recorrido:</span> {s.sections.map(sectionName).join(' → ')}
            </p>
          )}
          <ol className="space-y-2">
            {s.events.map((ev, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="text-xs text-gray-400 tabular-nums w-11 shrink-0 pt-0.5">{timeOnly(ev.at)}</span>
                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${eventDot(ev)}`} />
                <span className="text-gray-700">
                  {eventText(ev)}
                  {ev.section && ev.event === 'click' && <span className="text-gray-400"> · {sectionName(ev.section)}</span>}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </li>
  );
};

// --- Sección principal ---

const METRICS = [
  { key: 'visitors', label: 'Visitantes' },
  { key: 'orcamento', label: 'Clics en Orçamento' },
  { key: 'whatsapp', label: 'Clics en WhatsApp' },
];

const AnalyticsSection = ({ onUnauthorized }) => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metric, setMetric] = useState('visitors');
  const [showTable, setShowTable] = useState(false);
  const onUnauthorizedRef = useRef(onUnauthorized);
  useEffect(() => { onUnauthorizedRef.current = onUnauthorized; });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/analytics?days=${days}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.status === 401 || res.status === 422) { onUnauthorizedRef.current?.(); return; }
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError('No se pudieron cargar los datos. Revisa que el backend esté funcionando.');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const t = data?.totals;
  const p = data?.previous;
  const metricLabel = METRICS.find((m) => m.key === metric)?.label;
  const hasData = t && t.sessions > 0;

  return (
    <div className="space-y-6">
      {/* Encabezado y filtros en una sola fila */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h3 className="font-bold text-2xl text-gray-900">Analítica de la página</h3>
          <p className="text-gray-500 text-sm">Quién entra a la landing, qué mira y qué toca. Datos anónimos, sin contar a los administradores.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex bg-white border border-gray-200 rounded-lg p-1" role="group" aria-label="Período">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setDays(r)}
                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${days === r ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {r} días
              </button>
            ))}
          </div>
          <button onClick={load} className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-gray-900" title="Actualizar" aria-label="Actualizar">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

      {!data && loading && <div className="p-12 text-center text-gray-400">Cargando analítica...</div>}

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatTile label="Visitantes únicos" value={fmt(t.visitors)} current={t.visitors} previous={p.visitors} icon={Users} hint={`vs ${days} días anteriores`} />
            <StatTile label="Visitas" value={fmt(t.sessions)} current={t.sessions} previous={p.sessions} icon={Eye} hint={`${fmt(t.pageviews)} páginas vistas`} />
            <StatTile label="Clics en Orçamento" value={fmt(t.orcamento_clicks)} current={t.orcamento_clicks} previous={p.orcamento_clicks} icon={MousePointerClick} hint="abrieron el formulario" />
            <StatTile label="Clics en WhatsApp" value={fmt(t.whatsapp_clicks)} current={t.whatsapp_clicks} previous={p.whatsapp_clicks} icon={MessageCircle} hint="abrieron el chat" />
            <StatTile label="Conversión" value={`${t.conversion_rate.toLocaleString('es-ES')}%`} current={t.conversion_rate} previous={p.conversion_rate} icon={Percent} hint="visitas que pidieron contacto" />
          </div>

          {!hasData && (
            <div className="p-6 rounded-2xl border border-dashed border-gray-300 bg-white text-center">
              <BarChart3 className="mx-auto text-gray-300 mb-3" size={32} />
              <p className="font-semibold text-gray-700">Todavía no hay visitas registradas en este período.</p>
              <p className="text-sm text-gray-500 mt-1">Los datos aparecen cuando alguien visita la página publicada. Tus propias visitas no cuentan mientras tengas la sesión de admin abierta.</p>
            </div>
          )}

          <Card
            title={`${metricLabel} por día`}
            subtitle={`Últimos ${days} días · hora de Brasil`}
            action={(
              <div className="flex items-center gap-2">
                <select value={metric} onChange={(e) => setMetric(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700">
                  {METRICS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
                </select>
                <button onClick={() => setShowTable((s) => !s)} className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:text-gray-900" title={showTable ? 'Ver gráfico' : 'Ver tabla'} aria-label={showTable ? 'Ver gráfico' : 'Ver tabla'}>
                  {showTable ? <BarChart3 size={16} /> : <Table2 size={16} />}
                </button>
              </div>
            )}
          >
            {showTable ? (
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="text-gray-500 text-xs uppercase sticky top-0 bg-white">
                    <tr><th className="text-left py-2">Día</th><th className="text-right">Visitantes</th><th className="text-right">Orçamento</th><th className="text-right">WhatsApp</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 tabular-nums">
                    {[...data.daily].reverse().map((d) => (
                      <tr key={d.date}><td className="py-1.5 capitalize">{longDate(d.date)}</td><td className="text-right">{d.visitors}</td><td className="text-right">{d.orcamento}</td><td className="text-right">{d.whatsapp}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <DailyChart data={data.daily} metric={metric} metricLabel={metricLabel} />
            )}
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card title="Embudo de conversión" subtitle="Visitas que llegaron a cada paso">
              <HBars
                total={data.funnel[0].sessions}
                rows={data.funnel.map((f) => ({ label: f.step, value: f.sessions }))}
              />
            </Card>
            <Card title="Qué tocaron" subtitle="Botones y enlaces con más clics">
              <HBars
                rows={data.top_clicks.map((c) => ({
                  key: `${c.category}-${c.label}-${c.section}`,
                  label: c.label,
                  tag: `${CATEGORY_NAMES[c.category] || c.category} · ${sectionName(c.section)}`,
                  value: c.count,
                }))}
                empty="Todavía nadie hizo clic."
              />
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card title="De dónde vienen" subtitle="Origen de cada visita">
              <HBars total={t.sessions} rows={data.sources.map((s) => ({ label: s.name, value: s.sessions }))} />
            </Card>
            <Card title="Dispositivo" subtitle="Visitas por tipo de equipo">
              <HBars total={t.sessions} rows={data.devices.map((d) => ({ label: d.name, value: d.sessions, icon: DEVICE_ICONS[d.name] }))} />
            </Card>
            <Card title="Hasta dónde leen" subtitle="Visitas que vieron cada sección">
              <HBars
                total={t.sessions}
                rows={SECTION_ORDER
                  .map((id) => ({ label: sectionName(id), value: data.sections.find((s) => s.section === id)?.sessions || 0 }))}
              />
            </Card>
          </div>

          <Card title="Últimas visitas" subtitle="Toca una visita para ver todo lo que hizo, en orden">
            {data.recent_sessions.length ? (
              <ul>{data.recent_sessions.map((s) => <SessionRow key={s.session_id} s={s} />)}</ul>
            ) : (
              <p className="text-sm text-gray-400 py-6 text-center">Sin visitas en este período.</p>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default AnalyticsSection;
