# Pixel Hunter

Loja mobile de assets de jogos pixelados. Um repositório, duas partes:

| Pasta | O que é | Tecnologias |
|---|---|---|
| [`front-end/`](front-end) | App mobile/web | React Native, Expo |
| [`back-end/`](back-end) | API em microsserviços | Java 21, Spring Boot, Spring Cloud Gateway, Consul, PostgreSQL |

O app conversa só com o **gateway** (`back-end`, porta 8080). O contrato dos endpoints está em
[`front-end/docs/api-contract.md`](front-end/docs/api-contract.md).

## Como rodar

**1. Back-end** (precisa de Docker)
```bash
cd back-end/docker
cp .env.example .env     # preencha JWT_SECRET e as variáveis do Cloudflare R2
docker compose up --build
```

**2. Front-end** (precisa de Node 20+)
```bash
cd front-end
cp .env.example .env.local   # EXPO_PUBLIC_API_URL=http://<ip-do-computador>:8080
npm install
npx expo start
```
No celular use o IP do computador na rede, não `localhost`.

## Segurança
Segredos (JWT, chaves do R2) ficam só em `back-end/docker/.env`, que não vai para o git.
