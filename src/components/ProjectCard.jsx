import React, { useRef } from 'react';

const ProjectCard = ({ title, tech, desc, image, demoLink, link, github, onRunDemo, onViewCase }) => {
    const cardRef = useRef(null);

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

        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
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
            className="glass-card overflow-hidden flex flex-col relative group h-full"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Image */}
            <div className="relative h-[220px] overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-accent-primary transition-colors">{title}</h3>
                <div className="mb-4 flex flex-wrap gap-1.5">
                    {techStack.map((t, index) => (
                        <span key={index} className="text-[10px] md:text-xs text-accent-primary bg-accent-primary/10 px-2.5 py-1 rounded-[var(--radius-full)] border border-accent-primary/20 font-medium">
                            {t}
                        </span>
                    ))}
                </div>
                <p className="text-text-secondary text-sm mb-5 flex-1 line-clamp-3 leading-relaxed">{description}</p>

                {/* Actions */}
                <div className="flex flex-wrap gap-2.5 mt-auto">
                    {onRunDemo ? (
                        <button onClick={onRunDemo} className="flex-1 min-w-[120px] btn btn-primary py-2.5 px-4 text-[11px] justify-center">
                            Probar Demo <i className="fa-solid fa-play text-[9px]"></i>
                        </button>
                    ) : (demoLink || link) && (
                        <a href={demoLink || link} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[120px] btn btn-primary py-2.5 px-4 text-[11px] justify-center">
                            Ver App <i className="fa-solid fa-external-link-alt text-[9px]"></i>
                        </a>
                    )}

                    <button
                        className="flex-1 min-w-[120px] btn btn-secondary py-2.5 px-4 text-[11px] justify-center"
                        onClick={onViewCase}
                    >
                        Arquitectura <i className="fa-solid fa-network-wired text-[9px]"></i>
                    </button>
                </div>
            </div>
        </article>
    );
};

export default ProjectCard;
