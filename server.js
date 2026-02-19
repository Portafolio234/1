import express from 'express';
import dotenv from 'dotenv';
import handler from './api/chat.js';

dotenv.config();

const app = express();
const PORT = 8888;

app.use(express.json());

app.use((req, res, next) => {
    console.log(`[LocalServer] ${req.method} ${req.path}`);
    next();
});

// Endpoint Vercel
app.post('/api/chat', async (req, res) => {
    try {
        console.log("Invocando handler Vercel...");
        await handler(req, res);
    } catch (error) {
        console.error("Error en handler:", error);
        if (!res.headersSent) res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Servidor Mock de Vercel corriendo en http://localhost:${PORT}`);
    console.log(`   Endpoint disponible: http://localhost:${PORT}/api/chat`);
});
