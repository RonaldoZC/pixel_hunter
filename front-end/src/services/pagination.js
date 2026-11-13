import { request } from './httpClient';

const PAGE_SIZE = 50;
// Trava de segurança: no máximo 20 páginas (1000 registros) por consulta.
const MAX_PAGES = 20;

// A API devolve páginas do Spring ({ content, totalPages, number }). As telas ainda não paginam,
// então juntamos as páginas em uma lista só. Se a lista crescer muito, trocar por rolagem infinita.
export async function fetchAllPages(path, { query, auth = false } = {}) {
  const items = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const result = await request(path, { query: { ...query, page, size: PAGE_SIZE }, auth });
    items.push(...(result?.content ?? []));
    if (!result || page + 1 >= (result.totalPages ?? 1)) break;
  }
  return items;
}
