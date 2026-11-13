// Formata um valor numérico como preço em reais (ex.: 29.9 -> "R$ 29,90").
export function formatPrice(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Data e hora no formato brasileiro (ex.: "10/11/2026 20:09"); texto vazio se a data for inválida.
export function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
