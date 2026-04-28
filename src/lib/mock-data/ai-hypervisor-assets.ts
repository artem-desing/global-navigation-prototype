// Asset categories from the AI Hypervisor Heatmap (per product-features.md,
// captured from the screenshot Artem shared 2026-04-28). These are content rows
// inside the Heatmap page — NOT nav items.

export interface AssetCategory {
  id: string;
  label: string;
  count: number;
  shadowAi: number;
}

export const aiHypervisorAssetCategories: AssetCategory[] = [
  { id: 'ai-agents', label: 'AI Agents', count: 1980, shadowAi: 1 },
  { id: 'mcp-servers', label: 'MCP Servers', count: 42, shadowAi: 1 },
  { id: 'llm-providers', label: 'LLM Providers', count: 8, shadowAi: 2 },
  { id: 'apis', label: 'APIs', count: 400, shadowAi: 3 },
  { id: 'data-sources', label: 'Data Sources', count: 49, shadowAi: 2 },
];
