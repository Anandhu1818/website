// DOM Elements
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const proposalScreen = document.getElementById('proposal-screen');
const celebrationScreen = document.getElementById('celebration-screen');
const slides = document.getElementById('slides');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const playToggle = document.getElementById('play-toggle');
const bgMusic = document.getElementById('bg-music');
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

// --- 1. Escaping "NO" Button Logic ---
function escape(e) {
  const padding = 50;
  const width = btnNo.offsetWidth;
  const height = btnNo.offsetHeight;
  
  let newLeft, newTop;
  let attempts = 0;
  
  // Try up to 15 times to find a position sufficiently far from the cursor
  while (attempts < 15) {
    newLeft = Math.random() * (window.innerWidth - width - padding * 2) + padding;
    newTop = Math.random() * (window.innerHeight - height - padding * 2) + padding;
    
    let cursorX = e ? (e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : null)) : null;
    let cursorY = e ? (e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : null)) : null;
    
    if (cursorX === null || cursorY === null) {
      break; // No cursor info, any random position is fine
    }
    
    const dist = Math.hypot((newLeft + width / 2) - cursorX, (newTop + height / 2) - cursorY);
    if (dist > 150) {
      break; // Found a position far enough from cursor
    }
    attempts++;
  }
  
  btnNo.style.position = 'fixed';
  btnNo.style.left = `${newLeft}px`;
  btnNo.style.top = `${newTop}px`;
  btnNo.style.right = 'auto';
  btnNo.style.bottom = 'auto';
  btnNo.style.zIndex = '999';
}

// Escaping events
btnNo.addEventListener('mouseenter', escape);
btnNo.addEventListener('click', (e) => {
  e.preventDefault();
  escape(e);
});
btnNo.addEventListener('touchstart', (e) => {
  e.preventDefault();
  escape(e);
});

// Proactive window mousemove escape trigger
window.addEventListener('mousemove', (e) => {
  const rect = btnNo.getBoundingClientRect();
  const buttonCenterX = rect.left + rect.width / 2;
  const buttonCenterY = rect.top + rect.height / 2;
  const distance = Math.hypot(e.clientX - buttonCenterX, e.clientY - buttonCenterY);
  
  if (distance < 90) {
    escape(e);
  }
});


// --- 2. Particle System (Canvas Animation) ---
let particles = [];
let animationFrameId;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class HeartParticle {
  constructor(isCelebration = false) {
    this.isCelebration = isCelebration;
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = this.isCelebration ? Math.random() * canvas.height : canvas.height + 20;
    this.size = Math.random() * 12 + 6;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = this.isCelebration ? (Math.random() * 2 + 1) : -(Math.random() * 1.5 + 0.5);
    this.alpha = Math.random() * 0.7 + 0.3;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = Math.random() * 0.02 - 0.01;
    // Pinks, reds, and deep purple colors
    const colors = ['#ff4d80', '#ff1a53', '#e040fb', '#ff80ab', '#f50057'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;

    if (this.isCelebration) {
      // Confetti style: fall down
      if (this.y > canvas.height + 20) {
        this.reset();
        this.y = -20;
      }
    } else {
      // Background style: float up
      if (this.y < -20) {
        this.reset();
        this.y = canvas.height + 20;
      }
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    
    // Draw heart
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, this.size / 3, 0, this.size);
    ctx.bezierCurveTo(this.size, this.size / 3, this.size / 2, -this.size / 2, 0, 0);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }
}

// Initialize ambient background floating hearts
function initAmbientHearts() {
  particles = [];
  for (let i = 0; i < 25; i++) {
    particles.push(new HeartParticle(false));
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  animationFrameId = requestAnimationFrame(animate);
}

// Start ambient particles
initAmbientHearts();
animate();

// Boost particles for celebration
function triggerCelebrationParticles() {
  particles = [];
  // Standard floating hearts
  for (let i = 0; i < 30; i++) {
    particles.push(new HeartParticle(false));
  }
  // Falling celebration hearts
  for (let i = 0; i < 60; i++) {
    particles.push(new HeartParticle(true));
  }
}


// --- 3. Transitions & UI Actions ---
btnYes.addEventListener('click', () => {
  // Hide proposal screen with a fade out
  proposalScreen.classList.add('hidden');
  
  // Show celebration screen after fade out completes
  setTimeout(() => {
    proposalScreen.style.display = 'none';
    celebrationScreen.classList.add('active');
    
    // Trigger intense particles
    triggerCelebrationParticles();
    
    // Play romantic music
    playMusic();
  }, 500);
});


// --- 4. Photo Gallery Carousel ---
let currentSlide = 0;
const totalSlides = 3;

function updateCarousel() {
  slides.style.transform = `translateX(-${currentSlide * 33.333}%)`;
}

nextBtn.addEventListener('click', () => {
  currentSlide = (currentSlide + 1) % totalSlides;
  updateCarousel();
});

prevBtn.addEventListener('click', () => {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  updateCarousel();
});


// --- 5. Music Player Widgets ---
function playMusic() {
  bgMusic.play()
    .then(() => {
      playToggle.textContent = '❚❚';
    })
    .catch(err => {
      console.log('Audio autoplay prevented, user interaction required: ', err);
      playToggle.textContent = '▶';
    });
}

playToggle.addEventListener('click', () => {
  if (bgMusic.paused) {
    playMusic();
  } else {
    bgMusic.pause();
    playToggle.textContent = '▶';
  }
});
