# Mermaid Islands

Renders Mermaid diagrams and SVG graphics as visual overlays directly within your code comments.

## Usage

### Mermaid Diagrams

Wrap your Mermaid diagram code in comments:

```cpp
// mermaid
// graph LR
//     A[Start] --> B{x > y}
//     B -->|Yes| C[x]
//     B -->|No| D[y]
// end-mermaid
int max(int x, int y) {
  return (x > y) ? x : y;
}
```

### SVG Graphics

Wrap your SVG code in comments:

```javascript
// svg
// <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
//   <rect x="10" y="10" width="180" height="80" fill="#4CAF50" stroke="#2E7D32" stroke-width="2"/>
//   <text x="100" y="55" text-anchor="middle" font-family="Arial" font-size="16" fill="white">
//     Hello SVG!
//   </text>
// </svg>
// end-svg
console.log("Custom graphics in comments!");
```

The diagram or graphic will appear as a visual overlay above the comment block.

![Animated demonstration showing a code editor with a C++ function and a Mermaid diagram overlay. The diagram displays a flowchart with nodes labeled Start, x greater than y, x, and y, connected by arrows. The overlay appears above the commented Mermaid code and updates in real time as the code is edited. The environment is a modern code editor window, conveying a sense of productivity and clarity.](https://github.com/primenumber/vscode-mermaid-islands/blob/main/media/mermaid_islands_demo.gif?raw=true)

## Features

- **Real-time rendering** - Diagrams update as you type
- **Smart editing** - Diagrams hide when editing the comment
- **Dynamic sizing** - Automatically scales with your editor settings
- **All diagram types** - Supports flowcharts, sequence diagrams, class diagrams, etc.
- **SVG support** - Render custom SVG graphics alongside Mermaid diagrams
- **Theme awareness** - Adapts to VS Code's Light, Dark, and High Contrast themes
- **Multi-language comments** - Works with // /* */ # -- comment styles

## Requirements

- VS Code 1.102.0+
- **Web browser** - One of the following:
  - Google Chrome
  - Microsoft Edge  
  - Chromium
  - Or run `npx puppeteer browsers install chrome` to download Chromium
- Internet connection (loads Mermaid library from CDN)

## Browser Setup

This extension requires a web browser for diagram rendering. It will automatically detect browsers in this order:

1. **User-configured path** (see Configuration section)
2. **Auto-detected system browsers** (Chrome, Edge, Chromium)
3. **Bundled Chromium** (if downloaded separately)

### If No Browser is Found

If you see "No browser found" errors:

1. **Install a supported browser:**
   - [Google Chrome](https://www.google.com/chrome/)
   - [Microsoft Edge](https://www.microsoft.com/edge) (Windows/macOS)
   - Chromium (Linux: `sudo apt install chromium-browser`)

2. **Or download Chromium for this extension:**
   ```bash
   npx puppeteer browsers install chrome
   ```

3. **Or configure a custom browser path** (see Configuration)

## Configuration

You can specify a custom browser path in VS Code settings:

1. Open Settings (Ctrl/Cmd + ,)
2. Search for "Mermaid Islands"  
3. Set **Browser Path** to your browser executable

**Common paths:**
- Windows: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- macOS: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- Linux: `/usr/bin/google-chrome`

Or add to your `settings.json`:
```json
{
  "mermaid-islands.browserPath": "/path/to/your/browser"
}
```

## Installation

Install from VS Code Marketplace or build from source:

```bash
npm install
npm run compile
```

Then press `F5` to test in Extension Development Host.