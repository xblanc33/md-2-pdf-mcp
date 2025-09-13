import { chromium, Browser } from "playwright";
import { marked } from "marked";

// Basic GitHub-like Markdown styles (minimal)
const baseStyles = `
  :root { --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif; }
  body { font-family: var(--font-body); font-size: 14px; line-height: 1.6; color: #24292e; padding: 40px; }
  h1,h2,h3,h4,h5,h6 { font-weight: 600; line-height: 1.25; }
  h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: .3em; }
  h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: .3em; }
  h3 { font-size: 1.25em; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 85%; background: #f6f8fa; padding: .2em .4em; border-radius: 6px; }
  pre code { background: transparent; padding: 0; }
  pre { background: #f6f8fa; padding: 16px; overflow: auto; border-radius: 6px; }
  blockquote { color: #57606a; border-left: .25em solid #d0d7de; padding: 0 1em; margin: 0; }
  table { border-collapse: collapse; }
  th, td { border: 1px solid #d0d7de; padding: 6px 13px; }
  img { max-width: 100%; }
`;

export type PdfOptions = {
  format?: "A4" | "Letter" | "Legal";
  landscape?: boolean;
};

// Default marked options are fine; users get basic code blocks without syntax highlight.

export async function markdownToPdf(content: string, outPath: string, options?: PdfOptions) {
  const html = marked.parse(content);

  // Inline a simple stylesheet and highlight.js default styles
  const doc = `<!DOCTYPE html>
  <html>
    <head>
      <meta charset=\"utf-8\" />
      <title>Document</title>
      <style>${baseStyles}</style>
    </head>
    <body class=\"markdown-body\">${html}</body>
  </html>`;

  let browser: Browser | undefined;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setContent(doc, { waitUntil: "load" });
    await page.emulateMedia({ media: "screen" });
    await page.pdf({
      path: outPath,
      format: options?.format ?? "A4",
      landscape: options?.landscape ?? false,
      printBackground: true,
    });
  } finally {
    if (browser) await browser.close();
  }
}
