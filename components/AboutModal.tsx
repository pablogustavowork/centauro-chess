import React from 'react';
import { X, Cpu, Heart, Globe, Sparkles } from 'lucide-react';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-[#0f1420] w-full max-w-4xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative flex flex-col md:flex-row h-full max-h-[90vh]">

                    {/* Left: Image / Visual */}
                    <div className="w-full md:w-2/5 bg-slate-900 relative min-h-[200px] md:min-h-full overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1528642474498-1af0c17fd8c3?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-60"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1420] via-transparent to-transparent"></div>
                        <div className="absolute bottom-8 left-8 right-8">
                            <div className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center rounded-xl mb-4 shadow-lg shadow-blue-600/30">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">UrosLabs</h3>
                            <p className="text-sm text-slate-300">Donde la ingeniería se encuentra con el arte del ajedrez.</p>
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="space-y-8">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                                    Despertando al Genio <br />
                                    <span className="text-blue-500">Que Llevas Dentro</span>
                                </h2>
                                <p className="text-lg text-slate-300 leading-relaxed">
                                    En un mundo donde nos dicen que el talento es innato, nosotros creemos en algo diferente. Creemos que la genialidad es una estructura que se puede construir, pieza a pieza, error tras error, aprendizaje tras aprendizaje.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        <Heart className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold mb-1">La Visión de Pablo Arapa</h4>
                                        <p className="text-sm text-slate-400 leading-relaxed">
                                            Fundador y visionario detrás de UrosLabs. Su obsesión no es crear el mejor motor de ajedrez, sino <strong>el mejor creador de ajedrecistas</strong>. Pablo cree firmemente que con las herramientas adecuadas y el feedback emocional correcto, cualquier mente apasionada puede alcanzar alturas de Gran Maestro.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                                        <Cpu className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold mb-1">Tecnología con Propósito</h4>
                                        <p className="text-sm text-slate-400 leading-relaxed">
                                            UrosLabs no solo escribe código; diseña experiencias de transformación. Utilizamos IA avanzada no para reemplazarte, sino para ser el espejo que te muestra tus puntos ciegos más brillantes.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <p className="text-base font-medium text-white italic text-center">
                                    "Nuestro objetivo final no es que ganes más partidas. Es que descubras la inmensidad de tu propia capacidad intelectual."
                                </p>
                                <p className="text-xs text-slate-500 text-center mt-2 uppercase tracking-widest font-bold">
                                    — Pablo Arapa, CEO UrosLabs
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutModal;
