import os, re

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'components', 'layout', 'Header.tsx')

with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

# Adiciona useState e useEffect se nao existir
if 'freteGratis' not in c:
    # Adiciona import useState/useEffect se necessario
    c = c.replace(
        "import { useState, useEffect, useRef } from 'react'",
        "import { useState, useEffect, useRef } from 'react'"
    )

    # Adiciona estado freteGratis no componente
    c = c.replace(
        "  const [menuAberto, setMenuAberto] = useState(false)",
        "  const [menuAberto, setMenuAberto] = useState(false)\n  const [freteGratis, setFreteGratis] = useState(299)"
    )

    # Adiciona fetch do valor no useEffect existente ou cria novo
    c = c.replace(
        "  useEffect(() => {",
        """  useEffect(() => {
    fetch('/api/site-config', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (d.data?.frete_gratis_acima) setFreteGratis(Number(d.data.frete_gratis_acima)) })
      .catch(() => {})
  }, [])

  useEffect(() => {""",
        1
    )

    # Substitui valor hardcoded pelo dinamico
    c = c.replace(
        'Frete gr├ítis nas compras acima de R$299',
        'Frete grátis nas compras acima de R${freteGratis}'
    )
    c = c.replace(
        'Frete grátis nas compras acima de R$299',
        'Frete grátis nas compras acima de R${freteGratis}'
    )

    # Garante que seja JSX expression
    c = c.replace(
        '"Frete grátis nas compras acima de R${freteGratis}',
        '{`Frete grátis nas compras acima de R$${freteGratis}'
    )
    c = c.replace(
        'R${freteGratis} &bull;',
        'R$${freteGratis}`} &bull;'
    )

    with open(fp, 'w', encoding='utf-8', newline='\n') as f:
        f.write(c)
    print('OK: Header atualizado com frete gratis dinamico')
else:
    print('OK: freteGratis ja existe no Header')

print('Rode: npm run build')
