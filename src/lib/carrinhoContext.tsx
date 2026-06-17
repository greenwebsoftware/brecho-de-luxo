'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export interface ItemCarrinho {
  produto_id: string
  nome: string
  preco: number
  imagem?: string
  tamanho?: string
  cor?: string
  quantidade: number
}

interface CarrinhoContextType {
  itens: ItemCarrinho[]
  totalItens: number
  totalValor: number
  adicionarItem: (item: Omit<ItemCarrinho, 'quantidade'>) => void
  removerItem: (produto_id: string, tamanho?: string, cor?: string) => void
  atualizarQtd: (produto_id: string, quantidade: number, tamanho?: string, cor?: string) => void
  limparCarrinho: () => void
}

const CarrinhoContext = createContext<CarrinhoContextType>({} as CarrinhoContextType)

export function CarrinhoProvider({ children }: { children: React.ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([])

  // Carrega do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('brecho_carrinho')
      if (saved) setItens(JSON.parse(saved))
    } catch {}
  }, [])

  // Salva no localStorage
  useEffect(() => {
    localStorage.setItem('brecho_carrinho', JSON.stringify(itens))
  }, [itens])

  const totalItens = itens.reduce((s, i) => s + i.quantidade, 0)
  const totalValor = itens.reduce((s, i) => s + i.preco * i.quantidade, 0)

  const adicionarItem = (item: Omit<ItemCarrinho, 'quantidade'>) => {
    setItens(prev => {
      const existe = prev.find(i =>
        i.produto_id === item.produto_id &&
        i.tamanho === item.tamanho &&
        i.cor === item.cor
      )
      if (existe) {
        toast.error('Item ja esta no carrinho')
        return prev
      }
      toast.success('Adicionado ao carrinho!')
      return [...prev, { ...item, quantidade: 1 }]
    })
  }

  const removerItem = (produto_id: string, tamanho?: string, cor?: string) => {
    setItens(prev => prev.filter(i =>
      !(i.produto_id === produto_id && i.tamanho === tamanho && i.cor === cor)
    ))
  }

  const atualizarQtd = (produto_id: string, quantidade: number, tamanho?: string, cor?: string) => {
    if (quantidade < 1) { removerItem(produto_id, tamanho, cor); return }
    setItens(prev => prev.map(i =>
      i.produto_id === produto_id && i.tamanho === tamanho && i.cor === cor
        ? { ...i, quantidade }
        : i
    ))
  }

  const limparCarrinho = () => setItens([])

  return (
    <CarrinhoContext.Provider value={{
      itens, totalItens, totalValor,
      adicionarItem, removerItem, atualizarQtd, limparCarrinho,
    }}>
      {children}
    </CarrinhoContext.Provider>
  )
}

export const useCarrinho = () => useContext(CarrinhoContext)
