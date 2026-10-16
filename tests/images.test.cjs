/** Regression tests: images.test.cjs. Preserve fixture inputs, expected values and assertions. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
function client(fetch,config={}){
  const window={ThumbConfig:config};
  vm.runInNewContext(readFileSync(require('node:path').join(__dirname,'../images.js'),'utf8'),{window,fetch,URL,Blob,AbortController,setTimeout,clearTimeout});
  return window.ThumbImages;
}
test('direct image, concurrent deduplication and cache',async()=>{
  let calls=0;const images=client(async()=>{calls++;return new Response('png',{headers:{'Content-Type':'image/png'}});});
  const [a,b]=await Promise.all([images.load('https://cards.scryfall.io/test.png'),images.load('https://cards.scryfall.io/test.png')]);
  assert.equal(a,b);assert.equal(a.type,'image/png');await images.load('https://cards.scryfall.io/test.png');assert.equal(calls,1);
});
test('restricted sources need service, and use configured URL',async()=>{
  const source='https://web-garage.takaotaku.de/BT11-017.webp';
  await assert.rejects(client(()=>{throw Error('must not fetch');}).load(source),e=>e.code==='SERVICE_REQUIRED');
  let called;const images=client(async u=>{called=new URL(u);return new Response('image',{headers:{'Content-Type':'image/webp'}});},{imageService:'https://example.workers.dev'});
  await images.load(source);assert.equal(called.origin,'https://example.workers.dev');assert.equal(called.searchParams.get('url'),source);
});
test('reject invalid content, oversize and failures; failed download can retry',async()=>{
  let count=0;const images=client(async()=>{count++;return count===1?new Response('error',{status:502}):new Response('png',{headers:{'Content-Type':'image/png'}});});
  await assert.rejects(images.load('https://example.com/test'));await images.load('https://example.com/test');assert.equal(count,2);
  await assert.rejects(client(async()=>new Response('html',{headers:{'Content-Type':'text/html'}})).load('https://example.com/test'));
  await assert.rejects(client(async()=>new Response('x',{headers:{'Content-Type':'image/png','Content-Length':9*1024*1024}})).load('https://example.com/test'));
});
test('Lorcana AVIF uses the restricted image service',async()=>{
  const source='https://cards.lorcast.io/card/digital/large/crd_d66016477d454f19abf12684a50221ef.avif?1770260175';let called;
  const images=client(async u=>{called=new URL(u);return new Response('avif',{headers:{'Content-Type':'image/avif'}});},{imageService:'https://example.workers.dev'});
  assert.equal((await images.load(source)).type,'image/avif');assert.equal(called.searchParams.get('url'),source);
});
