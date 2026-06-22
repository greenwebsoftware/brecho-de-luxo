'use client'
import { useState, useEffect } from 'react'
import { Mail, Instagram, MessageCircle, Send, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface SiteConfig {
  whatsapp?: string
  instagram?: string
  email_contato?: string
}

export default function ContatoPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [assunto, setAssunto] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<SiteConfig>({})

  useEffect(() => {
    fetch('/api/site-config', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setConfig(data.data || {}))
      .catch(() => {})
  }, [])

  const waNumero = config.whatsapp || '5511900000000'
  const waLink = `https://wa.me/${waNumero}`
  const igUser = (config.instagram || 'brechodeluxo').startsWith('http') ? (config.instagram || '').replace(/.*instagram\.com\//, '').replace(/\//g, '') : (config.instagram || 'brechodeluxo').replace('@', '')
  const igLink = (config.instagram || '').startsWith('http') ? (config.instagram || '') : `https://instagram.com/${(config.instagram || 'brechodeluxo').replace('@', '')}`
  const emailFinal = config.email_contato || 'contato@brechodeluxo.com.br'
  const telExibido = waNumero.length >= 12
    ? `(${waNumero.slice(2, 4)}) 9-${waNumero.slice(5, 9)}-${waNumero.slice(9)}`
    : '(11) 9-0000-0000'

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome || !email || !mensagem) { toast.error('Preencha todos os campos'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    toast.success('Mensagem enviada! Retornaremos em breve.')
    setNome(''); setEmail(''); setAssunto(''); setMensagem('')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-luxo-900 to-luxo-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-serif text-white text-4xl font-bold mb-3">Fale Conosco</h1>
          <p className="text-gold-300">Estamos aqui para ajudar você</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 grid md:grid-cols-2 gap-10">
        {/* FORMULARIO */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="font-serif text-2xl font-bold text-luxo-900 mb-6">Envie uma mensagem</h2>
          <form onSubmit={enviar} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Nome *</label>
              <input value={nome} onChange={e => setNome(e.target.value)} className="input-luxo" placeholder="Seu nome" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">E-mail *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-luxo" placeholder="seu@email.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Assunto</label>
              <input value={assunto} onChange={e => setAssunto(e.target.value)} className="input-luxo" placeholder="Como podemos ajudar?" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Mensagem *</label>
              <textarea value={mensagem} onChange={e => setMensagem(e.target.value)}
                rows={5} className="input-luxo resize-none" placeholder="Escreva sua mensagem..." />
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full justify-center disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Enviando...' : 'Enviar Mensagem'}
            </button>
          </form>
        </div>

        {/* CONTATOS */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Canais de Atendimento</h3>
            <div className="space-y-4">
              <a href={waLink} target="_blank" rel="noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">WhatsApp</p>
                  <p className="text-sm text-gray-500">{telExibido}</p>
                </div>
              </a>
              <a href={`mailto:${emailFinal}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-gold-50 hover:bg-gold-100 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">E-mail</p>
                  <p className="text-sm text-gray-500">{emailFinal}</p>
                </div>
              </a>
              <a href={igLink} target="_blank" rel="noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Instagram</p>
                  <p className="text-sm text-gray-500">@{igUser}</p>
                </div>
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Horário de Atendimento</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Segunda a Sexta</span>
                <span className="font-medium">9h — 18h</span>
              </div>
              <div className="flex justify-between">
                <span>Sábado</span>
                <span className="font-medium">9h — 13h</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Domingo</span>
                <span>Fechado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
