/**
 * ArenzaMCPClient — JSON-RPC over HTTP wrapper around the Arenza MCP
 * server. The MCP server speaks JSON-RPC 2.0 with method names
 * `tools/call` (per the MCP spec). This client exposes typed methods
 * that internally serialize to those calls.
 *
 * Auth: Bearer token in Authorization header. OAuth flow lives in a
 * future release.
 */

import type {
  ArenzaMCPClientOptions,
  Brand,
  BrandOverview,
  Prompt,
  Opportunity,
  Competitor,
  CompetitorSuggestion,
  PromptSuggestion,
} from './types.js';

const DEFAULT_ENDPOINT = 'https://mcp.arenza.ai/rpc';
const DEFAULT_TIMEOUT_MS = 30_000;

interface JsonRpcResponse<T> {
  jsonrpc: '2.0';
  id: string;
  result?: { content: Array<{ type: 'text'; text: string }> };
  error?: { code: number; message: string; data?: unknown };
}

export class ArenzaMCPClient {
  private endpoint: string;
  private token: string;
  private timeoutMs: number;
  private requestId = 0;

  constructor(opts: ArenzaMCPClientOptions) {
    if (!opts.token) {
      throw new Error('@arenza/mcp-client: `token` is required. Get one at https://app.arenza.ai/settings/api');
    }
    this.endpoint = opts.endpoint ?? DEFAULT_ENDPOINT;
    this.token = opts.token;
    this.timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  /** Internal: send a `tools/call` JSON-RPC request and parse the result. */
  private async callTool<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
    const id = String(++this.requestId);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);

    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id,
          method: 'tools/call',
          params: { name, arguments: args },
        }),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        throw new Error(`Arenza MCP HTTP ${res.status}: ${await res.text()}`);
      }

      const json = (await res.json()) as JsonRpcResponse<T>;
      if (json.error) {
        throw new Error(`Arenza MCP error ${json.error.code}: ${json.error.message}`);
      }

      // MCP servers return result as { content: [{ type: 'text', text: '<json>' }] }
      const text = json.result?.content?.[0]?.text;
      if (!text) {
        throw new Error('Arenza MCP: empty response');
      }
      return JSON.parse(text) as T;
    } finally {
      clearTimeout(timer);
    }
  }

  // ─── Read tools ───────────────────────────────────────────────────────

  /** List all brands in the authenticated tenant's portfolio. */
  listBrands(): Promise<Brand[]> {
    return this.callTool<Brand[]>('list_brands');
  }

  /** Aggregate visibility + accuracy snapshot for one brand. */
  getBrandOverview(args: { brand_id: string }): Promise<BrandOverview> {
    return this.callTool<BrandOverview>('get_brand_overview', args);
  }

  /** List the AI prompts probed for a brand, with mention rates per LLM. */
  listPrompts(args: { brand_id: string; intent?: Prompt['intent'] }): Promise<Prompt[]> {
    return this.callTool<Prompt[]>('list_prompts', args);
  }

  /** List measurement-led GEO opportunities for a brand. */
  listOpportunities(args: { brand_id: string; type?: Opportunity['type'] }): Promise<Opportunity[]> {
    return this.callTool<Opportunity[]>('list_opportunities', args);
  }

  /** LLM-suggested competitors based on the brand description. */
  suggestCompetitors(args: { brand_id: string; count?: number }): Promise<CompetitorSuggestion[]> {
    return this.callTool<CompetitorSuggestion[]>('suggest_competitors', args);
  }

  /** LLM-generated buyer-perspective prompts (70%+ unbranded ratio enforced). */
  suggestPrompts(args: {
    brand_id: string;
    competitors?: string[];
    count?: number;
    locale?: 'en' | 'zh';
  }): Promise<PromptSuggestion[]> {
    return this.callTool<PromptSuggestion[]>('suggest_prompts', args);
  }

  // ─── Write tools ──────────────────────────────────────────────────────

  /** Add a competitor to a brand's tracking list. */
  addCompetitor(args: { brand_id: string; name: string; domain: string }): Promise<Competitor> {
    return this.callTool<Competitor>('add_competitor', args);
  }

  /** Remove a competitor (e.g. wrong suggestion). */
  dismissCompetitor(args: { brand_id: string; competitor_id: string }): Promise<{ ok: true }> {
    return this.callTool<{ ok: true }>('dismiss_competitor', args);
  }

  /** Mark a GEO opportunity as completed. */
  markOpportunityDone(args: { opportunity_id: string }): Promise<{ ok: true }> {
    return this.callTool<{ ok: true }>('mark_opportunity_done', args);
  }

  /** Draft a canonical-fact article body anchored to a specific finding. */
  generateGeoArticle(args: {
    brand_id: string;
    linked_claim_id: string;
    locale?: 'en' | 'zh';
  }): Promise<{ title: string; body: string; sources: string[] }> {
    return this.callTool<{ title: string; body: string; sources: string[] }>('generate_geo_article', args);
  }
}
