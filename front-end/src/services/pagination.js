import { request } from './httpClient';

const PAGE_SIZE = 50;
const MAX_PAGES = 20;

async function fetchAllPages(path, { query, auth = false }) {
  const items = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const result = await request(path, { query: { ...query, page, size: PAGE_SIZE }, auth });
    items.push(...(result?.content ?? []));
    if (!result || page + 1 >= (result.totalPages ?? 1)) break;
  }
  return items;
}

export async function fetchAll(path, toItem, options = {}) {
  return (await fetchAllPages(path, options)).map(toItem);
}
