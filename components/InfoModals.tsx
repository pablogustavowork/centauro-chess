import React from 'react';
import { X, Upload, Activity, Dumbbell, Heart, Shield, FileText } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// ----------------------------------------------------------------------
// HELP MODAL
// ----------------------------------------------------------------------
export const HelpModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <BaseModal onClose={onClose} title="Guía Rápida de CentaUros">
            <div className="space-y-8">
                <div className="flex gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg h-fit"><Upload className="w-6 h-6 text-blue-400" /></div>
                    <div>
                        <h3 className="text-white font-bold text-lg">1. Sube tu Partida</h3>
                        <p className="text-slate-400 text-sm">Pega el texto PGN o sube el archivo de tu partida reciente. El sistema la procesará instantáneamente.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg h-fit"><Activity className="w-6 h-6 text-purple-400" /></div>
                    <div>
                        <h3 className="text-white font-bold text-lg">2. Diagnóstico de Errores</h3>
                        <p className="text-slate-400 text-sm">Dirígete a "El Laboratorio". Stockfish identificará tus 4 errores más críticos (Pérdida de CPL alta) y te explicará por qué fallaste.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="p-3 bg-green-500/10 rounded-lg h-fit"><Dumbbell className="w-6 h-6 text-green-400" /></div>
                    <div>
                        <h3 className="text-white font-bold text-lg">3. Entrenamiento Activo</h3>
                        <p className="text-slate-400 text-sm">En "El Gimnasio", rejougarás esos momentos clave. Sin ayuda del motor, solo tu intuición corregida. Así es como se fija el conocimiento.</p>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};

// ----------------------------------------------------------------------
// CONTRIBUTION MODAL
// ----------------------------------------------------------------------
export const ContributionModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <BaseModal onClose={onClose} title="Apoya a UrosLabs">
            <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <Heart className="w-8 h-8 text-red-500 fill-current" />
                </div>
                <p className="text-slate-300 text-lg">
                    CentaUros Chess es un proyecto nacido de la pasión por democratizar el ajedrez de alto nivel.
                </p>
                <div className="bg-[#111625] p-6 rounded-xl border border-white/5">
                    <p className="text-slate-400 text-sm mb-4">
                        Si nuestra herramienta te ha ayudado a mejorar, considera hacer una contribución voluntaria para mantener los servidores de análisis (Stockfish Cloud) activos.
                    </p>
                    <button className="bg-white text-slate-900 font-bold py-3 px-8 rounded-full hover:bg-slate-200 transition-colors">
                        Invítanos un Café ☕
                    </button>
                </div>
                <p className="text-xs text-slate-500">
                    * Todas las funcionalidades seguirán siendo gratuitas independientemente de tu contribución.
                </p>
            </div>
        </BaseModal>
    );
};

// ----------------------------------------------------------------------
// PRIVACY MODAL
// ----------------------------------------------------------------------
export const PrivacyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <BaseModal onClose={onClose} title="Política de Privacidad">
            <div className="space-y-4 text-sm text-slate-400 overflow-y-auto max-h-[60vh] pr-2">
                <p><strong>Última actualización: Diciembre 2025</strong></p>
                <p>En UrosLabs, tu privacidad es sagrada. No vendemos tus datos a terceros.</p>
                <h4 className="text-white font-bold mt-4">1. Datos que recopilamos</h4>
                <p>Solo almacenamos tu correo electrónico (para el inicio de sesión) y las partidas PGN que subes voluntariamente para análisis.</p>
                <h4 className="text-white font-bold mt-4">2. Uso de la información</h4>
                <p>Tus partidas son procesadas por nuestros motores de análisis y se guardan en tu historial privado. Nadie más tiene acceso a ellas a menos que decidas compartirlas.</p>
                <h4 className="text-white font-bold mt-4">3. Seguridad</h4>
                <p>Utilizamos encriptación estándar de la industria para proteger tus credenciales y datos de juego.</p>
            </div>
        </BaseModal>
    );
};

// ----------------------------------------------------------------------
// TERMS MODAL
// ----------------------------------------------------------------------
export const TermsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <BaseModal onClose={onClose} title="Términos y Condiciones">
            <div className="space-y-4 text-sm text-slate-400 overflow-y-auto max-h-[60vh] pr-2">
                <p>Al usar CentaUros Chess, aceptas los siguientes términos:</p>
                <h4 className="text-white font-bold mt-4">1. Uso Aceptable</h4>
                <p>La plataforma es para fines educativos y de entrenamiento. No se permite el uso de bots o scripts para extraer datos de forma masiva.</p>
                <h4 className="text-white font-bold mt-4">2. Limitación de Responsabilidad</h4>
                <p>CentaUros ofrece análisis basados en motores de ajedrez (Stockfish). Aunque son extremadamente precisos, UrosLabs no se hace responsable si pierdes una partida de torneo por seguir una recomendación específica :)</p>
                <h4 className="text-white font-bold mt-4">3. Propiedad Intelectual</h4>
                <p>Todo el código, diseño y marca "CentaUros" son propiedad de UrosLabs y Uros Energy.</p>
            </div>
        </BaseModal>
    );
};


// ----------------------------------------------------------------------
// INTERNAL BASE COMPONENT
// ----------------------------------------------------------------------
const BaseModal: React.FC<{ onClose: () => void; title: string; children: React.ReactNode }> = ({ onClose, title, children }) => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
        <div className="relative bg-[#0f1420] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    </div>
);
