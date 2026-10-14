const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom'),fs=require('node:fs'),path=require('node:path');
test('Pokémon languages, missing art and pagination; Lorcana fallback, landscape and cancellation',async()=>{
 const dom=new JSDOM('',{runScripts:'outside-only'}),w=dom.window;const calls=[];let mode='pokemon';
 w.fetch=async url=>{calls.push(String(url));let data;
 if(String(url).startsWith('data/'))data={updated:'2026-10-14',cards:[{name:'Élsa — Queen',id:'1',detail:'1 / 1',color:'Sapphire',image:'https://cards.lorcast.io/test.avif',layout:'landscape'}]};
 else if(mode==='fail')throw Error('offline');
 else if(mode==='lorcana')data={results:[{name:'Castle',id:'2',ink:'Ruby',layout:'landscape',image_uris:{digital:{large:'https://cards.lorcast.io/test.avif',small:'https://cards.lorcast.io/small.avif'}}}]};
 else data=Array.from({length:mode==='page'?100:2},(_,i)=>({name:'Pikachu',id:'base1-'+i,...(i?{}:{image:'https://assets.tcgdex.net/en/base/base1/58'})}));
 return {ok:true,json:async()=>data};};
 w.eval(fs.readFileSync(path.join(__dirname,'../providers.js'),'utf8'));
 try{
  let r=await w.ThumbProviders.pokemon.search('Pikachu',null,undefined,'tcgdex-pt');assert.match(calls.at(-1),/v2\/pt\/cards/);assert.match(r.cards[0].image,/high.webp$/);assert.equal(r.cards[1].image,'');
  mode='page';r=await w.ThumbProviders.pokemon.search('Eevee',1);assert.equal(r.next,2);await w.ThumbProviders.pokemon.search('Eevee',2);assert.match(calls.at(-1),/pagination%3Apage=2/);
  mode='lorcana';r=await w.ThumbProviders.lorcana.search('Castle');assert.equal(r.cards[0].layout,'landscape');assert.equal(r.cards[0].color,'red');
  mode='fail';r=await w.ThumbProviders.lorcana.search('elsa');assert.equal(r.cards.length,1);assert.match(r.warning,/catálogo local/);
  await assert.rejects(()=>w.ThumbProviders.lorcana.search('Stitch',null,undefined,'lorcast'),/offline/);
  const abort=new w.AbortController();abort.abort();await assert.rejects(()=>w.ThumbProviders.lorcana.search('Mickey',null,abort.signal),{name:'AbortError'});
 }finally{w.close();}
});
