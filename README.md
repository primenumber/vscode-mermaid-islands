# Mermaid Islands

Renders Mermaid diagrams as visual overlays directly within your code comments.

## Usage

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

The diagram will appear as a visual overlay above the comment block.

![Animated demonstration showing a code editor with a C++ function and a Mermaid diagram overlay. The diagram displays a flowchart with nodes labeled Start, x greater than y, x, and y, connected by arrows. The overlay appears above the commented Mermaid code and updates in real time as the code is edited. The environment is a modern code editor window, conveying a sense of productivity and clarity.](https://github.com/primenumber/vscode-mermaid-islands/blob/main/media/mermaid_islands_demo.gif)

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