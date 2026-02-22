import React from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaWhatsapp, FaPaperPlane } from 'react-icons/fa';

const Contact = () => {
    return (
        <section id="contact" className="py-24 px-[10%] relative z-10">
            <h2 className="text-4xl text-center mb-16 font-heading font-bold section-heading left-1/2 -translate-x-1/2">
                Contáctame
            </h2>

            <div className="glass-card flex flex-wrap gap-12 p-8 md:p-12">
                <div className="flex-1 min-w-[280px]">
                    <div className="flex items-center mb-6 text-base bg-white/5 p-5 rounded-[var(--radius-md)] transition-all hover:translate-x-2 hover:bg-white/8 border border-transparent hover:border-white/10 group">
                        <FaEnvelope className="text-accent-primary text-xl w-8 text-center mr-4 group-hover:scale-110 transition-transform" />
                        <a href="mailto:leo_nieto_cortes@hotmail.com" className="text-white/80 hover:text-accent-primary transition-colors">leo_nieto_cortes@hotmail.com</a>
                    </div>
                    <div className="flex items-center mb-6 text-base bg-white/5 p-5 rounded-[var(--radius-md)] transition-all hover:translate-x-2 hover:bg-white/8 border border-transparent hover:border-white/10 group">
                        <FaPhone className="text-accent-primary text-xl w-8 text-center mr-4 group-hover:scale-110 transition-transform" />
                        <a href="https://wa.me/525615410755" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-accent-primary transition-colors">+52 56 1541 0755</a>
                    </div>
                    <div className="flex items-center mb-6 text-base bg-white/5 p-5 rounded-[var(--radius-md)] transition-all hover:translate-x-2 hover:bg-white/8 border border-transparent hover:border-white/10 group">
                        <FaMapMarkerAlt className="text-accent-primary text-xl w-8 text-center mr-4 group-hover:scale-110 transition-transform" />
                        <span className="text-white/80">Ecatepec de Morelos, México</span>
                    </div>
                </div>

                <div className="flex-[1.5] min-w-[280px] flex flex-col justify-center items-center text-center">
                    <div className="w-20 h-20 bg-accent-success/10 border border-accent-success/20 rounded-[var(--radius-xl)] flex items-center justify-center mb-6">
                        <FaWhatsapp className="text-4xl text-accent-success" />
                    </div>
                    <h3 className="text-2xl font-heading font-bold mb-3 text-white">¿Tienes un proyecto en mente?</h3>
                    <p className="text-text-secondary mb-8">Hablemos directamente por WhatsApp</p>
                    <a
                        href="https://wa.me/525615410755?text=Hola%20Leonardo,%20vi%20tu%20portafolio%20y%20me%20interesa%20tu%20perfil."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn bg-gradient-to-r from-accent-success to-emerald-700 text-white px-8 py-4 rounded-[var(--radius-md)] font-bold uppercase tracking-wider flex items-center gap-3 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all"
                    >
                        Iniciar Chat <FaPaperPlane />
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Contact;
