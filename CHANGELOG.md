## 0.4.0 — Qualidade de exportação e edição direta

- Exportação PNG em 720p, 1080p e 1440p; avisos quando a carta original limita a nitidez.
- Upload preserva até 4096 px; Magic prioriza a imagem PNG da base.
- Seleção, arraste com mouse/toque, redimensionamento proporcional e alinhamento de cartas, textos, bases e faixas na prévia.
- Desfazer/refazer até 25 alterações; resolução e transformações salvas no JSON, com abertura compatível dos projetos v2 anteriores.
- Restauração do projeto limpa imagens anteriores e evita interação durante desfazer/refazer assíncrono.
- Testes reais em Chromium desktop e móvel com toque emulado: importação de imagens locais, redimensionamento, alinhamento, histórico, salvar/reabrir e dimensões dos PNGs exportados. Teste em celular físico pendente.

## 0.3.5 — Correção do serviço de imagens

- Usa redirecionamento manual compatível com o Worker, rejeitando respostas de redirecionamento.
- Mantém a lista de fontes permitidas, limites de tamanho e cache.
- Publicação automática confirmada após reconexão Git; imagens Digimon e One Piece validadas por HTTP (200 e CORS correto).
- Testes de regressão para redirecionamentos e falhas de conexão aprovados. Validação visual em navegador pendente.

## 0.3.4 — Conexão com o serviço de imagens

- Configura o Worker informado pelo usuário para importação Digimon/One Piece.
- Atualiza a versão do carregamento de config.js para evitar configuração antiga em cache.
- Validação HTTP recebeu bloqueio Cloudflare 403/1010; teste no navegador pendente.

## 0.3.3 — Identidade visual e backlog

- Logo THUMB TCG Studio com transparência substitui o nome textual no cabeçalho.
- Remove os rótulos numerados dos cardgames e o título Construído com a comunidade.
- Harmoniza a tipografia do título principal com o restante da interface.
- Cria BACKLOG.md com as cinco frentes solicitadas e critérios de conclusão.

## 0.3.2 — Cartas no destaque

- MedievalGallantmon e Ash Blossom substituem os pôsteres decorativos da home.
- Imagem do setor Yu-Gi-Oh! atualizada para Beyond the Brave.

## 0.3.1 — Imagens na home

- Substitui as letras decorativas pelos quatro arquivos enviados por Bakura, nos respectivos cardgames.
- Imagens locais, proporção uniforme, enquadramento responsivo e textos alternativos.

## 0.3.0 — Imagens das bases

- Importação Yu-Gi-Oh! pelo manifesto YGOResources e ID Konami.
- Índice Digimon com prévias e artes alternativas.
- Worker com cache preparado para ativar importação Digimon/One Piece.
- Cache de imagens, limites de tamanho e preservação da carta anterior em falhas.
- Testes dos adaptadores, seleção, cliente de imagens e Worker.

# Changelog

## 0.2.0 — 2026-10-13

- Adicionada entrada por TCG, contato de Bakura e doação via PIX.
- Preservados os dez layouts e a exportação SVG/PNG do editor original.
- Adicionados temas, paletas e padrões específicos para quatro jogos.
- Adicionados busca em bases externas, resultados seguros e alternativas de upload.
- Adicionados controles de enquadramento, arraste e zoom.
- Adicionados projetos JSON e rascunhos separados por jogo durante a sessão.
- Separados estilos, motor de edição, interface e provedores para facilitar extensões.
- Documentadas as limitações de imagens remotas e de validação visual.
