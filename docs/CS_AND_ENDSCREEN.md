# CS e tela final — 0.13

## Cenários CS

Três ilustrações originais inspiradas em localizações de cartas Option com traço CS. Não são reproduções da arte oficial e não incluem cartas/personagens achatados no fundo.

| Asset e miniatura em assets/themes/digimon | Referência |
| --- | --- |
| cs-eden.webp / cs-eden-preview.webp | Cyberspace EDEN, BT22-100 |
| cs-kuremi.webp / cs-kuremi-preview.webp | Kuremi Detective Agency, BT22-099 |
| cs-hudie.webp / cs-hudie-preview.webp | Hudie Net Café, BT23-100 |

Referências oficiais consultadas em 17/10/2026:
- https://world.digimoncard.com/cards/?card_no=BT22-100&search=true
- https://world.digimoncard.com/cards/?card_no=BT22-099&search=true
- https://en.digimoncard.com/cardlist/?category=508034&search=true

Criação com ferramenta integrada imagegen; WebP qualidade 88 e miniaturas 384 × 216 qualidade 80. Imagens carregadas sob demanda; dados embutidos no PNG. Prompts finais (resumo de produção):

- EDEN: praça virtual branca, arquitetura flutuante, anéis holográficos ciano, céu azul, profundidade e área central livre; pintura de ambiente de jogo anime 16:9, sem personagens, cartas, texto ou logos.
- Kuremi: agência de detetives em Tóquio ao entardecer, sofá, mesa, arquivos e café nas laterais; luz âmbar contra janela violeta/azul, partículas digitais discretas; centro livre, sem personagens, cartas, texto ou logos.
- Hudie: café de hackers com terminais ciano/violeta nas laterais, cabines de madeira, iluminação âmbar e holograma abstrato de borboleta distante; noite chuvosa, primeiro plano livre, sem personagens, cartas, texto ou logos.

## Tela final

Painel recolhível: **Layouts → Tela final do YouTube**. Estado opcional `endscreen` em JSON v2; ausente significa desativado. O modo oculta camadas da thumb sem alterar seus valores. Fundos temáticos e wallpaper continuam disponíveis. A ordem da camada segue o sistema de camadas do editor.

Geometria em coordenadas de 1280 × 720: largura de cada vídeo 320–440, altura sempre largura × 9/16, intervalo 40–160, Y 160–390. Os dois espaços são centralizados como grupo, sem sobreposição. Padrão: (160,280,420,236.25) e (700,280,420,236.25). As coordenadas são multiplicadas pelo fator de exportação para 1080p/1440p. Guias são editor-only e removidas da exportação.

São posições sugeridas pelo ThumbTCG, **não um padrão obrigatório do YouTube**. O criador precisa colocar a arte no vídeo e adicionar/alinha​r os dois elementos clicáveis no YouTube Studio. PNG não possui interatividade. A documentação oficial permite mover os elementos e exibi-los nos últimos 5–20 segundos; vídeo mínimo de 25 segundos:
https://support.google.com/youtube/answer/6388789

## Novos tratamentos

Separação RGB, glitch, duotone, granulação e contornos são algoritmos próprios no Worker existente. Não são novos motores WebGL nem animações. Resultado estático, determinístico, intensidade/mistura por carta, alfa original preservado. Originais ficam intactos. Os tratamentos anteriores do Konva continuam disponíveis.

Validação: `npm run test:endscreen` e `npm run test:raster`, além da regressão do editor. O teste de tela final verifica limites geométricos, guias ausentes no PNG, três resoluções, projetos antigos, validação de estado, histórico, temas CS e viewport móvel.
