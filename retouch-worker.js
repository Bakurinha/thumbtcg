/* Local pixel processing: no uploads, model downloads or API keys. */
function enhance(data, width, height, options) {
  const out = new Uint8ClampedArray(data), source = new Uint8ClampedArray(data);
  const exposure = 2 ** (options.exposure / 100), contrast = 1 + options.contrast / 100;
  for (let i = 0; i < out.length; i += 4) {
    const gray = .2126 * source[i] + .7152 * source[i + 1] + .0722 * source[i + 2];
    const spread = (Math.max(...source.subarray(i, i + 3)) - Math.min(...source.subarray(i, i + 3))) / 255;
    const saturation = 1 + options.saturation / 100 + options.vibrance / 100 * (1 - spread);
    for (let c = 0; c < 3; c++) {
      let value = (gray + (source[i + c] - gray) * saturation) * exposure;
      value = (value - 127.5) * contrast + 127.5;
      out[i + c] = 255 * Math.pow(Math.max(0, Math.min(1, value / 255)), 1 / options.gamma);
    }
  }
  if (options.sharpness > 0) {
    const base = out.slice(), strength = options.sharpness / 100;
    for (let y = 1; y < height - 1; y++) for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      // Avoid dark halos from transparent neighbours.
      if ([i, i - 4, i + 4, i - width * 4, i + width * 4].some(p => base[p + 3] < 250)) continue;
      for (let c = 0; c < 3; c++) out[i + c] = base[i + c] + strength * (4 * base[i + c] - base[i - 4 + c] - base[i + 4 + c] - base[i - width * 4 + c] - base[i + width * 4 + c]);
    }
  }
  return out;
}
if (typeof self !== 'undefined') self.onmessage = ({ data: { id, pixels, width, height, options } }) => {
  try { const result = enhance(pixels, width, height, options); self.postMessage({ id, pixels: result.buffer }, [result.buffer]); }
  catch (error) { self.postMessage({ id, error: error.message }); }
};
if (typeof module !== 'undefined') module.exports = { enhance };
