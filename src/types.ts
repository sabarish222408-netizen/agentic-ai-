export type ClaimStatus = 'VERIFIED' | 'PARTIALLY VERIFIED' | 'CONTRADICTED' | 'UNSUPPORTED' | 'UNCERTAIN'

export interface Source {
  title: string
  publisher: string
  url: string
  published: string
  kind: string
}

export interface Claim {
  id: string
  text: string
  status: ClaimStatus
  confidence: 'High' | 'Medium' | 'Low'
  confidence_score: number
  explanation: string
  correction: string
  sources: Source[]
}

export interface AgentStep {
  id: string
  label: string
  state: 'complete' | 'active' | 'pending' | 'blocked'
}

export interface VerificationResult {
  id: string
  created_at: string
  provider: string
  question: string
  answer: string
  corrected_answer: string
  claims: Claim[]
  agents: AgentStep[]
  disclaimer: string
}

export type PageKey = 'verify' | 'results' | 'dashboard' | 'history' | 'sources' | 'settings'