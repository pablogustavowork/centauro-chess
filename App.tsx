
import React, { useState, useEffect } from 'react';
import { UserProfile, GameData, ViewState, CriticalMoment, ErrorType } from './types';
import Dashboard from './components/Dashboard';


import CriticalMomentsView from './components/CriticalMomentsView';
import GameReviewView from './components/GameReviewView';
import CriticalChallenge from './components/CriticalChallenge';
import TacticalTraining from './components/TacticalTraining';
import LandingPage from './components/LandingPage';
import PGNViewer from './components/PGNViewer';
import { analyzeGame } from './services/analysisService';
import { saveGame, getUserGames } from './services/gameService';
import Sidebar from './components/Sidebar';

import { Layout, FileText, X, Activity } from 'lucide-react';
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
      setView('review'); // Fix: Go to Review, not the loading screen 'analysis'

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
        setView('review');

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
      setPgnInput(pgn);
      setView('visor');
    }
  };

  const handleReviewGame = (game: GameData) => {
    setActiveGame(game);
    setView('review');
  };

  const handleTrainGame = (game: GameData) => {
    setActiveGame(game);
    setView('analysis_results');
  };


  return (
    <div className="flex bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={view}
        onNavigate={(viewId) => {
          if (viewId === 'dashboard') {
            goToDashboard();
          } else if (viewId === 'analysis') {
            // "El Laboratorio" -> Cases Criticos
            if (history.length > 0) {
              setActiveGame(history[history.length - 1]);
              setView('analysis_results');
            } else {
              alert("No hay partidas. Sube una para entrar al laboratorio.");
              setView('upload');
            }
          } else if (viewId === 'visor') {
            // "Visor PGN" -> Revision
            if (history.length > 0) {
              setActiveGame(history[history.length - 1]);
              setView('review');
            } else {
              alert("No hay partidas para revisar.");
              setView('upload');
            }
          } else {
            setView(viewId as ViewState);
          }
        }}
        onNewGame={() => setView('upload')}
        onSignOut={signOut}
        profile={currentProfile}
        userAvatar={user?.user_metadata?.avatar_url}
      />

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto relative bg-slate-950">

        {/* Mobile Header (optional, for responsive later) */}
        {/* <div className="md:hidden ...">CentaUros Mobile</div> */}

        <div className="p-0">
          {/* View Container - Removed extra padding since views handle it, or add global padding here */}

          {/* VIEW: DASHBOARD */}
          {view === 'dashboard' && (
            <Dashboard
              profile={currentProfile}
              history={history}
              onUploadClick={() => {
                // "Laboratorio" -> "Casos Criticos" (Analysis Results)
                if (history.length > 0) {
                  setActiveGame(history[history.length - 1]);
                  setView('analysis_results');
                } else {
                  // Fallback if no history
                  alert("No hay partidas analizadas aún para ver casos críticos. Sube una primera partida.");
                  setView('upload');
                }
              }}
              onTrainingClick={() => setView('training')}
              onVisorClick={() => {
                // "Visor PGN" -> "Revisión de Partida" (Review)
                if (history.length > 0) {
                  setActiveGame(history[history.length - 1]);
                  setView('review');
                } else {
                  alert("No hay partidas para revisar. Por favor sube una partida o usa el botón '+' en la barra lateral.");
                  // Maybe go to generic visor if they really want just a board?
                  // But user requested "Revision de Partida" specifically.
                  setView('upload');
                }
              }}
              onDirectPgnLoad={handleDirectPgnLoad}
              onReviewGame={handleReviewGame}
              onTrainGame={handleTrainGame}
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

          {/* ANALYSIS / REVIEW / CRITICAL MOMENTS FLOW */}
          {view === 'analysis' && (
            <div className="flex items-center justify-center h-full">
              <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 text-center max-w-md mx-auto">
                <Activity className="w-16 h-16 text-green-500 mx-auto mb-6 animate-pulse" />
                <h2 className="text-2xl font-bold text-white mb-2">Analizando Partida...</h2>
                <p className="text-slate-400 mb-6">Stockfish está buscando tus mejores jugadas y errores.</p>
                <div className="w-full bg-slate-700 rounded-full h-2 mb-2 overflow-hidden">
                  <div className="bg-green-500 h-full animate-[progress_2s_ease-in-out_infinite] w-full origin-left"></div>
                </div>
                <p className="text-xs text-slate-500">Calculando variantes profundas...</p>
              </div>
            </div>
          )}

          {view === 'review' && activeGame && (
            <GameReviewView
              game={activeGame}
              onAnalyzeCriticalMoments={() => setView('analysis_results')} // Mapping 'analysis_results' to 'critical_moments' conceptual logic inside App
              onBackToDashboard={goToDashboard}
            />
          )}

          {view === 'analysis_results' && activeGame && (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                <button onClick={() => setView('review')} className="text-slate-400 hover:text-white text-sm">← Volver al Resumen</button>
                <h2 className="text-xl font-bold text-white">Momentos Críticos</h2>
              </div>

              <div className="flex-1">
                <CriticalMomentsView
                  game={activeGame}
                  onStartChallenge={(moment) => {
                    setActiveMoment(moment);
                    setView('challenge');
                  }}
                />
              </div>
            </div>
          )}

          {/* VIEW: CHALLENGE */}
          {view === 'challenge' && activeMoment && (
            <CriticalChallenge
              key={activeMoment.fen}
              moment={activeMoment}
              onComplete={() => { }}

              onExit={() => setView('analysis_results')}
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
        </div>
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
