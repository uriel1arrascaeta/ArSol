import React, { useCallback, useEffect, useState } from 'react';
import { UserPlus, Trash2, Users, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const MIN_PASSWORD = 8;

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const inputCls = 'w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#FF7A00] outline-none';

const UsersManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`, { headers: authHeaders() });
      if (res.ok) setUsers(await res.json());
    } catch {
      setMessage({ text: 'No se pudo cargar la lista de usuarios.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    if (form.password.length < MIN_PASSWORD) {
      setMessage({ text: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`, type: 'error' });
      return;
    }
    if (form.password !== form.confirm) {
      setMessage({ text: 'Las contraseñas no coinciden.', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage({ text: `Usuario ${form.email} creado. Ya puede entrar con ese email y contraseña.`, type: 'success' });
        setForm({ name: '', email: '', password: '', confirm: '' });
        loadUsers();
      } else {
        setMessage({ text: data.message || 'No se pudo crear el usuario.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error de conexión con el servidor.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`¿Eliminar el usuario ${user.email}? Ya no podrá entrar a ArSol Central.`)) return;
    try {
      const res = await fetch(`${API_URL}/api/users/${user.id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      setMessage({ text: data.message || (res.ok ? 'Usuario eliminado' : 'No se pudo eliminar'), type: res.ok ? 'success' : 'error' });
      if (res.ok) loadUsers();
    } catch {
      setMessage({ text: 'Error de conexión con el servidor.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Users size={16} /> Usuarios con acceso</h5>
        {loading ? (
          <p className="text-sm text-gray-400">Cargando...</p>
        ) : (
          <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl">
            {users.map((u) => (
              <li key={u.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 shrink-0">
                  {(u.name || u.email).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {u.name} {u.is_me && <span className="text-xs font-medium text-[#CC6200] bg-[#FF7A00]/10 px-1.5 py-0.5 rounded ml-1">Tú</span>}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                {!u.is_me && (
                  <button onClick={() => handleDelete(u)} className="text-gray-400 hover:text-red-600 p-2" title="Eliminar usuario" aria-label={`Eliminar ${u.email}`}>
                    <Trash2 size={18} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={handleCreate} className="space-y-4">
        <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2"><UserPlus size={16} /> Agregar usuario</h5>
        <div>
          <label htmlFor="u-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input id="u-name" name="name" value={form.name} onChange={onChange} required className={inputCls} />
        </div>
        <div>
          <label htmlFor="u-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input id="u-email" name="email" type="email" autoComplete="off" value={form.email} onChange={onChange} required className={inputCls} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="u-pass" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input id="u-pass" name="password" type="password" autoComplete="new-password" minLength={MIN_PASSWORD} value={form.password} onChange={onChange} required className={inputCls} />
          </div>
          <div>
            <label htmlFor="u-confirm" className="block text-sm font-medium text-gray-700 mb-1">Repetir contraseña</label>
            <input id="u-confirm" name="confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={onChange} required className={inputCls} />
          </div>
        </div>
        <p className="text-xs text-gray-500">Mínimo {MIN_PASSWORD} caracteres. Todos los usuarios tienen acceso completo a ArSol Central.</p>

        {message.text && (
          <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message.text}</div>
        )}

        <button type="submit" disabled={saving} className="bg-gray-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-[#FF7A00] disabled:opacity-60 transition-colors flex items-center gap-2">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />} Crear usuario
        </button>
      </form>
    </div>
  );
};

export default UsersManager;
