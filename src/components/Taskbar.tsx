import { useEffect, useState } from 'react'
import { Terminal, FileText, Info, Settings, LayoutGrid } from 'lucide-react'
import { AppId, WindowState } from './Desktop'
import { cn } from '@/lib/utils'

interface Props {
  windows: WindowState[]
  activeId: string | null
  onOpen: (appId: AppId) => void
  onFocus: (id: string) => void
  onMinimize: (id: string) => void
}

const apps = [
  { id: 'terminal' as AppId, Icon: Terminal, label: 'Terminal' },
  { id: 'notepad' as AppId, Icon: FileText, label: 'Notepad' },
  { id: 'about' as AppId, Icon: Info, label: 'About' },
  { id: 'settings' as AppId, Icon: Settings, label: 'Settings' },
]

export default function Taskbar({ windows, activeId, onOpen, onFocus, onMinimize }: Props) {
  const [time, setTime] = useState(new Date())
  const [startOpen, setStartOpen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const formatDate = (d: Date) =>
    d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <>
      {/* Start menu */}
      {startOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setStartOpen(false)}
        >
          <div
            className="absolute bottom-14 left-3 w-72 rounded-2xl bg-[#120a1f]/95 border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold">
                  A
                </div>
                <div>
                  <div className="font-medium text-sm">Aura OS</div>
                  <div className="text-xs text-white/50">v1.0 • Virtual Machine</div>
                </div>
              </div>
            </div>
            <div className="p-2">
              {apps.map(({ id, Icon, label }) => (
                <button
                  key={id}
                  onClick={() => {
                    onOpen(id)
                    setStartOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Icon size={16} className="text-purple-300" />
                  </div>
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 h-12 z-30 flex items-center px-2 gap-1 bg-[#0a0614]/80 backdrop-blur-xl border-t border-white/5">
        {/* Start button */}
        <button
          onClick={() => setStartOpen(!startOpen)}
          className={cn(
            'h-9 w-9 rounded-xl flex items-center justify-center transition-all',
            startOpen
              ? 'bg-purple-600 text-white'
              : 'hover:bg-white/10 text-purple-300'
          )}
        >
          <LayoutGrid size={18} />
        </button>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Open windows / pinned apps */}
        <div className="flex items-center gap-1 flex-1">
          {apps.map(({ id, Icon, label }) => {
            const openWins = windows.filter(w => w.appId === id)
            const isOpen = openWins.length > 0
            const isActive = openWins.some(w => w.id === activeId)

            return (
              <button
                key={id}
                onClick={() => {
                  if (isOpen) {
                    const win = openWins[0]
                    if (win.minimized || win.id !== activeId) {
                      onFocus(win.id)
                    } else {
                      onMinimize(win.id)
                    }
                  } else {
                    onOpen(id)
                  }
                }}
                className={cn(
                  'relative h-9 px-3 rounded-xl flex items-center gap-2 transition-all',
                  isActive
                    ? 'bg-purple-600/30 text-white'
                    : isOpen
                    ? 'bg-white/10 text-white/90'
                    : 'hover:bg-white/5 text-white/60'
                )}
                title={label}
              >
                <Icon size={16} />
                {isOpen && (
                  <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400" />
                )}
              </button>
            )
          })}
        </div>

        {/* Clock */}
        <div className="text-right pr-2 pl-3 border-l border-white/10">
          <div className="text-xs font-medium tabular-nums">{formatTime(time)}</div>
          <div className="text-[10px] text-white/50">{formatDate(time)}</div>
        </div>
      </div>
    </>
  )
}