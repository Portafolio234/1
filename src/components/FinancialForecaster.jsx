import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Plot from 'react-plotly.js';
import axios from 'axios';

const FinancialForecaster = ({ onClose }) => {
    const [ticker, setTicker] = useState('BTC-USD');
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        fetchData();
    }, [ticker]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Usamos una API pública para demo (o tu proxy si lo tienes configurado)
            const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1h&range=1d`);
            const result = response.data.chart.result[0];
            const quotes = result.indicators.quote[0];
            const timestamps = result.timestamp;

            const data = [{
                x: timestamps.map(t => new Date(t * 1000)),
                open: quotes.open,
                high: quotes.high,
                low: quotes.low,
                close: quotes.close,
                type: 'candlestick',
                xaxis: 'x',
                yaxis: 'y',
                increasing: { line: { color: '#00f3ff' } },
                decreasing: { line: { color: '#ff4d4d' } }
            }];

            setChartData(data);
        } catch (error) {
            console.error("Error fetching finance data:", error);
        }
        setLoading(false);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setChatLoading(true);

        try {
            // Simulación de respuesta IA con contexto del gráfico
            // En producción aquí llamarías a tu API de Groq/Gemini
            setTimeout(() => {
                const aiMsg = {
                    role: 'assistant',
                    content: `Analizando el gráfico de ${ticker}... Veo una tendencia mixta con soporte en los niveles actuales. La volatilidad reciente sugiere que podrías ver un rebote técnico si el volumen acompaña.`
                };
                setMessages(prev => [...prev, aiMsg]);
                setChatLoading(false);
            }, 1500);
        } catch (error) {
            setChatLoading(false);
        }
    };

    const plotLayout = {
        dragmode: 'zoom',
        showlegend: false,
        xaxis: {
            rangeslider: { visible: false },
            gridcolor: '#334155',
            tickfont: { color: '#94a3b8', size: 10 }
        },
        yaxis: {
            gridcolor: '#334155',
            tickfont: { color: '#94a3b8', size: 10 },
            side: 'right'
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 20, r: 40, b: 30, l: 10 },
        autosize: true
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-[#0f172a] flex flex-col text-white overflow-hidden">
            {/* Top Navigation */}
            <div className="bg-[#1e293b] p-4 flex justify-between items-center border-b border-gray-700 shrink-0">
                <h2 className="text-lg md:text-xl font-bold font-heading text-[#00f3ff] flex items-center gap-2">
                    <i className="fas fa-chart-line"></i> FINANCE AI
                </h2>
                <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg transition-all text-[10px] font-bold tracking-wider uppercase">
                    <i className="fas fa-arrow-left"></i> VOLVER
                </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Chart Section */}
                <div className="flex-1 flex flex-col p-2 md:p-6 overflow-hidden h-[45vh] lg:h-full border-b lg:border-b-0 lg:border-r border-gray-700">
                    <div className="flex flex-wrap gap-2 mb-4 shrink-0">
                        {['AAPL', 'TSLA', 'BTC-USD', 'ETH-USD'].map(t => (
                            <button
                                key={t}
                                onClick={() => setTicker(t)}
                                className={`px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all border ${ticker === t ? 'bg-[#00f3ff]/20 border-[#00f3ff] text-[#00f3ff]' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 bg-[#1e293b]/50 rounded-xl border border-gray-700 overflow-hidden relative">
                        {loading && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0f172a]/80 backdrop-blur-sm">
                                <div className="text-center">
                                    <div className="w-10 h-10 border-4 border-[#00f3ff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-sm">Analizando Mercados...</p>
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
                </div>

                {/* Chat Section */}
                <div className="w-full lg:w-[450px] bg-[#111827] flex flex-col overflow-hidden h-[55vh] lg:h-full">
                    <div className="p-4 bg-[#1e293b] border-b border-gray-700 shrink-0">
                        <h3 className="text-[10px] font-bold text-[#00f3ff] uppercase tracking-widest flex items-center gap-2">
                            <i className="fas fa-robot"></i> Analista Conversacional
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center px-6">
                                <i className="fas fa-comment-dots text-4xl mb-4 opacity-20"></i>
                                <p className="text-sm">Haz una pregunta sobre el gráfico de <span className="text-[#00f3ff] font-bold">{ticker}</span>. La IA tiene contexto total.</p>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#00f3ff] text-[#000814] rounded-tr-none' : 'bg-[#1e293b] text-gray-200 border border-gray-700 rounded-tl-none'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {chatLoading && (
                            <div className="flex justify-start">
                                <div className="bg-[#1e293b] p-3 rounded-2xl border border-gray-700 flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-[#00f3ff] rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-[#00f3ff] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1.5 h-1.5 bg-[#00f3ff] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="p-4 bg-[#1e293b] border-t border-gray-700 shrink-0">
                        <div className="flex gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Escribe tu consulta..."
                                className="flex-1 bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#00f3ff] transition-all"
                            />
                            <button
                                type="submit"
                                disabled={chatLoading}
                                className="bg-[#00f3ff] hover:bg-[#00d8e6] text-[#000814] w-10 h-10 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                            >
                                <i className="fas fa-paper-plane"></i>
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
