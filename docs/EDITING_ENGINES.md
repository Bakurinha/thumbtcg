# Motores de edição — avaliação e integração (0.12.0)

## Avaliação em 16/10/2026

| Motor | Recursos verificados | Decisão para este projeto |
| --- | --- | --- |
| Konva | Filtros de pixels, transformações, cache e exportação Canvas | Integrar apenas cinco filtros em um worker separado. O editor SVG continua responsável pela composição. |
| Fabric.js | Objetos editáveis e filtros com caminhos Canvas2D/WebGL | Não substituir a cena atual: exigiria migrar seleção, camadas, histórico e projetos. Candidato para uma futura migração planejada. |
| PixiJS + pixi-filters | Filtros WebGL/WebGPU, deslocamento, bloom e distorções | Manter no backlog para efeitos de GPU, após medir compatibilidade e memória no celular. |

Fontes primárias:
- https://konvajs.org/api/Konva.Filters.html
- https://github.com/konvajs/konva
- https://fabricjs.com/
- https://www.fabricjs.com/docs/old-docs/fabric-filters/
- https://pixijs.com/8.x/guides/components/scene-objects
- https://github.com/pixijs/filters

## Integração entregue

- Konva **10.9.0**, licença MIT em `vendor/konva/LICENSE`.
- Bundle local de aproximadamente 62 KiB, sem CDN, importado somente quando um tratamento é solicitado.
- Pixelate, Posterize, Emboss, Sepia e Solarize. Cada carta pode usar um tratamento; mistura e força são ajustáveis quando aplicáveis. Não há alegação de IA ou aumento da resolução da fonte.
- `raster-worker.js` executa os filtros de CPU fora da thread da interface; o bundle não cria um palco nem substitui os eventos do SVG.
- `raster.js` preserva o original gerenciado por Studio e muda somente a imagem derivada exibida. A configuração opcional `raster` entra no projeto JSON e no histórico. Projetos anteriores começam sem tratamento.
- Processamento limitado a 2048 pixels no maior lado para conter buffers em celulares; o original não é reduzido. PNG final continua disponível em 720p, 1080p e 1440p. Não há geração de detalhes inexistentes na imagem.
- Alpha original preservado depois dos filtros. Sequência de processamento invalida respostas antigas. A exportação espera o processamento e bloqueia um resultado incompleto se houver erro; restaurar a imagem original permite continuar.
- Dois layouts com IDs novos: `layout30` Editorial diagonal e `layout31` Vitrine assimétrica. IDs anteriores preservados.

## Reproduzir o bundle

```sh
npm install
npm run build:filters
```

As versões de Konva e esbuild estão fixadas em `package.json`. O arquivo gerado é versionado com a licença; nenhuma etapa de compilação é necessária no GitHub Pages.

## Próximas lacunas

- Deslocamento/ondulação, aberração cromática e glitch com controle de região: avaliar PixiJS em módulo opcional, com limite de textura e alternativa para dispositivos sem GPU compatível.
- Composição com múltiplas cartas livremente adicionáveis: exige evolução do modelo de projeto, não apenas instalar outro motor.
- Perspectiva projetiva e deformação de malha: prototipar exportação fiel antes de oferecer como função estável.
