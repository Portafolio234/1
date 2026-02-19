import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaPaperPlane, FaRobot, FaDatabase, FaCompress, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import { inventoryData } from '../data/inventoryData';

const EnterpriseRAG = ({ onClose }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hola! Soy tu asistente de inventario AI. Puedo ayudarte a consultar stock, precios y ubicaciones de nuestros productos tecnológicos. ¿Qué necesitas saber?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll al chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            // Lógica RAG Simple ( Búsqueda de contexto local )
            const context = inventoryData.map(item =>
                `${item.name} (${item.category}): Stock ${item.stock} | Precio $${item.price} | Estado: ${item.status} | Ubicación: ${item.location}`
            ).join('\n');

            const systemPrompt = `Eres un asistente de inventario experto y útil. Tienes acceso a los siguientes datos en tiempo real de nuestra base de datos:\n\n${context}\n\nResponde a la pregunta del usuario basándote SOLAMENTE en estos datos. Si no encuentras la información, dilo amablemente. Sé conciso y profesional.`;

            // Llamada a Netlify Function (Ruta Directa y Explícita)
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: 'user', content: userMsg }
                    ]
                })
            });

            if (!response.ok) {
                const textBody = await response.text();
                let errorMessage = `Server Error (${response.status}): Error conectando con el servidor.`;
                try {
                    const errData = JSON.parse(textBody);
                    errorMessage = `Server Error (${response.status}): ${(errData.error || errData.details || errorMessage)}`;
                } catch (e) {
                    if (textBody) errorMessage = `Server Error (${response.status}): ${textBody.substring(0, 100)}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content;

            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-[#0f172a] flex text-white overflow-hidden overscroll-none font-sans">

            {/* Left Panel: Live Data View */}
            <div className="w-2/3 bg-[#1e293b] p-8 hidden md:flex flex-col border-r border-gray-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <i className="fas fa-database text-9xl"></i>
                </div>

                <h2 className="text-2xl font-heading font-bold text-accent-secondary mb-2 flex items-center gap-3">
                    <FaDatabase /> LIVE DATA STREAM
                </h2>
                <p className="text-gray-400 mb-6 text-sm">Conectado a: <span className="text-green-400 font-mono">warehouse_db_prod_v2</span></p>

                {/* Table Container */}
                <div className="flex-1 overflow-auto bg-[#0f172a]/50 rounded-xl border border-gray-700 shadow-inner backdrop-blur-sm">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-[#334155] text-xs uppercase tracking-wider sticky top-0 z-10">
                            <tr>
                                <th className="p-4 font-bold text-gray-300">ID</th>
                                <th className="p-4 font-bold text-gray-300">Producto</th>
                                <th className="p-4 font-bold text-gray-300">Categoría</th>
                                <th className="p-4 font-bold text-gray-300 text-right">Stock</th>
                                <th className="p-4 font-bold text-gray-300 text-right">Precio</th>
                                <th className="p-4 font-bold text-gray-300">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 font-mono text-xs text-gray-300">
                            {inventoryData.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-3 text-accent-secondary/70 group-hover:text-accent-secondary">{item.id}</td>
                                    <td className="p-3 font-semibold text-white">{item.name}</td>
                                    <td className="p-3 opacity-80">{item.category}</td>
                                    <td className={`p-3 text-right font-bold ${item.stock < 5 ? 'text-red-400' : 'text-emerald-400'}`}>{item.stock}</td>
                                    <td className="p-3 text-right text-yellow-200">${item.price}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wide ${item.status === 'In Stock' ? 'bg-emerald-500/20 text-emerald-300' :
                                            item.status === 'Low Stock' ? 'bg-orange-500/20 text-orange-300' :
                                                'bg-red-500/20 text-red-300'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex gap-4 text-xs text-gray-500 font-mono">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> DB Status: ONLINE</span>
                    <span className="flex items-center gap-1"><FaSearch /> Latency: 24ms</span>
                </div>
            </div>

            {/* Right Panel: Chat Interface */}
            <div className="w-full md:w-1/3 flex flex-col bg-[#0f172a] relative">

                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1e293b]/50 backdrop-blur">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="bg-gradient-to-r from-accent-primary to-blue-600 text-transparent bg-clip-text">Enterprise AI</span>
                        </h2>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                            Powered by <span className="font-bold text-orange-500">Groq</span> & Llama 3
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex gap-2">
                            <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg transition-all text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm">
                                <FaCompress /> CERRAR DEMO
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-[#0f172a] to-[#1e293b]/30">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-blue-600 flex items-center justify-center shrink-0 shadow-lg">
                                    <FaRobot className="text-black text-xs" />
                                </div>
                            )}
                            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-[#3b82f6] text-white rounded-tr-none shadow-blue-900/20 shadow-lg'
                                : 'bg-[#1e293b] text-gray-100 border border-gray-700 rounded-tl-none shadow-lg'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3 justify-start animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                            <div className="h-10 w-24 bg-gray-800 rounded-xl"></div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-800 bg-[#1e293b]/30">
                    <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ej: ¿Qué productos tienen bajo stock?"
                            className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-full py-3 px-5 pr-12 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all shadow-inner"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 p-2 bg-accent-primary text-black rounded-full hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                        >
                            <FaPaperPlane className="text-sm" />
                        </button>
                    </form>
                    <p className="text-[10px] text-gray-600 text-center mt-2">
                        AI puede cometer errores. Verifica con la tabla de datos.
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default EnterpriseRAG;
