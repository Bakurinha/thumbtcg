import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker,{allowedImage} from '../worker/index.mjs';
const source='https://web-garage.takaotaku.de/BT11-017.webp';
const request=(url=source,origin='https://bakurinha.github.io')=>new Request(`https://test.workers.dev/image?${new URLSearchParams({url})}`,{headers:{Origin:origin}});
test('allowlist rejects arbitrary URLs, credentials, queries and unsafe paths',()=>{
 assert.ok(allowedImage(source));assert.ok(allowedImage('https://optcgapi.com/media/static/Card_Images/OP01-024.jpg'));
 for(const url of ['http://localhost/test.png','https://evil.com/test.png',source+'?x=1','https://user:password@web-garage.takaotaku.de/test.webp','https://web-garage.takaotaku.de/other/test.webp'])assert.equal(allowedImage(url),false);
});
test('worker imports, caches and rejects bad origin/content/size/redirect failures',async()=>{
 const oldFetch=globalThis.fetch;const map=new Map();let calls=0,mode='ok';
 globalThis.caches={default:{match:async r=>map.get(r.url)?.clone(),put:async(r,response)=>map.set(r.url,response)}};
 globalThis.fetch=async(u,opts)=>{calls++;assert.equal(opts.redirect,'manual');if(mode==='network')throw Error('network');if(mode==='redirect')return new Response(null,{status:302,headers:{Location:'https://evil.com/test.webp'}});return new Response('image',{headers:{'Content-Type':mode==='html'?'text/html':'image/webp',...(mode==='large'?{'Content-Length':9*1024*1024}:{})}});};
 const pending=[],ctx={waitUntil:p=>pending.push(p)};
 try{
  let r=await worker.fetch(request(),{},ctx);assert.equal(r.status,200);assert.equal(r.headers.get('Access-Control-Allow-Origin'),'https://bakurinha.github.io');await Promise.all(pending);
  r=await worker.fetch(request(),{},ctx);assert.equal(r.status,200);assert.equal(calls,1);
  assert.equal((await worker.fetch(request(source,'https://evil.com'),{},ctx)).status,403);
  assert.equal((await worker.fetch(request('https://evil.com/test.png'),{},ctx)).status,400);
  for(const [m,status] of [['html',502],['large',413],['redirect',502],['network',502]]){map.clear();mode=m;assert.equal((await worker.fetch(request(),{},ctx)).status,status);}
 }finally{globalThis.fetch=oldFetch;delete globalThis.caches;}
});
test('Lorcana permits only actual CDN image paths and numeric cache stamps',()=>{
 const url='https://cards.lorcast.io/card/digital/large/crd_d66016477d454f19abf12684a50221ef.avif';
 assert.ok(allowedImage(url));assert.ok(allowedImage(url+'?1770260175'));
 for(const bad of [url+'?redirect=https://evil.com',url.replace('/digital/','/private/'),url.replace('cards.lorcast.io','cards.lorcast.io.evil.com')])assert.equal(allowedImage(bad),false);
});
