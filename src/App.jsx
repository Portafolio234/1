import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ModalProvider } from './context/ModalContext'
import ParticlesBackground from './components/ParticlesBackground'
import Home from './pages/Home'
import DoorDetectorDemo from './components/DoorDetectorDemo'
import FinancialForecaster from './components/FinancialForecaster'
import EnterpriseRAG from './components/EnterpriseRAG'

function App() {
    return (
        <ModalProvider>
            <ParticlesBackground />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/demo/detector" element={<DoorDetectorDemo onClose={() => window.history.back()} />} />
                <Route path="/demo/finance" element={<FinancialForecaster onClose={() => window.history.back()} />} />
                <Route path="/demo/rag" element={<EnterpriseRAG onClose={() => window.history.back()} />} />
            </Routes>
        </ModalProvider>
    )
}

export default App
