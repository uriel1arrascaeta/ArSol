import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Settings, LogOut, Sun, Zap, TrendingUp, Bell, Leaf, DollarSign, Calendar, Trash2, Plus, X, Edit, Clock, Search, Wrench, CheckCircle, KeyRound, Calculator, ChevronRight, ChevronLeft, Save } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatCard from './components/StatCard';
import ClientModal from './components/ClientModal';
import AppointmentModal from './components/AppointmentModal';
import ProjectSection from './components/ProjectSection';
import PasswordChangeForm from './components/PasswordChangeForm';

const Dashboard = ({ onLogout }) => {
  const [stats, setStats] = useState({
    energy: { value: "...", trend: "...", trendUp: true },
    co2: { value: "...", trend: "...", trendUp: true },
    income: { value: "...", trend: "...", trendUp: true }
  });
  const [activities, setActivities] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [dismissedNotifs, setDismissedNotifs] = useState([]);
  const [activeTab, setActiveTab] = useState('resumen');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  // Generar notificaciones basadas en citas y fechas de proyectos
  useEffect(() => {
    const generateNotifications = () => {
      const notifs = [];
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      // 1. Notificar Citas Pendientes
      appointments.forEach(appt => {
        if (appt.status === 'Pendiente') {
          notifs.push({
            id: `appt-${appt.id}`,
            title: 'Nueva Cita Agendada',
            msg: `${appt.name} solicitó una cita para el ${appt.date}`,
            type: 'cita',
            time: appt.time
          });
        }
      });

      // 2. Notificar Proyectos Cercanos (Próximos 7 días)
      const months = { 'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5, 'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11 };
      
      activities.forEach(act => {
        if (act.status === 'En Proceso' || act.status === 'Pendiente') {
          try {
            // Intentar parsear fecha formato "21 Ene 2026"
            const parts = act.date.toLowerCase().replace('.', '').split(' ');
            if (parts.length >= 3) {
              const day = parseInt(parts[0]);
              const monthStr = parts[1].substring(0, 3);
              const year = parseInt(parts[2]);
              
              if (months[monthStr] !== undefined) {
                const actDate = new Date(year, months[monthStr], day);
                if (actDate >= today && actDate <= nextWeek) {
                  notifs.push({ id: `act-${act.id}`, title: 'Proyecto Próximo', msg: `Instalación de ${act.name} programada para el ${act.date}`, type: 'proyecto' });
                }
              }
            }
          } catch (e) { console.error("Error fecha notif", e); }
        }
      });
      // Filtrar las que ya fueron descartadas
      setNotifications(notifs.filter(n => !dismissedNotifs.includes(n.id)));
    };
    generateNotifications();
  }, [appointments, activities, dismissedNotifs]);

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
    const isEdit = clientData.id;
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit 
      ? `http://localhost:5000/api/activities/${clientData.id}`
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

  const handleDeleteAppointment = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/appointments/${id}`, { method: 'DELETE' });
        if (response.ok) loadDashboardData();
      } catch (error) {
        console.error("Error al eliminar cita:", error);
      }
    }
  };

  const handleSaveAppointment = async (apptData) => {
    const isEdit = apptData.id;
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit 
      ? `http://localhost:5000/api/appointments/${apptData.id}`
      : 'http://localhost:5000/api/appointments';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apptData)
      });
      
      if (response.ok) {
        loadDashboardData();
        setIsAppointmentModalOpen(false);
        setEditingAppointment(null);
      } else {
        alert("Error al guardar la cita.");
      }
    } catch (error) {
      console.error("Error al guardar cita:", error);
    }
  };

  const handleDismiss = (e, id) => {
    e.stopPropagation();
    setDismissedNotifs(prev => [...prev, id]);
  };

  const handleDismissAll = () => {
    const ids = notifications.map(n => n.id);
    setDismissedNotifs(prev => [...prev, ...ids]);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 overflow-y-auto h-full">
        {/* Header */}
        <Header 
          showNotifications={showNotifications} 
          setShowNotifications={setShowNotifications} 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          notifications={notifications} 
          handleDismiss={handleDismiss} 
          handleDismissAll={handleDismissAll} 
        />

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
              icon={<Zap className="text-[#FF7A00] h-6 w-6" />} 
              bg="bg-[#FF7A00]/10"
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
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#FF7A00] transition-colors flex items-center gap-2"
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
                  <Calendar className="text-[#FF7A00]" /> Agenda de Citas
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
                      <th className="px-8 py-4">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {appointments.length > 0 ? appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-gray-50/80">
                        <td className="px-8 py-4 font-bold text-gray-900">{appt.name}</td>
                        <td className="px-8 py-4">{appt.email}</td>
                        <td className="px-8 py-4">{appt.date}</td>
                        <td className="px-8 py-4 font-medium flex items-center gap-2"><Clock size={16} className="text-gray-400"/> {appt.time}</td>
                        <td className="px-8 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${appt.status === 'Atendida' ? 'bg-green-100 text-green-700' : appt.status === 'Cancelada' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {appt.status}
                          </span>
                        </td>
                        <td className="px-8 py-4 flex items-center gap-3">
                          <button onClick={() => { setEditingAppointment(appt); setIsAppointmentModalOpen(true); }} className="text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDeleteAppointment(appt.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    )) : <tr><td colSpan="6" className="p-8 text-center text-gray-500">No hay citas programadas.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VISTA: CLIENTES (Directorio con Buscador) */}
          {activeTab === 'clientes' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Directorio de Clientes</h3>
                  <p className="text-gray-500 text-sm">Gestiona y busca en tu base de datos de clientes.</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Buscar por nombre o email..." 
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent outline-none w-full sm:w-64 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50/50 text-gray-900 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-4">Cliente</th>
                      <th className="px-8 py-4">Estado</th>
                      <th className="px-8 py-4">Fecha</th>
                      <th className="px-8 py-4">Presupuesto</th>
                      <th className="px-8 py-4">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activities.filter(client => 
                      client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      client.email.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length > 0 ? (
                      activities.filter(client => 
                        client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        client.email.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((activity) => (
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
                      ))
                    ) : (
                      <tr><td colSpan="5" className="p-8 text-center text-gray-500">No se encontraron clientes que coincidan con tu búsqueda.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VISTA: INSTALACIONES */}
          {activeTab === 'instalaciones' && (
            <div>
              <div className="mb-8">
                <h3 className="font-bold text-2xl text-gray-900">Estado de Instalaciones</h3>
                <p className="text-gray-500 text-sm">Un vistazo a los proyectos activos y completados.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.filter(act => act.status === 'En Proceso' || act.status === 'Completado').length > 0 ? (
                  activities
                    .filter(act => act.status === 'En Proceso' || act.status === 'Completado')
                    .map(installation => (
                      <div key={installation.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-bold text-lg text-gray-900">{installation.name}</p>
                            <p className="text-sm text-gray-500">{installation.email}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${installation.status === 'Completado' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                            {installation.status}
                          </span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                          <div>
                            <span className="block font-medium text-gray-600">Presupuesto: <span className="font-bold text-gray-900">{installation.amount}</span></span>
                            <span className="block text-gray-400 text-xs mt-1">{installation.date}</span>
                          </div>
                          <button onClick={() => { setEditingClient(installation); setIsModalOpen(true); }} className="text-gray-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-full" title="Editar Instalación">
                            <Edit size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500 col-span-full text-center p-8">No hay instalaciones en proceso o completadas.</p>
                )}
              </div>
            </div>
          )}

          {/* VISTA: PROYECTOS (Antes Presupuestos) */}
          {activeTab === 'proyectos' && (
            <ProjectSection
              activities={activities}
              onSaveNew={(data) => {
                setEditingClient(data);
                setIsModalOpen(true); // This will open the client modal
              }}
              onUpdateClient={handleSave}
              onSaveProject={handleSave} // Reutilizamos handleSave para guardar el proyecto completo si es necesario
            />
          )}

          {/* VISTA: CONFIGURACIÓN */}
          {activeTab === 'config' && (
            <div>
              <div className="mb-8">
                <h3 className="font-bold text-2xl text-gray-900">Configuración de la Cuenta</h3>
                <p className="text-gray-500 text-sm">Administra tus datos de acceso.</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-lg">
                <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-6">
                  <KeyRound className="text-[#FF7A00]" />
                  Cambiar Contraseña
                </h4>
                <PasswordChangeForm />
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

        {/* Modal de Editar Cita */}
        <AppointmentModal 
          isOpen={isAppointmentModalOpen} 
          onClose={() => setIsAppointmentModalOpen(false)} 
          onSave={handleSaveAppointment}
          appointment={editingAppointment}
        />
      </main>
    </div>
  );
};

const TableRow = ({ name, email, status, date, amount, onDelete, onEdit }) => {
  const statusStyles = {
    Pendiente: "bg-[#FF7A00]/20 text-[#CC6200] border-[#FF7A00]/30",
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

export default Dashboard;
