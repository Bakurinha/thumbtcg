# Backlog — Thumb TCG

## Recorte e acabamento — 0.14.0

- [x] Pincel de transparência/restauração, seleção, varinha e substituição de cor.
- [x] Ajustes locais de cor e definição em Worker, comparação e histórico.
- [x] Título dourado, escala X/Y, sombra e sublinhado.
- [x] IA local Beta: U²-Net portátil para fundo e UpscalerJS para ampliação, opcionais, com cancelamento e comparação.
- [ ] Validar qualidade da IA por cardgame e em Android/iOS físicos; melhorar recortes de fogo/brilho e ampliar limites de resolução.
- [ ] Preservar resolução acima de 2048 px no retoque por processamento em blocos.
- [ ] Seleção por laço e refinamento de cabelo/contorno com máscara persistente.


## Qualidade e documentação do código — 0.11.1

| ID | Situação | Entrega / critério |
| --- | --- | --- |
| QUAL-01 | Implementado | Indentação normalizada em módulos JavaScript e CSS; comentários nas responsabilidades dos módulos e pontos críticos. Preservados os identificadores, os contratos do editor e o formato de projeto. |
| QUAL-02 | **Validado em 2026-10-16** | GitHub Actions: sintaxe, testes unitários/regressão, Chromium desktop/mobile emulado, temas, efeitos, layout, exportação PNG 720p/1080p/1440p, histórico e projetos legados. [Execução aprovada](https://github.com/Bakurinha/thumbtcg/actions/runs/38884858689). |
| QUAL-03 | Pendente | Validar em dispositivos físicos Android/iOS; emulação no Chromium não substitui esse teste. |


TCG-01 e TCG-02 implementados na versão 0.4.0 e validados em Chromium desktop e móvel com toque emulado. TCG-03 a TCG-05 retomados na versão 0.7.0 após a entrega do editor avançado. Sem datas prometidas.

## Prioridade atual — Composição livre e internacionalização

| ID | Situação | Entrega / critério |
| --- | --- | --- |
| EDIT-01 | Implementado em 0.8.0 | Layout base ligado por padrão, opção de desligar e importar composição própria como imagem; JSON para manter elementos editáveis. |
| EDIT-02 | Implementado em 0.8.0 | Layouts, camadas, efeitos e edição na prévia na mesma área compacta, com painéis recolhíveis. |
| EDIT-03 | Implementado em 0.8.0 | Seis layouts iniciais para uma carta; ampliar/refinar após as imagens de referência do usuário. |
| EDIT-04 | Implementado em 0.8.0 | Visibilidade independente das cartas 1 e 2, rotação, espelhamento e remoção; preservar exportação e histórico. |
| EDIT-05 | Implementado em 0.8.0 | Novos efeitos: retícula de impressão, linhas de tela e vinheta ajustáveis. |
| EDIT-06 | Implementado em 0.8.0 | Customização geral: combinar posições e estilos de títulos, detalhes, bases e centro de diferentes layouts. |
| LANG-01 | Implementado em 0.9.0 | Seletor PT/EN/ES no topo direito, preferência persistida e catálogo de traduções. |
| LANG-02 | Implementado em 0.9.0 | Revisão integral de títulos, controles, dicas, acessibilidade, erros, busca e mensagens dinâmicas; não traduzir texto digitado nem nomes oficiais de cartas. Catálogo revisado e fluxos validados nos três idiomas em desktop e celular emulado. |
| EDIT-07 | Aguardando referências | Novos modelos singulares baseados nas imagens que o usuário enviará. Não bloqueia os seis modelos iniciais. |

## Prioridade — Enquadramento e efeitos (0.6.0)

| ID | Situação | Entrega compatível com o editor atual |
| --- | --- | --- |
| ADV-06 | Implementado | Painel recolhido, duas abas, controles individuais e prévia ao vivo por frame. |
| ADV-07 | Implementado | Rotação/inclinação 2D, divisão diagonal, cinco máscaras, leque de 2–5 cartas, lupa manual e guias magnéticas. |
| ADV-08 | Implementado | Reflexo, sombra, neon, foil, raios, luz difusa, linhas de ação, partículas e extrusão de títulos simulada em 2D. |
| ADV-09 | Implementado | Persistência, histórico, migração de camadas antigas e exportação dos efeitos no PNG; verificações desktop/móvel emulado. |
| ADV-10 | Manual | Pop-out com PNG transparente previamente recortado, usando a imagem adicional e a ordem das camadas. |

**Fora do escopo atual:** perspectiva/matrizes 3D reais, curvatura física da carta, distorção projetiva e detecção automática do monstro/rosto. Não foram criados controles que prometam essas funções. Foco da lupa e enquadramento são manuais. Considerar outro motor somente em uma etapa futura explicitamente priorizada.

## Prioridade acima do backlog anterior — Editor avançado (0.5.0)

Implementado e verificado em Chromium desktop e móvel com toque emulado. Conferência em aparelho físico continua pendente.

| ID | Funcionalidade prioritária | Entrega |
| --- | --- | --- |
| ADV-01 · Implementado | Edição por camadas | “Edição avançada” recolhida por padrão; trazer à frente, enviar ao fundo, subir/descer uma camada e restaurar ordem. |
| ADV-02 · Implementado | Edição na prévia opcional | Controles de seleção, posição, tamanho e alinhamento aparecem somente ao ativar a caixa de edição. |
| ADV-03 · Implementado | Layouts e imagens de fundo | 12 novas composições (22 no total), círculos, duelos panorâmicos, cartões completos, destaque assimétrico, cinema e criador; upload de wallpaper e imagem adicional/retrato. |
| ADV-04 · Implementado | Fundo ampliado e efeitos | Uma ou duas cartas ampliadas atrás da arte; zoom, posição, gamma, brilho, contraste, saturação, desfoque, opacidade e escurecimento independentes; presets cinema, suave, monocromático, intenso e brilho neon. |
| ADV-05 · Implementado | Persistência e exportação | Camadas e imagens adicionais salvas no projeto, desfazer/refazer, isolamento por TCG, abertura de projetos antigos e filtros preservados no PNG. |

## Backlog anterior — retomada após o editor avançado

| ID | Prioridade | Adição | Entrega proposta | Critério de conclusão |
| --- | --- | --- | --- | --- |
| TCG-01 · Implementado | Alta | Melhor qualidade de thumb | Exportação opcional em 1920 × 1080 e 2560 × 1440, mantendo 1280 × 720; preferência por fontes de imagem em maior resolução. | PNG nas dimensões escolhidas, textos nítidos e aviso quando a imagem original limitar a qualidade; conferir em celular e computador. |
| TCG-02 · Implementado | Alta | Edição mais dinâmica | Seleção direta de elementos na prévia, arraste, redimensionamento, desfazer/refazer e alinhamento. | Mover e ajustar elementos com mouse e toque, desfazer alterações e preservar o resultado ao salvar e reabrir o projeto. |
| TCG-03 · Implementado | Média | Mais adições temáticas por cardgame | Novos fundos, molduras, efeitos e presets específicos para cada jogo. | Temas organizados por TCG, com prévia e opção de personalização, sem afetar projetos existentes. |
| TCG-04 · Implementado | Média | DBs adicionais | Avaliar fontes complementares, maior cobertura de edições e artes alternativas e fallback quando uma base falhar. | Fontes identificadas, uso compatível com os termos de cada provedor, imagens importáveis e erros tratados; manter upload manual. |
| TCG-05 · Implementado | Média | Mais TCGs | Escolher os próximos jogos e integrar cada um com identidade visual, enquadramento e fonte de cartas próprios. | Novo jogo disponível na home, editor funcional, busca quando houver fonte viável e upload em todos os casos. |

## Entregas da versão 0.7.0

- 18 temas (três por jogo), intensidade e molduras; fundos e molduras são camadas opcionais e preservam projetos anteriores.
- Pokémon TCG: TCGdex em inglês/português, busca por nome ou código, paginação e upload.
- Disney Lorcana: Lorcast online e catálogo local complementar com metadados LorcanaJSON e URLs reais do Lorcast; fallback automático em falhas de busca.
- Fontes identificadas nos resultados. O catálogo alternativo reduz dependência da API de busca; imagens ainda dependem do CDN externo.

## Pendência da integração atual

- [x] Receber a URL pública do Worker implantado na Cloudflare.
- [x] Configurar `imageService` em `config.js`.
- [x] Validar o Worker por HTTP: Digimon e One Piece retornam imagens (200) e CORS correto após a correção de redirecionamento.
- [ ] Confirmar importação das bases externas em aparelho físico.
- [x] Validar PNG real em 720p/1080p/1440p no Chromium desktop e com tela móvel/toque emulados.
- [ ] Conferir o fluxo completo em celular físico.

## Entregas da versão 0.4.0

- Seleção direta de cartas, textos, bases e faixas; arraste e redimensionamento proporcional por alça ou campos numéricos.
- Alinhamento ao canvas, histórico de 25 alterações, posições e resolução persistidas no projeto JSON.
- Compatibilidade com projetos v2 anteriores, que recebem os valores padrão dos novos campos.
- Avisos de nitidez conforme a resolução original, o enquadramento, o zoom e a resolução de exportação; upload preservado até 4096 px e preferência por PNG do Scryfall.

## Regra de evolução

Cada entrega deve atualizar o CHANGELOG e preservar a abertura dos projetos salvos. Priorizar uma alteração por vez e verificar o fluxo de selecionar carta, editar, salvar e exportar.

## Final da fila — Expansão de temas por cardgame

| ID | Situação | Entrega / critério |
| --- | --- | --- |
| TEMA-10 | Implementado em 0.10.0 | 10 temas para cada um dos seis cardgames (60 no total; 42 novos). Novos padrões e molduras, galeria compacta, nomes em PT/EN/ES, preservação de projetos anteriores e PNG verificados em desktop e celular emulado. |

### Modelo de referência — versão 0.11.0

- [x] Lua vermelha, exclusivo de Digimon: castelo e lua vermelha, duas cartas editáveis inclinadas, neon vermelho/roxo, prévia e exportação PNG.
- [ ] Receber referências adicionais para modelos singulares (EDIT-07).

- [x] Oito novos temas de Digimon com as imagens enviadas, miniaturas, intensidade, moldura opcional e nomes em PT/EN/ES (18 temas de Digimon, 68 no total).


### Motores e lacunas de edição — 0.12.0

- [x] Pesquisar Konva, Fabric.js e PixiJS; registrar decisão e fontes em docs/EDITING_ENGINES.md.
- [x] Integrar cinco filtros Konva em worker opcional, com originais preservados, configuração por carta, histórico e JSON compatível.
- [x] Adicionar Editorial diagonal e Vitrine assimétrica com IDs estáveis.
- [ ] Avaliar efeitos de deslocamento, aberração cromática e glitch com alternativa para aparelhos sem GPU compatível.
- [ ] Evoluir o modelo para quantidade livre de cartas e perspectiva projetiva exportável.

## Entrega 0.13 — efeitos, tela final e CS

- [x] Cinco tratamentos extras: separação RGB, glitch, duotone, granulação e contornos neon.
- [x] Tela final YouTube: dois espaços 16:9, tamanho/posição/espaçamento, cor, borda, título, mensagem e guias apenas na prévia.
- [x] Fundos ilustrados CS: EDEN, Agência Kuremi e Café Hudie; carregamento sob demanda.
- [x] Persistência, idiomas PT/EN/ES e exportação PNG.

## Próximas coleções Digimon (ordem solicitada)

- [ ] SW — pesquisar cartas de referência e criar fundos específicos.
- [ ] ME — pesquisar cartas de referência e criar fundos específicos.
- [ ] TB — pesquisar cartas de referência e criar fundos específicos.
- [ ] DM — pesquisar cartas de referência e criar fundos específicos.
- [ ] NSO — pesquisar cartas de referência e criar fundos específicos.
- [ ] NSP — pesquisar cartas de referência e criar fundos específicos.
