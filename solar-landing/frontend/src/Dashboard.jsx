import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Settings, LogOut, Sun, Zap, TrendingUp, Bell, Leaf, DollarSign, Calendar, Trash2, Plus, X, Edit, Clock, Search, Wrench, CheckCircle, KeyRound, Calculator } from 'lucide-react';

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
          <NavItem icon={<Calculator size={20} />} label="Proyectos" active={activeTab === 'proyectos'} onClick={() => setActiveTab('proyectos')} />
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
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-yellow-600 transition-colors relative rounded-full hover:bg-gray-100"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in-up">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900">Notificaciones</h4>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-600">{notifications.length}</span>
                    </div>
                    {notifications.length > 0 && (
                      <button onClick={handleDismissAll} className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline">
                        Borrar todas
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map((notif) => (
                      <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 group relative">
                        <div className={`mt-1 p-2 rounded-full h-fit ${notif.type === 'cita' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {notif.type === 'cita' ? <Calendar size={14} /> : <Zap size={14} />}
                        </div>
                        <div className="flex-1 pr-4">
                          <p className="text-sm font-bold text-gray-900">{notif.title}</p>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.msg}</p>
                        </div>
                        <button 
                          onClick={(e) => handleDismiss(e, notif.id)}
                          className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                          title="Descartar"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-gray-400 text-sm">No tienes notificaciones nuevas.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
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
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none w-full sm:w-64 transition-all"
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
                setIsModalOpen(true);
              }}
              onUpdateClient={handleSave}
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
                  <KeyRound className="text-primary" />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} placeholder="Ej: 24 Ene 2026" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
            <input required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
              value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-primary transition-colors mt-4">Guardar</button>
        </form>
      </div>
    </div>
  );
};

const AppointmentModal = ({ isOpen, onClose, onSave, appointment }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', date: '', time: '', status: 'Pendiente'
  });

  useEffect(() => {
    if (appointment) {
      setFormData(appointment);
    }
  }, [appointment, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Editar Cita</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input required type="date" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
              <input required type="time" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none bg-white"
              value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="Pendiente">Pendiente</option>
              <option value="Confirmada">Confirmada</option>
              <option value="Atendida">Atendida</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-primary transition-colors mt-4">Guardar Cambios</button>
        </form>
      </div>
    </div>
  );
};

const PasswordChangeForm = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Las nuevas contraseñas no coinciden.', type: 'error' });
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@arsol.com', currentPassword, newPassword })
      });
      const data = await res.json();
      setMessage({ text: data.message, type: res.ok ? 'success' : 'error' });
    } catch (error) {
      setMessage({ text: 'Error de conexión con el servidor.', type: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" />
      </div>
      {message.text && (
        <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}
      <button type="submit" className="bg-gray-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary transition-colors">
        Actualizar Contraseña
      </button>
    </form>
  );
};

const ProjectSection = ({ activities, onSaveNew, onUpdateClient }) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const selectedClient = activities.find(c => c.id === parseInt(selectedClientId));

  const handleProjectSave = (projectData) => {
    if (selectedClient) {
      // Update existing client
      onUpdateClient({
        ...selectedClient,
        amount: projectData.rawCost,
        status: 'En Proceso' // Automatically update status to In Progress
      });
      alert(`Proyecto asignado a ${selectedClient.name} con éxito.`);
    } else {
      // Create new
      onSaveNew({ 
        name: '', 
        email: '', 
        status: 'Pendiente', 
        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }), 
        amount: projectData.rawCost 
      });
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h3 className="font-bold text-2xl text-gray-900">Gestión de Proyectos</h3>
        <p className="text-gray-500 text-sm">Calcula y asigna instalaciones fotovoltaicas.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Cliente</label>
        <div className="relative">
          <select 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none bg-white appearance-none"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
          >
            <option value="">-- Nuevo Prospecto (Sin cliente asignado) --</option>
            {activities.map(client => (
              <option key={client.id} value={client.id}>
                {client.name} - {client.status}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <Users className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        {selectedClient && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
            <p><strong>Cliente seleccionado:</strong> {selectedClient.name}</p>
            <p><strong>Presupuesto actual:</strong> {selectedClient.amount}</p>
          </div>
        )}
      </div>
      
      <BudgetCalculator 
        client={selectedClient}
        onSave={handleProjectSave} 
      />
    </div>
  );
};

const BudgetCalculator = ({ client, onSave }) => {
  const [consumption, setConsumption] = useState('');
  const [result, setResult] = useState(null);

  const calculate = (e) => {
    e.preventDefault();
    const kwh = parseFloat(consumption);
    if (!kwh) return;

    // Fórmulas estimadas:
    // 1. Tamaño Sistema (kWp) = (Consumo Mensual / 30 días) / 4.5 HSP * 1.15 (Pérdidas)
    const systemSize = (kwh / 30) / 4.5 * 1.15;
    // 2. Paneles (550W)
    const panels = Math.ceil(systemSize * 1000 / 550);
    // 3. Costo Estimado ($1,200 USD por kWp instalado aprox, ajustado a moneda local ejemplo)
    const cost = Math.round(systemSize * 1200 * 20); // Ejemplo: x20 para convertir a moneda local si fuera necesario, o usar directo.
    // Usaremos un valor base simple: $15,000 base + $3,500 por panel
    const estimatedCost = 15000 + (panels * 3500);

    setResult({
      systemSize: systemSize.toFixed(2),
      panels,
      estimatedCost: estimatedCost.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
      rawCost: `$ ${estimatedCost.toLocaleString('es-MX')}`, // Para el formulario
      monthlyProduction: Math.round(panels * 550 * 4.5 * 30 / 1000)
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
        <h4 className="font-bold text-lg text-gray-900 mb-4">Calculadora Solar</h4>
        <form onSubmit={calculate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Consumo Mensual (kWh)</label>
            <div className="relative">
              <input type="number" value={consumption} onChange={e => setConsumption(e.target.value)} required className="w-full pl-4 pr-12 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" placeholder="Ej: 450" />
              <span className="absolute right-4 top-3 text-gray-400 font-medium">kWh</span>
            </div>
          </div>
          <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-primary transition-colors">
            Calcular Proyecto
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-primary/5 border border-primary/20 p-8 rounded-2xl animate-fade-in-up">
          <h4 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
            <Zap className="text-primary fill-current" /> Propuesta Técnica
          </h4>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-primary/10 pb-4">
              <span className="text-gray-600">Potencia</span>
              <span className="font-bold text-xl text-gray-900">{result.systemSize} kWp</span>
            </div>
            <div className="flex justify-between items-center border-b border-primary/10 pb-4">
              <span className="text-gray-600">Paneles (550W)</span>
              <span className="font-bold text-xl text-gray-900">{result.panels} pzas</span>
            </div>
            <div className="flex justify-between items-center border-b border-primary/10 pb-4">
              <span className="text-gray-600">Producción Est.</span>
              <span className="font-bold text-xl text-gray-900">{result.monthlyProduction} kWh/mes</span>
            </div>
            <div className="pt-2">
              <span className="block text-sm text-gray-500 mb-1">Inversión Total</span>
              <span className="block text-4xl font-extrabold text-primary">{result.estimatedCost}</span>
            </div>
            
            <button 
              onClick={() => onSave(result)}
              className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-yellow-600 transition-colors shadow-lg shadow-primary/30">
              {client ? `Asignar Proyecto a ${client.name}` : 'Guardar como Nuevo Prospecto'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
