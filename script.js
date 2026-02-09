document.addEventListener('DOMContentLoaded', () => {
    // Canvas Particles
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particlesArray;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.1;
            this.speedX = (Math.random() * 1 - 0.5);
            this.speedY = (Math.random() * 1 - 0.5);
            this.color = Math.random() > 0.5 ? 'rgba(0, 243, 255, 0.5)' : 'rgba(188, 19, 254, 0.5)';
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > canvas.width || this.x < 0) {
                this.speedX = -this.speedX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.speedY = -this.speedY;
            }
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particlesArray = [];
        const numberOfParticles = (canvas.width * canvas.height) / 9000;
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
            connectParticles(i);
        }
        requestAnimationFrame(animateParticles);
    }

    function connectParticles(index) {
        for (let j = index; j < particlesArray.length; j++) {
            const dx = particlesArray[index].x - particlesArray[j].x;
            const dy = particlesArray[index].y - particlesArray[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(100, 100, 255, ${0.1 - distance / 2000})`; // Fade line
                ctx.lineWidth = 1;
                ctx.moveTo(particlesArray[index].x, particlesArray[index].y);
                ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                ctx.stroke();
            }
        }
    }

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    });

    initParticles();
    animateParticles();

    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // 1. ABRIR MODALES (Lógica Universal)
    // Detecta clics en cualquier parte del documento
    document.body.addEventListener('click', function (e) {
        // Si lo que clickeaste (o su padre) tiene la clase 'tutorial-trigger'
        const trigger = e.target.closest('.tutorial-trigger');

        if (trigger) {
            e.preventDefault(); // Prevent default link behavior if it's an anchor or button
            const modalId = trigger.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active'); // Use original class 'active' instead of 'show'/'style.display' to match CSS
                document.body.style.overflow = 'hidden'; // Keep scroll block
                // modal.style.display = "flex"; // CSS handles this via .active
                // setTimeout(() => { modal.classList.add('show'); }, 10);
            } else {
                console.error(`Error: No se encontró el modal con ID "${modalId}"`);
            }
        }
    });

    // 2. CERRAR MODALES (Botón X)
    // Using delegation for close buttons too, to be safe
    document.body.addEventListener('click', function (e) {
        if (e.target.classList.contains('close-modal')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        }
    });

    // 3. CERRAR AL DAR CLIC FUERA
    window.addEventListener('click', function (event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Smooth Scroll (optional enhancement for older browsers, though CSS html {scroll-behavior: smooth} handles most)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
