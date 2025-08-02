import * as vscode from 'vscode';

export class DecorationManager {
    private decorationTypes: Map<string, vscode.TextEditorDecorationType> = new Map();

    createMermaidDecoration(
        svgContent: string, 
        fullHeight: number, 
        visibleHeight: number, 
        displayWidth: number, 
        hiddenHeight: number
    ): vscode.TextEditorDecorationType {
        const decorationKey = `${svgContent}-${fullHeight}-${visibleHeight}-${displayWidth}-${hiddenHeight}`;
        
        let decorationType = this.decorationTypes.get(decorationKey);
        if (!decorationType) {
            decorationType = this.createDecorationType(svgContent, fullHeight, visibleHeight, displayWidth, hiddenHeight);
            this.decorationTypes.set(decorationKey, decorationType);
        }
        
        return decorationType;
    }

    private createDecorationType(
        svgContent: string, 
        fullHeight: number, 
        visibleHeight: number, 
        displayWidth: number, 
        hiddenHeight: number
    ): vscode.TextEditorDecorationType {
        const dataUri = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
        
        return vscode.window.createTextEditorDecorationType({
            before: {
                contentText: ' ',
                width: `${displayWidth}px`,
                height: `${visibleHeight}px`,
                margin: '0px',
                textDecoration: `none;
                    position: absolute;
                    display: block;
                    background-image: url('${dataUri}');
                    background-size: ${displayWidth}px ${fullHeight}px;
                    background-repeat: no-repeat;
                    background-position: left top -${hiddenHeight}px;
                    border: 1px solid var(--vscode-editorWidget-border);
                    border-radius: 4px;
                    padding: 0px;
                    background-color: #ffffff;
                    z-index: 10;
                    overflow: hidden;`
            },
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        });
    }

    clearAllDecorations(editor: vscode.TextEditor): void {
        this.decorationTypes.forEach(decorationType => {
            editor.setDecorations(decorationType, []);
        });
    }

    dispose(): void {
        this.decorationTypes.forEach(decorationType => decorationType.dispose());
        this.decorationTypes.clear();
    }
}