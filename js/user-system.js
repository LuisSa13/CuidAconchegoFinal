// Sistema de Utilizadores CuidAconchego
class UserSystem {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('cuidaconchego_users')) || [];
        this.init();
    }

    init() {
        // Verificar se há utilizador logado
        const loggedUser = localStorage.getItem('cuidaconchego_current_user');
        if (loggedUser) {
            this.currentUser = JSON.parse(loggedUser);
        }
        
        // Criar interface de utilizador
        this.createUserInterface();
        this.updateUserInterface();
    }

    createUserInterface() {
        // Adicionar CSS para o sistema de utilizadores
        const style = document.createElement('style');
        style.textContent = `
            .user-system {
                position: relative;
                display: inline-block;
            }
            
            .user-btn {
                background: var(--cobre);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            
            .user-btn:hover {
                background: var(--terracota-claro);
            }
            
            .user-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                min-width: 200px;
                z-index: 1000;
                display: none;
            }
            
            .user-dropdown.show {
                display: block;
            }
            
            .user-dropdown-item {
                padding: 12px 16px;
                cursor: pointer;
                border-bottom: 1px solid #eee;
                transition: background 0.2s ease;
            }
            
            .user-dropdown-item:hover {
                background: #f5f5f5;
            }
            
            .user-dropdown-item:last-child {
                border-bottom: none;
            }
            
            .user-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 2000;
            }
            
            .user-modal.show {
                display: flex;
            }
            
            .user-modal-content {
                background: white;
                padding: 30px;
                border-radius: 12px;
                width: 90%;
                max-width: 400px;
                position: relative;
            }
            
            .user-modal-close {
                position: absolute;
                top: 15px;
                right: 20px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #999;
            }
            
            .user-form {
                margin-top: 20px;
            }
            
            .user-form input {
                width: 100%;
                padding: 12px;
                margin-bottom: 15px;
                border: 2px solid #ddd;
                border-radius: 6px;
                font-size: 14px;
            }
            
            .user-form input:focus {
                outline: none;
                border-color: var(--cobre);
            }
            
            .user-form button {
                width: 100%;
                padding: 12px;
                background: var(--cobre);
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                cursor: pointer;
                margin-bottom: 10px;
            }
            
            .user-form button:hover {
                background: var(--terracota-claro);
            }
            
            .user-form .switch-mode {
                text-align: center;
                color: var(--cobre);
                cursor: pointer;
                text-decoration: underline;
            }
            
            .user-info {
                color: var(--cobre);
                font-weight: 500;
            }
            
            .user-alerts {
                background: var(--bege-areia);
                padding: 15px;
                border-radius: 8px;
                margin-top: 10px;
            }
            
            .alert-item {
                padding: 8px 0;
                border-bottom: 1px solid #ddd;
            }
            
            .alert-item:last-child {
                border-bottom: none;
            }
        `;
        document.head.appendChild(style);

        // Adicionar HTML para o sistema de utilizadores
        const navbar = document.querySelector('.navbar .container');
        if (navbar) {
            const userSystemHTML = `
                <div class="user-system ms-3">
                    <button class="user-btn" id="userBtn">
                        <i class="fas fa-user me-1"></i>
                        <span id="userBtnText">Entrar</span>
                    </button>
                    <div class="user-dropdown" id="userDropdown">
                        <div class="user-dropdown-item" id="profileItem">
                            <i class="fas fa-user me-2"></i>Perfil
                        </div>
                        <div class="user-dropdown-item" id="alertsItem">
                            <i class="fas fa-bell me-2"></i>Alertas
                        </div>
                        <div class="user-dropdown-item" id="logoutItem">
                            <i class="fas fa-sign-out-alt me-2"></i>Sair
                        </div>
                    </div>
                </div>
            `;
            navbar.insertAdjacentHTML('beforeend', userSystemHTML);
        }

        // Adicionar modal
        const modalHTML = `
            <div class="user-modal" id="userModal">
                <div class="user-modal-content">
                    <button class="user-modal-close" id="closeModal">&times;</button>
                    <h3 id="modalTitle">Entrar</h3>
                    <form class="user-form" id="userForm">
                        <input type="text" id="userName" placeholder="Nome completo" style="display: none;">
                        <input type="email" id="userEmail" placeholder="Email" required>
                        <input type="password" id="userPassword" placeholder="Palavra-passe" required>
                        <button type="submit" id="submitBtn">Entrar</button>
                        <div class="switch-mode" id="switchMode">Não tem conta? Registar</div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Adicionar event listeners
        this.addEventListeners();
    }

    addEventListeners() {
        const userBtn = document.getElementById('userBtn');
        const userDropdown = document.getElementById('userDropdown');
        const userModal = document.getElementById('userModal');
        const closeModal = document.getElementById('closeModal');
        const userForm = document.getElementById('userForm');
        const switchMode = document.getElementById('switchMode');

        // Toggle dropdown
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.currentUser) {
                userDropdown.classList.toggle('show');
            } else {
                this.showModal('login');
            }
        });

        // Fechar dropdown ao clicar fora
        document.addEventListener('click', () => {
            userDropdown.classList.remove('show');
        });

        // Dropdown items
        document.getElementById('profileItem').addEventListener('click', () => {
            this.showProfile();
        });

        document.getElementById('alertsItem').addEventListener('click', () => {
            this.showAlerts();
        });

        document.getElementById('logoutItem').addEventListener('click', () => {
            this.logout();
        });

        // Modal
        closeModal.addEventListener('click', () => {
            userModal.classList.remove('show');
        });

        userModal.addEventListener('click', (e) => {
            if (e.target === userModal) {
                userModal.classList.remove('show');
            }
        });

        // Form
        userForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        switchMode.addEventListener('click', () => {
            this.toggleMode();
        });
    }

    showModal(mode) {
        const modal = document.getElementById('userModal');
        const title = document.getElementById('modalTitle');
        const nameField = document.getElementById('userName');
        const submitBtn = document.getElementById('submitBtn');
        const switchMode = document.getElementById('switchMode');

        if (mode === 'login') {
            title.textContent = 'Entrar';
            nameField.style.display = 'none';
            nameField.required = false;
            submitBtn.textContent = 'Entrar';
            switchMode.textContent = 'Não tem conta? Registar';
        } else {
            title.textContent = 'Registar';
            nameField.style.display = 'block';
            nameField.required = true;
            submitBtn.textContent = 'Registar';
            switchMode.textContent = 'Já tem conta? Entrar';
        }

        modal.classList.add('show');
        this.currentMode = mode;
    }

    toggleMode() {
        const newMode = this.currentMode === 'login' ? 'register' : 'login';
        this.showModal(newMode);
    }

    handleFormSubmit() {
        const name = document.getElementById('userName').value;
        const email = document.getElementById('userEmail').value;
        const password = document.getElementById('userPassword').value;

        if (this.currentMode === 'register') {
            this.register(name, email, password);
        } else {
            this.login(email, password);
        }
    }

    register(name, email, password) {
        // Verificar se o email já existe
        if (this.users.find(user => user.email === email)) {
            alert('Este email já está registado.');
            return;
        }

        // Criar novo utilizador
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password, // Em produção, usar hash
            registeredAt: new Date().toISOString(),
            alerts: []
        };

        this.users.push(newUser);
        localStorage.setItem('cuidaconchego_users', JSON.stringify(this.users));

        // Fazer login automático
        this.currentUser = newUser;
        localStorage.setItem('cuidaconchego_current_user', JSON.stringify(newUser));

        // Fechar modal e atualizar interface
        document.getElementById('userModal').classList.remove('show');
        this.updateUserInterface();
        
        alert('Registo efetuado com sucesso! Bem-vindo ao CuidAconchego.');
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('cuidaconchego_current_user', JSON.stringify(user));
            
            document.getElementById('userModal').classList.remove('show');
            this.updateUserInterface();
            
            alert(`Bem-vindo de volta, ${user.name}!`);
        } else {
            alert('Email ou palavra-passe incorretos.');
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('cuidaconchego_current_user');
        this.updateUserInterface();
        document.getElementById('userDropdown').classList.remove('show');
        alert('Sessão terminada com sucesso.');
    }

    updateUserInterface() {
        const userBtnText = document.getElementById('userBtnText');
        
        if (this.currentUser) {
            userBtnText.textContent = this.currentUser.name.split(' ')[0];
            // Atualizar indicador de alertas
            this.updateAlertIndicator();
        } else {
            userBtnText.textContent = 'Entrar';
        }
    }

    showProfile() {
        if (!this.currentUser) return;
        
        alert(`Perfil de ${this.currentUser.name}\nEmail: ${this.currentUser.email}\nRegistado em: ${new Date(this.currentUser.registeredAt).toLocaleDateString('pt-PT')}`);
        document.getElementById('userDropdown').classList.remove('show');
    }

    showAlerts() {
        if (!this.currentUser) return;
        
        // Obter alertas do utilizador atual
        const userAlerts = this.currentUser.alerts || [];
        
        let alertsContent = '';
        if (userAlerts.length === 0) {
            alertsContent = `
                <div class="alert-item text-center text-muted">
                    <i class="fas fa-info-circle fa-2x mb-2"></i><br>
                    <strong>Nenhum alerta</strong><br>
                    Não tem alertas pendentes no momento.
                </div>
            `;
        } else {
            // Ordenar alertas por data (mais recentes primeiro)
            const alertsOrdenados = userAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            alertsContent = alertsOrdenados.map(alert => {
                const dataFormatada = new Date(alert.timestamp).toLocaleString('pt-PT');
                const iconClass = this.getAlertIcon(alert.type);
                
                return `
                    <div class="alert-item ${alert.read ? 'read' : 'unread'}" data-alert-id="${alert.id}">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <i class="${iconClass} me-2"></i>
                                <strong>${alert.title || 'Notificação'}</strong><br>
                                <span>${alert.message}</span><br>
                                <small class="text-muted">${dataFormatada}</small>
                            </div>
                            <div class="alert-actions">
                                ${!alert.read ? `<button class="btn btn-sm btn-outline-primary" onclick="window.userSystem.markAlertAsRead('${alert.id}')">Marcar como lido</button>` : ''}
                                <button class="btn btn-sm btn-outline-danger ms-1" onclick="window.userSystem.removeAlert('${alert.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        const alertsHTML = `
            <div class="user-modal show">
                <div class="user-modal-content" style="max-width: 600px;">
                    <button class="user-modal-close" onclick="this.closest('.user-modal').remove()">&times;</button>
                    <h3>
                        <i class="fas fa-bell me-2"></i>Alertas e Notificações
                        ${userAlerts.filter(a => !a.read).length > 0 ? `<span class="badge bg-danger ms-2">${userAlerts.filter(a => !a.read).length}</span>` : ''}
                    </h3>
                    <div class="user-alerts" style="max-height: 400px; overflow-y: auto;">
                        ${alertsContent}
                    </div>
                    ${userAlerts.length > 0 ? `
                        <div class="mt-3 text-center">
                            <button class="btn btn-outline-secondary" onclick="window.userSystem.clearAllAlerts()">
                                <i class="fas fa-trash me-1"></i>Limpar todos os alertas
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', alertsHTML);
        document.getElementById('userDropdown').classList.remove('show');
    }

    // Método para adicionar alertas
    addAlert(message, type = 'info', title = null) {
        if (!this.currentUser) return;
        
        const alert = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            title: title,
            message: message,
            type: type,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        if (!this.currentUser.alerts) {
            this.currentUser.alerts = [];
        }
        
        this.currentUser.alerts.push(alert);
        
        // Atualizar no localStorage
        this.updateUserInStorage();
        
        // Atualizar indicador visual de alertas não lidos
        this.updateAlertIndicator();
        
        return alert.id;
    }

    // Marcar alerta como lido
    markAlertAsRead(alertId) {
        if (!this.currentUser || !this.currentUser.alerts) return;
        
        const alert = this.currentUser.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.read = true;
            this.updateUserInStorage();
            this.updateAlertIndicator();
            
            // Atualizar a exibição se o modal estiver aberto
            const alertElement = document.querySelector(`[data-alert-id="${alertId}"]`);
            if (alertElement) {
                alertElement.classList.remove('unread');
                alertElement.classList.add('read');
                const button = alertElement.querySelector('.btn-outline-primary');
                if (button) button.remove();
            }
        }
    }

    // Remover alerta específico
    removeAlert(alertId) {
        if (!this.currentUser || !this.currentUser.alerts) return;
        
        this.currentUser.alerts = this.currentUser.alerts.filter(a => a.id !== alertId);
        this.updateUserInStorage();
        this.updateAlertIndicator();
        
        // Remover da exibição
        const alertElement = document.querySelector(`[data-alert-id="${alertId}"]`);
        if (alertElement) {
            alertElement.remove();
        }
        
        // Se não há mais alertas, atualizar a exibição
        if (this.currentUser.alerts.length === 0) {
            const alertsContainer = document.querySelector('.user-alerts');
            if (alertsContainer) {
                alertsContainer.innerHTML = `
                    <div class="alert-item text-center text-muted">
                        <i class="fas fa-info-circle fa-2x mb-2"></i><br>
                        <strong>Nenhum alerta</strong><br>
                        Não tem alertas pendentes no momento.
                    </div>
                `;
            }
        }
    }

    // Limpar todos os alertas
    clearAllAlerts() {
        if (!this.currentUser) return;
        
        if (confirm('Tem certeza que deseja limpar todos os alertas? Esta ação não pode ser desfeita.')) {
            this.currentUser.alerts = [];
            this.updateUserInStorage();
            this.updateAlertIndicator();
            
            // Fechar modal
            const modal = document.querySelector('.user-modal');
            if (modal) modal.remove();
        }
    }

    // Obter ícone para tipo de alerta
    getAlertIcon(type) {
        const icons = {
            'success': 'fas fa-check-circle text-success',
            'warning': 'fas fa-exclamation-triangle text-warning',
            'error': 'fas fa-times-circle text-danger',
            'info': 'fas fa-info-circle text-info',
            'medication': 'fas fa-pills text-primary',
            'calendar': 'fas fa-calendar-alt text-secondary'
        };
        return icons[type] || icons['info'];
    }

    // Atualizar utilizador no localStorage
    updateUserInStorage() {
        if (!this.currentUser) return;
        
        // Atualizar na lista de utilizadores
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
            localStorage.setItem('cuidaconchego_users', JSON.stringify(this.users));
        }
        
        // Atualizar utilizador atual
        localStorage.setItem('cuidaconchego_current_user', JSON.stringify(this.currentUser));
    }

    // Atualizar indicador visual de alertas não lidos
    updateAlertIndicator() {
        if (!this.currentUser) return;
        
        const unreadCount = this.currentUser.alerts ? this.currentUser.alerts.filter(a => !a.read).length : 0;
        const userBtn = document.getElementById('userBtn');
        
        // Remover indicador existente
        const existingIndicator = userBtn.querySelector('.alert-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Adicionar novo indicador se houver alertas não lidos
        if (unreadCount > 0) {
            const indicator = document.createElement('span');
            indicator.className = 'alert-indicator badge bg-danger position-absolute';
            indicator.style.cssText = 'top: -5px; right: -5px; font-size: 10px; min-width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center;';
            indicator.textContent = unreadCount > 99 ? '99+' : unreadCount;
            userBtn.style.position = 'relative';
            userBtn.appendChild(indicator);
        }
    }
}

// Inicializar sistema quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    window.userSystem = new UserSystem();
});

