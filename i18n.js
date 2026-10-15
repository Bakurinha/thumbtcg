/* UI-only localization. Project values, official card data and artwork are never translated. */
(()=>{
'use strict';
const catalog=window.ThumbLocales,selector=document.getElementById('site-language');
const supported=['pt-BR','en','es'],storageKey='thumbtcg.language';
let language='pt-BR';try{const saved=localStorage.getItem(storageKey);if(supported.includes(saved))language=saved;}catch{/* Storage is optional. */}
const textRecords=new WeakMap(),attributeRecords=new WeakMap();
const attrs=['aria-label','title','placeholder','alt','content'];
const reverse=new Map();for(const[source,values]of Object.entries(catalog))for(const value of values)if(!reverse.has(value))reverse.set(value,source);
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const patterns=Object.keys(catalog).filter(s=>s.includes('{0}')).sort((a,b)=>b.replace(/\{\d+\}/g,'').length-a.replace(/\{\d+\}/g,'').length).map(source=>{
 const indices=[];let last=0,expression='';for(const m of source.matchAll(/\{(\d+)\}/g)){expression+=escape(source.slice(last,m.index)).replace(/ $/,'\\s*')+'(.*?)';indices.push(Number(m[1]));last=m.index+m[0].length;}expression+=escape(source.slice(last));return {source,indices,regex:new RegExp('^'+expression+'$','s')};
});
function t(value,lang=language,depth=0){
 if(typeof value!=='string'||!supported.includes(lang)||lang==='pt-BR'||depth>6)return value;
 const key=value.trim(),slot=lang==='en'?0:1;let translated;
 if(Object.hasOwn(catalog,key))translated=catalog[key][slot];
 else{
  const numbered=key.match(/^(\d+\. )(.+)$/);if(numbered&&Object.hasOwn(catalog,numbered[2]))translated=numbered[1]+t(numbered[2],lang,depth+1);
  if(translated===undefined)for(const p of patterns){const match=key.match(p.regex);if(!match)continue;const args={};p.indices.forEach((n,i)=>{args[n]=t(match[i+1],lang,depth+1);});translated=catalog[p.source][slot].replace(/\{(\d+)\}/g,(_,n)=>args[n]??'');break;}
  // Quality reports can contain one sentence for each card.
  if(translated===undefined&&key.includes('. ')){const parts=key.match(/[^]+?\.(?: |$)/g);if(parts&&parts.join('')===key&&parts.every(p=>Object.hasOwn(catalog,p.trim())))translated=parts.map(p=>t(p,lang,depth+1)).join('');}
 }
 if(translated===undefined)return value;
 return value.slice(0,value.indexOf(key))+translated+value.slice(value.indexOf(key)+key.length);
}
function ignored(el){
 if(!el||el.closest('script,style,textarea,[contenteditable],[data-i18n-ignore],.result-card strong,.result-card span,.result-card img'))return true;
 if(el.closest('svg')&&!el.closest('[id$="placeholder-text-main"],[id$="placeholder-text-sub"]'))return true;
 const file=el.closest('[id^="file-name-"]');if(file&&window.ThumbEngine.uploaded[file.id.endsWith('left')?'left':'right'])return true;
 return false;
}
function translateText(node){
 if(ignored(node.parentElement)||!node.data.trim())return;
 const previous=textRecords.get(node),value=node.data;
 const source=previous&&value===previous.rendered?previous.source:(Object.hasOwn(catalog,value.trim())?value:reverse.has(value.trim())?value.replace(value.trim(),reverse.get(value.trim())):value);
 const rendered=t(source);textRecords.set(node,{source,rendered});if(value!==rendered)node.data=rendered;
}
function translateAttributes(el,guide=false){
 if(!guide&&ignored(el))return;
 let records=attributeRecords.get(el);if(!records){records={};attributeRecords.set(el,records);}
 for(const key of attrs){if(!el.hasAttribute(key)||key==='content'&&!el.matches('meta[name="description"]'))continue;
 const value=el.getAttribute(key),previous=records[key],source=previous&&value===previous.rendered?previous.source:value,rendered=t(source);records[key]={source,rendered};if(value!==rendered)el.setAttribute(key,rendered);
 }
}
function visit(root){
 if(root.nodeType===3){translateText(root);return;}if(root.nodeType!==1&&root.nodeType!==9)return;
 if(root.nodeType===1){if(ignored(root)&&!root.matches('svg'))return;translateAttributes(root);}
 // Option labels may change; their machine values must not.
 if(root.matches?.('option')&&!root.hasAttribute('value'))root.value=root.textContent;
 for(const child of root.childNodes)visit(child);
}
// The canvas is user content except for empty-card guides.
function guides(){for(const el of document.querySelectorAll('svg [aria-label]'))translateAttributes(el,true);for(const el of document.querySelectorAll('[id$="placeholder-text-main"],[id$="placeholder-text-sub"]'))for(const n of el.childNodes)translateText(n);}
const observer=new MutationObserver(records=>{
 const roots=new Set();for(const r of records){if(r.type==='attributes'){translateAttributes(r.target);continue;}if(r.type==='characterData')roots.add(r.target);else for(const n of r.addedNodes)roots.add(n);}
 for(const root of roots)if(root.isConnected)visit(root);
});
function observe(){observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attrs});}
function setLanguage(next,persist=true){
 if(!supported.includes(next))return false;
 observer.disconnect();language=next;document.documentElement.lang=next;selector.value=next;visit(document.documentElement);guides();observe();
 if(persist)try{localStorage.setItem(storageKey,next);}catch{/* Private/restricted browsers still work. */}
 window.dispatchEvent(new CustomEvent('thumb:language',{detail:next}));return true;
}
selector.addEventListener('change',()=>setLanguage(selector.value));
// Avoid browser-language-dependent native file button captions in the advanced panels.
for(const input of document.querySelectorAll('#composition-upload,#wallpaper-upload,#extra-upload,[id^="fx-upload-"][type="file"]')){
 const button=document.createElement('button');button.type='button';button.className='studio-btn localized-upload';button.textContent='Escolher arquivo';button.setAttribute('aria-controls',input.id);button.onclick=()=>input.click();input.classList.add('localized-file-input');input.tabIndex=-1;input.after(button);
}
function errorText(error,fallback='Não foi possível processar o arquivo. Verifique o formato e tente novamente.'){
 const message=String(error?.message||'');return Object.hasOwn(catalog,message)||t(message,'en')!==message?message:fallback;
}
window.ThumbI18n={t,errorText,setLanguage,getLanguage:()=>language,refresh(){visit(document.documentElement);guides();}};
setLanguage(language,false);
})();
