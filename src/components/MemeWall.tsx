import { useEffect, useState } from 'react'
import { getAllMemes, MemeRecord } from '../db'
import { formatNumber } from '../config'

interface Props {
  refreshKey: number
}

export default function MemeWall({ refreshKey }: Props) {
  const [memes, setMemes] = useState<MemeRecord[]>([])

  useEffect(() => {
    getAllMemes().then(setMemes)
  }, [refreshKey])

  if (memes.length === 0) {
    return (
      <section className="max-w-4xl mx-auto px-4 py-6">
        <div className="rounded-2xl border border-gray-700/50 p-8 text-center" style={{ background: 'rgba(15,10,30,0.8)' }}>
          <div className="text-5xl mb-3">🦛</div>
          <h2 className="text-xl font-bold text-gray-400 mb-2">梗图墙空空如也</h2>
          <p className="text-gray-600 text-sm">生成你的第一张河马梗图，它将出现在这里！</p>
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-6">
      <div className="rounded-2xl border border-gray-700/50 p-6" style={{ background: 'rgba(15,10,30,0.8)' }}>
        <h2 className="text-2xl font-bold text-gray-300 mb-4">🖼️ 梗图墙 ({memes.length} 张)</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {memes.map((meme, i) => (
            <div
              key={meme.id ?? i}
              className="rounded-xl border border-purple-800/40 overflow-hidden bg-gray-900/60 hover:border-purple-600/60 transition-all"
            >
              <img
                src={meme.imageUrl}
                alt={`Hippo meme: ${meme.keyword}`}
                className="w-full aspect-square object-cover"
                loading="lazy"
              />
              <div className="p-2">
                <div className="text-purple-300 text-xs font-semibold truncate">{meme.keyword}</div>
                <div className="text-gray-500 text-xs mt-0.5">
                  {new Date(meme.timestamp).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex justify-between mt-1 text-xs">
                  <span className="text-blue-400">池:{formatNumber(meme.allocation.holderPool)}</span>
                  <span className="text-red-400">🔥{formatNumber(meme.allocation.blackhole)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
