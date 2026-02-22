import { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configuración del worker de PDF.js para Vite/Vercel
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const usePdfRenderer = (canvasRef) => {
    const [pdfDoc, setPdfDoc] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const bgImageRef = useRef(null);
    const renderTaskRef = useRef(null);

    const renderPage = async (pdf, pageNum) => {
        if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
        }

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        setCanvasSize({ width: viewport.width, height: viewport.height });

        const renderTask = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = renderTask;

        try {
            await renderTask.promise;

            const img = new Image();
            img.src = canvas.toDataURL('image/jpeg', 0.9);
            await new Promise(resolve => {
                img.onload = () => {
                    bgImageRef.current = img;
                    resolve();
                };
            });
        } catch (err) {
            if (err.name === 'RenderingCancelledException') {
                console.log('Renderizado cancelado para nueva página/plano.');
            } else {
                throw err;
            }
        } finally {
            renderTaskRef.current = null;
        }
    };

    const loadPdf = async (source) => {
        setLoading(true);
        setError(null);
        try {
            const loadingTask = pdfjsLib.getDocument(source);
            const loadedPdf = await loadingTask.promise;
            setPdfDoc(loadedPdf);
            await renderPage(loadedPdf, 1);
            return loadedPdf;
        } catch (err) {
            console.error("Error cargando PDF:", err);
            setError(`Error al procesar el PDF: ${err.message}`);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { pdfDoc, loading, error, canvasSize, bgImageRef, loadPdf, renderPage };
};
