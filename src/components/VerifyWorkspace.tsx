import { ArrowRight, ArrowUpRight, Bot, ChevronDown, CircleHelp, Clipboard, LoaderCircle, Search, Sparkles } from 'lucide-react'
import { useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { demoResult } from '../data/demo'
import { apiFetch } from '../lib/api'
import type { AgentStep, PageKey, VerificationResult } from '../types'
import { AgentTimeline } from './AgentTimeline'
import { ClaimCard } from './ClaimCard'
import { VerdictRobot } from './VerdictRobot'

const initialSteps: AgentStep[] = [
  { id: 'intake', label: 'Input received', state: 'pending' },
  { id: 'extract', label: 'Extracting claims', state: 'pending' },
  { id: 'research', label: 'Researching evidence', state: 'pending' },
  { id: 'crosscheck', label: 'Cross-checking sources', state: 'pending' },
  { id: 'verify', label: 'Verifying claims', state: 'pending' },
  { id: 'correct', label: 'Generating corrections', state: 'pending' },
  { id: 'report', label: 'Final report', state: 'pending' },
]

interface GroundingSource {
  title: string
  publisher: string
  url: string
  kind: string
}

interface VerifyWorkspaceProps {
  onResult: (result: VerificationResult) => void
  onNavigate: (page: PageKey) => void
  onSaved: (result: VerificationResult) => void
}

export function VerifyWorkspace({ onResult, onNavigate, onSaved }: VerifyWorkspaceProps) {
  const [question, setQuestion] = useState('When was the first iPhone released?')
  const [answer, setAnswer] = useState('The original iPhone was announced on January 9, 2007 and released in the United States on June 29, 2007.')
  const [provider, setProvider] = useState('ChatGPT')
  const [generatingAnswer, setGeneratingAnswer] = useState(false)
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([])
  const [steps, setSteps] = useState<AgentStep[]>(initialSteps)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<VerificationResult | null>(null)
  const answerTimer = useRef<number | null>(null)
  const answerRequestId = useRef(0)
  const answerRequest = useRef<AbortController | null>(null)

  async function generateWithGoogle(questionToGenerate = question) {
    if (!questionToGenerate.trim()) return
    if (answerTimer.current !== null) {
      window.clearTimeout(answerTimer.current)
      answerTimer.current = null
    }
    answerRequest.current?.abort()
    const requestId = ++answerRequestId.current
    const controller = new AbortController()
    answerRequest.current = controller
    setGeneratingAnswer(true)
    setError('')
    try {
      const apiResponse = await apiFetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionToGenerate }),
        signal: controller.signal,
      })
      const payload = await apiResponse.json() as { answer?: string; sources?: GroundingSource[]; detail?: string }
      if (!apiResponse.ok) throw new Error(payload.detail || `Google answer service returned ${apiResponse.status}`)
      if (!payload.answer || !payload.sources?.length) throw new Error('Google did not return a cited answer. No answer was added.')
      if (requestId !== answerRequestId.current) return
      setAnswer(payload.answer)
      setGroundingSources(payload.sources)
      setProvider('Gemini')
    } catch (generationError) {
      if (requestId !== answerRequestId.current || (generationError instanceof DOMException && generationError.name === 'AbortError')) return
      setError(generationError instanceof Error ? generationError.message : 'Google-grounded answer generation failed.')
    } finally {
      if (requestId === answerRequestId.current) {
        answerRequest.current = null
        setGeneratingAnswer(false)
      }
    }
  }

  function updateQuestion(value: string) {
    if (answerTimer.current !== null) window.clearTimeout(answerTimer.current)
    answerRequest.current?.abort()
    answerRequestId.current += 1
    setQuestion(value)
    setAnswer('')
    setGroundingSources([])
    setError('')
    setGeneratingAnswer(false)
    if (value.trim().length >= 3) {
      answerTimer.current = window.setTimeout(() => {
        answerTimer.current = null
        void generateWithGoogle(value)
      }, 850)
    }
  }

  function updateAnswer(value: string) {
    setAnswer(value)
    setGroundingSources([])
  }

  function handleQuestionKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      void generateWithGoogle()
    }
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!question.trim() || !answer.trim() || loading) return
    setLoading(true)
    setError('')
    setResult(null)
    let response: VerificationResult | null = null
    const work = (async () => {
      for (let index = 0; index < initialSteps.length; index += 1) {
        setSteps(initialSteps.map((step, stepIndex) => ({ ...step, state: stepIndex < index ? 'complete' : stepIndex === index ? 'active' : 'pending' })))
        await new Promise((resolve) => window.setTimeout(resolve, 360))
      }
    })()
    try {
      const apiResponse = await apiFetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer, provider }),
      })
      if (!apiResponse.ok) throw new Error(`Verification service returned ${apiResponse.status}`)
      response = await apiResponse.json() as VerificationResult
    } catch {
      const isDemo = question.toLowerCase().includes('iphone') && answer.includes('2008')
      if (isDemo) {
        response = { ...demoResult, id: crypto.randomUUID(), created_at: new Date().toISOString(), question, answer, provider }
      } else {
        setError('The verification API is unavailable. Start the backend to verify claims; no verdict or sources were fabricated.')
      }
    }
    await work
    if (response) {
      setSteps(response.agents)
      setResult(response)
      onResult(response)
      onSaved(response)
    }
    setLoading(false)
  }

  return (
    <div className="verify-layout">
      <section className="verify-main">
        <div className="page-heading">
          <div><div className="eyebrow"><span className="eyebrow-line" />INDEPENDENT FACT CHECKING</div><h1>Verify an answer</h1><p>Bring an AI answer. Leave with evidence.</p></div>
          <button className="text-action" onClick={() => onNavigate('history')}>Recent checks <ArrowRight size={14} /></button>
        </div>

        <form className="input-panel" onSubmit={verify}>
          <div className="input-panel-top"><div className="panel-title"><span className="panel-step">01</span><span>Provide context</span></div><span className="privacy-note"><span />Private workspace</span></div>
          <div className="question-label-row"><label className="field-label" htmlFor="question">Your question <span>Required</span></label><span className="enter-hint">Answer generates as you type</span></div>
          <div className="question-entry-row"><input id="question" className="question-input" value={question} onChange={(event) => updateQuestion(event.target.value)} onKeyDown={handleQuestionKeyDown} placeholder="Ask a question to research..." maxLength={2000} required /><button className="google-answer-button generate-answer-button" type="button" onClick={() => void generateWithGoogle()} disabled={generatingAnswer || !question.trim()}>{generatingAnswer ? <LoaderCircle size={14} className="spin" /> : <Search size={14} />}<span>{generatingAnswer ? 'Searching Google' : 'Generate AI answer'}</span><ArrowRight size={13} /></button></div>
          <div className="answer-label-row"><label className="field-label" htmlFor="answer">AI-generated answer <span>Required</span></label><span className="character-count">{answer.length.toLocaleString()} / 12,000</span></div>
          <textarea id="answer" className="answer-input" value={answer} onChange={(event) => updateAnswer(event.target.value)} placeholder="Your Google-grounded answer will appear here. You can review and edit it before verification." maxLength={12000} required />
          {groundingSources.length > 0 && <div className="google-grounding"><div className="google-grounding-title"><span>GOOGLE SEARCH · GEMINI</span><span>{groundingSources.length} citations</span></div><div className="google-grounding-sources">{groundingSources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span><strong>{source.title}</strong><small>{source.publisher} · {source.kind}</small></span><ArrowUpRight size={14} /></a>)}</div></div>}
          <div className="form-footer"><label className="provider-control"><span>Source AI</span><span className="select-wrap"><select value={provider} onChange={(event) => setProvider(event.target.value)}><option>ChatGPT</option><option>Gemini</option><option>Claude</option><option>Other</option></select><ChevronDown size={13} /></span></label>
            <button className="verify-button" type="submit" disabled={loading}><span>{loading ? 'Checking claims' : 'Verify information'}</span>{loading ? <LoaderCircle size={16} className="spin" /> : <ArrowRight size={16} />}</button>
          </div>
        </form>

        {(loading || generatingAnswer) && <section className="progress-panel" aria-live="polite" aria-busy="true">
          <div className="progress-head"><div><span className="live-indicator" /><strong>{generatingAnswer ? 'Researching your question' : 'Verification in progress'}</strong></div><span>{generatingAnswer ? 'GOOGLE SEARCH · LIVE' : 'AGENT RUN · LIVE'}</span></div>
          <div className={`robot-loader ${generatingAnswer ? 'researching' : 'verifying'}`}>
            <div className="robot-scene" role="img" aria-label="Robot scanning information while VeriAgent works">
              <div className="robot-scan-beam" />
              <div className="robot-status"><span className="live-indicator" />{generatingAnswer ? 'SCANNING GOOGLE' : 'CROSS-CHECKING CLAIMS'}</div>
              <div className="robot-caption"><Bot size={17} /><span>{generatingAnswer ? 'Gathering sourced information' : 'Comparing claims with evidence'}</span></div>
            </div>
            <div className="robot-copy"><span className="robot-copy-label">VERIAGENT RESEARCH UNIT <i /></span><span className="robot-copy-title">{generatingAnswer ? 'Searching trusted sources' : 'Checking the evidence trail'}</span><span className="robot-copy-detail">{generatingAnswer ? 'Your answer will appear here with source links.' : 'Claims without evidence remain unresolved.'}</span></div>
          </div>
          {!generatingAnswer && <AgentTimeline steps={steps} />}
          <div className="progress-foot"><Sparkles size={14} /><span>{generatingAnswer ? 'The answer box will update when sourced results are ready.' : 'Evidence first. Verdicts only when the sources support them.'}</span></div>
        </section>}
        {error && <div className="error-banner" role="alert"><CircleHelp size={17} /><span>{error}</span></div>}
        {!loading && !result && <div className="workflow-preview"><div className="preview-copy"><span className="preview-icon"><Clipboard size={16} /></span><div><strong>A clear audit trail</strong><span>Claims, source quality and corrections in one report.</span></div></div><button onClick={() => onNavigate('sources')}>View source standards <ArrowRight size={14} /></button></div>}

        {result && <section className="results-section" aria-live="polite">
          <VerdictRobot claims={result.claims} />
          <div className="result-overview"><div><div className={`result-kicker ${result.claims.length ? '' : 'unresolved-kicker'}`}><span className="result-check">{result.claims.length ? '✓' : '!'}</span> {result.claims.length ? 'VERIFICATION COMPLETE' : 'REPORT READY · NO VERDICT'}</div><h2>Evidence report</h2><p>{result.claims.length ? `${result.claims.length} claim reviewed · ${result.provider}` : 'No claims verified'}</p></div><button className="outline-button" onClick={() => navigator.clipboard?.writeText(result.corrected_answer)}><Clipboard size={14} />Copy correction</button></div>
          {result.claims.length > 0 ? <><div className="result-summary"><div><strong>{result.claims.filter((claim) => claim.status === 'VERIFIED').length}</strong><span>Verified</span></div><div><strong>{result.claims.filter((claim) => claim.status === 'PARTIALLY VERIFIED').length}</strong><span>Partial</span></div><div><strong className="number-alert">{result.claims.filter((claim) => claim.status === 'CONTRADICTED').length}</strong><span>Contradicted</span></div><div><strong>{result.claims.filter((claim) => claim.status === 'UNSUPPORTED' || claim.status === 'UNCERTAIN').length}</strong><span>Unresolved</span></div></div><div className="claim-stack">{result.claims.map((claim, index) => <ClaimCard key={claim.id} claim={claim} index={index} />)}</div><div className="corrected-answer"><div className="corrected-heading"><span>FINAL CORRECTED ANSWER</span><span>Evidence-aligned</span></div><p>{result.corrected_answer}</p></div></> : <div className="no-claims"><CircleHelp size={20} /><p>{result.corrected_answer}</p></div>}
          <div className="result-disclaimer">{result.disclaimer}</div>
        </section>}
      </section>

      <aside className="verify-rail"><div className="rail-heading"><span className="rail-number">A</span><div><strong>Verification path</strong><span>Independent review</span></div></div><AgentTimeline steps={loading ? steps : result?.agents ?? initialSteps} compact />
        <div className="rail-divider" /><div className="rail-note"><span className="rail-note-icon"><CircleHelp size={16} /></span><div><strong>Evidence over confidence</strong><p>Claims without sufficient evidence remain unresolved. No source means no verdict.</p></div></div>
        <div className="rail-source-note"><span>RESEARCH STANDARD</span><p>Official and primary sources are prioritized. Independent corroboration is surfaced when available.</p><button onClick={() => onNavigate('sources')}>Source policy <ArrowRight size={13} /></button></div>
      </aside>
    </div>
  )
}