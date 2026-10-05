import type { VerificationResult } from '../types'

export const demoResult: VerificationResult = {
  id: 'demo-iphone-check',
  created_at: '2026-10-02T09:42:00Z',
  provider: 'ChatGPT',
  question: 'When was the first iPhone released?',
  answer: 'The first iPhone was released in 2008.',
  corrected_answer: 'The original iPhone was announced on January 9, 2007, and went on sale in the United States on June 29, 2007.',
  claims: [{
    id: 'claim-01',
    text: 'The first iPhone was released in 2008.',
    status: 'CONTRADICTED',
    confidence: 'High',
    confidence_score: 0.97,
    explanation: "Apple's launch announcement and release date place the original iPhone in 2007, not 2008.",
    correction: 'The original iPhone went on sale in the United States on June 29, 2007.',
    sources: [
      { title: 'Apple Reinvents the Phone with iPhone', publisher: 'Apple Newsroom', url: 'https://www.apple.com/newsroom/2007/01/09Apple-Reinvents-the-Phone-with-iPhone/', published: '2007-01-09', kind: 'Primary source' },
      { title: 'iPhone to go on sale June 29', publisher: 'Apple Newsroom', url: 'https://www.apple.com/newsroom/2007/06/18iPhone-to-Go-On-Sale-June-29/', published: '2007-06-18', kind: 'Primary source' },
    ],
  }],
  agents: [
    { id: 'intake', label: 'Input received', state: 'complete' },
    { id: 'extract', label: 'Extracting claims', state: 'complete' },
    { id: 'research', label: 'Researching evidence', state: 'complete' },
    { id: 'crosscheck', label: 'Cross-checking sources', state: 'complete' },
    { id: 'verify', label: 'Verifying claims', state: 'complete' },
    { id: 'correct', label: 'Generating corrections', state: 'complete' },
    { id: 'report', label: 'Final report', state: 'complete' },
  ],
  disclaimer: 'Demo evidence is fixed example data. Connect a research provider before using this result to verify other claims.',
}

export const demoHistory = [
  { question: 'When was the first iPhone released?', date: 'Today, 09:42', claims: 1, status: 'Contradicted', provider: 'ChatGPT' },
  { question: 'Who wrote the first Python implementation?', date: 'Today, 09:18', claims: 3, status: 'Verified', provider: 'Claude' },
  { question: 'Does the Great Wall show up from the Moon?', date: 'Yesterday', claims: 2, status: 'Mixed', provider: 'Gemini' },
  { question: 'How many bones are in an adult body?', date: 'Yesterday', claims: 1, status: 'Verified', provider: 'Other' },
]