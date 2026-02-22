import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt, FaSpinner, FaExpand, FaCompress } from 'react-icons/fa';
import { usePdfRenderer } from '../hooks/usePdfRenderer';
import { useRoboflow } from '../hooks/useRoboflow';

const DoorDetectorDemo = ({ onClose }) => {
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [confidence, setConfidence] = useState(50);
    const [zones, setZones] = useState([]);

    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const isDrawing = useRef(false);
    const startCoords = useRef({ x: 0, y: 0 });

    const {
        pdfDoc, loading, error: pdfError, canvasSize, bgImageRef, loadPdf, renderPage
    } = usePdfRenderer(canvasRef);
    const { analyzeZone } = useRoboflow();

    const [generalError, setGeneralError] = useState(null);

    const EXAMPLE_PDFS = [
        { name: "Nivel 03-04 (Torre A)", url: "/pdfs/plano_1.pdf" },
        { name: "Nivel 01-02 (Planta Baja)", url: "/pdfs/plano_2.pdf" },
        { name: "Nivel Azotea (General)", url: "/pdfs/plano_3.pdf" }
    ];

    useEffect(() => {
        loadPdfFromUrl(EXAMPLE_PDFS[0].url);
    }, []);

    const loadPdfFromUrl = async (url) => {
        setGeneralError(null);
        setFile(null);
        try {
            await loadPdf(url);
        } catch (err) {
            setGeneralError(`Error cargando el plano de ejemplo: ${err.message}`);
        }
    };

    const onDrop = async (acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        setGeneralError(null);
        if (selectedFile?.type === 'application/pdf') {
            setFile(selectedFile);
            try {
                const arrayBuffer = await selectedFile.arrayBuffer();
                await loadPdf(arrayBuffer);
            } catch (err) {
                setGeneralError(`Error al procesar el PDF: ${err.message}. Intenta con otro archivo.`);
                setFile(null);
            }
        } else {
            setGeneralError("Por favor sube un archivo PDF válido.");
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });

    const getCoords = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvasRef.current.width / rect.width),
            y: (e.clientY - rect.top) * (canvasRef.current.height / rect.height)
        };
    };

    const handleMouseDown = (e) => {
        if (!bgImageRef.current) return;
        isDrawing.current = true;
        startCoords.current = getCoords(e);
    };

    const handleMouseMove = (e) => {
        if (!isDrawing.current || !bgImageRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        const currentCoords = getCoords(e);

        redrawCanvas();

        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.strokeRect(
            startCoords.current.x,
            startCoords.current.y,
            currentCoords.x - startCoords.current.x,
            currentCoords.y - startCoords.current.y
        );
    };

    const handleMouseUp = async (e) => {
        if (!isDrawing.current || !bgImageRef.current) return;
        isDrawing.current = false;

        const endCoords = getCoords(e);
        const width = Math.abs(endCoords.x - startCoords.current.x);
        const height = Math.abs(endCoords.y - startCoords.current.y);

        if (width > 20 && height > 20) {
            const newZone = {
                id: Date.now(),
                x: Math.min(startCoords.current.x, endCoords.x),
                y: Math.min(startCoords.current.y, endCoords.y),
                w: width,
                h: height,
                processing: true,
                detections: [],
                count: '...'
            };

            setZones(prev => [...prev, newZone]);
            redrawCanvas([...zones, newZone]);

            await processZone(newZone);
        } else {
            redrawCanvas();
        }
    };

    const redrawCanvas = (currentZones = zones) => {
        const canvas = canvasRef.current;
        if (!canvas || !bgImageRef.current) return;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImageRef.current, 0, 0);

        currentZones.forEach(zone => {
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
    };

    useEffect(() => {
        if (bgImageRef.current) redrawCanvas();
    }, [zones]);

    const processZone = async (zone) => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = zone.w;
        offCanvas.height = zone.h;
        const offCtx = offCanvas.getContext('2d');
        offCtx.drawImage(bgImageRef.current, zone.x, zone.y, zone.w, zone.h, 0, 0, zone.w, zone.h);

        const base64Image = offCanvas.toDataURL('image/jpeg', 0.8).split(',')[1];

        try {
            const preds = await analyzeZone(base64Image);

            setZones(prev => prev.map(z => {
                if (z.id !== zone.id) return z;

                const validDetections = preds.filter(p => p.confidence >= confidence / 100).map(p => ({
                    x: p.x - p.width / 2,
                    y: p.y - p.height / 2,
                    width: p.width,
                    height: p.height,
                    class: p.class,
                    confidence: p.confidence
                }));

                return {
                    ...z,
                    processing: false,
                    count: validDetections.length,
                    detections: validDetections,
                    rawPredictions: preds
                };
            }));
        } catch (error) {
            setZones(prev => prev.map(z =>
                z.id === zone.id ? { ...z, processing: false, count: "Error" } : z
            ));
        }
    };

    useEffect(() => {
        setZones(prevZones => prevZones.map(zone => {
            if (!zone.rawPredictions) return zone;
            const validDetections = zone.rawPredictions
                .filter(p => p.confidence >= confidence / 100)
                .map(p => ({
                    x: p.x - p.width / 2,
                    y: p.y - p.height / 2,
                    width: p.width,
                    height: p.height,
                    class: p.class,
                    confidence: p.confidence
                }));
            return { ...zone, detections: validDetections, count: validDetections.length };
        }));
    }, [confidence]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-[#0f172a] flex flex-col md:flex-row text-white overflow-hidden">
            {/* Sidebar / Controls */}
            <div className="w-full md:w-80 bg-[#1e293b] p-4 md:p-6 flex flex-col gap-4 shadow-xl z-20 shrink-0 h-[40vh] md:h-full overflow-hidden border-b md:border-b-0 md:border-r border-gray-700">
                <div className="flex justify-between items-center shrink-0">
                    <h2 className="text-lg md:text-xl font-bold font-heading text-accent-primary flex items-center gap-2">
                        <i className="fas fa-door-open"></i> DETECTOR
                    </h2>
                    <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg transition-all text-[10px] font-bold tracking-wider uppercase">
                        <FaCompress /> VOLVER
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4 md:space-y-6 custom-scrollbar">
                    <div className="bg-[#334155]/50 p-3 rounded-lg border border-gray-700">
                        <h3 className="text-[9px] md:text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Planos de Ejemplo</h3>
                        <div className="grid grid-cols-1 gap-1">
                            {EXAMPLE_PDFS.map((pdf, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => loadPdfFromUrl(pdf.url)}
                                    className="text-left text-[11px] p-2 rounded hover:bg-[#0f172a] transition-all flex items-center gap-2 truncate border border-transparent hover:border-accent-primary/30 group"
                                >
                                    <span className="text-accent-primary opacity-70 group-hover:opacity-100">📄</span>
                                    <span className="text-gray-300 group-hover:text-white truncate">{pdf.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-4 md:p-6 text-center cursor-pointer transition-all ${isDragActive ? 'border-accent-primary bg-accent-primary/10' : 'border-gray-600 hover:border-accent-primary hover:bg-[#334155]/30'}`}>
                        <input {...getInputProps()} />
                        <FaCloudUploadAlt className="text-xl md:text-2xl mx-auto mb-2 text-gray-400" />
                        <p className="text-[10px] md:text-xs text-gray-400">Clic o arrastra PDF aquí</p>
                    </div>

                    <div className="bg-[#334155]/50 p-4 rounded-lg border border-gray-700">
                        <label className="flex justify-between text-[10px] font-bold text-gray-400 mb-2 tracking-wider">
                            IA SENSIBILIDAD: <span className="text-accent-primary">{confidence}%</span>
                        </label>
                        <input
                            type="range" min="10" max="95" value={confidence}
                            onChange={(e) => setConfidence(e.target.value)}
                            className="w-full accent-accent-primary h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div>
                        <h3 className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider flex justify-between items-center">
                            Detecciones <span className="text-[10px] bg-gray-700 px-2 py-0.5 rounded-full">{zones.length}</span>
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                            {zones.map((zone, idx) => (
                                <div key={zone.id} className="bg-[#0f172a] p-2 rounded border border-gray-700 flex justify-between items-center text-[10px] md:text-xs">
                                    <span className="font-mono text-gray-300 truncate mr-1">Z#{idx + 1}</span>
                                    <span className={`px-2 py-0.5 rounded-full font-bold min-w-[30px] text-center ${zone.processing ? 'bg-indigo-500/20 text-indigo-300 animate-pulse' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                        {zone.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Canvas Area */}
            <div ref={containerRef} className="flex-1 bg-[#0f172a] relative overflow-auto flex justify-center items-start md:items-center p-4 md:p-8">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                        <div className="flex flex-col items-center">
                            <FaSpinner className="text-4xl text-accent-primary animate-spin mb-4" />
                            <p className="text-sm font-medium">Procesando Plano...</p>
                        </div>
                    </div>
                )}
                {!pdfDoc ? (
                    <div className="flex flex-col items-center justify-center h-full w-full text-gray-500 opacity-50 px-4 text-center">
                        <FaExpand className="text-4xl md:text-6xl mb-4" />
                        <p className="text-lg md:text-xl">Selecciona un plano para comenzar</p>
                        {(generalError || pdfError) && <p className="text-red-500 mt-4 text-sm font-bold">{generalError || pdfError}</p>}
                    </div>
                ) : (
                    <div className="relative inline-block touch-none select-none">
                        <canvas
                            ref={canvasRef}
                            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
                            className="shadow-2xl rounded-lg cursor-crosshair bg-white max-w-none origin-top-left"
                            style={{
                                touchAction: 'none'
                            }}
                        />
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default DoorDetectorDemo;
