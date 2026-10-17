/* Konva's CPU filters run off the UI thread. No editor state lives here. */
importScripts("vendor/konva/filters-10.9.0.js");
self.onmessage = ({ data: { id, pixels, width, height, config } }) => {
  try {
    const data = new Uint8ClampedArray(pixels);
    const source = data.slice();
    const image = { data, width, height };
    const api = {
      pixelSize: () =>
        Math.max(2, Math.round((width / 500) * (2 + config.amount * 0.3))),
      levels: () => (2 + Math.round((100 - config.amount) * 0.3)) / 255,
      embossStrength: () => config.amount / 25,
      embossWhiteLevel: () => 0.5,
      embossDirection: () => "top-left",
      embossBlend: () => true,
    };
    if (ThumbRasterFilters[config.effect])
      ThumbRasterFilters[config.effect].call(api, image);
    else {
      const strength = config.amount / 100;
      const offset = Math.round(width * 0.025 * strength);
      const sample = (x, y, c) =>
        source[
          (Math.max(0, Math.min(height - 1, y)) * width +
            Math.max(0, Math.min(width - 1, x))) *
            4 +
            c
        ];
      // Deterministic effects keep preview, history and exports identical.
      for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const luminance =
            0.2126 * source[i] +
            0.7152 * source[i + 1] +
            0.0722 * source[i + 2];
          if (config.effect === "Chromatic") {
            data[i] = sample(x + offset, y, 0);
            data[i + 2] = sample(x - offset, y, 2);
          } else if (config.effect === "Glitch") {
            const band = Math.floor(y / Math.max(1, Math.round(height / 40)));
            const shift = band % 7 === 0 ? offset * ((band % 3) - 1) * 3 : 0;
            for (let c = 0; c < 3; c++)
              data[i + c] = sample(x + shift + (c === 0 ? offset : 0), y, c);
          } else if (config.effect === "Duotone") {
            const t = luminance / 255,
              low = [48, 10, 80],
              high = [80, 245, 255];
            for (let c = 0; c < 3; c++)
              data[i + c] =
                source[i + c] * (1 - strength) +
                (low[c] + t * (high[c] - low[c])) * strength;
          } else if (config.effect === "Grain") {
            const n =
              (((Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263)) >>>
                0) %
                1000) /
                999 -
              0.5;
            for (let c = 0; c < 3; c++)
              data[i + c] = source[i + c] + n * 100 * strength;
          } else if (config.effect === "Edge") {
            let edge = 0;
            for (let c = 0; c < 3; c++)
              edge +=
                Math.abs(sample(x + 1, y, c) - sample(x - 1, y, c)) +
                Math.abs(sample(x, y + 1, c) - sample(x, y - 1, c));
            edge = Math.min(255, (edge * (1 + strength * 4)) / 3);
            data[i] = edge * 0.25;
            data[i + 1] = edge;
            data[i + 2] = edge;
          } else throw Error("Unknown treatment");
        }
    }
    // Preserve soft cutouts; some upstream filters quantize the alpha channel too.
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++)
        data[i + c] =
          source[i + c] + ((data[i + c] - source[i + c]) * config.mix) / 100;
      data[i + 3] = source[i + 3];
    }
    self.postMessage({ id, pixels: data.buffer, width, height }, [data.buffer]);
  } catch (error) {
    self.postMessage({ id, error: String(error.message || error) });
  }
};
