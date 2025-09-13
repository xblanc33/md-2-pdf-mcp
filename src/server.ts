import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { markdownToPdf } from "./convert.js";

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

export function createServer() {
  const mcpServer = new McpServer(
    { name: "mcp-pdf", version: "1.0.4" },
    { capabilities: { tools: {} } }
  );

  const paramsShape = {
    markdown: z
      .string()
      .describe("Inline Markdown content. If set, 'path' will be ignored.")
      .optional(),
    path: z
      .string()
      .describe(
        "Absolute or relative path to a .md file. Ignored if 'markdown' is provided."
      )
      .optional(),
    outputPath: z
      .string()
      .describe(
        "Desired output PDF path. Defaults to 'output/<timestamp>.pdf'. Missing directories are created."
      )
      .optional(),
    paperFormat: z
      .enum(["A4", "Letter", "Legal"])
      .describe("PDF paper size: A4 | Letter | Legal (default: A4)")
      .optional(),
    paperOrientation: z
      .enum(["portrait", "landscape"])
      .describe("PDF orientation: portrait | landscape (default: portrait)")
      .optional(),
  } as const;

  const description = [
    "Generate a PDF from Markdown.",
    "Provide exactly one of 'markdown' (inline content) or 'path' (file path).",
    "If both are provided, 'markdown' takes precedence and 'path' is ignored.",
    "Defaults: outputPath → output/<timestamp>.pdf, paperFormat → A4, paperOrientation → portrait.",
    "Returns: a message containing the absolute path to the created PDF.",
  ].join("\n");

  const toolHandler = async (
    args: {
      markdown?: string;
      path?: string;
      outputPath?: string;
      paperFormat?: "A4" | "Letter" | "Legal";
      paperOrientation?: "portrait" | "landscape";
    },
    _extra: any
  ): Promise<CallToolResult> => {
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
            } as const,
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
          { type: "text", text: `PDF created at: ${pdfPath}` } as const,
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
          } as const,
        ],
      };
    }
  };

  // Primary id
  mcpServer.tool("pdf_from_markdown", description, paramsShape, toolHandler);
  // Alias for discoverability
  mcpServer.tool("md_to_pdf", description, paramsShape, toolHandler);

  return mcpServer;
}
