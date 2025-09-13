import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

async function main() {
  const mcpServer = createServer();
  const transport = new StdioServerTransport();

  // Graceful shutdown
  const shutdown = async () => {
    try {
      await transport.close?.();
    } catch {}
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await mcpServer.connect(transport);
}

main().catch((err) => {
  console.error("mcp-pdf server failed:", err);
  process.exit(1);
});
