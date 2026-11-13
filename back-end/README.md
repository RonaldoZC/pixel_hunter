# Pixel Hunter – Back-end (microsserviços)

Java 21 / Spring Boot, Spring Cloud Gateway, Consul e PostgreSQL. O app mobile está em outro repositório (`front-end`).

| Serviço | Porta | Função |
|---|---|---|
| gateway-api | 8080 | Entrada única; valida o JWT nas rotas `/ws/**` e envia `X-User-*` aos serviços |
| auth-api | 8200 | Cadastro, login, perfil (`/auth/**`, `/ws/users/**`) |
| product-api | 8000 | Produtos e categorias (`/products`, `/categories`, `/ws/products`) |
| media-api | 8300 | Upload de imagens ao Cloudflare R2 (`/ws/media`) |
| orders-api | 8400 | Pedidos do comprador (`/ws/orders`) |
| currency-api | 8100 | Cotações (independente do app) |

## Rodar com Docker

```bash
cd docker
cp .env.example .env   # preencha JWT_SECRET e as variáveis do R2
docker compose up --build
```

A API fica em `http://localhost:8080`. No celular use o IP do computador (`EXPO_PUBLIC_API_URL=http://<ip>:8080` no front).

## Segurança

- Segredos (JWT, R2) só por variável de ambiente; o `.env` está no `.gitignore`.
- As chaves do R2 e o segredo JWT que estavam no código antigo foram expostos: **gere novas** no painel da Cloudflare e troque o JWT antes de publicar o repositório.
- Perfis (`SELLER`/`BUYER`) são validados nos serviços, não só no gateway.

## Contrato

Ver `docs/api-contract.md` no repositório do front-end.
