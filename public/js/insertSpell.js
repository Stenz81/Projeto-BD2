function insertMagia() {
    const nivel_magia = document.getElementById("nivel_magia_unico").value.toString();
    const nome_magia = document.getElementById("nome_magia_unico").value;
    const descricao = document.getElementById("descricao").value;
    const crencas = window.selectedValuesInsert
    const formas_de_combate = window.selectedValuesInsert1
    const custo_inicial = document.getElementById("custo_inicial_unico").value.toString()
    const custo_rodada = document.getElementById("custo_rodada_unico").value.toString()
    const custo_acao = document.getElementById("custo_acao_unico").value
    const escalonamento = document.getElementById("escalonamento").value
    const saida = document.getElementById("container_saida")

    if (formas_de_combate.length != 2) {
        saida.innerHTML = "<p class='erro'>Por favor, insira de exatamente 2 formas de combate.</p>"
        return;
    }

    if (crencas.length != 2) {
        saida.innerHTML = "<p class='erro'>Por favor, insira de exatamente 2 crenças.</p>"
        return;
    }

    const crenca1 = crencas[0]
    const crenca2 = crencas[1]
    const forma1 = formas_de_combate[0]
    const forma2 = formas_de_combate[1]

        fetch('/inserir-magias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nivel_magia,
                nome_magia,
                crenca1,
                crenca2,
                forma1,
                forma2,
                custo_inicial,
                custo_rodada,
                custo_acao,
                escalonamento,
                descricao

            })
        })
    }

    if (!response.ok) {
        const errorData = response.json();
        console(errorData.erro)
        saida.innerHTML = errorData.erro
    }

const botao_confirm_insert = document.getElementById("Confirm_button_single")
botao_confirm_insert.addEventListener("click", insertMagia)
