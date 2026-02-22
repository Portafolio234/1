import React from 'react';

const Hero = () => {
    return (
        <section id="hero" className="h-screen flex items-center justify-center text-center px-5 relative z-10">
            <div className="max-w-3xl animate-fadeIn">
                <h1
                    className="text-4xl md:text-6xl font-bold mb-3 font-heading uppercase animate-glitch"
                    data-text="Leonardo Nieto Cortés"
                >
                    Leonardo Nieto Cortés
                </h1>
                <h2 className="text-xl md:text-2xl text-accent-primary mb-5 font-light tracking-wide">
                    Ingeniero de Software & Soluciones de IA
                </h2>
                <p className="text-base md:text-lg text-text-secondary mb-10 leading-relaxed max-w-2xl mx-auto">
                    Especializado en Soluciones RAG & Agentes de IA (Llama, DeepSeek) y Desarrollo Full Stack Moderno.
                </p>
                <div className="flex justify-center gap-4">
                    <a href="#projects" className="btn btn-primary">
                        Ver Proyectos <i className="fas fa-arrow-right"></i>
                    </a>
                    <a href="#contact" className="btn btn-secondary">
                        Contactar
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Hero;
