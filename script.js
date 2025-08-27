// Aguarda o carregamento completo do HTML
document.addEventListener('DOMContentLoaded', () => {

    const seletorSimulado = document.getElementById('simulado');
    const inputMatricula = document.getElementById('matricula');
    // CORREÇÃO: O ID foi alterado de 'btn-consultar' para 'btnConsultar' para corresponder ao HTML.
    const btnConsultar = document.getElementById('btnConsultar');
    const divResultado = document.getElementById('resultado');

    let simuladosDisponiveis = []; // Para guardar os dados do simulados.json

    // 1. Carregar la lista de simulados do arquivo mestre
    fetch('simulados.json')
        .then(response => response.json())
        .then(data => {
            simuladosDisponiveis = data; // Salva os dados para uso posterior
            
            seletorSimulado.innerHTML = '<option value="">-- Escolha um simulado --</option>'; // Limpa a opção de "carregando"
            
            data.forEach(simulado => {
                const option = document.createElement('option');
                option.value = simulado.arquivo; // O valor será o caminho para o arquivo de notas
                option.textContent = simulado.nome; // O texto que o usuário vê
                seletorSimulado.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar a lista de simulados:', error);
            seletorSimulado.innerHTML = '<option value="">Erro ao carregar</option>';
        });
        
    // 2. Adicionar o evento de clique ao botão
    btnConsultar.addEventListener('click', () => {
        const matricula = inputMatricula.value.trim();
        const arquivoSimulado = seletorSimulado.value;

        // Validações simples
        if (!matricula || !arquivoSimulado) {
            divResultado.innerHTML = `<p style="color: red;">Por favor, preencha a matrícula e selecione um simulado.</p>`;
            return;
        }

        divResultado.innerHTML = `<p>Buscando...</p>`;

        // 3. Carregar o arquivo de notas do simulado selecionado
        fetch(arquivoSimulado)
            .then(response => response.json())
            .then(notas => {
                // 4. Procurar o aluno pela matrícula
                const alunoEncontrado = notas.find(aluno => aluno.matricula === matricula);

                // 5. Exibir o resultado
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
                divResultado.innerHTML = `<p style="color: red;">Ocorreu um erro ao consultar as notas. Tente novamente.</p>`;
            });
    });
});
