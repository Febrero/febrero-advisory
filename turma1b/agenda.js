// What happens on each day of the class, built from the class data (dados/turma.json + published notices).
// Shared by the page (agenda, start card) and the server (18:00 summary, Daniela's context, the .ics calendar).
// Dates are ISO "YYYY-MM-DD" strings, handled as UTC dates so the time zone never shifts a day.

export const DN = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
export const DC = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const MES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const MES3 = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export const dt = (iso) => { const [y, m, d] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
export const mais = (iso, n) => { const x = dt(iso); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
export const minutos = (h) => { const [a, b] = h.split(":").map(Number); return a * 60 + b; };
export const fmtH = (h) => h.replace(/^0(\d)/, "$1").replace(":", "h"); // "09:00" → "9h00"
export const diaSemana = (iso) => dt(iso).getUTCDay();
export const nomeDia = (iso) => { const x = dt(iso); return `${DN[x.getUTCDay()]}, ${x.getUTCDate()} de ${MES[x.getUTCMonth()]}`; };
export const curto = (iso) => { const x = dt(iso); return `${DC[x.getUTCDay()].toLowerCase()} ${x.getUTCDate()} ${MES3[x.getUTCMonth()]}`; };
export const segunda = (iso) => mais(iso, -((diaSemana(iso) + 6) % 7));

export const periodoDe = (D, iso) => D.periodos.find((p) => (!p.ini || iso >= p.ini) && iso <= p.fim) || null;
export const diaDeAulas = (D, iso) => { const wd = diaSemana(iso); return wd >= 1 && wd <= 5 && !D.feriados[iso] && !!periodoDe(D, iso); };

export function proximoDiaDeAulas(D, iso, incluirHoje = false) {
  for (let n = incluirHoje ? 0 : 1; n < 200; n++) { const d = mais(iso, n); if (diaDeAulas(D, d)) return d; }
  return null;
}

const TIPO_AVISO = { teste: "teste", tpc: "tpc", feriado: "feriado", interrupcao: "feriado" };
const ferias = (iso) => { const m = dt(iso).getUTCMonth(); return m === 11 || m === 0 ? "Férias de Natal" : m === 2 || m === 3 ? "Férias da Páscoa" : m >= 5 && m <= 8 ? "Férias de verão" : "Interrupção letiva"; };

// Everything on one day, as items {t, titulo, ini?, fim?, allday?, det, fonte, menu?, d}.
// t: teste | aula | pausa | almoco | atend | feriado | evento | tpc
export function itens(D, iso) {
  const out = [], wd = diaSemana(iso);
  const add = (e) => out.push({ ...e, d: iso });
  const avisos = (D.avisos || []).filter((a) => a.data === iso);
  const comAvisos = () => {
    for (const a of avisos) {
      if (a.tipo === "teste" && (D.testes || []).some((x) => x.data === iso && a.titulo.toLowerCase().includes(x.disciplina.toLowerCase()))) continue;
      add({ t: TIPO_AVISO[a.tipo] || "evento", titulo: a.tipo === "tpc" ? `TPC · ${a.titulo}` : a.titulo, ini: a.ini || null, fim: a.fim || a.ini || null, allday: true, det: a.det || "",
        fonte: a.fonte || "email do colégio", nota: a.nota || null, aviso: a.id });
    }
    return out;
  };
  if (wd < 1 || wd > 5) return comAvisos();
  if (D.feriados[iso]) { add({ t: "feriado", titulo: `Feriado · ${D.feriados[iso]}`, det: "Não há aulas.", fonte: D.fonteFeriados }); return comAvisos(); }
  const p = periodoDe(D, iso);
  if (!p) {
    const volta = proximoDiaDeAulas(D, iso);
    add({ t: "evento", titulo: ferias(iso), det: volta ? `As aulas recomeçam ${nomeDia(volta).toLowerCase()}.` : "", fonte: D.fontePeriodos });
    return comAvisos();
  }
  if (iso === p.ini) add({ t: "evento", titulo: `Início do ${p.n}.º período`, det: "", fonte: D.fontePeriodos });
  if (iso === p.fim) {
    const seg = D.periodos.find((x) => x.n === p.n + 1);
    add({ t: "evento", titulo: `Último dia do ${p.n}.º período`, det: [p.nota, seg?.ini ? `O ${seg.n}.º período começa ${nomeDia(seg.ini).toLowerCase()}.` : ""].filter(Boolean).join(" "), fonte: D.fontePeriodos });
  }
  for (const a of D.atendimento || []) if (a.dia === wd) add({ t: "atend", titulo: "Atendimento da professora", ini: a.ini, fim: a.fim, allday: true, det: a.det, fonte: a.fonte });
  const teste = (D.testes || []).find((x) => x.data === iso);
  const [i0, i1] = teste ? [minutos(teste.ini), minutos(teste.fim)] : [0, 0];
  if (teste) add({ t: "teste", titulo: `Teste de ${teste.disciplina}`, ini: teste.ini, fim: teste.fim, det: `Teste de ${teste.disciplina}, ${i1 - i0} minutos, às ${fmtH(teste.ini)}.`, fonte: D.fonteTestes });
  (D.horario[wd] || []).forEach((cod, i) => {
    const [ini, fim] = D.slots[i];
    if (teste && minutos(ini) >= i0 && minutos(fim) <= i1) return;
    const nome = D.nomes[cod] || cod;
    add({ t: "aula", titulo: nome, cod, ini, fim, det: `${nome}${D.salas[cod] ? ` (${D.salas[cod]})` : ""}, das ${fmtH(ini)} às ${fmtH(fim)}.`, fonte: D.fonteHorario });
  });
  if (D.intervalo) add({ t: "pausa", titulo: "Intervalo", ini: D.intervalo[0], fim: D.intervalo[1] });
  const em = D.ementa[iso];
  add({ t: "almoco", titulo: em ? `Almoço · ${em.prato}` : "Almoço", ini: D.almoco[0], fim: D.almoco[1], menu: em || null,
    det: em ? "" : "A ementa deste dia ainda não foi publicada no site do colégio.", fonte: em ? D.fonteEmenta : "site do colégio" });
  return comAvisos();
}

export const destaque = (e) => ["teste", "feriado", "evento", "atend", "tpc"].includes(e.t);

export function proximosTestes(D, desde) {
  const fixos = (D.testes || []).filter((x) => x.data >= desde).map((x) => ({ data: x.data, titulo: `Teste de ${x.disciplina}`, disciplina: x.disciplina, ini: x.ini }));
  const avisos = (D.avisos || []).filter((a) => a.tipo === "teste" && a.data && a.data >= desde && !fixos.some((x) => x.data === a.data && a.titulo.toLowerCase().includes(x.disciplina.toLowerCase())))
    .map((a) => ({ data: a.data, titulo: a.titulo, disciplina: a.titulo.replace(/^teste (de )?/i, ""), ini: a.ini || null }));
  return [...fixos, ...avisos].sort((a, b) => a.data.localeCompare(b.data));
}

export const lembretes = (D, iso) => [...new Set((D.horario[diaSemana(iso)] || []).map((c) => D.lembretes?.[c]).filter(Boolean))];

// The 18:00 summary for the next school day `alvo`, as plain lines (the page shows them as a card,
// the server joins them into a WhatsApp-ready message where *bold* works).
export function resumoDe(D, alvo, hoje, site = "febreroai.com/turma1b") {
  const dia = itens(D, alvo);
  const amanha = alvo === mais(hoje, 1);
  const titulo = amanha ? `Amanhã, ${nomeDia(alvo).toLowerCase()}` : nomeDia(alvo);
  const L = [];
  for (const e of dia.filter((x) => x.t === "teste")) L.push(["📝", `*${e.titulo}*, ${fmtH(e.ini)}${e.fim ? ` (${minutos(e.fim) - minutos(e.ini)} min)` : ""}`]);
  for (const e of dia.filter((x) => x.t === "evento" || x.t === "feriado")) L.push(["🗓️", e.titulo]);
  for (const e of dia.filter((x) => x.t === "tpc")) L.push(["📚", `${e.titulo.replace(/^TPC · /, "TPC: ")}${e.nota ? ` (${e.nota})` : ""}`]);
  for (const r of lembretes(D, alvo)) L.push(["🎒", r]);
  const em = D.ementa[alvo];
  if (em) L.push(["🍽️", `Almoço: ${em.prato}`]);
  const prox = proximosTestes(D, mais(alvo, 1)).filter((x) => x.data <= mais(alvo, 21)).slice(0, 2);
  if (prox.length) L.push(["📅", `Próximos testes: ${prox.map((x) => `${x.disciplina} (${curto(x.data)})`).join(" · ")}`]);
  const avisos = (D.avisos || []).filter((a) => !a.data && a.ate && a.ate >= alvo).slice(0, 2);
  for (const a of avisos) L.push(["📌", a.titulo]);
  return { alvo, titulo, linhas: L, texto: [`*Resumo da Turma · ${D.turma}*`, `*${titulo}*`, "", ...L.map(([i, t]) => `${i} ${t}`), "", site].join("\n") };
}

// What to post at 18:00 today (Sun–Thu), or null for silence (weekends and the middle of a break).
export function mensagemDas18(D, hoje, site) {
  const amanha = mais(hoje, 1), wd = diaSemana(amanha);
  if (wd < 1 || wd > 5) return null;
  if (diaDeAulas(D, amanha)) return resumoDe(D, amanha, hoje, site).texto;
  if (!diaDeAulas(D, hoje)) return null;
  const motivo = D.feriados[amanha] ? `feriado (${D.feriados[amanha]})` : ferias(amanha).toLowerCase();
  const volta = proximoDiaDeAulas(D, amanha);
  return [`*Resumo da Turma · ${D.turma}*`, "", `Amanhã não há aulas: ${motivo}.`, ...(volta ? [`As aulas recomeçam ${nomeDia(volta).toLowerCase()}.`] : []), "", site].join("\n");
}
