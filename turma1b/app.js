// Resumo da Turma 1.º B: sign in with the phone (SMS code), then the class agenda, notices and Daniela.
// Works both on febreroai.com/turma1b (calls the API on Railway, set in <meta name="api">) and on the API's own host.
import { DC, MES, destaque, diaSemana, dt, itens, mais, minutos, nomeDia, segunda } from "./agenda.js?v=1";

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
  D = S.dados; HOJE = S.hoje; PROXIMO = S.proximo || S.hoje;
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
    $("#am-linhas").innerHTML = (R.linhas.length ? R.linhas : [["📚", "Um dia normal de aulas."]]).map(([i, t]) => `<li><span aria-hidden="true">${i}</span><span>${forte(t)}</span></li>`).join("");
    $("#am-ver").onclick = () => { irPara(R.alvo); };
  } else {
    $("#am-titulo").textContent = "Sem aulas nos próximos dias";
    $("#am-linhas").innerHTML = "";
    $("#am-ver").onclick = () => show("hoje", true);
  }
  const avisos = D.avisos.filter((a) => (a.data ? a.data >= HOJE && a.data <= mais(HOJE, 21) : !a.ate || a.ate >= HOJE))
    .sort((a, b) => (a.data || "0").localeCompare(b.data || "0"));
  $("#c-avisos").hidden = !avisos.length;
  items.clear();
  $("#avisos").innerHTML = avisos.map((a) => evBtn({ t: { teste: "teste", tpc: "tpc", feriado: "feriado" }[a.tipo] || "evento", titulo: a.titulo, ini: a.ini, fim: a.fim, det: a.det, fonte: a.fonte, d: a.data, semData: !a.data })).join("");
}
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
  const aulas = todos.filter((e) => ["aula", "teste", "pausa", "almoco"].includes(e.t)).sort((p, q) => minutos(p.ini) - minutos(q.ini));
  const marca = diaSel === HOJE ? ' <span class="chip info">hoje</span>' : diaSel === PROXIMO ? ' <span class="chip info">próximo dia de aulas</span>' : "";
  $("#cal-dia").innerHTML = `<p class="dia-t">${nomeDia(diaSel)}${marca}</p>`
    + (hi.length ? `<div class="grupo"><h3>Destaques</h3>${hi.map(evBtn).join("")}</div>` : "")
    + (almoco ? `<div class="grupo"><h3>Almoço</h3>${evBtn(almoco)}</div>` : "")
    + (aulas.length ? `<div class="grupo"><h3>Horário do dia</h3><div class="horario">${aulas.map((e) => {
      const pausa = e.t === "pausa";
      // the dish is already in the "Almoço" group above; here, squeezed between the time and the pill, it would wrap word by word
      const rotulo = e.t === "almoco" ? `${icone("almoco")}Almoço` :`${e.t === "teste" ? icone("teste") : ""}${esc(e.titulo)}`;
      const fim = pausa ? "" : e.t === "almoco" && e.menu ? `<span class="mais" aria-hidden="true">ementa${SETA}</span>` : '<span class="chev" aria-hidden="true">›</span>';
      return `<button class="aula tt-${e.t}${pausa ? " pausa" : ""}" type="button" ${pausa ? "disabled" : `data-it="${reg(e)}"`}><span class="h">${e.ini}–${e.fim}</span><span class="s">${rotulo}</span>${fim}</button>`;
    }).join("")}</div></div>` : "")
    + (!todos.length ? '<p class="vazio">Sem aulas neste dia.</p>' : "");
  const H0 = 9, H1 = 16, PX = 56;
  let g = '<div class="sm-c"></div>' + dias.map((iso) => { const d = dt(iso); return `<div class="sm-h${iso === PROXIMO ? " prox" : ""}"><b>${d.getUTCDate()}</b><span>${DC[d.getUTCDay()]}</span></div>`; }).join("");
  g += '<div class="sm-lbl">Dia</div>' + dias.map((iso) => `<div class="sm-allday">${itens(D, iso).filter((e) => !e.ini || e.allday).map((e) => `<button class="pill tt-${e.t}" type="button" data-it="${reg(e)}" title="${esc(e.titulo)}">${icone(e.t)}${esc(e.t === "atend" ? `Atendimento ${e.ini}` : e.ini ? `${e.ini} ${e.titulo}` : e.titulo)}</button>`).join("")}</div>`).join("");
  g += `<div class="sm-horas" style="height:${(H1 - H0) * PX}px">${Array.from({ length: H1 - H0 - 1 }, (_, k) => `<span style="top:${(k + 1) * PX}px">${String(H0 + k + 1).padStart(2, "0")}:00</span>`).join("")}</div>`;
  g += dias.map((iso) => `<div class="sm-col${D.feriados[iso] ? " fer" : ""}" style="height:${(H1 - H0) * PX}px">${itens(D, iso).filter((e) => e.ini && !e.allday).map((e) => {
    const top = (minutos(e.ini) - H0 * 60) / 60 * PX, alt = Math.max(22, (minutos(e.fim) - minutos(e.ini)) / 60 * PX - 2);
    const pausa = e.t === "pausa";
    return `<button class="blk tt-${e.t}${pausa ? " pausa" : ""}" type="button" ${pausa ? "disabled" : `data-it="${reg(e)}" title="${e.t === "almoco" ? "Ver a ementa" : "Ver mais"}"`} style="top:${top + 1}px;height:${alt}px"><b>${e.t === "almoco" ? icone("almoco") + "Almoço" : (e.t === "teste" ? icone("teste") : "") + esc(e.titulo)}</b>${alt > 34 ? `<span>${e.ini}–${e.fim}</span>` : ""}</button>`;
  }).join("")}</div>`).join("");
  $("#cal-semana").innerHTML = g;
}
$("#cal-prev").addEventListener("click", () => { semana = Math.max(semanaMin(), semana - 1); diaSel = diasDa(semana)[0]; desenhar(); });
$("#cal-next").addEventListener("click", () => { semana++; diaSel = diasDa(semana)[0]; desenhar(); });
$("#cal-dias").addEventListener("click", (e) => { const b = e.target.closest("[data-dia]"); if (b) { diaSel = b.dataset.dia; desenhar(); } });

// ---------- detail sheet ----------
const TIPO = { teste: "Teste", aula: "Aula", almoco: "Almoço", evento: "Evento", feriado: "Feriado", atend: "Atendimento", tpc: "TPC" };
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
    <div class="btns"><button class="btn" type="button" id="sh-ask">Perguntar à Daniela</button></div>`, `tt-${e.t}`);
  $("#sh-ask").addEventListener("click", () => {
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
  try { S = await api("GET", "/api/turma"); D = S.dados; HOJE = S.hoje; PROXIMO = S.proximo || S.hoje; desenharInicio(); if (!$("#p-hoje").hidden) desenhar(); } catch {}
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
  const m = await import("./demo.js?v=1");
  respDemo = m.respostaDemo;
  demo = true;
  S = m.sessaoDemo(hojeLisboa()); D = S.dados; HOJE = S.hoje; PROXIMO = S.proximo;
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
  historico.length = 0; chat.innerHTML = "";
  if (location.hash === "#demo") history.replaceState(null, "", location.pathname + location.search);
  if (token) { document.body.classList.remove("em-demo"); $("#demo-faixa").hidden = true; return carregar(); }
  mostrarEntrar();
}
const PASSOS = [
  { tab: "inicio", alvo: () => $("#c-amanha"), texto: "Todos os dias, o essencial do próximo dia de aulas: testes, TPC e almoço." },
  { tab: "hoje", antes: () => { diaSel = S.dias[1]; desenhar(); }, alvo: () => visivel("#cal-dias") || visivel("#cal-semana"), texto: "Na agenda, toque num dia para ver as aulas, os testes e o almoço." },
  { tab: "hoje", alvo: almocoVisivel, texto: "Toque no almoço…", dur: 3500 },
  { tab: "hoje", antes: () => { const b = almocoVisivel(); if (b && items.has(b.dataset.it)) abrir(items.get(b.dataset.it)); }, alvo: () => $("#sheet"), texto: "…e aparece a ementa do dia. Os testes, o TPC e os avisos abrem da mesma maneira.", dur: 5000, depois: () => fechar() },
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
$("#demo-sair").addEventListener("click", () => sairDemo());
$("#demo-rever").addEventListener("click", () => iniciarTour());

// ---------- start ----------
if (location.hash === "#demo") entrarDemo(); else if (token) carregar(); else mostrarEntrar();
