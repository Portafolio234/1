
import { handler } from './netlify/functions/chat.js';

async function runTest() {
    console.log("Iniciando prueba local de función...");

    const mockEvent = {
        httpMethod: 'POST',
        body: JSON.stringify({
            messages: [{ role: 'user', content: 'Hola' }]
        })
    };

    const mockContext = {};

    try {
        const response = await handler(mockEvent, mockContext);
        console.log("Respuesta de la función:");
        console.log("StatusCode:", response.statusCode);
        console.log("Body:", response.body);
    } catch (error) {
        console.error("CRASH: La función falló al ejecutarse:", error);
    }
}

runTest();
