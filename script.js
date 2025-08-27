document.addEventListener('DOMContentLoaded', () => {
    const seletorSimulado = document.getElementById('simulado');
    const inputMatricula = document.getElementById('matricula');
    const btnConsultar = document.getElementById('btnConsultar');
    const spanBtn = btnConsultar.querySelector('span');
    const divResultado = document.getElementById('resultado');

    const cacheBuster = `?v=${new Date().getTime()}`;

    // Carregar lista de simulados da pasta data/
    fetch(`data/simulados.json${cacheBuster}`)
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar lista de simulados');
            return response.json();
        })
        .then(data => {
            seletorSimulado.innerHTML = '<option value="">-- Escolha um simulado --</option>';
            data.forEach(simulado => {
                const option = document.createElement('option');
                option.value = `data/${simulado.arquivo}`; // Adiciona o prefixo data/
                option.textContent = simulado.nome;
                seletorSimulado.appendChild(option);
            });
            seletorSimulado.disabled = false;
        })
        .catch(error => {
            console.error('Erro:', error);
            seletorSimulado.innerHTML = '<option value="">Erro ao carregar</option>';
            divResultado.innerHTML = `<p style="color: red;">${error.message}</p>`;
        });

    // Evento de clique do botão
    btnConsultar.addEventListener('click', () => {
        const matricula = inputMatricula.value.trim();
        const arquivoSimulado = seletorSimulado.value;

        divResultado.innerHTML = '';

        if (!matricula || !arquivoSimulado) {
            divResultado.innerHTML = `<p style="color: red;">Preencha a matrícula e selecione um simulado</p>`;
            return;
        }

        btnConsultar.disabled = true;
        spanBtn.textContent = 'Buscando...';

        // Busca o arquivo do simulado (já com o caminho data/)
        fetch(`${arquivoSimulado}${cacheBuster}`)
            .then(response => {
                if (!response.ok) throw new Error('Arquivo de notas não encontrado');
                return response.json();
            })
            .then(notas => {
                const alunoEncontrado = notas.find(aluno => 
                    String(aluno.matricula) === matricula
                );

                if (alunoEncontrado) {
                    divResultado.innerHTML = `
                        <div class="resultado-header">Resultado para ${alunoEncontrado.aluno}</div>
                        <div class="resultado-item"><strong>Matrícula:</strong> ${alunoEncontrado.matricula}</div>
                        <hr>
                        <div class="resultado-item"><strong>Linguagens e Códigos:</strong> ${alunoEncontrado.LC}</div>
                        <div class="resultado-item"><strong>Ciências Humanas:</strong> ${alunoEncontrado.CH}</div>
                        <div class="resultado-item"><strong>Ciências da Natureza:</strong> ${alunoEncontrado.CN}</div>
                        <div class="resultado-item"><strong>Matemática:</strong> ${alunoEncontrado.MT}</div>
                    `;
                } else {
                    divResultado.innerHTML = `<p style="color: orange;">Matrícula não encontrada</p>`;
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                divResultado.innerHTML = `<p style="color: red;">${error.message}</p>`;
            })
            .finally(() => {
                btnConsultar.disabled = false;
                spanBtn.textContent = 'Consultar';
            });
    });

    // Habilitar o botão quando ambos os campos estiverem preenchidos
    inputMatricula.addEventListener('input', verificarCampos);
    seletorSimulado.addEventListener('change', verificarCampos);

    function verificarCampos() {
        btnConsultar.disabled = !(inputMatricula.value.trim() && seletorSimulado.value);
    }
});
