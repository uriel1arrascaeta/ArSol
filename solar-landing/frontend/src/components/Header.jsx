import React from 'react';
import { Bell, Calendar, Zap, X } from 'lucide-react';

const Header = ({ showNotifications, setShowNotifications, notifications, handleDismiss, handleDismissAll }) => {
  return (
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
  );
};

export default Header;
