'use client'
import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Lock, Save, Loader2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Usuario {
  id: string; email: string; nome?: string; telefone?: string
  cpf?: string; data_nascimento?: string; cep?: string
  logradouro?: string; numero?: string; complemento?: string
  bairro?: string; cidade?: string; uf?: string
}

export default function ConfiguracoesPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cep, setCep] = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')

  useEffect(() => {
    carregarUsuario()
  }, [])

  const carregarUsuario = async () => {
    const res = await fetch('/api/auth')
    const data = await res.json()
    if (!data.usuario) { window.location.href = '/conta'; return }
    const u = data.usuario
    setUsuario(u)
    setNome(u.nome || '')
    setTelefone(u.telefone || '')
    setCep(u.cep || '')
    setLogradouro(u.logradouro || '')
    setNumero(u.numero || '')
    setComplemento(u.complemento || '')
    setBairro(u.bairro || '')
    setCidade(u.cidade || '')
    setUf(u.uf || '')
    setLoading(false)
  }

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

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (novaSenha && novaSenha !== confirmarSenha) {
      toast.error('As senhas não coincidem'); return
    }
    if (novaSenha && novaSenha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres'); return
    }
    setSalvando(true)
    try {
      const res = await fetch('/api/auth/atualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome, telefone, nova_senha: novaSenha || null,
          endereco: { cep, logradouro, numero, complemento, bairro, cidade, uf }
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Dados atualizados com sucesso!')
      setNovaSenha('')
      setConfirmarSenha('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
    }
    setSalvando(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-luxo-900 to-luxo-800 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Link href="/conta" className="text-gold-300 hover:text-white text-sm transition-colors">
            ← Minha Conta
          </Link>
          <h1 className="font-serif text-white text-4xl font-bold mt-3">Configurações</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <form onSubmit={salvar} className="space-y-6">

          {/* DADOS PESSOAIS */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-gold-500" /> Dados Pessoais
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Nome completo</label>
                <input value={nome} onChange={e => setNome(e.target.value)} className="input-luxo" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input value={usuario?.email || ''} disabled
                      className="input-luxo pl-10 bg-gray-50 text-gray-400 cursor-not-allowed" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={telefone} onChange={e => setTelefone(e.target.value)}
                      className="input-luxo pl-10" placeholder="(11) 9-0000-0000" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ENDERECO */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold-500" /> Endereço de Entrega
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">CEP</label>
                <input value={cep} onChange={e => { setCep(e.target.value); buscarCep(e.target.value) }}
                  className="input-luxo" placeholder="00000-000" maxLength={9} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Número</label>
                <input value={numero} onChange={e => setNumero(e.target.value)} className="input-luxo" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Logradouro</label>
                <input value={logradouro} onChange={e => setLogradouro(e.target.value)} className="input-luxo" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Complemento</label>
                <input value={complemento} onChange={e => setComplemento(e.target.value)} className="input-luxo" />
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

          {/* ALTERAR SENHA */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-gold-500" /> Alterar Senha
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Nova senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={mostrarSenha ? 'text' : 'password'} value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                    className="input-luxo pl-10" placeholder="Mín. 6 caracteres" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Confirmar nova senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={mostrarSenha ? 'text' : 'password'} value={confirmarSenha}
                    onChange={e => setConfirmarSenha(e.target.value)}
                    className="input-luxo pl-10" placeholder="Repita a senha" />
                  <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Deixe em branco para não alterar a senha</p>
          </div>

          <button type="submit" disabled={salvando} className="btn-gold w-full justify-center disabled:opacity-50">
            {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {salvando ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}
