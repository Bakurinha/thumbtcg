# Estilo de código — ThumbTCG

Este documento registra práticas de manutenção do projeto. O objetivo é tornar o código mais legível **sem mudar seu funcionamento**.

## Indentação e comentários

- JavaScript, CSS, HTML e JSON: **2 espaços**; Python: **4 espaços**.
- Preferir comentários sobre intenção, limitações, compatibilidade e interfaces entre módulos.
- Não comentar cada linha nem repetir o que a instrução já deixa evidente.
- Ao ampliar arquivos compactos, manter intactos nomes públicos, IDs e o estado salvo.

## Responsabilidades

| Módulo | Responsabilidade |
| --- | --- |
| `editor.js` | Desenho SVG, layouts básicos e exportação PNG |
| `studio.js` | Rotas, TCGs, busca, arte e projetos |
| `interactions.js` | Seleção, movimento e histórico |
| `advanced.js` / `composition.js` | Camadas e layout personalizado |
| `effects.js` / `themes.js` / `scenes.js` | Efeitos e decorações |
| `providers.js` / `images.js` | Provedores e imagens |
| `i18n.js` / `locales.js` | Traduções da interface |
| `worker/index.mjs` | Proxy de imagens Cloudflare |

## Validação antes da próxima etapa

1. Executar `npm test` e os testes específicos de temas, composição, efeitos e navegador.
2. Testar seleção de cartas, movimentação, salvamento de JSON e abertura de projetos antigos.
3. Conferir PNG de 1280×720, 1920×1080 e 2560×1440.
4. Verificar visual desktop e celular, sem alterar seletor, layout ou traduções por acidente.

A indentação foi normalizada por linha de forma conservadora. Algumas expressões
JavaScript permanecem compactas na mesma linha para não alterar a lógica e nem a
serialização dos projetos. Expandir expressões exige revisão e testes separados.
