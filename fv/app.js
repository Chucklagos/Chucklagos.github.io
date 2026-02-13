(() => {
    const heartsContainer = document.getElementById('heartsContainer');
    const btnNo = document.getElementById('btnNo');
    const btnSi = document.getElementById('btnSi');
    const buttonContainer = document.getElementById('buttonContainer');
    const questionSection = document.getElementById('questionSection');
    const successMessage = document.getElementById('successMessage');
    const successTitle = document.getElementById('successTitle');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const heartSymbols = ['❤️', '💖', '💕', '💗', '💝', '💘'];
    let heartIntervalId = null;

    function createHeart() {
        if (!heartsContainer) return;
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.animationDuration = `${Math.random() * 5 + 5}s`;
        heart.style.fontSize = `${Math.random() * 20 + 15}px`;
        heartsContainer.appendChild(heart);
        setTimeout(() => heart.remove(), 10000);
    }

    function startHearts() {
        if (reduceMotion || heartIntervalId) return;
        heartIntervalId = window.setInterval(createHeart, 800);
    }

    function stopHearts() {
        if (!heartIntervalId) return;
        window.clearInterval(heartIntervalId);
        heartIntervalId = null;
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function moverBoton(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const containerRect = buttonContainer.getBoundingClientRect();
        const siRect = btnSi.getBoundingClientRect();
        const noRect = btnNo.getBoundingClientRect();

        const noWidth = noRect.width;
        const noHeight = noRect.height;
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        const safeZoneTop = siRect.height + 40;
        const margin = 20;

        const maxX = Math.max(0, containerWidth - noWidth - margin * 2);
        const availableHeight = Math.max(0, containerHeight - safeZoneTop - noHeight - margin);

        let newX = margin + Math.random() * maxX;
        let newY = safeZoneTop + Math.random() * availableHeight;

        if (Math.random() > 0.5) {
            if (newX < containerWidth / 2) {
                newX = containerWidth - noWidth - margin - Math.random() * 50;
            } else {
                newX = margin + Math.random() * 50;
            }
        }

        newX = clamp(newX, margin, Math.max(margin, containerWidth - noWidth - margin));
        newY = clamp(newY, safeZoneTop, Math.max(safeZoneTop, containerHeight - noHeight - margin));

        btnNo.style.left = `${newX}px`;
        btnNo.style.top = `${newY}px`;

        const rotation = (Math.random() - 0.5) * 20;
        btnNo.style.transform = `rotate(${rotation}deg) scale(0.9)`;
        setTimeout(() => {
            btnNo.style.transform = `rotate(${rotation}deg) scale(1)`;
        }, 150);

        const textos = ['No 😅', '¿Segura? 🤔', 'Piénsalo 😢', 'Por favor 🥺', 'Nooo 😭',
            'Rechazar 💔', 'Imposible 🚫', 'Nunca ❌', '¿Por qué? 😰', 'Uy casi! 😱'];
        if (Math.random() > 0.4) {
            btnNo.textContent = textos[Math.floor(Math.random() * textos.length)];
        }
    }

    function createConfetti() {
        if (reduceMotion) return;
        const colors = ['#ff0000', '#ff69b4', '#ffd700', '#ff1493', '#00ced1', '#ff4500'];

        for (let i = 0; i < 100; i += 1) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = `${Math.random() * 100}%`;
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDuration = `${Math.random() * 2 + 2}s`;
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 4000);
            }, i * 30);
        }
    }

    function aceptar() {
        questionSection.style.display = 'none';
        successMessage.style.display = 'block';
        document.body.style.overflow = 'auto';
        document.body.style.height = 'auto';
        createConfetti();

        if (!reduceMotion && navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 200]);
        }

        successMessage.scrollIntoView({
            behavior: reduceMotion ? 'auto' : 'smooth',
            block: 'start'
        });
        successTitle.focus();
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopHearts();
        else startHearts();
    });
    window.addEventListener('beforeunload', stopHearts);

    btnSi.addEventListener('click', aceptar);
    btnNo.addEventListener('mouseover', moverBoton);
    btnNo.addEventListener('click', moverBoton);
    btnNo.addEventListener('touchstart', moverBoton, { passive: false });
    btnNo.addEventListener('touchmove', (event) => event.preventDefault(), { passive: false });

    startHearts();
})();
