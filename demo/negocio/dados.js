// Demostración Febrero AI · Capa de IA para constructoras (versión en español, es-ES).
// TODO LO QUE HAY EN ESTE ARCHIVO ES FICTICIO: Constructora Ejemplo, clientes, mensajes, planos, obras,
// proveedores, facturas, certificaciones y precios. Los precios unitarios son valores de demostración (sin IVA).
// Las claves internas que el código compara (ids, estado, tipo, regime, probabilidade, padrao, iva, faseId, "hoje", "feito"…)
// siguen en portugués, igual que en la versión PT; app.js las traduce al mostrarlas.
window.DADOS = {
  empresa: { nome: "Constructora Ejemplo", juridico: "Constructora Ejemplo, S.L.", sub: "Construcción y promoción inmobiliaria" },

  // ---------- plantas desenhadas no browser (SVG) a partir destas divisões ----------
  // coordenadas em metros, relativas ao canto do piso; divisões nos eixos das paredes:
  //   divisão  [nome, x0, y0, x1, y1, {escada, g (grupo)}]
  //   porta    [x, y, "h" parede horizontal | "v" parede vertical, largura, abre para +1 / −1, 0 = vão aberto]
  //   vão      [lado N/S/E/O, início ao longo do lado, largura, "p" = porta exterior]
  //   exterior [nome, x0, y0, x1, y1, tipo: alpendre | terraco | varanda | piscina]
  // nomes das divisões: app.js (medir) conta baños/aseos, cocinas/lavaderos e dormitorios/suite pelos nomes
  projetos: [
    { id: "t3mafra", nome: "Chalé de 3 dormitorios", local: "Mafra", tipologia: "3 dormitorios · una planta", tipo: "moradia", regime: "chave-na-mão",
      fracoes: 1, prazo: "de 10 a 12 meses de obra", cliente: ["Sofia y Miguel Antunes", "Malveira, Mafra"],
      padrao: { estrutura: "betao", acabamento: "standard", cobertura: "telhado", caixilharia: "aluminio" },
      pisos: [{ nome: "Planta baja", ox: 0, oy: 0, W: 18, H: 10,
        divisoes: [
          ["Dormitorio 2", 0, 0, 4, 3.4], ["Baño", 4, 0, 6.2, 3.4], ["Lavadero", 6.2, 0, 8.8, 3.4],
          ["Pasillo", 0, 3.4, 8.8, 4.6], ["Recibidor", 8.8, 0, 11, 4.6], ["Cocina", 11, 0, 16, 4.6],
          ["Despensa", 16, 0, 18, 4.6], ["Suite", 0, 4.6, 4, 10], ["Baño suite", 4, 4.6, 6, 7.2],
          ["Vestidor", 4, 7.2, 6, 10], ["Dormitorio 1", 6, 4.6, 8.8, 10], ["Salón-comedor", 8.8, 4.6, 18, 10],
        ],
        portas: [[8.8, 4, "v", 0.9, -1], [11, 2.4, "v", 0.9, 1], [9.9, 4.6, "h", 1.4, 0], [16, 3.2, "v", 0.8, 1],
          [13.6, 4.6, "h", 1.2, 0], [3.2, 3.4, "h", 0.8, -1], [5.1, 3.4, "h", 0.8, -1], [7.5, 3.4, "h", 0.8, -1],
          [3.2, 4.6, "h", 0.8, 1], [7.4, 4.6, "h", 0.8, 1], [4, 5.9, "v", 0.7, 1], [4, 8.6, "v", 0.7, 1]],
        vaos: [["N", 1.2, 1.6], ["N", 4.8, 0.6], ["N", 7.1, 0.8], ["N", 9.4, 1, "p"], ["N", 12.6, 1.8], ["N", 16.7, 0.6],
          ["S", 1, 2], ["S", 6.6, 1.6], ["S", 10, 3.2], ["S", 14, 3.2], ["O", 3.6, 0.8], ["E", 6.4, 2]],
        exteriores: [["Porche", 9.6, 10, 17.2, 12.8, "alpendre"]] }] },

    { id: "t4ericeira", nome: "Chalé de 4 dormitorios con piscina", local: "Ericeira", tipologia: "4 dormitorios · 2 plantas", tipo: "moradia", regime: "chave-na-mão",
      fracoes: 1, prazo: "de 12 a 14 meses de obra", cliente: ["la Fam. Correia", "Ericeira"],
      padrao: { estrutura: "betao", acabamento: "premium", cobertura: "plana", caixilharia: "aluminio" },
      pisos: [
        { nome: "Planta baja", ox: 0, oy: 0, W: 12, H: 10,
          divisoes: [
            ["Dormitorio 4", 0, 0, 3.6, 4.8], ["Recibidor", 3.6, 0, 5.6, 4.8], ["Aseo", 5.6, 0, 8.2, 2],
            ["Escalera", 5.6, 2, 8.2, 4.8, { escada: true }], ["Cocina", 8.2, 0, 12, 4.8],
            ["Salón", 0, 4.8, 6.4, 10], ["Comedor", 6.4, 4.8, 12, 10],
          ],
          portas: [[3.6, 2.4, "v", 0.8, -1], [5.6, 1, "v", 0.7, 1], [5.6, 3.4, "v", 2.4, 0], [4.6, 4.8, "h", 1, 1],
            [10.1, 4.8, "h", 1.2, -1], [6.4, 7.4, "v", 3.6, 0]],
          vaos: [["N", 1, 1.6], ["N", 4.1, 1, "p"], ["N", 6.6, 0.6], ["N", 9.2, 1.8], ["S", 1, 4], ["S", 7.2, 4],
            ["O", 6.2, 1.8], ["E", 1.4, 1.2], ["E", 6.2, 1.8]],
          exteriores: [["Terraza", 0, 10, 12, 12.6, "terraco"], ["Piscina", 1.5, 13.2, 9.5, 17.2, "piscina"]] },
        { nome: "Planta primera", ox: 15, oy: 0, W: 12, H: 10,
          divisoes: [
            ["Dormitorio 2", 0, 0, 3.6, 4.8], ["Baño", 3.6, 0, 5.6, 4.8], ["Ropero", 5.6, 0, 8.2, 2],
            ["Escalera", 5.6, 2, 8.2, 4.8, { escada: true }], ["Dormitorio 3", 8.2, 0, 12, 4.8], ["Pasillo", 0, 4.8, 12, 6],
            ["Suite", 0, 6, 4.6, 10], ["Vestidor", 4.6, 6, 6.2, 10], ["Baño suite", 6.2, 6, 8.4, 10], ["Despacho", 8.4, 6, 12, 10],
          ],
          portas: [[2.6, 4.8, "h", 0.8, -1], [4.6, 4.8, "h", 0.7, -1], [6.9, 4.8, "h", 2.4, 0], [6.9, 2, "h", 0.8, -1],
            [9.2, 4.8, "h", 0.8, -1], [3.6, 6, "h", 0.8, 1], [4.6, 8, "v", 0.7, 1], [6.2, 8, "v", 0.7, 1], [10.2, 6, "h", 0.8, 1]],
          vaos: [["N", 1, 1.6], ["N", 4.3, 0.6], ["N", 9.2, 1.8], ["S", 1, 2.6], ["S", 6.9, 0.8], ["S", 9.2, 2],
            ["O", 5, 0.8], ["E", 5, 0.8]],
          exteriores: [["Balcón", 0, 10, 4.6, 11.4, "varanda"]] },
      ] },

    { id: "edificio6", nome: "Edificio de 6 viviendas", local: "Torres Vedras", tipologia: "6 × 2 dormitorios · planta baja + 2", tipo: "edificio", regime: "empreitada geral",
      fracoes: 6, elevador: true, prazo: "de 16 a 18 meses de obra", cliente: ["Promotora Ejemplo, S.L.", "Torres Vedras"],
      padrao: { estrutura: "betao", acabamento: "standard", cobertura: "plana", caixilharia: "pvc" },
      pisos: [{ nome: "Planta tipo", sub: "Planta baja, 1.ª y 2.ª", rep: 3, ox: 0, oy: 0, W: 22, H: 11,
        divisoes: [
          ["Dormitorio 1", 0, 0, 3.6, 4.2, { g: "Vivienda A" }], ["Baño", 3.6, 0, 5.8, 4.2, { g: "Vivienda A" }],
          ["Dormitorio 2", 5.8, 0, 9.6, 4.2, { g: "Vivienda A" }], ["Distribuidor", 0, 4.2, 9.6, 5.6, { g: "Vivienda A" }],
          ["Salón", 0, 5.6, 6, 11, { g: "Vivienda A" }], ["Cocina", 6, 5.6, 9.6, 11, { g: "Vivienda A" }],
          ["Escalera", 9.6, 0, 12.4, 4.2, { escada: true, g: "Zonas comunes" }], ["Vestíbulo y ascensor", 9.6, 4.2, 12.4, 11, { g: "Zonas comunes" }],
          ["Dormitorio 2", 12.4, 0, 16.2, 4.2, { g: "Vivienda B" }], ["Baño", 16.2, 0, 18.4, 4.2, { g: "Vivienda B" }],
          ["Dormitorio 1", 18.4, 0, 22, 4.2, { g: "Vivienda B" }], ["Distribuidor", 12.4, 4.2, 22, 5.6, { g: "Vivienda B" }],
          ["Cocina", 12.4, 5.6, 16, 11, { g: "Vivienda B" }], ["Salón", 16, 5.6, 22, 11, { g: "Vivienda B" }],
        ],
        elevador: [10.8, 6.6, 12.2, 8.2],
        portas: [[2.4, 4.2, "h", 0.8, -1], [4.7, 4.2, "h", 0.7, -1], [7, 4.2, "h", 0.8, -1], [3, 5.6, "h", 1.2, 1], [7.8, 5.6, "h", 0.8, 1],
          [9.6, 4.9, "v", 0.9, -1], [12.4, 4.9, "v", 0.9, 1], [11, 4.2, "h", 2.4, 0],
          [19.6, 4.2, "h", 0.8, -1], [17.3, 4.2, "h", 0.7, -1], [15, 4.2, "h", 0.8, -1], [19, 5.6, "h", 1.2, 1], [14.2, 5.6, "h", 0.8, 1]],
        vaos: [["N", 1, 1.6], ["N", 4.4, 0.6], ["N", 6.9, 1.6], ["N", 10.4, 1.2], ["N", 13.5, 1.6], ["N", 17, 0.6], ["N", 19.4, 1.6],
          ["S", 1, 3], ["S", 7, 1.6], ["S", 9.9, 1.2, "p"], ["S", 13.4, 1.6], ["S", 18, 3], ["O", 7, 1.6], ["E", 7, 1.6]],
        exteriores: [["Balcón A", 0.6, 11, 6, 12.4, "varanda"], ["Balcón B", 16, 11, 21.4, 12.4, "varanda"]] }] },

    { id: "reabilisboa", nome: "Rehabilitación de edificio", local: "Lisboa", tipologia: "4 × 2 dormitorios · planta baja + 3", tipo: "reabilitacao", reab: true,
      regime: "empreitada geral", fracoes: 4, prazo: "de 12 a 14 meses de obra", cliente: ["la propiedad (vía la arquitecta Inês Carvalho)", "Arroios, Lisboa"],
      te: 0.5, fachadas: ["O", "E"], notaLeitura: "muros de fábrica existentes: 2 espesores por confirmar en obra",
      padrao: { estrutura: "metalica", acabamento: "standard", cobertura: "telhado", caixilharia: "aluminio" },
      pisos: [{ nome: "Planta tipo", sub: "Planta baja a 3.ª", rep: 4, ox: 0, oy: 0, W: 15, H: 8,
        divisoes: [
          ["Salón", 0, 0, 4.4, 4.6], ["Dormitorio 1", 0, 4.6, 4.4, 8], ["Baño", 4.4, 0, 6.6, 3.4], ["Lavadero", 6.6, 0, 8.6, 3.4],
          ["Trastero", 8.6, 0, 10.6, 3.4], ["Cocina", 10.6, 0, 15, 3.4], ["Pasillo", 4.4, 3.4, 15, 4.6],
          ["Recibidor", 4.4, 4.6, 7.4, 8], ["Escalera (común)", 7.4, 4.6, 10.6, 8, { escada: true }], ["Dormitorio 2", 10.6, 4.6, 15, 8],
        ],
        portas: [[4.4, 4, "v", 0.9, -1], [4.4, 6.3, "v", 0.8, -1], [5.5, 3.4, "h", 0.7, -1], [7.6, 3.4, "h", 0.7, -1], [9.6, 3.4, "h", 0.7, -1],
          [12.8, 3.4, "h", 0.9, -1], [12.8, 4.6, "h", 0.8, 1], [5.9, 4.6, "h", 1.6, 0], [7.4, 6.3, "v", 1, -1]],
        vaos: [["O", 0.8, 1.2], ["O", 2.8, 1.2], ["O", 5.6, 1.2], ["E", 1.1, 1.2], ["E", 3.6, 0.8], ["E", 5.6, 1.2]],
        exteriores: [["Balcón", 15, 4.9, 16.2, 7.7, "varanda"]] }] },
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
    { id: "p1", nome: "Sofia Antunes", canal: "WhatsApp", hora: "08:04", assunto: "Chalé de 3 dormitorios en Mafra", estado: "novo", projeto: "t3mafra",
      cliente: ["Sofia y Miguel Antunes", "Malveira, Mafra"],
      texto: "¡Buenos días! Hemos comprado un terreno de 650 m² en Malveira y queremos construir un chalé de una planta con 3 dormitorios, de unos 180 m², con un salón grande orientado al sur y un porche. Nuestro límite son 250.000 € y vamos a pedir una hipoteca. ¿Nos pueden dar una idea de precio y de plazo? Todavía no tenemos arquitecto. ¡Gracias! Sofia",
      campos: [["Tipología", "3 dormitorios, una planta"], ["Superficie", "≈ 180 m²"], ["Terreno", "650 m², Malveira (Mafra)"], ["Exterior", "porche, salón al sur"],
        ["Presupuesto", "hasta 250.000 €"], ["Financiación", "hipoteca"], ["Proyecto", "todavía sin arquitecto"], ["Solicitud", "precio y plazo"]],
      semelhantes: [["t3mafra", 95], ["t4ericeira", 58]], probabilidade: "alta",
      nota: "Encaja en su presupuesto con acabados estándar. El banco pedirá un presupuesto detallado y un cronograma financiero: los dos salen de este presupuesto.",
      resposta: "¡Buenos días, Sofia! Gracias por contactar con nosotros.\n\nHace poco presupuestamos un chalé muy parecido en Mafra (una planta, 3 dormitorios, 180 m², salón al sur y porche). Llave en mano, con acabados estándar, la estimación inicial ronda los {valor} (sin IVA), ya con los proyectos de arquitectura, estructura e instalaciones y las licencias.\n\nComo van a pedir una hipoteca, también les preparamos el presupuesto detallado y el cronograma financiero que pide el banco para la tasación.\n\n¿Podemos ver el terreno de Malveira esta semana, el jueves a las 10:00 o el sábado a las 11:00? Si tienen la nota simple y el plano de situación, tráiganlos, por favor.\n\nDepartamento Comercial · Constructora Ejemplo" },
    { id: "p2", nome: "Ricardo Faria", empresa: "Promotora Ejemplo, S.L.", canal: "Email", hora: "09:12", assunto: "Propuesta: edificio de 6 viviendas en Torres Vedras",
      estado: "novo", projeto: "edificio6", cliente: ["Promotora Ejemplo, S.L.", "Torres Vedras"], anexo: "Planos_6_viviendas.pdf · Memoria_calidades.xlsx",
      texto: "Buenos días. Tenemos aprobado el proyecto de arquitectura de un edificio residencial de 6 viviendas de 2 dormitorios (planta baja + 2, unos 730 m² construidos) en Torres Vedras. Querríamos recibir una propuesta de contrato de obra, con los proyectos de estructura e instalaciones incluidos. Adjuntamos los planos y la memoria de calidades. Necesitamos los importes antes del día 15 para cerrar la financiación con el banco. Un saludo, Ricardo Faria",
      campos: [["Tipo", "edificio plurifamiliar"], ["Viviendas", "6 × 2 dormitorios"], ["Plantas", "planta baja + 2"], ["Superficie construida", "≈ 730 m²"],
        ["Modalidad", "contrato de obra"], ["Proyecto", "arquitectura aprobada"], ["Estructura e instalaciones", "a incluir en la propuesta"], ["Plazo de la propuesta", "hasta el 15 de noviembre"]],
      semelhantes: [["edificio6", 96], ["reabilisboa", 54]], probabilidade: "alta",
      nota: "Cliente con obra en curso (Edificio de 8 viviendas). El banco pedirá mediciones y cronograma financiero: los dos salen del presupuesto de la IA.",
      resposta: "Buenos días, Ricardo:\n\nGracias por la documentación. Ya hemos leído los planos: según nuestras mediciones, el edificio tiene 726 m² construidos, 6 viviendas de 2 dormitorios y un núcleo de escalera con ascensor. Con la memoria de calidades que nos ha enviado (nivel estándar), la estimación del contrato de obra es de {valor} (sin IVA), unos {m2} por m², ya con los proyectos de estructura e instalaciones.\n\nLe enviaremos la propuesta formal, con las mediciones y el cronograma financiero, antes del día 12, a tiempo para la reunión con el banco. Antes, ¿podríamos visitar el terreno el martes por la mañana?\n\nUn cordial saludo,\nDirección Comercial · Constructora Ejemplo" },
    { id: "p3", nome: "Departamento de Obras Municipales", canal: "Email", hora: "10:31", assunto: "Licitación n.º 14/2026: rehabilitación de escuela", estado: "novo",
      projeto: "reabilisboa", cliente: ["el Ayuntamiento (licitación n.º 14/2026)", "antigua escuela primaria"], estimativa: 352000, precoBase: 385000,
      anexo: "Invitacion_14-2026.pdf · Pliego_condiciones.pdf · Mediciones_escuela.xlsx", rotuloResposta: "Solicitud de aclaraciones preparada",
      texto: "Estimados señores: de acuerdo con el Código de los Contratos Públicos, el Ayuntamiento les invita a presentar oferta en la licitación por invitación n.º 14/2026, para la rehabilitación del edificio de la antigua escuela primaria y su adaptación a centro comunitario. Presupuesto base de licitación: 385.000 €, IVA no incluido. Plazo de ejecución: 240 días. Las ofertas deben presentarse antes de las 17:00 del 7 de noviembre en la plataforma electrónica de contratación pública. Se adjuntan los documentos de la licitación: invitación, pliego de condiciones, proyecto de ejecución y mediciones. Atentamente, el Departamento de Obras Municipales",
      campos: [["Procedimiento", "licitación por invitación n.º 14/2026"], ["Objeto", "escuela → centro comunitario"], ["Presupuesto base", "385.000 € + IVA"], ["Plazo de ejecución", "240 días"],
        ["Entrega", "7 nov, 17:00 (plataforma)"], ["Criterio", "precio más bajo"], ["Clasificación", "1.ª categoría, clase 3 ✓"], ["Aclaraciones", "hasta el 28 de octubre"]],
      semelhantes: [["reabilisboa", 81], ["edificio6", 47]], probabilidade: "média",
      nota: "Según las mediciones de la licitación, el coste estimado es de 352.000 €: un 8,6% por debajo del presupuesto base. Hay 2 partidas sin cantidad (4.3 y 7.1); las aclaraciones solo pueden pedirse en el primer tercio del plazo, hasta el 28 de octubre.",
      resposta: "Estimados señores:\n\nEn relación con la licitación n.º 14/2026, les solicitamos las siguientes aclaraciones:\n\n1. La partida 4.3 de las mediciones (refuerzo de forjados) no indica cantidad. ¿Debemos considerar la superficie total de la planta 1 (212 m²)?\n2. La partida 7.1 (red de pluviales) remite al proyecto, que no incluye la cubierta del anexo. ¿Está esta zona incluida en el contrato?\n\nSolicitamos además una visita al edificio la próxima semana.\n\nAtentamente,\nConstructora Ejemplo, S.L." },
    { id: "p4", nome: "Carla Mendes", empresa: "Edifica Ejemplo, S.A.", canal: "WhatsApp", hora: "ayer 18:47", assunto: "Subcontrata de estructura · Loures (24 viviendas)",
      estado: "novo", anexo: "Mediciones_estructura_Loures.xlsx",
      texto: "¡Buenas tardes! Necesitamos precio para la subcontrata de encofrado y hormigonado de un edificio de 24 viviendas en Loures. Le mando las mediciones en Excel. El hormigón, el acero y la grúa los ponemos nosotros; el material de encofrado corre de su cuenta. Inicio previsto en enero. ¿Me lo puede mandar para el viernes? Gracias",
      campos: [["Trabajo", "encofrado, hormigonado y ferralla"], ["Obra", "24 viviendas, Loures"], ["Aporta el cliente", "hormigón, acero y grúa"], ["A nuestro cargo", "encofrado y apuntalamiento"],
        ["Inicio", "enero de 2027"], ["Plazo de la oferta", "viernes"], ["Mediciones", "5 partidas leídas"], ["IVA", "inversión del sujeto pasivo"]],
      mq: [["Encofrado de forjados", "m²", 3850, 14.5], ["Encofrado de vigas y pilares", "m²", 1920, 19], ["Encofrado de muros (núcleos)", "m²", 640, 16],
        ["Hormigonado (mano de obra)", "m³", 1420, 9.5], ["Montaje de acero A500", "kg", 148000, 0.32]],
      probabilidade: "alta",
      nota: "Precios de la subcontrata de Odivelas (mismo cliente, en curso, un 4% por debajo del coste previsto). El equipo de encofrado queda libre en enero.",
      resposta: "¡Buenas tardes, Carla! Le envío nuestra oferta para la estructura de Loures, a partir de sus mediciones: {valor} (sin IVA, con inversión del sujeto pasivo), con los precios unitarios en el Excel adjunto.\n\nIncluye el material de encofrado y el apuntalamiento; hormigón, acero y grúa por su cuenta, como nos indicó. Podemos empezar el 11 de enero, con 8 encofradores y 2 ferrallistas. Oferta válida durante 30 días.\n\nCualquier duda, ¡dígame! 👍" },
    { id: "p5", nome: "Inês Carvalho", canal: "Email", hora: "ayer 21:40", assunto: "Planos de un edificio a rehabilitar en Arroios", estado: "respondido",
      projeto: "reabilisboa", cliente: ["la propiedad (vía la arquitecta Inês Carvalho)", "Arroios, Lisboa"], anexo: "Arroios_proyecto_basico.dwg",
      texto: "Hola, buenas noches. Les envío los planos del proyecto básico de un edificio que estamos rehabilitando en Arroios: planta baja + 3, una vivienda de 2 dormitorios por planta, unos 480 m². La propiedad quiere una estimación de costes antes de pasar al proyecto de ejecución. ¿Pueden ayudarnos? Gracias, Inês",
      campos: [["Tipo", "rehabilitación de edificio"], ["Ubicación", "Arroios, Lisboa"], ["Plantas", "planta baja + 3"], ["Viviendas", "4 × 2 dormitorios"],
        ["Superficie construida", "≈ 480 m²"], ["Fase", "proyecto básico (licencia)"], ["Solicitud", "estimación de costes"], ["Adjunto", "planos DWG leídos"]],
      semelhantes: [["reabilisboa", 97], ["edificio6", 49]], probabilidade: "média",
      nota: "La IA respondió ayer a las 21:41 (fuera de horario). La estimación por capítulos ya está lista: falta revisarla y enviarla.",
      resposta: "Buenas noches, Inês:\n\n¡Gracias por los planos! Ya los estamos analizando y mañana, antes de las 12:00, le enviamos la estimación de costes por capítulos. Si tiene el levantamiento de los muros existentes o fotografías del interior, envíenoslos, por favor: nos ayudan a ajustar las demoliciones y el refuerzo estructural.\n\nUn saludo,\nDepartamento de Presupuestos · Constructora Ejemplo" },
  ],

  // ---------- obras em curso (FICTÍCIAS) · semanas contadas a partir de 5 out 2026 ----------
  // fases: lic (licenciamento), est (fundações e estrutura), env (alvenarias e cobertura), inst (instalações), acab (acabamentos)
  obras: [
    { id: "o1", nome: "Edificio de 8 viviendas", curto: "Edif. 8 viviendas", local: "Venda do Pinheiro", cliente: "Promotora Ejemplo, S.L.", tipo: "edificio",
      fase: "Estructura", faseId: "est", progresso: 34, previstoPct: 40, atrasoDias: 9, causa: "lluvia en la semana 41 y cambio en el forjado de la planta 2 pedido en obra",
      orcamento: 1124000, previsto: 398000, real: 421500, fases: [["est", 0, 9], ["env", 6, 16], ["inst", 11, 21], ["acab", 17, 25]],
      alerta: "Informe de la dirección facultativa con 3 puntos a corregir. Coste de la estructura un 5,9% por encima de lo previsto." },
    { id: "o2", nome: "Chalé de 4 dormitorios con piscina", curto: "Chalé Ericeira", local: "Ericeira", cliente: "Fam. Correia", tipo: "moradia2",
      fase: "Albañilería y cubierta", faseId: "env", progresso: 55, previstoPct: 54, orcamento: 412000, previsto: 214600, real: 211900,
      fases: [["env", 0, 5], ["inst", 3, 10], ["acab", 8, 16]] },
    { id: "o3", nome: "Chalé de 3 dormitorios", curto: "Chalé Gradil", local: "Gradil, Mafra", cliente: "Fam. Gaspar", tipo: "moradia",
      fase: "Licencias", faseId: "lic", progresso: 8, previstoPct: 8, orcamento: 238000, previsto: 9800, real: 9600,
      fases: [["lic", 0, 6], ["est", 7, 13], ["env", 12, 19], ["inst", 17, 23], ["acab", 21, 25]],
      alerta: "El ayuntamiento pide un anexo al proyecto de fontanería y saneamiento: plazo hasta el 6 de noviembre." },
    { id: "o4", nome: "Rehabilitación de edificio", curto: "Rehab. Graça", local: "Graça, Lisboa", cliente: "Sr. Álvaro Pinto", tipo: "reabilitacao",
      fase: "Acabados", faseId: "acab", progresso: 81, previstoPct: 80, orcamento: 598000, previsto: 462000, real: 455300,
      fases: [["inst", 0, 2], ["acab", 0, 7]] },
    { id: "o5", nome: "Estructura de edificio (subcontrata)", curto: "Estructura Odivelas", local: "Odivelas", cliente: "Edifica Ejemplo, S.A.", tipo: "estrutura",
      fase: "Estructura", faseId: "est", progresso: 64, previstoPct: 60, orcamento: 186000, previsto: 112000, real: 107500, fases: [["est", 0, 11]] },
    { id: "o6", nome: "Chalé de 3 dormitorios", curto: "Chalé Sobral", local: "Sobral de Monte Agraço", cliente: "Fam. Rocha", tipo: "moradia",
      fase: "Instalaciones", faseId: "inst", progresso: 47, previstoPct: 52, atrasoDias: 6, causa: "carpintería exterior entregada con una semana de retraso",
      orcamento: 255000, previsto: 118000, real: 120900, fases: [["inst", 0, 6], ["acab", 4, 13]] },
  ],

  // o email da fiscalização (FICTÍCIO) que a IA transforma em tarefas
  fiscalizacao: { obra: "o1", hora: "07:02", de: "Paulo Sequeira · Dirección facultativa", prazo: "31 de octubre",
    assunto: "Informe de visita n.º 14 (23/10) · no conformidades",
    texto: "Estimados señores: en la visita de ayer comprobamos: 1) recubrimiento insuficiente de las armaduras de la viga V12 de la planta 3, a corregir antes del hormigonado; 2) falta de barandillas en el perímetro del forjado de la planta 2; 3) todavía no hemos recibido los resultados de los ensayos a compresión de las probetas del forjado de la planta 1. Les agradecemos una respuesta antes del 31 de octubre. Atentamente, Paulo Sequeira",
    tarefas: [["Corregir el recubrimiento de la viga V12 (planta 3) antes del hormigonado", "Encargado", "27 oct"],
      ["Colocar barandillas en el perímetro del forjado de la planta 2", "Técnico de prevención", "hoje"],
      ["Enviar los resultados de los ensayos de las probetas de la planta 1", "Jefe de obra", "30 oct"]] },

  // ---------- contratos com autos de medição (FICTÍCIOS) ----------
  // artigo: [n.º, descrição, unidade, quantidade contratada, preço unitário, acumulado até ao auto anterior]
  // linha da folha de obra: [data, frente, como o encarregado escreveu, quantidade, unidade, artigo]
  contratos: [
    { id: "c1", obra: "o1", auto: 7, mes: "octubre de 2026", nome: "Edificio de 8 viviendas", cliente: "Promotora Ejemplo, S.L.", local: "Venda do Pinheiro",
      para: "Paulo Sequeira", papel: "la dirección facultativa", valorContrato: 1124000, retencao: 0.05, iva: "normal",
      fontes: ["Producción_octubre.xlsx (encargado)", "4 partes de obra semanales", "32 fotografías fechadas", "Contrato y mediciones"],
      artigos: [["2.1", "Excavación general y transporte a vertedero", "m³", 1850, 7.8, 1850], ["3.1", "Hormigón C25/30 en cimentación", "m³", 186, 98, 186],
        ["3.2", "Encofrado de forjados", "m²", 2240, 24.5, 1120], ["3.3", "Encofrado de pilares y vigas", "m²", 1680, 29, 760],
        ["3.4", "Hormigón C25/30 en forjados, vigas y pilares", "m³", 610, 104, 298], ["3.5", "Acero A500 NR en armaduras", "kg", 61500, 1.42, 38900],
        ["3.7", "Impermeabilización de muros enterrados", "m²", 410, 12.8, 410], ["4.1", "Fábrica exterior de ladrillo térmico de 25 cm", "m²", 1320, 31.5, 0]],
      linhas: [["02/10", "Planta 1 · zona A", "encofrado forjado P1 zona A", 320, "m²", "3.2"], ["06/10", "Planta 1", "hormigonado forjado P1 (9 cubas + bomba)", 62.5, "m³", "3.4"],
        ["08/10", "Planta 2", "ferralla pilares y vigas P2", 8200, "kg", "3.5"], ["09/10", "Planta 2", "refuerzo armaduras forjado P2 (cambio pedido en obra, Libro de Órdenes anot. 12)", 3650, "kg", "3.5"],
        ["13/10", "Planta 2 · zona A", "encofrado pilares y vigas P2", 210, "m²", "3.3"], ["15/10", "Planta 2", "encofrado forjado P2 zonas A+B", 320, "m²", "3.2"],
        ["20/10", "Planta 2", "hormigonado pilares y vigas P2", 54, "m³", "3.4"], ["21/10", "Sótano", "impermeabilización muro norte", 28, "m²", "3.7"],
        ["22/10", "Planta 2", "ferralla forjado P2", 14500, "kg", "3.5"], ["23/10", "Planta 3 · zona A", "encofrado pilares y vigas P3", 210, "m²", "3.3"],
        ["23/10", "Planta baja", "ladrillo 25 fachada sur", 145, "m²", "4.1"], ["24/10", "Planta 2", "hormigonado forjado P2", 59.5, "m³", "3.4"]],
      justificacao: "Hay 2 partidas por encima de la cantidad contratada: la 3.5 (acero), por el cambio en el forjado de la planta 2 pedido en obra (Libro de Órdenes, anotación n.º 12), y la 3.7 (impermeabilización), por un ajuste de medición en el muro norte. Proponemos tratarlas como trabajos adicionales, con el presupuesto adjunto, para su aprobación." },
    { id: "c2", obra: "o2", auto: 5, mes: "octubre de 2026", nome: "Chalé de 4 dormitorios con piscina", cliente: "Fam. Correia", local: "Ericeira",
      para: "Nuno Teixeira", papel: "la dirección facultativa de la propiedad", valorContrato: 412000, retencao: 0.05, iva: "normal",
      fontes: ["Partes de obra (WhatsApp del encargado)", "18 fotografías fechadas", "Contrato y mediciones"],
      artigos: [["2.1", "Excavación y relleno", "m³", 260, 9.5, 260], ["3.1", "Estructura de hormigón armado", "PA", 1, 46800, 1],
        ["4.1", "Fábrica exterior de ladrillo térmico", "m²", 238, 34, 120], ["4.2", "Tabique interior de ladrillo de 11 cm", "m²", 286, 22, 40],
        ["5.1", "Cubierta plana: impermeabilización y aislamiento", "m²", 148, 96, 0], ["6.1", "Aislamiento térmico por el exterior (SATE)", "m²", 238, 52, 0],
        ["7.1", "Red de fontanería y saneamiento (1.ª fase)", "PA", 1, 7900, 0]],
      linhas: [["01/10", "Planta 1", "ladrillo térmico fachadas P1", 64, "m²", "4.1"], ["03/10", "Planta baja", "ladrillo 11 tabiques PB", 92, "m²", "4.2"],
        ["08/10", "Cubierta", "lámina + XPS cubierta (mitad)", 74, "m²", "5.1"], ["10/10", "Planta 1", "ladrillo térmico fachadas P1 (cierre)", 54, "m²", "4.1"],
        ["14/10", "Planta 1", "ladrillo 11 tabiques P1", 68, "m²", "4.2"], ["17/10", "Cubierta", "lámina + XPS cubierta (resto)", 74, "m²", "5.1"],
        ["21/10", "Fachada sur", "SATE fachada sur", 96, "m²", "6.1"], ["23/10", "Planta baja", "tuberías fontanería y saneamiento PB (50%)", 0.5, "PA", "7.1"]],
      justificacao: "Todas las partidas están dentro de las cantidades contratadas." },
    { id: "c3", obra: "o5", auto: 4, mes: "octubre de 2026", nome: "Estructura de edificio (subcontrata)", cliente: "Edifica Ejemplo, S.A.", local: "Odivelas",
      para: "Carla Mendes", papel: "la jefatura de obra del contratista principal", valorContrato: 186000, retencao: 0.05, iva: "autoliquidacao",
      fontes: ["Registro diario del equipo (Excel)", "Albaranes de hormigón", "Contrato de subcontrata"],
      artigos: [["1", "Encofrado de forjados", "m²", 4120, 14.5, 2060], ["2", "Encofrado de vigas y pilares", "m²", 2050, 19, 1130],
        ["3", "Encofrado de muros (núcleos)", "m²", 690, 16, 460], ["4", "Hormigonado (mano de obra)", "m³", 1510, 9.5, 820],
        ["5", "Montaje de acero A500", "kg", 156000, 0.32, 88400]],
      linhas: [["03/10", "Planta 4", "encofrado forjado P4", 515, "m²", "1"], ["06/10", "Planta 4", "hormigonado forjado P4", 168, "m³", "4"],
        ["07/10", "Núcleo", "encofrado muros núcleo P5", 135, "m²", "3"], ["09/10", "Planta 5", "pilares y vigas P5", 260, "m²", "2"],
        ["10/10", "Planta 5", "ferralla P5", 15600, "kg", "5"], ["16/10", "Planta 5", "encofrado forjado P5", 515, "m²", "1"],
        ["17/10", "Núcleo", "encofrado muros núcleo P6", 135, "m²", "3"], ["20/10", "Planta 5", "hormigonado forjado P5", 162, "m³", "4"],
        ["22/10", "Planta 6", "pilares y vigas P6", 260, "m²", "2"], ["23/10", "Planta 6", "ferralla P6", 15600, "kg", "5"]],
      justificacao: "La partida 3 (encofrado de muros de los núcleos) ya supera lo contratado: el núcleo de la planta 6 tiene un muro más tras el anexo al proyecto de estructura. Le pedimos su confirmación para tratarla como trabajo adicional." },
  ],
  faturadoMes: { valor: 96400, obras: "Rehabilitación de edificio en Graça y Chalé de 3 dormitorios en Sobral de Monte Agraço" },

  // ---------- faturas de fornecedores (FICTÍCIAS) · linha: [descrição, quantidade, unidade, preço unitário] ----------
  // app.js corta a descrição em " (" e ", " (tabela) e em " S" (email ao fornecedor): manter "Hormigón C25/30 S3…"
  faturas: [
    { id: "f1", fornecedor: "Hormigones Ejemplo, S.A.", nif: "509 482 170", numero: "FT B/2026/1187", data: "22/10/2026", obra: "o1", capitulo: "Estructura · hormigón",
      linhas: [["Hormigón C25/30 S3 XC2 D22 Cl0,4", 62.5, "m³", 89.9], ["Bombeo con bomba de pluma", 1, "serv.", 420]],
      encomenda: { n: "PED 2026/311", data: "30/09/2026", qtd: [60, 1], pu: [83.95, 420] },
      guias: { ref: "ALB 21771 a ALB 21779", n: 9, qtd: [62.5, 1], nota: "+2,5 m³ pedidos en obra (firmado en el ALB 21779)" } },
    { id: "f2", fornecedor: "Aceros Ejemplo, S.L.", nif: "514 223 905", numero: "FT 2026/0932", data: "21/10/2026", obra: "o1", capitulo: "Estructura · armaduras",
      linhas: [["Acero A500 NR SD, cortado y doblado", 12480, "kg", 0.92], ["Transporte", 1, "serv.", 95]],
      encomenda: { n: "PED 2026/298 (abierto)", data: "15/09/2026", qtd: [24000, 2], pu: [0.92, 95] },
      guias: { ref: "ALB 7711 y ALB 7712", n: 2, qtd: [10340, 1] } },
    { id: "f3", fornecedor: "Encofrados Ejemplo, S.L.", nif: "516 731 040", numero: "FT A/2026/2210", data: "20/10/2026", obra: "o5", capitulo: "Encofrado · alquiler",
      linhas: [["Alquiler de mesas de encofrado (420 m² × 30 días)", 12600, "m²·día", 0.085], ["Alquiler de puntales metálicos (380 ud × 30 días)", 11400, "ud·día", 0.06],
        ["Transporte", 1, "serv.", 180]],
      encomenda: { n: "Contrato de alquiler CA 2026/09", data: "01/09/2026", qtd: [12600, 11400, 1], pu: [0.085, 0.06, 180] },
      guias: { ref: "ALB 3302 y registro de material en obra", n: 1, qtd: [12600, 11400, 1] } },
    { id: "f4", fornecedor: "Áridos Ejemplo, S.L.", nif: "507 918 360", numero: "FT 2026/1544", data: "19/10/2026", obra: "o2", capitulo: "Albañilería · áridos",
      linhas: [["Arena lavada 0/4", 48, "t", 14.2], ["Grava 6/14", 36, "t", 15.8], ["Zahorra", 60, "t", 9.4]],
      encomenda: { n: "PED 2026/305", data: "02/10/2026", qtd: [48, 36, 60], pu: [14.5, 16.2, 9.6] },
      guias: { ref: "ALB 4410 a ALB 4415", n: 6, qtd: [48, 36, 60] } },
  ],
  // preços de compra nos últimos 90 dias: [fornecedor, material, unidade, antes, agora, nota]
  precosFornecedores: [
    ["Hormigones Ejemplo, S.A.", "Hormigón C25/30 S3", "€/m³", 83.95, 89.9, "factura del 22/10"],
    ["Cerámicas Ejemplo, S.L.", "Ladrillo térmico de 25 cm", "€/ud", 1.12, 1.19, "nueva tarifa desde el 1 de octubre"],
    ["Aceros Ejemplo, S.L.", "Acero A500 NR cortado y doblado", "€/kg", 0.92, 0.92, ""],
    ["Áridos Ejemplo, S.L.", "Arena lavada 0/4", "€/t", 14.5, 14.2, ""],
    ["Encofrados Ejemplo, S.L.", "Alquiler de mesas de encofrado", "€/m²·día", 0.085, 0.085, ""],
  ],
  betaoNovembro: 410,   // m³ de betão previstos para novembro (planeamento das obras)

  // ---------- painel ----------
  // {autos} e {edificio} são calculados pela app a partir dos dados acima
  briefing: [
    ["El informe de la dirección facultativa del Edificio de 8 viviendas (Venda do Pinheiro) tiene 3 puntos a corregir, uno de ellos antes del próximo hormigonado. Las tareas y el borrador de la respuesta ya están listos.", "obras"],
    ["Las certificaciones de octubre de 3 contratos están listas: {autos} a facturar. En el Edificio de 8 viviendas, el acero ya va un 6,1% por encima de lo contratado; la justificación como trabajos adicionales está redactada.", "autos"],
    ["La factura del hormigón de Hormigones Ejemplo ha llegado a 89,90 €/m³, un 7,1% más que en el pedido. La solicitud de abono está lista para enviar.", "faturas"],
    ["Hay 4 solicitudes de presupuesto sin responder. El edificio de 6 viviendas de Torres Vedras ya tiene estimación ({edificio}) y la licitación de la escuela cierra el 7 de noviembre.", "pedidos"],
  ],
  passos: [
    ["Solicitud", "Lee el email y el WhatsApp, entiende lo que quiere el cliente y responde el mismo día.", "pedidos"],
    ["Visita", "Prepara la visita: terreno, accesos y las preguntas que hay que hacer al cliente.", "pedidos"],
    ["Presupuesto", "Mide a partir de los planos y presupuesta con sus precios, en horas.", "planta"],
    ["Proyecto", "Compara versiones de los planos y actualiza mediciones y presupuesto.", "planta"],
    ["Licencias", "Sigue los plazos y los requerimientos del ayuntamiento y prepara las respuestas.", "obras"],
    ["Obra", "Planificación, costes, pedidos e informes de la dirección facultativa.", "obras"],
    ["Certificaciones y facturación", "Certificaciones de obra hechas a partir de los partes de obra.", "autos"],
    ["Entrega", "Planos as built, Libro del Edificio y respuesta al cliente a cualquier hora.", "assistente"],
  ],
  funil: { meses: ["May", "Jun", "Jul", "Ago", "Sep", "Oct"], pedidos: [18, 22, 19, 14, 27, 31], propostas: [6, 7, 5, 4, 21, 27], adjudicacoes: [1, 2, 1, 1, 4, 6] },
  ocupacao: { semanas: ["S44", "S45", "S46", "S47", "S48", "S49"], valores: [82, 88, 97, 91, 76, 71],
    nota: "La semana 46 supera el 95%: la IA sugiere adelantar el hormigonado del forjado de Odivelas a la semana 45." },
  atividade: [
    ["06:30", "Ha leído 4 partes de obra y el Excel de producción y ha preparado las certificaciones de octubre de 3 contratos.", "aprovar"],
    ["06:45", "Ha leído 4 facturas de proveedores y las ha comprobado con pedidos y albaranes. Una llega un 7,1% por encima del precio del pedido.", "aprovar"],
    ["07:10", "Ha leído el informe de la dirección facultativa del Edificio de 8 viviendas y ha creado 3 tareas con plazo.", "feito"],
    ["08:05", "Ha preparado la respuesta a Sofia Antunes (WhatsApp) con una estimación para el chalé de 3 dormitorios en Mafra.", "aprovar"],
    ["09:20", "Ha leído los planos del edificio de 6 viviendas de Torres Vedras y ha hecho las mediciones y el presupuesto.", "aprovar"],
    ["10:35", "Ha leído la invitación de la licitación n.º 14/2026 y ha preparado la solicitud de aclaraciones.", "aprovar"],
  ],
  // estado: "feito" é a chave interna (o chip mostra «hecho»); os outros estados mostram-se tal como estão
  auditoria: [
    ["06:30", "Certificaciones de octubre preparadas (3 contratos)", "IA", "pendiente de aprobación"],
    ["06:45", "4 facturas leídas y comprobadas con pedidos y albaranes", "IA", "feito"],
    ["07:10", "Informe de la dirección facultativa leído · 3 tareas creadas", "IA", "feito"],
    ["ayer 21:41", "Respuesta enviada a la arquitecta Inês Carvalho (fuera de horario)", "IA (regla aprobada)", "feito"],
  ],
};
