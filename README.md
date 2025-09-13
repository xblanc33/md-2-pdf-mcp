MCP PDF Server
===============

An MCP (Model Context Protocol) server that converts Markdown into PDF.

Features
- Tools: `pdf_from_markdown` (primary), `md_to_pdf` (alias) — convert inline Markdown or a file path to a PDF.
- Options for paper format and orientation.
- Sensible defaults with an `output/` folder.

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

Configure in an MCP-compatible client by pointing to the compiled binary or `npm start` command.

Tools
- `pdf_from_markdown` (primary) / `md_to_pdf` (alias)
  - Purpose: Generate a PDF from Markdown.
  - Inputs:
    - `markdown` (string, optional): Inline Markdown content. If set, `path` is ignored.
    - `path` (string, optional): Absolute or relative path to a `.md` file. Ignored if `markdown` is provided.
    - `outputPath` (string, optional): Output PDF path. Defaults to `output/<timestamp>.pdf` and creates missing directories.
    - `paperFormat` (string, optional): `A4` | `Letter` | `Legal` (default: `A4`).
    - `paperOrientation` (string, optional): `portrait` | `landscape` (default: `portrait`).
    - Exactly one of `markdown` or `path` must be provided. If both are present, `markdown` takes precedence.
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

Notes
- This server uses Playwright (Chromium) to render HTML generated from Markdown and print to PDF.
- On first install, Playwright may download a browser. You can also point it to an existing Chrome/Chromium via environment config.

One‑liner with npx
- After this package is published to npm, you can run the server directly:
  - `npx mcp-pdf`
  - The package defines a `bin` entry and a `postinstall` that installs Chromium.
- From the local repo (without publishing):
  - `npx --yes .`
  - This uses the `bin` in package.json and the `prepare` script to build.
