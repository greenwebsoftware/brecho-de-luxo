import os

base = os.path.dirname(os.path.abspath(__file__))
env_fp = os.path.join(base, '.env.local')

with open(env_fp, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('ADMIN_PASSWORD=2VfBAqqXnI2i', 'ADMIN_PASSWORD=PagBank@Teste2026')

with open(env_fp, 'w', encoding='utf-8') as f:
    f.write(c)

print('OK: Senha temporaria definida: PagBank@Teste2026')
print('LEMBRE-SE: Apos homologacao rode brecho_restaurar_senha.py para restaurar a senha original')
print('Rode: npm run build')
