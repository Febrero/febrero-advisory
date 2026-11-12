// Demonstração Febrero AI · Camada IA para construtoras.
// TUDO O QUE ESTÁ NESTE FICHEIRO É FICTÍCIO: a Construtora Exemplo, clientes, mensagens, plantas, obras,
// fornecedores, faturas, autos e preços. Os preços unitários são valores de demonstração (sem IVA).
window.DADOS = {
  empresa: { nome: "Construtora Exemplo", juridico: "Construtora Exemplo, Lda", sub: "Construção e promoção imobiliária" },

  // ---------- plantas desenhadas no browser (SVG) a partir destas divisões ----------
  // coordenadas em metros, relativas ao canto do piso; divisões nos eixos das paredes:
  //   divisão  [nome, x0, y0, x1, y1, {escada, g (grupo)}]
  //   porta    [x, y, "h" parede horizontal | "v" parede vertical, largura, abre para +1 / −1, 0 = vão aberto]
  //   vão      [lado N/S/E/O, início ao longo do lado, largura, "p" = porta exterior]
  //   exterior [nome, x0, y0, x1, y1, tipo: alpendre | terraco | varanda | piscina]
  projetos: [
    { id: "t3mafra", nome: "Moradia T3", local: "Mafra", tipologia: "T3 térrea", tipo: "moradia", regime: "chave-na-mão",
      fracoes: 1, prazo: "10 a 12 meses de obra", cliente: ["Sofia e Miguel Antunes", "Malveira, Mafra"],
      padrao: { estrutura: "betao", acabamento: "standard", cobertura: "telhado", caixilharia: "aluminio" },
      pisos: [{ nome: "Piso 0", ox: 0, oy: 0, W: 18, H: 10,
        divisoes: [
          ["Quarto 2", 0, 0, 4, 3.4], ["Casa de banho", 4, 0, 6.2, 3.4], ["Lavandaria", 6.2, 0, 8.8, 3.4],
          ["Corredor", 0, 3.4, 8.8, 4.6], ["Hall de entrada", 8.8, 0, 11, 4.6], ["Cozinha", 11, 0, 16, 4.6],
          ["Despensa", 16, 0, 18, 4.6], ["Suite", 0, 4.6, 4, 10], ["WC da suite", 4, 4.6, 6, 7.2],
          ["Closet", 4, 7.2, 6, 10], ["Quarto 1", 6, 4.6, 8.8, 10], ["Sala comum", 8.8, 4.6, 18, 10],
        ],
        portas: [[8.8, 4, "v", 0.9, -1], [11, 2.4, "v", 0.9, 1], [9.9, 4.6, "h", 1.4, 0], [16, 3.2, "v", 0.8, 1],
          [13.6, 4.6, "h", 1.2, 0], [3.2, 3.4, "h", 0.8, -1], [5.1, 3.4, "h", 0.8, -1], [7.5, 3.4, "h", 0.8, -1],
          [3.2, 4.6, "h", 0.8, 1], [7.4, 4.6, "h", 0.8, 1], [4, 5.9, "v", 0.7, 1], [4, 8.6, "v", 0.7, 1]],
        vaos: [["N", 1.2, 1.6], ["N", 4.8, 0.6], ["N", 7.1, 0.8], ["N", 9.4, 1, "p"], ["N", 12.6, 1.8], ["N", 16.7, 0.6],
          ["S", 1, 2], ["S", 6.6, 1.6], ["S", 10, 3.2], ["S", 14, 3.2], ["O", 3.6, 0.8], ["E", 6.4, 2]],
        exteriores: [["Alpendre", 9.6, 10, 17.2, 12.8, "alpendre"]] }] },

    { id: "t4ericeira", nome: "Moradia T4 com piscina", local: "Ericeira", tipologia: "T4 · 2 pisos", tipo: "moradia", regime: "chave-na-mão",
      fracoes: 1, prazo: "12 a 14 meses de obra", cliente: ["Fam. Correia", "Ericeira"],
      padrao: { estrutura: "betao", acabamento: "premium", cobertura: "plana", caixilharia: "aluminio" },
      pisos: [
        { nome: "Piso 0", ox: 0, oy: 0, W: 12, H: 10,
          divisoes: [
            ["Quarto 4", 0, 0, 3.6, 4.8], ["Hall de entrada", 3.6, 0, 5.6, 4.8], ["WC social", 5.6, 0, 8.2, 2],
            ["Escadas", 5.6, 2, 8.2, 4.8, { escada: true }], ["Cozinha", 8.2, 0, 12, 4.8],
            ["Sala de estar", 0, 4.8, 6.4, 10], ["Sala de jantar", 6.4, 4.8, 12, 10],
          ],
          portas: [[3.6, 2.4, "v", 0.8, -1], [5.6, 1, "v", 0.7, 1], [5.6, 3.4, "v", 2.4, 0], [4.6, 4.8, "h", 1, 1],
            [10.1, 4.8, "h", 1.2, -1], [6.4, 7.4, "v", 3.6, 0]],
          vaos: [["N", 1, 1.6], ["N", 4.1, 1, "p"], ["N", 6.6, 0.6], ["N", 9.2, 1.8], ["S", 1, 4], ["S", 7.2, 4],
            ["O", 6.2, 1.8], ["E", 1.4, 1.2], ["E", 6.2, 1.8]],
          exteriores: [["Terraço", 0, 10, 12, 12.6, "terraco"], ["Piscina", 1.5, 13.2, 9.5, 17.2, "piscina"]] },
        { nome: "Piso 1", ox: 15, oy: 0, W: 12, H: 10,
          divisoes: [
            ["Quarto 2", 0, 0, 3.6, 4.8], ["Casa de banho", 3.6, 0, 5.6, 4.8], ["Rouparia", 5.6, 0, 8.2, 2],
            ["Escadas", 5.6, 2, 8.2, 4.8, { escada: true }], ["Quarto 3", 8.2, 0, 12, 4.8], ["Corredor", 0, 4.8, 12, 6],
            ["Suite", 0, 6, 4.6, 10], ["Closet", 4.6, 6, 6.2, 10], ["WC da suite", 6.2, 6, 8.4, 10], ["Escritório", 8.4, 6, 12, 10],
          ],
          portas: [[2.6, 4.8, "h", 0.8, -1], [4.6, 4.8, "h", 0.7, -1], [6.9, 4.8, "h", 2.4, 0], [6.9, 2, "h", 0.8, -1],
            [9.2, 4.8, "h", 0.8, -1], [3.6, 6, "h", 0.8, 1], [4.6, 8, "v", 0.7, 1], [6.2, 8, "v", 0.7, 1], [10.2, 6, "h", 0.8, 1]],
          vaos: [["N", 1, 1.6], ["N", 4.3, 0.6], ["N", 9.2, 1.8], ["S", 1, 2.6], ["S", 6.9, 0.8], ["S", 9.2, 2],
            ["O", 5, 0.8], ["E", 5, 0.8]],
          exteriores: [["Varanda", 0, 10, 4.6, 11.4, "varanda"]] },
      ] },

    { id: "edificio6", nome: "Edifício de 6 frações", local: "Torres Vedras", tipologia: "6 × T2 · R/C + 2", tipo: "edificio", regime: "empreitada geral",
      fracoes: 6, elevador: true, prazo: "16 a 18 meses de obra", cliente: ["Promotora Exemplo, Lda", "Torres Vedras"],
      padrao: { estrutura: "betao", acabamento: "standard", cobertura: "plana", caixilharia: "pvc" },
      pisos: [{ nome: "Piso tipo", sub: "R/C, 1.º e 2.º andar", rep: 3, ox: 0, oy: 0, W: 22, H: 11,
        divisoes: [
          ["Quarto 1", 0, 0, 3.6, 4.2, { g: "Fração A" }], ["Casa de banho", 3.6, 0, 5.8, 4.2, { g: "Fração A" }],
          ["Quarto 2", 5.8, 0, 9.6, 4.2, { g: "Fração A" }], ["Hall", 0, 4.2, 9.6, 5.6, { g: "Fração A" }],
          ["Sala", 0, 5.6, 6, 11, { g: "Fração A" }], ["Cozinha", 6, 5.6, 9.6, 11, { g: "Fração A" }],
          ["Escadas", 9.6, 0, 12.4, 4.2, { escada: true, g: "Partes comuns" }], ["Átrio e elevador", 9.6, 4.2, 12.4, 11, { g: "Partes comuns" }],
          ["Quarto 2", 12.4, 0, 16.2, 4.2, { g: "Fração B" }], ["Casa de banho", 16.2, 0, 18.4, 4.2, { g: "Fração B" }],
          ["Quarto 1", 18.4, 0, 22, 4.2, { g: "Fração B" }], ["Hall", 12.4, 4.2, 22, 5.6, { g: "Fração B" }],
          ["Cozinha", 12.4, 5.6, 16, 11, { g: "Fração B" }], ["Sala", 16, 5.6, 22, 11, { g: "Fração B" }],
        ],
        elevador: [10.8, 6.6, 12.2, 8.2],
        portas: [[2.4, 4.2, "h", 0.8, -1], [4.7, 4.2, "h", 0.7, -1], [7, 4.2, "h", 0.8, -1], [3, 5.6, "h", 1.2, 1], [7.8, 5.6, "h", 0.8, 1],
          [9.6, 4.9, "v", 0.9, -1], [12.4, 4.9, "v", 0.9, 1], [11, 4.2, "h", 2.4, 0],
          [19.6, 4.2, "h", 0.8, -1], [17.3, 4.2, "h", 0.7, -1], [15, 4.2, "h", 0.8, -1], [19, 5.6, "h", 1.2, 1], [14.2, 5.6, "h", 0.8, 1]],
        vaos: [["N", 1, 1.6], ["N", 4.4, 0.6], ["N", 6.9, 1.6], ["N", 10.4, 1.2], ["N", 13.5, 1.6], ["N", 17, 0.6], ["N", 19.4, 1.6],
          ["S", 1, 3], ["S", 7, 1.6], ["S", 9.9, 1.2, "p"], ["S", 13.4, 1.6], ["S", 18, 3], ["O", 7, 1.6], ["E", 7, 1.6]],
        exteriores: [["Varanda A", 0.6, 11, 6, 12.4, "varanda"], ["Varanda B", 16, 11, 21.4, 12.4, "varanda"]] }] },

    { id: "reabilisboa", nome: "Reabilitação de prédio", local: "Lisboa", tipologia: "4 × T2 · R/C + 3", tipo: "reabilitacao", reab: true,
      regime: "empreitada geral", fracoes: 4, prazo: "12 a 14 meses de obra", cliente: ["Dono de obra (via Arq.ª Inês Carvalho)", "Arroios, Lisboa"],
      te: 0.5, fachadas: ["O", "E"], notaLeitura: "paredes de alvenaria existentes: 2 espessuras a confirmar no local",
      padrao: { estrutura: "metalica", acabamento: "standard", cobertura: "telhado", caixilharia: "aluminio" },
      pisos: [{ nome: "Piso tipo", sub: "R/C ao 3.º andar", rep: 4, ox: 0, oy: 0, W: 15, H: 8,
        divisoes: [
          ["Sala", 0, 0, 4.4, 4.6], ["Quarto 1", 0, 4.6, 4.4, 8], ["Casa de banho", 4.4, 0, 6.6, 3.4], ["Lavandaria", 6.6, 0, 8.6, 3.4],
          ["Arrumos", 8.6, 0, 10.6, 3.4], ["Cozinha", 10.6, 0, 15, 3.4], ["Corredor", 4.4, 3.4, 15, 4.6],
          ["Hall de entrada", 4.4, 4.6, 7.4, 8], ["Escadas (comum)", 7.4, 4.6, 10.6, 8, { escada: true }], ["Quarto 2", 10.6, 4.6, 15, 8],
        ],
        portas: [[4.4, 4, "v", 0.9, -1], [4.4, 6.3, "v", 0.8, -1], [5.5, 3.4, "h", 0.7, -1], [7.6, 3.4, "h", 0.7, -1], [9.6, 3.4, "h", 0.7, -1],
          [12.8, 3.4, "h", 0.9, -1], [12.8, 4.6, "h", 0.8, 1], [5.9, 4.6, "h", 1.6, 0], [7.4, 6.3, "v", 1, -1]],
        vaos: [["O", 0.8, 1.2], ["O", 2.8, 1.2], ["O", 5.6, 1.2], ["E", 1.1, 1.2], ["E", 3.6, 0.8], ["E", 5.6, 1.2]],
        exteriores: [["Varanda", 15, 4.9, 16.2, 7.7, "varanda"]] }] },
  ],

  // ---------- preços unitários DE DEMONSTRAÇÃO (sem IVA, fornecimento e aplicação) ----------
  // na versão real, a IA usa a tabela de preços da empresa e o histórico de compras do ERP
  precos: {
    estaleiro_base: 6500, estaleiro_m2: 14, andaime_m2: 8, grua: 9500,      // estaleiro, segurança e resíduos (RCD)
    escavacao_m3: 15, demolicao_m2: 70, reforco_m2: 60,                     // reabilitação: demolições e reforço sísmico das paredes
    betao_m3: 145, aco_kg: 1.55, cofragem_m2: 28, perfis_kg: 4.8,           // betão C25/30, aço A500 NR, perfis galvanizados
    parede_ext_m2: { betao: 108, metalica: 92 },                            // tijolo térmico + ETICS | painel de aço leve + ETICS
    fachada_reab_m2: 150,                                                   // reabilitação de fachada existente
    parede_int_m2: { betao: 40, metalica: 36 },                             // tijolo de 11 | gesso cartonado com lã mineral
    reboco_pintura_m2: { betao: 22, metalica: 13 },
    cobertura_m2: { telhado: 98, plana: 112 },
    caixilharia_m2: { aluminio: 410, pvc: 345 },                            // com vidro duplo e estores
    porta_ext_un: 1900, betonilha_m2: 14,
    pavimento_m2: { standard: 46, premium: 92 },
    revest_m2: { standard: 40, premium: 78 },
    porta_int_un: { standard: 360, premium: 690 },
    roupeiro_un: { standard: 1100, premium: 2100 },
    cozinha_un: { standard: 8500, premium: 17500 },
    loucas_wc: { standard: 1900, premium: 3800 },
    aguas_m2: 40, eletricidade_m2: { standard: 44, premium: 64 }, ited_fracao: 950, avac_m2: { standard: 48, premium: 96 },
    elevador_base: 26000, elevador_paragem: 3800,
    piscina_m2: 820, terraco_m2: 68, varanda_m2: 120, alpendre_m2: 165,
    projeto_base: 7500, projeto_m2: 26, projeto_reab: 1.3,
    margem: 0.16,
  },

  // rácios de demonstração: m³ de betão por m² de implantação (fundações, massame) ou por m² de piso (lajes, pilares e vigas)
  consumos: {
    nova: {
      betao: { fund: 0.12, massame: 0.10, laje: 0.15, pv: 0.05, escada: 2.4 },
      metalica: { fund: 0.09, massame: 0.10, laje: 0, pv: 0, escada: 0, perfis: 27 },
    },
    reabilitacao: {
      betao: { fund: 0.02, massame: 0.06, laje: 0.10, pv: 0.02, escada: 0, cofrLaje: 0.25 },
      metalica: { fund: 0.02, massame: 0.06, laje: 0, pv: 0, escada: 0, perfis: 24 },
    },
    aco: { fund: 70, massame: 25, laje: 90, pv: 130, escada: 100 },   // kg de aço por m³ de betão
    cofragem: { fund: 0.6, laje: 1.0, pv: 0.9, escada: 12 },          // m² por m² (e por lanço de escada)
  },

  // ---------- pedidos de orçamento (FICTÍCIOS) ----------
  pedidos: [
    { id: "p1", nome: "Sofia Antunes", canal: "WhatsApp", hora: "08:04", assunto: "Moradia T3 em Mafra", estado: "novo", projeto: "t3mafra",
      cliente: ["Sofia e Miguel Antunes", "Malveira, Mafra"],
      texto: "Bom dia! Comprámos um terreno com 650 m² na Malveira e queremos construir uma moradia T3 térrea, com uns 180 m², sala grande virada a sul e um alpendre. O nosso limite são 250 mil € e vamos pedir crédito à habitação. Conseguem dar-nos uma ideia de preço e de prazo? Ainda não temos arquiteto. Obrigada! Sofia",
      campos: [["Tipologia", "T3 térrea"], ["Área", "≈ 180 m²"], ["Terreno", "650 m², Malveira (Mafra)"], ["Exterior", "alpendre, sala a sul"],
        ["Orçamento", "até 250.000 €"], ["Financiamento", "crédito à habitação"], ["Projeto", "ainda sem arquiteto"], ["Pedido", "preço e prazo"]],
      semelhantes: [["t3mafra", 95], ["t4ericeira", 58]], probabilidade: "alta",
      nota: "Cabe no orçamento com acabamentos standard. O banco vai pedir orçamento detalhado e cronograma financeiro: saem os dois deste orçamento.",
      resposta: "Bom dia, Sofia! Obrigado pelo contacto.\n\nOrçámos há pouco tempo uma moradia muito parecida em Mafra (T3 térrea com 180 m², sala a sul e alpendre). Em chave-na-mão, com acabamentos standard, a estimativa inicial ronda os {valor} (sem IVA), já com os projetos de arquitetura e de especialidades e o licenciamento.\n\nComo vão pedir crédito à habitação, preparamos também o orçamento detalhado e o cronograma financeiro que o banco pede para a avaliação.\n\nPodemos ver o terreno na Malveira esta semana: quinta-feira às 10h ou sábado às 11h? Se tiverem a caderneta predial e a planta de localização, tragam, por favor.\n\nDepartamento Comercial · Construtora Exemplo" },
    { id: "p2", nome: "Ricardo Faria", empresa: "Promotora Exemplo, Lda", canal: "Email", hora: "09:12", assunto: "Proposta: edifício de 6 frações em Torres Vedras",
      estado: "novo", projeto: "edificio6", cliente: ["Promotora Exemplo, Lda", "Torres Vedras"], anexo: "Plantas_6_fracoes.pdf · Mapa_acabamentos.xlsx",
      texto: "Bom dia. Temos aprovado o projeto de arquitetura de um edifício de habitação com 6 frações T2 (R/C + 2 pisos, cerca de 730 m² de área bruta) em Torres Vedras. Gostaríamos de receber proposta de empreitada geral, com os projetos de especialidades incluídos. Seguem em anexo as plantas e o mapa de acabamentos. Precisamos dos valores até dia 15 para fecharmos o financiamento com o banco. Cumprimentos, Ricardo Faria",
      campos: [["Tipo", "edifício multifamiliar"], ["Frações", "6 × T2"], ["Pisos", "R/C + 2"], ["Área bruta", "≈ 730 m²"],
        ["Regime", "empreitada geral"], ["Projeto", "arquitetura aprovada"], ["Especialidades", "a incluir na proposta"], ["Prazo da proposta", "até 15 de novembro"]],
      semelhantes: [["edificio6", 96], ["reabilisboa", 54]], probabilidade: "alta",
      nota: "Cliente com obra em curso (Edifício de 8 frações). O banco vai pedir mapa de quantidades e cronograma financeiro: saem os dois do orçamento da IA.",
      resposta: "Bom dia, Ricardo,\n\nObrigado pelo envio. Já lemos as plantas: pelas nossas medições, o edifício tem 726 m² de área bruta, 6 frações T2 e um núcleo de escadas com elevador. Com o mapa de acabamentos que enviou (nível standard), a estimativa para a empreitada geral é de {valor} (sem IVA), cerca de {m2} por m², já com os projetos de especialidades.\n\nEnviamos a proposta formal, com o mapa de quantidades e o cronograma financeiro, até dia 12, a tempo da reunião com o banco. Antes disso, podemos visitar o terreno na terça-feira de manhã?\n\nCom os melhores cumprimentos,\nDireção Comercial · Construtora Exemplo" },
    { id: "p3", nome: "Divisão de Obras Municipais", canal: "Email", hora: "10:31", assunto: "Consulta prévia n.º 14/2026: reabilitação de escola", estado: "novo",
      projeto: "reabilisboa", cliente: ["Município (consulta prévia n.º 14/2026)", "antiga escola primária"], estimativa: 352000, precoBase: 385000,
      anexo: "Convite_CP14-2026.pdf · Caderno_encargos.pdf · MQ_escola.xlsx", rotuloResposta: "Pedido de esclarecimentos preparado",
      texto: "Exmos. Senhores, nos termos do Código dos Contratos Públicos, o Município convida V. Exas. a apresentar proposta no procedimento por consulta prévia n.º 14/2026, para a reabilitação do edifício da antiga escola primária e a sua adaptação a centro comunitário. Preço base: 385.000 €, acrescido de IVA. Prazo de execução: 240 dias. As propostas devem ser entregues até às 17h00 de 7 de novembro, na plataforma eletrónica de contratação pública. Seguem as peças do procedimento: convite, caderno de encargos, projeto de execução e mapa de quantidades. Com os melhores cumprimentos, a Divisão de Obras Municipais",
      campos: [["Procedimento", "consulta prévia n.º 14/2026"], ["Objeto", "escola → centro comunitário"], ["Preço base", "385.000 € + IVA"], ["Prazo de execução", "240 dias"],
        ["Entrega", "7 nov, 17h00 (plataforma)"], ["Critério", "preço mais baixo"], ["Alvará", "1.ª categoria, classe 3 ✓"], ["Esclarecimentos", "até 28 de outubro"]],
      semelhantes: [["reabilisboa", 81], ["edificio6", 47]], probabilidade: "média",
      nota: "Pelas medições do mapa de quantidades, o custo estimado é de 352.000 €: 8,6% abaixo do preço base. Há 2 artigos sem quantidade (4.3 e 7.1); os esclarecimentos só podem ser pedidos no primeiro terço do prazo, até 28 de outubro.",
      resposta: "Exmos. Senhores,\n\nNo âmbito da consulta prévia n.º 14/2026, vimos solicitar os seguintes esclarecimentos:\n\n1. O artigo 4.3 do mapa de quantidades (reforço de pavimentos) não indica quantidade. Devemos considerar a área total do piso 1 (212 m²)?\n2. O artigo 7.1 (rede de águas pluviais) remete para o projeto, que não inclui a cobertura do anexo. Esta zona está incluída na empreitada?\n\nSolicitamos ainda uma visita ao local na próxima semana.\n\nCom os melhores cumprimentos,\nConstrutora Exemplo, Lda" },
    { id: "p4", nome: "Eng.ª Carla Mendes", empresa: "Edifica Exemplo, S.A.", canal: "WhatsApp", hora: "ontem 18:47", assunto: "Subempreitada de estrutura · Loures (24 frações)",
      estado: "novo", anexo: "MQ_estrutura_Loures.xlsx",
      texto: "Boa tarde! Precisamos de preço para a subempreitada de cofragem e betonagem de um edifício de 24 frações em Loures. Mando o mapa de quantidades em Excel. O betão, o aço e a grua são nossos, o material de cofragem é por vossa conta. Início previsto em janeiro. Consegue mandar até sexta? Obrigada",
      campos: [["Trabalho", "cofragem, betonagem e aço"], ["Obra", "24 frações, Loures"], ["Do cliente", "betão, aço e grua"], ["Por nossa conta", "cofragem e escoramento"],
        ["Início", "janeiro de 2027"], ["Prazo da proposta", "sexta-feira"], ["Mapa de quantidades", "5 artigos lidos"], ["IVA", "autoliquidação"]],
      mq: [["Cofragem de lajes", "m²", 3850, 14.5], ["Cofragem de vigas e pilares", "m²", 1920, 19], ["Cofragem de paredes (núcleos)", "m²", 640, 16],
        ["Betonagem (mão de obra)", "m³", 1420, 9.5], ["Montagem de aço A500", "kg", 148000, 0.32]],
      probabilidade: "alta",
      nota: "Preços da subempreitada de Odivelas (mesmo cliente, em curso, 4% abaixo do custo previsto). A equipa de cofragem fica livre em janeiro.",
      resposta: "Boa tarde, Eng.ª Carla! Segue a nossa proposta para a estrutura de Loures, a partir do vosso mapa de quantidades: {valor} (sem IVA, com autoliquidação), com os preços unitários no Excel em anexo.\n\nInclui o material de cofragem e o escoramento; betão, aço e grua por vossa conta, como indicado. Podemos começar a 11 de janeiro, com 8 cofradores e 2 ferrageiros. Proposta válida por 30 dias.\n\nQualquer dúvida, diga! 👍" },
    { id: "p5", nome: "Arq.ª Inês Carvalho", canal: "Email", hora: "ontem 21:40", assunto: "Plantas de prédio a reabilitar em Arroios", estado: "respondido",
      projeto: "reabilisboa", cliente: ["Dono de obra (via Arq.ª Inês Carvalho)", "Arroios, Lisboa"], anexo: "Arroios_licenciamento.dwg",
      texto: "Olá, boa noite. Envio as plantas do projeto de licenciamento de um prédio que estamos a reabilitar em Arroios: R/C + 3 pisos, uma fração T2 por piso, cerca de 480 m². O dono de obra quer uma estimativa de custos antes de avançarmos para o projeto de execução. Conseguem ajudar? Obrigada, Inês",
      campos: [["Tipo", "reabilitação de prédio"], ["Local", "Arroios, Lisboa"], ["Pisos", "R/C + 3"], ["Frações", "4 × T2"],
        ["Área bruta", "≈ 480 m²"], ["Fase", "licenciamento"], ["Pedido", "estimativa de custos"], ["Anexo", "plantas DWG lidas"]],
      semelhantes: [["reabilisboa", 97], ["edificio6", 49]], probabilidade: "média",
      nota: "Respondido ontem às 21:41 pela IA (fora de horas). A estimativa por capítulos já está pronta: falta rever e enviar.",
      resposta: "Boa noite, Inês,\n\nObrigado pelas plantas! Já as estamos a analisar e enviamos amanhã, até às 12h, a estimativa de custos por capítulos. Se tiver o levantamento das paredes existentes ou fotografias do interior, envie, por favor: ajudam a afinar as demolições e o reforço estrutural.\n\nCumprimentos,\nDepartamento de Orçamentação · Construtora Exemplo" },
  ],

  // ---------- obras em curso (FICTÍCIAS) · semanas contadas a partir de 5 out 2026 ----------
  // fases: lic (licenciamento), est (fundações e estrutura), env (alvenarias e cobertura), inst (instalações), acab (acabamentos)
  obras: [
    { id: "o1", nome: "Edifício de 8 frações", curto: "Edif. 8 frações", local: "Venda do Pinheiro", cliente: "Promotora Exemplo, Lda", tipo: "edificio",
      fase: "Estrutura", faseId: "est", progresso: 34, previstoPct: 40, atrasoDias: 9, causa: "chuva na semana 41 e alteração da laje do piso 2 pedida em obra",
      orcamento: 1124000, previsto: 398000, real: 421500, fases: [["est", 0, 9], ["env", 6, 16], ["inst", 11, 21], ["acab", 17, 25]],
      alerta: "Relatório da fiscalização com 3 pontos a corrigir. Custo da estrutura 5,9% acima do previsto." },
    { id: "o2", nome: "Moradia T4 com piscina", curto: "T4 Ericeira", local: "Ericeira", cliente: "Fam. Correia", tipo: "moradia2",
      fase: "Alvenarias e cobertura", faseId: "env", progresso: 55, previstoPct: 54, orcamento: 412000, previsto: 214600, real: 211900,
      fases: [["env", 0, 5], ["inst", 3, 10], ["acab", 8, 16]] },
    { id: "o3", nome: "Moradia T3", curto: "T3 Gradil", local: "Gradil, Mafra", cliente: "Fam. Gaspar", tipo: "moradia",
      fase: "Licenciamento", faseId: "lic", progresso: 8, previstoPct: 8, orcamento: 238000, previsto: 9800, real: 9600,
      fases: [["lic", 0, 6], ["est", 7, 13], ["env", 12, 19], ["inst", 17, 23], ["acab", 21, 25]],
      alerta: "A câmara pediu um aditamento ao projeto de águas e esgotos: prazo até 6 de novembro." },
    { id: "o4", nome: "Reabilitação de prédio", curto: "Reab. Graça", local: "Graça, Lisboa", cliente: "Sr. Álvaro Pinto", tipo: "reabilitacao",
      fase: "Acabamentos", faseId: "acab", progresso: 81, previstoPct: 80, orcamento: 598000, previsto: 462000, real: 455300,
      fases: [["inst", 0, 2], ["acab", 0, 7]] },
    { id: "o5", nome: "Estrutura de edifício (subempreitada)", curto: "Estrutura Odivelas", local: "Odivelas", cliente: "Edifica Exemplo, S.A.", tipo: "estrutura",
      fase: "Estrutura", faseId: "est", progresso: 64, previstoPct: 60, orcamento: 186000, previsto: 112000, real: 107500, fases: [["est", 0, 11]] },
    { id: "o6", nome: "Moradia T3", curto: "T3 Sobral", local: "Sobral de Monte Agraço", cliente: "Fam. Rocha", tipo: "moradia",
      fase: "Instalações", faseId: "inst", progresso: 47, previstoPct: 52, atrasoDias: 6, causa: "caixilharia entregue com uma semana de atraso",
      orcamento: 255000, previsto: 118000, real: 120900, fases: [["inst", 0, 6], ["acab", 4, 13]] },
  ],

  // o email da fiscalização (FICTÍCIO) que a IA transforma em tarefas
  fiscalizacao: { obra: "o1", hora: "07:02", de: "Eng. Paulo Sequeira · Fiscalização", prazo: "31 de outubro",
    assunto: "Relatório de visita n.º 14 (23/10) · não conformidades",
    texto: "Exmos. Senhores, na visita de ontem verificámos: 1) recobrimento insuficiente das armaduras da viga V12 do piso 3, a corrigir antes da betonagem; 2) falta de guarda-corpos na periferia da laje do piso 2; 3) ainda não recebemos os resultados dos ensaios à compressão dos provetes da laje do piso 1. Agradecemos resposta até 31 de outubro. Com os melhores cumprimentos, Eng. Paulo Sequeira",
    tarefas: [["Corrigir o recobrimento da viga V12 (piso 3) antes da betonagem", "Encarregado", "27 out"],
      ["Colocar guarda-corpos na periferia da laje do piso 2", "Técnico de segurança", "hoje"],
      ["Enviar os resultados dos ensaios dos provetes do piso 1", "Diretor de obra", "30 out"]] },

  // ---------- contratos com autos de medição (FICTÍCIOS) ----------
  // artigo: [n.º, descrição, unidade, quantidade contratada, preço unitário, acumulado até ao auto anterior]
  // linha da folha de obra: [data, frente, como o encarregado escreveu, quantidade, unidade, artigo]
  contratos: [
    { id: "c1", obra: "o1", auto: 7, mes: "outubro de 2026", nome: "Edifício de 8 frações", cliente: "Promotora Exemplo, Lda", local: "Venda do Pinheiro",
      para: "Eng. Paulo Sequeira", papel: "fiscalização", valorContrato: 1124000, retencao: 0.05, iva: "normal",
      fontes: ["Produção_outubro.xlsx (encarregado)", "4 folhas de obra semanais", "32 fotografias datadas", "Contrato e mapa de quantidades"],
      artigos: [["2.1", "Escavação geral e transporte a vazadouro", "m³", 1850, 7.8, 1850], ["3.1", "Betão C25/30 em fundações", "m³", 186, 98, 186],
        ["3.2", "Cofragem de lajes", "m²", 2240, 24.5, 1120], ["3.3", "Cofragem de pilares e vigas", "m²", 1680, 29, 760],
        ["3.4", "Betão C25/30 em lajes, vigas e pilares", "m³", 610, 104, 298], ["3.5", "Aço A500 NR em armaduras", "kg", 61500, 1.42, 38900],
        ["3.7", "Impermeabilização de muros enterrados", "m²", 410, 12.8, 410], ["4.1", "Alvenaria exterior de tijolo térmico de 25 cm", "m²", 1320, 31.5, 0]],
      linhas: [["02/10", "Piso 1 · zona A", "cofragem laje P1 zona A", 320, "m²", "3.2"], ["06/10", "Piso 1", "betonagem laje P1 (9 camiões + bomba)", 62.5, "m³", "3.4"],
        ["08/10", "Piso 2", "aço pilares e vigas P2", 8200, "kg", "3.5"], ["09/10", "Piso 2", "reforço armaduras laje P2 (alteração pedida em obra, livro de obra reg. 12)", 3650, "kg", "3.5"],
        ["13/10", "Piso 2 · zona A", "cofragem pilares e vigas P2", 210, "m²", "3.3"], ["15/10", "Piso 2", "cofragem laje P2 zonas A+B", 320, "m²", "3.2"],
        ["20/10", "Piso 2", "betonagem pilares e vigas P2", 54, "m³", "3.4"], ["21/10", "Cave", "impermeabilização muro norte", 28, "m²", "3.7"],
        ["22/10", "Piso 2", "aço laje P2", 14500, "kg", "3.5"], ["23/10", "Piso 3 · zona A", "cofragem pilares e vigas P3", 210, "m²", "3.3"],
        ["23/10", "R/C", "tijolo 25 fachada sul", 145, "m²", "4.1"], ["24/10", "Piso 2", "betonagem laje P2", 59.5, "m³", "3.4"]],
      justificacao: "Há 2 artigos acima da quantidade contratada: o 3.5 (aço), por causa da alteração da laje do piso 2 pedida em obra (livro de obra, registo n.º 12), e o 3.7 (impermeabilização), por acerto de medição no muro norte. Propomos tratá-los como trabalhos a mais, com o orçamento em anexo, para vossa aprovação." },
    { id: "c2", obra: "o2", auto: 5, mes: "outubro de 2026", nome: "Moradia T4 com piscina", cliente: "Fam. Correia", local: "Ericeira",
      para: "Arq. Nuno Teixeira", papel: "fiscalização do dono de obra", valorContrato: 412000, retencao: 0.05, iva: "normal",
      fontes: ["Folhas de obra (WhatsApp do encarregado)", "18 fotografias datadas", "Contrato e mapa de quantidades"],
      artigos: [["2.1", "Escavação e aterro", "m³", 260, 9.5, 260], ["3.1", "Estrutura em betão armado", "vg", 1, 46800, 1],
        ["4.1", "Alvenaria exterior de tijolo térmico", "m²", 238, 34, 120], ["4.2", "Alvenaria interior de tijolo de 11 cm", "m²", 286, 22, 40],
        ["5.1", "Cobertura plana: impermeabilização e isolamento", "m²", 148, 96, 0], ["6.1", "Isolamento térmico pelo exterior (ETICS)", "m²", 238, 52, 0],
        ["7.1", "Rede de águas e esgotos (1.ª fase)", "vg", 1, 7900, 0]],
      linhas: [["01/10", "Piso 1", "tijolo térmico fachadas P1", 64, "m²", "4.1"], ["03/10", "Piso 0", "tijolo 11 divisórias P0", 92, "m²", "4.2"],
        ["08/10", "Cobertura", "tela + XPS cobertura (metade)", 74, "m²", "5.1"], ["10/10", "Piso 1", "tijolo térmico fachadas P1 (fecho)", 54, "m²", "4.1"],
        ["14/10", "Piso 1", "tijolo 11 divisórias P1", 68, "m²", "4.2"], ["17/10", "Cobertura", "tela + XPS cobertura (resto)", 74, "m²", "5.1"],
        ["21/10", "Fachada sul", "ETICS fachada sul", 96, "m²", "6.1"], ["23/10", "Piso 0", "tubagens águas e esgotos P0 (50%)", 0.5, "vg", "7.1"]],
      justificacao: "Todos os artigos estão dentro das quantidades contratadas." },
    { id: "c3", obra: "o5", auto: 4, mes: "outubro de 2026", nome: "Estrutura de edifício (subempreitada)", cliente: "Edifica Exemplo, S.A.", local: "Odivelas",
      para: "Eng.ª Carla Mendes", papel: "direção de obra do empreiteiro geral", valorContrato: 186000, retencao: 0.05, iva: "autoliquidacao",
      fontes: ["Registo diário da equipa (Excel)", "Guias de betonagem", "Contrato de subempreitada"],
      artigos: [["1", "Cofragem de lajes", "m²", 4120, 14.5, 2060], ["2", "Cofragem de vigas e pilares", "m²", 2050, 19, 1130],
        ["3", "Cofragem de paredes (núcleos)", "m²", 690, 16, 460], ["4", "Betonagem (mão de obra)", "m³", 1510, 9.5, 820],
        ["5", "Montagem de aço A500", "kg", 156000, 0.32, 88400]],
      linhas: [["03/10", "Piso 4", "cofragem laje P4", 515, "m²", "1"], ["06/10", "Piso 4", "betonagem laje P4", 168, "m³", "4"],
        ["07/10", "Núcleo", "cofragem paredes núcleo P5", 135, "m²", "3"], ["09/10", "Piso 5", "pilares e vigas P5", 260, "m²", "2"],
        ["10/10", "Piso 5", "aço P5", 15600, "kg", "5"], ["16/10", "Piso 5", "cofragem laje P5", 515, "m²", "1"],
        ["17/10", "Núcleo", "cofragem paredes núcleo P6", 135, "m²", "3"], ["20/10", "Piso 5", "betonagem laje P5", 162, "m³", "4"],
        ["22/10", "Piso 6", "pilares e vigas P6", 260, "m²", "2"], ["23/10", "Piso 6", "aço P6", 15600, "kg", "5"]],
      justificacao: "O artigo 3 (cofragem de paredes dos núcleos) já vai acima do contratado: o núcleo do piso 6 ganhou uma parede no aditamento ao projeto de estabilidade. Pedimos a vossa confirmação para o tratarmos como trabalho a mais." },
  ],
  faturadoMes: { valor: 96400, obras: "Reabilitação de prédio na Graça e Moradia T3 em Sobral de Monte Agraço" },

  // ---------- faturas de fornecedores (FICTÍCIAS) · linha: [descrição, quantidade, unidade, preço unitário] ----------
  faturas: [
    { id: "f1", fornecedor: "Betões Exemplo, S.A.", nif: "509 482 170", numero: "FT B/2026/1187", data: "22/10/2026", obra: "o1", capitulo: "Estrutura · betão",
      linhas: [["Betão C25/30 S3 XC2 D22 Cl0,4", 62.5, "m³", 89.9], ["Bombagem com bomba de lança", 1, "serv.", 420]],
      encomenda: { n: "EC 2026/311", data: "30/09/2026", qtd: [60, 1], pu: [83.95, 420] },
      guias: { ref: "GR 21771 a GR 21779", n: 9, qtd: [62.5, 1], nota: "+2,5 m³ pedidos em obra (assinado na GR 21779)" } },
    { id: "f2", fornecedor: "Aços Exemplo, Lda", nif: "514 223 905", numero: "FT 2026/0932", data: "21/10/2026", obra: "o1", capitulo: "Estrutura · armaduras",
      linhas: [["Aço A500 NR SD, cortado e dobrado", 12480, "kg", 0.92], ["Transporte", 1, "serv.", 95]],
      encomenda: { n: "EC 2026/298 (aberta)", data: "15/09/2026", qtd: [24000, 2], pu: [0.92, 95] },
      guias: { ref: "GR 7711 e GR 7712", n: 2, qtd: [10340, 1] } },
    { id: "f3", fornecedor: "Cofragens Exemplo, Lda", nif: "516 731 040", numero: "FT A/2026/2210", data: "20/10/2026", obra: "o5", capitulo: "Cofragem · aluguer",
      linhas: [["Aluguer de mesas de cofragem (420 m² × 30 dias)", 12600, "m²·dia", 0.085], ["Aluguer de prumos metálicos (380 un × 30 dias)", 11400, "un·dia", 0.06],
        ["Transporte", 1, "serv.", 180]],
      encomenda: { n: "Contrato de aluguer CA 2026/09", data: "01/09/2026", qtd: [12600, 11400, 1], pu: [0.085, 0.06, 180] },
      guias: { ref: "GT 3302 e registo de material em obra", n: 1, qtd: [12600, 11400, 1] } },
    { id: "f4", fornecedor: "Inertes Exemplo, Lda", nif: "507 918 360", numero: "FT 2026/1544", data: "19/10/2026", obra: "o2", capitulo: "Alvenarias · inertes",
      linhas: [["Areia lavada 0/4", 48, "t", 14.2], ["Brita 6/14", 36, "t", 15.8], ["Tout-venant", 60, "t", 9.4]],
      encomenda: { n: "EC 2026/305", data: "02/10/2026", qtd: [48, 36, 60], pu: [14.5, 16.2, 9.6] },
      guias: { ref: "GR 4410 a GR 4415", n: 6, qtd: [48, 36, 60] } },
  ],
  // preços de compra nos últimos 90 dias: [fornecedor, material, unidade, antes, agora, nota]
  precosFornecedores: [
    ["Betões Exemplo, S.A.", "Betão C25/30 S3", "€/m³", 83.95, 89.9, "fatura de 22/10"],
    ["Cerâmicas Exemplo, Lda", "Tijolo térmico de 25 cm", "€/un", 1.12, 1.19, "nova tabela desde 1 de outubro"],
    ["Aços Exemplo, Lda", "Aço A500 NR cortado e dobrado", "€/kg", 0.92, 0.92, ""],
    ["Inertes Exemplo, Lda", "Areia lavada 0/4", "€/t", 14.5, 14.2, ""],
    ["Cofragens Exemplo, Lda", "Aluguer de mesas de cofragem", "€/m²·dia", 0.085, 0.085, ""],
  ],
  betaoNovembro: 410,   // m³ de betão previstos para novembro (planeamento das obras)

  // ---------- painel ----------
  // {autos} e {edificio} são calculados pela app a partir dos dados acima
  briefing: [
    ["O relatório da fiscalização do Edifício de 8 frações (Venda do Pinheiro) tem 3 pontos a corrigir, um deles antes da próxima betonagem. As tarefas e o rascunho da resposta já estão prontos.", "obras"],
    ["Os autos de outubro de 3 contratos estão prontos: {autos} a faturar. No Edifício de 8 frações, o aço já vai 6,1% acima do contratado; a justificação como trabalhos a mais está escrita.", "autos"],
    ["A fatura do betão da Betões Exemplo veio a 89,90 €/m³, mais 7,1% do que na encomenda. O pedido de nota de crédito está pronto a enviar.", "faturas"],
    ["Há 4 pedidos de orçamento por responder. O edifício de 6 frações em Torres Vedras já tem estimativa ({edificio}) e a consulta prévia da escola fecha a 7 de novembro.", "pedidos"],
  ],
  passos: [
    ["Pedido", "Lê email e WhatsApp, percebe o que o cliente quer e responde no próprio dia.", "pedidos"],
    ["Visita", "Prepara a visita: terreno, acessos e as perguntas a fazer ao cliente.", "pedidos"],
    ["Orçamento", "Mede a partir das plantas e orça com os vossos preços, em horas.", "planta"],
    ["Projeto", "Compara versões das plantas e atualiza medições e orçamento.", "planta"],
    ["Licenciamento", "Acompanha prazos e pedidos da câmara e prepara as respostas.", "obras"],
    ["Obra", "Planeamento, custos, encomendas e relatórios da fiscalização.", "obras"],
    ["Autos e faturação", "Autos de medição feitos a partir das folhas de obra.", "autos"],
    ["Entrega", "Telas finais, compilação técnica e resposta ao cliente a qualquer hora.", "assistente"],
  ],
  funil: { meses: ["Mai", "Jun", "Jul", "Ago", "Set", "Out"], pedidos: [18, 22, 19, 14, 27, 31], propostas: [6, 7, 5, 4, 21, 27], adjudicacoes: [1, 2, 1, 1, 4, 6] },
  ocupacao: { semanas: ["S44", "S45", "S46", "S47", "S48", "S49"], valores: [82, 88, 97, 91, 76, 71],
    nota: "A semana 46 passa dos 95%: a IA sugere antecipar a betonagem da laje de Odivelas para a semana 45." },
  atividade: [
    ["06:30", "Leu 4 folhas de obra e o Excel de produção e preparou os autos de outubro de 3 contratos.", "aprovar"],
    ["06:45", "Leu 4 faturas de fornecedores e conferiu-as com encomendas e guias. Uma vem 7,1% acima do preço da encomenda.", "aprovar"],
    ["07:10", "Leu o relatório da fiscalização do Edifício de 8 frações e criou 3 tarefas com prazo.", "feito"],
    ["08:05", "Preparou a resposta à Sofia Antunes (WhatsApp) com uma estimativa para a moradia T3 em Mafra.", "aprovar"],
    ["09:20", "Leu as plantas do edifício de 6 frações em Torres Vedras e fez as medições e o orçamento.", "aprovar"],
    ["10:35", "Leu o convite da consulta prévia n.º 14/2026 e preparou o pedido de esclarecimentos.", "aprovar"],
  ],
  auditoria: [
    ["06:30", "Autos de outubro preparados (3 contratos)", "IA", "aguarda aprovação"],
    ["06:45", "4 faturas lidas e conferidas com encomendas e guias", "IA", "feito"],
    ["07:10", "Relatório da fiscalização lido · 3 tarefas criadas", "IA", "feito"],
    ["ontem 21:41", "Resposta enviada à Arq.ª Inês Carvalho (fora de horas)", "IA (regra aprovada)", "feito"],
  ],
};
