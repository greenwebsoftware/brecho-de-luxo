'use client'
import { useState } from 'react'
import { User, Mail, Lock, Phone, MapPin, CreditCard, Calendar, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContaPage() {
  const [modo, setModo] = useState<'login' | 'cadastro' | 'recuperar'>('login')
  const [loading, setLoading] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)

  // Login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginSenha, setLoginSenha] = useState('')

  // Cadastro
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpf, setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [cep, setCep] = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')

  // Recuperar senha
  const [recuperarEmail, setRecuperarEmail] = useState('')

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

  const formatarCPF = (v: string) => {
    const nums = v.replace(/\D/g, '').slice(0, 11)
    return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatarTelefone = (v: string) => {
    const nums = v.replace(/\D/g, '').slice(0, 11)
    if (nums.length <= 10) return nums.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail || !loginSenha) { toast.error('Preencha todos os campos'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.error('Login de clientes em breve!')
    setLoading(false)
  }

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome || !email || !senha || !cpf || !telefone) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    if (senha !== confirmarSenha) {
      toast.error('As senhas não coincidem')
      return
    }
    if (senha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.success('Cadastro realizado com sucesso! Em breve você poderá fazer login.')
    setLoading(false)
  }

  const handleRecuperar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recuperarEmail) { toast.error('Informe seu e-mail'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.success('Se este e-mail estiver cadastrado, você receberá as instruções em breve.')
    setLoading(false)
    setModo('login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <div className="bg-gradient-to-br from-luxo-900 to-luxo-800 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-serif text-white text-4xl font-bold mb-2">
            {modo === 'login' ? 'Minha Conta' : modo === 'cadastro' ? 'Criar Conta' : 'Recuperar Senha'}
          </h1>
          <p className="text-gold-300 text-sm">
            {modo === 'login' ? 'Acesse sua conta para acompanhar seus pedidos'
              : modo === 'cadastro' ? 'Cadastre-se para uma experiência personalizada'
              : 'Enviaremos as instruções para o seu e-mail'}
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-12">

        {/* ABAS LOGIN/CADASTRO */}
        {modo !== 'recuperar' && (
          <div className="flex bg-white rounded-2xl shadow-sm p-1 mb-6">
            <button onClick={() => setModo('login')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                modo === 'login' ? 'bg-luxo-900 text-white shadow' : 'text-gray-500 hover:text-gray-700'
              }`}>
              Entrar
            </button>
            <button onClick={() => setModo('cadastro')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                modo === 'cadastro' ? 'bg-luxo-900 text-white shadow' : 'text-gray-500 hover:text-gray-700'
              }`}>
              Criar Conta
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-8">

          {/* LOGIN */}
          {modo === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">E-mail *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                    className="input-luxo pl-10" placeholder="seu@email.com" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Senha *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={mostrarSenha ? 'text' : 'password'} value={loginSenha}
                    onChange={e => setLoginSenha(e.target.value)}
                    className="input-luxo pl-10 pr-10" placeholder="Sua senha" />
                  <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setModo('recuperar')}
                  className="text-xs text-gold-600 hover:underline">
                  Esqueci minha senha
                </button>
              </div>
              <button type="submit" disabled={loading} className="btn-gold w-full justify-center disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
              <p className="text-center text-sm text-gray-500">
                Não tem conta?{' '}
                <button type="button" onClick={() => setModo('cadastro')} className="text-gold-600 font-medium hover:underline">
                  Cadastre-se grátis
                </button>
              </p>
            </form>
          )}

          {/* CADASTRO */}
          {modo === 'cadastro' && (
            <form onSubmit={handleCadastro} className="space-y-4">
              <h3 className="font-semibold text-gray-700 text-sm border-b border-gray-100 pb-2">Dados Pessoais</h3>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Nome completo *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={nome} onChange={e => setNome(e.target.value)}
                    className="input-luxo pl-10" placeholder="Seu nome completo" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">CPF *</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={cpf} onChange={e => setCpf(formatarCPF(e.target.value))}
                      className="input-luxo pl-10" placeholder="000.000.000-00" maxLength={14} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Data de Nascimento</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)}
                      className="input-luxo pl-10" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">E-mail *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="input-luxo pl-10" placeholder="seu@email.com" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Telefone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={telefone} onChange={e => setTelefone(formatarTelefone(e.target.value))}
                      className="input-luxo pl-10" placeholder="(11) 9-0000-0000" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Senha *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={mostrarSenha ? 'text' : 'password'} value={senha}
                      onChange={e => setSenha(e.target.value)}
                      className="input-luxo pl-10" placeholder="Mín. 6 caracteres" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Confirmar Senha *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={mostrarSenha ? 'text' : 'password'} value={confirmarSenha}
                      onChange={e => setConfirmarSenha(e.target.value)}
                      className="input-luxo pl-10" placeholder="Repita a senha" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="mostrar-senha" checked={mostrarSenha}
                  onChange={e => setMostrarSenha(e.target.checked)}
                  className="w-4 h-4 accent-gold-500" />
                <label htmlFor="mostrar-senha" className="text-xs text-gray-500">Mostrar senhas</label>
              </div>

              <h3 className="font-semibold text-gray-700 text-sm border-b border-gray-100 pb-2 pt-2">
                Endereço <span className="text-gray-400 font-normal">(opcional)</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">CEP</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={cep} onChange={e => { setCep(e.target.value); buscarCep(e.target.value) }}
                      className="input-luxo pl-10" placeholder="00000-000" maxLength={9} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Número</label>
                  <input value={numero} onChange={e => setNumero(e.target.value)}
                    className="input-luxo" placeholder="123" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Logradouro</label>
                  <input value={logradouro} onChange={e => setLogradouro(e.target.value)}
                    className="input-luxo" placeholder="Rua, Av..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Complemento</label>
                  <input value={complemento} onChange={e => setComplemento(e.target.value)}
                    className="input-luxo" placeholder="Apto, bloco..." />
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
                  <input value={uf} onChange={e => setUf(e.target.value.toUpperCase())}
                    className="input-luxo" maxLength={2} />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-gold w-full justify-center disabled:opacity-50 mt-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
                {loading ? 'Criando conta...' : 'Criar Minha Conta'}
              </button>
              <p className="text-center text-xs text-gray-400">
                Ao criar sua conta você concorda com nossa{' '}
                <a href="#" className="text-gold-600 hover:underline">política de privacidade</a>
              </p>
            </form>
          )}

          {/* RECUPERAR SENHA */}
          {modo === 'recuperar' && (
            <form onSubmit={handleRecuperar} className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">
                Digite seu e-mail cadastrado e enviaremos as instruções para redefinir sua senha.
              </p>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">E-mail *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={recuperarEmail} onChange={e => setRecuperarEmail(e.target.value)}
                    className="input-luxo pl-10" placeholder="seu@email.com" autoFocus />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-gold w-full justify-center disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {loading ? 'Enviando...' : 'Enviar Instruções'}
              </button>
              <button type="button" onClick={() => setModo('login')}
                className="w-full text-center text-sm text-gray-500 hover:text-gold-600 transition-colors">
                ← Voltar ao login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
