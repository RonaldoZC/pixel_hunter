import { categoryLayout } from '../constants/categories';
import { normalizeText } from '../utils/search';
import { toAppId } from './apiIds';
import { request } from './httpClient';

// Posição do rótulo no mapa (visual, fica no app). Casa pelo id e, se a API usar outro tipo de
// id, pelo nome ("Consumíveis" -> "consumiveis"). Categoria sem posição não aparece no mapa.
function layoutFor(dto) {
  return categoryLayout.find(
    (item) => item.id === String(dto.id) || item.id === normalizeText(dto.name)
  );
}

// Lista de categorias da API, já com a posição no mapa quando existir ({ id, name, x, y }).
export async function getCategories() {
  const list = await request('/categories');
  return list.map((dto) => {
    const layout = layoutFor(dto);
    return { id: toAppId(dto.id), name: dto.name, x: layout?.x, y: layout?.y };
  });
}
