// O back-end usa ids numéricos; o app usa texto (navegação, carrinho, chaves de lista).
export const toAppId = (id) => String(id);

// Volta ao número ao enviar, quando o id for numérico.
export const toApiId = (id) => (/^\d+$/.test(String(id)) ? Number(id) : id);
