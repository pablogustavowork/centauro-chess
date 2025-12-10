
import React, { useState, useEffect } from 'react';
import { UserProfile, GameData, ViewState, CriticalMoment, ErrorType } from './types';
import Dashboard from './components/Dashboard';
import AnalysisView from './components/AnalysisView';
import CriticalChallenge from './components/CriticalChallenge';
import TacticalTraining from './components/TacticalTraining';
import LandingPage from './components/LandingPage';
import PGNViewer from './components/PGNViewer';
import { analyzeGame } from './services/analysisService';
import { saveGame, getUserGames } from './services/gameService';
import { Layout, FileText, X } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';


const MainApp: React.FC = () => {
  const { user, profile, loading, signInWithGoogle, signOut, signInWithEmail, signUpWithEmail } = useAuth();
  const [view, setView] = useState<ViewState>('landing');

  // Local state for game logic
  const [history, setHistory] = useState<GameData[]>([]);
  const [activeGame, setActiveGame] = useState<GameData | null>(null);
  const [activeMoment, setActiveMoment] = useState<CriticalMoment | null>(null);
  const [pgnInput, setPgnInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Navigation handlers
  const goToDashboard = () => setView('dashboard');

  // Load User History on Login
  useEffect(() => {
    if (user?.id) {
      getUserGames(user.id).then(games => {
        if (games.length > 0) setHistory(games);
      });
    } else {
      setHistory([]);
    }
  }, [user]);


  // Handle Login
  const handleLogin = async (email?: string, password?: string, mode?: 'login' | 'signup') => {
    // If no credentials, redirect to Google (legacy)
    if (!email || !password) {
      await signInWithGoogle();
      return;
    }

    if (mode === 'signup') {
      const { error } = await signUpWithEmail(email, password);
      if (error) alert("Error registro: " + error.message);
      else alert("Registro exitoso! Confirma tu email o inicia sesión (si el 'Email Confirm' está desactivado).");
    } else {
      const { error } = await signInWithEmail(email, password);
      if (error) alert("Error login: " + error.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Cargando perfil...</div>;

  // Renderizado condicional para la Landing Page
  if (!user || view === 'landing') {
    return <LandingPage
      onEnterApp={user ? goToDashboard : handleLogin}
      user={user} // Pass user to landing to show "Enter" vs "Login"
    />;
  }

  // Use profile from Supabase (or fallback)
  const currentProfile = profile || { name: 'Jugador', elo: 1500 };

  const handlePgnUpload = async () => {
    if (!pgnInput.trim()) return;
    setIsAnalyzing(true);
    try {
      const data = await analyzeGame(pgnInput, currentProfile.name);
      setHistory(prev => [...prev, data]);
      setActiveGame(data);
      setView('analysis');

      // Save directly if verification passed
      if (user?.id) {
        saveGame(data, user.id).then(savedGame => {
          if (savedGame) {
            setHistory(prev => prev.map(g => g.id === data.id ? savedGame : g));
            setActiveGame(savedGame);
          }
        });
      }

    } catch (error) {
      alert("Error analizando PGN. Por favor revisa el formato.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ... (Upload handlers same as before)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) setPgnInput(event.target.result as string);
    };
    reader.readAsText(file);
  };

  const handleDirectPgnLoad = async (pgn: string, mode: 'analysis' | 'viewer') => {
    if (!pgn) return;

    if (mode === 'analysis') {
      setIsAnalyzing(true);
      try {
        const data = await analyzeGame(pgn, currentProfile.name);
        setHistory(prev => [...prev, data]);
        setActiveGame(data);
        setView('analysis');

        // Save directly if verified user
        if (user?.id) {
          saveGame(data, user.id).then(savedGame => {
            if (savedGame) {
              setHistory(prev => prev.map(g => g.id === data.id ? savedGame : g));
              setActiveGame(savedGame);
            }
          });
        }
      } catch (error) {
        alert("Error analizando PGN.");
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      // Viewer Mode
      setPgnInput(pgn);
      setView('visor');
    }
  };


  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-green-500/30">
      {/* Navigation Bar */}
      <nav className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
            <Layout className="text-green-500 w-6 h-6" />
            <span className="text-xl font-bold text-white tracking-tight">CentaUros<span className="text-green-500">Chess</span></span>
          </div>

          <div className="flex items-center gap-4">
            {/* Status Badge */}
            <div className="text-sm text-slate-400 hidden sm:block">
              <span className="hidden sm:inline">Estado del Motor: </span>
              <span className="text-green-400 font-mono text-xs border border-green-900 bg-green-900/20 px-2 py-0.5 rounded">EN LÍNEA</span>
            </div>

            {/* User Profile / Logout */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-white">{currentProfile.name}</div>
                <div className="text-xs text-green-400 font-mono">ELO: {currentProfile.elo}</div>
              </div>

              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-9 h-9 rounded-full border border-slate-600" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-blue-600 border border-slate-600"></div>
              )}

              <button
                onClick={signOut}
                className="text-xs text-slate-400 hover:text-red-400 ml-2"
                title="Cerrar Sesión"
              >
                Salir
              </button>
            </div>
          </div>

        </div>
      </nav>

      {/* Main Content Area */}
      <main className="min-h-[calc(100vh-64px)]">
        {/* VIEW: DASHBOARD */}
        {view === 'dashboard' && (
          <Dashboard
            profile={currentProfile}
            history={history}
            onUploadClick={() => setView('upload')}
            onTrainingClick={() => setView('training')}
            onVisorClick={() => setView('visor')}
            onDirectPgnLoad={handleDirectPgnLoad}
          />
        )}

        {/* ... (Rest of views: upload, analysis, challenge, training, visor) ... */}
        {/* VIEW: UPLOAD */}
        {view === 'upload' && (
          <div className="max-w-2xl mx-auto mt-12 p-6 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl animate-in fade-in zoom-in-95">
            {/* ... Same content ... */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Subir Partida</h2>
              <button onClick={goToDashboard} className="text-slate-400 hover:text-white"><X /></button>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:bg-slate-700/50 transition-colors">
                <input type="file" accept=".pgn" onChange={handleFileUpload} className="hidden" id="pgn-file" />
                <label htmlFor="pgn-file" className="cursor-pointer flex flex-col items-center gap-2">
                  <FileText className="w-8 h-8 text-green-400" />
                  <span className="text-slate-300 font-medium">Clic para subir archivo .pgn</span>
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-slate-800 text-slate-500">O pegar texto</span></div>
              </div>
              <textarea
                className="w-full h-40 bg-slate-900 border border-slate-700 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-green-500 outline-none text-slate-300"
                placeholder="[Event '...'] 1. e4 e5 ..."
                value={pgnInput}
                onChange={(e) => setPgnInput(e.target.value)}
              />
              <button
                disabled={isAnalyzing || !pgnInput}
                onClick={handlePgnUpload}
                className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
              >
                {isAnalyzing ? 'Analizando con Stockfish...' : 'Analizar Partida'}
              </button>
            </div>
          </div>
        )}

        {/* VIEW: ANALYSIS */}
        {view === 'analysis' && activeGame && (
          <div className="h-[calc(100vh-64px)] p-6">
            <div className="max-w-7xl mx-auto h-full flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <button onClick={goToDashboard} className="text-slate-400 hover:text-white text-sm">← Volver al Dashboard</button>
                <h2 className="text-xl font-bold text-white">Resultados del Análisis</h2>
              </div>
              <div className="flex-1">
                <AnalysisView
                  game={activeGame}
                  onStartChallenge={(moment) => {
                    setActiveMoment(moment);
                    setView('challenge');
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW: CHALLENGE */}
        {view === 'challenge' && activeMoment && (
          <CriticalChallenge
            key={activeMoment.fen}
            moment={activeMoment}
            onComplete={() => { }}
            onExit={() => setView('analysis')}
          />
        )}

        {/* VIEW: TRAINING */}
        {view === 'training' && (
          <div className="py-12 px-4">
            <div className="max-w-4xl mx-auto mb-4">
              <button onClick={goToDashboard} className="text-slate-400 hover:text-white text-sm">← Volver al Dashboard</button>
            </div>
            <TacticalTraining
              errorType={history.length > 0 ? history[history.length - 1].dominantError : ErrorType.TACTICAL_GRAVE}
              onClose={goToDashboard}
            />
          </div>
        )}

        {/* VIEW: VISOR */}
        {view === 'visor' && (
          <PGNViewer onBack={goToDashboard} initialPgn={pgnInput} />
        )}
      </main>
    </div>
  );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
