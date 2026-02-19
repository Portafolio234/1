# Portafolio Profesional - Leonardo Nieto Cortés

Este portafolio ha sido **migrado completamente a una Single Page Application (SPA)** moderna, utilizando las últimas tecnologías del ecosistema React.

## 🚀 Stack Tecnológico

Este proyecto demuestra el dominio de las siguientes tecnologías solicitadas en la prueba técnica:

* **Core:** [React 18](https://react.dev/) (Hooks, Virtual DOM, Components)
* **Build Tool:** [Vite](https://vitejs.dev/) (HMR, Bundling optimizado)
* **Estilos:** [Tailwind CSS 3](https://tailwindcss.com/) (Utility-first, Responsive Design)
* **Animaciones:** CSS3 nativo + Tailwind (Keyframes para efectos Glitch/Breathe)
* **Despliegue:** GitHub Pages (CI/CD automatizado con `gh-pages`)

## 🛠️ Implementación Técnica

### Patrones de Diseño & Hooks

El código fuente (`/src`) está estructurado siguiendo las mejores prácticas de React:

1. **`useState`**: Control del estado de la interfaz (Menú móvil responsive).
2. **`useEffect`**: Manejo de efectos secundarios y ciclo de vida (Animación de partículas HTML5 Canvas).
3. **`useContext`**: gestión de estado global para los Modales (`ModalContext.jsx`), evitando "prop drilling".
4. **`useRef`**: Referencias directas al DOM para el efecto de inclinación 3D (Tilt Effect) en las tarjetas.

### Estructura de Directorios

```bash
src/
├── components/      # Componentes reutilizables (ProjectCard, Modal, etc.)
├── context/         # Estado global (Context API)
├── hooks/           # Custom Hooks
└── index.css        # Directivas de Tailwind y animaciones personalizadas
```

## 📦 Instalación y Despliegue

1. **Clonar repositorio:**

    ```bash
    git clone https://github.com/Portafolio234/1.git
    ```

2. **Instalar dependencias:**

    ```bash
    npm install
    ```

3. **Correr en desarrollo:**

    ```bash
    npm run dev
    ```

4. **Construir para producción:**

    ```bash
    npm run build
    ```
