import React from 'react';
import { LayoutDashboard, Users, Settings, LogOut, Sun, Zap, Calendar, Calculator } from 'lucide-react';

const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active ? 'bg-yellow-50 text-yellow-700 font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
    <div className={`transition-transform group-hover:scale-110 ${active ? 'text-yellow-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
      {icon}
    </div>
    <span>{label}</span>
  </button>
);

const Sidebar = ({ activeTab, setActiveTab, onLogout, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside className={`w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-30 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="p-6 flex items-center gap-2 border-b border-gray-100">
        <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-md">
          <Sun className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-extrabold text-gray-900 tracking-tight">ArSol Panel</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-6">
        <NavItem icon={<LayoutDashboard size={20} />} label="Resumen" active={activeTab === 'resumen'} onClick={() => { setActiveTab('resumen'); onClose(); }} />
        <NavItem icon={<Users size={20} />} label="Clientes" active={activeTab === 'clientes'} onClick={() => { setActiveTab('clientes'); onClose(); }} />
        <NavItem icon={<Zap size={20} />} label="Instalaciones" active={activeTab === 'instalaciones'} onClick={() => { setActiveTab('instalaciones'); onClose(); }} />
        <NavItem icon={<Calendar size={20} />} label="Agenda" active={activeTab === 'agenda'} onClick={() => { setActiveTab('agenda'); onClose(); }} />
        <NavItem icon={<Calculator size={20} />} label="Proyectos" active={activeTab === 'proyectos'} onClick={() => { setActiveTab('proyectos'); onClose(); }} />
        <NavItem icon={<Settings size={20} />} label="Configuración" active={activeTab === 'config'} onClick={() => { setActiveTab('config'); onClose(); }} />
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button onClick={onLogout} className="flex items-center gap-3 text-gray-600 hover:text-red-600 transition-colors w-full px-4 py-3 rounded-lg hover:bg-red-50 font-medium">
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
