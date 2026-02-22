/**
 * RAG Engine — Motor de Retrieval-Augmented Generation en el cliente.
 * 
 * Implementa:
 *   1. Chunking con overlap
 *   2. Índice TF-IDF invertido
 *   3. Búsqueda por similitud coseno
 *   4. Extracción de texto multi-formato (PDF, TXT, CSV, JSON)
 */
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// ─── CHUNKING ───────────────────────────────────────────────
export function chunkText(text, source, chunkSize = 500, overlap = 80) {
    const chunks = [];
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (!cleaned) return chunks;

    let start = 0;
    let id = 0;
    while (start < cleaned.length) {
        const end = Math.min(start + chunkSize, cleaned.length);
        chunks.push({
            id: `${source}__${id++}`,
            text: cleaned.slice(start, end),
            source,
        });
        start += chunkSize - overlap;
    }
    return chunks;
}

// ─── TOKENIZER ──────────────────────────────────────────────
function tokenize(text) {
    return text
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar tildes
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 2);
}

// ─── TF-IDF INDEX ───────────────────────────────────────────
export function buildIndex(chunks) {
    const N = chunks.length;
    if (N === 0) return { chunks, idf: {}, tfs: [] };

    // Term frequency por chunk
    const tfs = chunks.map(chunk => {
        const tokens = tokenize(chunk.text);
        const tf = {};
        tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
        // Normalizar por longitud del documento
        const len = tokens.length || 1;
        Object.keys(tf).forEach(t => { tf[t] /= len; });
        return tf;
    });

    // Document frequency
    const df = {};
    tfs.forEach(tf => {
        Object.keys(tf).forEach(term => {
            df[term] = (df[term] || 0) + 1;
        });
    });

    // Inverse document frequency
    const idf = {};
    Object.keys(df).forEach(term => {
        idf[term] = Math.log((N + 1) / (df[term] + 1)) + 1;
    });

    return { chunks, idf, tfs };
}

// ─── BÚSQUEDA ───────────────────────────────────────────────
export function search(query, index, topK = 3) {
    if (!index || !index.chunks.length) return [];

    const { chunks, idf, tfs } = index;
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return [];

    // Vector TF-IDF del query
    const queryTf = {};
    queryTokens.forEach(t => { queryTf[t] = (queryTf[t] || 0) + 1; });
    const qLen = queryTokens.length;
    Object.keys(queryTf).forEach(t => { queryTf[t] /= qLen; });

    // Cosine similarity entre query y cada chunk
    const scores = tfs.map((chunkTf, i) => {
        let dot = 0, normQ = 0, normD = 0;

        // Union de todos los términos
        const allTerms = new Set([...Object.keys(queryTf), ...Object.keys(chunkTf)]);

        allTerms.forEach(term => {
            const qVal = (queryTf[term] || 0) * (idf[term] || 0);
            const dVal = (chunkTf[term] || 0) * (idf[term] || 0);
            dot += qVal * dVal;
            normQ += qVal * qVal;
            normD += dVal * dVal;
        });

        const denom = Math.sqrt(normQ) * Math.sqrt(normD);
        const score = denom > 0 ? dot / denom : 0;
        return { chunk: chunks[i], score };
    });

    return scores
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .filter(s => s.score > 0.01);
}

// ─── EXTRACCIÓN DE TEXTO ────────────────────────────────────
export async function extractText(file) {
    const ext = file.name.split('.').pop().toLowerCase();

    switch (ext) {
        case 'txt':
        case 'md':
            return await file.text();

        case 'csv': {
            const raw = await file.text();
            // Parseo CSV → texto legible
            const lines = raw.split('\n').filter(l => l.trim());
            if (lines.length < 2) return raw;
            const headers = lines[0].split(',').map(h => h.trim());
            return lines.slice(1).map(line => {
                const cols = line.split(',');
                return headers.map((h, i) => `${h}: ${(cols[i] || '').trim()}`).join('. ');
            }).join('\n');
        }

        case 'json': {
            const raw = await file.text();
            try {
                const obj = JSON.parse(raw);
                // Aplanar el JSON a texto legible
                return flattenJSON(obj);
            } catch {
                return raw;
            }
        }

        case 'pdf': {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const pageText = content.items.map(item => item.str).join(' ');
                fullText += pageText + '\n\n';
            }
            return fullText;
        }

        default:
            // Intentar como texto plano
            try { return await file.text(); }
            catch { return ''; }
    }
}

function flattenJSON(obj, prefix = '') {
    const lines = [];
    if (Array.isArray(obj)) {
        obj.forEach((item, i) => {
            if (typeof item === 'object' && item !== null) {
                lines.push(flattenJSON(item, `${prefix}[${i}]`));
            } else {
                lines.push(`${prefix}[${i}]: ${item}`);
            }
        });
    } else if (typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([key, val]) => {
            const path = prefix ? `${prefix}.${key}` : key;
            if (typeof val === 'object' && val !== null) {
                lines.push(flattenJSON(val, path));
            } else {
                lines.push(`${path}: ${val}`);
            }
        });
    } else {
        lines.push(`${prefix}: ${obj}`);
    }
    return lines.join('\n');
}

// ─── PROMPT BUILDER ─────────────────────────────────────────
export function buildRAGPrompt(query, results) {
    if (results.length === 0) {
        return [
            {
                role: 'system',
                content: `Eres un asistente RAG corporativo. El usuario hizo una pregunta pero NO se encontraron fragmentos relevantes en los documentos indexados. Responde amablemente que no encontraste información relevante en los documentos cargados y sugiere que reformule la pregunta o cargue documentos más específicos.`
            },
            { role: 'user', content: query }
        ];
    }

    const contextBlocks = results.map((r, i) =>
        `--- [Fuente: ${r.chunk.source}] (relevancia: ${(r.score * 100).toFixed(0)}%) ---\n${r.chunk.text}`
    ).join('\n\n');

    return [
        {
            role: 'system',
            content: `Eres un asistente RAG (Retrieval-Augmented Generation) corporativo de alta precisión.

REGLAS ESTRICTAS:
1. Responde ÚNICAMENTE con información de los fragmentos proporcionados abajo.
2. Si la respuesta no está en los fragmentos, di explícitamente: "No encontré esa información en los documentos cargados."
3. SIEMPRE cita la fuente al final de cada afirmación relevante usando el formato [Fuente: nombre_archivo].
4. Sé conciso, claro y profesional. Usa viñetas o listas cuando sea apropiado.
5. Si hay información en varios documentos, sintetiza y cita cada fuente.
6. Responde en español.

FRAGMENTOS RECUPERADOS:
${contextBlocks}`
        },
        { role: 'user', content: query }
    ];
}
