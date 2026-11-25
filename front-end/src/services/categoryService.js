import { categoryLayout } from '../constants/categories';
import { toAppId } from './apiIds';
import { request } from './httpClient';

function layoutFor(id) {
  return categoryLayout.find((item) => item.id === id);
}

export async function getCategories() {
  const list = await request('/categories');
  return list.map((dto) => {
    const id = toAppId(dto.id);
    const layout = layoutFor(id);
    return { id, name: dto.name, x: layout?.x, y: layout?.y };
  });
}
