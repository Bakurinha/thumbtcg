# Backlog — Thumb TCG

Ideias aprovadas para planejamento, ainda não implementadas. A ordem abaixo é uma proposta de prioridade, sem datas prometidas.

| ID | Prioridade | Adição | Entrega proposta | Critério de conclusão |
| --- | --- | --- | --- | --- |
| TCG-01 | Alta | Melhor qualidade de thumb | Exportação opcional em 1920 × 1080 e 2560 × 1440, mantendo 1280 × 720; preferência por fontes de imagem em maior resolução. | PNG nas dimensões escolhidas, textos nítidos e aviso quando a imagem original limitar a qualidade; conferir em celular e computador. |
| TCG-02 | Alta | Edição mais dinâmica | Seleção direta de elementos na prévia, arraste, redimensionamento, desfazer/refazer e alinhamento. | Mover e ajustar elementos com mouse e toque, desfazer alterações e preservar o resultado ao salvar e reabrir o projeto. |
| TCG-03 | Média | Mais adições temáticas por cardgame | Novos fundos, molduras, efeitos e presets específicos para cada jogo. | Temas organizados por TCG, com prévia e opção de personalização, sem afetar projetos existentes. |
| TCG-04 | Média | DBs adicionais | Avaliar fontes complementares, maior cobertura de edições e artes alternativas e fallback quando uma base falhar. | Fontes identificadas, uso compatível com os termos de cada provedor, imagens importáveis e erros tratados; manter upload manual. |
| TCG-05 | Média | Mais TCGs | Escolher os próximos jogos e integrar cada um com identidade visual, enquadramento e fonte de cartas próprios. | Novo jogo disponível na home, editor funcional, busca quando houver fonte viável e upload em todos os casos. |

## Pendência da integração atual

- [ ] Receber a URL pública do Worker implantado na Cloudflare.
- [ ] Configurar `imageService` em `config.js` e testar importação de Digimon e One Piece.
- [ ] Validar exportação PNG real em navegador, inclusive no celular.

## Regra de evolução

Cada entrega deve atualizar o CHANGELOG e preservar a abertura dos projetos salvos. Priorizar uma alteração por vez e verificar o fluxo de selecionar carta, editar, salvar e exportar.
