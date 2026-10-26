// Demonstration data: a made-up class built around today's date, so the tour always shows "tomorrow", a test this
// week, a menu and a TPC. Nothing here is real and nothing is sent to the server: the real class data stays behind
// the SMS sign-in.
import { DN, fmtH, mais, nomeDia, proximoDiaDeAulas, resumoDe } from "./agenda.js?v=2";
import { CATALOGO, FONTE_CATALOGO } from "./atividades.js?v=1";

export function turmaDemo(hoje) {
  const D = {
    turma: "1.º B", ano: "exemplo", escola: "Colégio (exemplo)",
    nomes: { PORT: "Português", MAT: "Matemática", EM: "Estudo do Meio", ING: "Inglês", EF: "Educação Física", MUS: "Música", EXP: "Expressão Plástica", AE: "Apoio ao Estudo" },
    salas: { EF: "Ginásio" },
    slots: [["09:00", "09:45"], ["09:45", "10:30"], ["11:00", "11:45"], ["11:45", "12:30"], ["12:30", "13:15"], ["14:30", "15:15"], ["15:15", "16:00"]],
    intervalo: ["10:30", "11:00"], almoco: ["13:15", "14:30"],
    horario: {
      1: ["PORT", "PORT", "MAT", "MAT", "EM", "ING", "EXP"], 2: ["MAT", "MAT", "PORT", "PORT", "AE", "EM", "EF"], 3: ["PORT", "PORT", "MAT", "MAT", "MUS", "EM", "AE"],
      4: ["MAT", "MAT", "PORT", "EM", "PORT", "EF", "ING"], 5: ["PORT", "PORT", "EXP", "MAT", "ING", "MAT", "EM"],
    },
    fonteHorario: "horário de exemplo", feriados: {}, fonteFeriados: "exemplo",
    periodos: [{ n: 1, ini: mais(hoje, -60), fim: mais(hoje, 120) }], fontePeriodos: "exemplo",
    atendimento: [{ dia: 3, ini: "12:30", fim: "13:15", fonte: "exemplo", det: "Atendimento da professora aos encarregados de educação. A reunião pede-se no Inovar." }],
    testes: [], fonteTestes: "calendário dos testes (exemplo)", ementa: {}, fonteEmenta: "ementa de exemplo",
    material: "Exemplo: dossiê A4, lápis de cor, tesoura e cola.", fonteMaterial: "exemplo",
    lembretes: { EF: "Educação Física: levar o equipamento" }, docs: [], avisos: [],
  };
  const dias = [];
  let d = hoje;
  for (let i = 0; i < 6; i++) { d = proximoDiaDeAulas(D, d); dias.push(d); }
  const pratos = [
    { sopa: "Creme de cenoura", prato: "Bacalhau à Brás com salada", dieta: "Pescada cozida com batata", sobremesa: "Maçã", lanche: "Pão com queijo · iogurte" },
    { sopa: "Sopa de legumes", prato: "Frango assado com arroz de ervilhas", dieta: "Peito de frango grelhado com arroz", sobremesa: "Banana", lanche: "Pão com manteiga · leite" },
    { sopa: "Canja", prato: "Massa à bolonhesa", dieta: "Massa com frango", sobremesa: "Gelatina", lanche: "Pão com fiambre · iogurte" },
    { sopa: "Sopa de abóbora", prato: "Filetes de pescada com arroz de tomate", dieta: "Pescada grelhada com arroz", sobremesa: "Pera", lanche: "Pão com doce · leite" },
    { sopa: "Sopa de feijão-verde", prato: "Lasanha de legumes", dieta: "Peru estufado com massa", sobremesa: "Laranja", lanche: "Pão com queijo · iogurte" },
  ];
  dias.slice(0, 5).forEach((x, i) => { D.ementa[x] = pratos[i]; });
  D.testes = [{ data: dias[1], disciplina: "Matemática", ini: "09:00", fim: "10:30" }];
  D.avisos = [
    { id: "demo-tpc", tipo: "tpc", data: dias[0], ini: null, fim: null, titulo: "Português: ler a página 24 do livro", det: "", ate: null, fonte: "partilhado por uma família", nota: "por confirmar" },
    { id: "demo-visita", tipo: "visita", data: dias[2], ini: "09:30", fim: null, titulo: "Visita de estudo ao Oceanário", det: "Levar lanche e boné. Regresso às 13h00.", ate: null, fonte: "email do colégio" },
  ];
  return { D, dias };
}

// «Discussões de pais» in the demonstration: what Daniela would have summarised from the class WhatsApp group, by day
// (made up; the photo of a worksheet shows that she reads the pictures too)
export function discussoesDemo(hoje, agora = Date.now()) {
  const h = 3600e3;
  return {
    [mais(hoje, -3)]: { lidas: 9, atualizado: agora - 70 * h, temas: [
      { titulo: "Horário do Estudo à sexta", resumo: "Houve dúvidas sobre a hora a que acaba o Estudo à sexta-feira. Ficou de se confirmar com a secretaria.", estado: "em aberto", quando: "21:05" },
    ] },
    [mais(hoje, -1)]: { lidas: 14, atualizado: agora - 20 * h, temas: [
      { titulo: "Material de Expressão Plástica", resumo: "É preciso levar um rolo de papel de cozinha vazio até quarta-feira para a aula de Expressão Plástica.", estado: "informação", quando: "20:15" },
      { titulo: "Leitura de Português", resumo: "Ficou esclarecido que a leitura da página 24 é para fazer em voz alta com os pais, sem ficha escrita.", estado: "combinado", quando: "19:02" },
    ] },
    [hoje]: { lidas: 23, atualizado: agora - 4 * 60e3, temas: [
      { titulo: "Ficha de Matemática: exercício 4", resumo: "Perguntou-se se o exercício 4 era para fazer em casa. Pela foto partilhada, é uma ficha de completar subtrações e o enunciado está certo; falta confirmar com a professora.", estado: "em aberto", quando: "18:40" },
      { titulo: "Visita ao Oceanário: autorização", resumo: "A autorização da visita de estudo tem de ser entregue assinada até quinta-feira. Ficou combinado levar lanche e boné.", estado: "combinado", quando: "17:55" },
      { titulo: "Perdido: casaco azul", resumo: "Desapareceu um casaco azul-marinho com capuz depois da Educação Física. Quem o encontrar avisa no grupo.", estado: "informação", quando: "12:10" },
    ] },
  };
}

// What the page gets from /api/turma, for the demonstration.
export function sessaoDemo(hoje) {
  const { D, dias } = turmaDemo(hoje);
  const agora = Date.now(), disc = discussoesDemo(hoje, agora), lista = Object.keys(disc).sort(), ultimo = lista.at(-1);
  const desde = D.periodos[0].ini;
  return { eu: { nome: "Família exemplo", admin: false }, hoje, hora: "17:00", proximo: dias[0], dados: D, resumo: resumoDe(D, dias[0], hoje), calendario: null, painel: null, tpcDias: dias.slice(0, 5), dias,
    discussoes: { atualizado: disc[ultimo].atualizado, dias: lista, ultimo: { dia: ultimo, ...disc[ultimo] },
      whatsapp: { ligado: true, desde: agora - 3 * 864e5, visto: agora - 2 * 60e3, okEm: agora - 2 * 60e3, motivo: "" } },
    discussoesDias: disc,
    atividades: { catalogo: CATALOGO, fonte: FONTE_CATALOGO, minhas: [
      { id: "judo", nome: "Judo", dias: [1, 3], ini: "16:20", fim: "17:00", desde },
      { id: "estudo", nome: "Estudo", dias: [2, 4], ini: "16:00", fim: "17:30", desde },
    ] } };
}

// Daniela in the demonstration answers the suggested questions from the example data, without calling the AI.
export function respostaDemo(S, pergunta) {
  const D = S.dados, [d1, d2] = S.dias, q = pergunta.toLowerCase();
  const amanha = nomeDia(d1).toLowerCase();
  if (/teste/.test(q)) return `O próximo é o **teste de Matemática**, na **${nomeDia(d2).toLowerCase()}**, às **9h00** (90 minutos).\nfonte: ${D.fonteTestes}`;
  if (/tpc|trabalho/.test(q)) return `Para **${amanha}**:\n- Português: ler a página 24 do livro (por confirmar: partilhado por uma família)\nfonte: TPC partilhado pelas famílias`;
  if (/almo|ementa|comer/.test(q)) { const m = D.ementa[d1]; return `Na **${amanha}**:\n- Sopa: ${m.sopa}\n- Prato: **${m.prato}**\n- Sobremesa: ${m.sobremesa}\nfonte: ${D.fonteEmenta}`; }
  if (/aula|horário|horario/.test(q)) { const wd = new Date(d1 + "T12:00:00Z").getUTCDay(); return `Na **${amanha}**:\n${D.horario[wd].map((c, i) => `- ${fmtH(D.slots[i][0])} ${D.nomes[c]}`).join("\n")}\nAs aulas acabam às 16h00.\nfonte: ${D.fonteHorario}`; }
  if (/atendimento|professora|reuni/.test(q)) return `À **${DN[3].toLowerCase()}**, das **12h30 às 13h15**. A reunião pede-se no Inovar.\nfonte: exemplo`;
  return "Isto é uma demonstração: aqui respondo às perguntas sugeridas. Depois de entrar, respondo a qualquer pergunta sobre a turma, sempre com a fonte.";
}
