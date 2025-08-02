# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Build**: `npm run compile` - Compiles TypeScript to JavaScript in the `out/` directory
- **Watch mode**: `npm run watch` - Automatically recompiles on changes
- **Lint**: `npm run lint` - Runs ESLint on the `src/` directory
- **Test**: `npm run test` - Runs tests using vscode-test framework
- **Pre-test**: `npm run pretest` - Compiles and lints before running tests
- **Package**: `npm run vscode:prepublish` - Prepares extension for publishing

## Project Architecture

This is a VS Code extension that renders Mermaid diagrams as overlays within code comments. The extension uses VS Code's text decoration API with advanced features including dynamic sizing, scrolling support, and smart clipping.

### Core Components

**Extension Entry Point** (`src/extension.ts:4-280`):
- Main `activate()` function initializes the extension and event listeners
- `MermaidDecorationProvider` class handles all diagram rendering and decoration management
- Uses regex pattern `/\/\/\s*mermaid\s*\n([\s\S]*?)\/\/\s*end-mermaid/g` to detect Mermaid code blocks in comments
- Processes and cleans Mermaid code by removing comment prefixes (`//`)
- Generates SVG diagrams and converts to base64 data URIs for display

**Advanced Decoration System**:
- **Dynamic Height Matching**: Decorations automatically scale to match comment block height
- **Aspect Ratio Preservation**: Image width calculated based on SVG dimensions to maintain proportions
- **Smart Clipping**: When scrolled, images clip from the top instead of scaling
- **Visible Range Detection**: Only renders decorations for visible portions of comment blocks
- **Real-time Updates**: Responds to scrolling, text changes, and cursor movement

**Event Handling** (`src/extension.ts:269-274`):
- `onDidChangeActiveTextEditor` - Updates when switching files
- `onDidChangeTextDocument` - Updates when code changes
- `onDidChangeTextEditorSelection` - Updates when cursor moves
- `onDidChangeTextEditorVisibleRanges` - Updates when scrolling
- Hides decorations when cursor is within Mermaid code block for editing

### Key Technical Features

**Dynamic Sizing** (`calculateBlockHeight:133-145`, `calculateExactHiddenHeight:147-171`):
- Reads actual VS Code editor settings (`editor.fontSize`, `editor.lineHeight`)
- Calculates pixel-perfect heights for comment blocks
- Handles partial line visibility for precise clipping

**Intelligent Clipping** (`getVisiblePortionOfBlock:122-130`):
- Detects intersection between comment blocks and visible editor ranges
- Calculates exact hidden height including partial lines
- Positions background images to show correct portion when scrolled

**Code Processing** (`cleanMermaidCode:234-249`):
- Removes `//` comment prefixes from each line
- Preserves indentation for proper Mermaid syntax
- Filters empty lines to prevent parsing issues

**Decoration Management**:
- Creates unique decoration types per SVG content, height, and clipping position
- Implements decoration caching to prevent unnecessary recreation
- Proper cleanup and disposal to prevent memory leaks

### SVG Rendering

Currently uses placeholder SVG generation that:
- Displays cleaned Mermaid code preview
- Shows proper dimensions and styling
- Provides foundation for future real Mermaid integration

Real Mermaid rendering was attempted but removed due to Node.js/browser compatibility issues with the Mermaid library requiring DOM APIs.

### Testing

- Uses Mocha test framework with VS Code test runner
- Test files located in `src/test/`
- TypeScript configuration includes DOM types and `skipLibCheck` for compatibility
- Basic test structure established for extension-specific testing

### Usage Pattern

Users can create Mermaid diagrams in comments using this syntax:
```
// mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
// end-mermaid
```

The extension will overlay a visual representation directly over the comment block, with dynamic sizing and smart behavior during scrolling and editing.