document.addEventListener('DOMContentLoaded', () => {
    const seletorSimulado = document.getElementById('simulado');
    const inputMatricula = document.getElementById('matricula');
    const btnConsultar = document.getElementById('btnConsultar');
    const btnText = btnConsultar.querySelector('.btn-text');
    const btnLoading = btnConsultar.querySelector('.btn-loading');
    const divResultado = document.getElementById('resultado');

    // Adiciona um parâmetro aleatório à URL para evitar cache
    const cacheBuster = `?v=${new Date().getTime()}`;

    // Função para determinar a cor com base na nota
    function getScoreColor(score) {
        if (score >= 800) return 'excellent-score';
        if (score >= 700) return 'high-score';
        if (score >= 500) return 'medium-score';
        return 'low-score';
    }

    // Função para calcular a porcentagem da nota (considerando 1000 como máximo)
    function calculatePercentage(score) {
        return Math.min((score / 1000) * 100, 100);
    }

    // Função para mostrar estado de carregamento
    function showLoading() {
        btnText.style.display = 'none';
        btnLoading.style.display = 'block';
        btnConsultar.disabled = true;
    }

    // Função para esconder estado de carregamento
    function hideLoading() {
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
        btnConsultar.disabled = false;
    }

    // 1. Carregar a lista de simulados do arquivo mestre
    fetch(`data/simulados.json${cacheBuster}`)
        .then(response => {
            if (!response.ok) throw new Error('Falha ao carregar lista de simulados.');
            return response.json();
        })
        .then(data => {
            seletorSimulado.innerHTML = '<option value="">-- Escolha um simulado --</option>';
            data.forEach(simulado => {
                const option = document.createElement('option');
                option.value = simulado.arquivo;
                option.textContent = simulado.nome;
                seletorSimulado.appendChild(option);
            });
            seletorSimulado.disabled = false;
        })
        .catch(error => {
            console.error(error);
            seletorSimulado.innerHTML = '<option value="">Erro ao carregar</option>';
            divResultado.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${error.message}</p>
                </div>
            `;
        });

    // 2. Adicionar o evento de clique ao botão
    btnConsultar.addEventListener('click', () => {
        const matricula = inputMatricula.value.trim();
        const arquivoSimulado = seletorSimulado.value;

        // Limpa o resultado anterior antes de uma nova busca
        divResultado.innerHTML = '';

        if (!matricula || !arquivoSimulado) {
            divResultado.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Por favor, preencha a matrícula e selecione um simulado.</p>
                </div>
            `;
            return;
        }

        showLoading();

        fetch(`data/${arquivoSimulado}${cacheBuster}`)
            .then(response => {
                if (!response.ok) throw new Error('Não foi possível encontrar o arquivo de notas para este simulado.');
                return response.json();
            })
            .then(notas => {
                // Converte ambos os valores para String para garantir uma comparação correta
                const alunoEncontrado = notas.find(aluno => String(aluno.matricula) === matricula);

                if (alunoEncontrado) {
                    // Formata as notas com duas casas decimais
                    const formatNota = (nota) => parseFloat(nota).toFixed(2);
                    
                    // Cria as barras de progresso para cada matéria
                    const createProgressBar = (materia, valor, cor) => {
                        const porcentagem = calculatePercentage(valor);
                        return `
                            <div class="resultado-item">
                                <div class="nota-destaque">
                                    <span class="materia-nome">${materia}</span>
                                    <span class="score-value ${getScoreColor(valor)}">${formatNota(valor)}</span>
                                </div>
                                <div class="progress-container">
                                    <div class="progress-bar" style="width: ${porcentagem}%; background-color: ${cor};"></div>
                                </div>
                            </div>
                        `;
                    };

                    divResultado.innerHTML = `
                        <div class="resultado-header">
                            <i class="fas fa-user-graduate"></i>
                            Resultado para ${alunoEncontrado.aluno}
                        </div>
                        <div class="resultado-item"><strong>Matrícula:</strong> ${alunoEncontrado.matricula}</div>
                        <hr>
                        ${createProgressBar('Linguagens e Códigos (LC)', alunoEncontrado.LC, '#4361ee')}
                        ${createProgressBar('Ciências Humanas (CH)', alunoEncontrado.CH, '#3a0ca3')}
                        ${createProgressBar('Ciências da Natureza (CN)', alunoEncontrado.CN, '#4cc9f0')}
                        ${createProgressBar('Matemática (MT)', alunoEncontrado.MT, '#f72585')}
                    `;

                    // Anima as barras de progresso
                    setTimeout(() => {
                        const progressBars = divResultado.querySelectorAll('.progress-bar');
                        progressBars.forEach(bar => {
                            bar.style.width = bar.style.width;
                        });
                    }, 100);
                } else {
                    divResultado.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-search"></i>
                            <p>Matrícula não encontrada neste simulado. Verifique o número digitado.</p>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Erro ao buscar as notas:', error);
                divResultado.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>${error.message}</p>
                    </div>
                `;
            })
            .finally(() => {
                hideLoading();
            });
    });

    // Habilitar o botão quando ambos os campos estiverem preenchidos
    inputMatricula.addEventListener('input', verificarCampos);
    seletorSimulado.addEventListener('change', verificarCampos);

    function verificarCampos() {
        btnConsultar.disabled = !(inputMatricula.value.trim() && seletorSimulado.value);
    }
});
