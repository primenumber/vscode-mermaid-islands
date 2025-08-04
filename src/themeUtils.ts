import * as vscode from 'vscode';
import { MermaidConfig } from './types';
import {
    MERMAID_LIGHT_CONFIG,
    MERMAID_DARK_CONFIG,
    MERMAID_HIGH_CONTRAST_CONFIG,
    MERMAID_HIGH_CONTRAST_LIGHT_CONFIG
} from './constants';

export class ThemeUtils {
    static getCurrentMermaidConfig(): MermaidConfig {
        const colorTheme = vscode.window.activeColorTheme;

        switch (colorTheme.kind) {
            case vscode.ColorThemeKind.Dark:
                return MERMAID_DARK_CONFIG;
            case vscode.ColorThemeKind.HighContrast:
                return MERMAID_HIGH_CONTRAST_CONFIG;
            case vscode.ColorThemeKind.HighContrastLight:
                return MERMAID_HIGH_CONTRAST_LIGHT_CONFIG;
            case vscode.ColorThemeKind.Light:
            default:
                return MERMAID_LIGHT_CONFIG;
        }
    }

    static isDarkTheme(): boolean {
        const colorTheme = vscode.window.activeColorTheme;
        return colorTheme.kind === vscode.ColorThemeKind.Dark ||
               colorTheme.kind === vscode.ColorThemeKind.HighContrast;
    }

    static getThemeKindName(): string {
        const colorTheme = vscode.window.activeColorTheme;
        switch (colorTheme.kind) {
            case vscode.ColorThemeKind.Dark:
                return 'Dark';
            case vscode.ColorThemeKind.HighContrast:
                return 'HighContrast';
            case vscode.ColorThemeKind.HighContrastLight:
                return 'HighContrastLight';
            case vscode.ColorThemeKind.Light:
            default:
                return 'Light';
        }
    }
}