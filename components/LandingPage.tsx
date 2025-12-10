
import React from 'react';
import { ArrowRight, Activity, Brain, Target, ShieldCheck } from 'lucide-react';



interface LandingPageProps {
  onEnterApp: (email?: string, password?: string, mode?: 'login' | 'signup') => void;
  user?: any;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, user }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 flex flex-col">
      {/* Video Background */}

      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        {/*
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40"
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-chess-pieces-on-a-chessboard-4266-large.mp4"
            type="video/mp4"
          />
        </video>
        */}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-green-900/20"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      </div>

      {/* Navbar Minimalista */}
      <nav className="relative z-10 w-full px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/30">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>

          <span className="text-2xl font-bold text-white tracking-tight">CentaUros<span className="text-green-400">Chess</span></span>
        </div>
        <button
          onClick={onEnterApp}
          className="text-sm font-medium text-slate-300 hover:text-white transition-colors uppercase tracking-widest hidden sm:block">
          Acceso Miembros
        </button>
      </nav>

      {/* Hero Content */}

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 mt-[-4rem]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-sm font-medium backdrop-blur-sm mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Revolucionando el entrenamiento táctico
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight drop-shadow-2xl">
            Forja un instinto <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-lime-400">
              Superior a la Máquina
            </span>
          </h1>


          <p className="mt-6 text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Deja de memorizar aperturas. Empieza a entender el <span className="text-white font-semibold">porqué</span> de cada error.
          </p>

          {/* LOGIN FORM */}
          <div className="flex flex-col items-center justify-center gap-4 mt-8 bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm max-w-sm mx-auto">
            <div className="w-full space-y-3">
              <input
                type="email"
                placeholder="Tu Email"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none"
                id="login-email"
              />
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 outline-none"
                id="login-password"
              />
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => {
                  const email = (document.getElementById('login-email') as HTMLInputElement).value;
                  const pass = (document.getElementById('login-password') as HTMLInputElement).value;
                  onEnterApp(email, pass, 'login');
                }}
                className="flex-1 px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-all"
              >
                Entrar
              </button>
              <button
                onClick={() => {
                  const email = (document.getElementById('login-email') as HTMLInputElement).value;
                  const pass = (document.getElementById('login-password') as HTMLInputElement).value;
                  onEnterApp(email, pass, 'signup');
                }}
                className="flex-1 px-4 py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-all"
              >
                Registrar
              </button>
            </div>
            <p className="text-xs text-slate-500">
              * Si es tu primera vez, haz clic en "Registrar" primero.
            </p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full text-left">
          <FeatureCard
            icon={<Activity className="text-blue-400" />}
            title="El Laboratorio"
            desc="Análisis profundo de CPL para detectar tus 4 errores más críticos por partida."
          />
          <FeatureCard
            icon={<Brain className="text-purple-400" />}
            title="El Gimnasio"
            desc="Revisita tus errores con el motor apagado y el reloj corriendo. Presión real."
          />
          <FeatureCard
            icon={<Target className="text-red-400" />}
            title="IA Adaptativa"
            desc="Entrenamiento generado por IA específicamente para atacar tus debilidades."
          />
        </div>
      </main>

      <footer className="relative z-10 py-6 text-center text-slate-600 text-sm">

        &copy; {new Date().getFullYear()} CentaUros Chess. Potenciado por Stockfish & Gemini 2.0.
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur border border-slate-800 hover:border-purple-500/30 transition-colors group">
    <div className="mb-4 p-3 bg-slate-800/50 rounded-lg w-fit group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
