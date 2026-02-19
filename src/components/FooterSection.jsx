
import React from 'react';

const Footer = () => {
    return (
        <footer className="py-8 text-center bg-[#050510] relative z-10 border-t border-[rgba(0,243,255,0.05)]">
            <p className="text-text-secondary text-sm mb-2">
                &copy; {new Date().getFullYear()} LNC.AI - Todos los derechos reservados.
            </p>
            <div className="flex justify-center items-center gap-4 text-xs text-text-secondary opacity-80">
                <span className="flex items-center gap-1.5 hover:text-[#61DAFB] transition-colors cursor-default">
                    <i className="fab fa-react text-lg"></i> Built with <strong>React</strong>
                </span>
                <span>|</span>
                <span className="flex items-center gap-1.5 hover:text-[#38B2AC] transition-colors cursor-default">
                    <i className="fab fa-css3-alt text-lg"></i> Styled with <strong>Tailwind</strong>
                </span>
                <span>|</span>
                <span className="flex items-center gap-1.5 hover:text-[#F0DB4F] transition-colors cursor-default">
                    <i className="fas fa-bolt text-lg"></i> Powered by <strong>Vite</strong>
                </span>
            </div>

            <div className="mt-4">
                <a
                    href="https://portafolio-leonardo-nieto-react.netlify.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-text-secondary hover:text-accent-primary transition-colors border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/5 cursor-pointer"
                >
                    <i className="fab fa-github"></i> Ver código fuente de este portafolio
                </a>
            </div>
        </footer>
    );
};

export default Footer;
