import * as vscode from 'vscode';
import { SvgRenderResult } from './types';
import { CACHE_SIZE_LIMIT, RENDER_TIMEOUT, DEFAULT_DIMENSIONS, PUPPETEER_ARGS } from './constants';
import { MermaidParser } from './mermaidParser';
import { ThemeUtils } from './themeUtils';
import { BrowserFinder } from './browserFinder';

export class SvgRenderer {
    private browserInstance: any = null;
    private svgCache: Map<string, SvgRenderResult> = new Map();

    async renderToSvg(code: string, commentPrefix: string, type: 'mermaid' | 'svg'): Promise<SvgRenderResult> {
        if (type === 'svg') {
            return this.renderRawSvg(code, commentPrefix);
        } else {
            return this.renderMermaidToSvg(code, commentPrefix);
        }
    }

    async renderMermaidToSvg(mermaidCode: string, commentPrefix: string): Promise<SvgRenderResult> {
        try {
            const cleanedCode = MermaidParser.cleanMermaidCode(mermaidCode, commentPrefix);
            const themeKind = ThemeUtils.getThemeKindName();

            const cacheKey = `${cleanedCode}_${themeKind}`;
            if (this.svgCache.has(cacheKey)) {
                return this.svgCache.get(cacheKey)!;
            }

            if (!this.browserInstance) {
                await this.initializeBrowser();
            }

            const page = await this.browserInstance.newPage();

            try {
                const html = this.generateMermaidHtml(cleanedCode);
                await page.setContent(html);

                await page.waitForFunction('window.mermaidResult !== undefined', { timeout: RENDER_TIMEOUT });

                const result = await page.evaluate(() => (window as any).mermaidResult);

                if (result.error) {
                    throw new Error(result.error);
                }

                const finalResult: SvgRenderResult = {
                    svg: result.svg,
                    width: result.width,
                    height: result.height
                };

                this.cacheResult(cacheKey, finalResult);
                return finalResult;

            } finally {
                await page.close();
            }

        } catch (error) {
            console.error('Mermaid rendering error:', error);
            return this.createErrorSvg(mermaidCode, commentPrefix, error);
        }
    }

    async renderRawSvg(svgCode: string, commentPrefix: string): Promise<SvgRenderResult> {
        try {
            const cleanedCode = MermaidParser.cleanMermaidCode(svgCode, commentPrefix);
            const themeKind = ThemeUtils.getThemeKindName();

            const cacheKey = `svg_${cleanedCode}_${themeKind}`;
            if (this.svgCache.has(cacheKey)) {
                return this.svgCache.get(cacheKey)!;
            }

            // Parse the SVG to get dimensions
            const svgMatch = cleanedCode.match(/<svg[^>]*>/i);
            if (!svgMatch) {
                throw new Error('Invalid SVG: No opening <svg> tag found');
            }

            // Extract width and height from SVG attributes
            const widthMatch = svgMatch[0].match(/width\s*=\s*["']?(\d+(?:\.\d+)?)[^"'\s]*/i);
            const heightMatch = svgMatch[0].match(/height\s*=\s*["']?(\d+(?:\.\d+)?)[^"'\s]*/i);

            let width = DEFAULT_DIMENSIONS.WIDTH;
            let height = DEFAULT_DIMENSIONS.HEIGHT;

            if (widthMatch && heightMatch) {
                width = Math.ceil(parseFloat(widthMatch[1]));
                height = Math.ceil(parseFloat(heightMatch[1]));
            } else {
                // If no dimensions found, use viewBox if available
                const viewBoxMatch = svgMatch[0].match(/viewBox\s*=\s*["']?[^\d]*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/i);
                if (viewBoxMatch) {
                    width = Math.ceil(parseFloat(viewBoxMatch[3]));
                    height = Math.ceil(parseFloat(viewBoxMatch[4]));
                }
            }

            const result: SvgRenderResult = {
                svg: cleanedCode,
                width,
                height
            };

            this.cacheResult(cacheKey, result);
            return result;

        } catch (error) {
            console.error('SVG rendering error:', error);
            return this.createErrorSvg(svgCode, commentPrefix, error, 'svg');
        }
    }

    private async initializeBrowser(): Promise<void> {
        const puppeteer = await import('puppeteer-core');
        const config = vscode.workspace.getConfiguration('mermaid-islands');
        const userBrowserPath = config.get<string>('browserPath', '').trim();

        // Priority 1: User-configured browser path
        if (userBrowserPath) {
            try {
                console.log(`Using user-configured browser at: ${userBrowserPath}`);
                this.browserInstance = await puppeteer.default.launch({
                    headless: true,
                    executablePath: userBrowserPath,
                    args: PUPPETEER_ARGS
                });
                return;
            } catch (userError) {
                console.error(`Failed to launch user-configured browser at ${userBrowserPath}:`, userError);
                vscode.window.showWarningMessage(
                    `Failed to use configured browser path: ${userBrowserPath}. Falling back to auto-detection.`
                );
            }
        }

        // Priority 2: Auto-detected system browser
        const chromePath = await BrowserFinder.findChrome();
        if (chromePath) {
            try {
                console.log(`Using auto-detected browser at: ${chromePath}`);
                this.browserInstance = await puppeteer.default.launch({
                    headless: true,
                    executablePath: chromePath,
                    args: PUPPETEER_ARGS
                });
                return;
            } catch (systemError) {
                console.error('Failed to launch auto-detected browser:', systemError);
            }
        }

        // Priority 3: Bundled browser (if available)
        try {
            this.browserInstance = await puppeteer.default.launch({
                headless: true,
                args: PUPPETEER_ARGS
            });
            console.log('Using bundled Chromium browser');
        } catch (error) {
            console.error('No suitable browser found.');
            const errorMessage =
                `No browser available. Please:\n` +
                `1. Set a custom browser path in Settings > Extensions > Mermaid Islands > Browser Path, or\n` +
                `2. Install Google Chrome, Microsoft Edge, or Chromium, or\n` +
                `3. Run 'npx puppeteer browsers install chrome' to download Chromium\n` +
                `Error: ${error instanceof Error ? error.message : String(error)}`;

            vscode.window.showErrorMessage('Mermaid Islands: No browser found for diagram rendering');
            throw new Error(errorMessage);
        }
    }

    private generateMermaidHtml(cleanedCode: string): string {
        const mermaidConfig = ThemeUtils.getCurrentMermaidConfig();
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
        </head>
        <body>
            <div id="mermaid-container"></div>
            <script>
                mermaid.initialize(${JSON.stringify(mermaidConfig)});

                async function renderMermaid() {
                    try {
                        const mermaidCode = \`${cleanedCode.replace(/`/g, '\\`')}\`;
                        const { svg } = await mermaid.render('mermaid-diagram', mermaidCode);

                        const container = document.getElementById('mermaid-container');
                        container.innerHTML = svg;

                        const svgElement = container.querySelector('svg');
                        const rect = svgElement.getBoundingClientRect();

                        window.mermaidResult = {
                            svg: svg,
                            width: Math.ceil(rect.width) || ${DEFAULT_DIMENSIONS.WIDTH},
                            height: Math.ceil(rect.height) || ${DEFAULT_DIMENSIONS.HEIGHT}
                        };
                    } catch (error) {
                        window.mermaidResult = {
                            error: error.message,
                            svg: null,
                            width: ${DEFAULT_DIMENSIONS.WIDTH},
                            height: ${DEFAULT_DIMENSIONS.ERROR_HEIGHT}
                        };
                    }
                }

                renderMermaid();
            </script>
        </body>
        </html>`;
    }

    private cacheResult(cacheKey: string, result: SvgRenderResult): void {
        if (this.svgCache.size >= CACHE_SIZE_LIMIT) {
            const firstKey = this.svgCache.keys().next().value;
            if (firstKey) {
                this.svgCache.delete(firstKey);
            }
        }
        this.svgCache.set(cacheKey, result);
    }

    private createErrorSvg(code: string, commentPrefix: string, error: any, type: 'mermaid' | 'svg' = 'mermaid'): SvgRenderResult {
        const cleanedCode = MermaidParser.cleanMermaidCode(code, commentPrefix);
        const { WIDTH, ERROR_HEIGHT } = DEFAULT_DIMENSIONS;
        const themeKind = ThemeUtils.getThemeKindName();

        const colors = this.getErrorColors(themeKind);
        const errorTitle = type === 'svg' ? 'SVG Error' : 'Mermaid Error';

        const svg = `<svg width="${WIDTH}" height="${ERROR_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
            <rect width="${WIDTH}" height="${ERROR_HEIGHT}" fill="${colors.bg}" stroke="${colors.border}" stroke-width="2"/>
            <text x="${WIDTH/2}" y="${ERROR_HEIGHT/2-20}" text-anchor="middle" font-family="Arial" font-size="14" fill="${colors.title}">
                ${errorTitle}
            </text>
            <text x="${WIDTH/2}" y="${ERROR_HEIGHT/2}" text-anchor="middle" font-family="Arial" font-size="12" fill="${colors.text}">
                ${String(error).substring(0, 40)}...
            </text>
            <text x="${WIDTH/2}" y="${ERROR_HEIGHT/2+20}" text-anchor="middle" font-family="Arial" font-size="10" fill="${colors.code}">
                Code: ${cleanedCode.substring(0, 30)}...
            </text>
        </svg>`;

        return { svg, width: WIDTH, height: ERROR_HEIGHT };
    }

    private getErrorColors(themeKind: string): { bg: string; border: string; title: string; text: string; code: string } {
        switch (themeKind) {
            case 'Dark':
                return {
                    bg: '#2d1b24',
                    border: '#f87171',
                    title: '#f87171',
                    text: '#d1d5db',
                    code: '#9ca3af'
                };
            case 'HighContrast':
                return {
                    bg: '#000000',
                    border: '#ffffff',
                    title: '#ffffff',
                    text: '#ffffff',
                    code: '#cccccc'
                };
            case 'HighContrastLight':
                return {
                    bg: '#ffffff',
                    border: '#000000',
                    title: '#000000',
                    text: '#000000',
                    code: '#333333'
                };
            case 'Light':
            default:
                return {
                    bg: '#ffebee',
                    border: '#f44336',
                    title: '#d32f2f',
                    text: '#666666',
                    code: '#999999'
                };
        }
    }

    clearCache(): void {
        this.svgCache.clear();
    }

    async dispose(): Promise<void> {
        this.svgCache.clear();

        if (this.browserInstance) {
            try {
                await this.browserInstance.close();
            } catch (error) {
                console.error('Failed to close browser instance:', error);
            }
            this.browserInstance = null;
        }
    }
}