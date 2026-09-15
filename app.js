// ==========================================
// 1. GERAÇÃO DA TABELA DE 100 DEPOSITANTES
// ==========================================
const TOTAL_ROWS = 100;

function renderTable() {
    const tbody = document.getElementById('depositantesTableBody');
    let html = '';

    for (let i = 1; i <= TOTAL_ROWS; i++) {
html += `
            <tr>
                <td style="text-align: center; color: var(--text-dim);">${i}</td>
                <td>
                    <input type="text" class="profile-name" id="name_${i}" data-row="${i}" data-col="1" placeholder="Depositante ${i}" oninput="calcularTotais()">
                </td>
                <td>
                    <input type="number" step="0.01" min="0" id="dep_${i}" data-row="${i}" data-col="2" placeholder="0,00" oninput="calcularTotais()">
                </td>
                <td>
                    <input type="number" step="0.01" min="0" id="bon_${i}" data-row="${i}" data-col="3" placeholder="0,00" oninput="calcularTotais()">
                </td>
                <td>
                    <input type="number" step="0.01" min="0" id="saq_${i}" data-row="${i}" data-col="4" placeholder="0,00" oninput="calcularTotais()">
                </td>
                <td>
                    <input type="number" step="0.01" min="0" id="coop_${i}" data-row="${i}" data-col="5" placeholder="0,00" oninput="calcularTotais()">
                </td>
                <td class="lucro-cell lucro-zero" id="lucro_${i}">R$ 0,00</td>
        `;
    }
    tbody.innerHTML = html;
}

// ==========================================
// 2. CÁLCULO DE TOTAIS EM TEMPO REAL
// ==========================================
function formatMoney(val) {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcularTotais() {
    let totalDep = 0;
    let totalBon = 0;
    let totalSaq = 0;
    let totalCoop = 0;

    for (let i = 1; i <= TOTAL_ROWS; i++) {
        const depInput = document.getElementById(`dep_${i}`);
        const bonInput = document.getElementById(`bon_${i}`);
        const saqInput = document.getElementById(`saq_${i}`);
        const coopInput = document.getElementById(`coop_${i}`);
        const lucroCell = document.getElementById(`lucro_${i}`);

        const dep = parseFloat(depInput.value) || 0;
        const bon = parseFloat(bonInput.value) || 0;
        const saq = parseFloat(saqInput.value) || 0;
        const coop = parseFloat(coopInput.value) || 0;

        const lucro = (saq + coop) - dep;

        totalDep += dep;
        totalBon += bon;
        totalSaq += saq;
        totalCoop += coop;

        lucroCell.innerText = formatMoney(lucro);
        if (lucro > 0) {
            lucroCell.className = 'lucro-cell lucro-positive';
        } else if (lucro < 0) {
            lucroCell.className = 'lucro-cell lucro-negative';
        } else {
            lucroCell.className = 'lucro-cell lucro-zero';
        }
    }

    const lucroLiquido = (totalSaq + totalCoop) - totalDep;

    document.getElementById('cardTotalDeposito').innerText = formatMoney(totalDep);
    document.getElementById('cardTotalBonus').innerText = formatMoney(totalBon);
    document.getElementById('cardTotalSaque').innerText = formatMoney(totalSaq);
    document.getElementById('cardTotalCooperacao').innerText = formatMoney(totalCoop);
    document.getElementById('cardLucroLiquido').innerText = formatMoney(lucroLiquido);

    document.getElementById('summaryDeposito').innerText = formatMoney(totalDep);
    document.getElementById('summaryBonus').innerText = formatMoney(totalBon);
    document.getElementById('summarySaque').innerText = formatMoney(totalSaq);
    document.getElementById('summaryCooperacao').innerText = formatMoney(totalCoop);
    document.getElementById('summaryLucro').innerText = formatMoney(lucroLiquido);
    document.getElementById('caixaFinal').innerText = formatMoney(lucroLiquido);
}

function limparTabela() {
    if (confirm("Deseja realmente limpar todos os campos da tabela?")) {
        for (let i = 1; i <= TOTAL_ROWS; i++) {
            document.getElementById(`name_${i}`).value = '';
            document.getElementById(`dep_${i}`).value = '';
            document.getElementById(`bon_${i}`).value = '';
            document.getElementById(`saq_${i}`).value = '';
            document.getElementById(`coop_${i}`).value = '';
        }
        calcularTotais();
        showToast("Tabela limpa com sucesso!");
    }
}

// ==========================================
// 3. HISTÓRICO LOCALSTORAGE
// ==========================================
function salvarFechamento() {
    let totalDep = 0;
    let totalBon = 0;
    let totalSaq = 0;
    let totalCoop = 0;
    let preenchidos = 0;

    for (let i = 1; i <= TOTAL_ROWS; i++) {
        const dep = parseFloat(document.getElementById(`dep_${i}`).value) || 0;
        const bon = parseFloat(document.getElementById(`bon_${i}`).value) || 0;
        const saq = parseFloat(document.getElementById(`saq_${i}`).value) || 0;
        const coop = parseFloat(document.getElementById(`coop_${i}`).value) || 0;

        if (dep > 0 || bon > 0 || saq > 0 || coop > 0) preenchidos++;
        totalDep += dep;
        totalBon += bon;
        totalSaq += saq;
        totalCoop += coop;
    }

    if (preenchidos === 0) {
        showToast("Preencha ao menos um valor antes de salvar!");
        return;
    }

    const plataforma = document.getElementById('platformName').value || 'CPA Pro';
    const novoItem = {
        id: Date.now(),
        data: new Date().toLocaleString('pt-BR'),
        plataforma: plataforma,
        deposito: totalDep,
        bonus: totalBon,
        saque: totalSaq,
        cooperacao: totalCoop,
        lucro: (totalSaq + totalCoop) - totalDep,
        depositantesAtivos: preenchidos
    };

    const historico = JSON.parse(localStorage.getItem('fechamentos_cpa') || '[]');
    historico.unshift(novoItem);
    localStorage.setItem('fechamentos_cpa', JSON.stringify(historico));

    renderHistorico();
    showToast("Fechamento salvo no histórico!");
}

function renderHistorico() {
    const grid = document.getElementById('historyGrid');
    const historico = JSON.parse(localStorage.getItem('fechamentos_cpa') || '[]');

    if (historico.length === 0) {
        grid.innerHTML = `<div class="empty-history">Nenhum fechamento salvo até o momento.</div>`;
        return;
    }

    let html = '';
    historico.forEach(item => {
        const isLucroPos = item.lucro >= 0;
        html += `
        <div class="history-card">
            <div class="history-header">
                <div class="history-date">
                    <i data-lucide="calendar"></i> ${item.data}
                </div>
                <button class="btn-delete-hist" onclick="deletarItemHistorico(${item.id})">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="history-details">
                <div class="history-item">
                    <span class="history-item-label">Plataforma</span>
                    <span class="history-item-val">${item.plataforma}</span>
                </div>
                <div class="history-item">
                    <span class="history-item-label">Ativos</span>
                    <span class="history-item-val">${item.depositantesAtivos} contas</span>
                </div>
                <div class="history-item">
                    <span class="history-item-label">Depósitos</span>
                    <span class="history-item-val" style="color: var(--stat-amber);">${formatMoney(item.deposito)}</span>
                </div>
                <div class="history-item">
                    <span class="history-item-label">Bônus</span>
                    <span class="history-item-val" style="color: var(--stat-cyan);">${formatMoney(item.bonus || 0)}</span>
                </div>
                <div class="history-item">
                    <span class="history-item-label">Saques</span>
                    <span class="history-item-val" style="color: var(--accent-primary);">${formatMoney(item.saque)}</span>
                </div>
                <div class="history-item">
                    <span class="history-item-label">Cooperação</span>
                    <span class="history-item-val" style="color: var(--stat-purple);">${formatMoney(item.cooperacao || 0)}</span>
                </div>
                <div class="history-lucro">
                    <span class="history-item-label">Lucro Líquido</span>
                    <span class="history-lucro-val ${isLucroPos ? 'lucro-positive' : 'lucro-negative'}">
                        ${formatMoney(item.lucro)}
                    </span>
                </div>
            </div>
        </div>
        `;
    });

    grid.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}

function deletarItemHistorico(id) {
    let historico = JSON.parse(localStorage.getItem('fechamentos_cpa') || '[]');
    historico = historico.filter(item => item.id !== id);
    localStorage.setItem('fechamentos_cpa', JSON.stringify(historico));
    renderHistorico();
    showToast("Fechamento removido!");
}

function limparHistorico() {
    if (confirm("Tem certeza que deseja apagar todo o histórico de fechamentos?")) {
        localStorage.removeItem('fechamentos_cpa');
        renderHistorico();
        showToast("Histórico apagado!");
    }
}

// ==========================================
// 4. TEMAS & UTILS
// ==========================================
function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
}

function showToast(msg) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="check-circle" style="color: var(--stat-green);"></i> ${msg}`;
    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ==========================================
// 5. AUTENTICAÇÃO E CHECAGEM DINÂMICA
// ==========================================
function fecharLogin() {
    const overlay = document.getElementById('loginOverlay');
    if (overlay) overlay.style.setProperty('display', 'none', 'important');
}

function abrirLogin() {
    const overlay = document.getElementById('loginOverlay');
    if (overlay) overlay.style.setProperty('display', 'flex', 'important');
}

function validarToken() {
    const tokenInput = document.getElementById('loginToken').value.trim();
    const errorElement = document.getElementById('loginError');

    if (typeof verificarTokenValido === "function" && verificarTokenValido(tokenInput)) {
        // Salva o TOKEN específico que a pessoa digitou
        localStorage.setItem('user_token_ativo', tokenInput);
        errorElement.style.display = 'none';
        fecharLogin();
        showToast("Acesso liberado com sucesso!");
    } else {
        errorElement.innerText = "Token inválido ou revogado.";
        errorElement.style.display = 'block';
    }
}

function fazerLogout() {
    if (confirm("Deseja sair da sua conta?")) {
        localStorage.removeItem('user_token_ativo');
        abrirLogin();
    }
}

// INICIALIZAÇÃO E RE-VALIDAÇÃO AUTOMÁTICA
window.onload = function() {
    renderTable();
    renderHistorico();
    if (window.lucide) lucide.createIcons();

    // Pega o token salvo na máquina do cliente
    const tokenSalvo = localStorage.getItem('user_token_ativo');

    // Checa se o token salvo AINDA EXISTE na lista do config.js
    if (tokenSalvo && typeof verificarTokenValido === "function" && verificarTokenValido(tokenSalvo)) {
        fecharLogin(); // Token ainda está autorizado
    } else {
        // Se o token foi deletado do config.js, limpa o cache local e bloqueia a tela
        localStorage.removeItem('user_token_ativo');
        abrirLogin();
    }
};
// Ação da tecla Enter para pular para a linha de baixo na mesma coluna
document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        
        if (activeElement && activeElement.tagName === 'INPUT' && activeElement.hasAttribute('data-row')) {
            e.preventDefault();
            
            const currentRow = parseInt(activeElement.getAttribute('data-row'), 10);
            const currentCol = activeElement.getAttribute('data-col');
            const nextRow = currentRow + 1;

            const nextInput = document.querySelector(`input[data-row="${nextRow}"][data-col="${currentCol}"]`);

            if (nextInput) {
                nextInput.focus();
                nextInput.select();
            }
        }
    }
});

// ==========================================
// FUNÇÕES DE BACKUP (EXPORTAR E IMPORTAR)
// ==========================================
function exportarBackup() {
    const dados = {
        historico: localStorage.getItem('dashboard_historico_salvo'),
        tokenAtivo: localStorage.getItem('user_token_ativo')
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dados));
    const downloadAnchor = document.createElement('a');
    const dataAtual = new Date().toISOString().slice(0, 10);
    
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `backup_dashboard_${dataAtual}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importarBackup(event) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            if (dados.historico) {
                localStorage.setItem('dashboard_historico_salvo', dados.historico);
                alert("Backup restaurado com sucesso!");
                location.reload();
            }
        } catch (err) {
            alert("Erro ao ler o arquivo de backup!");
        }
    };
    reader.readAsText(event.target.files[0]);
}

// ==========================================
// FUNÇÃO MODO FOCO (ESCONDER / REVELAR COLUNAS)
// ==========================================
function alternarModoFoco() {
   const colunasParaOcultar = [2, 4]; 

    const btn = document.getElementById('btn-modo-foco');
    const estaAtivo = btn.classList.toggle('btn-foco-ativo');

    if (estaAtivo) {
        btn.innerHTML = '<i data-lucide="eye"></i> Mostrar Tudo';
    } else {
        btn.innerHTML = '<i data-lucide="eye-off"></i> Modo Foco';
    }

    colunasParaOcultar.forEach(colIndex => {
        const th = document.querySelector(`table th:nth-child(${colIndex})`);
        if (th) th.classList.toggle('ocultar-coluna');

        const tds = document.querySelectorAll(`table td:nth-child(${colIndex})`);
        tds.forEach(td => td.classList.toggle('ocultar-coluna'));
    });

    if (window.lucide) lucide.createIcons();
}
