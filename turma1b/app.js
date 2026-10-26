// Resumo da Turma 1.º B: sign in with the phone (SMS code), then the class agenda, notices and Daniela.
// Works both on febreroai.com/turma1b (calls the API on Railway, set in <meta name="api">) and on the API's own host.
import { DC, MES, destaque, diaSemana, dt, fmtH, itens, mais, minutos, nomeDia, segunda } from "./agenda.js?v=2";
import { validarAtividades } from "./atividades.js?v=1";

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (t) => String(t ?? "").replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[c]));
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};
const META = ($('meta[name="api"]')?.content || "").replace(/\/$/, "");
const BASE = !META || new URL(META).origin === location.origin ? "" : META;
const TK = "turma1b-token";
const calma = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

let token = store.get(TK);
let S = null, D = null, HOJE = null, PROXIMO = null;
let demo = false, respDemo = null; // demonstration: example data, nothing goes to the server

// ---------- API ----------
async function api(metodo, rota, corpo) {
  let r;
  try {
    r = await fetch(BASE + rota, {
      method: metodo,
      headers: { ...(corpo ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: "Bearer " + token } : {}) },
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch { throw Object.assign(new Error("Sem ligação à internet. Tente outra vez."), { status: 0 }); }
  let j = {};
  try { j = await r.json(); } catch {}
  if (r.status === 401 && token) { esquecer(); throw Object.assign(new Error(j.erro || "Sessão terminada."), { status: 401 }); }
  if (!r.ok) throw Object.assign(new Error(j.erro || "Algo correu mal. Tente outra vez."), { status: r.status });
  return j;
}
function esquecer() { token = null; store.del(TK); }

// ---------- sign in ----------
const fmtNum = (n) => n.replace(/^\+351(\d{3})(\d{3})(\d{3})$/, "+351 $1 $2 $3");
function erro(sel, texto) { const el = $(sel); el.textContent = texto || ""; el.hidden = !texto; }
let numAtual = "", relogio = null;

function mostrarEntrar() {
  sairDoTour();
  demo = false;
  document.body.classList.remove("em-demo");
  $("#demo-faixa").hidden = true;
  $("#carrega").hidden = true;
  $("#entrar").hidden = false;
  $(".nav").hidden = true;
  $("#rodape").hidden = true;
  $$('[role="tabpanel"]').forEach((p) => (p.hidden = true));
  $("#f-num").hidden = false;
  $("#f-cod").hidden = true;
  setTimeout(() => $("#num").focus(), 50);
}
function contagem() {
  let s = 30;
  const b = $("#reenviar");
  b.disabled = true;
  clearInterval(relogio);
  const pinta = () => (b.textContent = s > 0 ? `Reenviar código (${s} s)` : "Reenviar código");
  pinta();
  relogio = setInterval(() => { s--; pinta(); if (s <= 0) { clearInterval(relogio); b.disabled = false; } }, 1000);
}
async function pedir(numero) {
  const r = await api("POST", "/api/codigo", { numero });
  numAtual = r.numero;
  $("#cod-num").textContent = fmtNum(numAtual);
  $("#f-num").hidden = true;
  $("#f-cod").hidden = false;
  $("#cod").value = "";
  erro("#e-cod");
  contagem();
  setTimeout(() => $("#cod").focus(), 50);
}
$("#f-num").addEventListener("submit", async (e) => {
  e.preventDefault();
  erro("#e-num");
  const n = $("#num").value.trim();
  if (!n) return erro("#e-num", "Escreva o seu número de telemóvel.");
  const b = $("#b-num");
  b.disabled = true; b.textContent = "A enviar…";
  try { await pedir(n); } catch (x) { erro("#e-num", x.message); }
  finally { b.disabled = false; b.textContent = "Receber código por SMS"; }
});
$("#cod").addEventListener("input", () => {
  const c = $("#cod");
  c.value = c.value.replace(/\D/g, "").slice(0, 6);
  if (c.value.length === 6) $("#f-cod").requestSubmit();
});
$("#f-cod").addEventListener("submit", async (e) => {
  e.preventDefault();
  erro("#e-cod");
  const codigo = $("#cod").value;
  if (codigo.length !== 6) return erro("#e-cod", "O código tem 6 números.");
  const b = $("#b-cod");
  b.disabled = true; b.textContent = "A entrar…";
  try {
    const r = await api("POST", "/api/entrar", { numero: numAtual, codigo });
    token = r.token;
    store.set(TK, token);
    clearInterval(relogio);
    $("#entrar").hidden = true;
    await carregar(true);
  } catch (x) { erro("#e-cod", x.message); $("#cod").select(); }
  finally { b.disabled = false; b.textContent = "Entrar"; }
});
$("#reenviar").addEventListener("click", async () => {
  try { await pedir(numAtual); toast("Pedimos um novo código."); } catch (x) { erro("#e-cod", x.message); }
});
$("#mudar").addEventListener("click", () => { clearInterval(relogio); $("#f-cod").hidden = true; $("#f-num").hidden = false; $("#num").focus(); });

// ---------- load ----------
async function carregar(primeiraVez = false) {
  $("#carrega").hidden = false;
  $("#carrega").textContent = "A abrir…";
  try { S = await api("GET", "/api/turma"); }
  catch (x) {
    if (x.status === 401 || !token) return mostrarEntrar();
    $("#carrega").innerHTML = `${esc(x.message)} <button class="linkbtn" type="button" id="tentar">Tentar de novo</button>`;
    $("#tentar").addEventListener("click", () => carregar());
    return;
  }
  D = S.dados; D.minhasAtividades = S.atividades?.minhas || []; HOJE = S.hoje; PROXIMO = S.proximo || S.hoje;
  semana0 = segunda(PROXIMO); semana = 0; diaSel = PROXIMO;
  $("#carrega").hidden = true;
  $(".nav").hidden = false;
  $("#rodape").hidden = false;
  desenharInicio();
  desenharDados();
  $("#docs").innerHTML = D.docs.map((d) => `<div class="doc">${d.url ? `<a href="${esc(d.url)}" target="_blank" rel="noopener">${esc(d.titulo)}</a>` : `<span>${esc(d.titulo)}</span>`}<span>${esc(d.fonte)}</span></div>`).join("")
    + (D.informacoes || []).map((i) => `<div class="doc"><span><b>${esc(i.titulo)}.</b> ${esc(i.texto)}</span><span>${esc(i.fonte)}</span></div>`).join("");
  if (primeiraVez) { show("inicio", true); toast(`Olá${primeiro(S.eu.nome) ? ", " + primeiro(S.eu.nome) : ""}! Já está dentro.`); return; }
  const h = (location.hash || "").slice(1);
  show(tabs.includes(h) ? h : store.get("turma1b-tab") || "inicio");
}
const primeiro = (nome) => (/^utilizador/i.test(nome || "") ? "" : String(nome || "").trim().split(/\s+/)[0]);

// ---------- start ----------
const forte = (t) => esc(t).replace(/\*(.+?)\*/g, "<b>$1</b>");
function desenharInicio() {
  const p = primeiro(S.eu.nome);
  $("#ola").textContent = p ? `olá, ${p}!` : "olá!";
  const R = S.resumo;
  if (R) {
    $("#am-titulo").textContent = R.titulo;
    const minhas = itens(D, R.alvo).filter((e) => e.t === "atividade").map((e) => ["⭐", `*${e.titulo}*, ${fmtH(e.ini)}–${fmtH(e.fim)} (só a sua família vê)`]);
    $("#am-linhas").innerHTML = [...(R.linhas.length ? R.linhas : [["📚", "Um dia normal de aulas."]]), ...minhas].map(([i, t]) => `<li><span aria-hidden="true">${i}</span><span>${forte(t)}</span></li>`).join("");
    $("#am-ver").onclick = () => { irPara(R.alvo); };
  } else {
    $("#am-titulo").textContent = "Sem aulas nos próximos dias";
    $("#am-linhas").innerHTML = "";
    $("#am-ver").onclick = () => show("hoje", true);
  }
  desenharDiscussoes(S.discussoes);
  const avisos = D.avisos.filter((a) => (a.data ? a.data >= HOJE && a.data <= mais(HOJE, 21) : !a.ate || a.ate >= HOJE))
    .sort((a, b) => (a.data || "0").localeCompare(b.data || "0"));
  $("#c-avisos").hidden = !avisos.length;
  items.clear();
  $("#avisos").innerHTML = avisos.map((a) => evBtn({ t: { teste: "teste", tpc: "tpc", feriado: "feriado" }[a.tipo] || "evento", titulo: a.titulo, ini: a.ini, fim: a.fim, det: a.det, fonte: a.fonte, d: a.data, semData: !a.data })).join("");
}
// «Discussões de pais»: Daniela's summary of the class WhatsApp group, one per day (‹ › and the calendar go through the
// days, the search looks in all of them), refreshed every minute while the page is open; the dot is Daniela's WhatsApp
const ESTADO_DISC = { "em aberto": "Em aberto", combinado: "Combinado", "informação": "Informação" };
const haQuanto = (ms) => {
  const m = Math.max(0, Math.round((Date.now() - ms) / 60000));
  return m < 1 ? "agora mesmo" : m < 60 ? `há ${m} min` : m < 1440 ? `há ${Math.round(m / 60)} h` : `há ${Math.round(m / 1440)} dias`;
};
const DISC = { X: null, dia: null, cache: {}, versao: 0, q: "", pedido: 0 };   // dia null = follow the newest day
const limparDisc = () => { Object.assign(DISC, { X: null, dia: null, cache: {}, versao: 0, q: "" }); const q = $("#disc-q"); if (q) q.value = ""; };
// one day (?dia=) or a search (?q=); the demonstration answers from its example days, nothing goes to the server
function pedirDisc(rota) {
  if (!demo) return api("GET", rota);
  const u = new URL(rota, location.origin), dias = S.discussoesDias || {}, dia = u.searchParams.get("dia");
  if (dia) return Promise.resolve({ dia: dias[dia] ? { dia, ...dias[dia] } : null });
  const dobra = (x) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const termos = dobra(u.searchParams.get("q") || "").split(/[^a-z0-9ºª]+/).filter((t) => t.length >= 2);
  const todos = Object.keys(dias).sort().reverse().flatMap((d) => dias[d].temas.map((t) => ({ dia: d, ...t })));
  return Promise.resolve({ resultados: termos.length ? todos.filter((t) => termos.every((x) => dobra(`${t.titulo} ${t.resumo}`).includes(x))) : [] });
}
const nomeDiaDisc = (iso) => {
  if (iso === HOJE) return "Hoje";
  if (iso === mais(HOJE, -1)) return "Ontem";
  return new Intl.DateTimeFormat("pt-PT", { timeZone: "UTC", weekday: "long", day: "2-digit", month: "2-digit" }).format(new Date(iso + "T12:00:00Z"));
};
const horaLx = (ms) => new Intl.DateTimeFormat("pt-PT", { timeZone: "Europe/Lisbon", hour: "2-digit", minute: "2-digit" }).format(ms);
const temaHtml = (t, realce = (x) => esc(x)) => `<li class="disc"><div class="disc-top"><b>${realce(t.titulo)}</b><span class="disc-estado" data-e="${esc(t.estado)}">${esc(ESTADO_DISC[t.estado] || t.estado)}</span></div>`
  + `<p>${realce(t.resumo)}</p>${t.quando ? `<span class="disc-q">${esc(t.quando)}</span>` : ""}</li>`;

function desenharWhatsapp(w) {
  const el = $("#disc-wa");
  el.hidden = !w;
  if (!w) return;
  el.dataset.ok = w.ligado ? "1" : "0";
  $("#disc-wa-txt").textContent = w.ligado ? "a ler o grupo" : `sem acesso desde ${w.desde ? horaLx(w.desde) : "há pouco"}`;
  el.title = w.ligado ? `A Daniela está ligada ao grupo (verificado ${haQuanto(w.visto)}).`
    : `A Daniela está sem acesso ao grupo: o resumo pode estar atrasado.${S?.eu?.admin && w.motivo ? ` (${w.motivo})` : ""}`;
}

function desenharDiscussoes(X) {
  const c = $("#c-discussoes");
  if (!c) return;
  c.hidden = !X;
  if (!X) return;
  if (X.atualizado !== DISC.versao) { DISC.cache = {}; DISC.versao = X.atualizado; }
  DISC.X = X;
  if (X.ultimo) DISC.cache[X.ultimo.dia] = X.ultimo;
  desenharWhatsapp(X.whatsapp);
  if (!DISC.q) mostrarDia(DISC.dia || X.ultimo?.dia || HOJE);
}

async function mostrarDia(dia) {
  const n = ++DISC.pedido;
  if (!(dia in DISC.cache)) {
    try { DISC.cache[dia] = (await pedirDisc(`/api/discussoes?dia=${dia}`)).dia; } catch { DISC.cache[dia] = null; }
    if (n !== DISC.pedido) return;
  }
  const dias = DISC.X?.dias || [], D = DISC.cache[dia];
  const ant = dias.filter((d) => d < dia).at(-1), seg = dias.find((d) => d > dia);
  $("#disc-ant").disabled = !ant; $("#disc-ant").dataset.dia = ant || "";
  $("#disc-seg").disabled = !seg; $("#disc-seg").dataset.dia = seg || "";
  $("#disc-recente").hidden = !DISC.dia || DISC.dia === DISC.X?.ultimo?.dia;
  $("#disc-dia-txt").textContent = nomeDiaDisc(dia);
  const data = $("#disc-data");
  data.value = dia; data.max = HOJE; if (dias[0]) data.min = dias[0];
  $("#disc-atual").textContent = D ? `Atualizado ${haQuanto(D.atualizado)}${D.lidas ? ` · ${D.lidas} mensagens lidas neste dia` : ""}` : "";
  $("#disc-lista").innerHTML = D?.temas?.length ? D.temas.map((t) => temaHtml(t)).join("")
    : `<li class="disc vazio"><p>${dias.length ? "Sem discussões sobre a turma neste dia." : "Ainda não há discussões resumidas."}</p></li>`;
}

function irParaDiaDisc(dia) {
  if (!dia) return;
  DISC.dia = dia === DISC.X?.ultimo?.dia ? null : dia;
  mostrarDia(dia);
}

// the search: every word (accents and case don't matter), in all the days; a result opens its day
const VOGAIS = { a: "[aáàâã]", e: "[eéèê]", i: "[iíì]", o: "[oóòôõ]", u: "[uúùü]", c: "[cç]" };
function realcador(q) {
  const termos = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(/[^a-z0-9ºª]+/).filter((x) => x.length >= 2);
  if (!termos.length) return (x) => esc(x);
  const re = new RegExp(termos.map((x) => [...x].map((ch) => VOGAIS[ch] || ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("")).join("|"), "gi");
  return (texto) => {
    let out = "", ultimo = 0;
    for (const m of String(texto).matchAll(re)) { out += esc(texto.slice(ultimo, m.index)) + `<mark>${esc(m[0])}</mark>`; ultimo = m.index + m[0].length; }
    return out + esc(String(texto).slice(ultimo));
  };
}
let procuraTimer = null;
async function procurarDisc(q) {
  DISC.q = q.trim();
  $("#disc-limpar").hidden = !DISC.q;
  if (DISC.q.length < 2) { DISC.q = ""; return desenharDiscussoes(DISC.X); }
  const n = ++DISC.pedido;
  let r;
  try { r = await pedirDisc(`/api/discussoes?q=${encodeURIComponent(DISC.q)}`); } catch { return; }
  if (n !== DISC.pedido) return;
  const realce = realcador(DISC.q), res = r.resultados || [];
  $("#disc-atual").textContent = res.length ? `${res.length === 40 ? "40 ou mais" : res.length} tema${res.length === 1 ? "" : "s"} com «${DISC.q}»` : `Nada encontrado com «${DISC.q}».`;
  $("#disc-lista").innerHTML = res.map((t) => temaHtml(t, realce).replace('<li class="disc">',
    `<li class="disc"><button class="disc-chip" type="button" data-dia="${esc(t.dia)}">${esc(nomeDiaDisc(t.dia))} ›</button>`)).join("");
}
(function ligarDiscussoes() {
  if (!$("#c-discussoes")) return;
  const limparProcura = () => { $("#disc-q").value = ""; DISC.q = ""; $("#disc-limpar").hidden = true; };
  $("#disc-ant").onclick = (e) => irParaDiaDisc(e.currentTarget.dataset.dia);
  $("#disc-seg").onclick = (e) => irParaDiaDisc(e.currentTarget.dataset.dia);
  $("#disc-recente").onclick = () => { DISC.dia = null; mostrarDia(DISC.X?.ultimo?.dia || HOJE); };
  $("#disc-dia").onclick = () => { const d = $("#disc-data"); try { d.showPicker(); } catch { d.focus(); d.click(); } };
  $("#disc-data").onchange = (e) => { if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) { limparProcura(); irParaDiaDisc(e.target.value); } };
  $("#disc-q").oninput = (e) => { clearTimeout(procuraTimer); procuraTimer = setTimeout(() => procurarDisc(e.target.value), 350); };
  $("#disc-procura").onsubmit = (e) => { e.preventDefault(); clearTimeout(procuraTimer); procurarDisc($("#disc-q").value); $("#disc-q").blur(); };
  $("#disc-limpar").onclick = () => { limparProcura(); desenharDiscussoes(DISC.X); $("#disc-q").focus(); };
  $("#disc-lista").onclick = (e) => {
    const b = e.target.closest(".disc-chip");
    if (b) { limparProcura(); irParaDiaDisc(b.dataset.dia); $("#c-discussoes").scrollIntoView({ behavior: "smooth", block: "start" }); }
  };
})();
setInterval(async () => {
  if (demo || !token || !S || document.visibilityState !== "visible" || $("#p-inicio").hidden) return;
  try { const r = await api("GET", "/api/discussoes"); S.discussoes = r.discussoes; desenharDiscussoes(S.discussoes); } catch {}
}, 60000);

function irPara(iso) {
  semana = Math.round((dt(segunda(iso)) - dt(semana0)) / (7 * 864e5));
  diaSel = iso;
  show("hoje", true);
}

// ---------- tabs ----------
const tabs = ["inicio", "hoje", "daniela", "receber", "dados"];
function show(id, scroll) {
  if (!tabs.includes(id)) id = "inicio";
  tabs.forEach((t) => { $("#t-" + t).setAttribute("aria-selected", t === id); $("#p-" + t).hidden = t !== id; });
  if (id === "daniela" && !$("#chat").children.length) ola();
  if (id === "inicio") desenharInicio(); // the agenda reuses the item map, so the notice buttons are drawn again
  store.set("turma1b-tab", id);
  document.body.classList.toggle("largo", id === "hoje");
  if (id === "hoje") desenhar();
  if (scroll) scrollTo({ top: 0, behavior: calma() ? "auto" : "smooth" });
}
$$(".nav button").forEach((b) => b.addEventListener("click", () => show(b.id.slice(2), true)));
document.addEventListener("click", (e) => {
  const go = e.target.closest("[data-go]"); if (go) { e.preventDefault(); show(go.dataset.go, true); }
  const t = e.target.closest("[data-toast]"); if (t) toast(t.dataset.toast);
  const c = e.target.closest("[data-cal]"); if (c) abrirCalendario();
  const tp = e.target.closest("[data-tpc]"); if (tp) abrirTpc();
});
let toastTimer;
function toast(text) { const el = $("#toast"); el.textContent = text; el.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => (el.hidden = true), 3400); }

// ---------- agenda ----------
const items = new Map();
let nItem = 0, semana = 0, semana0 = null, diaSel = null;
const reg = (e) => { const id = "i" + nItem++; items.set(id, e); return id; };
const fimDoAno = () => D.periodos.at(-1).fim;
// back to the first week of the school year: past tests, menus and notices stay visible
const semanaMin = () => Math.min(0, Math.round((dt(segunda(D.inicioAno || D.periodos[0].ini || HOJE)) - dt(semana0)) / (7 * 864e5)));
const diasDa = (i) => [0, 1, 2, 3, 4].map((n) => mais(semana0, i * 7 + n));
const evBtn = (e) => `<button class="ev tt-${e.t}" type="button" data-it="${reg(e)}"><span><span class="ev-t">${icone(e.t)}${esc(e.titulo)}</span><br><span class="ev-s">${e.semData ? "aviso" : `${e.d && e.d !== diaSel ? esc(nomeDia(e.d)) + " · " : ""}${e.ini ? `${e.ini}${e.fim && e.fim !== e.ini ? "–" + e.fim : ""}` : "todo o dia"}`}${e.nota ? " · " + esc(e.nota) : ""}</span></span><span class="mais" aria-hidden="true">${e.t === "almoco" ? "ementa" : "ver"}${SETA}</span></button>`;
function desenhar() {
  items.clear(); nItem = 0;
  const dias = diasDa(semana), a = dt(dias[0]), b = dt(dias[4]);
  $("#cal-titulo").textContent = a.getUTCMonth() === b.getUTCMonth() ? `${a.getUTCDate()} a ${b.getUTCDate()} de ${MES[b.getUTCMonth()]}` : `${a.getUTCDate()} de ${MES[a.getUTCMonth()]} a ${b.getUTCDate()} de ${MES[b.getUTCMonth()]}`;
  $("#cal-prev").disabled = semana <= semanaMin();
  $("#cal-next").disabled = mais(dias[0], 7) > fimDoAno();
  if (!dias.includes(diaSel)) diaSel = dias[0];
  $("#cal-dias").innerHTML = dias.map((iso) => {
    const x = dt(iso), tipos = [...new Set(itens(D, iso).filter(destaque).map((e) => e.t))];
    return `<button class="dchip" role="tab" type="button" aria-selected="${iso === diaSel}" data-dia="${iso}"><span class="dn">${DC[x.getUTCDay()]}</span><span class="dd">${x.getUTCDate()}</span><span class="dots">${tipos.map((t) => `<i class="tt-${t}"></i>`).join("")}</span></button>`;
  }).join("");
  const todos = itens(D, diaSel), hi = todos.filter(destaque), almoco = todos.find((e) => e.t === "almoco");
  const aulas = todos.filter((e) => ["aula", "teste", "pausa", "almoco", "atividade"].includes(e.t)).sort((p, q) => minutos(p.ini) - minutos(q.ini));
  const marca = diaSel === HOJE ? ' <span class="chip info">hoje</span>' : diaSel === PROXIMO ? ' <span class="chip info">próximo dia de aulas</span>' : "";
  $("#cal-dia").innerHTML = `<p class="dia-t">${nomeDia(diaSel)}${marca}</p>`
    + (hi.length ? `<div class="grupo"><h3>Destaques</h3>${hi.map(evBtn).join("")}</div>` : "")
    + (almoco ? `<div class="grupo"><h3>Almoço</h3>${evBtn(almoco)}</div>` : "")
    + (aulas.length ? `<div class="grupo"><h3>Horário do dia</h3><div class="horario">${aulas.map((e) => {
      const pausa = e.t === "pausa";
      // the dish is already in the "Almoço" group above; here, squeezed between the time and the pill, it would wrap word by word
      const rotulo = e.t === "almoco" ? `${icone("almoco")}Almoço` :`${["teste", "atividade"].includes(e.t) ? icone(e.t) : ""}${esc(e.titulo)}`;
      const fim = pausa ? "" : e.t === "almoco" && e.menu ? `<span class="mais" aria-hidden="true">ementa${SETA}</span>` : '<span class="chev" aria-hidden="true">›</span>';
      return `<button class="aula tt-${e.t}${pausa ? " pausa" : ""}" type="button" ${pausa ? "disabled" : `data-it="${reg(e)}"`}><span class="h">${e.ini}–${e.fim}</span><span class="s">${rotulo}</span>${fim}</button>`;
    }).join("")}</div></div>` : "")
    + (!todos.length ? '<p class="vazio">Sem aulas neste dia.</p>' : "");
  // the grid opens earlier or later for the family's own activities (judo at 8h10, inglês until 17h35)
  const minhas = D.minhasAtividades || [], PX = 56;
  const H0 = Math.min(9, ...minhas.map((a) => Math.floor(minutos(a.ini) / 60))), H1 = Math.max(16, ...minhas.map((a) => Math.ceil(minutos(a.fim) / 60)));
  let g = '<div class="sm-c"></div>' + dias.map((iso) => { const d = dt(iso); return `<div class="sm-h${iso === PROXIMO ? " prox" : ""}"><b>${d.getUTCDate()}</b><span>${DC[d.getUTCDay()]}</span></div>`; }).join("");
  g += '<div class="sm-lbl">Dia</div>' + dias.map((iso) => `<div class="sm-allday">${itens(D, iso).filter((e) => !e.ini || e.allday).map((e) => `<button class="pill tt-${e.t}" type="button" data-it="${reg(e)}" title="${esc(e.titulo)}">${icone(e.t)}${esc(e.t === "atend" ? `Atendimento ${e.ini}` : e.ini ? `${e.ini} ${e.titulo}` : e.titulo)}</button>`).join("")}</div>`).join("");
  g += `<div class="sm-horas" style="height:${(H1 - H0) * PX}px">${Array.from({ length: H1 - H0 - 1 }, (_, k) => `<span style="top:${(k + 1) * PX}px">${String(H0 + k + 1).padStart(2, "0")}:00</span>`).join("")}</div>`;
  g += dias.map((iso) => `<div class="sm-col${D.feriados[iso] ? " fer" : ""}" style="height:${(H1 - H0) * PX}px">${itens(D, iso).filter((e) => e.ini && !e.allday).map((e) => {
    const top = (minutos(e.ini) - H0 * 60) / 60 * PX, alt = Math.max(22, (minutos(e.fim) - minutos(e.ini)) / 60 * PX - 2);
    const pausa = e.t === "pausa";
    return `<button class="blk tt-${e.t}${pausa ? " pausa" : ""}" type="button" ${pausa ? "disabled" : `data-it="${reg(e)}" title="${e.t === "almoco" ? "Ver a ementa" : "Ver mais"}"`} style="top:${top + 1}px;height:${alt}px"><b>${e.t === "almoco" ? icone("almoco") + "Almoço" : (["teste", "atividade"].includes(e.t) ? icone(e.t) : "") + esc(e.titulo)}</b>${alt > 34 ? `<span>${e.ini}–${e.fim}</span>` : ""}</button>`;
  }).join("")}</div>`).join("");
  $("#cal-semana").innerHTML = g;
  desenharAtividades();
}
// «As atividades do seu filho»: the family's own list (only this number sees it, in this agenda and its calendar feed)
const DIAS_CURTOS = ["", "seg", "ter", "qua", "qui", "sex"];
const diasTexto = (dias) => (dias.length === 5 ? "todos os dias" : dias.map((d) => DIAS_CURTOS[d]).join(", ").replace(/, ([^,]*)$/, " e $1"));
function desenharAtividades() {
  const c = $("#ativ");
  if (!c) return;
  c.hidden = !S?.atividades;
  if (c.hidden) return;
  const minhas = S.atividades.minhas || [];
  $("#ativ-lista").innerHTML = minhas.map((a, i) => `<li class="ativ-item tt-atividade">${icone("atividade")}<span><b>${esc(a.nome)}</b><span class="soft">${esc(diasTexto(a.dias))} · ${esc(fmtH(a.ini))}–${esc(fmtH(a.fim))}</span></span>`
    + `<button class="ativ-x" type="button" data-tirar="${i}" aria-label="Tirar ${esc(a.nome)}">×</button></li>`).join("");
  $("#ativ-intro").hidden = minhas.length > 0;
}
async function guardarAtividades(lista) {
  let minhas;
  if (demo) {                                   // the demonstration checks them here and keeps nothing
    const r = validarAtividades(lista, D.periodos[0].ini, D.periodos[0].ini);
    if (r.erro) throw new Error(r.erro);
    minhas = r.lista;
  } else minhas = (await api("POST", "/api/atividades", { lista })).minhas;
  S.atividades.minhas = minhas;
  D.minhasAtividades = minhas;
  desenhar();
  desenharInicio();
}
function formAtividade() {
  const cat = S.atividades.catalogo || [];
  const qual = $("#ativ-qual"), hor = $("#ativ-hor");
  qual.innerHTML = cat.map((c) => `<option value="${esc(c.id)}">${esc(c.nome)}</option>`).join("");
  const marcar = (dias) => $$("#ativ-form .ativ-dias input").forEach((x) => { x.checked = dias.includes(+x.value); });
  const usar = (h) => { if (!h) return; marcar(h.dias); $("#ativ-ini").value = h.ini; $("#ativ-fim").value = h.fim; };
  const mudou = () => {
    const c = cat.find((x) => x.id === qual.value) || {};
    $("#ativ-nome-l").hidden = c.id !== "outra";
    $("#ativ-hor-l").hidden = (c.horarios || []).length < 2;
    hor.innerHTML = (c.horarios || []).map((h, i) => `<option value="${i}">${esc(diasTexto(h.dias))}, ${esc(fmtH(h.ini))}–${esc(fmtH(h.fim))}</option>`).join("");
    if (c.horarios?.length) usar(c.horarios[0]); else { marcar([]); $("#ativ-ini").value = ""; $("#ativ-fim").value = ""; }
    $("#ativ-nota").textContent = c.horarios?.length ? `Horário do colégio para o 1.º ano${c.nota ? ` (${c.nota})` : ""}: tire os dias em que o seu filho não vai.` : c.nota || "";
    $("#ativ-erro").hidden = true;
  };
  qual.onchange = mudou;
  hor.onchange = () => usar((cat.find((x) => x.id === qual.value)?.horarios || [])[+hor.value]);
  mudou();
}
(function ligarAtividades() {
  if (!$("#ativ")) return;
  $("#ativ-mais").onclick = () => { formAtividade(); $("#ativ-form").hidden = false; $("#ativ-mais").hidden = true; $("#ativ-qual").focus(); };
  const fecharForm = () => { $("#ativ-form").hidden = true; $("#ativ-mais").hidden = false; };
  $("#ativ-cancelar").onclick = fecharForm;
  $("#ativ-form").onsubmit = async (e) => {
    e.preventDefault();
    const nova = { id: $("#ativ-qual").value, nome: $("#ativ-nome").value.trim(), ini: $("#ativ-ini").value, fim: $("#ativ-fim").value,
      dias: $$("#ativ-form .ativ-dias input").filter((x) => x.checked).map((x) => +x.value) };
    try { await guardarAtividades([...(S.atividades.minhas || []), nova]); fecharForm(); toast(`${nova.id === "outra" ? nova.nome : $("#ativ-qual").selectedOptions[0].text} está na sua agenda.${demo ? " (Na demonstração nada fica guardado.)" : ""}`); }
    catch (err) { $("#ativ-erro").textContent = err.message || "Não consegui guardar. Tente outra vez."; $("#ativ-erro").hidden = false; }
  };
  $("#ativ-lista").onclick = async (e) => {
    const b = e.target.closest("[data-tirar]");
    if (!b) return;
    const lista = [...(S.atividades.minhas || [])];
    const [tirada] = lista.splice(+b.dataset.tirar, 1);
    try { await guardarAtividades(lista); toast(`${tirada.nome} saiu da sua agenda.`); } catch (err) { toast(err.message || "Não consegui tirar. Tente outra vez."); }
  };
})();

$("#cal-prev").addEventListener("click", () => { semana = Math.max(semanaMin(), semana - 1); diaSel = diasDa(semana)[0]; desenhar(); });
$("#cal-next").addEventListener("click", () => { semana++; diaSel = diasDa(semana)[0]; desenhar(); });
$("#cal-dias").addEventListener("click", (e) => { const b = e.target.closest("[data-dia]"); if (b) { diaSel = b.dataset.dia; desenhar(); } });

// ---------- detail sheet ----------
const TIPO = { teste: "Teste", aula: "Aula", almoco: "Almoço", evento: "Evento", feriado: "Feriado", atend: "Atendimento", tpc: "TPC", atividade: "Atividade · só a sua família vê" };
let ultimoFoco = null;
function folha(html, classe = "") {
  ultimoFoco = document.activeElement;
  $("#sheet").className = `sheet ${classe}`;
  $("#sheet-c").innerHTML = html;
  $("#sheet-bg").hidden = false; $("#sheet").hidden = false; $("#sheet-x").focus();
}
function abrir(e) {
  const quando = e.semData ? "Aviso" : `${nomeDia(e.d)}${e.ini ? ` · ${e.ini}${e.fim && e.fim !== e.ini ? "–" + e.fim : ""}` : " · todo o dia"}`;
  const corpo = e.menu ? `<ul><li><b>Sopa:</b> ${esc(e.menu.sopa)}</li><li><b>Prato:</b> ${esc(e.menu.prato)}</li><li><b>Dieta:</b> ${esc(e.menu.dieta)}</li><li><b>Sobremesa:</b> ${esc(e.menu.sobremesa)}</li><li><b>Lanche:</b> ${esc(e.menu.lanche)}</li></ul>` : e.det ? `<p>${esc(e.det)}</p>` : "";
  folha(`<span class="tipo">${TIPO[e.t] || ""}</span><h3 id="sh-t">${esc(e.t === "almoco" ? "Almoço" : e.titulo)}</h3><p class="quando">${esc(quando)}</p>${e.nota ? `<span class="chip ${e.nota === "confirmado" ? "ok" : "warn"}" style="align-self:flex-start">${esc(e.nota === "confirmado" ? "confirmado por 2 famílias" : "por confirmar: só uma família o enviou")}</span>` : ""}${corpo}${e.fonte ? `<p class="fonte">fonte: ${esc(e.fonte)}</p>` : ""}
    <div class="btns"><button class="btn" type="button" id="sh-ask">${e.t === "atividade" ? "Mudar as atividades" : "Perguntar à Daniela"}</button></div>`, `tt-${e.t}`);
  $("#sh-ask").addEventListener("click", () => {
    if (e.t === "atividade") { fechar(); show("hoje", true); $("#ativ").scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    fechar(); show("daniela", true);
    perguntar(e.t === "teste" ? "Quando é o próximo teste?" : e.t === "almoco" ? "O que há para o almoço esta semana?" : e.t === "atend" ? "Quando é o atendimento da professora?" : e.t === "aula" ? `Que aulas há na ${nomeDia(e.d).split(",")[0].toLowerCase()}?` : `Fala-me de: ${e.titulo}`);
  });
}
function abrirCalendario() {
  if (demo) return toast("Depois de entrar, um toque põe a agenda no calendário do seu telemóvel.");
  const c = S?.calendario;
  if (!c) return;
  folha(`<span class="tipo" style="--t:var(--blue)">Calendário</span><h3 id="sh-t">A agenda no seu telemóvel</h3>
    <p>Testes, feriados, períodos e avisos com data entram no calendário do telemóvel e atualizam-se sozinhos.</p>
    <div class="cal-opts">
      <a class="btn primary" href="${esc(c.webcal)}">iPhone, iPad ou Mac</a>
      <a class="btn" href="${esc(c.google)}" target="_blank" rel="noopener">Google Calendar</a>
      <button class="btn" type="button" id="cal-copiar">Copiar o link (Outlook e outros)</button>
    </div>
    <p class="fonte">No Android, o Google Calendar abre melhor no computador: depois aparece sozinho no telemóvel. O link é só seu: não o partilhe.</p>`);
  $("#cal-copiar").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(c.https); toast("Link copiado."); } catch { prompt("Copie o link:", c.https); }
  });
}
// ---------- share the homework ----------
// Photos are shrunk on the phone (longest side 1600 px, JPEG) before going up; the server reads and drops them.
async function reduzir(ficheiro, max = 1600) {
  const url = URL.createObjectURL(ficheiro);
  try {
    const img = await new Promise((ok, falha) => { const i = new Image(); i.onload = () => ok(i); i.onerror = falha; i.src = url; });
    const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.85);
  } finally { URL.revokeObjectURL(url); }
}
async function atualizar() {
  try { S = await api("GET", "/api/turma"); D = S.dados; D.minhasAtividades = S.atividades?.minhas || []; HOJE = S.hoje; PROXIMO = S.proximo || S.hoje; desenharInicio(); if (!$("#p-hoje").hidden) desenhar(); } catch {}
}
function abrirTpc() {
  if (!S) return;
  const dias = S.tpcDias || [];
  folha(`<span class="tipo">TPC</span><h3 id="sh-t">Partilhar o TPC</h3>
    <p>Viu o TPC na mochila ou no caderno? Escreva-o ou tire uma foto da folha, e fica na agenda para todas as famílias.</p>
    <form id="f-tpc" class="tpc-f" novalidate>
      <label class="campo">Para quando?<select id="tpc-dia">${dias.map((d, i) => `<option value="${d}"${i === 0 ? " selected" : ""}>${esc(nomeDia(d))}</option>`).join("")}<option value="">Não sei</option></select></label>
      <label class="campo">O que é?<textarea id="tpc-txt" rows="3" maxlength="500" placeholder="Ex.: Matemática, ficha da página 23"></textarea></label>
      <label class="btn foto"><input type="file" id="tpc-foto" accept="image/*" hidden><span aria-hidden="true">📷</span> <span id="tpc-foto-t">Tirar ou escolher uma foto</span></label>
      <img id="tpc-prev" class="tpc-prev" alt="Foto escolhida" hidden>
      <p class="erro" id="e-tpc" role="alert" hidden></p>
      <button class="btn primary full" type="submit" id="b-tpc">Partilhar</button>
      <p class="fonte">A foto é lida pela IA só para tirar o texto do TPC e é apagada logo a seguir. Evite fotografar nomes ou caras.</p>
    </form>`, "tt-tpc");
  let foto = null, diaEscolhido = false; // an untouched day lets the AI take the day written in the photo or text
  $("#tpc-dia").addEventListener("change", () => (diaEscolhido = true));
  $("#tpc-foto").addEventListener("change", async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    erro("#e-tpc");
    try { foto = await reduzir(f); $("#tpc-prev").src = foto; $("#tpc-prev").hidden = false; $("#tpc-foto-t").textContent = "Trocar a foto"; }
    catch { foto = null; erro("#e-tpc", "Não consegui abrir esta foto. Tente outra."); }
  });
  $("#f-tpc").addEventListener("submit", async (e) => {
    e.preventDefault();
    erro("#e-tpc");
    const texto = $("#tpc-txt").value.trim();
    if (!texto && !foto) return erro("#e-tpc", "Escreva o TPC ou tire uma foto da folha.");
    if (demo) {
      $("#sheet-c").innerHTML = `<span class="tipo">TPC</span><h3 id="sh-t">É assim que funciona!</h3><p>Depois de entrar, o TPC fica logo na agenda, marcado «por confirmar». Quando outra família envia o mesmo, passa a «confirmado».</p><p class="fonte">Na demonstração nada é enviado.</p>`;
      return;
    }
    const b = $("#b-tpc");
    b.disabled = true; b.textContent = foto ? "A ler a foto…" : "A partilhar…";
    try {
      const r = await api("POST", "/api/tpc", { data: diaEscolhido ? $("#tpc-dia").value : "", texto, foto });
      $("#sheet-c").innerHTML = r.revisao
        ? `<span class="tipo">TPC</span><h3 id="sh-t">Obrigado!</h3><p>Não consegui ler um TPC claro. O Pedro vai ver e, se estiver certo, aparece na agenda.</p>`
        : `<span class="tipo">TPC</span><h3 id="sh-t">Obrigado!</h3><p>Ficou na agenda de <b>${esc(nomeDia(r.data))}</b>:</p>
          <ul>${r.tarefas.map((t) => `<li>${esc(t.titulo)} <span class="soft">· ${t.confirmado ? "confirmado por 2 famílias" : "por confirmar"}</span></li>`).join("")}</ul>
          <p class="fonte">Quando outra família enviar o mesmo, passa a «confirmado».</p>
          <div class="btns"><button class="btn primary" type="button" id="tpc-ver">Ver na agenda</button></div>`;
      await atualizar();
      $("#tpc-ver")?.addEventListener("click", () => { fechar(); irPara(r.data); });
    } catch (x) {
      if (x.status === 401) { fechar(); return mostrarEntrar(); }
      erro("#e-tpc", x.message);
      b.disabled = false; b.textContent = "Partilhar";
    }
  });
}
function fechar() { $("#sheet").hidden = true; $("#sheet-bg").hidden = true; if (ultimoFoco && ultimoFoco.isConnected) ultimoFoco.focus(); }
document.addEventListener("click", (e) => { const b = e.target.closest("[data-it]"); if (b && items.has(b.dataset.it)) abrir(items.get(b.dataset.it)); });
$("#sheet-x").addEventListener("click", fechar);
$("#sheet-bg").addEventListener("click", fechar);
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#sheet").hidden) fechar(); });

// ---------- Daniela ----------
const chat = $("#chat");
const historico = [];
// Her answers: plain text with "- " lists, **bold** and a final "fonte: …" line. Escaped first, then formatted.
function formatar(texto) {
  const linhas = esc(texto).split(/\n+/).map((l) => l.trim()).filter(Boolean);
  let out = "", lista = false;
  for (const l of linhas) {
    const li = /^[-•*]\s+(.*)$/.exec(l);
    if (li && !lista) { out += "<ul>"; lista = true; }
    if (!li && lista) { out += "</ul>"; lista = false; }
    const f = (t) => t.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
    if (li) out += `<li>${f(li[1])}</li>`;
    else if (/^fontes?:/i.test(l)) out += `<span class="src">${f(l)}</span>`;
    else out += `<p>${f(l)}</p>`;
  }
  return out + (lista ? "</ul>" : "");
}
function bolha(html, quem) {
  const m = document.createElement("div");
  m.className = "msg " + quem;
  m.innerHTML = quem === "ai" ? `<span class="who"><img src="daniela.jpg" alt="">Daniela · IA</span>${html}` : html;
  chat.append(m);
  chat.scrollTop = chat.scrollHeight;
  return m;
}
let aPensar = false;
async function perguntar(texto) {
  texto = String(texto || "").trim();
  if (!texto || aPensar) return;
  aPensar = true;
  $("#enviar").disabled = true;
  bolha(esc(texto), "me");
  historico.push({ role: "user", content: texto });
  const t = document.createElement("div");
  t.className = "typing"; t.textContent = "A Daniela está a escrever…";
  chat.append(t); chat.scrollTop = chat.scrollHeight;
  try {
    const r = demo ? await new Promise((ok) => setTimeout(() => ok({ resposta: respDemo(S, texto) }), calma() ? 0 : 900))
      : await api("POST", "/api/daniela", { mensagens: historico.slice(-8) });
    historico.push({ role: "assistant", content: r.resposta });
    t.remove();
    bolha(formatar(r.resposta), "ai");
  } catch (x) {
    historico.pop();
    t.remove();
    if (x.status === 401) return mostrarEntrar();
    bolha(`<p>${esc(x.message)}</p>`, "ai");
  } finally { aPensar = false; $("#enviar").disabled = false; }
}
function ola() {
  const p = primeiro(S?.eu?.nome);
  bolha(`<p>Olá${p ? `, ${esc(p)}` : ""}! Sou a Daniela, a assistente de IA da turma. Respondo com o horário, a agenda e os avisos do 1.º B, e digo sempre de onde vem cada resposta.${demo ? " Nesta demonstração, experimente as perguntas sugeridas." : ""}</p>`, "ai");
}
// Short labels so several fit on one line; each sends the full question.
[["Próximo teste?", "Quando é o próximo teste?"], ["Há TPC?", "Há TPC?"], ["Material?", "O que é preciso de material?"], ["Aulas de amanhã?", "Que aulas há amanhã?"],
  ["Fim do período?", "Quando acaba o período?"], ["Almoço de amanhã?", "O que há para o almoço amanhã?"], ["Atendimento da professora?", "Quando é o atendimento da professora?"]]
  .forEach(([rotulo, q]) => { const b = document.createElement("button"); b.type = "button"; b.textContent = rotulo; b.addEventListener("click", () => perguntar(q)); $("#sugg").append(b); });
$("#ask").addEventListener("submit", (e) => { e.preventDefault(); const q = $("#q"); perguntar(q.value); q.value = ""; });

// ---------- data + session ----------
function desenharDados() {
  $("#sessao-info").textContent = demo ? "Isto é uma demonstração, com dados de exemplo." : `Entrou como ${S.eu.nome}. A sessão dura 4 meses neste aparelho.`;
  const painel = $("#painel");
  painel.hidden = !S.painel;
  if (S.painel) painel.href = S.painel;
}
async function terminar(todas) {
  if (demo) return sairDemo();
  try { await api("POST", "/api/sair", { todas }); } catch {}
  esquecer();
  historico.length = 0;
  chat.innerHTML = "";
  toast(todas ? "Saiu em todos os aparelhos." : "Saiu. Até breve!");
  mostrarEntrar();
}
$("#sair").addEventListener("click", () => terminar(false));
$("#sair-todos").addEventListener("click", () => terminar(true));

// ---------- "tap for more" signals ----------
const ICONES = {
  almoco: '<path d="M4 11h16M5 11a7 7 0 0 0 14 0M12 4v3"/>',
  teste: '<path d="M4 20l4-1 10-10-3-3L5 16z"/><path d="M14 7l3 3"/>',
  tpc: '<path d="M4 5.5C6 4.5 9 4.5 12 6c3-1.5 6-1.5 8-.5V19c-2-1-5-1-8 .5-3-1.5-6-1.5-8-.5z"/><path d="M12 6v13.5"/>',
  atend: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-3.5 4-5.5 7-5.5s6 2 7 5.5"/>',
  atividade: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  feriado: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
  evento: '<path d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z"/><circle cx="12" cy="11" r="2"/>',
};
function icone(t) { return ICONES[t] ? `<svg class="ti" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[t]}</svg>` : ""; }
const SETA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
if (store.get("turma1b-dica")) $("#dica-agenda").hidden = true;
$("#dica-x").addEventListener("click", () => { $("#dica-agenda").hidden = true; store.set("turma1b-dica", "1"); });

// ---------- dark by default; the sun/moon button switches, remembered on this device ----------
function aplicarTema(t) {
  document.documentElement.dataset.theme = t;
  store.set("turma1b-tema", t);
  $('meta[name="theme-color"]').content = t === "dark" ? "#151820" : "#f7f6f2";
  $("#tema").setAttribute("aria-label", t === "dark" ? "Mudar para o modo claro" : "Mudar para o modo escuro");
}
$("#tema").addEventListener("click", () => aplicarTema(document.documentElement.dataset.theme === "light" ? "dark" : "light"));
aplicarTema(document.documentElement.dataset.theme === "light" ? "light" : "dark");

// ---------- demonstration (example data, guided tour) ----------
const hojeLisboa = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon" }).format(new Date());
const visivel = (sel) => { const el = $(sel); return el && el.offsetParent !== null ? el : null; };
const almocoVisivel = () => visivel("#cal-dia .aula.tt-almoco") || visivel("#cal-semana .blk.tt-almoco");
async function entrarDemo() {
  const m = await import("./demo.js?v=3");
  respDemo = m.respostaDemo;
  demo = true;
  limparDisc();
  S = m.sessaoDemo(hojeLisboa()); D = S.dados; D.minhasAtividades = S.atividades?.minhas || []; HOJE = S.hoje; PROXIMO = S.proximo;
  semana0 = segunda(PROXIMO); semana = 0; diaSel = PROXIMO;
  historico.length = 0; chat.innerHTML = "";
  document.body.classList.add("em-demo");
  $("#demo-faixa").hidden = false;
  $("#entrar").hidden = true; $("#carrega").hidden = true; $(".nav").hidden = false; $("#rodape").hidden = false;
  $("#docs").innerHTML = "";
  desenharDados();
  show("inicio", true);
  iniciarTour();
}
function sairDemo() {
  sairDoTour();
  demo = false; S = null;
  limparDisc();
  historico.length = 0; chat.innerHTML = "";
  if (location.hash === "#demo") history.replaceState(null, "", location.pathname + location.search);
  if (token) { document.body.classList.remove("em-demo"); $("#demo-faixa").hidden = true; return carregar(); }
  mostrarEntrar();
}
const PASSOS = [
  { tab: "inicio", alvo: () => $("#c-amanha"), texto: "Todos os dias, o essencial do próximo dia de aulas: testes, TPC e almoço." },
  { tab: "inicio", alvo: () => $("#c-discussoes"), texto: "A Daniela está no grupo de WhatsApp da turma: lê as mensagens e as fotos das fichas e resume aqui os temas de cada dia. O ponto verde diz que está a ler o grupo.", dur: 7000 },
  { tab: "inicio", antes: () => { $("#disc-q").value = "visita"; procurarDisc("visita"); }, alvo: () => $(".disc-barra"), texto: "Com as setas ou o calendário anda pelos dias; a pesquisa encontra um tema em qualquer dia.", dur: 5500,
    depois: () => { $("#disc-q").value = ""; $("#disc-limpar").hidden = true; DISC.q = ""; desenharDiscussoes(DISC.X); } },
  { tab: "hoje", antes: () => { diaSel = S.dias[1]; desenhar(); }, alvo: () => visivel("#cal-dias") || visivel("#cal-semana"), texto: "Na agenda, toque num dia para ver as aulas, os testes e o almoço." },
  { tab: "hoje", alvo: almocoVisivel, texto: "Toque no almoço…", dur: 3500 },
  { tab: "hoje", antes: () => { const b = almocoVisivel(); if (b && items.has(b.dataset.it)) abrir(items.get(b.dataset.it)); }, alvo: () => $("#sheet"), texto: "…e aparece a ementa do dia. Os testes, o TPC e os avisos abrem da mesma maneira.", dur: 5000, depois: () => fechar() },
  { tab: "hoje", alvo: () => $("#ativ"), texto: "Acrescente as atividades do seu filho (judo, inglês, o Estudo…): entram na sua agenda e no calendário do telemóvel. Só a sua família as vê.", dur: 6500 },
  { tab: "daniela", antes: () => { if (!historico.length) perguntar("O que há para o almoço amanhã?"); }, alvo: () => $("#p-daniela"), texto: "Uma dúvida? Pergunte à Daniela: responde em segundos, sempre com a fonte.", dur: 6500 },
  { tab: "inicio", alvo: () => $(".tpc-c"), texto: "Viu o TPC na mochila? Partilhe-o com uma foto e ajuda a turma inteira." },
];
let tour = null;
function iniciarTour() { sairDoTour(); tour = { i: -1, timer: null, medir: null }; $("#tour").hidden = false; passo(0); }
function sairDoTour() {
  if (!tour) return;
  clearTimeout(tour.timer);
  tour = null;
  $("#tour").hidden = true; $("#tour-foco").hidden = true;
  if (!$("#sheet").hidden) fechar();
}
function botoesTour(html) { $("#tour-bts").innerHTML = html; }
function passo(i) {
  if (!tour) return;
  clearTimeout(tour.timer);
  PASSOS[tour.i]?.depois?.();
  tour.i = i;
  if (i >= PASSOS.length) return fimDoTour();
  const p = PASSOS[i];
  if (p.tab) show(p.tab, false);
  p.antes?.();
  $("#tour-passo").textContent = `Demonstração · ${i + 1} de ${PASSOS.length}`;
  $("#tour-pontos").innerHTML = PASSOS.map((_, k) => `<i class="${k <= i ? "on" : ""}"></i>`).join("");
  $("#tour-texto").textContent = p.texto;
  botoesTour('<button class="linkbtn" type="button" data-tour="sair">Saltar</button><button class="btn primary" type="button" data-tour="seguinte">Seguinte ›</button>');
  setTimeout(() => { if (tour && tour.i === i) focar(p.alvo()); }, 150);
  tour.timer = setTimeout(() => passo(i + 1), (p.dur || 4500) + 150);
}
function focar(el) {
  const f = $("#tour-foco"), b = $("#tour-balao");
  if (!el) { f.hidden = true; b.className = "tour-balao em-baixo"; return; }
  if (el.id !== "sheet") el.scrollIntoView({ block: "center", behavior: calma() ? "auto" : "smooth" });
  const medir = () => {
    if (!tour) return;
    const r = el.getBoundingClientRect();
    const top = Math.max(r.top - 6, 4), fundo = Math.min(r.bottom + 6, innerHeight - 4);
    Object.assign(f.style, { top: `${top}px`, left: `${r.left - 6}px`, width: `${r.width + 12}px`, height: `${Math.max(fundo - top, 40)}px` });
    f.hidden = false;
    b.className = `tour-balao ${(r.top + r.bottom) / 2 > innerHeight * 0.55 ? "em-cima" : "em-baixo"}`;
  };
  tour.medir = medir;
  [0, 180, 360, 700].forEach((ms) => setTimeout(medir, ms)); // again after the sheet's 0.28 s entrance and the smooth scroll
}
function fimDoTour() {
  $("#tour-foco").hidden = true;
  $("#tour-balao").className = "tour-balao ao-centro";
  $("#tour-passo").textContent = "Pronto!";
  $("#tour-pontos").innerHTML = "";
  $("#tour-texto").textContent = "É assim o Resumo da Turma. Para ver a turma a sério, entre com o seu número de telemóvel.";
  botoesTour('<button class="linkbtn" type="button" data-tour="rever">Ver outra vez</button><button class="linkbtn" type="button" data-tour="explorar">Explorar sozinho</button><button class="btn primary" type="button" data-tour="entrar">Entrar com o meu número</button>');
}
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-tour]");
  if (!t || !tour) return;
  const a = t.dataset.tour;
  if (a === "seguinte") passo(tour.i + 1);
  else if (a === "sair" || a === "explorar") sairDoTour();
  else if (a === "rever") iniciarTour();
  else if (a === "entrar") sairDemo();
});
addEventListener("scroll", () => tour?.medir?.(), { passive: true });
addEventListener("resize", () => tour?.medir?.());
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && tour) sairDoTour(); });
$("#ver-demo").addEventListener("click", () => entrarDemo());
$("#demo-cab").addEventListener("click", () => (demo ? iniciarTour() : entrarDemo()));
$("#demo-sair").addEventListener("click", () => sairDemo());
$("#demo-rever").addEventListener("click", () => iniciarTour());

// ---------- start ----------
if (location.hash === "#demo") entrarDemo(); else if (token) carregar(); else mostrarEntrar();
