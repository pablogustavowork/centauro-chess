import React, { useState } from 'react';
import { ArrowRight, Activity, Brain, Target, ShieldCheck, Cpu, Database, HelpCircle } from 'lucide-react';
import AboutModal from './AboutModal';
import { HelpModal, ContributionModal, PrivacyModal, TermsModal } from './InfoModals';

interface LandingPageProps {
  onEnterApp: (email?: string, password?: string, mode?: 'login' | 'signup') => void;
  user?: any;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, user }) => {
  const [showAbout, setShowAbout] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showContribution, setShowContribution] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#0a0e17] text-white overflow-x-hidden font-sans selection:bg-blue-500/30">

      {/* Navbar */}
      <nav className="w-full px-6 py-5 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-3">
          {/* Logo Icon */}
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <span className="font-serif text-xl font-bold">♟</span>
          </div>
          <span className="text-xl font-bold tracking-tight">CentaUros Chess</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <button onClick={() => setShowAbout(true)} className="hover:text-white transition-colors">Acerca de</button>
          <a href="#" className="hover:text-white transition-colors">Comunidad</a>
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <HelpCircle className="w-4 h-4" /> Ayuda
          </button>
        </div>
      </nav>

      {/* Modals */}
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <ContributionModal isOpen={showContribution} onClose={() => setShowContribution(false)} />
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Left Column: Content & Login */}
          <div className="flex-1 space-y-8 text-left">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Nueva Versión 2.0
            </div>

            {/* Typography */}
            <h1 className="text-4xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
              El Modelo Híbrido de <br />
              <span className="text-blue-500">Entrenamiento</span>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
              Bienvenido a CentaUros Chess. Fusionamos la intuición humana con la precisión de la IA para elevar tu juego al siguiente nivel. Descubre momentos históricos y analiza tus errores con tecnología de vanguardia.
            </p>

            {/* Login Form (Embedded) */}
            <div className="bg-[#111625] p-5 rounded-2xl border border-white/5 w-full max-w-sm shadow-2xl">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    placeholder="nombre@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contraseña</label>
                  <input
                    id="login-password"
                    type="password"
                    className="w-full bg-[#0a0e17] border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    placeholder="••••••••"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      const email = (document.getElementById('login-email') as HTMLInputElement).value;
                      const pass = (document.getElementById('login-password') as HTMLInputElement).value;
                      onEnterApp(email, pass, 'login');
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 text-sm rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    Iniciar Sesión <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const email = (document.getElementById('login-email') as HTMLInputElement).value;
                      const pass = (document.getElementById('login-password') as HTMLInputElement).value;
                      onEnterApp(email, pass, 'signup');
                    }}
                    className="bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 text-sm rounded-lg transition-all border border-white/10"
                  >
                    Registrarse
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-600 mt-4 text-center">
                * Acceso demo limitado a funcionalidades básicas. No requiere tarjeta de crédito.
              </p>
            </div>

          </div>

          {/* Right Column: Visual Card */}
          <div className="flex-1 w-full max-w-xl">
            <div className="relative group perspective">
              {/* Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

              {/* Card Content */}
              <div className="relative bg-[#0f1420] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-[#161b28]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Galería de Análisis</span>
                </div>

                {/* Image Area */}
                <div className="relative h-64 bg-slate-900 overflow-hidden">
                  {/* Abstract Chess Background */}
                  <div className="absolute inset-0 bg-cover bg-center opacity-80 mix-blend-normal" style={{ backgroundImage: "url('/assets/landing_hero.jpg')" }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1420] via-transparent to-transparent"></div>

                  {/* Overlay Text */}
                  <div className="absolute bottom-6 left-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-600 text-[10px] font-bold px-2 py-0.5 rounded text-white uppercase">Arte Conceptual</span>
                      <span className="text-slate-400 text-xs font-mono">2024</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">El Despertar de CentaUros</h3>
                    <p className="text-xs text-slate-400 max-w-[80%] leading-relaxed">
                      Donde la estrategia clásica se funde con la inteligencia artificial moderna.
                    </p>
                  </div>

                  {/* Dots */}
                  <div className="absolute bottom-6 right-6 flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                  </div>
                </div>

                {/* Tech Specs */}
                <div className="p-4 grid grid-cols-2 gap-4 bg-[#111625]">
                  <div className="bg-[#0a0e17] p-3 rounded-lg border border-white/5 flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded text-blue-400"><Cpu className="w-4 h-4" /></div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Motor</div>
                      <div className="text-xs text-white font-bold">Stockfish 16.1</div>
                    </div>
                  </div>
                  <div className="bg-[#0a0e17] p-3 rounded-lg border border-white/5 flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded text-purple-400"><Database className="w-4 h-4" /></div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Data</div>
                      <div className="text-xs text-white font-bold">15M+ Partidas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Features Split */}
        <div className="mt-32">
          <h2 className="text-3xl font-bold mb-2">¿Por qué elegir CentaUros?</h2>
          <p className="text-slate-400 max-w-2xl mb-12">Nuestra plataforma no solo calcula jugadas; te enseña a pensar como un Gran Maestro asistido por la última tecnología.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCardV2
              icon={<Brain className="w-6 h-6 text-blue-400" />}
              title="Intuición Humana"
              desc="Algoritmos que priorizan jugadas 'humanas' y comprensibles sobre líneas de computadora oscuras e imposibles de memorizar."
            />
            <FeatureCardV2
              icon={<Cpu className="w-6 h-6 text-blue-400" />}
              title="Precisión de IA"
              desc="Motores de cálculo profundo (Stockfish 16 + NNUE) para garantizar estrategias tácticamente sólidas."
            />
            <FeatureCardV2
              icon={<Activity className="w-6 h-6 text-blue-400" />}
              title="Análisis Real-Time"
              desc="Recibe feedback instantáneo sobre la calidad de cada movimiento con gráficos de evaluación dinámicos."
            />
          </div>
        </div>

      </main>

      {/* Simple Footer */}
      <footer className="py-8 text-center border-t border-white/5 mt-20">
        <div className="flex items-center justify-center gap-2 mb-4 text-slate-300 font-bold">
          <span className="text-blue-500">♛</span> CentaUros Chess
        </div>
        <div className="flex justify-center gap-6 text-xs text-slate-500">
          <button onClick={() => setShowAbout(true)} className="hover:text-white">Sobre Nosotros</button>
          <button onClick={() => setShowContribution(true)} className="hover:text-white">Planes y Precios</button>
          <button disabled className="opacity-50 cursor-not-allowed">Soporte Técnico</button>
          <button onClick={() => setShowPrivacy(true)} className="hover:text-white">Privacidad</button>
          <button onClick={() => setShowTerms(true)} className="hover:text-white">Términos</button>
        </div>
        <p className="text-[10px] text-slate-600 mt-4">&copy; 2025 CentaUros Chess. Todos los derechos reservados UROSLABS - UROS ENERGY.</p>
      </footer>
    </div>
  );
};

const FeatureCardV2 = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-[#111625] p-6 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors group">
    <div className="w-12 h-12 bg-[#0a0e17] rounded-lg border border-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
