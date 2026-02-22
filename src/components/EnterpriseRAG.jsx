import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Step from './Step';
import Arrow from './Arrow';

const DOCUMENTS = [
    { name: 'Manual_Usuario_v1.pdf', size: '2.4MB', type: 'PDF' },
    { name: 'Especificaciones_Tecnicas.docx', size: '1.1MB', type: 'DOCX' },
    { name: 'Politica_Privacidad_2024.pdf', size: '890KB', type: 'PDF' },
    { name: 'Arquitectura_Sistema.pdf', size: '4.5MB', type: 'PDF' }
];

const EnterpriseRAG = ({ onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showArchitecture, setShowArchitecture] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSend = useCallback(async (e) => {
        e.preventDefault();
        const trimInput = input.trim();
        if (!trimInput) return;

        const userMsg = { role: 'user', content: trimInput };
        console.log("Enterprise RAG - Enviando mensaje:", userMsg);

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const responses = [
            `Según la sección 4.2 del "Manual_Usuario_v1.pdf", la configuración se realiza desde el panel de administración.`,
            `He encontrado información relevante en "Especificaciones_Tecnicas.docx": el sistema soporta hasta 10,000 usuarios concurrentes.`,
            `La "Politica_Privacidad_2024.pdf" confirma que todos los datos están cifrados en reposo mediante AES-256.`
        ];

        setTimeout(() => {
            const aiMsg = {
                role: 'assistant',
                content: responses[Math.floor(Math.random() * responses.length)]
            };
            setMessages(prev => [...prev, aiMsg]);
            setLoading(false);
        }, 1000);
    }, [input]);

    const ArchitectureView = useMemo(() => (
        <div className="flex-1 flex flex-col items-center justify-start lg:justify-center lg:space-y-12 animate-fadeIn p-4 md:p-8 overflow-y-auto bg-[#0b0f19] custom-scrollbar">
            <div className="text-center mb-8 mt-4">
                <h3 className="text-accent-primary font-heading font-bold uppercase tracking-widest text-xs md:text-sm mb-2">Flujo de Recuperación Aumentada (RAG)</h3>
                <p className="text-text-secondary text-[10px] md:text-xs">Procesamiento seguro de documentos con LLMs privados.</p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6 bg-[#1e293b]/30 p-6 md:p-10 rounded-2xl border border-white/5 w-full max-w-5xl shadow-2xl mb-8">
                <Step icon="fa-file-alt" title="Document Parsing" desc="Extracción y limpieza de texto de PDFs y Docs." />
                <Arrow />
                <Step icon="fa-project-diagram" title="Vector Indexing" desc="Fragmentación y almacenamiento en base vectorial." />
                <Arrow />
                <Step icon="fa-search-plus" title="Semantic Search" desc="Recuperación de contexto relevante para la duda." />
                <Arrow />
                <Step icon="fa-magic" title="GenAI Response" desc="Generación de respuesta final con Groq/Llama." />
            </div>
            <button
                onClick={() => setShowArchitecture(false)}
                className="px-8 py-3 bg-accent-primary text-bg-dark font-bold rounded-lg text-xs uppercase hover:scale-105 transition-all shadow-lg mb-8 shrink-0"
            >
                Volver al Chat
            </button>
        </div>
    ), [setShowArchitecture]);

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-[#0f172a] flex flex-col text-white overflow-hidden">
            {/* Top Navigation */}
            <div className="bg-[#1e293b] p-4 flex justify-between items-center border-b border-gray-700 shrink-0">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg md:text-xl font-bold font-heading text-accent-primary flex items-center gap-2">
                        <i className="fas fa-shield-alt"></i> ENTERPRISE RAG
                    </h2>
                    <button
                        onClick={() => setShowArchitecture(!showArchitecture)}
                        className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#1e293b] hover:bg-accent-primary/10 text-gray-400 hover:text-accent-primary border border-gray-700 rounded-lg transition-all text-[10px] font-bold tracking-wider uppercase"
                    >
                        <i className="fas fa-network-wired"></i> {showArchitecture ? "Chat" : "Arquitectura"}
                    </button>
                </div>
                <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg transition-all text-[10px] font-bold tracking-wider uppercase">
                    <i className="fas fa-arrow-left"></i> VOLVER
                </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Sidebar: Documents */}
                <div className="w-full lg:w-80 bg-[#111827] flex flex-col border-b lg:border-b-0 lg:border-r border-gray-700 h-[25vh] lg:h-full shrink-0">
                    <div className="p-4 bg-[#1e293b]/50 border-b border-gray-700 shrink-0 flex justify-between items-center">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <i className="fas fa-database"></i> Base de Conocimiento
                        </h3>
                        <button
                            onClick={() => setShowArchitecture(!showArchitecture)}
                            className="lg:hidden text-[9px] font-bold text-accent-primary uppercase"
                        >
                            {showArchitecture ? "Ver Chat" : "Estructura"}
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {DOCUMENTS.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-[#1e293b] rounded-lg border border-gray-700 group hover:border-accent-primary transition-all">
                                <i className="fas fa-file-invoice text-accent-primary opacity-50 group-hover:opacity-100"></i>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-medium truncate">{doc.name}</p>
                                    <p className="text-[9px] text-gray-500 uppercase">{doc.type} • {doc.size}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main View Area */}
                {showArchitecture ? ArchitectureView : (
                    <div className="flex-1 flex flex-col bg-[#0b0f19] relative overflow-hidden h-full">
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar pb-24">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center max-w-md mx-auto py-10">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-accent-primary/5 rounded-full flex items-center justify-center mb-6">
                                        <i className="fas fa-lock text-3xl md:text-4xl text-accent-primary opacity-20"></i>
                                    </div>
                                    <h3 className="text-lg md:text-xl font-heading text-white mb-2">Entorno Seguro de IA</h3>
                                    <p className="text-[11px] md:text-xs">Realiza consultas sobre tus documentos corporativos con total privacidad.</p>
                                </div>
                            )}

                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                                    <div className={`max-w-[90%] md:max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.role === 'user'
                                        ? 'bg-accent-primary text-bg-dark font-medium rounded-tr-none'
                                        : 'bg-[#1e293b] text-gray-200 border border-gray-700 rounded-tl-none'
                                        }`}>
                                        {msg.content}
                                        {msg.role === 'assistant' && (
                                            <div className="mt-3 pt-3 border-t border-gray-700/50 text-[10px] text-accent-primary flex items-center gap-2">
                                                <i className="fas fa-search"></i> Fuente sugerida: Base de Conocimiento
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-[#1e293b] p-4 rounded-2xl border border-gray-700 flex gap-2">
                                        <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Container */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 shrink-0 bg-[#0b0f19]">
                            <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-2 bg-[#1e293b] p-2 rounded-xl border border-gray-700 shadow-2xl focus-within:border-accent-primary transition-all">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Consulta técnica..."
                                    className="flex-1 bg-transparent border-none px-4 py-2 text-sm focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-accent-primary hover:bg-accent-secondary text-bg-dark w-10 h-10 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 shrink-0"
                                >
                                    <i className="fas fa-paper-plane"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default EnterpriseRAG;
