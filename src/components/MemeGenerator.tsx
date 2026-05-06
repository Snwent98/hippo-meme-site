import { useState, useEffect, useCallback } from 'react'
import { CONFIG, getCurrentTier, formatNumber, getTodayString } from '../config'
import { getUserState, saveUserState, addMeme, addLedger, UserState } from '../db'
import { generateMemeImage } from '../replicateApi'

interface Props {
  onMemeGenerated: () => void
  todayCount: number
  setTodayCount: (n: number) => void
}

export default function MemeGenerator({ onMemeGenerated, todayCount, setTodayCount }: Props) {
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [lastAllocation, setLastAllocation] = useState<{ holderPool: number; creatorReward: number; blackhole: number } | null>(null)

  const hasApiKey = !!import.meta.env.VITE_REPLICATE_API_TOKEN

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [cooldown])

  const initUserState = useCallback(async (): Promise<UserState> => {
    const existing = await getUserState()
    const today = getTodayString()
    if (existing && existing.lastResetDate === today) {
      return existing
    }
    const simHoldings = existing?.simHoldings ?? (
      CONFIG.SIM_HOLDINGS_MIN + Math.floor(Math.random() * (CONFIG.SIM_HOLDINGS_MAX - CONFIG.SIM_HOLDINGS_MIN))
    )
    const state: UserState = {
      dailyCount: 0,
      lastGeneratedAt: existing?.lastGeneratedAt ?? null,
      simHoldings,
      totalEarnings: existing?.totalEarnings ?? 0,
      lastResetDate: today,
    }
    await saveUserState(state)
    return state
  }, [])

  const handleGenerate = async () => {
    const trimmed = keyword.trim()
    if (!trimmed) {
      setError('请输入关键词')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const state = await initUserState()

      if (state.dailyCount >= CONFIG.MAX_DAILY_MEMES_PER_USER) {
        setError(`今日生成次数已达上限 (${CONFIG.MAX_DAILY_MEMES_PER_USER} 张)，明日再来！`)
        setLoading(false)
        return
      }

      const now = Date.now()
      if (state.lastGeneratedAt) {
        const elapsed = (now - state.lastGeneratedAt) / 1000
        if (elapsed < CONFIG.COOLDOWN_SECONDS) {
          const remaining = Math.ceil(CONFIG.COOLDOWN_SECONDS - elapsed)
          setCooldown(remaining)
          setError(`请等待冷却时间结束 (${remaining}秒)`)
          setLoading(false)
          return
        }
      }

      const imageUrl = await generateMemeImage(trimmed)

      const tier = getCurrentTier(state.dailyCount + 1)
      const allocation = {
        holderPool: Math.floor(CONFIG.TOKENS_PER_MEME * CONFIG.HOLDER_POOL_RATIO),
        creatorReward: Math.floor(CONFIG.TOKENS_PER_MEME * CONFIG.CREATOR_REWARD_RATIO),
        blackhole: Math.floor(CONFIG.TOKENS_PER_MEME * CONFIG.BLACKHOLE_RATIO),
      }

      await addMeme({
        keyword: trimmed,
        imageUrl,
        timestamp: now,
        allocation,
        tier: tier.name,
      })

      await addLedger({
        timestamp: now,
        keyword: trimmed,
        tokensReleased: CONFIG.TOKENS_PER_MEME,
        holderPool: allocation.holderPool,
        creatorReward: allocation.creatorReward,
        blackhole: allocation.blackhole,
        tier: tier.name,
      })

      const newCount = state.dailyCount + 1
      const newState: UserState = {
        ...state,
        dailyCount: newCount,
        lastGeneratedAt: now,
        totalEarnings: state.totalEarnings + allocation.creatorReward,
      }
      await saveUserState(newState)

      setGeneratedImage(imageUrl)
      setLastAllocation(allocation)
      setTodayCount(newCount)
      setCooldown(CONFIG.COOLDOWN_SECONDS)
      onMemeGenerated()
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const canGenerate = !loading && cooldown === 0 && todayCount < CONFIG.MAX_DAILY_MEMES_PER_USER

  return (
    <section className="max-w-2xl mx-auto px-4 py-6">
      <div className="rounded-2xl border border-purple-800/50 bg-gray-900/60 backdrop-blur p-6" style={{ background: 'rgba(15,10,30,0.8)' }}>
        <h2 className="text-2xl font-bold text-purple-300 mb-4">🎨 生成河马梗图</h2>

        {!hasApiKey && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-yellow-900/40 border border-yellow-700/60 text-yellow-300 text-sm">
            ⚠️ 未配置 Replicate API Key，将使用占位图片。设置 <code className="bg-yellow-900/60 px-1 rounded">VITE_REPLICATE_API_TOKEN</code> 以启用真实AI生成。
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && canGenerate && handleGenerate()}
            placeholder="输入关键词，例如：上班摸鱼、周一综合症..."
            className="flex-1 px-4 py-3 rounded-xl bg-gray-800/80 border border-purple-700/50 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            disabled={loading}
          />
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="px-6 py-3 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: canGenerate ? 'linear-gradient(135deg, #9333ea, #ec4899)' : '#4b5563' }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                生成中...
              </span>
            ) : cooldown > 0 ? `冷却 ${cooldown}s` : '✨ 生成'}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <span>今日已生成: <span className="text-purple-300 font-bold">{todayCount}</span>/{CONFIG.MAX_DAILY_MEMES_PER_USER} 张</span>
          {cooldown > 0 && (
            <span className="text-yellow-400">⏱ 冷却中: {cooldown}s</span>
          )}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-900/40 border border-red-700/60 text-red-300 text-sm">
            ❌ {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-purple-300">
            <svg className="animate-spin h-12 w-12 mb-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-lg font-semibold">🦛 河马正在思考中...</p>
            <p className="text-sm text-gray-500 mt-1">AI生成需要约20-30秒</p>
          </div>
        )}

        {generatedImage && !loading && (
          <div className="mt-4">
            <img
              src={generatedImage}
              alt={`Hippo meme: ${keyword}`}
              className="w-full max-w-sm mx-auto rounded-xl border border-purple-700/50"
            />
            {lastAllocation && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg bg-blue-900/40 border border-blue-700/50 px-3 py-2">
                  <div className="text-blue-300 font-bold">+{formatNumber(lastAllocation.holderPool)}</div>
                  <div className="text-gray-400 text-xs">持仓池 50%</div>
                </div>
                <div className="rounded-lg bg-green-900/40 border border-green-700/50 px-3 py-2">
                  <div className="text-green-300 font-bold">+{formatNumber(lastAllocation.creatorReward)}</div>
                  <div className="text-gray-400 text-xs">创作奖励 20%</div>
                </div>
                <div className="rounded-lg bg-red-900/40 border border-red-700/50 px-3 py-2">
                  <div className="text-red-300 font-bold">+{formatNumber(lastAllocation.blackhole)}</div>
                  <div className="text-gray-400 text-xs">黑洞销毁 30%</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
