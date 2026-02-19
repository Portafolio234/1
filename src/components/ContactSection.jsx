import React from 'react';

const Contact = () => {
    return (
        <section id="contact" className="py-24 px-[10%] relative z-10">
            <h2 className="text-4xl text-center mb-16 relative inline-block left-1/2 -translate-x-1/2 font-heading font-bold">
                Contáctame
                <span className="absolute -bottom-4 left-1/4 w-1/2 h-[3px] bg-gradient-to-r from-transparent via-accent-secondary to-transparent"></span>
            </h2>

            <div className="flex flex-wrap gap-12 bg-[#101025]/40 p-12 rounded-xl backdrop-blur-sm">
                <div className="flex-1 min-w-[300px]">
                    <div className="flex items-center mb-8 text-lg bg-white/5 p-5 rounded-lg transition-all hover:translate-x-2.5 hover:bg-white/10 border border-transparent hover:border-white/10">
                        <i className="fas fa-envelope text-accent-primary text-2xl w-8 text-center mr-4"></i>
                        <a href="mailto:leo_nieto_cortes@hotmail.com" className="hover:text-accent-primary transition-colors">leo_nieto_cortes@hotmail.com</a>
                    </div>
                    <div className="flex items-center mb-8 text-lg bg-white/5 p-5 rounded-lg transition-all hover:translate-x-2.5 hover:bg-white/10 border border-transparent hover:border-white/10">
                        <i className="fas fa-phone text-accent-primary text-2xl w-8 text-center mr-4"></i>
                        <a href="https://wa.me/525615410755" target="_blank" rel="noopener noreferrer" className="hover:text-accent-primary transition-colors">+52 56 1541 0755</a>
                    </div>
                    <div className="flex items-center mb-8 text-lg bg-white/5 p-5 rounded-lg transition-all hover:translate-x-2.5 hover:bg-white/10 border border-transparent hover:border-white/10">
                        <i className="fas fa-map-marker-alt text-accent-primary text-2xl w-8 text-center mr-4"></i>
                        <span>Ecatepec de Morelos, México</span>
                    </div>
                </div>

                <div className="flex-[1.5] min-w-[300px] flex flex-col justify-center items-center text-center">
                    <i className="fab fa-whatsapp text-[4rem] text-[#25D366] mb-5 drop-shadow-[0_0_20px_rgba(37,211,102,0.4)]"></i>
                    <h3 className="text-2xl font-heading mb-4">¿Tienes un proyecto en mente?</h3>
                    <p className="text-text-secondary mb-8">Hablemos directamente por WhatsApp</p>
                    <a
                        href="https://wa.me/525615410755?text=Hola%20Leonardo,%20vi%20tu%20portafolio%20y%20me%20interesa%20tu%20perfil."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary bg-gradient-to-r from-[#25D366] to-[#128C7E] px-8 py-4 rounded font-bold uppercase tracking-wider text-black flex items-center gap-3 hover:transform hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(37,211,102,0.6)] transition-all"
                    >
                        Iniciar Chat <i className="fas fa-paper-plane"></i>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Contact;
