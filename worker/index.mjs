// Private-to-this-site image cache. Never accepts arbitrary upstream hosts.
const MAX=8*1024*1024;
export function allowedImage(value){
 try{
  const u=new URL(value);
  if(u.protocol!=='https:'||u.username||u.password||u.port||u.search||u.hash)return false;
  return (u.hostname==='web-garage.takaotaku.de'&&/^\/[A-Za-z0-9_-]+\.webp$/.test(u.pathname))||
   (u.hostname==='optcgapi.com'&&/^\/media\/static\/Card_Images\/[A-Za-z0-9_.()-]+\.(jpg|jpeg|png|webp)$/i.test(u.pathname));
 }catch{return false;}
}
export default {async fetch(request,env,ctx){
 const origin=env.ALLOWED_ORIGIN||'https://bakurinha.github.io';
 const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, OPTIONS','X-ThumbTCG-Version':'2026-10-14.1','Vary':'Origin','X-Content-Type-Options':'nosniff'};
 const error=(message,status)=>new Response(message,{status,headers});
 if(request.headers.get('Origin')&&request.headers.get('Origin')!==origin)return error('Origin not allowed',403);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(request.method!=='GET')return error('Method not allowed',405);
 const url=new URL(request.url);
 if(url.pathname==='/health')return new Response('ok',{headers});
 if(url.pathname!=='/image')return error('Not found',404);
 const source=url.searchParams.get('url');if(!allowedImage(source))return error('Image source not allowed',400);
 const cacheKey=new Request(`${url.origin}/image?${new URLSearchParams({url:source})}`);
 const cached=await caches.default.match(cacheKey);if(cached)return cached;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{
  const upstream=await fetch(source,{redirect:'error',signal:controller.signal,headers:{Accept:'image/webp,image/png,image/jpeg'}});
  if(!upstream.ok)return error(`Image source returned HTTP ${upstream.status}`,502);
  const type=(upstream.headers.get('content-type')||'').split(';')[0];
  if(!/^image\/(png|jpeg|webp)$/i.test(type))return error('Invalid image',502);
  if(Number(upstream.headers.get('content-length'))>MAX)return error('Image too large',413);
  const reader=upstream.body.getReader(),chunks=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX){await reader.cancel();return error('Image too large',413);}chunks.push(value);}
  const response=new Response(new Blob(chunks,{type}),{headers:{...headers,'Content-Type':type,'Cache-Control':'public, max-age=604800'}});
  ctx.waitUntil(caches.default.put(cacheKey,response.clone()));return response;
 }catch(e){return error(e?.name==='AbortError'?'Image source timed out':'Image source connection failed',502);}finally{clearTimeout(timer);}
}};
