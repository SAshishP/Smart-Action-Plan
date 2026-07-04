import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { compressImage } from '../lib/img.js'

// A trimmed profile keeps the AI personal without sending photos every time
function profileSummary(p) {
  if (!p) return {}
  const { name, dob, gender, height, weight, goals, dietType, bodyType,
    allergies, medications, foodsToAvoid, skinSensitivity, activityLevel,
    lifestyle, ethnicity, location, wakeTime, sleepTime, workStart, workEnd } = p
  return { name, dob, gender, height, weight, goals, dietType, bodyType,
    allergies, medications, foodsToAvoid, skinSensitivity, activityLevel,
    lifestyle, ethnicity, location, wakeTime, sleepTime, workStart, workEnd }
}

export default function Chat({ profile }) {
  const [messages, setMessages] = useState([
    { role: 'model', text: `Hi ${String(profile?.name || '').split(' ')[0] || 'there'}! I'm your SAP assistant. Ask me anything — meals, workouts, skin care, your plan — or send a photo of your food and I'll estimate the calories.` },
  ])
  const [input, setInput] = useState('')
  const [image, setImage] = useState(null) // dataURL
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
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('You are signed out — sign in again to chat.')
      const body = {
        profile: profileSummary(profile),
        // last 12 turns keep the AI context-aware without huge requests
        messages: history.slice(-12).map((m) => ({ role: m.role, text: m.text })),
      }
      if (userMsg.img) {
        body.image = { mime: 'image/jpeg', data: userMsg.img.split(',')[1] }
      }
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(body),
        }
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(
          res.status === 429
            ? 'The free AI limit for today is reached — it resets tomorrow.'
            : data.error || 'The assistant had a problem. Try again.'
        )
      }
      setMessages((m) => [...m, { role: 'model', text: data.reply || '…' }])
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
          <input type="file" accept="image/*" capture="environment" onChange={attach} />
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
