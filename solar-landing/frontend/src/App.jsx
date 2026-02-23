import React, { useState } from 'react';
import { Sun, DollarSign, Menu, X, CheckCircle, ArrowRight, Phone, Zap, ShieldCheck, Leaf, Lock } from 'lucide-react';
import Dashboard from './Dashboard';
import AdminLogin from './AdminLogin';
//import AppointmentForm from './AppointmentForm';
import logoArsol from './logoArsol.png';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Inicializar estado verificando localStorage para persistir la sesión
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true' ? 'dashboard' : 'landing';
  });
  const COMPANY_NAME = "ArSol";
  const WHATSAPP_NUMBER = "5547997023788"; // Reemplaza con tu número de WhatsApp
  const WHATSAPP_MESSAGE = "Olá! Gostaria de solicitar um orçamento para um sistema de energia solar.";

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
    <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-[#FF7A00] selection:text-white">
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md shadow-sm z-50 transition-all duration-300 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 group cursor-pointer">
<img src={logoArsol} alt="ArSol Solar" className="h-12 w-auto object-contain" />
              {/*<span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {COMPANY_NAME}
              </span>*/}

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
              Tecnologia Solar 2024
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
                    <p className="font-bold text-gray-900 text-lg">-98% na sua conta</p>
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
                title: "Garantia de 25 Anos",
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
                Deixe seus dados. Um engenheiro especialista da <strong>{COMPANY_NAME}</strong> analisará seu consumo e enviará uma proposta personalizada sem compromisso.
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
                <form action="https://app.isales.company/formulario/cliente" method="POST" className="space-y-4">
                  {/* Campos ocultos requeridos por I.Sales */}
                  <input type="hidden" name="e" id="e" value="HJK1231ISAL567" />
                  <input type="hidden" name="fid" id="fid" value="UFD158TR951" />
                  {/* El valor "1" indica a I.Sales que no redirija si se usa AJAX, pero aquí hacemos un envío normal */}
                  <input type="hidden" name="redirect" id="redirect" value="1" />

                  <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-1">Nome Completo</label>
                    <input type="text" name="nome" id="nome" required className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF7A00] outline-none transition-all" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="telefone" className="block text-sm font-medium text-gray-300 mb-1">Telefone/Celular</label>
                      <input type="text" name="telefone" id="telefone" required className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF7A00] outline-none transition-all" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">E-mail</label>
                      <input type="email" name="email" id="email" required className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF7A00] outline-none transition-all" />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="cidade" className="block text-sm font-medium text-gray-300 mb-1">Cidade</label>
                    <input type="text" name="cidade" id="cidade" required className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF7A00] outline-none transition-all" />
                  </div>

                  <div>
                    <label htmlFor="valor_energia" className="block text-sm font-medium text-gray-300 mb-1">Média de valor da sua fatura</label>
                    <input type="text" name="valor_energia" id="valor_energia" required className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF7A00] outline-none transition-all" />
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
      <footer className="bg-white text-gray-500 py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
<img src={logoArsol} alt="ArSol Solar" className="h-8 w-auto object-contain" />
            {/*<span className="text-xl font-bold text-white">{COMPANY_NAME}</span>*/}
          </div>
          <p className="text-sm text-gray-800 font-medium">© {new Date().getFullYear()} {COMPANY_NAME}. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-sm font-medium">
            <a href="#" className="hover:text-[#FF7A00] transition-colors">Privacidade</a>
            <a href="#" className="hover:text-[#FF7A00] transition-colors">Termos</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
