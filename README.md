# Mermaid Islands

Renders Mermaid diagrams as visual overlays directly within your code comments.

## Usage

Wrap your Mermaid diagram code in comments:

```javascript
// mermaid
// graph TD
//     A[Start] --> B{Decision}
//     B -->|Yes| C[Action 1]
//     B -->|No| D[Action 2]
// end-mermaid
```

The diagram will appear as a visual overlay above the comment block.

## Features

- **Real-time rendering** - Diagrams update as you type
- **Smart editing** - Diagrams hide when editing the comment
- **Dynamic sizing** - Automatically scales with your editor settings
- **All diagram types** - Supports flowcharts, sequence diagrams, class diagrams, etc.

## Requirements

- VS Code 1.102.0+
- Internet connection (loads Mermaid from CDN)

## Installation

Install from VS Code Marketplace or build from source:

```bash
npm install
npm run compile
```

Then press `F5` to test in Extension Development Host.