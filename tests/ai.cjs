const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1360, height: 900 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => {
      const NativeWorker = window.Worker;
      window.aiTestMode = 'success'; window.aiWorkerCount = 0;
      window.Worker = class extends NativeWorker {
        constructor(url, options) {
          if (!String(url).startsWith('ai-worker.js')) { super(url, options); return; }
          window.aiWorkerCount++;
          // Protocol fixture tests transactional UI independently of external downloads.
          return { terminate() {}, postMessage(data) {
            const mode = window.aiTestMode;
            setTimeout(() => {
              if (mode === 'failure') { this.onmessage?.({data:{type:'error',reason:'fixture'}}); return; }
              const pixels = new Uint8ClampedArray(data.pixels); for (let i=3;i<pixels.length;i+=4) pixels[i]=100;
              this.onmessage?.({data:{type:'result',pixels:pixels.buffer,width:data.width,height:data.height,backend:'Test'}});
            }, mode === 'slow' ? 600 : 50);
          } };
        }
      };
    });
    await page.goto((process.env.BASE_URL || 'http://localhost:8778') + '/#digimon');
    await page.waitForSelector('#ai-open-left');
    await page.evaluate(async () => {
      const c=document.createElement('canvas');c.width=100;c.height=120;const ctx=c.getContext('2d');ctx.fillStyle='#ee7744';ctx.fillRect(0,0,100,120);
      await ThumbEngine.loadFile('left',new File([await new Promise(r=>c.toBlob(r))],'AI-test.png',{type:'image/png'}));
      await ThumbRaster.ready();ThumbInteractions.commit();window.aiOriginal=ThumbStudio.getOriginal('left');
    });
    await page.click('#ai-open-left');
    assert.equal(await page.evaluate(()=>aiWorkerCount),0,'No model work before opt-in');
    await page.click('#ai-run'); await page.waitForFunction(()=>!document.getElementById('ai-apply').disabled);
    assert.equal(await page.evaluate(()=>ThumbStudio.getOriginal('left')===aiOriginal),true,'Preview must not mutate project');
    await page.click('#ai-apply'); await page.waitForFunction(()=>!document.getElementById('ai-dialog').open);
    assert.equal(await page.evaluate(()=>ThumbStudio.getOriginal('left')!==aiOriginal),true);
    const applied=await page.evaluate(()=>ThumbStudio.snapshot());
    await page.evaluate(()=>ThumbInteractions.undo());await page.waitForFunction(()=>ThumbStudio.getOriginal('left')===aiOriginal);
    await page.evaluate(async data=>{await ThumbStudio.restore(data);},applied);
    assert.equal(await page.evaluate(()=>ThumbStudio.getOriginal('left')),applied.art.left.original);
    await page.click('#ai-open-left');await page.evaluate(()=>aiTestMode='failure');await page.click('#ai-run');
    await page.waitForFunction(()=>document.getElementById('ai-status').textContent.includes('não conseguiu'));
    assert.equal(await page.locator('#ai-apply').isDisabled(),true);
    assert.equal(await page.evaluate(()=>ThumbStudio.getOriginal('left')),applied.art.left.original);
    await page.evaluate(()=>aiTestMode='slow');await page.click('#ai-run');await page.click('#ai-stop');await page.waitForTimeout(750);
    assert.equal(await page.locator('#ai-result').isVisible(),false,'Stale results ignored after cancellation');
    await page.click('#ai-run');await page.click('#ai-close');await page.waitForTimeout(750);
    assert.equal(await page.evaluate(()=>ThumbStudio.getOriginal('left')),applied.art.left.original);
    await page.selectOption('#site-language','en');await page.click('#ai-open-left');
    assert.equal(await page.locator('#ai-run').textContent(),'Download model and process');await page.click('#ai-close');
    await page.selectOption('#site-language','es');await page.click('#ai-open-left');
    assert.equal(await page.locator('#ai-run').textContent(),'Descargar modelo y procesar');await page.click('#ai-close');
    await page.setViewportSize({width:390,height:844});await page.click('#ai-open-left');
    assert.equal(await page.evaluate(()=>document.getElementById('ai-dialog').getBoundingClientRect().width<=innerWidth),true);
    await page.screenshot({path:'/tmp/ai-beta-mobile.png'});await page.click('#ai-close');
    await page.evaluate(()=>{Object.defineProperty(window,'OffscreenCanvas',{value:undefined,configurable:true});});await page.click('#ai-open-left');
    assert.equal(await page.locator('#ai-run').isDisabled(),true,'Unsupported browser explains failure before download');
    assert.deepEqual(errors,[]);
    console.log('PASS AI Beta UI: opt-in, preview/apply, undo, persistence, failure, cancel/stale results, PT/EN/ES, mobile and unsupported browsers. Model inference is tested separately.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1);});
