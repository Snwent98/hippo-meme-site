import { useEffect, useState } from 'react'
import { CONFIG, formatNumber } from '../config'
import { getAllLedger, getUserState, LedgerRecord } from '../db'

interface Props {
  refreshKey: number
}

export default function ReleasePanel({ refreshKey }: Props) {
  const [ledger, setLedger] = useState<LedgerRecord[]>([])
  const [simHoldings, setSimHoldings] = useState(0)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [totalMemesGenerated, setTotalMemesGenerated] = useState(0)

  useEffect(() => {
    const load = async () => {
      const records = await getAllLedger()
      setLedger(records)
      setTotalMemesGenerated(records.length)
      const state = await getUserState()
      if (state) {
        setSimHoldings(state.simHoldings)
        setTotalEarnings(state.totalEarnings)
      }
    }
    load()
  }, [refreshKey])

  const releasePoolRemaining = CONFIG.RELEASE_POOL - totalMemesGenerated * CONFIG.TOKENS_PER_MEME
  const remainingMemes = Math.max(0, CONFIG.MAX_SUPPORTED_MEMES - totalMemesGenerated)
  const poolPct = (releasePoolRemaining / CONFIG.RELEASE_POOL) * 100

  const holderPoolTokens = Math.floor(CONFIG.TOKENS_PER_MEME * CONFIG.HOLDER_POOL_RATIO)
  const creatorRewardTokens = Math.floor(CONFIG.TOKENS_PER_MEME * CONFIG.CREATOR_REWARD_RATIO)
  const blackholeTokens = Math.floor(CONFIG.TOKENS_PER_MEME * CONFIG.BLACKHOLE_RATIO)

  return (
    <section className="max-w-2xl mx-auto px-4 py-3">
      <div className="rounded-2xl border border-violet-800/50 p-6" style={{ background: 'rgba(15,10,30,0.8)' }}>
        <h2 className="text-2xl font-bold text-violet-300 mb-4">💎 释放池 &amp; 分红逻辑</h2>

        {/* Supply stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl bg-gray-800/50 border border-gray-700/50 p-3">
            <div className="text-xs text-gray-400 mb-1">总供应量</div>
            <div className="text-lg font-bold text-white">{formatNumber(CONFIG.TOTAL_SUPPLY)}</div>
          </div>
          <div className="rounded-xl bg-gray-800/50 border border-gray-700/50 p-3">
            <div className="text-xs text-gray-400 mb-1">释放池总量 (50%)</div>
            <div className="text-lg font-bold text-violet-300">{formatNumber(CONFIG.RELEASE_POOL)}</div>
          </div>
          <div className="rounded-xl bg-purple-900/30 border border-purple-700/50 p-3">
            <div className="text-xs text-gray-400 mb-1">释放池剩余</div>
            <div className="text-lg font-bold text-purple-300">{formatNumber(Math.max(0, releasePoolRemaining))}</div>
            <div className="text-xs text-gray-500 mt-1">剩余 {poolPct.toFixed(2)}%</div>
          </div>
          <div className="rounded-xl bg-pink-900/30 border border-pink-700/50 p-3">
            <div className="text-xs text-gray-400 mb-1">预计可再支持</div>
            <div className="text-lg font-bold text-pink-300">{formatNumber(remainingMemes)} 张</div>
            <div className="text-xs text-gray-500 mt-1">共 {formatNumber(totalMemesGenerated)} 张已生成</div>
          </div>
        </div>

        <div className="mb-4 text-xs text-gray-500 flex items-center gap-1">
          ℹ️ 预计可支持生成约 <span className="text-violet-300">{formatNumber(CONFIG.MAX_SUPPORTED_MEMES)}</span> 张梗图后释放池耗尽
        </div>

        {/* Per-meme allocation */}
        <div className="rounded-xl bg-gray-800/40 border border-gray-700/50 p-4 mb-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">📦 本次生成分配预览 (每次 {formatNumber(CONFIG.TOKENS_PER_MEME)} 代币)</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-gray-400 text-sm flex-1">持仓池 (Holder Pool) 50%</span>
              <span className="text-blue-300 font-bold">{formatNumber(holderPoolTokens)} 代币</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-gray-400 text-sm flex-1">创作奖励 (Creator Reward) 20%</span>
              <span className="text-green-300 font-bold">{formatNumber(creatorRewardTokens)} 代币</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-gray-400 text-sm flex-1">黑洞/社区 (Blackhole) 30%</span>
              <span className="text-red-300 font-bold">{formatNumber(blackholeTokens)} 代币</span>
            </div>
          </div>
        </div>

        {/* Simulated holdings */}
        {simHoldings > 0 && (
          <div className="rounded-xl bg-indigo-900/30 border border-indigo-700/50 p-4 mb-5">
            <h3 className="text-sm font-semibold text-indigo-300 mb-2">🎮 模拟持仓 (站内演示)</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">模拟持仓量</span>
              <span className="text-indigo-300 font-bold">{formatNumber(simHoldings)} 代币</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">累计创作奖励</span>
              <span className="text-green-300 font-bold">+{formatNumber(totalEarnings)} 代币</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">⚠️ 持仓分配为站内模拟，链上以实际合约为准</p>
          </div>
        )}

        {/* Ledger table */}
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">📋 本地账本 (最近10条)</h3>
          {ledger.length === 0 ? (
            <div className="text-center text-gray-600 py-6 text-sm">暂无记录，快去生成第一张梗图吧！</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-700">
                    <th className="pb-2 text-left">关键词</th>
                    <th className="pb-2 text-right">释放</th>
                    <th className="pb-2 text-right">持仓池</th>
                    <th className="pb-2 text-right">黑洞</th>
                    <th className="pb-2 text-right">梯度</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.slice(0, 10).map((r, i) => (
                    <tr key={r.id ?? i} className="border-b border-gray-800/50">
                      <td className="py-1.5 text-purple-300 max-w-[100px] truncate">{r.keyword}</td>
                      <td className="py-1.5 text-right text-white">{formatNumber(r.tokensReleased)}</td>
                      <td className="py-1.5 text-right text-blue-300">{formatNumber(r.holderPool)}</td>
                      <td className="py-1.5 text-right text-red-300">{formatNumber(r.blackhole)}</td>
                      <td className="py-1.5 text-right text-gray-400">{r.tier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
