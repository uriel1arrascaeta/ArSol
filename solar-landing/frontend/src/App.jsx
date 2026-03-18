import React, { useState } from 'react';
import { Sun, DollarSign, Menu, X, CheckCircle, ArrowRight, Phone, Zap, ShieldCheck, Leaf, Lock, Instagram } from 'lucide-react';
import Dashboard from './Dashboard';
import AdminLogin from './AdminLogin';
//import AppointmentForm from './AppointmentForm';
import logoArsol from './logoArsol.png';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Inicializar estado verificando localStorage para persistir la sesión
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    cidade: '',
    valor_energia: ''
  });
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true' ? 'dashboard' : 'landing';
  });
  const COMPANY_NAME = "ArSol";
  const WHATSAPP_NUMBER = "5547997023788"; // Reemplaza con tu número de WhatsApp
  const WHATSAPP_MESSAGE = "Olá! Gostaria de solicitar um orçamento para um sistema de energia solar.";
  const INSTAGRAM_URL = "https://www.instagram.com/"; // Reemplaza con tu URL de Instagram
  const WHATSAPP_URL = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleFormChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // También envía los datos al backend para guardarlos en la base de datos y el CRM.
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${API_URL}/api/landing/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: formData.nome,
            phone: formData.telefone,
            email: formData.email,
            address: formData.cidade,
            billAmount: formData.valor_energia
        })
    }).catch(err => console.error("Error al enviar al backend", err));

    // Construye el mensaje de WhatsApp
    const message = `Olá! Gostaria de solicitar um orçamento.
Meu nome é ${formData.nome}.
Meu telefone é ${formData.telefone}.
Meu e-mail é ${formData.email}.
Moro em ${formData.cidade}.
Minha fatura de energia é em torno de ${formData.valor_energia}.`;

    window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`, '_blank');
  };

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
    <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-[#FF7A00] selection:text-white">
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md shadow-sm z-50 transition-all duration-300 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 group cursor-pointer">
              <img src={logoArsol} alt="ArSol Solar" className="h-12 w-auto object-contain" />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8 font-medium">
              <a href="#inicio" className="text-gray-600 hover:text-[#FF7A00] transition-colors">Início</a>
              <a href="#beneficios" className="text-gray-600 hover:text-[#FF7A00] transition-colors">Benefícios</a>
              <a href="#servicios" className="text-gray-600 hover:text-[#FF7A00] transition-colors">Serviços</a>
              <a href="#contacto" className="bg-gray-900 text-white px-6 py-2.5 rounded-full hover:bg-[#FF7A00] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2">
                <Zap className="w-4 h-4 fill-current" /> Orçamento
              </a>
              <button onClick={() => setCurrentView('login')} className="text-gray-400 hover:text-gray-900 transition-colors" title="Acesso Admin">
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
              <a href="#inicio" onClick={toggleMenu} className="block px-4 py-3 hover:bg-gray-50 rounded-lg font-medium text-gray-700">Início</a>
              <a href="#beneficios" onClick={toggleMenu} className="block px-4 py-3 hover:bg-gray-50 rounded-lg font-medium text-gray-700">Benefícios</a>
              <a href="#servicios" onClick={toggleMenu} className="block px-4 py-3 hover:bg-gray-50 rounded-lg font-medium text-gray-700">Serviços</a>
              <a href="#contacto" onClick={toggleMenu} className="block px-4 py-3 text-[#FF7A00] font-bold bg-[#FF7A00]/10 rounded-lg mt-2">Solicitar Orçamento</a>
              <div className="flex gap-4 px-4 py-3">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#E1306C] flex items-center gap-2 font-medium"><Instagram size={20}/> Instagram</a>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 flex items-center gap-2 font-medium"><Phone size={20}/> WhatsApp</a>
              </div>
              <button onClick={() => { toggleMenu(); setCurrentView('login'); }} className="block w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg font-medium text-gray-700">Acesso Admin</button>
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="inicio" className="pt-32 pb-20 md:pt-48 md:pb-32 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#FF7A00]/10 via-white to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12 md:gap-20">
          <div className="md:w-1/2 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-semibold text-gray-600 mb-8">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Tecnologia Solar desde 2018
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
              Energia limpa, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] to-[#E66E00]">
                economia real.
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-lg mx-auto md:mx-0 leading-relaxed">
              Transforme sua casa ou empresa com a <strong>{COMPANY_NAME}</strong>. Reduza sua conta de luz em até 98% e garanta seu futuro energético.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a href="#contacto" className="bg-[#FF7A00] text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-[#E66E00] transition-all shadow-xl hover:shadow-[#FF7A00]/40 flex items-center justify-center gap-2 group">
                Calcular Economia
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#beneficios" className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center">
                Ver Benefícios
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
                    <p className="font-bold text-gray-900 text-lg">-90% na sua conta</p>
                    <p className="text-xs text-gray-500 font-medium">Média dos nossos clientes</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Blobs */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#FF7A00]/10 rounded-full blur-3xl opacity-50"></div>
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section id="beneficios" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-[#FF7A00] font-bold tracking-wider uppercase text-sm mb-3">Por que ArSol?</h2>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Investimento inteligente</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Projetamos sistemas fotovoltaicos que maximizam a captação de energia e minimizam o tempo de retorno do investimento.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <DollarSign className="h-8 w-8 text-green-600" />,
                bg: "bg-green-50",
                title: "Economia Imediata",
                desc: "Congele o preço da sua energia. Pare de sofrer com o aumento das tarifas e comece a economizar desde o primeiro mês."
              },
              {
                icon: <Sun className="h-8 w-8 text-[#FF7A00]" />,
                bg: "bg-[#FF7A00]/10",
                title: "Energia Infinita",
                desc: "Aproveite o recurso mais abundante. Nossos painéis de alta eficiência funcionam mesmo em dias nublados."
              },
              {
                icon: <ShieldCheck className="h-8 w-8 text-blue-600" />,
                bg: "bg-blue-50",
                title: "Garantia ate 30 Anos",
                desc: "Seu investimento está protegido. Oferecemos garantias líderes no setor, tanto em produto quanto em geração."
              }
            ].map((feature, index) => (
              <div key={index} className="group p-8 rounded-3xl bg-white border border-gray-100 hover:border-[#FF7A00]/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF7A00] to-[#FF9E40] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CONTACT FORM --- */}
      <section id="contacto" className="py-24 bg-gray-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#FF7A00 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block bg-[#FF7A00]/20 text-[#FF7A00] font-bold px-4 py-1 rounded-full mb-6 border border-[#FF7A00]/20">
                Estudo Gratuito
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Dê o passo para a <br/><span className="text-[#FF7A00]">independência energética</span></h2>
              <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                Deixe seus dados. Um especialista da <strong>{COMPANY_NAME}</strong> analisará seu consumo e enviará uma proposta personalizada sem compromisso.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                    <Phone className="text-[#FF7A00] h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Ligue agora</p>
                    <p className="font-bold text-xl">+55 (47) 99702-3788</p>
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
                <h3 className="text-2xl font-bold text-white mb-6 text-center">Solicite seu Estudo Gratuito</h3>
                {/* Este es el formulario oficial de I.Sales, adaptado a JSX y con el estilo de la página */}
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-1">Nome Completo</label>
                    <input type="text" name="nome" id="nome" required value={formData.nome} onChange={handleFormChange} className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF7A00] outline-none transition-all" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="telefone" className="block text-sm font-medium text-gray-300 mb-1">Telefone/Celular</label>
                      <input type="text" name="telefone" id="telefone" required value={formData.telefone} onChange={handleFormChange} className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF7A00] outline-none transition-all" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">E-mail</label>
                      <input type="email" name="email" id="email" required value={formData.email} onChange={handleFormChange} className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF7A00] outline-none transition-all" />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="cidade" className="block text-sm font-medium text-gray-300 mb-1">Cidade</label>
                    <input type="text" name="cidade" id="cidade" required value={formData.cidade} onChange={handleFormChange} className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF7A00] outline-none transition-all" />
                  </div>

                  <div>
                    <label htmlFor="valor_energia" className="block text-sm font-medium text-gray-300 mb-1">Média de valor da sua fatura</label>
                    <input type="text" name="valor_energia" id="valor_energia" required value={formData.valor_energia} onChange={handleFormChange} className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF7A00] outline-none transition-all" />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#FF7A00] text-white font-bold py-3 rounded-lg hover:bg-[#E66E00] transition-colors"
                  >
                    Enviar e Receber Orçamento
                  </button>
                </form>
            </div>

          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white text-gray-500 pt-12 pb-28 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 md:pr-32">
          <div className="flex items-center gap-2">
            <img src={logoArsol} alt="ArSol Solar" className="h-10 w-auto object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all" />
          </div>
          <p className="text-sm text-gray-800 font-medium">© {new Date().getFullYear()} {COMPANY_NAME}. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-sm font-medium">
            <a href="#" className="hover:text-[#FF7A00] transition-colors">Privacidade</a>
            <a href="#" className="hover:text-[#FF7A00] transition-colors">Termos</a>
            <div className="flex items-center gap-4 ml-4 border-l pl-6 border-gray-200">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#E1306C] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-600 transition-colors">
                <Phone className="w-5 h-5 fill-current" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* --- FLOATING WHATSAPP BUTTON --- */}
      <a 
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#20bd5a] transition-all hover:scale-110 flex items-center justify-center group"
        title="Fale conosco no WhatsApp"
      >
        <span className="absolute right-full mr-3 bg-white text-gray-800 px-3 py-1 rounded-lg text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">Fale Conosco</span>
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
      </a>
    </div>
  );
};

export default App;
