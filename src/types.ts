import * as vscode from 'vscode';

export interface MermaidBlock {
    code: string;
    range: vscode.Range;
    commentPrefix: string;
}

export interface SvgRenderResult {
    svg: string;
    width: number;
    height: number;
}

export interface RenderError extends SvgRenderResult {
    error: string;
}

export interface MermaidConfig {
    theme: string;
    themeVariables: {
        primaryColor: string;
        primaryTextColor: string;
        primaryBorderColor: string;
        lineColor: string;
        background: string;
        secondaryColor: string;
        tertiaryColor: string;
        cScale0: string;
        cScale1: string;
        cScale2: string;
    };
    securityLevel: string;
    fontFamily: string;
}