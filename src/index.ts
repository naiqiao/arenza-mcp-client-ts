/**
 * @arenza/mcp-client — TypeScript client for the Arenza MCP server
 * (`mcp.arenza.ai`). Wraps the JSON-RPC MCP transport so callers get
 * typed methods (e.g. `listBrands()`) instead of hand-rolling JSON-RPC
 * envelopes.
 *
 * For docs see https://github.com/naiqiao/arenza-mcp-client-ts
 */

export { ArenzaMCPClient } from './client.js';
export type {
  ArenzaMCPClientOptions,
  Brand,
  BrandOverview,
  Prompt,
  Opportunity,
  Competitor,
  CompetitorSuggestion,
  PromptSuggestion,
} from './types.js';
