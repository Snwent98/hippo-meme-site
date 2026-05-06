import { useState, useEffect } from 'react'
import Header from './components/Header'
import MemeGenerator from './components/MemeGenerator'
import PlanBPanel from './components/PlanBPanel'
import ReleasePanel from './components/ReleasePanel'
import MemeWall from './components/MemeWall'
import { getUserState, saveUserState } from './db'
import { getTodayString, CONFIG } from './config'

export default function App() {
  const [todayCount, setTodayCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const init = async () => {
      const state = await getUserState()
      const today = getTodayString()
      if (state && state.lastResetDate === today) {
        setTodayCount(state.dailyCount)
      } else if (state) {
        await saveUserState({
          ...state,
          dailyCount: 0,
          lastResetDate: today,
        })
        setTodayCount(0)
      } else {
        const simHoldings = CONFIG.SIM_HOLDINGS_MIN + Math.floor(Math.random() * (CONFIG.SIM_HOLDINGS_MAX - CONFIG.SIM_HOLDINGS_MIN))
        await saveUserState({
          dailyCount: 0,
          lastGeneratedAt: null,
          simHoldings,
          totalEarnings: 0,
          lastResetDate: today,
        })
      }
    }
    init()
  }, [])

  const handleMemeGenerated = () => {
    setRefreshKey(k => k + 1)
  }

  return (
    <div className="min-h-screen" style={{ background: '#0f0f1a' }}>
      <Header />
      <main className="pb-16">
        <MemeGenerator
          onMemeGenerated={handleMemeGenerated}
          todayCount={todayCount}
          setTodayCount={setTodayCount}
        />
        <PlanBPanel todayCount={todayCount} />
        <ReleasePanel refreshKey={refreshKey} />
        <MemeWall refreshKey={refreshKey} />
      </main>
      <footer className="text-center text-gray-600 text-xs py-8 border-t border-gray-800">
        <p>🦛 HIPPO MEME · 无需钱包 · 链上以实际合约为准</p>
        <p className="mt-1">本站仅作演示，不构成投资建议</p>
      </footer>
    </div>
  )
}
