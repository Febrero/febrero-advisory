"use strict";
// Demo of the client dashboard (febreroai.com/demo/portfolio). Pedro, 2026-11-12: «uma demo da nossa dashboard para mostrar a um
// cliente… que quer seguir tudo do seu negócio como eu faço e adicionalmente incluir o património… a pessoa apenas mete a
// morada e nós vamos lá buscar a informação… para cripto seria só meter a quantidade… o património não se mistura com o
// negócio». The page is Pedro's finance panel (admin/index.html, rebuilt by montar_pagina.mjs) reading window.DEMO instead of
// the bot's server: this file answers its calls (DEMO_API) and adds the net-worth area. The company and every value are
// fictional; the reference prices are public (INE €/m² by parish, CoinGecko, market closes).

const r2 = (x) => Math.round(x * 100) / 100;
const NEG = structuredClone(window.DEMO.negocio);
const eur0 = (n) => eur(Math.round(Number(n) || 0)).replace(/,00 €$/, " €");
// thousands with dots like eur() (pt-PT's own toLocaleString leaves 4-digit numbers ungrouped and uses spaces above that)
const milhares = (s) => s.replace(/\B(?=(\d{3})+$)/g, ".");
const fmt = (n) => (Number(n) < 0 ? "−" : "") + milhares(String(Math.abs(Math.round(Number(n) || 0))));
const dec2 = (n) => { const [i, c] = Math.abs(Number(n) || 0).toFixed(2).split("."); return `${Number(n) < 0 ? "−" : ""}${milhares(i)},${c}`; };
const hhmm = (ts) => new Date(ts).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });

// ------------------------------------------------------------ the business: what the bot's server answers, from DEMO
window.DEMO_API = async (caminho, { method = "GET", body } = {}) => {
  await new Promise((r) => setTimeout(r, 120));
  if (caminho === "") return structuredClone(NEG);
  if (caminho === "/estado" && method === "POST") return marcarFaturaDemo(body || {});
  if (caminho === "/proposta" && method === "POST") return marcarPropostaDemo(body || {});
  throw new Error("Na demonstração isto não está disponível.");
};
function marcarFaturaDemo({ numero, estado, data }) {
  const d = NEG, f = d.faturas.find((x) => x.numero === numero);
  if (!f || !["paga", "por_receber"].includes(estado) || f.estado === estado) throw new Error("Pedido inválido.");
  const k = d.kpis, sinal = estado === "paga" ? 1 : -1;
  const quando = estado === "paga" ? (data || d.hoje) : f.pagaEm;
  if (quando && quando.startsWith(d.ano)) {
    k.recebido.total = r2(k.recebido.total + sinal * f.total); k.recebido.n += sinal;
    const m = d.meses.find((x) => x.mes === quando.slice(0, 7));
    if (m) m.recebido = r2(m.recebido + sinal * f.total);
  }
  k.porReceber.total = r2(k.porReceber.total - sinal * f.total); k.porReceber.n -= sinal;
  const atraso = Math.max(0, Math.round((Date.parse(d.hoje) - Date.parse(f.vencimento)) / 864e5));
  if (atraso > 0) { k.vencido.total = r2(k.vencido.total - sinal * f.total); k.vencido.n -= sinal; }
  const c = d.clientes.find((x) => x.nome === f.nome);
  if (c) c.porReceber = r2(c.porReceber - sinal * f.total);
  d.registo.unshift({ ts: Date.now(), numero, de: f.estado, para: estado, por: "painel" });
  Object.assign(f, { estado, pagaEm: estado === "paga" ? quando : null, atraso: estado === "paga" ? 0 : atraso });
  return { ok: true };
}
// the next 12 months again after a proposal is won, lost or reopened (the server's previsao(), on the page)
const somaMes = (m, n) => { const [a, b] = m.split("-").map(Number), t = a * 12 + b - 1 + n; return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, "0")}`; };
const fechadaDemo = (x) => x.estado === "ganha" || x.estado === "perdida";
function refazerPrevisao(p) {
  const linhas = p.meses.map((l) => ({ mes: l.mes, contratado: 0, provavel: 0 })), m0 = linhas[0].mes;
  const corre = (inicio, meses, m) => !!inicio && m >= inicio && (meses == null || m < somaMes(inicio, meses));
  for (const c of p.contratos) for (const l of linhas) {
    const v = (c.mensal && corre(c.inicio, c.meses, l.mes) ? c.mensal : 0) + (c.unicos || []).filter((u) => u.mes === l.mes).reduce((s, u) => s + u.valor, 0);
    if (c.certo) l.contratado += v; else l.provavel += v * c.peso;
  }
  for (const x of p.propostas) {
    const peso = x.estado === "ganha" ? 1 : x.estado === "perdida" ? 0 : x.probabilidade;
    const inicio = x.inicio_previsto && x.inicio_previsto >= m0 ? x.inicio_previsto : m0;
    let total = 0;
    for (const l of linhas) {
      const v = (x.setup && l.mes === inicio ? x.setup : 0) + (x.mensal && corre(inicio, x.meses ?? 12, l.mes) ? x.mensal : 0);
      if (x.estado === "ganha") l.contratado += v; else l.provavel += v * peso;
      total += v;
    }
    x.valor12 = r2(total); x.ponderado = r2(total * peso);
  }
  p.propostas.sort((a, b) => fechadaDemo(a) - fechadaDemo(b) || b.ponderado - a.ponderado || b.valor - a.valor);
  for (const l of linhas) { l.contratado = r2(l.contratado); l.provavel = r2(l.provavel); }
  p.meses = linhas;
  const abertas = p.propostas.filter((x) => !fechadaDemo(x));
  const contratado = r2(linhas.reduce((s, l) => s + l.contratado, 0)), provavel = r2(linhas.reduce((s, l) => s + l.provavel, 0));
  Object.assign(p.totais, { contratado, provavel, proximoMes: linhas[0].contratado, resultado: r2(contratado - p.custoMes * 12), abertas: abertas.length,
    valorAberto: r2(abertas.reduce((s, x) => s + x.valor, 0)), ponderadoAberto: r2(abertas.reduce((s, x) => s + x.ponderado, 0)) });
}
function marcarPropostaDemo({ id, estado }) {
  const d = NEG, p = d.previsao.propostas.find((x) => x.id === id);
  if (!p || !["ganha", "perdida", "reabrir"].includes(estado)) throw new Error("Pedido inválido.");
  const antes = p.estado;
  if (estado === "reabrir") { p.estado = p.estadoAntes || "proposta enviada"; delete p.estadoAntes; }
  else { if (!fechadaDemo(p)) p.estadoAntes = p.estado; p.estado = estado; }
  d.registo.unshift({ ts: Date.now(), numero: p.cliente, de: antes, para: p.estado, por: "painel" });
  refazerPrevisao(d.previsao);
  return { ok: true };
}

// ------------------------------------------------------------ the two areas: the company and the person's net worth, apart
const AREAS = ["empresa", "patrimonio"];
let area = "empresa";
try { if (AREAS.includes(localStorage.getItem("fa_demo_area"))) area = localStorage.getItem("fa_demo_area"); } catch (e) {}
function abrirArea(nome) {
  area = nome;
  try { localStorage.setItem("fa_demo_area", nome); } catch (e) {}
  for (const a of AREAS) { $("#a-" + a).setAttribute("aria-selected", String(a === nome)); $("#area-" + a).hidden = a !== nome; }
  if (nome === "patrimonio") desenharPatrimonio(); else if (dados) desenharGraficos();
}
for (const a of AREAS) $("#a-" + a).addEventListener("click", () => abrirArea(a));

// ------------------------------------------------------------ Património: what the person owns, valued where it can be
// (houses by INE's median €/m² of their parish, coins at CoinGecko's price every hour, shares at the last close); the rest
// is what the person says. Kept in this browser only.
const CHAVE = "fa_demo_patrimonio_v1";
const ANO = Number(NEG.hoje.slice(0, 4));
const PERIODO = window.DEMO.ine.periodo.replace("Trimestre", "trim.");
const INE = window.DEMO.ine.geo.map(([c, nome, e, n, t]) => ({ c, nome, e, n, t }));
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
const MOEDAS = new Map(window.DEMO.moedas.map((m) => [m.id, m]));
const ACOES = new Map(window.DEMO.acoes.map((a) => [a.t, a]));
const USD = window.DEMO.usdEur || 0.9;
const precos = { cripto: Object.fromEntries(window.DEMO.moedas.map((m) => [m.id, m.p])), criptoEm: null };
const fmtPreco = (p) => (p >= 1000 ? fmt(p) : p >= 1 ? dec2(p) : (Number(p) || 0).toLocaleString("pt-PT", { maximumFractionDigits: 4 }));
const compactoPat = (v) => (v >= 1e6 ? `${(v / 1e6).toLocaleString("pt-PT", { maximumFractionDigits: 2 })} M` : `${fmt(v / 1000)} mil`);
const fmtQtd = (q) => (Number(q) || 0).toLocaleString("pt-PT", { maximumFractionDigits: 8 });

const CLASSES = {
  imovel: { nome: "Imóveis", ico: "🏠", cor: "#3987e5" },
  empresa: { nome: "Empresa", ico: "🏢", cor: "#d2bef4" },
  acao: { nome: "Ações e ETF", ico: "📈", cor: "#199e70" },
  deposito: { nome: "Contas e depósitos", ico: "🏦", cor: "#4fb0c6" },
  cripto: { nome: "Cripto", ico: "₿", cor: "#fab219" },
  veiculo: { nome: "Veículos", ico: "🚗", cor: "#d95926" },
  outro: { nome: "Outros", ico: "💎", cor: "#c27ba0" },
};
// the example person (fictional): the owner of Construtora Exemplo
const EXEMPLO = {
  ativos: [
    { id: "a1", tipo: "imovel", nome: "Casa de família", morada: "Avenida da República, Avenidas Novas, Lisboa", concelho: "Lisboa", freguesia: "Avenidas Novas", tipologia: "T3", area: 130, estado: "e" },
    { id: "a2", tipo: "imovel", nome: "Apartamento arrendado", morada: "Rua do Bonfim, Bonfim, Porto", concelho: "Porto", freguesia: "Bonfim", tipologia: "T1", area: 58, estado: "e", renda: 950 },
    { id: "a3", tipo: "empresa", nome: "Construtora Exemplo, Lda", pct: 100, valor: 420000, metodo: "capital próprio no balanço de 2025", ligada: true, salarioMes: 4000, dividendos: 60000 },
    { id: "a4", tipo: "acao", ticker: "VWCE.DE", qtd: 180 },
    { id: "a5", tipo: "acao", ticker: "EDP.LS", qtd: 2500 },
    { id: "a6", tipo: "acao", ticker: "NVDA", qtd: 40 },
    { id: "a7", tipo: "deposito", nome: "Conta à ordem", banco: "Banco Exemplo", saldo: 18500 },
    { id: "a8", tipo: "deposito", nome: "Depósito a prazo (12 meses)", banco: "Banco Exemplo", saldo: 40000, taxa: 2.1 },
    { id: "a9", tipo: "deposito", nome: "PPR", banco: "Seguradora Exemplo", saldo: 26300 },
    { id: "a10", tipo: "cripto", moeda: "bitcoin", qtd: 0.35 },
    { id: "a11", tipo: "cripto", moeda: "ethereum", qtd: 3.2 },
    { id: "a12", tipo: "veiculo", nome: "BMW X3 xDrive30e", marca: "BMW", modelo: "X3 xDrive30e", ano: 2022, compra: 68000, valorManual: 41500,
      comparaveis: { n: 9, mediana: 41500, em: "2026-11-12" } },
    { id: "a13", tipo: "outro", nome: "Obras de arte", valor: 15000, nota: "avaliação de 2025" },
  ],
  dividas: [
    { id: "d1", nome: "Crédito habitação", banco: "Banco Exemplo", capital: 182400, prestacao: 1050, fim: 2047 },
    { id: "d2", nome: "Leasing automóvel", banco: "Banco Exemplo", capital: 21800, prestacao: 690, fim: 2028 },
  ],
};
function carregarEstado() {
  try { const j = JSON.parse(localStorage.getItem(CHAVE) || "null"); if (j && Array.isArray(j.ativos) && Array.isArray(j.dividas)) return j; } catch (e) {}
  return structuredClone(EXEMPLO);
}
let EST = carregarEstado();
const guardarEstado = () => { try { localStorage.setItem(CHAVE, JSON.stringify(EST)); } catch (e) {} };

// what an asset is worth, where that number comes from and the line under its name
function avaliar(a) {
  if (a.tipo === "imovel") {
    const r = ineDe(a.concelho, a.freguesia), g = r ? r.f || r.m : null;
    const m2 = g ? (a.estado === "n" ? g.n || g.t : g.e || g.t) : null;
    const est = m2 && a.area ? Math.round((a.area * m2) / 100) * 100 : null;
    const onde = g ? (g === r.f ? g.nome : `${g.nome}, todo o concelho`) : "";
    return { nome: a.nome || "Imóvel", valor: a.valorManual ?? est ?? 0, estimado: est,
      fonte: a.comparaveis && a.valorManual != null ? `${a.comparaveis.n} anúncios parecidos na zona (exemplo)${est ? ` · o INE dá ${eur0(est)}` : ""}`
        : a.valorManual != null ? `valor indicado por si${est ? ` · o INE dá ${eur0(est)}` : ""}`
        : g ? `INE, ${PERIODO}: ${fmt(m2)} €/m² (${onde}, ${a.estado === "n" ? "novos" : "usados"})` : "sem dados do INE para esta zona",
      detalhe: [a.tipologia, a.area ? `${a.area} m²` : "", [a.freguesia, a.concelho].filter(Boolean).join(", ")].filter(Boolean).join(" · ")
        + (a.renda ? ` · arrendado a ${eur0(a.renda)}/mês` : "") };
  }
  if (a.tipo === "veiculo") {
    const anos = Math.max(0, ANO - (Number(a.ano) || ANO));
    const est = a.compra ? Math.round((a.compra * Math.pow(0.85, anos)) / 100) * 100 : null;
    return { nome: a.nome || [a.marca, a.modelo].filter(Boolean).join(" ") || "Veículo", valor: a.valorManual ?? est ?? 0, estimado: est,
      fonte: a.comparaveis && a.valorManual != null ? `${a.comparaveis.n} anúncios de carros iguais (exemplo)`
        : a.valorManual != null ? "valor indicado por si" : `estimativa: ${eur0(a.compra)} na compra, menos 15% por ano`,
      detalhe: [a.ano, a.matricula].filter(Boolean).join(" · ") };
  }
  if (a.tipo === "cripto") {
    const m = MOEDAS.get(a.moeda), p = precos.cripto[a.moeda] || 0;
    return { nome: m ? m.n : a.moeda, valor: (Number(a.qtd) || 0) * p,
      fonte: `${precos.criptoEm ? `CoinGecko às ${hhmm(precos.criptoEm)}` : "preço de referência"}: ${fmtPreco(p)} € por ${m ? m.s : a.moeda}`,
      detalhe: `${fmtQtd(a.qtd)} ${m ? m.s : ""}` };
  }
  if (a.tipo === "acao") {
    const x = ACOES.get(a.ticker), fx = x && x.moeda === "USD" ? USD : 1, p = (x ? x.p : 0) * fx;
    return { nome: x ? x.n : a.ticker, valor: (Number(a.qtd) || 0) * p,
      fonte: x ? `fecho de ${dm(x.em.slice(0, 10))}: ${dec2(x.p)} ${x.moeda === "USD" ? "US$ (câmbio do BCE)" : "€"}` : "sem preço",
      detalhe: `${fmtQtd(a.qtd)} × ${a.ticker}` };
  }
  if (a.tipo === "deposito") return { nome: a.nome || "Conta", valor: Number(a.saldo) || 0,
    fonte: `saldo indicado por si${a.taxa ? ` · ${String(a.taxa).replace(".", ",")}% ao ano` : ""}`, detalhe: a.banco || "" };
  if (a.tipo === "empresa") return { nome: a.nome || "Empresa", valor: ((Number(a.valor) || 0) * (Number(a.pct) || 100)) / 100,
    fonte: `${a.pct || 100}% · ${a.metodo || "valor indicado por si"}`, detalhe: a.ligada ? "as contas dela estão na área Empresa" : "" };
  return { nome: a.nome || "Outro", valor: Number(a.valor) || 0, fonte: "valor indicado por si", detalhe: a.nota || "" };
}
function totais(s) {
  const linhas = s.ativos.map((a) => ({ a, ...avaliar(a) }));
  const ativos = linhas.reduce((t, l) => t + l.valor, 0), dividas = s.dividas.reduce((t, d) => t + (Number(d.capital) || 0), 0);
  const porClasse = Object.keys(CLASSES).map((k) => ({ k, valor: linhas.filter((l) => l.a.tipo === k).reduce((t, l) => t + l.valor, 0) })).filter((c) => c.valor > 0);
  const rendas = s.ativos.filter((a) => a.tipo === "imovel" && a.renda).reduce((t, a) => t + a.renda * 12, 0);
  const juros = s.ativos.filter((a) => a.tipo === "deposito" && a.taxa).reduce((t, a) => t + (a.saldo * a.taxa) / 100, 0);
  const dividendos = s.ativos.filter((a) => a.tipo === "empresa").reduce((t, a) => t + (Number(a.dividendos) || 0), 0);
  return { linhas, ativos, dividas, liquido: ativos - dividas, porClasse, rendas, juros, dividendos, rendimentos: rendas + juros + dividendos,
    prestacoes: s.dividas.reduce((t, d) => t + (Number(d.prestacao) || 0), 0) };
}

// ------------------------------------------------------------ drawing the area
function desenharPatrimonio() {
  const t = totais(EST);
  $("#pat-sub").textContent = `Atualizado às ${hhmm(Date.now())} · cripto ${precos.criptoEm ? `da CoinGecko às ${hhmm(precos.criptoEm)}` : "a preço de referência"} · imóveis pelo INE (${window.DEMO.ine.periodo})`;
  const nAtivos = EST.ativos.length;
  $("#pat-tiles").replaceChildren(
    tile("Património líquido", eur0(t.liquido), `${eur0(t.ativos)} em ativos − ${eur0(t.dividas)} de dívidas`, true),
    tile("Ativos", eur0(t.ativos), `${nAtivos} ${nAtivos === 1 ? "ativo" : "ativos"} em ${t.porClasse.length} ${t.porClasse.length === 1 ? "tipo" : "tipos"}`),
    tile("Dívidas", eur0(t.dividas), t.prestacoes ? `${eur0(t.prestacoes)} por mês em prestações` : "sem dívidas"),
    tile("Rendimentos do património", eur0(t.rendimentos), "por ano: " + [t.rendas ? `rendas ${eur0(t.rendas)}` : "", t.dividendos ? `dividendos ${eur0(t.dividendos)}` : "",
      t.juros ? `juros ${eur0(t.juros)}` : ""].filter(Boolean).join(" · ") || "sem rendimentos indicados"));
  desenharComposicao(t);
  desenharAtivos(t);
  desenharDividas();
  desenharEmpresa();
  grafPatrimonio(historico(t));
}
function desenharComposicao(t) {
  const caixa = $("#pat-comp");
  if (!t.ativos) return caixa.replaceChildren(el("p", { class: "sub", text: "Ainda não há ativos." }));
  const lista = [...t.porClasse].sort((a, b) => b.valor - a.valor);
  const pc = (v) => `${((v / t.ativos) * 100).toLocaleString("pt-PT", { maximumFractionDigits: 1 })}%`;
  caixa.replaceChildren(
    el("div", { class: "comp-barra", role: "img", "aria-label": "Composição dos ativos: " + lista.map((c) => `${CLASSES[c.k].nome} ${pc(c.valor)}`).join(", ") },
      lista.map((c) => el("span", { style: `width:${(c.valor / t.ativos) * 100}%;background:${CLASSES[c.k].cor}`, title: `${CLASSES[c.k].nome}: ${eur0(c.valor)} (${pc(c.valor)})` }))),
    el("div", { class: "comp-lista" }, lista.flatMap((c) => [el("i", { style: `background:${CLASSES[c.k].cor}`, "aria-hidden": "true" }),
      el("span", { text: CLASSES[c.k].nome }), el("span", { class: "v", text: eur0(c.valor) }), el("span", { class: "p", text: pc(c.valor) })])));
}
function desenharAtivos(t) {
  const grupos = Object.keys(CLASSES).map((k) => ({ k, linhas: t.linhas.filter((l) => l.a.tipo === k).sort((a, b) => b.valor - a.valor) })).filter((g) => g.linhas.length);
  if (!grupos.length) return $("#pat-ativos").replaceChildren(el("p", { class: "sub", text: "Ainda não há ativos: use «+ Adicionar»." }));
  $("#pat-ativos").replaceChildren(...grupos.map((g) => el("div", { class: "grupo" },
    el("div", { class: "grupo-cab" }, el("span", { text: CLASSES[g.k].nome }), el("b", { text: eur0(g.linhas.reduce((s, l) => s + l.valor, 0)) })),
    g.linhas.map((l) => el("div", { class: "ativo" },
      el("span", { class: "ico", "aria-hidden": "true", text: CLASSES[g.k].ico }),
      el("span", { class: "nome" }, el("b", { text: l.nome }), el("small", { text: l.detalhe })),
      el("span", { class: "fonte", text: l.fonte }),
      el("span", { class: "v" }, el("b", { text: eur0(l.valor) })),
      el("span", { class: "acoes" }, botaoIcone("✏️", `Editar ${l.nome}`, () => abrirForm(l.a.tipo, l.a)), botaoApagar(l.nome, () => apagar("ativos", l.a.id))))))));
}
function desenharDividas() {
  const caixa = $("#pat-dividas");
  if (!EST.dividas.length) return caixa.replaceChildren(el("p", { class: "sub", text: "Sem dívidas registadas." }));
  caixa.replaceChildren(...EST.dividas.map((d) => el("div", { class: "ativo divida" },
    el("span", { class: "ico", "aria-hidden": "true", text: "💳" }),
    el("span", { class: "nome" }, el("b", { text: d.nome }), el("small", { text: [d.banco, d.fim ? `até ${d.fim}` : ""].filter(Boolean).join(" · ") })),
    el("span", { class: "fonte", text: d.prestacao ? `${eur0(d.prestacao)} por mês` : "" }),
    el("span", { class: "v" }, el("b", { text: "−" + eur0(d.capital) })),
    el("span", { class: "acoes" }, botaoIcone("✏️", `Editar ${d.nome}`, () => abrirForm("divida", d)), botaoApagar(d.nome, () => apagar("dividas", d.id))))));
}
// the company in the person's net worth: its value and what it pays them; its accounts stay in the other area
function desenharEmpresa() {
  const emp = EST.ativos.find((a) => a.tipo === "empresa" && a.ligada);
  const caixa = $("#pat-empresa");
  if (!emp) return caixa.replaceChildren(el("p", { class: "sub", text: "Nenhuma empresa ligada a este património." }));
  const k = NEG.kpis, mesesAteHoje = Number(NEG.hoje.slice(5, 7));
  const salario = (emp.salarioMes || 0) * (mesesAteHoje + (mesesAteHoje >= 6 ? 1 : 0));        // with the June holiday bonus
  const linha = (rot, val, det) => el("tr", {}, el("td", {}, el("b", { text: rot }), det ? el("div", { class: "sub", text: det }) : null), el("td", { class: "n", text: val }));
  caixa.replaceChildren(el("table", {}, el("tbody", {},
    linha("Valor da sua participação", eur0(avaliar(emp).valor), `${emp.pct}% da ${emp.nome} · ${emp.metodo}`),
    linha(`O que a empresa lhe pagou em ${NEG.ano}`, eur0(salario + (emp.dividendos || 0)),
      `salário ${eur0(emp.salarioMes)}/mês (${eur0(salario)} até agora) + dividendos ${eur0(emp.dividendos || 0)}`),
    linha(`Faturado pela empresa em ${NEG.ano}`, eur0(k.faturado.base), "sem IVA · fica na área Empresa"),
    linha(`Saldo da empresa em ${NEG.ano}`, (k.resultado > 0 ? "+" : "") + eur0(k.resultado), "faturado menos despesas · não entra no património até ser distribuído"))),
    el("div", { class: "linha-btn", style: "margin-top:12px" }, el("button", { class: "btn peq", type: "button", text: "Abrir as contas da empresa →", onclick: () => abrirArea("empresa") })));
}
const botaoIcone = (ico, rot, fn) => el("button", { type: "button", title: rot, "aria-label": rot, text: ico, onclick: fn });
// removing asks once more on the same button, like «voltar a por receber» in the invoices
function botaoApagar(nome, fn) {
  const b = el("button", { type: "button", title: `Remover ${nome}`, "aria-label": `Remover ${nome}`, text: "✕" });
  b.addEventListener("click", () => {
    if (!b.dataset.certo) { b.dataset.certo = "1"; b.textContent = "✓?"; b.title = "Carregue outra vez para remover"; return setTimeout(() => { delete b.dataset.certo; b.textContent = "✕"; }, 4000); }
    fn();
  });
  return b;
}
function apagar(lista, id) {
  const x = EST[lista].find((y) => y.id === id);
  EST[lista] = EST[lista].filter((y) => y.id !== id);
  guardarEstado(); desenharPatrimonio();
  if (x) aviso(`Removido: ${avaliar(x).nome || x.nome}.`);
}

// ------------------------------------------------------------ the 12-month evolution (the months before today are
// demonstration data: each class walks back from today's value at its own pace; the product keeps a snapshot every day)
function historico(t) {
  const [a, m] = NEG.hoje.slice(0, 7).split("-").map(Number), meses = [];
  for (let i = 11; i >= 0; i--) { const x = a * 12 + m - 1 - i; meses.push(`${Math.floor(x / 12)}-${String((x % 12) + 1).padStart(2, "0")}`); }
  let semente = 11;
  const rnd = () => { semente = (semente * 16807) % 2147483647; return semente / 2147483647; };
  const ritmo = { imovel: 0.011, empresa: 0.004, acao: 0.007, deposito: 0.002, cripto: 0.015, veiculo: -0.0135, outro: 0 };
  const vol = { acao: 0.03, cripto: 0.1 };
  const serie = meses.map(() => ({ ativos: 0, dividas: 0 }));
  for (const c of t.porClasse) {
    let v = c.valor;
    for (let i = 11; i >= 0; i--) { serie[i].ativos += v; v /= 1 + (ritmo[c.k] || 0) + (vol[c.k] ? (rnd() - 0.5) * 2 * vol[c.k] : 0); }
  }
  let d = t.dividas;
  for (let i = 11; i >= 0; i--) { serie[i].dividas = d; d += t.prestacoes * 0.55; }
  return meses.map((mes, i) => ({ mes, ativos: serie[i].ativos, dividas: serie[i].dividas, liquido: serie[i].ativos - serie[i].dividas }));
}
function grafPatrimonio(h) {
  const box = $("#graf-pat");
  for (const s of box.querySelectorAll("svg")) s.remove();
  const W = Math.max(240, box.clientWidth || 240), H = 240, M = { t: 40, r: 12, b: 28, l: 58 };
  const pw = W - M.l - M.r, ph = H - M.t - M.b;
  const vals = h.map((p) => p.liquido), min0 = Math.min(...vals), max0 = Math.max(...vals);
  const passo = passoBonito((max0 - min0) / 3 || max0 / 4), base = Math.floor((min0 * 0.98) / passo) * passo, topo = Math.ceil(max0 / passo) * passo;
  const y = (v) => M.t + ph - ((v - base) / (topo - base || 1)) * ph;
  const x = (i) => M.l + (pw * i) / (h.length - 1);
  const svg = sv("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img",
    "aria-label": `Património líquido nos últimos 12 meses: de ${eur0(vals[0])} para ${eur0(vals.at(-1))}` });
  const defs = sv("defs", {}), grad = sv("linearGradient", { id: "grad-pat", x1: "0", x2: "0", y1: "0", y2: "1" });
  grad.append(sv("stop", { offset: "0%", "stop-color": "#d2bef4", "stop-opacity": "0.28" }), sv("stop", { offset: "100%", "stop-color": "#d2bef4", "stop-opacity": "0" }));
  defs.append(grad); svg.append(defs);
  for (let v = base; v <= topo + 1e-6; v += passo) {
    svg.append(sv("line", { x1: M.l, x2: W - M.r, y1: y(v), y2: y(v), class: v === base ? "base" : "grid" }));
    const tt = sv("text", { x: M.l - 8, y: y(v) + 4, class: "tick", "text-anchor": "end" }); tt.textContent = compactoPat(v); svg.append(tt);
  }
  const pts = h.map((p, i) => `${x(i)},${y(p.liquido)}`);
  svg.append(sv("path", { d: `M${x(0)},${y(base)}L${pts.join("L")}L${x(h.length - 1)},${y(base)}Z`, class: "area-pat" }));
  svg.append(sv("path", { d: `M${pts.join("L")}`, class: "linha-pat" }));
  const ult = h.at(-1);
  svg.append(sv("circle", { cx: x(h.length - 1), cy: y(ult.liquido), r: 5, class: "ponto-pat" }));
  const rot = sv("text", { x: x(h.length - 1), y: y(ult.liquido) - 12, class: "rot-valor", "text-anchor": "end" }); rot.textContent = eur0(ult.liquido); svg.append(rot);
  const banda = pw / (h.length - 1);
  h.forEach((p, i) => {
    if (i % 2 === h.length % 2 || i === h.length - 1) { const lb = sv("text", { x: x(i), y: H - 9, class: "tick", "text-anchor": i === h.length - 1 ? "end" : "middle" }); lb.textContent = MESES[Number(p.mes.slice(5)) - 1]; svg.append(lb); }
    const marca = sv("circle", { cx: x(i), cy: y(p.liquido), r: 4, class: "ponto-pat", style: "opacity:0" });
    svg.append(marca);
    const hit = sv("rect", { x: x(i) - banda / 2, y: M.t - 8, width: banda, height: ph + 8, class: "hit", tabindex: "0",
      "aria-label": `${nomeMes(p.mes)}: património líquido ${eur0(p.liquido)}` });
    const ver = () => { esconderTip(); marca.style.opacity = "1";
      mostrarTip($("#tip-pat"), box, nomeMes(p.mes) + (i === h.length - 1 ? " (hoje)" : ""), [["var(--accent)", p.liquido, "líquido"], ["var(--s1)", p.ativos, "ativos"], ["var(--serious)", p.dividas, "dívidas"]], x(i)); };
    const sair = () => { esconderTip(); marca.style.opacity = "0"; };
    hit.addEventListener("pointerenter", ver); hit.addEventListener("focus", ver);
    hit.addEventListener("pointerleave", sair); hit.addEventListener("blur", sair);
    svg.append(hit);
  });
  box.append(svg);
}

// ------------------------------------------------------------ adding and editing: a type, then its few fields; whatever can be
// looked up is (the address → parish, municipality and €/m²; the coin → its price), and a document can fill the form
const TIPOS = [
  ["imovel", "🏠", "Casa ou terreno", "pela morada"], ["veiculo", "🚗", "Veículo", "marca, modelo e ano"], ["cripto", "₿", "Cripto", "moeda e quantidade"],
  ["acao", "📈", "Ações e ETF", "ticker e quantidade"], ["deposito", "🏦", "Conta ou depósito", "saldo"], ["empresa", "🏢", "Empresa", "a sua participação"],
  ["outro", "💎", "Outros", "arte, ouro, relógios"], ["divida", "💳", "Crédito", "habitação, leasing"],
];
function abrirPainelNovo() {
  const p = $("#pat-adicionar");
  if (!p.classList.contains("oculto") && !p.dataset.edicao) { p.classList.add("oculto"); return; }
  delete p.dataset.edicao;
  p.classList.remove("oculto");
  p.replaceChildren(el("div", { class: "tipos", role: "group", "aria-label": "Que tipo de ativo quer adicionar?" },
    TIPOS.map(([k, ico, rot, det]) => el("button", { type: "button", "aria-pressed": "false", "data-tipo": k, onclick: (ev) => {
      for (const b of p.querySelectorAll(".tipos button")) b.setAttribute("aria-pressed", String(b === ev.currentTarget));
      mostrarForm(k, null);
    } }, el("span", { class: "ico", "aria-hidden": "true", text: ico }), el("b", { text: rot }), el("small", { text: det })))),
  el("div", { id: "pat-form" }));
}
function abrirForm(tipo, item) {
  const p = $("#pat-adicionar");
  p.dataset.edicao = "1";
  p.classList.remove("oculto");
  p.replaceChildren(el("div", { id: "pat-form" }));
  mostrarForm(tipo, item);
  p.scrollIntoView({ behavior: "smooth", block: "start" });
}
const campo = (rot, input, largo) => el("label", { class: "campo" + (largo ? " largo" : "") }, rot, input);
const entrada = (attrs) => el("input", { type: "text", ...attrs });
const numero = (valor, attrs = {}) => el("input", { type: "number", inputmode: "decimal", min: "0", step: "any", value: valor ?? "", ...attrs });
function escolha(opcoes, valor) {
  const s = el("select", {}, opcoes.map((o) => { const [v, t] = Array.isArray(o) ? o : [o, o]; return el("option", { value: v, text: t }); }));
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
  const caixa = el("div", { class: "comparaveis", "aria-live": "polite" });
  const botao = el("button", { class: "btn peq", type: "button", text: rotulo });
  botao.addEventListener("click", async () => {
    const c = calcular();
    if (c?.erro) { caixa.replaceChildren(el("span", { class: "sub", text: c.erro })); return; }
    botao.disabled = true; caixa.replaceChildren(el("span", { class: "sub", text: "A procurar anúncios parecidos…" }));
    await new Promise((r) => setTimeout(r, 1400));
    caixa.replaceChildren(el("div", {}, el("b", { text: `≈ ${eur0(c.mediana)}` }), ` · ${c.texto}`),
      el("div", { class: "sub", text: "Exemplo para a demonstração. No produto, esta pesquisa corre quando o ativo é adicionado e fica guardada para a zona e o tamanho: "
        + "quem vier a seguir recebe-a logo, e cada valor que os clientes corrigem afina a estimativa." }),
      el("div", { class: "linha-btn", style: "margin-top:8px" }, el("button", { class: "btn peq cheio", type: "button", text: "Usar este valor", onclick: () => aplicar(c) })));
    botao.disabled = false;
  });
  return { botao, caixa };
}

function mostrarForm(tipo, item) {
  const caixa = $("#pat-form");
  const a = item ? structuredClone(item) : {};
  const f = FORMS[tipo](a);
  const msgEl = el("div", { class: "sub", role: "status" });
  const guardar = el("button", { class: "btn peq cheio", type: "submit", text: item ? "Guardar" : "Adicionar" });
  const cancelar = el("button", { class: "ligar", type: "button", text: "cancelar", onclick: () => { $("#pat-adicionar").classList.add("oculto"); } });
  const form = el("form", { class: "form-ativo", novalidate: true }, el("h2", { text: item ? `Editar: ${tipo === "divida" ? a.nome : avaliar(a).nome}` : TIPOS.find((t) => t[0] === tipo)[2] }),
    f.corpo, el("div", { class: "linha-btn" }, guardar, cancelar, msgEl));
  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const r = f.ler();
    if (r.erro) { msgEl.textContent = r.erro; msgEl.style.color = "#f0a0a0"; return; }
    const lista = tipo === "divida" ? "dividas" : "ativos";
    const novo = { ...r.dados, id: item ? item.id : `${lista[0]}${Date.now().toString(36)}`, ...(tipo === "divida" ? {} : { tipo }) };
    EST[lista] = item ? EST[lista].map((x) => (x.id === item.id ? novo : x)) : [...EST[lista], novo];
    guardarEstado();
    $("#pat-adicionar").classList.add("oculto");
    if (tipo === "cripto") atualizarCripto([novo.moeda]);
    desenharPatrimonio();
    aviso(`${item ? "Guardado" : "Adicionado"}: ${tipo === "divida" ? novo.nome : avaliar(novo).nome} · ${eur0(tipo === "divida" ? novo.capital : avaliar(novo).valor)}`);
  });
  caixa.replaceChildren(form);
  f.depois?.();
}

const FORMS = {
  imovel(a) {
    const st = { concelho: a.concelho || "", freguesia: a.freguesia || "" };
    const morada = entrada({ value: a.morada || "", placeholder: "ex.: Avenida da República 50, Lisboa", autocomplete: "off" });
    const procurar = el("button", { class: "btn peq", type: "button", text: "Procurar" });
    const resultados = el("div", { class: "resultados" });
    const listaC = el("datalist", { id: "lista-concelhos" }, MUNICIPIOS.map((m) => el("option", { value: m.nome })));
    const listaF = el("datalist", { id: "lista-freguesias" });
    const concelho = entrada({ value: st.concelho, list: "lista-concelhos", placeholder: "ex.: Lisboa" });
    const freguesia = entrada({ value: st.freguesia, list: "lista-freguesias", placeholder: "ex.: Avenidas Novas" });
    const nome = entrada({ value: a.nome || "", placeholder: "ex.: Casa de família" });
    const tipologia = escolha(["T0", "T1", "T2", "T3", "T4", "T5+", "Moradia", "Loja ou escritório"], a.tipologia || "T2");
    const area = numero(a.area, { min: "5", step: "1", placeholder: "m²" });
    const estado = escolha([["e", "Usado"], ["n", "Novo"]], a.estado || "e");
    const renda = numero(a.renda, { step: "10", placeholder: "se estiver arrendado" });
    const manual = numero(a.valorManual, { step: "1000", placeholder: "vazio = estimativa do INE" });
    const est = el("div", { class: "estimativa", "aria-live": "polite" });
    const lido = el("div", { class: "lido", "aria-live": "polite" });
    const ficheiro = el("input", { type: "file", accept: ".pdf,image/*", class: "oculto", "aria-label": "Caderneta predial (PDF ou foto)" });
    const lerDoc = el("button", { class: "btn peq", type: "button", text: "📄 Ler a caderneta predial", onclick: () => ficheiro.click() });
    const preencherFreguesias = () => {
      const m = MUNICIPIOS.find((x) => norm(x.nome) === norm(concelho.value));
      listaF.replaceChildren(...(m ? FREGUESIAS.filter((x) => x.c.startsWith(m.c)).map((x) => el("option", { value: x.nome })) : []));
    };
    const atualizar = () => {
      const r = ineDe(concelho.value, freguesia.value), g = r ? r.f || r.m : null;
      const m2 = g ? (estado.value === "n" ? g.n || g.t : g.e || g.t) : null;
      const v = m2 && num(area) ? Math.round((num(area) * m2) / 100) * 100 : null;
      est.replaceChildren(...(v ? [el("b", { text: `≈ ${eur0(v)}` }), el("div", { text: `${num(area)} m² × ${fmt(m2)} €/m²: mediana das vendas de casas ${estado.value === "n" ? "novas" : "usadas"} nos últimos 12 meses `
        + (r.f ? `na freguesia de ${r.f.nome}` : `no concelho de ${r.m.nome}`) + ` (INE, ${window.DEMO.ine.periodo}).` })]
        : [el("span", { text: g ? "Indique a área para ver a estimativa." : concelho.value ? "Não há dados do INE para este concelho: indique o valor." : "Procure a morada (ou escolha o concelho): a freguesia, o concelho e o preço por m² da zona são preenchidos sozinhos." })]));
    };
    procurar.addEventListener("click", async () => {
      const q = morada.value.trim();
      if (q.length < 4) return;
      procurar.disabled = true; resultados.replaceChildren(el("span", { class: "sub", text: "A procurar…" }));
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=pt&limit=5&accept-language=pt&q=${encodeURIComponent(q)}`);
        if (!r.ok) throw new Error(`erro ${r.status}`);
        const lista = await r.json();
        if (!lista.length) { resultados.replaceChildren(el("span", { class: "sub", text: "Não encontrei esta morada: escreva-a de outra forma ou escolha o concelho abaixo." })); return; }
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
        resultados.replaceChildren(el("span", { class: "sub", text: "Não consegui procurar agora: escolha o concelho e a freguesia abaixo." }));
      } finally { procurar.disabled = false; }
    });
    morada.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); procurar.click(); } });
    ficheiro.addEventListener("change", async () => {
      if (!ficheiro.files.length) return;
      const nomeF = ficheiro.files[0].name;
      lerDoc.disabled = true; lerDoc.textContent = "A ler o documento…";
      await new Promise((r) => setTimeout(r, 1500));
      // demonstration: the file is not read nor sent anywhere; the product reads it with AI and fills in these fields
      morada.value = "Rua de Arroios, Arroios, Lisboa"; concelho.value = "Lisboa"; freguesia.value = "Arroios";
      tipologia.value = "T2"; area.value = 92; estado.value = "e"; if (!nome.value) nome.value = "Apartamento em Arroios";
      preencherFreguesias(); atualizar();
      lido.textContent = `✓ Lido de «${nomeF}»: artigo matricial U-0000, Arroios (Lisboa), T2, 92 m² de área bruta privativa. Na demonstração os dados são de exemplo e o ficheiro não sai do seu computador; no produto, a IA lê a caderneta, a escritura ou o contrato de arrendamento.`;
      lerDoc.disabled = false; lerDoc.textContent = "📄 Ler a caderneta predial"; ficheiro.value = "";
    });
    for (const i of [concelho, freguesia, area]) i.addEventListener("input", () => { if (i === concelho) preencherFreguesias(); atualizar(); });
    estado.addEventListener("change", atualizar);
    let compUsado = a.comparaveis || null;
    const comp = blocoComparaveis("🔎 Procurar casas parecidas à venda", () => {
      const r = ineDe(concelho.value, freguesia.value), g = r ? r.f || r.m : null, m2 = g ? (estado.value === "n" ? g.n || g.t : g.e || g.t) : null;
      if (!m2 || !num(area)) return { erro: "Indique primeiro a zona e a área." };
      const h = hashTxt(`${g.c}${tipologia.value}${num(area)}`), pedido = Math.round(m2 * (1.06 + (h % 9) / 100)), n = 6 + (h % 14);
      const mediana = Math.round((num(area) * pedido) / 1000) * 1000;
      return { n, mediana, texto: `${n} anúncios de ${tipologia.value} com ${Math.round(num(area) * 0.85)} a ${Math.round(num(area) * 1.15)} m² em ${r.f ? r.f.nome : r.m.nome}: `
        + `mediana do preço pedido ${fmt(pedido)} €/m², entre ${eur0(mediana * 0.9)} e ${eur0(mediana * 1.1)}. Os preços pedidos costumam ficar acima das vendas (INE: ${fmt(m2)} €/m²).` };
    }, (c) => {
      manual.value = c.mediana; compUsado = { n: c.n, mediana: c.mediana, em: NEG.hoje };
      comp.caixa.replaceChildren(el("span", { class: "lido", text: `✓ Fica ${eur0(c.mediana)}, pelos anúncios parecidos. Pode mudar o valor quando quiser.` }));
    });
    return {
      corpo: [el("div", { class: "linha-btn" }, lerDoc, el("span", { class: "sub", text: "ou escreva a morada:" })), ficheiro, lido,
        el("div", { class: "campos" }, campo("Morada", el("div", { class: "linha-btn" }, morada, procurar), true)), resultados,
        el("div", { class: "campos" }, campo("Concelho", concelho), campo("Freguesia", freguesia), campo("Nome", nome), campo("Tipologia", tipologia),
          campo("Área (m²)", area), campo("Estado", estado), campo("Renda por mês (€)", renda), campo("Valor que prefere usar (€)", manual)),
        listaC, listaF, est, el("div", { class: "linha-btn" }, comp.botao), comp.caixa],
      depois: () => { preencherFreguesias(); atualizar(); },
      ler: () => {
        if (!concelho.value.trim()) return { erro: "Falta o concelho (procure a morada ou escreva-o)." };
        if (!num(area) && num(manual) == null) return { erro: "Indique a área (ou o valor que prefere usar)." };
        return { dados: { nome: nome.value.trim() || `${tipologia.value} em ${freguesia.value || concelho.value}`, morada: morada.value.trim(), concelho: concelho.value.trim(),
          freguesia: freguesia.value.trim(), tipologia: tipologia.value, area: num(area), estado: estado.value, ...(num(renda) ? { renda: num(renda) } : {}),
          ...(num(manual) != null ? { valorManual: num(manual) } : {}), ...(compUsado && num(manual) === compUsado.mediana ? { comparaveis: compUsado } : {}) } };
      },
    };
  },
  veiculo(a) {
    const marca = entrada({ value: a.marca || "", placeholder: "ex.: Volkswagen" }), modelo = entrada({ value: a.modelo || "", placeholder: "ex.: Golf 1.5 TSI" });
    const ano = numero(a.ano, { min: "1950", max: String(ANO), step: "1", placeholder: String(ANO - 3) }), compra = numero(a.compra, { step: "100", placeholder: "preço de compra" });
    const matricula = entrada({ value: a.matricula || "", placeholder: "opcional" }), manual = numero(a.valorManual, { step: "100", placeholder: "vazio = estimativa" });
    const est = el("div", { class: "estimativa", "aria-live": "polite" }), lido = el("div", { class: "lido", "aria-live": "polite" });
    const ficheiro = el("input", { type: "file", accept: ".pdf,image/*", class: "oculto", "aria-label": "Documento único automóvel (PDF ou foto)" });
    const lerDoc = el("button", { class: "btn peq", type: "button", text: "📄 Ler o documento único", onclick: () => ficheiro.click() });
    const atualizar = () => {
      const anos = Math.max(0, ANO - (num(ano) || ANO)), v = num(compra) ? Math.round((num(compra) * Math.pow(0.85, anos)) / 100) * 100 : null;
      est.replaceChildren(...(v ? [el("b", { text: `≈ ${eur0(v)}` }), el("div", { text: `${eur0(num(compra))} na compra, menos 15% por ano (${anos} ${anos === 1 ? "ano" : "anos"}). No produto, pelo valor de anúncios de carros iguais.` })]
        : [el("span", { text: "Com o ano e o preço de compra mostramos uma estimativa do valor atual." })]));
    };
    ficheiro.addEventListener("change", async () => {
      if (!ficheiro.files.length) return;
      const nomeF = ficheiro.files[0].name;
      lerDoc.disabled = true; lerDoc.textContent = "A ler o documento…";
      await new Promise((r) => setTimeout(r, 1300));
      marca.value = "Volkswagen"; modelo.value = "Golf 1.5 TSI"; ano.value = 2021; matricula.value = "AA-00-AA"; if (!compra.value) compra.value = 29500;
      atualizar();
      lido.textContent = `✓ Lido de «${nomeF}»: marca, modelo, data da primeira matrícula e matrícula. Na demonstração os dados são de exemplo e o ficheiro não sai do seu computador.`;
      lerDoc.disabled = false; lerDoc.textContent = "📄 Ler o documento único"; ficheiro.value = "";
    });
    for (const i of [ano, compra]) i.addEventListener("input", atualizar);
    let compUsado = a.comparaveis || null;
    const comp = blocoComparaveis("🔎 Procurar carros iguais à venda", () => {
      if (!marca.value.trim() || !num(ano)) return { erro: "Indique primeiro a marca, o modelo e o ano." };
      if (!num(compra)) return { erro: "Na demonstração precisamos do preço de compra para o exemplo; no produto bastam a marca, o modelo, o ano e os quilómetros." };
      const anos = Math.max(0, ANO - num(ano)), h = hashTxt(`${marca.value}${modelo.value}${num(ano)}`), n = 5 + (h % 12);
      const mediana = Math.round((num(compra) * Math.pow(0.85, anos) * (1.02 + (h % 7) / 100)) / 100) * 100;
      return { n, mediana, texto: `${n} anúncios de ${marca.value.trim()} ${modelo.value.trim()} de ${num(ano)}: preços pedidos entre ${eur0(mediana * 0.88)} e ${eur0(mediana * 1.12)}, mediana ${eur0(mediana)}.` };
    }, (c) => {
      manual.value = c.mediana; compUsado = { n: c.n, mediana: c.mediana, em: NEG.hoje };
      comp.caixa.replaceChildren(el("span", { class: "lido", text: `✓ Fica ${eur0(c.mediana)}, pelos anúncios de carros iguais. Pode mudar o valor quando quiser.` }));
    });
    return {
      corpo: [el("div", { class: "linha-btn" }, lerDoc), ficheiro, lido,
        el("div", { class: "campos" }, campo("Marca", marca), campo("Modelo", modelo), campo("Ano", ano), campo("Preço de compra (€)", compra), campo("Matrícula", matricula),
          campo("Valor que prefere usar (€)", manual)), est, el("div", { class: "linha-btn" }, comp.botao), comp.caixa],
      depois: atualizar,
      ler: () => (!marca.value.trim() ? { erro: "Falta a marca." } : !num(compra) && num(manual) == null ? { erro: "Indique o preço de compra (ou o valor que prefere usar)." }
        : { dados: { nome: `${marca.value.trim()} ${modelo.value.trim()}`.trim(), marca: marca.value.trim(), modelo: modelo.value.trim(), ano: num(ano) || ANO,
          compra: num(compra), ...(matricula.value.trim() ? { matricula: matricula.value.trim().toUpperCase() } : {}), ...(num(manual) != null ? { valorManual: num(manual) } : {}),
          ...(compUsado && num(manual) === compUsado.mediana ? { comparaveis: compUsado } : {}) } }),
    };
  },
  cripto(a) {
    const moeda = escolha([...MOEDAS.values()].map((m) => [m.id, `${m.n} (${m.s})`]), a.moeda || "bitcoin");
    const qtd = numero(a.qtd, { placeholder: "ex.: 0,25" });
    const est = el("div", { class: "estimativa", "aria-live": "polite" });
    const atualizar = () => {
      const m = MOEDAS.get(moeda.value), p = precos.cripto[moeda.value] || 0;
      est.replaceChildren(...(num(qtd) ? [el("b", { text: eur0(num(qtd) * p) }), el("div", { text: `${fmtQtd(num(qtd))} ${m.s} × ${fmtPreco(p)} € (${precos.criptoEm ? `CoinGecko às ${hhmm(precos.criptoEm)}` : "preço de referência"}). O preço atualiza-se de hora a hora.` })]
        : [el("span", { text: `1 ${m.s} = ${fmtPreco(p)} €. Indique a quantidade.` })]));
    };
    moeda.addEventListener("change", () => { atualizar(); atualizarCripto([moeda.value]).then(atualizar); });
    qtd.addEventListener("input", atualizar);
    return { corpo: [el("div", { class: "campos" }, campo("Moeda", moeda), campo("Quantidade", qtd)), est], depois: atualizar,
      ler: () => (num(qtd) > 0 ? { dados: { moeda: moeda.value, qtd: num(qtd) } } : { erro: "Indique a quantidade." }) };
  },
  acao(a) {
    const grupos = [["Portugal", (x) => x.t.endsWith(".LS")], ["Estados Unidos", (x) => !x.t.includes(".")], ["ETF", (x) => /^(VWCE|IWDA|CSPX|EUNL|VUSA)/.test(x.t)],
      ["Europa", (x) => /\.(AS|DE|PA)$/.test(x.t) && !/^(VWCE|IWDA|CSPX|EUNL|VUSA)/.test(x.t)]];
    const ticker = el("select", {}, grupos.map(([rot, f]) => el("optgroup", { label: rot }, [...ACOES.values()].filter(f).map((x) => el("option", { value: x.t, text: `${x.n} · ${x.t}` })))));
    ticker.value = a.ticker || "VWCE.DE";
    const qtd = numero(a.qtd, { placeholder: "ex.: 50" });
    const est = el("div", { class: "estimativa", "aria-live": "polite" });
    const atualizar = () => {
      const x = ACOES.get(ticker.value), p = x.p * (x.moeda === "USD" ? USD : 1);
      est.replaceChildren(...(num(qtd) ? [el("b", { text: eur0(num(qtd) * p) }), el("div", { text: `${fmtQtd(num(qtd))} × ${dec2(x.p)} ${x.moeda === "USD" ? "US$" : "€"} (fecho de ${dm(x.em.slice(0, 10))}${x.moeda === "USD" ? ", em euros ao câmbio do BCE" : ""}). No produto, de hora a hora.` })]
        : [el("span", { text: `Fecho de ${dm(x.em.slice(0, 10))}: ${dec2(x.p)} ${x.moeda === "USD" ? "US$" : "€"}. Indique a quantidade.` })]));
    };
    ticker.addEventListener("change", atualizar); qtd.addEventListener("input", atualizar);
    return { corpo: [el("div", { class: "campos" }, campo("Ação ou ETF", ticker), campo("Quantidade", qtd)), est], depois: atualizar,
      ler: () => (num(qtd) > 0 ? { dados: { ticker: ticker.value, qtd: num(qtd) } } : { erro: "Indique a quantidade." }) };
  },
  deposito(a) {
    const nome = escolha(["Conta à ordem", "Depósito a prazo", "PPR", "Certificados de Aforro", "Certificados do Tesouro", "Outra conta"], a.nome || "Conta à ordem");
    const banco = entrada({ value: a.banco || "", placeholder: "ex.: Banco Exemplo" }), saldo = numero(a.saldo, { step: "100" }), taxa = numero(a.taxa, { step: "0.05", placeholder: "opcional" });
    return { corpo: [el("div", { class: "campos" }, campo("Tipo", nome), campo("Banco", banco), campo("Saldo (€)", saldo), campo("Taxa anual (%)", taxa)),
      el("p", { class: "sub", text: "No produto, os saldos podem vir sozinhos do banco (open banking, com a sua autorização)." })],
      ler: () => (num(saldo) == null ? { erro: "Indique o saldo." } : { dados: { nome: nome.value, banco: banco.value.trim(), saldo: num(saldo), ...(num(taxa) ? { taxa: num(taxa) } : {}) } }) };
  },
  empresa(a) {
    const nome = entrada({ value: a.nome || "", placeholder: "ex.: Construtora Exemplo, Lda" }), pct = numero(a.pct ?? 100, { max: "100", step: "1" });
    const valor = numero(a.valor, { step: "1000" }), metodo = escolha(["capital próprio no balanço de 2025", "avaliação independente", "valor indicado por si"], a.metodo || "capital próprio no balanço de 2025");
    const dividendos = numero(a.dividendos, { step: "1000", placeholder: "por ano" });
    return { corpo: [el("div", { class: "campos" }, campo("Empresa", nome), campo("A sua parte (%)", pct), campo("Valor da empresa (€)", valor), campo("Como se chegou ao valor", metodo),
      campo("Dividendos por ano (€)", dividendos)), el("p", { class: "sub", text: "A empresa entra no património só por este valor e pelo que lhe paga; as contas dela ficam na área Empresa." })],
      ler: () => (!nome.value.trim() || num(valor) == null ? { erro: "Indique a empresa e o valor." }
        : { dados: { ...a, nome: nome.value.trim(), pct: num(pct) || 100, valor: num(valor), metodo: metodo.value, ...(num(dividendos) ? { dividendos: num(dividendos) } : {}) } }) };
  },
  outro(a) {
    const nome = entrada({ value: a.nome || "", placeholder: "ex.: Relógio, ouro, coleção" }), valor = numero(a.valor, { step: "100" }), nota = entrada({ value: a.nota || "", placeholder: "ex.: avaliação de 2025" });
    return { corpo: [el("div", { class: "campos" }, campo("O quê", nome), campo("Valor (€)", valor), campo("Nota", nota))],
      ler: () => (!nome.value.trim() || num(valor) == null ? { erro: "Indique o quê e o valor." } : { dados: { nome: nome.value.trim(), valor: num(valor), ...(nota.value.trim() ? { nota: nota.value.trim() } : {}) } }) };
  },
  divida(a) {
    const nome = escolha(["Crédito habitação", "Crédito pessoal", "Leasing automóvel", "Cartão de crédito", "Outra dívida"], a.nome || "Crédito habitação");
    const banco = entrada({ value: a.banco || "", placeholder: "ex.: Banco Exemplo" }), capital = numero(a.capital, { step: "100" });
    const prestacao = numero(a.prestacao, { step: "10" }), fim = numero(a.fim, { min: String(ANO), step: "1", placeholder: "ano" });
    return { corpo: [el("div", { class: "campos" }, campo("Tipo", nome), campo("Banco", banco), campo("Capital em dívida (€)", capital), campo("Prestação por mês (€)", prestacao), campo("Termina em", fim))],
      ler: () => (num(capital) == null ? { erro: "Indique o capital em dívida." }
        : { dados: { nome: nome.value, banco: banco.value.trim(), capital: num(capital), ...(num(prestacao) ? { prestacao: num(prestacao) } : {}), ...(num(fim) ? { fim: num(fim) } : {}) } }) };
  },
};

// ------------------------------------------------------------ live coin prices: CoinGecko, now and every hour
async function atualizarCripto(extra = []) {
  const ids = [...new Set([...EST.ativos.filter((a) => a.tipo === "cripto").map((a) => a.moeda), ...extra])].filter((id) => MOEDAS.has(id));
  if (!ids.length) return false;
  try {
    const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=eur`);
    if (!r.ok) throw new Error(`CoinGecko ${r.status}`);
    const j = await r.json();
    for (const id of ids) if (j[id]?.eur) precos.cripto[id] = j[id].eur;
    precos.criptoEm = Date.now();
  } catch (e) { console.warn(e); return false; }
  if (area === "patrimonio" && $("#pat-adicionar").classList.contains("oculto")) desenharPatrimonio();
  return true;
}
setInterval(() => atualizarCripto(), 3600e3);

$("#pat-novo").addEventListener("click", abrirPainelNovo);
$("#pat-precos").addEventListener("click", async (ev) => {
  const b = ev.currentTarget; b.disabled = true;
  const ok = await atualizarCripto();
  aviso(ok ? `Preços da cripto atualizados às ${hhmm(precos.criptoEm)} (CoinGecko).` : "Não consegui falar com a CoinGecko: ficam os preços de referência.");
  desenharPatrimonio();
  b.disabled = false;
});
$("#pat-repor").addEventListener("click", () => { EST = structuredClone(EXEMPLO); guardarEstado(); $("#pat-adicionar").classList.add("oculto"); desenharPatrimonio(); aviso("Exemplo reposto."); });
let redimPat = null;
window.addEventListener("resize", () => { clearTimeout(redimPat); redimPat = setTimeout(() => { if (area === "patrimonio") grafPatrimonio(historico(totais(EST))); }, 150); });
document.addEventListener("DOMContentLoaded", () => { abrirArea(area); atualizarCripto(); });
