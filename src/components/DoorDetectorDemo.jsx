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

    const canvasRef = useRef(null);
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

    // 2. DIBUJO DIRECTO
    const redraw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !bgImage) return;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImage, 0, 0);

        zones.forEach(zone => {
            ctx.strokeStyle = zone.processing ? '#6366f1' : '#10b981';
            ctx.lineWidth = 4;
            ctx.setLineDash(zone.processing ? [5, 5] : []);
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

    // 3. IA
    const handleProcess = useCallback(async (zone) => {
        if (!bgImage) return;
        const offCanvas = document.createElement('canvas');
        offCanvas.width = zone.w; offCanvas.height = zone.h;
        const offCtx = offCanvas.getContext('2d');
        offCtx.drawImage(bgImage, zone.x, zone.y, zone.w, zone.h, 0, 0, zone.w, zone.h);

        const base64 = offCanvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        try {
            const preds = await analyzeZone(base64);
            const valid = preds.filter(p => p.confidence >= confidence / 100).map(p => ({
                x: p.x - p.width / 2, y: p.y - p.height / 2, width: p.width, height: p.height
            }));
            setZones(prev => prev.map(z => z.id === zone.id ? { ...z, processing: false, count: valid.length, detections: valid } : z));
        } catch (e) {
            setZones(prev => prev.map(z => z.id === zone.id ? { ...z, processing: false, count: "!" } : z));
        }
    }, [bgImage, analyzeZone, confidence]);

    // 4. MOUSE
    const getCoords = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvasRef.current.width / rect.width),
            y: (e.clientY - rect.top) * (canvasRef.current.height / rect.height)
        };
    };

    const onMouseDown = (e) => {
        if (!bgImage || showArchitecture) return;
        isDrawing.current = true;
        startCoords.current = getCoords(e);
    };

    const onMouseMove = (e) => {
        if (!isDrawing.current || !bgImage) return;
        const current = getCoords(e);
        redraw();
        const ctx = canvasRef.current.getContext('2d');
        ctx.strokeStyle = '#6366f1'; ctx.setLineDash([8, 4]);
        ctx.strokeRect(startCoords.current.x, startCoords.current.y, current.x - startCoords.current.x, current.y - startCoords.current.y);
    };

    const onMouseUp = (e) => {
        if (!isDrawing.current) return;
        isDrawing.current = false;
        const end = getCoords(e);
        const w = Math.abs(end.x - startCoords.current.x);
        const h = Math.abs(end.y - startCoords.current.y);
        if (w > 20 && h > 20) {
            const zone = { id: Date.now(), x: Math.min(startCoords.current.x, end.x), y: Math.min(startCoords.current.y, end.y), w, h, processing: true };
            setZones(prev => [...prev, zone]);
            handleProcess(zone);
        } else redraw();
    };

    const onDrop = useCallback((files) => {
        if (files[0]) { setZones([]); loadPdf(files[0]); }
    }, [loadPdf]);

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] } });

    return createPortal(
        <div className="fixed inset-0 z-[1000] bg-[#0f172a] text-white flex flex-col md:flex-row overflow-hidden">
            <aside className="w-full md:w-80 bg-[#1e293b] border-r border-gray-700 flex flex-col p-6 shadow-2xl shrink-0 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-accent-primary">DETECTOR</h2>
                    <button onClick={onClose} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"><FaCompress /></button>
                </div>
                <div className="space-y-6">
                    <button onClick={() => setShowArchitecture(!showArchitecture)} className="w-full py-3 bg-accent-primary/10 border border-accent-primary/20 rounded-xl text-accent-primary font-bold text-xs uppercase hover:bg-accent-primary/20"><FaNetworkWired className="inline mr-2" /> ARQUITECTURA</button>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Ejemplos</p>
                        <div className="grid gap-2">
                            {EXAMPLE_PDFS.map(p => (
                                <button key={p.url} onClick={() => { setZones([]); loadPdf(p.url); }} className="text-left text-xs p-3 rounded-lg bg-[#0f172a]/50 border border-white/5 hover:border-accent-primary/30 truncate">📄 {p.name}</button>
                            ))}
                        </div>
                    </div>
                    <div {...getRootProps()} className="p-4 border-2 border-dashed border-gray-600 rounded-xl text-center cursor-pointer hover:border-accent-primary">
                        <input {...getInputProps()} />
                        <FaCloudUploadAlt className="text-2xl mx-auto mb-1 text-gray-500" />
                        <p className="text-[10px] text-gray-500">Subir PDF</p>
                    </div>
                    <div className="bg-black/20 p-4 rounded-xl">
                        <p className="text-[10px] font-bold text-gray-500 mb-2">SENSIBILIDAD: {confidence}%</p>
                        <input type="range" min="10" max="95" value={confidence} onChange={(e) => setConfidence(e.target.value)} className="w-full" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Zonas ({zones.length})</p>
                        {zones.map((z, idx) => (
                            <div key={z.id} className="flex justify-between items-center p-2 bg-black/20 rounded-lg border border-white/5">
                                <span className="text-[10px] text-gray-400">Zona #{idx + 1}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${z.processing ? 'bg-indigo-500/20 animate-pulse' : 'bg-emerald-500/20 text-emerald-300'}`}>{z.count ?? '...'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
            <main className="flex-1 bg-[#060810] relative flex items-center justify-center p-4 overflow-auto">
                {showArchitecture ? (
                    <div className="text-center animate-fadeIn py-10">
                        <h3 className="text-accent-primary font-bold mb-8 uppercase tracking-[0.3em]">Arquitectura</h3>
                        <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
                            <Step icon="fa-file-pdf" title="PDF Engine" desc="Carga Estable" />
                            <Arrow />
                            <Step icon="fa-microchip" title="IA" desc="YOLOv10 Analysis" />
                        </div>
                        <button onClick={() => setShowArchitecture(false)} className="mt-12 px-8 py-3 bg-accent-primary text-bg-dark font-black rounded-xl text-xs uppercase hover:scale-105 transition-all">VOLVER AL PLANO</button>
                    </div>
                ) : (
                    <div className="relative">
                        {loading && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 rounded-xl">
                                <FaSpinner className="text-3xl text-accent-primary animate-spin" />
                            </div>
                        )}
                        {error && <div className="p-6 bg-red-500/10 text-red-500 rounded-xl text-xs">{error}</div>}
                        <canvas ref={canvasRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
                            className={`shadow-2xl rounded-xl bg-white cursor-crosshair transition-opacity ${bgImage ? 'opacity-100' : 'opacity-0'}`} style={{ touchAction: 'none' }} />
                        {!bgImage && !loading && !error && <div className="opacity-20 text-center"><FaExpand className="text-5xl mb-2 mx-auto" /><p>SELECCIONE UN PLANO</p></div>}
                    </div>
                )}
            </main>
        </div>,
        document.body
    );
};

export default DoorDetectorDemo;
