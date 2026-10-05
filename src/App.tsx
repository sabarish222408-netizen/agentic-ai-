import { ArrowDownRight, ArrowRight, Check, CircleHelp, Clock3, ExternalLink, FileSearch, Menu, Search, ShieldAlert, ShieldCheck, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { AgentTimeline } from './components/AgentTimeline'
import { ClaimCard } from './components/ClaimCard'
import { VerdictRobot } from './components/VerdictRobot'
import { VerifyWorkspace } from './components/VerifyWorkspace'
import { demoHistory } from './data/demo'
import { apiFetch } from './lib/api'
import type { PageKey, VerificationResult } from './types'

interface HistoryItem {
  id: string
  question: string
  date: string
  claims: number
  status: string
  provider: string
}

const titles: Record<PageKey, string> = {
  verify: 'Verify answer',
  results: 'Results',
  dashboard: 'Overview',
  history: 'Verification history',
  sources: 'Source standards',
  settings: 'Settings',
}

function App() {
  const [page, setPage] = useState<PageKey>('verify')
  const [mobileNav, setMobileNav] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [lastResult, setLastResult] = useState<VerificationResult | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('veriagent-history') || '[]') as HistoryItem[]
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('veriagent-history', JSON.stringify(history))
  }, [history])

  function saveResult(result: VerificationResult) {
    setHistory((current) => [{
      id: result.id,
      question: result.question,
      date: new Date(result.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
      claims: result.claims.length,
      status: result.claims.some((claim) => claim.status === 'CONTRADICTED') ? 'Contradicted' : result.claims.length ? 'Verified' : 'Unresolved',
      provider: result.provider,
    }, ...current.filter((item) => item.id !== result.id)].slice(0, 40))
  }

  const checks = history.length ? history : demoHistory.map((item, index) => ({ ...item, id: `sample-${index}` }))
  const claimTotal = checks.reduce((total, item) => total + item.claims, 0)
  const contradictedTotal = checks.filter((item) => item.status === 'Contradicted').length
  const verifiedTotal = checks.filter((item) => item.status === 'Verified').length
  const unresolvedTotal = checks.filter((item) => item.status === 'Unresolved' || item.status === 'Mixed').length

  function navigate(nextPage: PageKey) {
    setPage(nextPage)
    setMobileNav(false)
  }

  return (
    <div className={`app-frame ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className={`sidebar-wrap ${mobileNav ? 'open' : ''}`}><Sidebar current={page} onNavigate={navigate} collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed((collapsed) => !collapsed)} /></div>
      {mobileNav && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
      <main className="main-shell">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={19} /></button>
          <div className="breadcrumb"><span>VeriAgent</span><span className="crumb-slash">/</span><strong>{titles[page]}</strong></div>
          <div className="topbar-right"><span className="api-status"><span />DEMO ENVIRONMENT</span><button className="help-button" title="Help and feedback" aria-label="Help"><CircleHelp size={17} /></button></div>
        </header>
        {page === 'verify' && <VerifyWorkspace onResult={setLastResult} onSaved={saveResult} onNavigate={navigate} />}
        {page === 'results' && <ResultsPage result={lastResult} onNavigate={navigate} />}
        {page === 'dashboard' && <Dashboard history={checks} claimTotal={claimTotal} verifiedTotal={verifiedTotal} contradictedTotal={contradictedTotal} unresolvedTotal={unresolvedTotal} onNavigate={navigate} />}
        {page === 'history' && <HistoryPage history={checks} onNavigate={navigate} />}
        {page === 'sources' && <SourcesPage />}
        {page === 'settings' && <SettingsPage />}
        <footer className="app-footer"><span>VERIAGENT AI <i>·</i> EVIDENCE FIRST</span><span>Independent checks. Transparent sources.</span></footer>
      </main>
      {lastResult && <span className="sr-only" aria-live="polite">Latest result ready</span>}
    </div>
  )
}

interface DashboardProps {
  history: HistoryItem[]
  claimTotal: number
  verifiedTotal: number
  contradictedTotal: number
  unresolvedTotal: number
  onNavigate: (page: PageKey) => void
}

function Dashboard({ history, claimTotal, verifiedTotal, contradictedTotal, unresolvedTotal, onNavigate }: DashboardProps) {
  const metrics = [
    { label: 'Total verifications', value: history.length.toString().padStart(2, '0'), icon: FileSearch, tone: 'green', note: 'Across all sessions' },
    { label: 'Claims reviewed', value: claimTotal.toString().padStart(2, '0'), icon: ShieldCheck, tone: 'blue', note: 'Evidence assessed' },
    { label: 'Contradicted', value: contradictedTotal.toString().padStart(2, '0'), icon: ShieldAlert, tone: 'coral', note: 'Need correction' },
    { label: 'Unresolved', value: unresolvedTotal.toString().padStart(2, '0'), icon: CircleHelp, tone: 'gold', note: 'Insufficient evidence' },
  ]
  return <div className="content-page dashboard-page">
    <div className="page-heading dashboard-heading"><div><div className="eyebrow"><span className="eyebrow-line" />YOUR VERIFICATION DESK</div><h1>Overview</h1><p>A clearer view of what the evidence says.</p></div><button className="verify-button small" onClick={() => onNavigate('verify')}>New verification <ArrowRight size={15} /></button></div>
    <div className="metric-grid">{metrics.map(({ label, value, icon: Icon, tone, note }) => <div className="metric-card" key={label}><div className={`metric-icon ${tone}`}><Icon size={17} /></div><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong><span className="metric-note">{note}</span></div>)}</div>
    <section className="dashboard-band"><div className="band-heading"><div><span className="section-kicker">ACTIVITY</span><h2>Recent verification jobs</h2></div><button className="text-action" onClick={() => onNavigate('history')}>View all <ArrowRight size={14} /></button></div><HistoryTable history={history.slice(0, 5)} /></section>
    <section className="integrity-strip"><span className="integrity-mark"><ShieldCheck size={19} /></span><div><strong>Verification is not a vote of confidence.</strong><p>Each claim is checked against evidence independently of the model that wrote it.</p></div><span className="integrity-arrow"><ArrowDownRight size={20} /></span></section>
    <div className="dashboard-bottom"><span><Check size={13} /> {verifiedTotal} sessions marked verified</span><span>{claimTotal} total claims in view</span></div>
  </div>
}

function ResultsPage({ result, onNavigate }: { result: VerificationResult | null; onNavigate: (page: PageKey) => void }) {
  if (!result) return <div className="content-page"><div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" />VERIFICATION REPORT</div><h1>No report selected</h1><p>Run a verification to create an evidence-backed report.</p></div></div><button className="verify-button small" onClick={() => onNavigate('verify')}>Start verification <ArrowRight size={15} /></button></div>
  const contradicted = result.claims.filter((claim) => claim.status === 'CONTRADICTED').length
  const verified = result.claims.filter((claim) => claim.status === 'VERIFIED').length
  const unresolved = result.claims.filter((claim) => claim.status === 'UNSUPPORTED' || claim.status === 'UNCERTAIN').length
  return <div className="content-page report-page"><div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" />EVIDENCE REPORT · {result.provider.toUpperCase()}</div><h1>Verification results</h1><p>{result.question}</p></div><button className="outline-button" onClick={() => navigator.clipboard?.writeText(result.corrected_answer)}>Copy correction</button></div>
    <VerdictRobot claims={result.claims} />
    <div className="report-columns"><section className="report-main"><div className="result-summary"><div><strong>{verified}</strong><span>Verified</span></div><div><strong>{result.claims.filter((claim) => claim.status === 'PARTIALLY VERIFIED').length}</strong><span>Partial</span></div><div><strong className="number-alert">{contradicted}</strong><span>Contradicted</span></div><div><strong>{unresolved}</strong><span>Unresolved</span></div></div>
      <div className="report-section-title"><span>CLAIM-BY-CLAIM REVIEW</span><span>{result.claims.length} claims</span></div>{result.claims.length ? <div className="claim-stack">{result.claims.map((claim, index) => <ClaimCard key={claim.id} claim={claim} index={index} />)}</div> : <div className="no-claims"><CircleHelp size={20} /><p>{result.corrected_answer}</p></div>}
      {result.claims.length > 0 && <div className="corrected-answer"><div className="corrected-heading"><span>FINAL CORRECTED ANSWER</span><span>Evidence-aligned</span></div><p>{result.corrected_answer}</p></div>}<p className="result-disclaimer">{result.disclaimer}</p>
    </section><aside className="report-aside"><div className="report-aside-head"><ShieldCheck size={16} /><strong>Audit trail</strong></div><div className="original-answer"><span>ORIGINAL ANSWER</span><p>{result.answer}</p></div><div className="report-section-title"><span>AGENT WORKFLOW</span></div><AgentTimeline steps={result.agents} compact /><div className="original-answer"><span>QUESTION</span><p>{result.question}</p></div><div className="report-meta">REPORT ID <code>{result.id.slice(0, 12)}</code></div></aside></div>
  </div>
}

function HistoryPage({ history, onNavigate }: { history: HistoryItem[]; onNavigate: (page: PageKey) => void }) {
  const [query, setQuery] = useState('')
  const filtered = history.filter((item) => item.question.toLowerCase().includes(query.toLowerCase()))
  return <div className="content-page history-page"><div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" />AUDIT TRAIL</div><h1>Verification history</h1><p>Previous checks saved in this browser.</p></div><button className="verify-button small" onClick={() => onNavigate('verify')}>New verification <ArrowRight size={15} /></button></div>
    <div className="history-toolbar"><div className="search-wrap"><Search size={15} /><input aria-label="Search history" placeholder="Search questions" value={query} onChange={(event) => setQuery(event.target.value)} /></div><span>{filtered.length} records</span></div><HistoryTable history={filtered} />
    {filtered.length === 0 && <div className="empty-state"><Clock3 size={25} /><strong>No matching checks</strong><span>Try a different search or start a new verification.</span></div>}
    <p className="storage-note">History is stored locally in this browser. Configure the backend database for shared, server-side history.</p>
  </div>
}

function HistoryTable({ history }: { history: HistoryItem[] }) {
  return <div className="table-wrap"><table className="history-table"><thead><tr><th>QUESTION</th><th>AI SOURCE</th><th>CLAIMS</th><th>RESULT</th><th>DATE</th><th /></tr></thead><tbody>{history.map((item) => <tr key={item.id}><td><strong>{item.question}</strong><span className="table-id">ID · {item.id.slice(0, 8)}</span></td><td><span className="provider-pill">{item.provider}</span></td><td>{item.claims}</td><td><span className={`table-status ${item.status.toLowerCase()}`}><span />{item.status}</span></td><td className="date-cell">{item.date}</td><td><button className="row-action" title="Open verification" aria-label="Open verification"><ArrowRight size={15} /></button></td></tr>)}</tbody></table>
    {history.length === 0 && <div className="table-empty"><Clock3 size={19} /><span>No verification records yet.</span></div>}</div>
}

function SourcesPage() {
  const sources = [
    { tier: '01', title: 'Primary and official records', examples: 'Government publications, original research, official product announcements', quality: 'Highest priority', tone: 'green' },
    { tier: '02', title: 'Academic and research institutions', examples: 'Peer-reviewed journals, university research, recognized scientific bodies', quality: 'Strong evidence', tone: 'blue' },
    { tier: '03', title: 'Established reporting organizations', examples: 'Reputable newsrooms with transparent sourcing and editorial standards', quality: 'Corroborating evidence', tone: 'gold' },
  ]
  return <div className="content-page sources-page"><div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" />EVIDENCE POLICY</div><h1>Source standards</h1><p>Evidence quality matters more than a confident answer.</p></div><span className="policy-tag"><ShieldCheck size={14} /> STRICT MODE</span></div>
    <div className="policy-intro"><span className="policy-symbol"><ShieldCheck size={21} /></span><div><strong>Sources are evaluated, not just collected.</strong><p>Each result should link directly to the underlying evidence. Unsupported content stays unresolved; it is never filled in with plausible-sounding citations.</p></div></div>
    <div className="source-tier-list">{sources.map((source) => <article className="source-tier" key={source.tier}><span className="tier-number">{source.tier}</span><div><h2>{source.title}</h2><p>{source.examples}</p></div><span className={`tier-quality ${source.tone}`}>{source.quality}</span></article>)}</div>
    <section className="policy-boundary"><div className="boundary-title"><ShieldAlert size={17} /><strong>What we will not do</strong></div><div className="boundary-grid"><p><X size={14} /> Treat social posts as authoritative by default</p><p><X size={14} /> Generate source links without retrieved evidence</p><p><X size={14} /> Turn missing evidence into a factual verdict</p><p><X size={14} /> Hide dates, uncertainty or conflicting sources</p></div></section>
  </div>
}

function SettingsPage() {
  const [googleConfigured, setGoogleConfigured] = useState(false)
  const [googleModel, setGoogleModel] = useState('gemini-3.8-flash')

  useEffect(() => {
    let active = true
    apiFetch('/api/health')
      .then((response) => response.json() as Promise<{ google_grounding_configured?: boolean; google_model?: string }>)
      .then((configuration) => {
        if (!active) return
        setGoogleConfigured(Boolean(configuration.google_grounding_configured))
        if (configuration.google_model) setGoogleModel(configuration.google_model)
      })
      .catch(() => setGoogleConfigured(false))
    return () => { active = false }
  }, [])

  return <div className="content-page settings-page"><div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" />CONFIGURATION</div><h1>Settings</h1><p>Connect providers when you are ready to move beyond the demo.</p></div><span className="policy-tag"><span className="demo-dot" /> DEMO MODE</span></div>
    <section className="settings-section"><div className="settings-section-head"><div><span className="section-kicker">01 · MODEL PROVIDERS</span><h2>AI configuration</h2><p>Gemini API credentials stay on the backend and are never exposed to browser code.</p></div></div><div className="setting-row"><div className="setting-icon"><span>AI</span></div><div className="setting-copy"><strong>Google Gemini</strong><span>Generates concise answers grounded in current Google Search results.</span></div><span className={`setting-value ${googleConfigured ? '' : 'off'}`}>{googleConfigured ? 'Connected' : 'Key required'}</span></div><div className="setting-env">Server environment variable <code>GEMINI_API_KEY</code><span>Model: {googleModel}</span></div></section>
    <section className="settings-section"><div className="settings-section-head"><div><span className="section-kicker">02 · LIVE RESEARCH</span><h2>Google Search grounding</h2><p>Gemini searches the web and returns citations with each generated answer.</p></div></div><div className="setting-row"><div className="setting-icon search-setting"><Search size={17} /></div><div className="setting-copy"><strong>Grounding and citations</strong><span>{googleConfigured ? 'Ready to generate cited answers.' : 'Add a Gemini API key to enable live Google Search.'}</span></div><span className={`setting-value ${googleConfigured ? '' : 'off'}`}>{googleConfigured ? 'Online' : 'Offline'}</span></div><div className="setting-env">Google Custom Search JSON API is closed to new customers; this app uses Gemini Google Search grounding.</div></section>
    <section className="settings-section preferences-section"><div className="settings-section-head"><div><span className="section-kicker">03 · VERIFICATION</span><h2>Preferences</h2></div></div><div className="preference-row"><div><strong>Minimum independent sources</strong><span>Prefer more than one source when available.</span></div><span className="preference-value">2</span></div><div className="preference-row"><div><strong>Evidence threshold</strong><span>Lower evidence is presented as uncertainty.</span></div><span className="preference-value">Strict</span></div></section>
    <p className="settings-footnote"><ExternalLink size={13} /> Add a key from Google AI Studio to the backend environment, then restart FastAPI. Never paste API keys into the browser.</p>
  </div>
}

export default App