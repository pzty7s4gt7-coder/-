import base64,os
d=os.path.dirname(os.path.abspath(__file__))
src=lambda f:open(os.path.join(d,'src',f),encoding='utf-8').read()
shell=src('shell.html')
for k,f in (('%%MISAKA%%','misaka.webp'),('%%AKI%%','aki.webp')):
    shell=shell.replace(k,'data:image/webp;base64,'+base64.b64encode(open(os.path.join(d,f),'rb').read()).decode())
js='\n'.join(src(f) for f in ('engine.js','core.js','systems.js','story.js'))
open(os.path.join(d,'index.html'),'w',encoding='utf-8').write(shell+'\n<script>\n'+js+'\n</script>\n')
print('built',os.path.getsize(os.path.join(d,'index.html')))
