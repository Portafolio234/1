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
        if (!trimInput || loading) return;

        const userMsg = { role: 'user', content: trimInput };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: `Eres un asistente de IA corporativo experto en RAG. Analizas documentos corporativos. Responde de forma técnica y profesional sobre los archivos: ${DOCUMENTS.map(d => d.name).join(', ')}.` },
                        ...messages,
                        userMsg
                    ]
                })
            });

            if (!response.ok) throw new Error('Error en el servicio RAG');

            const data = await response.json();
            const aiContent = data.choices[0].message.content;

            setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);
        } catch (error) {
            console.error("RAG Chat Error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Lo siento, hubo un error procesando tu consulta con los documentos técnicos. ¿Podemos intentarlo de nuevo?"
            }]);
        } finally {
            setLoading(false);
        }
    }, [input, loading, messages]);

    const ArchitectureView = useMemo(() => (
        <div className="flex-1 flex flex-col items-center justify-start lg:justify-center lg:space-y-12 animate-fadeIn p-4 md:p-8 overflow-y-auto bg-[#0b0f19] custom-scrollbar">
            <div className="text-center mb-8 mt-4">
                <h3 className="text-accent-primary font-heading font-bold uppercase tracking-widest text-xs md:text-sm mb-2">Flujo de Recuperación Aumentada (RAG)</h3>
                <p className="text-text-secondary text-[10px] md:text-xs">Procesamiento seguro de documentos con LLMs privados.</p>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 w-full max-w-5xl relative">
                <Step
                    icon="fa-file-medical"
                    title="Ingesta"
                    desc="Parsing de PDFs y Docs"
                />
                <Arrow className="hidden lg:block w-12 h-12" />
                <Arrow className="lg:hidden w-8 h-8 rotate-90" />

                <Step
                    icon="fa-microchip"
                    title="Embeddings"
                    desc="Vectorización con OpenAI"
                />
                <Arrow className="hidden lg:block w-12 h-12" />
                <Arrow className="lg:hidden w-8 h-8 rotate-90" />

                <Step
                    icon="fa-database"
                    title="Pinecone"
                    desc="Búsqueda Semántica"
                />
                <Arrow className="hidden lg:block w-12 h-12" />
                <Arrow className="lg:hidden w-8 h-8 rotate-90" />

                <Step
                    icon="fa-brain"
                    title="Groq LLM"
                    desc="Generación de Respuesta"
                />
            </div>

            <div className="mt-12 p-6 bg-[rgba(0,243,255,0.05)] border border-[rgba(0,243,255,0.1)] rounded-lg max-w-2xl w-full">
                <h4 className="text-accent-primary font-heading mb-3 text-sm flex items-center gap-2">
                    <i className="fa-solid fa-shield-halved"></i> Capa de Seguridad Enterprise
                </h4>
                <p className="text-text-secondary text-xs leading-relaxed">
                    Toda la información es encriptada antes de ser vectorizada. No hay filtración de datos
                    hacia el entrenamiento de modelos públicos. El sistema cumple con estándares SOC2 y RGPD.
                </p>
            </div>
        </div>
    ), []);

    return createPortal(
        <div className="fixed inset-0 z-[100] bg-bg-dark/95 backdrop-blur-md flex flex-col md:flex-row overflow-hidden">
            <div className="w-full md:w-[400px] border-r border-white/10 flex flex-col h-[50vh] md:h-full bg-bg-dark">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="font-heading font-bold text-accent-primary">AI Enterprise RAG</h2>
                        <span className="text-[10px] text-text-secondary flex items-center gap-1 uppercase tracking-tighter">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Sistema Activo
                        </span>
                    </div>
                    <button onClick={onClose} className="md:hidden text-text-secondary hover:text-white transition-colors">
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                    <button
                        onClick={() => setShowArchitecture(!showArchitecture)}
                        className="text-xs text-accent-primary underline block lg:hidden"
                    >
                        {showArchitecture ? 'Ver Chat' : 'Ver Arq.'}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[rgba(255,255,255,0.02)]">
                    {messages.length === 0 && (
                        <div className="text-center py-10">
                            <i className="fa-solid fa-folder-open text-3xl text-white/10 mb-3"></i>
                            <p className="text-text-secondary text-xs italic px-6">
                                He indexado 4 documentos corporativos. ¿En qué puedo ayudarte hoy?
                            </p>
                            <div className="mt-4 space-y-2 px-6">
                                {['¿Resumen de seguridad?', '¿Límite de usuarios?'].map(q => (
                                    <button
                                        key={q}
                                        onClick={() => setInput(q)}
                                        className="w-full text-left text-[10px] p-2 rounded bg-white/5 hover:bg-accent-primary/10 border border-white/5 text-text-secondary"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed ${msg.role === 'user'
                                    ? 'bg-accent-primary/20 border border-accent-primary/30 text-white'
                                    : 'bg-white/5 border border-white/10 text-text-secondary'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white/5 border border-white/10 p-3 rounded-lg flex gap-1">
                                <span className="w-1 h-1 bg-accent-primary rounded-full animate-bounce"></span>
                                <span className="w-1 h-1 bg-accent-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1 h-1 bg-accent-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-bg-dark">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Consulta técnica..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-4 pr-10 text-xs focus:outline-none focus:border-accent-primary/50 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-accent-primary hover:text-white transition-colors disabled:opacity-50"
                        >
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </form>
            </div>

            <div className={`flex-1 flex flex-col relative h-[50vh] md:h-full transition-all duration-500 bg-[#060811] ${showArchitecture ? 'block' : 'hidden md:flex'}`}>
                <div className="hidden md:flex absolute top-4 right-4 z-10 items-center gap-3">
                    <div className="flex bg-bg-dark border border-white/10 rounded-full p-1 h-fit">
                        {DOCUMENTS.map(doc => (
                            <div key={doc.name} className="px-3 py-1 text-[10px] text-text-secondary hover:text-accent-primary cursor-default border-r last:border-0 border-white/5">
                                <i className="fa-solid fa-file-pdf mr-1 text-accent-primary/60"></i> {doc.name.split('_')[0]}
                            </div>
                        ))}
                    </div>
                    <button onClick={onClose} className="bg-bg-dark border border-white/10 w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-white transition-all hover:scale-110">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                {ArchitectureView}
            </div>
        </div>,
        document.body
    );
};

export default EnterpriseRAG;
