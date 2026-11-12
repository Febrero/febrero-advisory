// Painel da empresa · «Património»: what the owner has outside the company (Pedro 2026-11-12: «a pessoa apenas mete a morada e
// nós vamos lá buscar a informação… para cripto seria só meter a quantidade… o património não se mistura com o negócio»), moved
// here from /demo/portfolio. Valued where it can be: houses by INE's median €/m² of their parish, coins at CoinGecko's price every
// hour, shares at the last close; the rest is what the person says. The company comes in only by the value of their share and
// what it pays them. Language-neutral like gestao.js: texts in PATRIMONIO_TEXTOS, reference prices in PATRIMONIO_REF, numbers
// through the app's eur()/fmt(). What the visitor adds stays in this browser.
(() => {
"use strict";
const P = window.PATRIMONIO_TEXTOS, R = window.PATRIMONIO_REF, G = window.GESTAO;
const HOJE = G.hoje, ANO = Number(HOJE.slice(0, 4));
const CHAVE = "fa_demo_patrimonio_v2_" + P.local;

// ---------- small helpers ----------
const tpl = (s, o = {}) => String(s).replace(/\{(\w+)\}/g, (_, k) => (o[k] ?? ""));
const somar = (xs, f = (x) => x) => xs.reduce((s, x) => s + (Number(f(x)) || 0), 0);
const somaMes = (m, n) => { const [a, b] = m.split("-").map(Number), t = a * 12 + b - 1 + n; return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, "0")}`; };
const hhmm = (ts) => new Date(ts).toLocaleTimeString(P.local, { hour: "2-digit", minute: "2-digit" });
const dm = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const n2 = (v) => (Number(v) || 0).toLocaleString(P.local, { maximumFractionDigits: 2 });
const fmtPreco = (p) => (p >= 1000 ? fmt(p) : p >= 1 ? fmt(p, 2) : (Number(p) || 0).toLocaleString(P.local, { maximumFractionDigits: 4 }));
// prices with the page's own currency placement: «0,1234 €» here, «€0.1234» where the app has comEuro(); shares in US$ by P.usd
const precoEur = (p) => (typeof comEuro === "function" ? comEuro(fmtPreco(p)) : fmtPreco(p) + " €");
const precoAcao = (x) => (x.moeda === "USD" ? tpl(P.usd, { p: fmt(x.p, 2) }) : eur(x.p, 2));
const fmtQtd = (q) => { const n = Number(q) || 0; return fmt(n, (Math.abs(n).toFixed(8).replace(/0+$/, "").split(".")[1] || "").length); };
const mesNome = (m) => tpl(P.mesAno, { m: G.textos.mesesLongos[Number(m.slice(5, 7)) - 1], a: m.slice(0, 4) });
const BTN = "btn btn-claro !py-1.5 !px-3 !text-xs", BTN_COBRE = "btn btn-cobre !py-1.5 !px-3 !text-xs", NOTA = "text-xs text-[#7b6a5d]";
function el(tag, attrs = {}, ...filhos) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "text") n.textContent = v;
    else if (k === "html") n.innerHTML = v;
    else if (k === "class") n.className = v;
    else if (k === "value") n.value = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? "" : v);
  }
  n.append(...filhos.flat(Infinity).filter((f) => f != null && f !== false));
  return n;
}
// the line icons the app does not have yet (same 24×24 stroke as ICONES)
Object.assign(ICONES, {
  casa: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.2V21h14V9.2"/><path d="M10 21v-6h4v6"/>',
  subida: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  banco: '<path d="M3 10h18L12 4z"/><path d="M5 10v7M9.7 10v7M14.3 10v7M19 10v7M3 20h18"/>',
  moeda: '<circle cx="12" cy="12" r="9"/><path d="M9.5 7.5h3.8a2.2 2.2 0 0 1 0 4.5H9.5zM9.5 12h4.3a2.25 2.25 0 0 1 0 4.5H9.5zM9.5 7.5v9M11 6v1.5M13 6v1.5M11 16.5V18M13 16.5V18"/>',
  carro: '<path d="M3 16v-3.5l2.2-4.6A2 2 0 0 1 7 7h10a2 2 0 0 1 1.8 1.1l2.2 4.4V16a1 1 0 0 1-1 1h-1"/><path d="M5 17H4a1 1 0 0 1-1-1M3 12.5h18M9.5 17h5"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/>',
  joia: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20"/><path d="m9 3-1 6 4 12 4-12-1-6"/>',
  cartao: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
});

// ---------- reference data: INE by municipality and parish, coins, shares ----------
const [, TRI, TRI_ANO] = R.ine.periodo.match(/(\d)\D+(\d{4})/) || [];
const PERIODO = tpl(P.inePeriodo, { q: TRI, a: TRI_ANO }), PERIODO_CURTO = tpl(P.inePeriodoCurto, { q: TRI, a: TRI_ANO });
const INE = R.ine.geo.map(([c, nome, e, n, t]) => ({ c, nome, e, n, t }));
const MUNICIPIOS = INE.filter((g) => g.c.length === 7).sort((a, b) => a.nome.localeCompare(b.nome, "pt"));
const FREGUESIAS = INE.filter((g) => g.c.length === 9);
const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/^uniao das freguesias (de |do |da |dos |das )?/, "").replace(/[^a-z0-9]+/g, " ").trim();
function ineDe(concelho, freguesia) {
  const m = MUNICIPIOS.find((x) => norm(x.nome) === norm(concelho));
  if (!m) return null;
  const nf = norm(freguesia);
  const f = nf ? FREGUESIAS.find((x) => x.c.startsWith(m.c) && (norm(x.nome) === nf || norm(x.nome).includes(nf) || nf.includes(norm(x.nome)))) : null;
  return { m, f: f || null };
}
// the €/m² of a place: the parish when INE has it, else the whole municipality; new or used homes
function zonaDe(concelho, freguesia, estado) {
  const r = ineDe(concelho, freguesia), g = r ? r.f || r.m : null;
  return { r, g, m2: g ? (estado === "n" ? g.n || g.t : g.e || g.t) : null };
}
const MOEDAS = new Map(R.moedas.map((m) => [m.id, m]));
const ACOES = new Map(R.acoes.map((a) => [a.t, a]));
const USD = R.usdEur || 0.9;
const precos = { cripto: Object.fromEntries(R.moedas.map((m) => [m.id, m.p])), criptoEm: null };
const TIPOLOGIAS = ["T0", "T1", "T2", "T3", "T4", "T5+", "moradia", "loja"];
const rotuloTip = (v) => P.imovel.tipologias[TIPOLOGIAS.indexOf(v)] ?? v ?? "";

// the order of the groups, their icon and their colour in «Composição»
const CLASSES = {
  imovel: { ico: "casa", cor: "#c47a3c" }, empresa: { ico: "predio", cor: "#3b2b22" }, acao: { ico: "subida", cor: "#2f6b55" },
  deposito: { ico: "banco", cor: "#3b5ba5" }, cripto: { ico: "moeda", cor: "#e2ad2b" }, veiculo: { ico: "carro", cor: "#8f5aa8" }, outro: { ico: "joia", cor: "#a08b7a" },
};
const TIPOS = ["imovel", "veiculo", "cripto", "acao", "deposito", "empresa", "outro", "divida"];
const icoDe = (tipo) => (tipo === "divida" ? "cartao" : CLASSES[tipo].ico);

// ---------- the example person (fictional): the owner of the company in the other sections ----------
const X = P.exemplo;
const EXEMPLO = {
  ativos: [
    { id: "a1", tipo: "imovel", nome: X.casa, morada: X.casaMorada, concelho: "Lisboa", freguesia: "Avenidas Novas", tipologia: "T3", area: 130, estado: "e" },
    { id: "a2", tipo: "imovel", nome: X.apartamento, morada: X.apartamentoMorada, concelho: "Porto", freguesia: "Bonfim", tipologia: "T1", area: 58, estado: "e", renda: 950 },
    { id: "a3", tipo: "empresa", nome: D.empresa.juridico || D.empresa.nome, pct: 100, valor: 420000, metodo: X.metodoBalanco, ligada: true, salarioMes: 4000, dividendos: 60000 },
    { id: "a4", tipo: "acao", ticker: "VWCE.DE", qtd: 180 },
    { id: "a5", tipo: "acao", ticker: "EDP.LS", qtd: 2500 },
    { id: "a6", tipo: "acao", ticker: "NVDA", qtd: 40 },
    { id: "a7", tipo: "deposito", nome: X.contaOrdem, banco: X.banco, saldo: 18500 },
    { id: "a8", tipo: "deposito", nome: X.deposito, banco: X.banco, saldo: 40000, taxa: 2.1 },
    { id: "a9", tipo: "deposito", nome: X.ppr, banco: X.seguradora, saldo: 26300 },
    { id: "a10", tipo: "cripto", moeda: "bitcoin", qtd: 0.35 },
    { id: "a11", tipo: "cripto", moeda: "ethereum", qtd: 3.2 },
    { id: "a12", tipo: "veiculo", nome: "BMW X3 xDrive30e", marca: "BMW", modelo: "X3 xDrive30e", ano: 2022, compra: 68000, valorManual: 41500,
      comparaveis: { n: 9, mediana: 41500, em: HOJE } },
    { id: "a13", tipo: "outro", nome: X.arte, valor: 15000, nota: X.arteNota },
  ],
  dividas: [
    { id: "d1", nome: X.credito, banco: X.banco, capital: 182400, prestacao: 1050, fim: 2047 },
    { id: "d2", nome: X.leasing, banco: X.banco, capital: 21800, prestacao: 690, fim: 2028 },
  ],
};
function carregarEstado() {
  try { const j = JSON.parse(localStorage.getItem(CHAVE) || "null"); if (j && Array.isArray(j.ativos) && Array.isArray(j.dividas)) return j; } catch (e) {}
  return structuredClone(EXEMPLO);
}
let EST = carregarEstado();
const guardarEstado = () => { try { localStorage.setItem(CHAVE, JSON.stringify(EST)); } catch (e) {} };

// ---------- what an asset is worth, where that number comes from and the line under its name ----------
function avaliar(a) {
  const F = P.fontes;
  if (a.tipo === "imovel") {
    const { r, g, m2 } = zonaDe(a.concelho, a.freguesia, a.estado), est = m2 && a.area ? Math.round((a.area * m2) / 100) * 100 : null;
    const onde = g ? (g === r.f ? g.nome : tpl(F.concelhoTodo, { c: g.nome })) : "", ineDa = est ? " · " + tpl(F.ineDa, { v: eur(est) }) : "";
    return { nome: a.nome || F.imovel, valor: a.valorManual ?? est ?? 0, estimado: est,
      fonte: a.comparaveis && a.valorManual != null ? tpl(F.anuncios, { n: a.comparaveis.n }) + ineDa
        : a.valorManual != null ? F.indicado + ineDa
        : g ? tpl(F.ine, { p: PERIODO_CURTO, m: fmt(m2), onde, e: a.estado === "n" ? F.novos : F.usados }) : F.semIne,
      detalhe: [rotuloTip(a.tipologia), a.area ? `${fmt(a.area)} m²` : "", [a.freguesia, a.concelho].filter(Boolean).join(", ")].filter(Boolean).join(" · ")
        + (a.renda ? " · " + tpl(F.arrendado, { v: eur(a.renda) }) : "") };
  }
  if (a.tipo === "veiculo") {
    const anos = Math.max(0, ANO - (Number(a.ano) || ANO)), est = a.compra ? Math.round((a.compra * Math.pow(0.85, anos)) / 100) * 100 : null;
    return { nome: a.nome || [a.marca, a.modelo].filter(Boolean).join(" ") || F.veiculo, valor: a.valorManual ?? est ?? 0, estimado: est,
      fonte: a.comparaveis && a.valorManual != null ? tpl(F.carros, { n: a.comparaveis.n }) : a.valorManual != null ? F.indicado : tpl(F.depreciacao, { v: eur(a.compra) }),
      detalhe: [a.ano, a.matricula].filter(Boolean).join(" · ") };
  }
  if (a.tipo === "cripto") {
    const m = MOEDAS.get(a.moeda), p = precos.cripto[a.moeda] || 0, s = m ? m.s : a.moeda;
    return { nome: m ? m.n : a.moeda, valor: (Number(a.qtd) || 0) * p,
      fonte: `${precos.criptoEm ? tpl(F.cg, { h: hhmm(precos.criptoEm) }) : F.referencia}: ${tpl(F.por, { v: precoEur(p), s })}`, detalhe: `${fmtQtd(a.qtd)} ${s}` };
  }
  if (a.tipo === "acao") {
    const x = ACOES.get(a.ticker), p = x ? x.p * (x.moeda === "USD" ? USD : 1) : 0;
    return { nome: x ? x.n : a.ticker, valor: (Number(a.qtd) || 0) * p,
      fonte: x ? tpl(F.fecho, { d: dm(x.em), v: precoAcao(x), bce: x.moeda === "USD" ? F.bce : "" }) : F.semPreco, detalhe: `${fmtQtd(a.qtd)} × ${a.ticker}` };
  }
  if (a.tipo === "deposito") return { nome: a.nome || F.conta, valor: Number(a.saldo) || 0,
    fonte: F.saldoIndicado + (a.taxa ? " · " + tpl(F.taxa, { t: n2(a.taxa) }) : ""), detalhe: a.banco || "" };
  if (a.tipo === "empresa") return { nome: a.nome || F.empresa, valor: ((Number(a.valor) || 0) * (Number(a.pct) || 100)) / 100,
    fonte: `${n2(a.pct || 100)}% · ${a.metodo || F.indicado}`, detalhe: a.ligada ? F.ligada : "" };
  return { nome: a.nome || F.outro, valor: Number(a.valor) || 0, fonte: F.indicado, detalhe: a.nota || "" };
}
function totais(s) {
  const linhas = s.ativos.map((a) => ({ a, ...avaliar(a) }));
  const porClasse = Object.keys(CLASSES).map((k) => ({ k, valor: somar(linhas.filter((l) => l.a.tipo === k), (l) => l.valor) })).filter((c) => c.valor > 0);
  const ativos = somar(linhas, (l) => l.valor), dividas = somar(s.dividas, (d) => d.capital);
  const rendas = somar(s.ativos.filter((a) => a.tipo === "imovel"), (a) => (a.renda || 0) * 12);
  const juros = somar(s.ativos.filter((a) => a.tipo === "deposito"), (a) => ((a.saldo || 0) * (a.taxa || 0)) / 100);
  const dividendos = somar(s.ativos.filter((a) => a.tipo === "empresa"), (a) => a.dividendos);
  return { linhas, ativos, dividas, liquido: ativos - dividas, porClasse, rendas, juros, dividendos, rendimentos: rendas + juros + dividendos,
    prestacoes: somar(s.dividas, (d) => d.prestacao) };
}

// =====================================================================================================================
// drawing the section
// =====================================================================================================================
// the labels wrap on a phone rather than being cut, and a value never leaves its «€» on the next line
const tile = (rot, val, det, destaque) => el("div", { class: `cartao g-tile p-4 sm:p-5 min-w-0 ${destaque ? "!border-[#e3c4a5] bg-gradient-to-b from-[#fff8f0] to-white" : ""}` },
  el("div", { class: "rotulo leading-snug", text: rot }), el("div", { class: "g-val serif font-semibold mt-1.5 num whitespace-nowrap", text: val }),
  el("div", { class: "text-xs text-[#7b6a5d] mt-1", text: det.replace(/ €/g, " €") }));
function desenhar() {
  const t = totais(EST), Ti = P.tiles, n = EST.ativos.length, nt = t.porClasse.length;
  $("#p-sub").textContent = tpl(P.sub, { h: hhmm(Date.now()), c: precos.criptoEm ? tpl(P.criptoCG, { h: hhmm(precos.criptoEm) }) : P.criptoRef, p: PERIODO });
  const rend = [t.rendas && tpl(Ti.rendas, { v: eur(t.rendas) }), t.dividendos && tpl(Ti.dividendos, { v: eur(t.dividendos) }), t.juros && tpl(Ti.juros, { v: eur(t.juros) })].filter(Boolean);
  $("#p-tiles").replaceChildren(
    tile(Ti.liquido, eur(t.liquido), tpl(Ti.liquidoDet, { a: eur(t.ativos), d: eur(t.dividas) }), true),
    tile(Ti.ativos, eur(t.ativos), !n ? Ti.nenhum : n === 1 ? Ti.umAtivo : tpl(nt === 1 ? Ti.ativosUmTipo : Ti.ativosDet, { n, t: nt })),
    tile(Ti.dividas, eur(t.dividas), t.prestacoes ? tpl(Ti.dividasDet, { v: eur(t.prestacoes) }) : Ti.semDividas),
    tile(Ti.rendimentos, eur(t.rendimentos), rend.length ? tpl(Ti.porAno, { x: rend.join(" · ") }) : Ti.semRendimentos));
  desenharComposicao(t);
  desenharAtivos(t);
  desenharDividas();
  desenharEmpresa();
  desenharGrafico(historico(t));
}
function desenharComposicao(t) {
  const caixa = $("#p-comp");
  if (!t.ativos) return caixa.replaceChildren(el("p", { class: "text-sm text-[#7b6a5d]", text: P.semAtivosComp }));
  const lista = [...t.porClasse].sort((a, b) => b.valor - a.valor), pc = (v) => `${((v / t.ativos) * 100).toLocaleString(P.local, { maximumFractionDigits: 1 })}%`;
  caixa.replaceChildren(
    el("div", { class: "p-comp-barra", role: "img", "aria-label": tpl(P.composicao, { x: lista.map((c) => `${P.classes[c.k]} ${pc(c.valor)}`).join(", ") }) },
      lista.map((c) => el("span", { style: `width:${(c.valor / t.ativos) * 100}%;background:${CLASSES[c.k].cor}`, title: `${P.classes[c.k]}: ${eur(c.valor)} (${pc(c.valor)})` }))),
    el("div", { class: "p-comp-lista" }, lista.flatMap((c) => [el("i", { style: `background:${CLASSES[c.k].cor}`, "aria-hidden": "true" }),
      el("span", { text: P.classes[c.k] }), el("span", { class: "v", text: eur(c.valor) }), el("span", { class: "p", text: pc(c.valor) })])));
}
const icoCaixa = (tipo) => el("span", { class: "p-ico", "aria-hidden": "true", html: icone(icoDe(tipo), "w-4 h-4") });
function linhaItem(tipo, nome, detalhe, fonte, valor, item, lista) {
  return el("div", { class: "p-ativo" + (lista === "dividas" ? " p-divida" : "") }, icoCaixa(tipo),
    el("span", { class: "min-w-0" }, el("b", { text: nome }), el("small", { text: detalhe })),
    el("span", { class: "p-fonte", text: fonte }), el("span", { class: "p-v num", text: valor }),
    el("span", { class: "p-acoes" }, botaoIcone("editar", tpl(P.editar, { n: nome }), () => abrirForm(tipo, item)), botaoApagar(nome, () => apagar(lista, item.id))));
}
function desenharAtivos(t) {
  const grupos = Object.keys(CLASSES).map((k) => ({ k, linhas: t.linhas.filter((l) => l.a.tipo === k).sort((a, b) => b.valor - a.valor) })).filter((g) => g.linhas.length);
  if (!grupos.length) return $("#p-ativos").replaceChildren(el("p", { class: "text-sm text-[#7b6a5d]", text: P.semAtivos }));
  $("#p-ativos").replaceChildren(...grupos.map((g) => el("div", { class: "p-grupo" },
    el("div", { class: "p-grupo-cab" }, el("span", { text: P.classes[g.k] }), el("b", { text: eur(somar(g.linhas, (l) => l.valor)) })),
    g.linhas.map((l) => linhaItem(g.k, l.nome, l.detalhe, l.fonte, eur(l.valor), l.a, "ativos")))));
}
function desenharDividas() {
  const caixa = $("#p-dividas");
  if (!EST.dividas.length) return caixa.replaceChildren(el("p", { class: "text-sm text-[#7b6a5d]", text: P.semDividas }));
  caixa.replaceChildren(...EST.dividas.map((d) => linhaItem("divida", d.nome, [d.banco, d.fim ? tpl(P.ate, { a: d.fim }) : ""].filter(Boolean).join(" · "),
    d.prestacao ? tpl(P.porMes, { v: eur(d.prestacao) }) : "", "−" + eur(Number(d.capital) || 0), d, "dividas")));
}
// the company in the person's net worth: its value and what it pays them; its accounts stay in «Finanças»
function desenharEmpresa() {
  const emp = EST.ativos.find((a) => a.tipo === "empresa" && a.ligada), caixa = $("#p-empresa"), E = P.empresa;
  if (!emp) return caixa.replaceChildren(el("p", { class: "text-sm text-[#7b6a5d]", text: E.semEmpresa }));
  const k = window.GESTAO_UI.totaisAno(), meses = Number(HOJE.slice(5, 7));
  const salario = (emp.salarioMes || 0) * (meses + (meses >= 6 ? 1 : 0));        // with the June holiday bonus
  const linha = (rot, val, det) => el("div", { class: "flex items-start justify-between gap-4 py-2.5 border-t border-[#f0e6da] first:border-t-0 first:pt-0" },
    el("div", { class: "min-w-0" }, el("div", { class: "text-sm font-semibold", text: rot }), el("div", { class: "text-xs text-[#7b6a5d] mt-0.5", text: det })),
    el("div", { class: "num font-semibold whitespace-nowrap", text: val }));
  caixa.replaceChildren(
    linha(E.valor, eur(avaliar(emp).valor), tpl(E.valorDet, { p: n2(emp.pct || 100), n: emp.nome, m: emp.metodo })),
    linha(tpl(E.pagou, { a: ANO }), eur(salario + (emp.dividendos || 0)), tpl(E.pagouDet, { s: eur(emp.salarioMes || 0), t: eur(salario), d: eur(emp.dividendos || 0) })),
    linha(tpl(E.faturado, { a: ANO }), eur(k.faturado), E.faturadoDet),
    linha(tpl(E.saldo, { a: ANO }), (k.resultado > 0 ? "+" : "") + eur(k.resultado), E.saldoDet),
    el("div", { class: "pt-3" }, el("button", { class: BTN, type: "button", text: E.abrir, onclick: () => mostrar("financas") })));
}
const botaoIcone = (ico, rot, fn) => el("button", { type: "button", class: "g-ico inline-flex items-center justify-center", title: rot, "aria-label": rot, html: icone(ico, "w-3.5 h-3.5"), onclick: fn });
// removing asks once more on the same button, like the trash in «Leads»
function botaoApagar(nome, fn) {
  const rot = tpl(P.remover, { n: nome }), aviso = ["!text-[#b4442a]", "!border-[#eab5a4]"];
  const voltar = () => { delete b.dataset.certo; b.innerHTML = icone("cruz", "w-3.5 h-3.5"); b.title = rot; b.setAttribute("aria-label", rot); b.classList.remove(...aviso); };
  const b = botaoIcone("cruz", rot, () => {
    if (b.dataset.certo) return fn();
    b.dataset.certo = "1"; b.innerHTML = icone("certo", "w-3.5 h-3.5"); b.title = P.confirmar; b.setAttribute("aria-label", P.confirmar); b.classList.add(...aviso);
    setTimeout(voltar, 4000);
  });
  return b;
}
function apagar(lista, id) {
  const x = EST[lista].find((y) => y.id === id);
  EST[lista] = EST[lista].filter((y) => y.id !== id);
  guardarEstado(); desenhar();
  if (x) toast(esc(tpl(P.removido, { n: lista === "dividas" ? x.nome : avaliar(x).nome })));
}

// ---------- the 12-month evolution (the months before today are demonstration data: each class walks back from today's value
// at its own pace; the product keeps a snapshot every day) ----------
function historico(t) {
  const meses = Array.from({ length: 12 }, (_, i) => somaMes(HOJE.slice(0, 7), i - 11));
  let semente = 11;
  const rnd = () => { semente = (semente * 16807) % 2147483647; return semente / 2147483647; };
  const ritmo = { imovel: 0.011, empresa: 0.004, acao: 0.007, deposito: 0.002, cripto: 0.015, veiculo: -0.0135, outro: 0 }, vol = { acao: 0.03, cripto: 0.1 };
  const serie = meses.map(() => ({ ativos: 0, dividas: 0 }));
  for (const c of t.porClasse) {
    let v = c.valor;
    for (let i = 11; i >= 0; i--) { serie[i].ativos += v; v /= 1 + (ritmo[c.k] || 0) + (vol[c.k] ? (rnd() - 0.5) * 2 * vol[c.k] : 0); }
  }
  let d = t.dividas;
  for (let i = 11; i >= 0; i--) { serie[i].dividas = d; d += t.prestacoes * 0.55; }
  return meses.map((mes, i) => ({ mes, ativos: serie[i].ativos, dividas: serie[i].dividas, liquido: serie[i].ativos - serie[i].dividas }));
}
let grafico = null;
function desenharGrafico(h) {
  grafico?.destroy(); grafico = null;
  if (!estiloGraficos()) return;
  const cv = $("#p-graf"), ult = h.length - 1, Gr = P.grafico;
  cv.setAttribute("aria-label", tpl(Gr.aria, { a: eur(h[0].liquido), b: eur(h[ult].liquido) }));
  grafico = new Chart(cv, { type: "line", data: { labels: h.map((p) => G.textos.meses[Number(p.mes.slice(5, 7)) - 1]), datasets: [{
      label: Gr.liquido, data: h.map((p) => Math.round(p.liquido)), borderColor: "#c47a3c", borderWidth: 2.5, tension: 0.3, fill: true,
      backgroundColor: (c) => { const a = c.chart.chartArea; if (!a) return "rgba(196,122,60,.12)";
        const g = c.chart.ctx.createLinearGradient(0, a.top, 0, a.bottom); g.addColorStop(0, "rgba(196,122,60,.28)"); g.addColorStop(1, "rgba(196,122,60,0)"); return g; },
      pointRadius: h.map((_, i) => (i === ult ? 5 : 0)), pointHoverRadius: 5, pointBackgroundColor: "#c47a3c", pointBorderColor: "#fff", pointBorderWidth: 2 }] },
    options: { maintainAspectRatio: false, interaction: { mode: "index", intersect: false }, layout: { padding: { top: 24 } },
      plugins: { legend: { display: false }, tooltip: { callbacks: {
        title: (it) => mesNome(h[it[0].dataIndex].mes) + (it[0].dataIndex === ult ? Gr.hoje : ""),
        label: (c) => ` ${Gr.liquido}: ${eur(h[c.dataIndex].liquido)}`,
        afterLabel: (c) => [` ${Gr.ativos}: ${eur(h[c.dataIndex].ativos)}`, ` ${Gr.dividas}: −${eur(h[c.dataIndex].dividas)}`] } } },
      scales: { x: { grid: { display: false }, ticks: { maxRotation: 0 } }, y: { grid: { color: "#f1e8de" }, ticks: { callback: (v) => window.GESTAO_UI.curtoV(v), maxTicksLimit: 5 } } } },
    plugins: [{ id: "hoje", afterDatasetsDraw(ch) {          // today's value over the last point
      const pt = ch.getDatasetMeta(0).data[ult];
      if (!pt) return;
      const { ctx } = ch;
      ctx.save(); ctx.font = "600 12px Inter, system-ui, sans-serif"; ctx.fillStyle = "#3b2b22"; ctx.textAlign = "right";
      ctx.fillText(eur(h[ult].liquido), pt.x, pt.y - 12); ctx.restore(); } }] });
}

// =====================================================================================================================
// adding and editing: a type, then its few fields; whatever can be looked up is (the address → parish, municipality and
// €/m²; the coin → its price), and a document can fill the form
// =====================================================================================================================
const fecharPainel = () => $("#p-adicionar").classList.add("hidden");
function abrirPainelNovo() {
  const p = $("#p-adicionar");
  if (!p.classList.contains("hidden") && !p.dataset.edicao) return fecharPainel();
  delete p.dataset.edicao;
  p.classList.remove("hidden");
  p.replaceChildren(el("div", { class: "p-tipos", role: "group", "aria-label": P.tiposAria },
    TIPOS.map((k) => el("button", { type: "button", "aria-pressed": "false", onclick: (ev) => {
      for (const b of p.querySelectorAll(".p-tipos button")) b.setAttribute("aria-pressed", String(b === ev.currentTarget));
      mostrarForm(k, null);
    } }, icoCaixa(k), el("b", { text: P.tipos[k][0] }), el("small", { text: P.tipos[k][1] })))),
  el("div", { id: "p-form" }));
}
function abrirForm(tipo, item) {
  const p = $("#p-adicionar");
  p.dataset.edicao = "1";
  p.classList.remove("hidden");
  p.replaceChildren(el("div", { id: "p-form" }));
  mostrarForm(tipo, item);
  rolarPara(p);
}
const campo = (rot, input, largo) => el("label", { class: "p-campo" + (largo ? " p-largo" : "") }, el("span", { text: rot }), input);
const entrada = (attrs) => el("input", { type: "text", ...attrs });
const numero = (valor, attrs = {}) => el("input", { type: "number", inputmode: "decimal", min: "0", step: "any", value: valor ?? "", ...attrs });
function escolha(opcoes, valor) {
  const lista = opcoes.map((o) => (Array.isArray(o) ? o : [o, o]));
  if (valor != null && valor !== "" && !lista.some(([v]) => v === valor)) lista.unshift([valor, valor]);   // a name that is not in the list stays
  const s = el("select", {}, lista.map(([v, t]) => el("option", { value: v, text: t })));
  if (valor != null) s.value = valor;
  return s;
}
const num = (i) => (i.value === "" ? null : Number(i.value));
// «Procurar parecidos» (Pedro 2026-11-12: «find approximate value… search the area for similar size houses or automobiles the
// same… smart… as users use it»): in the product an agent looks for listings like this one when it is added and keeps the
// result for that area and size band, so the next person there gets it at once and the data grows where the clients are;
// corrected values refine it. In the demo the numbers are illustrative (asking prices a little above INE's sales) and say so.
const hashTxt = (s) => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
function blocoComparaveis(rotulo, calcular, aplicar) {
  const caixa = el("div", { class: "p-comparaveis", "aria-live": "polite" });
  const botao = el("button", { class: BTN, type: "button", text: rotulo });
  botao.addEventListener("click", async () => {
    const c = calcular();
    if (c.erro) return caixa.replaceChildren(el("span", { class: NOTA, text: c.erro }));
    botao.disabled = true; caixa.replaceChildren(el("span", { class: NOTA, text: P.comp.procurando }));
    await esperar(1400);
    caixa.replaceChildren(el("div", {}, el("b", { text: `≈ ${eur(c.mediana)}` }), ` · ${c.texto}`), el("div", { class: NOTA + " mt-1", text: P.comp.nota }),
      el("div", { class: "mt-2" }, el("button", { class: BTN_COBRE, type: "button", text: P.comp.usar, onclick: () => aplicar(c) })));
    botao.disabled = false;
  });
  return { botao, caixa };
}
// reading a document, in the demo: the file is not read nor sent anywhere; the product reads it with AI and fills in the fields
function lerDocumento(rotulo, aria, preencher) {
  const lido = el("div", { class: "p-lido", "aria-live": "polite" });
  const ficheiro = el("input", { type: "file", accept: ".pdf,image/*", class: "hidden", "aria-label": aria });
  const botao = el("button", { class: BTN, type: "button", text: rotulo, onclick: () => ficheiro.click() });
  ficheiro.addEventListener("change", async () => {
    if (!ficheiro.files.length) return;
    const nome = ficheiro.files[0].name;
    botao.disabled = true; botao.textContent = P.aLer;
    await esperar(1400);
    lido.textContent = preencher(nome);
    botao.disabled = false; botao.textContent = rotulo; ficheiro.value = "";
  });
  return { botao, ficheiro, lido };
}

function mostrarForm(tipo, item) {
  const a = item ? structuredClone(item) : {}, f = FORMS[tipo](a);
  const msg = el("div", { class: "text-xs font-semibold text-[#b4442a]", role: "status" });
  const titulo = item ? tpl(P.editarTitulo, { n: tipo === "divida" ? a.nome : avaliar(a).nome }) : P.tipos[tipo][0];
  const form = el("form", { class: "p-form", novalidate: true }, el("div", { class: "serif text-lg font-semibold", text: titulo }), f.corpo,
    el("div", { class: "flex flex-wrap items-center gap-3" }, el("button", { class: BTN_COBRE, type: "submit", text: item ? P.guardar : P.adicionar }),
      el("button", { class: "g-link", type: "button", text: P.cancelar, onclick: fecharPainel }), msg));
  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const r = f.ler();
    if (r.erro) { msg.textContent = r.erro; return; }
    const lista = tipo === "divida" ? "dividas" : "ativos";
    const novo = { ...r.dados, id: item ? item.id : `${lista[0]}${Date.now().toString(36)}`, ...(tipo === "divida" ? {} : { tipo }) };
    EST[lista] = item ? EST[lista].map((x) => (x.id === item.id ? novo : x)) : [...EST[lista], novo];
    guardarEstado();
    fecharPainel();
    if (tipo === "cripto") atualizarCripto([novo.moeda]);
    desenhar();
    const nome = tipo === "divida" ? novo.nome : avaliar(novo).nome, valor = tipo === "divida" ? novo.capital : avaliar(novo).valor;
    toast(esc(tpl(item ? P.guardado : P.adicionado, { n: nome, v: eur(valor) })));
  });
  $("#p-form").replaceChildren(form);
  f.depois?.();
}

const FORMS = {
  imovel(a) {
    const I = P.imovel;
    const morada = entrada({ value: a.morada || "", placeholder: I.moradaPh, autocomplete: "off" });
    const procurar = el("button", { class: BTN, type: "button", text: I.procurar });
    const resultados = el("div", { class: "p-resultados" });
    const listaC = el("datalist", { id: "p-concelhos" }, MUNICIPIOS.map((m) => el("option", { value: m.nome })));
    const listaF = el("datalist", { id: "p-freguesias" });
    const concelho = entrada({ value: a.concelho || "", list: "p-concelhos", placeholder: I.concelhoPh });
    const freguesia = entrada({ value: a.freguesia || "", list: "p-freguesias", placeholder: I.freguesiaPh });
    const nome = entrada({ value: a.nome || "", placeholder: I.nomePh });
    const tipologia = escolha(TIPOLOGIAS.map((v, i) => [v, I.tipologias[i]]), a.tipologia || "T2");
    const area = numero(a.area, { min: "5", step: "1", placeholder: "m²" });
    const estado = escolha([["e", I.usado], ["n", I.novo]], a.estado || "e");
    const renda = numero(a.renda, { step: "10", placeholder: I.rendaPh });
    const manual = numero(a.valorManual, { step: "1000", placeholder: I.manualPh });
    const est = el("div", { class: "p-estimativa", "aria-live": "polite" });
    const zona = () => zonaDe(concelho.value, freguesia.value, estado.value);
    const preencherFreguesias = () => {
      const m = MUNICIPIOS.find((x) => norm(x.nome) === norm(concelho.value));
      listaF.replaceChildren(...(m ? FREGUESIAS.filter((x) => x.c.startsWith(m.c)).map((x) => el("option", { value: x.nome })) : []));
    };
    const atualizar = () => {
      const { r, g, m2 } = zona(), v = m2 && num(area) ? Math.round((num(area) * m2) / 100) * 100 : null;
      est.replaceChildren(...(v ? [el("b", { text: `≈ ${eur(v)}` }), el("div", { text: tpl(I.estimativa, { a: fmt(num(area)), m: fmt(m2), e: estado.value === "n" ? I.novas : I.usadas,
          onde: r.f ? tpl(I.naFreguesia, { f: r.f.nome }) : tpl(I.noConcelho, { c: r.m.nome }), p: PERIODO }) })]
        : [el("span", { text: g ? I.indiqueArea : concelho.value ? I.semDados : I.procureMorada })]));
    };
    procurar.addEventListener("click", async () => {
      const q = morada.value.trim();
      if (q.length < 4) return;
      procurar.disabled = true; resultados.replaceChildren(el("span", { class: NOTA, text: I.aProcurar }));
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=pt&limit=5&accept-language=pt&q=${encodeURIComponent(q)}`);
        if (!r.ok) throw new Error(`Nominatim ${r.status}`);
        const lista = await r.json();
        if (!lista.length) return resultados.replaceChildren(el("span", { class: NOTA, text: I.naoEncontrei }));
        resultados.replaceChildren(...lista.map((x) => {
          const ad = x.address || {};
          const c = [ad.city, ad.town, ad.municipality, ad.village, ad.county].find((v) => v && MUNICIPIOS.some((m) => norm(m.nome) === norm(v))) || ad.city || ad.town || "";
          const fr = [ad.city_district, ad.suburb, ad.quarter, ad.village, ad.hamlet, ad.neighbourhood, ad.town].find((v) => v && ineDe(c, v)?.f) || ad.city_district || ad.suburb || "";
          const curta = [ad.road && `${ad.road}${ad.house_number ? " " + ad.house_number : ""}`, fr, c].filter(Boolean).join(", ") || x.display_name;
          return el("button", { type: "button", text: curta, onclick: () => {
            morada.value = curta; concelho.value = c; freguesia.value = fr;
            preencherFreguesias(); resultados.replaceChildren(); atualizar(); if (!num(area)) area.focus();
          } });
        }));
      } catch (e) {
        resultados.replaceChildren(el("span", { class: NOTA, text: I.semProcura }));
      } finally { procurar.disabled = false; }
    });
    morada.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); procurar.click(); } });
    const doc = lerDocumento(I.lerDoc, I.docAria, (f) => {
      morada.value = "Rua de Arroios, Arroios, Lisboa"; concelho.value = "Lisboa"; freguesia.value = "Arroios";
      tipologia.value = "T2"; area.value = 92; estado.value = "e"; if (!nome.value) nome.value = I.docNome;
      preencherFreguesias(); atualizar();
      return tpl(I.lido, { f });
    });
    for (const i of [concelho, freguesia, area]) i.addEventListener("input", () => { if (i === concelho) preencherFreguesias(); atualizar(); });
    estado.addEventListener("change", atualizar);
    let compUsado = a.comparaveis || null;
    const comp = blocoComparaveis(I.procurarParecidas, () => {
      const { r, g, m2 } = zona();
      if (!m2 || !num(area)) return { erro: I.indiqueZona };
      const h = hashTxt(`${g.c}${tipologia.value}${num(area)}`), pedido = Math.round(m2 * (1.06 + (h % 9) / 100)), n = 6 + (h % 14);
      const mediana = Math.round((num(area) * pedido) / 1000) * 1000;
      return { n, mediana, texto: tpl(I.parecidas, { n, t: rotuloTip(tipologia.value), a: Math.round(num(area) * 0.85), b: Math.round(num(area) * 1.15), z: r.f ? r.f.nome : r.m.nome,
        m: fmt(pedido), min: eur(mediana * 0.9), max: eur(mediana * 1.1), ine: fmt(m2) }) };
    }, (c) => {
      manual.value = c.mediana; compUsado = { n: c.n, mediana: c.mediana, em: HOJE };
      comp.caixa.replaceChildren(el("span", { class: "p-lido", text: tpl(I.fica, { v: eur(c.mediana) }) }));
    });
    return {
      corpo: [el("div", { class: "flex flex-wrap items-center gap-2" }, doc.botao, el("span", { class: NOTA, text: I.ouMorada })), doc.ficheiro, doc.lido,
        el("div", { class: "p-campos" }, campo(I.morada, el("div", { class: "p-linha" }, morada, procurar), true)), resultados,
        el("div", { class: "p-campos" }, campo(I.concelho, concelho), campo(I.freguesia, freguesia), campo(I.nome, nome), campo(I.tipologia, tipologia),
          campo(I.area, area), campo(I.estado, estado), campo(I.renda, renda), campo(I.manual, manual)),
        listaC, listaF, est, el("div", {}, comp.botao), comp.caixa],
      depois: () => { preencherFreguesias(); atualizar(); },
      ler: () => {
        if (!concelho.value.trim()) return { erro: I.faltaConcelho };
        if (!num(area) && num(manual) == null) return { erro: I.faltaArea };
        return { dados: { nome: nome.value.trim() || tpl(I.nomeAuto, { t: rotuloTip(tipologia.value), z: freguesia.value.trim() || concelho.value.trim() }),
          morada: morada.value.trim(), concelho: concelho.value.trim(), freguesia: freguesia.value.trim(), tipologia: tipologia.value, area: num(area), estado: estado.value,
          ...(num(renda) ? { renda: num(renda) } : {}), ...(num(manual) != null ? { valorManual: num(manual) } : {}),
          ...(compUsado && num(manual) === compUsado.mediana ? { comparaveis: compUsado } : {}) } };
      },
    };
  },
  veiculo(a) {
    const V = P.veiculo;
    const marca = entrada({ value: a.marca || "", placeholder: V.marcaPh }), modelo = entrada({ value: a.modelo || "", placeholder: V.modeloPh });
    const ano = numero(a.ano, { min: "1950", max: String(ANO), step: "1", placeholder: String(ANO - 3) }), compra = numero(a.compra, { step: "100", placeholder: V.compraPh });
    const matricula = entrada({ value: a.matricula || "", placeholder: V.opcional }), manual = numero(a.valorManual, { step: "100", placeholder: V.manualPh });
    const est = el("div", { class: "p-estimativa", "aria-live": "polite" });
    const atualizar = () => {
      const anos = Math.max(0, ANO - (num(ano) || ANO)), v = num(compra) ? Math.round((num(compra) * Math.pow(0.85, anos)) / 100) * 100 : null;
      est.replaceChildren(...(v ? [el("b", { text: `≈ ${eur(v)}` }), el("div", { text: tpl(V.estimativa, { v: eur(num(compra)), n: anos, a: anos === 1 ? V.ano1 : V.anos }) })]
        : [el("span", { text: V.semEstimativa })]));
    };
    const doc = lerDocumento(V.lerDoc, V.docAria, (f) => {
      marca.value = "Volkswagen"; modelo.value = "Golf 1.5 TSI"; ano.value = 2021; matricula.value = "AA-00-AA"; if (!compra.value) compra.value = 29500;
      atualizar();
      return tpl(V.lido, { f });
    });
    for (const i of [ano, compra]) i.addEventListener("input", atualizar);
    let compUsado = a.comparaveis || null;
    const comp = blocoComparaveis(V.procurarIguais, () => {
      if (!marca.value.trim() || !num(ano)) return { erro: V.indiqueMarca };
      if (!num(compra)) return { erro: V.precisaCompra };
      const anos = Math.max(0, ANO - num(ano)), h = hashTxt(`${marca.value}${modelo.value}${num(ano)}`), n = 5 + (h % 12);
      const mediana = Math.round((num(compra) * Math.pow(0.85, anos) * (1.02 + (h % 7) / 100)) / 100) * 100;
      return { n, mediana, texto: tpl(V.iguais, { n, c: `${marca.value.trim()} ${modelo.value.trim()}`.trim(), a: num(ano), min: eur(mediana * 0.88), max: eur(mediana * 1.12), m: eur(mediana) }) };
    }, (c) => {
      manual.value = c.mediana; compUsado = { n: c.n, mediana: c.mediana, em: HOJE };
      comp.caixa.replaceChildren(el("span", { class: "p-lido", text: tpl(V.fica, { v: eur(c.mediana) }) }));
    });
    return {
      corpo: [el("div", {}, doc.botao), doc.ficheiro, doc.lido,
        el("div", { class: "p-campos" }, campo(V.marca, marca), campo(V.modelo, modelo), campo(V.ano, ano), campo(V.compra, compra), campo(V.matricula, matricula),
          campo(V.manual, manual)), est, el("div", {}, comp.botao), comp.caixa],
      depois: atualizar,
      ler: () => (!marca.value.trim() ? { erro: V.faltaMarca } : !num(compra) && num(manual) == null ? { erro: V.faltaCompra }
        : { dados: { nome: `${marca.value.trim()} ${modelo.value.trim()}`.trim(), marca: marca.value.trim(), modelo: modelo.value.trim(), ano: num(ano) || ANO,
          compra: num(compra), ...(matricula.value.trim() ? { matricula: matricula.value.trim().toUpperCase() } : {}), ...(num(manual) != null ? { valorManual: num(manual) } : {}),
          ...(compUsado && num(manual) === compUsado.mediana ? { comparaveis: compUsado } : {}) } }),
    };
  },
  cripto(a) {
    const C = P.cripto, moeda = escolha([...MOEDAS.values()].map((m) => [m.id, `${m.n} (${m.s})`]), MOEDAS.has(a.moeda) ? a.moeda : "bitcoin");
    const qtd = numero(a.qtd, { placeholder: C.qtdPh }), est = el("div", { class: "p-estimativa", "aria-live": "polite" });
    const atualizar = () => {
      const m = MOEDAS.get(moeda.value), p = precos.cripto[moeda.value] || 0;
      est.replaceChildren(...(num(qtd) ? [el("b", { text: eur(num(qtd) * p) }), el("div", { text: tpl(C.valor, { q: fmtQtd(num(qtd)), s: m.s, v: precoEur(p),
          fonte: precos.criptoEm ? tpl(P.fontes.cg, { h: hhmm(precos.criptoEm) }) : P.fontes.referencia }) })]
        : [el("span", { text: tpl(C.um, { s: m.s, v: precoEur(p) }) })]));
    };
    moeda.addEventListener("change", () => { atualizar(); atualizarCripto([moeda.value]).then(atualizar); });
    qtd.addEventListener("input", atualizar);
    return { corpo: [el("div", { class: "p-campos" }, campo(C.moeda, moeda), campo(C.quantidade, qtd)), est], depois: atualizar,
      ler: () => (num(qtd) > 0 ? { dados: { moeda: moeda.value, qtd: num(qtd) } } : { erro: C.falta }) };
  },
  acao(a) {
    const A = P.acao, ETF = /^(VWCE|IWDA|CSPX|EUNL|VUSA)/;
    const grupos = [(x) => x.t.endsWith(".LS"), (x) => !x.t.includes("."), (x) => ETF.test(x.t), (x) => /\.(AS|DE|PA)$/.test(x.t) && !ETF.test(x.t)];
    const ticker = el("select", {}, A.grupos.map((rot, i) => el("optgroup", { label: rot }, [...ACOES.values()].filter(grupos[i]).map((x) => el("option", { value: x.t, text: `${x.n} · ${x.t}` })))));
    ticker.value = ACOES.has(a.ticker) ? a.ticker : "VWCE.DE";
    const qtd = numero(a.qtd, { placeholder: A.qtdPh }), est = el("div", { class: "p-estimativa", "aria-live": "polite" });
    const atualizar = () => {
      const x = ACOES.get(ticker.value), usd = x.moeda === "USD", p = x.p * (usd ? USD : 1);
      est.replaceChildren(...(num(qtd) ? [el("b", { text: eur(num(qtd) * p) }), el("div", { text: tpl(A.valor, { q: fmtQtd(num(qtd)), v: precoAcao(x), d: dm(x.em), fx: usd ? A.fx : "" }) })]
        : [el("span", { text: tpl(A.fecho, { d: dm(x.em), v: precoAcao(x) }) })]));
    };
    ticker.addEventListener("change", atualizar); qtd.addEventListener("input", atualizar);
    return { corpo: [el("div", { class: "p-campos" }, campo(A.titulo, ticker), campo(A.quantidade, qtd)), est], depois: atualizar,
      ler: () => (num(qtd) > 0 ? { dados: { ticker: ticker.value, qtd: num(qtd) } } : { erro: A.falta }) };
  },
  deposito(a) {
    const Dp = P.deposito, nome = escolha(Dp.tipos, a.nome || Dp.tipos[0]);
    const banco = entrada({ value: a.banco || "", placeholder: Dp.bancoPh }), saldo = numero(a.saldo, { step: "100" }), taxa = numero(a.taxa, { step: "0.05", placeholder: Dp.opcional });
    return { corpo: [el("div", { class: "p-campos" }, campo(Dp.tipo, nome), campo(Dp.banco, banco), campo(Dp.saldo, saldo), campo(Dp.taxa, taxa)), el("p", { class: NOTA, text: Dp.nota })],
      ler: () => (num(saldo) == null ? { erro: Dp.falta } : { dados: { nome: nome.value, banco: banco.value.trim(), saldo: num(saldo), ...(num(taxa) ? { taxa: num(taxa) } : {}) } }) };
  },
  empresa(a) {
    const E = P.empresaF, nome = entrada({ value: a.nome || "", placeholder: E.empresaPh }), pct = numero(a.pct ?? 100, { max: "100", step: "1" });
    const valor = numero(a.valor, { step: "1000" }), metodo = escolha(E.metodos, a.metodo || E.metodos[0]), dividendos = numero(a.dividendos, { step: "1000", placeholder: E.dividendosPh });
    return { corpo: [el("div", { class: "p-campos" }, campo(E.empresa, nome), campo(E.pct, pct), campo(E.valor, valor), campo(E.metodo, metodo), campo(E.dividendos, dividendos)),
      el("p", { class: NOTA, text: E.nota })],
      ler: () => (!nome.value.trim() || num(valor) == null ? { erro: E.falta }
        : { dados: { ...a, nome: nome.value.trim(), pct: num(pct) || 100, valor: num(valor), metodo: metodo.value, dividendos: num(dividendos) || undefined } }) };
  },
  outro(a) {
    const O = P.outro, nome = entrada({ value: a.nome || "", placeholder: O.oquePh }), valor = numero(a.valor, { step: "100" }), nota = entrada({ value: a.nota || "", placeholder: O.notaPh });
    return { corpo: [el("div", { class: "p-campos" }, campo(O.oque, nome), campo(O.valor, valor), campo(O.nota, nota))],
      ler: () => (!nome.value.trim() || num(valor) == null ? { erro: O.falta } : { dados: { nome: nome.value.trim(), valor: num(valor), ...(nota.value.trim() ? { nota: nota.value.trim() } : {}) } }) };
  },
  divida(a) {
    const Dv = P.divida, nome = escolha(Dv.tipos, a.nome || Dv.tipos[0]);
    const banco = entrada({ value: a.banco || "", placeholder: Dv.bancoPh }), capital = numero(a.capital, { step: "100" });
    const prestacao = numero(a.prestacao, { step: "10" }), fim = numero(a.fim, { min: String(ANO), step: "1", placeholder: Dv.fimPh });
    return { corpo: [el("div", { class: "p-campos" }, campo(Dv.tipo, nome), campo(Dv.banco, banco), campo(Dv.capital, capital), campo(Dv.prestacao, prestacao), campo(Dv.fim, fim))],
      ler: () => (num(capital) == null ? { erro: Dv.falta }
        : { dados: { nome: nome.value, banco: banco.value.trim(), capital: num(capital), ...(num(prestacao) ? { prestacao: num(prestacao) } : {}), ...(num(fim) ? { fim: num(fim) } : {}) } }) };
  },
};

// ---------- live coin prices: CoinGecko, when the section opens and every hour ----------
async function atualizarCripto(extra = []) {
  const ids = [...new Set([...EST.ativos.filter((a) => a.tipo === "cripto").map((a) => a.moeda), ...extra])].filter((id) => MOEDAS.has(id));
  if (!ids.length) return null;
  try {
    const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=eur`);
    if (!r.ok) throw new Error(`CoinGecko ${r.status}`);
    const j = await r.json();
    for (const id of ids) if (j[id]?.eur) precos.cripto[id] = j[id].eur;
    precos.criptoEm = Date.now();
  } catch (e) { console.warn(e); return false; }
  if (location.hash === "#patrimonio" && $("#p-adicionar").classList.contains("hidden")) desenhar();
  return true;
}

// ---------- start: the app opens the section through INICIAR (app.js); coming back to it redraws ----------
let iniciado = false;
function iniciar() {
  iniciado = true;
  $("#p-novo").onclick = abrirPainelNovo;
  $("#p-precos").onclick = async (ev) => {
    const b = ev.currentTarget;
    b.disabled = true;
    const ok = await atualizarCripto();
    toast(esc(ok === null ? P.precosSem : ok ? tpl(P.precosOk, { h: hhmm(precos.criptoEm) }) : P.precosErro));
    desenhar();
    b.disabled = false;
  };
  $("#p-repor").onclick = () => { EST = structuredClone(EXEMPLO); guardarEstado(); fecharPainel(); desenhar(); toast(esc(P.reposto)); };
  desenhar();
  atualizarCripto();
  setInterval(() => atualizarCripto(), 3600e3);
}
const mostrarAntes = window.mostrar;
window.mostrar = mostrar = function (v) {
  const ja = iniciado;
  mostrarAntes(v);
  if (ja && location.hash === "#patrimonio") desenhar();
};
window.PATRIMONIO_UI = { iniciar };
})();
