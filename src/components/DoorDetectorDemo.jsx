import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import axios from 'axios';
import { FaCloudUploadAlt, FaSpinner, FaExpand, FaCompress } from 'react-icons/fa';

// Configuración robusta del worker para Vite
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const ROBOFLOW_API_KEY = "hKrCyLFvEqmxmyVGuMfF";
const WORKFLOW_URL = "https://serverless.roboflow.com/detector-de-puertas/workflows/detect-count-and-visualize-10";

const DoorDetectorDemo = ({ onClose }) => {
    const [file, setFile] = useState(null);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // Nuevo estado para errores
    const [processing, setProcessing] = useState(false);
    const [confidence, setConfidence] = useState(50);
    const [zones, setZones] = useState([]);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const bgImageRef = useRef(null);
    const isDrawing = useRef(false);
    const startCoords = useRef({ x: 0, y: 0 });

    // Lista de PDFs de ejemplo
    const EXAMPLE_PDFS = [
        { name: "Nivel 03-04 (Torre A)", url: "/pdfs/plano_1.pdf" },
        { name: "Nivel 01-02 (Planta Baja)", url: "/pdfs/plano_2.pdf" },
        { name: "Nivel Azotea (General)", url: "/pdfs/plano_3.pdf" }
    ];

    useEffect(() => {
        // Cargar el primer PDF automáticamente al abrir
        loadPdfFromUrl(EXAMPLE_PDFS[0].url);
    }, []);

    const loadPdfFromUrl = async (url) => {
        setLoading(true);
        setError(null);
        setFile(null); // Limpiar archivo subido si existe
        try {
            const loadingTask = pdfjsLib.getDocument(url);
            const loadedPdf = await loadingTask.promise;
            setPdfDoc(loadedPdf);
            await renderPage(loadedPdf, 1);
        } catch (err) {
            console.error("Error cargando PDF desde URL:", err);
            setError(`Error cargando el plano de ejemplo: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Configuración de Dropzone
    const onDrop = async (acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        setError(null);
        if (selectedFile?.type === 'application/pdf') {
            setFile(selectedFile);
            setLoading(true);
            try {
                const arrayBuffer = await selectedFile.arrayBuffer();
                const loadedPdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                setPdfDoc(loadedPdf);
                await renderPage(loadedPdf, 1);
            } catch (err) {
                console.error("Error cargando PDF:", err);
                setError(`Error al procesar el PDF: ${err.message}. Intenta con otro archivo.`);
                setFile(null);
            } finally {
                setLoading(false);
            }
        } else {
            setError("Por favor sube un archivo PDF válido.");
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });

    const renderPage = async (pdf, pageNum) => {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        setCanvasSize({ width: viewport.width, height: viewport.height });

        await page.render({ canvasContext: ctx, viewport }).promise;

        // Guardar imagen de fondo para redibujar
        const img = new Image();
        img.src = canvas.toDataURL('image/jpeg', 0.9);
        img.onload = () => {
            bgImageRef.current = img;
            redrawCanvas([]); // Limpiar zonas al cargar nuevo PDF
            setZones([]); // Resetear zonas
        };
    };

    // Manejo de dibujo
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

        // Redibujar fondo y zonas existentes
        redrawCanvas();

        // Dibujar selección actual
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
            // Esperar a que el estado se actualice visualmente antes de procesar? 
            // En React 18 el batching podría retrasarlo, pero aquí llamamos a redrawCanvas dentro del ciclo de render o effect.
            // Para simplicidad, llamamos a analyze directamente y redibujamos.

            // Forzar redibujado inmediato con la nueva zona (aunque el estado zone sea async, podemos pasar la temp)
            redrawCanvas([...zones, newZone]);

            await analyzeZone(newZone);
        } else {
            redrawCanvas(); // Limpiar selección fallida
        }
    };

    const redrawCanvas = (currentZones = zones) => {
        const canvas = canvasRef.current;
        if (!canvas || !bgImageRef.current) return;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImageRef.current, 0, 0);

        currentZones.forEach(zone => {
            // Marco de zona
            ctx.strokeStyle = zone.processing ? '#6366f1' : '#10b981';
            ctx.lineWidth = 4;
            ctx.setLineDash(zone.processing ? [5, 5] : []);
            ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);

            // Detecciones
            if (zone.detections) {
                zone.detections.forEach(det => {
                    ctx.strokeStyle = '#f59e0b'; // Naranja para puertas
                    ctx.lineWidth = 2;
                    ctx.setLineDash([]);
                    ctx.strokeRect(zone.x + det.x, zone.y + det.y, det.width, det.height);
                });
            }
        });
    };

    // Efecto para redibujar cuando cambian las zonas (ej. cuando termina proceso)
    useEffect(() => {
        if (bgImageRef.current) redrawCanvas();
    }, [zones]);

    const analyzeZone = async (zone) => {
        // Crear recorte
        const offCanvas = document.createElement('canvas');
        offCanvas.width = zone.w;
        offCanvas.height = zone.h;
        const offCtx = offCanvas.getContext('2d');

        // Dibujar solo la parte seleccionada de la imagen original
        offCtx.drawImage(bgImageRef.current, zone.x, zone.y, zone.w, zone.h, 0, 0, zone.w, zone.h);

        const base64Image = offCanvas.toDataURL('image/jpeg', 0.8).split(',')[1];

        try {
            const response = await axios.post(WORKFLOW_URL, {
                api_key: ROBOFLOW_API_KEY,
                inputs: {
                    image: { type: "base64", value: base64Image }
                }
            });

            // Procesar respuesta recursiva similar a app.py
            const preds = findPredictions(response.data) || [];

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
            console.error("Error en análisis:", error);
            setZones(prev => prev.map(z =>
                z.id === zone.id ? { ...z, processing: false, count: "Error" } : z
            ));
        }
    };

    // Recalcular zonas cuando cambia la confianza
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

            return {
                ...zone,
                detections: validDetections,
                count: validDetections.length
            };
        }));
    }, [confidence]);



    // Función auxiliar recursiva portada de app.py
    const findPredictions = (data) => {
        if (Array.isArray(data)) {
            for (const item of data) {
                const res = findPredictions(item);
                if (res) return res;
            }
        } else if (typeof data === 'object' && data !== null) {
            if (data.predictions && Array.isArray(data.predictions)) {
                return data.predictions;
            }
            for (const key in data) {
                const res = findPredictions(data[key]);
                if (res) return res;
            }
        }
        return null;
    };

    // Bloquear scroll del body al abrir el modal
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-[#0f172a] flex flex-col md:flex-row text-white overflow-hidden">
            {/* Sidebar */}
            <div className="w-full md:w-80 bg-[#1e293b] p-6 flex flex-col gap-4 shadow-xl z-10 shrink-0 h-full overflow-hidden border-r border-gray-700">
                <div className="flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold font-heading text-accent-primary flex items-center gap-2">
                        <i className="fas fa-door-open"></i> DETECTOR
                    </h2>
                    <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg transition-all text-[10px] font-bold tracking-wider uppercase">
                        <FaCompress /> CERRAR DEMO
                    </button>
                </div>

                {/* Área Scrollable: Lista y Dropzone */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">

                    {/* Lista de Planos */}
                    <div className="bg-[#334155]/50 p-3 rounded-lg border border-gray-700">
                        <h3 className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Planos de Ejemplo</h3>
                        <div className="flex flex-col gap-1">
                            {EXAMPLE_PDFS.map((pdf, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => loadPdfFromUrl(pdf.url)}
                                    className="text-left text-xs p-2 rounded hover:bg-[#0f172a] transition-all flex items-center gap-2 truncate border border-transparent hover:border-accent-primary/30 group"
                                >
                                    <span className="text-accent-primary opacity-70 group-hover:opacity-100">📄</span>
                                    <span className="text-gray-300 group-hover:text-white">{pdf.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isDragActive ? 'border-accent-primary bg-accent-primary/10' : 'border-gray-600 hover:border-accent-primary hover:bg-[#334155]/30'}`}>
                        <input {...getInputProps()} />
                        <FaCloudUploadAlt className="text-2xl mx-auto mb-2 text-gray-400" />
                        <p className="text-xs text-gray-400">Clic o arrastra tu PDF aquí</p>
                    </div>

                    <div className="bg-[#334155]/50 p-4 rounded-lg border border-gray-700">
                        <label className="flex justify-between text-[10px] font-bold text-gray-400 mb-2 tracking-wider">
                            SENSIBILIDAD IA: <span className="text-accent-primary">{confidence}%</span>
                        </label>
                        <input
                            type="range"
                            min="10"
                            max="95"
                            value={confidence}
                            onChange={(e) => setConfidence(e.target.value)}
                            className="w-full accent-accent-primary h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider flex justify-between items-center">
                            Resultados
                            <span className="text-[10px] bg-gray-700 px-2 py-0.5 rounded-full">{zones.length}</span>
                        </h3>
                        <div className="flex flex-col gap-2">
                            {zones.map((zone, idx) => (
                                <div key={zone.id} className="bg-[#0f172a] p-2 rounded border border-gray-700 flex justify-between items-center text-xs">
                                    <span className="font-mono text-gray-300">Zona #{idx + 1}</span>
                                    <span className={`px-2 py-0.5 rounded-full font-bold min-w-[30px] text-center ${zone.processing ? 'bg-indigo-500/20 text-indigo-300 animate-pulse' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                        {zone.count}
                                    </span>
                                </div>
                            ))}
                            {zones.length === 0 && (
                                <div className="text-center py-4 border border-dashed border-gray-700 rounded text-gray-500 text-xs">
                                    Dibuja un área en el plano para iniciar
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer fijo del sidebar */}

            </div>

            {/* Main Canvas Area */}
            <div ref={containerRef} className="flex-1 bg-[#0f172a] relative overflow-auto flex justify-center p-8">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                        <div className="flex flex-col items-center">
                            <FaSpinner className="text-4xl text-accent-primary animate-spin mb-4" />
                            <p>Procesando PDF...</p>
                        </div>
                    </div>
                )}

                {!pdfDoc ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
                        <FaExpand className="text-6xl mb-4" />
                        <p className="text-xl">Selecciona un plano o sube uno</p>
                        {error && <p className="text-red-500 mt-4 text-center font-bold">{error}</p>}
                    </div>
                ) : (
                    <canvas
                        ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        className={`shadow-2xl rounded-lg cursor-crosshair bg-white max-w-none ${!pdfDoc ? 'hidden' : ''}`}
                    />
                )}
            </div>
        </div>,
        document.body
    );
};

export default DoorDetectorDemo;
