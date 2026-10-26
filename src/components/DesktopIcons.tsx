import { Terminal, FileText, Info, Settings } from 'lucide-react'
import { AppId } from './Desktop'

interface Props {
  onOpen: (appId: AppId) => void
}

const icons = [
  { id: 'terminal' as AppId, label: 'Terminal', Icon: Terminal },
  { id: 'notepad' as AppId, label: 'Notepad', Icon: FileText },
  { id: 'about' as AppId, label: 'About', Icon: Info },
  { id: 'settings' as AppId, label: 'Settings', Icon: Settings },
]

export default function DesktopIcons({ onOpen }: Props) {
  return (
    <div className="absolute top-6 left-6 flex flex-col gap-5 z-10">
      {icons.map(({ id, label, Icon }) => (
        <button
          key={id}
          onDoubleClick={() => onOpen(id)}
          className="group flex flex-col items-center gap-1.5 w-20 p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all shadow-lg">
            <Icon className="w-6 h-6 text-purple-300 group-hover:text-purple-200" strokeWidth={1.5} />
          </div>
          <span className="text-[11px] text-white/70 group-hover:text-white text-center leading-tight drop-shadow-md">
            {label}
          </span>
        </button>
      ))}
    </div>
  )
}