const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const assert = require('node:assert/strict');
const { enhance } = require('../retouch-worker.js');
const defaults = { exposure: 0, contrast: 0, saturation: 0, vibrance: 0, gamma: 1, sharpness: 0 };
const sample = new Uint8ClampedArray([60, 100, 140, 0, 200, 50, 20, 150]);
assert.deepEqual(enhance(sample, 2, 1, defaults), sample);
assert.equal(enhance(sample, 2, 1, {...defaults, vibrance: 60})[7], 150);
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: {width: 1440, height: 1000} });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto((process.env.BASE_URL || 'http://localhost:8778') + '/#digimon');
    await page.waitForFunction(() => window.ThumbStudio && window.ThumbRaster);
    await page.evaluate(async () => {
      const c = document.createElement('canvas'); c.width = c.height = 200;
      const x = c.getContext('2d'); x.fillStyle = 'white'; x.fillRect(0,0,200,200); x.fillStyle = '#c05020'; x.fillRect(60,60,80,80);
      const blob = await new Promise(r => c.toBlob(r));
      for (const side of ['left','right']) await ThumbEngine.loadFile(side, new File([blob], 'test.png', {type:'image/png'}));
      await ThumbRaster.ready(); ThumbInteractions.commit();
      window.beforeRetouch = ThumbStudio.snapshot();
    });
    await page.click('#retouch-open-left');
    await page.click('#retouch-auto');
    await page.waitForTimeout(300);
    let alpha = await page.$eval('#retouch-canvas', c => [c.getContext('2d').getImageData(10,10,1,1).data[3], c.getContext('2d').getImageData(90,90,1,1).data[3]]);
    assert.deepEqual(alpha, [0,255]);
    await page.click('#retouch-undo'); await page.waitForTimeout(300);
    assert.equal(await page.$eval('#retouch-canvas', c => c.getContext('2d').getImageData(10,10,1,1).data[3]),255);
    await page.selectOption('#retouch-tool','erase');
    const box = await page.locator('#retouch-canvas').boundingBox();
    await page.mouse.move(box.x + box.width*.5,box.y+box.height*.5); await page.mouse.down(); await page.mouse.move(box.x+box.width*.55,box.y+box.height*.5); await page.mouse.up();
    await page.waitForTimeout(300);
    assert.equal(await page.$eval('#retouch-canvas', c => c.getContext('2d').getImageData(100,100,1,1).data[3]),0);
    await page.selectOption('#retouch-tool','restore'); await page.mouse.click(box.x+box.width*.5,box.y+box.height*.5); await page.waitForTimeout(300);
    assert.equal(await page.$eval('#retouch-canvas', c => c.getContext('2d').getImageData(100,100,1,1).data[3]),255);
    await page.click('#retouch-auto'); await page.waitForTimeout(300);
    await page.click('#retouch-apply'); await page.waitForFunction(() => !document.getElementById('retouch-dialog').open);
    assert.equal(await page.evaluate(() => ThumbStudio.getOriginal('right') === beforeRetouch.art.right.original),true);
    assert.equal(await page.evaluate(() => ThumbStudio.getOriginal('left') !== beforeRetouch.art.left.original),true);
    await page.evaluate(() => ThumbInteractions.undo());
    await page.waitForFunction(() => ThumbStudio.getOriginal('left') === beforeRetouch.art.left.original);
    await page.evaluate(async () => { await ThumbStudio.restore(beforeRetouch); await ThumbRaster.ready(); });
    assert.equal(await page.evaluate(() => ThumbStudio.getOriginal('left') === beforeRetouch.art.left.original),true);
    await page.click('#retouch-open-left'); await page.click('#retouch-close');
    await page.evaluate(() => { const state = ThumbFX.getState(); for (const k of ['textScaleX','textScaleY','textShadow','textUnderline']) delete state[k]; ThumbFX.validateState(state); ThumbFX.setState(state); document.getElementById('fx-gold-title').click(); });
    assert.equal(await page.evaluate(() => ThumbFX.getState().textUnderline),3);
    for(const width of [1280,1920,2560]) {
      await page.selectOption('#export-size', String(width));
      const download = page.waitForEvent('download'); await page.click('#export');
      const path = await (await download).path(), png = await fs.readFile(path);
      assert.equal(png.readUInt32BE(16),width); assert.equal(png.readUInt32BE(20),width*9/16);
    }
    await page.click('#retouch-open-left');
    await page.fill('#retouch-source','#c05020'); await page.fill('#retouch-color','#3366ff');
    await page.click('#retouch-replace'); await page.waitForTimeout(300);
    assert.deepEqual(await page.$eval('#retouch-canvas',c=>[...c.getContext('2d').getImageData(100,100,1,1).data]),[51,102,255,255]);
    await page.click('#retouch-close');
    await page.setViewportSize({width:390,height:844}); await page.click('#retouch-open-left');
    await page.screenshot({path:'/tmp/retouch-mobile.png'});
    assert.equal(await page.evaluate(() => document.getElementById('retouch-dialog').getBoundingClientRect().width <= innerWidth),true);
    await page.click('#retouch-close');
    assert.deepEqual(errors,[]); console.log('Retouch: pixels, brush, restore, auto cutout, apply, old projects, title preset and mobile passed.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
