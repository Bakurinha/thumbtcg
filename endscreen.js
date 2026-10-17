/* End-screen artwork is exported; clickable video elements are configured in YouTube Studio. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id),
    svg = $("thumb"),
    ns = svg.namespaceURI;
  const make = (tag, attrs = {}) => {
    const n = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
  };
  const defaults = () => ({
    enabled: false,
    width: 420,
    gap: 120,
    y: 280,
    border: 4,
    color: "#82e6ff",
    shade: 0.55,
    guides: true,
    title: "",
    caption: "",
  });
  let state = defaults();
  const ranges = {
    width: [320, 440, 1, "Largura dos vídeos"],
    gap: [40, 160, 1, "Espaço entre vídeos"],
    y: [160, 390, 1, "Posição vertical dos vídeos"],
    border: [0, 12, 1, "Espessura da moldura"],
    shade: [0, 0.9, 0.05, "Escurecer o fundo"],
  };
  const panel = document.createElement("details");
  panel.className = "fx-feature";
  panel.innerHTML = `<summary>Tela final do YouTube</summary><label class="toggle"><input id="end-enabled" type="checkbox"/> Ativar tela final</label><p class="drag-hint">Dois vídeos em 16:9, alinhados e sem sobreposição. As cartas e os textos da thumb ficam ocultos enquanto este modo estiver ativo.</p><label class="field"><span>Título da tela final</span><input id="end-title" type="text" maxlength="70" placeholder="Obrigado por assistir!"/></label><label class="field"><span>Mensagem inferior</span><input id="end-caption" type="text" maxlength="90" placeholder="Escolha seu próximo duelo"/></label>${Object.entries(
    ranges,
  )
    .map(
      ([k, [min, max, step, label]]) =>
        `<label class="field"><span>${label}</span><input id="end-${k}" type="range" min="${min}" max="${max}" step="${step}"/></label>`,
    )
    .join(
      "",
    )}<label class="field"><span>Cor das molduras</span><input id="end-color" type="color"/></label><label class="toggle"><input id="end-guides" type="checkbox" checked/> Mostrar guias somente na prévia</label><output id="end-measures" class="drag-hint" aria-live="polite"></output><button type="button" id="end-reset" class="studio-btn">Restaurar posições da tela final</button><p class="drag-hint">Exporte o PNG e use-o no final do vídeo. No YouTube Studio, adicione dois elementos de vídeo e ajuste-os às molduras. O PNG não contém links clicáveis; as posições não são impostas pelo YouTube. Use a tela nos últimos 5 a 20 segundos de um vídeo com pelo menos 25 segundos.</p>`;
  document.querySelector(".layout-toolbar").prepend(panel);
  const layer = make("g", {
    id: "youtube-end-screen",
    "pointer-events": "none",
  });
  window.ThumbAdvanced.registerLayer(
    "youtube-end-screen",
    "Tela final do YouTube",
    layer,
  );
  const style = make("style");
  // Keep existing state intact so disabling the mode restores the thumbnail exactly.
  style.textContent =
    '.youtube-end-screen [data-layer]:not([data-layer="youtube-end-screen"]):not([data-layer="theme-background"]):not([data-layer="theme-border"]):not([data-layer="advanced-background"]):not([data-layer="advanced-shade"]):not([data-layer="red-moon-background"]){display:none!important}.youtube-end-screen #youtube-end-screen{display:inline!important}';
  svg.querySelector("defs").append(style);
  function geometry() {
    const w = state.width,
      h = (w * 9) / 16,
      x = (1280 - 2 * w - state.gap) / 2;
    return [
      { x, y: state.y, width: w, height: h },
      { x: x + w + state.gap, y: state.y, width: w, height: h },
    ];
  }
  function validateState(v) {
    if (v == null) return;
    if (
      typeof v !== "object" ||
      ["enabled", "guides"].some((k) => typeof v[k] !== "boolean") ||
      !/^#[\da-f]{6}$/i.test(v.color) ||
      ["title", "caption"].some(
        (k) =>
          typeof v[k] !== "string" || v[k].length > (k === "title" ? 70 : 90),
      )
    )
      throw Error("Tela final inválida.");
    for (const [k, [min, max]] of Object.entries(ranges))
      if (!Number.isFinite(v[k]) || v[k] < min || v[k] > max)
        throw Error("Tela final inválida.");
  }
  function render() {
    svg.classList.toggle("youtube-end-screen", state.enabled);
    layer.style.display = state.enabled ? "" : "none";
    layer.replaceChildren();
    if (!state.enabled) return;
    layer.append(
      make("rect", {
        width: 1280,
        height: 720,
        fill: "#060b18",
        opacity: state.shade,
      }),
    );
    const text = (value, x, y, size, color) => {
      const el = make("text", {
        x,
        y,
        "text-anchor": "middle",
        "font-family": "Arial, sans-serif",
        "font-weight": 700,
        "font-size": size,
        fill: color,
      });
      el.textContent = value;
      return el;
    };
    // User text is always textContent, never parsed as SVG markup.
    if (state.title)
      layer.append(
        text(
          state.title,
          640,
          95,
          Math.min(42, 1050 / (state.title.length * 0.62)),
          "#ffffff",
        ),
      );
    if (state.caption)
      layer.append(
        text(
          state.caption,
          640,
          675,
          Math.min(25, 1050 / (state.caption.length * 0.62)),
          "#ffffff",
        ),
      );
    geometry().forEach((box, i) => {
      layer.append(
        make("rect", {
          ...box,
          fill: "#080e1c",
          "fill-opacity": 0.75,
          stroke: state.color,
          "stroke-width": state.border,
          "data-end-slot": i + 1,
        }),
      );
      if (state.guides) {
        const g = make("g", { "data-editor-only": "true" });
        g.append(
          make("rect", {
            ...box,
            fill: "none",
            stroke: "#fff",
            "stroke-dasharray": "8 8",
            "stroke-width": 1,
          }),
          text(
            `16:9 · ${i + 1}`,
            box.x + box.width / 2,
            box.y + box.height / 2,
            24,
            "#fff",
          ),
        );
        layer.append(g);
      }
    });
  }
  function ui() {
    for (const k of Object.keys(defaults()))
      $("end-" + k)[typeof state[k] === "boolean" ? "checked" : "value"] =
        state[k];
    const boxes = geometry(),
      width = Number($("export-size").value) || 1280,
      scale = width / 1280;
    const px = (n) => Math.round(n * scale * 100) / 100;
    $("end-measures").textContent =
      `${width} × ${(width * 9) / 16} · ` +
      boxes
        .map(
          (b, i) =>
            `${i + 1}: X ${px(b.x)}, Y ${px(b.y)}, ${px(b.width)} × ${px(b.height)}`,
        )
        .join(" | ");
  }
  $("export-size").addEventListener("change", ui);
  for (const k of Object.keys(defaults())) {
    const el = $("end-" + k);
    el.addEventListener("input", () => {
      window.ThumbInteractions?.commit();
      state[k] =
        typeof defaults()[k] === "boolean"
          ? el.checked
          : typeof defaults()[k] === "number"
            ? Number(el.value)
            : el.value;
      render();
      ui();
    });
    el.addEventListener("change", () => window.ThumbInteractions?.commit());
  }
  $("end-reset").onclick = () => {
    window.ThumbInteractions?.commit();
    Object.assign(state, { width: 420, gap: 120, y: 280 });
    render();
    ui();
    window.ThumbInteractions?.commit();
  };
  window.ThumbEndscreen = {
    getState: () => structuredClone(state),
    geometry,
    validateState,
    setState(v) {
      validateState(v);
      state = v ? structuredClone(v) : defaults();
      render();
      ui();
    },
    reset() {
      state = defaults();
      render();
      ui();
    },
  };
  render();
  ui();
  window.ThumbInteractions?.resetHistory();
})();
