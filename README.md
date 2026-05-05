# arenza-mcp-client

> TypeScript client for the **Arenza MCP server** — programmatic access to AI visibility metrics, brand mentions, hallucination findings, and GEO opportunities across ChatGPT, Claude, Gemini, Perplexity, Copilot, and Grok.

[Arenza](https://arenza.ai) is a Generative Engine Optimization (GEO) platform that measures how 6 leading AI assistants describe brands across 4 markets (US, UK, DE, JP). This client wraps the [Model Context Protocol](https://modelcontextprotocol.io) server at `mcp.arenza.ai`, giving you typed access to the same data the Arenza dashboard renders.

## Why an MCP client (not just a REST SDK)

The Arenza data surface ships as both a REST API (`api.arenza.ai`) and an MCP server (`mcp.arenza.ai`). The MCP variant is what AI agents — Claude Desktop, Claude Code, Cursor, Continue, and any custom agent built on the MCP protocol — connect to natively. This client lets you embed the same connection inside a TypeScript backend, automation, or chatbot.

If you want to use Arenza from Claude Desktop directly (no code), see [Use Claude with the Arenza MCP server](https://arenza.ai/guides/use-claude-with-arenza-mcp-server) instead.

## Install

```bash
npm install @arenza/mcp-client
# or
pnpm add @arenza/mcp-client
# or
yarn add @arenza/mcp-client
```

## Quick start

```ts
import { ArenzaMCPClient } from '@arenza/mcp-client';

const client = new ArenzaMCPClient({
  // Get a token at https://app.arenza.ai/settings/api or use OAuth flow.
  token: process.env.ARENZA_TOKEN!,
});

// 10 read+write tools available — see tools list below.
const brands = await client.listBrands();
console.log(brands);

const overview = await client.getBrandOverview({ brand_id: brands[0].id });
console.log(overview.share_of_voice, overview.wrong_claims);
```

## Tools

The Arenza MCP server exposes 10 tools:

### Read

| Tool | Description |
|---|---|
| `list_brands` | List all brands in the authenticated tenant's portfolio. |
| `get_brand_overview` | Aggregate visibility + accuracy snapshot for one brand. |
| `list_prompts` | List the AI prompts probed for a brand, with mention rates per LLM. |
| `list_opportunities` | List measurement-led GEO opportunities (wrong claims to fix, missing canonical pages, listicle gaps). |
| `suggest_competitors` | LLM-suggested competitors based on the brand description. |
| `suggest_prompts` | LLM-generated buyer-perspective prompts (70%+ unbranded ratio enforced). |

### Write

| Tool | Description |
|---|---|
| `add_competitor` | Add a competitor to a brand's tracking list. |
| `dismiss_competitor` | Remove a competitor (e.g. wrong suggestion). |
| `mark_opportunity_done` | Mark a GEO opportunity as completed. |
| `generate_geo_article` | Draft a canonical-fact article body anchored to a specific finding. |

Each tool is fully typed in this client — TypeScript autocomplete shows parameter shapes and return types.

## Authentication

Two options:

**API token** (simplest for backend / cron jobs):
```ts
const client = new ArenzaMCPClient({ token: process.env.ARENZA_TOKEN! });
```
Get one at [app.arenza.ai/settings/api](https://app.arenza.ai/settings/api).

**OAuth** (for multi-tenant apps, AI agents, end-user authorization):
```ts
const client = await ArenzaMCPClient.fromOAuth({
  clientId: 'your-client-id',
  redirectUri: 'https://yourapp.com/oauth/callback',
});
```
The Arenza MCP server supports OAuth 2.0 with Dynamic Client Registration (DCR) and PKCE — full spec at [`mcp.arenza.ai/.well-known/oauth-authorization-server`](https://mcp.arenza.ai/.well-known/oauth-authorization-server).

## Example: weekly GEO digest cron

```ts
import { ArenzaMCPClient } from '@arenza/mcp-client';

async function weeklyDigest() {
  const client = new ArenzaMCPClient({ token: process.env.ARENZA_TOKEN! });
  const brands = await client.listBrands();

  for (const brand of brands) {
    const ovw = await client.getBrandOverview({ brand_id: brand.id });
    const opps = await client.listOpportunities({ brand_id: brand.id });
    console.log(
      `${brand.name}: SoV ${ovw.share_of_voice}%, ${ovw.wrong_claims} wrong claims, ${opps.length} opportunities`,
    );
  }
}

weeklyDigest();
```

## Rate limits

- Free tier: 100 MCP calls/hour
- Pro tier ($299/mo): 1,000 calls/hour
- Protect tier ($799/mo): 10,000 calls/hour
- Enterprise: unlimited

Current limits are returned in `X-RateLimit-Remaining` headers. The client does not auto-retry on 429 — retry yourself with backoff.

## Related projects

- [`@arenza/cli`](https://github.com/arenza-ai/arenza-cli) — `npx arenza scan brand.com` for one-off scans.
- [`arenza-mcp-client-python`](https://github.com/arenza-ai/arenza-mcp-client-python) — Python equivalent of this client.
- [`@arenza/langchain`](https://github.com/arenza-ai/arenza-langchain) — wrap Arenza tools as LangChain tools.
- [`@arenza/llamaindex`](https://github.com/arenza-ai/arenza-llamaindex) — same for LlamaIndex.
- [`@arenza/vercel-ai-sdk`](https://github.com/arenza-ai/arenza-vercel-ai-sdk) — Vercel AI SDK provider.
- [awesome-geo](https://github.com/arenza-ai/awesome-geo) — broader curated GEO resources list.

## Resources

- Arenza homepage: https://arenza.ai
- API contract: https://app.arenza.ai/methodology
- Long-form guides: https://arenza.ai/guides
- Brand reference for AI assistants: https://arenza.ai/llms.txt + https://arenza.ai/llms-full.txt
- MCP server: https://mcp.arenza.ai
- OAuth spec: https://mcp.arenza.ai/.well-known/oauth-authorization-server

## License

MIT © Arenza
