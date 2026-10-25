import os, json
from playwright.sync_api import sync_playwright
SP = os.path.dirname(os.path.abspath(__file__))
OUT = SP + '/v6'; os.makedirs(OUT, exist_ok=True)
BASE = 'http://localhost:4173/'
results = []
def check(name, ok, detail=''):
    results.append({'test': name, 'pass': bool(ok), 'detail': detail})
    print(('PASS ' if ok else 'FAIL ') + name + (f'  ({detail})' if detail else ''))
SECRETS = ['Sunil Kumar', 'Mahesh Kumar', 'House 45', '1988-05-12', '9812345621']
def plain_leaks(p):
    return p.evaluate("(secrets) => { const all = Object.keys(localStorage).map(k => localStorage.getItem(k) || '').join(' '); return secrets.filter(s => all.includes(s)); }", SECRETS)

with sync_playwright() as pw:
    b = pw.chromium.launch()
    ctx = b.new_context(viewport={'width': 360, 'height': 760}, device_scale_factor=2)
    p = ctx.new_page()
    errors = []
    p.on('pageerror', lambda e: errors.append(str(e)))
    cdp = ctx.new_cdp_session(p); cdp.send('WebAuthn.enable')
    auth = cdp.send('WebAuthn.addVirtualAuthenticator', {'options': {'protocol': 'ctap2', 'transport': 'internal', 'hasResidentKey': True, 'hasUserVerification': True, 'isUserVerified': True, 'automaticPresenceSimulation': True}})['authenticatorId']

    # 1. Start blank, begin a learner's licence form from DigiLocker, stop halfway
    p.goto(BASE); p.evaluate('localStorage.clear()'); p.reload()
    p.get_by_role('radio', name='English').click(); p.get_by_role('button', name='Start').click(); p.wait_for_timeout(500)
    check('App starts with no personal details', p.get_by_role('button', name='Add my details').count() == 1 and not plain_leaks(p))
    p.get_by_role('button', name="Apply for learner's licence").click(); p.get_by_role('button', name="Apply for Learner's licence").click()
    p.get_by_role('button', name='Get from DigiLocker').click(); p.get_by_role('radio', name='Sunil Kumar').click(); p.get_by_role('button', name='Send OTP').click()
    p.get_by_role('button', name='Fill it', exact=True).click(); p.get_by_role('button', name='Verify').click(); p.get_by_role('button', name='Allow', exact=True).click()
    p.get_by_text('Here is what we got').wait_for(timeout=10000); p.get_by_role('button', name='Use these details').click(); p.wait_for_timeout(400)
    p.locator('select').first.select_option('HR'); p.locator('[role=radiogroup] [role=radio]').first.click(); p.get_by_role('button', name='Next').click()
    p.get_by_role('checkbox').first.click(); p.get_by_role('button', name='Next').click(); p.wait_for_timeout(400)
    check('Half-filled form shows DigiLocker details', p.input_value('#ll-name') == 'Sunil Kumar', p.input_value('#ll-name'))
    check('Before locking, the form is stored readable (no lock chosen yet)', len(plain_leaks(p)) > 0, ','.join(plain_leaks(p)))

    # 2. Lock it with the phone's own lock (fingerprint / face / screen lock)
    p.get_by_role('button', name='Lock this form so only you can open it').click(); p.wait_for_timeout(500)
    p.screenshot(path=OUT + '/s1-how.png')
    check('Lock choice offers fingerprint/face/screen lock first', p.get_by_text('Fingerprint, face or phone screen lock').count() == 1)
    p.get_by_text('Fingerprint, face or phone screen lock').click(); p.wait_for_timeout(1500)
    check('Phone lock registered on the device', len(cdp.send('WebAuthn.getCredentials', {'authenticatorId': auth})['credentials']) == 1)
    p.get_by_role('button', name='Skip for now').click(); p.wait_for_timeout(800)
    leaks = plain_leaks(p)
    check('After locking, NO personal detail is stored readable', not leaks, ','.join(leaks) or 'none found')
    vault = p.evaluate("localStorage.getItem('licence-saathi.v2.vault') || ''")
    check('Encrypted vault exists and contains no readable name', bool(vault) and 'Sunil' not in vault, f'{len(vault)} chars of ciphertext')

    # 3. "Close" the app: a brand-new tab (same phone), go straight to the form
    p.close()
    p = ctx.new_page(); p.on('pageerror', lambda e: errors.append(str(e)))
    p.goto(BASE + '#/apply'); p.wait_for_timeout(1200)
    p.screenshot(path=OUT + '/s2-locked-draft.png')
    check('Reopened form shows "Your form is safe and locked"', p.get_by_text('Your form is safe and locked').count() == 1)
    html = p.content()
    check('No personal detail anywhere on the screen', not any(s in html for s in SECRETS))
    check('No form fields can be edited while locked', p.locator('#ll-name').count() == 0)
    p.goto(BASE + '#/profile'); p.wait_for_timeout(500)
    check('"Your details" is also locked', p.get_by_text('Your details are locked').count() == 1)

    # 4. Someone else tries: fingerprint does not match
    cdp2 = ctx.new_cdp_session(p); cdp2.send('WebAuthn.enable')
    cdp2_auth = cdp2.send('WebAuthn.addVirtualAuthenticator', {'options': {'protocol': 'ctap2', 'transport': 'internal', 'hasResidentKey': True, 'hasUserVerification': True, 'isUserVerified': False, 'automaticPresenceSimulation': True}})['authenticatorId']
    p.goto(BASE + '#/apply'); p.wait_for_timeout(500)
    p.get_by_role('button', name='Unlock and continue').click(); p.wait_for_timeout(2500)
    still_locked = p.get_by_text('Your form is safe and locked').count() == 1 and 'Sunil Kumar' not in p.content()
    check('A stranger without the phone lock cannot open it', still_locked, 'unlock refused')
    p.screenshot(path=OUT + '/s3-refused.png')
    p.keyboard.press('Escape')
    if p.get_by_role('button', name='Close').count(): p.get_by_role('button', name='Close').first.click()
    p.wait_for_timeout(300)

    # 5. "Start a new form" does not reveal or change the locked one
    p.get_by_role('button', name='Start a new form instead').click(); p.wait_for_timeout(500)
    check('Starting fresh shows an empty choice, nothing old', p.get_by_text('How do you want to fill this form?').count() == 1 and 'Sunil' not in p.content())
    vault2 = p.evaluate("localStorage.getItem('licence-saathi.v2.vault') || ''")
    check('The locked data is untouched', vault2 == vault)
    b.close()

    # 6. The owner comes back (fresh browser state is not needed: same phone, own fingerprint)
    b = pw.chromium.launch()
    ctx = b.new_context(viewport={'width': 360, 'height': 760}, device_scale_factor=2)
    p = ctx.new_page(); p.on('pageerror', lambda e: errors.append(str(e)))
    cdp = ctx.new_cdp_session(p); cdp.send('WebAuthn.enable')
    auth = cdp.send('WebAuthn.addVirtualAuthenticator', {'options': {'protocol': 'ctap2', 'transport': 'internal', 'hasResidentKey': True, 'hasUserVerification': True, 'isUserVerified': True, 'automaticPresenceSimulation': True}})['authenticatorId']
    p.goto(BASE); p.evaluate('localStorage.clear()'); p.reload()
    p.get_by_role('radio', name='English').click(); p.get_by_role('button', name='Start').click(); p.wait_for_timeout(500)
    p.goto(BASE + '#/service/renew/apply'); p.get_by_role('button', name='Get from DigiLocker').click(); p.get_by_role('button', name='Send OTP').click()
    p.get_by_role('button', name='Fill it', exact=True).click(); p.get_by_role('button', name='Verify').click(); p.get_by_role('button', name='Allow', exact=True).click()
    p.get_by_text('Here is what we got').wait_for(timeout=10000); p.get_by_role('button', name='Use these details').click(); p.wait_for_timeout(400)
    p.get_by_role('button', name='Lock this form so only you can open it').click(); p.wait_for_timeout(400)
    p.get_by_text('Fingerprint, face or phone screen lock').click(); p.wait_for_timeout(1500); p.get_by_role('button', name='Skip for now').click(); p.wait_for_timeout(600)
    p.goto(BASE + '#/'); p.reload(); p.wait_for_timeout(600)
    p.goto(BASE + '#/service/renew/apply'); p.wait_for_timeout(500)
    p.get_by_role('button', name='Unlock and continue').click(); p.wait_for_timeout(2500)
    check('Owner unlocks with fingerprint and continues where they stopped', p.locator('#sa-name').count() == 1 and p.input_value('#sa-name') == 'Sunil Kumar' and p.input_value('#extra') == 'HR26 2019 0012345', p.input_value('#sa-name') if p.locator('#sa-name').count() else 'no form')
    p.screenshot(path=OUT + '/s4-continued.png')

    # 7. Locks itself after 2 minutes in the background
    p.evaluate("""() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
      const real = Date.now; Date.now = () => real() + 125000;
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      document.dispatchEvent(new Event('visibilitychange'));
    }""")
    p.wait_for_timeout(800)
    check('Auto-locks after 2 minutes in the background', p.get_by_text('Your form is safe and locked').count() == 1 and 'Sunil Kumar' not in p.content())
    b.close()

print('ERRORS', errors or 'none')
json.dump(results, open(OUT + '/security_results.json', 'w'), indent=1)
print(f"{sum(r['pass'] for r in results)}/{len(results)} passed")
