"""Refresh small image indexes without downloading entire image collections."""
import json
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]

def get(url):
    with urlopen(Request(url, headers={'User-Agent': 'ThumbTCG-image-index/0.3'}), timeout=60) as response:
        return json.load(response)

def save(name, data):
    target = ROOT / 'data' / name
    target.parent.mkdir(exist_ok=True)
    target.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')))
    print(name, len(data), 'records', target.stat().st_size, 'bytes')

cards = get('https://raw.githubusercontent.com/TakaOtaku/Digimon-Card-App/main/src/assets/cardlists/PreparedDigimonCardsENG.json')
digimon = []
for card in cards:
    image = card.get('cardImage', '')
    if image.startswith('assets/images/cards/'):
        digimon.append({'id': card['id'], 'number': card.get('cardNumber', card['id']),
                        'name': card['name'].get('english') or card['id'],
                        'color': card.get('color', ''), 'file': image.removeprefix('assets/images/cards/')})
if not digimon:
    raise RuntimeError('Empty Digimon index; refusing to overwrite')
save('digimon-images.json', digimon)
manifest = get('https://raw.githubusercontent.com/yugioh-artworks/artworks-index/main/manifest.json')
from urllib.parse import urlparse
allowed = {'artworks-en-n','artworks-en-db','artworks-jp-n','artworks-jp-db'}
yugioh = {}
for card_id, variants in manifest['cards'].items():
    images = []
    for art_id, variant in variants.items():
        entries = variant.get('idx', {}).get('en', [])
        path = entries[0]['path'] if entries else variant.get('bestArt', '')
        url = urlparse('https:' + path if path.startswith('//') else path)
        repo = url.hostname.removesuffix('.ygoresources.com') if url.hostname else ''
        if repo in allowed:
            images.append([str(art_id), repo + '/main' + url.path, 'EN' if entries else 'JP'])
    if images:
        yugioh[card_id] = images
if not yugioh:
    raise RuntimeError('Empty Yu-Gi-Oh index; refusing to overwrite')
save('yugioh-images.json', yugioh)
