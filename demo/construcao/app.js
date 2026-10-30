// Febrero AI · Camada IA para construtoras: demonstração interativa com dados fictícios (Construtora Exemplo).
// Tudo é simulado neste browser: nada é enviado, nada é guardado num servidor.
"use strict";
const D = window.DADOS;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const soma = (xs) => xs.reduce((a, b) => a + b, 0);
const obra = (id) => D.obras.find((o) => o.id === id);
const projeto = (id) => D.projetos.find((p) => p.id === id);

// números à portuguesa: 143.787 € / 4,6 m²
function fmt(n, dec = 0) {
  const [i, d] = Math.abs(n).toFixed(dec).split(".");
  return (n < 0 && Math.abs(n) >= 0.5 * Math.pow(10, -dec) ? "−" : "") + i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (d ? "," + d : "");
}
const eur = (n, dec = 0) => fmt(n, dec) + " €";
const milEur = (n) => (n >= 1e6 ? fmt(n / 1e6, 2) + " M€" : fmt(n / 1000, 0) + " mil €");
const pct = (v, dec = 1) => (v > 0 ? "+" : v < 0 ? "−" : "") + fmt(Math.abs(v), dec) + "%";
const dataPT = (d) => d.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
const horaAgora = () => new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------- ícones (traço, 24×24) ----------
const ICONES = {
  capacete: '<path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1z"/><path d="M4 16v-2a8 8 0 0 1 16 0v2"/><path d="M10 6.3V4h4v2.3"/><path d="M14 6.6 13 12M10 6.6l1 5.4"/>',
  painel: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  caixa: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  planta: '<rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M3 10h7v11"/><path d="M14 3v8h7"/><path d="M14 15h3"/>',
  grua: '<path d="M6 21V3l14 3H6"/><path d="M6 3 3 6h3"/><path d="M17 6v4"/><path d="M15.5 10h3v2.5h-3z"/><path d="M3 21h7"/><path d="m6 9 2-3M6 13l2-4M6 17l2-4"/>',
  regua: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2"/>',
  fatura: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  brilho: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
  camadas: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
  sino: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  procurar: '<circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/>',
  enviar: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  "enviar-ficheiro": '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  certo: '<path d="M20 6 9 17l-5-5"/>',
  cruz: '<path d="M18 6 6 18M6 6l12 12"/>',
  calendario: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  alerta: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>',
  email: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  ficheiro: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
  folha: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
  descarregar: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  play: '<path d="M7 4v16l13-8z" fill="currentColor" stroke="none"/>',
  escudo: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
  relogio: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  editar: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  tarefa: '<rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4M13 6h8M13 12h8M13 18h8"/>',
  predio: '<rect x="4" y="2" width="16" height="20" rx="1.5"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
  ue: '<circle cx="12" cy="12" r="10"/><path d="M12 6v.01M16.2 7.8v.01M18 12v.01M16.2 16.2v.01M12 18v.01M7.8 16.2v.01M6 12v.01M7.8 7.8v.01"/>',
};
function icone(nome, cls = "w-[18px] h-[18px]") {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[nome] || ""}</svg>`;
}
function pintarIcones(raiz = document) {
  $$("[data-icone]", raiz).forEach((el) => { if (!el.dataset.feito) { el.innerHTML = icone(el.dataset.icone); el.dataset.feito = "1"; el.classList.add("inline-flex"); } });
}

// ---------- pequenas animações ----------
function toast(msg, ms = 3600) {
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<i></i><span>${msg}</span>`;
  $("#toasts").appendChild(t);
  setTimeout(() => { t.style.transition = "opacity .4s, transform .4s"; t.style.opacity = "0"; t.style.transform = "translateY(6px)"; setTimeout(() => t.remove(), 450); }, ms);
}
async function escrever(el, texto, vel = 10, passo = 2) {
  el.classList.add("cursor");
  el.textContent = "";
  for (let i = 0; i < texto.length; i += passo) {
    el.textContent = texto.slice(0, i + passo);
    await esperar(vel);
  }
  el.classList.remove("cursor");
}
function contar(el, alvo, { dur = 1100, dec = 0, sufixo = "", euro = false, de = 0 } = {}) {
  if (!el) return;
  const ini = performance.now();
  const passo = (t) => {
    const p = Math.min(1, (t - ini) / dur), e = 1 - Math.pow(1 - p, 3), v = de + (alvo - de) * e;
    el.textContent = (euro ? eur(v, dec) : fmt(v, dec)) + sufixo;
    if (p < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}
function rolarPara(el, margem = 90) {
  if (!el) return;
  const p = $("#principal");
  p.scrollTo({ top: el.getBoundingClientRect().top - p.getBoundingClientRect().top + p.scrollTop - margem, behavior: "smooth" });
}
const caixaInfo = (k, v, extra = "") => `<div class="rounded-xl bg-[#faf6f1] border border-[#f0e6da] px-3 py-2 ${extra}">
  <div class="text-[10.5px] text-[#a08b7a] font-semibold uppercase tracking-wide">${k}</div><div class="text-sm font-semibold mt-0.5">${v}</div></div>`;
const notaIA = (html, extra = "") => `<div class="flex gap-2 text-sm rounded-xl bg-[#fbf3ea] border border-[#f0dcc6] p-3 ${extra}">${icone("brilho", "w-4 h-4 text-[#c47a3c] mt-0.5 flex-none")}<span>${html}</span></div>`;

// ---------- navegação ----------
const VISTAS = {
  painel: ["Painel", ""],
  pedidos: ["Pedidos de orçamento", "Passo 1 · email e WhatsApp numa só caixa"],
  planta: ["Planta → Orçamento", "Passo 3 · medições e orçamento a partir das plantas"],
  obras: ["Obras", "Passos 5 e 6 · licenciamento, planeamento, custos e fiscalização"],
  autos: ["Autos de medição", "Passo 7 · das folhas de obra ao auto de cada cliente"],
  faturas: ["Faturas de fornecedores", "Passo 7 · conferidas com a encomenda e as guias de remessa"],
  assistente: ["Assistente", "Pergunte à empresa, ou responda aos clientes a qualquer hora"],
  como: ["Como funciona", "Por cima dos sistemas que já usam"],
};
const iniciadas = {};
function mostrar(v) {
  if (!VISTAS[v]) v = "painel";
  $$(".vista").forEach((s) => s.classList.add("hidden"));
  const s = $("#v-" + v);
  s.classList.remove("hidden", "vista");
  void s.offsetWidth;
  s.classList.add("vista");
  $$("[data-vista]").forEach((n) => n.classList.toggle("ativo", n.dataset.vista === v));
  $$("#nav-movel button").forEach((n) => n.classList.toggle("btn-escuro", n.dataset.v === v));
  $("#titulo").textContent = VISTAS[v][0];
  $("#subtitulo").textContent = VISTAS[v][1] || hojeTexto();
  $("#principal").scrollTo({ top: 0 });
  if (!iniciadas[v]) { iniciadas[v] = true; INICIAR[v]?.(); }
  history.replaceState(null, "", "#" + v);
}
function hojeTexto() {
  const t = new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" });
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// ---------- gráficos ----------
function estiloGraficos() {
  if (!window.Chart) return false;
  Chart.defaults.font.family = "Inter, system-ui, sans-serif";
  Chart.defaults.color = "#7b6a5d";
  Chart.defaults.plugins.tooltip.backgroundColor = "#1d1511";
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 10;
  return true;
}

// ================= PLANTAS: MEDIÇÕES E DESENHO =================
// as plantas são desenhadas aqui, em SVG, a partir das divisões de dados.js: as caixas da «leitura» batem certo com o desenho
const PD = 2.7, HP = 3.0, TI = 0.15, ESC = 20;   // pé-direito, altura entre pisos, parede interior (m), unidades SVG por metro
const div = (d) => ({ nome: d[0], x0: d[1], y0: d[2], x1: d[3], y1: d[4], ...(d[5] || {}) });
// retângulo útil: recua a parede exterior nos lados do contorno e meia parede interior nos outros
function util(d, f, te) {
  const r = (v, lim) => (Math.abs(v - lim) < 1e-6 ? te : TI / 2);
  return { x0: d.x0 + r(d.x0, 0), y0: d.y0 + r(d.y0, 0), x1: d.x1 - r(d.x1, f.W), y1: d.y1 - r(d.y1, f.H) };
}
const cacheMed = {};
// as medições saem do desenho: áreas úteis, paredes, vãos, zonas húmidas, exteriores
function medir(p) {
  if (cacheMed[p.id]) return cacheMed[p.id];
  const te = p.te || 0.3, lados = p.fachadas || ["N", "S", "E", "O"];
  const M = { bruta: 0, util: 0, ext: 0, imp: 0, pisos: 0, fachada: 0, parExt: 0, parInt: 0, nJan: 0, areaJan: 0, nPortaExt: 0, nPortaInt: 0,
    nWC: 0, nCoz: 0, nQuartos: 0, molhadas: 0, piscina: 0, terraco: 0, varanda: 0, alpendre: 0, divisoes: [] };
  for (const f of p.pisos) {
    const rep = f.rep || 1, comp = { N: f.W, S: f.W, E: f.H, O: f.H }, perim = soma(lados.map((l) => comp[l]));
    M.pisos += rep; M.bruta += f.W * f.H * rep; M.imp = Math.max(M.imp, f.W * f.H);
    let eixos = 0;
    for (const d0 of f.divisoes) {
      const d = div(d0), u = util(d, f, te), lw = u.x1 - u.x0, lh = u.y1 - u.y0, a = lw * lh;
      eixos += 2 * (d.x1 - d.x0 + d.y1 - d.y0);
      M.util += a * rep;
      if (/banho|WC/i.test(d.nome)) { M.nWC += rep; M.molhadas += 2 * (lw + lh) * 2.4 * rep; }
      else if (/Cozinha|Lavandaria/.test(d.nome)) { M.molhadas += 2 * (lw + lh) * 1.2 * rep; if (/Cozinha/.test(d.nome)) M.nCoz += rep; }
      if (/Quarto|Suite/.test(d.nome)) M.nQuartos += rep;
      M.divisoes.push({ ...d, area: a, piso: f.nome, rep });
    }
    const abertos = soma(f.portas.filter((q) => q[4] === 0).map((q) => q[3]));
    M.parInt += Math.max(0, (eixos - 2 * (f.W + f.H)) / 2 - abertos) * PD * rep;
    M.nPortaInt += f.portas.filter((q) => q[4] !== 0).length * rep;
    let aV = 0;
    for (const [, , w, t] of f.vaos) {
      if (t === "p") { M.nPortaExt += 1; aV += w * 2.2; }          // a porta de entrada conta uma vez
      else { const h = w >= 2.4 ? 2.2 : 1.3; M.nJan += rep; M.areaJan += w * h * rep; aV += w * h * rep; }
    }
    M.fachada += perim * HP * rep;
    M.parExt += Math.max(0, perim * HP * rep - aV);
    for (const [, x0, y0, x1, y1, tipo] of f.exteriores || []) { const a = (x1 - x0) * (y1 - y0); M.ext += a * rep; M[tipo] += a * rep; }
  }
  return (cacheMed[p.id] = M);
}

// desenho: devolve o SVG, a caixa de visualização (m) e as caixas das divisões para a leitura animada
function desenharPlanta(p, { mini = false } = {}) {
  const te = p.te || 0.3, S = (v) => +(v * ESC).toFixed(2);
  let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
  const alarga = (a, b, c, d) => { bx0 = Math.min(bx0, a); by0 = Math.min(by0, b); bx1 = Math.max(bx1, c); by1 = Math.max(by1, d); };
  for (const f of p.pisos) { alarga(f.ox, f.oy, f.ox + f.W, f.oy + f.H); for (const e of f.exteriores || []) alarga(f.ox + e[1], f.oy + e[2], f.ox + e[3], f.oy + e[4]); }
  const mg = mini ? [0.6, 0.6, 0.6, 0.6] : [1.5, 2.3, 0.7, 0.8];
  const vb = { x: bx0 - mg[0], y: by0 - mg[1], w: bx1 - bx0 + mg[0] + mg[2], h: by1 - by0 + mg[1] + mg[3] };
  const caixas = [], exteriores = [];
  let s = "", txt = "";
  for (const f of p.pisos) {
    const X = (v) => S(f.ox + v), Y = (v) => S(f.oy + v), rep = f.rep || 1;
    for (const [nome, x0, y0, x1, y1, tipo] of f.exteriores || []) {
      s += `<rect class="${tipo === "piscina" ? "pl-piscina" : "pl-exterior"}" x="${X(x0)}" y="${Y(y0)}" width="${S(x1 - x0)}" height="${S(y1 - y0)}" rx="${tipo === "piscina" ? 4 : 0}"/>`;
      if (tipo === "piscina") s += `<rect class="pl-fino" x="${X(x0 + 0.3)}" y="${Y(y0 + 0.3)}" width="${S(x1 - x0 - 0.6)}" height="${S(y1 - y0 - 0.6)}" rx="3"/>`;
      const box = { nome, area: (x1 - x0) * (y1 - y0), exterior: true, x: f.ox + x0, y: f.oy + y0, w: x1 - x0, h: y1 - y0, piso: f.nome, g: "Exteriores", rep };
      exteriores.push(box);
      if (!mini) txt += rotuloSVG(box, S, true);
    }
    s += `<rect class="pl-parede" x="${X(0)}" y="${Y(0)}" width="${S(f.W)}" height="${S(f.H)}"/>`;
    for (const d0 of f.divisoes) {
      const d = div(d0), u = util(d, f, te);
      s += `<rect class="pl-divisao" x="${X(u.x0)}" y="${Y(u.y0)}" width="${S(u.x1 - u.x0)}" height="${S(u.y1 - u.y0)}"/>`;
      if (d.escada && !mini) s += escadaSVG(u, X, Y, S);
      const box = { nome: d.nome, area: (u.x1 - u.x0) * (u.y1 - u.y0), x: f.ox + u.x0, y: f.oy + u.y0, w: u.x1 - u.x0, h: u.y1 - u.y0, piso: f.nome, g: d.g || f.nome, rep };
      caixas.push(box);
      if (!mini) txt += rotuloSVG(box, S, false);
    }
    if (f.elevador) {
      const [a, b, c, d] = f.elevador;
      s += `<rect class="pl-elev" x="${X(a)}" y="${Y(b)}" width="${S(c - a)}" height="${S(d - b)}"/><path class="pl-fino" d="M${X(a)} ${Y(b)}L${X(c)} ${Y(d)}M${X(c)} ${Y(b)}L${X(a)} ${Y(d)}"/>`;
    }
    for (const v of f.vaos) s += vaoSVG(v, f, te, X, Y, S, mini);
    for (const q of f.portas) s += portaSVG(q, X, Y, S, mini);
    if (!mini) txt += cotasSVG(f, X, Y, S);
  }
  caixas.push(...exteriores);
  const svg = `<svg viewBox="${S(vb.x)} ${S(vb.y)} ${S(vb.w)} ${S(vb.h)}" class="planta-svg" role="img" aria-label="Planta: ${esc(p.nome)}" style="aspect-ratio:${vb.w} / ${vb.h}">${s}${txt}</svg>`;
  return { svg, vb, caixas };
}
function rotuloSVG(b, S, exterior) {
  const cx = S(b.x + b.w / 2), cy = S(b.y + b.h / 2);
  let fs = Math.min(b.w, b.h) < 2 ? 0.27 : 0.34, rodar = false;
  const cabe = (larg) => 0.56 * fs * b.nome.length <= larg - 0.2;
  if (!cabe(b.w)) { if (b.h > b.w * 1.3 && cabe(b.h)) rodar = true; else fs = Math.max(0.17, (b.w - 0.2) / (0.56 * b.nome.length)); }
  const t = rodar ? ` transform="rotate(-90 ${cx} ${cy})"` : "";
  return `<g${t} class="${exterior ? "pl-rot-ext" : "pl-rot"}"><text x="${cx}" y="${cy - S(fs) * 0.15}" font-size="${S(fs)}" class="pl-nome">${esc(b.nome)}</text>
    <text x="${cx}" y="${cy + S(fs) * 1.05}" font-size="${S(fs * 0.86)}" class="pl-area">${fmt(b.area, 2)} m²</text></g>`;
}
function escadaSVG(u, X, Y, S) {
  const w = u.x1 - u.x0, h = u.y1 - u.y0, hor = w >= h, L = hor ? w : h, C = hor ? h : w, pat = Math.min(1.1, L * 0.3);
  let d = "";
  for (let t = 0.28; t < L - pat; t += 0.28) d += hor ? `M${X(u.x0 + t)} ${Y(u.y0)}V${Y(u.y1)}` : `M${X(u.x0)} ${Y(u.y0 + t)}H${X(u.x1)}`;
  const meio = hor ? `M${X(u.x0)} ${Y(u.y0 + C / 2)}H${X(u.x1 - pat)}` : `M${X(u.x0 + C / 2)} ${Y(u.y0)}V${Y(u.y1 - pat)}`;
  const seta = hor ? `M${X(u.x0 + 0.2)} ${Y(u.y0 + C * 0.25)}H${X(u.x1 - pat * 0.5)}V${Y(u.y0 + C * 0.75)}H${X(u.x0 + 0.5)}`
    : `M${X(u.x0 + C * 0.25)} ${Y(u.y0 + 0.2)}V${Y(u.y1 - pat * 0.5)}H${X(u.x0 + C * 0.75)}V${Y(u.y0 + 0.5)}`;
  return `<path class="pl-degrau" d="${d}"/><path class="pl-fino" d="${meio}"/><path class="pl-seta" d="${seta}"/>`;
}
function vaoSVG([lado, ini, w, t], f, te, X, Y, S, mini) {
  const r = { N: [ini, 0, w, te], S: [ini, f.H - te, w, te], O: [0, ini, te, w], E: [f.W - te, ini, te, w] }[lado];
  const [rx, ry, rw, rh] = r, hor = lado === "N" || lado === "S";
  let s = `<rect class="pl-vao" x="${X(rx)}" y="${Y(ry)}" width="${S(rw)}" height="${S(rh)}"/>`;
  if (mini) return s;
  if (t === "p") {
    const g = { N: [[ini, te], [ini, te + w], [ini + w, te], 0], S: [[ini, f.H - te], [ini, f.H - te - w], [ini + w, f.H - te], 1],
      O: [[te, ini], [te + w, ini], [te, ini + w], 1], E: [[f.W - te, ini], [f.W - te - w, ini], [f.W - te, ini + w], 0] }[lado];
    const [h, a, b, sw] = g;
    return s + `<path class="pl-porta" d="M${X(h[0])} ${Y(h[1])}L${X(a[0])} ${Y(a[1])}"/><path class="pl-fino" d="M${X(a[0])} ${Y(a[1])}A${S(w)} ${S(w)} 0 0 ${sw} ${X(b[0])} ${Y(b[1])}"/>`;
  }
  const l = (k) => (hor ? `M${X(rx)} ${Y(ry + rh * k)}H${X(rx + rw)}` : `M${X(rx + rw * k)} ${Y(ry)}V${Y(ry + rh)}`);
  return s + `<path class="pl-vidro" d="${l(0.4)}${l(0.6)}"/>`;
}
function portaSVG([x, y, o, w, dir], X, Y, S, mini) {
  const h = o === "h", g = TI + 0.04;
  let s = h ? `<rect class="pl-divisao" x="${X(x - w / 2)}" y="${Y(y - g / 2)}" width="${S(w)}" height="${S(g)}"/>`
    : `<rect class="pl-divisao" x="${X(x - g / 2)}" y="${Y(y - w / 2)}" width="${S(g)}" height="${S(w)}"/>`;
  if (mini || dir === 0) return s;
  if (h) {
    const yb = y + (dir * TI) / 2, a = [x - w / 2, yb + dir * w], b = [x + w / 2, yb];
    s += `<path class="pl-porta" d="M${X(x - w / 2)} ${Y(yb)}L${X(a[0])} ${Y(a[1])}"/><path class="pl-fino" d="M${X(a[0])} ${Y(a[1])}A${S(w)} ${S(w)} 0 0 ${dir > 0 ? 0 : 1} ${X(b[0])} ${Y(b[1])}"/>`;
  } else {
    const xb = x + (dir * TI) / 2, a = [xb + dir * w, y - w / 2], b = [xb, y + w / 2];
    s += `<path class="pl-porta" d="M${X(xb)} ${Y(y - w / 2)}L${X(a[0])} ${Y(a[1])}"/><path class="pl-fino" d="M${X(a[0])} ${Y(a[1])}A${S(w)} ${S(w)} 0 0 ${dir > 0 ? 1 : 0} ${X(b[0])} ${Y(b[1])}"/>`;
  }
  return s;
}
function cotasSVG(f, X, Y, S) {
  const xs = [...new Set(f.divisoes.map(div).filter((d) => d.y0 === 0).flatMap((d) => [d.x0, d.x1]))].sort((a, b) => a - b);
  const tique = (x, y) => `M${X(x) - 3} ${Y(y) + 3}L${X(x) + 3} ${Y(y) - 3}M${X(x)} ${Y(y) - 5}V${Y(y) + 5}`;
  let lin = `M${X(0)} ${Y(-0.55)}H${X(f.W)}M${X(0)} ${Y(-1.15)}H${X(f.W)}M${X(-0.8)} ${Y(0)}V${Y(f.H)}`, t = "";
  xs.forEach((x, i) => {
    lin += tique(x, -0.55);
    if (i && xs[i] - xs[i - 1] >= 1.4) t += `<text class="pl-cota-t" x="${X((xs[i] + xs[i - 1]) / 2)}" y="${Y(-0.65)}" font-size="${S(0.26)}">${fmt(xs[i] - xs[i - 1], 2)}</text>`;
  });
  lin += tique(0, -1.15) + tique(f.W, -1.15) + `M${X(-0.8) - 3} ${Y(0) + 3}L${X(-0.8) + 3} ${Y(0) - 3}M${X(-0.8) - 3} ${Y(f.H) + 3}L${X(-0.8) + 3} ${Y(f.H) - 3}`;
  t += `<text class="pl-cota-t" x="${X(f.W / 2)}" y="${Y(-1.25)}" font-size="${S(0.3)}">${fmt(f.W, 2)}</text>`;
  t += `<text class="pl-cota-t" x="${X(-0.92)}" y="${Y(f.H / 2)}" font-size="${S(0.3)}" transform="rotate(-90 ${X(-0.92)} ${Y(f.H / 2)})">${fmt(f.H, 2)}</text>`;
  const tit = f.nome.toUpperCase() + (f.sub ? ` · ${f.sub}` : "") + (f.rep > 1 ? ` (×${f.rep})` : "");
  return `<path class="pl-cota" d="${lin}"/>${t}<text class="pl-titulo" x="${X(0)}" y="${Y(-1.8)}" font-size="${S(0.38)}">${esc(tit)}</text>`;
}

// ---------- fachadas desenhadas (em vez de fotografias), pela fase da obra ----------
const FACH = {
  moradia: { x: 110, w: 180, pisos: 1, ph: 50, telhado: true, cols: 4 },
  moradia2: { x: 120, w: 160, pisos: 2, ph: 40, telhado: false, cols: 4 },
  edificio: { x: 96, w: 208, pisos: 4, ph: 26, telhado: false, cols: 6, grua: true },
  reabilitacao: { x: 152, w: 96, pisos: 4, ph: 26, telhado: true, cols: 3, vizinhos: true },
  estrutura: { x: 92, w: 216, pisos: 7, ph: 16, telhado: false, cols: 7, grua: true },
};
function fachadaSVG(tipo, fase, cls = "absolute inset-0 w-full h-full") {
  const F = FACH[tipo] || FACH.moradia, base = 140, topo = base - F.pisos * F.ph, cw = F.w / F.cols;
  let s = `<rect width="400" height="160" fill="#efe5d8"/><circle cx="334" cy="36" r="15" fill="#f1cfa6" opacity=".75"/>
    <path d="M0 122Q80 98 170 116T400 106V160H0Z" fill="#e6d7c5"/><rect y="140" width="400" height="20" fill="#d6c4b0"/>`;
  if (F.vizinhos) s += `<rect x="${F.x - 64}" y="${topo + 14}" width="62" height="${base - topo - 14}" fill="#e2d3c1"/><rect x="${F.x + F.w + 2}" y="${topo + 6}" width="62" height="${base - topo - 6}" fill="#e2d3c1"/>`;
  if (F.grua && fase !== "acab") {
    const mx = Math.min(F.x + F.w + 34, 372);
    s += `<path d="M${mx} 140V12M${mx - 4} 140V12M${mx - 150} 16H${mx + 34}M${mx - 2} 12L${mx - 120} 16M${mx - 2} 12L${mx + 28} 16" stroke="#c47a3c" stroke-width="2" fill="none"/>
      <path d="M${mx - 96} 16V58" stroke="#7b6a5d" stroke-width="1"/><rect x="${mx - 100}" y="58" width="8" height="6" fill="#7b6a5d"/><rect x="${mx + 20}" y="17" width="14" height="9" fill="#7b6a5d"/>`;
  }
  if (fase === "lic") {
    s += `<rect x="${F.x}" y="${topo}" width="${F.w}" height="${base - topo}" fill="none" stroke="#c47a3c" stroke-width="2" stroke-dasharray="7 6"/>`;
    if (F.telhado) s += `<path d="M${F.x - 6} ${topo}L${F.x + F.w / 2} ${topo - F.ph * 0.55}L${F.x + F.w + 6} ${topo}" fill="none" stroke="#c47a3c" stroke-width="2" stroke-dasharray="7 6"/>`;
    for (let i = 0; i <= 4; i++) s += `<path d="M${F.x + (i * F.w) / 4} 140v-9" stroke="#7b6a5d" stroke-width="2"/>`;
    s += `<rect x="${F.x - 70}" y="104" width="44" height="26" rx="2" fill="#fff" stroke="#b9a796"/><path d="M${F.x - 48} 130v10" stroke="#7b6a5d" stroke-width="2"/><path d="M${F.x - 64} 112h32M${F.x - 64} 118h24" stroke="#c9b8a7" stroke-width="2"/>`;
    return `<svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMax slice" class="${cls}" aria-hidden="true">${s}</svg>`;
  }
  if (fase === "est" || tipo === "estrutura") {
    const feitos = tipo === "estrutura" ? 5 : Math.max(1, Math.ceil(F.pisos * 0.6));
    for (let j = 0; j <= F.cols; j++) s += `<rect x="${F.x + j * cw - 2.5}" y="${base - feitos * F.ph}" width="5" height="${feitos * F.ph}" fill="#a39385"/>`;
    for (let k = 1; k <= feitos; k++) s += `<rect x="${F.x - 5}" y="${base - k * F.ph - 3}" width="${F.w + 10}" height="5" fill="#8f7f72"/>`;
    const yc = base - (feitos + 1) * F.ph;
    s += `<rect x="${F.x - 5}" y="${yc - 3}" width="${F.w * 0.55}" height="5" fill="#c47a3c" opacity=".85"/>`;
    for (let j = 0; j < 6; j++) s += `<path d="M${F.x + 6 + j * F.w * 0.09} ${yc + 2}V${yc + F.ph}" stroke="#c47a3c" stroke-width="1.2" opacity=".8"/>`;
    return `<svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMax slice" class="${cls}" aria-hidden="true">${s}</svg>`;
  }
  const parede = { env: "#e6cdb3", inst: "#efe1d1", acab: "#faf6f1" }[fase] || "#faf6f1";
  if (F.telhado) s += `<path d="M${F.x - 8} ${topo}L${F.x + F.w / 2} ${topo - F.ph * 0.55}L${F.x + F.w + 8} ${topo}Z" fill="${fase === "env" ? "#c9a283" : "#b86d31"}"/>`;
  s += `<rect x="${F.x}" y="${topo}" width="${F.w}" height="${base - topo}" fill="${parede}" stroke="#b9a796"/>`;
  if (!F.telhado) s += `<rect x="${F.x - 3}" y="${topo - 4}" width="${F.w + 6}" height="4" fill="#9c8b7c"/>`;
  for (let k = 0; k < F.pisos; k++) for (let j = 0; j < F.cols; j++) {
    const x = F.x + j * cw + cw * 0.27, y = base - (k + 1) * F.ph + F.ph * 0.26, w = cw * 0.46, h = F.ph * (k === 0 && j === Math.floor(F.cols / 2) && fase === "acab" ? 0.74 : 0.48);
    const vidro = { env: "#5a463a", inst: "#7a6758", acab: "#b9cec6" }[fase];
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${vidro}" stroke="${fase === "acab" ? "#7b6a5d" : "none"}" stroke-width="1.2"/>`;
  }
  if (fase === "env") {
    let a = "";
    for (let x = F.x - 6; x <= F.x + F.w + 6; x += 24) a += `M${x} ${base}V${topo - 6}`;
    for (let k = 0; k <= F.pisos; k++) a += `M${F.x - 8} ${base - k * F.ph}H${F.x + F.w + 8}`;
    s += `<path d="${a}" stroke="#c47a3c" stroke-width="1.3" opacity=".6" fill="none"/>`;
  }
  if (fase === "acab") s += `<circle cx="${F.x - 18}" cy="132" r="9" fill="#5aa587" opacity=".75"/><circle cx="${F.x + F.w + 20}" cy="130" r="11" fill="#5aa587" opacity=".7"/><circle cx="${F.x + F.w + 34}" cy="134" r="7" fill="#2f6b55" opacity=".7"/>`;
  return `<svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMax slice" class="${cls}" aria-hidden="true">${s}</svg>`;
}
// fundo do painel da manhã: desenho técnico (alçado, grua e cotas) em traço claro
function heroiSVG() {
  let g = "";
  for (let x = 0; x <= 1200; x += 40) g += `M${x} 0V420`;
  for (let y = 0; y <= 420; y += 40) g += `M0 ${y}H1200`;
  let jan = "";
  for (let k = 0; k < 5; k++) for (let j = 0; j < 6; j++) jan += `<rect x="${742 + j * 52}" y="${150 + k * 50}" width="26" height="30"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 420" preserveAspectRatio="xMaxYMid slice">
    <path d="${g}" stroke="#ffffff" stroke-opacity=".05" stroke-width="1"/>
    <g fill="none" stroke="#ffffff" stroke-opacity=".38" stroke-width="1.4"><rect x="720" y="130" width="330" height="270"/>${jan}<path d="M700 400H1180"/></g>
    <g fill="none" stroke="#e3a56b" stroke-opacity=".7" stroke-width="2"><path d="M1110 400V40M1124 400V40"/><path d="M1110 60l14 20M1124 80l-14 20M1110 100l14 20M1124 120l-14 20M1110 140l14 20M1124 160l-14 20M1110 180l14 20M1124 200l-14 20M1110 220l14 20M1124 240l-14 20M1110 260l14 20M1124 280l-14 20M1110 300l14 20M1124 320l-14 20M1110 340l14 20M1124 360l-14 20"/>
      <path d="M760 48H1190M1117 24L800 48M1117 24L1180 48M1117 24V40"/><path d="M880 48V230"/><rect x="872" y="230" width="16" height="12"/></g>
    <g stroke="#e3a56b" stroke-opacity=".55" stroke-width="1" fill="none"><path d="M720 112H1050M720 104v16M1050 104v16M700 130V400M692 130h16M692 400h16"/></g>
  </svg>`;
  return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;
}

// ================= MOTOR DO ORÇAMENTO =================
// quantidades a partir do desenho (medir) + rácios de consumo + preços de demonstração (dados.js)
const opcoesPadrao = (p) => ({ ...p.padrao });
const OPCOES = [
  ["estrutura", "Estrutura", [["betao", "Betão armado"], ["metalica", "Estrutura metálica leve"]]],
  ["acabamento", "Nível de acabamentos", [["standard", "Standard"], ["premium", "Premium"]]],
  ["cobertura", "Cobertura", [["telhado", "Telhado cerâmico"], ["plana", "Cobertura plana"]]],
  ["caixilharia", "Caixilharia (vidro duplo)", [["aluminio", "Alumínio com corte térmico"], ["pvc", "PVC"]]],
];
const NOMES = {
  estrutura: { betao: "betão armado", metalica: "estrutura metálica leve" },
  acabamento: { standard: "standard", premium: "premium" },
  cobertura: { telhado: "telhado cerâmico", plana: "cobertura plana" },
  caixilharia: { aluminio: "alumínio com corte térmico", pvc: "PVC" },
};
const GRUPOS = [["proj", "Projetos e licenciamento"], ["prep", "Estaleiro e trabalhos preparatórios"], ["est", "Estrutura"],
  ["env", "Envolvente: paredes, cobertura e caixilharia"], ["int", "Interiores e acabamentos"], ["inst", "Instalações"], ["ext", "Exteriores"]];

function calcular(p, o) {
  const P = D.precos, M = medir(p), C = D.consumos, k = C[p.reab ? "reabilitacao" : "nova"][o.estrutura], ac = o.acabamento;
  const imp = M.imp, n = M.pisos, lances = n - 1, metal = o.estrutura === "metalica";
  const vol = { fund: k.fund * imp, massame: k.massame * imp, laje: k.laje * imp * n, pv: k.pv * imp * n, escada: k.escada * lances };
  const betao = soma(Object.values(vol));
  const aco = soma(Object.entries(vol).map(([e, v]) => v * C.aco[e]));
  let cofragem = C.cofragem.fund * imp * (k.fund >= 0.05 ? 1 : 0.3);
  if (k.laje) cofragem += (k.cofrLaje ?? C.cofragem.laje) * imp * n;
  if (k.pv) cofragem += C.cofragem.pv * imp * n;
  if (k.escada) cofragem += C.cofragem.escada * lances;
  const perfis = (k.perfis || 0) * M.bruta;
  const cob = imp * (o.cobertura === "telhado" ? 1.12 : 1.04);
  const acabam = M.parInt * 2 + M.parExt + M.util;
  const exts = [["piscina", "piscina"], ["terraco", "terraço"], ["varanda", "varandas"], ["alpendre", "alpendre"]].filter(([t]) => M[t] > 0);
  const caps = [
    ["proj", "Projetos, licenciamento e taxas", `arquitetura e especialidades · ${fmt(M.bruta, 0)} m²`, (P.projeto_base + P.projeto_m2 * M.bruta) * (p.reab ? P.projeto_reab : 1), "proj"],
    ["estaleiro", "Estaleiro, segurança e resíduos", `andaimes em ${fmt(M.fachada, 0)} m² de fachada${n >= 3 ? " · grua" : ""}`,
      P.estaleiro_base + P.estaleiro_m2 * M.bruta + P.andaime_m2 * M.fachada + (n >= 3 ? P.grua : 0), "prep"],
    p.reab ? ["demol", "Demolições e remoção de entulho", `interiores · ${fmt(M.bruta, 0)} m²`, P.demolicao_m2 * M.bruta, "prep"]
      : ["terras", "Movimento de terras", `${fmt(imp * 0.9, 0)} m³ de escavação e aterro`, imp * 0.9 * P.escavacao_m3, "prep"],
    ["estrutura", p.reab ? "Reforço estrutural e novas lajes" : "Fundações e estrutura",
      (metal ? `${fmt(perfis / 1000, 1)} t de perfis de aço leve · ${fmt(betao, 1)} m³ de betão` : `${fmt(betao, 1)} m³ de betão · ${fmt(aco / 1000, 1)} t de aço · ${fmt(cofragem, 0)} m² de cofragem`)
        + (p.reab ? " · reforço sísmico das paredes" : ""),
      betao * P.betao_m3 + aco * P.aco_kg + cofragem * P.cofragem_m2 + perfis * P.perfis_kg + (p.reab ? M.bruta * P.reforco_m2 : 0), "est"],
    ["parext", p.reab ? "Fachadas: reabilitação" : "Paredes exteriores e isolamento",
      p.reab ? `${fmt(M.parExt, 0)} m² · rebocos, cantarias e pintura` : `${fmt(M.parExt, 0)} m² · ${metal ? "painel de aço leve" : "tijolo térmico"} + ETICS`,
      M.parExt * (p.reab ? P.fachada_reab_m2 : P.parede_ext_m2[o.estrutura]), "env"],
    ["parint", "Paredes interiores", `${fmt(M.parInt, 0)} m² · ${metal ? "gesso cartonado com lã mineral" : "tijolo de 11 cm"}`, M.parInt * P.parede_int_m2[o.estrutura], "int"],
    ["rebocos", "Rebocos, estuques e pinturas", `paredes e tetos · ${fmt(acabam, 0)} m²`, acabam * P.reboco_pintura_m2[o.estrutura], "int"],
    ["cobertura", "Cobertura", `${fmt(cob, 0)} m² · ${NOMES.cobertura[o.cobertura]}, com isolamento`, cob * P.cobertura_m2[o.cobertura], "env"],
    ["caixilharia", "Caixilharia exterior e estores", `${M.nJan} janelas (${fmt(M.areaJan, 1)} m²) · ${NOMES.caixilharia[o.caixilharia]}${M.nPortaExt ? " · porta de entrada" : ""}`,
      M.areaJan * P.caixilharia_m2[o.caixilharia] + M.nPortaExt * P.porta_ext_un, "env"],
    ["pavimentos", "Pavimentos e betonilhas", `${fmt(M.util, 0)} m² · ${ac === "premium" ? "porcelânico de grande formato" : "cerâmico e flutuante"}`, M.util * (P.pavimento_m2[ac] + P.betonilha_m2), "int"],
    ["revest", "Revestimentos cerâmicos", `${fmt(M.molhadas, 0)} m² em casas de banho e cozinhas`, M.molhadas * P.revest_m2[ac], "int"],
    ["carpintarias", "Portas interiores e roupeiros", `${M.nPortaInt} portas · ${M.nQuartos} roupeiros`, M.nPortaInt * P.porta_int_un[ac] + M.nQuartos * P.roupeiro_un[ac], "int"],
    ["cozinhas", "Cozinhas e louças sanitárias", `${M.nCoz} ${M.nCoz > 1 ? "cozinhas" : "cozinha"} · ${M.nWC} ${M.nWC > 1 ? "casas" : "casa"} de banho`, M.nCoz * P.cozinha_un[ac] + M.nWC * P.loucas_wc[ac], "int"],
    ["aguas", "Águas e esgotos", `rede predial · ${fmt(M.bruta, 0)} m²`, M.bruta * P.aguas_m2, "inst"],
    ["eletricidade", "Eletricidade e ITED", `${p.fracoes} ${p.fracoes > 1 ? "frações" : "fração"}${ac === "premium" ? " · com domótica" : ""}`, M.bruta * P.eletricidade_m2[ac] + p.fracoes * P.ited_fracao, "inst"],
    ["avac", "AVAC e águas quentes", ac === "premium" ? "bomba de calor, piso radiante e ar condicionado" : "bomba de calor para AQS e pré-instalação de AC", M.bruta * P.avac_m2[ac], "inst"],
    p.elevador ? ["elevador", "Elevador e partes comuns", `${n} paragens`, P.elevador_base + P.elevador_paragem * n, "inst"] : null,
    exts.length ? ["exteriores", M.piscina ? "Exteriores e piscina" : "Exteriores", exts.map(([t, nome]) => `${nome} ${fmt(M[t], 0)} m²`).join(" · "),
      soma(exts.map(([t]) => M[t] * P[t + "_m2"])), "ext"] : null,
  ].filter(Boolean).map(([id, nome, det, valor, grupo]) => ({ id, nome, det, valor, grupo }));
  const custo = soma(caps.map((c) => c.valor)), margem = custo * P.margem, total = custo + margem;
  return { q: { ...M, betao, aco, cofragem, perfis, cob }, caps, custo, margem, total, m2: total / M.bruta };
}
const totalPadrao = (id) => calcular(projeto(id), opcoesPadrao(projeto(id))).total;
const arred = (v, a = 1000) => Math.round(v / a) * a;

// ================= PAINEL =================
const saudacao = () => { const h = new Date().getHours(); return h < 12 ? "Bom dia" : h < 20 ? "Boa tarde" : "Boa noite"; };
const textoBriefing = (t) => t.replace("{autos}", eur(totalAutos())).replace("{edificio}", "≈ " + milEur(arred(totalPadrao("edificio6"))));
const atrasadas = () => D.obras.filter((o) => o.progresso < o.previstoPct - 2);
function iniciarPainel() {
  $(".heroi").style.setProperty("--foto", heroiSVG());
  $("#saudacao").textContent = `${saudacao()}. ${["Uma coisa", "Duas coisas", "Três coisas", "Quatro coisas", "Cinco coisas"][D.briefing.length - 1]} para hoje.`;
  const ol = $("#briefing");
  ol.innerHTML = D.briefing.map((b, i) => `
    <li class="flex gap-4 items-start opacity-0" data-i="${i}">
      <span class="w-8 h-8 flex-none rounded-full grid place-items-center bg-white/10 border border-white/20 text-sm font-bold text-[#e3a56b]">${i + 1}</span>
      <div class="flex-1"><p class="text-white/90 leading-relaxed text-[15px] min-h-[1.5em]" data-texto></p>
      <button class="mt-1.5 text-[13px] font-semibold text-[#e3a56b] hover:text-white transition opacity-0" data-ir="${b[1]}">Abrir →</button></div>
    </li>`).join("");
  $$("[data-ir]", ol).forEach((b) => (b.onclick = () => mostrar(b.dataset.ir)));
  (async () => {
    await esperar(350);
    for (const li of $$("li", ol)) {
      li.classList.remove("opacity-0");
      li.classList.add("aparecer");
      await escrever($("[data-texto]", li), textoBriefing(D.briefing[li.dataset.i][0]), 9, 2);
      $("[data-ir]", li).classList.remove("opacity-0");
      await esperar(180);
    }
  })();

  const kpis = [
    { rotulo: "Obras em curso", valor: D.obras.length, sufixo: "", nota: `${D.obras.filter((o) => o.alerta).length} com alertas · ${atrasadas().length} com atraso` },
    { rotulo: "Autos de outubro", valor: Math.round(totalAutos() / 1000), sufixo: " mil €", nota: `${D.contratos.length} autos prontos a enviar` },
    { rotulo: "Tempo até ao orçamento", valor: 3, sufixo: " h", nota: "antes: 30 a 60 dias" },
    { rotulo: "Faturas com desvios", valor: D.faturas.filter((f) => conferir(f).alertas).length, sufixo: ` de ${D.faturas.length}`, nota: "conferidas com encomendas e guias" },
  ];
  $("#kpis").innerHTML = kpis.map((k, i) => `
    <div class="cartao cartao-hover p-5 aparecer" style="animation-delay:${i * 80}ms">
      <div class="rotulo">${k.rotulo}</div>
      <div class="serif text-4xl font-semibold mt-2 num" data-kpi="${i}">0</div>
      <div class="text-xs text-[#7b6a5d] mt-1">${k.nota}</div>
    </div>`).join("");
  kpis.forEach((k, i) => contar($(`[data-kpi="${i}"]`), k.valor, { sufixo: k.sufixo, dur: 1500 }));

  $("#passos").innerHTML = D.passos.map((p, i) => `
    <button class="passo-card cartao cartao-hover p-4 text-left aparecer" style="animation-delay:${150 + i * 55}ms" data-ir="${p[2]}">
      <div class="flex items-center justify-between"><span class="n">${i + 1}</span><span class="text-[#c47a3c]">${icone("brilho", "w-4 h-4")}</span></div>
      <div class="font-semibold mt-3 text-[15px]">${p[0]}</div>
      <div class="text-[12.5px] text-[#7b6a5d] mt-1 leading-snug">${p[1]}</div>
    </button>`).join("");
  $$("#passos [data-ir]").forEach((b) => (b.onclick = () => mostrar(b.dataset.ir)));

  $("#atividade").innerHTML = D.atividade.map(([h, t, e]) => `
    <li class="flex flex-wrap sm:flex-nowrap items-center gap-x-4 gap-y-1.5 py-3">
      <span class="text-xs font-semibold text-[#a08b7a] w-11 num">${h}</span>
      <span class="w-8 h-8 rounded-full grid place-items-center bg-[#fbf3ea] text-[#c47a3c] flex-none">${icone("brilho", "w-4 h-4")}</span>
      <span class="text-sm flex-1 min-w-[180px]">${t}</span>
      ${e === "feito" ? '<span class="chip chip-ok">feito</span>' : '<span class="chip chip-analise">aguarda aprovação</span>'}
    </li>`).join("");
  $("#nota-ocupacao").textContent = D.ocupacao.nota;

  if (!estiloGraficos()) return;
  const F = D.funil;
  new Chart($("#g-funil"), {
    type: "bar",
    data: {
      labels: F.meses,
      datasets: [
        { label: "Pedidos de orçamento", data: F.pedidos, backgroundColor: "#ecdccb", borderRadius: 6, order: 3 },
        { label: "Propostas enviadas", data: F.propostas, backgroundColor: "#c47a3c", borderRadius: 6, order: 2 },
        { type: "line", label: "Adjudicações", data: F.adjudicacoes, borderColor: "#2f6b55", backgroundColor: "#2f6b55", tension: 0.35, pointRadius: 4, borderWidth: 2.5, order: 1 },
      ],
    },
    options: { maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8, padding: 16 } } },
      scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: "#f1e8de" } } } },
  });
  const oc = D.ocupacao.valores;
  new Chart($("#g-equipas"), {
    type: "bar",
    data: { labels: D.ocupacao.semanas,
      datasets: [{ label: "Ocupação das equipas (%)", data: oc, backgroundColor: oc.map((v) => (v >= 95 ? "#b4442a" : "#c47a3c")), borderRadius: 8 }] },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false } },
      scales: { x: { grid: { display: false } }, y: { min: 0, max: 100, ticks: { callback: (v) => v + "%" }, grid: { color: "#f1e8de" } } } },
  });
}

// ================= PEDIDOS =================
let clienteAtual = null;   // [nome, local] que vai para a proposta
const corCanal = (c) => (c.startsWith("WhatsApp") ? "bg-[#e7f6ec] text-[#1f8a4c]" : "bg-[#f3eee8] text-[#6b5a4d]");
const iconeCanal = (c) => (c.startsWith("WhatsApp") ? "chat" : "email");
const chipEstado = (e) => ({
  novo: '<span class="chip chip-novo">novo</span>', analise: '<span class="chip chip-analise">em análise</span>',
  pronto: '<span class="chip chip-analise">resposta pronta</span>', respondido: '<span class="chip chip-ok">respondido</span>',
}[e]);
function iniciarPedidos() { abrirPedido("p1"); }
function listarPedidos(sel) {
  $("#lista-pedidos").innerHTML = D.pedidos.map((p) => `
    <button class="w-full text-left cartao cartao-hover p-4 ${p.id === sel ? "!border-[#c47a3c] ring-2 ring-[#c47a3c]/15" : ""}" data-p="${p.id}">
      <div class="flex items-center gap-3">
        <span class="w-9 h-9 rounded-full grid place-items-center flex-none ${corCanal(p.canal)}">${icone(iconeCanal(p.canal), "w-4 h-4")}</span>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2"><b class="truncate text-[14.5px]">${p.nome}</b><span class="text-[11px] text-[#a08b7a] whitespace-nowrap">${p.hora}</span></div>
          <div class="text-[13px] text-[#7b6a5d] truncate">${p.assunto}</div>
        </div>
      </div>
      <div class="flex items-center justify-between mt-2.5 pl-12"><span class="text-[11px] text-[#a08b7a] truncate min-w-0">${p.canal}${p.empresa ? " · " + p.empresa : ""}</span>${chipEstado(p.estado)}</div>
    </button>`).join("");
  $$("#lista-pedidos [data-p]").forEach((b) => (b.onclick = () => abrirPedido(b.dataset.p)));
  const novos = D.pedidos.filter((p) => p.estado === "novo" || p.estado === "pronto").length;
  $("#n-pedidos").textContent = novos;
  $("#n-pedidos").style.display = novos ? "" : "none";
}
const valorPedido = (p) => (p.mq ? soma(p.mq.map(([, , q, pu]) => q * pu)) : p.estimativa || arred(totalPadrao(p.projeto)));
const analisados = {}, emAnalise = {};
let pedidoAberto = null;
async function abrirPedido(id, auto = false) {
  const p = D.pedidos.find((x) => x.id === id);
  pedidoAberto = id;
  listarPedidos(id);
  const wa = p.canal.startsWith("WhatsApp");
  const anexos = p.anexo ? `<div class="mt-2 flex flex-wrap gap-2">${p.anexo.split(" · ").map((a) => `<span class="inline-flex items-center gap-2 text-xs bg-white border border-[#eadfd2] rounded-lg px-2.5 py-1.5">${icone(/xlsx/.test(a) ? "folha" : "ficheiro", "w-4 h-4")}${a}</span>`).join("")}</div>` : "";
  $("#detalhe-pedido").innerHTML = `
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div class="rotulo">${p.canal} · ${p.hora}</div>
        <div class="serif text-2xl font-semibold mt-1">${p.assunto}</div>
        <div class="text-sm text-[#7b6a5d]">${p.nome}${p.empresa ? " · " + p.empresa : ""}</div>
      </div>
      ${p.estado === "respondido" || analisados[id] ? "" : `<button class="btn btn-cobre" id="btn-analisar" ${emAnalise[id] ? "disabled" : ""}>${icone("brilho")}${emAnalise[id] ? "A analisar…" : "Analisar com IA"}</button>`}
    </div>
    <div class="mt-5 rounded-2xl ${wa ? "wa-fundo" : "bg-[#faf6f1] border border-[#f0e6da]"} p-4">
      <div class="${wa ? "bg-white rounded-xl shadow-sm max-w-xl" : ""} p-3 text-[15px] leading-relaxed">${p.texto}${wa ? anexos : ""}</div>
      ${wa ? "" : anexos}
    </div>
    <div id="analise" class="mt-6"></div>`;
  const b = $("#btn-analisar");
  if (b) b.onclick = () => analisar(p);
  if (p.estado === "respondido" || analisados[id]) return mostrarResultado(p, false);
  if (auto && !emAnalise[id]) return analisar(p);
}
async function analisar(p) {
  if (emAnalise[p.id]) return;
  emAnalise[p.id] = true;
  const b = $("#btn-analisar");
  if (b) b.disabled = true;
  if (p.estado === "novo") { p.estado = "analise"; listarPedidos(p.id); }
  const etapas = [p.anexo ? "Ler a mensagem e os anexos" : "Ler a mensagem", "Perceber o pedido",
    p.mq ? "Ler o mapa de quantidades" : p.precoBase ? "Ler o convite e o caderno de encargos" : `Comparar com ${D.projetos.length} obras orçamentadas`,
    p.mq ? "Aplicar os vossos preços" : "Estimar com a vossa tabela", p.precoBase ? "Preparar os esclarecimentos" : "Escrever a resposta"];
  $("#analise").innerHTML = `
    <div class="rounded-2xl border border-[#eadfd2] p-5 aparecer">
      <div class="rotulo mb-3">A IA está a trabalhar</div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-3" id="etapas">${etapas.map((e) => `<div class="etapa"><span class="bola"></span><span>${e}</span></div>`).join("")}</div>
    </div>
    <div id="resultado"></div>`;
  for (const el of $$("#etapas .etapa")) {
    el.classList.add("ativa");
    await esperar(460 + Math.random() * 340);
    el.classList.remove("ativa");
    el.classList.add("feita");
  }
  analisados[p.id] = true;
  emAnalise[p.id] = false;
  if (p.estado !== "respondido") p.estado = "pronto";
  if (pedidoAberto === p.id) await mostrarResultado(p, true);   // se entretanto abriram outro pedido, o resultado fica guardado
  listarPedidos(pedidoAberto);
}
function blocoSemelhantes(p, valor, ap) {
  const pr0 = projeto(p.semelhantes[0][0]);
  return `<div class="rotulo">Obras semelhantes já orçamentadas</div>
    <div class="space-y-2.5 mt-3">${p.semelhantes.map(([id, pc], i) => {
      const pr = projeto(id), M = medir(pr);
      return `<div class="flex gap-3 items-center rounded-xl border border-[#eadfd2] p-2.5 bg-white ${ap(i, 200)}">
        <div class="w-16 h-14 rounded-lg bg-[#fdfaf6] border border-[#f0e6da] flex-none grid place-items-center overflow-hidden p-0.5 mini-planta">${desenharPlanta(pr, { mini: true }).svg}</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2"><b class="text-[13.5px] leading-tight">${pr.nome} · ${pr.local}</b><span class="text-xs font-bold text-[#c47a3c]">${pc}%</span></div>
          <div class="text-xs text-[#7b6a5d] truncate">${pr.tipologia} · ${fmt(M.bruta, 0)} m² · ${pr.regime}</div>
          <div class="barra mt-1.5"><i data-w="${pc}"></i></div>
        </div>
        ${i === 0 ? `<div class="text-right flex-none pl-1"><div class="text-[11px] text-[#a08b7a]">${p.precoBase ? "custo estimado" : "estimativa"}</div><div class="font-bold text-sm num">${eur(valor)}</div></div>` : ""}
      </div>`; }).join("")}</div>
    ${p.precoBase ? `<div class="mt-3 grid grid-cols-3 gap-2 ${ap(3, 200)}">${caixaInfo("Preço base", eur(p.precoBase))}${caixaInfo("Custo estimado", eur(valor))}
      ${caixaInfo("Margem possível", `<span class="text-[#2f6b55]">${fmt(((p.precoBase - valor) / p.precoBase) * 100, 1)}%</span>`)}</div>` : ""}
    <button class="btn btn-claro w-full mt-3" id="btn-abrir-orc">${icone("planta")}Abrir o orçamento: ${pr0.nome}</button>`;
}
function blocoMQ(p, valor, ap) {
  return `<div class="rotulo">Mapa de quantidades lido · com os vossos preços</div>
    <table class="w-full mt-3 text-sm"><tbody>${p.mq.map(([d, u, q, pu], i) => `
      <tr class="border-b border-[#f3ebe2] ${ap(i, 150)}"><td class="py-2 pr-2"><div class="font-medium">${d}</div><div class="text-[11.5px] text-[#a08b7a]">${fmt(q, 0)} ${u} × ${eur(pu, 2)}</div></td>
        <td class="py-2 text-right num font-semibold whitespace-nowrap">${eur(q * pu)}</td></tr>`).join("")}</tbody></table>
    <div class="flex items-end justify-between mt-3 rounded-xl bg-[#1d1511] text-white p-4 ${ap(6, 150)}">
      <div><div class="text-[11px] uppercase tracking-[.12em] text-white/50 font-semibold">Proposta de subempreitada</div><div class="serif text-2xl font-semibold num">${eur(valor)}</div></div>
      <div class="text-right text-xs text-white/60">sem IVA<br>autoliquidação</div></div>
    <button class="btn btn-claro w-full mt-3" id="btn-mq">${icone("descarregar")}Exportar preços unitários (Excel)</button>`;
}
async function mostrarResultado(p, animar) {
  if (!$("#resultado")) $("#analise").innerHTML = '<div id="resultado"></div>';
  const r = $("#resultado"), valor = valorPedido(p);
  const prob = p.probabilidade === "alta" ? "chip-ok" : "chip-analise";
  const ap = (i, base = 0) => (animar ? `aparecer" style="animation-delay:${base + i * 70}ms` : "");
  r.innerHTML = `
    <div class="grid lg:grid-cols-[1fr_1.12fr] gap-6 mt-5">
      <div>
        <div class="flex items-center justify-between"><div class="rotulo">O que o cliente pede</div><span class="chip ${prob}">probabilidade ${p.probabilidade}</span></div>
        <div class="grid grid-cols-2 gap-2 mt-3">${p.campos.map(([k, v], i) => caixaInfo(k, v, ap(i))).join("")}</div>
        ${notaIA(p.nota, "mt-3")}
      </div>
      <div>${p.mq ? blocoMQ(p, valor, ap) : blocoSemelhantes(p, valor, ap)}</div>
    </div>
    <div class="mt-7">
      <div class="flex items-center justify-between gap-2">
        <div class="rotulo">${p.rotuloResposta || "Resposta preparada"}</div>
        ${p.estado === "respondido" ? '<span class="chip chip-ok">enviada</span>' : '<span class="chip chip-analise">aguarda aprovação</span>'}
      </div>
      <div class="mt-3 rounded-2xl border border-[#eadfd2] bg-white p-5 text-[14.5px] leading-relaxed whitespace-pre-line min-h-[120px]" id="resposta"></div>
      <div class="flex flex-wrap gap-2 mt-3" id="acoes-resposta"></div>
    </div>`;
  requestAnimationFrame(() => setTimeout(() => $$("[data-w]", r).forEach((i) => (i.style.width = i.dataset.w + "%")), 60));
  const bo = $("#btn-abrir-orc");
  if (bo) bo.onclick = () => { clienteAtual = p.cliente; abrirOrcamento(p.semelhantes[0][0], true); };
  const bm = $("#btn-mq");
  if (bm) bm.onclick = () => toast("Preços unitários exportados para Excel, artigo a artigo (simulação)");
  const pr = p.projeto && projeto(p.projeto);
  const texto = p.resposta.replace("{valor}", eur(valor)).replace("{m2}", pr ? eur(valor / medir(pr).bruta) : "");
  const resp = $("#resposta");
  if (animar) { rolarPara($("#resultado"), 120); await escrever(resp, texto, 9, 3); } else resp.textContent = texto;
  if (pedidoAberto === p.id) acoesResposta(p);
}
function acoesResposta(p) {
  const a = $("#acoes-resposta");
  if (p.estado === "respondido") { a.innerHTML = ""; return; }
  const terceiro = p.precoBase ? ["calendario", "Pôr os prazos na agenda"] : p.mq ? ["calendario", "Reservar a equipa de cofragem"] : ["calendario", "Marcar visita ao terreno"];
  a.innerHTML = `
    <button class="btn btn-cobre" id="btn-aprovar">${icone("enviar")}Aprovar e enviar</button>
    <button class="btn btn-claro" id="btn-editar">${icone("editar")}Editar</button>
    <button class="btn btn-claro" id="btn-terceiro">${icone(terceiro[0])}${terceiro[1]}</button>
    <div id="horarios" class="w-full"></div>`;
  $("#btn-aprovar").onclick = () => {
    p.estado = "respondido";
    listarPedidos(p.id);
    a.innerHTML = '<span class="chip chip-ok">✓ enviada agora · registada na auditoria</span>';
    toast(`Enviado a ${p.nome} (${p.canal})`);
    auditar(`Resposta ao pedido de ${p.nome} enviada`, "Comercial (aprovou)", "feito");
  };
  $("#btn-editar").onclick = () => {
    const r = $("#resposta");
    r.contentEditable = "true";
    r.focus();
    r.classList.add("ring-2", "ring-[#c47a3c]/30");
    toast("Pode editar o texto; a IA aprende com as alterações da equipa");
  };
  $("#btn-terceiro").onclick = () => {
    if (p.precoBase) {
      $("#horarios").innerHTML = '<span class="chip chip-ok mt-1">✓ Esclarecimentos até 28 out · entrega da proposta até 7 nov, 17h00</span>';
      toast("Prazos da consulta prévia na agenda da Direção Comercial");
      return auditar("Prazos da consulta prévia n.º 14/2026 postos na agenda", "IA", "feito");
    }
    if (p.mq) {
      $("#horarios").innerHTML = '<span class="chip chip-ok mt-1">✓ Equipa de cofragem pré-reservada a partir de 11 de janeiro</span>';
      return toast("Equipa de cofragem pré-reservada no planeamento (a confirmar com a adjudicação)");
    }
    $("#horarios").innerHTML = `<div class="flex flex-wrap items-center gap-2 mt-1 aparecer"><span class="text-xs text-[#7b6a5d]">Livres na agenda do comercial:</span>
      ${["Quinta, 10:00", "Sábado, 11:00", "Terça, 09:30"].map((h) => `<button class="chip chip-neutro hover:bg-[#c47a3c] hover:text-white transition" data-h="${h}">${h}</button>`).join("")}</div>`;
    $$("#horarios [data-h]").forEach((b) => (b.onclick = () => {
      toast(`Visita marcada: ${b.dataset.h} · convite enviado a ${p.nome}`);
      $("#horarios").innerHTML = `<span class="chip chip-ok mt-1">✓ Visita ao terreno: ${b.dataset.h}</span>`;
      auditar(`Visita com ${p.nome} marcada (${b.dataset.h})`, "IA", "feito");
    }));
  };
}

// ================= PLANTA → ORÇAMENTO =================
let pAtual = "t3mafra", lida = false, opc = null, calcAtual = null, ultimo = null, lendo = false, desenhoAtual = null;
function iniciarPlanta() {
  $("#miniaturas").innerHTML = D.projetos.map((p) => `
    <button class="miniatura flex-none w-48 bg-white p-2 text-left" data-m="${p.id}">
      <div class="h-24 rounded-lg bg-[#fdfaf6] grid place-items-center overflow-hidden mini-planta p-1">${desenharPlanta(p, { mini: true }).svg}</div>
      <div class="text-[13px] font-semibold mt-2 truncate">${p.nome} · ${p.local}</div>
      <div class="text-[11px] text-[#7b6a5d] truncate">${p.tipologia} · ${fmt(medir(p).bruta, 0)} m²</div>
    </button>`).join("");
  $$("#miniaturas [data-m]").forEach((b) => (b.onclick = () => !lendo && selecionarProjeto(b.dataset.m)));
  $("#btn-ler").onclick = () => lerPlanta();
  const z = $("#zona-largar");
  ["dragenter", "dragover"].forEach((ev) => z.addEventListener(ev, (e) => { e.preventDefault(); z.classList.add("por-cima"); }));
  ["dragleave", "drop"].forEach((ev) => z.addEventListener(ev, (e) => { e.preventDefault(); z.classList.remove("por-cima"); }));
  const receber = async (nome) => {
    if (lendo) return;
    toast(`Recebida: ${esc(nome)}. A IA reconheceu uma moradia T3 térrea com 180 m² (simulação).`);
    selecionarProjeto("t3mafra");
    await esperar(400);
    lerPlanta();
  };
  z.addEventListener("drop", (e) => receber(e.dataTransfer?.files?.[0]?.name || "planta_cliente.pdf"));
  z.onclick = () => receber("planta_cliente.pdf");
  z.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); receber("planta_cliente.pdf"); } };
  $("#ver-margem").onchange = () => lida && renderOrcamento(false);
  $("#btn-proposta").onclick = () => abrirProposta();
  $("#btn-excel").onclick = () => exportarMapa();
  $("#btn-erp").onclick = () => {
    toast("Obra criada no ERP com o orçamento por capítulos · aguarda aprovação");
    auditar(`Obra «${projeto(pAtual).nome} · ${projeto(pAtual).local}» criada no ERP com o orçamento`, "IA", "aguarda aprovação");
  };
  selecionarProjeto(pAtual, !!clienteAtual);
}
function estadoPlanta(t, c) { const e = $("#planta-estado"); e.textContent = t; e.className = "chip " + c; }
function selecionarProjeto(id, manterCliente = false) {
  if (lendo) return;   // não troca a planta a meio de uma leitura
  pAtual = id; lida = false; ultimo = null;
  const p = projeto(id), M = medir(p);
  opc = opcoesPadrao(p);
  if (!manterCliente) clienteAtual = p.cliente;
  desenhoAtual = desenharPlanta(p);
  $$("#miniaturas [data-m]").forEach((b) => b.classList.toggle("ativa", b.dataset.m === id));
  $("#planta-svg").innerHTML = desenhoAtual.svg;
  $("#caixas").innerHTML = "";
  $("#palco").classList.remove("com-caixas");
  $("#planta-nome").textContent = `${p.nome} · ${p.local}`;
  $("#planta-sub").textContent = `${p.tipologia} · ${fmt(M.bruta, 0)} m² de área bruta · ${p.regime}`;
  estadoPlanta("por ler", "chip-neutro");
  $("#tab-divisoes").innerHTML = '<tr><td class="py-8 text-center text-[#a08b7a]">Carregue em «Ler planta com IA»</td></tr>';
  $("#tot-areas").innerHTML = "";
  $("#conf").textContent = "";
  $("#medicoes").innerHTML = '<div class="col-span-full py-6 text-center text-sm text-[#a08b7a]">Aparecem depois da leitura</div>';
  $("#tab-orc").innerHTML = '<tr><td class="py-10 text-center text-[#a08b7a]">O orçamento aparece depois da leitura da planta</td></tr>';
  $("#orc-total").innerHTML = "";
  $("#orc-rotulo").textContent = p.regime === "chave-na-mão" ? "Orçamento chave-na-mão" : "Orçamento da empreitada";
  $("#orc-titulo").textContent = `${p.nome} · ${p.local} · ${fmt(M.bruta, 0)} m²`;
  ["#btn-proposta", "#btn-excel", "#btn-erp"].forEach((s) => ($(s).disabled = true));
  renderOpcoes();
}
async function abrirOrcamento(id, auto) {
  mostrar("planta");
  if (lendo) return;
  selecionarProjeto(id, true);
  if (auto) { await esperar(450); await lerPlanta(); }
}
async function lerPlanta() {
  if (lendo) return;
  lendo = true;
  $("#btn-ler").disabled = true;
  const p = projeto(pAtual), M = medir(p), palco = $("#palco"), tb = $("#tab-divisoes"), { vb, caixas } = desenhoAtual;
  $("#caixas").innerHTML = "";
  estadoPlanta("a ler…", "chip-analise");
  palco.classList.remove("a-ler");
  void palco.offsetWidth;
  palco.classList.add("a-ler");
  tb.innerHTML = "";
  await esperar(650);
  const pxm = (palco.clientWidth || 640) / vb.w, pausa = caixas.length > 14 ? 210 : 280, grupos = new Set(caixas.map((c) => c.g)).size > 1;
  palco.classList.add("com-caixas");
  let grupo = null;
  for (const [i, c] of caixas.entries()) {
    // a etiqueta completa cabe na divisão? se não, roda-a (divisões altas e estreitas) ou mostra só a área
    const wpx = c.w * pxm, hpx = c.h * pxm, precisa = Math.max(c.nome.length * 5.7, 54) + 14, linha = (c.nome.length + 9) * 5.9 + 14;
    const modo = precisa <= wpx + 4 && hpx >= 30 ? "" : linha <= wpx + 4 && hpx >= 16 ? " linha" : precisa <= hpx + 4 && wpx >= 30 ? " vertical" : " compacta";
    const compacta = modo === " compacta";
    const el = document.createElement("div");
    el.className = "divisao" + (c.exterior ? " exterior" : "") + modo;
    Object.assign(el.style, { left: ((c.x - vb.x) / vb.w) * 100 + "%", top: ((c.y - vb.y) / vb.h) * 100 + "%", width: (c.w / vb.w) * 100 + "%", height: (c.h / vb.h) * 100 + "%" });
    el.title = `${c.nome} · ${fmt(c.area, 2)} m²`;
    el.innerHTML = compacta ? `<span><b>${fmt(c.area, 1)}</b></span>` : `<span>${esc(c.nome)}<b>${fmt(c.area, 2)} m²</b></span>`;
    $("#caixas").appendChild(el);
    requestAnimationFrame(() => el.classList.add("visivel"));
    if (grupos && c.g !== grupo) {
      const h = document.createElement("tr");
      h.innerHTML = `<td colspan="3" class="pt-3 pb-1 text-[10.5px] font-semibold uppercase tracking-wider text-[#a08b7a]">${c.g}${c.rep > 1 && !c.exterior ? ` · repete-se em ${c.rep} pisos` : ""}</td>`;
      tb.appendChild(h);
      grupo = c.g;
    }
    const tr = document.createElement("tr");
    tr.className = "border-b border-[#f3ebe2] aparecer";
    tr.innerHTML = `<td class="py-1.5 pr-2"><span class="inline-block w-2 h-2 rounded-full mr-2 ${c.exterior ? "bg-[#2f6b55]" : "bg-[#c47a3c]"}"></span>${esc(c.nome)}${c.exterior ? ' <span class="text-[11px] text-[#2f6b55]">exterior</span>' : ""}</td>
      <td class="py-1.5 text-right num font-semibold whitespace-nowrap">${fmt(c.area, 2)} m²</td>
      <td class="py-1.5 pl-3 text-right w-12"><span class="text-[11px] text-[#7b6a5d]">${99 - (i % 3)}%</span></td>`;
    tb.appendChild(tr);
    tb.parentElement.parentElement.scrollTop = 1e6;
    await esperar(pausa);
  }
  $("#conf").textContent = `confiança média 98% · ${p.notaLeitura || "nada por confirmar"}`;
  $("#tot-areas").innerHTML = [["Área útil", fmt(M.util, 1) + " m²"], ["Exteriores", fmt(M.ext, 1) + " m²"], ["Área bruta", fmt(M.bruta, 0) + " m²"]]
    .map(([k, v]) => `<div class="rounded-xl bg-[#faf6f1] p-3 aparecer"><div class="text-[10.5px] text-[#a08b7a] font-semibold uppercase tracking-wide">${k}</div><div class="font-bold num mt-0.5">${v}</div></div>`).join("");
  await esperar(450);
  palco.classList.remove("a-ler");
  estadoPlanta(p.notaLeitura ? "lida · 2 notas" : "lida · 0 erros", "chip-ok");
  lida = true;
  renderMedicoes(true);
  await esperar(250);
  renderOrcamento(true);
  ["#btn-proposta", "#btn-excel", "#btn-erp"].forEach((s) => ($(s).disabled = false));
  $("#btn-ler").disabled = false;
  lendo = false;
}
function itensMedicao(c) {
  const q = c.q, metal = opc.estrutura === "metalica";
  return [["Área bruta", q.bruta, "m²", 0], ["Paredes exteriores", q.parExt, "m²", 0], ["Paredes interiores", q.parInt, "m²", 0],
    ["Betão", q.betao, "m³", 1], ["Aço A500 (armaduras)", q.aco, "kg", 0], metal ? ["Perfis de aço leve", q.perfis, "kg", 0] : ["Cofragem", q.cofragem, "m²", 0],
    ["Lajes e cobertura", q.imp * q.pisos, "m²", 0], ["Janelas", q.nJan, "un.", 0], ["Cerâmicos", q.molhadas, "m²", 0]];
}
function renderMedicoes(animar) {
  const c = calcular(projeto(pAtual), opc);
  $("#medicoes").innerHTML = itensMedicao(c).map(([k, v, u, d], i) => `
    <div class="rounded-xl bg-[#faf6f1] border border-[#f0e6da] p-3 ${animar ? "aparecer" : ""}" style="animation-delay:${i * 60}ms">
      <div class="text-[10.5px] text-[#a08b7a] font-semibold uppercase tracking-wide truncate">${k}</div>
      <div class="font-bold text-lg num mt-0.5">${fmt(v, d)} <span class="text-xs font-semibold text-[#7b6a5d]">${u}</span></div>
    </div>`).join("");
}
function renderOpcoes() {
  $("#opcoes").innerHTML = OPCOES.map(([k, rot, vals]) => `
    <div class="flex flex-wrap items-center justify-between gap-2">
      <span class="text-sm font-medium">${rot}</span>
      <div class="seg" data-op="${k}">${vals.map(([v, n]) => `<button data-v="${v}" class="${opc[k] === v ? "on" : ""}">${n}</button>`).join("")}</div>
    </div>`).join("");
  $$("#opcoes [data-op]").forEach((g) => $$("button", g).forEach((b) => (b.onclick = () => {
    opc[g.dataset.op] = b.dataset.v;
    $$("button", g).forEach((x) => x.classList.toggle("on", x === b));
    if (lida) { renderMedicoes(false); renderOrcamento(false); } else renderComparacao();
  })));
  renderComparacao();
}
function renderOrcamento(animar) {
  const p = projeto(pAtual), c = calcular(p, opc), ver = $("#ver-margem").checked, k = 1 + D.precos.margem;
  const antes = ultimo;
  calcAtual = c;
  ultimo = c;
  $("#tab-orc").innerHTML = c.caps.map((cap, i) => {
    const a = antes && antes.caps.find((x) => x.id === cap.id), mudou = a && Math.abs(a.valor - cap.valor) > 1;
    return `<tr class="linha-orc border-b border-[#f3ebe2] ${animar ? "aparecer" : ""} ${mudou ? "mudou" : ""}" style="animation-delay:${i * 40}ms">
      <td class="py-2 pr-3"><div class="font-medium">${cap.nome}</div><div class="text-[11.5px] text-[#a08b7a]">${cap.det}</div></td>
      <td class="py-2 text-right num font-semibold whitespace-nowrap">${eur(ver ? cap.valor : cap.valor * k)}</td></tr>`;
  }).join("");
  setTimeout(() => $$(".linha-orc.mudou").forEach((t) => t.classList.remove("mudou")), 900);
  $("#orc-total").innerHTML = `
    ${ver ? `<div class="flex justify-between text-sm py-1"><span class="text-[#7b6a5d]">Custo de construção</span><b class="num">${eur(c.custo)}</b></div>
      <div class="flex justify-between text-sm py-1"><span class="text-[#7b6a5d]">Margem e custos de estrutura (${Math.round(D.precos.margem * 100)}%)</span><b class="num text-[#2f6b55]">${eur(c.margem)}</b></div>` : ""}
    <div class="flex flex-wrap items-end justify-between gap-3 rounded-2xl bg-[#1d1511] text-white p-5 mt-2">
      <div><div class="text-[11px] uppercase tracking-[.12em] text-white/50 font-semibold">${p.regime === "chave-na-mão" ? "Total chave-na-mão" : "Total da empreitada"} · sem IVA</div>
        <div class="serif text-4xl font-semibold mt-1 num" id="total-orc"></div></div>
      <div class="text-right"><div class="text-[11px] text-white/50">por m² de área bruta</div><div class="font-bold text-lg num">${eur(c.m2)}</div></div>
    </div>`;
  contar($("#total-orc"), c.total, { euro: true, dur: animar ? 1500 : 650, de: antes ? antes.total : 0 });
  renderComparacao();
}
function renderComparacao() {
  const p = projeto(pAtual);
  if (!p || !opc) return;
  const M = medir(p), outro = opc.estrutura === "betao" ? "metalica" : "betao";
  const a = calcular(p, opc).total, b = calcular(p, { ...opc, estrutura: outro }).total, d = b - a, sem = Math.round(3 + M.pisos * 1.5);
  let extra = p.reab ? "Num prédio antigo, a estrutura metálica leve pesa menos sobre as paredes existentes e evita betonagens dentro do edifício."
    : opc.estrutura === "betao" ? `Em estrutura metálica leve, a obra encurta cerca de ${sem} semanas (montagem a seco).`
      : `Em betão armado, a obra demora mais cerca de ${sem} semanas, mas é o sistema que as equipas e a fiscalização conhecem melhor.`;
  if (M.pisos >= 3 && !p.reab) extra += " Com 3 ou mais pisos, a estrutura metálica leve pede verificação acústica entre frações e de segurança contra incêndio.";
  $("#comparacao").innerHTML = `<div class="flex items-start gap-2.5">${icone("brilho", "w-4 h-4 text-[#c47a3c] mt-0.5 flex-none")}
    <div><b>Em ${NOMES.estrutura[opc.estrutura]}: ${eur(a)}.</b> Em ${NOMES.estrutura[outro]} ficaria ${d > 0 ? "mais caro" : "mais barato"} ${eur(Math.abs(d))} (${pct((d / a) * 100)}). ${extra}</div></div>`;
}
function exportarMapa() {
  const p = projeto(pAtual), c = calcAtual || calcular(p, opc), k = 1 + D.precos.margem;
  const n = (v, d = 2) => v.toFixed(d).replace(".", ",");
  const linhas = [["Construtora Exemplo · Mapa de quantidades e orçamento (DEMONSTRAÇÃO, dados fictícios)"], [`${p.nome} · ${p.local}`], [],
    ["Medição", "Quantidade", "Unidade"], ...itensMedicao(c).map(([k2, v, u, d]) => [k2, n(v, d), u]), [],
    ["Capítulo", "Descrição", "Valor sem IVA (€)"], ...c.caps.map((x) => [x.nome, x.det, n(x.valor * k)]), ["Total", "", n(c.total)]];
  const csv = "﻿" + linhas.map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = `mapa_quantidades_${p.id}.csv`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  toast("Mapa de quantidades exportado (CSV, abre no Excel)");
}

// ---------- a proposta para o cliente (também é o que se imprime) ----------
const INCLUI = ["Projetos de arquitetura e especialidades e licenciamento", "Estaleiro, segurança e gestão de resíduos de obra", "Fundações e estrutura",
  "Paredes, isolamento térmico e impermeabilizações", "Cobertura com isolamento", "Caixilharia com vidro duplo e estores", "Pavimentos, revestimentos, rebocos e pinturas",
  "Cozinha equipada e louças sanitárias", "Águas, esgotos, eletricidade, ITED e AVAC", "Ensaios, certificado energético e telas finais"];
function abrirProposta() {
  const p = projeto(pAtual), M = medir(p), c = calcAtual || calcular(p, opc), cli = clienteAtual || p.cliente, k = 1 + D.precos.margem;
  const hoje = new Date(), validade = new Date(hoje.getTime() + 30 * 864e5);
  $("#folha").innerHTML = `
    <div class="relative h-60 md:h-72 overflow-hidden bg-[#efe5d8] cabeca-proposta">
      ${fachadaSVG(p.tipo === "moradia" && M.pisos > 1 ? "moradia2" : p.tipo, "acab")}
      <div class="absolute inset-0 bg-gradient-to-t from-[#1d1511] via-[#1d1511]/60 to-[#1d1511]/5"></div>
      <div class="absolute top-4 right-4 flex gap-2 nao-imprimir">
        <button class="btn btn-claro !py-1.5" id="imprimir">${icone("descarregar")}Guardar em PDF</button>
        <button class="btn btn-claro !py-1.5" id="fechar">Fechar</button>
      </div>
      <div class="absolute top-5 left-7 text-white/90 serif text-lg font-semibold tracking-tight">${D.empresa.nome}</div>
      <div class="absolute bottom-6 left-7 right-7 text-white">
        <div class="text-[11px] uppercase tracking-[.16em] text-white/60 font-semibold">Proposta n.º 2026/214 · ${dataPT(hoje)}</div>
        <div class="serif text-3xl md:text-4xl font-semibold mt-1">${p.nome} · ${p.local}</div>
        <div class="text-white/80 text-sm mt-1">Para ${esc(cli[0])} · ${esc(cli[1])} · ${fmt(M.bruta, 0)} m² · ${NOMES.estrutura[opc.estrutura]}</div>
      </div>
    </div>
    <div class="p-7 md:p-9 grid md:grid-cols-[1.2fr_1fr] gap-9">
      <div>
        <div class="rotulo">Resumo do orçamento</div>
        <table class="w-full mt-2 text-sm">${GRUPOS.map(([g, nome]) => { const v = soma(c.caps.filter((x) => x.grupo === g).map((x) => x.valor)) * k;
          return v ? `<tr class="border-b border-[#f1e8de]"><td class="py-2">${nome}</td><td class="py-2 text-right num font-semibold">${eur(v)}</td></tr>` : ""; }).join("")}</table>
        <div class="flex items-end justify-between mt-4 rounded-xl bg-[#1d1511] text-white p-4">
          <div><div class="text-[11px] uppercase tracking-[.12em] text-white/50 font-semibold">${p.regime === "chave-na-mão" ? "Total chave-na-mão" : "Total da empreitada"}</div><div class="serif text-3xl font-semibold num">${eur(c.total)}</div></div>
          <div class="text-right text-xs text-white/60">valores sem IVA<br>${eur(c.m2)} por m²</div>
        </div>
        <div class="rotulo mt-7">Plano de pagamentos</div>
        <div class="grid grid-cols-3 gap-1.5 mt-2 text-center">${[["10%", "na adjudicação"], ["85%", "por autos mensais de medição"], ["5%", "na receção provisória"]]
          .map(([v, t]) => `<div class="rounded-lg bg-[#faf6f1] p-2"><div class="font-bold text-[#c47a3c]">${v}</div><div class="text-[10.5px] text-[#7b6a5d] leading-tight mt-0.5">${t}</div></div>`).join("")}</div>
        <div class="rotulo mt-7">Prazos indicativos</div>
        <ul class="text-sm mt-2 space-y-1"><li>Projetos e licenciamento: ${p.reab ? "6 a 9 meses" : "4 a 8 meses"}</li><li>Execução: ${p.prazo}</li><li>Autos de medição mensais, com fotografias da obra</li></ul>
        <div class="rotulo mt-7">Opções escolhidas</div>
        <ul class="text-[13px] mt-2 space-y-1 text-[#4b3d33]">
          <li>${opc.estrutura === "betao" ? "Estrutura em betão armado" : "Estrutura metálica leve"} · acabamentos ${NOMES.acabamento[opc.acabamento]}</li>
          <li>${NOMES.cobertura[opc.cobertura].charAt(0).toUpperCase() + NOMES.cobertura[opc.cobertura].slice(1)} · caixilharia em ${NOMES.caixilharia[opc.caixilharia]}</li>
        </ul>
      </div>
      <div>
        <div class="rounded-xl border border-[#eadfd2] bg-[#fdfaf6] p-2">${desenharPlanta(p).svg}</div>
        <div class="rotulo mt-6">Incluído na proposta</div>
        <ul class="text-[13px] mt-2 space-y-1.5 text-[#4b3d33]">${INCLUI.map((t) => `<li class="flex gap-2">${icone("certo", "w-4 h-4 text-[#2f6b55] flex-none mt-0.5")}<span>${t}</span></li>`).join("")}</ul>
      </div>
    </div>
    <div class="px-7 md:px-9 pb-8 text-[11px] text-[#a08b7a]">Proposta válida até ${dataPT(validade)}, sujeita a visita ao local e ao levantamento topográfico. Preparada pela IA a partir das plantas e revista pelo Departamento de Orçamentação.
      <b>Demonstração da Febrero AI com dados fictícios:</b> a ${D.empresa.nome} é uma empresa fictícia e os preços unitários são valores de demonstração.</div>`;
  $("#modal-proposta").classList.add("aberto");
  document.body.classList.add("com-proposta");
  $("#fechar").onclick = fecharProposta;
  $("#imprimir").onclick = () => window.print();
}
function fecharProposta() { $("#modal-proposta").classList.remove("aberto"); document.body.classList.remove("com-proposta"); }

// ================= OBRAS =================
const SEMANAS = 25;
const NOMES_FASE = { lic: "Licenciamento", est: "Estrutura", env: "Alvenarias e cobertura", inst: "Instalações", acab: "Acabamentos" };
const CURTO_FASE = { lic: "Licenciamento", est: "Estrutura", env: "Alvenarias", inst: "Instalações", acab: "Acabamentos" };
function semanaHoje() {
  const s = (Date.now() - new Date(2026, 9, 5).getTime()) / (7 * 864e5);
  return Math.min(Math.max(s, 0.4), SEMANAS - 1);
}
function iniciarObras() {
  const h = semanaHoje(), x = (s) => (s / SEMANAS) * 100;
  const meses = [["out", 0], ["nov", 4], ["dez", 8.6], ["jan", 13], ["fev", 17.4], ["mar", 21.4]];
  $("#gantt").innerHTML = `
    <div class="gantt-linha !min-h-[34px]"><div></div><div class="relative h-5">${meses.map(([n, s]) => `<span class="absolute text-[11px] font-semibold uppercase tracking-wider text-[#a08b7a]" style="left:${x(s)}%">${n}</span>`).join("")}</div></div>
    ${D.obras.map((o, i) => `
      <div class="gantt-linha">
        <div class="pr-3 min-w-0"><div class="text-sm font-semibold truncate">${o.nome}</div><div class="text-[11px] text-[#a08b7a] truncate">${o.cliente} · ${o.local}</div></div>
        <div class="gantt-pista">
          ${o.fases.map(([f, a, b], j) => `<div class="gantt-barra f-${f}" style="left:${x(a)}%;width:${x(b - a)}%;animation-delay:${i * 90 + j * 70}ms" title="${NOMES_FASE[f]}">${b - a >= 4 ? CURTO_FASE[f] : ""}</div>`).join("")}
          <div class="${i === 0 ? "hoje" : "absolute top-[-6px] bottom-[-6px] w-[2px] bg-[#b4442a]/60"}" style="left:${x(h)}%"></div>
        </div>
      </div>`).join("")}`;
  const n = (f) => D.obras.filter((o) => o.faseId === f).length;
  $("#resumo-obras").innerHTML = [[`${D.obras.length} obras`, "chip-neutro"], [`${n("est")} em estrutura`, "chip-novo"], [`${n("env") + n("inst")} em alvenarias e instalações`, "chip-analise"],
    [`${n("acab")} em acabamentos`, "chip-ok"], [`${n("lic")} em licenciamento`, "chip-neutro"], [`${D.obras.filter((o) => o.alerta).length} alertas`, "chip-alerta"]]
    .map(([t, c]) => `<span class="chip ${c}">${t}</span>`).join("");
  $("#cartoes-obras").innerHTML = D.obras.map((o, i) => {
    const desv = ((o.real - o.previsto) / o.previsto) * 100;
    return `<div class="cartao cartao-hover overflow-hidden aparecer" style="animation-delay:${i * 70}ms">
      <div class="h-32 relative bg-[#efe5d8]">${fachadaSVG(o.tipo, o.faseId)}
        <span class="absolute top-3 left-3 chip ${o.alerta ? "chip-alerta" : "chip-ok"} !bg-white/95">${o.fase}</span></div>
      <div class="p-4">
        <div class="font-semibold">${o.nome}</div>
        <div class="text-xs text-[#7b6a5d]">${o.cliente} · ${o.local} · ${eur(o.orcamento)}</div>
        <div class="flex items-center justify-between text-xs mt-3"><span class="text-[#7b6a5d]">Progresso${o.atrasoDias ? ` · <span class="text-[#b4442a] font-semibold">${o.atrasoDias} dias de atraso</span>` : ""}</span><b>${o.progresso}%</b></div>
        <div class="barra verde mt-1"><i data-w="${o.progresso}"></i></div>
        <div class="flex items-center justify-between text-xs mt-3"><span class="text-[#7b6a5d]">Custo até hoje vs previsto</span>
          <b class="${desv > 2 ? "text-[#b4442a]" : "text-[#2f6b55]"}">${pct(desv)}</b></div>
        ${o.alerta ? `<div class="mt-3 text-xs rounded-lg bg-[#fbece7] text-[#8f3420] p-2.5 flex gap-2">${icone("alerta", "w-4 h-4 flex-none")}<span>${o.alerta}</span></div>` : ""}
      </div></div>`;
  }).join("");
  setTimeout(() => $$("#cartoes-obras [data-w]").forEach((i) => (i.style.width = i.dataset.w + "%")), 120);
  renderFiscal();
  if (!estiloGraficos()) return;
  new Chart($("#g-custos"), {
    type: "bar",
    data: { labels: D.obras.map((o) => o.curto),
      datasets: [
        { label: "Previsto até hoje (mil €)", data: D.obras.map((o) => o.previsto / 1000), backgroundColor: "#ecdccb", borderRadius: 5 },
        { label: "Real até hoje (mil €)", data: D.obras.map((o) => o.real / 1000), borderRadius: 5,
          backgroundColor: D.obras.map((o) => (o.real > o.previsto * 1.02 ? "#b4442a" : "#c47a3c")) },
      ] },
    options: { indexAxis: "y", maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } } },
      scales: { x: { grid: { color: "#f1e8de" } }, y: { grid: { display: false } } } },
  });
}
let fiscalLida = false;
function renderFiscal() {
  const F = D.fiscalizacao, o = obra(F.obra);
  $("#fiscal").innerHTML = `
    <div class="flex items-start justify-between gap-3">
      <div><div class="rotulo">Fiscalização · email recebido às ${F.hora}</div><div class="serif text-lg font-semibold mt-0.5">Relatório de visita n.º 14</div>
        <div class="text-xs text-[#7b6a5d]">${o.nome} · ${o.local} · ${o.cliente}</div></div>
      ${fiscalLida ? '<span class="chip chip-ok">lido pela IA</span>' : `<button class="btn btn-cobre !py-2" id="btn-fiscal">${icone("brilho")}Ler com IA</button>`}
    </div>
    <div class="mt-4 rounded-xl bg-[#faf6f1] border border-[#f0e6da] p-4 text-[13.5px] leading-relaxed">
      <div class="text-xs text-[#7b6a5d] mb-2"><b>De:</b> ${F.de}<br><b>Assunto:</b> ${F.assunto}</div>
      ${F.texto} <span class="text-[#a08b7a]">(email fictício)</span>
    </div>
    <div id="fiscal-res" class="mt-4"></div>`;
  const b = $("#btn-fiscal");
  if (b) b.onclick = () => lerFiscal();
  if (fiscalLida) mostrarFiscal(false);
}
async function lerFiscal() {
  if (fiscalLida) return;
  const b = $("#btn-fiscal");
  if (b) b.disabled = true;
  $("#fiscal-res").innerHTML = `<div class="grid sm:grid-cols-3 gap-3" id="etapas-fiscal">${["Ler o relatório", "Separar os pontos a corrigir", "Criar tarefas e prazos"]
    .map((e) => `<div class="etapa"><span class="bola"></span><span>${e}</span></div>`).join("")}</div>`;
  for (const el of $$("#etapas-fiscal .etapa")) { el.classList.add("ativa"); await esperar(520); el.classList.remove("ativa"); el.classList.add("feita"); }
  fiscalLida = true;
  renderFiscal();
  mostrarFiscal(true);
  auditar("Relatório da fiscalização lido; 3 tarefas criadas", "IA", "feito");
}
function mostrarFiscal(animar = true) {
  const F = D.fiscalizacao;
  $("#fiscal-res").innerHTML = `
    <div class="flex items-center gap-2 text-sm font-semibold text-[#b4442a]">${icone("relogio", "w-4 h-4")}Resposta à fiscalização até ${F.prazo} · já está no calendário</div>
    <div class="mt-3 space-y-2">${F.tarefas.map(([t, q, d], i) => `
      <div class="flex flex-wrap items-center gap-3 rounded-xl border border-[#eadfd2] p-3 ${animar ? "aparecer" : ""}" style="animation-delay:${i * 90}ms">
        <span class="text-[#c47a3c]">${icone("tarefa", "w-4 h-4")}</span><span class="text-sm flex-1 min-w-[180px]">${t}</span>
        <span class="text-xs text-[#7b6a5d]">${q}</span><span class="chip ${d === "hoje" ? "chip-alerta" : "chip-neutro"}">${d === "hoje" ? "hoje" : "até " + d}</span></div>`).join("")}</div>
    ${notaIA("A betonagem da laje do piso 3 fica condicionada à correção da V12: o aviso ao encarregado e à central de betão está pronto a enviar. O rascunho da resposta à fiscalização segue com as fotografias das correções.", "mt-3")}`;
}

// ================= AUTOS DE MEDIÇÃO =================
const contrato = (id) => D.contratos.find((c) => c.id === id);
const qtdTxt = (v) => fmt(v, Math.abs(v % 1) > 1e-9 ? 1 : 0);
function calcAuto(c) {
  const mes = {};
  for (const l of c.linhas) mes[l[5]] = (mes[l[5]] || 0) + l[3];
  const itens = c.artigos.map(([art, desc, un, contr, pu, ant]) => {
    const m = mes[art] || 0, acum = ant + m;
    return { art, desc, un, contr, pu, ant, mes: m, acum, perc: (acum / contr) * 100, valorMes: m * pu, acima: acum > contr + 1e-9 };
  });
  const valor = soma(itens.map((i) => i.valorMes)), ret = valor * c.retencao;
  return { itens, valor, ret, liquido: valor - ret, acumValor: soma(itens.map((i) => i.acum * i.pu)), acima: itens.filter((i) => i.acima) };
}
const totalAutos = () => soma(D.contratos.map((c) => calcAuto(c).valor));
let contratoAtual = "c1", gerando = false;
const autosFeitos = {}, autosEnviados = {};
function iniciarAutos() {
  $("#btn-auto").onclick = () => gerarAuto();
  abrirContrato(contratoAtual);
}
function estadoAuto(t, c) { const e = $("#auto-estado"); e.textContent = t; e.className = "chip " + c; }
function renderContratos() {
  $("#contratos").innerHTML = D.contratos.map((c) => {
    const a = calcAuto(c);
    const chip = autosEnviados[c.id] ? '<span class="chip chip-ok">enviado</span>' : autosFeitos[c.id]
      ? (a.acima.length ? `<span class="chip chip-alerta">${a.acima.length} acima do contratado</span>` : '<span class="chip chip-ok">pronto</span>') : '<span class="chip chip-novo">folhas recebidas</span>';
    return `<button class="cartao cartao-hover p-4 text-left min-w-0 ${c.id === contratoAtual ? "!border-[#c47a3c] ring-2 ring-[#c47a3c]/15" : ""}" data-c="${c.id}">
      <div class="flex items-start justify-between gap-2"><div class="min-w-0"><b class="text-[14.5px] block truncate">${c.nome}</b><div class="text-[12px] text-[#7b6a5d] truncate">${c.cliente} · ${c.local}</div></div>${chip}</div>
      <div class="flex items-end justify-between mt-3 gap-2"><span class="text-[12px] text-[#a08b7a]">Auto n.º ${c.auto} · ${c.linhas.length} linhas de obra</span><b class="num text-sm">${autosFeitos[c.id] ? eur(a.valor) : "—"}</b></div>
    </button>`;
  }).join("");
  $$("#contratos [data-c]").forEach((b) => (b.onclick = () => !gerando && abrirContrato(b.dataset.c)));
  const feitos = Object.keys(autosFeitos).length;
  $("#resumo-autos").innerHTML = [[`${D.contratos.length} contratos`, "chip-neutro"], [`${feitos} ${feitos === 1 ? "auto feito" : "autos feitos"}`, "chip-ok"],
    [`${eur(totalAutos())} a faturar em outubro`, "chip-novo"]].map(([t, c]) => `<span class="chip ${c}">${t}</span>`).join("");
  const n = D.contratos.filter((c) => !autosEnviados[c.id]).length;
  $("#n-autos").textContent = n;
  $("#n-autos").style.display = n ? "" : "none";
}
const tagArt = (art) => `<span class="tag-art">art. ${art}</span>`;
function abrirContrato(id) {
  contratoAtual = id;
  const c = contrato(id);
  renderContratos();
  $("#fontes-auto").innerHTML = c.fontes.map((f) => `<span class="chip chip-neutro">${icone(/xlsx|Excel/.test(f) ? "folha" : "ficheiro", "w-3.5 h-3.5")}${f}</span>`).join("");
  $("#excel").innerHTML = `<table class="excel"><thead><tr><th></th><th>Data</th><th>Frente</th><th>Trabalho (como foi escrito em obra)</th><th class="text-right">Qtd.</th><th>Un.</th><th>Artigo</th></tr></thead>
    <tbody>${c.linhas.map((l, i) => `<tr data-l="${i}" class="${autosFeitos[id] ? "lida" : ""}"><td class="n">${i + 2}</td><td>${l[0]}</td><td class="whitespace-nowrap">${l[1]}</td><td>${l[2]}</td>
      <td class="text-right num">${qtdTxt(l[3])}</td><td>${l[4]}</td><td class="art">${autosFeitos[id] ? tagArt(l[5]) : ""}</td></tr>`).join("")}</tbody></table>`;
  $("#auto-titulo").textContent = `Auto de medição n.º ${c.auto} · ${c.mes}`;
  $("#auto-sub").textContent = `${c.nome} · ${c.cliente} · contrato de ${eur(c.valorContrato)}`;
  $("#btn-auto").disabled = !!autosFeitos[id];
  if (autosFeitos[id]) return mostrarAuto(c, false);
  estadoAuto("por fazer", "chip-novo");
  $("#tab-auto").innerHTML = '<tr><td colspan="9" class="py-10 text-center text-[#a08b7a]">Carregue em «Gerar auto com IA»: a IA junta as linhas por artigo do contrato</td></tr>';
  $("#auto-total").innerHTML = "";
  $("#email-auto").innerHTML = "";
  $("#email-auto").classList.add("hidden");
}
async function gerarAuto() {
  const c = contrato(contratoAtual);
  if (gerando || autosFeitos[c.id]) return;
  gerando = true;
  $("#btn-auto").disabled = true;
  estadoAuto("a medir…", "chip-analise");
  for (const tr of $$("#excel tbody tr")) {
    tr.classList.add("lida");
    $(".art", tr).innerHTML = tagArt(c.linhas[tr.dataset.l][5]);
    await esperar(190);
  }
  autosFeitos[c.id] = true;
  renderContratos();
  await mostrarAuto(c, true);
  auditar(`Auto n.º ${c.auto} de ${c.nome} preparado a partir das folhas de obra`, "IA", "aguarda aprovação");
  gerando = false;
}
async function mostrarAuto(c, animar) {
  const a = calcAuto(c);
  estadoAuto(a.acima.length ? `${a.acima.length} ${a.acima.length > 1 ? "artigos" : "artigo"} acima do contratado` : "pronto a enviar", a.acima.length ? "chip-alerta" : "chip-ok");
  $("#tab-auto").innerHTML = a.itens.map((i, k) => `
    <tr class="border-b border-[#f3ebe2] ${i.acima ? "auto-acima" : ""} ${animar ? "aparecer" : ""}" style="animation-delay:${k * 70}ms">
      <td class="py-2 pr-2 text-[12px] font-semibold text-[#a08b7a] whitespace-nowrap">${i.art}</td>
      <td class="py-2 pr-3"><div class="font-medium leading-snug">${i.desc}</div></td>
      <td class="py-2 pr-2 text-[12px] text-[#7b6a5d]">${i.un}</td>
      <td class="py-2 pr-2 text-right num">${qtdTxt(i.contr)}</td>
      <td class="py-2 pr-2 text-right num text-[#7b6a5d]">${qtdTxt(i.ant)}</td>
      <td class="py-2 pr-2 text-right num font-semibold ${i.mes ? "" : "text-[#c9b8a7]"}">${i.mes ? qtdTxt(i.mes) : "—"}</td>
      <td class="py-2 pr-2 text-right num">${qtdTxt(i.acum)}</td>
      <td class="py-2 pr-2 w-24"><div class="flex items-center gap-1.5"><div class="barra ${i.acima ? "vermelha" : "verde"} flex-1"><i data-w="${Math.min(100, i.perc)}"></i></div>
        <span class="text-[11px] num font-semibold ${i.acima ? "text-[#b4442a]" : "text-[#7b6a5d]"}">${fmt(i.perc, 0)}%</span></div></td>
      <td class="py-2 text-right num font-semibold whitespace-nowrap">${i.valorMes ? eur(i.valorMes) : "—"}</td></tr>`).join("");
  setTimeout(() => $$("#tab-auto [data-w]").forEach((i) => (i.style.width = i.dataset.w + "%")), 80);
  $("#auto-total").innerHTML = `
    ${a.acima.length ? `<div class="rounded-xl bg-[#fbece7] text-[#8f3420] p-3 text-[13px] flex gap-2 ${animar ? "aparecer" : ""}">${icone("alerta", "w-4 h-4 flex-none mt-0.5")}<span>Acima da quantidade contratada: ${a.acima.map((i) => `<b>art. ${i.art}</b> ${i.desc.charAt(0).toLowerCase() + i.desc.slice(1)} (${pct(i.perc - 100)})`).join("; ")}. A IA propõe tratá-los como trabalhos a mais, com justificação.</span></div>` : ""}
    <div class="grid sm:grid-cols-3 gap-2 mt-3">
      ${caixaInfo("Retenção de garantia (" + Math.round(c.retencao * 100) + "%)", "− " + eur(a.ret, 2))}
      ${caixaInfo("Acumulado da obra", `${eur(a.acumValor)} <span class="text-[#a08b7a] font-medium">· ${fmt((a.acumValor / c.valorContrato) * 100, 0)}% do contrato</span>`)}
      ${caixaInfo("IVA", c.iva === "autoliquidacao" ? "autoliquidação (subempreitada)" : "acresce à taxa legal")}
    </div>
    <div class="flex flex-wrap items-end justify-between gap-3 rounded-2xl bg-[#1d1511] text-white p-5 mt-3">
      <div><div class="text-[11px] uppercase tracking-[.12em] text-white/50 font-semibold">Valor deste auto · sem IVA</div><div class="serif text-4xl font-semibold mt-1 num" id="total-auto"></div></div>
      <div class="text-right"><div class="text-[11px] text-white/50">a faturar depois da validação</div><div class="font-bold text-lg num">${eur(a.liquido, 2)}</div></div>
    </div>`;
  contar($("#total-auto"), a.valor, { euro: true, dec: 2, dur: animar ? 1300 : 1 });
  const ola = c.para.split(" ").slice(0, 2).join(" ");
  const corpo = `Bom dia, ${ola},\n\nJunto o auto de medição n.º ${c.auto}, relativo a ${c.mes.replace(" de 2026", "")}, no valor de ${eur(a.valor, 2)} (sem IVA${c.iva === "autoliquidacao" ? "; IVA em autoliquidação" : ""}). Seguem também as folhas de obra e as fotografias datadas que suportam as quantidades.\n\n${c.justificacao}\n\nAgradecemos a validação até 5 de novembro, para emitirmos a fatura.\n\nCom os melhores cumprimentos,\nDireção de Obra · ${D.empresa.nome}`;
  const em = $("#email-auto");
  em.classList.remove("hidden");
  em.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-2"><div><div class="rotulo">Email preparado para ${c.papel}</div>
      <div class="text-sm mt-1"><b>Para:</b> ${c.para} · <b>Assunto:</b> Auto de medição n.º ${c.auto} (${c.mes}) · ${c.nome}</div></div>
      ${autosEnviados[c.id] ? '<span class="chip chip-ok">enviado</span>' : '<span class="chip chip-analise">aguarda aprovação</span>'}</div>
    <div class="mt-3 rounded-2xl border border-[#eadfd2] bg-white p-5 text-[14px] leading-relaxed whitespace-pre-line" id="corpo-auto"></div>
    <div class="flex flex-wrap gap-2 mt-3" id="acoes-auto"></div>`;
  if (animar) { rolarPara(em, 140); await escrever($("#corpo-auto"), corpo, 8, 3); } else $("#corpo-auto").textContent = corpo;
  if (autosEnviados[c.id]) return;
  $("#acoes-auto").innerHTML = `<button class="btn btn-cobre" id="btn-env-auto">${icone("enviar")}Aprovar e enviar</button>
    <button class="btn btn-claro" id="btn-xls-auto">${icone("descarregar")}Exportar auto (Excel e PDF)</button>
    <button class="btn btn-claro" id="btn-fat-auto">${icone("fatura")}Preparar a fatura no ERP</button>`;
  $("#btn-env-auto").onclick = () => {
    autosEnviados[c.id] = true;
    renderContratos();
    $("#acoes-auto").innerHTML = '<span class="chip chip-ok">✓ enviado agora · registado na auditoria</span>';
    toast(`Auto n.º ${c.auto} enviado a ${c.para}`);
    auditar(`Auto n.º ${c.auto} (${c.nome}) enviado a ${c.para}`, "Direção de obra (aprovou)", "feito");
  };
  $("#btn-xls-auto").onclick = () => toast("Auto exportado em Excel e PDF, com as folhas de obra em anexo (simulação)");
  $("#btn-fat-auto").onclick = () => { toast("Fatura preparada no ERP; fica à espera da validação do auto"); auditar(`Fatura do auto n.º ${c.auto} preparada no ERP`, "IA", "aguarda aprovação"); };
}

// ================= FATURAS =================
// conferência a três: encomenda (preço) · guias de remessa (quantidade) · fatura
function conferir(f) {
  const linhas = f.linhas.map(([desc, q, un, pu], i) => {
    const puE = f.encomenda.pu[i], qG = f.guias.qtd[i], desvio = ((pu - puE) / puE) * 100, falta = q - qG;
    return { desc, q, un, pu, puE, qG, qE: f.encomenda.qtd[i], desvio, falta, valor: q * pu, precoAlto: desvio > 2, semGuia: falta > 1e-9 };
  });
  const precoAlto = linhas.filter((l) => l.precoAlto), semGuia = linhas.filter((l) => l.semGuia);
  return { linhas, total: soma(linhas.map((l) => l.valor)), precoAlto, semGuia, alertas: precoAlto.length + semGuia.length, desvio: linhas[0].desvio,
    difPreco: soma(precoAlto.map((l) => (l.pu - l.puE) * l.q)), difQtd: soma(semGuia.map((l) => l.falta * l.pu)) };
}
const faturasLidas = {}, faturasLancadas = {};
let faturaAberta = "f1";
function iniciarFaturas() { abrirFatura("f1"); renderAuditoria(); }
function chipFatura(f) {
  if (faturasLancadas[f.id]) return '<span class="chip chip-ok">lançada</span>';
  if (!faturasLidas[f.id]) return '<span class="chip chip-novo">por ler</span>';
  const k = conferir(f);
  if (k.precoAlto.length) return `<span class="chip chip-alerta">${pct(k.precoAlto[0].desvio)}</span>`;
  if (k.semGuia.length) return '<span class="chip chip-alerta">falta guia</span>';
  return k.desvio < -1 ? `<span class="chip chip-ok">${pct(k.desvio)}</span>` : '<span class="chip chip-analise">conferida</span>';
}
function listarFaturas() {
  $("#lista-faturas").innerHTML = D.faturas.map((f) => `
    <button class="w-full text-left cartao cartao-hover p-4 ${f.id === faturaAberta ? "!border-[#c47a3c] ring-2 ring-[#c47a3c]/15" : ""}" data-f="${f.id}">
      <div class="flex items-center justify-between gap-2"><b class="text-[14px] truncate">${f.fornecedor}</b><span class="text-[11px] text-[#a08b7a]">${f.data}</span></div>
      <div class="flex items-center justify-between mt-1.5 gap-2"><span class="text-[13px] text-[#7b6a5d] truncate">${f.numero} · ${eur(conferir(f).total, 2)}</span>${chipFatura(f)}</div>
    </button>`).join("");
  $$("#lista-faturas [data-f]").forEach((b) => (b.onclick = () => abrirFatura(b.dataset.f)));
  const n = D.faturas.filter((f) => !faturasLancadas[f.id]).length;
  $("#n-faturas").textContent = n;
  $("#n-faturas").style.display = n ? "" : "none";
}
function abrirFatura(id) {
  faturaAberta = id;
  const f = D.faturas.find((x) => x.id === id), o = obra(f.obra), k = conferir(f);
  listarFaturas();
  $("#fatura-detalhe").innerHTML = `
    <div class="min-w-0">
      <div class="papel p-4 sm:p-6 text-[11px] sm:text-[11.5px] text-[#333]" id="papel">
        <div class="laser"></div>
        <div class="flex justify-between gap-3">
          <div data-r><div class="font-bold text-[14px]">${f.fornecedor}</div><div>NIF ${f.nif}</div><div>Parque Empresarial · Portugal</div></div>
          <div class="text-right" data-r><div class="font-bold">FATURA</div><div>${f.numero}</div><div>${f.data}</div></div>
        </div>
        <div class="mt-5" data-r>Cliente: ${D.empresa.juridico}<br>Obra: ${o.nome} · ${o.local}</div>
        <div class="mt-2" data-r>V/ encomenda: ${f.encomenda.n} · Guias: ${f.guias.ref}</div>
        <table class="w-full mt-4" data-r><thead><tr class="border-b border-[#ccc]"><th class="text-left py-1">Descrição</th><th class="text-right pl-2">Qtd.</th><th class="text-right pl-3">Preço</th><th class="text-right pl-3">Valor</th></tr></thead>
          <tbody>${k.linhas.map((l) => `<tr class="align-top"><td class="py-1 pr-2">${l.desc}</td><td class="text-right whitespace-nowrap pl-2">${qtdTxt(l.q)} ${l.un}</td><td class="text-right whitespace-nowrap pl-3">${fmt(l.pu, l.pu < 1 ? 3 : 2)}</td><td class="text-right whitespace-nowrap pl-3">${fmt(l.valor, 2)}</td></tr>`).join("")}</tbody></table>
        <div class="mt-4 flex justify-end"><div class="text-right" data-r><div>Total s/ IVA: <b>${fmt(k.total, 2)} €</b></div><div>IVA 23%: ${fmt(k.total * 0.23, 2)} €</div>
          <div class="font-bold text-[13px]">Total: ${fmt(k.total * 1.23, 2)} €</div></div></div>
        <div class="mt-6 text-[10px] text-[#999]">Documento fictício, para demonstração</div>
        <div id="realces"></div>
      </div>
    </div>
    <div id="extracao" class="min-w-0">
      <div class="h-full min-h-[300px] grid place-items-center text-center p-6"><div>
        <div class="serif text-xl font-semibold">${f.numero}</div><div class="text-sm text-[#7b6a5d] mt-1">Recebida por email · ${f.data}</div>
        <button class="btn btn-cobre mt-5" id="btn-ler-fatura">${icone("brilho")}Ler e conferir com IA</button></div></div>
    </div>`;
  $("#btn-ler-fatura").onclick = () => lerFatura(f);
  if (faturasLidas[id]) mostrarExtracao(f, false);
}
async function lerFatura(f) {
  if (faturaAberta !== f.id) abrirFatura(f.id);
  const b = $("#btn-ler-fatura");
  if (b) b.disabled = true;
  const papel = $("#papel");
  papel.classList.remove("a-ler");
  void papel.offsetWidth;
  papel.classList.add("a-ler");
  const pr = papel.getBoundingClientRect(), realces = $("#realces");
  for (const el of $$("[data-r]", papel)) {
    if (faturaAberta !== f.id) break;
    const r = el.getBoundingClientRect(), c = document.createElement("div");
    c.className = "realce";
    Object.assign(c.style, { left: r.left - pr.left - 5 + "px", top: r.top - pr.top - 4 + "px", width: r.width + 10 + "px", height: r.height + 8 + "px" });
    realces.appendChild(c);
    requestAnimationFrame(() => c.classList.add("visivel"));
    await esperar(320);
  }
  faturasLidas[f.id] = true;
  listarFaturas();
  if (faturaAberta === f.id) mostrarExtracao(f, true);
  auditar(`${f.numero} (${f.fornecedor}) lida e conferida com a encomenda e as guias`, "IA", "feito");
}
function mostrarExtracao(f, animar) {
  const o = obra(f.obra), k = conferir(f), ap = (i) => (animar ? `aparecer" style="animation-delay:${i * 60}ms` : "");
  const marca = (ok) => (ok ? `<span class="text-[#2f6b55]">${icone("certo", "w-4 h-4")}</span>` : `<span class="text-[#b4442a]">${icone("cruz", "w-4 h-4")}</span>`);
  let resumo;
  if (k.precoAlto.length) {
    const l = k.precoAlto[0];
    resumo = `<div class="rounded-xl p-4 bg-[#fbece7] ${ap(9)}"><div class="flex justify-between gap-3 text-sm"><span>${l.desc}</span><b class="num whitespace-nowrap">${fmt(l.pu, 2)} €/${l.un}</b></div>
      <div class="flex justify-between gap-3 text-sm text-[#7b6a5d]"><span>Preço da encomenda ${f.encomenda.n}</span><span class="num">${fmt(l.puE, 2)} €/${l.un}</span></div>
      <div class="mt-2 font-bold text-[#b4442a]">${pct(l.desvio)} acima da encomenda · ${eur(k.difPreco, 2)} a mais</div></div>`;
  } else if (k.semGuia.length) {
    const l = k.semGuia[0];
    resumo = `<div class="rounded-xl p-4 bg-[#fbece7] ${ap(9)}"><div class="text-sm">Faturados <b>${qtdTxt(l.q)} ${l.un}</b>, mas as guias assinadas em obra só somam <b>${qtdTxt(l.qG)} ${l.un}</b>.</div>
      <div class="mt-2 font-bold text-[#b4442a]">Faltam guias de ${qtdTxt(l.falta)} ${l.un} · ${eur(k.difQtd, 2)}</div></div>`;
  } else {
    resumo = `<div class="rounded-xl p-4 bg-[#e7f3ee] ${ap(9)}"><div class="text-sm">Preços e quantidades batem certo com a encomenda e as guias.</div>
      <div class="mt-2 font-bold text-[#2f6b55]">${k.desvio < -1 ? `${pct(k.desvio)} abaixo da encomenda` : "Pronta a lançar"}</div></div>`;
  }
  $("#extracao").innerHTML = `
    <div class="rotulo">Lido na fatura</div>
    <div class="grid grid-cols-2 gap-2 mt-3">${[["Fornecedor", f.fornecedor], ["NIF", f.nif], ["Número", f.numero], ["Data", f.data], ["Total sem IVA", eur(k.total, 2)], ["Linhas", k.linhas.length + " artigos"]]
      .map(([kk, v], i) => caixaInfo(kk, `<span class="block truncate">${v}</span>`, ap(i))).join("")}</div>
    <div class="rotulo mt-5">Associada a</div>
    <div class="mt-2 flex items-center gap-3 rounded-xl border border-[#eadfd2] p-3 ${ap(6)}"><div class="w-14 h-12 rounded-lg overflow-hidden relative flex-none">${fachadaSVG(o.tipo, o.faseId)}</div>
      <div><b class="text-sm">${o.nome} · ${o.local}</b><div class="text-xs text-[#7b6a5d]">capítulo «${f.capitulo}» · confiança 97%</div></div></div>
    <div class="rotulo mt-5">Conferência: encomenda · guias · fatura</div>
    <div class="overflow-x-auto"><table class="w-full mt-2 text-[12.5px] ${ap(7)}"><thead><tr class="text-left text-[10.5px] uppercase tracking-wider text-[#a08b7a]">
      <th class="py-1 font-semibold">Linha</th><th class="font-semibold text-right">Encomenda</th><th class="font-semibold text-right">Guias</th><th class="font-semibold text-right">Fatura</th><th></th></tr></thead>
      <tbody>${k.linhas.map((l) => `<tr class="border-t border-[#f3ebe2]"><td class="py-1.5 pr-2">${l.desc.split(" (")[0].split(", ")[0]}</td>
        <td class="text-right num whitespace-nowrap pl-2 ${l.precoAlto ? "text-[#b4442a] font-semibold" : ""}">${fmt(l.puE, l.puE < 1 ? 3 : 2)} €</td>
        <td class="text-right num whitespace-nowrap pl-2 ${l.semGuia ? "text-[#b4442a] font-semibold" : ""}">${qtdTxt(l.qG)} ${l.un}</td>
        <td class="text-right num whitespace-nowrap pl-2">${qtdTxt(l.q)} × ${fmt(l.pu, l.pu < 1 ? 3 : 2)} €</td>
        <td class="pl-2">${marca(!l.precoAlto && !l.semGuia)}</td></tr>`).join("")}</tbody></table></div>
    ${f.guias.nota ? `<div class="text-[11.5px] text-[#7b6a5d] mt-1">${f.guias.n} guias · ${f.guias.nota}</div>` : `<div class="text-[11.5px] text-[#7b6a5d] mt-1">${f.guias.n} ${f.guias.n > 1 ? "guias" : "guia"} · ${f.guias.ref}</div>`}
    <div class="mt-3">${resumo}</div>
    <div class="flex flex-wrap gap-2 mt-5" id="acoes-fatura">
      ${faturasLancadas[f.id] ? '<span class="chip chip-ok">✓ lançada no ERP</span>' : `<button class="btn btn-cobre" id="btn-lancar">${icone("enviar")}Aprovar e lançar no ERP</button>`}
      ${k.precoAlto.length ? `<button class="btn btn-claro" id="btn-revisao">${icone("email")}Pedir nota de crédito</button>` : ""}
      ${k.semGuia.length ? `<button class="btn btn-claro" id="btn-revisao">${icone("email")}Pedir as guias em falta</button>` : ""}
    </div>
    <div id="rascunho-forn" class="mt-4"></div>`;
  const lan = $("#btn-lancar");
  if (lan) lan.onclick = () => {
    faturasLancadas[f.id] = true;
    listarFaturas();
    lan.outerHTML = '<span class="chip chip-ok">✓ lançada no ERP</span>';
    toast(`${f.numero} lançada no ERP: ${o.nome}, capítulo «${f.capitulo}»${k.alertas ? " (com a reserva registada)" : ""}`);
    auditar(`${f.numero} lançada no ERP (${o.nome})`, "Administração (aprovou)", "feito");
  };
  const rev = $("#btn-revisao");
  if (rev) rev.onclick = () => {
    const l = k.precoAlto[0] || k.semGuia[0];
    const texto = k.precoAlto.length
      ? `Bom dia. Recebemos a ${f.numero} com o ${l.desc.charAt(0).toLowerCase() + l.desc.split(" S")[0].slice(1)} a ${fmt(l.pu, 2)} €/${l.un}. Na nossa encomenda ${f.encomenda.n}, o preço acordado é de ${fmt(l.puE, 2)} €/${l.un}. Podem emitir nota de crédito da diferença (${eur(k.difPreco, 2)})? Obrigado.`
      : `Bom dia. A ${f.numero} fatura ${qtdTxt(l.q)} ${l.un} de aço, mas só temos guias de remessa assinadas para ${qtdTxt(l.qG)} ${l.un} (${f.guias.ref}). Podem enviar a guia em falta (${qtdTxt(l.falta)} ${l.un}) ou corrigir a fatura? Obrigado.`;
    $("#rascunho-forn").innerHTML = `<div class="rounded-xl border border-[#eadfd2] bg-white p-4 text-[13.5px] leading-relaxed aparecer">
      <div class="text-xs text-[#7b6a5d] mb-2">Para: ${f.fornecedor} · Assunto: ${f.numero}</div>${texto}<br>Departamento de Compras · ${D.empresa.nome}
      <div class="mt-3 flex gap-2"><button class="btn btn-cobre !py-1.5" id="btn-env-forn">${icone("enviar")}Enviar</button></div></div>`;
    $("#btn-env-forn").onclick = () => {
      toast(`Pedido enviado a ${f.fornecedor}`);
      $("#rascunho-forn").innerHTML = '<span class="chip chip-ok">✓ pedido enviado ao fornecedor</span>';
      auditar(`Pedido de ${k.precoAlto.length ? "nota de crédito" : "guias em falta"} enviado a ${f.fornecedor}`, "Compras (aprovou)", "feito");
    };
  };
}
const AUDITORIA = D.auditoria.map((x) => [...x]);
function auditar(oque, quem, estado) { AUDITORIA.unshift([horaAgora(), oque, quem, estado]); renderAuditoria(); }
function renderAuditoria() {
  const t = $("#auditoria");
  if (!t) return;
  t.innerHTML = AUDITORIA.slice(0, 9).map(([h, o, q, e], i) => `
    <tr class="border-t border-[#f3ebe2] ${i === 0 ? "aparecer" : ""}"><td class="py-2.5 text-xs text-[#a08b7a] num whitespace-nowrap pr-3">${h}</td><td class="py-2.5 pr-3">${o}</td>
      <td class="py-2.5 text-xs text-[#7b6a5d] whitespace-nowrap pr-3">${q}</td><td class="py-2.5 text-right">${e === "feito" ? '<span class="chip chip-ok">feito</span>' : '<span class="chip chip-analise">' + e + "</span>"}</td></tr>`).join("");
}

// ================= ASSISTENTE =================
let modoChat = "equipa";
const semanasPoupadas = (p) => Math.round(3 + medir(p).pisos * 1.5);
const PERGUNTAS = {
  equipa: [
    { p: "Que obras estão atrasadas?", chaves: ["atras", "risco", "prazo"], r: () => {
      const at = atrasadas();
      return `Há <b>${at.length} obras</b> atrasadas face ao planeamento:
        <div class="mt-3 space-y-2">${at.map((o) => `<div class="rounded-xl border border-[#eadfd2] p-3"><b>${o.nome}</b> · ${o.local}<br>
          <span class="text-[#7b6a5d]">${o.progresso}% feito contra ${o.previstoPct}% previsto: <b class="text-[#b4442a]">${o.atrasoDias} dias</b> de atraso (${o.causa}).</span></div>`).join("")}</div>
        <div class="mt-3">Sugiro passar 2 cofradores da estrutura de Odivelas, que vai adiantada, para Venda do Pinheiro nas semanas 45 e 46: recupera cerca de 5 dias.</div>`; } },
    { p: "Quanto falta faturar este mês?", chaves: ["faturar", "faturação", "autos", "falta"], r: () => {
      const lst = D.contratos.map((c) => [c, calcAuto(c).valor]), tot = soma(lst.map((x) => x[1])), max = Math.max(...lst.map((x) => x[1]));
      return `Da produção de outubro faltam faturar <b>${eur(tot)}</b> (sem IVA), em ${lst.length} autos de medição:
        <div class="mt-3 space-y-2.5">${lst.map(([c, v]) => `<div><div class="flex justify-between gap-3 text-[13px]"><span>${c.nome} · auto n.º ${c.auto}</span><b class="num whitespace-nowrap">${eur(v)}</b></div>
          <div class="barra mt-1"><i style="width:${(v / max) * 100}%"></i></div></div>`).join("")}</div>
        <div class="mt-3">Já faturado este mês: <b>${eur(D.faturadoMes.valor)}</b> (${D.faturadoMes.obras}). Se os autos forem validados até 5 de novembro, as faturas saem no dia seguinte.</div>`; } },
    { p: "Compara betão armado e estrutura metálica na Moradia T3", chaves: ["compar", "metálica", "metalica", "betão"], r: () => {
      const p = projeto("t3mafra"), o = opcoesPadrao(p), b = calcular(p, { ...o, estrutura: "betao" }), m = calcular(p, { ...o, estrutura: "metalica" });
      return `Moradia T3 em Mafra (${fmt(medir(p).bruta, 0)} m²), com os mesmos acabamentos:
        <div class="mt-3 grid grid-cols-2 gap-2"><div class="rounded-xl bg-[#faf6f1] p-3"><div class="text-xs text-[#7b6a5d]">Betão armado</div><div class="font-bold text-lg num">${eur(b.total)}</div>
          <div class="text-[11px] text-[#a08b7a]">${fmt(b.q.betao, 0)} m³ de betão · ${fmt(b.q.aco / 1000, 1)} t de aço</div></div>
        <div class="rounded-xl bg-[#faf6f1] p-3"><div class="text-xs text-[#7b6a5d]">Estrutura metálica leve</div><div class="font-bold text-lg num">${eur(m.total)}</div>
          <div class="text-[11px] text-[#a08b7a]">${fmt(m.q.perfis / 1000, 1)} t de perfis · ${fmt(m.q.betao, 0)} m³ de betão</div></div></div>
        <div class="mt-3">A estrutura metálica leve fica <b>${eur(Math.abs(m.total - b.total))} ${m.total < b.total ? "mais barata" : "mais cara"}</b> (${pct(((m.total - b.total) / b.total) * 100)}) e encurta a obra em cerca de ${semanasPoupadas(p)} semanas. O betão armado dá mais inércia térmica e é o sistema que as equipas dominam.</div>`; } },
    { p: "Que fornecedores subiram preços?", chaves: ["fornecedor", "subi", "preço", "preco"], r: () => {
      const sub = D.precosFornecedores.filter((x) => (x[4] - x[3]) / x[3] > 0.02), bet = D.precosFornecedores[0];
      return `Nos últimos 90 dias, <b>${sub.length} fornecedores</b> subiram preços face às encomendas:
        <table class="w-full mt-3 text-[13px]"><tbody>${sub.map(([f, m, u, a, n, nota]) => `<tr class="border-t border-[#f1e8de]"><td class="py-1.5 pr-2"><b>${f}</b><div class="text-[11.5px] text-[#a08b7a]">${m} · ${nota}</div></td>
          <td class="text-right num whitespace-nowrap">${fmt(a, 2)} → ${fmt(n, 2)} ${u}</td><td class="text-right pl-2 font-bold text-[#b4442a]">${pct(((n - a) / a) * 100)}</td></tr>`).join("")}</tbody></table>
        <div class="mt-3">Com os ${D.betaoNovembro} m³ de betão previstos para novembro, a subida do betão custaria <b>${eur((bet[4] - bet[3]) * D.betaoNovembro)}</b>. Sugiro pedir a nota de crédito da última fatura e consultar mais duas centrais antes das próximas encomendas.</div>`; } },
    { p: "Prepara a resposta à fiscalização", chaves: ["fiscaliza", "relatório", "relatorio"], tarefa: "Enviar a resposta à fiscalização até 31 out (Diretor de obra)", r: () => `Rascunho pronto:
      <div class="mt-3 rounded-xl border border-[#eadfd2] bg-[#fffdf9] p-4 text-[13.5px]">Exmo. Senhor Eng. Paulo Sequeira,<br><br>Em resposta ao relatório de visita n.º 14: (1) o recobrimento das armaduras da viga V12 do piso 3 foi corrigido com espaçadores, como mostram as fotografias em anexo; (2) os guarda-corpos da periferia da laje do piso 2 estão colocados; (3) os resultados dos ensaios dos provetes da laje do piso 1 seguem até 30 de outubro, logo que o laboratório os envie.<br><br>Com os melhores cumprimentos,<br>Direção de Obra · ${D.empresa.nome}</div>
      <div class="mt-3">Antes de enviar, falta a fotografia da V12 corrigida e a confirmação do técnico de segurança: já as pedi.</div>` },
  ],
  cliente: [
    { p: "Olá! Em que fase está a nossa casa?", chaves: ["fase", "casa", "como est", "obra"], r: () => {
      const o = obra("o2");
      return `Olá, Sra. Correia! 😊 A vossa moradia na Ericeira está na fase de <b>alvenarias e cobertura, a ${o.progresso}%</b>, dentro do prazo. Resumo da semana:
        <div class="mt-2 rounded-xl overflow-hidden relative h-24 bg-[#efe5d8]">${fachadaSVG(o.tipo, o.faseId)}</div>
        <ul class="mt-2 space-y-1 text-[13px]"><li>✓ Cobertura impermeabilizada e isolada</li><li>✓ Paredes exteriores do piso 1 fechadas</li><li>▸ Próxima semana: isolamento da fachada norte e canalizações do piso 1</li></ul>`; } },
    { p: "E se trocarmos a caixilharia para PVC?", chaves: ["pvc", "caixilharia", "janela"], tarefa: "Comercial: mostrar amostras de caixilharia em PVC à Fam. Correia", r: () => {
      const p = projeto("t4ericeira"), o = opcoesPadrao(p), a = calcular(p, o).total, b = calcular(p, { ...o, caixilharia: "pvc" }).total, M = medir(p);
      return `Pode, sim, e ainda vamos a tempo: a caixilharia só é encomendada em dezembro. Nas vossas ${M.nJan} janelas (${fmt(M.areaJan, 1)} m²), em PVC com o mesmo vidro duplo, poupam cerca de <b>${eur(arred(a - b, 10))}</b>. O alumínio com corte térmico tem perfis mais finos; o PVC isola um pouco melhor. Quer que o nosso comercial vos mostre amostras na próxima visita?`; } },
    { p: "Quando podemos visitar a obra?", chaves: ["visit"], tarefa: "Visita à obra com a Fam. Correia: sábado às 10h (encarregado)", r: () => "Claro! O encarregado está na obra de segunda a sábado. Posso marcar para <b>sábado às 10h</b> ou <b>segunda às 17h30</b>. Qual prefere? Levem calçado fechado, por favor 👷" },
  ],
};
function iniciarAssistente() {
  $$("#modo-chat button").forEach((b) => (b.onclick = () => mudarModo(b.dataset.modo)));
  $("#form-chat").onsubmit = (e) => { e.preventDefault(); const t = $("#entrada").value.trim(); if (t) { $("#entrada").value = ""; perguntar(t); } };
  mudarModo(modoChat, true);
}
function mudarModo(m, forcar = false) {
  if (!iniciadas.assistente) mostrar("assistente");
  if (m === modoChat && !forcar && $("#conversa").children.length) return;
  modoChat = m;
  $$("#modo-chat button").forEach((b) => b.classList.toggle("on", b.dataset.modo === m));
  const wa = m === "cliente";
  $("#caixa-chat").classList.toggle("wa", wa);
  $("#conversa").classList.toggle("wa-fundo", wa);
  $("#chat-legenda").textContent = wa ? "Simulação: o WhatsApp da Fam. Correia (Moradia T4 com piscina · Ericeira), atendido pela IA" : "A IA responde com o que está no ERP, no email, nas folhas de obra e nos autos";
  $("#conversa").innerHTML = wa
    ? '<div class="text-center"><span class="text-[11px] bg-white/80 rounded-md px-2 py-1 text-[#6b5a4d] shadow-sm">Hoje · a IA identifica-se sempre como assistente virtual</span></div>'
    : "";
  if (!wa) bolhaIA(`${saudacao()}! Pergunte-me sobre obras, autos, orçamentos, fornecedores ou prazos.`);
  $("#sugestoes").innerHTML = PERGUNTAS[m].map((q) => `<button class="chip chip-neutro hover:bg-[#c47a3c] hover:text-white transition !py-1.5 !whitespace-normal text-left" data-q="${q.p}">${q.p}</button>`).join("");
  $$("#sugestoes [data-q]").forEach((b) => (b.onclick = () => perguntar(b.dataset.q)));
}
function bolhaEu(t) {
  const d = document.createElement("div");
  d.className = "flex justify-end aparecer";
  d.innerHTML = `<div class="bolha-eu px-4 py-2.5 text-sm max-w-[80%]">${esc(t)}</div>`;
  $("#conversa").appendChild(d);
  $("#conversa").scrollTop = 1e6;
}
function bolhaIA(html) {
  const d = document.createElement("div");
  d.className = "flex gap-2.5 items-end aparecer";
  d.innerHTML = `<span class="w-8 h-8 flex-none rounded-full grid place-items-center bg-gradient-to-br from-[#e3a56b] to-[#b86d31] text-white">${icone("brilho", "w-4 h-4")}</span>
    <div class="bolha-ia px-4 py-3 text-sm leading-relaxed max-w-[85%]">${html}</div>`;
  $("#conversa").appendChild(d);
  $("#conversa").scrollTop = 1e6;
  return d;
}
async function perguntar(t) {
  bolhaEu(t);
  const lista = PERGUNTAS[modoChat], lower = t.toLowerCase();
  const q = lista.find((x) => x.p === t) || lista.find((x) => x.chaves.some((c) => lower.includes(c)))
    || [...PERGUNTAS.equipa, ...PERGUNTAS.cliente].find((x) => x.chaves.some((c) => lower.includes(c)));
  const pensar = bolhaIA('<span class="pontinhos"><span></span><span></span><span></span></span>');
  await esperar(900 + Math.random() * 500);
  pensar.remove();
  bolhaIA(q ? q.r() : "Na versão real, respondo a isto com os dados do ERP, do email, das folhas de obra e dos autos. Nesta demonstração, experimente uma das perguntas sugeridas.");
  if (q?.tarefa) {
    const ul = $("#tarefas");
    if (ul.querySelector(".vazio")) ul.innerHTML = "";
    const li = document.createElement("li");
    li.className = "flex gap-2 items-start aparecer";
    li.innerHTML = `<span class="text-[#2f6b55] mt-0.5">${icone("certo", "w-4 h-4")}</span><span>${q.tarefa}</span>`;
    ul.appendChild(li);
    toast("Tarefa criada: " + q.tarefa);
  }
}

// ================= DEMONSTRAÇÃO GUIADA =================
let tourAtivo = false;
async function tour() {
  if (tourAtivo) return;
  tourAtivo = true;
  $("#legenda-tour").classList.remove("hidden");
  const N = 9;
  const passo = async (n, txt, fn, pausa) => {
    if (!tourAtivo) throw new Error("parar");
    $("#tour-n").textContent = `${n} de ${N}`;
    $("#tour-texto").textContent = txt;
    await fn();
    if (!tourAtivo) throw new Error("parar");
    await esperar(pausa);
  };
  try {
    await passo(1, "Todas as manhãs, a IA resume o que precisa da vossa atenção.", async () => mostrar("painel"), 7000);
    await passo(2, "Chega um pedido pelo WhatsApp: a IA percebe o que o cliente quer e compara com obras já orçamentadas.", async () => {
      mostrar("pedidos"); await esperar(500); await abrirPedido("p1", true);
    }, 2600);
    await passo(3, "Abre o orçamento: a IA lê a planta e mede paredes, betão, aço e cofragem.", async () => {
      clienteAtual = D.pedidos[0].cliente;
      mostrar("planta");
      selecionarProjeto("t3mafra", true);
      await esperar(400);
      await lerPlanta();
      rolarPara($("#opcoes").closest(".cartao"));
    }, 1600);
    await passo(4, "Muda a estrutura ou os acabamentos, e o orçamento recalcula logo.", async () => {
      $('#opcoes [data-op="estrutura"] [data-v="metalica"]').click();
      await esperar(2200);
      $('#opcoes [data-op="acabamento"] [data-v="premium"]').click();
      await esperar(2000);
      $('#opcoes [data-op="estrutura"] [data-v="betao"]').click();
      $('#opcoes [data-op="acabamento"] [data-v="standard"]').click();
    }, 1800);
    await passo(5, "A proposta para o cliente sai pronta a rever e a enviar.", async () => abrirProposta(), 5500);
    await passo(6, "Na obra, a IA lê o relatório da fiscalização e cria as tarefas com prazo.", async () => {
      fecharProposta();
      mostrar("obras");
      await esperar(1500);
      rolarPara($("#fiscal"));
      await esperar(700);
      await lerFiscal();
    }, 3000);
    await passo(7, "No fim do mês, a IA faz os autos de medição a partir das folhas de obra.", async () => {
      mostrar("autos");
      await esperar(500);
      abrirContrato((D.contratos.find((c) => !autosFeitos[c.id]) || D.contratos[0]).id);
      await esperar(400);
      rolarPara($("#excel").closest(".cartao"));
      await gerarAuto();
    }, 3500);
    await passo(8, "As faturas dos fornecedores são conferidas com a encomenda e as guias de remessa.", async () => {
      mostrar("faturas");
      await esperar(500);
      abrirFatura("f1");
      await esperar(500);
      if (!faturasLidas.f1) await lerFatura(D.faturas[0]);
    }, 4000);
    await passo(9, "E qualquer pessoa da equipa pergunta à empresa o que precisa de saber.", async () => {
      mostrar("assistente");
      mudarModo("equipa", true);
      await esperar(600);
      await perguntar("Que obras estão atrasadas?");
      await esperar(2400);
      await perguntar("Quanto falta faturar este mês?");
    }, 4500);
  } catch (e) { /* parado */ }
  pararTour();
}
function pararTour() { tourAtivo = false; $("#legenda-tour").classList.add("hidden"); }

// ================= arranque =================
const INICIAR = { painel: iniciarPainel, pedidos: iniciarPedidos, planta: iniciarPlanta, obras: iniciarObras, autos: iniciarAutos, faturas: iniciarFaturas, assistente: iniciarAssistente };
document.addEventListener("DOMContentLoaded", () => {
  pintarIcones();
  $("#marca-nome").textContent = D.empresa.nome;
  $$(".nav-item").forEach((a) => {
    a.onclick = () => mostrar(a.dataset.vista);
    a.tabIndex = 0;
    a.setAttribute("role", "button");
    a.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); mostrar(a.dataset.vista); } };
  });
  $("#nav-movel").innerHTML = Object.entries(VISTAS).map(([v, [t]]) => `<button class="btn btn-claro !py-1.5 !px-3 !text-xs" data-v="${v}">${t}</button>`).join("");
  $$("#nav-movel button").forEach((b) => (b.onclick = () => mostrar(b.dataset.v)));
  $("#n-pedidos").textContent = D.pedidos.filter((p) => p.estado === "novo" || p.estado === "pronto").length;
  $("#n-autos").textContent = D.contratos.length;
  $("#n-faturas").textContent = D.faturas.length;
  $("#btn-procurar").onclick = () => { mostrar("assistente"); mudarModo("equipa"); setTimeout(() => $("#entrada").focus(), 60); };
  $("#btn-sino").onclick = () => mostrar("obras");
  $("#btn-tour").onclick = () => (tourAtivo ? pararTour() : tour());
  $("#tour-parar").onclick = pararTour;
  // switching language keeps the section that is open
  $$(".idiomas a").forEach((a) => (a.onclick = () => { a.href = a.getAttribute("href").split("#")[0] + location.hash; }));
  $("#modal-proposta").onclick = (e) => { if (e.target.id === "modal-proposta") fecharProposta(); };
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("#btn-procurar").click(); }
    if (e.key === "Escape") { fecharProposta(); if (tourAtivo) pararTour(); }
  });
  mostrar((location.hash || "#painel").slice(1));
});
