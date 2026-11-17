# Pixel Hunter

Aplicativo mobile de marketplace de assets digitais (pixel art) para desenvolvedores indie, inspirado na Unity Asset Store, com identidade visual própria. Projeto acadêmico: este repositório é o front-end; a API REST em Java (microsserviços atrás de um gateway) fica em outro repositório.

**Stack:** React Native, JavaScript e Expo (SDK 58), com React Navigation. Não usa TypeScript.

## Como rodar

Requisitos: Node.js, o app **Expo Go** no celular (celular e computador na mesma rede Wi-Fi) e o back-end rodando.

```bash
npm install
cp .env.example .env.local   # ajuste EXPO_PUBLIC_API_URL para o gateway do back-end
npx expo start
```

`EXPO_PUBLIC_API_URL` é a URL do gateway (ex.: `http://192.168.0.10:8080`). No celular use o IP do computador, não `localhost`; no emulador Android, `10.0.2.2`. Sem ela o app abre, mas as telas mostram o erro de configuração. Reinicie o Expo ao mudar o valor.

Opcional (terá que instalar uma dependência, e a extensão "Mobile Simulator - responsive testing tool" (Simulador de telefone móvel - teste site responsivo), no Google.
```bash
npx expo start --web
```

Escaneie o QR code com o Expo Go. Se a rede bloquear a conexão (comum em Wi-Fi de faculdade), use `npx expo start --tunnel`.

Verificações:

```bash
npm run lint        # ESLint (npx expo lint)
npx expo-doctor     # dependências e configuração
```

Instale dependências sempre com `npx expo install <pacote>`, para obter versões compatíveis com o SDK.

## Estrutura

```
App.js                entrada: fontes, AuthProvider, CartProvider e NavigationContainer
src/
  components/         componentes reutilizáveis (Button, TextField, Card, AssetCard...)
  constants/          tema (cores, fonte, efeitos), categorias, imagens, dados de atendimento
  context/            estado global (sessão do usuário, carrinho)
  config/             variáveis de ambiente (URL da API)
  pages/              telas
  routes/             navegação (pilha única) e tema do React Navigation
  services/           acesso à API (httpClient único + um serviço por recurso)
  utils/              validadores, formatação, horário de atendimento, layout de imagem
assets/images/        imagens fornecidas pelo grupo (mapa de fundo)
docs/api-contract.md  endpoints da API usados pelo app
```

## Telas e estado atual

| Tela | Estado |
|---|---|
| Início (Home) | Login real (e-mail e senha), com carregamento e erro; a sessão fica no armazenamento seguro e é restaurada ao abrir. "Explorar lojas" entra sem conta. |
| Cadastro | Usuário, e-mail, senha e tipo de conta (Comprador ou Vendedor); envia à API. |
| Mapa de Lojas (menu principal) | Busca, configurações, carrinho com contador e categorias vindas da API sobre o mapa. |
| Lista de assets (categoria/busca) | Produtos da API, com imagem; busca e filtro feitos pelo servidor. Trata carregamento, erro e lista vazia. |
| Detalhe do asset | Dados e imagem da API; adiciona/remove do carrinho. |
| Carrinho | Local (em memória). **Finalizar compra** cria o pedido na API (só conta Comprador logada). |
| Configurações | Mostra só o que o perfil pode usar: Meus Dados (logado), Meus Pedidos (Comprador), Cadastrar Produto (Vendedor), Sair/Entrar. |
| Meus Dados | Carrega e salva nome, e-mail e link; a foto escolhida é enviada e gravada no perfil. |
| Meus Pedidos | Histórico real do comprador; tocar em um pedido abre o detalhe com os itens. |
| Meus Produtos | Só Vendedor: lista os próprios produtos, edita (mesma tela do cadastro) e exclui com confirmação. |
| Histórico de Vendas | Só Vendedor: itens vendidos, com data, pedido e total vendido. |
| Atendimento ao Cliente | Telefones, status ONLINE/OFFLINE calculado pelo horário de Brasília; **Enviar e-mail desabilitado** até definir o endereço. |
| Cadastro de Produto | Só Vendedor: imagem, categoria, título, descrição e preço; envia a imagem e publica o produto. |

Nenhuma operação simula sucesso: o resultado mostrado é sempre o da API, com a mensagem de erro dela quando falha.

## Pendências conhecidas

- Endpoints ainda sem tela (editar/excluir produto, meus produtos, vendas): ver `docs/api-contract.md`.
- Lista de status de pedido e pagamento a definir com o grupo do back-end.
- E-mail de atendimento em `src/constants/support.js` (`email: null`); os telefones vieram do frame de design e devem ser confirmados.
- O carrinho não é persistido: some ao fechar o app.
- As validações do app (ex.: senha com no mínimo 6 caracteres) só avisam cedo; a API valida de novo e sua mensagem prevalece.
- Ícones são do Ionicons (provisórios); logotipo e demais imagens são colocados manualmente pelo grupo.
- `LICENSE` é o do template do Expo; trocar pela licença do grupo, se houver.
- `npm audit` aponta vulnerabilidades em ferramentas de linha de comando do Expo (não no código do app). Não use `npm audit fix --force`: ele tentaria instalar uma versão antiga do Expo e quebraria o projeto.

## Integração com a API

Endpoints, formatos e como testar: [docs/api-contract.md](docs/api-contract.md). Para trocar de ambiente basta mudar `EXPO_PUBLIC_API_URL`.
