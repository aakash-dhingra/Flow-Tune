import React, { useState } from 'react';
import { AutoCleaner } from './components/AutoCleaner';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  return (
    <div className="min-h-screen bg-background flex text-textPrimary font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-black p-6 flex flex-col gap-8 hidden md:flex border-r border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-black font-bold text-lg">F</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">FlowTune</h1>
        </div>
        <nav className="flex flex-col gap-4 text-textSecondary font-medium">
          <button onClick={() => setActiveTab('dashboard')} className={`${activeTab === 'dashboard' ? 'text-primary' : 'hover:text-white'} text-left transition-colors`}>Dashboard</button>
          <button onClick={() => setActiveTab('cleaner')} className={`${activeTab === 'cleaner' ? 'text-primary' : 'hover:text-white'} text-left transition-colors`}>Auto-Cleaner</button>
          <button onClick={() => setActiveTab('mood')} className={`${activeTab === 'mood' ? 'text-primary' : 'hover:text-white'} text-left transition-colors`}>Mood Builder</button>
          <button onClick={() => setActiveTab('time')} className={`${activeTab === 'time' ? 'text-primary' : 'hover:text-white'} text-left transition-colors`}>Time Builder</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <button
            onClick={() => {
              const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
              window.location.href = `${baseUrl}/api/auth/login`;
            }}
            className="bg-primary text-black px-6 py-2 rounded-full font-bold hover:scale-105 active:scale-95 transition-transform"
          >
            Login with Spotify
          </button>
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div onClick={() => setActiveTab('cleaner')} className="glass-panel p-6 hover:bg-surface transition-colors cursor-pointer group">
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Playlist Auto-Cleaner</h3>
              <p className="text-textSecondary text-sm">Organize your liked songs into distinct acoustic clusters based on energy and mood.</p>
            </div>
            <div onClick={() => setActiveTab('mood')} className="glass-panel p-6 hover:bg-surface transition-colors cursor-pointer group">
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Mood Builder</h3>
              <p className="text-textSecondary text-sm">Generate smart playlists based on specific duration, energy flows, and context.</p>
            </div>
            <div onClick={() => setActiveTab('time')} className="glass-panel p-6 hover:bg-surface transition-colors cursor-pointer group">
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Time-Based Sets</h3>
              <p className="text-textSecondary text-sm">Build perfect length playlists for your workout, commute, or focus session.</p>
            </div>
          </div>
        )}

        {activeTab === 'cleaner' && <AutoCleaner />}
      </main>
    </div>
  );
}

export default App;
