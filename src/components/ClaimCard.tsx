import { ArrowUpRight, Check, CircleHelp, FileText, X } from 'lucide-react'
import type { Claim } from '../types'

const statusIcon = {
  VERIFIED: Check,
  'PARTIALLY VERIFIED': CircleHelp,
  CONTRADICTED: X,
  UNSUPPORTED: FileText,
  UNCERTAIN: CircleHelp,
}

interface ClaimCardProps {
  claim: Claim
  index: number
}

export function ClaimCard({ claim, index }: ClaimCardProps) {
  const StatusIcon = statusIcon[claim.status]
  return (
    <article className="claim-card">
      <div className="claim-head">
        <span className="claim-number">CLAIM {String(index + 1).padStart(2, '0')}</span>
        <span className={`status-badge ${claim.status.toLowerCase().replaceAll(' ', '-')}`}><StatusIcon size={13} />{claim.status}</span>
      </div>
      <p className="claim-text">“{claim.text}”</p>
      <div className="claim-confidence">
        <span>Confidence</span><strong>{claim.confidence}</strong>
        <div className="confidence-track"><span style={{ width: `${Math.round(claim.confidence_score * 100)}%` }} /></div>
        <span className="confidence-pct">{Math.round(claim.confidence_score * 100)}%</span>
      </div>
      <div className="claim-explanation">{claim.explanation}</div>
      {claim.correction && <div className="correction-box"><span>BETTER-SUPPORTED INFORMATION</span><p>{claim.correction}</p></div>}
      <div className="evidence-head"><span>Evidence</span><span>{claim.sources.length} sources</span></div>
      <div className="source-list">
        {claim.sources.map((source) => (
          <a className="source-card" href={source.url} key={source.url} target="_blank" rel="noreferrer">
            <span className="source-icon"><FileText size={15} /></span>
            <span className="source-meta"><strong>{source.title}</strong><small>{source.publisher} <i>·</i> {source.kind}</small></span>
            <ArrowUpRight size={15} className="source-open" />
          </a>
        ))}
        {claim.sources.length === 0 && <p className="empty-evidence">No reliable evidence was returned. This claim is not marked as verified.</p>}
      </div>
    </article>
  )
}