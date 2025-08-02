import * as vscode from 'vscode';

export class EditorUtils {
    static getVisiblePortionOfBlock(blockRange: vscode.Range, visibleRanges: readonly vscode.Range[]): vscode.Range | null {
        for (const visibleRange of visibleRanges) {
            const intersection = blockRange.intersection(visibleRange);
            if (intersection) {
                return intersection;
            }
        }
        return null;
    }

    static calculateBlockHeight(editor: vscode.TextEditor, range: vscode.Range): number {
        const lineCount = range.end.line - range.start.line + 1;
        
        const config = vscode.workspace.getConfiguration('editor');
        const fontSize = config.get<number>('fontSize') || 14;
        const lineHeight = config.get<number>('lineHeight') || 1.35;
        
        const actualLineHeight = fontSize * lineHeight;
        
        return lineCount * actualLineHeight;
    }

    static calculateExactHiddenHeight(editor: vscode.TextEditor, blockRange: vscode.Range, visibleRange: vscode.Range): number {
        if (visibleRange.start.line <= blockRange.start.line) {
            return 0;
        }
        
        const config = vscode.workspace.getConfiguration('editor');
        const fontSize = config.get<number>('fontSize') || 14;
        const lineHeight = config.get<number>('lineHeight') || 1.35;
        const actualLineHeight = fontSize * lineHeight;
        
        const hiddenFullLines = visibleRange.start.line - blockRange.start.line;
        const hiddenFullLinesHeight = hiddenFullLines * actualLineHeight;
        
        const partialLineOffset = visibleRange.start.character > 0 ? 
            (visibleRange.start.character / 100) * actualLineHeight * 0.1 : 0;
        
        return hiddenFullLinesHeight + partialLineOffset;
    }
}