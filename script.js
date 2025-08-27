document.addEventListener('DOMContentLoaded', () => {

    const seletorSimulado = document.getElementById('simulado');
    const inputMatricula = document.getElementById('matricula');
    const btnConsultar = document.getElementById('btnConsultar');
    const spanBtn = btnConsultar.querySelector('span'); // Pega o span dentro do botão
    const divResultado = document.getElementById('resultado');

    // MELHORIA (Anti-Cache): Adiciona um parâmetro aleatório à URL para evitar cache.
    const cacheBuster = `?v=${new Date().getTime()}`;

    // 1. Carregar a lista de simulados do arquivo mestre
    fetch(`simulados.json${cacheBuster}`)
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
            seletorSimulado.disabled = false; // Habilita o seletor após o carregamento
        })
        .catch(error => {
            console.error(error);
            seletorSimulado.innerHTML = '<option value="">Erro ao carregar</option>';
            divResultado.innerHTML = `<p style="color: red;">${error.message}</p>`;
        });

    // 2. Adicionar o evento de clique ao botão
    btnConsultar.addEventListener('click', () => {
        const matricula = inputMatricula.value.trim();
        const arquivoSimulado = seletorSimulado.value;

        // MELHORIA: Limpa o resultado anterior antes de uma nova busca
        divResultado.innerHTML = '';

        if (!matricula || !arquivoSimulado) {
            divResultado.innerHTML = `<p style="color: red;">Por favor, preencha a matrícula e selecione um simulado.</p>`;
            return;
        }

        // MELHORIA: Desabilita o botão e mostra feedback visual
        btnConsultar.disabled = true;
        spanBtn.textContent = 'Buscando...';

        fetch(`${arquivoSimulado}${cacheBuster}`)
            .then(response => {
                if (!response.ok) throw new Error('Não foi possível encontrar o arquivo de notas para este simulado.');
                return response.json();
            })
            .then(notas => {
                // CORREÇÃO (Busca): Converte ambos os valores para String para garantir uma comparação correta.
                const alunoEncontrado = notas.find(aluno => String(aluno.matricula) === matricula);

                if (alunoEncontrado) {
                    divResultado.innerHTML = `
                        <div class="resultado-header">Resultado para ${alunoEncontrado.aluno}</div>
                        <div class="resultado-item"><strong>Matrícula:</strong> ${alunoEncontrado.matricula}</div>
                        <hr>
                        <div class="resultado-item"><strong>Linguagens e Códigos (LC):</strong> ${alunoEncontrado.LC}</div>
                        <div class="resultado-item"><strong>Ciências Humanas (CH):</strong> ${alunoEncontrado.CH}</div>
                        <div class="resultado-item"><strong>Ciências da Natureza (CN):</strong> ${alunoEncontrado.CN}</div>
                        <div class="resultado-item"><strong>Matemática (MT):</strong> ${alunoEncontrado.MT}</div>
                    `;
                } else {
                    divResultado.innerHTML = `<p style="color: orange;">Matrícula não encontrada neste simulado. Verifique o número digitado.</p>`;
                }
            })
            .catch(error => {
                console.error('Erro ao buscar as notas:', error);
                divResultado.innerHTML = `<p style="color: red;">${error.message}</p>`;
            })
            .finally(() => {
                // MELHORIA: Habilita o botão novamente, independentemente do resultado
                btnConsultar.disabled = false;
                spanBtn.textContent = 'Consultar';
            });
    });
});
