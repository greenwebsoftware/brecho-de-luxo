"""
GreenWeb Softwares
Verificador de Estado — Brecho de Luxo
Execute toda vez que logar para checar se tudo esta correto.
Comando: python verificar_estado_brecho.py
"""
import os

base = r"C:\brechoDeLuxo"
erros = []
oks   = []

def checar(descricao, arquivo, deve_conter, nao_deve_conter=None):
    fp = os.path.join(base, arquivo.replace('/', os.sep))
    if not os.path.isfile(fp):
        erros.append(f"ARQUIVO NAO ENCONTRADO: {arquivo}")
        return
    with open(fp, 'r', encoding='utf-8') as f:
        c = f.read()
    for texto in (deve_conter if isinstance(deve_conter, list) else [deve_conter]):
        if texto not in c:
            erros.append(f"FALTANDO em {arquivo}: {descricao} — '{texto[:60]}'")
            return
    if nao_deve_conter:
        for texto in (nao_deve_conter if isinstance(nao_deve_conter, list) else [nao_deve_conter]):
            if texto in c:
                erros.append(f"PROBLEMA em {arquivo}: {descricao} — nao deveria ter '{texto[:60]}'")
                return
    oks.append(f"OK: {descricao}")

print()
print("=" * 60)
print("  Verificador de Estado — Brecho de Luxo")
print("=" * 60)
print()

# ── API de produtos (Estoque-Site) ────────────────────────────
checar(
    "Estoque-Site busca produtos_online",
    "src/app/api/admin/produtos/route.ts",
    "produtos_online",
    ".from('produtos')"
)

# ── API de produtos publicos ──────────────────────────────────
checar(
    "API publica usa produtos_online",
    "src/app/api/produtos/route.ts",
    "produtos_online"
)

# ── Pagina de produto ─────────────────────────────────────────
checar(
    "Pagina produto busca produtos_online",
    "src/app/loja/[id]/page.tsx",
    "produtos_online"
)
checar(
    "JSON-LD Schema.org com offers",
    "src/app/loja/[id]/page.tsx",
    "offers"
)

# ── Comentarios ficam pendentes ───────────────────────────────
checar(
    "Comentarios ficam pendentes",
    "src/app/api/blog/comentarios/route.ts",
    "status: 'pendente'",
    "status: 'aprovado'"
)

# ── Upload de imagem blog com compressao ──────────────────────
checar(
    "Upload blog com compressao de imagem",
    "src/app/admin-loja/page.tsx",
    "comprimirImagem"
)

# ── Metrica sem duplicacao ────────────────────────────────────
checar(
    "Metrica Prod. no Site sem duplicacao",
    "src/app/admin-loja/page.tsx",
    "produtosVisiveis: produtosOnline.filter(p => p.visivel).length",
    "produtos.filter(p => p.visivel_site).length + produtosOnline"
)

# ── Categorias dinamicas ──────────────────────────────────────
checar(
    "Categorias raiz dinamicas do banco",
    "src/app/admin-loja/page.tsx",
    "Categorias raiz dinamicas do banco"
)
checar(
    "Botao renomear categoria raiz",
    "src/app/admin-loja/page.tsx",
    "setEditandoCat({ id: catRaiz.id"
)
checar(
    "Modal renomear categoria",
    "src/app/admin-loja/page.tsx",
    "MODAL RENOMEAR CATEGORIA"
)
checar(
    "Select tipo com opcao genero",
    "src/app/admin-loja/page.tsx",
    'value="genero"'
)

# ── menuConfig dinamico ───────────────────────────────────────
checar(
    "menuConfig com buildCategorias dinamico",
    "src/lib/menuConfig.ts",
    "buildCategorias"
)

# ── API categorias com PATCH ──────────────────────────────────
checar(
    "API categorias suporta PATCH (renomear)",
    "src/app/api/categorias-loja/route.ts",
    "export async function PATCH"
)

# ── JSON-LD layout sem Product incorreto ─────────────────────
checar(
    "JSON-LD layout usa Service (nao Product) no catalogo",
    "src/app/layout.tsx",
    "'@type': 'Service'",
    [
        "itemOffered: { '@type': 'Product', name: 'Bolsas de Luxo' }",
        "itemOffered: { '@type': 'Product', name: 'Roupas de Luxo' }",
    ]
)

# ── next.config.js aceita dominios ───────────────────────────
checar(
    "next.config.js aceita multiplos dominios",
    "next.config.js",
    "**.supabase.co"
)


# ── Dropdowns produto online dinamicos ───────────────────────
checar(
    "Dropdowns produto online usam categorias do banco",
    "src/app/admin-loja/page.tsx",
    "categoriasLoja.filter(c => c.pai_slug === catSelecionada && c.tipo === 'grupo')",
    "CATEGORIAS.find(c => c.slug === catSelecionada)?.grupos"
)
# ── Resultado ─────────────────────────────────────────────────
print()
for ok in oks:
    print(f"  ✓ {ok}")

print()
if erros:
    print(f"  {'='*50}")
    print(f"  ATENCAO: {len(erros)} problema(s) encontrado(s)!")
    print(f"  {'='*50}")
    for e in erros:
        print(f"  ✗ {e}")
    print()
    print("  Execute os scripts de correcao correspondentes")
    print("  ou avise o suporte GreenWeb Softwares.")
else:
    print(f"  {'='*50}")
    print(f"  TUDO OK! {len(oks)} verificacoes passaram.")
    print(f"  {'='*50}")
print()
