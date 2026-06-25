import os

base = os.path.dirname(os.path.abspath(__file__))

# Adiciona a chave secreta no .env.local
env_fp = os.path.join(base, '.env.local')
with open(env_fp, 'r', encoding='utf-8') as f:
    c = f.read()

if 'MP_WEBHOOK_SECRET' not in c:
    c += '\nMP_WEBHOOK_SECRET=30a80bb6215e9f9b68465edf55522ae4c8baca4e0d6cb0c3d3a383b65ee543f7\n'
    with open(env_fp, 'w', encoding='utf-8') as f:
        f.write(c)
    print('OK: MP_WEBHOOK_SECRET adicionado no .env.local')
else:
    print('OK: MP_WEBHOOK_SECRET ja existe')

# Atualiza o webhook para validar a assinatura
webhook_fp = os.path.join(base, 'src', 'app', 'api', 'webhook', 'mercadopago', 'route.ts')
with open(webhook_fp, 'r', encoding='utf-8') as f:
    c = f.read()

if 'MP_WEBHOOK_SECRET' not in c:
    # Adiciona validacao da assinatura no inicio da funcao POST
    c = c.replace(
        "  try {\n    const body = await req.json()",
        """  try {
    // Valida assinatura do Mercado Pago
    const secret = process.env.MP_WEBHOOK_SECRET
    if (secret) {
      const xSignature = req.headers.get('x-signature')
      const xRequestId = req.headers.get('x-request-id')
      const urlParams = new URL(req.url).searchParams
      const dataId = urlParams.get('data.id')

      if (xSignature) {
        const parts = xSignature.split(',')
        const ts = parts.find(p => p.startsWith('ts='))?.split('=')[1]
        const v1 = parts.find(p => p.startsWith('v1='))?.split('=')[1]

        if (ts && v1) {
          const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
          const encoder = new TextEncoder()
          const keyData = encoder.encode(secret)
          const msgData = encoder.encode(manifest)
          const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
          const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData)
          const hashHex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('')
          if (hashHex !== v1) {
            console.warn('Webhook: assinatura inválida')
            return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
          }
        }
      }
    }

    const body = await req.json()"""
    )
    with open(webhook_fp, 'w', encoding='utf-8', newline='\n') as f:
        f.write(c)
    print('OK: Validacao de assinatura adicionada no webhook')
else:
    print('OK: Validacao ja existe')

print()
print('Rode: npm run build')
