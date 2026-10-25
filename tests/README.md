# Tests

Run the app first (`npm run build` then `npx vite preview --port 4173`), then:

```
pip install playwright && python -m playwright install chromium
python tests/security_test.py   # close a half-filled form, reopen, stranger tries, fingerprint unlock, auto-lock (16 checks)
python tests/v5.py              # DigiLocker, PIN, saved details, lost licence, manual form, Hindi at largest text
python tests/fix_test.py        # "What happened?" (needs the mock AI or a real key; offline path works without)
```

`security_results.json` is the result of the last run (16/16 passed).

`fix_test.py` and `v5.py` also run the axe-core accessibility checker: `cd tests && mkdir -p axe && cd axe && npm init -y && npm i axe-core@4.10.2`.

`situations_test.py`: Home in every situation (LL applied, holding LL, near expiry, expired, DL applied, test booked, passed, lost licence) plus Calm mode in Hindi at the largest text.
