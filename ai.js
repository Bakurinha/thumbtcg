/* Beta is opt-in and transactional. Cancel/failure never changes a project. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id), t = text => window.ThumbI18n?.t(text) || text;
  const dialog = document.createElement('dialog'); dialog.id = 'ai-dialog'; dialog.setAttribute('aria-labelledby', 'ai-title');
  dialog.innerHTML = `<header class="retouch-header"><h2 id="ai-title">Assistente de imagem <span class="ai-beta">Beta</span></h2><button type="button" class="studio-btn" id="ai-close">Fechar</button></header>
<div class="ai-content"><p>IA gratuita no aparelho. As imagens não são enviadas a servidores. Os motores e modelos são baixados apenas ao iniciar, de jsDelivr e Hugging Face.</p><p class="drag-hint">Beta: pode demorar, falhar ou recortar partes da arte. Confira o resultado antes de aplicar; fogo, brilho e textos podem mudar.</p><p id="ai-compat" role="status"></p>
<label class="field"><span>Operação de IA</span><select id="ai-mode"><option value="remove">Remover fundo com IA</option><option value="upscale">Ampliar com IA · até 2×</option></select></label>
<label class="field" id="ai-size-field" hidden><span>Tamanho de processamento</span><select id="ai-size"><option value="256">256 px · teste rápido</option><option value="512" selected>512 px · equilibrado</option><option value="1024">1024 px · mais pesado</option></select></label><p id="ai-requirements" class="drag-hint"></p><p id="ai-dimensions"></p><div class="ai-actions"><button type="button" class="studio-btn primary" id="ai-run">Baixar modelo e processar</button><button type="button" class="studio-btn" id="ai-stop" hidden>Cancelar processamento</button></div>
<progress id="ai-progress" max="100" value="0" hidden aria-label="Progresso da IA"></progress><p id="ai-status" role="status" aria-live="polite"></p>
<div class="ai-compare"><figure><figcaption>Original</figcaption><img id="ai-original" alt="Imagem antes da IA"/></figure><figure><figcaption>Resultado Beta</figcaption><img id="ai-result" alt="Imagem após a IA" hidden/><p id="ai-empty">O resultado aparece aqui.</p></figure></div>
<p class="drag-hint">Para refinar o recorte depois de aplicar, use Recorte e qualidade. Você pode desfazer a aplicação no editor.</p></div>
<footer class="retouch-footer"><a href="docs/AI_BETA.md" target="_blank" rel="noopener">Modelos, requisitos e licenças</a><button type="button" class="studio-btn primary" id="ai-apply" disabled>Aplicar resultado à carta</button></footer>`;
  document.body.append(dialog);
  let worker, timeout, running = false, applying = false, generation = 0, target, snapshot, sourceImage, result = '', inputWidth, inputHeight, resultWidth, resultHeight;
  const supported = () => !!(window.isSecureContext && window.Worker && window.WebAssembly && window.OffscreenCanvas && window.crypto?.subtle);
  const setStatus = text => $('ai-status').textContent = t(text);
  function dimensions() {
    const mode = $('ai-mode').value, limit = mode === 'upscale' ? Number($('ai-size').value) : 2048;
    $('ai-size-field').hidden = mode !== 'upscale';
    const scale = Math.min(1, limit / Math.max(sourceImage.width, sourceImage.height));
    inputWidth = Math.max(1, Math.round(sourceImage.width * scale)); inputHeight = Math.max(1, Math.round(sourceImage.height * scale));
    const factor = mode === 'upscale' ? 2 : 1;
    $('ai-dimensions').textContent = t('Original: {0} · Entrada da IA: {1} · Saída: {2}').replace('{0}', `${sourceImage.width}×${sourceImage.height}`).replace('{1}', `${inputWidth}×${inputHeight}`).replace('{2}', `${inputWidth * factor}×${inputHeight * factor}`);
    $('ai-requirements').textContent = t(mode === 'remove' ? 'U²-Net portátil: modelo de 4,6 MB e motor de aproximadamente 15 MB. Usa CPU; não exige placa de vídeo. Entrada limitada a 2048 px.' : 'UpscalerJS: modelo de 0,9 MB e motor de aproximadamente 1,5 MB. Usa GPU quando disponível ou CPU. Entrada limitada a 1024 px; saída até 2048 px. Imagens maiores são reduzidas antes da IA.');
  }
  function buttons() { $('ai-run').disabled = running || applying || !supported(); $('ai-mode').disabled = running || applying; $('ai-size').disabled = running || applying; $('ai-stop').hidden = !running; $('ai-apply').disabled = running || applying || !result; $('ai-close').disabled = applying; }
  function stop(message) { generation++; clearTimeout(timeout); worker?.terminate(); worker = null; running = false; $('ai-progress').hidden = true; buttons(); if (message) setStatus(message); }
  function clearResult() { result = ''; $('ai-result').removeAttribute('src'); $('ai-result').hidden = true; $('ai-empty').hidden = false; buttons(); }
  async function open(side) {
    if (window.ThumbStudio.isBusy()) return;
    const source = window.ThumbStudio.getOriginal(side);
    if (!source) { $('status').textContent = t('Envie uma carta antes de abrir o recorte.'); return; }
    const image = new Image(); image.src = source;
    try { await image.decode(); } catch { $('status').textContent = t('Não foi possível abrir esta imagem.'); return; }
    stop(); target = side; sourceImage = image; snapshot = window.ThumbStudio.snapshot(); clearResult();
    $('ai-original').src = source; dimensions(); setStatus('');
    $('ai-compat').textContent = t(supported() ? 'Recursos básicos disponíveis. A execução real depende da memória e do navegador.' : 'Este navegador não oferece todos os recursos necessários. Tente uma versão atual do Chrome, Edge ou Safari; o editor manual continua disponível.');
    dialog.showModal();
  }
  for (const side of ['left', 'right']) { const button = document.createElement('button'); button.type = 'button'; button.className = 'studio-btn ai-open'; button.id = 'ai-open-' + side; button.innerHTML = 'IA de imagem <span class="ai-beta">Beta</span>'; $('retouch-open-' + side).after(button); button.onclick = () => open(side); }
  $('ai-mode').onchange = () => { clearResult(); dimensions(); setStatus(''); };
  $('ai-size').onchange = () => { clearResult(); dimensions(); setStatus(''); };
  $('ai-close').onclick = () => { if (!applying) dialog.close(); };
  dialog.oncancel = e => { if (applying) e.preventDefault(); };
  dialog.addEventListener('close', () => { stop(); clearResult(); $('ai-original').removeAttribute('src'); sourceImage = snapshot = null; });
  window.addEventListener('hashchange', () => { if (dialog.open && !applying) dialog.close(); });
  $('ai-stop').onclick = () => stop('Processamento cancelado. A carta permanece intacta.');
  $('ai-run').onclick = () => {
    if (running || applying || !supported()) return;
    clearResult(); running = true; const id = ++generation; buttons(); $('ai-progress').hidden = false; $('ai-progress').removeAttribute('value'); setStatus('Baixando motor e modelo…');
    try {
      const canvas = document.createElement('canvas'); canvas.width = inputWidth; canvas.height = inputHeight;
      const ctx = canvas.getContext('2d'); ctx.drawImage(sourceImage, 0, 0, inputWidth, inputHeight);
      const pixels = ctx.getImageData(0, 0, inputWidth, inputHeight).data;
      worker = new Worker('ai-worker.js?v=1');
      const fail = () => { stop('A IA não conseguiu concluir. Pode ser falta de memória, bloqueio do download ou incompatibilidade. Tente novamente ou use o editor manual.'); };
      worker.onerror = fail;
      worker.onmessage = ({ data }) => {
        if (generation !== id) return;
        if (data.type === 'progress') { $('ai-progress').value = data.value; setStatus(data.phase === 'download' ? 'Baixando motor e modelo…' : data.phase === 'prepare' ? 'Preparando IA no aparelho…' : 'Processando no aparelho…'); return; }
        if (data.type !== 'result') { fail(); return; }
        try {
          if (!Number.isInteger(data.width) || !Number.isInteger(data.height) || data.width < 1 || data.height < 1 || data.width > 2048 || data.height > 2048 || data.pixels.byteLength !== data.width * data.height * 4) throw Error();
          canvas.width = resultWidth = data.width; canvas.height = resultHeight = data.height;
          ctx.putImageData(new ImageData(new Uint8ClampedArray(data.pixels), data.width, data.height), 0, 0);
          result = canvas.toDataURL('image/png'); $('ai-result').src = result; $('ai-result').hidden = false; $('ai-empty').hidden = true;
          stop(); setStatus(t('Resultado pronto ({0}). Compare antes de aplicar.').replace('{0}', `${resultWidth}×${resultHeight} · ${data.backend}`));
        } catch { fail(); }
      };
      // Bound an unresponsive device; cancellation also works while synchronous inference runs.
      timeout = setTimeout(() => stop('A IA excedeu 3 minutos e foi interrompida. Tente uma imagem menor ou outro aparelho.'), 180000);
      worker.postMessage({ mode: $('ai-mode').value, pixels: pixels.buffer, width: inputWidth, height: inputHeight }, [pixels.buffer]);
    } catch { stop('Não foi possível iniciar a IA neste navegador. O editor manual continua disponível.'); }
  };
  $('ai-apply').onclick = async () => {
    if (!result || running || applying) return;
    applying = true; buttons();
    try { const data = structuredClone(snapshot); data.art[target].original = result; window.ThumbInteractions.commit(); await window.ThumbStudio.restore(data); window.dispatchEvent(new CustomEvent('thumb:image', { detail: { side: target } })); window.ThumbInteractions.commit(); applying = false; dialog.close(); }
    catch { setStatus('Não foi possível aplicar o resultado. Tente novamente.'); }
    finally { applying = false; buttons(); }
  };
})();
