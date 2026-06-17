import os, shutil, sys, subprocess
print("=" * 55)
print("  Brecho de Luxo - Instalador v1.0")
print("  GreenWeb Softwares Ltda.")
print("=" * 55)
base = os.path.dirname(os.path.abspath(__file__))
print("Diretorio:", base)
try:
    r = subprocess.run(["node", "--version"], capture_output=True, text=True)
    print("Node.js:", r.stdout.strip())
except:
    print("ERRO: Node.js nao encontrado! Instale em nodejs.org")
    sys.exit(1)
for parte in ["brecho_p1.py", "brecho_p2.py", "brecho_p3.py"]:
    p = os.path.join(base, parte)
    if not os.path.exists(p):
        print("ERRO:", parte, "nao encontrado!")
        sys.exit(1)
    r = subprocess.run([sys.executable, p])
    if r.returncode != 0:
        print("ERRO na", parte)
        sys.exit(1)
env_path = os.path.join(base, ".env.local")
if not os.path.exists(env_path):
    ex = os.path.join(base, ".env.example")
    if os.path.exists(ex):
        shutil.copy(ex, env_path)
        print(".env.local criado! Configure com suas chaves.")
next_dir = os.path.join(base, ".next")
if os.path.exists(next_dir):
    shutil.rmtree(next_dir)
print()
print("=" * 55)
print("INSTALACAO CONCLUIDA!")
print()
print("PROXIMOS PASSOS:")
print("  1. Configure o .env.local com as chaves")
print("  2. npm install")
print("  3. Execute brecho_site_banco.sql no Supabase")
print("  4. npm run dev")
print("  5. http://localhost:3001")
print()
print("DEPLOY:")
print("  Suba no GitHub e conecte na Vercel")
print("  Configure as variaveis de ambiente")
print("=" * 55)
