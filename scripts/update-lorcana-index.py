"""Build a searchable fallback with LorcanaJSON metadata and actual Lorcast image URLs."""
import json,time
from datetime import datetime,timezone
from pathlib import Path
from urllib.request import Request,urlopen
ROOT=Path(__file__).resolve().parents[1]
def get(url):
    for attempt in range(3):
        try:
            with urlopen(Request(url,headers={'User-Agent':'ThumbTCG/0.7','Accept':'application/json'}),timeout=30) as r:return json.load(r)
        except Exception:
            if attempt==2:raise
            time.sleep(1)
    
meta=get('https://lorcanajson.org/files/current/en/allCards.json')
lookup={(str(c['setCode']),str(c['number'])):c for c in meta['cards']}
cards=[];seen=set()
for s in get('https://api.lorcast.com/v0/sets')['results']:
    time.sleep(.2)
    items=get('https://api.lorcast.com/v0/sets/'+s['id']+'/cards')
    if not isinstance(items,list):raise ValueError('Unexpected cards response')
    for c in items:
        key=c['id']
        if key in seen:continue
        seen.add(key)
        m=lookup.get((str(s['code']),str(c['collector_number'])),{})
        images=c.get('image_uris',{}).get('digital',{})
        cards.append({'name':m.get('fullName') or ' — '.join(filter(None,[c['name'],c.get('version')])), 'id':key,'detail':f"{s['code']} / {c['collector_number']} · {s['name']}", 'color':c.get('ink',''),'image':images.get('full') or images.get('large') or images.get('normal',''),'thumb':images.get('small') or images.get('normal',''),'layout':c.get('layout','normal')})
    print(s['code'],len(items),flush=True)
if len(cards)<1000:raise ValueError('Incomplete catalog; refusing to overwrite')
out={'updated':datetime.now(timezone.utc).date().isoformat(),'sources':['https://lorcast.com/docs/api','https://lorcanajson.org'],'cards':cards}
(ROOT/'data/lorcana-images.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':')))
print('Saved',len(cards),'cards',flush=True)
