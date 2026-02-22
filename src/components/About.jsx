import React from 'react';

const About = () => {
    return (
        <section className="w-full relative z-10 flex justify-center py-12 px-4">
            <div className="glass-card max-w-4xl w-full p-8 md:p-12 relative overflow-hidden group">
                {/* Neon Glow Effects */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-accent-primary/15 blur-[60px] rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:bg-accent-primary/25 transition-all duration-700"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-accent-secondary/15 blur-[60px] rounded-full translate-x-1/2 translate-y-1/2 group-hover:bg-accent-secondary/25 transition-all duration-700"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                    <div className="flex-1">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 font-heading">
                            De la Operativa de Negocio a la Ingeniería de IA
                        </h3>
                        <p className="text-text-secondary leading-relaxed text-base md:text-lg">
                            Durante los últimos años gestionando campañas y automatizando agencias de viajes, <span className="text-white font-medium">viví la fricción de los procesos manuales</span>. Esa necesidad me hizo ingeniero: pasé de gestionar CRMs a construir sistemas <span className="text-accent-primary">(React, Python, n8n)</span> y agentes LLM que hacen el trabajo pesado.
                        </p>
                        <p className="text-text-secondary leading-relaxed text-base md:text-lg mt-4">
                            Mi objetivo es desarrollar soluciones <span className="text-accent-secondary font-medium">End-to-End</span> que reduzcan costos y escalen resultados.
                        </p>
                    </div>

                    <div className="hidden md:flex items-center justify-center">
                        <div className="w-16 h-16 rounded-[var(--radius-lg)] bg-accent-secondary/10 border border-accent-secondary/20 flex items-center justify-center">
                            <i className="fas fa-rocket text-2xl text-accent-secondary"></i>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
