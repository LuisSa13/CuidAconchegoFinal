// Gerenciador de imagens de fundo para a hero section
class BackgroundManager {
    constructor() {
        this.heroSection = document.querySelector('.hero-section');
        this.currentBackground = null;
        this.backgroundHistory = JSON.parse(localStorage.getItem('hero_backgrounds')) || [];
        this.init();
    }

    init() {
        this.loadSavedBackground();
        this.createBackgroundControls();
    }

    // Carregar imagem de fundo salva anteriormente
    loadSavedBackground() {
        const savedBackground = localStorage.getItem('current_hero_background');
        if (savedBackground) {
            this.setBackground(savedBackground, false); // false = não salvar novamente
        }
    }

    // Definir imagem de fundo
    setBackground(imageUrl, saveToStorage = true) {
        if (!this.heroSection) return false;

        try {
            // Testar se a imagem pode ser carregada
            const img = new Image();
            
            img.onload = () => {
                // Aplicar a imagem de fundo
                this.heroSection.style.setProperty('--hero-bg-image', `url('${imageUrl}')`);
                
                // Atualizar o CSS para usar a variável
                const style = document.createElement('style');
                style.id = 'hero-background-style';
                
                // Remover style anterior se existir
                const existingStyle = document.getElementById('hero-background-style');
                if (existingStyle) {
                    existingStyle.remove();
                }
                
                style.textContent = `
                    .hero-section::before {
                        background-image: var(--hero-bg-image, none) !important;
                    }
                `;
                document.head.appendChild(style);
                
                // Adicionar classe para ativar o fundo
                this.heroSection.classList.add('hero-with-background');
                
                this.currentBackground = imageUrl;
                
                if (saveToStorage) {
                    this.saveBackground(imageUrl);
                }
                
                this.showNotification('Imagem de fundo aplicada com sucesso!', 'success');
                
                return true;
            };
            
            img.onerror = () => {
                this.showNotification('Erro ao carregar a imagem. Verifique o URL.', 'error');
                return false;
            };
            
            img.src = imageUrl;
            
        } catch (error) {
            this.showNotification('Erro ao definir imagem de fundo.', 'error');
            return false;
        }
    }

    // Remover imagem de fundo
    removeBackground() {
        if (!this.heroSection) return;

        this.heroSection.classList.remove('hero-with-background');
        
        // Remover style personalizado
        const existingStyle = document.getElementById('hero-background-style');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        this.currentBackground = null;
        localStorage.removeItem('current_hero_background');
        
        this.showNotification('Imagem de fundo removida.', 'info');
    }

    // Salvar imagem de fundo no histórico
    saveBackground(imageUrl) {
        localStorage.setItem('current_hero_background', imageUrl);
        
        // Adicionar ao histórico se não existir
        if (!this.backgroundHistory.includes(imageUrl)) {
            this.backgroundHistory.unshift(imageUrl);
            
            // Manter apenas os últimos 10 backgrounds
            if (this.backgroundHistory.length > 10) {
                this.backgroundHistory = this.backgroundHistory.slice(0, 10);
            }
            
            localStorage.setItem('hero_backgrounds', JSON.stringify(this.backgroundHistory));
        }
    }

    // Criar controles de imagem de fundo (apenas para administradores/desenvolvimento)
    createBackgroundControls() {
        // Só criar controles se estiver em modo de desenvolvimento
        if (!window.location.search.includes('bg-controls=true')) {
            return;
        }

        const controlsHTML = `
            <div id="bg-controls" style="
                position: fixed;
                top: 100px;
                left: 20px;
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                z-index: 9999;
                min-width: 300px;
                max-width: 400px;
            ">
                <h5 style="margin-bottom: 15px; color: var(--cobre);">
                    <i class="fas fa-image me-2"></i>Controles de Fundo
                </h5>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">URL da Imagem:</label>
                    <input type="url" id="bg-url-input" placeholder="https://exemplo.com/imagem.jpg" style="
                        width: 100%;
                        padding: 8px;
                        border: 2px solid #ddd;
                        border-radius: 5px;
                        margin-bottom: 10px;
                    ">
                    <div style="display: flex; gap: 10px;">
                        <button id="apply-bg-btn" style="
                            flex: 1;
                            padding: 8px;
                            background: var(--cobre);
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                        ">Aplicar</button>
                        <button id="remove-bg-btn" style="
                            flex: 1;
                            padding: 8px;
                            background: #dc3545;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                        ">Remover</button>
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Upload de Arquivo:</label>
                    <input type="file" id="bg-file-input" accept="image/*" style="
                        width: 100%;
                        padding: 8px;
                        border: 2px solid #ddd;
                        border-radius: 5px;
                    ">
                </div>
                
                <div id="bg-history" style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Histórico:</label>
                    <div id="bg-history-list" style="max-height: 150px; overflow-y: auto;"></div>
                </div>
                
                <button id="close-bg-controls" style="
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #999;
                ">&times;</button>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', controlsHTML);
        this.addControlsEventListeners();
        this.updateHistoryList();
    }

    addControlsEventListeners() {
        const urlInput = document.getElementById('bg-url-input');
        const applyBtn = document.getElementById('apply-bg-btn');
        const removeBtn = document.getElementById('remove-bg-btn');
        const fileInput = document.getElementById('bg-file-input');
        const closeBtn = document.getElementById('close-bg-controls');

        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                const url = urlInput.value.trim();
                if (url) {
                    this.setBackground(url);
                    urlInput.value = '';
                }
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.removeBackground();
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    this.handleFileUpload(file);
                }
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('bg-controls').remove();
            });
        }

        // Enter key no input
        if (urlInput) {
            urlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    applyBtn.click();
                }
            });
        }
    }

    handleFileUpload(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            this.setBackground(dataUrl);
            this.showNotification('Imagem carregada com sucesso!', 'success');
        };
        
        reader.onerror = () => {
            this.showNotification('Erro ao carregar o arquivo.', 'error');
        };
        
        reader.readAsDataURL(file);
    }

    updateHistoryList() {
        const historyList = document.getElementById('bg-history-list');
        if (!historyList) return;

        if (this.backgroundHistory.length === 0) {
            historyList.innerHTML = '<p style="color: #999; font-style: italic; margin: 0;">Nenhum histórico</p>';
            return;
        }

        historyList.innerHTML = this.backgroundHistory.map((url, index) => `
            <div style="
                display: flex;
                align-items: center;
                padding: 5px 0;
                border-bottom: 1px solid #eee;
                font-size: 12px;
            ">
                <img src="${url}" style="
                    width: 30px;
                    height: 20px;
                    object-fit: cover;
                    border-radius: 3px;
                    margin-right: 8px;
                " onerror="this.style.display='none'">
                <span style="
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    margin-right: 8px;
                ">${url.length > 40 ? url.substring(0, 40) + '...' : url}</span>
                <button onclick="window.backgroundManager.setBackground('${url}')" style="
                    background: var(--cobre);
                    color: white;
                    border: none;
                    padding: 2px 6px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 10px;
                ">Usar</button>
            </div>
        `).join('');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 300px;
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Métodos públicos para uso externo
    getCurrentBackground() {
        return this.currentBackground;
    }

    getBackgroundHistory() {
        return [...this.backgroundHistory];
    }

    clearHistory() {
        this.backgroundHistory = [];
        localStorage.removeItem('hero_backgrounds');
        this.updateHistoryList();
        this.showNotification('Histórico limpo.', 'info');
    }

    // Método para aplicar imagem de fundo programaticamente
    applyBackgroundImage(imageUrl) {
        return this.setBackground(imageUrl);
    }

    // Método para verificar se há imagem de fundo ativa
    hasBackground() {
        return this.heroSection && this.heroSection.classList.contains('hero-with-background');
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.backgroundManager = new BackgroundManager();
        
        // Exemplo de uso para desenvolvedores:
        // window.backgroundManager.applyBackgroundImage('https://exemplo.com/imagem.jpg');
        
        // Para ativar controles de desenvolvimento, adicione ?bg-controls=true na URL
        
    }, 500);
});

// Função global para facilitar o uso
window.setHeroBackground = function(imageUrl) {
    if (window.backgroundManager) {
        return window.backgroundManager.applyBackgroundImage(imageUrl);
    }
    return false;
};

window.removeHeroBackground = function() {
    if (window.backgroundManager) {
        window.backgroundManager.removeBackground();
    }
};

