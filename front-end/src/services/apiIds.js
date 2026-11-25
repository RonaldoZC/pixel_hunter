export const toAppId = (id) => String(id);

export const toApiId = (id) => (/^\d+$/.test(String(id)) ? Number(id) : id);
