import os

base = os.path.dirname(os.path.abspath(__file__))
fp_css = os.path.join(base, 'src', 'app', 'globals.css')

with open(fp_css, 'r', encoding='utf-8') as f:
    c = f.read()

if 'input-luxo-icon' not in c:
    c = c.replace(
        """.input-luxo {
    @apply w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-100 transition-all;
  }""",
        """.input-luxo {
    @apply w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-100 transition-all;
  }
  .input-luxo-icon {
    @apply w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-100 transition-all;
  }"""
    )
    print('OK: input-luxo-icon adicionado')
else:
    print('OK: ja existe')

with open(fp_css, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Fix: adiciona input-luxo-icon no CSS"')
print('  git push')
