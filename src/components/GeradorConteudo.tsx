'use client'
import { useState } from 'react'
import { Copy, Check, Instagram, Facebook, Share2, Clock, Hash } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  produto?: {
    nome: string
    preco: number
    descricao?: string
    marca?: string
    categoria?: string
    imagem?: string
  }
  post?: {
    titulo: string
    resumo?: string
    tags?: string[]
  }
  onFechar?: () => void
}

const HASHTAGS_BASE = [
  '#brechodeluxo', '#brechó', '#modaCircular', '#modaSustentavel',
  '#luxoAcessivel', '#pecasUnicas', '#segundaMao', '#moda', '#estilo',
  '#fashion', '#ootd', '#lookdodia', '#modafeminina', '#luxo',
]

const HASHTAGS_CATEGORIA: Record<string, string[]> = {
  bolsas: ['#bolsas', '#bolsasdeluxo', '#handbag', '#louisvuitton', '#chanel', '#bolsasegundamao'],
  roupas: ['#roupas', '#vestuario', '#roupa', '#modafeminina', '#modamasculina'],
  calcados: ['#calcados', '#sapatos', '#shoes', '#tenis', '#sandalias'],
  acessorios: ['#acessorios', '#joias', '#relogios', '#oculos', '#acessoriosfemininos'],
}

const HORARIOS_IDEAIS = [
  { hora: '8h', desc: 'Manhã — pessoas acordando e vendo o celular' },
  { hora: '12h', desc: 'Almoço — pico de engajamento' },
  { hora: '18h', desc: 'Fim do expediente — muito acesso' },
  { hora: '20h', desc: 'Noite — melhor horário para vendas' },
]

function gerarTexto(rede: string, props: Props): string {
  const { produto, post } = props

  if (produto) {
    const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
    const emojis = { instagram: '✨', facebook: '🛍️', tiktok: '🎀' }
    const emoji = emojis[rede as keyof typeof emojis] || '✨'

    const hashtags = [
      ...HASHTAGS_BASE.slice(0, 5),
      ...(HASHTAGS_CATEGORIA[produto.categoria?.toLowerCase() || ''] || []).slice(0, 4),
      produto.marca ? `#${produto.marca.toLowerCase().replace(/\s/g, '')}` : '',
    ].filter(Boolean).join(' ')

    if (rede === 'instagram') {
      return `${emoji} ${produto.nome.toUpperCase()} ${emoji}

${produto.descricao || 'Peça exclusiva em perfeito estado, selecionada com muito cuidado para você!'}

${produto.marca ? `🏷️ Marca: ${produto.marca}` : ''}
💰 Apenas ${fmt(produto.preco)}

🛒 Acesse o link na bio e garanta a sua!
📦 Enviamos para todo o Brasil
✅ Autenticidade garantida

${hashtags}
#brechodeluxo #${produto.nome.toLowerCase().replace(/\s/g, '')}`
    }

    if (rede === 'facebook') {
      return `🛍️ NOVA PEÇA DISPONÍVEL!

${produto.nome}${produto.marca ? ` — ${produto.marca}` : ''}

${produto.descricao || 'Peça selecionada com cuidado, em excelente estado de conservação.'}

💰 Por apenas ${fmt(produto.preco)}
📦 Entrega para todo o Brasil
✅ Autenticidade garantida

👉 Acesse nossa loja: brechodluxo.com.br

Curta e compartilhe com quem vai amar! ❤️`
    }

    if (rede === 'tiktok') {
      return `${produto.nome} por ${fmt(produto.preco)}! 😱✨

${produto.descricao || 'Olha que peça incrível!'}

🔗 Link na bio
#brechodeluxo #moda #brechó #ootd #pecasUnicas #modaSustentavel #${(produto.marca || '').toLowerCase().replace(/\s/g, '')} #fyp #foryou`
    }
  }

  if (post) {
    const hashtags = (post.tags || []).map(t => `#${t.replace(/\s/g, '')}`).join(' ')

    if (rede === 'instagram') {
      return `✍️ Novo no Blog!

${post.titulo}

${post.resumo || 'Confira nosso novo post no blog do Brechó de Luxo!'}

🔗 Leia na íntegra: brechodluxo.com.br/blog

${hashtags} #brechodeluxo #blog #moda #dicas`
    }

    if (rede === 'facebook') {
      return `📖 Novo post no nosso Blog!

"${post.titulo}"

${post.resumo || 'Confira nosso novo conteúdo exclusivo sobre moda e estilo!'}

👉 Leia completo em: brechodluxo.com.br/blog

Curta e compartilhe! ❤️`
    }

    if (rede === 'tiktok') {
      return `Novo post no blog! 📖✨

${post.titulo}

Acessa: brechodluxo.com.br/blog

${hashtags} #brechodeluxo #moda #dicas #blog #fyp`
    }
  }

  return ''
}

export default function GeradorConteudo({ produto, post, onFechar }: Props) {
  const [redeSel, setRedeSel] = useState<'instagram' | 'facebook' | 'tiktok'>('instagram')
  const [copiado, setCopiado] = useState(false)
  const [textoEditado, setTextoEditado] = useState('')
  const [editando, setEditando] = useState(false)

  const texto = editando ? textoEditado : gerarTexto(redeSel, { produto, post })

  const copiar = async () => {
    await navigator.clipboard.writeText(texto)
    setCopiado(true)
    toast.success('Copiado para a área de transferência!')
    setTimeout(() => setCopiado(false), 2000)
  }

  const abrirRede = () => {
    const urls: Record<string, string> = {
      instagram: 'https://www.instagram.com/',
      facebook: 'https://www.facebook.com/',
      tiktok: 'https://www.tiktok.com/',
    }
    window.open(urls[redeSel], '_blank')
  }

  const horario = HORARIOS_IDEAIS[Math.floor(Math.random() * HORARIOS_IDEAIS.length)]

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-full max-w-lg">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-gold-500" />
          <h3 className="font-semibold text-gray-800">Gerar Conteúdo para Redes</h3>
        </div>
        {onFechar && (
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        )}
      </div>

      {/* SELECAO DE REDE */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'instagram', label: 'Instagram', cor: 'from-purple-500 to-pink-500' },
          { key: 'facebook', label: 'Facebook', cor: 'from-blue-600 to-blue-500' },
          { key: 'tiktok', label: 'TikTok', cor: 'from-gray-900 to-gray-700' },
        ].map(r => (
          <button key={r.key} onClick={() => { setRedeSel(r.key as typeof redeSel); setEditando(false) }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r transition-all ${r.cor} ${redeSel === r.key ? 'opacity-100 shadow-md scale-105' : 'opacity-50'}`}>
            {r.label}
          </button>
        ))}
      </div>

      {/* SUGESTAO DE HORARIO */}
      <div className="flex items-center gap-2 bg-gold-50 rounded-xl p-3 mb-4 text-xs">
        <Clock className="w-4 h-4 text-gold-500 flex-shrink-0" />
        <span className="text-gray-600">
          <strong className="text-gold-600">Melhor horário:</strong> {horario.hora} — {horario.desc}
        </span>
      </div>

      {/* TEXTO GERADO */}
      <div className="relative mb-4">
        <textarea
          value={texto}
          onChange={e => { setTextoEditado(e.target.value); setEditando(true) }}
          rows={10}
          className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-700 outline-none focus:border-gold-400 resize-none font-mono leading-relaxed"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">
            {texto.length} chars
          </span>
        </div>
      </div>

      {/* HASHTAGS EXTRAS */}
      <div className="mb-4">
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
          <Hash className="w-3.5 h-3.5" /> Hashtags incluídas
        </div>
        <div className="flex flex-wrap gap-1">
          {HASHTAGS_BASE.slice(0, 6).map((h, i) => (
            <span key={i} className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">{h}</span>
          ))}
        </div>
      </div>

      {/* BOTOES */}
      <div className="flex gap-2">
        <button onClick={copiar}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
            copiado ? 'bg-green-500 text-white' : 'bg-gold-500 hover:bg-gold-600 text-white'
          }`}>
          {copiado ? <><Check className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar Texto</>}
        </button>
        <button onClick={abrirRede}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">
          <Share2 className="w-4 h-4" /> Abrir {redeSel === 'instagram' ? 'Instagram' : redeSel === 'facebook' ? 'Facebook' : 'TikTok'}
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center mt-3">
        Edite o texto acima antes de copiar se quiser personalizar
      </p>
    </div>
  )
}
