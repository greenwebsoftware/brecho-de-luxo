import os

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'app', 'layout.tsx')

with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    "google: 'COLE_AQUI_SEU_GOOGLE_SEARCH_CONSOLE_ID'",
    "google: 'k4jyCmIH2z84Jy0_dS_H52R5hBTc3RFDu0E14c66lYI'"
)

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print('OK: Google Search Console verificado no layout.tsx')
print('Rode: npm run build')
