// Elementos DOM
const viewSongsBtn = document.getElementById("viewSongsBtn");
const instrumentsSection = document.getElementById("instruments");
const floatingBtn = document.getElementById("floatingBtn");
const container = document.querySelector('.carousel-container'); // elemento que vai rolar
const track = document.getElementById("instrumentCarousel"); // inner track (flex)
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// Variáveis do carousel
let currentSlide = 0;
let isMobile = window.innerWidth < 768;
const totalSlides = document.querySelectorAll('.instrument-card').length;
let cards = Array.from(document.querySelectorAll('.instrument-card'));

// Inicializar carousel
function initCarousel() {
    createIndicators();
    refreshCards(); // recalcula cards (pega larguras reais)
    centerCard(currentSlide, false);
    updateActiveCard();
    updateButtons();
    // remove nosso transform antigo caso exista
    track.style.transform = '';
    // esconder barra de rolagem visualmente (opcional): via JS para não mexer no CSS global
    container.style.scrollBehavior = 'smooth';
    container.style.overflowX = 'auto';
    container.style.webkitOverflowScrolling = 'touch';
}

// Recalcula referências dos cards e seus gaps dinâmicos
function refreshCards() {
    cards = Array.from(document.querySelectorAll('.instrument-card'));
}

// Criar indicadores
function createIndicators() {
    // remove se já existir (para evitar duplicatas em reinit)
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

// Ir para slide específico
function goToSlide(slideIndex) {
    const maxSlide = Math.max(0, totalSlides - getVisibleSlides());
    currentSlide = Math.max(0, Math.min(slideIndex, maxSlide));
    centerCard(currentSlide, true);
    updateActiveCard();
    updateIndicators();
    updateButtons();
}

// Centraliza um card via scroll do container
// smooth: se true, usa animação; se false, posiciona sem animação
function centerCard(index, smooth = true) {
    refreshCards();
    const card = cards[index];
    if (!card) return;

    // Larguras e gap real (pega gap do track)
    const cardRect = card.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const cardWidth = cardRect.width;
    // pega gap declarado no CSS (se disponível)
    const gap = parseInt(getComputedStyle(track).gap) || 0;

    // posição do card relativo ao track (left)
    let cardLeft = card.offsetLeft; // offsetLeft já considera gaps em flex

    // queremos que o centro do card fique no centro do container:
    // targetScrollLeft = cardLeft + cardWidth/2 - containerWidth/2 + trackOffsetInsideContainer
    // trackOffsetInsideContainer = track.offsetLeft - container.scrollLeft (mas container.scrollLeft usada abaixo)
    // Simplificação: calcular posição absoluta do centro do card em relação ao container's content:
    const cardCenter = cardLeft + (cardWidth / 2);

    // container pode ter padding que desloca o conteúdo; usar scrollLeft objetivo:
    const targetScrollLeft = Math.round(cardCenter - (container.clientWidth / 2));

    // clamp: não ultrapassar as extremidades possíveis
    const maxScrollLeft = track.scrollWidth - container.clientWidth; // máximo que podemos scrollar
    const finalScroll = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));

    // aplicar scroll
    if (smooth) {
        container.scrollTo({ left: finalScroll, behavior: 'smooth' });
    } else {
        container.scrollLeft = finalScroll;
    }
}

// Atualizar card ativo (classe)
function updateActiveCard() {
    refreshCards();
    cards.forEach((card, i) => {
        card.classList.toggle('active', i === currentSlide);
    });
}

// Atualizar indicadores
function updateIndicators() {
    const dots = document.querySelectorAll('.carousel-indicator');
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
}

// Atualizar estado dos botões
function updateButtons() {
    const maxSlide = totalSlides - getVisibleSlides();
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide >= maxSlide;

    prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
    prevBtn.style.cursor = prevBtn.disabled ? 'not-allowed' : 'pointer';
    nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
    nextBtn.style.cursor = nextBtn.disabled ? 'not-allowed' : 'pointer';
}

// Quantos slides visíveis (desktop vs mobile)
function getVisibleSlides() {
    return isMobile ? 1 : 3;
}

// Navegação por botões
prevBtn.addEventListener('click', () => {
    if (currentSlide > 0) currentSlide--;
    centerCard(currentSlide, true);
    updateActiveCard();
    updateIndicators();
    updateButtons();
});

nextBtn.addEventListener('click', () => {
    const maxSlide = totalSlides - getVisibleSlides();
    if (currentSlide < maxSlide) currentSlide++;
    centerCard(currentSlide, true);
    updateActiveCard();
    updateIndicators();
    updateButtons();
});

// Swipe/drag — vamos suportar tanto touch quanto drag (mouse) para teste
let isPointerDown = false;
let startX = 0;
let scrollStart = 0;

container.addEventListener('pointerdown', (e) => {
    // só empoderar o drag em mobile / touch ou quando quiser
    isPointerDown = true;
    startX = e.clientX;
    scrollStart = container.scrollLeft;
    container.style.scrollBehavior = 'auto'; // desligar smooth durante arraste
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

    // após soltar, detecta card mais próximo do centro e centraliza ele
    snapToNearest();
});

container.addEventListener('pointercancel', () => {
    if (!isPointerDown) return;
    isPointerDown = false;
    container.style.scrollBehavior = 'smooth';
    snapToNearest();
});

// Para touch-only fallback: touch events (em alguns navegadores pointer pode não rodar)
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

// Snap: encontra card cujo centro está mais próximo do centro do container
function snapToNearest() {
    refreshCards();
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    cards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(cardCenter - containerCenter);
        if (dist < nearestDistance) {
            nearestDistance = dist;
            nearestIndex = i;
        }
    });

    currentSlide = nearestIndex;
    centerCard(currentSlide, true);
    updateActiveCard();
    updateIndicators();
    updateButtons();
}

// Atualizar responsividade (resize)
function updateResponsive() {
    isMobile = window.innerWidth < 768;
    refreshCards();
    // garantir que o card atual continue centralizado após resize
    centerCard(currentSlide, false);
    updateButtons();
}

// Botões extras
viewSongsBtn?.addEventListener("click", () => instrumentsSection.scrollIntoView({ behavior: "smooth" }));
floatingBtn?.addEventListener("click", () => instrumentsSection.scrollIntoView({ behavior: "smooth" }));

// Inicialização DOM
document.addEventListener("DOMContentLoaded", () => {
    initCarousel();
    window.addEventListener('resize', updateResponsive);

    // Se o usuário rolar o container manualmente (scroll), vamos atualizar o indicador quando parar
    let scrollTimer = null;
    container.addEventListener('scroll', () => {
        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            // quando o scroll parar, ajusta para o card mais próximo
            snapToNearest();
        }, 90);
    });
});
