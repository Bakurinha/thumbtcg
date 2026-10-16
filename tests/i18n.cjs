/** Regression tests: i18n.cjs. Preserve fixture inputs, expected values and assertions. */
const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-gpu']});try{
    for(const mobile of [false,true]){
      const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile,acceptDownloads:true});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));const base=process.env.BASE_URL||'http://localhost:8778';await page.goto(base);await page.waitForFunction(()=>!!window.ThumbI18n);
      // All catalog entries have both translations and preserve the same parameter slots.
      assert.equal(await page.evaluate(()=>Object.entries(ThumbLocales).every(([source,values])=>values.length===2&&values.every(v=>v&&JSON.stringify((v.match(/\{\d+\}/g)||[]).sort())===JSON.stringify((source.match(/\{\d+\}/g)||[]).sort())))),true);
      for(const lang of ['en','es','pt-BR','en']){await page.selectOption('#site-language',lang);assert.equal(await page.locator('html').getAttribute('lang'),lang);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}
      await page.reload();await page.waitForFunction(()=>window.ThumbI18n?.getLanguage()==='en');assert.match(await page.locator('.hero h1').textContent(),/Create thumbnails/);assert.equal(await page.locator('#site-language').getAttribute('aria-label'),'Language');
      for(const game of ['digimon','yugioh','magic','onepiece','pokemon','lorcana']){
        await page.goto(base+'/#'+game);await page.waitForFunction(g=>document.body.dataset.game===g,game);
        for(const lang of ['es','en','pt-BR']){
          await page.selectOption('#site-language',lang);await page.waitForTimeout(30);
          assert.equal(await page.locator('[data-tool=general]').textContent(),lang==='en'?'Customization':lang==='es'?'Personalización general':'Customização geral');
          assert.equal(await page.locator('#source-select-left').inputValue(),'auto');
          assert.equal(await page.locator('#search-left').getAttribute('placeholder'),await page.evaluate(l=>ThumbI18n.t(ThumbProviders[document.body.dataset.game].placeholder,l),lang));
          assert.equal(await page.locator('#layout-preset option[value=layout23]').textContent(),lang==='en'?'23. Centered card':lang==='es'?'23. Carta central':'23. Carta central');
          assert.equal(await page.locator('#file-left').getAttribute('aria-label'),lang==='en'?'Choose left card':lang==='es'?'Elegir carta izquierda':'Escolher carta da esquerda');
        }
      }
      await page.goto(base+'/#digimon');await page.waitForFunction(()=>document.body.dataset.game==='digimon');
      await page.evaluate(async()=>{const c=document.createElement('canvas');c.width=400;c.height=560;const g=c.getContext('2d');g.fillStyle='#348a5e';g.fillRect(0,0,400,560);g.fillStyle='white';g.fillRect(20,20,100,90);const blob=await new Promise(r=>c.toBlob(r));for(const side of ['left','right'])await ThumbEngine.loadFile(side,new File([blob],'Brilho',{type:'image/png'}));const input=document.getElementById('input-left-deck');input.value='Verde';input.dispatchEvent(new Event('input',{bubbles:true}));ThumbInteractions.commit();});
      const before=await page.evaluate(()=>ThumbStudio.snapshot());
      async function png(){const event=page.waitForEvent('download');await page.click('#export');const bytes=await fs.readFile(await(await event).path());assert.equal(bytes.readUInt32BE(16),1280);return bytes;}
      const originalPNG=await png();
      for(const lang of ['en','es','pt-BR']){await page.selectOption('#site-language',lang);assert.deepEqual(await page.evaluate(()=>ThumbStudio.snapshot()),before,'language must not mutate the project');assert.equal(await page.locator('#text-left-deck').textContent(),'VERDE');assert.equal(await page.locator('#file-name-left').textContent(),'Brilho');assert.deepEqual(await png(),originalPNG,'language must not change exported artwork');}
      await page.selectOption('#site-language','es');
      await page.fill('#search-left','a');await page.click('#search-button-left');await page.waitForFunction(()=>document.getElementById('search-status-left').textContent==='Escribe al menos 2 caracteres.');
      await page.evaluate(()=>{ThumbProviders.digimon.search=async()=>({cards:[{name:'Verde',id:'test',detail:'Brilho',image:''}],next:null,source:'Catálogo local · 2026-10-15',warning:'Algumas coleções não responderam. Estes resultados são parciais.'});});
      await page.fill('#search-left','Verde');await page.click('#search-button-left');await page.waitForSelector('.result-card');assert.equal(await page.locator('.result-card strong').textContent(),'Verde');assert.equal(await page.locator('.result-card span').textContent(),'Brilho');assert.equal(await page.locator('.result-card button').textContent(),'Usar datos');assert.match(await page.locator('#search-status-left').textContent(),/1 de 1 resultados\. Origen: Catálogo local/);
      await page.selectOption('#site-language','en');await page.waitForFunction(()=>document.getElementById('search-status-left').textContent.includes('1 of 1 results. Source: Local catalog'));assert.match(await page.locator('#search-status-left').textContent(),/Some sets did not respond/);
      await page.click('.result-card button');await page.waitForFunction(()=>document.getElementById('search-status-left').textContent.startsWith('Image unavailable'));
      await page.setInputFiles('#open-project',{name:'broken.json',mimeType:'application/json',buffer:Buffer.from('{bad json')});await page.waitForFunction(()=>document.getElementById('status').textContent==='Could not open this project.');
      await page.click('[data-tool=layouts]');await page.selectOption('#layout-preset','layout23');await page.waitForFunction(()=>document.getElementById('status').textContent.startsWith('Layout applied: Centered card.'));
      await page.click('[data-tool=general]');await page.selectOption('#site-language','es');
      const event=page.waitForEvent('download');await page.click('#save-project');const project=await event;await page.setInputFiles('#open-project',await project.path());await page.waitForFunction(()=>document.getElementById('status').textContent==='Proyecto restaurado. Continúa editando.');assert.equal(await page.locator('#input-left-deck').inputValue(),'Verde');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);
      await page.screenshot({path:'/tmp/i18n-'+(mobile?'mobile':'desktop')+'.png',fullPage:true});await context.close();console.log('PASS i18n '+(mobile?'mobile':'desktop')+': three languages, six games, reload, accessibility, errors/search, protected card data, project roundtrip and identical PNG');
    }
    // Denied localStorage must not prevent the editor or selector from working.
    const context=await browser.newContext();await context.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Denied','SecurityError');}});});const page=await context.newPage();await page.goto((process.env.BASE_URL||'http://localhost:8778')+'/#digimon');await page.waitForFunction(()=>!!window.ThumbI18n);await page.selectOption('#site-language','es');assert.equal(await page.locator('html').getAttribute('lang'),'es');await context.close();console.log('PASS i18n storage fallback');
  }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
