"""
GreenWeb Softwares
Gerador do Instalador — Loja Virtual v1.0.1
======================================================
1. Copia C:\brechoDeLuxo -> C:\GreenWeb\LojaVirtual (limpa)
2. Remove dados especificos do Brecho de Luxo
3. Gera na Area de Trabalho:
   GreenWeb_LojaVirtual_Instalador\
     INSTALAR_LOJA_VIRTUAL_LOCAL.bat
     INSTALAR_LOJA_VIRTUAL_VERCEL.bat
     app\  (codigo-fonte completo)
     loja_virtual_banco.sql
   GreenWeb_LojaVirtual_Instalador.zip
======================================================
Execute em: C:\brechoDeLuxo\
Comando   : python gerar_instalador_lojavirtual.py
"""

import os, shutil, zipfile, re

ORIGEM          = r"C:\brechoDeLuxo"
DESTINO_LIMPO   = r"C:\GreenWeb\LojaVirtual"
DESKTOP         = os.path.join(os.path.expanduser("~"), "Desktop")
NOME_PACOTE     = "GreenWeb_LojaVirtual_Instalador"
PASTA_PACOTE    = os.path.join(DESKTOP, NOME_PACOTE)
ZIP_FINAL       = os.path.join(DESKTOP, NOME_PACOTE + ".zip")

# Arquivos/pastas a ignorar na copia
IGNORAR = {
    ".next", "node_modules", ".git", "__pycache__", "logs",
    ".env.local", ".env",
    # Scripts do Brecho que nao devem ir para o instalador
    "brecho_fix_", "brecho_instalar", "brecho_pix", "brecho_seo",
    "brecho_admin", "brecho_blog", "brecho_checkout", "brecho_login",
    "brecho_logo", "brecho_p1", "brecho_p2", "brecho_p3",
    "brecho_restaurar", "brecho_senha", "brecho_tiktok",
    "verificar_estado_brecho.py",
    "gerar_instalador_lojavirtual.py",
}

# ─────────────────────────────────────────────────────────────
# SQL DO BANCO — Loja Virtual v1.0.1
# ─────────────────────────────────────────────────────────────
SQL_BANCO = """
-- ============================================================
-- GreenWeb Softwares — Loja Virtual v1.0.1
-- SQL Inicial — Execute no Supabase do novo cliente
-- ============================================================

-- EXTENSOES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SITE CONFIG
CREATE TABLE IF NOT EXISTS site_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp varchar(20),
  instagram varchar(100),
  facebook varchar(100),
  tiktok varchar(100),
  email_contato varchar(100),
  frete_gratis_acima numeric(10,2) DEFAULT 299,
  frete_fixo numeric(10,2),
  cep_origem varchar(10),
  melhor_envio_token text,
  atualizado_em timestamptz DEFAULT now()
);
INSERT INTO site_config (whatsapp, frete_gratis_acima) VALUES ('5511999999999', 299) ON CONFLICT DO NOTHING;

-- CATEGORIAS DA LOJA
CREATE TABLE IF NOT EXISTS categorias_loja (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  label varchar(100) NOT NULL,
  slug varchar(100) NOT NULL UNIQUE,
  tipo varchar(20) NOT NULL DEFAULT 'subcategoria',
  pai_slug varchar(100),
  icone varchar(10),
  ordem integer DEFAULT 0,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now()
);

-- CATEGORIAS PADRAO GENERICAS
-- O cliente pode renomear ou excluir estas categorias no admin
INSERT INTO categorias_loja (label, slug, tipo, pai_slug, icone, ordem) VALUES
('Categoria 1','categoria-1','subcategoria',null,'📦',1),
('Categoria 2','categoria-2','subcategoria',null,'🛍️',2),
('Categoria 3','categoria-3','subcategoria',null,'⭐',3),
('Categoria 4','categoria-4','subcategoria',null,'✨',4)
ON CONFLICT (slug) DO NOTHING;

-- PRODUTOS ONLINE (exclusivos da loja virtual)
CREATE TABLE IF NOT EXISTS produtos_online (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome varchar(200) NOT NULL,
  descricao text,
  preco numeric(10,2) NOT NULL,
  preco_promocional numeric(10,2),
  estoque integer DEFAULT 1,
  categoria varchar(50),
  subcategoria varchar(50),
  genero varchar(50),
  marca varchar(100),
  tamanhos jsonb DEFAULT '[]',
  cores jsonb DEFAULT '[]',
  fotos jsonb DEFAULT '[]',
  peso numeric(5,2) DEFAULT 0.3,
  altura integer DEFAULT 5,
  largura integer DEFAULT 20,
  comprimento integer DEFAULT 30,
  visivel boolean DEFAULT true,
  destaque boolean DEFAULT false,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- CLIENTES DO SITE
CREATE TABLE IF NOT EXISTS clientes_site (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id uuid UNIQUE,
  nome varchar(200),
  email varchar(200) UNIQUE NOT NULL,
  telefone varchar(20),
  cpf varchar(14),
  data_nascimento date,
  cep varchar(10),
  logradouro varchar(200),
  numero varchar(10),
  complemento varchar(100),
  bairro varchar(100),
  cidade varchar(100),
  uf varchar(2),
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now()
);

-- ENDERECOS DE ENTREGA
CREATE TABLE IF NOT EXISTS enderecos_entrega (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id uuid REFERENCES clientes_site(id),
  cep varchar(10),
  logradouro varchar(200),
  numero varchar(10),
  complemento varchar(100),
  bairro varchar(100),
  cidade varchar(100),
  uf varchar(2),
  principal boolean DEFAULT false,
  criado_em timestamptz DEFAULT now()
);

-- PEDIDOS ONLINE
CREATE TABLE IF NOT EXISTS pedidos_online (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero serial,
  cliente_id uuid REFERENCES clientes_site(id),
  cliente_nome varchar(200),
  cliente_email varchar(200),
  cliente_telefone varchar(20),
  subtotal numeric(10,2) DEFAULT 0,
  frete numeric(10,2) DEFAULT 0,
  desconto numeric(10,2) DEFAULT 0,
  total numeric(10,2) NOT NULL,
  status varchar(50) DEFAULT 'aguardando_pagamento',
  forma_pagamento varchar(50),
  endereco_snapshot jsonb,
  mp_preference_id varchar(200),
  mp_payment_id varchar(200),
  pix_txid varchar(200),
  pix_payload text,
  integrado_modasystem boolean DEFAULT false,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- ITENS DO PEDIDO
CREATE TABLE IF NOT EXISTS itens_pedido_online (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id uuid REFERENCES pedidos_online(id),
  produto_id uuid,
  nome_produto varchar(200),
  codigo_produto varchar(50),
  tamanho varchar(20),
  cor varchar(50),
  preco_unitario numeric(10,2),
  quantidade integer DEFAULT 1,
  subtotal numeric(10,2),
  criado_em timestamptz DEFAULT now()
);

-- AVALIACOES DE PRODUTOS
CREATE TABLE IF NOT EXISTS avaliacoes_produtos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id uuid,
  cliente_id uuid REFERENCES clientes_site(id),
  nota integer CHECK (nota >= 1 AND nota <= 5),
  comentario text,
  aprovado boolean DEFAULT false,
  criado_em timestamptz DEFAULT now()
);

-- BLOG POSTS
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo varchar(300) NOT NULL,
  slug varchar(300) UNIQUE NOT NULL,
  resumo text,
  conteudo text,
  imagem_capa varchar(500),
  video_url varchar(500),
  tags jsonb DEFAULT '[]',
  publicado boolean DEFAULT false,
  destaque boolean DEFAULT false,
  visualizacoes integer DEFAULT 0,
  curtidas integer DEFAULT 0,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- COMENTARIOS DO BLOG
CREATE TABLE IF NOT EXISTS blog_comentarios (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES clientes_site(id),
  nome_visitante varchar(100),
  email_visitante varchar(200),
  conteudo text NOT NULL,
  status varchar(20) DEFAULT 'pendente',
  motivo_rejeicao text,
  curtidas integer DEFAULT 0,
  criado_em timestamptz DEFAULT now()
);

-- CURTIDAS DO BLOG
CREATE TABLE IF NOT EXISTS blog_curtidas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES clientes_site(id),
  ip varchar(50),
  criado_em timestamptz DEFAULT now()
);

-- SITE BANNERS
CREATE TABLE IF NOT EXISTS site_banners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo varchar(200),
  subtitulo varchar(300),
  imagem_url varchar(500),
  link varchar(500),
  ordem integer DEFAULT 0,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now()
);

-- VISITAS DO SITE
CREATE TABLE IF NOT EXISTS site_visitas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ip varchar(50),
  pagina varchar(200),
  criado_em timestamptz DEFAULT now()
);

-- NEWSLETTER
CREATE TABLE IF NOT EXISTS newsletter (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email varchar(200) UNIQUE NOT NULL,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now()
);

-- STORAGE: bucket imagens
-- Execute manualmente no Supabase se necessario:
-- Storage > New bucket > nome: imagens > Public: true
-- Depois crie as policies em Storage > Policies

-- ============================================================
-- FIM DO SQL — Loja Virtual v1.0.1
-- ============================================================
"""

# ─────────────────────────────────────────────────────────────
# BAT LOCAL
# ─────────────────────────────────────────────────────────────
BAT_LOCAL = """\
@echo off
chcp 65001 >nul 2>&1
setlocal EnableDelayedExpansion
title GreenWeb - Instalador Loja Virtual (Local)

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERRO] Execute como Administrador!
    pause & exit /b 1
)

cls
echo.
echo  ============================================================
echo   GreenWeb Softwares
echo   Instalador da Loja Virtual v1.0.1 - Versao LOCAL
echo  ============================================================
echo.
echo  Instala a loja para rodar no PC (http://localhost:3000)
echo  Ideal para: gerenciar localmente + publicar na Vercel depois
echo.
set /p CONTINUAR= Continuar? (S/N): 
if /i "!CONTINUAR!" neq "S" ( echo Cancelado. & pause & exit /b 0 )

:: Node.js
cls
echo [1/8] Verificando Node.js...
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Node.js nao encontrado! Abrindo download...
    start https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
    echo Instale o Node.js, reinicie e execute novamente.
    pause & exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo Node.js OK: !NODE_VER!

:: Python
echo [2/8] Verificando Python...
python --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Python nao encontrado! Abrindo download...
    start https://www.python.org/downloads/
    echo Instale marcando "Add Python to PATH", reinicie e execute novamente.
    pause & exit /b 1
)
for /f "tokens=*" %%v in ('python --version') do set PY_VER=%%v
echo Python OK: !PY_VER!

:: Dados da loja
cls
echo.
echo  [3/8] Dados da Loja
echo  ============================================================
:NOME_LOJA
set /p NOME_LOJA= Nome da loja: 
if "!NOME_LOJA!"=="" ( echo Obrigatorio! & goto :NOME_LOJA )
set /p WHATSAPP= WhatsApp (ex: 5511999999999): 
set /p INSTAGRAM= Instagram (ex: @minhaloja): 
set /p TIKTOK= TikTok (ex: @minhaloja, opcional): 
set /p EMAIL_LOJA= E-mail de contato: 
set /p CEP_ORIGEM= CEP de origem para frete (ex: 01310-100): 

:: Supabase
cls
echo.
echo  [4/8] Credenciais do Supabase
echo  ============================================================
echo  Acesse: supabase.com > Projeto > Settings > API
echo.
:SB_URL
set /p SUPABASE_URL= NEXT_PUBLIC_SUPABASE_URL: 
if "!SUPABASE_URL!"=="" ( echo Obrigatorio! & goto :SB_URL )
:SB_ANON
set /p SUPABASE_ANON= NEXT_PUBLIC_SUPABASE_ANON_KEY: 
if "!SUPABASE_ANON!"=="" ( echo Obrigatorio! & goto :SB_ANON )
:SB_SVC
set /p SUPABASE_SERVICE= SUPABASE_SERVICE_ROLE_KEY: 
if "!SUPABASE_SERVICE!"=="" ( echo Obrigatorio! & goto :SB_SVC )

:: Pagamentos
cls
echo.
echo  [5/8] Credenciais de Pagamento
echo  ============================================================
echo  MERCADO PAGO (obrigatorio para cartao)
set /p MP_TOKEN= MP_ACCESS_TOKEN: 
set /p MP_KEY= NEXT_PUBLIC_MP_PUBLIC_KEY: 
echo.
echo  PAGBANK PIX (opcional)
set /p PAGBANK= PAGBANK_TOKEN (ENTER para pular): 
echo.
echo  MELHOR ENVIO (opcional)
set /p ME_TOKEN= MELHOR_ENVIO_TOKEN (ENTER para pular): 

:: Senha admin
cls
echo.
echo  [6/8] Senha do Painel Admin
echo  ============================================================
:ADM_PASS
set /p ADMIN_PASS= Senha do painel /admin-loja (min. 8 caracteres): 
if "!ADMIN_PASS!"=="" ( echo Obrigatorio! & goto :ADM_PASS )

:: Confirmacao
cls
echo.
echo  [7/8] Confirmacao
echo  ============================================================
echo   Loja      : !NOME_LOJA!
echo   WhatsApp  : !WHATSAPP!
echo   CEP       : !CEP_ORIGEM!
echo   Pasta     : C:\GreenWeb\LojaVirtual
echo   Supabase  : !SUPABASE_URL!
echo.
set /p CONFIRMAR= Confirmar instalacao? (S/N): 
if /i "!CONFIRMAR!" neq "S" ( echo Cancelado. & pause & exit /b 0 )

:: Instalar
cls
echo.
echo  [8/8] Instalando...
echo  ============================================================
set DEST=C:\\GreenWeb\\LojaVirtual
if not exist "C:\\GreenWeb" mkdir "C:\\GreenWeb"
if not exist "!DEST!" mkdir "!DEST!"

echo Copiando arquivos...
xcopy /E /I /Y /Q "%~dp0app\\*" "!DEST!\\" >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERRO] Falha ao copiar arquivos!
    pause & exit /b 1
)

:: .env.local
echo Criando configuracoes...
(
echo NEXT_PUBLIC_SUPABASE_URL=!SUPABASE_URL!
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=!SUPABASE_ANON!
echo SUPABASE_SERVICE_ROLE_KEY=!SUPABASE_SERVICE!
echo MP_ACCESS_TOKEN=!MP_TOKEN!
echo NEXT_PUBLIC_MP_PUBLIC_KEY=!MP_KEY!
echo PAGBANK_TOKEN=!PAGBANK!
echo MELHOR_ENVIO_TOKEN=!ME_TOKEN!
echo NEXT_PUBLIC_LOJA_NOME=!NOME_LOJA!
echo NEXT_PUBLIC_LOJA_WHATSAPP=!WHATSAPP!
echo NEXT_PUBLIC_LOJA_INSTAGRAM=!INSTAGRAM!
echo NEXT_PUBLIC_LOJA_TIKTOK=!TIKTOK!
echo NEXT_PUBLIC_LOJA_EMAIL=!EMAIL_LOJA!
echo NEXT_PUBLIC_CEP_ORIGEM=!CEP_ORIGEM!
echo NEXT_PUBLIC_SITE_URL=http://localhost:3001
echo ADMIN_PASSWORD=!ADMIN_PASS!
) > "!DEST!\\.env.local"

:: npm install
echo Instalando dependencias npm (aguarde 3-5 min)...
cd /d "!DEST!"
call npm install --silent
if %errorLevel% neq 0 ( echo [ERRO] Falha nas dependencias! & pause & exit /b 1 )

:: Build
echo Build de producao (aguarde)...
call npm run build
if %errorLevel% neq 0 (
    echo [ERRO] Falha no build! Verifique as credenciais Supabase.
    pause & exit /b 1
)

:: Adiciona porta 3001 no package.json start
echo Configurando porta 3001...
python -c "import json,os; p=json.load(open('package.json')); p['scripts']['start']='next start -p 3001'; json.dump(p,open('package.json','w'),indent=2)"

:: Instalar servico Windows
echo Instalando servico Windows...
python "!DEST!\\instalar_servico_lojavirtual.py"

:: Atalho
set DESKTOP=%USERPROFILE%\\Desktop
set VBS="%TEMP%\\atalho_lv.vbs"
(
echo Set oWS = WScript.CreateObject^("WScript.Shell"^)
echo Set oLink = oWS.CreateShortcut^("!DESKTOP!\\LojaVirtual.lnk"^)
echo oLink.TargetPath = "http://localhost:3001"
echo oLink.Description = "Loja Virtual - !NOME_LOJA!"
echo oLink.IconLocation = "C:\\Windows\\System32\\shell32.dll,14"
echo oLink.Save
) > !VBS!
cscript //nologo !VBS!
del !VBS! >nul 2>&1

:: SQL para Desktop
if exist "!DEST!\\loja_virtual_banco.sql" (
    copy "!DEST!\\loja_virtual_banco.sql" "!DESKTOP!\\LojaVirtual_banco.sql" >nul
)

:: Info
(
echo ============================================================
echo  GreenWeb Softwares - Loja Virtual v1.0.1
echo  Instalacao: %DATE% %TIME%
echo ============================================================
echo  Loja      : !NOME_LOJA!
echo  WhatsApp  : !WHATSAPP!
echo  CEP       : !CEP_ORIGEM!
echo  Pasta     : C:\\GreenWeb\\LojaVirtual
echo  URL Local : http://localhost:3000
echo  Supabase  : !SUPABASE_URL!
echo ============================================================
) > "!DESKTOP!\\LojaVirtual_info.txt"

cls
echo.
echo  ============================================================
echo   INSTALACAO CONCLUIDA!
echo  ============================================================
echo   Loja  : !NOME_LOJA!
echo   URL   : http://localhost:3001
echo.
echo   Na Area de Trabalho:
echo     LojaVirtual.lnk         (acesso rapido)
echo     LojaVirtual_banco.sql   (execute no Supabase)
echo     LojaVirtual_info.txt    (dados da instalacao)
echo.
echo   PROXIMO PASSO OBRIGATORIO:
echo     Execute o SQL no Supabase:
echo     supabase.com > SQL Editor > cole LojaVirtual_banco.sql
echo  ============================================================
pause
"""

# ─────────────────────────────────────────────────────────────
# BAT VERCEL
# ─────────────────────────────────────────────────────────────
BAT_VERCEL = """\
@echo off
chcp 65001 >nul 2>&1
setlocal EnableDelayedExpansion
title GreenWeb - Instalador Loja Virtual (Vercel)

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERRO] Execute como Administrador!
    pause & exit /b 1
)

cls
echo.
echo  ============================================================
echo   GreenWeb Softwares
echo   Instalador da Loja Virtual v1.0.1 - Versao VERCEL
echo  ============================================================
echo.
echo  Publica a loja online via Vercel (acesso pelo dominio)
echo  Ideal para: loja publica acessada pelos clientes
echo.
set /p CONTINUAR= Continuar? (S/N): 
if /i "!CONTINUAR!" neq "S" ( echo Cancelado. & pause & exit /b 0 )

:: Node.js
echo [1/7] Verificando Node.js...
node --version >nul 2>&1
if %errorLevel% neq 0 (
    start https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
    echo Instale o Node.js e execute novamente.
    pause & exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo Node.js OK: !NODE_VER!

:: Dados da loja
cls
echo.
echo  [2/7] Dados da Loja
echo  ============================================================
:NOME_LOJA
set /p NOME_LOJA= Nome da loja: 
if "!NOME_LOJA!"=="" ( echo Obrigatorio! & goto :NOME_LOJA )
:DOMINIO
set /p DOMINIO= Dominio (ex: minhaloja.com.br, opcional): 
set /p WHATSAPP= WhatsApp (ex: 5511999999999): 
set /p INSTAGRAM= Instagram (ex: @minhaloja): 
set /p TIKTOK= TikTok (opcional): 
set /p EMAIL_LOJA= E-mail de contato: 
set /p CEP_ORIGEM= CEP de origem para frete: 

:: Supabase
cls
echo.
echo  [3/7] Credenciais do Supabase
echo  ============================================================
:SB_URL
set /p SUPABASE_URL= NEXT_PUBLIC_SUPABASE_URL: 
if "!SUPABASE_URL!"=="" ( echo Obrigatorio! & goto :SB_URL )
:SB_ANON
set /p SUPABASE_ANON= NEXT_PUBLIC_SUPABASE_ANON_KEY: 
if "!SUPABASE_ANON!"=="" ( echo Obrigatorio! & goto :SB_ANON )
:SB_SVC
set /p SUPABASE_SERVICE= SUPABASE_SERVICE_ROLE_KEY: 
if "!SUPABASE_SERVICE!"=="" ( echo Obrigatorio! & goto :SB_SVC )

:: Pagamentos
cls
echo.
echo  [4/7] Credenciais de Pagamento
echo  ============================================================
set /p MP_TOKEN= MP_ACCESS_TOKEN: 
set /p MP_KEY= NEXT_PUBLIC_MP_PUBLIC_KEY: 
set /p PAGBANK= PAGBANK_TOKEN (ENTER para pular): 
set /p ME_TOKEN= MELHOR_ENVIO_TOKEN (ENTER para pular): 

:: Senha admin
:ADM_PASS
set /p ADMIN_PASS= Senha do painel /admin-loja: 
if "!ADMIN_PASS!"=="" ( echo Obrigatorio! & goto :ADM_PASS )

:: URL do site
if "!DOMINIO!"=="" (
    set SITE_URL=https://sua-loja.vercel.app
) else (
    set SITE_URL=https://!DOMINIO!
)

:: Confirmacao
cls
echo.
echo  [5/7] Confirmacao
echo  ============================================================
echo   Loja     : !NOME_LOJA!
echo   Dominio  : !DOMINIO!
echo   Supabase : !SUPABASE_URL!
echo.
set /p CONFIRMAR= Confirmar? (S/N): 
if /i "!CONFIRMAR!" neq "S" ( echo Cancelado. & pause & exit /b 0 )

:: Copiar e configurar
cls
echo.
echo  [6/7] Preparando projeto...
set DEST=C:\\GreenWeb\\LojaVirtual_Deploy
if not exist "C:\\GreenWeb" mkdir "C:\\GreenWeb"
if exist "!DEST!" rmdir /s /q "!DEST!"
mkdir "!DEST!"

xcopy /E /I /Y /Q "%~dp0app\\*" "!DEST!\\" >nul 2>&1

(
echo NEXT_PUBLIC_SUPABASE_URL=!SUPABASE_URL!
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=!SUPABASE_ANON!
echo SUPABASE_SERVICE_ROLE_KEY=!SUPABASE_SERVICE!
echo MP_ACCESS_TOKEN=!MP_TOKEN!
echo NEXT_PUBLIC_MP_PUBLIC_KEY=!MP_KEY!
echo PAGBANK_TOKEN=!PAGBANK!
echo MELHOR_ENVIO_TOKEN=!ME_TOKEN!
echo NEXT_PUBLIC_LOJA_NOME=!NOME_LOJA!
echo NEXT_PUBLIC_LOJA_WHATSAPP=!WHATSAPP!
echo NEXT_PUBLIC_LOJA_INSTAGRAM=!INSTAGRAM!
echo NEXT_PUBLIC_LOJA_TIKTOK=!TIKTOK!
echo NEXT_PUBLIC_LOJA_EMAIL=!EMAIL_LOJA!
echo NEXT_PUBLIC_CEP_ORIGEM=!CEP_ORIGEM!
echo NEXT_PUBLIC_SITE_URL=!SITE_URL!
echo ADMIN_PASSWORD=!ADMIN_PASS!
) > "!DEST!\\.env.local"

:: Vercel CLI
echo [7/7] Deploy na Vercel...
cd /d "!DEST!"
call npm install --silent

vercel --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Instalando Vercel CLI...
    call npm install -g vercel --silent
)

echo.
echo  Fazendo login na Vercel (abriria o navegador)...
vercel login

echo.
echo  Fazendo deploy...
vercel --prod

:: SQL para Desktop
set DESKTOP=%USERPROFILE%\\Desktop
if exist "!DEST!\\loja_virtual_banco.sql" (
    copy "!DEST!\\loja_virtual_banco.sql" "!DESKTOP!\\LojaVirtual_banco.sql" >nul
)

:: Script de deploy futuro
(
echo @echo off
echo title Deploy Loja Virtual - Vercel
echo cd /d C:\\GreenWeb\\LojaVirtual_Deploy
echo echo Fazendo deploy na Vercel...
echo vercel --prod
echo pause
) > "!DESKTOP!\\Deploy_LojaVirtual.bat"

cls
echo.
echo  ============================================================
echo   DEPLOY CONCLUIDO!
echo  ============================================================
echo   Loja      : !NOME_LOJA!
echo   URL Vercel : verificar no painel vercel.com
echo.
echo   Na Area de Trabalho:
echo     LojaVirtual_banco.sql   (execute no Supabase)
echo     Deploy_LojaVirtual.bat  (para deploys futuros)
echo.
echo   PROXIMO PASSO:
echo     1. Execute o SQL no Supabase
echo     2. Configure as variaveis de ambiente na Vercel:
echo        vercel.com > projeto > Settings > Environment Variables
echo     3. Aponte o dominio !DOMINIO! para a Vercel
echo  ============================================================
pause
"""

# ─────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────

def titulo(t):
    print()
    print("=" * 60)
    print(f"  {t}")
    print("=" * 60)

def ok(m):   print(f"  [OK] {m}")
def erro(m): print(f"  [ERRO] {m}")
def info(m): print(f"  {m}")

def deve_ignorar(nome):
    for ig in IGNORAR:
        if nome.startswith(ig) or nome == ig:
            return True
    return False

def copiar_limpo(src, dst):
    if os.path.exists(dst):
        info("Removendo pasta anterior...")
        shutil.rmtree(dst)
    os.makedirs(dst, exist_ok=True)

    for item in os.listdir(src):
        if deve_ignorar(item):
            continue
        s = os.path.join(src, item)
        d = os.path.join(dst, item)
        if os.path.isdir(s):
            shutil.copytree(s, d, ignore=shutil.ignore_patterns(
                ".next", "node_modules", "__pycache__", "*.pyc"
            ))
        else:
            shutil.copy2(s, d)

def zipar(pasta_src, zip_dst):
    nome_base = os.path.basename(pasta_src)
    total = 0
    with zipfile.ZipFile(zip_dst, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(pasta_src):
            dirs[:] = [d for d in dirs if d not in ("node_modules", ".next", "__pycache__")]
            for f in files:
                caminho = os.path.join(root, f)
                arcname = os.path.join(nome_base, os.path.relpath(caminho, os.path.dirname(pasta_src)))
                zf.write(caminho, arcname)
                total += 1
    return total

# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────

def main():
    print()
    print("=" * 60)
    print("  GreenWeb Softwares")
    print("  Gerador do Instalador — Loja Virtual v1.0.1")
    print("=" * 60)
    print()
    info(f"Origem  : {ORIGEM}")
    info(f"Limpa   : {DESTINO_LIMPO}")
    info(f"Destino : {PASTA_PACOTE}")
    print()

    if not os.path.isdir(ORIGEM):
        erro(f"Pasta origem nao encontrada: {ORIGEM}")
        input("\nPressione Enter para sair...")
        return

    resp = input("  Continuar? (S/N): ").strip().upper()
    if resp != "S":
        print("  Cancelado.")
        input("\nPressione Enter para sair...")
        return

    # ── 1. Copia pasta limpa ─────────────────────────────────
    titulo("PASSO 1 — Criando pasta limpa em C:\\GreenWeb\\LojaVirtual")
    info("Copiando e limpando dados do Brecho... (aguarde)")
    copiar_limpo(ORIGEM, DESTINO_LIMPO)
    ok(f"Pasta limpa criada: {DESTINO_LIMPO}")

    # ── 2. Monta estrutura do pacote ─────────────────────────
    titulo("PASSO 2 — Montando pacote do instalador")
    if os.path.exists(PASTA_PACOTE):
        shutil.rmtree(PASTA_PACOTE)
    os.makedirs(PASTA_PACOTE, exist_ok=True)

    pasta_app = os.path.join(PASTA_PACOTE, "app")
    os.makedirs(pasta_app, exist_ok=True)

    # Copia arquivos raiz
    arquivos_raiz = [
        "package.json", "package-lock.json", "next.config.js",
        "tsconfig.json", "tailwind.config.js", "postcss.config.js",
        "next-env.d.ts", "middleware.ts",
    ]
    for arq in arquivos_raiz:
        src = os.path.join(DESTINO_LIMPO, arq)
        if os.path.isfile(src):
            shutil.copy2(src, os.path.join(pasta_app, arq))
            ok(f"app\\{arq}")

    # Copia src\
    src_dir = os.path.join(DESTINO_LIMPO, "src")
    if os.path.isdir(src_dir):
        shutil.copytree(src_dir, os.path.join(pasta_app, "src"),
                       ignore=shutil.ignore_patterns("__pycache__", "*.pyc"))
        ok("app\\src\\")

    # Grava SQL do banco
    sql_path = os.path.join(pasta_app, "loja_virtual_banco.sql")
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write(SQL_BANCO)
    ok("app\\loja_virtual_banco.sql (SQL embutido)")

    # Copia script de servico Windows se existir
    svc_src = os.path.join(ORIGEM, "instalar_servico_lojavirtual.py")
    if os.path.isfile(svc_src):
        shutil.copy2(svc_src, os.path.join(pasta_app, "instalar_servico_lojavirtual.py"))
        ok("app\\instalar_servico_lojavirtual.py")

    # ── 3. Cria os dois BATs ─────────────────────────────────
    titulo("PASSO 3 — Criando instaladores BAT")

    bat_local_path = os.path.join(PASTA_PACOTE, "INSTALAR_LOJA_VIRTUAL_LOCAL.bat")
    with open(bat_local_path, "w", encoding="utf-8", newline="\r\n") as f:
        f.write(BAT_LOCAL)
    ok("INSTALAR_LOJA_VIRTUAL_LOCAL.bat")

    bat_vercel_path = os.path.join(PASTA_PACOTE, "INSTALAR_LOJA_VIRTUAL_VERCEL.bat")
    with open(bat_vercel_path, "w", encoding="utf-8", newline="\r\n") as f:
        f.write(BAT_VERCEL)
    ok("INSTALAR_LOJA_VIRTUAL_VERCEL.bat")

    # README
    readme = os.path.join(PASTA_PACOTE, "LEIA_ME.txt")
    with open(readme, "w", encoding="utf-8") as f:
        f.write("""GreenWeb Softwares — Loja Virtual v1.0.1
==========================================

COMO INSTALAR:

Opcao 1 — LOCAL (rodar no PC):
  Clique direito em INSTALAR_LOJA_VIRTUAL_LOCAL.bat
  Executar como administrador

Opcao 2 — VERCEL (publicar online):
  Clique direito em INSTALAR_LOJA_VIRTUAL_VERCEL.bat
  Executar como administrador

APOS INSTALAR:
  Execute o SQL no Supabase:
  supabase.com > SQL Editor > cole o arquivo .sql

SUPORTE:
  GreenWeb Softwares Ltda.
  WhatsApp: (11) 9-8196-2619
  greenwebsoftwares.com.br
""")
    ok("LEIA_ME.txt")

    # ── 4. Estrutura final ───────────────────────────────────
    titulo("PASSO 4 — Estrutura do pacote")
    for item in sorted(os.listdir(PASTA_PACOTE)):
        caminho = os.path.join(PASTA_PACOTE, item)
        if os.path.isdir(caminho):
            sub = os.listdir(caminho)
            info(f"  [pasta] {item}\\  ({len(sub)} itens)")
        else:
            tam = os.path.getsize(caminho)
            info(f"  [arq]   {item}  ({tam:,} bytes)")

    # ── 5. Gera ZIP ──────────────────────────────────────────
    titulo("PASSO 5 — Gerando ZIP")
    if os.path.exists(ZIP_FINAL):
        os.remove(ZIP_FINAL)
    total = zipar(PASTA_PACOTE, ZIP_FINAL)
    tam = os.path.getsize(ZIP_FINAL)
    ok(f"ZIP: {ZIP_FINAL}")
    ok(f"Arquivos: {total} | Tamanho: {tam/1024/1024:.1f} MB")

    # ── Resumo ───────────────────────────────────────────────
    titulo("PRONTO!")
    print()
    info("Na Area de Trabalho:")
    info(f"  [pasta] {NOME_PACOTE}\\")
    info(f"  [zip]   {NOME_PACOTE}.zip")
    print()
    info("Para TESTAR (versao local):")
    info("  Clique direito em INSTALAR_LOJA_VIRTUAL_LOCAL.bat")
    info("  Executar como administrador")
    print()
    info("Para PUBLICAR (versao Vercel):")
    info("  Clique direito em INSTALAR_LOJA_VIRTUAL_VERCEL.bat")
    info("  Executar como administrador")
    print()
    input("  Pressione Enter para sair...")

if __name__ == "__main__":
    main()
