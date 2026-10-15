## 0.9.0 — 2026-10-15

- Seletor Português / English / Español no canto superior direito, com preferência local persistente e funcionamento quando o armazenamento estiver bloqueado.
- Catálogo de traduções para home, menus, layouts, temas, acessibilidade e mensagens dinâmicas de busca, erro, importação, histórico e exportação.
- Textos do usuário, nomes oficiais, dados das cartas e arquivos preservados. Alterar o idioma não muda o projeto nem a arte do PNG.
- Controles de upload nos painéis avançados com botões traduzidos pelo próprio site.
- Meta de 10 temas por cardgame adicionada ao final do backlog; os novos temas ainda não foram implementados.

## 0.8.0 — 2026-10-15

- Área de ferramentas compacta com painéis recolhíveis e layouts ao lado das opções avançadas.
- Seis layouts para uma carta, totalizando 28; visibilidade independente, rotação, espelhamento e remoção de cartas.
- Importação de layout como camada de imagem, decoração base opcional e mistura de elementos de modelos.
- Retícula, linhas de tela e vinheta ajustáveis, também no PNG.
- Persistência, histórico e migração de projetos antigos verificados em Chromium desktop e móvel emulado.
- Internacionalização completa PT/EN/ES registrada como próxima etapa; ainda não disponível.

## 0.6.0 — Enquadramento e efeitos visuais

## 0.7.1 — 2026-10-15

- Home: cartas Rocks.D.Xebec, Riverpyre Verge, Elfnote Lucina e Susanoomon substituem as quatro imagens de produtos.
- Apresentação das seis coleções padronizada, com cartas inteiras e fundo escuro responsivo.


## 0.7.0 — 2026-10-14

- Seis cardgames: Pokémon TCG e Disney Lorcana entram na home com paletas, recortes e fontes próprios.
- 18 temas SVG com intensidade, moldura, histórico, exportação e camadas reordenáveis.
- Busca Pokémon via TCGdex EN/PT; Lorcast com fallback local complementar e fonte visível.
- Worker de imagens aceita URLs restritas do CDN Lorcast e AVIF; demais regras de origem e tamanho preservadas.
- Projetos v2 anteriores recebem camadas temáticas opcionais sem alterar sua aparência.


- Painel opcional “Avançada e Prévia”, com abas acessíveis “Enquadramento & Câmera” e “Efeitos & Shaders”; atualização agrupada por frame, sem novos serviços externos.
- Rotação Z e inclinação 2D independentes por carta; máscaras de círculo, lâmina, garras, estilhaços e explosão; divisão diagonal com extremos ajustáveis.
- Leque de 2 a 5 imagens: cartas do editor e até três uploads, com abertura, espaçamento, elevação focal, posição e escala. O leque é um conjunto independente dos efeitos das cartas soltas.
- Lupa posicionável sobre a carta original, com zoom e ponto de interesse manuais; guias de terços/centro e encaixe magnético durante o arraste. Guias excluídas da exportação.
- Reflexo vertical com fade, sombra e neon configuráveis por carta, foil iridescente estático, raios radiais, luz difusa, linhas de ação e até 120 partículas determinísticas.
- Volume de títulos simulado por extrusão 2D, gradiente metálico/plástico e borda; controle do fundo/desfoque compartilhado com Edição avançada.
- Novas camadas de luzes, partículas, lupa e leque; migração da ordem de camadas de projetos anteriores; configurações e uploads integrados ao JSON e ao histórico.
- Não inclui perspectiva 3D real, curvatura física, distorção projetiva ou detecção automática de personagens. Pop-out usa PNG já recortado na camada de imagem adicional.
- Testado em Chromium desktop e móvel emulado: abas, controles individuais, máscaras, lupa, guias, leque de cinco cartas, salvar/abrir, desfazer e projetos antigos; PNG real com verificação de pixels de reflexo e foil e ausência das guias. Teste em aparelho físico continua pendente.

## 0.5.0 — Camadas, fundos e composições avançadas

- “Edição avançada” e controles de “Edição na prévia” recolhidos até ativação.
- Ordem independente das camadas, incluindo imagens, textos, faixas e decoração; restaurar ordem original.
- 12 layouts adicionais inspirados em referências de thumbs TCG, totalizando 22 nos quatro jogos.
- Upload de papel de parede e imagem adicional (retrato/logo); PNG transparente preservado, sem remoção automática de fundo.
- Ampliação de uma ou das duas cartas no fundo; zoom, posição, gamma, brilho, contraste, saturação, desfoque, opacidade e escurecimento separados da arte frontal.
- Efeitos cinema, suave, monocromático, intenso e brilho neon frontal.
- Estado avançado persistido no JSON e no histórico; projetos v2 antigos recebem os padrões neutros.
- Validação em Chromium desktop e móvel emulado: uploads, camadas/desfazer, 12 layouts, salvar/reabrir, isolamento dos rascunhos, compatibilidade e pixels do PNG após ajuste de brilho. Celular físico pendente.
- Prioridades ADV-01 a ADV-05 registradas acima de TCG-03 a TCG-05; expansão de jogos/bases permanece pendente.

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
