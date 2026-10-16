/** Regression tests for themes.cjs; retain assertions and fixture semantics. */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-gpu']});try{
    for(const mobile of [false,true]){
      const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile,acceptDownloads:true});const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.BASE_URL||'http://localhost:8776');
      assert.equal(await page.locator('.game-card').count(),6);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      for(const game of ['digimon','yugioh','magic','onepiece','pokemon','lorcana']){
        await page.goto((process.env.BASE_URL||'http://localhost:8776')+'/#'+game);await page.waitForFunction(g=>document.body.dataset.game===g,game);await page.waitForSelector('.theme-preset',{state:'attached'});if(await page.locator('[data-tool=themes]').getAttribute('aria-expanded')==='false')await page.click('[data-tool=themes]');
        const count=game==='digimon'?18:10;assert.equal(await page.locator('.theme-preset').count(),count);
        await page.evaluate(async()=>{const blob=await (await fetch('assets/home/pokemon.webp')).blob();for(const side of ['left','right'])await ThumbEngine.loadFile(side,new File([blob],'card.webp',{type:'image/webp'}));ThumbInteractions.commit();});
        const before=await page.evaluate(()=>{const s=ThumbFX.getState();s.cards.left.glow=true;ThumbFX.setState(s);const a=ThumbAdvanced.getState();a.brightness=1.4;ThumbAdvanced.setState(a);return ThumbStudio.snapshot();});
        for(let i=0;i<count;i++){await page.locator('.theme-preset').nth(i).click();assert.equal(await page.evaluate(()=>document.getElementById('theme-background').children.length>0),true);
          if(!mobile){const e=page.waitForEvent('download');await page.click('#export');const bytes=await fs.readFile(await(await e).path());assert.equal(bytes.readUInt32BE(16),1280);assert.ok(bytes.length>15000);}
        }
        const names=await page.locator('.theme-preset span').allTextContents();
        assert.equal(new Set(await page.locator('.theme-preset').evaluateAll(els=>els.map(e=>e.dataset.theme))).size,count);
        for(const lang of ['en','es','pt-BR']){await page.selectOption('#site-language',lang);for(let n=0;n<count;n++)assert.equal(await page.locator('.theme-preset span').nth(n).textContent(),await page.evaluate(([name,l])=>ThumbI18n.t(name,l),[names[n],lang]));}
        // All older theme IDs remain restorable with their saved settings.
        for(let n=0;n<3;n++){const id=await page.locator('.theme-preset').nth(n).getAttribute('data-theme');await page.evaluate(id=>ThumbThemes.setState({id,intensity:37,frame:false}),id);assert.deepEqual(await page.evaluate(()=>ThumbThemes.getState()),{id,intensity:37,frame:false});}
        await page.locator('.theme-preset').last().click();
        const themed=await page.evaluate(()=>ThumbStudio.snapshot());assert.deepEqual(themed.fx,before.fx);assert.deepEqual(themed.advanced,before.advanced);assert.deepEqual(themed.art,before.art);assert.deepEqual(themed.elements,before.elements);
        await page.click('#theme-clear');assert.equal(await page.evaluate(()=>ThumbThemes.getState().id),'');await page.evaluate(()=>ThumbInteractions.undo());await page.waitForFunction(()=>!!ThumbThemes.getState().id);
        await page.evaluate(async s=>{await ThumbStudio.restore(s);},themed);assert.deepEqual(await page.evaluate(()=>ThumbThemes.getState()),themed.appearance);
        const event=page.waitForEvent('download');await page.click('#export');const d=await event;const bytes=await fs.readFile(await d.path());assert.equal(bytes.readUInt32BE(16),1280);assert.ok(bytes.length>15000);
        // Optional layers migrate when opening projects from before themes existed.
        await page.evaluate(async()=>{const s=ThumbStudio.snapshot();delete s.appearance;s.advanced.order=s.advanced.order.filter(x=>!x.startsWith('theme-'));ThumbAdvanced.validateState(s.advanced);await ThumbStudio.restore(s);});
        assert.equal(await page.evaluate(()=>ThumbThemes.getState().id),'');assert.equal(await page.evaluate(()=>ThumbAdvanced.getState().order.filter(x=>x.startsWith('theme-')).length),2);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      }
      await page.locator('.theme-preset').first().click();const event=page.waitForEvent('download');await page.click('#save-project');const download=await event;await page.click('#theme-clear');await page.setInputFiles('#open-project',await download.path());await page.waitForFunction(()=>document.getElementById('status').textContent.includes('restaurado'));assert.equal(await page.evaluate(()=>ThumbThemes.getState().id),'ink');
      await page.screenshot({path:`/tmp/tcg-themes-${mobile?'mobile':'desktop'}.png`,fullPage:true});assert.deepEqual(errors,[]);await ctx.close();console.log('PASS themes '+(mobile?'mobile':'desktop')+': six games, 60 themes, state preservation, undo, JSON, PNG, legacy migration, no overflow');
    }
  }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
