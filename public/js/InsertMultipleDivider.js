function parseHabilidades(texto) {
  // Divide o texto em blocos — cada habilidade começa com um nome e termina antes da próxima linha vazia dupla
  const blocos = texto.trim().split(/\n\s*\n\s*\n/);

  const resultados = [];
  let contagem = 1;
  for (const bloco of blocos) {
    const linhas = bloco.trim().split(/\n/).map(l => l.trim()).filter(l => l);

    // Extrai nome (primeira linha)
    const nome = linhas[0];

    // Segunda linha: crenças e formas
    const segundaLinha = linhas[1] || "";
    //pega TODA a segunda linha
    const matchLinha2 = segundaLinha.match(/^(.+?) ou (.+?) - (.+?) ou (.+)$/i);
    //o (.+?), em regex indica posição de match entre o anterior e o que vem depois, 
    const crenca1 = matchLinha2 ? matchLinha2[1].trim() : null;
    const crenca2 = matchLinha2 ? matchLinha2[2].trim() : null;
    const forma1 = matchLinha2 ? matchLinha2[3].trim() : null;
    //(.+) é 
    const forma2 = matchLinha2 ? matchLinha2[4].trim() : null;

    // Terceira Linha, Lvl X
    const terceiraLinha = linhas[2] || "";
    const lvlMatch = terceiraLinha.match(/Lvl\s*(\d+)/i);
    const nivel = lvlMatch ? parseInt(lvlMatch[1]) : null;

    // Encontra blocos de texto por palavras-chave
    const textoJunto = bloco.trim();

    // Pega descrição (entre "Lvl" e "Custo:")
    const descricaoMatch = textoJunto.match(/Lvl\s*\d+[\s\S]*?(?=Custo:)/i);
    const descricao = descricaoMatch ? descricaoMatch[0]
      .replace(/Lvl\s*\d+\s*/i, "")
      .trim() : null;

      // Regra: primeiro é inicial, o segundo pode ser "por rodada"
    const custoMatch = textoJunto.match(/Custo:\s*([^\n]*)/i);
    let custo_inicial = null, 
    custo_por_rodada = null, 
    custo_em_acao = null,
    custo_raw = null;

    if (custoMatch) {
        custo_raw = custoMatch[1].trim();

            // Divide por vírgulas (geralmente separa energia / rodadas / ações)
        const partes = custo_raw.split(",").map(p => p.trim());

        for (const parte of partes) {
        // 1️⃣ Detecta custos em E.h
        const ehMatch = parte.match(/(\d+)\s*E\.h/i);
            if (ehMatch) {
            const valor = parseInt(ehMatch[1]);
                if (/por rodada/i.test(parte)) {
                custo_por_rodada = valor;
                } else if (/inicial/i.test(parte) || custo_inicial === null) {
                custo_inicial = valor;
                }
                continue;
            }

            // 2️⃣ Se não for E.h, consideramos que é a parte de "ação"
            // Captura tudo literal (1 ação, 1 ação bônus, 1 S e 1 P, etc)
            if (!custo_em_acao && parte.length > 0) {
            custo_em_acao = parte;
            }
        }
    }

    // Pega escalonamento (após "Nível:")
    const escalonamentoMatch = textoJunto.match(/(?:Nível|Escalonamento):\s*([\s\S]*)$/i);
    const escalonamento = escalonamentoMatch ? escalonamentoMatch[1].trim() : null;
    if (!matchLinha2 || !custoMatch) {
        console.error(`Erro no texto! Verifique a estrutura do bloco "${nome || '(sem nome)'}", o de número "${contagem}"`);
        exit; // encerra
    }
    try{
        fetch('/inserir-magias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nivel,
            nome,
            crenca1,
            crenca2,
            forma1,
            forma2,
            custo_inicial,
            custo_por_rodada,
            custo_em_acao,
            escalonamento, 
            descricao
        })
    })
    }catch () {
        const errorData = response.json();
        console(errorData.erro)
        saida.innerHTML = errorData.erro
}
    

    //inserir checagem de erro pos fetch

    resultados.push({
      nivel,
      nome,
      crenca1,
      crenca2,
      forma1,
      forma2,
      custo_inicial,
      custo_por_rodada,
      custo_em_acao,
      escalonamento, 
      descricao
    });

    contagem = contagem + 1;
  }

  return resultados;
}

// -----------------
// Exemplo de uso:
const texto = `
CORAGEM COVARDE V
Emoção ou Espírito - Dano Mágico ou Tank
Lvl 3
Toque

\tSussurre palavras inteligíveis a uma criatura voluntária (inclusive você) e designe uma outra criatura ou objeto. A criatura voluntária estará amedrontada (médio) do outro alvo. Porém, ataques do aliado contra a criatura alvo têm vantagem; ela não pode ficar amedrontada de outra forma; tem vantagem em testes de sanidade e atributos mentais não terão desvantagem, inclusive garantindo vantagem em testes de resistência com eles. 
\tCusto: 6 E.h, 4 E.h por rodada. 1 ação bônus.
\tNível: a cada 3 níveis, você pode gastar +4 E.h inicial para garantir +1 em testes de um atributo mental de sua escolha. a cada 6 níveis, você pode gastar +2 E.h por rodada para garantir +1 na mira do aliado contra o alvo que ele possui medo.


POSIÇÃO DA VÍBORA S
Natureza ou Espírito - Tank ou Armadilha
Lvl 3
Si próprio

\tMovimenta-se de forma ondulatória, como se fosse uma cobra ou espírito vagante. Enquanto permanecer nesta postura você pode se mover sem desencadear ataques de oportunidades. Toda vez que obter sucesso em uma reação imediata, você pode mover 2 metros, deixando uma distorção no solo até o fim de sua próxima rodada no antigo local.
\tSe uma criatura se mover para seu antigo local e entrar em contato com o solo, seu deslocamento é reduzido em 3 metros. Para cada metro que ele não possuir após reduzir, ele recebe 1d6 de dano de terra (mágico).
Custo: 6 E.h ativação, 1 reação.
Nível: a cada 3 níveis, você pode gastar +4 E.h inicial para reduzir em mais 1 metro a movimentação do alvo. A cada 6 níveis, você pode gastar +2 E.h por rodada para ampliar o passo do dado em um.
`;

const habilidades = parseHabilidades(texto);
console.log(habilidades);



