/**
 * Public types for @arenza/mcp-client. Mirrors the JSON-RPC tool result
 * shapes from the Arenza MCP server (`mcp.arenza.ai`). When the server
 * adds fields, this file is bumped first so consumers see new fields
 * via TypeScript completion.
 */

export interface ArenzaMCPClientOptions {
  /** API token from https://app.arenza.ai/settings/api */
  token: string;
  /** Override the MCP endpoint (default: https://mcp.arenza.ai/rpc) */
  endpoint?: string;
  /** Per-request timeout in ms (default: 30_000) */
  timeoutMs?: number;
}

export interface Brand {
  id: string;
  name: string;
  domain: string;
  region: 'global' | 'chuhai';
  created_at: string;
}

export interface BrandOverview {
  brand_id: string;
  share_of_voice: number;
  wrong_claims: number;
  mentions_per_llm: Record<'chatgpt' | 'claude' | 'gemini' | 'perplexity' | 'copilot' | 'grok', number>;
  last_scan_at: string;
}

export interface Prompt {
  id: string;
  brand_id: string;
  text: string;
  intent: 'discovery' | 'comparison' | 'how_to' | 'integration' | 'pricing';
  branded: boolean;
  mention_rate_by_llm: Record<string, number>;
}

export interface Opportunity {
  id: string;
  brand_id: string;
  type: 'wrong_claim' | 'missing_canonical_page' | 'listicle_gap' | 'discussion_seed';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  linked_claim_id?: string;
  done: boolean;
}

export interface Competitor {
  id: string;
  brand_id: string;
  name: string;
  domain: string;
  added_at: string;
}

export interface CompetitorSuggestion {
  name: string;
  domain: string;
  rationale: string;
}

export interface PromptSuggestion {
  text: string;
  intent: Prompt['intent'];
  unbranded: boolean;
}
