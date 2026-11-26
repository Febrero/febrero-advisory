// «Concursos públicos» (Pedro, 2026-11-26, depois da reunião com a Eng.ª Elisabete da Manuel Joaquim Caldeira: «escreve na
// plataforma pasta de concurso, vai buscar a info, plano de trabalhos, pagamentos, quantidades, divisão por especialidades para
// mandar para fornecedores de cada área… a parte que lhes interessa mais é a de concurso»). Um concurso fictício, como os que
// as construtoras do interior fazem: a antiga escola primária que passa a Centro de Dia. Tudo inventado; corre no navegador.
(() => {
const BASE = 742800;                       // preço base do concurso, sem IVA
const HOJE = new Date();
const dia = (n) => { const d = new Date(HOJE); d.setDate(d.getDate() + n); return d; };
const curta = (d) => d.toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
const longa = (d) => d.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" });
const pct = (x) => x.toLocaleString("pt-PT", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " %";

const DOCS = [["Programa do procedimento.pdf", "24 páginas"], ["Caderno de encargos · cláusulas jurídicas.pdf", "38 páginas"],
  ["Caderno de encargos · cláusulas técnicas.pdf", "112 páginas"], ["Mapa de quantidades.xlsx", "422 artigos · 14 capítulos"],
  ["Peças desenhadas", "46 ficheiros (PDF e DWG)"], ["Plano de segurança e saúde.pdf", "31 páginas"], ["Anúncio no Diário da República.pdf", "2 páginas"]];
const RESUMO = [["Dono de obra", "Município de Vale Formoso"], ["Preço base", eur(BASE) + " + IVA"], ["Prazo de execução", "270 dias"],
  ["Critério", "preço mais baixo"], ["Caução", "5 % do contrato"], ["Pagamentos", "autos mensais, a 60 dias"],
  ["Retenção", "5 % de cada auto, até à receção"], ["Alvará", "empreiteiro geral de edifícios"], ["Adiantamento", "não há"]];
// especialidade, artigos, valor pela vossa base de preços, fornecedores a consultar
const ESP = [["Estaleiro e trabalhos preparatórios", 18, 18900, 2], ["Demolições", 22, 16700, 2], ["Estrutura e betão armado", 46, 85200, 3],
  ["Alvenarias e rebocos", 38, 63500, 3], ["Cobertura e impermeabilizações", 27, 56800, 3], ["Caixilharia e serralharia", 31, 78400, 3],
  ["Carpintarias", 19, 30200, 2], ["Pavimentos e revestimentos", 44, 70300, 3], ["Águas e esgotos", 36, 36900, 3],
  ["Eletricidade e telecomunicações (ITED)", 52, 61000, 3], ["AVAC e ventilação", 24, 50700, 3], ["Segurança contra incêndio", 15, 20000, 2],
  ["Pinturas", 21, 24200, 3], ["Arranjos exteriores", 29, 39600, 2]];
const CUSTO = ESP.reduce((s, e) => s + e[2], 0);                      // 652 400 €
const FORN = ESP.reduce((s, e) => s + e[3], 0);                       // 37 fornecedores e subempreiteiros
const CUSTO_COM_RESPOSTAS = 641800, MARGEM = 0.10;
const ERROS = [["Art. 6.3.2 · caixilharia", "O mapa diz 38 vãos; as plantas e o mapa de vãos têm 41."],
  ["Art. 9.1.4 · tubagem PPR", "Quantidade a zero: omissão."],
  ["Capítulo 11 · AVAC", "A soma do capítulo não inclui os artigos 11.4.1 a 11.4.3 (8 940 € a menos no total)."],
  ["Arranjos exteriores", "Pavimento drenante desenhado no recreio e sem artigo no mapa: omissão."]];
const GANTT = [["Estaleiro", 1, 1], ["Demolições", 1, 2], ["Estrutura", 2, 4], ["Cobertura", 4, 5], ["Alvenarias e rebocos", 3, 6],
  ["Redes: águas, esgotos, eletricidade, AVAC", 4, 7], ["Caixilharia", 5, 7], ["Pavimentos e revestimentos", 6, 8], ["Pinturas e acabamentos", 8, 9],
  ["Arranjos exteriores", 7, 9]];
const MESES = 9, AUTOS = [38, 61, 92, 104, 98, 95, 82, 74, 62], CUSTOS = [52, 70, 88, 92, 86, 80, 70, 58, 46];   // milhares de €
const HABILITACAO = [["Declaração do Anexo I do CCP", true], ["Alvará e certificado de empreiteiro", true], ["Certidões da AT e da Segurança Social", true],
  ["Lista de preços unitários", true], ["Plano de trabalhos e cronograma financeiro", true], ["Memória descritiva e justificativa", true], ["Registo criminal dos gerentes", false]];

const v = (id) => document.getElementById(id);
let lido = false, pedidos = false;

function estado(t, cls) { const e = v("cc-estado"); e.textContent = t; e.className = "chip " + cls; }
async function ler() {
  if (lido) return;
  lido = true;
  v("cc-ler").disabled = true;
  estado("a ler…", "chip-analise");
  v("cc-docs").innerHTML = DOCS.map(([n, d], i) => `<li id="cc-doc-${i}" class="flex items-center justify-between gap-2 opacity-40"><span class="flex items-center gap-2 min-w-0">${icone("ficheiro", "w-4 h-4 text-[#c47a3c] flex-none")}<span class="truncate">${esc(n)}</span></span><span class="text-xs text-[#a08b7a] flex-none">${esc(d)}</span></li>`).join("");
  for (let i = 0; i < DOCS.length; i++) { await esperar(380); v("cc-doc-" + i).classList.remove("opacity-40"); }
  v("cc-resumo").innerHTML = RESUMO.map(([k, x]) => `<div class="rounded-xl bg-[#faf6f1] border border-[#efe3d6] p-2.5"><div class="text-[10.5px] text-[#a08b7a] font-semibold uppercase tracking-wide">${k}</div><div class="text-sm font-semibold mt-0.5">${x}</div></div>`).join("");
  const faltam = 11;
  v("cc-prazos").innerHTML = `<div class="rotulo">Prazos</div><div class="grid sm:grid-cols-3 gap-2.5 mt-2 text-sm">
    <div class="rounded-xl border border-[#efe3d6] p-2.5"><div class="text-xs text-[#7b6a5d]">Visita ao local</div><b>${longa(dia(3))}, 10:00</b></div>
    <div class="rounded-xl border border-[#efe3d6] p-2.5"><div class="text-xs text-[#7b6a5d]">Esclarecimentos e erros e omissões</div><b>até ${longa(dia(4))}</b></div>
    <div class="rounded-xl border border-[#f0dcc6] bg-[#fbf3ea] p-2.5"><div class="text-xs text-[#7b6a5d]">Entrega da proposta</div><b>${longa(dia(faltam))}, 17:00</b><div class="text-xs text-[#b86d31] font-semibold">faltam ${faltam} dias · já no calendário</div></div></div>`;
  estado("lida", "chip-ok");
  await esperar(300);
  v("cc-depois").classList.remove("hidden");
  quantidades(); especialidades(); gantt(); pagamentos(); proposta();
  v("cc-quant").scrollIntoView({ behavior: "smooth", block: "start" });
}

function quantidades() {
  v("cc-quant").innerHTML = `<div class="grid grid-cols-3 gap-2.5 mt-3">
      <div class="rounded-xl bg-[#faf6f1] border border-[#efe3d6] p-2.5"><div class="text-[10.5px] text-[#a08b7a] font-semibold uppercase">Artigos</div><div class="text-lg font-semibold">422</div></div>
      <div class="rounded-xl bg-[#faf6f1] border border-[#efe3d6] p-2.5"><div class="text-[10.5px] text-[#a08b7a] font-semibold uppercase">Conferidos com as peças</div><div class="text-lg font-semibold">418</div></div>
      <div class="rounded-xl bg-[#fbf3ea] border border-[#f0dcc6] p-2.5"><div class="text-[10.5px] text-[#b86d31] font-semibold uppercase">Erros e omissões</div><div class="text-lg font-semibold text-[#b86d31]">4</div></div></div>
    <table class="w-full text-sm mt-3"><tbody>${ERROS.map(([a, t]) => `<tr class="border-t border-[#f1e8de]"><td class="py-2 pr-3 font-semibold align-top whitespace-nowrap">${a}</td><td class="py-2 text-[#5b4b40]">${t}</td></tr>`).join("")}</tbody></table>
    <button id="cc-eo" class="btn btn-claro mt-3"><span data-icone="ficheiro"></span>Preparar a lista de erros e omissões</button>
    <div id="cc-eo-doc" class="hidden mt-3"></div>`;
  pintarIcones(v("cc-quant"));
  v("cc-eo").onclick = () => {
    v("cc-eo").disabled = true;
    v("cc-eo-doc").classList.remove("hidden");
    v("cc-eo-doc").innerHTML = `<div class="rounded-xl border border-[#efe3d6] p-4 text-sm bg-white"><div class="text-xs text-[#a08b7a]">Para submeter na plataforma eletrónica até ${curta(dia(4))}</div>
      <div class="serif text-base font-semibold mt-1">Lista de erros e omissões · Requalificação da antiga Escola Primária</div>
      <ol class="list-decimal pl-5 mt-2 space-y-1 text-[#5b4b40]">${ERROS.map(([a, t]) => `<li><b>${a}.</b> ${t}</li>`).join("")}</ol>
      <p class="text-xs text-[#a08b7a] mt-2">Cada ponto leva a página e a folha de onde saiu. Pronto para a Eng.ª rever e submeter.</p></div>`;
  };
}

function especialidades() {
  v("cc-esp").innerHTML = `<div class="flex items-start justify-between gap-3"><div><div class="rotulo">Divisão por especialidades</div><div class="serif text-lg font-semibold mt-0.5">${ESP.length} especialidades · ${FORN} fornecedores e subempreiteiros</div></div></div>
    <div class="max-h-[360px] overflow-y-auto mt-2"><table class="w-full text-sm"><thead><tr class="text-left text-[11px] uppercase tracking-wide text-[#a08b7a]"><th class="py-1.5">Especialidade</th><th class="py-1.5 text-right">Artigos</th><th class="py-1.5 text-right">Pela vossa base</th><th class="py-1.5 text-right">Pedido</th></tr></thead>
    <tbody>${ESP.map(([n, a, val, f], i) => `<tr class="border-t border-[#f1e8de]"><td class="py-2 pr-2">${n}<div class="text-xs text-[#a08b7a]">${f} fornecedores habituais</div></td><td class="py-2 text-right">${a}</td><td class="py-2 text-right whitespace-nowrap">${eur(val)}</td><td class="py-2 text-right"><span id="cc-p-${i}" class="chip chip-neutro">por pedir</span></td></tr>`).join("")}
    <tr class="border-t-2 border-[#e6d7c7] font-semibold"><td class="py-2">Total</td><td class="py-2 text-right">422</td><td class="py-2 text-right whitespace-nowrap">${eur(CUSTO)}</td><td></td></tr></tbody></table></div>
    <div class="flex flex-wrap gap-2 mt-3"><button id="cc-pedir" class="btn btn-cobre"><span data-icone="enviar"></span>Pedir preços às ${ESP.length} especialidades</button></div>
    <div id="cc-pedidos" class="mt-3"></div>`;
  pintarIcones(v("cc-esp"));
  v("cc-pedir").onclick = pedirPrecos;
}
async function pedirPrecos() {
  if (pedidos) return;
  pedidos = true;
  v("cc-pedir").disabled = true;
  for (let i = 0; i < ESP.length; i++) { await esperar(110); const c = v("cc-p-" + i); c.textContent = "enviado"; c.className = "chip chip-analise"; }
  v("cc-pedidos").innerHTML = notaIA(`<b>${FORN} pedidos de preço enviados</b>, um por fornecedor, cada um só com os artigos da sua especialidade e as peças desenhadas que lhe dizem respeito. Respostas pedidas até ${longa(dia(7))}.`)
    + `<details class="mt-2 text-sm"><summary class="cursor-pointer text-[#b86d31] font-semibold">Ver o pedido à eletricidade</summary><div class="rounded-xl border border-[#efe3d6] p-4 mt-2 bg-white">
      <div class="text-xs text-[#a08b7a]">Para: 3 instaladores habituais · Anexos: 52 artigos (Excel) e 9 peças desenhadas</div>
      <div class="font-semibold mt-1">Pedido de preço · Requalificação da antiga Escola Primária de Vale Formoso · Eletricidade e telecomunicações</div>
      <p class="mt-2 text-[#5b4b40]">Boa tarde,<br>Estamos a preparar proposta para este concurso público e pedimos o vosso preço para os 52 artigos de eletricidade e ITED em anexo, com as quantidades do mapa e as peças desenhadas respetivas. Pedimos resposta até ${longa(dia(7))}, com prazo de execução e validade de 90 dias.<br>Com os melhores cumprimentos</p></div></details>`;
  await esperar(1800);
  ESP.forEach((e, i) => { if (i % 3 !== 2) { const c = v("cc-p-" + i); c.textContent = "respondido"; c.className = "chip chip-ok"; } });
  v("cc-pedidos").insertAdjacentHTML("beforeend", `<div class="mt-3 rounded-xl border border-[#efe3d6] p-4 bg-white text-sm"><div class="rotulo">Já responderam 21 de ${FORN} · caixilharia comparada</div>
    <table class="w-full mt-2"><tbody>
      <tr class="border-t border-[#f1e8de]"><td class="py-1.5">Alumínios do Vale</td><td class="py-1.5 text-right">6 semanas</td><td class="py-1.5 text-right font-semibold text-[#2f6f5e] whitespace-nowrap">${eur(74900)} ✓</td></tr>
      <tr class="border-t border-[#f1e8de]"><td class="py-1.5">Caixilharia Moderna</td><td class="py-1.5 text-right">5 semanas</td><td class="py-1.5 text-right whitespace-nowrap">${eur(79300)}</td></tr>
      <tr class="border-t border-[#f1e8de]"><td class="py-1.5">Serralharia do Norte</td><td class="py-1.5 text-right">8 semanas</td><td class="py-1.5 text-right whitespace-nowrap">${eur(81200)}</td></tr></tbody></table>
    <p class="text-xs text-[#7b6a5d] mt-2">A melhor fica 4,5 % abaixo da vossa base de preços. A IA atualiza a proposta a cada resposta e insiste com quem não respondeu.</p></div>`);
  proposta(true);
}

function gantt() {
  const cab = Array.from({ length: MESES }, (_, i) => `<div class="text-[10.5px] text-[#a08b7a] text-center">mês ${i + 1}</div>`).join("");
  v("cc-gantt").innerHTML = `<div class="rotulo">Plano de trabalhos</div><div class="serif text-lg font-semibold mt-0.5">270 dias, por especialidade</div>
    <div class="mt-3 grid grid-cols-[minmax(0,10rem)_1fr] gap-x-3 gap-y-1.5 items-center text-xs">
      <div></div><div class="grid" style="grid-template-columns:repeat(${MESES},1fr)">${cab}</div>
      ${GANTT.map(([n, a, b], i) => `<div class="truncate text-[#5b4b40]" title="${n}">${n}</div><div class="relative h-4 rounded bg-[#f6efe7]"><div class="absolute top-0 bottom-0 rounded" style="left:${(a - 1) / MESES * 100}%;width:${(b - a + 1) / MESES * 100}%;background:${i % 2 ? "#d9a06d" : "#c47a3c"}"></div></div>`).join("")}
    </div><p class="text-xs text-[#7b6a5d] mt-3">Feito a partir das quantidades e dos rendimentos das vossas obras. Vai na proposta com o cronograma financeiro.</p>`;
}

function pagamentos() {
  let saldo = 0, minimo = 0, mesMin = 0;
  const linhas = [];
  for (let m = 1; m <= MESES + 2; m++) {
    const custo = CUSTOS[m - 1] || 0, recebe = m > 2 ? 0.95 * (AUTOS[m - 3] || 0) : 0;
    saldo += recebe - custo;
    if (saldo < minimo) { minimo = saldo; mesMin = m; }
    linhas.push({ m, custo, recebe, saldo });
  }
  const precisa = Math.round(-minimo) * 1000, retido = Math.round(AUTOS.reduce((s, x) => s + x, 0) * 1000 * 0.05 / 100) * 100,
    caucao = Math.round(CUSTO_COM_RESPOSTAS * (1 + MARGEM) * 0.05 / 100) * 100;      // 5 % do preço contratual
  v("cc-pag").innerHTML = `<div class="rotulo">Plano de pagamentos</div><div class="serif text-lg font-semibold mt-0.5">O que entra, o que sai e quando</div>
    <div class="relative h-[220px] mt-3"><canvas id="cc-graf"></canvas></div>
    ${notaIA(`Com autos pagos a 60 dias e 5 % retidos, a obra precisa de <b>cerca de ${eur(precisa)} de fundo de maneio no ${mesMin}.º mês</b>. A caução, 5 % do contrato, fica perto de ${eur(caucao)} (garantia bancária) e as retenções, ${eur(retido)}, só voltam na receção.`, "mt-3")}`;
  if (typeof Chart === "undefined") return;
  new Chart(v("cc-graf"), { data: { labels: linhas.map((l) => "mês " + l.m), datasets: [
      { type: "bar", label: "Recebimentos", data: linhas.map((l) => Math.round(l.recebe * 1000)), backgroundColor: "#c47a3c", borderRadius: 4 },
      { type: "bar", label: "Pagamentos", data: linhas.map((l) => -l.custo * 1000), backgroundColor: "#cbbfb3", borderRadius: 4 },
      { type: "line", label: "Saldo acumulado", data: linhas.map((l) => Math.round(l.saldo * 1000)), borderColor: "#2f6f5e", backgroundColor: "#2f6f5e", tension: 0.3, pointRadius: 2 }] },
    options: { maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } },
      tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${eur(Math.abs(c.parsed.y))}${c.parsed.y < 0 && c.dataset.type === "line" ? " em falta" : ""}` } } },
      scales: { x: { grid: { display: false }, ticks: { font: { size: 10 } } }, y: { grid: { color: "#f1e8de" }, ticks: { font: { size: 10 }, callback: (x) => (x / 1000).toLocaleString("pt-PT") + " mil" } } } } });
}

function proposta(comRespostas = false) {
  const custo = comRespostas ? CUSTO_COM_RESPOSTAS : CUSTO, preco = Math.round(custo * (1 + MARGEM) / 100) * 100, abaixo = (BASE - preco) / BASE * 100;
  v("cc-proposta").innerHTML = `<div class="flex flex-wrap items-start justify-between gap-4"><div><div class="rotulo">Proposta</div>
      <div class="serif text-2xl font-semibold mt-0.5">${eur(preco)} <span class="text-sm text-[#7b6a5d] font-normal">+ IVA</span></div>
      <div class="text-sm text-[#7b6a5d]">${pct(abaixo)} abaixo do preço base (${eur(BASE)}) · custo ${eur(custo)} ${comRespostas ? "já com 21 respostas de fornecedores" : "pela vossa base de preços"} · margem de ${Math.round(MARGEM * 100)} %</div></div>
      <button id="cc-gerar" class="btn btn-cobre"><span data-icone="ficheiro"></span>Gerar proposta e documentos</button></div>
    <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-2 mt-4 text-sm">${HABILITACAO.map(([d, ok]) => `<div class="flex items-center gap-2 rounded-xl border border-[#efe3d6] p-2.5"><span class="${ok ? "text-[#2f6f5e]" : "text-[#b86d31]"} font-semibold">${ok ? "✓" : "…"}</span><span>${d}${ok ? "" : " · pedido, chega amanhã"}</span></div>`).join("")}</div>`;
  pintarIcones(v("cc-proposta"));
  v("cc-gerar").onclick = () => toast("Proposta, lista de preços unitários, plano de trabalhos e cronograma financeiro prontos para a Eng.ª rever (demonstração).");
}

function iniciar() {
  v("cc-ler").onclick = ler;
  const z = v("cc-largar");
  z.onclick = ler;
  z.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ler(); } };
  ["dragenter", "dragover"].forEach((t) => z.addEventListener(t, (e) => { e.preventDefault(); z.classList.add("por-cima"); }));
  ["dragleave", "drop"].forEach((t) => z.addEventListener(t, (e) => { e.preventDefault(); z.classList.remove("por-cima"); if (t === "drop") ler(); }));
}

// a vista entra logo a seguir a «Planta → Orçamento», no menu e no menu do telemóvel
const antes = Object.entries(VISTAS);
for (const [k] of antes) delete VISTAS[k];
for (const [k, x] of antes) { VISTAS[k] = x; if (k === "planta") VISTAS.concursos = ["Concursos públicos", "Da pasta do concurso à proposta: prazos, quantidades, especialidades e plano"]; }
INICIAR.concursos = iniciar;
})();
