import os

base = os.path.dirname(os.path.abspath(__file__))

# ── 1. Corrige globals.css ────────────────────────────────────
fp_css = os.path.join(base, 'src', 'app', 'globals.css')

with open(fp_css, 'r', encoding='utf-8') as f:
    c = f.read()

# Adiciona classe input-luxo-icon para campos com ícone
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
    print('OK: classe input-luxo-icon adicionada ao CSS')
else:
    print('OK: input-luxo-icon ja existe')

with open(fp_css, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

# ── 2. Atualiza conta/page.tsx ────────────────────────────────
fp_conta = os.path.join(base, 'src', 'app', 'conta', 'page.tsx')

with open(fp_conta, 'r', encoding='utf-8') as f:
    c = f.read()

# Substitui input-luxo pl-10 por input-luxo-icon
c = c.replace('className="input-luxo pl-10"', 'className="input-luxo-icon"')
c = c.replace('className="input-luxo pl-10 pr-10"', 'className="input-luxo-icon pr-10"')
c = c.replace('className="input-luxo pl-10 bg-gray-50 text-gray-400 cursor-not-allowed"', 'className="input-luxo-icon bg-gray-50 text-gray-400 cursor-not-allowed"')

with open(fp_conta, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)
print('OK: conta/page.tsx atualizado')

# ── 3. Atualiza conta/configuracoes/page.tsx ──────────────────
fp_conf = os.path.join(base, 'src', 'app', 'conta', 'configuracoes', 'page.tsx')

with open(fp_conf, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('className="input-luxo pl-10"', 'className="input-luxo-icon"')
c = c.replace('className="input-luxo pl-10 bg-gray-50 text-gray-400 cursor-not-allowed"', 'className="input-luxo-icon bg-gray-50 text-gray-400 cursor-not-allowed"')

with open(fp_conf, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)
print('OK: conta/configuracoes/page.tsx atualizado')

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Fix: espaçamento inputs com ícone na página de conta"')
print('  git push')
