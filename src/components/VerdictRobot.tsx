import { Bot, Sparkles } from 'lucide-react'
import type { Claim } from '../types'

interface VerdictRobotProps {
  claims: Claim[]
}

export function VerdictRobot({ claims }: VerdictRobotProps) {
  const mood = claims.some((claim) => claim.status === 'CONTRADICTED')
    ? 'crying'
    : claims.length > 0 && claims.every((claim) => claim.status === 'VERIFIED')
      ? 'dancing'
      : 'checking'

  const messages = {
    dancing: { label: 'EVIDENCE CHECK PASSED', title: 'All claims verified', detail: 'The cited evidence supports every reviewed claim.' },
    crying: { label: 'CONTRADICTION FOUND', title: 'A claim needs correction', detail: 'At least one statement conflicts with the evidence.' },
    checking: { label: 'EVIDENCE INCOMPLETE', title: 'Still checking', detail: 'Some claims need more evidence before a verdict.' },
  }
  const message = messages[mood]

  return (
    <section className={`verdict-robot ${mood}`} aria-label={message.title}>
      <div className="verdict-robot-figure" aria-hidden="true">
        <span className="robot-halo" />
        <span className="robot-tear tear-left" />
        <span className="robot-tear tear-right" />
        {mood === 'dancing' && <Sparkles className="robot-sparkle sparkle-left" size={17} />}
        {mood === 'dancing' && <Sparkles className="robot-sparkle sparkle-right" size={14} />}
        <Bot className="verdict-bot-icon" size={52} strokeWidth={1.5} />
      </div>
      <div className="verdict-robot-copy">
        <span className="verdict-robot-label">{message.label}</span>
        <strong>{message.title}</strong>
        <span>{message.detail}</span>
      </div>
    </section>
  )
}