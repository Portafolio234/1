import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Plot from 'react-plotly.js';
import Step from './Step';
import Arrow from './Arrow';

const FinancialForecaster = ({ onClose }) => {
    const [ticker, setTicker] = useState('BTC-USD');
    const [timeRange, setTimeRange] = useState('1M'); // Default a 1 mes
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [showArchitecture, setShowArchitecture] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Generador de datos robusto con soporte para múltiples líneas de tiempo
    const generateMockData = useCallback((symbol, range) => {
        let count, interval; // Milisegundos entre puntos

        switch (range) {
            case '1D':
                count = 24;
                interval = 3600000; // 1 hora
                break;
            case '1W':
                count = 7;
                interval = 86400000; // 1 día
                break;
            case '1M':
                count = 30;
                interval = 86400000; // 1 día
                break;
            case '1Y':
                count = 365;
                interval = 86400000; // 1 día
                break;
            case 'ALL':
                count = 1000;
                interval = 86400000 * 3; // 3 días
                break;
            default:
                count = 30;
                interval = 86400000;
        }

        const now = new Date();
        const timestamps = Array.from({ length: count }, (_, i) => new Date(now.getTime() - (count - i) * interval));

        let lastPrice = symbol.includes('BTC') ? 50000 : 150;
        const open = [], high = [], low = [], close = [];

        // Volatilidad ajustada según el rango
        const vol = range === '1D' ? 0.02 : 0.05;

        for (let i = 0; i < count; i++) {
            const change = (Math.random() - 0.5) * (lastPrice * vol);
            const o = lastPrice;
            const c = lastPrice + change;
            const h = Math.max(o, c) + Math.random() * (lastPrice * (vol / 4));
            const l = Math.min(o, c) - Math.random() * (lastPrice * (vol / 4));

            open.push(o);
            close.push(c);
            high.push(h);
            low.push(l);
            lastPrice = c;
        }

        return [{
            x: timestamps,
            open, high, low, close,
            type: 'candlestick',
            xaxis: 'x',
            yaxis: 'y',
            increasing: { line: { color: '#00f3ff', width: 1 } },
            decreasing: { line: { color: '#ff4d4d', width: 1 } }
        }];
    }, []);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const fetchData = async () => {
            try {
                // Intento de obtener datos reales
                const response = await fetch(`/api/market?symbol=${ticker}&range=${timeRange}`);
                if (!response.ok) throw new Error('API Real falló');

                const data = await response.json();
                if (!isMounted) return;

                setChartData([{
                    x: data.dates,
                    open: data.open,
                    high: data.high,
                    low: data.low,
                    close: data.close,
                    type: 'candlestick',
                    xaxis: 'x',
                    yaxis: 'y',
                    increasing: { line: { color: '#00f3ff', width: 1.5 } },
                    decreasing: { line: { color: '#ff4d4d', width: 1.5 } }
                }]);
            } catch (error) {
                console.warn("Real data fetch failed, using mock fallback:", error);
                if (isMounted) {
                    setChartData(generateMockData(ticker, timeRange));
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [ticker, timeRange, generateMockData]);

    const handleSend = useCallback(async (e) => {
        e.preventDefault();
        const trimInput = input.trim();
        if (!trimInput || chatLoading) return;

        const userMsg = { role: 'user', content: trimInput };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setChatLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: `Eres un analista financiero conciso e inteligente. Contexto: activo ${ticker}, rango ${timeRange}. REGLAS: 1) Si el usuario saluda o hace una pregunta casual, responde brevemente y amigablemente (1-2 frases). 2) Solo da análisis técnico detallado cuando te lo pidan explícitamente. 3) Mantén respuestas cortas (máx 3-4 frases) a menos que el usuario pida profundizar. 4) Usa datos del gráfico cuando sea relevante. 5) Responde en español.` },
                        ...messages,
                        userMsg
                    ]
                })
            });

            if (!response.ok) throw new Error('Error al conectar con el motor de IA');

            const data = await response.json();
            const aiContent = data.choices[0].message.content;

            setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);
        } catch (error) {
            console.error("Financial Chat Error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Lo siento, tuve un problema al procesar tu análisis financiero. ¿Podemos intentarlo de nuevo?"
            }]);
        } finally {
            setChatLoading(false);
        }
    }, [input, ticker, timeRange, messages, chatLoading]);

    const plotLayout = useMemo(() => ({
        dragmode: 'zoom',
        showlegend: false,
        xaxis: {
            rangeslider: { visible: false },
            gridcolor: 'rgba(255,255,255,0.06)',
            tickfont: { color: 'rgba(255,255,255,0.4)', size: 10 },
            type: 'date'
        },
        yaxis: {
            gridcolor: 'rgba(255,255,255,0.06)',
            tickfont: { color: 'rgba(255,255,255,0.4)', size: 10 },
            side: 'right',
            autorange: true
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 20, r: 40, b: 30, l: 10 },
        autosize: true
    }), []);

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-bg-dark flex flex-col text-white overflow-hidden">
            {/* Top Navigation */}
            <div className="bg-bg-elevated p-4 flex justify-between items-center border-b border-white/5 shrink-0 shadow-lg">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg md:text-xl font-bold font-heading text-accent-primary flex items-center gap-2">
                        <i className="fa-solid fa-chart-line"></i> FINANCE AI
                    </h2>
                    <button
                        onClick={() => setShowArchitecture(!showArchitecture)}
                        className="hidden md:flex items-center gap-2 px-3 py-1 bg-bg-elevated hover:bg-accent-primary/10 text-text-muted hover:text-accent-primary border border-white/10 rounded-[var(--radius-sm)] transition-all text-[10px] font-bold tracking-wider uppercase"
                    >
                        <i className="fa-solid fa-network-wired"></i> {showArchitecture ? "Gráfico" : "Arquitectura"}
                    </button>
                    <div className="hidden sm:flex bg-black/40 rounded-[var(--radius-sm)] p-0.5 border border-white/5 ml-2">
                        {['1D', '1W', '1M', '1Y', 'ALL'].map(r => (
                            <button
                                key={r}
                                onClick={() => setTimeRange(r)}
                                className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${timeRange === r ? 'bg-accent-primary text-bg-dark shadow-glow-primary' : 'text-text-muted hover:text-white'}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
                <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-[var(--radius-sm)] transition-all text-[10px] font-bold tracking-wider uppercase">
                    <i className="fas fa-arrow-left"></i> VOLVER
                </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Main View Area */}
                <div className="flex-1 flex flex-col p-2 md:p-6 overflow-hidden h-full border-b lg:border-b-0 lg:border-r border-white/5 relative">

                    {showArchitecture ? (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-fadeIn p-4 overflow-y-auto">
                            <h3 className="text-accent-primary font-heading font-bold uppercase tracking-widest text-sm">Flujo de Análisis Financiero</h3>
                            <div className="flex flex-col md:flex-row items-center gap-6 glass-card p-8 rounded-[var(--radius-xl)] w-full max-w-4xl">
                                <Step icon="fa-database" title="Data Ingestion" desc="OHLC real vía Yahoo Finance API." />
                                <Arrow />
                                <Step icon="fa-brain" title="IA Processing" desc="Análisis mediante Llama 3." />
                                <Arrow />
                                <Step icon="fa-comment-alt" title="Insight" desc="Respuesta contextual y dinámica." />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap gap-2 mb-4 shrink-0 px-2">
                                {['AAPL', 'TSLA', 'BTC-USD', 'ETH-USD'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTicker(t)}
                                        className={`px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all border ${ticker === t ? 'bg-accent-primary/20 border-accent-primary text-accent-primary' : 'bg-white/5 border-white/10 text-text-muted hover:bg-white/10'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>

                            {/* Mobile Time Range Selector */}
                            <div className="flex sm:hidden gap-1 mb-4 px-2 overflow-x-auto pb-1 custom-scrollbar">
                                {['1D', '1W', '1M', '1Y', 'ALL'].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setTimeRange(r)}
                                        className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-[9px] font-black transition-all border ${timeRange === r ? 'bg-accent-primary border-accent-primary text-bg-dark' : 'bg-white/5 border-white/5 text-text-muted'}`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 bg-bg-elevated/50 rounded-[var(--radius-lg)] border border-white/10 overflow-hidden relative">
                                {loading && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg-dark/80 backdrop-blur-sm">
                                        <div className="text-center">
                                            <div className="w-10 h-10 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                            <p className="text-sm text-text-secondary">Analizando Mercados...</p>
                                        </div>
                                    </div>
                                )}
                                <Plot
                                    data={chartData}
                                    layout={plotLayout}
                                    useResizeHandler={true}
                                    className="w-full h-full"
                                    style={{ width: "100%", height: "100%" }}
                                    config={{ displayModeBar: false }}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Chat Section */}
                <div className="w-full lg:w-[450px] bg-bg-elevated flex flex-col overflow-hidden h-[40vh] lg:h-full shrink-0">
                    <div className="p-4 bg-bg-elevated border-b border-white/5 shrink-0 flex justify-between items-center">
                        <h3 className="text-[10px] font-bold text-accent-primary uppercase tracking-widest flex items-center gap-2 font-heading">
                            <i className="fa-solid fa-robot"></i> Analista Conversacional
                        </h3>
                        <button
                            onClick={() => setShowArchitecture(!showArchitecture)}
                            className="md:hidden text-[9px] font-bold text-accent-primary uppercase"
                        >
                            {showArchitecture ? "Ver Gráfico" : "Arquitectura"}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-text-muted text-center px-6">
                                <i className="fa-solid fa-comment-dots text-4xl mb-4 opacity-20"></i>
                                <p className="text-[11px] md:text-sm">Pregunta sobre el gráfico de <span className="text-accent-primary font-bold">{ticker}</span>.</p>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-[var(--radius-lg)] text-sm leading-relaxed ${msg.role === 'user' ? 'bg-accent-primary/10 border border-accent-primary/20 text-white' : 'bg-white/[0.03] text-white/80 border border-white/5'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {chatLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white/[0.03] p-3 rounded-[var(--radius-lg)] border border-white/5 flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="p-4 bg-bg-elevated border-t border-white/5 shrink-0">
                        <div className="flex gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Escribe tu consulta..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-[var(--radius-md)] px-4 py-2 text-[12px] md:text-sm focus:outline-none focus:border-accent-primary/40 transition-all placeholder:text-text-muted"
                            />
                            <button
                                type="submit"
                                disabled={chatLoading}
                                className="bg-gradient-to-r from-accent-primary to-accent-secondary text-bg-dark w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center transition-all disabled:opacity-50 hover:shadow-glow-primary"
                            >
                                <i className="fa-solid fa-paper-plane"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default FinancialForecaster;
