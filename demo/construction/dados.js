// Febrero AI demo · AI layer for construction companies (English version of ../construcao/dados.js).
// EVERYTHING IN THIS FILE IS FICTIONAL: Example Builders, its clients, messages, floor plans, sites,
// suppliers, invoices, progress bills and prices. Unit rates are demo values (excl. VAT).
// Keys and the internal values the code compares (ids, estado, regime, tipo, faseId, padrao, "hoje", "feito"…) are the same as in the Portuguese file.
window.DADOS = {
  empresa: { nome: "Example Builders", juridico: "Example Builders Ltd", sub: "Construction and property development" },

  // ---------- floor plans drawn in the browser (SVG) from these rooms ----------
  // coordinates in metres, from the corner of the floor; rooms are measured to the wall centrelines:
  //   room     [name, x0, y0, x1, y1, {escada (stairs), g (group)}]
  //   door     [x, y, "h" horizontal wall | "v" vertical wall, width, opens towards +1 / −1, 0 = open doorway]
  //   opening  [side N/S/E/O (O = west), start along the side, width, "p" = external door]
  //   outdoor  [name, x0, y0, x1, y1, type: alpendre (porch) | terraco (terrace) | varanda (balcony) | piscina (pool)]
  // room names matter: app.js counts bathrooms (/bath|WC|en-suite/i), kitchens and utility rooms (/Kitchen|Utility/) and bedrooms (/bedroom/i) by name
  projetos: [
    { id: "t3mafra", nome: "3-bed house", local: "Mafra", tipologia: "3-bed single-storey", tipo: "moradia", regime: "chave-na-mão",
      fracoes: 1, prazo: "10 to 12 months on site", cliente: ["Sofia and Miguel Antunes", "Malveira, Mafra"],
      padrao: { estrutura: "betao", acabamento: "standard", cobertura: "telhado", caixilharia: "aluminio" },
      pisos: [{ nome: "Ground floor", ox: 0, oy: 0, W: 18, H: 10,
        divisoes: [
          ["Bedroom 2", 0, 0, 4, 3.4], ["Bathroom", 4, 0, 6.2, 3.4], ["Utility room", 6.2, 0, 8.8, 3.4],
          ["Corridor", 0, 3.4, 8.8, 4.6], ["Entrance hall", 8.8, 0, 11, 4.6], ["Kitchen", 11, 0, 16, 4.6],
          ["Pantry", 16, 0, 18, 4.6], ["Main bedroom", 0, 4.6, 4, 10], ["En-suite", 4, 4.6, 6, 7.2],
          ["Closet", 4, 7.2, 6, 10], ["Bedroom 1", 6, 4.6, 8.8, 10], ["Living room", 8.8, 4.6, 18, 10],
        ],
        portas: [[8.8, 4, "v", 0.9, -1], [11, 2.4, "v", 0.9, 1], [9.9, 4.6, "h", 1.4, 0], [16, 3.2, "v", 0.8, 1],
          [13.6, 4.6, "h", 1.2, 0], [3.2, 3.4, "h", 0.8, -1], [5.1, 3.4, "h", 0.8, -1], [7.5, 3.4, "h", 0.8, -1],
          [3.2, 4.6, "h", 0.8, 1], [7.4, 4.6, "h", 0.8, 1], [4, 5.9, "v", 0.7, 1], [4, 8.6, "v", 0.7, 1]],
        vaos: [["N", 1.2, 1.6], ["N", 4.8, 0.6], ["N", 7.1, 0.8], ["N", 9.4, 1, "p"], ["N", 12.6, 1.8], ["N", 16.7, 0.6],
          ["S", 1, 2], ["S", 6.6, 1.6], ["S", 10, 3.2], ["S", 14, 3.2], ["O", 3.6, 0.8], ["E", 6.4, 2]],
        exteriores: [["Porch", 9.6, 10, 17.2, 12.8, "alpendre"]] }] },

    { id: "t4ericeira", nome: "4-bed house with pool", local: "Ericeira", tipologia: "4-bed · 2 storeys", tipo: "moradia", regime: "chave-na-mão",
      fracoes: 1, prazo: "12 to 14 months on site", cliente: ["the Correia family", "Ericeira"],
      padrao: { estrutura: "betao", acabamento: "premium", cobertura: "plana", caixilharia: "aluminio" },
      pisos: [
        { nome: "Ground floor", ox: 0, oy: 0, W: 12, H: 10,
          divisoes: [
            ["Bedroom 4", 0, 0, 3.6, 4.8], ["Entrance hall", 3.6, 0, 5.6, 4.8], ["Guest WC", 5.6, 0, 8.2, 2],
            ["Stairs", 5.6, 2, 8.2, 4.8, { escada: true }], ["Kitchen", 8.2, 0, 12, 4.8],
            ["Living room", 0, 4.8, 6.4, 10], ["Dining room", 6.4, 4.8, 12, 10],
          ],
          portas: [[3.6, 2.4, "v", 0.8, -1], [5.6, 1, "v", 0.7, 1], [5.6, 3.4, "v", 2.4, 0], [4.6, 4.8, "h", 1, 1],
            [10.1, 4.8, "h", 1.2, -1], [6.4, 7.4, "v", 3.6, 0]],
          vaos: [["N", 1, 1.6], ["N", 4.1, 1, "p"], ["N", 6.6, 0.6], ["N", 9.2, 1.8], ["S", 1, 4], ["S", 7.2, 4],
            ["O", 6.2, 1.8], ["E", 1.4, 1.2], ["E", 6.2, 1.8]],
          exteriores: [["Terrace", 0, 10, 12, 12.6, "terraco"], ["Pool", 1.5, 13.2, 9.5, 17.2, "piscina"]] },
        { nome: "First floor", ox: 15, oy: 0, W: 12, H: 10,
          divisoes: [
            ["Bedroom 2", 0, 0, 3.6, 4.8], ["Bathroom", 3.6, 0, 5.6, 4.8], ["Linen room", 5.6, 0, 8.2, 2],
            ["Stairs", 5.6, 2, 8.2, 4.8, { escada: true }], ["Bedroom 3", 8.2, 0, 12, 4.8], ["Corridor", 0, 4.8, 12, 6],
            ["Main bedroom", 0, 6, 4.6, 10], ["Closet", 4.6, 6, 6.2, 10], ["En-suite", 6.2, 6, 8.4, 10], ["Study", 8.4, 6, 12, 10],
          ],
          portas: [[2.6, 4.8, "h", 0.8, -1], [4.6, 4.8, "h", 0.7, -1], [6.9, 4.8, "h", 2.4, 0], [6.9, 2, "h", 0.8, -1],
            [9.2, 4.8, "h", 0.8, -1], [3.6, 6, "h", 0.8, 1], [4.6, 8, "v", 0.7, 1], [6.2, 8, "v", 0.7, 1], [10.2, 6, "h", 0.8, 1]],
          vaos: [["N", 1, 1.6], ["N", 4.3, 0.6], ["N", 9.2, 1.8], ["S", 1, 2.6], ["S", 6.9, 0.8], ["S", 9.2, 2],
            ["O", 5, 0.8], ["E", 5, 0.8]],
          exteriores: [["Balcony", 0, 10, 4.6, 11.4, "varanda"]] },
      ] },

    { id: "edificio6", nome: "6-unit building", local: "Torres Vedras", tipologia: "6 × 2-bed · ground + 2 floors", tipo: "edificio", regime: "empreitada geral",
      fracoes: 6, elevador: true, prazo: "16 to 18 months on site", cliente: ["Example Developments Ltd", "Torres Vedras"],
      padrao: { estrutura: "betao", acabamento: "standard", cobertura: "plana", caixilharia: "pvc" },
      pisos: [{ nome: "Typical floor", sub: "ground, 1st and 2nd floors", rep: 3, ox: 0, oy: 0, W: 22, H: 11,
        divisoes: [
          ["Bedroom 1", 0, 0, 3.6, 4.2, { g: "Unit A" }], ["Bathroom", 3.6, 0, 5.8, 4.2, { g: "Unit A" }],
          ["Bedroom 2", 5.8, 0, 9.6, 4.2, { g: "Unit A" }], ["Hall", 0, 4.2, 9.6, 5.6, { g: "Unit A" }],
          ["Living room", 0, 5.6, 6, 11, { g: "Unit A" }], ["Kitchen", 6, 5.6, 9.6, 11, { g: "Unit A" }],
          ["Stairs", 9.6, 0, 12.4, 4.2, { escada: true, g: "Common areas" }], ["Lobby and lift", 9.6, 4.2, 12.4, 11, { g: "Common areas" }],
          ["Bedroom 2", 12.4, 0, 16.2, 4.2, { g: "Unit B" }], ["Bathroom", 16.2, 0, 18.4, 4.2, { g: "Unit B" }],
          ["Bedroom 1", 18.4, 0, 22, 4.2, { g: "Unit B" }], ["Hall", 12.4, 4.2, 22, 5.6, { g: "Unit B" }],
          ["Kitchen", 12.4, 5.6, 16, 11, { g: "Unit B" }], ["Living room", 16, 5.6, 22, 11, { g: "Unit B" }],
        ],
        elevador: [10.8, 6.6, 12.2, 8.2],
        portas: [[2.4, 4.2, "h", 0.8, -1], [4.7, 4.2, "h", 0.7, -1], [7, 4.2, "h", 0.8, -1], [3, 5.6, "h", 1.2, 1], [7.8, 5.6, "h", 0.8, 1],
          [9.6, 4.9, "v", 0.9, -1], [12.4, 4.9, "v", 0.9, 1], [11, 4.2, "h", 2.4, 0],
          [19.6, 4.2, "h", 0.8, -1], [17.3, 4.2, "h", 0.7, -1], [15, 4.2, "h", 0.8, -1], [19, 5.6, "h", 1.2, 1], [14.2, 5.6, "h", 0.8, 1]],
        vaos: [["N", 1, 1.6], ["N", 4.4, 0.6], ["N", 6.9, 1.6], ["N", 10.4, 1.2], ["N", 13.5, 1.6], ["N", 17, 0.6], ["N", 19.4, 1.6],
          ["S", 1, 3], ["S", 7, 1.6], ["S", 9.9, 1.2, "p"], ["S", 13.4, 1.6], ["S", 18, 3], ["O", 7, 1.6], ["E", 7, 1.6]],
        exteriores: [["Balcony A", 0.6, 11, 6, 12.4, "varanda"], ["Balcony B", 16, 11, 21.4, 12.4, "varanda"]] }] },

    { id: "reabilisboa", nome: "Building refurbishment", local: "Lisbon", tipologia: "4 × 2-bed · ground + 3 floors", tipo: "reabilitacao", reab: true,
      regime: "empreitada geral", fracoes: 4, prazo: "12 to 14 months on site", cliente: ["the building owner (via architect Inês Carvalho)", "Arroios, Lisbon"],
      te: 0.5, fachadas: ["O", "E"], notaLeitura: "existing masonry walls: 2 thicknesses to confirm on site",
      padrao: { estrutura: "metalica", acabamento: "standard", cobertura: "telhado", caixilharia: "aluminio" },
      pisos: [{ nome: "Typical floor", sub: "ground to 3rd floor", rep: 4, ox: 0, oy: 0, W: 15, H: 8,
        divisoes: [
          ["Living room", 0, 0, 4.4, 4.6], ["Bedroom 1", 0, 4.6, 4.4, 8], ["Bathroom", 4.4, 0, 6.6, 3.4], ["Utility room", 6.6, 0, 8.6, 3.4],
          ["Storage", 8.6, 0, 10.6, 3.4], ["Kitchen", 10.6, 0, 15, 3.4], ["Corridor", 4.4, 3.4, 15, 4.6],
          ["Entrance hall", 4.4, 4.6, 7.4, 8], ["Shared stairs", 7.4, 4.6, 10.6, 8, { escada: true }], ["Bedroom 2", 10.6, 4.6, 15, 8],
        ],
        portas: [[4.4, 4, "v", 0.9, -1], [4.4, 6.3, "v", 0.8, -1], [5.5, 3.4, "h", 0.7, -1], [7.6, 3.4, "h", 0.7, -1], [9.6, 3.4, "h", 0.7, -1],
          [12.8, 3.4, "h", 0.9, -1], [12.8, 4.6, "h", 0.8, 1], [5.9, 4.6, "h", 1.6, 0], [7.4, 6.3, "v", 1, -1]],
        vaos: [["O", 0.8, 1.2], ["O", 2.8, 1.2], ["O", 5.6, 1.2], ["E", 1.1, 1.2], ["E", 3.6, 0.8], ["E", 5.6, 1.2]],
        exteriores: [["Balcony", 15, 4.9, 16.2, 7.7, "varanda"]] }] },
  ],

  // ---------- DEMO unit rates (excl. VAT, supply and fix) ----------
  // in the real version, the AI uses the company's price list and the purchase history in the ERP
  precos: {
    estaleiro_base: 6500, estaleiro_m2: 14, andaime_m2: 8, grua: 9500,      // site setup, safety and construction waste
    escavacao_m3: 15, demolicao_m2: 70, reforco_m2: 60,                     // refurbishment: demolition and seismic strengthening of the walls
    betao_m3: 145, aco_kg: 1.55, cofragem_m2: 28, perfis_kg: 4.8,           // C25/30 concrete, A500 NR rebar, galvanised steel sections
    parede_ext_m2: { betao: 108, metalica: 92 },                            // thermal brick + ETICS | light steel panel + ETICS
    fachada_reab_m2: 150,                                                   // refurbishment of an existing facade
    parede_int_m2: { betao: 40, metalica: 36 },                             // 11 cm brick | plasterboard with mineral wool
    reboco_pintura_m2: { betao: 22, metalica: 13 },
    cobertura_m2: { telhado: 98, plana: 112 },
    caixilharia_m2: { aluminio: 410, pvc: 345 },                            // with double glazing and shutters
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

  // demo ratios: m³ of concrete per m² of footprint (foundations, ground slab) or per m² of floor (slabs, columns and beams)
  consumos: {
    nova: {
      betao: { fund: 0.12, massame: 0.10, laje: 0.15, pv: 0.05, escada: 2.4 },
      metalica: { fund: 0.09, massame: 0.10, laje: 0, pv: 0, escada: 0, perfis: 27 },
    },
    reabilitacao: {
      betao: { fund: 0.02, massame: 0.06, laje: 0.10, pv: 0.02, escada: 0, cofrLaje: 0.25 },
      metalica: { fund: 0.02, massame: 0.06, laje: 0, pv: 0, escada: 0, perfis: 24 },
    },
    aco: { fund: 70, massame: 25, laje: 90, pv: 130, escada: 100 },   // kg of rebar per m³ of concrete
    cofragem: { fund: 0.6, laje: 1.0, pv: 0.9, escada: 12 },          // m² per m² (and per flight of stairs)
  },

  // ---------- quote requests (FICTIONAL) ----------
  pedidos: [
    { id: "p1", nome: "Sofia Antunes", canal: "WhatsApp", hora: "08:04", assunto: "3-bed house in Mafra", estado: "novo", projeto: "t3mafra",
      cliente: ["Sofia and Miguel Antunes", "Malveira, Mafra"],
      texto: "Good morning! We've bought a 650 m² plot in Malveira and we want to build a single-storey 3-bed house of about 180 m², with a large south-facing living room and a porch. Our limit is €250k and we'll be applying for a mortgage. Could you give us an idea of the price and how long it would take? We don't have an architect yet. Thank you! Sofia",
      campos: [["Type", "3-bed single-storey"], ["Area", "≈ 180 m²"], ["Plot", "650 m², Malveira (Mafra)"], ["Outdoor", "porch, south-facing living room"],
        ["Budget", "up to €250,000"], ["Financing", "mortgage"], ["Design", "no architect yet"], ["Request", "price and timescale"]],
      semelhantes: [["t3mafra", 95], ["t4ericeira", 58]], probabilidade: "alta",
      nota: "Fits the budget with standard finishes. The bank will ask for a detailed estimate and a cash-flow schedule: both come straight out of this estimate.",
      resposta: "Good morning, Sofia! Thank you for getting in touch.\n\nWe recently estimated a very similar house in Mafra (a single-storey 3-bed of 180 m², with a south-facing living room and a porch). On a turnkey basis, with standard finishes, the initial estimate is around {valor} (excl. VAT), including the architectural and engineering design and planning permission.\n\nAs you'll be applying for a mortgage, we'll also prepare the detailed estimate and the cash-flow schedule the bank needs for its valuation.\n\nCould we see the plot in Malveira this week: Thursday at 10:00 or Saturday at 11:00? If you have the land registry certificate and the site location plan, please bring them along.\n\nSales Department · Example Builders" },
    { id: "p2", nome: "Ricardo Faria", empresa: "Example Developments Ltd", canal: "Email", hora: "09:12", assunto: "Proposal: 6-unit building in Torres Vedras",
      estado: "novo", projeto: "edificio6", cliente: ["Example Developments Ltd", "Torres Vedras"], anexo: "Plans_6_units.pdf · Finishes_schedule.xlsx",
      texto: "Good morning. The architectural design for a residential building with 6 two-bedroom units (ground + 2 floors, about 730 m² gross floor area) in Torres Vedras has been approved. We would like a proposal for the main contract, including the engineering design. Please find attached the floor plans and the finishes schedule. We need the figures by the 15th to close the financing with the bank. Kind regards, Ricardo Faria",
      campos: [["Type", "apartment building"], ["Units", "6 × 2-bed"], ["Floors", "ground + 2"], ["Gross area", "≈ 730 m²"],
        ["Contract", "main contract"], ["Design", "architecture approved"], ["Engineering design", "to be included"], ["Proposal due", "by 15 November"]],
      semelhantes: [["edificio6", 96], ["reabilisboa", 54]], probabilidade: "alta",
      nota: "Client with a site already under way (the 8-unit building). The bank will ask for a bill of quantities and a cash-flow schedule: both come out of the AI's estimate.",
      resposta: "Good morning, Ricardo,\n\nThank you for sending these. We have already read the plans: by our measurements, the building has 726 m² gross floor area, 6 two-bedroom units and a stair core with a lift. With the finishes schedule you sent (standard level), the estimate for the main contract is {valor} (excl. VAT), about {m2} per m², including the engineering design.\n\nWe will send the formal proposal, with the bill of quantities and the cash-flow schedule, by the 12th, in time for your meeting with the bank. Before then, could we visit the site on Tuesday morning?\n\nKind regards,\nSales Management · Example Builders" },
    { id: "p3", nome: "Municipal Works Division", canal: "Email", hora: "10:31", assunto: "Invitation to tender no. 14/2026: school refurbishment", estado: "novo",
      projeto: "reabilisboa", cliente: ["the Municipality (tender no. 14/2026)", "former primary school"], estimativa: 352000, precoBase: 385000,
      anexo: "Invitation_ITT14-2026.pdf · Specifications.pdf · BoQ_school.xlsx", rotuloResposta: "Clarification request drafted",
      texto: "Dear Sir or Madam, under the Public Contracts Code, the Municipality invites you to submit a tender in invitation-to-tender procedure no. 14/2026, for the refurbishment of the former primary school building and its conversion into a community centre. Base price: €385,000 plus VAT. Completion period: 240 days. Tenders must be submitted by 17:00 on 7 November, on the electronic public procurement platform. The procedure documents are attached: invitation, specifications, detailed design and bill of quantities. Yours faithfully, the Municipal Works Division",
      campos: [["Procedure", "tender no. 14/2026"], ["Scope", "school → community centre"], ["Base price", "€385,000 + VAT"], ["Completion period", "240 days"],
        ["Submission", "7 Nov, 17:00 (platform)"], ["Award criterion", "lowest price"], ["Contractor licence", "category 1, class 3 ✓"], ["Clarifications", "by 28 October"]],
      semelhantes: [["reabilisboa", 81], ["edificio6", 47]], probabilidade: "média",
      nota: "From the bill of quantities, the estimated cost is €352,000: 8.6% below the base price. Two items have no quantity (4.3 and 7.1); clarifications can only be requested in the first third of the tender period, by 28 October.",
      resposta: "Dear Sir or Madam,\n\nWith reference to invitation to tender no. 14/2026, we would like to request the following clarifications:\n\n1. Item 4.3 of the bill of quantities (floor strengthening) has no quantity. Should we assume the total area of the first floor (212 m²)?\n2. Item 7.1 (rainwater drainage) refers to the design, which does not include the roof of the annex. Is this area part of the contract?\n\nWe would also like to request a site visit next week.\n\nYours faithfully,\nExample Builders Ltd" },
    { id: "p4", nome: "Carla Mendes", empresa: "Example Contractors SA", canal: "WhatsApp", hora: "yesterday 18:47", assunto: "Structural subcontract · Loures (24 units)",
      estado: "novo", anexo: "BoQ_structure_Loures.xlsx",
      texto: "Good afternoon! We need a price for the formwork and concreting subcontract on a 24-unit building in Loures. I'm sending the bill of quantities in Excel. Concrete, steel and the crane are on us; the formwork materials are on you. Planned start in January. Could you send it by Friday? Thanks",
      campos: [["Work", "formwork, concreting and steel fixing"], ["Site", "24 units, Loures"], ["Client supplies", "concrete, steel and crane"], ["We supply", "formwork and propping"],
        ["Start", "January 2027"], ["Proposal due", "Friday"], ["Bill of quantities", "5 items read"], ["VAT", "reverse charge"]],
      mq: [["Slab formwork", "m²", 3850, 14.5], ["Beam and column formwork", "m²", 1920, 19], ["Wall formwork (cores)", "m²", 640, 16],
        ["Concreting (labour)", "m³", 1420, 9.5], ["Steel fixing, A500", "kg", 148000, 0.32]],
      probabilidade: "alta",
      nota: "Rates from the Odivelas subcontract (same client, under way, 4% below planned cost). The formwork crew frees up in January.",
      resposta: "Good afternoon, Carla! Here is our proposal for the Loures structure, based on your bill of quantities: {valor} (excl. VAT, reverse charge), with the unit rates in the attached Excel.\n\nIt includes the formwork materials and propping; concrete, steel and the crane on your side, as agreed. We can start on 11 January, with 8 formwork carpenters and 2 steel fixers. The proposal is valid for 30 days.\n\nAny questions, just let me know! 👍" },
    { id: "p5", nome: "Inês Carvalho", canal: "Email", hora: "yesterday 21:40", assunto: "Plans for a building refurbishment in Arroios", estado: "respondido",
      projeto: "reabilisboa", cliente: ["the building owner (via architect Inês Carvalho)", "Arroios, Lisbon"], anexo: "Arroios_planning.dwg",
      texto: "Hello, good evening. I'm sending the planning drawings for a building we're refurbishing in Arroios: ground + 3 floors, one 2-bed flat per floor, about 480 m². The owner wants a cost estimate before we move on to the detailed design. Can you help? Thanks, Inês",
      campos: [["Type", "building refurbishment"], ["Location", "Arroios, Lisbon"], ["Floors", "ground + 3"], ["Units", "4 × 2-bed"],
        ["Gross area", "≈ 480 m²"], ["Stage", "planning application"], ["Request", "cost estimate"], ["Attachment", "DWG plans read"]],
      semelhantes: [["reabilisboa", 97], ["edificio6", 49]], probabilidade: "média",
      nota: "Answered yesterday at 21:41 by the AI (out of hours). The cost estimate by section is ready: it just needs reviewing and sending.",
      resposta: "Good evening, Inês,\n\nThank you for the plans! We're already going through them and will send the cost estimate, broken down by section, tomorrow by 12:00. If you have a survey of the existing walls or photos of the interior, please send them: they help us fine-tune the demolition and the structural strengthening.\n\nBest regards,\nEstimating Department · Example Builders" },
  ],

  // ---------- sites in progress (FICTIONAL) · weeks counted from 5 Oct 2026 ----------
  // fase ids: lic (permitting), est (foundations and structure), env (masonry and roof), inst (building services), acab (finishes)
  obras: [
    { id: "o1", nome: "8-unit building", curto: "8-unit bldg", local: "Venda do Pinheiro", cliente: "Example Developments Ltd", tipo: "edificio",
      fase: "Structure", faseId: "est", progresso: 34, previstoPct: 40, atrasoDias: 9, causa: "rain in week 41 and a change to the level 2 slab requested on site",
      orcamento: 1124000, previsto: 398000, real: 421500, fases: [["est", 0, 9], ["env", 6, 16], ["inst", 11, 21], ["acab", 17, 25]],
      alerta: "Site inspector's report with 3 items to fix. Structure cost 5.9% over plan." },
    { id: "o2", nome: "4-bed house with pool", curto: "4-bed Ericeira", local: "Ericeira", cliente: "Correia family", tipo: "moradia2",
      fase: "Masonry and roof", faseId: "env", progresso: 55, previstoPct: 54, orcamento: 412000, previsto: 214600, real: 211900,
      fases: [["env", 0, 5], ["inst", 3, 10], ["acab", 8, 16]] },
    { id: "o3", nome: "3-bed house", curto: "3-bed Gradil", local: "Gradil, Mafra", cliente: "Gaspar family", tipo: "moradia",
      fase: "Permitting", faseId: "lic", progresso: 8, previstoPct: 8, orcamento: 238000, previsto: 9800, real: 9600,
      fases: [["lic", 0, 6], ["est", 7, 13], ["env", 12, 19], ["inst", 17, 23], ["acab", 21, 25]],
      alerta: "The town council has asked for an addendum to the water and drainage design: due by 6 November." },
    { id: "o4", nome: "Building refurbishment", curto: "Refurb Graça", local: "Graça, Lisbon", cliente: "Mr Álvaro Pinto", tipo: "reabilitacao",
      fase: "Finishes", faseId: "acab", progresso: 81, previstoPct: 80, orcamento: 598000, previsto: 462000, real: 455300,
      fases: [["inst", 0, 2], ["acab", 0, 7]] },
    { id: "o5", nome: "Building structure (subcontract)", curto: "Odivelas structure", local: "Odivelas", cliente: "Example Contractors SA", tipo: "estrutura",
      fase: "Structure", faseId: "est", progresso: 64, previstoPct: 60, orcamento: 186000, previsto: 112000, real: 107500, fases: [["est", 0, 11]] },
    { id: "o6", nome: "3-bed house", curto: "3-bed Sobral", local: "Sobral de Monte Agraço", cliente: "Rocha family", tipo: "moradia",
      fase: "Building services", faseId: "inst", progresso: 47, previstoPct: 52, atrasoDias: 6, causa: "windows delivered a week late",
      orcamento: 255000, previsto: 118000, real: 120900, fases: [["inst", 0, 6], ["acab", 4, 13]] },
  ],

  // the site inspector's email (FICTIONAL) that the AI turns into tasks
  fiscalizacao: { obra: "o1", hora: "07:02", de: "Paulo Sequeira · Site inspector", prazo: "31 October",
    assunto: "Site visit report no. 14 (23/10) · non-conformities",
    texto: "Dear Sir or Madam, on yesterday's visit we found: 1) insufficient cover to the reinforcement of beam V12 on level 3, to be corrected before concreting; 2) no edge protection around the level 2 slab; 3) we have not yet received the compressive strength test results for the level 1 slab cubes. We would be grateful for your reply by 31 October. Kind regards, Paulo Sequeira",
    tarefas: [["Correct the cover to beam V12 (level 3) before concreting", "Foreman", "27 Oct"],
      ["Put up edge protection around the level 2 slab", "Safety officer", "hoje"],
      ["Send the test results for the level 1 cubes", "Site manager", "30 Oct"]] },

  // ---------- contracts with progress billing (FICTIONAL) ----------
  // item: [no., description, unit, contract quantity, unit rate, cumulative up to the previous progress bill]
  // site report line: [date, area, as the foreman wrote it, quantity, unit, item]
  contratos: [
    { id: "c1", obra: "o1", auto: 7, mes: "October 2026", nome: "8-unit building", cliente: "Example Developments Ltd", local: "Venda do Pinheiro",
      para: "Paulo Sequeira", papel: "the site inspector", valorContrato: 1124000, retencao: 0.05, iva: "normal",
      fontes: ["October_production.xlsx (foreman)", "4 weekly site reports", "32 dated photos", "Contract and bill of quantities"],
      artigos: [["2.1", "General excavation and removal to tip", "m³", 1850, 7.8, 1850], ["3.1", "C25/30 concrete in foundations", "m³", 186, 98, 186],
        ["3.2", "Slab formwork", "m²", 2240, 24.5, 1120], ["3.3", "Column and beam formwork", "m²", 1680, 29, 760],
        ["3.4", "C25/30 concrete in slabs, beams and columns", "m³", 610, 104, 298], ["3.5", "Steel reinforcement, A500 NR", "kg", 61500, 1.42, 38900],
        ["3.7", "Waterproofing to buried walls", "m²", 410, 12.8, 410], ["4.1", "External masonry in 25 cm thermal brick", "m²", 1320, 31.5, 0]],
      linhas: [["02/10", "Level 1 · zone A", "slab formwork L1 zone A", 320, "m²", "3.2"], ["06/10", "Level 1", "pour slab L1 (9 trucks + pump)", 62.5, "m³", "3.4"],
        ["08/10", "Level 2", "steel columns & beams L2", 8200, "kg", "3.5"], ["09/10", "Level 2", "extra rebar slab L2 (change requested on site, site book entry 12)", 3650, "kg", "3.5"],
        ["13/10", "Level 2 · zone A", "formwork columns & beams L2", 210, "m²", "3.3"], ["15/10", "Level 2", "slab formwork L2 zones A+B", 320, "m²", "3.2"],
        ["20/10", "Level 2", "pour columns & beams L2", 54, "m³", "3.4"], ["21/10", "Basement", "waterproofing north wall", 28, "m²", "3.7"],
        ["22/10", "Level 2", "steel slab L2", 14500, "kg", "3.5"], ["23/10", "Level 3 · zone A", "formwork columns & beams L3", 210, "m²", "3.3"],
        ["23/10", "Ground floor", "25 brick south facade", 145, "m²", "4.1"], ["24/10", "Level 2", "pour slab L2", 59.5, "m³", "3.4"]],
      justificacao: "Two items are over the contract quantity: 3.5 (steel), because of the change to the level 2 slab requested on site (site book, entry no. 12), and 3.7 (waterproofing), after a measurement adjustment on the north wall. We propose treating them as extra works, with the attached estimate, for your approval." },
    { id: "c2", obra: "o2", auto: 5, mes: "October 2026", nome: "4-bed house with pool", cliente: "Correia family", local: "Ericeira",
      para: "Nuno Teixeira", papel: "the owner's site inspector", valorContrato: 412000, retencao: 0.05, iva: "normal",
      fontes: ["Site reports (foreman's WhatsApp)", "18 dated photos", "Contract and bill of quantities"],
      artigos: [["2.1", "Excavation and backfill", "m³", 260, 9.5, 260], ["3.1", "Reinforced concrete structure", "LS", 1, 46800, 1],
        ["4.1", "External thermal brick masonry", "m²", 238, 34, 120], ["4.2", "Internal 11 cm brick masonry", "m²", 286, 22, 40],
        ["5.1", "Flat roof: waterproofing and insulation", "m²", 148, 96, 0], ["6.1", "External wall insulation (ETICS)", "m²", 238, 52, 0],
        ["7.1", "Water and drainage pipework (first fix)", "LS", 1, 7900, 0]],
      linhas: [["01/10", "First floor", "thermal brick facades 1F", 64, "m²", "4.1"], ["03/10", "Ground floor", "11 brick partitions GF", 92, "m²", "4.2"],
        ["08/10", "Roof", "membrane + XPS roof (half)", 74, "m²", "5.1"], ["10/10", "First floor", "thermal brick facades 1F (finished)", 54, "m²", "4.1"],
        ["14/10", "First floor", "11 brick partitions 1F", 68, "m²", "4.2"], ["17/10", "Roof", "membrane + XPS roof (rest)", 74, "m²", "5.1"],
        ["21/10", "South facade", "ETICS south facade", 96, "m²", "6.1"], ["23/10", "Ground floor", "water & drainage pipes GF (50%)", 0.5, "LS", "7.1"]],
      justificacao: "All items are within the contract quantities." },
    { id: "c3", obra: "o5", auto: 4, mes: "October 2026", nome: "Building structure (subcontract)", cliente: "Example Contractors SA", local: "Odivelas",
      para: "Carla Mendes", papel: "the main contractor's site management", valorContrato: 186000, retencao: 0.05, iva: "autoliquidacao",
      fontes: ["Crew daily log (Excel)", "Concrete delivery tickets", "Subcontract agreement"],
      artigos: [["1", "Slab formwork", "m²", 4120, 14.5, 2060], ["2", "Beam and column formwork", "m²", 2050, 19, 1130],
        ["3", "Wall formwork (cores)", "m²", 690, 16, 460], ["4", "Concreting (labour)", "m³", 1510, 9.5, 820],
        ["5", "Steel fixing, A500", "kg", 156000, 0.32, 88400]],
      linhas: [["03/10", "Level 4", "slab formwork L4", 515, "m²", "1"], ["06/10", "Level 4", "pour slab L4", 168, "m³", "4"],
        ["07/10", "Core", "core wall formwork L5", 135, "m²", "3"], ["09/10", "Level 5", "columns & beams L5", 260, "m²", "2"],
        ["10/10", "Level 5", "steel L5", 15600, "kg", "5"], ["16/10", "Level 5", "slab formwork L5", 515, "m²", "1"],
        ["17/10", "Core", "core wall formwork L6", 135, "m²", "3"], ["20/10", "Level 5", "pour slab L5", 162, "m³", "4"],
        ["22/10", "Level 6", "columns & beams L6", 260, "m²", "2"], ["23/10", "Level 6", "steel L6", 15600, "kg", "5"]],
      justificacao: "Item 3 (core wall formwork) is already over the contract quantity: the level 6 core gained a wall in the addendum to the structural design. Please confirm that we can treat it as extra works." },
  ],
  faturadoMes: { valor: 96400, obras: "Building refurbishment in Graça and 3-bed house in Sobral de Monte Agraço" },

  // ---------- supplier invoices (FICTIONAL) · line: [description, quantity, unit, unit price] ----------
  faturas: [
    { id: "f1", fornecedor: "Example Concrete SA", nif: "509 482 170", numero: "INV B/2026/1187", data: "22/10/2026", obra: "o1", capitulo: "Structure · concrete",
      linhas: [["Concrete C25/30 S3 XC2 D22 Cl0.4", 62.5, "m³", 89.9], ["Pumping with boom pump", 1, "serv.", 420]],
      encomenda: { n: "PO 2026/311", data: "30/09/2026", qtd: [60, 1], pu: [83.95, 420] },
      guias: { ref: "DN 21771 to DN 21779", n: 9, qtd: [62.5, 1], nota: "+2.5 m³ ordered on site (signed on DN 21779)" } },
    { id: "f2", fornecedor: "Example Steel Ltd", nif: "514 223 905", numero: "INV 2026/0932", data: "21/10/2026", obra: "o1", capitulo: "Structure · reinforcement",
      linhas: [["A500 NR SD steel, cut and bent", 12480, "kg", 0.92], ["Transport", 1, "serv.", 95]],
      encomenda: { n: "PO 2026/298 (open)", data: "15/09/2026", qtd: [24000, 2], pu: [0.92, 95] },
      guias: { ref: "DN 7711 and DN 7712", n: 2, qtd: [10340, 1] } },
    { id: "f3", fornecedor: "Example Formwork Ltd", nif: "516 731 040", numero: "INV A/2026/2210", data: "20/10/2026", obra: "o5", capitulo: "Formwork · hire",
      linhas: [["Formwork table hire (420 m² × 30 days)", 12600, "m²·day", 0.085], ["Steel prop hire (380 props × 30 days)", 11400, "prop·day", 0.06],
        ["Transport", 1, "serv.", 180]],
      encomenda: { n: "Hire contract HC 2026/09", data: "01/09/2026", qtd: [12600, 11400, 1], pu: [0.085, 0.06, 180] },
      guias: { ref: "TN 3302 and on-site equipment log", n: 1, qtd: [12600, 11400, 1] } },
    { id: "f4", fornecedor: "Example Aggregates Ltd", nif: "507 918 360", numero: "INV 2026/1544", data: "19/10/2026", obra: "o2", capitulo: "Masonry · aggregates",
      linhas: [["Washed sand 0/4", 48, "t", 14.2], ["Crushed stone 6/14", 36, "t", 15.8], ["All-in aggregate", 60, "t", 9.4]],
      encomenda: { n: "PO 2026/305", data: "02/10/2026", qtd: [48, 36, 60], pu: [14.5, 16.2, 9.6] },
      guias: { ref: "DN 4410 to DN 4415", n: 6, qtd: [48, 36, 60] } },
  ],
  // purchase prices over the last 90 days: [supplier, material, unit (shown as "€x → €y/unit"), before, now, note]
  precosFornecedores: [
    ["Example Concrete SA", "C25/30 S3 concrete", "m³", 83.95, 89.9, "invoice of 22/10"],
    ["Example Ceramics Ltd", "25 cm thermal brick", "brick", 1.12, 1.19, "new price list since 1 October"],
    ["Example Steel Ltd", "A500 NR steel, cut and bent", "kg", 0.92, 0.92, ""],
    ["Example Aggregates Ltd", "Washed sand 0/4", "t", 14.5, 14.2, ""],
    ["Example Formwork Ltd", "Formwork table hire", "m²·day", 0.085, 0.085, ""],
  ],
  betaoNovembro: 410,   // m³ of concrete planned for November (site schedules)

  // ---------- dashboard ----------
  // {autos} and {edificio} are calculated by the app from the data above
  briefing: [
    ["The site inspector's report on the 8-unit building (Venda do Pinheiro) has 3 items to fix, one of them before the next pour. The tasks and the draft reply are ready.", "obras"],
    ["October's progress bills for 3 contracts are ready: {autos} to invoice. On the 8-unit building, steel is already 6.1% over the contract quantity; the justification as extra works is written.", "autos"],
    ["Example Concrete's concrete invoice came in at €89.90/m³, 7.1% more than on the order. The credit note request is ready to send.", "faturas"],
    ["There are 4 quote requests waiting for a reply. The 6-unit building in Torres Vedras already has an estimate ({edificio}) and the school tender closes on 7 November.", "pedidos"],
  ],
  passos: [
    ["Request", "Reads email and WhatsApp, works out what the client wants and replies the same day.", "pedidos"],
    ["Visit", "Prepares the site visit: the plot, access and the questions to ask the client.", "pedidos"],
    ["Estimate", "Measures from the floor plans and prices with your rates, in hours.", "planta"],
    ["Design", "Compares plan revisions and updates the measurements and the estimate.", "planta"],
    ["Permitting", "Tracks the town council's deadlines and requests, and drafts the replies.", "obras"],
    ["Construction", "Scheduling, costs, orders and site inspection reports.", "obras"],
    ["Progress billing", "Progress bills built from the site reports.", "autos"],
    ["Handover", "As-built drawings, the technical file and answers for the client at any hour.", "assistente"],
  ],
  funil: { meses: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"], pedidos: [18, 22, 19, 14, 27, 31], propostas: [6, 7, 5, 4, 21, 27], adjudicacoes: [1, 2, 1, 1, 4, 6] },
  ocupacao: { semanas: ["W44", "W45", "W46", "W47", "W48", "W49"], valores: [82, 88, 97, 91, 76, 71],
    nota: "Week 46 goes over 95%: the AI suggests bringing the Odivelas slab pour forward to week 45." },
  atividade: [
    ["06:30", "Read 4 site reports and the production spreadsheet, and prepared October's progress bills for 3 contracts.", "aprovar"],
    ["06:45", "Read 4 supplier invoices and checked them against orders and delivery notes. One is 7.1% above the order price.", "aprovar"],
    ["07:10", "Read the site inspector's report on the 8-unit building and created 3 tasks with deadlines.", "feito"],
    ["08:05", "Drafted the reply to Sofia Antunes (WhatsApp) with an estimate for the 3-bed house in Mafra.", "aprovar"],
    ["09:20", "Read the plans for the 6-unit building in Torres Vedras and did the measurements and the estimate.", "aprovar"],
    ["10:35", "Read the invitation to tender no. 14/2026 and drafted the clarification request.", "aprovar"],
  ],
  auditoria: [
    ["06:30", "October progress bills prepared (3 contracts)", "AI", "awaiting approval"],
    ["06:45", "4 invoices read and checked against orders and delivery notes", "AI", "feito"],
    ["07:10", "Site inspector's report read · 3 tasks created", "AI", "feito"],
    ["yesterday 21:41", "Reply sent to architect Inês Carvalho (out of hours)", "AI (approved rule)", "feito"],
  ],
};
