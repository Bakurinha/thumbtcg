/* Pure mask/post-processing operations. AI supplies the mask; these effects are deterministic. */
'use strict';
function aiMaskWeight(value, threshold, softness) {
  const low = threshold - softness / 2;
  const x = Math.max(0, Math.min(1, (value - low) / softness));
  return x * x * (3 - 2 * x);
}
function aiComposite(source, mask, background, mode, options) {
  const result = new Uint8ClampedArray(source.length);
  const { threshold, softness, strength, color } = options;
  const rgb = [1, 3, 5].map(offset => parseInt(color.slice(offset, offset + 2), 16));
  for (let i = 0, p = 0; i < source.length; i += 4, p++) {
    const m = aiMaskWeight(mask[p] / 255, threshold, softness), alpha = source[i + 3] / 255;
    if (mode === 'remove') {
      result.set(source.subarray(i, i + 4), i); result[i + 3] = 255 * alpha * m;
    } else if (mode === 'spotlight') {
      const luminance = .2126 * source[i] + .7152 * source[i + 1] + .0722 * source[i + 2];
      for (let c = 0; c < 3; c++) {
        const subject = (luminance + (source[i + c] - luminance) * (1 + .35 * strength)) * (1 + .3 * strength);
        result[i + c] = subject * m + source[i + c] * (1 - .65 * strength) * (1 - m);
      }
      result[i + 3] = source[i + 3];
    } else if (mode === 'blur') {
      for (let c = 0; c < 3; c++) result[i + c] = source[i + c] * m + background[i + c] * (1 - m);
      result[i + 3] = source[i + 3];
    } else {
      // Source-over in premultiplied alpha prevents dark fringes on transparent uploads.
      const foregroundAlpha = alpha * m, backgroundAlpha = mode === 'color' ? 1 : background[i + 3] / 255;
      const outAlpha = foregroundAlpha + backgroundAlpha * (1 - foregroundAlpha);
      for (let c = 0; c < 3; c++) result[i + c] = outAlpha ? (source[i + c] * foregroundAlpha + (mode === 'color' ? rgb[c] : background[i + c]) * backgroundAlpha * (1 - foregroundAlpha)) / outAlpha : 0;
      result[i + 3] = outAlpha * 255;
    }
  }
  return result;
}
