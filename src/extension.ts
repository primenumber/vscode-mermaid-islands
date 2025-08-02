import * as vscode from 'vscode';
import { MermaidDecorationProvider } from './mermaidDecorationProvider';
import { MermaidParser } from './mermaidParser';

export function activate(context: vscode.ExtensionContext) {
    console.log('Mermaid Islands extension is now active!');
    
    const provider = new MermaidDecorationProvider();
    
    const updateDecorations = async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const mermaidBlocks = MermaidParser.findMermaidBlocks(editor);
        await provider.updateAllDecorations(editor, mermaidBlocks);
    };

    vscode.window.onDidChangeActiveTextEditor(updateDecorations, null, context.subscriptions);
    vscode.workspace.onDidChangeTextDocument(updateDecorations, null, context.subscriptions);
    vscode.window.onDidChangeTextEditorSelection(updateDecorations, null, context.subscriptions);
    vscode.window.onDidChangeTextEditorVisibleRanges(updateDecorations, null, context.subscriptions);

    updateDecorations();

    context.subscriptions.push({
        dispose: () => provider.dispose()
    });
}

export function deactivate() {}