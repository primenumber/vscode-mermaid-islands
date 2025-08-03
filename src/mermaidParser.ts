import * as vscode from 'vscode';
import { MermaidBlock } from './types';
import { LANGUAGE_COMMENT_MAP, DEFAULT_COMMENT_PREFIX } from './constants';

export class MermaidParser {
    static getCommentPrefix(languageId: string): string {
        return LANGUAGE_COMMENT_MAP[languageId] || DEFAULT_COMMENT_PREFIX;
    }

    static createMermaidRegex(commentPrefix: string): RegExp {
        const escapedPrefix = commentPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`${escapedPrefix}\\s*mermaid\\s*\\n([\\s\\S]*?)${escapedPrefix}\\s*end-mermaid`, 'g');
    }

    static findMermaidBlocks(editor: vscode.TextEditor): MermaidBlock[] {
        const text = editor.document.getText();
        const languageId = editor.document.languageId;
        const commentPrefix = this.getCommentPrefix(languageId);
        const mermaidRegex = this.createMermaidRegex(commentPrefix);
        const mermaidBlocks: MermaidBlock[] = [];
        let match;

        while (match = mermaidRegex.exec(text)) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);
            const mermaidCode = match[1];

            if (!range.contains(editor.selection.active)) {
                mermaidBlocks.push({ code: mermaidCode, range, commentPrefix });
            }
        }

        return mermaidBlocks;
    }

    static cleanMermaidCode(mermaidCode: string, commentPrefix: string): string {
        return mermaidCode
            .split('\n')
            .map(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith(commentPrefix)) {
                    return trimmedLine.substring(commentPrefix.length).trim();
                }
                return trimmedLine;
            })
            .filter(line => line.length > 0)
            .join('\n')
            .trim();
    }
}