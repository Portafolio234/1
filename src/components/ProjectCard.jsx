import React, { useRef } from 'react';

const ProjectCard = ({ title, techStack, description, image, demoLink, onOpenModal, modalId, dataLink, manualText = "Ver Flujo", onRunDemo }) => {
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        const card = cardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        card.style.transition = 'transform 0.1s ease';
    };

    const handleMouseLeave = () => {
        const card = cardRef.current;
        if (!card) return;

        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        card.style.transition = 'transform 0.5s ease';
    };

    return (
        <article
            ref={cardRef}
            className="bg-[#101025]/70 border border-[#00f3ff]/10 rounded-xl overflow-hidden backdrop-blur-md flex flex-col relative group hover:border-accent-primary hover:shadow-[0_15px_35px_rgba(0,243,255,0.15)] transition-all duration-300 transform-style-3d h-full"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div className="relative h-[220px] overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                    loading="lazy"
                />
                <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-[left] duration-500 group-hover:left-full pointer-events-none"></div>
            </div>

            <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl mb-2.5 text-white group-hover:text-accent-primary transition-colors">{title}</h3>
                <p className="mb-4">
                    {techStack.map((tech, index) => (
                        <span key={index} className="text-xs text-accent-primary bg-[rgba(0,243,255,0.1)] px-2.5 py-1 rounded-full mr-1.5 mb-1.5 inline-block border border-[rgba(0,243,255,0.05)]">
                            {tech}
                        </span>
                    ))}
                </p>
                <p className="text-text-secondary text-[0.95rem] mb-5 flex-1">{description}</p>

                <div className="flex flex-wrap gap-2.5 mt-auto">
                    {demoLink ? (
                        <a href={demoLink} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary text-black bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-[0_0_25px_rgba(0,243,255,0.6)] py-2 px-4 rounded font-heading font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2">
                            Ver App <i className="fas fa-external-link-alt"></i>
                        </a>
                    ) : onRunDemo ? (
                        <button onClick={onRunDemo} className="btn btn-sm btn-primary text-black bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-[0_0_25px_rgba(0,243,255,0.6)] py-2 px-4 rounded font-heading font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2">
                            Probar Demo <i className="fas fa-play"></i>
                        </button>
                    ) : null}

                    <button
                        className="btn btn-sm btn-outline bg-transparent border border-accent-secondary text-accent-secondary hover:bg-accent-secondary hover:text-white hover:shadow-[0_0_15px_rgba(188,19,254,0.4)] py-2 px-4 rounded font-heading font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2"
                        onClick={() => onOpenModal(modalId)}
                    >
                        {manualText} <i className="fas fa-network-wired"></i>
                    </button>

                    {dataLink && (
                        <a href={dataLink} target="_blank" rel="noopener noreferrer" className="bg-transparent text-text-secondary py-[5px] px-[10px] border border-transparent hover:text-accent-primary hover:underline transition-colors flex items-center gap-2 text-sm">
                            Datos <i className="fas fa-table"></i>
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
};

export default ProjectCard;
