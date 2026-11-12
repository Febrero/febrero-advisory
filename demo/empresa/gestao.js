// Painel da empresa · the business side of the demo (Pedro 2026-11-12: «combine both the demos construction and crm into the
// same»): «Leads» (the sales pipeline and the quotes), «Clientes» (each work's contract, invoiced month by month) and «Finanças»
// (the accounts and the next 12 months). The same logic as Pedro's own panel (febreroai.com/admin: financas.mjs, leads-painel.mjs),
// simplified, over the app's data (DADOS: works, requests, autos) and GESTAO (gestao_dados.js). Language-neutral: every text is
// in GESTAO.textos, numbers go through the app's eur()/fmt(). Nothing leaves this browser.
(() => {
"use strict";
const G = window.GESTAO, T = G.textos;
const HOJE = G.hoje, ANO = HOJE.slice(0, 4), MES = HOJE.slice(0, 7);

// ---------- small helpers ----------
const r2 = (n) => Math.round(n * 100) / 100;
const somar = (xs, f = (x) => x) => xs.reduce((s, x) => s + (f(x) || 0), 0);
const somaMes = (m, n) => { const [a, b] = m.split("-").map(Number), t = a * 12 + b - 1 + n; return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, "0")}`; };
const somaDias = (iso, n) => new Date(Date.parse(iso + "T12:00:00Z") + n * 864e5).toISOString().slice(0, 10);
const dias = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const mesCurto = (m, ano = true) => `${T.meses[Number(m.slice(5, 7)) - 1]}${ano ? " " + m.slice(0, 4) : ""}`;
const mesLongo = (m) => T.mesesLongos[Number(m.slice(5, 7)) - 1];
const dm = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : "");
const tpl = (s, o = {}) => String(s).replace(/\{(\w+)\}/g, (_, k) => (o[k] ?? ""));
const eur2 = (n) => eur(n, 2);
const curtoV = (n) => (n >= 1e6 ? fmt(n / 1e6, 2) + " M€" : n >= 10000 ? fmt(n / 1000, 0) + "k €" : eur(n));
const obraDe = (id) => D.obras.find((o) => o.id === id);
const autoDe = (id) => calcAuto(D.contratos.find((c) => c.id === id));

// ---------- the numbers: invoices issued, contracts, quotes, leads, expenses ----------
let FATURAS = [], CONTRATOS = [], PROPOSTAS = [], LEADS = [], DESP = {};
const estadoFatura = (f) => (f.estado === "paga" ? "paga" : f.vencimento < HOJE ? "vencida" : "por_receber");

function gerarFaturas() {
  const fs = [];
  for (const s of G.faturacao) {
    const o = obraDe(s.obra);
    let v = s.valores;
    if (s.contrato) {            // the autos before October, as «Autos» shows them (accumulated before this month)
      const a = autoDe(s.contrato), antes = a.acumValor - a.valor;
      v = s.pesos.map((p) => Math.round((antes * p) / 10) * 10);
      v[v.length - 1] = r2(antes - somar(v.slice(0, -1)));
    }
    v.forEach((base, i) => {
      const mes = somaMes(s.inicio, i), data = `${mes}-${String(s.dia).padStart(2, "0")}`, aberta = (s.abertas || []).includes(mes), iva = r2((base * s.iva) / 100);
      const pagaEm = aberta ? null : [somaDias(data, Math.min(s.prazo, 18 + ((i * 7) % 20))), somaDias(HOJE, -1)].sort()[0];
      fs.push({ obra: o.id, cliente: o.cliente, mes, data, vencimento: somaDias(data, s.prazo), descricao: tpl(T.descAuto, { n: i + 1, obra: o.nome }),
        base: r2(base), iva, total: r2(base + iva), estado: aberta ? "por_receber" : "paga", pagaEm });
    });
  }
  fs.sort((a, b) => a.data.localeCompare(b.data) || a.obra.localeCompare(b.obra)).forEach((f, i) => { f.numero = `FT ${ANO}/${i + 1}`; });
  return fs;
}
// a contract, month by month: what was invoiced, October's auto (ready in «Autos»), what else is due and the rest of the work
// spread until its end. The invoices pay the months in order (as in financas.mjs carteira)
function montarContrato(c) {
  const o = obraDe(c.obra), fs = FATURAS.filter((f) => f.obra === c.obra), devido = new Map();
  const juntar = (m, v) => devido.set(m, r2((devido.get(m) || 0) + v));
  for (const f of fs) juntar(f.mes, f.base);
  if (c.contrato) juntar(MES, autoDe(c.contrato).valor);
  for (const [m, v] of c.extra || []) juntar(m, v);
  const resto = Math.max(0, o.orcamento - somar([...devido.values()])), futuros = [];
  for (let m = c.desde || somaMes(MES, 1); m <= c.fim; m = somaMes(m, 1)) futuros.push(m);
  for (const m of futuros) juntar(m, resto / futuros.length);
  const meses = [...devido.keys()].sort(), inicio = meses[0];
  const fila = fs.slice().sort((a, b) => a.data.localeCompare(b.data));
  let i = 0, sobra = fila[0]?.base || 0;
  const mesAMes = [];
  for (let m = inicio; m <= somaMes(MES, 2); m = somaMes(m, 1)) {
    const v = devido.get(m) || 0, usadas = new Set();
    let falta = v;
    while (falta > 0.005 && i < fila.length) {
      const usa = Math.min(falta, sobra);
      falta -= usa; sobra -= usa; usadas.add(fila[i]);
      if (sobra <= 0.005) { i++; sobra = fila[i]?.base || 0; }
    }
    const fu = [...usadas], coberto = v > 0 && falta <= 0.005;
    const estado = coberto ? (fu.some((f) => estadoFatura(f) === "vencida") ? "vencida" : fu.some((f) => f.estado === "por_receber") ? "por_receber" : "paga")
      : !v ? "nada" : m > MES ? "previsto" : m === MES ? "este_mes" : "em_falta";
    mesAMes.push({ mes: m, devido: v, falta: r2(coberto ? 0 : falta), estado, faturas: fu.map((f) => f.numero) });
  }
  const abertas = fs.filter((f) => f.estado === "por_receber"), vencidas = abertas.filter((f) => estadoFatura(f) === "vencida");
  const agora = mesAMes.find((x) => x.mes === MES);
  return { ...c, o, cliente: o.cliente, valor: o.orcamento, inicio, ate: c.fim, devido, faturas: fs.slice().reverse(), mesAMes: mesAMes.slice(-14),
    faturado: somar(fs, (f) => f.base), recebido: somar(fs.filter((f) => f.estado === "paga"), (f) => f.total),
    porReceber: { total: somar(abertas, (f) => f.total), n: abertas.length, vencido: somar(vencidas, (f) => f.total), nVencidas: vencidas.length },
    emFalta: somar(mesAMes.filter((x) => x.estado === "em_falta"), (x) => x.falta), mesesEmFalta: mesAMes.filter((x) => x.estado === "em_falta").map((x) => x.mes),
    esteMes: agora && agora.estado === "este_mes" ? agora.falta : 0, restante: r2(o.orcamento - somar(fs, (f) => f.base)),
    proximo: mesAMes.find((x) => x.mes >= MES && x.falta > 0) || null };
}
const somaMQ = (mq) => somar(mq, ([, , q, pu]) => q * pu);
function valorProposta(p) {
  if (p.valor) return p.valor;
  if (p.calc) return Math.round(totalPadrao(p.calc) / 1000) * 1000;
  if (p.mq) return Math.round(somaMQ(D.pedidos.find((x) => x.id === p.mq).mq) / 100) * 100;
  return 0;
}
const fechada = (p) => p.estado === "ganha" || p.estado === "perdida";
function montarLeads() {
  return G.leads.map((l, k) => {
    const p = PROPOSTAS.find((x) => x.lead === l.id && !fechada(x)), c = l.obra && CONTRATOS.find((x) => x.obra === l.obra);
    const prob = p ? p.probabilidade : l.etapa === "cliente" ? 1 : l.prob ?? 0;
    const valor = p ? p.valor : c ? c.valor : l.valor || 0;
    return { ...l, proposta: p?.id || null, prob, valor, fonte: p ? T.det.fonteProposta : c ? T.det.fonteObra : T.det.fonteTipo, ev: Math.round(prob * valor),
      devemos: !!l.devemos, emails: l.emails ?? (l.etapa === "por_contactar" ? 0 : 1), respostas: l.respostas || 0, chamadas: l.chamadas || 0, reunioes: l.reunioes || 0,
      manual: { ...(l.pin ? { pin: 1e12 - k } : {}), ...(l.adiar ? { adiar_ate: l.adiar } : {}), ...(l.nota ? { nota: l.nota } : {}) },
      acao: l.acao ? { estado: "feito", em: l.acao } : null, lixo: l.lixo ? { em: somaDias(HOJE, -2), motivo: l.lixo } : null };
  });
}
function montar() {
  FATURAS = gerarFaturas();
  CONTRATOS = G.contratos.map(montarContrato).sort((a, b) => b.restante - a.restante);
  PROPOSTAS = G.propostas.map((p) => ({ ...p, valor: valorProposta(p), cliente: G.leads.find((l) => l.id === p.lead)?.nome || "" }));
  LEADS = montarLeads();
  ordemBase();
  // expenses: a share of each month's invoicing, split by supplier (October so far)
  DESP = {};
  for (const [m, f] of Object.entries(G.despesas.fator)) {
    const total = Math.round((somar(FATURAS.filter((x) => x.mes === m), (x) => x.base) * f) / 10) * 10;
    DESP[m] = { total, empresas: Object.fromEntries(G.despesas.fornecedores.map(([e, p]) => [e, Math.round(total * p)])) };
  }
}

// ---------- after a change (an invoice paid, a quote won or lost): the views drawn so far are redrawn ----------
const DESENHAR = {}, sujo = new Set();
let vistaAtual = null;
function redesenhar() {
  for (const v of Object.keys(DESENHAR)) {
    if (v === vistaAtual) DESENHAR[v]();
    else sujo.add(v);
  }
}
const mostrarOriginal = window.mostrar;
window.mostrar = mostrar = function (v) {         // the app's own view switch, plus a redraw of what changed meanwhile
  mostrarOriginal(v);
  vistaAtual = location.hash.slice(1);
  if (sujo.has(vistaAtual)) { sujo.delete(vistaAtual); DESENHAR[vistaAtual]?.(); }
};
const graficos = {};
function grafico(id, cfg) {
  graficos[id]?.destroy();
  if (!estiloGraficos()) return;
  graficos[id] = new Chart(document.getElementById(id), cfg);
}

// ---------- shared pieces of markup ----------
const tileHtml = (rot, val, det, destaque) => `<div class="cartao g-tile p-4 sm:p-5 min-w-0 ${destaque ? "!border-[#e3c4a5] bg-gradient-to-b from-[#fff8f0] to-white" : ""}">
  <div class="rotulo truncate">${rot}</div><div class="g-val serif font-semibold mt-1.5 num whitespace-nowrap">${val}</div><div class="text-xs text-[#7b6a5d] mt-1">${det}</div></div>`;
const CHIP_ETAPA = { cliente: "chip-ok", negociacao: "chip-ok", proposta: "chip-ok", reuniao_feita: "chip-ok", reuniao_marcada: "chip-ok", interessado: "chip-novo",
  conversa: "chip-analise", mais_tarde: "chip-neutro", recado: "chip-neutro", contactado: "chip-neutro", por_contactar: "chip-neutro", sem_interesse: "chip-alerta", remover: "chip-alerta" };
const CHIP_MES = { paga: "mc-paga", por_receber: "mc-receber", vencida: "mc-vencida", em_falta: "mc-falta", este_mes: "mc-agora", previsto: "mc-seguir" };
function chipFatura(f) {
  const e = estadoFatura(f);
  if (e === "paga") return `<span class="chip chip-ok">${icone("certo", "w-3.5 h-3.5")}${tpl(T.paga, { d: dm(f.pagaEm) })}</span>`;
  if (e === "vencida") return `<span class="chip chip-alerta">${icone("alerta", "w-3.5 h-3.5")}${tpl(T.vencida, { n: dias(f.vencimento, HOJE) })}</span>`;
  return `<span class="chip chip-novo">${icone("relogio", "w-3.5 h-3.5")}${tpl(T.vence, { d: dm(f.vencimento) })}</span>`;
}
function marcarPaga(numero) {
  const f = FATURAS.find((x) => x.numero === numero);
  if (!f) return;
  f.estado = "paga"; f.pagaEm = HOJE;
  CONTRATOS = G.contratos.map(montarContrato).sort((a, b) => b.restante - a.restante);
  toast(`${icone("certo", "w-4 h-4 inline")} ${numero} · ${f.cliente}: ${tpl(T.paga, { d: dm(HOJE) }).toLowerCase()}`);
  redesenhar();
}

// =====================================================================================================================
// LEADS: the pipeline, in the order the team works it (Pedro's «Leads» tab) + the quotes (his «Potenciais clientes»)
// =====================================================================================================================
const ATIVAS = new Set(["negociacao", "proposta", "reuniao_feita", "reuniao_marcada", "interessado", "conversa", "mais_tarde", "recado", "contactado", "por_contactar"]);
const QUENTES = new Set(["negociacao", "proposta", "reuniao_feita", "reuniao_marcada", "interessado"]);
const AVANCA = new Set(["negociacao", "proposta", "reuniao_feita", "reuniao_marcada", "interessado", "conversa", "mais_tarde", "recado", "cliente"]);
const ativo = (l) => (ATIVAS.has(l.etapa) || (l.etapa === "cliente" && (l.proposta || l.devemos))) && !l.lixo;
const FILTROS = [
  ["ativos", (l) => ativo(l)], ["devemos", (l) => l.devemos], ["quentes", (l) => QUENTES.has(l.etapa) || (l.etapa === "cliente" && l.proposta)],
  ["conversa", (l) => ["conversa", "mais_tarde"].includes(l.etapa)], ["contactados", (l) => ["recado", "contactado"].includes(l.etapa)],
  ["fila", (l) => l.etapa === "por_contactar"], ["nova", (l) => ativo(l) && l.oferta === T.ofertas.nova], ["reab", (l) => ativo(l) && l.oferta === T.ofertas.reab],
  ["fechados", (l) => ["cliente", "sem_interesse", "remover"].includes(l.etapa)], ["lixo", (l) => !!l.lixo]];
const doFiltro = (k) => { const f = FILTROS.find(([x]) => x === k)[1]; return (l) => (k === "lixo") === !!l.lixo && f(l); };
let filtro = "ativos", procura = "", mostrarN = 40, aberto = null, ordem = [];
// the automatic order (qualificar.mjs): what we owe first, then the money, then fit; pins and snoozes on top of it
function ordemBase() {
  ordem = LEADS.slice().sort((a, b) => (!!b.devemos - !!a.devemos) || (b.ev - a.ev) || (b.fit - a.fit)).map((l) => l.id);
}
function ordenados() {
  const adiado = (l) => (l.manual?.adiar_ate || "") > HOJE;
  const porId = new Map(LEADS.map((l) => [l.id, l]));
  const lista = ordem.map((id) => porId.get(id)).filter((l) => l && ativo(l));
  lista.sort((a, b) => (adiado(a) - adiado(b)) || ((b.manual?.pin || 0) - (a.manual?.pin || 0)) || (ordem.indexOf(a.id) - ordem.indexOf(b.id)));
  for (const l of LEADS) l.pos = null;
  lista.forEach((l, i) => { l.pos = i + 1; });
  return lista;
}
function mover(id, acao, valor) {
  const l = LEADS.find((x) => x.id === id), lista = ordenados(), i = lista.indexOf(l), m = l.manual;
  const tirar = () => { ordem = ordem.filter((x) => x !== id); };
  const antesDe = (ref) => { tirar(); const j = ref ? ordem.indexOf(ref.id) : ordem.length; ordem.splice(j < 0 ? ordem.length : j, 0, id); m.rank = true; };
  if (acao === "topo") m.pin = Date.now();
  else if (acao === "soltar") delete m.pin;
  else if (acao === "subir" && i > 0) { if (lista[i - 1].manual?.pin && !m.pin) m.pin = lista[i - 1].manual.pin + 1; else antesDe(lista[i - 1]); }
  else if (acao === "descer" && i >= 0 && i < lista.length - 1) { delete m.pin; antesDe(lista[i + 2] || null); }
  else if (acao === "adiar") m.adiar_ate = somaDias(HOJE, valor || 7);
  else if (acao === "nota") m.nota = valor;
  else if (acao === "repor") { l.manual = {}; const base = LEADS.slice().sort((a, b) => (!!b.devemos - !!a.devemos) || (b.ev - a.ev) || (b.fit - a.fit)).map((x) => x.id);
    tirar(); const depois = base.slice(base.indexOf(id) + 1).find((x) => ordem.includes(x)); ordem.splice(depois ? ordem.indexOf(depois) : ordem.length, 0, id); }
  else if (acao === "tratado") { l.devemos = false; l.tratado = true; }
  else if (acao === "lixo") { l.lixo = { em: HOJE, motivo: "" }; if (aberto === id) aberto = null;
    toast(`${tpl(T.avisoLixo, { n: esc(l.nome) })} <button class="underline font-semibold ml-2" data-anular="${id}">${T.anular}</button>`, 6000);
    setTimeout(() => { const b = document.querySelector(`[data-anular="${id}"]`); if (b) b.onclick = () => { mover(id, "restaurar"); b.closest(".toast")?.remove(); }; }, 30); }
  else if (acao === "restaurar") { l.lixo = null; toast(tpl(T.saiuLixo, { n: esc(l.nome) })); }
  desenharLeads();
}

function iniciarLeads() {
  DESENHAR.leads = () => { desenharLeads(); desenharPropostas(); };
  vistaAtual = "leads";
  $("#g-leads-como").innerHTML = T.como.map((p) => `<p>${esc(p)}</p>`).join("");
  desenharLeads(); desenharPropostas();
}
function desenharLeads() {
  const vivos = LEADS.filter((l) => !l.lixo), lista0 = ordenados();
  const at = vivos.filter(ativo);
  $("#g-leads-tiles").innerHTML = [
    tileHtml(T.leadsTiles[0], eur(somar(at, (l) => l.ev)), tpl(T.leadsTiles[1], { n: at.length }), true),
    tileHtml(T.leadsTiles[2], fmt(vivos.filter((l) => l.devemos).length), T.leadsTiles[3]),
    tileHtml(T.leadsTiles[4], fmt(vivos.filter(FILTROS[2][1]).length), T.leadsTiles[5]),
    tileHtml(T.leadsTiles[6], fmt(vivos.filter((l) => l.etapa === "cliente").length), tpl(T.leadsTiles[7],
      { c: vivos.filter((l) => l.etapa !== "por_contactar").length, r: vivos.filter((l) => l.respostas > 0).length })),
  ].join("");
  $("#g-leads-filtros").innerHTML = FILTROS.map(([k]) => `<button data-f="${k}" class="${filtro === k ? "on" : ""}" aria-pressed="${filtro === k}">${T.filtros[k]}
    <span class="ml-1 opacity-60 num">${LEADS.filter(doFiltro(k)).length}</span></button>`).join("");
  $$("#g-leads-filtros [data-f]").forEach((b) => (b.onclick = () => { filtro = b.dataset.f; mostrarN = 40; desenharLeads(); }));
  const q = procura.trim().toLowerCase();
  const lista = LEADS.filter(doFiltro(filtro)).filter((l) => !q || [l.nome, l.setor, l.local, l.pessoa, l.resumo].join(" ").toLowerCase().includes(q))
    .sort(filtro === "lixo" ? (a, b) => (b.lixo.em || "").localeCompare(a.lixo.em || "") : (a, b) => (a.pos ?? 1e9) - (b.pos ?? 1e9) || b.ev - a.ev);
  const cab = `<div class="g-lead g-cab">${T.leadsCab.map((c, i) => `<span class="${i === 4 || i === 5 ? "text-right" : ""}">${c}</span>`).join("")}</div>`;
  $("#g-leads").innerHTML = cab + (lista.length ? lista.slice(0, mostrarN).map(linhaLead).join("")
    : `<p class="text-sm text-[#7b6a5d] py-6 text-center">${filtro === "lixo" && !q ? T.lixoVazio : T.nenhum}</p>`);
  $("#g-leads-mais").classList.toggle("hidden", lista.length <= mostrarN);
  $("#g-leads-mais").textContent = tpl(T.mostrarMais, { n: lista.length - mostrarN });
  ligarLeads();
  void lista0;
}
function linhaLead(l) {
  const m = l.manual || {}, adiado = (m.adiar_ate || "") > HOJE, aberta = aberto === l.id;
  const sub = [l.setor, l.local, l.oferta].filter(Boolean).join(" · ");
  const nota = l.lixo ? `<small class="block text-[11px] text-[#7b6a5d] mt-0.5">${tpl(T.noLixoDesde, { d: dm(l.lixo.em) })}</small>`
    : l.devemos ? `<small class="block text-[11px] font-semibold text-[#b4442a] mt-0.5">${T.devemos}</small>`
    : adiado ? `<small class="block text-[11px] text-[#7b6a5d] mt-0.5">${tpl(T.adiadoAte, { d: dm(m.adiar_ate) })}</small>` : "";
  const bt = (ico, rot, acao, extra = "") => `<button class="g-ico ${extra}" title="${rot}" aria-label="${rot}: ${esc(l.nome)}" data-mover="${acao}" data-id="${l.id}">${ico}</button>`;
  const acoes = l.lixo ? bt("↩", T.acoes.restaurar, "restaurar")
    : bt("↑", T.acoes.subir, "subir") + bt("↓", T.acoes.descer, "descer") + (m.pin ? bt("✕", T.acoes.soltar, "soltar") : bt("📌", T.acoes.topo, "topo"))
      + bt("💤", T.acoes.adiar, "adiar") + bt("🗑", T.acoes.lixo, "lixo", "ml-1.5");
  const podeAvancar = !l.lixo && AVANCA.has(l.etapa);
  const estAcao = l.acao?.estado === "feito" ? tpl(T.avancarFeito, { h: new Date(l.acao.em).toLocaleTimeString(T.local, { hour: "2-digit", minute: "2-digit" }) }) : "";
  return `<div class="g-lead ${adiado ? "opacity-60" : ""}" data-lead="${l.id}">
    <span class="text-sm num ${m.pin ? "text-[#c47a3c]" : "text-[#a08b7a]"}">${l.pos ? (m.pin ? "📌" : l.pos) : "—"}</span>
    <button class="g-nome min-w-0 text-left" data-abrir="${l.id}" aria-expanded="${aberta}"><b class="block truncate text-[14px]">${esc(l.nome)}</b><small class="block truncate text-[11.5px] text-[#7b6a5d]">${esc(sub)}</small></button>
    <span class="min-w-0"><span class="chip ${CHIP_ETAPA[l.etapa]}">${T.etapas[l.etapa]}</span>${nota}</span>
    <span class="g-prob flex items-center gap-2 text-[12.5px] num"><span class="barra flex-1 max-w-[70px]"><i style="width:${Math.max(3, Math.min(100, l.prob * 100))}%"></i></span>${l.prob >= 0.1 ? Math.round(l.prob * 100) : fmt(l.prob * 100, 1)}%</span>
    <span class="text-right num"><b class="block text-[14px]">${eur(l.ev)}</b><small class="block text-[11px] text-[#7b6a5d]">${tpl(T.de, { v: curtoV(l.valor) })}</small></span>
    <span class="text-right text-sm num text-[#6b5a4d]">${l.fit}</span>
    <span class="g-passo flex gap-2 items-start min-w-0">${podeAvancar ? `<button class="g-avancar" title="${T.avancar}" aria-label="${T.avancar}: ${esc(l.nome)}" data-avancar="${l.id}">▶</button>` : ""}
      <span class="min-w-0"><span class="g-txt text-[13px]">${esc(l.passo || "—")}</span><small class="block text-[11px] text-[#a08b7a] mt-0.5">${estAcao || (l.toque ? tpl(T.ultimoContacto, { d: dm(l.toque.slice(0, 10)) }) : T.nuncaContactado)}</small></span></span>
    <span class="g-acoes flex gap-1 justify-end">${acoes}</span>
    ${aberta ? detalheLead(l) : ""}
  </div>`;
}
function detalheLead(l) {
  const m = l.manual || {}, L = T.det, linha = (rot, txt) => (txt ? `<div><b>${rot}:</b> ${esc(txt)}</div>` : "");
  const links = [l.obra ? `<button class="g-link" data-ir="obras">${L.obra} →</button>` : "", l.pedido ? `<button class="g-link" data-ir="pedidos" data-pedido="${l.pedido}">${L.pedido} →</button>` : ""].join("");
  return `<div class="g-det">
    ${l.lixo ? `<div class="flex flex-wrap items-center gap-2"><button class="btn btn-claro !py-1.5 !px-3 !text-xs" data-mover="restaurar" data-id="${l.id}">${L.tirar}</button>
      <span class="text-xs text-[#7b6a5d]">${tpl(L.noLixo, { d: dm(l.lixo.em) })}${l.lixo.motivo ? " · " + esc(l.lixo.motivo) : ""}</span></div>` : ""}
    ${!l.lixo && AVANCA.has(l.etapa) ? `<div class="flex flex-wrap items-center gap-2"><button class="btn btn-cobre !py-1.5 !px-3 !text-xs" data-avancar="${l.id}">${L.preparar}</button>
      <span class="text-xs text-[#7b6a5d]">${L.prepararSub}</span></div><div id="g-rasc-${l.id}"></div>` : ""}
    ${linha(L.resumo, l.resumo)}${linha(L.passo, l.passo)}${linha(L.pessoa, l.pessoa)}
    ${l.pedidos?.length ? linha(L.pediram, l.pedidos.join("; ")) : ""}${l.objecoes?.length ? linha(L.objecoes, l.objecoes.join("; ")) : ""}
    ${linha(L.historico, tpl(L.historicoTxt, { e: l.emails, r: l.respostas, c: l.chamadas, m: l.reunioes }))}
    ${linha(L.fit, l.razoes?.length ? `${l.fit} · ${l.razoes.join(", ")}` : String(l.fit))}
    ${linha(L.valor, tpl(L.valorTxt, { v: eur(l.valor), f: l.fonte, p: `${Math.round(l.prob * 100)}%`, ev: eur(l.ev) }))}
    ${links ? `<div class="flex flex-wrap gap-3">${links}</div>` : ""}
    ${l.lixo ? "" : `<textarea class="g-nota" aria-label="${L.nota}" data-nota="${l.id}">${esc(m.nota || "")}</textarea>
    <div class="flex flex-wrap gap-2">
      <button class="btn btn-claro !py-1.5 !px-3 !text-xs" data-guardar="${l.id}">${L.guardarNota}</button>
      <button class="btn btn-claro !py-1.5 !px-3 !text-xs" data-mover="adiar" data-valor="30" data-id="${l.id}">${L.adiar30}</button>
      ${l.devemos ? `<button class="btn btn-claro !py-1.5 !px-3 !text-xs" data-mover="tratado" data-id="${l.id}">${L.jaRespondi}</button>` : ""}
      ${m.pin || m.rank || m.adiar_ate ? `<button class="btn btn-claro !py-1.5 !px-3 !text-xs" data-mover="repor" data-id="${l.id}">${L.repor}</button>` : ""}
      <button class="btn btn-claro !py-1.5 !px-3 !text-xs" data-mover="lixo" data-id="${l.id}">${L.lixo}</button></div>`}
  </div>`;
}
function ligarLeads() {
  const raiz = $("#g-leads");
  $$("[data-abrir]", raiz).forEach((b) => (b.onclick = () => { aberto = aberto === b.dataset.abrir ? null : b.dataset.abrir; desenharLeads(); }));
  $$("[data-mover]", raiz).forEach((b) => (b.onclick = (e) => { e.stopPropagation(); mover(b.dataset.id, b.dataset.mover, Number(b.dataset.valor) || undefined); }));
  $$("[data-guardar]", raiz).forEach((b) => (b.onclick = () => { mover(b.dataset.guardar, "nota", $(`[data-nota="${b.dataset.guardar}"]`).value.slice(0, 400)); }));
  $$("[data-avancar]", raiz).forEach((b) => (b.onclick = (e) => { e.stopPropagation(); avancar(b.dataset.avancar); }));
  $$("[data-ir]", raiz).forEach((b) => (b.onclick = () => { mostrar(b.dataset.ir); if (b.dataset.pedido) setTimeout(() => abrirPedido(b.dataset.pedido), 80); }));
}
// ▶: the AI writes the email for the lead's next step (in Pedro's system it lands in Telegram, to send, edit or drop)
async function avancar(id) {
  const l = LEADS.find((x) => x.id === id);
  if (aberto !== id) { aberto = id; desenharLeads(); }
  const caixa = $(`#g-rasc-${id}`);
  if (!caixa) return;
  const R = T.rascunho, nome = (l.pessoa || "").split(/[,(]/)[0].trim();
  const fat = FATURAS.find((f) => f.obra === l.obra && estadoFatura(f) === "vencida");
  const p = PROPOSTAS.find((x) => x.id === l.proposta);
  const corpo = tpl(l.rascunho || R.generico, { nome: nome ? ` ${nome.split(" ")[0] === "Eng.ª" || nome.split(" ")[0] === "Dra." || nome.split(" ")[0] === "Dr." || nome.split(" ")[0] === "Arq.ª" || nome.split(" ")[0] === "Eng." ? nome : nome.split(" ")[0]}` : "",
    passo: (l.passo || "").replace(/^./, (c) => c.toLowerCase()), valor: p ? eur(l.id === "d-restaurante" ? Math.round(p.valor * 0.97) : p.valor) : "", fatura: fat ? `${fat.numero}, ${eur2(fat.total)}` : "" })
    + "\n" + tpl(R.assinatura, { empresa: D.empresa.nome });
  caixa.innerHTML = `<div class="rounded-xl border border-[#f0dcc6] bg-[#fffaf4] p-3 mt-1">
    <div class="flex items-center gap-2 text-xs font-semibold text-[#a35b1f]">${icone("brilho", "w-4 h-4")}${tpl(R.titulo, { n: esc(l.nome) })}</div>
    <div class="text-[11.5px] text-[#7b6a5d] mt-1">${tpl(R.assunto, { a: esc(l.ultima?.assunto ? "Re: " + l.ultima.assunto.replace(/^Re: /, "") : tpl(R.assuntoGen, { nome: l.nome })) })}</div>
    <div class="g-rasc whitespace-pre-wrap text-[13.5px] leading-relaxed mt-2 min-h-[4em]" data-texto></div>
    <div class="flex flex-wrap gap-2 mt-3"><button class="btn btn-cobre !py-1.5 !px-3 !text-xs" data-enviar>${icone("enviar", "w-4 h-4")}${R.enviar}</button>
      <button class="btn btn-claro !py-1.5 !px-3 !text-xs" data-editar>${icone("editar", "w-4 h-4")}${R.editar}</button>
      <button class="btn btn-claro !py-1.5 !px-3 !text-xs" data-fechar>${R.fechar}</button></div></div>`;
  const txt = $("[data-texto]", caixa);
  $("[data-fechar]", caixa).onclick = () => { caixa.innerHTML = ""; };
  $("[data-editar]", caixa).onclick = () => { txt.contentEditable = "true"; txt.classList.add("g-editavel"); txt.focus(); };
  $("[data-enviar]", caixa).onclick = () => {
    l.acao = { estado: "feito", em: Date.now() }; l.toque = new Date().toISOString(); l.devemos = false;
    toast(tpl(R.enviado, { n: esc(l.nome) }));
    caixa.innerHTML = ""; desenharLeads();
  };
  await escrever(txt, corpo, 6, 3);
}

// ---------- the quotes («Orçamentos»): won or lost moves the forecast ----------
const CHIP_PROP = { "a preparar": "chip-neutro", "proposta enviada": "chip-analise", "a negociar": "chip-novo", "reunião marcada": "chip-analise", ganha: "chip-ok", perdida: "chip-alerta" };
function desenharPropostas() {
  const abertas = PROPOSTAS.filter((p) => !fechada(p)), pond = (p) => p.valor * p.probabilidade;
  const ganhas = D.funil.adjudicacoes.reduce((a, b) => a + b, 0) + PROPOSTAS.filter((p) => p.estado === "ganha").length;
  $("#g-prop-tiles").innerHTML = [
    tileHtml(T.propTiles[0], eur(somar(abertas, (p) => p.valor)), tpl(T.propTiles[1], { n: abertas.length })),
    tileHtml(T.propTiles[2], eur(somar(abertas, pond)), T.propTiles[3], true),
    tileHtml(T.propTiles[4], fmt(ganhas), tpl(T.propTiles[5], { n: ganhas })),
  ].join("");
  const lista = PROPOSTAS.slice().sort((a, b) => fechada(a) - fechada(b) || pond(b) - pond(a));
  $("#g-propostas").innerHTML = `<div class="g-prop g-cab">${T.propCab.map((c, i) => `<span class="${i === 2 || i === 4 ? "text-right" : ""}">${c}</span>`).join("")}</div>` + lista.map((p) => {
    const f = fechada(p);
    return `<div class="g-prop ${f ? "opacity-60" : ""}">
      <span class="min-w-0"><b class="block truncate text-[14px]">${esc(p.cliente)}</b></span>
      <span class="text-[13px] text-[#5b4b40] min-w-0">${esc(p.o_que)}</span>
      <span class="text-right num"><b class="text-[14px]">${eur(p.valor)}</b></span>
      <span class="flex flex-wrap items-center gap-2"><span class="chip ${CHIP_PROP[p.estado] || "chip-neutro"}">${T.estadosProp[p.estado] || p.estado}</span>
        ${f ? "" : `<span class="flex items-center gap-1.5 text-[12px] num"><span class="barra w-[54px]"><i style="width:${p.probabilidade * 100}%"></i></span>${Math.round(p.probabilidade * 100)}%</span>`}</span>
      <span class="text-right num text-[13.5px]">${f ? "—" : eur(pond(p))}</span>
      <span class="flex gap-1.5 justify-end flex-wrap">${f ? `<button class="btn btn-claro !py-1 !px-2.5 !text-xs" data-prop="${p.id}" data-estado="reabrir">${T.reabrir}</button>`
        : `<button class="btn btn-claro !py-1 !px-2.5 !text-xs" data-prop="${p.id}" data-estado="ganha">${T.ganha}</button><button class="btn btn-claro !py-1 !px-2.5 !text-xs" data-prop="${p.id}" data-estado="perdida">${T.perdida}</button>`}</span>
    </div>`;
  }).join("");
  $$("#g-propostas [data-prop]").forEach((b) => (b.onclick = () => {
    const p = PROPOSTAS.find((x) => x.id === b.dataset.prop);
    if (b.dataset.estado === "reabrir") { p.estado = p.estadoAntes || "proposta enviada"; delete p.estadoAntes; }
    else { if (!fechada(p)) p.estadoAntes = p.estado; p.estado = b.dataset.estado; }
    LEADS = LEADS.map((l) => { const n = montarLeads().find((x) => x.id === l.id); return { ...n, manual: l.manual, acao: l.acao, lixo: l.lixo, devemos: l.devemos }; });
    if (p.estado === "ganha") { const l = LEADS.find((x) => x.id === p.lead); if (l && l.etapa !== "cliente") l.etapa = "cliente"; }
    desenharPropostas(); redesenhar();
  }));
}

// =====================================================================================================================
// CLIENTES: each work's contract with its invoicing month by month (Pedro's «Clientes» tab, carteira() in financas.mjs)
// =====================================================================================================================
let cliAberto = null;
function iniciarClientes() { DESENHAR.clientes = desenharClientes; vistaAtual = "clientes"; desenharClientes(); }
function desenharClientes() {
  const c = CONTRATOS, porCli = (arr, f, meses) => { const m = new Map(); for (const x of arr) { const a = m.get(x.cliente) || { v: 0, meses: new Set() }; a.v += f(x); for (const y of meses ? meses(x) : []) a.meses.add(y); m.set(x.cliente, a); } return [...m]; };
  const esteMes = porCli(c.filter((x) => x.esteMes), (x) => x.esteMes), emFalta = porCli(c.filter((x) => x.emFalta), (x) => x.emFalta, (x) => x.mesesEmFalta);
  const abertas = FATURAS.filter((f) => f.estado === "por_receber"), vencido = somar(abertas.filter((f) => estadoFatura(f) === "vencida"), (f) => f.total);
  $("#g-cli-tiles").innerHTML = [
    tileHtml(tpl(T.cliTiles[0], { m: mesLongo(MES) }), eur(somar(c, (x) => x.esteMes)), esteMes.length ? esteMes.map(([k, a]) => `${esc(k)} ${curtoV(a.v)}`).join(" · ") : T.cliTiles[1]),
    tileHtml(T.cliTiles[2], eur(somar(c, (x) => x.emFalta)), emFalta.length ? emFalta.map(([k, a]) => `${esc(k)}: ${[...a.meses].map((m) => mesCurto(m, false)).join(", ")}`).join(" · ") : T.cliTiles[3], somar(c, (x) => x.emFalta) > 0),
    tileHtml(T.cliTiles[4], eur(somar(abertas, (f) => f.total)), abertas.length ? `${tpl(T.cliTiles[5], { n: abertas.length })} · ${vencido ? tpl(T.cliTiles[6], { v: eur(vencido) }) : T.cliTiles[7]}` : T.cliTiles[8]),
    tileHtml(T.cliTiles[9], eur(somar(c, (x) => x.restante)), T.cliTiles[10]),
  ].join("");
  $("#g-clientes").innerHTML = c.map(cartaoCliente).join("");
  $$("#g-clientes [data-cli]").forEach((b) => (b.onclick = () => { cliAberto = cliAberto === b.dataset.cli ? null : b.dataset.cli; desenharClientes(); }));
  $$("#g-clientes [data-pagar]").forEach((b) => (b.onclick = () => marcarPaga(b.dataset.pagar)));
  $$("#g-clientes [data-ir]").forEach((b) => (b.onclick = () => { mostrar(b.dataset.ir); if (b.dataset.contrato) setTimeout(() => abrirContrato(b.dataset.contrato), 80); }));
}
function cartaoCliente(x) {
  const lead = G.leads.find((l) => l.obra === x.obra), aberta = cliAberto === x.obra;
  const meses = x.mesAMes.filter((m) => m.estado !== "nada").map((m) => {
    const t = `${mesCurto(m.mes)}: ${T.rotMes[m.estado]}${m.devido ? `, ${eur(m.devido)}` : ""}${m.faturas.length ? ` (${m.faturas.join(", ")})` : ""}`;
    return `<span class="g-mes ${CHIP_MES[m.estado]}" title="${t}" aria-label="${t}">${mesCurto(m.mes, false)}<small>${curtoV(m.devido)}</small></span>`;
  }).join("");
  const n = [
    `<span>${T.faturado} <b>${eur(x.faturado)}</b> ${T.semIVA} · ${x.faturas.length === 1 ? T.nFatura : tpl(T.nFaturas, { n: x.faturas.length })}</span>`,
    `<span>${T.recebido} <b>${eur(x.recebido)}</b></span>`,
    x.porReceber.n ? `<span class="${x.porReceber.nVencidas ? "text-[#b4442a]" : ""}">${T.porReceber} <b>${eur(x.porReceber.total)}</b>${x.porReceber.nVencidas ? ` · ${tpl(T.vencidoTxt, { v: eur(x.porReceber.vencido) })}` : ""}</span>` : "",
    x.emFalta ? `<span class="text-[#b4442a]">${T.porFaturar} <b>${eur(x.emFalta)}</b> (${x.mesesEmFalta.map((m) => mesCurto(m, false)).join(", ")})</span>` : "",
    x.proximo ? `<span>${T.proxima} <b>${eur(x.proximo.falta)}</b> ${tpl(T.em, { m: mesCurto(x.proximo.mes) })}</span>` : "",
  ].join("");
  const conversa = lead ? [lead.pessoa ? `👤 ${esc(lead.pessoa)}` : "", lead.toque ? tpl(T.ultimoContacto, { d: dm(lead.toque.slice(0, 10)) }) : "", lead.passo ? `➜ ${esc(lead.passo)}` : ""].filter(Boolean).join(" · ") : "";
  const det = aberta ? `<div class="g-det">
      ${x.notas ? `<div><b>${T.notas}:</b> ${esc(x.notas)}</div>` : ""}${lead?.resumo ? `<div><b>${T.ultimaConversa}:</b> ${esc(lead.resumo)}</div>` : ""}
      ${x.faturas.length ? `<div class="overflow-x-auto"><table class="w-full text-[13px] min-w-[520px]"><tbody>${x.faturas.map((f) => `<tr class="border-t border-[#f0e6da]">
        <td class="py-1.5 pr-2 font-semibold whitespace-nowrap">${f.numero}</td><td class="pr-2 whitespace-nowrap">${dm(f.data)}</td><td class="pr-2 text-[#7b6a5d]">${esc(f.descricao)}</td>
        <td class="pr-2 text-right num whitespace-nowrap">${eur2(f.total)}</td><td class="pr-2">${chipFatura(f)}</td>
        <td class="text-right">${f.estado === "por_receber" ? `<button class="btn btn-claro !py-1 !px-2.5 !text-xs" data-pagar="${f.numero}">${T.marcarPaga}</button>` : ""}</td></tr>`).join("")}</tbody></table></div>` : `<div class="text-sm text-[#7b6a5d]">${T.semFaturas}</div>`}
    </div>` : "";
  const auto = x.contrato ? `<button class="g-link" data-ir="autos" data-contrato="${x.contrato}">${T.irAutos}</button>` : "";
  return `<div class="cartao p-5 mt-3 min-w-0">
    <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <button class="serif text-lg font-semibold text-left hover:underline underline-offset-4" data-cli="${x.obra}" aria-expanded="${aberta}">${esc(x.cliente)}</button>
      <span class="chip ${x.o.alerta ? "chip-alerta" : "chip-ok"}">${esc(x.o.fase)} · ${x.o.progresso}%</span>
      <span class="text-[13px] text-[#5b4b40]">${tpl(T.termos, { v: eur(x.valor), d: mesCurto(x.inicio), f: mesCurto(x.ate) })}</span>
    </div>
    <div class="text-[13px] text-[#7b6a5d] mt-1">${esc(x.o.nome)} · ${esc(x.o.local)}</div>
    <div class="flex flex-wrap gap-1.5 mt-3">${meses}</div>
    <div class="flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-[#7b6a5d] mt-3 num">${n}</div>
    ${conversa ? `<div class="text-[13px] text-[#5b4b40] mt-2">${conversa}${lead.devemos ? ` <b class="text-[#b4442a]">${T.devemos}</b>` : ""}</div>` : ""}
    <div class="flex flex-wrap gap-4 mt-2">${auto}<button class="g-link" data-ir="obras">${T.irObra}</button></div>
    ${det}
  </div>`;
}

// =====================================================================================================================
// FINANÇAS: the accounts of the year and the next 12 months (Pedro's «Contas» and «Previsão» tabs)
// =====================================================================================================================
function iniciarFinancas() { DESENHAR.financas = desenharFinancas; vistaAtual = "financas"; desenharFinancas(); }
function previsao() {
  const m0 = somaMes(MES, 1), linhas = Array.from({ length: 12 }, (_, i) => ({ mes: somaMes(m0, i), contratado: 0, provavel: 0 }));
  for (const c of CONTRATOS) for (const l of linhas) l.contratado += c.devido.get(l.mes) || 0;
  for (const p of PROPOSTAS) {
    if (p.estado === "perdida") continue;
    for (const l of linhas) if (l.mes >= p.inicio && l.mes < somaMes(p.inicio, p.meses)) {
      const v = p.valor / p.meses;
      if (p.estado === "ganha") l.contratado += v; else l.provavel += v * p.probabilidade;
    }
  }
  const ultimos = [1, 2, 3].map((k) => somaMes(MES, -k)), custoMes = somar(ultimos, (m) => DESP[m]?.total) / 3;
  const contratado = somar(linhas, (l) => l.contratado), provavel = somar(linhas, (l) => l.provavel);
  return { de: m0, ate: linhas[11].mes, linhas, custoMes, contratado, provavel, despesas: custoMes * 12 };
}
function desenharFinancas() {
  const doAno = FATURAS.filter((f) => f.data.startsWith(ANO)), pagas = doAno.filter((f) => f.estado === "paga"), abertas = FATURAS.filter((f) => f.estado === "por_receber");
  const vencidas = abertas.filter((f) => estadoFatura(f) === "vencida");
  const faturado = somar(doAno, (f) => f.base), despesas = somar(Object.values(DESP), (d) => d.total), iva = somar(doAno, (f) => f.iva);
  const F = T.finTiles;
  $("#g-fin-tiles").innerHTML = [
    tileHtml(tpl(F[0], { a: ANO }), eur(faturado), tpl(F[1], { t: eur(somar(doAno, (f) => f.total)), n: doAno.length })),
    tileHtml(F[2], eur(somar(pagas, (f) => f.total)), tpl(F[3], { n: pagas.length })),
    tileHtml(F[4], eur(somar(abertas, (f) => f.total)), vencidas.length ? tpl(F[5], { v: eur(somar(vencidas, (f) => f.total)), n: abertas.length }) : tpl(F[6], { n: abertas.length }), true),
    tileHtml(tpl(F[7], { a: ANO }), eur(despesas), tpl(F[8], { d: dm(HOJE) })),
    tileHtml(tpl(F[9], { a: ANO }), (faturado - despesas > 0 ? "+" : "") + eur(faturado - despesas), tpl(F[10], { f: eur(faturado), d: eur(despesas) })),
    tileHtml(F[11], eur(iva), F[12]),
  ].join("");
  // invoiced and spent by month
  const meses = Object.keys(DESP).sort();
  $("#g-fin-meses-t").textContent = tpl(T.finMesesTitulo, { a: ANO });
  grafico("g-graf-meses", { type: "bar", data: { labels: meses.map((m) => mesCurto(m, false)), datasets: [
    { label: T.faturadoS, data: meses.map((m) => Math.round(somar(doAno.filter((f) => f.mes === m), (f) => f.base))), backgroundColor: "#c47a3c", borderRadius: 5 },
    { label: T.despesasS, data: meses.map((m) => DESP[m].total), backgroundColor: "#d9c7b3", borderRadius: 5 }] },
    options: { maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } },
      tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${eur(c.raw)}` } } },
      scales: { y: { grid: { color: "#f1e8de" }, ticks: { callback: (v) => curtoV(v) } }, x: { grid: { display: false } } } } });
  // invoices still to receive
  const porOrdem = abertas.slice().sort((a, b) => a.vencimento.localeCompare(b.vencimento));
  $("#g-receber").innerHTML = porOrdem.length ? `<div class="overflow-x-auto"><table class="w-full text-[13px] min-w-[560px]"><tbody>${porOrdem.map((f) => `<tr class="border-t border-[#f0e6da]">
    <td class="py-2 pr-2 font-semibold whitespace-nowrap">${f.numero}</td><td class="pr-2"><b class="font-semibold">${esc(f.cliente)}</b><small class="block text-[11.5px] text-[#7b6a5d]">${esc(f.descricao)}</small></td>
    <td class="pr-2 text-right num whitespace-nowrap">${eur2(f.total)}</td><td class="pr-2">${chipFatura(f)}</td>
    <td class="text-right"><button class="btn btn-claro !py-1 !px-2.5 !text-xs" data-pagar="${f.numero}">${T.marcarPaga}</button></td></tr>`).join("")}</tbody></table></div>`
    : `<p class="text-sm text-[#7b6a5d]">${T.nadaReceber}</p>`;
  $$("#g-receber [data-pagar]").forEach((b) => (b.onclick = () => marcarPaga(b.dataset.pagar)));
  // by client and by supplier
  const porCliente = {}; for (const f of doAno) porCliente[f.cliente] = (porCliente[f.cliente] || 0) + f.base;
  const porForn = {}; for (const d of Object.values(DESP)) for (const [e, v] of Object.entries(d.empresas)) porForn[e] = (porForn[e] || 0) + v;
  const barras = (obj, cor) => { const xs = Object.entries(obj).sort((a, b) => b[1] - a[1]), max = xs[0]?.[1] || 1;
    return xs.map(([k, v]) => `<div class="mt-2.5"><div class="flex justify-between gap-3 text-[13px]"><span class="truncate">${esc(k)}</span><b class="num whitespace-nowrap">${eur(v)}</b></div>
      <div class="barra mt-1 ${cor}"><i style="width:${(v / max) * 100}%"></i></div></div>`).join(""); };
  $("#g-fin-clientes-t").textContent = tpl(T.clientesAno, { a: ANO });
  $("#g-fin-clientes").innerHTML = barras(porCliente, "");
  $("#g-fin-forn-t").textContent = tpl(T.fornecedoresAno, { a: ANO });
  $("#g-fin-forn").innerHTML = barras(porForn, "verde");
  desenharPrevisao(faturado);
}
// the next 12 months, with the summary that motivates (Pedro 2026-11-12: «valor sum em 12 meses… para motivar»)
function desenharPrevisao(faturadoAno) {
  const p = previsao(), total = p.contratado + p.provavel, mes = (l) => l.contratado + l.provavel;
  const melhor = p.linhas.reduce((a, l) => (mes(l) > mes(a) ? l : a), p.linhas[0]);
  const abertas = PROPOSTAS.filter((x) => !fechada(x)), seTudo = p.contratado + somar(abertas, (x) => {
    let v = 0; for (const l of p.linhas) if (l.mes >= x.inicio && l.mes < somaMes(x.inicio, x.meses)) v += x.valor / x.meses; return v; });
  const vezes = faturadoAno > 0 ? total / faturadoAno : 0, R = T.resumo;
  $("#g-prev-t").textContent = tpl(T.prevTitulo, { de: mesCurto(p.de), ate: mesCurto(p.ate) });
  const stat = (v, r, forte) => `<div class="g-tile min-w-0"><div class="g-val g-val-p serif font-semibold num whitespace-nowrap ${forte ? "text-[#b86d31]" : ""}">${v}</div><div class="text-xs text-[#7b6a5d] mt-0.5">${r}</div></div>`;
  $("#g-prev-resumo").innerHTML = [
    stat(eur(total), tpl(R[0], { p: Math.round((p.contratado / total) * 100) }), true), stat(eur(total / 12), R[1]), stat(mesCurto(melhor.mes), tpl(R[2], { v: eur(mes(melhor)) })),
    vezes ? stat(vezes >= 2 ? `${fmt(vezes, 1)}×` : `${vezes >= 1 ? "+" : "−"}${Math.abs(Math.round((vezes - 1) * 100))}%`, tpl(R[3], { v: eur(faturadoAno), a: ANO })) : "",
    seTudo > total + 1 ? stat(eur(seTudo), abertas.length === 1 ? R[5] : tpl(R[4], { n: abertas.length })) : "",
  ].join("");
  $("#g-prev-linha").innerHTML = [[T.prevTiles[0], eur(p.contratado)], [T.prevTiles[2], eur(p.provavel)], [T.prevTiles[4], eur(p.despesas)],
    [T.prevTiles[6], (p.contratado - p.despesas > 0 ? "+" : "") + eur(p.contratado - p.despesas)]].map(([k, v]) => `<span>${k} <b class="num">${v}</b></span>`).join("");
  $("#g-leg-desp").textContent = tpl(T.despesasMediasV, { v: eur(p.custoMes) });
  let acum = 0;
  const acumulado = p.linhas.map((l) => (acum += mes(l)));
  grafico("g-graf-prev", { type: "bar", data: { labels: p.linhas.map((l) => mesCurto(l.mes, false)), datasets: [
    { type: "line", label: T.despesasMedias, data: p.linhas.map(() => Math.round(p.custoMes)), borderColor: "#b4442a", borderWidth: 1.5, borderDash: [5, 4], pointRadius: 0, order: 0 },
    { label: T.contratado, data: p.linhas.map((l) => Math.round(l.contratado)), backgroundColor: "#c47a3c", borderRadius: 4, stack: "s", order: 1 },
    { label: T.provavel, data: p.linhas.map((l) => Math.round(l.provavel)), backgroundColor: "#7fb39d", borderRadius: 4, stack: "s", order: 1 }] },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false },
      tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${eur(c.raw)}`, footer: (it) => `${T.acumulado}: ${eur(acumulado[it[0].dataIndex])}` } } },
      scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: { color: "#f1e8de" }, ticks: { callback: (v) => curtoV(v) } } } },
    plugins: [{ id: "totais", afterDatasetsDraw(ch) {          // each month's total above its bar, where there is room
      const { ctx } = ch, meta = ch.getDatasetMeta(2), larg = ch.chartArea.width / p.linhas.length;
      if (larg < 40) return;
      ctx.save(); ctx.font = "600 11px Inter, system-ui, sans-serif"; ctx.fillStyle = "#3b2b22"; ctx.textAlign = "center";
      meta.data.forEach((b, i) => { const v = mes(p.linhas[i]); if (v > 0) ctx.fillText(larg >= 70 ? eur(Math.round(v)) : curtoV(v), b.x, b.y - 6); });
      ctx.restore(); } }] });
  // the contracts on site
  $("#g-contratos").innerHTML = `<div class="overflow-x-auto"><table class="w-full text-[13px] min-w-[640px]"><thead><tr class="text-left text-[10.5px] uppercase tracking-wider text-[#a08b7a]">
    ${T.contratosCab.map((c, i) => `<th class="py-2 font-semibold ${i >= 2 && i !== 4 ? "text-right pr-3" : "pr-3"}">${c}</th>`).join("")}</tr></thead><tbody>${CONTRATOS.map((c) => {
      const prox = somar(p.linhas, (l) => c.devido.get(l.mes) || 0);
      return `<tr class="border-t border-[#f0e6da]"><td class="py-2 pr-3 font-semibold">${esc(c.cliente)}</td><td class="pr-3 text-[#5b4b40]">${esc(c.o.nome)} · ${esc(c.o.local)}</td>
        <td class="pr-3 text-right num">${eur(c.valor)}</td><td class="pr-3 text-right num">${eur(c.restante)}</td><td class="pr-3 whitespace-nowrap">${mesCurto(c.inicio)} → ${mesCurto(c.ate)}</td>
        <td class="pr-3 text-right num">${eur(prox)}</td></tr>`; }).join("")}</tbody></table></div>`;
}

// ---------- start ----------
montar();
window.GESTAO_UI = { leads: iniciarLeads, clientes: iniciarClientes, financas: iniciarFinancas };
document.addEventListener("DOMContentLoaded", () => {
  const q = $("#g-leads-q");
  let t = null;
  if (q) q.oninput = (e) => { clearTimeout(t); t = setTimeout(() => { procura = e.target.value; mostrarN = 40; desenharLeads(); }, 200); };
  const mais = $("#g-leads-mais");
  if (mais) mais.onclick = () => { mostrarN += 60; desenharLeads(); };
  const nl = $("#n-leads");
  if (nl) nl.textContent = LEADS.filter((l) => l.devemos && !l.lixo).length;
});
})();
