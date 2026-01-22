import React, { useState } from 'react';
import { Calendar, Clock, User, Mail, Send } from 'lucide-react';

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    time: ''
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', date: '', time: '' });
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md mx-auto">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Agenda tu Cita Solar</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-3 text-gray-400" size={20} />
          <input required type="text" placeholder="Tu Nombre" className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-500 outline-none text-gray-900"
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
          <input required type="email" placeholder="Tu Email" className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-500 outline-none text-gray-900"
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
            <input required type="date" className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-500 outline-none text-gray-600"
              value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className="relative">
            <Clock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input required type="time" className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-500 outline-none text-gray-600"
              value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
          </div>
        </div>

        <button type="submit" disabled={status === 'loading'} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
          {status === 'loading' ? 'Enviando...' : <><Send size={20} /> Agendar Cita</>}
        </button>

        {status === 'success' && (
          <div className="p-3 bg-green-100 text-green-700 rounded-lg text-center text-sm font-medium">¡Cita agendada con éxito!</div>
        )}
        {status === 'error' && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-center text-sm font-medium">Error al agendar. Intenta de nuevo.</div>
        )}
      </form>
    </div>
  );
};

export default AppointmentForm;