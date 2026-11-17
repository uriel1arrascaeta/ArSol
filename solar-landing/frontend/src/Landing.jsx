import React, { useState } from 'react';
import {
  Sun, DollarSign, Menu, X, CheckCircle, ArrowRight, Phone, Zap, ShieldCheck, Leaf, Lock,
  Instagram, Home, Building2, Tractor, FileSearch, PencilRuler, Wrench, Activity, ChevronDown,
  Calculator,
} from 'lucide-react';
import logoArsol from './logoArsol.png';

const COMPANY_NAME = 'ArSol';
const WHATSAPP_NUMBER = '5547997023788';
const PHONE_DISPLAY = '+55 (47) 99702-3788';
const INSTAGRAM_URL = 'https://www.instagram.com/arsol.solar/';
const whatsappLink = (text) =>
  `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(text)}`;
const WHATSAPP_URL = whatsappLink('Olá! Gostaria de solicitar um orçamento para um sistema de energia solar.');

// Formulário de orçamento (Edyran). origem=site identifica leads vindos da página.
const ORCAMENTO_URL = 'https://edyran.com/f/Kl4BWMud1wFS3Zo-?origem=site';

// Premissas da calculadora (estimativa simples, sem inflação tarifária)
const SAVINGS_RATE = 0.9;     // até 90% de redução (custo de disponibilidade / Fio B não zeram)
const TARIFF = 0.9;           // R$/kWh médio aproximado
const KWH_PER_KWP_MONTH = 110; // geração média mensal por kWp instalado em SC
const PANEL_KWP = 0.55;       // painel de 550 W

const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const NAV_LINKS = [
  { href: '#inicio', label: 'Início' },
  { href: '#servicos', label: 'Serviços' },
  { href: '#calculadora', label: 'Simulador' },
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#faq', label: 'Dúvidas' },
];

const FEATURES = [
  {
    icon: <DollarSign className="h-8 w-8 text-green-600" />, bg: 'bg-green-50',
    title: 'Economia Imediata',
    desc: 'Congele o preço da sua energia. Pare de sofrer com o aumento das tarifas e comece a economizar desde o primeiro mês.',
  },
  {
    icon: <Sun className="h-8 w-8 text-[#FF7A00]" />, bg: 'bg-[#FF7A00]/10',
    title: 'Energia Infinita',
    desc: 'Aproveite o recurso mais abundante. Nossos painéis de alta eficiência funcionam mesmo em dias nublados.',
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-blue-600" />, bg: 'bg-blue-50',
    title: 'Garantia até 30 Anos',
    desc: 'Seu investimento está protegido. Oferecemos garantias líderes no setor, tanto em produto quanto em geração.',
  },
];

const SERVICES = [
  {
    icon: Home, title: 'Residencial',
    desc: 'Sistemas sob medida para casas e condomínios. Reduza a conta de luz da sua família e valorize seu imóvel.',
  },
  {
    icon: Building2, title: 'Empresarial',
    desc: 'Comércios e indústrias com alto consumo diminuem custos fixos e ganham previsibilidade no orçamento.',
  },
  {
    icon: Tractor, title: 'Rural e Agronegócio',
    desc: 'Energia para irrigação, granjas e propriedades rurais, com projetos em solo ou telhado.',
  },
];

const STEPS = [
  { icon: FileSearch, title: 'Análise da conta', desc: 'Avaliamos seu consumo e o local da instalação, sem custo.' },
  { icon: PencilRuler, title: 'Projeto sob medida', desc: 'Dimensionamos o sistema ideal e enviamos uma proposta clara.' },
  { icon: Wrench, title: 'Instalação e homologação', desc: 'Instalamos e cuidamos de toda a burocracia com a concessionária.' },
  { icon: Activity, title: 'Monitoramento', desc: 'Acompanhe a geração do seu sistema pelo celular.' },
];

const FAQ = [
  {
    q: 'Funciona em dias nublados ou de chuva?',
    a: 'Sim. A geração diminui em dias nublados, mas não para. O sistema é dimensionado pela média anual, e o excedente gerado nos dias de sol vira créditos que compensam os dias de menor geração.',
  },
  {
    q: 'Vou zerar minha conta de luz?',
    a: 'A redução chega a até 90%. A conta não zera porque a concessionária sempre cobra o custo de disponibilidade (taxa mínima) e, conforme a Lei 14.300, parte do uso da rede.',
  },
  {
    q: 'O que acontece com a energia que sobra?',
    a: 'Ela é injetada na rede e vira créditos de energia, que podem ser usados nos meses seguintes (válidos por 60 meses) ou até em outro imóvel no mesmo titular.',
  },
  {
    q: 'Quanto tempo leva a instalação?',
    a: 'A obra costuma levar poucos dias. O prazo total depende principalmente da aprovação da concessionária, e nós cuidamos de todo esse processo.',
  },
  {
    q: 'O sistema precisa de manutenção?',
    a: 'Muito pouca. Basicamente limpeza periódica dos painéis e acompanhamento da geração pelo monitoramento.',
  },
  {
    q: 'Posso financiar o sistema?',
    a: 'Existem linhas de financiamento específicas para energia solar, muitas vezes com parcela menor que a economia mensal. Fale conosco e orientamos você.',
  },
];

const SectionTitle = ({ eyebrow, title, children, dark = false }) => (
  <div className="text-center mb-16">
    <p className="text-[#FF7A00] font-bold tracking-wider uppercase text-sm mb-3">{eyebrow}</p>
    <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
    {children && <p className={`max-w-2xl mx-auto text-lg ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{children}</p>}
  </div>
);

const Landing = ({ onAdminClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [bill, setBill] = useState(500);

  const toggleMenu = () => setIsMenuOpen((o) => !o);

  // --- Calculadora ---
  const monthlySavings = bill * SAVINGS_RATE;
  const yearlySavings = monthlySavings * 12;
  const kwp = bill / TARIFF / KWH_PER_KWP_MONTH;
  const panels = Math.max(1, Math.ceil(kwp / PANEL_KWP));


  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-[#FF7A00] selection:text-white">
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md shadow-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <a href="#inicio" className="flex items-center gap-2">
              <img src={logoArsol} alt="ArSol Energia Solar" className="h-12 w-auto object-contain" />
            </a>

            <div className="hidden lg:flex items-center space-x-8 font-medium">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} className="text-gray-600 hover:text-[#FF7A00] transition-colors">{l.label}</a>
              ))}
              <a href={ORCAMENTO_URL} target="_blank" rel="noopener noreferrer" className="bg-gray-900 text-white px-6 py-2.5 rounded-full hover:bg-[#FF7A00] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2">
                <Zap className="w-4 h-4 fill-current" /> Orçamento
              </a>
              <button onClick={onAdminClick} className="text-gray-400 hover:text-gray-900 transition-colors" title="Acesso Admin" aria-label="Acesso Admin">
                <Lock className="w-5 h-5" />
              </button>
            </div>

            <button onClick={toggleMenu} className="lg:hidden text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Abrir menu" aria-expanded={isMenuOpen}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl animate-fade-in-down">
            <div className="px-4 pt-2 pb-6 space-y-1 flex flex-col">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} onClick={toggleMenu} className="block px-4 py-3 hover:bg-gray-50 rounded-lg font-medium text-gray-700">{l.label}</a>
              ))}
              <a href={ORCAMENTO_URL} target="_blank" rel="noopener noreferrer" onClick={toggleMenu} className="block px-4 py-3 text-[#FF7A00] font-bold bg-[#FF7A00]/10 rounded-lg mt-2">Solicitar Orçamento</a>
              <div className="flex gap-4 px-4 py-3">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#E1306C] flex items-center gap-2 font-medium"><Instagram size={20} /> Instagram</a>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 flex items-center gap-2 font-medium"><Phone size={20} /> WhatsApp</a>
              </div>
              <button onClick={() => { toggleMenu(); onAdminClick(); }} className="block w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg font-medium text-gray-400">Acesso Admin</button>
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO --- */}
      <section id="inicio" className="pt-32 pb-20 md:pt-44 md:pb-28 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#FF7A00]/10 via-white to-white overflow-hidden">
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
              Energia limpa, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] to-[#E66E00]">economia real.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-lg mx-auto md:mx-0 leading-relaxed">
              Transforme sua casa ou empresa com a <strong>{COMPANY_NAME}</strong>. Reduza sua conta de luz em até 90% e garanta seu futuro energético.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a href="#calculadora" className="bg-[#FF7A00] text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-[#E66E00] transition-all shadow-xl hover:shadow-[#FF7A00]/40 flex items-center justify-center gap-2 group">
                Calcular Economia
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2">
                <Phone className="h-5 w-5 text-green-600" /> Falar no WhatsApp
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center md:justify-start gap-6 text-gray-400 grayscale opacity-70">
              <div className="flex items-center gap-1"><ShieldCheck className="w-5 h-5" /> Tier 1</div>
              <div className="flex items-center gap-1"><CheckCircle className="w-5 h-5" /> ISO 9001</div>
              <div className="flex items-center gap-1"><Leaf className="w-5 h-5" /> Eco-Friendly</div>
            </div>
          </div>

          <div className="md:w-1/2 relative w-full">
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/3] group border-4 border-white">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Painéis solares instalados"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg max-w-xs animate-fade-in-up">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2.5 rounded-full text-green-600"><DollarSign className="h-6 w-6" /></div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">-90% na sua conta</p>
                    <p className="text-xs text-gray-500 font-medium">Média dos nossos clientes</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#FF7A00]/10 rounded-full blur-3xl opacity-50"></div>
          </div>
        </div>
      </section>

      {/* --- BENEFÍCIOS --- */}
      <section id="beneficios" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Por que ArSol?" title="Investimento inteligente">
            Projetamos sistemas fotovoltaicos que maximizam a captação de energia e minimizam o tempo de retorno do investimento.
          </SectionTitle>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="group p-8 rounded-3xl bg-white border border-gray-100 hover:border-[#FF7A00]/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className={`w-16 h-16 ${f.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>{f.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF7A00] to-[#FF9E40] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SERVIÇOS --- */}
      <section id="servicos" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Serviços" title="Energia solar para cada necessidade">
            Do telhado da sua casa ao galpão da sua empresa, cuidamos de tudo: projeto, equipamentos, instalação e homologação.
          </SectionTitle>
          <div className="grid md:grid-cols-3 gap-8">
            {SERVICES.map((s) => (
              <div key={s.title} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gray-900 text-[#FF7A00] flex items-center justify-center mb-6"><s.icon className="w-7 h-7" /></div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{s.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{s.desc}</p>
                <a href={ORCAMENTO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#FF7A00] hover:gap-2 transition-all">
                  Solicitar orçamento <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CALCULADORA --- */}
      <section id="calculadora" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Simulador" title="Quanto você pode economizar?">
            Arraste para o valor médio da sua conta de luz e veja uma estimativa na hora.
          </SectionTitle>

          <div className="rounded-3xl border border-gray-100 shadow-xl overflow-hidden grid md:grid-cols-2">
            <div className="p-8 md:p-10 bg-gradient-to-br from-[#FF7A00]/10 to-white">
              <label htmlFor="bill" className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                <Calculator className="w-5 h-5 text-[#FF7A00]" /> Sua conta de luz mensal
              </label>
              <p className="text-5xl font-extrabold text-gray-900 mb-8 tabular-nums">{brl(bill)}</p>
              <input
                id="bill" type="range" min="150" max="10000" step="50" value={bill}
                onChange={(e) => setBill(Number(e.target.value))}
                className="w-full accent-[#FF7A00] cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-2"><span>R$ 150</span><span>R$ 10.000+</span></div>
              <p className="text-xs text-gray-400 mt-8 leading-relaxed">
                * Estimativa ilustrativa, sem considerar reajustes tarifários. O valor real depende da sua tarifa, consumo, telhado e localização. Solicite um estudo gratuito para um cálculo preciso.
              </p>
            </div>

            <div className="p-8 md:p-10 bg-gray-900 text-white flex flex-col justify-between gap-8">
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Economia mensal estimada</p>
                  <p className="text-4xl font-extrabold text-[#FF7A00] tabular-nums">até {brl(monthlySavings)}</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-400">Em 1 ano</p>
                    <p className="text-2xl font-bold tabular-nums">{brl(yearlySavings)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Em 25 anos</p>
                    <p className="text-2xl font-bold tabular-nums">{brl(yearlySavings * 25)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Sistema aprox.</p>
                    <p className="text-2xl font-bold tabular-nums">{kwp.toFixed(1).replace('.', ',')} kWp</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Painéis aprox.</p>
                    <p className="text-2xl font-bold tabular-nums">{panels}</p>
                  </div>
                </div>
              </div>
              <a href={ORCAMENTO_URL} target="_blank" rel="noopener noreferrer" className="w-full bg-[#FF7A00] text-white font-bold py-4 rounded-xl hover:bg-[#E66E00] transition-colors flex items-center justify-center gap-2">
                Quero um estudo gratuito <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* --- COMO FUNCIONA --- */}
      <section id="como-funciona" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Como funciona" title="Do orçamento à energia gerada">
            Um processo simples e transparente. Você acompanha cada etapa.
          </SectionTitle>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative bg-white p-8 rounded-3xl border border-gray-100">
                <span className="absolute top-6 right-6 text-5xl font-extrabold text-gray-100 select-none">{i + 1}</span>
                <div className="w-12 h-12 rounded-xl bg-[#FF7A00]/10 text-[#FF7A00] flex items-center justify-center mb-5 relative"><s.icon className="w-6 h-6" /></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 relative">{s.title}</h3>
                <p className="text-gray-600 relative">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Dúvidas frequentes" title="Perguntas e respostas" />
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group rounded-2xl border border-gray-100 bg-gray-50 open:bg-white open:shadow-lg transition-all">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-6 font-semibold text-gray-900">
                  {q}
                  <ChevronDown className="w-5 h-5 shrink-0 text-[#FF7A00] group-open:rotate-180 transition-transform" />
                </summary>
                <p className="px-6 pb-6 text-gray-600 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* --- CONTATO --- */}
      <section id="contato" className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#FF7A00 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block bg-[#FF7A00]/20 text-[#FF7A00] font-bold px-4 py-1 rounded-full mb-6 border border-[#FF7A00]/20">Estudo Gratuito</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Dê o passo para a <br /><span className="text-[#FF7A00]">independência energética</span></h2>
              <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                Deixe seus dados. Um especialista da <strong>{COMPANY_NAME}</strong> analisará seu consumo e enviará uma proposta personalizada sem compromisso.
              </p>
              <div className="space-y-6">
                <a href={`tel:+${WHATSAPP_NUMBER}`} className="flex items-center gap-5 group">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/10 group-hover:bg-[#FF7A00]/20 transition-colors">
                    <Phone className="text-[#FF7A00] h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Ligue agora</p>
                    <p className="font-bold text-xl">{PHONE_DISPLAY}</p>
                  </div>
                </a>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 group">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/10 group-hover:bg-[#E1306C]/20 transition-colors">
                    <Instagram className="text-[#E1306C] h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Instagram</p>
                    <p className="font-bold text-xl">@arsol.solar</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-white/10 p-8 md:p-10 rounded-2xl border border-white/10 shadow-lg text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#FF7A00]/20 text-[#FF7A00] flex items-center justify-center mx-auto mb-6">
                <FileSearch className="w-8 h-8" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Solicite seu Estudo Gratuito</h3>
              <p className="text-gray-300 mb-8">Leva menos de 1 minuto. Responda algumas perguntas rápidas e receba uma proposta personalizada.</p>
              <ul className="text-left space-y-3 mb-8 max-w-xs mx-auto">
                {['Sem compromisso', 'Proposta sob medida para o seu consumo', 'Atendimento rápido pelo WhatsApp'].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-gray-200"><CheckCircle className="w-5 h-5 text-green-400 shrink-0" /> {t}</li>
                ))}
              </ul>
              <a href={ORCAMENTO_URL} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 bg-[#FF7A00] text-white text-lg font-bold py-4 rounded-xl hover:bg-[#E66E00] transition-colors shadow-xl hover:shadow-[#FF7A00]/40">
                Faça seu orçamento <ArrowRight className="w-5 h-5" />
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 text-sm text-gray-300 hover:text-white">
                <Phone className="w-4 h-4 text-green-400" /> Prefere conversar? Fale no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white text-gray-500 pt-12 pb-28 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 md:pr-32">
          <img src={logoArsol} alt="ArSol Energia Solar" className="h-10 w-auto object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all" />
          <p className="text-sm text-gray-800 font-medium">© {new Date().getFullYear()} {COMPANY_NAME}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-[#E1306C] transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-gray-400 hover:text-green-600 transition-colors"><Phone className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>

      {/* --- WHATSAPP FLUTUANTE --- */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Fale conosco no WhatsApp"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#20bd5a] transition-all hover:scale-110 flex items-center justify-center group"
      >
        <span className="absolute right-full mr-3 bg-white text-gray-800 px-3 py-1 rounded-lg text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">Fale Conosco</span>
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
      </a>
    </div>
  );
};

export default Landing;
