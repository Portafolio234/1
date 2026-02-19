import React, { useState } from 'react';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <header className="fixed top-0 w-full px-[5%] py-5 bg-bg-dark/80 backdrop-blur-md z-[1000] flex justify-between items-center border-b border-white/5 h-20">
            <nav className="w-full flex justify-between items-center">
                <a href="#hero" className="font-heading text-2xl font-bold hover:text-white transition-colors">
                    LNC<span className="text-accent-primary">.</span>AI
                </a>

                {/* Desktop Menu */}
                <ul className="hidden md:flex gap-8 list-none">
                    <li><a href="#projects" className="uppercase tracking-wider text-sm hover:text-accent-primary hover:drop-shadow-[0_0_10px_rgba(0,243,255,1)] transition-colors">Proyectos</a></li>
                    <li><a href="#skills" className="uppercase tracking-wider text-sm hover:text-accent-primary hover:drop-shadow-[0_0_10px_rgba(0,243,255,1)] transition-colors">Skills</a></li>
                    <li><a href="#contact" className="uppercase tracking-wider text-sm hover:text-accent-primary hover:drop-shadow-[0_0_10px_rgba(0,243,255,1)] transition-colors">Contacto</a></li>
                </ul>

                {/* Hamburger */}
                <button
                    className={`md:hidden text-2xl cursor-pointer z-50 transition-colors bg-transparent border-none text-white focus:outline-none ${isMenuOpen ? 'text-accent-primary' : ''}`}
                    onClick={toggleMenu}
                    aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                >
                    <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </button>

                {/* Mobile Menu */}
                <ul className={`md:hidden absolute top-full left-0 w-full bg-bg-dark/95 flex flex-col items-center py-5 border-b border-white/10 transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                    <li className="my-2"><a href="#projects" onClick={closeMenu} className="uppercase tracking-wider text-sm hover:text-accent-primary">Proyectos</a></li>
                    <li className="my-2"><a href="#skills" onClick={closeMenu} className="uppercase tracking-wider text-sm hover:text-accent-primary">Skills</a></li>
                    <li className="my-2"><a href="#contact" onClick={closeMenu} className="uppercase tracking-wider text-sm hover:text-accent-primary">Contacto</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
