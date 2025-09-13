import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["dist/index.js"],
  });

  const client = new Client({ name: "smoke", version: "0.0.1" });
  await client.connect(transport, { timeoutMs: 5000 });

  const tools = await client.listTools(undefined, { timeoutMs: 5000 });
  const names = tools.tools.map((t) => t.name).sort();
  const hasPrimary = names.includes("pdf_from_markdown");
  const hasAlias = names.includes("md_to_pdf");

  console.log("Tools:", names.join(", "));
  if (!hasPrimary || !hasAlias) {
    console.error("Missing expected tools. primary:", hasPrimary, "alias:", hasAlias);
    process.exit(1);
  }

  // Cleanly close
  await transport.close?.();
}

main().catch((err) => {
  console.error("Smoke test failed:", err);
  process.exit(1);
});
