import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import backendLogo from './assets/backend.svg'
import dbLogo from './assets/database.svg'
import viteLogo from '/vite.svg'
import './App.css'

interface AutoStackAPI {
  message: string;
  backend: string;
  database: string;
  filepath: string;
}

function App() {
  const [data, setData] = useState<AutoStackAPI | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/autostack') 
      .then((res) => {
        return res.json();
      })
      .then((data: AutoStackAPI) => {
        setData(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">

        <div className="flex justify-center items-center gap-8 mb-12">
          <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer" 
             className="transition-transform hover:scale-110 hover:drop-shadow-[0_0_2em_#646cffaa]">
            <img src={viteLogo} className="h-24 w-24" alt="Vite logo" />
          </a>
          <span className="text-4xl text-gray-500">+</span>
          <a href="https://react.dev" target="_blank" rel="noopener noreferrer"
             className="transition-transform hover:scale-110 hover:drop-shadow-[0_0_2em_#61dafbaa] animate-[spin_20s_linear_infinite]">
            <img src={reactLogo} className="h-24 w-24" alt="React logo" />
          </a>
          <span className="text-4xl text-gray-500">+</span>
          <a href="#" className="transition-transform hover:scale-110 hover:drop-shadow-[0_0_2em_#10b981aa]">
            <img src={backendLogo} className="h-24 w-24" alt="Backend logo" />
          </a>
          <span className="text-4xl text-gray-500">+</span>
          <a href="#" className="transition-transform hover:scale-110 hover:drop-shadow-[0_0_2em_#3b82f6aa]">
            <img src={dbLogo} className="h-24 w-24" alt="Database logo" />
          </a>
        </div>

        <h1 className="text-5xl font-bold text-center mb-8 text-white bg-clip-text text-transparent">
          Vite + React + {data?.backend || '...'} + {data?.database || '...'}
        </h1>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700 shadow-2xl">
          {loading && (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400">Connecting to backend...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center">
              <p className="text-red-400 mb-2">⚠️ Connection Failed</p>
              <p className="text-sm text-gray-500">{error}</p>
              <p className="text-xs text-gray-600 mt-3">Make sure your backend server is running on port 5000</p>
            </div>
          )}
          
          {!loading && !error && data && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-4">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-400 text-sm font-medium">Connected</span>
              </div>
              <p className="text-2xl text-gray-300 mb-2">{data.message}</p>
              <p className="text-sm text-gray-500">Your full-stack app is up and running! ✨</p>
            </div>
          )}
        </div>

        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-semibold mb-4 text-gray-300 text-center">Quick Start</h2>
          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex justify-center items-center gap-3">
              <p>Edit <code className="px-2 py-1 bg-gray-700 rounded text-blue-300">src/App.tsx</code> to start building your frontend</p>
            </div>
            <div className="flex justify-center items-center gap-3">
              <p>Modify <code className="px-2 py-1 bg-gray-700 rounded text-blue-300">{data?.filepath}</code> to add your API routes</p>
            </div>
            <div className="flex justify-center items-center gap-3">
              <p>Check the console for any errors or messages</p>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Created with ❤️ using AutoStack
        </p>
      </div>
    </div>
  )
}

export default App