# Endpoints da API – Pixel Hunter

Todas as chamadas passam pelo **gateway** (`http://localhost:8080`). Rotas `/ws/**` exigem o cabeçalho `Authorization: Bearer <token>`; o token vem do `signin`.

Para usar os exemplos no `cmd` do Windows, troque `$TOKEN` pelo token obtido no login. Em Postman: **Import → Raw text** e cole o cURL.

Erros devolvem JSON `{ "message": "..." }` com o código HTTP adequado (400, 401, 403, 404, 503).

## auth-api

| Método | Caminho | Acesso | Finalidade |
|---|---|---|---|
| POST | `/auth/signup` | Público | Cria uma conta (`BUYER` ou `SELLER`) |
| POST | `/auth/signin` | Público | Faz login e devolve o JWT |
| GET | `/ws/users/me` | Logado | Dados do usuário logado |
| PUT | `/ws/users/me` | Logado | Atualiza nome, e-mail e link do perfil |
| PUT | `/ws/users/me/photo` | Logado | Atualiza a foto de perfil (URL devolvida pelo upload) |

```bash
# POST /auth/signup
curl -X POST http://localhost:8080/auth/signup -H "Content-Type: application/json" -d '{"username":"Gabriel","email":"gabriel@exemplo.com","password":"senha123","role":"BUYER"}'

# POST /auth/signin  -> { "user": {...}, "token": "..." }
curl -X POST http://localhost:8080/auth/signin -H "Content-Type: application/json" -d '{"email":"gabriel@exemplo.com","password":"senha123"}'

# GET /ws/users/me
curl http://localhost:8080/ws/users/me -H "Authorization: Bearer $TOKEN"

# PUT /ws/users/me
curl -X PUT http://localhost:8080/ws/users/me -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"username":"Gabriel S.","email":"gabriel@exemplo.com","link":"https://github.com/gabriel"}'

# PUT /ws/users/me/photo
curl -X PUT http://localhost:8080/ws/users/me/photo -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"photoUrl":"https://pub-xxxx.r2.dev/foto.png"}'
```

## product-api

| Método | Caminho | Acesso | Finalidade |
|---|---|---|---|
| GET | `/categories` | Público | Lista as categorias |
| GET | `/products` | Público | Lista produtos paginados. Filtros opcionais: `categoryId`, `query`, `page`, `size` |
| GET | `/products/{id}` | Público | Detalhe de um produto |
| POST | `/ws/products` | `SELLER` | Publica um produto |
| GET | `/ws/products/mine` | `SELLER` | Lista os produtos do vendedor logado |
| PUT | `/ws/products/{id}` | `SELLER` (dono) | Edita um produto |
| DELETE | `/ws/products/{id}` | `SELLER` (dono) | Exclui um produto |

```bash
# GET /categories
curl http://localhost:8080/categories

# GET /products (filtros opcionais)
curl "http://localhost:8080/products?categoryId=equipamentos&query=armadura&page=0&size=20"

# GET /products/{id}
curl http://localhost:8080/products/1

# POST /ws/products
curl -X POST http://localhost:8080/ws/products -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"title":"Espada de Fogo","description":"Ataque flamejante.","price":39.9,"categoryId":"equipamentos","imageUrl":"https://pub-xxxx.r2.dev/espada.png"}'

# GET /ws/products/mine
curl "http://localhost:8080/ws/products/mine?page=0&size=20" -H "Authorization: Bearer $TOKEN"

# PUT /ws/products/{id}
curl -X PUT http://localhost:8080/ws/products/73 -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"title":"Espada de Fogo II","description":"Mais forte.","price":49.9,"categoryId":"equipamentos","imageUrl":"https://pub-xxxx.r2.dev/espada.png"}'

# DELETE /ws/products/{id}
curl -X DELETE http://localhost:8080/ws/products/73 -H "Authorization: Bearer $TOKEN"
```

## media-api

| Método | Caminho | Acesso | Finalidade |
|---|---|---|---|
| POST | `/ws/media` | `SELLER` ou `BUYER` logado | Envia uma imagem (multipart, campo `file`) e devolve `{ "url": "..." }` |

```bash
curl -X POST http://localhost:8080/ws/media -H "Authorization: Bearer $TOKEN" -F "file=@imagem.png"
```

## orders-api (pedidos e vendas)

| Método | Caminho | Acesso | Finalidade |
|---|---|---|---|
| POST | `/ws/orders` | `BUYER` | Cria um pedido com os ids dos produtos (título e preço vêm do product-api) |
| GET | `/ws/orders` | `BUYER` | Histórico de pedidos do comprador, paginado |
| GET | `/ws/orders/{id}` | `BUYER` (dono) | Detalhe de um pedido |

```bash
# POST /ws/orders
curl -X POST http://localhost:8080/ws/orders -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"items":[{"assetId":1},{"assetId":3}]}'

# GET /ws/orders
curl "http://localhost:8080/ws/orders?page=0&size=50" -H "Authorization: Bearer $TOKEN"

# GET /ws/orders/{id}
curl http://localhost:8080/ws/orders/1 -H "Authorization: Bearer $TOKEN"
```

### Vendas (vendedor)

| Método | Caminho | Acesso | Finalidade |
|---|---|---|---|
| GET | `/ws/sales` | `SELLER` | Histórico de vendas do vendedor logado, paginado (mais recentes primeiro) |

```bash
curl "http://localhost:8080/ws/sales?page=0&size=50" -H "Authorization: Bearer $TOKEN"
```

## currency-api

| Método | Caminho | Acesso | Finalidade |
|---|---|---|---|
| GET | `/currencies` | Público | Cotação entre duas moedas |
| GET | `/ws/currencies` | Logado | Mesma consulta, exigindo autenticação |

```bash
curl "http://localhost:8080/currencies?source=USD&target=BRL"
curl "http://localhost:8080/ws/currencies?source=USD&target=BRL" -H "Authorization: Bearer $TOKEN"
```

## Observabilidade (para a demonstração)

| Ferramenta | Endereço |
|---|---|
| Grafana (logs, métricas, painéis) | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| Zipkin (rastreamento) | http://localhost:9411 |
| Consul (registro e configuração) | http://localhost:8500 |
