import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
		console.log('Mermaid Islands extension is now active!');
    // デコレーションタイプの作成例
    
    // 1. 基本的な画像デコレーション（行の後ろに表示）
    const imageDecoration = vscode.window.createTextEditorDecorationType({
        after: {
            contentText: ' ',  // スペースが必要
            width: '300px',
            height: '200px',
            margin: '0 0 0 10px',
            textDecoration: `none; 
                background-image: url('${path.join(context.extensionPath, 'images', 'sample.png')}');
                background-size: contain;
                background-repeat: no-repeat;
                display: inline-block;
                vertical-align: middle;`
        }
    });

    // 2. Data URIを使った動的な画像表示
    function createImageDecorationWithDataUri(svgContent: string): vscode.TextEditorDecorationType {
        // SVGをData URIに変換
        const dataUri = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
        
        return vscode.window.createTextEditorDecorationType({
            after: {
                contentText: ' ',
                width: '400px',
                height: '300px',
                margin: '10px 0 10px 20px',
                textDecoration: `none;
                    display: block;
                    background-image: url('${dataUri}');
                    background-size: contain;
                    background-repeat: no-repeat;
                    background-position: left center;`
            },
            // 行全体のスタイル（オプション）
            isWholeLine: true,
            backgroundColor: new vscode.ThemeColor('editor.lineHighlightBackground')
        });
    }

    // 3. 行の下に画像を表示（ブロックレベル）
    const blockImageDecoration = vscode.window.createTextEditorDecorationType({
        after: {
            contentText: '\n',  // 改行が重要
            width: '100%',
            height: '200px',
            textDecoration: `none;
                display: block;
                background-image: url('${path.join(context.extensionPath, 'images', 'diagram.png')}');
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                margin-top: 5px;
                margin-bottom: 5px;
                border: 1px solid var(--vscode-widget-border);
                border-radius: 4px;`
        }
    });

    // 4. Mermaidレンダリング用の実装例
    class MermaidDecorationProvider {
        private decorationTypes: Map<string, vscode.TextEditorDecorationType> = new Map();
        private currentDecorations: Map<string, vscode.DecorationOptions[]> = new Map();
        private mermaidInitialized: boolean = false;

        async updateAllDecorations(editor: vscode.TextEditor, mermaidBlocks: Array<{code: string, range: vscode.Range}>) {
            // 既存のデコレーションをすべてクリア
            this.clearAllDecorations(editor);

            // エディターの可視範囲を取得
            const visibleRanges = editor.visibleRanges;

            // 各ブロックごとに個別のデコレーションタイプを作成（高さが異なるため）
            for (const block of mermaidBlocks) {
                const svgData = await this.renderMermaidToSvg(block.code);
                
                // ブロックと可視範囲の交差部分を計算
                const visibleRange = this.getVisiblePortionOfBlock(block.range, visibleRanges);
                if (!visibleRange) {
                    continue; // ブロックが全く見えていない場合はスキップ
                }
                
                // 全体の高さと可視部分の高さを計算
                const fullBlockHeight = this.calculateBlockHeight(editor, block.range);
                const visibleHeight = this.calculateBlockHeight(editor, visibleRange);
                
                // アスペクト比を保持した幅を計算
                const aspectRatio = svgData.width / svgData.height;
                const displayWidth = fullBlockHeight * aspectRatio;
                
                // 上からどれだけ隠れているかを正確に計算（部分行も含む）
                const hiddenHeight = this.calculateExactHiddenHeight(editor, block.range, visibleRange);
                
                // ブロック固有のキーを作成（SVGコンテンツ + 高さ + 幅 + クリップ位置）
                const decorationKey = `${svgData.svg}-${fullBlockHeight}-${visibleHeight}-${displayWidth}-${hiddenHeight}`;
                
                // デコレーションタイプを取得または作成
                let decorationType = this.decorationTypes.get(decorationKey);
                if (!decorationType) {
                    decorationType = this.createMermaidDecoration(svgData.svg, fullBlockHeight, visibleHeight, displayWidth, hiddenHeight);
                    this.decorationTypes.set(decorationKey, decorationType);
                }
                
                // デコレーションオプションを作成（可視部分の範囲を使用）
                const decorationOptions: vscode.DecorationOptions = {
                    range: visibleRange,
                    hoverMessage: new vscode.MarkdownString('**Mermaid Diagram**\n\nClick to edit')
                };
                
                // デコレーションを適用
                editor.setDecorations(decorationType, [decorationOptions]);
            }
        }

        private getVisiblePortionOfBlock(blockRange: vscode.Range, visibleRanges: readonly vscode.Range[]): vscode.Range | null {
            for (const visibleRange of visibleRanges) {
                // ブロックと可視範囲の交差部分を計算
                const intersection = blockRange.intersection(visibleRange);
                if (intersection) {
                    return intersection;
                }
            }
            return null;
        }

        private calculateBlockHeight(editor: vscode.TextEditor, range: vscode.Range): number {
            // 行数を計算
            const lineCount = range.end.line - range.start.line + 1;
            
            // エディター設定から行の高さを取得
            const config = vscode.workspace.getConfiguration('editor');
            const fontSize = config.get<number>('fontSize') || 14;
            const lineHeight = config.get<number>('lineHeight') || 1.35;
            
            // 実際の行の高さを計算（フォントサイズ × 行間）
            const actualLineHeight = fontSize * lineHeight;
            
            return lineCount * actualLineHeight;
        }

        private calculateExactHiddenHeight(editor: vscode.TextEditor, blockRange: vscode.Range, visibleRange: vscode.Range): number {
            if (visibleRange.start.line <= blockRange.start.line) {
                return 0; // ブロックの開始が見えている場合、隠れた部分はない
            }
            
            // エディター設定から行の高さを取得
            const config = vscode.workspace.getConfiguration('editor');
            const fontSize = config.get<number>('fontSize') || 14;
            const lineHeight = config.get<number>('lineHeight') || 1.35;
            const actualLineHeight = fontSize * lineHeight;
            
            // ブロック開始からvisible開始までの完全な行数
            const hiddenFullLines = visibleRange.start.line - blockRange.start.line;
            
            // 完全な行の高さ
            const hiddenFullLinesHeight = hiddenFullLines * actualLineHeight;
            
            // 部分行のオフセット（文字位置に基づく概算）
            // 完全な解決策には、実際の文字位置とレンダリング情報が必要だが、
            // 簡易的に文字位置の比率で計算
            const partialLineOffset = visibleRange.start.character > 0 ? 
                (visibleRange.start.character / 100) * actualLineHeight * 0.1 : 0; // 控えめな調整
            
            return hiddenFullLinesHeight + partialLineOffset;
        }

        private clearAllDecorations(editor: vscode.TextEditor) {
            // すべてのデコレーションタイプをクリア
            this.decorationTypes.forEach(decorationType => {
                editor.setDecorations(decorationType, []);
            });
            this.currentDecorations.clear();
        }

        private createMermaidDecoration(svgContent: string, fullHeight: number, visibleHeight: number, displayWidth: number, hiddenHeight: number): vscode.TextEditorDecorationType {
            const dataUri = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
            
            return vscode.window.createTextEditorDecorationType({
                // メインの画像表示 - テキストの上にオーバーレイ
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
                        background-color: var(--vscode-editor-background);
                        z-index: 10;
                        overflow: hidden;`
                },
                rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
            });
        }

        private async renderMermaidToSvg(mermaidCode: string): Promise<{svg: string, width: number, height: number}> {
            // Mermaidコードを清掃（コメントプレフィックスを除去）
            const cleanedCode = this.cleanMermaidCode(mermaidCode);
            
            // 実際の実装では mermaid パッケージを使用予定
            // 現在はプレースホルダーとして簡単なSVGを返す
            const width = 400;
            const height = 200;
            const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <rect width="${width}" height="${height}" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
                <text x="${width/2}" y="${height/2-20}" text-anchor="middle" font-family="Arial" font-size="16" fill="#333">
                    Mermaid Diagram
                </text>
                <text x="${width/2}" y="${height/2}" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">
                    Code: ${cleanedCode.substring(0, 30)}${cleanedCode.length > 30 ? '...' : ''}
                </text>
                <text x="${width/2}" y="${height/2+20}" text-anchor="middle" font-family="Arial" font-size="10" fill="#999">
                    (Placeholder - Real rendering coming soon)
                </text>
            </svg>`;
            
            return { svg, width, height };
        }

        private cleanMermaidCode(mermaidCode: string): string {
            // 各行からコメントプレフィックス（//）を除去
            return mermaidCode
                .split('\n')
                .map(line => {
                    // 行の先頭の空白を保持しつつ、// を除去
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('//')) {
                        // // の後の空白も除去
                        return trimmedLine.substring(2).trim();
                    }
                    return trimmedLine;
                })
                .filter(line => line.length > 0) // 空行を除去
                .join('\n')
                .trim();
        }


        dispose() {
            // すべてのデコレーションタイプを破棄
            this.decorationTypes.forEach(decorationType => decorationType.dispose());
            this.decorationTypes.clear();
            this.currentDecorations.clear();
        }
    }

    // 5. 使用例：コメント内のMermaidコードを検出して表示
    const provider = new MermaidDecorationProvider();
    
    const updateDecorations = async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {return;}

        const text = editor.document.getText();
        const regex = /\/\/\s*mermaid\s*\n([\s\S]*?)\/\/\s*end-mermaid/g;
        const mermaidBlocks: Array<{code: string, range: vscode.Range}> = [];
        let match;

        // すべてのMermaidブロックを収集
        while (match = regex.exec(text)) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);
            const mermaidCode = match[1];

            // カーソルが範囲内にない場合のみ表示対象に追加
            if (!range.contains(editor.selection.active)) {
                mermaidBlocks.push({code: mermaidCode, range: range});
            }
        }

        // すべてのデコレーションを一括更新
        await provider.updateAllDecorations(editor, mermaidBlocks);
    };

    // イベントリスナーの設定
    vscode.window.onDidChangeActiveTextEditor(updateDecorations, null, context.subscriptions);
    vscode.workspace.onDidChangeTextDocument(updateDecorations, null, context.subscriptions);
    vscode.window.onDidChangeTextEditorSelection(updateDecorations, null, context.subscriptions);
    vscode.window.onDidChangeTextEditorVisibleRanges(updateDecorations, null, context.subscriptions);

    // 初回実行
    updateDecorations();

    // クリーンアップ
    context.subscriptions.push({
        dispose: () => provider.dispose()
    });
}

export function deactivate() {}

// 補足：パフォーマンス最適化のためのヒント
class OptimizedDecorationManager {
    private decorationCache = new Map<string, vscode.TextEditorDecorationType>();
    
    getOrCreateDecoration(key: string, svgContent: string): vscode.TextEditorDecorationType {
        if (this.decorationCache.has(key)) {
            return this.decorationCache.get(key)!;
        }
        
        const decoration = this.createDecoration(svgContent);
        this.decorationCache.set(key, decoration);
        return decoration;
    }
    
    private createDecoration(svgContent: string): vscode.TextEditorDecorationType {
        // デコレーション作成ロジック
        const dataUri = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
        return vscode.window.createTextEditorDecorationType({
            after: {
                contentText: ' ',
                width: '400px',
                height: '300px',
                textDecoration: `none;
                    display: block;
                    background-image: url('${dataUri}');
                    background-size: contain;
                    background-repeat: no-repeat;`
            }
        });
    }
    
    clearAll() {
        this.decorationCache.forEach(decoration => decoration.dispose());
        this.decorationCache.clear();
    }
}