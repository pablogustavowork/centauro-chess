
import React from 'react';
import { Home, FlaskConical, Dumbbell, FileText, Settings, Plus, LogOut, LayoutGrid, Activity } from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
    currentView: string;
    onNavigate: (view: string) => void;
    onNewGame: () => void;
    onSignOut: () => void;
    profile: UserProfile;
    userAvatar?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onNewGame, onSignOut, profile, userAvatar }) => {

    const menuItems = [
        { id: 'dashboard', label: 'Inicio', icon: Home },
        { id: 'analysis', label: 'El Laboratorio', icon: FlaskConical }, // Direct to Upload/Analysis
        { id: 'training', label: 'El Gimnasio', icon: Dumbbell },
        { id: 'visor', label: 'Visor PGN', icon: FileText },
        { id: 'deep_analysis', label: 'Reporte Lichess', icon: Activity },
        // { id: 'settings', label: 'Ajustes', icon: Settings }, // Future
    ];

    return (
        <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 relative z-50">
            {/* Profile Section */}
            <div className="p-6 border-b border-slate-800 flex items-center gap-4">
                <div className="relative">
                    {userAvatar ? (
                        <img src={userAvatar} alt="Profile" className="w-12 h-12 rounded-full border-2 border-slate-700" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold border-2 border-slate-700">
                            {profile.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
                </div>
                <div className="overflow-hidden">
                    <h3 className="font-bold text-white truncate">{profile.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">ELO: {profile.elo}</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id || (item.id === 'analysis' && currentView === 'upload'); // Highlight analysis for upload too

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isActive
                                ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium text-sm">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-800 space-y-4">
                <button
                    onClick={onNewGame}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                >
                    <Plus className="w-5 h-5" /> Nueva Partida
                </button>

                <button
                    onClick={onSignOut}
                    className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-400 text-xs py-2 transition-colors"
                >
                    <LogOut className="w-4 h-4" /> Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
