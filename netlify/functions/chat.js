
export const handler = async (event, context) => {
    // Manejo de CORS
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "ok" };
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers, body: "Method Not Allowed" };
    }

    try {
        const { messages } = JSON.parse(event.body);
        // En Netlify Functions, process.env.VAR funciona correctamente
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            console.error("Error: GROQ_API_KEY no definida.");
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: "Configuration Error: API Key missing on server" })
            };
        }

        // Usamos fetch nativo (disponible en Node 18+)
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messages,
                model: "llama-3.3-70b-versatile",
                temperature: 0.5,
                max_tokens: 1024,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Groq API Error:", errorText);
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ error: "Provider API Error", details: errorText })
            };
        }

        const data = await response.json();
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error("Internal Function Error:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Internal Server Error", details: error.message })
        };
    }
};
