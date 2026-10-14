(()=>{
'use strict';
const cache=new Map(),pending=new Map();let bytes=0;
const MAX_IMAGE=8*1024*1024,MAX_CACHE=24*1024*1024;
function imageURL(source){
 const url=new URL(source);
 if(url.protocol!=='https:')throw new Error('URL inválida');
 if(['web-garage.takaotaku.de','optcgapi.com','cards.lorcast.io'].includes(url.hostname)){
  const base=window.ThumbConfig?.imageService;
  if(!base){const error=new Error('Serviço de imagens não configurado');error.code='SERVICE_REQUIRED';throw error;}
  const endpoint=new URL('/image',base);if(endpoint.protocol!=='https:')throw new Error('Serviço inválido');
  endpoint.searchParams.set('url',url.href);return endpoint.href;
 }
 return url.href;
}
async function download(source){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 try{
  const response=await fetch(imageURL(source),{signal:controller.signal,credentials:'omit'});
  if(!response.ok)throw new Error(`Imagem indisponível (${response.status})`);
  if(Number(response.headers.get('content-length'))>MAX_IMAGE)throw new Error('Imagem muito grande');
  if(!/^image\/(png|jpeg|webp|avif)$/i.test((response.headers.get('content-type')||'').split(';')[0]))throw new Error('Formato inválido');
  const reader=response.body.getReader(),chunks=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_IMAGE){await reader.cancel();throw new Error('Imagem muito grande');}chunks.push(value);}
  const blob=new Blob(chunks,{type:response.headers.get('content-type').split(';')[0]});
  while(bytes+blob.size>MAX_CACHE&&cache.size){const key=cache.keys().next().value;bytes-=cache.get(key).size;cache.delete(key);}
  cache.set(source,blob);bytes+=blob.size;return blob;
 }finally{clearTimeout(timer);}
}
window.ThumbImages={load(source){
 if(cache.has(source))return Promise.resolve(cache.get(source));
 if(pending.has(source))return pending.get(source);
 const job=download(source).finally(()=>pending.delete(source));pending.set(source,job);return job;
}};
})();
