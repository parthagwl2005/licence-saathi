import os
from playwright.sync_api import sync_playwright
SP=os.path.dirname(os.path.abspath(__file__)); OUT=SP+'/v6'
AXE=open(SP+'/axe/node_modules/axe-core/axe.min.js').read()
BASE='http://localhost:4173/'
errs=[]
def axe(p):
    p.add_script_tag(content=AXE)
    return p.evaluate("async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa','wcag22aa'] } })).violations.map(v => v.id + ':' + v.nodes.length)")
def overflow(p):
    return p.evaluate("""() => [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.right > innerWidth + 1 && !e.closest('.overflow-x-auto') && getComputedStyle(e).position !== 'fixed'; }).length""")
with sync_playwright() as pw:
    b=pw.chromium.launch(); ctx=b.new_context(viewport={'width':360,'height':760}, device_scale_factor=2); p=ctx.new_page()
    p.on('pageerror', lambda e: errs.append(str(e)))
    p.goto(BASE); p.evaluate("localStorage.clear(); localStorage.setItem('licence-saathi.v2', JSON.stringify({settings:{lang:'en',helper:true,size:0}}))"); p.reload(); p.wait_for_timeout(600)
    p.get_by_role('button', name='Something went wrong?').first.click(); p.wait_for_timeout(400)
    print('axe fix:', axe(p)); p.screenshot(path=OUT+'/f1-ask.png')
    # AI path (Hinglish with typos)
    p.fill('#fx-in', 'mere paise kat gye pr reciept nhi aayi'); p.get_by_role('button', name='Find the fix').click()
    p.get_by_text('What to do now').wait_for(timeout=15000)
    print('AI answer used:', p.get_by_text('AI understood').count()==1, '| Hinglish summary:', p.get_by_text('Bank ne abhi confirm').count()==1)
    print('page button:', p.get_by_role('button', name='Open: payment help').count()==1, '| official link:', p.locator('a[href="https://sarathi.parivahan.gov.in/"]').count()==1)
    p.screenshot(path=OUT+'/f2-ai.png'); print('axe result:', axe(p))
    p.get_by_role('button', name='Open: payment help').click(); p.wait_for_timeout(500); print('went to help topic:', '/help' in p.url and 'payment' in p.url)
    # AI tries to return an unknown id -> ignored safely
    p.goto(BASE+'#/'); p.goto(BASE+'#/fix'); p.wait_for_timeout(300); p.fill('#fx-in', 'hack the thing'); p.get_by_role('button', name='Find the fix').click(); p.wait_for_timeout(2500)
    print('unknown AI id ignored, safe fallback:', p.get_by_text("We're not sure yet").count()==1, '| no bad link:', 'bad.example' not in p.content())
    # Offline: local matcher, Hindi
    ctx.set_offline(True)
    p.goto(BASE+'#/'); p.goto(BASE+'#/fix'); p.wait_for_timeout(300); p.fill('#fx-in', 'मेरा लाइसेंस खो गया'); p.get_by_role('button', name='Find the fix').click(); p.wait_for_timeout(800)
    print('offline Hindi matched lost:', p.get_by_text('I lost my driving licence').count()==1, '| from list:', p.get_by_text('Matched from our list').count()==1)
    p.goto(BASE+'#/'); p.goto(BASE+'#/fix'); p.wait_for_timeout(300); p.fill('#fx-in', 'OTP nai aya'); p.get_by_role('button', name='Find the fix').click(); p.wait_for_timeout(800)
    print('offline typo matched otp:', p.get_by_text('The OTP or code did not come').count()==1)
    p.goto(BASE+'#/'); p.goto(BASE+'#/fix'); p.wait_for_timeout(300); p.fill('#fx-in', 'Aadhaar 2345 6789 0123 mera otp nahi aaya'); p.get_by_role('button', name='Find the fix').click(); p.wait_for_timeout(800)
    print('number removed in echo:', '2345 6789' not in p.content())
    ctx.set_offline(False)
    # Hindi + largest text: fix, game, lock choice
    p.evaluate("() => { const s=JSON.parse(localStorage.getItem('licence-saathi.v2')); s.settings.lang='hi'; s.settings.size=2; localStorage.setItem('licence-saathi.v2', JSON.stringify(s)); }")
    for r in ['', 'fix', 'road-game', 'help']:
        p.goto(BASE+'#/'+r); p.reload(); p.wait_for_timeout(600); print('hi-xl', r or 'home', 'overflow', overflow(p), 'axe', axe(p))
    p.goto(BASE+'#/road-game'); p.get_by_role('button', name='गाड़ी चलाना शुरू करें').click(); p.wait_for_timeout(1800)
    print('hi-xl game question overflow', overflow(p)); p.screenshot(path=OUT+'/f3-hi-game.png'); print('axe game:', axe(p))
    p.goto(BASE+'#/'); p.goto(BASE+'#/fix'); p.wait_for_timeout(300); p.fill('#fx-in','paise kat gaye'); p.locator('form button.btn-primary').click(); p.get_by_text('अब क्या करें').wait_for(timeout=15000)
    print('hi-xl fix result overflow', overflow(p)); p.screenshot(path=OUT+'/f4-hi-fix.png')
    b.close()
print('errors', errs or 'none')
