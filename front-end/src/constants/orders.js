// Textos dos status de pedido devolvidos pela API. Status desconhecido aparece como veio.
export const orderStatusLabels = { CONFIRMED: 'Confirmado' };

export const orderStatusLabel = (status) => orderStatusLabels[status] ?? status;
