# Backlog — Thumb TCG

TCG-01 e TCG-02 implementados na versão 0.4.0 e validados em Chromium desktop e móvel com toque emulado. Próxima prioridade: TCG-03. Sem datas prometidas.

| ID | Prioridade | Adição | Entrega proposta | Critério de conclusão |
| --- | --- | --- | --- | --- |
| TCG-01 · Implementado | Alta | Melhor qualidade de thumb | Exportação opcional em 1920 × 1080 e 2560 × 1440, mantendo 1280 × 720; preferência por fontes de imagem em maior resolução. | PNG nas dimensões escolhidas, textos nítidos e aviso quando a imagem original limitar a qualidade; conferir em celular e computador. |
| TCG-02 · Implementado | Alta | Edição mais dinâmica | Seleção direta de elementos na prévia, arraste, redimensionamento, desfazer/refazer e alinhamento. | Mover e ajustar elementos com mouse e toque, desfazer alterações e preservar o resultado ao salvar e reabrir o projeto. |
| TCG-03 | Média | Mais adições temáticas por cardgame | Novos fundos, molduras, efeitos e presets específicos para cada jogo. | Temas organizados por TCG, com prévia e opção de personalização, sem afetar projetos existentes. |
| TCG-04 | Média | DBs adicionais | Avaliar fontes complementares, maior cobertura de edições e artes alternativas e fallback quando uma base falhar. | Fontes identificadas, uso compatível com os termos de cada provedor, imagens importáveis e erros tratados; manter upload manual. |
| TCG-05 | Média | Mais TCGs | Escolher os próximos jogos e integrar cada um com identidade visual, enquadramento e fonte de cartas próprios. | Novo jogo disponível na home, editor funcional, busca quando houver fonte viável e upload em todos os casos. |

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
