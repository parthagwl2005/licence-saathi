import os, json, datetime
from playwright.sync_api import sync_playwright
SP=os.path.dirname(os.path.abspath(__file__)); OUT=SP+'/v7'
AXE=open(SP+'/axe/node_modules/axe-core/axe.min.js').read()
BASE='http://localhost:4173/'
T=datetime.date.today()
d=lambda n: (T+datetime.timedelta(days=n)).isoformat()
base={'settings':{'lang':'en','helper':True,'size':0},'tests':[{'at':d(-1)+'T10:00:00','score':12,'total':15,'pass':True},{'at':d(-2)+'T10:00:00','score':8,'total':15,'pass':False}],'app':{'step':6,'form':{'state':'HR','rto':'hr26','vehicles':['motorcycle'],'fitness':{}},'submitted':True,'appNo':'LS-26-11111','paidAt':d(-60),'amount':200,'startedAt':d(-60)}}
cases={
 '01-start': {'settings':base['settings']},
 '02-ll-applied': {**base,'app':{**base['app'],'paidAt':d(-3),'startedAt':d(-3)}},
 '03-ll-day12': {**base,'ll':{'date':d(-12)}},
 '04-ll-can-apply': {**base,'ll':{'date':d(-40)}},
 '05-ll-expiring': {**base,'ll':{'date':d(-172)}},
 '06-ll-expired': {**base,'ll':{'date':d(-200)}},
 '07-dl-applied': {**base,'ll':{'date':d(-45)},'dl':{'submitted':True,'appNo':'DL-26-22222','llNo':'HR26/LL/2026/0012345','paidAt':d(-2)}},
 '08-test-booked': {**base,'ll':{'date':d(-50)},'dl':{'submitted':True,'appNo':'DL-26-22222','llNo':'X','paidAt':d(-6)},'slot':{'rto':'hr26','date':d(6),'time':'10:30','bookedAt':d(-5)}},
 '09-passed': {**base,'ll':{'date':d(-70)},'dl':{'submitted':True,'appNo':'DL-26-22222','llNo':'X','paidAt':d(-20)},'slot':{'rto':'hr26','date':d(-4),'time':'10:30','bookedAt':d(-19)},'drivingPassed':True,'drivingPassedAt':d(-4)},
 '10-lost-request': {'settings':base['settings'],'requests':[{'service':'duplicate','no':'DU-26-33333','at':d(-2),'amount':250}]},
}
errs=[]
def overflow(p):
    return p.evaluate("""() => [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.right > innerWidth + 1 && !e.closest('.overflow-x-auto') && getComputedStyle(e).position !== 'fixed'; }).length""")
def axe(p):
    p.add_script_tag(content=AXE)
    return p.evaluate("async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa','wcag22aa'] } })).violations.map(v => v.id + ':' + v.nodes.length)")
with sync_playwright() as pw:
    b=pw.chromium.launch(); p=b.new_page(viewport={'width':375,'height':780}, device_scale_factor=2)
    p.on('pageerror', lambda e: errs.append(str(e)))
    for name, st in cases.items():
        p.goto(BASE); p.evaluate("(s) => { localStorage.clear(); localStorage.setItem('licence-saathi.v2', JSON.stringify(s)); }", st); p.goto(BASE+'#/'); p.reload(); p.wait_for_timeout(900)
        h=p.locator('#sit-h').inner_text() if p.locator('#sit-h').count() else '(start card)'
        nxt=p.locator('#sit-h ~ button').first.inner_text().replace('\n',' / ') if p.locator('#sit-h').count() else ''
        done=p.locator('#done-h ~ ul li').count()
        print(f'{name:18} | {h} | next: {nxt[:60]} | done items: {done} | overflow {overflow(p)} | axe {axe(p)}')
        p.screenshot(path=f'{OUT}/{name}.png', full_page=False)
        p.evaluate("document.querySelector('.overflow-y-auto').scrollTop = 560"); p.wait_for_timeout(300); p.screenshot(path=f'{OUT}/{name}-b.png')
    # Calm mode + Hindi + largest text + easier reading, holding LL
    st={**cases['03-ll-day12'],'settings':{'lang':'hi','helper':True,'size':2,'calm':True,'spacing':True}}
    p.goto(BASE); p.evaluate("(s) => { localStorage.clear(); localStorage.setItem('licence-saathi.v2', JSON.stringify(s)); }", st); p.goto(BASE+'#/'); p.reload(); p.wait_for_timeout(900)
    print('calm hi-xl wide | services hidden:', p.locator('#svc-h').count()==0, '| overflow', overflow(p), '| axe', axe(p), '| motion', p.evaluate("document.documentElement.dataset.motion"))
    p.screenshot(path=f'{OUT}/11-calm-hi.png')
    for r in ['', 'apply', 'permanent', 'service/renew/apply', 'fix', 'road-game', 'settings', 'track', 'profile']:
        p.goto(BASE+'#/'+r); p.wait_for_timeout(500); o=overflow(p)
        if o: print('  overflow on', r, o)
    # reminder download
    st=cases['03-ll-day12']; p.goto(BASE); p.evaluate("(s) => { localStorage.clear(); localStorage.setItem('licence-saathi.v2', JSON.stringify(s)); }", st)
    b.close()
print('errors', errs or 'none')
