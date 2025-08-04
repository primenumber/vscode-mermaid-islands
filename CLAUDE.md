# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Build**: `npm run compile` - Compiles TypeScript to JavaScript in the `out/` directory
- **Watch mode**: `npm run watch` - Automatically recompiles on changes
- **Lint**: `npm run lint` - Runs ESLint on the `src/` directory
- **Test**: `npm run test` - Runs tests using vscode-test framework
- **Pre-test**: `npm run pretest` - Compiles and lints before running tests
- **Package**: `npm run vscode:prepublish` - Prepares extension for publishing

## Dependencies

- **Core**: `puppeteer` for headless browser automation
- **Rendering**: `mermaid` library loaded via CDN for diagram generation
- **Development**: Standard VS Code extension toolchain with TypeScript and ESLint

## Project Architecture

This is a VS Code extension that renders Mermaid diagrams as overlays within code comments. The extension uses VS Code's text decoration API with advanced features including dynamic sizing, scrolling support, and smart clipping.

The codebase is organized into modular components for maintainability and separation of concerns:

### Core Components

**Extension Entry Point** (`src/extension.ts`):
- Clean 32-line entry point that coordinates all components
- Main `activate()` function initializes the extension and event listeners
- Sets up event handlers for editor changes, text changes, selection changes, and scrolling
- Manages the lifecycle of the MermaidDecorationProvider

**Mermaid Decoration Provider** (`src/mermaidDecorationProvider.ts`):
- Main orchestrator that coordinates SVG rendering and decoration management
- Handles the complete workflow from parsing blocks to applying decorations
- Manages visible range calculations and decoration updates

**Mermaid Parser** (`src/mermaidParser.ts`):
- Detects Mermaid code blocks using regex pattern `/\/\/\s*mermaid\s*\n([\s\S]*?)\/\/\s*end-mermaid/g`
- Cleans Mermaid code by removing comment prefixes (`//`)
- Filters blocks where cursor is active (for editing mode)

**SVG Renderer** (`src/svgRenderer.ts`):
- Generates real Mermaid SVG diagrams using Puppeteer and headless Chrome
- Implements comprehensive caching with theme-specific cache keys (Light/Dark/HighContrast/HighContrastLight)
- Handles error cases with theme-aware fallback error SVGs optimized for accessibility
- Manages browser instance lifecycle

**Decoration Manager** (`src/decorationManager.ts`):
- Creates and manages VS Code text decorations
- Handles decoration caching to prevent unnecessary recreation
- Manages decoration lifecycle and cleanup

**Editor Utilities** (`src/editorUtils.ts`):
- Calculates block heights based on VS Code editor settings
- Determines visible portions of blocks during scrolling
- Handles precise clipping calculations for partial line visibility

**Type Definitions** (`src/types.ts`):
- TypeScript interfaces for MermaidBlock, SvgRenderResult, and configuration
- Ensures type safety throughout the codebase

**Constants** (`src/constants.ts`):
- Centralized configuration including regex patterns, cache limits, timeouts
- Mermaid theme configurations for all VS Code theme types (Light, Dark, HighContrast, HighContrastLight)
- Default dimensions and Puppeteer arguments

**Theme Utilities** (`src/themeUtils.ts`):
- Detects current VS Code theme kind and provides appropriate Mermaid configuration
- Supports all ColorThemeKind values: Light, Dark, HighContrast, and HighContrastLight
- Provides theme-aware color schemes optimized for accessibility and visibility

### Advanced Features

**Dynamic Height Matching**: Decorations automatically scale to match comment block height by reading VS Code editor settings (`editor.fontSize`, `editor.lineHeight`)

**Aspect Ratio Preservation**: Image width calculated based on SVG dimensions to maintain proportions

**Smart Clipping**: When scrolled, images clip from the top instead of scaling, showing the correct portion of the diagram

**Visible Range Detection**: Only renders decorations for visible portions of comment blocks to optimize performance

**Real-time Updates**: Responds to scrolling, text changes, cursor movement, and file switching

**Performance Optimizations**:
- **Browser Instance Reuse**: Single browser shared across all renders
- **SVG Result Caching**: LRU cache (100 items) with theme-specific keys for instant duplicate renders
- **Theme Optimization**: Adaptive themes (Light/Dark/HighContrast/HighContrastLight) for optimal visibility
- **Timeout Management**: 5-second render timeout for responsiveness

**Accessibility Features**:
- **Theme Awareness**: Automatically adapts to VS Code's active theme type
- **High Contrast Support**: Dedicated color schemes for HighContrast and HighContrastLight themes
- **Error Visualization**: Theme-specific error SVGs with appropriate contrast ratios
- **Accessibility-First Design**: Colors and contrasts optimized for users with visual impairments

### Testing

- Uses Mocha test framework with VS Code test runner
- Test files located in `src/test/`
- TypeScript configuration includes DOM types and `skipLibCheck` for compatibility
- Basic test structure established for extension-specific testing

### Usage Pattern

Users can create Mermaid diagrams in comments using language-appropriate comment syntax. The extension automatically detects the file language and uses the appropriate comment style:

**JavaScript/TypeScript/Java/C/C++/C#/Go/Rust/PHP/Swift/Kotlin/Scala:**
```javascript
// mermaid
// graph TD
//     A[Start] --> B{Decision}
//     B -->|Yes| C[Action 1]
//     B -->|No| D[Action 2]
// end-mermaid
```

**Python/Ruby/Perl/Bash/Shell/PowerShell/R/YAML/TOML/Dockerfile/Makefile:**
```python
# mermaid
# graph TD
#     A[Start] --> B{Decision}
#     B -->|Yes| C[Action 1]
#     B -->|No| D[Action 2]
# end-mermaid
```

**SQL/Haskell/Lua/Ada/VHDL/Agda:**
```sql
-- mermaid
-- graph TD
--     A[Start] --> B{Decision}
--     B -->|Yes| C[Action 1]
--     B -->|No| D[Action 2]
-- end-mermaid
```

The extension will overlay a visual representation directly over the comment block, with dynamic sizing and smart behavior during scrolling and editing. Both the mermaid markers and the diagram code itself must be properly commented according to the file's language conventions.

### Performance Characteristics

**First-time rendering**: ~2-3 seconds (browser startup + Mermaid processing)
**Subsequent renders**: ~200-500ms (page creation + rendering)
**Cached renders**: ~1-5ms (instant cache hits)
**Memory usage**: Controlled with LRU cache limits and proper cleanup

The extension is optimized for real-world usage with multiple diagrams and frequent updates.