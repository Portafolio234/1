import React from 'react'
import { ModalProvider } from './context/ModalContext'
import ParticlesBackground from './components/ParticlesBackground'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Contact from './components/ContactSection'
import Footer from './components/FooterSection'

function App() {
    return (
        <ModalProvider>
            <ParticlesBackground />
            <Header />
            <main>
                <Hero />
                <About />
                <Projects />
                <Skills />
                <Contact />
            </main>
            <Footer />
        </ModalProvider>
    )
}

export default App
