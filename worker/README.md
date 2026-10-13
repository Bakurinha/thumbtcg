# Ativar imagens de Digimon e One Piece

O GitHub Pages serve arquivos estáticos. Os servidores dessas duas bases não
autorizam a leitura da imagem pelo navegador para exportar o canvas. Este Worker
busca a imagem e mantém cache por sete dias. Não precisa de chave de API das bases.

## O que falta

Uma conta Cloudflare e publicar este Worker nessa conta. Ele **não foi publicado**
automaticamente. Consulte os limites/preços da sua conta antes de ativar.

Com Node e o repositório no computador, execute na raiz do projeto:

```sh
npx wrangler login
npx wrangler deploy --config worker/wrangler.jsonc
```

O login acontece no navegador. Não envie senha ou token pelo chat.
O comando retorna uma URL `https://thumbtcg-images.<sua-conta>.workers.dev`.
Abra essa URL com `/health` no final: deve mostrar `ok`.

Em `config.js`, coloque a URL retornada:

```js
window.ThumbConfig = { imageService: 'https://thumbtcg-images.<sua-conta>.workers.dev' };
```

Salve no GitHub e aguarde o deploy do Pages. Pesquise `Marsmon` em Digimon,
clique em **Usar carta**, ajuste o enquadramento e exporte o PNG. Repita com
`Luffy` em One Piece. Valide esse fluxo em navegador após publicar o serviço.

O serviço aceita apenas imagens dos dois hosts definidos em `index.mjs`, limita
cada arquivo a 8 MB, recusa redirecionamentos e autoriza CORS para o seu Pages.
CORS não é autenticação: acompanhe uso/limites no painel Cloudflare. Para trocar
de domínio, atualize `ALLOWED_ORIGIN`. Imagens e marcas pertencem aos titulares.

Documentação: https://developers.cloudflare.com/workers/get-started/guide/
