import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { markdownToPdf } from "./convert.js";

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

export function createServer() {
  const mcpServer = new McpServer(
    { name: "mcp-pdf", version: "0.1.0" },
    { capabilities: { tools: {} } }
  );

  mcpServer.tool(
    "pdf.from_markdown",
    {
      title: "Markdown → PDF",
      description:
        "Convert Markdown to a PDF file. Provide either inline markdown or a file path.",
      inputSchema: z
        .object({
          markdown: z.string().describe("Inline Markdown content").optional(),
          path: z.string().describe("Path to a .md file").optional(),
          outputPath: z
            .string()
            .describe("Output PDF path (defaults to output/<timestamp>.pdf)")
            .optional(),
          paperFormat: z
            .enum(["A4", "Letter", "Legal"])
            .describe("PDF paper format (default A4)")
            .optional(),
          paperOrientation: z
            .enum(["portrait", "landscape"])
            .describe("PDF orientation (default portrait)")
            .optional(),
        })
        .refine((v) => !!(v.markdown || v.path), {
          message: "Provide either 'markdown' or 'path'",
        }),
    },
    async (args) => {
      const { markdown, path: mdPath, outputPath, paperFormat, paperOrientation } = args ?? {};

      let content: string;
      if (typeof markdown === "string" && markdown.length > 0) {
        content = markdown;
      } else if (typeof mdPath === "string" && mdPath.length > 0) {
        content = fs.readFileSync(mdPath, "utf8");
      } else {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "Provide either 'markdown' or 'path' in input.",
            },
          ],
        };
      }

      const outDir = outputPath ? path.dirname(outputPath) : path.resolve("output");
      await mkdir(outDir, { recursive: true });

      const pdfPath = outputPath
        ? path.resolve(outputPath)
        : path.join(outDir, `${Date.now()}.pdf`);

      try {
        await markdownToPdf(content, pdfPath, {
          format: paperFormat ?? "A4",
          landscape: paperOrientation === "landscape",
        });

        return {
          content: [
            { type: "text", text: `PDF created at: ${pdfPath}` },
          ],
        };
      } catch (err: any) {
        const msg = err?.message || String(err);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text:
                `Failed to generate PDF via Playwright: ${msg}.\n` +
                `Ensure 'playwright' is installed and Chromium is available (npx playwright install).\n` +
                `Input was accepted; no file was written.`,
            },
          ],
        };
      }
    }
  );

  return mcpServer;
}
