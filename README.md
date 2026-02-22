# Leonardo Nieto Cortés — Portfolio & AI Solutions

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Deploy](https://img.shields.io/badge/Vercel-Deployed-000?style=flat-square&logo=vercel)](https://portafolio234.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Portafolio profesional construido como una SPA con React y Vite. Incluye tres demos interactivas de IA que se ejecutan directamente en el navegador o mediante serverless functions.

---

## Arquitectura

```
├── api/
│   └── chat.js                  # Vercel Serverless Function (Groq proxy)
├── public/
│   └── pdfs/                    # Planos PDF de ejemplo
├── src/
│   ├── components/
│   │   ├── DoorDetectorDemo.jsx # Demo: detección de puertas con Computer Vision
│   │   ├── EnterpriseRAG.jsx    # Demo: RAG con TF-IDF en el cliente
│   │   ├── FinancialForecaster.jsx # Demo: análisis financiero con Plotly + LLM
│   │   ├── Header.jsx           # Navegación principal
│   │   ├── Hero.jsx             # Sección de presentación
│   │   ├── Projects.jsx         # Grid de proyectos
│   │   ├── ProjectCard.jsx      # Tarjeta individual de proyecto
│   │   ├── Skills.jsx           # Sección de habilidades técnicas
│   │   ├── About.jsx            # Sección sobre mí
│   │   ├── ContactSection.jsx   # Formulario de contacto
│   │   ├── ParticlesBackground.jsx # Fondo animado con Canvas
│   │   ├── Modal.jsx            # Modal genérico reutilizable
│   │   ├── Step.jsx             # Componente de paso (flujos de arquitectura)
│   │   ├── Arrow.jsx            # Flecha de flujo entre pasos
│   │   └── FooterSection.jsx    # Pie de página
│   ├── context/
│   │   └── ModalContext.jsx     # Context API para gestión de modales
│   ├── data/
│   │   ├── marketData.js        # Generador de datos mock financieros
│   │   └── inventoryData.js     # Datos de ejemplo para RAG
│   ├── hooks/
│   │   ├── usePdfRenderer.js    # Renderizado de PDF a Canvas con PDF.js
│   │   └── useRoboflow.js       # Integración con Roboflow API
│   ├── pages/
│   │   └── Home.jsx             # Página principal (compose de secciones)
│   ├── utils/
│   │   └── ragEngine.js         # Motor RAG: chunking, TF-IDF, búsqueda coseno
│   ├── App.jsx                  # Router principal
│   ├── main.jsx                 # Entry point
│   └── index.css                # Design system (tokens CSS + Tailwind)
├── vercel.json                  # Configuración de rewrites para SPA
├── vite.config.js               # Configuración de Vite
└── tailwind.config.js           # Tokens de diseño extendidos
```

### Rutas

| Ruta | Componente | Descripción |
|:---|:---|:---|
| `/` | `Home` | Página principal del portafolio |
| `/demo/detector` | `DoorDetectorDemo` | Demo de detección de puertas |
| `/demo/finance` | `FinancialForecaster` | Demo de análisis financiero |
| `/demo/rag` | `EnterpriseRAG` | Demo de RAG empresarial |

---

## Demos de IA

### Detector de Puertas Arquitectónico

Permite cargar planos PDF y detectar puertas mediante Computer Vision.

- **Pipeline**: PDF.js → Canvas rendering → Crop de zona → Roboflow YOLO v10
- **Interacción**: El usuario dibuja rectángulos sobre el plano para seleccionar zonas de análisis. En móvil, incluye modo dibujo táctil dedicado.
- **Hooks**: `usePdfRenderer` (renderizado PDF a alta resolución), `useRoboflow` (llamada a API de inferencia).

### AI Financial Forecaster

Visualización de datos financieros con chat contextual impulsado por LLM.

- **Gráfico**: Plotly.js con velas japonesas (OHLC), rangos configurables (1D–1A).
- **Chat**: Envía mensajes al endpoint `/api/chat`, que proxea a Groq Cloud (Llama 3.3 70B).
- **Datos**: Generados proceduralmente en `marketData.js` para demostración sin dependencias externas.

### Enterprise RAG

Sistema Retrieval-Augmented Generation que opera íntegramente en el navegador.

- **Motor** (`ragEngine.js`): Chunking con overlap → índice TF-IDF invertido → búsqueda por similitud coseno.
- **Formatos soportados**: PDF, TXT, CSV, JSON, Markdown.
- **LLM**: Las respuestas se generan via Groq Cloud, citando fuentes del documento indexado.
- **Modos**: Demo (documentos preconfigurados) y Upload (documentos del usuario).

---

## Stack Tecnológico

| Capa | Tecnologías |
|:---|:---|
| **Frontend** | React 18, React Router 7, Vite 5 |
| **Estilos** | Tailwind CSS 3.4, CSS custom properties (design tokens) |
| **IA / ML** | Roboflow API (YOLO v10), Groq Cloud (Llama 3.3 70B) |
| **Visualización** | Plotly.js, HTML5 Canvas, PDF.js |
| **Backend** | Vercel Serverless Functions (proxy de API keys) |
| **Deploy** | Vercel (auto-deploy desde `main`) |

---

## Variables de Entorno

| Variable | Servicio | Uso |
|:---|:---|:---|
| `VITE_ROBOFLOW_API_KEY` | [Roboflow](https://roboflow.com) | Inferencia de Computer Vision (cliente) |
| `GROQ_API_KEY` | [Groq](https://console.groq.com) | Chat completions via serverless function (servidor) |

---

## Inicio Rápido

### Requisitos

- Node.js v18+
- Cuentas en Roboflow y Groq (para API keys)

### Instalación

```bash
git clone https://github.com/Portafolio234/1.git
cd 1
npm install
```

### Configurar entorno

Crear `.env` en la raíz:

```env
VITE_ROBOFLOW_API_KEY=tu_key
GROQ_API_KEY=tu_key
```

### Desarrollo

```bash
npm run dev
```

### Build de producción

```bash
npm run build
npm run preview
```

---

## Deploy

El proyecto se despliega automáticamente en **Vercel** al hacer push a la rama `main`. La configuración de rewrites en `vercel.json` redirige todas las rutas a `index.html` para soportar client-side routing.

La serverless function en `api/chat.js` se despliega automáticamente como un endpoint `/api/chat`.

---

## Licencia

MIT — [Leonardo Nieto Cortés](https://github.com/Portafolio234)
