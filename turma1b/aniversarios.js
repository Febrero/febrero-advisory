// The class birthdays (Pedro, 2026-10-29, asked by the parents: «primeiro nome do menino/menina apenas… Primeiro Nome,
// Data, Local, Hora — só nome e data são obrigatórios»): the checks, shared by the server (lib/aniversarios.mjs) and
// the demonstration. Only the child's first name is kept; the place and time are the party's, both optional.
export const MAX_POR_PESSOA = 20;
const HH = /^([01]\d|2[0-3]):[0-5]\d$/;

/** «maria joão almeida» → «Maria»; «ana-rita» → «Ana-Rita»; letters only, at most 20. */
export function primeiroNome(txt) {
  const p = (String(txt || "").normalize("NFC").trim().split(/\s+/)[0] || "").replace(/[^\p{L}'-]/gu, "").slice(0, 20);
  return p.split("-").map((x) => (x ? x.charAt(0).toLocaleUpperCase("pt-PT") + x.slice(1).toLocaleLowerCase("pt-PT") : x)).join("-").replace(/^-+|-+$/g, "");
}

/** {aniv: {nome, data, hora, local}} or {erro}. */
export function validarAniversario(x) {
  const nome = primeiroNome(x?.nome);
  if (!nome) return { erro: "Escreva o primeiro nome da criança." };
  const data = String(x?.data || "");
  const ano = Number(data.slice(0, 4));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || Number.isNaN(Date.parse(data + "T12:00:00Z")) || ano < 2025 || ano > 2030) return { erro: "Escolha a data." };
  const hora = String(x?.hora || "").trim();
  if (hora && !HH.test(hora)) return { erro: "Confira a hora (por exemplo 15:30)." };
  const local = String(x?.local || "").replace(/\s+/g, " ").trim().slice(0, 60);
  return { aniv: { nome, data, hora, local } };
}
