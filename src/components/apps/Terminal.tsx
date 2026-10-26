import { useState, useRef, useEffect } from 'react'

const WELCOME = `
 █████╗ ██╗   ██╗██████╗  █████╗     ██████╗ ███████╗
██╔══██╗██║   ██║██╔══██╗██╔══██╗   ██╔═══██╗██╔════╝
███████║██║   ██║██████╔╝███████║   ██║   ██║███████╗
██╔══██║██║   ██║██╔══██╗██╔══██║   ██║   ██║╚════██║
██║  ██║╚██████╔╝██║  ██║██║  ██║   ╚██████╔╝███████║
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝    ╚═════╝ ╚══════╝

Welcome to Aura OS Terminal v1.0
Type 'help' for available commands.
`

const COMMANDS: Record<string, (args: string[]) => string> = {
  help: () => `Available commands:
  help      - Show this message
  clear     - Clear the terminal
  whoami    - Who are you?
  date      - Current date & time
  neofetch  - System info
  echo      - Print text
  aura      - Feel the aura
  ls        - List files
  matrix    - Enter the matrix
  exit      - Close terminal (or just close the window)`,

  clear: () => '__CLEAR__',

  whoami: () => 'aura-user@virtual-machine',

  date: () => new Date().toString(),

  neofetch: () => `
         ,gggg,
        i8"  "8i          OS: Aura OS 1.0
        i8    8i          Host: Browser Virtual Machine
        i8,  ,8i          Kernel: React 19 + Vite
         "Y888P'          Shell: aura-sh
                          Resolution: ${window.innerWidth}x${window.innerHeight}
                          Theme: Cosmic Purple
                          Aura Level: MAXIMUM`,

  echo: (args) => args.join(' ') || '',

  aura: () => `
╔══════════════════════════════════════╗
║                                      ║
║     ✦  The aura is strong today  ✦   ║
║                                      ║
║   You are running on pure potential  ║
║                                      ║
╚══════════════════════════════════════╝`,

  ls: () => `Documents/
Downloads/
Projects/
.aura/
readme.txt
secret.dat`,

  matrix: () => {
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'
    let out = ''
    for (let i = 0; i < 12; i++) {
      let line = ''
      for (let j = 0; j < 48; j++) {
        line += chars[Math.floor(Math.random() * chars.length)]
      }
      out += line + '\n'
    }
    return out + '\nWake up, Neo...'
  },

  exit: () => 'Use the window controls to close.',
}

export default function Terminal() {
  const [history, setHistory] = useState<{ type: 'input' | 'output'; text: string }[]>([
    { type: 'output', text: WELCOME },
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const run = (cmd: string) => {
    const trimmed = cmd.trim()
    if (!trimmed) return

    const [name, ...args] = trimmed.split(/\s+/)
    const fn = COMMANDS[name.toLowerCase()]

    setHistory(prev => [...prev, { type: 'input', text: trimmed }])

    if (name.toLowerCase() === 'clear') {
      setHistory([])
      return
    }

    const output = fn ? fn(args) : `Command not found: ${name}. Type 'help'.`
    setHistory(prev => [...prev, { type: 'output', text: output }])
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      run(input)
      setInput('')
    }
  }

  return (
    <div
      className="h-full flex flex-col font-mono text-sm bg-[#08050f] text-green-400 p-4 overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-y-auto space-y-1 pr-2">
        {history.map((item, i) => (
          <div key={i} className={item.type === 'input' ? 'text-purple-300' : 'text-green-400/90 whitespace-pre-wrap'}>
            {item.type === 'input' ? (
              <span>
                <span className="text-purple-400">aura@os</span>
                <span className="text-white/40">:</span>
                <span className="text-cyan-400">~</span>
                <span className="text-white/40">$ </span>
                {item.text}
              </span>
            ) : (
              item.text
            )}
          </div>
        ))}
        <div className="flex items-center">
          <span className="text-purple-400">aura@os</span>
          <span className="text-white/40">:</span>
          <span className="text-cyan-400">~</span>
          <span className="text-white/40">$ </span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent outline-none text-green-300 caret-purple-400 ml-1"
            autoFocus
            spellCheck={false}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}