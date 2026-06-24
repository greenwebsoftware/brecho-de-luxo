'use client'
import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'

export default function ContadorVisitas() {
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/visitas')
      .then(res => res.json())
      .then(data => setTotal(data.total))
      .catch(() => {})
  }, [])

  if (!total) return null

  return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      <Users className="w-3.5 h-3.5 text-gold-400" />
      <span><strong className="text-gold-500">{total.toLocaleString('pt-BR')}</strong> visitas</span>
    </div>
  )
}
