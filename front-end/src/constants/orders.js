export const orderStatusLabels = { CONFIRMED: 'Confirmado' };

export const orderStatusLabel = (status) => orderStatusLabels[status] ?? status;
