# Change Log

All notable changes to the "mermaid-islands" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

## [0.2.0] - 2025-08-06

### Added
- **SVG support**: Render custom SVG graphics alongside Mermaid diagrams using `svg...end-svg` syntax
- **Automatic browser detection**: Extension now automatically finds Chrome, Edge, or Chromium on your system
- **Custom browser path configuration**: New setting `mermaid-islands.browserPath` to specify custom browser executable

### Changed
- **Switched to puppeteer-core**: Reduced bundle size
- **Enhanced browser initialization**: Three-tier fallback system for maximum compatibility

### Fixed
- **Corporate environment compatibility**: Works better with existing browsers

## [0.1.2] - 2025-08-05

### Added
- Support color theme (dark/light, default/high-contrast)

## [0.1.1] - 2025-08-04

- Fix image URL in README.md

## [0.1.0] - 2025-08-04

### Added
- Multi-language comment support for Mermaid diagrams
- Automatic language detection based on file extension
- Support for `//` style comments (JavaScript, TypeScript, Java, C/C++, C#, Go, Rust, PHP, Swift, Kotlin, Scala)
- Support for `#` style comments (Python, Ruby, Perl, Bash, Shell, PowerShell, R, YAML, TOML, Dockerfile, Makefile)
- Support for `--` style comments (SQL, Haskell, Lua, Ada, VHDL, Agda)

## [0.0.1] - 2025-08-03

- Initial release with VS Code text decoration API for Mermaid diagram overlays