import React, { useEffect, useRef, useState } from 'react';
import {
  Sun, DollarSign, Menu, X, CheckCircle2, ArrowRight, Phone, Zap, ShieldCheck, Lock,
  Instagram, Home, Building2, Tractor, FileSearch, PencilRuler, Wrench, Activity, ChevronDown,
  Calculator, TrendingUp, Leaf, Sparkles, BadgeCheck, PlugZap, Cpu, Gauge, Receipt,
  CalendarClock, Scale, MapPin,
} from 'lucide-react';
import logoArsol from './logoArsol.png';

const COMPANY_NAME = 'ArSol';
const WHATSAPP_NUMBER = '5547996663630';
const PHONE_DISPLAY = '+55 (47) 99666-3630';
const INSTAGRAM_URL = 'https://www.instagram.com/arsol.solar/';
const whatsappLink = (text) =>
  `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(text)}`;
const WHATSAPP_URL = whatsappLink('Olá! Gostaria de solicitar um orçamento para um sistema de energia solar.');

// Formulário de orçamento (Edyran). origem=site identifica leads vindos da página.
const ORCAMENTO_URL = 'https://edyran.com/f/Kl4BWMud1wFS3Zo-?origem=site';
const ext = { target: '_blank', rel: 'noopener noreferrer' };

// Premissas da calculadora (estimativa simples, sem inflação tarifária)
const SAVINGS_RATE = 0.9;      // até 90% de redução (custo de disponibilidade / Fio B não zeram)
const TARIFF = 0.9;            // R$/kWh médio aproximado
const KWH_PER_KWP_MONTH = 110; // geração média mensal por kWp instalado em SC
const PANEL_KWP = 0.55;        // painel de 550 W
const M2_PER_PANEL = 2.6;      // área aproximada por painel no telhado

const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const NAV_LINKS = [
  { href: '#beneficios', label: 'Benefícios' },
  { href: '#servicos', label: 'Serviços' },
  { href: '#calculadora', label: 'Simulador' },
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#faq', label: 'Dúvidas' },
];

const STATS = [
  { value: '2018', label: 'Atuando com energia solar desde' },
  { value: 'até 90%', label: 'De redução na conta de luz' },
  { value: 'até 30 anos', label: 'De garantia nos equipamentos' },
  { value: '25+ anos', label: 'De vida útil dos painéis' },
];

const BENEFITS = [
  { icon: DollarSign, title: 'Economia imediata', desc: 'Sua conta cai já no primeiro ciclo de faturamento após a homologação.' },
  { icon: TrendingUp, title: 'Proteção contra aumentos', desc: 'A tarifa de energia sobe todo ano. Gerando a sua, você deixa de depender desses reajustes.' },
  { icon: Home, title: 'Valoriza seu imóvel', desc: 'Imóveis com energia solar são mais atrativos e têm custo de manutenção menor.' },
  { icon: ShieldCheck, title: 'Garantia de longo prazo', desc: 'Equipamentos com garantias de até 30 anos, de produto e de geração.' },
  { icon: Leaf, title: 'Energia limpa', desc: 'Gere sua própria energia sem emissões e reduza a pegada de carbono da sua casa ou empresa.' },
  { icon: Sparkles, title: 'Pouca manutenção', desc: 'Sem peças móveis: basicamente limpeza periódica e acompanhamento pelo aplicativo.' },
];

const SERVICES = [
  {
    icon: Home, title: 'Residencial', tag: 'Casas e condomínios',
    desc: 'Sistemas sob medida para o consumo da sua família, com instalação limpa e rápida no seu telhado.',
    points: ['Redução de até 90% na conta', 'Monitoramento pelo celular', 'Valorização do imóvel'],
  },
  {
    icon: Building2, title: 'Empresarial', tag: 'Comércio e indústria',
    desc: 'Transforme a conta de luz em investimento e ganhe previsibilidade nos custos fixos do seu negócio.',
    points: ['Projetos de maior potência', 'Retorno rápido do investimento', 'Imagem sustentável da marca'],
  },
  {
    icon: Tractor, title: 'Rural e Agronegócio', tag: 'Propriedades rurais',
    desc: 'Energia para irrigação, granjas, ordenha e armazenagem, em telhado ou montagem em solo.',
    points: ['Estrutura em solo ou telhado', 'Ideal para alto consumo', 'Menos custos na produção'],
  },
];

const HOW_SOLAR_WORKS = [
  { icon: Sun, title: 'Captação', desc: 'Os painéis transformam a luz do sol em energia elétrica (corrente contínua).' },
  { icon: Cpu, title: 'Conversão', desc: 'O inversor converte essa energia em corrente alternada, pronta para uso.' },
  { icon: PlugZap, title: 'Consumo', desc: 'Sua casa ou empresa usa a energia gerada na hora, direto do telhado.' },
  { icon: Gauge, title: 'Créditos', desc: 'O que sobra vai para a rede e vira créditos que abatem a sua conta.' },
];

const INCLUDED = [
  'Visita técnica e análise do consumo',
  'Projeto elétrico e dimensionamento',
  'Painéis, inversor e estrutura de fixação',
  'Instalação por equipe especializada',
  'Homologação junto à concessionária',
  'Troca do medidor (feita pela concessionária)',
  'Configuração do monitoramento',
  'Suporte pós-venda',
];

const STEPS = [
  { icon: FileSearch, title: 'Análise da conta', desc: 'Avaliamos seu consumo e o local da instalação, sem custo.' },
  { icon: PencilRuler, title: 'Projeto sob medida', desc: 'Dimensionamos o sistema ideal e enviamos uma proposta clara.' },
  { icon: Wrench, title: 'Instalação e homologação', desc: 'Instalamos e cuidamos de toda a burocracia com a concessionária.' },
  { icon: Activity, title: 'Monitoramento', desc: 'Acompanhe a geração do seu sistema pelo celular.' },
];

const WHY_NOW = [
  { icon: Receipt, title: 'A tarifa só sobe', desc: 'A energia elétrica tem reajustes anuais e bandeiras tarifárias. Cada mês sem solar é dinheiro que não volta.' },
  { icon: Scale, title: 'Regras da Lei 14.300', desc: 'Quem se conecta à rede mais tarde paga uma parcela maior pelo uso do fio (Fio B), que aumenta gradualmente até 2028.' },
  { icon: CalendarClock, title: 'Retorno mais cedo', desc: 'Quanto antes o sistema começa a gerar, antes ele se paga e mais anos de economia você acumula.' },
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
    q: 'Em quanto tempo o investimento se paga?',
    a: 'Depende do consumo, da tarifa e do tamanho do sistema, mas costuma levar poucos anos, enquanto os painéis duram mais de 25. No estudo gratuito mostramos o retorno estimado para o seu caso.',
  },
  {
    q: 'O que acontece com a energia que sobra?',
    a: 'Ela é injetada na rede e vira créditos de energia, que podem ser usados nos meses seguintes (válidos por 60 meses) ou até em outro imóvel no mesmo titular.',
  },
  {
    q: 'Se faltar luz na rua, continuo com energia?',
    a: 'Em sistemas conectados à rede (on-grid), não: por segurança, o inversor desliga quando a rede cai. Para ter energia durante quedas é preciso um sistema com baterias (híbrido), que também podemos avaliar.',
  },
  {
    q: 'Meu telhado serve?',
    a: 'Na maioria dos casos, sim. Trabalhamos com telhados cerâmicos, metálicos, de fibrocimento e laje, além de estruturas em solo. Na visita técnica avaliamos orientação, sombreamento e estrutura.',
  },
  {
    q: 'Quanto tempo leva a instalação?',
    a: 'A obra costuma levar poucos dias. O prazo total depende principalmente da aprovação da concessionária, e nós cuidamos de todo esse processo.',
  },
  {
    q: 'Posso financiar o sistema?',
    a: 'Existem linhas de financiamento específicas para energia solar, muitas vezes com parcela menor que a economia mensal. Fale conosco e orientamos você.',
  },
];

// --- Componentes auxiliares ---

// Revela o conteúdo com uma animação suave quando entra na tela
const Reveal = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  // Sem IntersectionObserver (navegadores antigos), mostra direto
  const [visible, setVisible] = useState(() => !('IntersectionObserver' in window));

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const SectionTitle = ({ eyebrow, title, children, dark = false, align = 'center' }) => (
  <Reveal className={`mb-14 md:mb-16 ${align === 'center' ? 'text-center' : ''}`}>
    <p className="inline-flex items-center gap-2 text-brand font-bold tracking-[0.18em] uppercase text-xs mb-4">
      <span className="w-6 h-px bg-brand" /> {eyebrow}
    </p>
    <h2 className={`font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-5 ${dark ? 'text-white' : 'text-ink'}`}>{title}</h2>
    {children && (
      <p className={`max-w-2xl text-lg leading-relaxed ${align === 'center' ? 'mx-auto' : ''} ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{children}</p>
    )}
  </Reveal>
);

const PrimaryButton = ({ children, className = '', ...props }) => (
  <a {...props} className={`group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-[#FF5A00] text-white font-bold rounded-full shadow-lg shadow-brand/30 hover:shadow-xl hover:shadow-brand/40 hover:-translate-y-0.5 transition-all ${className}`}>
    {children}
  </a>
);

const WhatsIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
);

const Landing = ({ onAdminClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bill, setBill] = useState(500);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen((o) => !o);

  // --- Calculadora ---
  const monthlySavings = bill * SAVINGS_RATE;
  const yearlySavings = monthlySavings * 12;
  const kwp = bill / TARIFF / KWH_PER_KWP_MONTH;
  const panels = Math.max(1, Math.ceil(kwp / PANEL_KWP));
  const area = Math.round(panels * M2_PER_PANEL);
  const billPct = ((bill - 150) / (10000 - 150)) * 100;

  return (
    <div className="min-h-screen bg-white text-gray-800 font-display antialiased selection:bg-brand selection:text-white">
      {/* --- NAVBAR --- */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.06),0_8px_24px_-12px_rgba(0,0,0,0.15)]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between items-center transition-all duration-300 ${scrolled ? 'h-16' : 'h-20'}`}>
            <a href="#inicio" className="flex items-center">
              <img src={logoArsol} alt="ArSol Energia Solar" className={`w-auto object-contain transition-all duration-300 ${scrolled ? 'h-10' : 'h-12'}`} />
            </a>

            <div className="hidden lg:flex items-center gap-8 text-[15px] font-semibold">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} className="relative text-gray-600 hover:text-ink transition-colors after:absolute after:left-0 after:-bottom-1.5 after:h-0.5 after:w-0 after:bg-brand after:transition-all hover:after:w-full">{l.label}</a>
              ))}
              <PrimaryButton href={ORCAMENTO_URL} {...ext} className="px-6 py-2.5 text-sm">
                <Zap className="w-4 h-4 fill-current" /> Orçamento grátis
              </PrimaryButton>
              <button onClick={onAdminClick} className="text-gray-300 hover:text-gray-700 transition-colors" title="Acesso Admin" aria-label="Acesso Admin">
                <Lock className="w-4 h-4" />
              </button>
            </div>

            <button onClick={toggleMenu} className="lg:hidden text-ink p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Abrir menu" aria-expanded={isMenuOpen}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 absolute w-full shadow-2xl animate-fade-in-down">
            <div className="px-4 pt-2 pb-6 space-y-1 flex flex-col">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} onClick={toggleMenu} className="block px-4 py-3 hover:bg-gray-50 rounded-xl font-semibold text-gray-700">{l.label}</a>
              ))}
              <a href={ORCAMENTO_URL} {...ext} onClick={toggleMenu} className="block px-4 py-3 text-center text-white font-bold bg-brand rounded-xl mt-3">Solicitar orçamento grátis</a>
              <div className="flex justify-center gap-6 px-4 pt-4">
                <a href={INSTAGRAM_URL} {...ext} className="text-gray-600 hover:text-[#E1306C] flex items-center gap-2 font-medium"><Instagram size={20} /> Instagram</a>
                <a href={WHATSAPP_URL} {...ext} className="text-gray-600 hover:text-green-600 flex items-center gap-2 font-medium"><WhatsIcon className="w-5 h-5" /> WhatsApp</a>
              </div>
              <button onClick={() => { toggleMenu(); onAdminClick(); }} className="block w-full text-center px-4 pt-4 text-sm text-gray-300">Acesso Admin</button>
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO --- */}
      <section id="inicio" className="relative bg-ink text-white pt-36 pb-24 md:pt-44 md:pb-32 overflow-hidden">
        {/* Luzes e grade decorativas */}
        <div className="absolute -top-40 -right-40 w-[42rem] h-[42rem] rounded-full bg-brand/25 blur-[120px]" aria-hidden="true" />
        <div className="absolute -bottom-56 -left-40 w-[36rem] h-[36rem] rounded-full bg-[#FF3D00]/15 blur-[120px]" aria-hidden="true" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 items-center gap-16">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-semibold text-gray-300 mb-8 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              Tecnologia solar desde 2018
            </div>
            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold leading-[1.05] tracking-tight mb-7 animate-fade-in-up [animation-delay:80ms]">
              Gere sua própria energia e{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light via-brand to-[#FF4D00]">pague até 90% menos</span>{' '}
              de luz.
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up [animation-delay:160ms]">
              A <strong className="text-white">{COMPANY_NAME}</strong> projeta, instala e homologa seu sistema de energia solar. Você só se preocupa em economizar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up [animation-delay:240ms]">
              <PrimaryButton href="#calculadora" className="px-8 py-4 text-lg">
                Simular minha economia
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </PrimaryButton>
              <a href={WHATSAPP_URL} {...ext} className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-lg font-semibold border border-white/15 bg-white/5 hover:bg-white/10 transition-colors">
                <WhatsIcon className="h-5 w-5 text-[#25D366]" /> Falar no WhatsApp
              </a>
            </div>

            <ul className="mt-10 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 text-sm text-gray-400 animate-fade-in-up [animation-delay:320ms]">
              {['Estudo gratuito', 'Sem compromisso', 'Homologação inclusa'].map((t) => (
                <li key={t} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand" /> {t}</li>
              ))}
            </ul>
          </div>

          <div className="relative w-full max-w-xl mx-auto lg:max-w-none animate-fade-in-up [animation-delay:200ms]">
            <div className="relative rounded-[2rem] overflow-hidden aspect-[4/3] ring-1 ring-white/10 shadow-2xl shadow-black/50">
              <img
                src="https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Painéis solares instalados"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            </div>

            {/* Cartões flutuantes */}
            <div className="absolute -bottom-6 left-4 sm:-left-6 bg-white text-ink p-4 pr-6 rounded-2xl shadow-2xl flex items-center gap-3 animate-float">
              <div className="bg-green-100 p-2.5 rounded-xl text-green-600"><TrendingUp className="h-6 w-6" /></div>
              <div>
                <p className="font-extrabold text-xl leading-none">-90%</p>
                <p className="text-xs text-gray-500 font-medium mt-1">na conta de luz</p>
              </div>
            </div>
            <div className="absolute -top-5 right-4 sm:-right-5 bg-white/10 backdrop-blur-xl border border-white/15 p-4 pr-6 rounded-2xl shadow-2xl flex items-center gap-3 animate-float [animation-delay:1.5s]">
              <div className="bg-brand/20 p-2.5 rounded-xl text-brand"><BadgeCheck className="h-6 w-6" /></div>
              <div>
                <p className="font-bold leading-none">Até 30 anos</p>
                <p className="text-xs text-gray-300 mt-1">de garantia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- NÚMEROS --- */}
      <section className="relative z-10 -mt-10 px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-6xl mx-auto rounded-3xl shadow-xl shadow-black/5 ring-1 ring-gray-100 overflow-hidden grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white p-6 md:p-8 text-center">
              <p className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* --- BENEFÍCIOS --- */}
      <section id="beneficios" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Por que energia solar" title="Um investimento que se paga sozinho">
            Projetamos sistemas fotovoltaicos que maximizam a geração e reduzem o tempo de retorno do seu investimento.
          </SectionTitle>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 70}>
                <div className="group h-full p-8 rounded-3xl bg-gray-50/70 ring-1 ring-gray-100 hover:bg-white hover:ring-brand/30 hover:shadow-xl hover:shadow-brand/5 transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-white transition-colors">
                    <b.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-ink">{b.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{b.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --- COMO A ENERGIA SOLAR FUNCIONA --- */}
      <section className="py-24 md:py-32 bg-ink text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50rem] h-[20rem] bg-brand/15 blur-[120px]" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Entenda" title="Como a energia solar funciona" dark>
            Simples, silenciosa e automática. Seu sistema trabalha todos os dias sem que você precise fazer nada.
          </SectionTitle>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" aria-hidden="true" />
            {HOW_SOLAR_WORKS.map((s, i) => (
              <Reveal key={s.title} delay={i * 90} className="relative text-center">
                <div className="relative mx-auto w-20 h-20 rounded-full bg-ink-soft ring-1 ring-white/10 flex items-center justify-center mb-6">
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-brand to-[#FF4D00] opacity-90" />
                  <s.icon className="relative w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-gray-400 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --- SERVIÇOS --- */}
      <section id="servicos" className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Serviços" title="Energia solar para cada necessidade">
            Do telhado da sua casa ao galpão da sua empresa, cuidamos de tudo: projeto, equipamentos, instalação e homologação.
          </SectionTitle>
          <div className="grid md:grid-cols-3 gap-6">
            {SERVICES.map((s, i) => (
              <Reveal key={s.title} delay={i * 90}>
                <div className="group h-full flex flex-col bg-white rounded-3xl ring-1 ring-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  <div className="relative h-36 bg-ink overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-brand/30 blur-2xl group-hover:bg-brand/50 transition-colors" />
                    <s.icon className="absolute right-6 bottom-4 w-24 h-24 text-white/10" />
                    <div className="absolute left-8 bottom-6">
                      <p className="text-brand text-xs font-bold uppercase tracking-widest mb-1">{s.tag}</p>
                      <h3 className="text-2xl font-extrabold text-white">{s.title}</h3>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <p className="text-gray-600 leading-relaxed mb-6">{s.desc}</p>
                    <ul className="space-y-2.5 mb-8">
                      {s.points.map((p) => (
                        <li key={p} className="flex items-center gap-2.5 text-sm font-medium text-gray-700"><CheckCircle2 className="w-4 h-4 text-brand shrink-0" /> {p}</li>
                      ))}
                    </ul>
                    <a href={ORCAMENTO_URL} {...ext} className="mt-auto inline-flex items-center gap-1.5 font-bold text-brand hover:gap-3 transition-all">
                      Solicitar orçamento <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --- CALCULADORA --- */}
      <section id="calculadora" className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Simulador" title="Quanto você pode economizar?">
            Arraste até o valor médio da sua conta de luz e veja uma estimativa na hora.
          </SectionTitle>

          <Reveal className="rounded-[2rem] ring-1 ring-gray-100 shadow-2xl shadow-black/5 overflow-hidden grid lg:grid-cols-5">
            <div className="lg:col-span-2 p-8 md:p-10 bg-gradient-to-br from-brand/10 via-white to-white">
              <label htmlFor="bill" className="flex items-center gap-2 font-semibold text-gray-600 mb-3">
                <Calculator className="w-5 h-5 text-brand" /> Sua conta de luz mensal
              </label>
              <p className="text-5xl md:text-6xl font-extrabold text-ink mb-8 tabular-nums tracking-tight">{brl(bill)}</p>
              <input
                id="bill" type="range" min="150" max="10000" step="50" value={bill}
                onChange={(e) => setBill(Number(e.target.value))}
                className="range-brand w-full cursor-pointer"
                style={{ '--pct': `${billPct}%` }}
              />
              <div className="flex justify-between text-sm text-gray-400 mt-3"><span>R$ 150</span><span>R$ 10.000+</span></div>
              <p className="text-xs text-gray-400 mt-10 leading-relaxed">
                * Estimativa ilustrativa, sem considerar reajustes tarifários. O valor real depende da sua tarifa, consumo, telhado e localização. Solicite um estudo gratuito para um cálculo preciso.
              </p>
            </div>

            <div className="lg:col-span-3 p-8 md:p-10 bg-ink text-white flex flex-col justify-between gap-10 relative overflow-hidden">
              <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-brand/20 blur-3xl" aria-hidden="true" />
              <div className="relative">
                <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Economia mensal estimada</p>
                <p className="text-5xl md:text-6xl font-extrabold text-brand tabular-nums tracking-tight mt-1">até {brl(monthlySavings)}</p>
              </div>
              <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden">
                {[
                  { label: 'Em 1 ano', value: brl(yearlySavings) },
                  { label: 'Em 25 anos', value: brl(yearlySavings * 25) },
                  { label: 'Sistema aprox.', value: `${kwp.toFixed(1).replace('.', ',')} kWp` },
                  { label: 'Painéis aprox.', value: panels },
                  { label: 'Área no telhado', value: `~${area} m²` },
                  { label: 'Geração mensal', value: `~${Math.round(kwp * KWH_PER_KWP_MONTH)} kWh` },
                ].map((m) => (
                  <div key={m.label} className="bg-ink-soft p-4 md:p-5">
                    <p className="text-xs text-gray-400">{m.label}</p>
                    <p className="text-lg md:text-xl font-bold tabular-nums mt-1">{m.value}</p>
                  </div>
                ))}
              </div>
              <PrimaryButton href={ORCAMENTO_URL} {...ext} className="relative w-full py-4 text-lg rounded-2xl">
                Quero um estudo gratuito <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </PrimaryButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --- O QUE ESTÁ INCLUSO + PROCESSO --- */}
      <section id="como-funciona" className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Como trabalhamos" title="Do orçamento à energia gerada">
            Um processo simples e transparente. Você acompanha cada etapa, e nós cuidamos da parte difícil.
          </SectionTitle>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 90}>
                <div className="relative h-full bg-white p-8 rounded-3xl ring-1 ring-gray-100">
                  <span className="absolute top-6 right-7 font-extrabold text-6xl leading-none text-gray-100 select-none">0{i + 1}</span>
                  <div className="relative w-12 h-12 rounded-2xl bg-ink text-brand flex items-center justify-center mb-6"><s.icon className="w-6 h-6" /></div>
                  <h3 className="relative text-xl font-bold text-ink mb-2">{s.title}</h3>
                  <p className="relative text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="rounded-[2rem] bg-white ring-1 ring-gray-100 p-8 md:p-12 grid lg:grid-cols-5 gap-10 items-center">
            <div className="lg:col-span-2">
              <p className="text-brand font-bold uppercase tracking-widest text-xs mb-3">Projeto completo</p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-ink tracking-tight mb-4">O que está incluso</h3>
              <p className="text-gray-600 leading-relaxed mb-8">Você não precisa contratar mais ninguém. Entregamos o sistema funcionando, homologado e monitorado.</p>
              <PrimaryButton href={ORCAMENTO_URL} {...ext} className="px-7 py-3.5">
                Pedir minha proposta <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </PrimaryButton>
            </div>
            <ul className="lg:col-span-3 grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-700 font-medium">
                  <span className="mt-0.5 w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0"><CheckCircle2 className="w-4 h-4" /></span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* --- POR QUE AGORA --- */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-2 lg:sticky lg:top-28">
            <SectionTitle eyebrow="Por que agora" title="Esperar também custa caro" align="left">
              Adiar a decisão significa continuar pagando a tarifa cheia e, pelas novas regras, ter um custo de rede maior quando decidir instalar.
            </SectionTitle>
          </div>
          <div className="lg:col-span-3 space-y-5">
            {WHY_NOW.map((w, i) => (
              <Reveal key={w.title} delay={i * 90}>
                <div className="flex gap-6 p-7 rounded-3xl ring-1 ring-gray-100 hover:ring-brand/30 hover:shadow-lg transition-all">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand to-[#FF4D00] text-white flex items-center justify-center shrink-0 shadow-lg shadow-brand/30"><w.icon className="w-7 h-7" /></div>
                  <div>
                    <h3 className="text-xl font-bold text-ink mb-1.5">{w.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{w.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section id="faq" className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Dúvidas frequentes" title="Perguntas e respostas" />
          <div className="space-y-3">
            {FAQ.map(({ q, a }, i) => (
              <Reveal key={q} delay={i * 40}>
                <details className="group rounded-2xl bg-white ring-1 ring-gray-100 open:ring-brand/30 open:shadow-lg transition-all">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-6 font-semibold text-ink text-lg">
                    {q}
                    <span className="w-8 h-8 rounded-full bg-gray-100 group-open:bg-brand group-open:text-white flex items-center justify-center shrink-0 transition-colors">
                      <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                    </span>
                  </summary>
                  <p className="px-6 pb-6 -mt-1 text-gray-600 leading-relaxed">{a}</p>
                </details>
              </Reveal>
            ))}
          </div>
          <p className="text-center text-gray-500 mt-10">
            Ainda tem dúvidas?{' '}
            <a href={WHATSAPP_URL} {...ext} className="font-semibold text-brand hover:underline">Fale com um especialista no WhatsApp</a>
          </p>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section id="contato" className="relative py-24 md:py-32 bg-ink text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(#FF7A00 1px, transparent 1px)', backgroundSize: '32px 32px' }} aria-hidden="true" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[60rem] h-[30rem] rounded-full bg-brand/25 blur-[120px]" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <span className="inline-block bg-brand/15 text-brand font-bold px-4 py-1.5 rounded-full mb-6 ring-1 ring-brand/30 text-sm">Estudo gratuito</span>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6">
              Dê o passo para a <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-brand">independência energética</span>
            </h2>
            <p className="text-gray-400 mb-10 text-lg leading-relaxed max-w-lg">
              Um especialista da <strong className="text-white">{COMPANY_NAME}</strong> analisa seu consumo e envia uma proposta personalizada, sem compromisso.
            </p>
            <div className="space-y-5">
              <a href={`tel:+${WHATSAPP_NUMBER}`} className="flex items-center gap-5 group w-fit">
                <span className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center ring-1 ring-white/10 group-hover:bg-brand/20 transition-colors"><Phone className="text-brand h-5 w-5" /></span>
                <span>
                  <span className="block text-xs text-gray-500 uppercase tracking-wider font-semibold">Ligue agora</span>
                  <span className="block font-bold text-xl">{PHONE_DISPLAY}</span>
                </span>
              </a>
              <a href={INSTAGRAM_URL} {...ext} className="flex items-center gap-5 group w-fit">
                <span className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center ring-1 ring-white/10 group-hover:bg-[#E1306C]/20 transition-colors"><Instagram className="text-[#E1306C] h-5 w-5" /></span>
                <span>
                  <span className="block text-xs text-gray-500 uppercase tracking-wider font-semibold">Instagram</span>
                  <span className="block font-bold text-xl">@arsol.solar</span>
                </span>
              </a>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="bg-white/[0.06] backdrop-blur p-8 md:p-10 rounded-[2rem] ring-1 ring-white/10 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-[#FF4D00] text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand/40">
                <FileSearch className="w-8 h-8" />
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold mb-3">Solicite seu estudo gratuito</h3>
              <p className="text-gray-300 mb-8">Leva menos de 1 minuto. Responda algumas perguntas rápidas e receba uma proposta personalizada.</p>
              <ul className="text-left space-y-3 mb-8 max-w-xs mx-auto">
                {['Sem compromisso', 'Proposta sob medida para o seu consumo', 'Atendimento rápido pelo WhatsApp'].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-gray-200"><CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" /> {t}</li>
                ))}
              </ul>
              <PrimaryButton href={ORCAMENTO_URL} {...ext} className="w-full py-4 text-lg rounded-2xl">
                Faça seu orçamento <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </PrimaryButton>
              <a href={WHATSAPP_URL} {...ext} className="mt-5 inline-flex items-center justify-center gap-2 text-sm text-gray-300 hover:text-white">
                <WhatsIcon className="w-4 h-4 text-[#25D366]" /> Prefere conversar? Fale no WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#07080B] text-gray-400 pt-16 pb-28 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
            <div className="lg:col-span-2">
              <div className="inline-block bg-white rounded-xl px-3 py-2 mb-5">
                <img src={logoArsol} alt="ArSol Energia Solar" className="h-9 w-auto object-contain" />
              </div>
              <p className="max-w-sm leading-relaxed">Projeto, instalação e homologação de sistemas de energia solar para residências, empresas e propriedades rurais.</p>
            </div>
            <div>
              <p className="text-white font-bold mb-4">Navegação</p>
              <ul className="space-y-2.5">
                {NAV_LINKS.map((l) => (
                  <li key={l.href}><a href={l.href} className="hover:text-brand transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white font-bold mb-4">Contato</p>
              <ul className="space-y-3">
                <li><a href={WHATSAPP_URL} {...ext} className="flex items-center gap-2.5 hover:text-white transition-colors"><WhatsIcon className="w-4 h-4 text-[#25D366]" /> {PHONE_DISPLAY}</a></li>
                <li><a href={INSTAGRAM_URL} {...ext} className="flex items-center gap-2.5 hover:text-white transition-colors"><Instagram className="w-4 h-4 text-[#E1306C]" /> @arsol.solar</a></li>
                <li className="flex items-center gap-2.5"><MapPin className="w-4 h-4 text-brand" /> Santa Catarina, Brasil</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© {new Date().getFullYear()} {COMPANY_NAME}. Todos os direitos reservados.</p>
            <p className="flex items-center gap-1.5">Feito com <Sun className="w-4 h-4 text-brand" /> energia solar</p>
          </div>
        </div>
      </footer>

      {/* --- WHATSAPP FLUTUANTE --- */}
      <a
        href={WHATSAPP_URL}
        {...ext}
        aria-label="Fale conosco no WhatsApp"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-xl shadow-green-900/30 hover:bg-[#20bd5a] transition-all hover:scale-110 flex items-center justify-center group"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" aria-hidden="true" />
        <span className="absolute right-full mr-3 bg-white text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">Fale conosco</span>
        <WhatsIcon className="relative w-8 h-8" />
      </a>
    </div>
  );
};

export default Landing;
