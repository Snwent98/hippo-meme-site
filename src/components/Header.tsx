export default function Header() {
  return (
    <header className="w-full py-8 px-4 text-center" style={{ background: 'linear-gradient(135deg, #1a0533 0%, #0f0f1a 50%, #1a1a2e 100%)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-6xl mb-3">🦛</div>
        <h1
          className="text-4xl font-bold mb-2"
          style={{ background: 'linear-gradient(90deg, #e879f9, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          HIPPO MEME
        </h1>
        <p className="text-lg text-purple-300 mb-4">河马梗图生成器</p>
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <span className="px-3 py-1 rounded-full bg-purple-900/50 text-purple-200 border border-purple-700">🔓 无需连接钱包</span>
          <span className="px-3 py-1 rounded-full bg-pink-900/50 text-pink-200 border border-pink-700">🎨 AI梗图生成</span>
          <span className="px-3 py-1 rounded-full bg-indigo-900/50 text-indigo-200 border border-indigo-700">📊 方案B税收联动</span>
          <span className="px-3 py-1 rounded-full bg-violet-900/50 text-violet-200 border border-violet-700">🔥 代币销毁叙事</span>
        </div>
      </div>
    </header>
  )
}
