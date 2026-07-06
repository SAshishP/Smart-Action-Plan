import { useEffect, useRef, useState } from 'react'
import { askAI, dataUrlToImage } from '../lib/ai.js'
import { compressImage } from '../lib/img.js'

export default function Chat({ profile }) {
  const [messages, setMessages] = useState([
    { role: 'model', text: `Hi ${String(profile?.name || '').split(' ')[0] || 'there'}! I'm your SAP assistant. Ask me anything — meals, workouts, skin care, your plan — or send a photo of your food and I'll estimate the calories.` },
  ])
  const [input, setInput] = useState('')
  const [image, setImage] = useState(null)
  const [busy, setBusy] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, busy])

  async function attach(e) {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    try {
      setImage(await compressImage(file, 640, 0.6))
    } catch {
      setMessages((m) => [...m, { role: 'model', text: 'That photo could not be read — try another one.' }])
    }
  }

  async function send() {
    const text = input.trim()
    if ((!text && !image) || busy) return
    const userMsg = { role: 'user', text: text || 'Please analyze this photo.', img: image }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setImage(null)
    setBusy(true)
    try {
      const reply = await askAI({
        profile,
        messages: history.slice(-12).map((m) => ({ role: m.role, text: m.text })),
        images: userMsg.img ? [dataUrlToImage(userMsg.img)] : undefined,
      })
      setMessages((m) => [...m, { role: 'model', text: reply }])
    } catch (e) {
      setMessages((m) => [...m, { role: 'model', text: `⚠️ ${e.message}` }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen with-tabbar chat-screen">
      <h1>Assistant</h1>
      <p className="dim small" style={{ marginBottom: 14 }}>
        Personal suggestions, not medical advice.
      </p>
      <div className="chat-log">
        {messages.map((m, i) => (
          <div key={i} className={'bubble ' + m.role}>
            {m.img && <img src={m.img} alt="attached" />}
            <span>{m.text}</span>
          </div>
        ))}
        {busy && <div className="bubble model typing">Thinking…</div>}
        <div ref={endRef} />
      </div>
      {image && (
        <div className="chat-attach">
          <img src={image} alt="to send" />
          <button className="mini ghost" type="button" onClick={() => setImage(null)}>Remove</button>
        </div>
      )}
      <div className="chat-input">
        <label className="attach-btn" aria-label="Attach a photo">
          📷
          <input type="file" accept="image/*" onChange={attach} />
        </label>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask anything…"
        />
        <button type="button" onClick={send} disabled={busy} style={{ width: 'auto' }}>➤</button>
      </div>
    </div>
  )
}
