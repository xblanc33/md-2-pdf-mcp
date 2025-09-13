MCP PDF Server
===============

An MCP (Model Context Protocol) server exposing tools to render Markdown into PDF.

What’s included
- MCP tools: `pdf_from_markdown` (primary) and `md_to_pdf` (alias).
- Accepts inline Markdown or a file path.
- Options for paper format and orientation; sensible `output/` defaults.

Prerequisites
- Node.js 18+ recommended.

Install
```sh
npm install
# Download browsers for Playwright (Chromium only is enough):
npx playwright install chromium
```

Build
```sh
npm run build
```

Run (stdio)
```sh
npm start
```

Configure in your MCP-compatible client by pointing to the compiled binary or `npm start` command.

MCP Tools
- Tool ids: `pdf_from_markdown` (primary) and `md_to_pdf` (alias for discoverability)
  - Purpose: Generate a PDF from Markdown.
  - Inputs:
    - `markdown` (string, optional): Inline Markdown content. If set, `path` is ignored.
    - `path` (string, optional): Absolute or relative path to a `.md` file. Ignored if `markdown` is provided.
    - `outputPath` (string, optional): Desired output PDF path. Defaults to `output/<timestamp>.pdf` and creates missing directories.
    - `paperFormat` (string, optional): `A4` | `Letter` | `Legal` (default: `A4`).
    - `paperOrientation` (string, optional): `portrait` | `landscape` (default: `portrait`).
    - Provide exactly one of `markdown` or `path`. If both are set, `markdown` takes precedence.
  - Output:
    - Returns a text message containing the absolute path to the created PDF.
  - Example (inline):
    ```json
    {
      "tool": "md_to_pdf",
      "arguments": {
        "markdown": "# Hello\nThis will render to PDF.",
        "paperFormat": "A4"
      }
    }
    ```
  - Example (file path):
    ```json
    {
      "tool": "pdf_from_markdown",
      "arguments": {
        "path": "examples/sample.md",
        "outputPath": "output/sample.pdf",
        "paperOrientation": "landscape"
      }
    }
    ```

Tool Schema (compact)
```
tools:
  - id: pdf_from_markdown
    alias: md_to_pdf
    params:
      markdown?: string                # Inline Markdown (preferred if both set)
      path?: string                    # Path to a .md file
      outputPath?: string              # Output PDF path (default: output/<timestamp>.pdf)
      paperFormat?: 'A4'|'Letter'|'Legal'      # default: 'A4'
      paperOrientation?: 'portrait'|'landscape' # default: 'portrait'
    constraints:
      - Provide exactly one of markdown or path (if both provided, markdown is used)
    result:
      - type: text
        text: "PDF created at: <absolute path>"
```

Client configuration (example)
If your MCP client supports JSON configuration for a stdio server, a minimal entry might look like:
```json
{
  "servers": {
    "mcp-pdf": {
      "command": "node",
      "args": ["dist/index.js"]
    }
  }
}
```

Notes
- Uses Playwright (Chromium) to render HTML from Markdown and print to PDF.
- On first install, Playwright may download a browser. You can also point it to an existing Chrome/Chromium.

One‑liner with npx
- After this package is published to npm, you can run the server directly:
  - `npx -y md-2-pdf-mcp` (runs the `md-2-pdf-mcp` bin)
  - Or explicitly: `npx -y -p md-2-pdf-mcp mcp-pdf`
  - The package defines `bin` entries and a `postinstall` that installs Chromium.
- From the local repo (without publishing):
  - `npx --yes .`
  - This uses the `bin` in package.json and the `prepare` script to build.
