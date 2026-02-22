import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt, FaSpinner, FaExpand, FaNetworkWired, FaEye, FaCompress } from 'react-icons/fa';
import { usePdfRenderer } from '../hooks/usePdfRenderer';
import { useRoboflow } from '../hooks/useRoboflow';
import Step from './Step';
import Arrow from './Arrow';

const EXAMPLE_PDFS = [
    { name: "Nivel 03-04 (Torre A)", url: "/pdfs/plano_1.pdf" },
    { name: "Nivel 01-02 (Planta Baja)", url: "/pdfs/plano_2.pdf" },
    { name: "Nivel Azotea (General)", url: "/pdfs/plano_3.pdf" }
];

const DoorDetectorDemo = ({ onClose }) => {
    const [confidence, setConfidence] = useState(50);
    const [zones, setZones] = useState([]);
    const [showArchitecture, setShowArchitecture] = useState(false);
    const [scale, setScale] = useState(1.0);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [drawMode, setDrawMode] = useState(false);

    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const isDrawing = useRef(false);
    const startCoords = useRef({ x: 0, y: 0 });
    const initialized = useRef(false);

    const { loadPdf, bgImage, loading, error } = usePdfRenderer(canvasRef);
    const { analyzeZone } = useRoboflow();

    // 1. CARGA INICIAL
    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            loadPdf(EXAMPLE_PDFS[0].url);
        }
    }, [loadPdf]);

    // Función para ajustar a pantalla
    const handleFit = useCallback(() => {
        if (!bgImage || !containerRef.current) return;
        const container = containerRef.current;
        const pad = 60;
        const availableW = container.clientWidth - pad;
        const availableH = container.clientHeight - pad;

        const sW = availableW / bgImage.width;
        const sH = availableH / bgImage.height;
        const s = Math.min(sW, sH, 1.0);

        setScale(s);
    }, [bgImage]);

    // Ajuste inicial automático al cargar la imagen
    useEffect(() => {
        if (bgImage) {
            handleFit();
        }
    }, [bgImage, handleFit]);

    // 2. DIBUJO DIRECTO
    const redraw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !bgImage) return;
        const ctx = canvas.getContext('2d');

        if (canvas.width !== bgImage.width || canvas.height !== bgImage.height) {
            canvas.width = bgImage.width;
            canvas.height = bgImage.height;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImage, 0, 0);

        zones.forEach(zone => {
            ctx.strokeStyle = zone.processing ? getComputedStyle(document.documentElement).getPropertyValue('--accent-secondary').trim() || '#bc13fe' : getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() || '#00f3ff';
            ctx.lineWidth = 3;
            ctx.setLineDash(zone.processing ? [8, 4] : []);
            ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);

            if (zone.detections) {
                zone.detections.forEach(det => {
                    ctx.strokeStyle = '#f59e0b';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([]);
                    ctx.strokeRect(zone.x + det.x, zone.y + det.y, det.width, det.height);
                });
            }
        });
    }, [bgImage, zones]);

    useEffect(() => {
        redraw();
    }, [redraw]);

    // Traducir coordenadas de pantalla a coordenadas internas del canvas
    const getCanvasCoords = useCallback((clientX, clientY) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const visualToReal = canvas.width / rect.width;

        return {
            x: (clientX - rect.left) * visualToReal,
            y: (clientY - rect.top) * visualToReal
        };
    }, []);

    // 3. IA
    const handleProcess = useCallback(async (zone) => {
        if (!bgImage) return;

        const canvas = document.createElement('canvas');
        canvas.width = zone.w;
        canvas.height = zone.h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bgImage, zone.x, zone.y, zone.w, zone.h, 0, 0, zone.w, zone.h);

        setZones(prev => prev.map(z => z.id === zone.id ? { ...z, processing: true } : z));

        try {
            const base64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
            const preds = await analyzeZone(base64);

            const valid = preds
                .filter(p => p.confidence >= confidence / 100)
                .map(p => ({
                    x: p.x - p.width / 2,
                    y: p.y - p.height / 2,
                    width: p.width,
                    height: p.height
                }));

            setZones(prev => prev.map(z => z.id === zone.id ? {
                ...z,
                processing: false,
                count: valid.length,
                detections: valid
            } : z));
        } catch (err) {
            console.error("AI Analysis Error:", err);
            setZones(prev => prev.map(z => z.id === zone.id ? { ...z, processing: false } : z));
        }
    }, [bgImage, analyzeZone, confidence]);

    // 4. DRAWING - Unified pointer handlers
    const handleDrawStart = useCallback((clientX, clientY) => {
        if (!bgImage || showArchitecture) return;
        isDrawing.current = true;
        startCoords.current = getCanvasCoords(clientX, clientY);
    }, [bgImage, showArchitecture, getCanvasCoords]);

    const handleDrawMove = useCallback((clientX, clientY) => {
        if (!isDrawing.current) return;
        const current = getCanvasCoords(clientX, clientY);
        const rect = {
            id: 'temp',
            x: Math.min(startCoords.current.x, current.x),
            y: Math.min(startCoords.current.y, current.y),
            w: Math.abs(current.x - startCoords.current.x),
            h: Math.abs(current.y - startCoords.current.y)
        };
        setZones(prev => [...prev.filter(z => z.id !== 'temp'), rect]);
    }, [getCanvasCoords]);

    const handleDrawEnd = useCallback(() => {
        if (!isDrawing.current) return;
        isDrawing.current = false;
        setZones(prev => {
            const temp = prev.find(z => z.id === 'temp');
            if (temp && temp.w > 20 && temp.h > 20) {
                const finalZone = { ...temp, id: Date.now(), processing: true };
                const newZones = [...prev.filter(z => z.id !== 'temp'), finalZone];
                handleProcess(finalZone);
                return newZones;
            }
            return prev.filter(z => z.id !== 'temp');
        });
    }, [handleProcess]);

    // Mouse events
    const onMouseDown = useCallback((e) => {
        handleDrawStart(e.clientX, e.clientY);
    }, [handleDrawStart]);

    const onMouseMove = useCallback((e) => {
        handleDrawMove(e.clientX, e.clientY);
    }, [handleDrawMove]);

    const onMouseUp = useCallback(() => {
        handleDrawEnd();
    }, [handleDrawEnd]);

    // Touch events (only active in drawMode)
    const onTouchStart = useCallback((e) => {
        if (!drawMode) return;
        e.preventDefault();
        const touch = e.touches[0];
        handleDrawStart(touch.clientX, touch.clientY);
    }, [drawMode, handleDrawStart]);

    const onTouchMove = useCallback((e) => {
        if (!drawMode) return;
        e.preventDefault();
        const touch = e.touches[0];
        handleDrawMove(touch.clientX, touch.clientY);
    }, [drawMode, handleDrawMove]);

    const onTouchEnd = useCallback((e) => {
        if (!drawMode) return;
        e.preventDefault();
        handleDrawEnd();
    }, [drawMode, handleDrawEnd]);

    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];
        if (file) {
            const url = URL.createObjectURL(file);
            loadPdf(url);
            setZones([]);
        }
    }, [loadPdf]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
        accept: { 'application/pdf': ['.pdf'] }
    });

    return createPortal(
        <div className="fixed inset-0 z-[1000] bg-bg-dark text-white flex flex-col overflow-hidden font-sans" {...getRootProps()}>
            <input {...getInputProps()} />

            {/* ===== MOBILE TOP BAR ===== */}
            <div className="md:hidden flex items-center justify-between p-3 bg-bg-elevated border-b border-white/5 shrink-0 z-20">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-[var(--radius-md)] text-text-muted hover:text-white transition-all"
                >
                    <i className="fa-solid fa-bars"></i>
                </button>
                <h2 className="text-sm font-black italic tracking-tighter text-accent-primary font-heading">DOOR DETECTOR</h2>
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-[var(--radius-md)] hover:bg-red-500/20 transition-all">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div className="flex-1 flex flex-row overflow-hidden relative">

                {/* ===== SIDEBAR BACKDROP (mobile only) ===== */}
                {sidebarOpen && (
                    <div
                        className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* ===== SIDEBAR ===== */}
                <aside className={`
                    fixed md:relative inset-y-0 left-0 z-50
                    w-[85vw] max-w-[320px] md:w-80
                    bg-bg-elevated border-r border-white/5 flex flex-col p-5 md:p-6 shadow-2xl shrink-0 overflow-y-auto custom-scrollbar
                    transition-transform duration-300 ease-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    {/* Sidebar Header */}
                    <div className="flex justify-between items-center mb-6 md:mb-8">
                        <h2 className="text-lg md:text-xl font-black italic tracking-tighter text-accent-primary font-heading">DOOR DETECTOR</h2>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="md:hidden p-2 bg-white/5 text-text-muted rounded-[var(--radius-sm)] hover:bg-white/10 transition-all"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                        <button onClick={onClose} className="hidden md:flex p-2 bg-red-500/10 text-red-500 rounded-[var(--radius-sm)] hover:bg-red-500/20 transition-all shadow-lg"><FaCompress /></button>
                    </div>

                    <div className="space-y-6 md:space-y-8">
                        <button
                            onClick={() => setShowArchitecture(!showArchitecture)}
                            className="w-full py-3 md:py-4 bg-white/5 border border-white/10 rounded-[var(--radius-lg)] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all group"
                        >
                            <i className={`fa-solid ${showArchitecture ? 'fa-image' : 'fa-network-wired'} mr-2 text-accent-primary group-hover:scale-110 transition-transform`}></i>
                            {showArchitecture ? "Cerrar Arquitectura" : "Ver Arquitectura"}
                        </button>

                        <div>
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-3 md:mb-4">Planos de Ejemplo</p>
                            <div className="grid gap-2">
                                {EXAMPLE_PDFS.map(p => (
                                    <button
                                        key={p.url}
                                        onClick={() => { setZones([]); loadPdf(p.url); setSidebarOpen(false); }}
                                        className={`text-left text-[11px] p-3 rounded-[var(--radius-md)] border transition-all truncate font-medium ${bgImage?.src.includes(p.url) ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary' : 'bg-white/5 border-white/5 hover:border-white/10 text-text-muted'}`}
                                    >
                                        <i className="fa-solid fa-file-pdf mr-2 opacity-50"></i> {p.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-black/20 p-4 md:p-5 rounded-[var(--radius-lg)] border border-white/5 shadow-inner">
                            <div className="flex justify-between items-center mb-3 md:mb-4">
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Confianza IA</p>
                                <span className="text-[10px] font-bold text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-md">{confidence}%</span>
                            </div>
                            <input type="range" min="10" max="95" value={confidence} onChange={(e) => setConfidence(e.target.value)} className="w-full accent-[var(--accent-primary)] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                        </div>

                        <div className="space-y-3 md:space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Zonas Analizadas</p>
                                <span className="text-[10px] font-bold text-text-secondary">{zones.filter(z => z.id !== 'temp').length}</span>
                            </div>
                            <div className="max-h-[200px] md:max-h-[250px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                {zones.filter(z => z.id !== 'temp').map((z, i) => (
                                    <div key={z.id} className="flex justify-between items-center p-3 md:p-3.5 bg-white/5 rounded-[var(--radius-md)] border border-white/5 animate-slideIn group">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-text-muted group-hover:text-accent-primary transition-colors">#0{i + 1}</span>
                                            <span className="text-[11px] font-medium text-text-secondary">Detección Automática</span>
                                        </div>
                                        <div className={`px-2 py-1 rounded-md text-[9px] font-black ${z.processing ? 'bg-accent-secondary/20 text-accent-secondary animate-pulse' : 'bg-accent-primary/20 text-accent-primary'}`}>
                                            {z.processing ? 'ANALIZANDO...' : `PUERTAS: ${z.count || 0}`}
                                        </div>
                                    </div>
                                ))}
                                {zones.filter(z => z.id !== 'temp').length === 0 && (
                                    <div className="text-center py-4 md:py-6 opacity-20">
                                        <i className="fa-solid fa-crop text-xl mb-2"></i>
                                        <p className="text-[9px] font-black uppercase">Arrastra para analizar</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ===== MAIN CONTENT AREA ===== */}
                <main ref={containerRef} className="flex-1 bg-bg-dark relative flex items-center justify-center p-0 overflow-hidden">
                    {showArchitecture ? (
                        <div className="max-w-4xl w-full p-6 md:p-10 text-center animate-fadeIn overflow-y-auto">
                            <h3 className="text-2xl md:text-3xl font-black italic text-accent-primary mb-10 md:mb-16 uppercase tracking-tighter font-heading">Architecture & Flow</h3>
                            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 justify-center p-8 md:p-16 glass-card rounded-[var(--radius-xl)] shadow-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent pointer-events-none"></div>
                                <Step icon="fa-file-pdf" title="PDF.js Core" desc="High-Res Render" />
                                <Arrow />
                                <Step icon="fa-crop-simple" title="Dynamic Crop" desc="Buffer Isolation" />
                                <Arrow />
                                <Step icon="fa-brain" title="YOLO v10" desc="Roboflow Vision" />
                            </div>
                            <button onClick={() => setShowArchitecture(false)} className="mt-10 md:mt-16 px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-bg-dark font-black rounded-[var(--radius-lg)] text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-glow-primary">
                                Regresar al Editor
                            </button>
                        </div>
                    ) : (
                        <div className="w-full h-full relative flex items-center justify-center overflow-auto custom-scrollbar p-4 md:p-10">
                            {loading && (
                                <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-bg-dark/80 backdrop-blur-xl">
                                    <div className="w-12 md:w-16 h-12 md:h-16 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin mb-4 md:mb-6"></div>
                                    <div className="space-y-1 text-center">
                                        <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-accent-primary animate-pulse">Analizando Documento</p>
                                        <p className="text-[8px] md:text-[9px] text-text-muted font-bold uppercase tracking-widest">Renderizando plano...</p>
                                    </div>
                                </div>
                            )}

                            {/* THE CANVAS CONTAINER WITH SCALE */}
                            <div
                                className={`relative shadow-[0_0_120px_rgba(0,0,0,0.8)] transition-transform duration-300 ease-out origin-center ${bgImage ? 'scale-in' : ''}`}
                                style={{
                                    transform: `scale(${scale})`,
                                    width: bgImage ? bgImage.width : 'auto',
                                    height: bgImage ? bgImage.height : 'auto'
                                }}
                            >
                                <canvas
                                    ref={canvasRef}
                                    onMouseDown={onMouseDown}
                                    onMouseMove={onMouseMove}
                                    onMouseUp={onMouseUp}
                                    onTouchStart={onTouchStart}
                                    onTouchMove={onTouchMove}
                                    onTouchEnd={onTouchEnd}
                                    className={`bg-white rounded-lg cursor-crosshair transition-opacity duration-700 ${bgImage ? 'opacity-100' : 'opacity-0'}`}
                                    style={{ touchAction: drawMode ? 'none' : 'auto' }}
                                />
                                {isDragActive && (
                                    <div className="absolute inset-0 bg-accent-primary/30 border-4 md:border-8 border-dashed border-accent-primary flex flex-col items-center justify-center backdrop-blur-xl z-[200] rounded-lg">
                                        <i className="fa-solid fa-cloud-arrow-up text-4xl md:text-7xl text-white mb-4 md:mb-6 animate-bounce"></i>
                                        <p className="text-xl md:text-3xl font-black text-white italic tracking-tighter px-4 text-center">SUELTA EL PLANO</p>
                                    </div>
                                )}
                            </div>

                            {/* ===== FLOATING CONTROLS ===== */}
                            {bgImage && (
                                <div className="fixed bottom-6 md:bottom-12 left-1/2 md:left-[calc(50%+160px)] -translate-x-1/2 flex items-center gap-1 bg-bg-elevated/95 backdrop-blur-3xl p-1 md:p-1.5 rounded-[var(--radius-xl)] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-[500]">
                                    {/* Draw Mode Toggle (visible always, critical on mobile) */}
                                    <button
                                        onClick={() => setDrawMode(d => !d)}
                                        className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-[var(--radius-lg)] transition-all active:scale-90 ${drawMode ? 'bg-accent-primary text-bg-dark shadow-glow-primary' : 'text-text-muted hover:text-white hover:bg-white/10'}`}
                                        title={drawMode ? "Desactivar dibujo" : "Activar dibujo"}
                                    >
                                        <i className="fa-solid fa-draw-polygon text-sm"></i>
                                    </button>

                                    <div className="w-[1px] h-6 md:h-8 bg-white/10 mx-1"></div>

                                    <button
                                        onClick={() => setScale(s => Math.max(0.1, s - 0.1))}
                                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-white/10 rounded-[var(--radius-lg)] transition-all text-text-muted hover:text-white active:scale-90"
                                        title="Alejar"
                                    >
                                        <FaCompress className="text-xs md:text-sm" />
                                    </button>

                                    <div className="px-2 md:px-4 text-[10px] md:text-[11px] font-black text-accent-primary min-w-[50px] md:min-w-[75px] text-center tracking-tighter tabular-nums bg-black/40 h-8 md:h-10 flex items-center justify-center rounded-[var(--radius-md)] border border-white/5 mx-0.5 md:mx-1">
                                        {Math.round(scale * 100)}%
                                    </div>

                                    <button
                                        onClick={() => setScale(s => Math.min(2.5, s + 0.1))}
                                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-white/10 rounded-[var(--radius-lg)] transition-all text-text-muted hover:text-white active:scale-90"
                                        title="Acercar"
                                    >
                                        <FaExpand className="text-xs md:text-sm" />
                                    </button>

                                    <div className="hidden md:block w-[1px] h-8 bg-white/10 mx-2"></div>

                                    <button
                                        onClick={handleFit}
                                        className="hidden md:flex px-6 h-12 items-center gap-3 hover:bg-accent-primary rounded-[var(--radius-lg)] transition-all text-[10px] font-black text-text-secondary hover:text-bg-dark uppercase tracking-widest active:scale-95 shadow-lg group"
                                    >
                                        <i className="fa-solid fa-arrows-to-eye text-accent-primary group-hover:text-bg-dark"></i> AJUSTAR
                                    </button>
                                </div>
                            )}

                            {/* Draw Mode Indicator (mobile) */}
                            {drawMode && bgImage && (
                                <div className="fixed top-16 md:top-4 left-1/2 -translate-x-1/2 z-[500] bg-accent-primary/20 border border-accent-primary/40 backdrop-blur-xl px-4 py-2 rounded-full animate-fadeIn">
                                    <p className="text-[9px] md:text-[10px] font-black text-accent-primary uppercase tracking-widest flex items-center gap-2">
                                        <i className="fa-solid fa-draw-polygon"></i>
                                        Modo Dibujo Activo — Arrastra para seleccionar zona
                                    </p>
                                </div>
                            )}

                            {!bgImage && !loading && (
                                <div className="text-center group cursor-pointer" onClick={() => document.querySelector('input').click()}>
                                    <div className="w-20 h-20 md:w-24 md:h-24 bg-white/5 rounded-[var(--radius-xl)] flex items-center justify-center mx-auto mb-6 md:mb-8 border border-white/5 group-hover:bg-accent-primary/10 group-hover:border-accent-primary/30 transition-all duration-500 group-hover:rotate-12">
                                        <i className="fa-solid fa-map-location-dot text-3xl md:text-4xl text-text-muted group-hover:text-accent-primary transition-colors"></i>
                                    </div>
                                    <h4 className="text-lg md:text-xl font-bold italic tracking-tighter text-text-secondary group-hover:text-white transition-colors mb-2">Editor de Planzone</h4>
                                    <p className="text-[9px] md:text-[10px] font-black tracking-[0.3em] md:tracking-[0.4em] uppercase text-text-muted group-hover:text-text-secondary transition-colors">Seleccione o arrastre un archivo PDF</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>,
        document.body
    );
};

export default DoorDetectorDemo;
