# ThumbTCG

Editor de thumbnails dedicado a trading card games, mantido por **Bakura**.

**Site:** https://bakurinha.github.io/thumbtcg/

## O que há nesta versão

- Boas-vindas com seleção de Digimon TCG, Yu-Gi-Oh!, Magic: The Gathering e One Piece.
- Rotas compartilháveis: `#digimon`, `#yugioh`, `#magic` e `#onepiece`.
- Dez layouts, paletas de cada TCG, padrões visuais próprios e cores livres por lado.
- Pesquisa nas bases correspondentes ao cardgame escolhido, com resultados e paginação.
- Upload de imagens em todos os jogos; recorte inicial da ilustração em Yu-Gi-Oh!, Magic e One Piece.
- Posição horizontal/vertical, zoom e modo de arraste na prévia, inclusive por toque.
- Textos, fontes, VS/X personalizado e elementos opcionais.
- Exportação PNG em 1280 × 720, com as imagens incorporadas à renderização.
- Salvar/abrir projeto JSON com as imagens. Rascunhos separados por jogo durante a sessão.
- Interface responsiva: prévia ao lado das ferramentas no desktop e fluxo vertical no celular.
- Contato e chave PIX com botão de copiar.

## Como usar

Abra `index.html` ou acesse o site. Não é necessário instalar dependências para usar o editor.

1. Escolha o cardgame.
2. Pesquise uma carta ou envie uma imagem em cada lado.
3. Selecione um layout, as cores e os textos.
4. Ajuste o recorte, a posição e o zoom. Para artes já recortadas, escolha **Carta inteira / arte já recortada**.
5. Exporte o PNG. Salve o projeto JSON se quiser editar novamente depois.

Os rascunhos em memória duram somente enquanto a página estiver aberta. O arquivo JSON é a forma de guardar a edição, inclusive as imagens, entre sessões.

## Bases externas e limites atuais

| Jogo | Base | Integração atual |
| --- | --- | --- |
| Digimon | [DigimonCard.io](https://digimoncard.io/api-documentation) | Busca por nome/código e preenchimento dos dados. Imagem por upload. |
| Yu-Gi-Oh! | [YGOPRODeck](https://ygoprodeck.com/api-guide/) | Busca por nome, artes alternativas e preenchimento dos dados. Imagem por upload. |
| Magic | [Scryfall](https://scryfall.com/docs/api) | Busca com edições, prévias e importação de imagem; depende da disponibilidade da base. |
| One Piece | [OPTCG API](https://optcgapi.com/documentation) | Busca em sets, starter decks e promos, com prévias. Importação é tentada; o servidor de imagens não apresentou CORS nos testes, então o upload pode ser necessário. |

DigimonCard.io e YGOPRODeck orientam baixar e hospedar as imagens na infraestrutura da aplicação. Esta versão estática não faz hotlink dessas imagens. Para importar automaticamente nesses jogos, o próximo passo é um serviço próprio com cache de imagens; não se devem inserir chaves privadas no JavaScript nem usar proxies públicos improvisados.

Consultas são disparadas pelo botão Buscar, espaçadas e guardadas em cache em memória por uma hora. A base de Digimon retorna no máximo 1.000 resultados por consulta. A disponibilidade e a cobertura das edições dependem dos fornecedores. Pesquisas por nome em inglês costumam ter melhor cobertura.

## Desenvolvimento

- `index.html`: estrutura semântica, boas-vindas e editor.
- `editor.js` / `editor.css`: motor SVG e os dez layouts originais.
- `studio.js` / `studio.css`: navegação, temas, enquadramento e projetos.
- `providers.js`: adaptadores das bases, cache, controle de consultas e normalização dos resultados.
- `tests/studio.test.cjs`: testes de interação e adaptadores em DOM simulado.

Para executar os testes, use uma versão de Node compatível com jsdom 30:

```sh
npm install
npm test
```

A validação da versão 0.2 incluiu sintaxe JavaScript, fluxos em DOM simulado e consultas HTTP a provedores. **Não houve validação visual em navegador nem teste real de exportação PNG nesta sessão.**

## Contato e apoio

- **Bakura:** suportebakura@gmail.com
- **PIX:** suportebakura@gmail.com (doação voluntária)

Projeto independente de fãs. Marcas, cartas e ilustrações pertencem aos respectivos titulares. Os estilos são interpretações visuais do projeto, não um ranking estatístico de thumbnails mais populares.
