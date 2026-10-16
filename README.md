# ThumbTCG

Editor de thumbnails dedicado a trading card games, mantido por **Bakura**.

**Site:** https://bakurinha.github.io/thumbtcg/

## O que há nesta versão

- Boas-vindas com seleção de Digimon TCG, Yu-Gi-Oh!, Magic: The Gathering, One Piece, Pokémon TCG e Disney Lorcana.
- Rotas compartilháveis: `#digimon`, `#yugioh`, `#magic`, `#onepiece`, `#pokemon` e `#lorcana`.
- 68 temas (18 em Digimon e dez em cada um dos outros jogos), molduras e intensidade ajustável; preservam cartas e posições.
- 28 layouts gerais (seis para uma carta) e o modelo Lua vermelha exclusivo de Digimon, paletas de cada TCG, padrões visuais próprios e cores livres por lado.
- Pesquisa nas bases correspondentes ao cardgame escolhido, com resultados e paginação.
- Upload de imagens em todos os jogos; recorte inicial da ilustração em Yu-Gi-Oh!, Magic e One Piece.
- Posição horizontal/vertical, zoom e edição direta na prévia, inclusive por toque.
- Seleção de cartas, textos, bases e faixas; arraste, redimensionamento proporcional e alinhamento ao canvas.
- Desfazer/refazer até 25 alterações por sessão de edição; projetos antigos continuam compatíveis.
- Textos, fontes, VS/X personalizado e elementos opcionais.
- Exportação PNG em 1280 × 720, 1920 × 1080 e 2560 × 1440, com imagens incorporadas e avisos de nitidez.
- Salvar/abrir projeto JSON com as imagens. Rascunhos separados por jogo durante a sessão.
- Interface responsiva: prévia ao lado das ferramentas no desktop e fluxo vertical no celular.
- Contato e chave PIX com botão de copiar.

## Composição livre (0.8.0)

Em **Ferramentas do editor**, clique em uma opção para abrir seu painel; clique novamente para recolher. Layouts, customização, camadas, efeitos, edição direta, textos e temas ficam juntos. Recolha o grupo inteiro para priorizar a prévia.

- **Layouts → Uma carta / apresentação de deck:** seis modelos centrais, laterais, circular, panorâmico e galeria. A segunda carta começa oculta; pode ser reativada sem perder o arquivo.
- **Customização geral:** importe PNG/JPG/WebP/AVIF como uma camada, ajuste opacidade/enquadramento e desligue a decoração base. PNG transparente funciona como moldura; uma imagem importada não vira elementos editáveis. Para isso, abra um projeto JSON do ThumbTCG.
- Combine títulos, detalhes, bases e centro de outros modelos. Retícula, linhas de tela e vinheta têm intensidades independentes.
- Em cada carta, abra **visibilidade e orientação** para ocultar, girar, espelhar ou remover. A imagem adicional também tem rotação/espelhamento. Remoções podem ser desfeitas.
- A composição é preservada no JSON, no histórico e no PNG exportado.

## Idiomas (0.9.0)

O seletor no canto superior direito oferece **Português, English e Español**. A preferência fica salva neste navegador; se o armazenamento estiver bloqueado, a troca funciona durante a sessão. O idioma inicial é português.

Menus, layouts, temas, dicas, atributos de acessibilidade e mensagens de busca, carregamento, erro e exportação estão no catálogo local `locales.js`. A troca não envia textos a serviços de tradução. Nomes de cartas, informações vindas das bases, arquivos e textos digitados no projeto mantêm o conteúdo original; o idioma de uma base (como TCGdex EN/PT) continua sendo uma escolha separada.

O idioma da interface não faz parte do projeto JSON e não altera a arte exportada. A versão 0.11.0 inclui o primeiro modelo de referência: Lua vermelha, exclusivo de Digimon, com cenário incorporado ao PNG, duas cartas editáveis, inclinação e neon vermelho/roxo. O cenário é um recurso incluído no aplicativo; o JSON guarda a escolha do modelo e as personalizações. A expansão para **10 temas por cardgame** foi concluída na versão 0.10.0 (60 nos seis jogos atuais).

Para novos controles, adicione as mensagens em `locales.js`; parâmetros dinâmicos usam `{0}`, `{1}`, etc. `i18n.js` traduz somente a interface, observa novos textos e protege os valores dos campos, o SVG da arte e os dados das cartas. Execute `npm run test:i18n` com o servidor local e Chromium disponíveis.

## Temas por cardgame

São **18 temas em Digimon e 10 em cada um dos outros cinco jogos**. Os 42 novos temas incluem trilhas de memória e armadura em Digimon; Sincro, Xyz e selos em Yu-Gi-Oh!; paisagens de mana em Magic; cartazes, mapas e navegação em One Piece; energias e tipos em Pokémon; tintas e páginas de história em Lorcana. As miniaturas apresentam os padrões e molduras de cada modelo. A galeria tem rolagem interna para manter os controles próximos, inclusive no celular.


Em **Temas do cardgame**, escolha um preset e ajuste a intensidade ou a moldura. Os presets atualizam as cores dos dois lados, mantendo textos, imagens, posições e efeitos. **Remover efeitos e moldura** preserva as cores escolhidas. Fundo e moldura aparecem na edição por camadas. Projetos antigos abrem sem tema aplicado.

## Edição avançada

Abra **Ferramentas do editor → Camadas e fundo** para ordenar camadas, enviar um wallpaper ou uma imagem adicional e controlar o fundo ampliado. A lista mostra primeiro o que está na frente. Os botões movem a camada selecionada; **Restaurar ordem** recupera a composição original.

O fundo pode usar a carta esquerda, a direita, ambas ou um arquivo próprio. Seus ajustes de gamma, brilho, contraste, saturação, desfoque, zoom e posição são independentes das cartas frontais. Os presets são pontos de partida ajustáveis. Um wallpaper enviado é preservado ao escolher outro layout.

Abra **Ferramentas do editor → Editar elementos** para revelar as ferramentas de posicionamento e tamanho, inclusive da imagem adicional. Para retratos recortados, envie PNG com transparência; o editor não remove o fundo automaticamente. Projetos JSON guardam os dois uploads, as configurações e a ordem das camadas.

## Avançada e Prévia (0.6)

Marque **Avançada e Prévia** para abrir as duas abas. As funções começam desligadas; fechar o painel apenas recolhe os controles, preservando a composição.

- **Enquadramento & Câmera:** escolha a carta esquerda/direita, ajuste rotação Z e inclinação simulada, máscara e divisão diagonal. O leque combina as duas cartas do editor com até três arquivos adicionais; seus controles de abertura, posição, escala e carta focal são independentes dos efeitos das cartas soltas. A lupa usa a imagem original, incluindo o texto da carta. Guias e encaixe ajudam no arraste em “Edição na prévia”.
- **Efeitos & Shaders:** reflexo, sombra/neon e foil por carta; raios, luzes, linhas de ação, partículas e títulos com volume simulado. O fundo e seu desfoque usam os mesmos valores de “Edição avançada”.

Lupa e leque também podem ser selecionados, arrastados, redimensionados e ordenados nas camadas. Reflexos precisam de espaço abaixo da carta; máscaras do layout e limites do canvas podem recortá-los. Para um personagem saindo da moldura, envie PNG já recortado em **Imagem adicional**, posicione e traga a camada para a frente.

O motor continua em SVG no navegador: inclinação/extrusão são aproximações 2D, sem 3D real, deformação física ou detecção automática de personagens. As partículas e o foil são estáticos, adequados à thumbnail. Os efeitos são incorporados ao PNG; guias e seleção não são exportadas. Nenhum serviço adicional de IA ou renderização é usado.

## Como usar

Acesse o site (ou sirva a pasta por HTTP para desenvolvimento). Não é necessário instalar dependências para usar o editor.

1. Escolha o cardgame.
2. Pesquise uma carta ou envie uma imagem em cada lado.
3. Selecione um layout, as cores e os textos.
4. Ajuste o recorte, a posição e o zoom. Para artes já recortadas, escolha **Carta inteira / arte já recortada**.
5. Escolha a resolução e exporte o PNG. Salve o projeto JSON se quiser editar novamente depois.

Os rascunhos em memória duram somente enquanto a página estiver aberta. O arquivo JSON é a forma de guardar a edição, inclusive as imagens, entre sessões.

## Bases externas e imagens

| Jogo | Fonte | Situação |
| --- | --- | --- |
| Digimon | Índice Digimon Card App / imagens TakaOtaku | Prévia e busca por nome/código com artes alternativas. Worker conectado; validação em navegador pendente. |
| Yu-Gi-Oh! | YGOPRODeck + YGOResources | Importação direta via repositórios de imagens, vinculada pelo ID Konami e arte do manifesto. |
| Magic | Scryfall | Prévia e importação direta, incluindo edições e faces. |
| One Piece | OPTCG API | Prévia; Worker conectado; validação em navegador pendente. |

| Pokémon | TCGdex | Inglês/português, nome/código e importação direta quando a edição oferece imagem. |
| Lorcana | Lorcast + catálogo local LorcanaJSON/Lorcast | Busca online e alternativa local; imagens via Worker. |

A fonte pode ser escolhida em Pokémon e Lorcana. O modo automático de Lorcana usa o catálogo local quando a busca online falha; o CDN das imagens continua sendo externo. O catálogo não garante lançamentos posteriores à sua atualização. Para reconstruí-lo, execute `python scripts/update-lorcana-index.py`; o script só grava após concluir todas as coleções. Referências: [TCGdex](https://tcgdex.dev), [Lorcast](https://lorcast.com/docs/api), [LorcanaJSON](https://lorcanajson.org).

**Serviço de imagens configurado:**
`https://thumbtcg-images.suportebakura.workers.dev`.
A URL já está em `config.js`. Em 14/10/2026, a validação HTTP confirmou imagens
Digimon (BT11-017, WebP) e One Piece (OP01-024, JPEG) com resposta 200 e CORS
para a origem do site. A validação visual da importação no navegador segue pendente.
O upload manual continua disponível. Para manutenção, veja [worker/README.md](worker/README.md).

As imagens importadas são incorporadas ao projeto para exportação. Uma falha de
importação mantém a carta anterior e seus dados. Há limite de 8 MB por imagem e
cache de 24 MB na sessão para evitar downloads repetidos.

Os índices locais incluem 8.810 registros de Digimon e 14.342 IDs de Yu-Gi-Oh! nesta
versão. Eles não garantem todas as edições futuras. Atualize com
`python scripts/update-image-indexes.py` e publique os arquivos `data/`.

Fontes dos índices:
- https://github.com/TakaOtaku/Digimon-Card-App
- https://github.com/yugioh-artworks/artworks-index
- https://ygoprodeck.com/api-guide/
- https://scryfall.com/docs/api
- https://optcgapi.com/documentation

Não fazemos hotlink das imagens do YGOPRODeck ou DigimonCard.io. A cobertura e a
disponibilidade dependem das fontes; buscas em inglês têm melhor cobertura.

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

A versão 0.4 foi validada em Chromium com tela desktop (1440 px) e móvel (390 px, toque emulado): upload, arraste, redimensionamento, alinhamento, histórico, projetos novos/antigos e PNG real nas três resoluções. Isso não substitui um teste em aparelho físico. Os testes de navegador usam imagens de teste locais; as bases externas foram verificadas separadamente por HTTP.

Para repetir: `npx playwright install chromium`, sirva a pasta com `python -m http.server 8765` e rode `npm run test:browser`. `BASE_URL` permite mudar o servidor; `CHROMIUM_PATH` permite usar um Chromium já instalado.

Ative **Editar elementos na prévia** para arrastar e usar o ponto no canto. Também há campos numéricos e alinhamento ao canvas. Use Ctrl/Cmd+Z para desfazer e Ctrl/Cmd+Shift+Z ou Ctrl+Y para refazer (fora dos campos de texto). O histórico reinicia ao trocar de jogo ou abrir um projeto; as posições e a resolução são salvas no JSON. A exportação maior não recria detalhes ausentes nas cartas. Uploads mantêm até 4096 px no maior lado; Magic prioriza PNG quando disponível.

## Contato e apoio

- **Bakura:** suportebakura@gmail.com
- **PIX:** suportebakura@gmail.com (doação voluntária)

Projeto independente de fãs. Marcas, cartas e ilustrações pertencem aos respectivos titulares. Os estilos são interpretações visuais do projeto, não um ranking estatístico de thumbnails mais populares.

Validação do editor avançado: `npm run test:advanced` com servidor HTTP local (mesmas variáveis `BASE_URL` e `CHROMIUM_PATH` do teste de navegador). Verifica 12 novos layouts, opções recolhidas, camadas e histórico, upload/roundtrip, rascunhos por jogo e pixels reais do PNG com filtros.

Teste do módulo visual: `npm run test:effects` com servidor HTTP local e as mesmas variáveis `BASE_URL` e `CHROMIUM_PATH`. Verifica também pixels do reflexo/foil no PNG, guias excluídas, cinco cartas no leque, migração de camadas e estabilidade da atualização por frame.

Oito cenários enviados pelo usuário foram adicionados aos temas de Digimon: Catedral sombria, Forja industrial, Vila da floresta, Portal dourado, Arena neon, Fogo e gelo, Trono ancestral e Reino submarino. Digimon agora tem 18 temas; os demais jogos mantêm 10 cada (68 no total). Os fundos carregam sob demanda e são incorporados na exportação PNG.
