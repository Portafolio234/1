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

        // Calcular escala necesaria para que quepa todo el plano
        const sW = availableW / bgImage.width;
        const sH = availableH / bgImage.height;
        const s = Math.min(sW, sH, 1.0); // No hacer zoom in mayor a 1 inicialmente

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

        // SOLO resizear si es necesario (evita flash/borrado en cada redraw)
        if (canvas.width !== bgImage.width || canvas.height !== bgImage.height) {
            canvas.width = bgImage.width;
            canvas.height = bgImage.height;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImage, 0, 0);

        zones.forEach(zone => {
            ctx.strokeStyle = zone.processing ? '#6366f1' : '#10b981';
            ctx.lineWidth = 3;
            ctx.setLineDash(zone.processing ? [8, 4] : []);
            ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);

            if (zone.detections) {
                zone.detections.forEach(det => {
                    ctx.strokeStyle = '#f59e0b';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([]);
                    // det.x, det.y ya son esquina sup-izq (convertidos en handleProcess)
                    ctx.strokeRect(zone.x + det.x, zone.y + det.y, det.width, det.height);
                });
            }
        });
    }, [bgImage, zones]);

    useEffect(() => {
        redraw();
    }, [redraw]);

    // Traducir coordenadas de pantalla a coordenadas internas del canvas (teniendo en cuenta la escala visual)
    const getCanvasCoords = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        // Ratio entre el tamaño real de los datos del canvas y su tamaño visual en pantalla
        const visualToReal = canvas.width / rect.width;

        return {
            x: (e.clientX - rect.left) * visualToReal,
            y: (e.clientY - rect.top) * visualToReal
        };
    };

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

            // Convertir centro → esquina al guardar (Roboflow devuelve x,y como centro)
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

    // 4. MOUSE EVENTS
    const onMouseDown = (e) => {
        if (!bgImage || showArchitecture) return;
        isDrawing.current = true;
        startCoords.current = getCanvasCoords(e);
    };

    const onMouseMove = (e) => {
        if (!isDrawing.current) return;
        const current = getCanvasCoords(e);
        const rect = {
            id: 'temp',
            x: Math.min(startCoords.current.x, current.x),
            y: Math.min(startCoords.current.y, current.y),
            w: Math.abs(current.x - startCoords.current.x),
            h: Math.abs(current.y - startCoords.current.y)
        };
        setZones(prev => [...prev.filter(z => z.id !== 'temp'), rect]);
    };

    const onMouseUp = () => {
        if (!isDrawing.current) return;
        isDrawing.current = false;
        const temp = zones.find(z => z.id === 'temp');
        if (temp && temp.w > 20 && temp.h > 20) {
            const finalZone = { ...temp, id: Date.now(), processing: true };
            setZones(prev => [...prev.filter(z => z.id !== 'temp'), finalZone]);
            handleProcess(finalZone);
        } else {
            setZones(prev => prev.filter(z => z.id !== 'temp'));
        }
    };

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
        <div className="fixed inset-0 z-[1000] bg-[#0c0e14] text-white flex flex-col md:flex-row overflow-hidden font-sans" {...getRootProps()}>
            <input {...getInputProps()} />

            {/* Sidebar */}
            <aside className="w-full md:w-80 bg-[#151921] border-r border-white/5 flex flex-col p-6 shadow-2xl shrink-0 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-black italic tracking-tighter text-[#10b981]">DOOR DETECTOR</h2>
                    <button onClick={onClose} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all shadow-lg"><FaCompress /></button>
                </div>

                <div className="space-y-8">
                    <button
                        onClick={() => setShowArchitecture(!showArchitecture)}
                        className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all group"
                    >
                        <i className={`fa-solid ${showArchitecture ? 'fa-image' : 'fa-network-wired'} mr-2 text-[#10b981] group-hover:scale-110 transition-transform`}></i>
                        {showArchitecture ? "Cerrar Arquitectura" : "Ver Arquitectura"}
                    </button>

                    <div>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Planos de Ejemplo</p>
                        <div className="grid gap-2">
                            {EXAMPLE_PDFS.map(p => (
                                <button
                                    key={p.url}
                                    onClick={() => { setZones([]); loadPdf(p.url); }}
                                    className={`text-left text-[11px] p-3 rounded-xl border transition-all truncate font-medium ${bgImage?.src.includes(p.url) ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]' : 'bg-white/5 border-white/5 hover:border-white/10 text-gray-400'}`}
                                >
                                    <i className="fa-solid fa-file-pdf mr-2 opacity-50"></i> {p.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-black/20 p-5 rounded-2xl border border-white/5 shadow-inner">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Confianza IA</p>
                            <span className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-md">{confidence}%</span>
                        </div>
                        <input type="range" min="10" max="95" value={confidence} onChange={(e) => setConfidence(e.target.value)} className="w-full accent-[#10b981] h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Zonas Analizadas</p>
                            <span className="text-[10px] font-bold text-gray-600">{zones.filter(z => z.id !== 'temp').length}</span>
                        </div>
                        <div className="max-h-[250px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                            {zones.filter(z => z.id !== 'temp').map((z, i) => (
                                <div key={z.id} className="flex justify-between items-center p-3.5 bg-white/5 rounded-xl border border-white/5 animate-slideIn group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-gray-600 group-hover:text-[#10b981] transition-colors">#0{i + 1}</span>
                                        <span className="text-[11px] font-medium text-gray-300">Detección Automática</span>
                                    </div>
                                    <div className={`px-2 py-1 rounded-md text-[9px] font-black ${z.processing ? 'bg-indigo-500/20 text-indigo-300 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                        {z.processing ? 'ANALIZANDO...' : `PUERTAS: ${z.count || 0}`}
                                    </div>
                                </div>
                            ))}
                            {zones.filter(z => z.id !== 'temp').length === 0 && (
                                <div className="text-center py-6 opacity-20">
                                    <i className="fa-solid fa-crop text-xl mb-2"></i>
                                    <p className="text-[9px] font-black uppercase">Arrastra para analizar</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main ref={containerRef} className="flex-1 bg-[#06080d] relative flex items-center justify-center p-0 overflow-hidden">
                {showArchitecture ? (
                    <div className="max-w-4xl w-full p-10 text-center animate-fadeIn">
                        <h3 className="text-3xl font-black italic text-[#10b981] mb-16 uppercase tracking-tighter">Architecture & Flow</h3>
                        <div className="flex flex-col md:flex-row items-center gap-10 justify-center p-16 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent pointer-events-none"></div>
                            <Step icon="fa-file-pdf" title="PDF.js Core" desc="High-Res Render" />
                            <Arrow />
                            <Step icon="fa-crop-simple" title="Dynamic Crop" desc="Buffer Isolation" />
                            <Arrow />
                            <Step icon="fa-brain" title="YOLO v10" desc="Roboflow Vision" />
                        </div>
                        <button onClick={() => setShowArchitecture(false)} className="mt-16 px-10 py-4 bg-[#10b981] text-black font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(16,185,129,0.3)]">
                            Regresar al Editor
                        </button>
                    </div>
                ) : (
                    <div className="w-full h-full relative flex items-center justify-center overflow-auto custom-scrollbar p-10">
                        {loading && (
                            <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#06080d]/80 backdrop-blur-xl">
                                <div className="w-16 h-16 border-4 border-[#10b981]/20 border-t-[#10b981] rounded-full animate-spin mb-6"></div>
                                <div className="space-y-1 text-center">
                                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#10b981] animate-pulse">Analizando Documento</p>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Renderizando plano de alta fidelidad...</p>
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
                                className={`bg-white rounded-lg cursor-crosshair transition-opacity duration-700 ${bgImage ? 'opacity-100' : 'opacity-0'}`}
                            />
                            {isDragActive && (
                                <div className="absolute inset-0 bg-[#10b981]/30 border-8 border-dashed border-[#10b981] flex flex-col items-center justify-center backdrop-blur-xl z-[200] rounded-lg">
                                    <i className="fa-solid fa-cloud-arrow-up text-7xl text-white mb-6 animate-bounce"></i>
                                    <p className="text-3xl font-black text-white italic tracking-tighter">SUELTA EL PLANO PARA ANALIZAR</p>
                                </div>
                            )}
                        </div>

                        {/* Floating Zoom Controls */}
                        {bgImage && (
                            <div className="fixed bottom-12 left-1/2 md:left-[calc(50%+160px)] -translate-x-1/2 flex items-center gap-1 bg-[#1e293b]/95 backdrop-blur-3xl p-1.5 rounded-[20px] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-[500] group">
                                <button
                                    onClick={() => setScale(s => Math.max(0.1, s - 0.1))}
                                    className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-2xl transition-all text-gray-400 hover:text-white active:scale-90"
                                    title="Alejar"
                                >
                                    <FaCompress className="text-sm" />
                                </button>

                                <div className="px-4 text-[11px] font-black text-[#10b981] min-w-[75px] text-center tracking-tighter tabular-nums bg-black/40 h-10 flex items-center justify-center rounded-xl border border-white/5 mx-1">
                                    {Math.round(scale * 100)}%
                                </div>

                                <button
                                    onClick={() => setScale(s => Math.min(2.5, s + 0.1))}
                                    className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-2xl transition-all text-gray-400 hover:text-white active:scale-90"
                                    title="Acercar"
                                >
                                    <FaExpand className="text-sm" />
                                </button>

                                <div className="w-[1px] h-8 bg-white/10 mx-2"></div>

                                <button
                                    onClick={handleFit}
                                    className="px-6 h-12 flex items-center gap-3 hover:bg-[#10b981] rounded-2xl transition-all text-[10px] font-black text-gray-300 hover:text-black uppercase tracking-widest active:scale-95 shadow-lg group"
                                >
                                    <i className="fa-solid fa-arrows-to-eye text-[#10b981] group-hover:text-black"></i> AJUSTAR
                                </button>
                            </div>
                        )}

                        {!bgImage && !loading && (
                            <div className="text-center group cursor-pointer" onClick={() => document.querySelector('input').click()}>
                                <div className="w-24 h-24 bg-white/5 rounded-[30px] flex items-center justify-center mx-auto mb-8 border border-white/5 group-hover:bg-[#10b981]/10 group-hover:border-[#10b981]/30 transition-all duration-500 group-hover:rotate-12">
                                    <i className="fa-solid fa-map-location-dot text-4xl text-gray-600 group-hover:text-[#10b981] transition-colors"></i>
                                </div>
                                <h4 className="text-xl font-bold italic tracking-tighter text-gray-400 group-hover:text-white transition-colors mb-2">Editor de Planzone</h4>
                                <p className="text-[10px] font-black tracking-[0.4em] uppercase text-gray-700 group-hover:text-gray-500 transition-colors">Seleccione o arrastre un archivo PDF</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>,
        document.body
    );
};

export default DoorDetectorDemo;
