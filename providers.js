/**
 * TCG data-provider adapters normalize external card results into a shared shape.
 * Maintenance: keep imported content and saved projects backward compatible.
 */
(()=>{
  'use strict';
  const cache=new Map();let nextRequest=0;
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  async function json(url,signal){
    const hit=cache.get(url);if(hit&&Date.now()-hit.at<86400000)return hit.data;
    const slot=Math.max(Date.now(),nextRequest);nextRequest=slot+850;await sleep(slot-Date.now());
    if(signal?.aborted)throw new DOMException('Cancelado','AbortError');
    const timeout=new AbortController(),id=setTimeout(()=>timeout.abort(),20000);
    const abort=()=>timeout.abort();signal?.addEventListener('abort',abort,{once:true});
    try{
      const response=await fetch(url,{signal:timeout.signal,headers:{Accept:'application/json'}});
      const data=await response.json();
      if(response.status===429)throw new Error('A base atingiu seu limite de consultas. Aguarde antes de tentar novamente.');
      if(!response.ok){if((response.status===400||response.status===404)&&/no cards|not found|could not find|no results/i.test(data.error||data.details||''))return {data:[]};throw new Error(data.details||data.error||`Base indisponível (${response.status}).`);}
      cache.set(url,{at:Date.now(),data});if(cache.size>40)cache.delete(cache.keys().next().value);return data;
    }finally{clearTimeout(id);signal?.removeEventListener('abort',abort);}
  }
  const safeURL=value=>{try{const u=new URL(value);return u.protocol==='https:'?u.href:'';}catch{return '';}};
  const configs={
    digimon:{label:'Digimon Card App',link:'https://github.com/TakaOtaku/Digimon-Card-App',note:'Busque por nome ou código para ver as cartas e artes alternativas.',placeholder:'Ex.: Marsmon ou BT11-017',async search(query,page,signal){
        const data=await json('data/digimon-images.json',signal),term=query.trim().toLowerCase();
        return {cards:data.filter(c=>`${c.name} ${c.number} ${c.id}`.toLowerCase().includes(term)).map(c=>{
            const image=`https://web-garage.takaotaku.de/${encodeURIComponent(c.file)}`;
            return {name:c.name,id:c.id,detail:c.id,color:String(Array.isArray(c.color)?c.color[0]:c.color).toLowerCase(),image,thumb:image,url:image};
          }),next:null};
    }},
    yugioh:{label:'YGOPRODeck + YGOResources',link:'https://github.com/yugioh-artworks/artworks-index',note:'Imagens e artes alternativas do YGOResources. Busque pelo nome em inglês.',placeholder:'Ex.: Dark Magician ou Blue-Eyes',async search(query,page=0,signal){
        const params=new URLSearchParams({fname:query,num:'100',offset:String(page||0),misc:'yes'}),data=await json(`https://db.ygoprodeck.com/api/v7/cardinfo.php?${params}`,signal);
        const index=await json('data/yugioh-images.json',signal);
        const cards=(data.data||[]).flatMap(c=>{
          const konami=c.misc_info?.find(m=>m.konami_id)?.konami_id;
          const variants=index[String(konami)]||[['', '', '']];
          return variants.map(([art,path,lang])=>{
            const image=path?`https://raw.githubusercontent.com/yugioh-artworks/${path}`:'';
            return {name:c.name,id:`${c.id}-${art}`,detail:`${c.type}${art?` • Arte ${art} · ${lang}`:''}`,color:c.frameType?.includes('pendulum')?'pendulum':(['normal','effect','fusion','synchro','xyz','link','ritual','spell','trap'].includes(c.frameType)?c.frameType:'normal'),url:safeURL(c.ygoprodeck_url),image,thumb:image};
          });
        });
        return {cards,next:data.meta?.pages_remaining>0?Number(page||0)+100:null};
    }},
    magic:{label:'Scryfall',link:'https://scryfall.com/docs/api',note:'Imagens e edições via Scryfall. A ilustração é destacada por padrão. Busque pelo nome em inglês.',placeholder:'Ex.: Lightning Bolt ou Atraxa',async search(query,page=1,signal){
        const params=new URLSearchParams({q:query,unique:'prints',order:'name',page:String(page||1)}),data=await json(`https://api.scryfall.com/cards/search?${params}`,signal);
        return {cards:(data.data||[]).flatMap(c=>{
            const faces=c.image_uris?[{name:c.name,image_uris:c.image_uris}]:c.card_faces||[];
            return faces.filter(f=>f.image_uris).map((f,i)=>({name:f.name||c.name,id:`${c.id}-${i}`,detail:`${c.set?.toUpperCase()} · ${c.collector_number}`,color:({W:'white',U:'blue',B:'black',R:'red',G:'green'})[(c.color_identity||[])[0]]||'yellow',url:safeURL(c.scryfall_uri),image:safeURL(f.image_uris.png||f.image_uris.large||f.image_uris.normal),art:safeURL(f.image_uris.art_crop),thumb:safeURL(f.image_uris.small)}));
          }),next:data.has_more?Number(page||1)+1:null};
    }},
    onepiece:{label:'OPTCG API',link:'https://optcgapi.com/documentation',note:'Busca em coleções, decks iniciais e promos. Se a imagem não puder ser importada, use o upload.',placeholder:'Ex.: Luffy, Zoro ou Nami',async search(query,page,signal){
        let cards=[],failed=0;
        for(const kind of ['sets','decks','promos']){
          try{const data=await json(`https://optcgapi.com/api/${kind}/filtered/?${new URLSearchParams({card_name:query})}`,signal);cards.push(...(Array.isArray(data)?data:data.results||[]));}
          catch(e){if(signal?.aborted)throw e;failed++;}
        }
        if(failed===3)throw new Error('Não foi possível consultar a base One Piece. Você pode enviar uma imagem.');
        const seen=new Set();return {cards:cards.filter(c=>{const id=c.card_image||c.card_image_id;if(seen.has(id))return false;seen.add(id);return true;}).map(c=>({name:c.card_name,id:c.card_image_id||c.card_set_id,detail:c.card_set_id,color:c.card_color?.split(/[ /]/)[0].toLowerCase(),image:safeURL(c.card_image),thumb:safeURL(c.card_image),url:safeURL(c.card_image)})),next:null,warning:failed?'Algumas coleções não responderam. Estes resultados são parciais.':''};
    }}
  };
  const inkColor={Amber:'yellow',Amethyst:'purple',Emerald:'green',Ruby:'red',Sapphire:'blue',Steel:'white'};
  const normalized=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function pokemonCard(c,language){const image=safeURL(c.image);return {name:c.name,id:c.id,detail:`${c.id} · ${language.toUpperCase()}`,image:image?image+'/high.webp':'',thumb:image?image+'/low.webp':'',url:'https://tcgdex.net',source:`TCGdex ${language.toUpperCase()}`};}
  configs.pokemon={label:'TCGdex',link:'https://tcgdex.dev',note:'Cartas em inglês ou português. A disponibilidade de imagens varia por edição. Use carta inteira para full arts.',placeholder:'Ex.: Pikachu, Charizard ou base1-4',sources:[['auto','Automático · inglês'],['tcgdex-en','TCGdex · inglês'],['tcgdex-pt','TCGdex · português']],async search(query,page=1,signal,source='auto'){
      const language=source==='tcgdex-pt'?'pt':'en',isId=/^[a-z0-9.]*\d[a-z0-9.]*-[a-z0-9]+$/i.test(query);
      const params=new URLSearchParams({name:query,'pagination:page':String(page||1),'pagination:itemsPerPage':'100'});
      const data=await json(`https://api.tcgdex.net/v2/${language}/cards${isId?'/'+encodeURIComponent(query):'?'+params}`,signal);
      const list=Array.isArray(data)?data:data.id?[data]:[];
      return {cards:list.map(c=>pokemonCard(c,language)),next:!isId&&list.length===100?Number(page||1)+1:null,source:`TCGdex ${language.toUpperCase()}`};
  }};
  function lorcastCard(c){const images=c.image_uris?.digital||{};return {name:[c.name,c.version].filter(Boolean).join(' — '),id:c.id,detail:`${c.set?.code||''} / ${c.collector_number||''} · ${c.rarity||''}`,color:inkColor[c.ink],image:safeURL(images.full||images.large||images.normal),thumb:safeURL(images.small||images.normal||images.large),url:'https://lorcast.com',layout:c.layout,source:'Lorcast'};}
  async function localLorcana(query,signal){const data=await json('data/lorcana-images.json',signal),term=normalized(query);return {cards:data.cards.filter(c=>normalized(`${c.name} ${c.detail}`).includes(term)).map(c=>({...c,color:inkColor[c.color],url:'https://lorcanajson.org',source:'LorcanaJSON + Lorcast · catálogo local'})),next:null,source:`Catálogo local · ${data.updated}`};}
  configs.lorcana={label:'Lorcast + LorcanaJSON',link:'https://lorcast.com/docs/api',note:'Busca inclui edições e variantes. No automático, uma falha da API usa o catálogo local complementar. Imagens sem correspondência podem ser enviadas manualmente.',placeholder:'Ex.: Elsa, Stitch ou Mickey',sources:[['auto','Automático · com alternativa'],['lorcast','Lorcast · online'],['lorcanajson','LorcanaJSON + Lorcast · catálogo local']],async search(query,page,signal,source='auto'){
      if(source==='lorcanajson')return localLorcana(query,signal);
      try{const data=await json(`https://api.lorcast.com/v0/cards/search?${new URLSearchParams({q:query,unique:'prints'})}`,signal);if(!Array.isArray(data.results))throw new Error('Resposta inválida da base Lorcast.');return {cards:data.results.map(lorcastCard),next:null,source:'Lorcast'};}
      catch(e){if(signal?.aborted||source==='lorcast')throw e;const fallback=await localLorcana(query,signal);return {...fallback,warning:'Lorcast não respondeu. Exibindo o catálogo local complementar; edições recentes podem não estar incluídas.'};}
  }};

  /** Provider registry consumed by the studio's card search UI. */
  window.ThumbProviders=configs;
})();
