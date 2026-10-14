# Backlog — Thumb TCG

TCG-01 e TCG-02 implementados na versão 0.4.0 e validados em Chromium desktop e móvel com toque emulado. A expansão TCG-03 a TCG-05 foi pausada para priorizar o editor avançado solicitado. Sem datas prometidas.

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
