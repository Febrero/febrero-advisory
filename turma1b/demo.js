// Demonstration data: a made-up class built around today's date, so the tour always shows "tomorrow", a test this
// week, a menu and a TPC. Nothing here is real and nothing is sent to the server: the real class data stays behind
// the SMS sign-in.
import { DN, fmtH, mais, nomeDia, proximoDiaDeAulas, resumoDe } from "./agenda.js?v=1";

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

// What the page gets from /api/turma, for the demonstration.
export function sessaoDemo(hoje) {
  const { D, dias } = turmaDemo(hoje);
  return { eu: { nome: "Família exemplo", admin: false }, hoje, hora: "17:00", proximo: dias[0], dados: D, resumo: resumoDe(D, dias[0], hoje), calendario: null, painel: null, tpcDias: dias.slice(0, 5), dias };
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
