/* Transactional image editor: changes enter the project's existing history only on Apply. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const translate = value => window.ThumbI18n?.t(value) || value;
  const defaults = () => ({ exposure: 0, contrast: 0, saturation: 0, vibrance: 0, gamma: 1, sharpness: 0 });
  const controls = { exposure: ['Exposição', -100, 100, 1], contrast: ['Contraste', -50, 100, 1], saturation: ['Saturação', -100, 100, 1], vibrance: ['Vivacidade', 0, 100, 1], gamma: ['Gamma', .4, 2.5, .05], sharpness: ['Nitidez', 0, 100, 1] };
  const dialog = document.createElement('dialog');
  dialog.id = 'retouch-dialog'; dialog.setAttribute('aria-labelledby', 'retouch-title');
  dialog.innerHTML = `<header class="retouch-header"><h2 id="retouch-title">Recorte e qualidade</h2><button type="button" class="studio-btn" id="retouch-close">Cancelar</button></header>
<div class="retouch-body"><div class="retouch-stage"><div class="retouch-scroll"><canvas id="retouch-canvas" aria-label="Área de edição da imagem"></canvas></div><p id="retouch-resolution"></p><p id="retouch-status" role="status"></p><button type="button" class="studio-btn" id="retouch-before" aria-pressed="false">Comparar original</button><label class="field"><span>Zoom da área de edição</span><input type="range" id="retouch-zoom" min="100" max="300" value="100"/></label></div>
<div class="retouch-controls"><details open><summary>Transparência e seleção</summary><p class="drag-hint">Clique e arraste para pintar. A seleção retangular limita as alterações. O recorte automático remove cores ligadas às bordas; não reconhece personagens.</p>
<label class="field"><span>Ferramenta</span><select id="retouch-tool"><option value="erase">Pincel: apagar</option><option value="restore">Pincel: restaurar</option><option value="select">Seleção retangular</option><option value="wand">Varinha: área por cor</option><option value="pick">Conta-gotas</option><option value="replace">Pincel: substituir cor</option></select></label>
<label class="field"><span>Tamanho do pincel</span><input id="retouch-size" type="range" min="2" max="250" value="50"/></label><label class="field"><span>Suavidade da borda</span><input id="retouch-soft" type="range" min="0" max="100" value="35"/></label><label class="field"><span>Opacidade do pincel</span><input id="retouch-opacity" type="range" min="1" max="100" value="100"/></label><label class="field"><span>Tolerância de cor</span><input id="retouch-tolerance" type="range" min="0" max="150" value="35"/></label>
<label class="field"><span>Cor de origem</span><input id="retouch-source" type="color" value="#ffffff"/></label><label class="field"><span>Nova cor</span><input id="retouch-color" type="color" value="#ff6633"/></label><div class="retouch-actions"><button class="studio-btn" id="retouch-auto" type="button">Transparência automática</button><button class="studio-btn" id="retouch-replace" type="button">Substituir cor na seleção</button><button class="studio-btn" id="retouch-deselect" type="button">Limpar seleção</button><button class="studio-btn" id="retouch-undo" type="button">Desfazer recorte</button><button class="studio-btn" id="retouch-reset" type="button">Restaurar recorte</button></div></details>
<details><summary>Cor e definição</summary><p class="drag-hint">Ajustes locais, sem IA. Nitidez não recupera detalhes que não existem na imagem.</p>${Object.entries(controls).map(([key, [label, min, max, step]]) => `<label class="field"><span>${label} <output id="retouch-value-${key}"></output></span><input type="range" id="retouch-${key}" min="${min}" max="${max}" step="${step}" value="${defaults()[key]}"/></label>`).join('')}<button class="studio-btn" type="button" id="retouch-vivid">Preset: arte vibrante</button><button class="studio-btn" type="button" id="retouch-neutral">Zerar ajustes</button></details></div></div>
<footer class="retouch-footer"><span>Aplicar salva a edição na carta. Use Desfazer no editor para voltar.</span><button class="studio-btn primary" id="retouch-apply" type="button">Aplicar à carta</button></footer>`;
  document.body.append(dialog);
  for (const side of ['left', 'right']) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'studio-btn retouch-open'; button.id = 'retouch-open-' + side; button.textContent = 'Recorte e qualidade';
    $('file-name-' + side).closest('label').after(button);
    button.onclick = () => open(side);
  }
  const canvas = $('retouch-canvas'), ctx = canvas.getContext('2d');
  const buffer = document.createElement('canvas'), bctx = buffer.getContext('2d');
  let original, pixels, output, selection, options = defaults(), side, snapshot, history = [], drawing = false, last, start, comparison = false, ticket = 0, worker, pending, pendingResolve, workerTimeout, timer, busy = false, failure = false;
  const message = text => $('retouch-status').textContent = translate(text);
  function sync() { for (const key of Object.keys(controls)) { $('retouch-' + key).value = options[key]; $('retouch-value-' + key).value = options[key]; } }
  function draw() {
    if (!pixels) return;
    ctx.putImageData(new ImageData(comparison ? original.slice() : (output || pixels).slice(), canvas.width, canvas.height), 0, 0);
    if (selection && !comparison) { ctx.save(); ctx.strokeStyle = '#00ffff'; ctx.lineWidth = Math.max(1, canvas.width / 500); ctx.setLineDash([8, 5]); ctx.strokeRect(selection.x, selection.y, selection.w, selection.h); ctx.restore(); }
  }
  function request() {
    clearTimeout(timer); const id = ++ticket; failure = false;
    clearTimeout(workerTimeout); pendingResolve?.(); pending = new Promise(resolve => pendingResolve = resolve);
    timer = setTimeout(() => {
      if (!worker) {
        worker = new Worker('retouch-worker.js?v=1');
        worker.onmessage = ({ data }) => { if (data.id !== ticket) return; clearTimeout(workerTimeout); failure = !!data.error; if (!failure) output = new Uint8ClampedArray(data.pixels); message(failure ? 'Falha no tratamento. Tente novamente.' : 'Prévia atualizada'); draw(); pendingResolve?.(); pendingResolve = null; };
        worker.onerror = () => { clearTimeout(workerTimeout); failure = true; message('Falha no tratamento. Tente novamente.'); pendingResolve?.(); pendingResolve = null; worker.terminate(); worker = null; };
      }
      workerTimeout = setTimeout(() => { failure = true; message('Falha no tratamento. Tente novamente.'); pendingResolve?.(); pendingResolve = null; worker?.terminate(); worker = null; }, 20000);
      const copy = pixels.slice(); worker.postMessage({ id, pixels: copy.buffer, width: canvas.width, height: canvas.height, options }, [copy.buffer]);
    }, 80);
  }
  function checkpoint() { history.push(pixels.slice()); if (history.length > 6) history.shift(); $('retouch-undo').disabled = false; }
  function within(x, y) { return !selection || x >= selection.x && x <= selection.x + selection.w && y >= selection.y && y <= selection.y + selection.h; }
  const rgb = value => value.slice(1).match(/../g).map(v => parseInt(v, 16));
  const distance = (i, color) => Math.sqrt(color.reduce((sum, c, k) => sum + (pixels[i + k] - c) ** 2, 0) / 3);
  function brush(point) {
    const radius = Number($('retouch-size').value) / 2, soft = Number($('retouch-soft').value) / 100, opacity = Number($('retouch-opacity').value) / 100;
    const mode = $('retouch-tool').value, color = rgb($('retouch-color').value), from = rgb($('retouch-source').value), tolerance = +$('retouch-tolerance').value;
    for (let y = Math.max(0, Math.floor(point.y - radius)); y < Math.min(canvas.height, point.y + radius); y++) for (let x = Math.max(0, Math.floor(point.x - radius)); x < Math.min(canvas.width, point.x + radius); x++) {
      if (!within(x, y)) continue; const d = Math.hypot(x - point.x, y - point.y) / radius; if (d > 1) continue;
      const strength = opacity * (soft ? Math.min(1, (1 - d) / soft) : 1), i = (y * canvas.width + x) * 4;
      if (mode === 'erase') pixels[i + 3] *= 1 - strength;
      if (mode === 'restore') for (let k = 0; k < 4; k++) pixels[i + k] += (original[i + k] - pixels[i + k]) * strength;
      if (mode === 'replace' && distance(i, from) <= tolerance) for (let k = 0; k < 3; k++) pixels[i + k] += (color[k] - pixels[i + k]) * strength;
    }
  }
  // Flood fill follows only connected pixels; unlike global chroma key it preserves isolated details.
  function flood(seeds, color) {
    const w = canvas.width, h = canvas.height, seen = new Uint8Array(w * h), queue = new Int32Array(w * h); let head = 0, tail = 0;
    const enqueue = p => { if (p < 0 || p >= seen.length || seen[p]) return; seen[p] = 1; const x = p % w, y = Math.floor(p / w); if (within(x, y) && distance(p * 4, color) <= +$('retouch-tolerance').value) queue[tail++] = p; };
    seeds.forEach(enqueue);
    while (head < tail) { const p = queue[head++], x = p % w; pixels[p * 4 + 3] = 0; if (x) enqueue(p - 1); if (x < w - 1) enqueue(p + 1); enqueue(p - w); enqueue(p + w); }
  }
  function position(e) { const r = canvas.getBoundingClientRect(); return { x: Math.max(0, Math.min(canvas.width - 1, (e.clientX - r.left) * canvas.width / r.width)), y: Math.max(0, Math.min(canvas.height - 1, (e.clientY - r.top) * canvas.height / r.height)) }; }
  canvas.onpointerdown = e => {
    if (busy || comparison || !pixels) return; e.preventDefault(); canvas.setPointerCapture(e.pointerId); const p = position(e), mode = $('retouch-tool').value;
    if (mode === 'pick') { const i = (Math.floor(p.y) * canvas.width + Math.floor(p.x)) * 4; $('retouch-source').value = '#' + [...pixels.slice(i, i + 3)].map(v => v.toString(16).padStart(2, '0')).join(''); return; }
    if (mode === 'wand') { checkpoint(); const index = Math.floor(p.y) * canvas.width + Math.floor(p.x); flood([index], [...pixels.slice(index * 4, index * 4 + 3)]); output = null; draw(); request(); return; }
    drawing = true; start = last = p;
    if (mode === 'select') selection = { x: p.x, y: p.y, w: 0, h: 0 };
    else { checkpoint(); brush(p); output = null; draw(); }
  };
  canvas.onpointermove = e => {
    if (!drawing) return; const p = position(e);
    if ($('retouch-tool').value === 'select') selection = { x: Math.min(start.x, p.x), y: Math.min(start.y, p.y), w: Math.abs(start.x - p.x), h: Math.abs(start.y - p.y) };
    else { const steps = Math.ceil(Math.hypot(p.x - last.x, p.y - last.y) / Math.max(1, +$('retouch-size').value / 6)); for (let i = 1; i <= steps; i++) brush({ x: last.x + (p.x - last.x) * i / steps, y: last.y + (p.y - last.y) * i / steps }); output = null; }
    last = p; draw();
  };
  const finish = () => { if (!drawing) return; drawing = false; if (selection && (selection.w < 1 || selection.h < 1)) selection = null; request(); };
  canvas.onpointerup = finish; canvas.onpointercancel = finish;
  $('retouch-auto').onclick = () => { checkpoint(); const w = canvas.width, h = canvas.height, seeds = []; for (let x = 0; x < w; x++) seeds.push(x, (h - 1) * w + x); for (let y = 1; y < h - 1; y++) seeds.push(y * w, y * w + w - 1); const corners = [0, w - 1, (h - 1) * w, h * w - 1].map(p => [...pixels.slice(p * 4, p * 4 + 3)]); for (const color of corners) flood(seeds, color); request(); };
  $('retouch-replace').onclick = () => { checkpoint(); const from = rgb($('retouch-source').value), color = rgb($('retouch-color').value); for (let i = 0; i < pixels.length; i += 4) if (within(i / 4 % canvas.width, Math.floor(i / 4 / canvas.width)) && distance(i, from) <= +$('retouch-tolerance').value) for (let k = 0; k < 3; k++) pixels[i + k] = color[k]; request(); };
  $('retouch-deselect').onclick = () => { selection = null; draw(); };
  $('retouch-undo').onclick = () => { if (history.length) { pixels = history.pop(); request(); } $('retouch-undo').disabled = !history.length; };
  $('retouch-reset').onclick = () => { checkpoint(); pixels = original.slice(); selection = null; request(); };
  for (const key of Object.keys(controls)) $('retouch-' + key).oninput = e => { options[key] = +e.target.value; sync(); request(); };
  $('retouch-vivid').onclick = () => { options = { exposure: 5, contrast: 12, saturation: 8, vibrance: 35, gamma: 1, sharpness: 20 }; sync(); request(); };
  $('retouch-neutral').onclick = () => { options = defaults(); sync(); request(); };
  $('retouch-before').onclick = () => { comparison = !comparison; $('retouch-before').setAttribute('aria-pressed', comparison); draw(); };
  $('retouch-zoom').oninput = e => { canvas.style.width = e.target.value + '%'; canvas.style.maxWidth = 'none'; };
  function close() { if (!busy) dialog.close(); }
  $('retouch-close').onclick = close; dialog.oncancel = e => { if (busy) e.preventDefault(); };
  dialog.addEventListener('close', () => { ticket++; clearTimeout(timer); clearTimeout(workerTimeout); pendingResolve?.(); worker?.terminate(); worker = null; original = pixels = output = null; history = []; });
  async function open(target) {
    if (window.ThumbStudio.isBusy()) return;
    const source = window.ThumbStudio.getOriginal(target);
    if (!source) { $('status').textContent = translate('Envie uma carta antes de abrir o recorte.'); return; }
    const image = new Image(); image.src = source; try { await image.decode(); } catch { return; }
    side = target; snapshot = window.ThumbStudio.snapshot(); options = defaults(); history = []; selection = null; output = null; comparison = false;
    // Bound modal history and CPU usage on mobile. Warn before applying any downsample.
    const scale = Math.min(1, 2048 / Math.max(image.width, image.height)); canvas.width = buffer.width = Math.round(image.width * scale); canvas.height = buffer.height = Math.round(image.height * scale);
    bctx.drawImage(image, 0, 0, buffer.width, buffer.height); pixels = bctx.getImageData(0, 0, buffer.width, buffer.height).data; original = pixels.slice();
    canvas.style.width = '100%'; $('retouch-zoom').value = '100'; $('retouch-before').setAttribute('aria-pressed', 'false'); $('retouch-undo').disabled = true; sync(); draw(); dialog.showModal();
    $('retouch-resolution').textContent = translate(scale < 1 ? 'Esta edição será limitada a 2048 px no maior lado. Cancelar preserva a resolução original.' : 'Clique e arraste na imagem para editar.'); message('');
    failure = false; pending = Promise.resolve();
  }
  $('retouch-apply').onclick = async () => {
    if (busy) return; finish(); busy = true; $('retouch-apply').disabled = true; dialog.querySelector('.retouch-controls').inert = true;
    try {
      await pending; if (failure) throw Error();
      bctx.putImageData(new ImageData((output || pixels).slice(), buffer.width, buffer.height), 0, 0);
      const data = structuredClone(snapshot); data.art[side].original = buffer.toDataURL('image/png');
      window.ThumbInteractions.commit(); await window.ThumbStudio.restore(data); window.dispatchEvent(new CustomEvent('thumb:image', { detail: { side } })); window.ThumbInteractions.commit(); busy = false; dialog.close();
    } catch { message('Falha no tratamento. Tente novamente.'); }
    finally { busy = false; $('retouch-apply').disabled = false; dialog.querySelector('.retouch-controls').inert = false; }
  };
})();
