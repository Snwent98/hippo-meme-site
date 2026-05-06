import { openDB, IDBPDatabase } from 'idb'

export interface UserState {
  dailyCount: number
  lastGeneratedAt: number | null
  simHoldings: number
  totalEarnings: number
  lastResetDate: string
}

export interface MemeRecord {
  id?: number
  keyword: string
  imageUrl: string
  timestamp: number
  allocation: {
    holderPool: number
    creatorReward: number
    blackhole: number
  }
  tier: string
}

export interface LedgerRecord {
  id?: number
  timestamp: number
  keyword: string
  tokensReleased: number
  holderPool: number
  creatorReward: number
  blackhole: number
  tier: string
}

const DB_NAME = 'hippo-meme-db'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('userState')) {
          db.createObjectStore('userState')
        }
        if (!db.objectStoreNames.contains('memes')) {
          db.createObjectStore('memes', { keyPath: 'id', autoIncrement: true })
        }
        if (!db.objectStoreNames.contains('ledger')) {
          db.createObjectStore('ledger', { keyPath: 'id', autoIncrement: true })
        }
      },
    })
  }
  return dbPromise
}

export async function getUserState(): Promise<UserState | undefined> {
  const db = await getDB()
  return db.get('userState', 'current')
}

export async function saveUserState(state: UserState): Promise<void> {
  const db = await getDB()
  await db.put('userState', state, 'current')
}

export async function addMeme(meme: MemeRecord): Promise<number> {
  const db = await getDB()
  return db.add('memes', meme) as Promise<number>
}

export async function getAllMemes(): Promise<MemeRecord[]> {
  const db = await getDB()
  const all = await db.getAll('memes')
  return all.reverse()
}

export async function addLedger(record: LedgerRecord): Promise<number> {
  const db = await getDB()
  return db.add('ledger', record) as Promise<number>
}

export async function getAllLedger(): Promise<LedgerRecord[]> {
  const db = await getDB()
  const all = await db.getAll('ledger')
  return all.reverse()
}
