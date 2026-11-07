/**
 * Validação e formatação de CPF e CNPJ.
 * O CNPJ aceita letras (CNPJ alfanumérico, novo formato da Receita Federal).
 */

/** Deixa só letras e números, em maiúsculas. Ex.: "123.456.789-09" vira "12345678909". */
export function normalizeDocumento(input: string): string {
  return (input || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
}

function isValidCPF(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const digit = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

function isValidCNPJ(cnpj: string): boolean {
  if (!/^[0-9A-Z]{12}\d{2}$/.test(cnpj) || /^(.)\1{13}$/.test(cnpj)) return false;
  const value = (ch: string) => ch.charCodeAt(0) - 48; // 0 a 9 e A a Z
  const digit = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < len; i++) sum += value(cnpj[i]) * weights[i];
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return digit(12) === Number(cnpj[12]) && digit(13) === Number(cnpj[13]);
}

/** Retorna 'cpf', 'cnpj' ou null (inválido). */
export function documentoTipo(input: string): 'cpf' | 'cnpj' | null {
  const doc = normalizeDocumento(input);
  if (doc.length === 11 && isValidCPF(doc)) return 'cpf';
  if (doc.length === 14 && isValidCNPJ(doc)) return 'cnpj';
  return null;
}

/** Aplica a máscara enquanto a pessoa digita. */
export function maskDocumento(input: string): string {
  const d = normalizeDocumento(input).slice(0, 14);
  if (d.length <= 11 && /^\d*$/.test(d)) {
    return d
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  }
  return d
    .replace(/^([0-9A-Z]{2})([0-9A-Z])/, '$1.$2')
    .replace(/^([0-9A-Z]{2})\.([0-9A-Z]{3})([0-9A-Z])/, '$1.$2.$3')
    .replace(/^([0-9A-Z]{2})\.([0-9A-Z]{3})\.([0-9A-Z]{3})([0-9A-Z])/, '$1.$2.$3/$4')
    .replace(/^([0-9A-Z]{2})\.([0-9A-Z]{3})\.([0-9A-Z]{3})\/([0-9A-Z]{4})([0-9A-Z])/, '$1.$2.$3/$4-$5');
}
