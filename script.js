// ELEMENTOS DOM
const viewSongsBtn = document.getElementById("viewSongsBtn");
const instrumentsSection = document.getElementById("instruments");
const floatingBtn = document.getElementById("floatingBtn");
const container = document.querySelector('.carousel-container');
const track = document.getElementById("instrumentCarousel");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// VARIÁVEIS GERAIS
let currentSlide = 0;
let isMobile = window.innerWidth < 768;
let cards = Array.from(document.querySelectorAll('.instrument-card'));
const totalSlides = cards.length;

// ============================================
// 🔹 INICIALIZAÇÃO
// ============================================
function initCarousel() {
    createIndicators();
    refreshCards();
    centerCard(currentSlide, false);
    updateActiveCard();
    updateIndicators();
    updateButtons();

    track.style.transform = '';
    container.style.scrollBehavior = 'smooth';
    container.style.overflowX = 'auto';
    container.style.webkitOverflowScrolling = 'touch';
}

// ============================================
// 🔹 FUNÇÕES AUXILIARES
// ============================================
function refreshCards() {
    cards = Array.from(document.querySelectorAll('.instrument-card'));
}

function getVisibleSlides() {
    return isMobile ? 1 : 3;
}

// ============================================
// 🔹 INDICADORES
// ============================================
function createIndicators() {
    const existing = document.querySelector('.carousel-indicators');
    if (existing) existing.remove();

    const indicatorsContainer = document.createElement('div');
    indicatorsContainer.className = 'carousel-indicators';

    for (let i = 0; i < totalSlides; i++) {
        const indicator = document.createElement('button');
        indicator.className = `carousel-indicator ${i === 0 ? 'active' : ''}`;
        indicator.addEventListener('click', () => goToSlide(i));
        indicatorsContainer.appendChild(indicator);
    }

    container.parentNode.appendChild(indicatorsContainer);
}

function updateIndicators() {
    const dots = document.querySelectorAll('.carousel-indicator');
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
}

// ============================================
// 🔹 CENTRALIZAÇÃO
// ============================================
function centerCard(index, smooth = true) {
    refreshCards();
    const card = cards[index];
    if (!card) return;

    const cardRect = card.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const cardCenter = card.offsetLeft + cardRect.width / 2;
    const targetScrollLeft = Math.round(cardCenter - (containerRect.width / 2));

    const maxScroll = track.scrollWidth - container.clientWidth;
    const finalScroll = Math.max(0, Math.min(targetScrollLeft, maxScroll));

    if (smooth) {
        container.scrollTo({ left: finalScroll, behavior: 'smooth' });
    } else {
        container.scrollLeft = finalScroll;
    }
}

// ============================================
// 🔹 ESTADOS VISUAIS
// ============================================
function updateActiveCard() {
    refreshCards();
    cards.forEach((card, i) => {
        card.classList.toggle('active', i === currentSlide);
    });
}

function updateButtons() {
    const maxSlide = totalSlides - getVisibleSlides();

    if (prevBtn) {
        prevBtn.disabled = currentSlide === 0;
        prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
        prevBtn.style.cursor = prevBtn.disabled ? 'not-allowed' : 'pointer';
    }

    if (nextBtn) {
        nextBtn.disabled = currentSlide >= maxSlide;
        nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
        nextBtn.style.cursor = nextBtn.disabled ? 'not-allowed' : 'pointer';
    }
}

// ============================================
// 🔹 NAVEGAÇÃO
// ============================================
function goToSlide(index) {
    const maxSlide = Math.max(0, totalSlides - getVisibleSlides());
    currentSlide = Math.max(0, Math.min(index, maxSlide));
    centerCard(currentSlide, true);
    updateActiveCard();
    updateIndicators();
    updateButtons();
}

// ============================================
// 🔹 BOTÕES DE SETA
// ============================================
prevBtn?.addEventListener('click', () => {
    if (currentSlide > 0) {
        currentSlide--;
        goToSlide(currentSlide);
    }
});

nextBtn?.addEventListener('click', () => {
    const maxSlide = totalSlides - getVisibleSlides();
    if (currentSlide < maxSlide) {
        currentSlide++;
        goToSlide(currentSlide);
    }
});

// ============================================
// 🔹 DRAG / TOUCH
// ============================================
let isPointerDown = false;
let startX = 0;
let scrollStart = 0;

container.addEventListener('pointerdown', (e) => {
    isPointerDown = true;
    startX = e.clientX;
    scrollStart = container.scrollLeft;
    container.style.scrollBehavior = 'auto';
    container.setPointerCapture(e.pointerId);
});

container.addEventListener('pointermove', (e) => {
    if (!isPointerDown) return;
    const dx = e.clientX - startX;
    container.scrollLeft = scrollStart - dx;
});

container.addEventListener('pointerup', (e) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    container.style.scrollBehavior = 'smooth';
    container.releasePointerCapture(e.pointerId);
    snapToNearest();
});

container.addEventListener('pointercancel', () => {
    if (!isPointerDown) return;
    isPointerDown = false;
    container.style.scrollBehavior = 'smooth';
    snapToNearest();
});

container.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    scrollStart = container.scrollLeft;
    container.style.scrollBehavior = 'auto';
});

container.addEventListener('touchmove', (e) => {
    const dx = e.touches[0].clientX - startX;
    container.scrollLeft = scrollStart - dx;
});

container.addEventListener('touchend', () => {
    container.style.scrollBehavior = 'smooth';
    snapToNearest();
});

// ============================================
// 🔹 SNAP AUTOMÁTICO
// ============================================
function snapToNearest() {
    refreshCards();
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDist = Infinity;

    cards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(cardCenter - containerCenter);
        if (dist < nearestDist) {
            nearestDist = dist;
            nearestIndex = i;
        }
    });

    currentSlide = nearestIndex;
    centerCard(currentSlide, true);
    updateActiveCard();
    updateIndicators();
    updateButtons();
}

// ============================================
// 🔹 RESPONSIVIDADE
// ============================================
function updateResponsive() {
    isMobile = window.innerWidth < 768;
    refreshCards();
    centerCard(currentSlide, false);
    updateButtons();
}

// ============================================
// 🔹 SCROLL MANUAL
// ============================================
let scrollTimer = null;
container.addEventListener('scroll', () => {
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => snapToNearest(), 120);
});

// ============================================
// 🔹 BOTÕES EXTRAS
// ============================================
viewSongsBtn?.addEventListener("click", () => instrumentsSection.scrollIntoView({ behavior: "smooth" }));
floatingBtn?.addEventListener("click", () => instrumentsSection.scrollIntoView({ behavior: "smooth" }));

// ============================================
// 🔹 INICIALIZAÇÃO
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    initCarousel();
    window.addEventListener('resize', updateResponsive);
});
