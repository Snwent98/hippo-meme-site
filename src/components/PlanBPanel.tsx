import { CONFIG, getCurrentTier, getNextTier, formatNumber } from '../config'

interface Props {
  todayCount: number
}

export default function PlanBPanel({ todayCount }: Props) {
  const currentTier = getCurrentTier(todayCount)
  const nextTier = getNextTier(todayCount)

  const tierColors: Record<string, { bg: string; border: string; text: string }> = {
    Normal:    { bg: 'bg-green-900/30',  border: 'border-green-700/50',  text: 'text-green-300'  },
    High:      { bg: 'bg-yellow-900/30', border: 'border-yellow-700/50', text: 'text-yellow-300' },
    'Very High': { bg: 'bg-orange-900/30', border: 'border-orange-700/50', text: 'text-orange-300' },
    Ultra:     { bg: 'bg-red-900/30',    border: 'border-red-700/50',    text: 'text-red-300'    },
  }

  const colors = tierColors[currentTier.name] ?? tierColors['Normal']

  const progressMax = nextTier ? nextTier.minMemes : currentTier.maxMemes === Infinity ? todayCount + 100 : currentTier.maxMemes
  const progressCurrent = Math.min(todayCount, progressMax)
  const progressPct = progressMax > 0 ? (progressCurrent / progressMax) * 100 : 100
  const toNextTier = nextTier ? nextTier.minMemes - todayCount : 0

  return (
    <section className="max-w-2xl mx-auto px-4 py-3">
      <div className="rounded-2xl border border-indigo-800/50 p-6" style={{ background: 'rgba(15,10,30,0.8)' }}>
        <h2 className="text-2xl font-bold text-indigo-300 mb-4">📊 方案B税收梯度</h2>
        <p className="text-gray-400 text-sm mb-4">梗图生成数量越多，税率越高，更多代币流向黑洞销毁</p>

        {/* Current Tier */}
        <div className={`rounded-xl border ${colors.bg} ${colors.border} p-4 mb-4`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xl font-bold ${colors.text}`}>
              {currentTier.emoji} {currentTier.name} 梯度
            </span>
            <span className="text-gray-300 text-sm">今日已生成: {todayCount} 张</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="rounded-lg bg-black/30 p-3 text-center">
              <div className="text-2xl font-bold text-blue-300">{(currentTier.buyTax * 100).toFixed(1)}%</div>
              <div className="text-xs text-gray-400 mt-1">买入税</div>
              <div className="text-xs text-gray-500">其中 {(CONFIG.BUY_TAX_BURN_RATIO * 100).toFixed(0)}% → 🔥黑洞</div>
            </div>
            <div className="rounded-lg bg-black/30 p-3 text-center">
              <div className="text-2xl font-bold text-pink-300">{(currentTier.sellTax * 100).toFixed(1)}%</div>
              <div className="text-xs text-gray-400 mt-1">卖出税</div>
              <div className="text-xs text-gray-500">其中 {(CONFIG.SELL_TAX_BURN_RATIO * 100).toFixed(0)}% → 🔥黑洞</div>
            </div>
          </div>
        </div>

        {/* Progress to next tier */}
        {nextTier && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>距下一梯度 ({nextTier.emoji} {nextTier.name}) 还差 <span className="text-yellow-300 font-bold">{formatNumber(toNextTier)}</span> 张</span>
              <span>{progressCurrent}/{progressMax}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all"
                style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #9333ea, #ec4899)' }}
              />
            </div>
          </div>
        )}

        {/* All tiers table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="pb-2 text-left">梯度</th>
                <th className="pb-2 text-right">范围</th>
                <th className="pb-2 text-right">买税</th>
                <th className="pb-2 text-right">卖税</th>
              </tr>
            </thead>
            <tbody>
              {CONFIG.TAX_TIERS.map(tier => (
                <tr
                  key={tier.name}
                  className={`border-b border-gray-800/50 ${tier.name === currentTier.name ? 'bg-purple-900/20' : ''}`}
                >
                  <td className="py-2 text-left">
                    {tier.emoji} {tier.name}
                    {tier.name === currentTier.name && <span className="ml-2 text-xs bg-purple-700 text-white px-1.5 py-0.5 rounded">当前</span>}
                  </td>
                  <td className="py-2 text-right text-gray-400 text-xs">
                    {tier.maxMemes === Infinity ? `${formatNumber(tier.minMemes)}+` : `${formatNumber(tier.minMemes)}-${formatNumber(tier.maxMemes)}`}
                  </td>
                  <td className="py-2 text-right text-blue-300">{(tier.buyTax * 100).toFixed(1)}%</td>
                  <td className="py-2 text-right text-pink-300">{(tier.sellTax * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
