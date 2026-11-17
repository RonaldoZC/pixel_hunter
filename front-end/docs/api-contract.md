# Contrato da API (Java REST)

Todas as chamadas passam pelo **gateway** (`EXPO_PUBLIC_API_URL`, ver `.env.example`). Rotas `/ws/**` exigem o cabeçalho `Authorization: Bearer <token>`; o gateway valida o token e a restrição por perfil (`SELLER`/`BUYER`) é conferida também no servidor.

O app só chama o que está na tabela abaixo. Todo o acesso HTTP passa por `src/services/httpClient.js`; cada recurso tem seu serviço em `src/services/`, que converte o formato da API para o usado nas telas.

## Convenções

- Erros: status 400/401/403/404 com `{ "message": "..." }` (ou texto puro). O app mostra essa mensagem; 401 em rota logada encerra a sessão.
- Listagens paginadas (formato Spring: `content`, `totalPages`, `number`, `size`) com `page` (começa em 0) e `size`. As telas ainda não paginam: o app junta as páginas (até 1000 registros) em `src/services/pagination.js`.
- Ids vêm como número da API; o app os trata como texto e converte de volta ao enviar.
- Preços em reais (BRL).
- Timeout de 10 s (30 s em upload de imagem).

## Endpoints

Status: **implementado no app** = usado por alguma tela; **não usado** = existe no contrato, sem tela ainda.

| Recurso | Método e caminho | Acesso | Requisição | Resposta | Serviço / tela | Status |
|---|---|---|---|---|---|---|
| Cadastro | `POST /auth/signup` | Público | `username`, `email`, `password`, `role` (`BUYER` ou `SELLER`) | 201 com o usuário | `authService` / Cadastro | implementado |
| Login | `POST /auth/signin` | Público | `email`, `password` | `{ user, token }` | `authService` / Início | implementado |
| Meu perfil | `GET /ws/users/me` | Logado | — | `id`, `username`, `email`, `link`, `photoUrl`, `role` | `userService` / Meus Dados | implementado |
| Editar perfil | `PUT /ws/users/me` | Logado | `username`, `email`, `link` (opcional) | usuário atualizado | `userService` / Meus Dados | implementado |
| Foto de perfil | `PUT /ws/users/me/photo` | Logado | `photoUrl` (vem do upload) | usuário atualizado | `userService` / Meus Dados | implementado |
| Categorias | `GET /categories` | Público | — | lista de `id`, `name` | `categoryService` / Mapa, Cadastro de Produto | implementado |
| Listar produtos | `GET /products` | Público | `categoryId`, `query`, `page`, `size` (opcionais) | página de produtos | `assetService` / Lista de assets | implementado |
| Detalhe do produto | `GET /products/{id}` | Público | — | produto, ou 404 | `assetService` / Detalhe | implementado |
| Criar produto | `POST /ws/products` | `SELLER` | `title`, `description`, `price`, `categoryId`, `imageUrl` | 201 com o produto | `productService` / Cadastro de Produto | implementado |
| Editar produto | `PUT /ws/products/{id}` | `SELLER` dono | mesmos campos | produto atualizado | `productService` / Editar produto | implementado |
| Excluir produto | `DELETE /ws/products/{id}` | `SELLER` dono | — | 204 | `productService` / Meus Produtos | implementado |
| Meus produtos | `GET /ws/products/mine` | `SELLER` | `page`, `size` | página de produtos | `productService` / Meus Produtos | implementado |
| Upload de imagem | `POST /ws/media` | Logado | `multipart/form-data`, campo `file` (PNG, JPG ou WebP, até 5 MB) | `{ "url": "..." }` | `mediaService` / foto e produto | implementado |
| Criar pedido | `POST /ws/orders` | `BUYER` | `items`: lista de `{ assetId }` | 201 com o pedido | `orderService` / Carrinho | implementado |
| Histórico de pedidos | `GET /ws/orders` | `BUYER` | `page`, `size` | página de pedidos | `orderService` / Meus Pedidos | implementado |
| Pedido por id | `GET /ws/orders/{id}` | `BUYER` dono | — | pedido com itens | `orderService` / Detalhe do pedido | implementado |
| Histórico de vendas | `GET /ws/sales` | `SELLER` | `page`, `size` | página de vendas (`orderId`, `orderNumber`, `assetId`, `title`, `price`, `soldAt`) | `saleService` / Histórico de Vendas | implementado |

## Modelos

- **Produto (API):** `id`, `title`, `description`, `price`, `categoryId`, `imageUrl`, `sellerId`. **Asset (app):** `id`, `title`, `categoryId`, `price`, `description`, `image` (`{ uri }` ou `null`).
- **Usuário:** `id`, `username`, `email`, `link`, `photoUrl`, `role`.
- **Pedido:** `id`, `number`, `createdAt`, `total`, `status`, `items` (`assetId`, `title`, `price`). Status usado hoje: `CONFIRMED` (ainda não há pagamento).
- **Categoria:** `id`, `name`. A posição do rótulo no mapa (`x`, `y`) é visual e fica no app (`src/constants/categories.js`), ligada à categoria pelo id ou pelo nome. Categoria sem posição cadastrada não aparece no mapa; se a API falhar, o mapa mostra o erro com "Tentar de novo".

## Pendências do contrato

- Lista oficial de status de pedido e pagamento: a definir pelo grupo do back-end. Hoje todo pedido nasce `CONFIRMED`.
