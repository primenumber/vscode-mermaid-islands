import { MermaidConfig } from './types';

export const MERMAID_REGEX = /\/\/\s*mermaid\s*\n([\s\S]*?)\/\/\s*end-mermaid/g;

export const CACHE_SIZE_LIMIT = 100;
export const RENDER_TIMEOUT = 5000;

export const DEFAULT_DIMENSIONS = {
    WIDTH: 400,
    HEIGHT: 300,
    ERROR_HEIGHT: 200
};

export const MERMAID_CONFIG: MermaidConfig = {
    theme: 'base',
    themeVariables: {
        primaryColor: '#ffffff',
        primaryTextColor: '#000000',
        primaryBorderColor: '#333333',
        lineColor: '#333333',
        background: '#ffffff',
        secondaryColor: '#f0f0f0',
        tertiaryColor: '#e0e0e0',
        cScale0: '#ffffff',
        cScale1: '#f0f0f0',
        cScale2: '#e0e0e0'
    },
    securityLevel: 'loose',
    fontFamily: 'Arial, sans-serif'
};

export const PUPPETEER_ARGS = ['--no-sandbox', '--disable-setuid-sandbox'];