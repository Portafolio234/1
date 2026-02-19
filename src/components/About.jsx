import React from 'react';

const About = () => {
    return (
        <section className="w-full relative z-10 flex justify-center py-12 px-4">
            <div className="max-w-4xl w-full bg-[#101025]/60 backdrop-blur-md border border-[rgba(0,243,255,0.1)] rounded-2xl p-8 md:p-12 relative overflow-hidden group hover:border-[rgba(188,19,254,0.3)] transition-colors duration-500">
                {/* Neon Glow Effects */}
                <div className="absolute top-0 left-0 w-20 h-20 bg-accent-primary/20 blur-[50px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-accent-secondary/20 blur-[50px] rounded-full translate-x-1/2 translate-y-1/2"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                    <div className="flex-1">
                        <h3 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-4 font-heading">
                            De la Operativa de Negocio a la Ingeniería de IA
                        </h3>
                        <p className="text-text-secondary leading-relaxed text-base md:text-lg">
                            Durante los últimos años gestionando campañas y automatizando agencias de viajes, <span className="text-white font-medium">viví la fricción de los procesos manuales</span>. Esa necesidad me hizo ingeniero: pasé de gestionar CRMs a construir sistemas <span className="text-accent-primary">(React, Python, n8n)</span> y agentes LLM que hacen el trabajo pesado.
                        </p>
                        <p className="text-text-secondary leading-relaxed text-base md:text-lg mt-4">
                            Mi objetivo es desarrollar soluciones <span className="text-accent-secondary font-medium">End-to-End</span> que reduzcan costos y escalen resultados.
                        </p>
                    </div>

                    {/* Decorative Element or Icon could go here if needed, but keeping it minimal as requested */}
                    <div className="hidden md:flex items-center justify-center h-full">
                        <i className="fas fa-rocket text-4xl text-accent-secondary opacity-80 animate-pulse-slow"></i>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
