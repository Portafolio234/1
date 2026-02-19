
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Plot from 'react-plotly.js';
import { FaChartLine, FaRobot, FaCompress, FaBitcoin, FaApple, FaCar, FaPaperPlane, FaUserTie } from 'react-icons/fa';
import { marketData, getTechnicalSummary } from '../data/marketData';

const FinancialForecaster = ({ onClose }) => {
    const [selectedAsset, setSelectedAsset] = useState('BTC');
    const [timeframe, setTimeframe] = useState('1Y'); // 1M, 6M, 1Y, 5Y
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hola. Soy tu Gestor de Portafolio Senior. Analizo tendencias de mercado basándome en análisis técnico y fundamental. ¿Qué activo te interesa revisar hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const asset = marketData[selectedAsset];

    // Filtrar datos según timeframe
    const getFilteredData = () => {
        const daysMap = { '1M': 30, '6M': 180, '1Y': 365, '5Y': 1825 };
        const days = daysMap[timeframe] || 365;
        const sliceIndex = Math.max(0, asset.dates.length - days);

        return {
            x: asset.dates.slice(sliceIndex),
            open: asset.open.slice(sliceIndex),
            high: asset.high.slice(sliceIndex),
            low: asset.low.slice(sliceIndex),
            close: asset.close.slice(sliceIndex)
        };
    };

    const chartData = getFilteredData();

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsTyping(true);

        // Preparar contexto para AI
        const techSummary = getTechnicalSummary(selectedAsset, timeframe === '5Y' ? 365 : 30);

        const systemPrompt = `
        Actúa como un Gestor de Fondos de Inversión Senior de Wall Street (Hedge Fund Manager).
        Tu estilo es profesional, directo, analítico y ligeramente conservador pero oportunista.
        
        CONTEXTO DE MERCADO ACTUAL (${selectedAsset}):
        ${techSummary}
        
        INSTRUCCIONES:
        1. Justifica tu respuesta usando los datos técnicos provistos (RSI, Volatilidad, Tendencia).
        2. Menciona "Soportes" y "Resistencias" aproximados basados en el rango de precios.
        3. Si te preguntan si comprar/vender, da una opinión fundamentada pero añade siempre un disclaimer corto.
        4. Usa formato Markdown para negritas y listas.
        5. Sé conciso (máximo 3 párrafos cortos).
        `;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: 'user', content: userMsg }
                    ]
                })
            });

            if (!response.ok) throw new Error("Error de conexión con el oráculo");

            const data = await response.json();
            const aiReply = data.choices[0].message.content;

            setMessages(prev => [...prev, { role: 'assistant', content: aiReply }]);

        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Lo siento, perdimos conexión con el servidor de Bloomberg. Intenta de nuevo." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-[#0b0f19] text-white overflow-hidden overscroll-none font-sans flex flex-col md:flex-row">

            {/* Left Main Area: Chart */}
            <div className="flex-1 flex flex-col relative border-r border-gray-800 h-[55dvh] md:h-auto">
                {/* Header Chart */}
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#111827]">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            {selectedAsset === 'BTC' && <FaBitcoin className="text-orange-500" />}
                            {selectedAsset === 'AAPL' && <FaApple className="text-gray-300" />}
                            {selectedAsset === 'TSLA' && <FaCar className="text-red-500" />}
                            {asset.name}
                        </h1>
                        <p className="text-sm text-gray-400 font-mono tracking-wider">{asset.symbol} • MARKET OPEN</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-mono font-bold">${asset.currentPrice.toLocaleString()}</div>
                        <div className={`text-sm font-bold ${asset.change.includes('+') ? 'text-green-400' : 'text-red-400'}`}>
                            {asset.change} Today
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex gap-2 p-4 bg-[#0b0f19]">
                    {['1M', '6M', '1Y', '5Y'].map(tf => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${timeframe === tf ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>

                {/* Chart Area */}
                <div className="flex-1 w-full relative">
                    <Plot
                        data={[{
                            x: chartData.x,
                            close: chartData.close,
                            decreasing: { line: { color: '#ef4444' } },
                            high: chartData.high,
                            increasing: { line: { color: '#22c55e' } },
                            line: { color: 'rgba(31,119,180,1)' },
                            low: chartData.low,
                            open: chartData.open,
                            type: 'candlestick',
                            xaxis: 'x',
                            yaxis: 'y'
                        }]}
                        layout={{
                            dragmode: 'zoom',
                            paper_bgcolor: '#0b0f19',
                            plot_bgcolor: '#0b0f19',
                            showlegend: false,
                            xaxis: {
                                automargin: true,
                                gridcolor: '#1f2937',
                                rangeslider: { visible: false },
                                tickfont: { color: '#6b7280' }
                            },
                            yaxis: {
                                automargin: true,
                                gridcolor: '#1f2937',
                                tickfont: { color: '#6b7280' },
                                side: 'right'
                            },
                            margin: { r: 60, l: 20, t: 20, b: 40 },
                            autosize: true
                        }}
                        useResizeHandler={true}
                        style={{ width: "100%", height: "100%" }}
                        config={{ displayModeBar: false, scrollZoom: true }}
                    />
                </div>
            </div>

            {/* Right Panel: Controls & Chat */}
            <div className="w-full md:w-[400px] h-[45dvh] md:h-auto bg-[#111827] flex flex-col relative z-20 shadow-2xl">
                {/* Header Panel */}
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex gap-2 items-center">
                        <FaUserTie /> AI Analyst
                    </h2>
                    <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg transition-all text-[10px] font-bold tracking-wider uppercase">
                        <FaCompress /> CERRAR DEMO
                    </button>
                </div>

                {/* Asset Selector */}
                <div className="p-4 grid grid-cols-3 gap-2 border-b border-gray-800">
                    {['BTC', 'AAPL', 'TSLA'].map(sym => (
                        <button
                            key={sym}
                            onClick={() => setSelectedAsset(sym)}
                            className={`p-2 text-xs font-bold rounded border transition-all ${selectedAsset === sym
                                ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                : 'bg-[#1f2937] border-transparent text-gray-400 hover:bg-[#374151]'}`}
                        >
                            {sym}
                        </button>
                    ))}
                </div>

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0b0f19]">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shrink-0 border border-gray-600">
                                    <FaUserTie className="text-blue-400 text-xs" />
                                </div>
                            )}
                            <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-[#1f2937] text-gray-300 border border-gray-700 rounded-tl-none'
                                }`}>
                                <div className="markdown-body" dangerouslySetInnerHTML={{
                                    __html: msg.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                }} />
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-2 items-center text-gray-500 text-xs ml-10">
                            <span className="animate-pulse">Escribiendo análisis...</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-[#111827] border-t border-gray-800">
                    <form onSubmit={handleSendMessage} className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={`Pregunta sobre ${asset.symbol}...`}
                            className="w-full bg-[#1f2937] border border-gray-700 text-white text-sm rounded-lg py-3 px-4 pr-10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-500"
                            disabled={isTyping}
                        />
                        <button
                            type="submit"
                            disabled={isTyping || !input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-400 hover:text-white disabled:opacity-50 transition-colors"
                        >
                            <FaPaperPlane />
                        </button>
                    </form>
                    <p className="text-[10px] text-gray-600 text-center mt-2">
                        Not Financial Advice. AI experiment.
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default FinancialForecaster;
