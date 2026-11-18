// Analítica propia de la landing (anónima: sin nombre, IP ni datos personales).
// Cada navegador recibe un ID aleatorio (visitante) y cada pestaña/visita un ID de sesión.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const TRACK_URL = `${API_URL}/api/track`;

const safeGet = (storage, key) => {
  try { return storage.getItem(key); } catch { return null; }
};
const safeSet = (storage, key, value) => {
  try { storage.setItem(key, value); } catch { /* modo privado */ }
};

const newId = () =>
  (crypto?.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);

const getId = (storage, key) => {
  let id = safeGet(storage, key);
  if (!id) {
    id = newId();
    safeSet(storage, key, id);
  }
  return id;
};

const detectDevice = () => {
  const ua = navigator.userAgent;
  if (/iPad|Tablet/i.test(ua)) return 'Tablet';
  if (/Mobi|Android|iPhone/i.test(ua)) return 'Celular';
  return 'Computadora';
};

const normalizeSource = (raw) => {
  const s = raw.toLowerCase();
  if (s.includes('google')) return 'Google';
  if (s.includes('instagram')) return 'Instagram';
  if (s.includes('facebook') || s === 'fb' || s.includes('fb.')) return 'Facebook';
  if (s.includes('whatsapp') || s.includes('wa.me')) return 'WhatsApp';
  if (s.includes('bing')) return 'Bing';
  if (s.includes('youtube')) return 'YouTube';
  if (s.includes('tiktok')) return 'TikTok';
  return raw.replace(/^www\./, '');
};

// Origen de la visita: ?utm_source / ?origem, luego el sitio que la refirió, si no "Directo".
// Se fija al inicio de la sesión.
const detectSource = () => {
  const saved = safeGet(sessionStorage, 'arsol_src');
  if (saved) return saved;
  const params = new URLSearchParams(window.location.search);
  let source = params.get('utm_source') || params.get('origem');
  if (!source && document.referrer) {
    try {
      const host = new URL(document.referrer).hostname;
      if (host && host !== window.location.hostname) source = host;
    } catch { /* referrer inválido */ }
  }
  source = source ? normalizeSource(source) : 'Directo';
  safeSet(sessionStorage, 'arsol_src', source);
  return source;
};

// Los administradores logueados no cuentan como visitantes
const isAdmin = () => safeGet(localStorage, 'isAuthenticated') === 'true';

export const track = (event, data = {}) => {
  if (isAdmin()) return;
  const payload = JSON.stringify({
    event,
    visitor_id: getId(localStorage, 'arsol_vid'),
    session_id: getId(sessionStorage, 'arsol_sid'),
    source: detectSource(),
    device: detectDevice(),
    ...data,
  });
  // text/plain evita el preflight CORS; sendBeacon sobrevive al cambio de página
  const blob = new Blob([payload], { type: 'text/plain' });
  if (navigator.sendBeacon && navigator.sendBeacon(TRACK_URL, blob)) return;
  fetch(TRACK_URL, { method: 'POST', body: payload, headers: { 'Content-Type': 'text/plain' }, keepalive: true })
    .catch(() => { /* la analítica nunca debe romper la página */ });
};

const onceKeys = new Set();
// Envía un evento una sola vez por sesión (ej. "usó el simulador")
export const trackOnce = (key, event, data) => {
  const storageKey = `arsol_once_${key}`;
  if (onceKeys.has(storageKey) || safeGet(sessionStorage, storageKey)) return;
  onceKeys.add(storageKey);
  safeSet(sessionStorage, storageKey, '1');
  track(event, data);
};

const classifyLink = (href) => {
  if (!href) return 'other';
  if (href.includes('edyran.com')) return 'orcamento';
  if (href.includes('whatsapp.com') || href.includes('wa.me')) return 'whatsapp';
  if (href.includes('instagram.com')) return 'instagram';
  if (href.startsWith('tel:')) return 'telefone';
  if (href.startsWith('#')) return 'nav';
  return 'other';
};

// Visita + clics + secciones vistas. Devuelve una función para limpiar.
export const initTracking = () => {
  track('pageview');

  const onClick = (e) => {
    const el = e.target.closest('a, button');
    if (!el || el.closest('[data-no-track]')) return;
    const href = el.getAttribute('href') || '';
    const label = (el.dataset.track || el.getAttribute('aria-label') || el.textContent || '')
      .replace(/\s+/g, ' ').trim().slice(0, 80);
    const section = el.closest('section[id], nav, footer');
    const sectionName = section ? (section.id || section.tagName.toLowerCase()) : 'flotante';
    track('click', { category: classifyLink(href), label, section: sectionName });
  };
  document.addEventListener('click', onClick, true);

  let observer;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          trackOnce(`sec_${id}`, 'section_view', { section: id });
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '-40% 0px -40% 0px' }); // cuenta cuando la sección cruza el centro de la pantalla
    document.querySelectorAll('section[id]').forEach((s) => observer.observe(s));
  }

  return () => {
    document.removeEventListener('click', onClick, true);
    observer?.disconnect();
  };
};
