import * as vscode from 'vscode';
import { MermaidConfig } from './types';
import { MERMAID_LIGHT_CONFIG, MERMAID_DARK_CONFIG } from './constants';

export class ThemeUtils {
    static getCurrentMermaidConfig(): MermaidConfig {
        const colorTheme = vscode.window.activeColorTheme;
        
        if (colorTheme.kind === vscode.ColorThemeKind.Dark || 
            colorTheme.kind === vscode.ColorThemeKind.HighContrast) {
            return MERMAID_DARK_CONFIG;
        }
        
        return MERMAID_LIGHT_CONFIG;
    }
    
    static isDarkTheme(): boolean {
        const colorTheme = vscode.window.activeColorTheme;
        return colorTheme.kind === vscode.ColorThemeKind.Dark || 
               colorTheme.kind === vscode.ColorThemeKind.HighContrast;
    }
}