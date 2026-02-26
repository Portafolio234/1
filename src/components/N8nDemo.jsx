import React, { useState, useRef, useEffect, useCallback } from 'react';
import Step from './Step';
import Arrow from './Arrow';

const N8nDemo = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [isEmailSet, setIsEmailSet] = useState(false);
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

    const handleSetEmail = (e) => {
        e.preventDefault();
        if (email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setIsEmailSet(true);
            setMessages([{ role: 'assistant', content: `¡Hola! He iniciado una sesión para ${email}. ¿En qué te puedo ayudar hoy?` }]);
        } else {
            alert('Por favor, ingresa un correo electrónico válido.');
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !isEmailSet) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const response = await fetch("https://n8n-linssestudio.duckdns.org/webhook/7fb629b0-9cc1-4810-9ee2-dc1bd0fdd498/chat", {
                method: "POST",
                mode: "cors", // VITAL para evitar error de servidor
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    action: "sendMessage",
                    chatInput: userMsg,
                    sessionId: email
                })
            });

            // IMPORTANTE: Si n8n tarda mucho, esto espera la respuesta completa
            const data = await response.json();

            // Si n8n te manda el objeto del Excel, extraemos SOLO el mensaje limpio
            let mensajeParaMostrar = "";

            if (data["Análisis de la IA"]) {
                // Si viene del Excel, limpiamos las etiquetas internas
                mensajeParaMostrar = data["Análisis de la IA"]
                    .split('---')[0]
                    .split('ZONA:')[0]
                    .replace('[Escribe aquí tu respuesta amable para el cliente]', '')
                    .trim();
            } else {
                // Si viene directo de la IA
                mensajeParaMostrar = data.output || "Hola, ¿en qué puedo ayudarte?";
            }

            // Actualiza tu interfaz de chat
            setMessages(prev => [...prev, { role: 'assistant', content: mensajeParaMostrar }]);
            console.log("Respuesta procesada:", mensajeParaMostrar);

        } catch (error) {
            console.error("El servidor tardó demasiado o hubo un corte:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Lo sentimos, hubo un problema técnico o el servidor tardó demasiado en responder. Por favor, intenta de nuevo.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-bg-dark flex flex-col font-sans animate-fadeIn">
            {/* Header / Top Bar */}
            <div className="h-14 bg-bg-elevated border-b border-white/5 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <h2 className="text-sm font-black font-heading tracking-widest uppercase flex items-center gap-2">
                        <span className="text-accent-primary"><i className="fa-solid fa-bolt"></i> n8n</span> Automation Flow
                    </h2>
                    {isEmailSet ? (
                        <>
                            <button
                                onClick={() => setShowArchitecture(!showArchitecture)}
                                className="hidden md:flex items-center gap-2 px-3 py-1 bg-bg-elevated hover:bg-accent-primary/10 text-white/80 hover:text-accent-primary border border-white/10 rounded-[var(--radius-sm)] transition-all text-[10px] font-bold tracking-wider uppercase"
                            >
                                <i className="fa-solid fa-network-wired"></i> {showArchitecture ? "Ocultar Detalles" : "Ver Arquitectura"}
                            </button>
                            <div className="flex bg-black/40 rounded-[var(--radius-sm)] px-3 py-1 border border-white/5 ml-2 items-center gap-2">
                                <i className="fa-solid fa-user-circle text-accent-primary text-[10px]"></i>
                                <span className="text-[10px] text-white/80 hidden sm:inline">{email}</span>
                                <button onClick={() => { setIsEmailSet(false); setMessages([]); setEmail(''); }} className="ml-2 text-[9px] text-red-400 hover:text-red-300 transition-colors uppercase font-bold">Cambiar</button>
                            </div>
                        </>
                    ) : null}
                </div>
                <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-[var(--radius-sm)] transition-all text-[10px] font-bold tracking-wider uppercase">
                    <i className="fas fa-arrow-left"></i> VOLVER
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {!isEmailSet ? (
                    // PANTALLA DE LOGIN (Ocupa 100% del espacio, perfectamente centrada)
                    <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fadeIn w-full relative">
                        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl p-8 rounded-[var(--radius-xl)] border border-white/10 relative overflow-hidden group shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-primary to-accent-secondary" />
                            
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-accent-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-accent-primary/20 group-hover:bg-accent-primary/20 transition-colors">
                                    <i className="fa-solid fa-robot text-3xl text-accent-primary"></i>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2 font-heading">Conectar con n8n</h3>
                                <p className="text-sm text-white/80">
                                    Ingresa tu correo para establecer una <span className="text-accent-primary font-bold">sesión única</span> (Session ID) procesada por el nodo de IA.
                                </p>
                            </div>

                            <form onSubmit={handleSetEmail} className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="ejemplo@correo.com"
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-[var(--radius-md)] px-4 py-3 text-sm focus:outline-none focus:border-accent-primary/50 transition-all placeholder:text-white/30 text-white"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-accent-primary to-accent-secondary text-bg-dark py-3 rounded-[var(--radius-md)] font-bold uppercase tracking-wider text-[11px] hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all duration-300"
                                >
                                    Abrir Canal Seguro
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    // VISTA DE CHAT (+ Opcional Arquitectura en Desktop)
                    <div className="w-full h-full flex flex-col lg:flex-row animate-fadeIn">
                        
                        {/* Panel Izquierdo: Arquitectura (Solo Desktop si está activo) */}
                        {showArchitecture ? (
                            <div className="hidden lg:flex flex-1 flex-col items-center justify-center space-y-12 p-8 overflow-y-auto border-r border-white/5 bg-bg-dark/50">
                                <h3 className="text-accent-primary font-heading font-bold uppercase tracking-widest text-sm text-center">Flujo Serverless en n8n</h3>
                                <div className="flex flex-col items-center gap-6 bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[var(--radius-xl)] w-full max-w-sm relative">
                                    <Step icon="fa-globe" title="Webhook" desc="Recepción HTTP POST vía UI." />
                                    <Arrow direction="down" />
                                    <Step icon="fa-brain" title="Agente IA" desc="Procesamiento y Memoria (Session ID)." />
                                    <Arrow direction="down" />
                                    <Step icon="fa-reply" title="Output" desc="Retorno de JSON estructurado a React." />
                                </div>
                            </div>
                        ) : null}

                        {/* Panel Derecho: Chat Principal (Toma 100% en Móvil, o 50% en Desktop) */}
                        <div className="flex-1 bg-bg-elevated flex flex-col overflow-hidden max-w-4xl mx-auto w-full shadow-2xl relative border-x border-white/5">
                            <div className="p-4 bg-bg-elevated border-b border-white/5 shrink-0 flex justify-between items-center relative z-10 box-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                                <h3 className="text-[11px] font-bold text-accent-primary uppercase tracking-widest flex items-center gap-2 font-heading">
                                    <i className="fa-solid fa-comment-dots text-lg"></i> Asistente Automatizado
                                </h3>
                                {/* Status dot */}
                                <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                                    <span className="text-[9px] text-text-muted font-bold tracking-wider">STATUS: N8N</span>
                                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 custom-scrollbar bg-bg-dark/30">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-white/50 text-center px-6">
                                        <i className="fa-solid fa-paper-plane text-5xl mb-6 opacity-20 text-accent-primary"></i>
                                        <h4 className="text-white font-bold mb-2">Canal Establecido</h4>
                                        <p className="text-sm">Envía un mensaje para iniciar la ejecución del webhook en n8n.</p>
                                    </div>
                                ) : null}

                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                                        <div className={`max-w-[90%] md:max-w-[75%] p-4 rounded-[var(--radius-lg)] text-[13px] md:text-sm leading-relaxed shadow-lg ${
                                            msg.role === 'user' 
                                                ? 'bg-accent-primary/10 border border-accent-primary/30 text-white rounded-tr-sm' 
                                                : 'bg-white/5 backdrop-blur-md border border-white/10 text-white/90 rounded-tl-sm'
                                        }`}>
                                            {typeof msg.content === 'string' ? msg.content.split('\n').map((line, j) => (
                                                <React.Fragment key={j}>
                                                    {line}
                                                    {j < msg.content.split('\n').length - 1 && <br />}
                                                </React.Fragment>
                                            )) : msg.content}
                                        </div>
                                    </div>
                                ))}
                                
                                {loading ? (
                                    <div className="flex justify-start animate-fadeIn">
                                        <div className="bg-white/5 backdrop-blur-md p-4 rounded-[var(--radius-lg)] rounded-tl-sm border border-white/10 flex gap-2 items-center">
                                            <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce"></span>
                                            <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                            <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                        </div>
                                    </div>
                                ) : null}
                                <div ref={chatEndRef} />
                            </div>

                            <form onSubmit={handleSend} className="p-4 bg-bg-elevated border-t border-white/5 shrink-0 z-10">
                                <div className="flex gap-3">
                                    <input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Escribe tu mensaje a la IA..."
                                        disabled={loading}
                                        className="flex-1 bg-black/50 border border-white/10 rounded-[var(--radius-md)] px-5 py-3 text-sm focus:outline-none focus:border-accent-primary/50 transition-all placeholder:text-white/30 disabled:opacity-50 text-white"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || !input.trim()}
                                        className="bg-gradient-to-r from-accent-primary to-accent-secondary text-bg-dark w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center transition-all disabled:opacity-50 disabled:grayscale hover:shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                                    >
                                        <i className="fa-solid fa-paper-plane text-lg"></i>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default N8nDemo;
