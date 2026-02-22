import ghpages from 'gh-pages';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_URL = 'https://portafolio-leonardo-woad.vercel.app';
const DEPLOY_DIR = path.join(__dirname, '../dist-redirect');

// 1. Crear directorio temporal
if (!fs.existsSync(DEPLOY_DIR)) {
    fs.mkdirSync(DEPLOY_DIR);
}

// 2. Crear index.html con la redirección
const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0;url=${TARGET_URL}">
    <script type="text/javascript">
        window.location.replace("${TARGET_URL}");
    </script>
    <title>Redirigiendo al Portafolio...</title>
</head>
<body>
    <p>Si no eres redirigido automáticamente, <a href="${TARGET_URL}">haz clic aquí</a>.</p>
</body>
</html>`;

fs.writeFileSync(path.join(DEPLOY_DIR, 'index.html'), htmlContent);

// 3. Crear archivo .nojekyll para asegurar que GH Pages sirva todo correctamente
fs.writeFileSync(path.join(DEPLOY_DIR, '.nojekyll'), '');

console.log(`Generado index.html de redirección hacia ${TARGET_URL}`);
console.log('Iniciando despliegue a GitHub Pages...');

// 4. Desplegar
ghpages.publish(DEPLOY_DIR, {
    branch: 'gh-pages', // Rama por defecto para GH Pages
    message: 'Deploy: Static redirect to Vercel'
}, (err) => {
    if (err) {
        console.error('Error durante el despliegue:', err);
        process.exit(1);
    } else {
        console.log('¡Despliegue de redirección completado con éxito!');
        console.log('Borra la caché de tu navegador o abre una ventana de incógnito para probar.');

        // Limpieza opcional
        // fs.rmSync(DEPLOY_DIR, { recursive: true, force: true });
    }
});
