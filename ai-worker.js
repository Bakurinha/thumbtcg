/* Optional local inference. Only versioned runtime/model downloads leave this worker;
   input pixels are never uploaded. Terminating this worker cancels downloads/inference. */
'use strict';
const ORT = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/';
const MODEL = 'https://huggingface.co/edgetools/u2netp/resolve/25dee37ab19c5b6ad64ba6578eba63f1ae07720c/u2netp.onnx';
const MODEL_SHA = '309c8469258dda742793dce0ebea8e6dd393174f89934733ecc8b14c76f4ddd8';
const CDN = 'https://cdn.jsdelivr.net/npm/';
const progress = (phase, value) => postMessage({ type: 'progress', phase, value });
async function modelBytes() {
  let cache;
  try { cache = await caches.open('thumbtcg-ai-u2netp-v1'); } catch { /* Private browsing can disable storage. */ }
  let response = await cache?.match(MODEL);
  const cached = !!response;
  if (!response) response = await fetch(MODEL, { credentials: 'omit', referrerPolicy: 'no-referrer' });
  if (!response.ok) throw Error('download');
  const bytes = await response.arrayBuffer();
  const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(v => v.toString(16).padStart(2, '0')).join('');
  if (hash !== MODEL_SHA) { await cache?.delete(MODEL); throw Error('integrity'); }
  if (!cached) try { await cache?.put(MODEL, new Response(bytes)); } catch { /* Caching is optional. */ }
  return bytes;
}
async function removeBackground(pixels, width, height) {
  progress('download', 0);
  importScripts(ORT + 'ort.wasm.min.js');
  ort.env.wasm.numThreads = 1; // Works on GitHub Pages without COOP/COEP headers.
  ort.env.wasm.wasmPaths = ORT;
  ort.env.wasm.proxy = false;
  const bytes = await modelBytes();
  progress('prepare', 15);
  const session = await ort.InferenceSession.create(bytes, { executionProviders: ['wasm'] });
  try {
    const source = new OffscreenCanvas(width, height), sourceCtx = source.getContext('2d');
    sourceCtx.putImageData(new ImageData(pixels, width, height), 0, 0);
    const resized = new OffscreenCanvas(320, 320), ctx = resized.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 320, 320); ctx.drawImage(source, 0, 0, 320, 320);
    const rgb = ctx.getImageData(0, 0, 320, 320).data, count = 320 * 320, input = new Float32Array(count * 3);
    let max = 1;
    for (let i = 0; i < rgb.length; i += 4) for (let c = 0; c < 3; c++) max = Math.max(max, rgb[i + c]);
    const means = [.485, .456, .406], std = [.229, .224, .225];
    for (let p = 0; p < count; p++) for (let c = 0; c < 3; c++) input[c * count + p] = (rgb[p * 4 + c] / max - means[c]) / std[c];
    progress('infer', 30);
    const tensor = new ort.Tensor('float32', input, [1, 3, 320, 320]);
    const result = await session.run({ [session.inputNames[0]]: tensor });
    const values = result[session.outputNames[0]].data;
    let min = Infinity, high = -Infinity;
    for (const v of values) { min = Math.min(min, v); high = Math.max(high, v); }
    if (!Number.isFinite(min) || high - min < .000001) throw Error('empty-mask');
    const maskPixels = new Uint8ClampedArray(count * 4);
    for (let p = 0; p < count; p++) { const v = 255 * (values[p] - min) / (high - min); maskPixels[p * 4] = maskPixels[p * 4 + 1] = maskPixels[p * 4 + 2] = v; maskPixels[p * 4 + 3] = 255; }
    ctx.putImageData(new ImageData(maskPixels, 320, 320), 0, 0);
    sourceCtx.clearRect(0, 0, width, height); sourceCtx.drawImage(resized, 0, 0, width, height);
    const mask = sourceCtx.getImageData(0, 0, width, height).data;
    for (let i = 0; i < pixels.length; i += 4) pixels[i + 3] = pixels[i + 3] * mask[i] / 255;
    tensor.dispose(); for (const output of Object.values(result)) output.dispose();
    return { pixels, width, height, backend: 'WASM / CPU' };
  } finally { await session.release(); }
}
async function upscale(pixels, width, height) {
  progress('download', 0);
  importScripts(CDN + '@tensorflow/tfjs@4.22.0/dist/tf.min.js');
  importScripts(CDN + '@upscalerjs/default-model@1.0.0/dist/umd/index.min.js');
  importScripts(CDN + 'upscaler@1.0.0/dist/browser/umd/upscaler.min.js');
  let backend = 'cpu';
  try { if (await tf.setBackend('webgl')) backend = 'webgl'; } catch { /* CPU still supports browsers without a GPU. */ }
  if (backend === 'cpu') await tf.setBackend('cpu');
  await tf.ready();
  const model = { ...DefaultUpscalerJSModel, path: CDN + '@upscalerjs/default-model@1.0.0/models/model.json' };
  delete model._internals; // Single pinned provider; no implicit CDN fallback.
  const engine = new Upscaler({ model });
  let input, output;
  try {
    await engine.ready;
    progress('prepare', 10);
    const rgb = new Float32Array(width * height * 3);
    for (let p = 0; p < width * height; p++) for (let c = 0; c < 3; c++) rgb[p * 3 + c] = pixels[p * 4 + c];
    input = tf.tensor3d(rgb, [height, width, 3]);
    output = await engine.upscale(input, { output: 'tensor', patchSize: 64, padding: 6, progress: fraction => progress('infer', 10 + Math.round(fraction * 85)) });
    const values = await output.data(), outWidth = width * 2, outHeight = height * 2;
    // Preserve transparency separately: this RGB network does not predict an alpha channel.
    const original = new OffscreenCanvas(width, height), scaled = new OffscreenCanvas(outWidth, outHeight);
    original.getContext('2d').putImageData(new ImageData(pixels, width, height), 0, 0);
    const ctx = scaled.getContext('2d'); ctx.drawImage(original, 0, 0, outWidth, outHeight);
    const result = ctx.getImageData(0, 0, outWidth, outHeight).data;
    for (let p = 0; p < outWidth * outHeight; p++) for (let c = 0; c < 3; c++) result[p * 4 + c] = values[p * 3 + c];
    return { pixels: result, width: outWidth, height: outHeight, backend: backend === 'webgl' ? 'WebGL / GPU' : 'CPU' };
  } finally { input?.dispose(); output?.dispose(); await engine.dispose(); }
}
self.onmessage = async ({ data }) => {
  try {
    const { mode, width, height } = data;
    if (!['remove', 'upscale'].includes(mode) || !Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 2048 || height > 2048 || mode === 'upscale' && Math.max(width, height) > 1024) throw Error('input');
    const pixels = new Uint8ClampedArray(data.pixels);
    if (pixels.length !== width * height * 4) throw Error('input');
    const result = mode === 'remove' ? await removeBackground(pixels, width, height) : await upscale(pixels, width, height);
    postMessage({ type: 'result', ...result, pixels: result.pixels.buffer }, [result.pixels.buffer]);
  } catch (error) { postMessage({ type: 'error', reason: String(error.message || error).slice(0, 400) }); }
};
