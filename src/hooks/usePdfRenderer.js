import { useState, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configuración de worker para PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * Hook de renderizado de PDF ultra-estable.
 * Elimina bucles al no depender de useEffects internos para el dibujo.
 */
export const usePdfRenderer = (canvasRef) => {
    const [bgImage, setBgImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const renderTaskRef = useRef(null);
    const inProgressRef = useRef(false);

    const loadPdf = useCallback(async (source) => {
        if (!source || inProgressRef.current) return;

        inProgressRef.current = true;
        setLoading(true);
        setError(null);
        setBgImage(null);

        try {
            const loadingTask = pdfjsLib.getDocument(source);
            const pdf = await loadingTask.promise;

            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.2 });
            const canvas = canvasRef.current;

            if (!canvas) throw new Error("Canvas no montado");

            const ctx = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
            }

            const renderTask = page.render({ canvasContext: ctx, viewport });
            renderTaskRef.current = renderTask;
            await renderTask.promise;

            // Almacenar el plano como imagen estática
            const img = new Image();
            img.src = canvas.toDataURL('image/jpeg', 0.8);
            await new Promise(resolve => {
                img.onload = () => {
                    setBgImage(img);
                    resolve();
                };
            });

        } catch (err) {
            if (err.name !== 'RenderingCancelledException') {
                console.error("PDF Engine Fail:", err);
                setError(err.message);
            }
        } finally {
            setLoading(false);
            inProgressRef.current = false;
        }
    }, [canvasRef]);

    return { loadPdf, bgImage, loading, error };
};
