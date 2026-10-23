# IA de imagem — Beta

Abra **IA de imagem · Beta** abaixo do upload de uma carta. Escolha a operação e clique em **Baixar modelo e processar**. Compare original e resultado antes de aplicar. Aplicar mantém o enquadramento e entra no histórico de Desfazer; cancelar ou falhar não troca a imagem.

## O que precisa

- Navegador atual em HTTPS com Web Workers, WebAssembly, OffscreenCanvas e Web Crypto.
- Internet para baixar motores e modelos públicos. Não exige conta, chave de API, servidor de IA ou plano pago Cloudflare.
- Memória e tempo de processamento disponíveis. Não existe garantia universal de compatibilidade em Android/iOS; o teste inicial verifica recursos, não memória livre.
- A ampliação tenta WebGL/GPU e usa CPU se não houver aceleração. A remoção usa WebAssembly/CPU em uma thread para funcionar sem cabeçalhos COOP/COEP no GitHub Pages.
- Operações acima de três minutos são interrompidas. Fechar ou Cancelar termina o Worker e libera seus recursos.

## Modelos e limites

| Operação | Modelo/runtime | Download aproximado sem cache | Limite |
| --- | --- | --- | --- |
| Remover fundo | U²-Net portátil / ONNX Runtime Web 1.30.0 | 4,6 MB de pesos + 15 MB de runtime | Entrada até 2048 px; máscara inferida em 320×320 |
| Ampliar até 2× | UpscalerJS 1.0.0, default-model 1.0.0, TensorFlow.js 4.22.0 | 0,9 MB de pesos + 1,5 MB de runtime | Entrada até 1024 px, saída até 2048 px; blocos de 64 px com margem de 6 px |

Na ampliação, escolha entrada de 256 px (teste rápido), 512 px (padrão equilibrado) ou 1024 px (mais pesado). Em CPU, 1024 px pode exceder o limite de tempo. Imagens maiores são reduzidas antes da execução. As dimensões de entrada e saída aparecem antes de iniciar. A IA pode modificar textura e texto, perder partes de personagens ou confundir efeitos com fundo. Não restaura com certeza detalhes ausentes. Transparência existente é preservada/multiplicada pelo recorte e redimensionada separadamente na ampliação. Use o editor manual para ajustes finos.

## Privacidade e carregamento

A imagem é processada no aparelho e não é enviada aos provedores. jsDelivr e Hugging Face recebem pedidos normais de download (incluindo dados de conexão como IP), não os pixels da carta. Não há download de IA ao abrir o site ou apenas abrir o painel. O modelo U²-Net pode ficar no cache local; limpar os dados do site remove esse cache. O navegador pode reutilizar seu cache HTTP para outros arquivos, sem garantia de funcionamento offline.

Os URLs de dependências têm versões fixas. O modelo U²-Net é fixado em commit e validado com SHA-256 antes da execução; arquivo incorreto é rejeitado. Bloqueadores, firewall, indisponibilidade dos provedores ou falta de memória podem impedir o uso. Nenhuma chave é armazenada no front-end.

## Fontes, créditos e licenças

- U²-Net: Qin, Zhang, Tsang, Dehghan, Zaiane e Jagersand, *U²-Net: Going Deeper with Nested U-Structure for Salient Object Detection*, Pattern Recognition 106 (2020), 107404. [Projeto e licença Apache-2.0](https://github.com/xuebinqin/U-2-Net).
- [Espelho ONNX edgetools/u2netp](https://huggingface.co/edgetools/u2netp), commit `25dee37ab19c5b6ad64ba6578eba63f1ae07720c`, idêntico ao asset [rembg](https://github.com/danielgatis/rembg) (MIT). SHA-256 `309c8469258dda742793dce0ebea8e6dd393174f89934733ecc8b14c76f4ddd8`.
- [ONNX Runtime](https://github.com/microsoft/onnxruntime): MIT.
- [UpscalerJS e default-model](https://github.com/thekevinscott/UpscalerJS): MIT, Kevin Scott. O modelo padrão é o modelo leve 2× documentado em https://upscalerjs.com/models/available/upscaling/default-model/.
- [TensorFlow.js](https://github.com/tensorflow/tfjs): Apache-2.0.

Os motores/modelos permanecem nos provedores públicos; esta integração não redistribui seus binários no repositório. O estado Beta indica validação limitada de qualidade e dispositivos, não serviço pago nem remoção de limites.

## Novas opções — 0.16.0

Em **IA de imagem · Beta**, selecione a operação e ajuste antes de processar:

- **Desfocar fundo com seleção IA:** mantém a área selecionada em foco e desfoca o restante; intensidade controla o raio (até 2,5% do maior lado).
- **Trocar fundo com seleção IA:** compõe o personagem sobre uma cor escolhida. O resultado é opaco por definição.
- **Destacar personagem com seleção IA:** aumenta luz e vivacidade da área selecionada e escurece o fundo; preserva a transparência original.
- **Precisão do recorte:** limiar maior restringe a seleção; limiar menor inclui mais áreas.
- **Suavidade das bordas:** ajusta a transição da seleção, não recupera detalhes perdidos pelo modelo.
- **Baixar resultado PNG:** salva a prévia sem aplicar ao projeto.

A IA continua sendo U²-Net para segmentação e UpscalerJS para ampliação. Desfoque, composição de cor e iluminação são pós-processamento convencional guiado pela máscara da IA, não novos modelos generativos. Não há reconstrução de áreas ocultas; o desfoque pode produzir halos próximos ao personagem. Seleções podem incluir molduras/textos ou perder detalhes. Refinamento manual continua em Recorte e qualidade. Mudar parâmetros invalida a prévia; clique para processar novamente. Os limites de 2048 px, memória e três minutos permanecem.

MAXIM (ruído, desfoque e baixa luz) foi pesquisado mas não incluído nesta versão: o autor documenta artefatos em modelos dependentes de contexto global quando processados em blocos. Precisa de validação de qualidade e desempenho em celulares: https://upscalerjs.com/news/maxim-models/ .
