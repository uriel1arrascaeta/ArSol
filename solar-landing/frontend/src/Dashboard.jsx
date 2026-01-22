import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Settings, LogOut, Sun, Zap, TrendingUp, Bell, Leaf, DollarSign, Calendar, Trash2, Plus, X, Edit, Clock } from 'lucide-react';

const Dashboard = ({ onLogout }) => {
  const [stats, setStats] = useState({
    energy: { value: "...", trend: "...", trendUp: true },
    co2: { value: "...", trend: "...", trendUp: true },
    income: { value: "...", trend: "...", trendUp: true }
  });
  const [activities, setActivities] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [activeTab, setActiveTab] = useState('resumen');

  const loadDashboardData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/dashboard');
      const data = await res.json();
      if (data.stats) setStats(data.stats);
      if (data.activities) setActivities(data.activities);
      
      const resAppt = await fetch('http://localhost:5000/api/appointments');
      if (resAppt.ok) setAppointments(await resAppt.json());
    } catch (err) {
      console.error("Error cargando dashboard:", err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/activities/${id}`, { method: 'DELETE' });
        
        if (response.ok) {
          loadDashboardData();
        } else {
          alert("Error al eliminar. Revisa la terminal del backend.");
        }
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("No se pudo conectar con el servidor. ¿Está corriendo 'python app.py'?");
      }
    }
  };

  const handleSave = async (clientData) => {
    const method = editingClient ? 'PUT' : 'POST';
    const url = editingClient 
      ? `http://localhost:5000/api/activities/${editingClient.id}`
      : 'http://localhost:5000/api/activities';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });
      
      if (response.ok) {
        // Recargar datos
        loadDashboardData();
        setIsModalOpen(false);
        setEditingClient(null);
      } else {
        alert("Error al guardar los datos.");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 flex items-center gap-2 border-b border-gray-100">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-md">
            <Sun className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-gray-900 tracking-tight">ArSol Panel</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
          <NavItem icon={<LayoutDashboard size={20} />} label="Resumen" active={activeTab === 'resumen'} onClick={() => setActiveTab('resumen')} />
          <NavItem icon={<Users size={20} />} label="Clientes" active={activeTab === 'clientes'} onClick={() => setActiveTab('clientes')} />
          <NavItem icon={<Zap size={20} />} label="Instalaciones" active={activeTab === 'instalaciones'} onClick={() => setActiveTab('instalaciones')} />
          <NavItem icon={<Calendar size={20} />} label="Agenda" active={activeTab === 'agenda'} onClick={() => setActiveTab('agenda')} />
          <NavItem icon={<Settings size={20} />} label="Configuración" active={activeTab === 'config'} onClick={() => setActiveTab('config')} />
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button onClick={onLogout} className="flex items-center gap-3 text-gray-600 hover:text-red-600 transition-colors w-full px-4 py-3 rounded-lg hover:bg-red-50 font-medium">
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 overflow-y-auto h-full">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hola, Admin 👋</h1>
            <p className="text-sm text-gray-500">Aquí tienes lo que está pasando hoy.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-yellow-600 transition-colors relative rounded-full hover:bg-gray-100">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">Huriel</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-tr from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold border-2 border-white shadow-sm">
                H
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* VISTA: RESUMEN */}
          {activeTab === 'resumen' && (
            <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Energía Generada" 
              value={stats.energy.value} 
              trend={stats.energy.trend} 
              trendUp={stats.energy.trendUp}
              icon={<Zap className="text-yellow-600 h-6 w-6" />} 
              bg="bg-yellow-50"
            />
            <StatCard 
              title="CO2 Evitado" 
              value={stats.co2.value} 
              trend={stats.co2.trend} 
              trendUp={stats.co2.trendUp}
              icon={<Leaf className="text-green-600 h-6 w-6" />} 
              bg="bg-green-50"
            />
            <StatCard 
              title="Ingresos Mensuales" 
              value={stats.income.value} 
              trend={stats.income.trend} 
              trendUp={stats.income.trendUp}
              icon={<DollarSign className="text-blue-600 h-6 w-6" />} 
              bg="bg-blue-50"
            />
          </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900">Solicitudes Recientes</h3>
              <button 
                onClick={() => { setEditingClient(null); setIsModalOpen(true); }}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Nuevo Cliente
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 text-gray-900 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-4">Cliente</th>
                    <th className="px-8 py-4">Estado</th>
                    <th className="px-8 py-4">Fecha</th>
                    <th className="px-8 py-4">Presupuesto Est.</th>
                    <th className="px-8 py-4">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activities.length > 0 ? activities.map((activity) => (
                    <TableRow 
                      key={activity.id}
                      name={activity.name} 
                      email={activity.email} 
                      status={activity.status} 
                      date={activity.date} 
                      amount={activity.amount}
                      onDelete={() => handleDelete(activity.id)}
                      onEdit={() => {
                        setEditingClient(activity);
                        setIsModalOpen(true);
                      }}
                    />
                  )) : (
                    <tr><td colSpan="5" className="p-4 text-center text-gray-500">Cargando datos...</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
            </>
          )}

          {/* VISTA: AGENDA (CITAS) */}
          {activeTab === 'agenda' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <Calendar className="text-primary" /> Agenda de Citas
                </h3>
                <p className="text-gray-500 text-sm mt-1">Citas programadas desde la Landing Page.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50/50 text-gray-900 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-4">Nombre</th>
                      <th className="px-8 py-4">Contacto</th>
                      <th className="px-8 py-4">Fecha</th>
                      <th className="px-8 py-4">Hora</th>
                      <th className="px-8 py-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {appointments.length > 0 ? appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-gray-50/80">
                        <td className="px-8 py-4 font-bold text-gray-900">{appt.name}</td>
                        <td className="px-8 py-4">{appt.email}</td>
                        <td className="px-8 py-4">{appt.date}</td>
                        <td className="px-8 py-4 font-medium flex items-center gap-2"><Clock size={16} className="text-gray-400"/> {appt.time}</td>
                        <td className="px-8 py-4"><span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{appt.status}</span></td>
                      </tr>
                    )) : <tr><td colSpan="5" className="p-8 text-center text-gray-500">No hay citas programadas.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Agregar/Editar */}
        <ClientModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave}
          client={editingClient}
        />
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active ? 'bg-yellow-50 text-yellow-700 font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
    <div className={`transition-transform group-hover:scale-110 ${active ? 'text-yellow-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
      {icon}
    </div>
    <span>{label}</span>
  </button>
);

const StatCard = ({ title, value, trend, trendUp, icon, bg }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${bg}`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        <TrendingUp size={12} className={!trendUp ? "rotate-180" : ""} />
        <span>{trend}</span>
      </div>
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</h3>
    </div>
  </div>
);

const TableRow = ({ name, email, status, date, amount, onDelete, onEdit }) => {
  const statusStyles = {
    Pendiente: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Completado: "bg-green-100 text-green-700 border-green-200",
    "En Proceso": "bg-blue-100 text-blue-700 border-blue-200"
  };

  return (
    <tr className="hover:bg-gray-50/80 transition-colors group">
      <td className="px-8 py-4">
        <div>
          <p className="font-bold text-gray-900">{name}</p>
          <p className="text-xs text-gray-400">{email}</p>
        </div>
      </td>
      <td className="px-8 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyles[status] || "bg-gray-100 text-gray-600"}`}>
          {status}
        </span>
      </td>
      <td className="px-8 py-4 font-medium">{date}</td>
      <td className="px-8 py-4 font-medium">{amount}</td>
      <td className="px-8 py-4 flex items-center gap-3">
        <button onClick={onEdit} className="text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
          <Edit size={18} />
        </button>
        <button onClick={onDelete} className="text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  );
};

const ClientModal = ({ isOpen, onClose, onSave, client }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', status: 'Pendiente', date: '', amount: ''
  });

  useEffect(() => {
    if (client) {
      setFormData(client);
    } else {
      setFormData({
        name: '', email: '', status: 'Pendiente', 
        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }), 
        amount: '$ '
      });
    }
  }, [client, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">{client ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente</label>
            <input required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input required type="email" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none bg-white"
                value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Completado">Completado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
              <input required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-primary transition-colors mt-4">Guardar</button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
