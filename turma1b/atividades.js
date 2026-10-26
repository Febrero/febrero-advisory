// The school's after-school activities for the 1.º ano and the checks on a family's list, shared by the server
// (lib/atividades.mjs) and the demonstration (demo.js, which keeps everything in the page). From «Atividades
// Extracurriculares 2026-2027» (mkt.cmb.pt …/Informacao-Atividades-Extracurriculares-2026-2027.pdf, sent by Pedro):
// the 1.º ciclo / 1.º–2.º anos slots of its summary map. They start in October and don't run on holidays, breaks or
// «pontes» (its rules), so the agenda shows them on school days only.
export const INICIO_AE = "2026-10-01";       // «As Atividades Extracurriculares têm início no mês de outubro»
export const FONTE_CATALOGO = "«Atividades Extracurriculares 2026-2027» do colégio";
export const CATALOGO = [
  { id: "ballet", nome: "Ballet", horarios: [{ dias: [1, 3], ini: "16:20", fim: "17:00" }], nota: "1 ou 2 vezes por semana" },
  { id: "ingles", nome: "Inglês (British Council)", horarios: [{ dias: [2, 4], ini: "16:15", fim: "17:35" }], nota: "2 vezes por semana" },
  { id: "ginastica", nome: "Ginástica", horarios: [{ dias: [1, 3], ini: "16:20", fim: "17:00" }], nota: "1 ou 2 vezes por semana" },
  { id: "judo", nome: "Judo", horarios: [{ dias: [1, 2, 3, 4], ini: "16:20", fim: "17:00" }, { dias: [1, 3], ini: "08:10", fim: "08:50" }], nota: "1 ou 2 vezes por semana" },
  { id: "karate", nome: "Karaté", horarios: [{ dias: [1, 3], ini: "16:20", fim: "17:00" }], nota: "1 ou 2 vezes por semana" },
  { id: "patinagem", nome: "Patinagem", horarios: [{ dias: [2, 4], ini: "16:20", fim: "17:00" }], nota: "1 ou 2 vezes por semana" },
  { id: "inventors", nome: "The Inventors", horarios: [{ dias: [5], ini: "16:30", fim: "17:30" }] },
  { id: "tenis", nome: "Ténis", horarios: [{ dias: [5], ini: "16:30", fim: "17:30" }] },
  { id: "viola", nome: "Viola", horarios: [{ dias: [3], ini: "16:20", fim: "17:00" }] },
  { id: "xadrez", nome: "Xadrez", horarios: [{ dias: [4], ini: "17:00", fim: "17:40" }] },
  { id: "estudo", nome: "Estudo", horarios: [], nota: "Escolha os dias e as horas em que o seu filho fica no Estudo." },
  { id: "outra", nome: "Outra atividade", horarios: [], nota: "Também pode ser fora do colégio (natação, música…): escreva o nome, os dias e as horas." },
];
export const MAX_ATIVIDADES = 12;
const HH = /^([01]\d|2[0-3]):[0-5]\d$/;

/** A family's list checked entry by entry, each with the day it starts showing: {lista} or {erro}. */
export function validarAtividades(lista, inicioAno, inicioAE = INICIO_AE) {
  if (!Array.isArray(lista)) return { erro: "Lista inválida." };
  if (lista.length > MAX_ATIVIDADES) return { erro: `No máximo ${MAX_ATIVIDADES} atividades.` };
  const ok = [];
  for (const x of lista) {
    const c = CATALOGO.find((k) => k.id === x?.id);
    if (!c) return { erro: "Atividade desconhecida." };
    const nome = (c.id === "outra" ? String(x.nome || "") : c.nome).replace(/\s+/g, " ").trim().slice(0, 40);
    const dias = [...new Set((Array.isArray(x.dias) ? x.dias : []).map(Number))].filter((d) => d >= 1 && d <= 5).sort();
    const ini = String(x.ini || ""), fim = String(x.fim || "");
    if (!nome) return { erro: "Escreva o nome da atividade." };
    if (!dias.length) return { erro: `Escolha pelo menos um dia para ${nome}.` };
    if (!HH.test(ini) || !HH.test(fim) || ini >= fim || ini < "07:00" || fim > "21:00") return { erro: `Confira as horas de ${nome} (entre as 7h e as 21h).` };
    ok.push({ id: c.id, nome, dias, ini, fim, desde: ["estudo", "outra"].includes(c.id) ? inicioAno : inicioAE });
  }
  return { lista: ok };
}
