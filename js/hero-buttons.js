// Funcionalidade melhorada para os botões da hero section
class HeroButtons {
    constructor() {
        this.init();
    }

    init() {
        this.addButtonEnhancements();
        this.addScrollToTop();
        this.addLoadingStates();
        this.addAnalytics();
    }

    addButtonEnhancements() {
        const heroButtons = document.querySelectorAll('.hero-section .btn');
        
        heroButtons.forEach(button => {
            // Adicionar efeito de ripple
            button.addEventListener('click', (e) => {
                this.createRippleEffect(e, button);
                this.trackButtonClick(button);
            });

            // Adicionar efeito hover melhorado
            button.addEventListener('mouseenter', () => {
                this.addHoverEffect(button);
            });

            button.addEventListener('mouseleave', () => {
                this.removeHoverEffect(button);
            });

            // Adicionar suporte para teclado
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });
    }

    createRippleEffect(event, button) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            z-index: 1;
        `;

        // Adicionar CSS da animação se não existir
        if (!document.querySelector('#ripple-animation')) {
            const style = document.createElement('style');
            style.id = 'ripple-animation';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
                .btn {
                    position: relative;
                    overflow: hidden;
                }
            `;
            document.head.appendChild(style);
        }

        button.appendChild(ripple);

        // Remover o ripple após a animação
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    addHoverEffect(button) {
        // Adicionar brilho sutil
        button.style.boxShadow = '0 8px 25px rgba(180, 111, 90, 0.3)';
        button.style.transform = 'translateY(-3px) scale(1.02)';
    }

    removeHoverEffect(button) {
        button.style.boxShadow = '';
        button.style.transform = '';
    }

    addScrollToTop() {
        // Criar botão de voltar ao topo
        const scrollToTopBtn = document.createElement('button');
        scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollToTopBtn.className = 'scroll-to-top-btn';
        scrollToTopBtn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: var(--cobre);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        document.body.appendChild(scrollToTopBtn);

        // Mostrar/esconder botão baseado no scroll
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.style.opacity = '1';
                scrollToTopBtn.style.visibility = 'visible';
            } else {
                scrollToTopBtn.style.opacity = '0';
                scrollToTopBtn.style.visibility = 'hidden';
            }
        });

        // Funcionalidade do botão
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    addLoadingStates() {
        const heroButtons = document.querySelectorAll('.hero-section .btn');
        
        heroButtons.forEach(button => {
            const originalText = button.innerHTML;
            
            button.addEventListener('click', () => {
                // Adicionar estado de loading
                button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Carregando...';
                button.disabled = true;
                
                // Simular loading (remover após navegação)
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 1000);
            });
        });
    }

    addAnalytics() {
        // Função para rastrear cliques nos botões (para analytics futuras)
        this.buttonClicks = JSON.parse(localStorage.getItem('hero_button_clicks')) || {};
    }

    trackButtonClick(button) {
        const buttonText = button.textContent.trim();
        const timestamp = new Date().toISOString();
        
        if (!this.buttonClicks[buttonText]) {
            this.buttonClicks[buttonText] = [];
        }
        
        this.buttonClicks[buttonText].push(timestamp);
        localStorage.setItem('hero_button_clicks', JSON.stringify(this.buttonClicks));
        
        // Adicionar feedback visual
        this.showClickFeedback(button);
    }

    showClickFeedback(button) {
        // Criar notificação de sucesso
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 100px;
            right: 30px;
            background: var(--cobre);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 2000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        const buttonText = button.textContent.includes('Explorar') ? 'Recursos' : 'Sobre Nós';
        feedback.innerHTML = `<i class="fas fa-check me-2"></i>Redirecionando para ${buttonText}...`;
        
        document.body.appendChild(feedback);
        
        // Animar entrada
        setTimeout(() => {
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover após 2 segundos
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateX(100%)';
            setTimeout(() => feedback.remove(), 300);
        }, 2000);
    }

    // Método para adicionar novos botões dinamicamente
    addCustomButton(text, href, icon = 'fas fa-link', isPrimary = false) {
        const heroSection = document.querySelector('.hero-section .d-flex');
        if (!heroSection) return;

        const button = document.createElement('a');
        button.href = href;
        button.className = `btn ${isPrimary ? 'btn-primary' : 'btn-outline-primary'} btn-lg`;
        button.innerHTML = `<i class="${icon} me-2"></i>${text}`;
        
        heroSection.appendChild(button);
        
        // Aplicar melhorias ao novo botão
        this.enhanceSingleButton(button);
        
        return button;
    }

    enhanceSingleButton(button) {
        button.addEventListener('click', (e) => {
            this.createRippleEffect(e, button);
            this.trackButtonClick(button);
        });

        button.addEventListener('mouseenter', () => {
            this.addHoverEffect(button);
        });

        button.addEventListener('mouseleave', () => {
            this.removeHoverEffect(button);
        });
    }

    // Método para obter estatísticas de cliques
    getClickStats() {
        return this.buttonClicks;
    }

    // Método para limpar estatísticas
    clearClickStats() {
        this.buttonClicks = {};
        localStorage.removeItem('hero_button_clicks');
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que todos os elementos estão carregados
    setTimeout(() => {
        window.heroButtons = new HeroButtons();
        
        // Adicionar funcionalidade de demonstração (opcional)
        if (window.location.search.includes('demo=true')) {
            // Adicionar botão de demonstração
            window.heroButtons.addCustomButton(
                'Ver Demo', 
                '#demo', 
                'fas fa-play-circle', 
                false
            );
        }
    }, 500);
});

// Funcionalidade adicional para melhorar a experiência do usuário
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar animações de entrada para a hero section
    const heroElements = document.querySelectorAll('.hero-section h1, .hero-section p, .hero-section .btn');
    
    heroElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200 + 300);
    });
    
    // Adicionar parallax suave ao ícone da hero section
    const heroIcon = document.querySelector('.hero-image i');
    if (heroIcon) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroIcon.style.transform = `translateY(${rate}px)`;
        });
    }
});

