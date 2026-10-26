import { useState } from 'react'

export default function Settings() {
  const [wallpaper, setWallpaper] = useState('cosmic')
  const [notifications, setNotifications] = useState(true)
  const [sound, setSound] = useState(false)

  return (
    <div className="h-full overflow-y-auto p-5 bg-[#0c0814]">
      <h2 className="text-lg font-medium mb-6">Settings</h2>

      <div className="space-y-6">
        {/* Wallpaper */}
        <section>
          <h3 className="text-sm text-white/50 mb-3">Wallpaper</h3>
          <div className="grid grid-cols-3 gap-2">
            {['cosmic', 'void', 'nebula'].map(w => (
              <button
                key={w}
                onClick={() => setWallpaper(w)}
                className={`h-16 rounded-xl border-2 transition-all ${
                  wallpaper === w
                    ? 'border-purple-500 ring-2 ring-purple-500/30'
                    : 'border-white/10 hover:border-white/20'
                } ${
                  w === 'cosmic'
                    ? 'bg-gradient-to-br from-purple-900 to-indigo-950'
                    : w === 'void'
                    ? 'bg-black'
                    : 'bg-gradient-to-br from-fuchsia-900 to-purple-950'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-white/30 mt-2 capitalize">{wallpaper} (preview only in v1)</p>
        </section>

        {/* Toggles */}
        <section className="space-y-3">
          <h3 className="text-sm text-white/50 mb-3">System</h3>

          <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
            <span className="text-sm">Notifications</span>
            <div
              onClick={() => setNotifications(!notifications)}
              className={`w-10 h-6 rounded-full transition-colors relative ${
                notifications ? 'bg-purple-600' : 'bg-white/10'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </div>
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
            <span className="text-sm">Sound Effects</span>
            <div
              onClick={() => setSound(!sound)}
              className={`w-10 h-6 rounded-full transition-colors relative ${
                sound ? 'bg-purple-600' : 'bg-white/10'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  sound ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </div>
          </label>
        </section>

        <div className="pt-4 text-xs text-white/30 text-center">
          More settings coming in future updates.
        </div>
      </div>
    </div>
  )
}