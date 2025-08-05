import * as vscode from 'vscode';
import { MermaidBlock } from './types';
import { SvgRenderer } from './svgRenderer';
import { DecorationManager } from './decorationManager';
import { EditorUtils } from './editorUtils';

export class MermaidDecorationProvider {
    private svgRenderer = new SvgRenderer();
    private decorationManager = new DecorationManager();

    async updateAllDecorations(editor: vscode.TextEditor, mermaidBlocks: MermaidBlock[]): Promise<void> {
        this.decorationManager.clearAllDecorations(editor);

        const visibleRanges = editor.visibleRanges;

        for (const block of mermaidBlocks) {
            const svgData = await this.svgRenderer.renderToSvg(block.code, block.commentPrefix, block.type);

            const visibleRange = EditorUtils.getVisiblePortionOfBlock(block.range, visibleRanges);
            if (!visibleRange) {
                continue;
            }

            const fullBlockHeight = EditorUtils.calculateBlockHeight(editor, block.range);
            const visibleHeight = EditorUtils.calculateBlockHeight(editor, visibleRange);

            const aspectRatio = svgData.width / svgData.height;
            const displayWidth = fullBlockHeight * aspectRatio;

            const hiddenHeight = EditorUtils.calculateExactHiddenHeight(editor, block.range, visibleRange);

            const decorationType = this.decorationManager.createMermaidDecoration(
                svgData.svg,
                fullBlockHeight,
                visibleHeight,
                displayWidth,
                hiddenHeight
            );

            const diagramType = block.type === 'svg' ? 'SVG' : 'Mermaid';
            const decorationOptions: vscode.DecorationOptions = {
                range: visibleRange,
                hoverMessage: new vscode.MarkdownString(`**${diagramType} Diagram**\n\nClick to edit`)
            };

            editor.setDecorations(decorationType, [decorationOptions]);
        }
    }

    clearCache(): void {
        this.svgRenderer.clearCache();
        this.decorationManager.clearCache();
    }

    async dispose(): Promise<void> {
        this.decorationManager.dispose();
        await this.svgRenderer.dispose();
    }
}