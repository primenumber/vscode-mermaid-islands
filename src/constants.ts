import { MermaidConfig } from './types';

export const CACHE_SIZE_LIMIT = 100;
export const RENDER_TIMEOUT = 5000;

export const DEFAULT_DIMENSIONS = {
    WIDTH: 400,
    HEIGHT: 300,
    ERROR_HEIGHT: 200
};

export const MERMAID_LIGHT_CONFIG: MermaidConfig = {
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

export const MERMAID_DARK_CONFIG: MermaidConfig = {
    theme: 'dark',
    themeVariables: {
        primaryColor: '#1f2937',
        primaryTextColor: '#f9fafb',
        primaryBorderColor: '#6b7280',
        lineColor: '#9ca3af',
        background: '#111827',
        secondaryColor: '#374151',
        tertiaryColor: '#4b5563',
        cScale0: '#111827',
        cScale1: '#374151',
        cScale2: '#4b5563'
    },
    securityLevel: 'loose',
    fontFamily: 'Arial, sans-serif'
};

export const MERMAID_HIGH_CONTRAST_CONFIG: MermaidConfig = {
    theme: 'base',
    themeVariables: {
        primaryColor: '#000000',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#ffffff',
        lineColor: '#ffffff',
        background: '#000000',
        secondaryColor: '#333333',
        tertiaryColor: '#666666',
        cScale0: '#000000',
        cScale1: '#333333',
        cScale2: '#666666'
    },
    securityLevel: 'loose',
    fontFamily: 'Arial, sans-serif'
};

export const MERMAID_HIGH_CONTRAST_LIGHT_CONFIG: MermaidConfig = {
    theme: 'base',
    themeVariables: {
        primaryColor: '#ffffff',
        primaryTextColor: '#000000',
        primaryBorderColor: '#000000',
        lineColor: '#000000',
        background: '#ffffff',
        secondaryColor: '#cccccc',
        tertiaryColor: '#999999',
        cScale0: '#ffffff',
        cScale1: '#cccccc',
        cScale2: '#999999'
    },
    securityLevel: 'loose',
    fontFamily: 'Arial, sans-serif'
};

export const PUPPETEER_ARGS = ['--no-sandbox', '--disable-setuid-sandbox'];

export const LANGUAGE_COMMENT_MAP: Record<string, string> = {
    'javascript': '//',
    'typescript': '//',
    'java': '//',
    'c': '//',
    'cpp': '//',
    'csharp': '//',
    'go': '//',
    'rust': '//',
    'php': '//',
    'swift': '//',
    'kotlin': '//',
    'scala': '//',
    'python': '#',
    'ruby': '#',
    'perl': '#',
    'bash': '#',
    'shell': '#',
    'powershell': '#',
    'r': '#',
    'yaml': '#',
    'toml': '#',
    'dockerfile': '#',
    'makefile': '#',
    'sql': '--',
    'haskell': '--',
    'lua': '--',
    'ada': '--',
    'vhdl': '--',
    'agda': '--'
};

export const DEFAULT_COMMENT_PREFIX = '//';