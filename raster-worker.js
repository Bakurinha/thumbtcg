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
    ThumbRasterFilters[config.effect].call(api, image);
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
