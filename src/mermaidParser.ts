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

    static createSvgRegex(commentPrefix: string): RegExp {
        const escapedPrefix = commentPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`${escapedPrefix}\\s*svg\\s*\\n([\\s\\S]*?)${escapedPrefix}\\s*end-svg`, 'g');
    }

    static findMermaidBlocks(editor: vscode.TextEditor): MermaidBlock[] {
        const text = editor.document.getText();
        const languageId = editor.document.languageId;
        const commentPrefix = this.getCommentPrefix(languageId);
        const mermaidRegex = this.createMermaidRegex(commentPrefix);
        const svgRegex = this.createSvgRegex(commentPrefix);
        const blocks: MermaidBlock[] = [];
        let match;

        // Find Mermaid blocks
        while (match = mermaidRegex.exec(text)) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);
            const code = match[1];

            if (!range.contains(editor.selection.active)) {
                blocks.push({ code, range, commentPrefix, type: 'mermaid' });
            }
        }

        // Find SVG blocks
        while (match = svgRegex.exec(text)) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);
            const code = match[1];

            if (!range.contains(editor.selection.active)) {
                blocks.push({ code, range, commentPrefix, type: 'svg' });
            }
        }

        return blocks;
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