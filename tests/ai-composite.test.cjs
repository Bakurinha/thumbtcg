const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const ctx = vm.createContext({ Uint8ClampedArray });
vm.runInContext(fs.readFileSync('ai-composite.js', 'utf8'), ctx);
const opts = { threshold: .5, softness: 1, strength: 1, color: '#102030' };
const image = new Uint8ClampedArray([180, 100, 60, 255, 80, 100, 120, 128]);
test('Mask selection respects thresholds and soft transitions', () => {
  assert.equal(ctx.aiMaskWeight(0, .5, 1), 0);
  assert.equal(ctx.aiMaskWeight(1, .5, 1), 1);
  assert.equal(ctx.aiMaskWeight(.5, .5, 1), .5);
  assert.equal(ctx.aiMaskWeight(.4, .6, .02), 0);
});
test('Removal preserves RGB and multiplies existing alpha', () => {
  const result = ctx.aiComposite(image, [0, 255], null, 'remove', opts);
  assert.deepEqual([...result], [180,100,60,0,80,100,120,128]);
  assert.equal(image[3], 255, 'Source remains unchanged');
});
test('Solid background replaces rejected pixels and composites transparent subject', () => {
  const result = ctx.aiComposite(image, [0, 255], null, 'color', opts);
  assert.deepEqual([...result.slice(0,4)], [16,32,48,255]);
  assert.deepEqual([...result.slice(4)], [48,66,84,255]);
});
test('Blur keeps subject sharp and uses background for rejected pixels', () => {
  const bg = new Uint8ClampedArray([1,2,3,255,20,30,40,128]);
  const result = ctx.aiComposite(image, [255, 0], bg, 'blur', opts);
  assert.deepEqual([...result], [180,100,60,255,20,30,40,128]);
});
test('Spotlight respects alpha, changes only RGB and has neutral zero strength', () => {
  assert.deepEqual([...ctx.aiComposite(image, [255,0], null, 'spotlight', {...opts,strength:0})], [...image]);
  const result = ctx.aiComposite(image, [255,0], null, 'spotlight', opts);
  assert.ok(result[0] > image[0]); assert.ok(result[4] < image[4]);
  assert.equal(result[3],255); assert.equal(result[7],128);
});
