import React, { useState } from 'react';
import { Sun, Battery, DollarSign, Menu, X, CheckCircle, ArrowRight, Phone, Zap, ShieldCheck, Leaf, Lock } from 'lucide-react';
import Dashboard from './Dashboard';
import AdminLogin from './AdminLogin';
//import AppointmentForm from './AppointmentForm';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Inicializar estado verificando localStorage para persistir la sesión
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true' ? 'dashboard' : 'landing';
  });
  const COMPANY_NAME = "ArSol";
  const WHATSAPP_NUMBER = "5548996539440"; // Reemplaza con tu número de WhatsApp
  const WHATSAPP_MESSAGE = "Hola! Me gustaría solicitar un presupuesto para un sistema de energía solar.";
  
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    billAmount: ''
  });

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleWhatsAppRedirect = (e) => {
    e.preventDefault();
    const { name, phone, email, billAmount } = contactForm;
    
    if (!name || !phone || !email || !billAmount) return;

    const message = `Hola ArSol! Mi nombre es ${name}. \n\nMe gustaría solicitar un presupuesto.\n⚡ Consumo aproximado: ${billAmount}\n📱 Teléfono: ${phone}\n📧 Email: ${email}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setCurrentView('landing');
  };

  if (currentView === 'login') {
    return <AdminLogin onLogin={handleLogin} onBack={() => setCurrentView('landing')} />;
  }

  if (currentView === 'dashboard') {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-primary selection:text-white">
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md shadow-sm z-50 transition-all duration-300 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-yellow-600 rounded-xl shadow-lg shadow-primary/30">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {COMPANY_NAME}
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8 font-medium">
              <a href="#inicio" className="text-gray-600 hover:text-primary transition-colors">Inicio</a>
              <a href="#beneficios" className="text-gray-600 hover:text-primary transition-colors">Beneficios</a>
              <a href="#servicios" className="text-gray-600 hover:text-primary transition-colors">Servicios</a>
              <a href="#contacto" className="bg-gray-900 text-white px-6 py-2.5 rounded-full hover:bg-primary transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2">
                <Zap className="w-4 h-4 fill-current" /> Presupuesto
              </a>
              <button onClick={() => setCurrentView('login')} className="text-gray-400 hover:text-gray-900 transition-colors" title="Acceso Admin">
                <Lock className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={toggleMenu} className="text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl animate-fade-in-down">
            <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
              <a href="#inicio" onClick={toggleMenu} className="block px-4 py-3 hover:bg-gray-50 rounded-lg font-medium text-gray-700">Inicio</a>
              <a href="#beneficios" onClick={toggleMenu} className="block px-4 py-3 hover:bg-gray-50 rounded-lg font-medium text-gray-700">Beneficios</a>
              <a href="#servicios" onClick={toggleMenu} className="block px-4 py-3 hover:bg-gray-50 rounded-lg font-medium text-gray-700">Servicios</a>
              <a href="#contacto" onClick={toggleMenu} className="block px-4 py-3 text-primary font-bold bg-yellow-50/50 rounded-lg mt-2">Solicitar Presupuesto</a>
              <button onClick={() => { toggleMenu(); setCurrentView('login'); }} className="block w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg font-medium text-gray-700">Acceso Admin</button>
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="inicio" className="pt-32 pb-20 md:pt-48 md:pb-32 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-100/40 via-white to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12 md:gap-20">
          <div className="md:w-1/2 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-semibold text-gray-600 mb-8">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Tecnología Solar 2024
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
              Energía limpia, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-600">
                economía real.
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-lg mx-auto md:mx-0 leading-relaxed">
              Transforma tu hogar o empresa con <strong>{COMPANY_NAME}</strong>. Reduce tu factura de luz hasta un 98% y asegura tu futuro energético.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a href="#contacto" className="bg-primary text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-yellow-600 transition-all shadow-xl hover:shadow-primary/40 flex items-center justify-center gap-2 group">
                Calcular Ahorro
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#beneficios" className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center">
                Ver Beneficios
              </a>
            </div>
            
            <div className="mt-10 flex items-center justify-center md:justify-start gap-6 text-gray-400 grayscale opacity-70">
               {/* Logos ficticios de partners/certificaciones */}
               <div className="flex items-center gap-1"><ShieldCheck className="w-5 h-5"/> Tier 1</div>
               <div className="flex items-center gap-1"><CheckCircle className="w-5 h-5"/> ISO 9001</div>
               <div className="flex items-center gap-1"><Leaf className="w-5 h-5"/> Eco-Friendly</div>
            </div>
          </div>
          
          <div className="md:w-1/2 relative w-full">
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/3] group border-4 border-white">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Instalación ArSol Paneles" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 max-w-xs animate-fade-in-up">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2.5 rounded-full text-green-600">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">-98% en tu factura</p>
                    <p className="text-xs text-gray-500 font-medium">Promedio de nuestros clientes</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Blobs */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 rounded-full blur-3xl opacity-50"></div>
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section id="beneficios" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-primary font-bold tracking-wider uppercase text-sm mb-3">¿Por qué ArSol?</h2>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Inversión inteligente</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Diseñamos sistemas fotovoltaicos que maximizan la captación de energía y minimizan el tiempo de retorno de la inversión.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <DollarSign className="h-8 w-8 text-green-600" />,
                bg: "bg-green-50",
                title: "Ahorro Inmediato",
                desc: "Congela el precio de tu energía. Deja de sufrir con el aumento de las tarifas y comienza a ahorrar desde el primer mes."
              },
              {
                icon: <Sun className="h-8 w-8 text-primary" />,
                bg: "bg-yellow-50",
                title: "Energía Infinita",
                desc: "Aprovecha el recurso más abundante. Nuestros paneles de alta eficiencia funcionan incluso en días nublados."
              },
              {
                icon: <ShieldCheck className="h-8 w-8 text-blue-600" />,
                bg: "bg-blue-50",
                title: "Garantía de 25 Años",
                desc: "Tu inversión está protegida. Ofrecemos garantías líderes en el sector, tanto en producto como en generación."
              }
            ].map((feature, index) => (
              <div key={index} className="group p-8 rounded-3xl bg-white border border-gray-100 hover:border-primary/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CONTACT FORM --- */}
      <section id="contacto" className="py-24 bg-gray-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#F59E0B 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block bg-primary/20 text-primary font-bold px-4 py-1 rounded-full mb-6 border border-primary/20">
                Estudio Gratuito
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Da el paso hacia la <br/><span className="text-primary">independencia energética</span></h2>
              <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                Deja tus datos. Un ingeniero especialista de <strong>{COMPANY_NAME}</strong> analizará tu consumo y enviará una propuesta personalizada sin compromiso.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                    <Phone className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Llama ahora</p>
                    <p className="font-bold text-xl">+55 (48) 9653-9440</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                    <CheckCircle className="text-green-500 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Certificações</p>
                    <p className="font-bold text-xl">FIDE & ANCE</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 p-8 rounded-2xl border border-white/10 shadow-lg">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">Solicita tu Estudio Gratuito</h3>
                <form onSubmit={handleWhatsAppRedirect} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nombre Completo</label>
                    <input 
                      required
                      type="text" 
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Celular</label>
                      <input 
                        required
                        type="tel" 
                        name="phone"
                        value={contactForm.phone}
                        onChange={handleContactChange}
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="Ej: 55 1234 5678"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                      <input 
                        required
                        type="email" 
                        name="email"
                        value={contactForm.email}
                        onChange={handleContactChange}
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="juan@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">¿Cuánto pagas de luz aprox.?</label>
                    <select 
                      required
                      name="billAmount"
                      value={contactForm.billAmount}
                      onChange={handleContactChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-primary outline-none [&>option]:text-gray-900 transition-all"
                    >
                      <option value="">Selecciona un rango</option>
                      <option value="Menos de $1,500">Menos de $1,500</option>
                      <option value="$1,500 - $3,000">$1,500 - $3,000</option>
                      <option value="$3,000 - $5,000">$3,000 - $5,000</option>
                      <option value="Más de $5,000">Más de $5,000</option>
                    </select>
                  </div>

                  <button 
                      type="submit"
                      className="w-full bg-green-500 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-green-600 transition-all shadow-xl hover:shadow-green-500/40 flex items-center justify-center gap-3 group mt-6">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.296-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.289.173-1.414z"/></svg>
                      Enviar por WhatsApp
                  </button>
                </form>
            </div>

          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-950 text-gray-400 py-12 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sun className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">{COMPANY_NAME}</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} {COMPANY_NAME}. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-sm font-medium">
            <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
            <a href="#" className="hover:text-primary transition-colors">Términos</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
