/** Regression tests for studio.test.cjs; retain assertions and fixture semantics. */
const {JSDOM}=require('jsdom');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://example.com/thumbtcg/',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window;
w.structuredClone=structuredClone;w.scrollTo=()=>{};
w.SVGElement.prototype.getComputedTextLength=function(){return this.textContent.length*12;};
w.fetch=async()=>{throw new Error('Network must be mocked in unit tests');};
for(const name of ['config.js','images.js','editor.js','providers.js','studio.js'])w.eval(fs.readFileSync(path.join(root,name),'utf8'));
const $=id=>w.document.getElementById(id),tick=()=>new Promise(r=>setTimeout(r,20));
async function route(game){w.location.hash=game;await tick();}
(async()=>{
  assert.equal($('welcome').hidden,false);assert.equal($('editor').hidden,true);
  for(const game of ['digimon','yugioh','magic','onepiece','pokemon','lorcana']){
    await route(game);assert.equal($('welcome').hidden,true);assert.equal(w.document.body.dataset.game,game);
    assert.equal(w.document.querySelectorAll('.layout-card').length,29);
    assert.equal($('theme-left').options.length,['digimon','pokemon'].includes(game)?8:game==='yugioh'?11:7);
    assert.ok($('top-ribbon-input').value.toLowerCase().includes(game==='pokemon'?'pokémon':game==='onepiece'?'one piece':game==='yugioh'?'yu-gi-oh':game));
    $('input-left-deck').value=game+' saved';$('input-left-deck').dispatchEvent(new w.Event('input'));
    $('x-left').value=70;$('x-left').dispatchEvent(new w.Event('input'));assert.match($('art-left').getAttribute('transform'),/translate\(70 0\)/);
  }
  await route('digimon');assert.equal($('input-left-deck').value,'digimon saved');assert.equal($('x-left').value,'70');
  $('reset-left').click();assert.equal($('x-left').value,'0');
  $('move-art').click();assert.equal($('move-art').getAttribute('aria-pressed'),'true');
  w.document.querySelector('[data-panel=custom]').click();assert.equal(w.document.querySelector('.layout-toolbar').hidden,true);
  $('center-label').value='VERSUS';$('center-label').dispatchEvent(new w.Event('input'));assert.equal($('text-versus').textContent,'VERSUS');
  $('toggle-vs').checked=false;$('toggle-vs').dispatchEvent(new w.Event('change'));assert.equal($('text-versus').style.display,'none');
  // Names returned by providers must stay text, not markup.
  w.ThumbProviders.digimon.search=async()=>({cards:[{name:'<img onerror=alert(1)>',id:'BT11-017',detail:'BT11-017',color:'red',image:'',url:'https://digimoncard.io/'}],next:null});
  $('search-left').value='marsmon';$('search-left').closest('form').dispatchEvent(new w.Event('submit',{cancelable:true}));await tick();
  assert.equal($('results-left').querySelectorAll('img').length,0);assert.equal($('results-left').querySelector('strong').textContent,'<img onerror=alert(1)>');
  $('results-left').querySelector('button').click();assert.equal($('input-left-detail').value,'BT11-017');assert.equal(w.ThumbEngine.uploaded.left,false);
  // Adapter uses correct game endpoint and expands alternate artworks.
  w.fetch=async url=>({ok:true,status:200,json:async()=>String(url).startsWith('data/')?{'42':[['1','artworks-en-n/main/0/0/42_1.png','EN'],['2','artworks-en-n/main/0/0/42_2.png','EN']]}:({data:[{misc_info:[{konami_id:42}],id:1,name:'Test',type:'Fusion Monster',frameType:'fusion',card_images:[{id:1},{id:2}],ygoprodeck_url:'https://ygoprodeck.com/card/test'}],meta:{pages_remaining:1}})});
  const ygo=await w.ThumbProviders.yugioh.search('Test',0);assert.equal(ygo.cards.length,2);assert.equal(ygo.next,100);assert.equal(ygo.cards[0].color,'fusion');assert.match(ygo.cards[0].image,/raw.githubusercontent.com/);assert.notEqual(ygo.cards[0].image,ygo.cards[1].image);
  // Failed image import preserves the existing card details.
  w.ThumbProviders.digimon.search=async()=>({cards:[{name:'Replacement',id:'X',image:'https://web-garage.takaotaku.de/BT11-017.webp'}],next:null});
  $('search-left').closest('form').dispatchEvent(new w.Event('submit',{cancelable:true}));await tick();
  const prior=$('input-left-digimon').value;$('results-left').querySelector('button').click();await tick();
  assert.equal($('input-left-digimon').value,prior);assert.match($('search-status-left').textContent,/envie o arquivo/);
  // Successful image import applies names only after the engine accepts the image.
  w.ThumbImages.load=async()=>new w.Blob(['test'],{type:'image/png'});w.ThumbEngine.loadFile=async()=>true;
  $('results-left').querySelector('button').click();await tick();assert.equal($('input-left-digimon').value,'Replacement');
  await route('');assert.equal($('welcome').hidden,false);
  console.log('PASS: 6 games, 29 layouts, game drafts, positioning, controls, safe search results, metadata selection and adapter pagination.');
  w.close();
})().catch(e=>{console.error(e);w.close();process.exitCode=1;});
