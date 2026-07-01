import os, re

base = os.path.dirname(os.path.abspath(__file__))
fp = os.path.join(base, 'src', 'app', 'layout.tsx')

with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

# Substitui Product por Service nos itens do hasOfferCatalog
# Estes nao sao produtos individuais, sao categorias de servico
antigo = """          { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Bolsas de Luxo' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Roupas de Luxo' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Cal├ºados de Luxo' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Acess├│rios de Luxo' } },"""

novo = """          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bolsas de Luxo' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Roupas de Luxo' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Calcados de Luxo' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Acessorios de Luxo' } },"""

if antigo in c:
    c = c.replace(antigo, novo)
    print('OK: Product -> Service nos itens do catalogo')
else:
    # Tenta versao alternativa sem encoding especial
    c = re.sub(
        r"\{ '@type': 'Offer', itemOffered: \{ '@type': 'Product', name: '(Bolsas|Roupas|Cal.ados|Acess.rios) de Luxo' \} \}",
        lambda m: "{ '@type': 'Offer', itemOffered: { '@type': 'Service', name: '" + m.group(1).replace('Cal\\u00e7ados','Calcados').replace('Acess\\u00f3rios','Acessorios') + " de Luxo' } }",
        c
    )
    print('OK: substituicao via regex')

with open(fp, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print()
print('Rode agora:')
print('  git add .')
print('  git commit -m "Fix: JSON-LD layout usa Service em vez de Product no catalogo"')
print('  git push')
