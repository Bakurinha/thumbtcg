/** ThumbTCG regression coverage: advanced.cjs. Keep fixtures and assertions behaviorally unchanged. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs/promises');
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-gpu']});
  try{for(const mobile of [false,true]){
      const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile,acceptDownloads:true});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto((process.env.BASE_URL||'http://localhost:8765')+'/#yugioh');await page.waitForSelector('#advanced-mode',{state:'attached'});
      assert.equal(await page.locator('#advanced-options').isVisible(),false);assert.equal(await page.locator('#direct-options').isVisible(),false);
      await page.click('[data-tool=layers]');
      const fixture=await page.evaluate(async()=>{const c=document.createElement('canvas');c.width=700;c.height=980;const ctx=c.getContext('2d');ctx.fillStyle='#ed3434';ctx.fillRect(0,0,700,980);ctx.fillStyle='#ffc928';ctx.fillRect(0,490,700,490);const blob=await new Promise(r=>c.toBlob(r));for(const side of ['left','right'])await ThumbEngine.loadFile(side,new File([blob],'card.png',{type:'image/png'}));return c.toDataURL();});
      const file={name:'wall.png',mimeType:'image/png',buffer:Buffer.from(fixture.split(',')[1],'base64')};
      await page.setInputFiles('#wallpaper-upload',file);await page.waitForFunction(()=>ThumbAdvanced.getState().source==='wallpaper');
      await page.setInputFiles('#extra-upload',file);await page.waitForFunction(()=>ThumbAdvanced.getState().extra.length>0);
      for(let i=11;i<=22;i++){await page.selectOption('#layout-preset','layout'+i,{force:true});assert.equal(await page.evaluate(()=>ThumbAdvanced.getState().source),'wallpaper');assert.equal(await page.locator('#art-left').getAttribute('clip-path'),[13,14,15,18].includes(i)?'url(#advanced-circle)':'none');}
      await page.selectOption('#layout-preset','layout14',{force:true});await page.selectOption('#background-source','left');await page.selectOption('#effect-preset','cinema');
      await page.locator('#bg-gamma').fill('1.6');await page.dispatchEvent('#bg-gamma','input');await page.dispatchEvent('#bg-gamma','change');
      await page.selectOption('#layer-list','art-left');await page.click('[data-layer-move=top]');assert.equal(await page.evaluate(()=>ThumbAdvanced.getState().order.at(-1)),'art-left');
      assert.equal(await page.evaluate(()=>document.querySelector('#thumb>[data-editor-only]').previousElementSibling.dataset.layer),'art-left');
      await page.click('#undo-edit');await page.waitForFunction(()=>ThumbAdvanced.getState().order.at(-1)!=='art-left');await page.click('#redo-edit');await page.waitForFunction(()=>ThumbAdvanced.getState().order.at(-1)==='art-left');
      const saved=await page.evaluate(()=>ThumbStudio.snapshot());await page.evaluate(async()=>{const s=ThumbStudio.snapshot();ThumbAdvanced.reset();await ThumbStudio.restore(s);});assert.deepEqual(await page.evaluate(()=>ThumbAdvanced.getState()),saved.advanced);
      // Save/open through the real JSON upload path, including both additional images.
      const event=page.waitForEvent('download');await page.click('#save-project');const download=await event,path=await download.path();await page.click('#remove-wallpaper');await page.setInputFiles('#open-project',path);await page.waitForFunction(()=>document.getElementById('status').textContent.includes('restaurado'));assert.deepEqual(await page.evaluate(()=>ThumbAdvanced.getState()),saved.advanced);
      // Actual PNG output must change when background brightness changes. Hide foregrounds to isolate the filter.
      await page.evaluate(()=>{const s=ThumbAdvanced.getState();s.order=s.order.filter(id=>id!=='advanced-background').concat('advanced-background');s.source='wallpaper';s.zoom=1;s.blur=0;s.gamma=1;s.contrast=1;s.saturation=1;s.brightness=1;s.opacity=1;ThumbAdvanced.setState(s);});
      async function exportPixel(){const e=page.waitForEvent('download');await page.click('#export');const d=await e,bytes=await fs.readFile(await d.path());assert.equal(bytes.readUInt32BE(16),1280);return page.evaluate(async src=>{const img=new Image();img.src=src;await img.decode();const c=document.createElement('canvas');c.width=1280;c.height=720;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);return [...ctx.getImageData(200,100,1,1).data];},'data:image/png;base64,'+bytes.toString('base64'));}
      const light=await exportPixel();await page.evaluate(()=>{const s=ThumbAdvanced.getState();s.brightness=.3;ThumbAdvanced.setState(s);});const dark=await exportPixel();assert.ok(dark[0]<light[0]*.5,`exported brightness: ${light} → ${dark}`);
      // Draft isolation and old files without advanced data.
      await page.evaluate(()=>location.hash='digimon');await page.waitForFunction(()=>document.body.dataset.game==='digimon');assert.equal(await page.evaluate(()=>ThumbAdvanced.getState().extra),'');
      await page.evaluate(()=>location.hash='yugioh');await page.waitForFunction(()=>document.body.dataset.game==='yugioh');await page.waitForFunction(()=>ThumbAdvanced.getState().brightness===.3);
      await page.evaluate(async()=>{const s=ThumbStudio.snapshot();delete s.advanced;s.fields['layout-preset']='layout1';await ThumbStudio.restore(s);});assert.equal(await page.evaluate(()=>ThumbAdvanced.getState().source),'none');assert.equal(await page.evaluate(()=>ThumbAdvanced.getState().extra),'');
      await page.selectOption('#layout-preset','layout14',{force:true});await page.selectOption('#effect-preset','neon');await page.locator('#thumb').scrollIntoViewIfNeeded();await page.locator('#thumb').screenshot({path:`/tmp/advanced-preview-${mobile?'mobile':'desktop'}.png`});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no horizontal overflow');assert.deepEqual(errors,[]);console.log(`PASS advanced ${mobile?'mobile':'desktop'}: 12 layouts, optional controls, layer order + undo, uploads, roundtrip, draft isolation, legacy defaults, real PNG filter pixels`);await context.close();
  }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
