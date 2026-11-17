# Como rodar o Pixel Hunter do zero (Windows)

Você precisa instalar só 2 coisas: **Docker Desktop** e **Node.js (versão LTS)**. Não precisa de IntelliJ nem de criar banco: o Docker faz tudo.

## 0. Preparar (só na primeira vez)
1. Instale o Docker Desktop e abra. Espere aparecer "Engine running" (embaixo à esquerda).
   Se der erro de virtualização, ative "Virtualization" na BIOS e instale o WSL.
2. Instale o Node.js LTS (https://nodejs.org).
3. Extraia o `pixel_hunter.zip`. Vão aparecer as pastas `back-end` e `front-end`.

## 1. Ligar o back-end (API)
Abra o **cmd** e rode:

```
cd caminho\pixel_hunter\back-end\docker
copy .env.example .env
set COMPOSE_PARALLEL_LIMIT=1
docker compose up --build
```

- A primeira vez demora (uns 15 a 30 minutos). Deixe essa janela aberta.
- Está pronto quando `http://localhost:8080/categories` mostrar uma lista no navegador.
- Swagger (documentação): http://localhost:8080/swagger-ui.html

## 2. Ligar o front-end (app)
Abra **outro cmd**:

```
cd caminho\pixel_hunter\front-end
copy .env.example .env.local
npm install
npx expo start --web -c
```

Dentro do `.env.local` deixe exatamente uma linha:

```
EXPO_PUBLIC_API_URL=http://localhost:8080
```

O app abre no navegador. Se aparecer "Não foi possível conectar", confira o `.env.local`, rode de novo com `-c` e aperte Ctrl+F5.

## 3. Usar no dia a dia
- **Desligar:** Ctrl+C nas duas janelas. O back-end pode ser parado com `docker compose down`. Os dados ficam salvos.
- **Ligar de novo:** repita o passo 1 (sem o `copy`), e `npx expo start --web` no passo 2. A partir da segunda vez é rápido.
- **Apagar tudo e recomeçar:** `docker compose down -v` (apaga os bancos).

## 4. Problemas comuns
| Erro | Solução |
|---|---|
| `dockerDesktopLinuxEngine ... 500` | O Docker Desktop não está aberto. Abra e espere "Engine running". |
| Erro do Maven / `mv: inter-device move failed` | `docker builder prune -af`, depois `set COMPOSE_PARALLEL_LIMIT=1` e suba de novo. |
| Serviço cai por falta de memória | Crie `C:\Users\SEU_USUARIO\.wslconfig` com `[wsl2]` e `memory=6GB`, depois `wsl --shutdown` e abra o Docker de novo. |
| Senha do banco recusada | `docker compose down -v` e suba de novo. |
| Upload de imagem falha | Normal sem as chaves do Cloudflare R2 no `.env` (resto funciona). |

## Endereços
| O quê | Endereço |
|---|---|
| API (gateway) | http://localhost:8080 |
| Swagger | http://localhost:8080/swagger-ui.html |
| Consul | http://localhost:8500 |
| Zipkin | http://localhost:9411 |
| Prometheus | http://localhost:9090 |
| Grafana (admin/admin) | http://localhost:3000 |

---

# PC com pouca memória RAM: usar Ubuntu (WSL) sem Docker Desktop

O Docker Desktop usa bastante RAM só para a interface. Dá para rodar o Docker **direto dentro do Ubuntu no Windows**, sem janela gráfica. O resto do projeto é igual.

## 1. Instalar o Ubuntu (uma vez)
No **PowerShell como administrador**:
```
wsl --install -d Ubuntu
```
Reinicie o PC se pedir, abra o app "Ubuntu" e crie usuário e senha.

## 2. Limitar a memória do WSL
Crie o arquivo `C:\Users\SEU_USUARIO\.wslconfig`:
```
[wsl2]
memory=4GB
processors=2
swap=4GB
```
Depois, no PowerShell: `wsl --shutdown`. (Se o PC tem 8 GB, use 4GB. Se tem 4 GB, use 2GB e rode a versão leve abaixo.)

## 3. Instalar o Docker dentro do Ubuntu (uma vez)
No terminal do Ubuntu:
```
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```
Feche e abra o Ubuntu de novo. Teste com `docker run hello-world`.
(Se o Docker Desktop estiver instalado, feche-o e desative a integração com WSL.)

## 4. Rodar o back-end no Ubuntu
Copie o projeto para dentro do Ubuntu (muito mais rápido que rodar em `/mnt/c`). No Ubuntu:
```
cp -r /mnt/c/CAMINHO/pixel_hunter ~/pixel_hunter
cd ~/pixel_hunter/back-end/docker
cp .env.example .env
COMPOSE_PARALLEL_LIMIT=1 docker compose up --build
```
O `localhost:8080` do Windows já acessa o que roda no WSL. O front pode continuar rodando no Windows como no passo 2.

## 5. Versão leve (economiza uns 1,3 GB)
Sobe só o necessário, sem Grafana, Prometheus, Loki e Zipkin:
```
COMPOSE_PARALLEL_LIMIT=1 docker compose up --build gateway-api auth-api product-api orders-api currency-api media-api
```
Na demonstração para o professor (requisito de observabilidade), suba tudo com `docker compose up -d`.

Dica: feche o navegador e outros programas pesados enquanto compila. A primeira build é a que mais usa memória.
