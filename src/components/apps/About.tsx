export default function About() {
  return (
    <div className="h-full overflow-y-auto p-6 bg-[#0c0814]">
      <div className="flex flex-col items-center text-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700 flex items-center justify-center text-3xl font-bold shadow-glow">
          A
        </div>
        <div>
          <h2 className="text-xl font-semibold">Aura OS</h2>
          <p className="text-sm text-white/50 mt-1">Version 1.0.0 • Virtual Machine</p>
        </div>
      </div>

      <div className="space-y-4 text-sm text-white/70 leading-relaxed">
        <p>
          A cinematic browser-based operating system experience.
          Built for pure aura, creativity, and digital presence.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-xs text-white/40 mb-1">Engine</div>
            <div className="font-medium text-white/90">React 19 + Vite</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-xs text-white/40 mb-1">Theme</div>
            <div className="font-medium text-white/90">Cosmic Purple</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-xs text-white/40 mb-1">Created by</div>
            <div className="font-medium text-white/90">Subhadip + Grok</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-xs text-white/40 mb-1">Aura Level</div>
            <div className="font-medium text-purple-300">MAXIMUM</div>
          </div>
        </div>

        <p className="pt-4 text-xs text-white/40 text-center">
          Double-click icons or use the taskbar to open apps.
          <br />
          Drag windows by their title bar.
        </p>
      </div>
    </div>
  )
}