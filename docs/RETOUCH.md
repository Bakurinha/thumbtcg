# Recorte e qualidade — 0.14.0

Abra **Recorte e qualidade** abaixo do upload de uma carta. A imagem completa é editada; o enquadramento atual continua sendo aplicado pelo editor principal. Nada é enviado a serviços externos.

A varinha remove a região conectada à cor clicada. A transparência automática usa as quatro cores dos cantos e regiões conectadas às bordas. Não identifica personagens: fundos multicoloridos exigem pincel. Seleção retangular limita pincel, varinha e troca de cor. Conta-gotas escolhe a cor de origem. Suavidade e opacidade controlam o pincel. Comparar original alterna a referência; Cancelar descarta a sessão.

Os ajustes de cor são calculados a partir do recorte atual, sem acumular filtros a cada slider. Nitidez não é super-resolução. Apply registra uma nova imagem original no projeto, preserva o enquadramento e os filtros existentes; Desfazer restaura a versão anterior. O JSON armazena a imagem aplicada; os passos locais de pincel não são persistidos. O editor limita o maior lado a 2048 px e guarda no máximo seis estados locais para limitar memória. O aviso de redução permanece visível durante a edição.

Em **Efeitos & Shaders → Títulos com volume simulado**, o preset dourado combina gradiente, contorno, extrusão 2D, sombra e sublinhado. Os controles X/Y esticam ambos os títulos. Não é geometria 3D real.

## IA gratuita: pesquisa e decisão

- Transformers.js executa modelos ONNX no navegador (WASM/WebGPU): https://huggingface.co/docs/transformers.js/index e https://huggingface.co/docs/transformers.js/guides/webgpu.
- IMG.LY oferece remoção de fundo no navegador, com condições AGPL: https://github.com/imgly/background-removal-js.
- Uma biblioteca gratuita não garante licença adequada de todo modelo, execução rápida em celular ou API hospedada sem limites. Por isso esta entrega não adiciona dependências/modelos de IA, não promete recuperar detalhes e não envia cartas a terceiros. A integração semântica/super-resolução fica registrada no backlog para avaliação específica de modelo/licença, tamanho e compatibilidade.

## Atualização 0.15.0

O assistente **IA de imagem · Beta** agora oferece remoção de fundo e ampliação opcionais. Consulte [modelos, requisitos e limites](AI_BETA.md). O tratamento de Recorte e qualidade permanece independente da IA.
