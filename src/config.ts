export const CONFIG = {
  TOTAL_SUPPLY: 10_000_000_000,
  RELEASE_POOL: 5_000_000_000,
  TOKENS_PER_MEME: 10_000,
  MAX_SUPPORTED_MEMES: 500_000,

  HOLDER_POOL_RATIO: 0.50,
  CREATOR_REWARD_RATIO: 0.20,
  BLACKHOLE_RATIO: 0.30,

  BUY_TAX_BURN_RATIO: 0.50,
  SELL_TAX_BURN_RATIO: 0.60,

  MAX_DAILY_MEMES_PER_USER: 4,
  COOLDOWN_SECONDS: 30,

  TAX_TIERS: [
    { name: 'Normal',    emoji: '😊', minMemes: 0,    maxMemes: 100,      buyTax: 0.02, sellTax: 0.04  },
    { name: 'High',      emoji: '🔥', minMemes: 101,  maxMemes: 500,      buyTax: 0.03, sellTax: 0.045 },
    { name: 'Very High', emoji: '⚡', minMemes: 501,  maxMemes: 1000,     buyTax: 0.04, sellTax: 0.05  },
    { name: 'Ultra',     emoji: '💥', minMemes: 1001, maxMemes: Infinity,  buyTax: 0.05, sellTax: 0.06  },
  ] as const,

  SIM_HOLDINGS_MIN: 100_000,
  SIM_HOLDINGS_MAX: 1_000_000,
} as const

export type TaxTier = typeof CONFIG.TAX_TIERS[number]

export function getCurrentTier(todayMemes: number): TaxTier {
  const tiers = [...CONFIG.TAX_TIERS] as TaxTier[]
  const tier = tiers.reverse().find(t => todayMemes >= t.minMemes)
  return tier ?? CONFIG.TAX_TIERS[0]
}

export function getNextTier(todayMemes: number): TaxTier | null {
  const tiers = CONFIG.TAX_TIERS as unknown as TaxTier[]
  const idx = tiers.findIndex(t => todayMemes <= t.maxMemes)
  if (idx === -1 || idx === tiers.length - 1) return null
  return tiers[idx + 1]
}

export function formatNumber(n: number): string {
  return n.toLocaleString('zh-CN')
}

export function getTodayString(): string {
  return new Date().toISOString().slice(0, 10)
}
