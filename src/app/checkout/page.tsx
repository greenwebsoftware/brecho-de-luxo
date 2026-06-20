'use client'
import { useState, useEffect } from 'react'
import { useCarrinho } from '../../lib/carrinhoContext'
import { Trash2, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const { itens, totalValor, removerItem, atualizarQtd, limparCarrinho } = useCarrinho()
  const [etapa, setEtapa] = useState<'carrinho' | 'dados' | 'pagamento'>('carrinho')
  const [loading, setLoading] = useState(false)

  const [freteGratisAcima, setFreteGratisAcima] = useState(299)
  const [freteFixo, setFreteFixo] = useState(19.90)

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cep, setCep] = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')

  useEffect(() => {
    fetch('/api/site-config', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.data?.frete_gratis_acima) setFreteGratisAcima(Number(data.data.frete_gratis_acima))
        if (data.data?.frete_fixo) setFreteFixo(Number(data.data.frete_fixo))
      })
      .catch(() => {})
  }, [])

  const frete = totalValor >= freteGratisAcima ? 0 : freteFixo
  const total = totalValor + frete
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  const buscarCep = async (cepVal: string) => {
    const clean = cepVal.replace(/\D/g, '')
    if (clean.length !== 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setLogradouro(data.logradouro)
        setBairro(data.bairro)
        setCidade(data.localidade)
        setUf(data.uf)
      }
    } catch {}
  }

  const irParaPagamento = async () => {
    if (!nome || !email || !cep || !logradouro || !numero) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itens: itens.map(i => ({
            produto_id: i.produto_id,
            nome: i.nome,
            preco: i.preco,
            quantidade: i.quantidade,
            tamanho: i.tamanho,
            cor: i.cor,
          })),
          cliente: { nome, email, telefone },
          endereco: { cep, logradouro, numero, complemento, bairro, cidade, uf },
          frete,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      limparCarrinho()
      window.location.href = data.mp_init_point
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao processar pagamento')
    }
    setLoading(false)
  }

  if (itens.length === 0 && etapa === 'carrinho') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-gray-700 mb-2">Seu carrinho está vazio</h2>
          <p className="text-gray-400 mb-6">Adicione algumas peças incríveis!</p>
          <Link href="/loja" className="btn-gold">Ver a Coleção</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif text-3xl font-bold text-luxo-900 mb-8">
          {etapa === 'carrinho' ? 'Meu Carrinho' : etapa === 'dados' ? 'Dados de Entrega' : 'Pagamento'}
        </h1>

        {/* STEPS */}
        <div className="flex items-center gap-2 mb-8">
          {['carrinho', 'dados', 'pagamento'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className={`h-px flex-1 w-12 ${['dados','pagamento'].includes(etapa) && i === 1 ? 'bg-gold-500' : etapa === 'pagamento' && i === 2 ? 'bg-gold-500' : 'bg-gray-200'}`} />}
              <div className={`flex items-center gap-2 text-sm font-medium ${etapa === s ? 'text-gold-600' : ['dados','pagamento'].indexOf(s) < ['carrinho','dados','pagamento'].indexOf(etapa) ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${etapa === s ? 'bg-gold-500 text-white' : ['carrinho','dados','pagamento'].indexOf(s) < ['carrinho','dados','pagamento'].indexOf(etapa) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {i + 1}
                </div>
                <span className="capitalize hidden sm:block">{s}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* CONTEUDO PRINCIPAL */}
          <div className="lg:col-span-2">

            {/* ETAPA CARRINHO */}
            {etapa === 'carrinho' && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {itens.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 border-b border-gray-50 last:border-0">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                      {item.imagem
                        ? <img src={item.imagem} alt={item.nome} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">👜</div>
                      }
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{item.nome}</p>
                      {(item.tamanho || item.cor) && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {[item.tamanho, item.cor].filter(Boolean).join(' — ')}
                        </p>
                      )}
                      <p className="text-gold-600 font-bold mt-1">{fmt(item.preco)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button onClick={() => atualizarQtd(item.produto_id, item.quantidade - 1, item.tamanho, item.cor)}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-lg">-</button>
                          <span className="w-8 text-center text-sm">{item.quantidade}</span>
                          <button onClick={() => atualizarQtd(item.produto_id, item.quantidade + 1, item.tamanho, item.cor)}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-lg">+</button>
                        </div>
                        <button onClick={() => removerItem(item.produto_id, item.tamanho, item.cor)}
                          className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ETAPA DADOS */}
            {etapa === 'dados' && (
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                <h3 className="font-semibold text-gray-800 mb-4">Seus dados</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Nome completo *</label>
                    <input value={nome} onChange={e => setNome(e.target.value)} className="input-luxo" placeholder="Seu nome" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">E-mail *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-luxo" placeholder="seu@email.com" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Telefone</label>
                    <input value={telefone} onChange={e => setTelefone(e.target.value)} className="input-luxo" placeholder="(11) 9-0000-0000" />
                  </div>
                </div>

                <h3 className="font-semibold text-gray-800 pt-4">Endereço de entrega</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">CEP *</label>
                    <input value={cep} onChange={e => { setCep(e.target.value); buscarCep(e.target.value) }}
                      className="input-luxo" placeholder="00000-000" maxLength={9} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Logradouro *</label>
                    <input value={logradouro} onChange={e => setLogradouro(e.target.value)} className="input-luxo" placeholder="Rua, Av..." />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Número *</label>
                    <input value={numero} onChange={e => setNumero(e.target.value)} className="input-luxo" placeholder="123" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Complemento</label>
                    <input value={complemento} onChange={e => setComplemento(e.target.value)} className="input-luxo" placeholder="Apto, bloco..." />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Bairro</label>
                    <input value={bairro} onChange={e => setBairro(e.target.value)} className="input-luxo" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Cidade</label>
                    <input value={cidade} onChange={e => setCidade(e.target.value)} className="input-luxo" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">UF</label>
                    <input value={uf} onChange={e => setUf(e.target.value.toUpperCase())} className="input-luxo" maxLength={2} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RESUMO PEDIDO */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-24">
              <h3 className="font-semibold text-gray-800 mb-4">Resumo</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itens.length} itens)</span>
                  <span>{fmt(totalValor)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frete</span>
                  <span className={frete === 0 ? 'text-green-600 font-medium' : ''}>
                    {frete === 0 ? 'Grátis' : fmt(frete)}
                  </span>
                </div>
                {frete === 0 ? (
                  <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
                    ✓ Frete grátis por compra acima de {fmt(freteGratisAcima)}!
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                    Faltam {fmt(freteGratisAcima - totalValor)} para frete grátis
                  </p>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-gold-600">{fmt(total)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {etapa === 'carrinho' && (
                  <button onClick={() => setEtapa('dados')} className="btn-gold w-full justify-center">
                    Continuar <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {etapa === 'dados' && (
                  <>
                    <button onClick={irParaPagamento} disabled={loading}
                      className="btn-gold w-full justify-center disabled:opacity-50">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      {loading ? 'Aguarde...' : 'Ir para Pagamento'}
                    </button>
                    <button onClick={() => setEtapa('carrinho')} className="btn-outline w-full justify-center text-sm">
                      Voltar
                    </button>
                  </>
                )}
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <span>🔒</span> Pagamento 100% seguro via Mercado Pago
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
