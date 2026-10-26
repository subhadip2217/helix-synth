import { useState } from 'react'

export default function Notepad() {
  const [text, setText] = useState(
`Welcome to Aura Notepad

This is your personal space inside the virtual machine.

Ideas, notes, secrets... they all live here.

The aura remembers.`
  )

  return (
    <div className="h-full flex flex-col bg-[#0c0814]">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 text-xs text-white/40">
        <span>untitled.txt</span>
        <span className="ml-auto">{text.length} chars</span>
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        className="flex-1 w-full bg-transparent p-4 text-sm text-white/90 outline-none resize-none font-sans leading-relaxed"
        placeholder="Start typing..."
        spellCheck={false}
      />
    </div>
  )
}