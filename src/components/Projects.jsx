import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectCard from './ProjectCard';
import Modal from './Modal';
import { useModal } from '../context/ModalContext';
import Step from './Step';
import Arrow from './Arrow';

const Projects = () => {
    const { openModal } = useModal();
    const navigate = useNavigate();

    const projects = [
        {
            title: "Reconocimiento Arquitectónico",
            desc: "Sistema de IA para la detección automatizada de puertas en planos PDF complejos.",
            tech: ["Computer Vision", "React", "Roboflow API"],
            image: "assets/images/architectural_recognition_v2.png",
            link: "#",
            github: "#",
            onRunDemo: () => navigate('/demo/detector'),
            onViewCase: () => openModal('modal-detector')
        },
        {
            title: "Enterprise RAG Solution",
            desc: "Asistente inteligente que procesa documentación técnica privada con privacidad garantizada.",
            tech: ["LangChain", "Vector DB", "Groq Cloud"],
            image: "assets/images/enterprise_rag_v2.png",
            link: "#",
            github: "#",
            onRunDemo: () => navigate('/demo/rag'),
            onViewCase: () => openModal('modal-rag')
        },
        {
            title: "AI Financial Forecaster",
            desc: "Monitor de mercados en tiempo real con chat AI contextual para análisis predictivo.",
            tech: ["Plotly.js", "Financial APIs", "Llama 3"],
            image: "assets/images/financial_forecaster_v2.png",
            link: "#",
            github: "#",
            onRunDemo: () => navigate('/demo/finance'),
            onViewCase: () => openModal('modal-finance')
        },
        {
            title: "n8n Automation Flow",
            desc: "Agente conversacional IA integrado a flujos de automatización de n8n mediante Webhooks.",
            tech: ["n8n", "Webhooks", "React"],
            image: "assets/images/n8n_demo_v2.png", // Usa una imagen genérica por defecto si no existe
            icon: "fa-bolt", // Icono alternativo visual para la tarjeta principal
            link: "#",
            github: "#",
            onRunDemo: () => navigate('/demo/n8n'),
            onViewCase: () => openModal('modal-n8n')
        }
    ];

    return (
        <section id="projects" className="py-20 px-5">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center font-heading">
                    Proyectos <span className="text-accent-primary">Destacados</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project, index) => {
                        // Si hay exactamente 4 proyectos y es el último, lo centramos en en la fila de 3 columnas (desktop)
                        const centerLastCard = projects.length === 4 && index === 3;
                        return (
                            <div key={index} className={centerLastCard ? "lg:col-start-2" : ""}>
                                <ProjectCard {...project} />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal de Caso: Detector de Puertas */}
            <Modal id="modal-detector" title="Caso: Detector de Puertas IA">
                <div className="space-y-6">
                    <p className="text-text-secondary leading-relaxed">
                        Este proyecto nació de la necesidad de automatizar el conteo de elementos en planos arquitectónicos de gran escala.
                    </p>
                    <div className="flex flex-col md:flex-row items-center gap-4 bg-bg-dark/50 p-6 rounded-xl border border-white/5">
                        <Step icon="fa-file-pdf" title="Carga PDF" desc="Se renderiza el plano en alta resolución." />
                        <Arrow />
                        <Step icon="fa-mouse-pointer" title="Selección" desc="El usuario define zonas de interés." />
                        <Arrow />
                        <Step icon="fa-microchip" title="Detección" desc="IA identifica y cuenta los elementos." />
                    </div>
                </div>
            </Modal>

            {/* Modal de Caso: Enterprise RAG */}
            <Modal id="modal-rag" title="Caso: Enterprise RAG">
                <div className="space-y-6">
                    <p className="text-text-secondary leading-relaxed">
                        Sistema diseñado para bancos y aseguradoras que necesitan consultar sus manuales internos sin exponer datos a la nube pública.
                    </p>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-center gap-3 text-accent-primary">
                            <i className="fas fa-check-circle"></i> Aislamiento total de datos sensibles.
                        </li>
                        <li className="flex items-center gap-3 text-accent-primary">
                            <i className="fas fa-check-circle"></i> Respuestas con citación de fuentes originales.
                        </li>
                    </ul>
                </div>
            </Modal>

            {/* Modal de Caso: Financial Forecaster */}
            <Modal id="modal-finance" title="Caso: Financial Forecaster">
                <div className="space-y-6">
                    <p className="text-text-secondary leading-relaxed">
                        Un dashboard interactivo que combina visualización de datos en tiempo real con inteligencia conversacional.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-bg-dark/50 rounded-lg border border-white/5 text-center">
                            <i className="fas fa-chart-line text-2xl text-accent-primary mb-2"></i>
                            <h4 className="text-xs font-bold uppercase">Predicción</h4>
                        </div>
                        <div className="p-4 bg-bg-dark/50 rounded-lg border border-white/5 text-center">
                            <i className="fas fa-robot text-2xl text-accent-primary mb-2"></i>
                            <h4 className="text-xs font-bold uppercase">Chat Contextual</h4>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Modal de Caso: n8n Automation */}
            <Modal id="modal-n8n" title="Caso: n8n Automation Flow">
                <div className="space-y-6">
                    <p className="text-text-secondary leading-relaxed">
                        Este módulo consume una automatización configurada en un servidor propio de <span className="text-accent-primary font-bold">n8n</span>. La memoria de la conversación está atada al identificador de sesión (correo) del usuario.
                    </p>
                    <div className="flex flex-col md:flex-row items-center gap-4 bg-bg-dark/50 p-6 rounded-xl border border-white/5">
                        <Step icon="fa-desktop" title="Interfaz" desc="React consume el Webhook mediante Fetch y la cookie (email)." />
                        <Arrow />
                        <Step icon="fa-bolt" title="n8n Flow" desc="Recepción del payload, enrutamiento y procesamiento por IA." />
                        <Arrow />
                        <Step icon="fa-comment" title="Output" desc="Retorno de JSON estandarizado a la Web." />
                    </div>
                </div>
            </Modal>
        </section>
    );
};

export default Projects;
