document.addEventListener('DOMContentLoaded', () => {
  // Referencias DOM
  const waxSeal = document.getElementById('wax-seal');
  const envelope = document.getElementById('envelope');
  const envelopeWrapper = document.getElementById('envelope-wrapper');
  const envelopeScene = document.getElementById('envelope-scene');
  const letterScene = document.getElementById('letter-scene');
  const tapHint = document.getElementById('tap-hint');

  const bgMusic = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');
  const musicBars = document.getElementById('music-bars');
  const musicLabel = document.getElementById('music-label');
  const downloadBtn = document.getElementById('download-memory-btn');

  let isOpened = false;
  let isPlaying = false;

  // =========================================
  // 1. APERTURA DEL SOBRE Y TRANSICIÓN
  // =========================================
  waxSeal.addEventListener('click', () => {
    if (isOpened) return;
    isOpened = true;

    // Vibración háptica suave si el dispositivo lo soporta
    if (navigator.vibrate) {
      navigator.vibrate([40, 30, 60]);
    }

    // Romper sello y abrir solapa
    waxSeal.classList.add('broken');
    tapHint.style.opacity = '0';
    envelopeWrapper.classList.add('opened');

    setTimeout(() => {
      envelope.classList.add('open');
    }, 250);

    // Iniciar música de fondo (si existe musica.mp3)
    startMusic();

    // Transicionar a la vista de la carta completa
    setTimeout(() => {
      envelopeScene.classList.add('fade-out');
    }, 1450);

    setTimeout(() => {
      envelopeScene.style.display = 'none';
      letterScene.classList.remove('hidden');
      
      // Forzar reflow para transición suave
      void letterScene.offsetWidth;
      letterScene.classList.add('visible');
      
      // Activar observador de párrafos al hacer scroll
      initScrollReveal();
    }, 2150);
  });

  // =========================================
  // 2. CONTROL DE MÚSICA DE FONDO
  // =========================================
  function startMusic() {
    bgMusic.volume = 0.45;
    const playPromise = bgMusic.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isPlaying = true;
          musicToggle.classList.remove('hidden');
          musicBars.classList.add('playing');
          musicLabel.textContent = 'Pausar';
        })
        .catch(() => {
          // Si no hay archivo de audio o el navegador lo bloqueó, mostramos el botón listo para activar
          musicToggle.classList.remove('hidden');
          musicLabel.textContent = 'Música';
        });
    }
  }

  musicToggle.addEventListener('click', () => {
    if (isPlaying) {
      bgMusic.pause();
      isPlaying = false;
      musicBars.classList.remove('playing');
      musicLabel.textContent = 'Reproducir';
    } else {
      bgMusic.play().then(() => {
        isPlaying = true;
        musicBars.classList.add('playing');
        musicLabel.textContent = 'Pausar';
      }).catch(() => {
        alert('Agrega un archivo llamado "musica.mp3" en la carpeta para escuchar tu canción.');
      });
    }
  });

  // =========================================
  // 3. APARICIÓN PROGRESIVA DE PÁRRAFOS
  // =========================================
  function initScrollReveal() {
    const paragraphs = document.querySelectorAll('.reveal-paragraph');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    paragraphs.forEach((p, index) => {
      // Los primeros dos párrafos aparecen escalonados de inmediato
      if (index < 2) {
        setTimeout(() => p.classList.add('in-view'), 300 + index * 350);
      } else {
        observer.observe(p);
      }
    });
  }

  // =========================================
  // 4. GENERADOR DE POSTAL DESCARGABLE (CANVAS)
  // =========================================
  downloadBtn.addEventListener('click', () => {
    const canvas = document.getElementById('memory-canvas');
    const ctx = canvas.getContext('2d');

    // Fondo crema cálido
    const grad = ctx.createLinearGradient(0, 0, 1080, 1350);
    grad.addColorStop(0, '#fffdf9');
    grad.addColorStop(1, '#f3e7d9');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1350);

    // Marco dorado doble
    ctx.strokeStyle = '#c59b5f';
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 60, 960, 1230);
    ctx.lineWidth = 1;
    ctx.strokeRect(76, 76, 928, 1200);

    // Encabezado superior
    ctx.fillStyle = '#c59b5f';
    ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NUESTRA HISTORIA  ·  DESDE EL 22 / 08 / 2024', 540, 190);

    // Título principal
    ctx.fillStyle = '#8e2430';
    ctx.font = 'italic 600 76px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Jonathan & Atziri', 540, 310);

    // Línea divisoria
    ctx.beginPath();
    ctx.moveTo(420, 365);
    ctx.lineTo(660, 365);
    ctx.strokeStyle = '#c59b5f';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cita central de la carta
    ctx.fillStyle = '#2c221e';
    ctx.font = '400 44px "Cormorant Garamond", Georgia, serif';
    const lines = [
      '“No te quiero para una etapa;',
      'te quiero para toda la vida.',
      '',
      'Cada sueño, cada meta y cada proyecto',
      'que tenemos en mente juntos,',
      'se nos va a cumplir.”'
    ];

    let y = 510;
    lines.forEach((line) => {
      ctx.fillText(line, 540, y);
      y += 68;
    });

    // Sello inferior
    ctx.beginPath();
    ctx.arc(540, 1030, 56, 0, Math.PI * 2);
    ctx.fillStyle = '#8e2430';
    ctx.fill();

    ctx.fillStyle = '#fceadd';
    ctx.font = '700 32px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('J & A', 540, 1041);

    // Pie de postal
    ctx.fillStyle = '#68564e';
    ctx.font = '400 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Con todo mi amor y mi vida entera, hoy y siempre.', 540, 1175);

    // Descargar como PNG
    const link = document.createElement('a');
    link.download = 'Recuerdo-Jonathan-y-Atziri.png';
    link.href = canvas.toDataURL('image/png');
    link.click();

    downloadBtn.textContent = '✓ Recuerdo guardado en tu galería';
    setTimeout(() => {
      downloadBtn.textContent = 'Guardar nuestro recuerdo';
    }, 3500);
  });

  // =========================================
  // 5. PARTÍCULAS / PÉTALOS SUAVES EN CANVAS
  // =========================================
  const petalsCanvas = document.getElementById('petals-canvas');
  const pCtx = petalsCanvas.getContext('2d');
  let petals = [];

  function resizeCanvas() {
    petalsCanvas.width = window.innerWidth;
    petalsCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Petal {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * petalsCanvas.width;
      this.y = initial ? Math.random() * petalsCanvas.height : -20;
      this.size = Math.random() * 5 + 3;
      this.speedY = Math.random() * 0.6 + 0.25;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.angle = Math.random() * Math.PI * 2;
      this.spin = Math.random() * 0.02 - 0.01;
      this.opacity = Math.random() * 0.35 + 0.15;
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.angle) * 0.25;
      this.angle += this.spin;
      if (this.y > petalsCanvas.height + 20) this.reset();
    }
    draw() {
      pCtx.save();
      pCtx.translate(this.x, this.y);
      pCtx.rotate(this.angle);
      pCtx.fillStyle = `rgba(185, 110, 118, ${this.opacity})`;
      pCtx.beginPath();
      pCtx.ellipse(0, 0, this.size, this.size * 0.55, 0, 0, Math.PI * 2);
      pCtx.fill();
      pCtx.restore();
    }
  }

  for (let i = 0; i < 24; i++) {
    petals.push(new Petal());
  }

  function animatePetals() {
    pCtx.clearRect(0, 0, petalsCanvas.width, petalsCanvas.height);
    petals.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animatePetals);
  }
  animatePetals();
});