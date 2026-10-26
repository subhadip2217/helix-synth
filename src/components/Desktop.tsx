import { useState, useCallback } from 'react'
import Taskbar from './Taskbar'
import Window from './Window'
import DesktopIcons from './DesktopIcons'
import Terminal from './apps/Terminal'
import Notepad from './apps/Notepad'
import About from './apps/About'
import Settings from './apps/Settings'
import Particles from './Particles'

export type AppId = 'terminal' | 'notepad' | 'about' | 'settings'

export interface WindowState {
  id: string
  appId: AppId
  title: string
  x: number
  y: number
  width: number
  height: number
  minimized: boolean
  maximized: boolean
  zIndex: number
}

const APP_META: Record<AppId, { title: string; icon: string; defaultSize: { w: number; h: number } }> = {
  terminal: { title: 'Terminal', icon: '>_', defaultSize: { w: 640, h: 420 } },
  notepad: { title: 'Notepad', icon: '✎', defaultSize: { w: 520, h: 480 } },
  about: { title: 'About Aura OS', icon: '◈', defaultSize: { w: 460, h: 380 } },
  settings: { title: 'Settings', icon: '⚙', defaultSize: { w: 480, h: 420 } },
}

export default function Desktop() {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [nextZ, setNextZ] = useState(10)
  const [activeId, setActiveId] = useState<string | null>(null)

  const openApp = useCallback((appId: AppId) => {
    const existing = windows.find(w => w.appId === appId && !w.minimized)
    if (existing) {
      focusWindow(existing.id)
      return
    }

    const meta = APP_META[appId]
    const id = `${appId}-${Date.now()}`
    const newWin: WindowState = {
      id,
      appId,
      title: meta.title,
      x: 80 + windows.length * 30,
      y: 60 + windows.length * 30,
      width: meta.defaultSize.w,
      height: meta.defaultSize.h,
      minimized: false,
      maximized: false,
      zIndex: nextZ,
    }
    setWindows(prev => [...prev, newWin])
    setNextZ(z => z + 1)
    setActiveId(id)
  }, [windows, nextZ])

  const focusWindow = (id: string) => {
    setWindows(prev =>
      prev.map(w =>
        w.id === id ? { ...w, zIndex: nextZ, minimized: false } : w
      )
    )
    setNextZ(z => z + 1)
    setActiveId(id)
  }

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id))
    if (activeId === id) setActiveId(null)
  }

  const minimizeWindow = (id: string) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, minimized: true } : w))
    )
    if (activeId === id) setActiveId(null)
  }

  const maximizeWindow = (id: string) => {
    setWindows(prev =>
      prev.map(w =>
        w.id === id ? { ...w, maximized: !w.maximized } : w
      )
    )
  }

  const updateWindow = (id: string, updates: Partial<WindowState>) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, ...updates } : w))
    )
  }

  const renderApp = (appId: AppId) => {
    switch (appId) {
      case 'terminal': return <Terminal />
      case 'notepad': return <Notepad />
      case 'about': return <About />
      case 'settings': return <Settings />
      default: return null
    }
  }

  return (
    <div className="h-full w-full relative overflow-hidden select-none">
      {/* Cosmic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0614] via-[#12081f] to-[#0d0618]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      
      <Particles />

      {/* Desktop icons */}
      <DesktopIcons onOpen={openApp} />

      {/* Windows */}
      {windows.map(win => (
        !win.minimized && (
          <Window
            key={win.id}
            win={win}
            isActive={activeId === win.id}
            onFocus={() => focusWindow(win.id)}
            onClose={() => closeWindow(win.id)}
            onMinimize={() => minimizeWindow(win.id)}
            onMaximize={() => maximizeWindow(win.id)}
            onUpdate={(updates) => updateWindow(win.id, updates)}
          >
            {renderApp(win.appId)}
          </Window>
        )
      ))}

      {/* Taskbar */}
      <Taskbar
        windows={windows}
        activeId={activeId}
        onOpen={openApp}
        onFocus={focusWindow}
        onMinimize={minimizeWindow}
      />
    </div>
  )
}