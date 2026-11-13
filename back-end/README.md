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

Variáveis do `docker/.env` (todas obrigatórias; o Compose avisa qual está faltando):

| Variável | Para quê |
|---|---|
| `JWT_SECRET` | Assinatura dos tokens (mín. 32 caracteres) – auth-api e gateway |
| `DB_USER`, `DB_PASSWORD` | Usuário e senha dos 4 PostgreSQL; o `consul-config` repassa aos serviços pelo Consul |
| `GRAFANA_ADMIN_PASSWORD` | Senha do usuário `admin` do Grafana |
| `R2_*` | Cloudflare R2 (media-api) |

> O PostgreSQL só aplica a senha ao criar o volume. Se você já subiu o ambiente antes com outra senha, use a mesma ou apague os volumes com `docker compose down -v` (apaga os dados).

## Observabilidade

| Pilar | Ferramenta | Endereço |
|---|---|---|
| Logs | Promtail → Loki → Grafana | Grafana › painel "Logs dos microsserviços" (`{service=~".*-api"}`) |
| Métricas | Micrometer → Prometheus → Grafana | http://localhost:9090 e painéis do Grafana |
| Tracing distribuído | Micrometer Tracing → Zipkin | http://localhost:9411 |
| Painéis | Grafana (login `admin` + `GRAFANA_ADMIN_PASSWORD`) | http://localhost:3000 |

Como demonstrar: faça um pedido pelo app (ou `POST /ws/orders` no gateway). Essa requisição passa por **gateway-api → orders-api → product-api**; no Zipkin, busque o serviço `gateway-api` e abra o trace para ver os três serviços e o tempo de cada um. O `traceId` também aparece nos logs (`[orders-api,<traceId>,<spanId>]`), então dá para copiar o id do Zipkin e buscar no Loki (`{service="orders-api"} |= "<traceId>"`).

Resiliência: derrube o product-api (`docker compose stop product-api`) e crie pedidos: o orders-api tenta 3 vezes (Retry), depois de algumas falhas o Circuit Breaker abre (painel "Circuit Breaker aberto") e a API passa a responder 503 imediatamente, sem esperar timeout. Ao religar o serviço, o circuito se recupera sozinho em ~20 s.

Consumo de memória: a pilha de observabilidade soma ~1,3 GB (limites de memória no Compose). Em Docker Desktop/WSL com pouca RAM, aumente `memory` em `%UserProfile%\.wslconfig` (ex.: `memory=6GB`) ou rode só parte dos serviços (`docker compose up <serviços>`).

## Segurança

- Segredos (JWT, senha do banco, Grafana, R2) só por variável de ambiente; o `.env` está no `.gitignore`.
- O Promtail monta `/var/run/docker.sock` (somente leitura) para ler os logs dos containers: use só em ambiente de desenvolvimento/demonstração.
- O Actuator expõe só `health,info,metrics,prometheus` (configuração central no Consul). O gateway não roteia `/actuator` para os serviços, mas, por ser uma aplicação Spring, serve o próprio `/actuator` na porta 8080 (necessário para o Prometheus coletá-lo); por isso nada sensível (env, beans, heapdump) fica exposto.
- As chaves do R2 e o segredo JWT que estavam no código antigo foram expostos: **gere novas** no painel da Cloudflare e troque o JWT antes de publicar o repositório.
- Perfis (`SELLER`/`BUYER`) são validados nos serviços, não só no gateway.

## Documentação

- [Arquitetura e decisões](docs/ARQUITETURA.md) (inclui o diagrama)
- [Endpoints com cURL](docs/ENDPOINTS.md)

## Contrato

Ver `docs/api-contract.md` no repositório do front-end.
