"""Extract reusable sources from the self-contained Focal UI Kit. Python 3.10+."""
from pathlib import Path
from html.parser import HTMLParser
import json,re,base64,zipfile,io,hashlib
ROOT=Path(__file__).resolve().parent
source=ROOT/'FoCal_UI_Kit.html'
s=source.read_text(encoding='utf-8')
def write(name,content):
 p=ROOT/name;p.parent.mkdir(parents=True,exist_ok=True)
 if isinstance(content,bytes):p.write_bytes(content)
 else:p.write_text(content,encoding='utf-8')
write('index.html',s)
styles=re.findall(r'<style\b[^>]*>(.*?)</style>',s,re.S)
write('src/ui-kit.css','\n'.join(styles))
scripts=re.findall(r'<script\b[^>]*>(.*?)</script>',s,re.S)
for i,script in enumerate(scripts,1):write(f'src/scripts/{i:02d}.js',script+'\n')
# Resolve only the default :root declarations; component scopes remain in CSS.
tokens={}
for css in styles:
 for root in re.findall(r':root\s*\{([^}]+)\}',css):
  for key,value in re.findall(r'(--[\w-]+)\s*:\s*([^;]+);?',root):tokens[key]=value.strip()
write('tokens/primitives.css',':root {\n'+''.join(f'  {k}: {v};\n' for k,v in tokens.items())+'}\n')
write('tokens/primitives.json',json.dumps(tokens,ensure_ascii=False,indent=2)+'\n')
icon_script=next(x for x in scripts if x.startswith('(()=>{const icons='))
icons,end=json.JSONDecoder().raw_decode(icon_script.split('const icons=',1)[1])
zip64=re.search(r",zip='([^']+)'",icon_script).group(1)
archive=base64.b64decode(zip64)
with zipfile.ZipFile(io.BytesIO(archive)) as z:
 assert len(z.namelist())==len(icons)
 assert z.testzip() is None
 for name in z.namelist():
  assert name.startswith('Sura_Icons/') and '..' not in Path(name).parts
  write('icons/'+name.removeprefix('Sura_Icons/'),z.read(name))
write('downloads/Sura_Icons_416_SVG.zip',archive)
# SVG sprite used by the HTML, with all independent size geometries intact.
start=s.index('<symbol');end=s.index('</defs></svg><main>',start)
write('icons/sprite.svg','<svg xmlns="http://www.w3.org/2000/svg"><defs>'+s[start:end]+'</defs></svg>\n')
manifest=[]
for key,icon in icons.items():
 slug,size=key.removeprefix('sura-').rsplit('-',1)
 p=f'icons/{slug}/{icon["name"]}'
 assert (ROOT/p).read_text()==icon['svg'],p
 manifest.append({'id':key,'name':slug,'size':int(size),'path':p,'sha256':hashlib.sha256(icon['svg'].encode()).hexdigest()})
write('icons/manifest.json',json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
write('.nojekyll','')
print(json.dumps({'icons':len(icons),'tokens':len(tokens),'scripts':len(scripts),'files':len(list(ROOT.rglob('*')))}))
