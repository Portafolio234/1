import React, { useRef } from 'react';

const ProjectCard = ({ title, tech, desc, image, demoLink, link, github, onRunDemo, onViewCase }) => {
    const cardRef = useRef(null);

    // Los nombres de las props han sido simplificados para mayor claridad
    const techStack = tech || [];
    const description = desc || "";

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
                <h3 className="text-xl font-bold mb-2.5 text-white group-hover:text-accent-primary transition-colors">{title}</h3>
                <div className="mb-4 flex flex-wrap gap-1.5">
                    {techStack.map((t, index) => (
                        <span key={index} className="text-[10px] md:text-xs text-accent-primary bg-accent-primary/10 px-2.5 py-1 rounded-full border border-accent-primary/20">
                            {t}
                        </span>
                    ))}
                </div>
                <p className="text-text-secondary text-sm mb-5 flex-1 line-clamp-3">{description}</p>

                <div className="flex flex-wrap gap-2.5 mt-auto">
                    {onRunDemo ? (
                        <button onClick={onRunDemo} className="flex-1 min-w-[120px] bg-gradient-to-r from-accent-primary to-accent-secondary text-bg-dark py-2 px-4 rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,243,255,0.4)]">
                            Probar Demo <i className="fas fa-play text-[10px]"></i>
                        </button>
                    ) : (demoLink || link) && (
                        <a href={demoLink || link} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[120px] bg-gradient-to-r from-accent-primary to-accent-secondary text-bg-dark py-2 px-4 rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,243,255,0.4)]">
                            Ver App <i className="fas fa-external-link-alt text-[10px]"></i>
                        </a>
                    )}

                    <button
                        className="flex-1 min-w-[120px] bg-transparent border border-accent-primary/30 text-accent-primary hover:bg-accent-primary/10 py-2 px-4 rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                        onClick={onViewCase}
                    >
                        Arquitectura <i className="fas fa-network-wired text-[10px]"></i>
                    </button>
                </div>
            </div>
        </article>
    );
};

export default ProjectCard;
