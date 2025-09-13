MCP PDF Server
===============

An MCP (Model Context Protocol) server that converts Markdown into PDF.

Features
- Tool: `pdf.from_markdown` — convert inline Markdown or a file path to a PDF.
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
- `pdf.from_markdown`
  - input:
    - `markdown` (string, optional): Inline Markdown content.
    - `path` (string, optional): Path to a `.md` file.
    - `outputPath` (string, optional): Desired output PDF path.
    - `paperFormat` (string, optional): One of `A4`, `Letter`, `Legal`.
    - `paperOrientation` (string, optional): `portrait` or `landscape`.
    - Exactly one of `markdown` or `path` is required.
  - output:
    - Returns a text message with the absolute path to the generated PDF.

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
