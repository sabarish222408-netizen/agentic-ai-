import { Check, Circle, LoaderCircle, LockKeyhole } from 'lucide-react'
import type { AgentStep } from '../types'

interface AgentTimelineProps {
  steps: AgentStep[]
  compact?: boolean
}

export function AgentTimeline({ steps, compact = false }: AgentTimelineProps) {
  return (
    <ol className={`agent-timeline ${compact ? 'compact' : ''}`}>
      {steps.map((step, index) => (
        <li key={step.id} className={`agent-step ${step.state}`}>
          <span className="step-icon" aria-hidden="true">
            {step.state === 'complete' ? <Check size={13} /> : step.state === 'active' ? <LoaderCircle size={14} className="spin" /> : step.state === 'blocked' ? <LockKeyhole size={12} /> : <Circle size={10} />}
          </span>
          <span className="step-label">{step.label}</span>
          {step.state === 'complete' && <span className="step-state-label">DONE</span>}
          {step.state === 'active' && <span className="step-state-label active-label">LIVE</span>}
          {!compact && <span className="step-index">{String(index + 1).padStart(2, '0')}</span>}
        </li>
      ))}
    </ol>
  )
}