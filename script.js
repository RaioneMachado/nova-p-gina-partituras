// Elementos DOM
const viewSongsBtn = document.getElementById("viewSongsBtn");
const instrumentsSection = document.getElementById("instruments");
const floatingBtn = document.getElementById("floatingBtn");
const instrumentCarousel = document.getElementById("instrumentCarousel");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// Variáveis do carousel
let currentSlide = 0;
let cardWidth = 280;
let gap = 25;
let visibleSlides = 3;
let totalSlides = document.querySelectorAll('.instrument-card').length;
let isMobile = window.innerWidth < 768;

// Inicializar carousel de instrumentos
function initInstrumentCarousel() {
    // As imagens já estão no HTML, apenas inicializamos o carousel
    createIndicators();
    updateCarousel();
}

// Criar indicadores
function createIndicators() {
    const indicatorsContainer = document.createElement('div');
    indicatorsContainer.className = 'carousel-indicators';
    
    const cards = document.querySelectorAll('.instrument-card');
    cards.forEach((_, index) => {
        const indicator = document.createElement('button');
        indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
        indicator.addEventListener('click', () => {
            goToSlide(index);
        });
        indicatorsContainer.appendChild(indicator);
    });
    
    instrumentCarousel.parentNode.appendChild(indicatorsContainer);
}

// Atualizar slides visíveis
function updateVisibleSlides() {
    isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        visibleSlides = 1;
        cardWidth = 280;
        gap = 15;
    } else if (window.innerWidth < 1024) {
        visibleSlides = 2;
        cardWidth = 280;
        gap = 25;
    } else {
        visibleSlides = 3;
        cardWidth = 280;
        gap = 25;
    }
}

// Ir para slide específico
function goToSlide(slideIndex) {
    currentSlide = Math.max(0, Math.min(slideIndex, totalSlides - visibleSlides));
    updateCarousel();
}

// Atualizar carousel
function updateCarousel() {
    let offset;
    
    if (isMobile) {
        offset = -(currentSlide * (cardWidth + gap));
    } else {
        offset = -(currentSlide * (cardWidth + gap));
    }
    
    instrumentCarousel.style.transform = `translateX(${offset}px)`;
    
    // Atualizar classes active
    document.querySelectorAll('.instrument-card').forEach((card, index) => {
        if (isMobile) {
            card.classList.toggle('active', index === currentSlide);
        } else {
            card.classList.toggle('active', index === currentSlide + Math.floor(visibleSlides / 2));
        }
    });
    
    // Atualizar indicadores
    document.querySelectorAll('.carousel-indicator').forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
    });
    
    // Atualizar estado dos botões
    const maxSlide = totalSlides - visibleSlides;
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide >= maxSlide;
}

// Event listeners para navegação do carousel
prevBtn.addEventListener('click', () => {
    if (currentSlide > 0) {
        currentSlide--;
        updateCarousel();
    }
});

nextBtn.addEventListener('click', () => {
    const maxSlide = totalSlides - visibleSlides;
    if (currentSlide < maxSlide) {
        currentSlide++;
        updateCarousel();
    }
});

// Swipe para dispositivos móveis
let startX = 0;
let currentX = 0;
let isDragging = false;

instrumentCarousel.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    instrumentCarousel.style.transition = 'none';
});

instrumentCarousel.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
});

instrumentCarousel.addEventListener('touchend', () => {
    if (!isDragging) return;
    
    instrumentCarousel.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    const diff = startX - currentX;
    const swipeThreshold = 50;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0 && currentSlide < totalSlides - visibleSlides) {
            currentSlide++;
        } else if (diff < 0 && currentSlide > 0) {
            currentSlide--;
        }
        updateCarousel();
    } else {
        updateCarousel();
    }
    
    isDragging = false;
});

// Botão "Ver Músicas" - rolar até a seção de instrumentos
viewSongsBtn.addEventListener("click", function() {
    instrumentsSection.scrollIntoView({ behavior: "smooth" });
});

// Botão flutuante - rolar até a seção de instrumentos
floatingBtn.addEventListener("click", function() {
    instrumentsSection.scrollIntoView({ behavior: "smooth" });
});

// Configurar botões de compra
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-buy')) {
        const link = e.target.getAttribute('data-link');
        if (link) {
            window.open(link, '_blank');
        }
    }
});

// FAQ Accordion
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const item = question.parentElement;
        item.classList.toggle('active');
    });
});

// Efeito de digitação no título
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = "";
    
    function typing() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typing, speed);
        }
    }
    
    typing();
}

// Inicializar quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", function() {
    // Inicializar carousel
    initInstrumentCarousel();
    updateVisibleSlides();
    updateCarousel();
    
    // Efeito de digitação
    const heroTitle = document.querySelector(".hero-text h2");
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 50);
    }
    
    // Atualizar responsividade ao redimensionar
    window.addEventListener('resize', () => {
        updateVisibleSlides();
        updateCarousel();
    });
});

// Efeito de parallax simples
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero, .combos, .faq');
    
    parallaxElements.forEach(element => {
        const speed = 0.5;
        element.style.backgroundPositionY = -(scrolled * speed) + 'px';
    });
});