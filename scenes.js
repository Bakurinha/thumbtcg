/**
 * Built-in scene assets are separate from editable cards and imported layers.
 * Maintenance: preserve project JSON compatibility and the existing rendering contract.
 */
(()=>{
  'use strict';
  const svg=document.getElementById('thumb'),engine=window.ThumbEngine,ns=svg.namespaceURI;
  const scene=document.createElementNS(ns,'image');
  for(const[k,v]of Object.entries({id:'red-moon-background',x:0,y:0,width:1280,height:720,preserveAspectRatio:'xMidYMid slice','data-composition-base':'true'}))scene.setAttribute(k,v);
  window.ThumbAdvanced.registerLayer('red-moon-background','Cenário: lua vermelha',scene,'advanced-background');
  const style=document.createElementNS(ns,'style');style.textContent='.red-moon-scene:not(.image-theme) [data-composition-base="true"]:not(#red-moon-background){display:none!important}';svg.querySelector('defs').append(style);
  let pending=null,wasMoon=false;
  const active=()=>engine.layoutExtra()?.kind==='bloodMoon'&&document.body.dataset.game==='digimon';
  function ready(){
    if(!active())return Promise.resolve();
    if(scene.getAttribute('href'))return Promise.resolve();
    if(!pending){pending=(async()=>{
        const response=await fetch('assets/layouts/digimon-red-moon.webp');if(!response.ok)throw Error('scene');
        const blob=await response.blob();const data=await new Promise((ok,fail)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=fail;r.readAsDataURL(blob);});
        const probe=new Image();probe.src=data;await probe.decode();scene.setAttribute('href',data);
      })().catch(()=>{throw Error(window.ThumbI18n?.t('Não foi possível carregar o cenário. Selecione o layout novamente para tentar outra vez.')||'Não foi possível carregar o cenário. Selecione o layout novamente para tentar outra vez.');}).finally(()=>{pending=null;});}
    return pending;
  }
  function filter(){
    const type=document.getElementById('layout-category')?.value||'all';
    for(const c of engine.layouts()){
      const allowed=engine.isLayoutAvailable(c.id);
      const button=document.querySelector(`[data-layout="${c.id}"]`);if(button)button.hidden=!allowed||(type!=='all'&&(type==='solo')!==c.solo);
      for(const option of document.querySelectorAll(`#layout-preset option[value="${c.id}"], [id^="composition-part-"] option[value="${c.id}"]`)){option.hidden=!allowed;option.disabled=!allowed;}
    }
  }
  /** Update scene decorations while retaining card visibility and placement. */
  function sync(preset=false){
    const on=active();svg.classList.toggle('red-moon-scene',on);scene.style.display=on?'':'none';filter();
    if(preset&&(on||wasMoon)){
      const c=window.ThumbComposition.getState(),fx=window.ThumbFX.getState();
      for(const side of ['left','right']){
        Object.assign(c.images[side],{rotation:on?(side==='left'?-7:7):0,flipX:false,flipY:false});
        if(on)Object.assign(fx.cards[side],{transform:false,mask:'none',reflection:false,glow:true,glowColor:side==='left'?'#ff4545':'#c76cff',glowBlur:10,glowSpread:2,glowOpacity:.9,shadow:true});
        else{fx.cards[side].glow=false;fx.cards[side].shadow=false;}
      }
      if(on){fx.fan=false;fx.split=false;}
      window.ThumbComposition.setState(c);window.ThumbFX.setState(fx);
    }
    wasMoon=on;
    if(on)ready().catch(e=>{if(active())document.getElementById('status').textContent=e.message;});
  }
  window.addEventListener('thumb:layout',()=>sync(true));
  window.addEventListener('thumb:ready',()=>sync());
  new MutationObserver(()=>sync()).observe(document.body,{attributes:true,attributeFilter:['data-game']});
  window.ThumbScenes={ready};sync();
})();
