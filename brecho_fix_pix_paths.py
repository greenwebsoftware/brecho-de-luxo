import os, re

base = os.path.dirname(os.path.abspath(__file__))

fixes = {
    'src/app/api/pix/route.ts': '../../../lib/supabase-server',
    'src/app/api/webhook/pagbank-pix/route.ts': '../../../../lib/supabase-server',
}

for rel, path in fixes.items():
    fp = os.path.join(base, rel)
    with open(fp, 'r', encoding='utf-8') as f:
        c = f.read()
    # Fix supabase path
    c = re.sub(r"from '[./]*lib/supabase-server'", f"from '{path}'", c)
    # Remove pixUtils fallback (nao existe - usa payload simples)
    c = c.replace(
        """      const { gerarPixPayload } = await import('../../../lib/pixUtils')
      const pixPayload = gerarPixPayload(
        'd92e36d8-a6c3-46fb-b711-5519475b56ff',
        'Brecho de Luxo',
        'Jundiai',
        total,
        txid,
        `Pedido #${numero}`
      )""",
        "      const pixPayload = txid"
    )
    with open(fp, 'w', encoding='utf-8', newline='\n') as f:
        f.write(c)
    print(f'OK: {rel}')

print()
print('Rode: npm run build')
