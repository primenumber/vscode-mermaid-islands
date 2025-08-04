import { SvgRenderResult } from './types';
import { CACHE_SIZE_LIMIT, RENDER_TIMEOUT, DEFAULT_DIMENSIONS, PUPPETEER_ARGS } from './constants';
import { MermaidParser } from './mermaidParser';
import { ThemeUtils } from './themeUtils';

export class SvgRenderer {
    private browserInstance: any = null;
    private svgCache: Map<string, SvgRenderResult> = new Map();

    async renderMermaidToSvg(mermaidCode: string, commentPrefix: string): Promise<SvgRenderResult> {
        try {
            const cleanedCode = MermaidParser.cleanMermaidCode(mermaidCode, commentPrefix);
            const isDark = ThemeUtils.isDarkTheme();
            
            const cacheKey = `${cleanedCode}_${isDark ? 'dark' : 'light'}`;
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

    private async initializeBrowser(): Promise<void> {
        const puppeteer = await import('puppeteer');
        this.browserInstance = await puppeteer.default.launch({
            headless: true,
            args: PUPPETEER_ARGS
        });
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

    private createErrorSvg(mermaidCode: string, commentPrefix: string, error: any): SvgRenderResult {
        const cleanedCode = MermaidParser.cleanMermaidCode(mermaidCode, commentPrefix);
        const { WIDTH, ERROR_HEIGHT } = DEFAULT_DIMENSIONS;
        const isDark = ThemeUtils.isDarkTheme();

        const colors = isDark
            ? { bg: '#2d1b24', border: '#f87171', title: '#f87171', text: '#d1d5db', code: '#9ca3af' }
            : { bg: '#ffebee', border: '#f44336', title: '#d32f2f', text: '#666', code: '#999' };
        
        const svg = `<svg width="${WIDTH}" height="${ERROR_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
            <rect width="${WIDTH}" height="${ERROR_HEIGHT}" fill="${colors.bg}" stroke="${colors.border}" stroke-width="2"/>
            <text x="${WIDTH/2}" y="${ERROR_HEIGHT/2-20}" text-anchor="middle" font-family="Arial" font-size="14" fill="${colors.title}">
                Mermaid Error
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