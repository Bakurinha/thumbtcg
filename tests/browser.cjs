// Run against a local server: BASE_URL=http://localhost:8765 npm run test:browser
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-gpu']});
 try{
 for(const mobile of [false,true]){
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1100},hasTouch:mobile,isMobile:mobile,acceptDownloads:true});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.BASE_URL||'http://localhost:8765')+'/#digimon');
 await page.waitForSelector('#selected-element');
 // Import real encoded raster images through the actual normalizer and upload path.
 await page.evaluate(async()=>{
  const canvas=document.createElement('canvas');canvas.width=400;canvas.height=550;const ctx=canvas.getContext('2d');ctx.fillStyle='#26ae78';ctx.fillRect(0,0,800,1100);ctx.fillStyle='#fff';ctx.font='bold 50px sans-serif';ctx.fillText('TCG TEST',35,250);
  const blob=await new Promise(r=>canvas.toBlob(r));for(const side of ['left','right'])await ThumbEngine.loadFile(side,new File([blob],'fixture.png',{type:'image/png'}));ThumbInteractions.commit();
 });
 await page.evaluate(()=>ThumbInteractions.undo());assert.equal(await page.evaluate(()=>ThumbEngine.uploaded.left),false);
 await page.evaluate(()=>ThumbInteractions.redo());assert.equal(await page.evaluate(()=>ThumbEngine.uploaded.left),true);
 await page.selectOption('#selected-element','text-left-deck');
 await page.fill('#element-x','80');await page.dispatchEvent('#element-x','input');
 await page.evaluate(()=>ThumbInteractions.commit());
 assert.equal(await page.evaluate(()=>ThumbInteractions.getState()['text-left-deck'].x),80);
 await page.click('#undo-edit');assert.equal(await page.evaluate(()=>ThumbInteractions.getState()['text-left-deck']?.x||0),0);
 await page.click('#redo-edit');assert.equal(await page.evaluate(()=>ThumbInteractions.getState()['text-left-deck'].x),80);
 await page.fill('#element-scale','125');await page.dispatchEvent('#element-scale','input');await page.evaluate(()=>ThumbInteractions.commit());
 assert.equal(await page.evaluate(()=>ThumbInteractions.getState()['text-left-deck'].scale),1.25);
 await page.click('[data-align=center]');
 const centered=await page.locator('#text-left-deck').boundingBox(),canvasBox=await page.locator('#thumb').boundingBox();
 assert.ok(Math.abs(centered.x+centered.width/2-canvasBox.x-canvasBox.width/2)<2,'center alignment');
 // Actual pointer/touch movement in SVG canvas coordinates.
 await page.selectOption('#selected-element','art-left');await page.locator('#thumb').scrollIntoViewIfNeeded();
 const box=await page.locator('#thumb').boundingBox();const x=box.x+box.width*.23,y=box.y+box.height*.55;
 if(mobile){const cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+20,y:y+12}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 else{await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+40,y+20,{steps:5});await page.mouse.up();}
 assert.ok(await page.evaluate(()=>ThumbInteractions.getState()['art-left']?.x>0),'direct drag');
 // Resize with the visible corner handle (including images extending beyond the canvas).
 const corner=await page.locator('[data-editor-only] circle').boundingBox();
 await page.mouse.move(corner.x+corner.width/2,corner.y+corner.height/2);await page.mouse.down();await page.mouse.move(corner.x+corner.width/2-18,corner.y+corner.height/2-18,{steps:4});await page.mouse.up();
 assert.notEqual(await page.evaluate(()=>ThumbInteractions.getState()['art-left'].scale),1,'corner resize');
 // Project roundtrip, including custom geometry and resolution; previous v2 remains accepted.
 await page.selectOption('#export-size','2560');await page.evaluate(()=>ThumbInteractions.commit());
 assert.ok((await page.evaluate(()=>ThumbStudio.qualityWarnings(2560))).length>0,'low resolution warning');
 const before=await page.evaluate(()=>ThumbStudio.snapshot());
 const save=page.waitForEvent('download');await page.click('#save-project');const project=await save,path=await project.path();const data=JSON.parse(await fs.readFile(path,'utf8'));assert.deepEqual(data.elements,before.elements);
 await page.fill('#input-left-deck','CHANGED');await page.setInputFiles('#open-project',path);await page.waitForFunction(()=>document.getElementById('status').textContent.includes('restaurado'));
 assert.equal(await page.inputValue('#input-left-deck'),before.fields['input-left-deck']);assert.deepEqual(await page.evaluate(()=>ThumbInteractions.getState()),before.elements);
 await page.selectOption('#selected-element','art-left');
 for(const width of [1280,1920,2560]){
  await page.selectOption('#export-size',String(width));
  const event=page.waitForEvent('download');await page.click('#export');const download=await event;const buffer=await fs.readFile(await download.path());
  assert.equal(buffer.readUInt32BE(16),width);assert.equal(buffer.readUInt32BE(20),width*9/16);
  assert.match(download.suggestedFilename(),new RegExp(`${width}x${width*9/16}`));
 }
 // Legacy v2 projects have no elements or export-size. Restore defaults without losing cards.
 delete data.elements;delete data.fields['export-size'];await page.setInputFiles('#open-project',{name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});
 await page.waitForFunction(()=>document.getElementById('export-size').value==='1280');assert.deepEqual(await page.evaluate(()=>ThumbInteractions.getState()),{});
 assert.equal(await page.evaluate(()=>ThumbEngine.uploaded.left&&ThumbEngine.uploaded.right),true);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no horizontal overflow');
 await page.screenshot({path:`/tmp/thumbtcg-${mobile?'mobile':'desktop'}.png`,fullPage:true});
 assert.deepEqual(errors,[]);console.log(`PASS ${mobile?'mobile touch':'desktop mouse'}: import, transform, align, undo/redo, save/open, legacy project, 720p/1080p/1440p PNG, no overflow`);
 await context.close();
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
