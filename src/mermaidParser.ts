import * as vscode from 'vscode';
import { MermaidBlock } from './types';
import { MERMAID_REGEX } from './constants';

export class MermaidParser {
    static findMermaidBlocks(editor: vscode.TextEditor): MermaidBlock[] {
        const text = editor.document.getText();
        const mermaidBlocks: MermaidBlock[] = [];
        let match;

        while (match = MERMAID_REGEX.exec(text)) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);
            const mermaidCode = match[1];

            if (!range.contains(editor.selection.active)) {
                mermaidBlocks.push({ code: mermaidCode, range });
            }
        }

        return mermaidBlocks;
    }

    static cleanMermaidCode(mermaidCode: string): string {
        return mermaidCode
            .split('\n')
            .map(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('//')) {
                    return trimmedLine.substring(2).trim();
                }
                return trimmedLine;
            })
            .filter(line => line.length > 0)
            .join('\n')
            .trim();
    }
}