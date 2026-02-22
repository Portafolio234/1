import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useDropzone } from 'react-dropzone';
import Step from './Step';
import Arrow from './Arrow';
import { chunkText, buildIndex, search, extractText, buildRAGPrompt } from '../utils/ragEngine';

// ─── CONTENIDO DEMO: Empresa ficticia TechFlow ──────────────
const DEMO_DOCS = [
    {
        name: 'Manual_Usuario_v3.pdf',
        type: 'PDF',
        content: `Manual de Usuario — TechFlow Platform v3.2

Capítulo 1: Introducción
TechFlow es una plataforma de gestión empresarial todo-en-uno diseñada para empresas medianas y grandes. Fundada en 2019 por el equipo de ingeniería de Monterrey, México, TechFlow procesa más de 2 millones de transacciones diarias para más de 500 empresas activas en Latinoamérica.

Capítulo 2: Autenticación y Seguridad
El sistema soporta autenticación Multi-Factor (MFA) obligatoria para cuentas administrativas. Los métodos disponibles son: TOTP (Google Authenticator), SMS verificado, YubiKey hardware, y biometría facial. Las sesiones expiran automáticamente después de 30 minutos de inactividad. Todos los datos en tránsito están cifrados con TLS 1.3 y los datos en reposo con AES-256-GCM.

Capítulo 3: Módulo de Reportes
El generador de reportes permite crear dashboards personalizados con más de 50 widgets predefinidos. Los reportes se exportan en PDF, Excel y CSV. El motor de reportes procesa hasta 10 millones de filas en menos de 3 segundos gracias a la tecnología de columnar storage con Apache Parquet. Los reportes programados se envían automáticamente por correo electrónico en horarios configurables.

Capítulo 4: API e Integraciones
TechFlow expone una API REST v2 con más de 200 endpoints documentados en Swagger. Rate limit: 1000 req/min para plan Enterprise, 100 req/min para plan Starter. Integraciones nativas: SAP, Salesforce, HubSpot, QuickBooks, Stripe, MercadoPago. Webhooks disponibles para 45 eventos del sistema.

Capítulo 5: Soporte
Horario de soporte técnico: Lunes a Viernes 8:00-20:00 CST. Plan Enterprise incluye SLA de 99.95% con tiempo de respuesta garantizado de 15 minutos para incidentes críticos (P1). El equipo de soporte cuenta con 34 ingenieros certificados distribuidos en 3 centros de operación.`
    },
    {
        name: 'Arquitectura_Sistema.pdf',
        type: 'PDF',
        content: `Documento de Arquitectura — TechFlow Infrastructure

1. Visión General
La infraestructura de TechFlow opera sobre un modelo multi-cloud híbrido desplegado en AWS (us-east-1, sa-east-1) y GCP (southamerica-east1). El tráfico se distribuye mediante un Global Load Balancer con failover automático inferior a 500ms.

2. Backend
El core del sistema ejecuta microservicios en Kubernetes (EKS) con auto-scaling basado en métricas de CPU y memoria. Stack tecnológico: Node.js 20 LTS para servicios de API, Go 1.21 para procesamiento de eventos de alta frecuencia, Python 3.12 para los pipelines de Machine Learning. La comunicación inter-servicios usa gRPC con Protocol Buffers v3.

3. Base de Datos
Base de datos primaria: PostgreSQL 16 con replicación síncrona multi-región y particionamiento por rango temporal. Cache distribuido: Redis Cluster 7.2 con 128GB de capacidad. Búsqueda full-text: Elasticsearch 8.11 con índices optimizados para búsqueda en español. Data warehouse: Snowflake para analytics pesado con retención de 7 años.

4. Seguridad de Infraestructura
Todo el perímetro está protegido por WAF de Cloudflare Enterprise con reglas personalizadas. Los secretos se gestionan mediante HashiCorp Vault con rotación automática cada 90 días. Auditoría completa de acceso con retención de logs de 5 años en formato WORM (Write Once Read Many). Certificación SOC2 Tipo II vigente y en proceso de ISO 27001.

5. Monitoreo
Stack de observabilidad: Datadog para métricas de infraestructura, Grafana + Loki para logs centralizados, Jaeger para distributed tracing. Alertas configuradas en PagerDuty con escalamiento automático. SLO interno: latencia p99 menor a 200ms para endpoints críticos.`
    },
    {
        name: 'Politica_Privacidad_2024.pdf',
        type: 'PDF',
        content: `Política de Privacidad — TechFlow (Actualización Enero 2024)

1. Datos Recopilados
TechFlow recopila los siguientes datos personales: nombre completo, correo electrónico corporativo, número de teléfono laboral, dirección IP de acceso, información de navegador y dispositivo, y datos de uso dentro de la plataforma. NO se recopilan datos biométricos, información financiera personal, ni datos de salud.

2. Uso de la Información
Los datos se utilizan exclusivamente para: autenticación y control de acceso, personalización de la experiencia del usuario, generación de analytics de uso agregados (nunca individuales), comunicaciones de servicio y actualizaciones críticas, y cumplimiento de obligaciones legales.

3. Almacenamiento y Retención
Todos los datos personales se almacenan en data centers certificados ubicados en São Paulo, Brasil y Virginia, Estados Unidos. La retención máxima es de 3 años después de la terminación de la cuenta. Los clientes pueden solicitar la eliminación anticipada mediante un formulario en el portal de privacidad.

4. Transferencias Internacionales
Las transferencias de datos fuera de Latinoamérica se realizan bajo Cláusulas Contractuales Estándar (SCC) aprobadas. TechFlow está adherido al Privacy Shield Framework para transferencias a Estados Unidos. Los sub-procesadores autorizados se listan públicamente en techflow.io/subprocessors.

5. Derechos del Usuario
Los usuarios tienen derecho a: acceder a sus datos personales, rectificar información incorrecta, solicitar eliminación completa (derecho al olvido), portabilidad de datos en formato JSON/CSV, y oposición al procesamiento. El DPO (Data Protection Officer) puede ser contactado en dpo@techflow.io con tiempo de respuesta de 48 horas hábiles.

6. Cumplimiento
TechFlow cumple con: LGPD (Brasil), RGPD (Unión Europea), LFPDPPP (México), y CCPA (California). Auditorías externas de privacidad se realizan semestralmente por Deloitte.`
    },
    {
        name: 'Especificaciones_Tecnicas.docx',
        type: 'DOCX',
        content: `Especificaciones Técnicas — TechFlow SDK & API

1. SDK Disponibles
TechFlow ofrece SDKs oficiales para: JavaScript/TypeScript (npm: @techflow/sdk v4.2.1), Python (pip: techflow-sdk v3.8.0), Java (Maven: com.techflow:sdk:2.5.3), Go (go get: github.com/techflow/sdk-go v1.3.0), y Swift (SPM: TechFlowSDK v1.1.0).

2. Límites del Sistema
Tamaño máximo de archivo: 100MB por upload individual, 1GB por batch upload. Usuarios concurrentes soportados: 50,000 por instancia Enterprise, 5,000 por instancia Starter. Tamaño máximo de payload API: 10MB. Tiempo máximo de ejecución de webhook: 30 segundos. Máximo de campos personalizados por entidad: 200. Profundidad máxima de anidamiento en queries: 5 niveles.

3. Rendimiento Garantizado
Latencia de lectura promedio: 45ms (p50), 120ms (p95), 200ms (p99). Throughput de escritura: 15,000 operaciones/segundo por shard. Tiempo de indexación para búsqueda full-text: menor a 500ms para documentos de hasta 1MB. Disponibilidad garantizada: 99.95% mensual (Enterprise), 99.9% mensual (Starter).

4. Webhooks y Eventos
Eventos disponibles: user.created, user.updated, user.deleted, document.uploaded, document.processed, report.generated, alert.triggered, workflow.completed, invoice.paid, subscription.changed, entre otros 35 eventos adicionales. Formato de payload: JSON con firma HMAC-SHA256. Reintentos automáticos: 3 intentos con backoff exponencial (1s, 5s, 30s).

5. Requisitos de Integración
Versión mínima de TLS: 1.2 (recomendado 1.3). Formatos de respuesta API: JSON (default), Protocol Buffers (opt-in). Autenticación API: Bearer token (JWT) con expiración de 1 hora, refresh token con expiración de 30 días. Headers requeridos: X-TechFlow-Version, Authorization, Content-Type.`
    }
];

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────
const EnterpriseRAG = ({ onClose }) => {
    // Estado principal
    const [mode, setMode] = useState(null); // null | 'demo' | 'upload'
    const [documents, setDocuments] = useState([]);
    const [editingDoc, setEditingDoc] = useState(null);
    const [editContent, setEditContent] = useState('');

    // Chat
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showArchitecture, setShowArchitecture] = useState(false);
    const chatEndRef = useRef(null);

    // RAG Index
    const [ragIndex, setRagIndex] = useState(null);
    const [indexing, setIndexing] = useState(false);
    const [lastResults, setLastResults] = useState([]);

    // ─── INDEXACIÓN ──────────────────────────────────
    const indexDocuments = useCallback((docs) => {
        setIndexing(true);
        const allChunks = docs.flatMap(doc => chunkText(doc.content, doc.name));
        const idx = buildIndex(allChunks);
        setRagIndex(idx);
        setIndexing(false);
        return idx;
    }, []);

    // ─── MODO DEMO ───────────────────────────────────
    const startDemo = useCallback(() => {
        setMode('demo');
        const docs = DEMO_DOCS.map((d, i) => ({ ...d, id: i }));
        setDocuments(docs);
        indexDocuments(docs);
    }, [indexDocuments]);

    // ─── MODO UPLOAD ─────────────────────────────────
    const startUpload = useCallback(() => {
        setMode('upload');
        setDocuments([]);
    }, []);

    // ─── UPLOAD DE ARCHIVOS ──────────────────────────
    const onDrop = useCallback(async (acceptedFiles) => {
        setIndexing(true);
        const newDocs = [];

        for (const file of acceptedFiles) {
            try {
                const text = await extractText(file);
                if (text.trim()) {
                    newDocs.push({
                        id: Date.now() + Math.random(),
                        name: file.name,
                        type: file.name.split('.').pop().toUpperCase(),
                        size: (file.size / 1024).toFixed(0) + 'KB',
                        content: text
                    });
                }
            } catch (err) {
                console.error(`Error extrayendo ${file.name}:`, err);
            }
        }

        setDocuments(prev => {
            const updated = [...prev, ...newDocs];
            indexDocuments(updated);
            return updated;
        });
    }, [indexDocuments]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt', '.md'],
            'text/csv': ['.csv'],
            'application/json': ['.json']
        }
    });

    // ─── EDICIÓN DE DOC DEMO ─────────────────────────
    const saveEdit = useCallback(() => {
        if (editingDoc === null) return;
        setDocuments(prev => {
            const updated = prev.map(d => d.id === editingDoc ? { ...d, content: editContent } : d);
            indexDocuments(updated);
            return updated;
        });
        setEditingDoc(null);
        setEditContent('');
    }, [editingDoc, editContent, indexDocuments]);

    // ─── CHAT + RAG ─────────────────────────────────
    const scrollToBottom = useCallback(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

    const handleSend = useCallback(async (e) => {
        e.preventDefault();
        const trimInput = input.trim();
        if (!trimInput || loading || !ragIndex) return;

        const userMsg = { role: 'user', content: trimInput };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // 1. Búsqueda RAG
            const results = search(trimInput, ragIndex, 3);
            setLastResults(results);

            // 2. Construir prompt con contexto
            const ragMessages = buildRAGPrompt(trimInput, results);

            // 3. Llamar al LLM
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: ragMessages })
            });

            if (!response.ok) throw new Error('Error en el servicio');

            const data = await response.json();
            const aiContent = data.choices[0].message.content;

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: aiContent,
                sources: results.map(r => ({ name: r.chunk.source, score: r.score }))
            }]);
        } catch (error) {
            console.error("RAG Error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Error al procesar la consulta. Verifica que el servidor esté activo."
            }]);
        } finally {
            setLoading(false);
        }
    }, [input, loading, ragIndex]);

    // ─── PANTALLA DE SELECCIÓN DE MODO ───────────────
    if (mode === null) {
        return createPortal(
            <div className="fixed inset-0 z-[1000] bg-bg-dark flex items-center justify-center text-white overflow-auto">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-xl text-text-secondary hover:text-white transition-all z-50">
                    <i className="fa-solid fa-xmark text-lg"></i>
                </button>

                <div className="max-w-4xl w-full px-6 py-12 animate-fadeIn">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-3 bg-accent-primary/10 border border-accent-primary/20 px-5 py-2 rounded-full mb-8">
                            <span className="w-2 h-2 bg-accent-primary rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black text-accent-primary uppercase tracking-[0.3em]">Sistema RAG Operativo</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-4 font-heading">Enterprise <span className="text-accent-primary">RAG</span></h1>
                        <p className="text-text-secondary text-sm max-w-xl mx-auto leading-relaxed">
                            Motor de Retrieval-Augmented Generation. Indexa documentos, busca fragmentos relevantes con TF-IDF y genera respuestas precisas con cita de fuentes.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Demo Mode */}
                        <button onClick={startDemo} className="group p-8 bg-white/[0.03] border border-white/10 rounded-[var(--radius-xl)] text-left hover:border-accent-primary/40 hover:bg-accent-primary/5 transition-all duration-500 active:scale-[0.98]">
                            <div className="w-14 h-14 bg-accent-primary/10 rounded-[var(--radius-lg)] flex items-center justify-center mb-6 group-hover:bg-accent-primary/20 transition-all group-hover:scale-110">
                                <i className="fa-solid fa-database text-accent-primary text-xl"></i>
                            </div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-accent-primary transition-colors">Base de Datos Demo</h3>
                            <p className="text-sm text-text-secondary leading-relaxed mb-6">
                                4 documentos corporativos de TechFlow pre-cargados. Puedes editarlos en tiempo real y ver cómo el RAG responde con la información actualizada.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {['PDF', 'DOCX', 'Editable', 'Pre-indexado'].map(tag => (
                                    <span key={tag} className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 bg-white/5 rounded-md text-text-muted">{tag}</span>
                                ))}
                            </div>
                        </button>

                        {/* Upload Mode */}
                        <button onClick={startUpload} className="group p-8 bg-white/[0.03] border border-white/10 rounded-[var(--radius-xl)] text-left hover:border-accent-secondary/40 hover:bg-accent-secondary/5 transition-all duration-500 active:scale-[0.98]">
                            <div className="w-14 h-14 bg-accent-secondary/10 rounded-[var(--radius-lg)] flex items-center justify-center mb-6 group-hover:bg-accent-secondary/20 transition-all group-hover:scale-110">
                                <i className="fa-solid fa-cloud-arrow-up text-accent-secondary text-xl"></i>
                            </div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-accent-secondary transition-colors">Subir mis Archivos</h3>
                            <p className="text-sm text-text-secondary leading-relaxed mb-6">
                                Carga tus propios documentos. El motor extrae el texto, indexa los fragmentos y te permite hacer preguntas basadas en tu contenido real.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {['PDF', 'TXT', 'CSV', 'JSON', 'Markdown'].map(tag => (
                                    <span key={tag} className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 bg-white/5 rounded-md text-text-muted">{tag}</span>
                                ))}
                            </div>
                        </button>
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                            <i className="fa-solid fa-lock mr-2 text-accent-primary/40"></i>
                            Todo el procesamiento ocurre en tu navegador. Ningún documento se envía a servidores externos.
                        </p>
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    // ─── PREGUNTAS SUGERIDAS ─────────────────────────
    const suggestedQuestions = mode === 'demo'
        ? ['¿Qué métodos de autenticación soporta TechFlow?', '¿Cuál es el SLA del plan Enterprise?', '¿Dónde se almacenan los datos personales?', '¿Qué SDKs están disponibles?']
        : ['Resumen general del documento', '¿Cuáles son los puntos principales?'];

    // ─── RENDER CHAT + SIDEBAR ───────────────────────
    return createPortal(
        <div className="fixed inset-0 z-[1000] bg-bg-dark text-white flex flex-col md:flex-row overflow-hidden font-body">

            {/* ── SIDEBAR ── */}
            <aside className="w-full md:w-[360px] bg-bg-elevated border-r border-white/5 flex flex-col shrink-0 h-[45vh] md:h-full">
                {/* Header */}
                <div className="p-5 border-b border-white/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-accent-primary/10 rounded-[var(--radius-sm)] flex items-center justify-center">
                            <i className="fa-solid fa-brain text-accent-primary text-sm"></i>
                        </div>
                        <div>
                            <h2 className="text-sm font-black tracking-tight font-heading">Enterprise RAG</h2>
                            <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-pulse"></span>
                                {mode === 'demo' ? 'Modo Demo' : 'Mis Archivos'} — {documents.length} docs
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => { setMode(null); setMessages([]); setDocuments([]); setRagIndex(null); }} className="text-[9px] text-text-muted hover:text-accent-primary font-bold uppercase tracking-wider transition-colors">
                            <i className="fa-solid fa-arrow-left mr-1"></i> Modos
                        </button>
                        <button onClick={onClose} className="p-1.5 bg-red-500/10 text-red-400 rounded-[var(--radius-sm)] hover:bg-red-500/20 transition-all md:block hidden">
                            <i className="fa-solid fa-xmark text-xs"></i>
                        </button>
                    </div>
                </div>

                {/* Document List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {/* Upload zone (Upload mode) */}
                    {mode === 'upload' && (
                        <div {...getRootProps()} className={`p-5 border-2 border-dashed rounded-[var(--radius-lg)] text-center cursor-pointer transition-all ${isDragActive ? 'border-accent-secondary bg-accent-secondary/10' : 'border-white/10 hover:border-accent-secondary/30'}`}>
                            <input {...getInputProps()} />
                            <i className={`fa-solid fa-cloud-arrow-up text-2xl mb-2 ${isDragActive ? 'text-accent-secondary animate-bounce' : 'text-text-muted'}`}></i>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                {isDragActive ? 'Suelta aquí' : 'Arrastra archivos o haz clic'}
                            </p>
                            <p className="text-[9px] text-text-muted mt-1">PDF, TXT, CSV, JSON, MD</p>
                        </div>
                    )}

                    {/* Index status */}
                    {indexing && (
                        <div className="flex items-center gap-3 p-3 bg-accent-primary/5 border border-accent-primary/10 rounded-[var(--radius-md)] animate-pulse">
                            <div className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] font-bold text-accent-primary">Indexando documentos...</span>
                        </div>
                    )}

                    {ragIndex && !indexing && (
                        <div className="flex items-center gap-3 p-3 bg-accent-primary/5 border border-accent-primary/10 rounded-[var(--radius-md)]">
                            <i className="fa-solid fa-check-circle text-accent-primary text-sm"></i>
                            <span className="text-[10px] font-bold text-accent-primary">{ragIndex.chunks.length} fragmentos indexados</span>
                        </div>
                    )}

                    {/* Documents */}
                    <div className="space-y-2">
                        {documents.map(doc => (
                            <div key={doc.id} className="group bg-white/[0.03] border border-white/5 rounded-[var(--radius-md)] p-3 hover:border-accent-primary/20 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 ${doc.type === 'PDF' ? 'bg-red-500/10 text-red-400' : doc.type === 'CSV' ? 'bg-accent-primary/10 text-accent-primary' : doc.type === 'JSON' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-accent-secondary/10 text-accent-secondary'}`}>
                                            <i className={`fa-solid text-[10px] ${doc.type === 'PDF' ? 'fa-file-pdf' : doc.type === 'CSV' ? 'fa-file-csv' : doc.type === 'JSON' ? 'fa-file-code' : 'fa-file-lines'}`}></i>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-bold truncate">{doc.name}</p>
                                            <p className="text-[9px] text-text-muted">{doc.content.length} chars • {doc.type}</p>
                                        </div>
                                    </div>
                                    {mode === 'demo' && (
                                        <button
                                            onClick={() => { setEditingDoc(doc.id); setEditContent(doc.content); }}
                                            className="text-[9px] text-text-muted hover:text-accent-primary font-bold uppercase opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                    )}
                                    {mode === 'upload' && (
                                        <button
                                            onClick={() => {
                                                setDocuments(prev => {
                                                    const updated = prev.filter(d => d.id !== doc.id);
                                                    if (updated.length > 0) indexDocuments(updated);
                                                    else setRagIndex(null);
                                                    return updated;
                                                });
                                            }}
                                            className="text-[9px] text-text-muted hover:text-red-400 font-bold opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Retrieval Results */}
                    {lastResults.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-3">
                                <i className="fa-solid fa-magnifying-glass mr-1"></i> Últimos fragmentos recuperados
                            </p>
                            {lastResults.map((r, i) => (
                                <div key={i} className="mb-2 p-3 bg-accent-primary/5 border border-accent-primary/10 rounded-[var(--radius-md)]">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] font-bold text-accent-primary truncate">{r.chunk.source}</span>
                                        <span className="text-[8px] font-bold text-text-muted shrink-0 ml-2">{(r.score * 100).toFixed(0)}%</span>
                                    </div>
                                    <p className="text-[9px] text-text-secondary leading-relaxed line-clamp-3">{r.chunk.text.slice(0, 150)}...</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mobile close */}
                <div className="p-3 border-t border-white/5 md:hidden shrink-0">
                    <button onClick={onClose} className="w-full py-2 bg-red-500/10 text-red-400 rounded-[var(--radius-md)] text-xs font-bold">Cerrar</button>
                </div>
            </aside>

            {/* ── MAIN AREA ── */}
            <main className="flex-1 flex flex-col bg-bg-dark overflow-hidden">
                {/* Edit Modal */}
                {editingDoc !== null && (
                    <div className="absolute inset-0 z-[200] bg-black/80 backdrop-blur-lg flex items-center justify-center p-4 md:p-8">
                        <div className="bg-bg-elevated rounded-[var(--radius-xl)] border border-white/10 w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl">
                            <div className="p-5 border-b border-white/5 flex justify-between items-center shrink-0">
                                <div>
                                    <h3 className="font-bold text-sm">Editar Documento</h3>
                                    <p className="text-[9px] text-text-muted mt-1">Los cambios se re-indexarán automáticamente</p>
                                </div>
                                <button onClick={() => setEditingDoc(null)} className="text-text-muted hover:text-white"><i className="fa-solid fa-xmark"></i></button>
                            </div>
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="flex-1 p-6 bg-transparent text-sm leading-relaxed resize-none focus:outline-none text-text-secondary custom-scrollbar font-mono"
                                style={{ minHeight: '300px' }}
                            />
                            <div className="p-4 border-t border-white/5 flex justify-end gap-3 shrink-0">
                                <button onClick={() => setEditingDoc(null)} className="px-4 py-2 text-[10px] font-bold text-text-muted hover:text-white transition-colors">Cancelar</button>
                                <button onClick={saveEdit} className="btn btn-primary px-5 py-2 text-[10px] rounded-[var(--radius-md)] active:scale-95">
                                    <i className="fa-solid fa-check mr-1"></i> Guardar y Re-indexar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Architecture Toggle */}
                <div className="hidden md:flex items-center justify-between p-4 border-b border-white/5 shrink-0">
                    <button onClick={() => setShowArchitecture(!showArchitecture)} className="text-[10px] font-bold text-text-muted hover:text-accent-primary transition-colors uppercase tracking-widest">
                        <i className={`fa-solid ${showArchitecture ? 'fa-comments' : 'fa-sitemap'} mr-2`}></i>
                        {showArchitecture ? 'Volver al chat' : 'Ver Arquitectura RAG'}
                    </button>
                    <button onClick={onClose} className="p-2 bg-red-500/10 text-red-400 rounded-[var(--radius-sm)] hover:bg-red-500/20 transition-all">
                        <i className="fa-solid fa-xmark text-xs"></i>
                    </button>
                </div>

                {showArchitecture ? (
                    /* Architecture View */
                    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fadeIn overflow-y-auto custom-scrollbar">
                        <h3 className="text-xs font-black text-accent-primary uppercase tracking-[0.3em] mb-12 font-heading">Pipeline RAG en Tiempo Real</h3>
                        <div className="flex flex-col md:flex-row items-center gap-8 justify-center p-12 glass-card rounded-[var(--radius-xl)] border border-white/5">
                            <Step icon="fa-file-medical" title="Ingesta" desc="PDF / TXT / CSV / JSON" />
                            <Arrow />
                            <Step icon="fa-scissors" title="Chunking" desc="500 chars + overlap" />
                            <Arrow />
                            <Step icon="fa-magnifying-glass-chart" title="TF-IDF Index" desc="Búsqueda Semántica" />
                            <Arrow />
                            <Step icon="fa-brain" title="Groq LLM" desc="Llama 3.3 70B" />
                        </div>
                        <div className="mt-12 p-6 bg-accent-primary/5 border border-accent-primary/10 rounded-[var(--radius-lg)] max-w-2xl w-full">
                            <h4 className="text-accent-primary font-bold text-xs flex items-center gap-2 mb-3">
                                <i className="fa-solid fa-shield-halved"></i> Procesamiento Local
                            </h4>
                            <p className="text-text-secondary text-[11px] leading-relaxed">
                                Todo el chunking e indexación ocurre en tu navegador. Solo la pregunta + fragmentos relevantes se envían al LLM. Tus documentos nunca se almacenan en servidores externos.
                            </p>
                        </div>
                    </div>
                ) : (
                    /* Chat View */
                    <>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="w-20 h-20 bg-white/[0.03] rounded-[var(--radius-xl)] flex items-center justify-center mb-8 border border-white/5">
                                        <i className="fa-solid fa-comments text-3xl text-text-muted"></i>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-white/80">
                                        {documents.length > 0 ? '¿Qué necesitas saber?' : 'Carga documentos para comenzar'}
                                    </h3>
                                    <p className="text-xs text-text-muted max-w-md mb-8">
                                        {documents.length > 0
                                            ? `He indexado ${ragIndex?.chunks.length || 0} fragmentos de ${documents.length} documentos. Pregúntame lo que quieras.`
                                            : 'Sube archivos desde el panel lateral para empezar a hacer preguntas.'
                                        }
                                    </p>
                                    {documents.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
                                            {suggestedQuestions.map(q => (
                                                <button key={q} onClick={() => setInput(q)} className="text-left text-[11px] p-3 rounded-[var(--radius-md)] bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-accent-primary/20 text-text-muted hover:text-white transition-all truncate">
                                                    <i className="fa-solid fa-arrow-right text-accent-primary mr-2 text-[8px]"></i>{q}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideIn`}>
                                    <div className={`max-w-[80%] rounded-[var(--radius-lg)] p-4 ${msg.role === 'user'
                                        ? 'bg-accent-primary/10 border border-accent-primary/20'
                                        : 'bg-white/[0.03] border border-white/5'
                                        }`}>
                                        <p className="text-xs leading-relaxed whitespace-pre-wrap text-white/80">{msg.content}</p>
                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                                                {msg.sources.map((s, j) => (
                                                    <span key={j} className="text-[8px] font-bold text-accent-primary/60 bg-accent-primary/5 px-2 py-1 rounded-md">
                                                        <i className="fa-solid fa-file mr-1"></i>{s.name} ({(s.score * 100).toFixed(0)}%)
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex justify-start animate-slideIn">
                                    <div className="bg-white/[0.03] border border-white/5 p-4 rounded-[var(--radius-lg)] flex items-center gap-3">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-accent-primary rounded-full animate-bounce"></span>
                                            <span className="w-2 h-2 bg-accent-primary rounded-full animate-bounce [animation-delay:0.15s]"></span>
                                            <span className="w-2 h-2 bg-accent-primary rounded-full animate-bounce [animation-delay:0.3s]"></span>
                                        </div>
                                        <span className="text-[9px] text-text-muted font-bold">Buscando en {ragIndex?.chunks.length} fragmentos...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 border-t border-white/5 shrink-0 bg-bg-elevated">
                            <div className="relative max-w-3xl mx-auto">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={documents.length > 0 ? "Pregunta sobre tus documentos..." : "Sube documentos primero..."}
                                    disabled={!ragIndex}
                                    className="w-full bg-white/5 border border-white/10 rounded-[var(--radius-lg)] py-3.5 pl-5 pr-14 text-sm focus:outline-none focus:border-accent-primary/40 transition-all disabled:opacity-30 placeholder:text-text-muted"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !ragIndex}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-accent-primary to-accent-secondary text-bg-dark rounded-[var(--radius-md)] flex items-center justify-center hover:shadow-glow-primary transition-all disabled:opacity-30 active:scale-90"
                                >
                                    <i className="fa-solid fa-arrow-up font-bold text-sm"></i>
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </main>
        </div>,
        document.body
    );
};

export default EnterpriseRAG;
