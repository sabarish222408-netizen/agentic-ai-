import { Activity, BookOpenCheck, ChevronLeft, ChevronRight, Clock3, FileCheck2, LayoutDashboard, Settings2, ShieldCheck } from 'lucide-react'
import type { PageKey } from '../types'

const links: { id: PageKey; label: string; icon: typeof Activity }[] = [
  { id: 'verify', label: 'Verify answer', icon: BookOpenCheck },
  { id: 'results', label: 'Results', icon: FileCheck2 },
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'history', label: 'History', icon: Clock3 },
  { id: 'sources', label: 'Source library', icon: ShieldCheck },
  { id: 'settings', label: 'Settings', icon: Settings2 },
]

interface SidebarProps {
  current: PageKey
  onNavigate: (page: PageKey) => void
  collapsed: boolean
  onToggleCollapsed: () => void
}

export function Sidebar({ current, onNavigate, collapsed, onToggleCollapsed }: SidebarProps) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <a className="brand" href="#verify" title="VeriAgent AI" onClick={(event) => { event.preventDefault(); onNavigate('verify') }}>
        <span className="brand-mark"><Activity size={19} strokeWidth={2.6} /></span>
        <span className="brand-name">veriagent<span>AI</span></span>
      </a>
      <button className="workspace-label" type="button" aria-expanded={!collapsed} aria-label={collapsed ? 'Expand workspace sidebar' : 'Collapse workspace sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={onToggleCollapsed}>
        <span>WORKSPACE</span>{collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
      </button>
      <nav className="side-nav" aria-label="Main navigation">
        {links.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`nav-item ${current === id ? 'selected' : ''}`} title={collapsed ? label : undefined} aria-label={collapsed ? label : undefined} onClick={() => onNavigate(id)}>
            <Icon size={17} strokeWidth={1.9} /><span className="nav-label">{label}</span>
            {id === 'verify' && <span className="nav-shortcut">⌘ 1</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        {!collapsed && <div className="source-quality">
          <div className="quality-top"><span className="quality-dot" />Source quality</div>
          <p>Primary sources prioritized</p>
          <div className="quality-meter"><span /></div>
          <div className="quality-foot"><span>Evidence standard</span><strong>Strict</strong></div>
        </div>}
        <div className="profile-row">
          <div className="avatar" title="VeriAgent workspace">VA</div>
          {!collapsed && <><div className="profile-copy"><strong>VeriAgent workspace</strong><span>Demo account</span></div><span className="profile-menu">···</span></>}
        </div>
      </div>
    </aside>
  )
}