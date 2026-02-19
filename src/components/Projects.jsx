import React, { useState } from 'react';
import ProjectCard from './ProjectCard';
import Modal from './Modal';
import { useModal } from '../context/ModalContext';
import DoorDetectorDemo from './DoorDetectorDemo';
import EnterpriseRAG from './EnterpriseRAG';
import FinancialForecaster from './FinancialForecaster';

const Projects = () => {
    const { openModal } = useModal();
    const [showDemo, setShowDemo] = useState(false);
    const [showRAGDemo, setShowRAGDemo] = useState(false);
    const [showFinanceDemo, setShowFinanceDemo] = useState(false);

    const projects = [
        {
            title: "Reconocimiento Arquitectónico",
            techStack: ["Python", "Roboflow", "Computer Vision"],
            description: "Sistema inteligente para conteo automatizado de objetos en planos arquitectónicos.",
            image: "assets/images/architectural_recognition_v2.png",
            demoLink: null,
            modalId: "modal-roboflow",
            manualText: "Ver Flujo",
            dataLink: null,
            onRunDemo: () => setShowDemo(true)
        },
        {
            title: "Enterprise RAG (Live Data)",
            techStack: ["Gemini API", "Google Sheets", "LlamaIndex"],
            description: "IA conectada a datos corporativos en tiempo real. Automatiza el análisis de inventario y costos para optimizar la toma de decisiones y reducir fricciones operativas.",
            image: "assets/images/enterprise_rag_v2.png",
            demoLink: null,
            modalId: "modal-rag",
            manualText: "Manual",
            dataLink: "https://docs.google.com/spreadsheets/d/1nctKaZw4TjGsPqwgX05mOZEniBA3zQGQfBqeDe1E0Kg/edit?usp=sharing",
            onRunDemo: () => setShowRAGDemo(true)
        },
        {
            title: "AI Financial Forecaster",
            techStack: ["Llama 3.3", "Yahoo Finance", "Plotly"],
            description: "Plataforma de visualización financiera con predicciones de IA. Diseñada para transformar datos crudos del mercado en insights estratégicos accionables.",
            image: "assets/images/financial_forecaster_v2.png",
            demoLink: null,
            modalId: "modal-finance",
            manualText: "Arquitectura",
            dataLink: null,
            onRunDemo: () => setShowFinanceDemo(true)
        }
    ];

    return (
        <section id="projects" className="py-24 px-[10%] relative z-10">
            <h2 className="text-4xl text-center mb-16 relative inline-block left-1/2 -translate-x-1/2 font-heading">
                Proyectos Destacados
                <span className="absolute -bottom-4 left-1/4 w-1/2 h-[3px] bg-gradient-to-r from-transparent via-accent-secondary to-transparent"></span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {projects.map((project, index) => (
                    <ProjectCard
                        key={index}
                        {...project}
                        onOpenModal={openModal}
                    />
                ))}
            </div>

            {/* Modals Content */}
            <Modal id="modal-roboflow" title="Flujo de Reconocimiento Arquitectónico">
                <div className="flex flex-wrap justify-between gap-5 mt-8 items-center">
                    <Step icon="fa-file-upload" title="1. Input" desc="El usuario sube un plano arquitectónico (PDF/Imagen)." />
                    <Arrow />
                    <Step icon="fa-brain" title="2. Procesamiento AI" desc="El modelo Roboflow analiza la estructura visual." />
                    <Arrow />
                    <Step icon="fa-search-location" title="3. Detección" desc="Identificación y conteo de puertas y elementos clave." />
                    <Arrow />
                    <Step icon="fa-chart-bar" title="4. Output" desc="Visualización de resultados y reporte descargable." />
                </div>
            </Modal>

            <Modal id="modal-rag" title="Guía de Prueba: RAG Multifuente">
                <div className="flex flex-wrap justify-between gap-5 mt-8 items-center">
                    <Step icon="fa-edit" title="1. Modifica" desc="Abre la Google Sheet y cambia un valor (ej. el Stock de una GPU)." />
                    <Arrow />
                    <Step icon="fa-sync" title="2. Sincroniza" desc="El sistema jala el CSV actualizado al instante mediante la API." />
                    <Arrow />
                    <Step icon="fa-comments" title="3. Pregunta" desc="Haz consultas complejas en el chat sobre costos o stock." />
                    <Arrow />
                    <Step icon="fa-shield-alt" title="4. Verifica" desc="La IA citará la celda o el documento exacto de donde sacó la info." />
                </div>
            </Modal>

            <Modal id="modal-finance" title="Flujo de Predicción Financiera">
                <div className="flex flex-wrap justify-between gap-5 mt-8 items-center">
                    <Step icon="fa-satellite-dish" title="1. Ingesta" desc={<span>Extracción de datos OHLC en tiempo real vía <strong>Yahoo Finance API</strong>.</span>} />
                    <Arrow />
                    <Step icon="fa-chart-line" title="2. Visualización" desc={<span>Renderizado de velas japonesas interactivas con <strong>Plotly</strong>.</span>} />
                    <Arrow />
                    <Step icon="fa-brain" title="3. Inferencia" desc={<span><strong>Llama 3.3</strong> analiza la volatilidad y predice la tendencia.</span>} />
                </div>
            </Modal>

            {/* Demo Fullscreen Component */}
            {showDemo && (
                <DoorDetectorDemo onClose={() => setShowDemo(false)} />
            )}

            {showRAGDemo && (
                <EnterpriseRAG onClose={() => setShowRAGDemo(false)} />
            )}

            {showFinanceDemo && (
                <FinancialForecaster onClose={() => setShowFinanceDemo(false)} />
            )}
        </section>
    );
};

const Step = ({ icon, title, desc }) => (
    <div className="flex-1 min-w-[140px] text-center">
        <div className="text-3xl text-accent-primary mb-4 bg-[rgba(0,243,255,0.1)] w-[70px] h-[70px] rounded-full flex items-center justify-center mx-auto border border-[rgba(0,243,255,0.3)]">
            <i className={`fas ${icon}`}></i>
        </div>
        <h4 className="font-heading mb-2">{title}</h4>
        <p className="text-text-secondary text-sm">{desc}</p>
    </div>
);

const Arrow = () => (
    <div className="text-text-secondary text-2xl rotate-90 md:rotate-0 my-2 md:my-0">
        <i className="fas fa-chevron-right"></i>
    </div>
);

export default Projects;
