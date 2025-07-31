// Variáveis globais
let medicamentos = JSON.parse(localStorage.getItem('medicamentos')) || [];
let dataAtual = new Date();
let mesAtual = dataAtual.getMonth();
let anoAtual = dataAtual.getFullYear();

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    inicializarCalendario();
    atualizarEstatisticas();
    atualizarMedicamentosHoje();
    configurarEventos();
    
    // Definir data atual no input
    document.getElementById('dataAtual').value = formatarDataInput(new Date());
});

// Configurar eventos
function configurarEventos() {
    // Evento para mudança de frequência
    document.getElementById('frequencia').addEventListener('change', function() {
        atualizarHorarios(this.value);
    });
    
    // Evento para mudança de data
    document.getElementById('dataAtual').addEventListener('change', function() {
        const novaData = new Date(this.value);
        mesAtual = novaData.getMonth();
        anoAtual = novaData.getFullYear();
        renderizarCalendario();
    });
    
    // Evento para filtro de medicamento
    document.getElementById('filtroMedicamento').addEventListener('change', function() {
        renderizarCalendario();
    });
    
    // Definir data de início como hoje por padrão
    document.getElementById('dataInicio').value = formatarDataInput(new Date());
}

// Função para voltar à página de recursos
function voltarRecursos() {
    if (confirm('Deseja voltar à página de recursos? Todas as alterações não salvas serão perdidas.')) {
        window.history.back();
    }
}

// Inicializar calendário
function inicializarCalendario() {
    atualizarFiltroMedicamentos();
    renderizarCalendario();
}

// Atualizar horários baseado na frequência
function atualizarHorarios(frequencia) {
    const container = document.getElementById('horariosInputs');
    container.innerHTML = '';
    
    if (frequencia === 'personalizada') {
        container.innerHTML = `
            <div class="input-group mb-2">
                <span class="input-group-text">Horário</span>
                <input type="time" class="form-control horario-input" required>
                <button type="button" class="btn btn-outline-secondary" onclick="adicionarHorario()">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
        return;
    }
    
    const numHorarios = parseInt(frequencia);
    if (numHorarios > 0) {
        const horariosDefault = {
            1: ['08:00'],
            2: ['08:00', '20:00'],
            3: ['08:00', '14:00', '20:00'],
            4: ['08:00', '12:00', '16:00', '20:00']
        };
        
        const horarios = horariosDefault[numHorarios] || [];
        
        for (let i = 0; i < numHorarios; i++) {
            container.innerHTML += `
                <div class="input-group mb-2">
                    <span class="input-group-text">${i + 1}º horário</span>
                    <input type="time" class="form-control horario-input" value="${horarios[i] || ''}" required>
                </div>
            `;
        }
    }
}

// Adicionar horário personalizado
function adicionarHorario() {
    const container = document.getElementById('horariosInputs');
    const numHorarios = container.children.length;
    
    const novoHorario = document.createElement('div');
    novoHorario.className = 'input-group mb-2';
    novoHorario.innerHTML = `
        <span class="input-group-text">${numHorarios + 1}º horário</span>
        <input type="time" class="form-control horario-input" required>
        <button type="button" class="btn btn-outline-danger" onclick="removerHorario(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    container.appendChild(novoHorario);
}

// Remover horário
function removerHorario(botao) {
    botao.parentElement.remove();
    
    // Reordenar números dos horários
    const container = document.getElementById('horariosInputs');
    const horarios = container.children;
    
    for (let i = 0; i < horarios.length; i++) {
        const span = horarios[i].querySelector('.input-group-text');
        span.textContent = `${i + 1}º horário`;
    }
}

// Salvar medicamento
function salvarMedicamento() {
    const form = document.getElementById('formMedicamento');
    const formData = new FormData(form);
    
    const nome = document.getElementById('nomeMedicamento').value.trim();
    const dosagem = document.getElementById('dosagem').value.trim();
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;
    const cor = document.getElementById('cor').value;
    const observacoes = document.getElementById('observacoes').value.trim();
    
    // Coletar horários
    const horariosInputs = document.querySelectorAll('.horario-input');
    const horarios = Array.from(horariosInputs)
        .map(input => input.value)
        .filter(horario => horario);
    
    // Validações
    if (!nome || !dosagem || !dataInicio || horarios.length === 0) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    if (dataFim && new Date(dataFim) < new Date(dataInicio)) {
        alert('A data de fim deve ser posterior à data de início.');
        return;
    }
    
    // Criar objeto medicamento
    const medicamento = {
        id: Date.now(),
        nome,
        dosagem,
        horarios,
        dataInicio: new Date(dataInicio),
        dataFim: dataFim ? new Date(dataFim) : null,
        cor,
        observacoes,
        historico: []
    };
    
    // Adicionar à lista
    medicamentos.push(medicamento);
    salvarDados();
    
    // Gerar alerta para o utilizador logado
    if (window.userSystem && window.userSystem.currentUser) {
        const horariosTexto = horarios.join(', ');
        const dataFimTexto = dataFim ? ` até ${new Date(dataFim).toLocaleDateString('pt-PT')}` : '';
        window.userSystem.addAlert(
            `Medicamento "${nome}" (${dosagem}) foi adicionado ao seu calendário. Horários: ${horariosTexto}${dataFimTexto}.`,
            'medication',
            'Novo Medicamento Adicionado'
        );
    }
    
    // Atualizar interface
    atualizarFiltroMedicamentos();
    renderizarCalendario();
    atualizarEstatisticas();
    atualizarMedicamentosHoje();
    
    // Fechar modal e limpar form
    const modal = bootstrap.Modal.getInstance(document.getElementById('medicamentoModal'));
    modal.hide();
    form.reset();
    
    // Mostrar mensagem de sucesso
    mostrarNotificacao('Medicamento adicionado com sucesso!', 'success');
}

// Navegar entre meses
function navegarMes(direcao) {
    mesAtual += direcao;
    
    if (mesAtual > 11) {
        mesAtual = 0;
        anoAtual++;
    } else if (mesAtual < 0) {
        mesAtual = 11;
        anoAtual--;
    }
    
    renderizarCalendario();
    atualizarMedicamentosHoje();
}

// Renderizar calendário
function renderizarCalendario() {
    const grid = document.getElementById('calendarioGrid');
    const mesAnoElement = document.getElementById('mesAno');
    
    // Atualizar título
    const nomesMeses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    mesAnoElement.textContent = `${nomesMeses[mesAtual]} ${anoAtual}`;
    
    // Limpar grid (manter cabeçalhos)
    const headers = grid.querySelectorAll('.calendar-day-header');
    grid.innerHTML = '';
    headers.forEach(header => grid.appendChild(header));
    
    // Calcular primeiro dia do mês e número de dias
    const primeiroDia = new Date(anoAtual, mesAtual, 1);
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay();
    
    // Filtro de medicamento
    const filtroMedicamento = document.getElementById('filtroMedicamento').value;
    const medicamentosFiltrados = filtroMedicamento 
        ? medicamentos.filter(med => med.id.toString() === filtroMedicamento)
        : medicamentos;
    
    // Adicionar dias do mês anterior
    const mesAnterior = new Date(anoAtual, mesAtual, 0);
    const diasMesAnterior = mesAnterior.getDate();
    
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
        const dia = diasMesAnterior - i;
        const dataCompleta = new Date(anoAtual, mesAtual - 1, dia);
        criarDiaCalendario(dia, dataCompleta, true, medicamentosFiltrados);
    }
    
    // Adicionar dias do mês atual
    for (let dia = 1; dia <= diasNoMes; dia++) {
        const dataCompleta = new Date(anoAtual, mesAtual, dia);
        criarDiaCalendario(dia, dataCompleta, false, medicamentosFiltrados);
    }
    
    // Adicionar dias do próximo mês para completar a grade
    const diasRestantes = 42 - (diaSemanaInicio + diasNoMes);
    for (let dia = 1; dia <= diasRestantes; dia++) {
        const dataCompleta = new Date(anoAtual, mesAtual + 1, dia);
        criarDiaCalendario(dia, dataCompleta, true, medicamentosFiltrados);
    }
}

// Criar elemento de dia no calendário
function criarDiaCalendario(dia, data, outroMes, medicamentosFiltrados) {
    const grid = document.getElementById('calendarioGrid');
    const diaElement = document.createElement('div');
    diaElement.className = 'calendar-day';
    
    if (outroMes) {
        diaElement.classList.add('other-month');
    }
    
    // Verificar se é hoje
    const hoje = new Date();
    if (data.toDateString() === hoje.toDateString()) {
        diaElement.classList.add('today');
    }
    
    // Número do dia
    const numeroElement = document.createElement('div');
    numeroElement.className = 'day-number';
    numeroElement.textContent = dia;
    diaElement.appendChild(numeroElement);
    
    // Medicamentos do dia
    const medicamentosDia = obterMedicamentosDia(data, medicamentosFiltrados);
    
    if (medicamentosDia.length > 0) {
        diaElement.classList.add('has-medication');
        
        medicamentosDia.forEach(item => {
            const medicamentoElement = document.createElement('div');
            medicamentoElement.className = 'medication-item';
            medicamentoElement.style.backgroundColor = item.medicamento.cor;
            
            // Verificar status
            const agora = new Date();
            const dataHorario = new Date(data);
            const [horas, minutos] = item.horario.split(':');
            dataHorario.setHours(parseInt(horas), parseInt(minutos), 0, 0);
            
            const foiTomado = verificarMedicamentoTomado(item.medicamento.id, data, item.horario);
            
            if (foiTomado) {
                medicamentoElement.classList.add('taken');
            } else if (dataHorario < agora && data.toDateString() === hoje.toDateString()) {
                medicamentoElement.classList.add('overdue');
            }
            
            medicamentoElement.innerHTML = `
                <span>${item.medicamento.nome}</span>
                <span class="medication-time">${item.horario}</span>
            `;
            
            medicamentoElement.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMedicamento(item.medicamento.id, data, item.horario);
            });
            
            diaElement.appendChild(medicamentoElement);
        });
    }
    
    // Evento de clique no dia
    diaElement.addEventListener('click', () => {
        mostrarDetalheDia(data, medicamentosDia);
    });
    
    grid.appendChild(diaElement);
}

// Obter medicamentos de um dia específico
function obterMedicamentosDia(data, medicamentosFiltrados) {
    const medicamentosDia = [];
    
    medicamentosFiltrados.forEach(medicamento => {
        // Verificar se o medicamento está ativo nesta data
        if (data >= medicamento.dataInicio && 
            (!medicamento.dataFim || data <= medicamento.dataFim)) {
            
            medicamento.horarios.forEach(horario => {
                medicamentosDia.push({
                    medicamento,
                    horario
                });
            });
        }
    });
    
    return medicamentosDia.sort((a, b) => a.horario.localeCompare(b.horario));
}

// Verificar se medicamento foi tomado
function verificarMedicamentoTomado(medicamentoId, data, horario) {
    const medicamento = medicamentos.find(med => med.id === medicamentoId);
    if (!medicamento) return false;
    
    const dataStr = formatarData(data);
    return medicamento.historico.some(registro => 
        registro.data === dataStr && 
        registro.horario === horario && 
        registro.tomado
    );
}

// Toggle status do medicamento
function toggleMedicamento(medicamentoId, data, horario) {
    const medicamento = medicamentos.find(med => med.id === medicamentoId);
    if (!medicamento) return;
    
    const dataStr = formatarData(data);
    const registroIndex = medicamento.historico.findIndex(registro => 
        registro.data === dataStr && registro.horario === horario
    );
    
    let novoStatus = true;
    
    if (registroIndex >= 0) {
        // Atualizar registro existente
        medicamento.historico[registroIndex].tomado = !medicamento.historico[registroIndex].tomado;
        medicamento.historico[registroIndex].timestamp = new Date();
        novoStatus = medicamento.historico[registroIndex].tomado;
    } else {
        // Criar novo registro
        medicamento.historico.push({
            data: dataStr,
            horario,
            tomado: true,
            timestamp: new Date()
        });
        novoStatus = true;
    }
    
    salvarDados();
    
    // Gerar alerta para o utilizador logado
    if (window.userSystem && window.userSystem.currentUser) {
        const dataFormatada = new Date(data).toLocaleDateString('pt-PT');
        const statusTexto = novoStatus ? 'tomado' : 'desmarcado';
        const alertType = novoStatus ? 'success' : 'warning';
        
        window.userSystem.addAlert(
            `Medicamento "${medicamento.nome}" às ${horario} do dia ${dataFormatada} foi ${statusTexto}.`,
            alertType,
            `Medicamento ${novoStatus ? 'Tomado' : 'Desmarcado'}`
        );
    }
    
    renderizarCalendario();
    atualizarEstatisticas();
    atualizarMedicamentosHoje();
    
    const status = medicamento.historico[registroIndex]?.tomado || true;
    mostrarNotificacao(
        `Medicamento ${status ? 'marcado como tomado' : 'desmarcado'}!`,
        status ? 'success' : 'warning'
    );
}

// Mostrar detalhes do dia
function mostrarDetalheDia(data, medicamentosDia) {
    const modal = new bootstrap.Modal(document.getElementById('detalheDiaModal'));
    const titulo = document.getElementById('tituloDetalheDia');
    const conteudo = document.getElementById('conteudoDetalheDia');
    
    titulo.innerHTML = `
        <i class="fas fa-calendar-day me-2"></i>
        ${formatarDataExibicao(data)}
    `;
    
    if (medicamentosDia.length === 0) {
        conteudo.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-info-circle fa-3x mb-3"></i>
                <p>Nenhum medicamento agendado para este dia.</p>
            </div>
        `;
    } else {
        let html = '<div class="row g-3">';
        
        medicamentosDia.forEach(item => {
            const foiTomado = verificarMedicamentoTomado(item.medicamento.id, data, item.horario);
            const agora = new Date();
            const dataHorario = new Date(data);
            const [horas, minutos] = item.horario.split(':');
            dataHorario.setHours(parseInt(horas), parseInt(minutos), 0, 0);
            
            let statusClass = 'status-pending';
            let statusText = 'Pendente';
            
            if (foiTomado) {
                statusClass = 'status-taken';
                statusText = 'Tomado';
            } else if (dataHorario < agora && data.toDateString() === new Date().toDateString()) {
                statusClass = 'status-overdue';
                statusText = 'Atrasado';
            }
            
            html += `
                <div class="col-12">
                    <div class="medication-card ${foiTomado ? 'taken' : ''}">
                        <div class="medication-header">
                            <div>
                                <h5 class="medication-name">${item.medicamento.nome}</h5>
                                <p class="medication-dosage">${item.medicamento.dosagem}</p>
                            </div>
                            <div class="text-end">
                                <div class="medication-time-large">${item.horario}</div>
                                <div class="d-flex align-items-center justify-content-end mt-1">
                                    <span class="status-indicator ${statusClass}"></span>
                                    <small class="text-muted">${statusText}</small>
                                </div>
                            </div>
                        </div>
                        ${item.medicamento.observacoes ? `
                            <div class="mb-2">
                                <small class="text-muted">
                                    <i class="fas fa-sticky-note me-1"></i>
                                    ${item.medicamento.observacoes}
                                </small>
                            </div>
                        ` : ''}
                        <div class="medication-actions">
                            <button class="btn btn-sm ${foiTomado ? 'btn-outline-warning' : 'btn-success'}" 
                                    onclick="toggleMedicamento(${item.medicamento.id}, new Date('${data.toISOString()}'), '${item.horario}'); atualizarModalDetalhes(new Date('${data.toISOString()}'))">
                                <i class="fas ${foiTomado ? 'fa-undo' : 'fa-check'} me-1"></i>
                                ${foiTomado ? 'Desmarcar' : 'Marcar como Tomado'}
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="removerMedicamento(${item.medicamento.id})">
                                <i class="fas fa-trash me-1"></i>Remover
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        conteudo.innerHTML = html;
    }
    
    modal.show();
}

// Atualizar modal de detalhes
function atualizarModalDetalhes(data) {
    const medicamentosDia = obterMedicamentosDia(data, medicamentos);
    mostrarDetalheDia(data, medicamentosDia);
}

// Atualizar medicamentos de hoje
function atualizarMedicamentosHoje() {
    const container = document.getElementById('medicamentosHoje');
    const hoje = new Date();
    const medicamentosHoje = obterMedicamentosDia(hoje, medicamentos);
    
    if (medicamentosHoje.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted">
                <i class="fas fa-info-circle me-2"></i>
                Nenhum medicamento agendado para hoje
            </div>
        `;
        return;
    }
    
    let html = '';
    medicamentosHoje.forEach(item => {
        const foiTomado = verificarMedicamentoTomado(item.medicamento.id, hoje, item.horario);
        const agora = new Date();
        const [horas, minutos] = item.horario.split(':');
        const dataHorario = new Date(hoje);
        dataHorario.setHours(parseInt(horas), parseInt(minutos), 0, 0);
        
        let cardClass = '';
        let statusText = 'Pendente';
        
        if (foiTomado) {
            cardClass = 'taken';
            statusText = 'Tomado';
        } else if (dataHorario < agora) {
            cardClass = 'overdue';
            statusText = 'Atrasado';
        }
        
        html += `
            <div class="col-md-6 col-lg-4">
                <div class="medication-card ${cardClass}">
                    <div class="medication-header">
                        <div>
                            <h5 class="medication-name">${item.medicamento.nome}</h5>
                            <p class="medication-dosage">${item.medicamento.dosagem}</p>
                        </div>
                        <div class="text-end">
                            <div class="medication-time-large">${item.horario}</div>
                            <small class="text-muted">${statusText}</small>
                        </div>
                    </div>
                    ${item.medicamento.observacoes ? `
                        <div class="mb-2">
                            <small class="text-muted">
                                <i class="fas fa-sticky-note me-1"></i>
                                ${item.medicamento.observacoes}
                            </small>
                        </div>
                    ` : ''}
                    <div class="medication-actions">
                        <button class="btn btn-sm ${foiTomado ? 'btn-outline-warning' : 'btn-success'}" 
                                onclick="toggleMedicamento(${item.medicamento.id}, new Date(), '${item.horario}')">
                            <i class="fas ${foiTomado ? 'fa-undo' : 'fa-check'} me-1"></i>
                            ${foiTomado ? 'Desmarcar' : 'Marcar como Tomado'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Atualizar estatísticas
function atualizarEstatisticas() {
    const hoje = new Date();
    const medicamentosHoje = obterMedicamentosDia(hoje, medicamentos);
    
    // Total de medicamentos
    document.getElementById('totalMedicamentos').textContent = medicamentos.length;
    
    // Medicamentos tomados hoje
    const tomadosHoje = medicamentosHoje.filter(item => 
        verificarMedicamentoTomado(item.medicamento.id, hoje, item.horario)
    ).length;
    document.getElementById('medicamentosTomados').textContent = tomadosHoje;
    
    // Medicamentos pendentes hoje
    const pendentesHoje = medicamentosHoje.length - tomadosHoje;
    document.getElementById('medicamentosPendentes').textContent = pendentesHoje;
    
    // Adesão semanal
    const adesaoSemanal = calcularAdesaoSemanal();
    document.getElementById('percentualAdesao').textContent = `${adesaoSemanal}%`;
}

// Calcular adesão semanal
function calcularAdesaoSemanal() {
    const hoje = new Date();
    const umaSemanaAtras = new Date(hoje);
    umaSemanaAtras.setDate(hoje.getDate() - 7);
    
    let totalMedicamentos = 0;
    let medicamentosTomados = 0;
    
    for (let d = new Date(umaSemanaAtras); d <= hoje; d.setDate(d.getDate() + 1)) {
        const medicamentosDia = obterMedicamentosDia(new Date(d), medicamentos);
        totalMedicamentos += medicamentosDia.length;
        
        medicamentosDia.forEach(item => {
            if (verificarMedicamentoTomado(item.medicamento.id, new Date(d), item.horario)) {
                medicamentosTomados++;
            }
        });
    }
    
    return totalMedicamentos > 0 ? Math.round((medicamentosTomados / totalMedicamentos) * 100) : 0;
}

// Atualizar filtro de medicamentos
function atualizarFiltroMedicamentos() {
    const select = document.getElementById('filtroMedicamento');
    const opcaoAtual = select.value;
    
    select.innerHTML = '<option value="">Todos os medicamentos</option>';
    
    medicamentos.forEach(medicamento => {
        const option = document.createElement('option');
        option.value = medicamento.id;
        option.textContent = `${medicamento.nome} (${medicamento.dosagem})`;
        select.appendChild(option);
    });
    
    // Restaurar seleção se ainda existir
    if (opcaoAtual && medicamentos.find(med => med.id.toString() === opcaoAtual)) {
        select.value = opcaoAtual;
    }
}

// Remover medicamento
function removerMedicamento(medicamentoId) {
    const medicamento = medicamentos.find(med => med.id === medicamentoId);
    if (!medicamento) return;
    
    if (confirm('Tem certeza que deseja remover este medicamento? Esta ação não pode ser desfeita.')) {
        // Gerar alerta para o utilizador logado antes de remover
        if (window.userSystem && window.userSystem.currentUser) {
            window.userSystem.addAlert(
                `Medicamento "${medicamento.nome}" (${medicamento.dosagem}) foi removido do seu calendário.`,
                'warning',
                'Medicamento Removido'
            );
        }
        
        medicamentos = medicamentos.filter(med => med.id !== medicamentoId);
        salvarDados();
        
        atualizarFiltroMedicamentos();
        renderizarCalendario();
        atualizarEstatisticas();
        atualizarMedicamentosHoje();
        
        // Fechar modal se estiver aberto
        const modal = bootstrap.Modal.getInstance(document.getElementById('detalheDiaModal'));
        if (modal) {
            modal.hide();
        }
        
        mostrarNotificacao('Medicamento removido com sucesso!', 'success');
    }
}

// Exportar calendário para PDF
function exportarCalendario() {
    mostrarNotificacao('Funcionalidade de exportação em desenvolvimento!', 'info');
}

// Salvar dados no localStorage
function salvarDados() {
    localStorage.setItem('medicamentos', JSON.stringify(medicamentos));
}

// Funções utilitárias
function formatarData(data) {
    return data.toISOString().split('T')[0];
}

function formatarDataInput(data) {
    return data.toISOString().split('T')[0];
}

function formatarDataExibicao(data) {
    const opcoes = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return data.toLocaleDateString('pt-PT', opcoes);
}

// Mostrar notificação
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = `alert alert-${tipo === 'success' ? 'success' : tipo === 'warning' ? 'warning' : tipo === 'error' ? 'danger' : 'info'} alert-dismissible fade show position-fixed`;
    notificacao.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
    
    notificacao.innerHTML = `
        ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notificacao);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (notificacao.parentNode) {
            notificacao.remove();
        }
    }, 5000);
}

// Dados de exemplo para demonstração
function carregarDadosExemplo() {
    if (medicamentos.length === 0) {
        const exemplos = [
            {
                id: 1,
                nome: 'Paracetamol',
                dosagem: '500mg',
                horarios: ['08:00', '20:00'],
                dataInicio: new Date(),
                dataFim: null,
                cor: '#D78F69',
                observacoes: 'Tomar com alimentos',
                historico: []
            },
            {
                id: 2,
                nome: 'Vitamina D',
                dosagem: '1000 UI',
                horarios: ['09:00'],
                dataInicio: new Date(),
                dataFim: null,
                cor: '#A7C7E7',
                observacoes: 'Tomar após o pequeno-almoço',
                historico: []
            }
        ];
        
        medicamentos = exemplos;
        salvarDados();
        
        atualizarFiltroMedicamentos();
        renderizarCalendario();
        atualizarEstatisticas();
        atualizarMedicamentosHoje();
        
        mostrarNotificacao('Dados de exemplo carregados!', 'info');
    }
}

// Carregar dados de exemplo se não houver medicamentos
setTimeout(() => {
    if (medicamentos.length === 0) {
        carregarDadosExemplo();
    }
}, 1000);

