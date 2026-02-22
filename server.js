import express from 'express';
import dotenv from 'dotenv';
import chatHandler from './api/chat.js';
import marketHandler from './api/market.js';

dotenv.config();

const app = express();
const PORT = 8888;

app.use(express.json());

app.use((req, res, next) => {
    console.log(`[LocalServer] ${req.method} ${req.path}`);
    next();
});

// Endpoint Chat (Vercel)
app.post('/api/chat', async (req, res) => {
    try {
        await chatHandler(req, res);
    } catch (error) {
        console.error("Error en chat handler:", error);
        if (!res.headersSent) res.status(500).json({ error: error.message });
    }
});

// Endpoint Market (Vercel)
app.get('/api/market', async (req, res) => {
    try {
        await marketHandler(req, res);
    } catch (error) {
        console.error("Error en market handler:", error);
        if (!res.headersSent) res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Servidor Mock de Vercel corriendo en http://localhost:${PORT}`);
    console.log(`   Endpoint disponible: http://localhost:${PORT}/api/chat`);
});
