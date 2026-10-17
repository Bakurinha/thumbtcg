/* Optional raster finishing. Originals stay in Studio; only derived previews change. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const effects = {
    none: "Sem tratamento",
    Pixelate: "Pixelização",
    Posterize: "Posterização",
    Emboss: "Relevo",
    Sepia: "Sépia",
    Solarize: "Solarização",
    Chromatic: "Separação RGB",
    Glitch: "Glitch digital",
    Duotone: "Duotone ciano e magenta",
    Grain: "Granulação de filme",
    Edge: "Contornos neon",
  };
  const defaults = () => ({
    left: { effect: "none", amount: 50, mix: 100 },
    right: { effect: "none", amount: 50, mix: 100 },
  });
  let state = defaults(),
    worker,
    jobId = 0,
    target = "left",
    timer;
  const jobs = new Map();
  const slots = Object.fromEntries(
    ["left", "right"].map((side) => [
      side,
      {
        source: "",
        output: "",
        version: 0,
        pending: null,
        error: null,
        key: "",
      },
    ]),
  );
  const panel = document.createElement("details");
  panel.className = "fx-feature";
  panel.innerHTML = `<summary>Tratamento artístico</summary><p class="drag-hint">Efeitos por carta. A imagem original permanece preservada.</p><label class="field"><span>Carta para tratamento</span><select id="raster-target"><option value="left">Carta esquerda</option><option value="right">Carta direita</option></select></label><label class="field"><span>Estilo artístico</span><select id="raster-effect">${Object.entries(
    effects,
  )
    .map(([v, n]) => `<option value="${v}">${n}</option>`)
    .join(
      "",
    )}</select></label><label class="field" id="raster-amount-field"><span>Força do tratamento</span><input id="raster-amount" type="range" min="0" max="100" value="50"/></label><label class="field"><span>Mistura com a imagem original</span><input id="raster-mix" type="range" min="0" max="100" value="100"/></label><button class="studio-btn" type="button" id="raster-clear">Restaurar imagem original</button><p id="raster-status" role="status" class="drag-hint"></p>`;
  $("fx-shaders").append(panel);
  const message = (text) => {
    $("raster-status").textContent = window.ThumbI18n?.t(text) || text;
  };
  function validateState(value) {
    if (value == null) return;
    for (const side of ["left", "right"]) {
      const c = value[side];
      if (
        !c ||
        !Object.hasOwn(effects, c.effect) ||
        ![c.amount, c.mix].every(
          (v) => Number.isFinite(v) && v >= 0 && v <= 100,
        )
      )
        throw Error("Tratamento artístico inválido.");
    }
  }
  function ui() {
    const c = state[target];
    $("raster-effect").value = c.effect;
    $("raster-amount").value = c.amount;
    $("raster-mix").value = c.mix;
    $("raster-amount-field").hidden = ![
      "Pixelate",
      "Posterize",
      "Emboss",
      "Chromatic",
      "Glitch",
      "Duotone",
      "Grain",
      "Edge",
    ].includes(c.effect);
  }
  function process(image, config) {
    if (!worker) {
      worker = new Worker("raster-worker.js?v=2");
      worker.onmessage = ({ data }) => {
        const job = jobs.get(data.id);
        if (!job) return;
        jobs.delete(data.id);
        clearTimeout(job.timeout);
        data.error ? job.reject(Error(data.error)) : job.resolve(data);
      };
      worker.onerror = () => {
        for (const job of jobs.values()) {
          clearTimeout(job.timeout);
          job.reject(Error("Worker unavailable"));
        }
        jobs.clear();
        worker.terminate();
        worker = null;
      };
    }
    return new Promise((resolve, reject) => {
      const id = ++jobId;
      const timeout = setTimeout(() => {
        jobs.delete(id);
        reject(Error("Filter timeout"));
      }, 20000);
      jobs.set(id, { resolve, reject, timeout });
      worker.postMessage(
        {
          id,
          pixels: image.data.buffer,
          width: image.width,
          height: image.height,
          config,
        },
        [image.data.buffer],
      );
    });
  }
  function render(side) {
    const node = $("art-" + side),
      slot = slots[side],
      href = node.getAttribute("href") || "";
    if (href !== slot.output) slot.source = href;
    const source = slot.source,
      c = { ...state[side] },
      key = JSON.stringify(c);
    if (href === slot.output && key === slot.key && !slot.error)
      return slot.pending;
    const version = ++slot.version;
    slot.key = key;
    slot.error = null;
    if (!source || c.effect === "none" || c.mix === 0) {
      slot.output = source;
      if (source) node.setAttribute("href", source);
      slot.pending = null;
      message("");
      return;
    }
    message("Aplicando tratamento…");
    slot.pending = (async () => {
      const image = new Image();
      image.src = source;
      await image.decode();
      // Bound temporary buffers on phones. The original is never downsampled or replaced.
      const scale = Math.min(
        1,
        2048 / Math.max(image.naturalWidth, image.naturalHeight),
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const result = await process(
        ctx.getImageData(0, 0, canvas.width, canvas.height),
        c,
      );
      if (
        version !== slot.version ||
        (node.getAttribute("href") || "") !== href
      )
        return;
      ctx.putImageData(
        new ImageData(
          new Uint8ClampedArray(result.pixels),
          result.width,
          result.height,
        ),
        0,
        0,
      );
      slot.output = canvas.toDataURL("image/png");
      node.setAttribute("href", slot.output);
      message("Tratamento aplicado.");
    })().catch(() => {
      if (version !== slot.version) return;
      slot.error = Error(
        "Não foi possível aplicar o tratamento. Tente novamente ou restaure a imagem original.",
      );
      slot.output = source;
      node.setAttribute("href", source);
      message(slot.error.message);
    });
    return slot.pending;
  }
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      render("left");
      render("right");
    }, 100);
  }
  async function ready() {
    clearTimeout(timer);
    render("left");
    render("right");
    await Promise.all(Object.values(slots).map((s) => s.pending));
    for (const s of Object.values(slots)) if (s.error) throw s.error;
  }
  function setState(value) {
    validateState(value);
    state = value ? structuredClone(value) : defaults();
    for (const s of Object.values(slots)) s.key = "";
    ui();
    schedule();
  }
  for (const side of ["left", "right"])
    new MutationObserver(() => {
      const href = $("art-" + side).getAttribute("href") || "",
        slot = slots[side];
      if (href !== slot.output) {
        slot.version++;
        slot.source = href;
        slot.key = "";
        schedule();
      }
    }).observe($("art-" + side), {
      attributes: true,
      attributeFilter: ["href"],
    });
  $("raster-target").onchange = (e) => {
    target = e.target.value;
    ui();
  };
  for (const key of ["effect", "amount", "mix"]) {
    const el = $("raster-" + key);
    el.addEventListener("input", () => {
      window.ThumbInteractions?.commit();
      state[target][key] = key === "effect" ? el.value : Number(el.value);
      ui();
      schedule();
    });
    el.addEventListener("change", () => window.ThumbInteractions?.commit());
  }
  $("raster-clear").onclick = () => {
    window.ThumbInteractions?.commit();
    state[target] = defaults()[target];
    ui();
    render(target);
    window.ThumbInteractions?.commit();
  };
  window.ThumbRaster = {
    getState: () => structuredClone(state),
    setState,
    validateState,
    reset: () => setState(null),
    ready,
  };
  ui();
  window.ThumbInteractions?.resetHistory();
})();
