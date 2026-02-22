
import React from 'react';

const Footer = () => {
    return (
        <footer className="py-8 text-center bg-bg-dark relative z-10 border-t border-accent-primary/5">
            <p className="text-text-secondary text-sm mb-3">
                &copy; {new Date().getFullYear()} LNC.AI — Todos los derechos reservados.
            </p>
            <div className="flex justify-center items-center gap-4 text-xs text-text-secondary">
                <span className="flex items-center gap-1.5 hover:text-accent-primary transition-colors cursor-default">
                    <i className="fab fa-react text-base"></i> Built with <strong className="text-white/80">React</strong>
                </span>
                <span className="text-white/10">|</span>
                <span className="flex items-center gap-1.5 hover:text-accent-primary transition-colors cursor-default">
                    <i className="fab fa-css3-alt text-base"></i> Styled with <strong className="text-white/80">Tailwind</strong>
                </span>
                <span className="text-white/10">|</span>
                <span className="flex items-center gap-1.5 hover:text-accent-primary transition-colors cursor-default">
                    <i className="fas fa-bolt text-base"></i> Powered by <strong className="text-white/80">Vite</strong>
                </span>
            </div>

            <div className="mt-5">
                <a
                    href="https://github.com/Portafolio234/1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-text-secondary hover:text-accent-primary transition-colors border border-white/10 px-4 py-2 rounded-[var(--radius-full)] hover:bg-white/5 cursor-pointer hover:border-accent-primary/30"
                >
                    <i className="fab fa-github"></i> Ver código fuente de este portafolio
                </a>
            </div>
        </footer>
    );
};

export default Footer;
