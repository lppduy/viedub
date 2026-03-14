import { useEffect, useState } from 'react'

function App() {
  const [health, setHealth] = useState<string>('checking...')

  useEffect(() => {
    fetch('http://localhost:8000/api/health')
      .then((res) => res.json())
      .then((data) => setHealth(data.status))
      .catch(() => setHealth('backend offline'))
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold">VieDub</h1>
        <p className="text-gray-400 text-lg">
          AI-powered Vietnamese dubbing & subtitles
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 text-sm">
          <span className={health === 'ok' ? 'text-green-400' : 'text-yellow-400'}>●</span>
          Backend: {health}
        </div>
      </div>
    </div>
  )
}

export default App
