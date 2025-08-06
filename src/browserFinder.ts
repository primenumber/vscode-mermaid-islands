import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class BrowserFinder {
    static async findChrome(): Promise<string | null> {
        const platform = process.platform;

        if (platform === 'win32') {
            return this.findChromeWindows();
        } else if (platform === 'darwin') {
            return this.findChromeMac();
        } else {
            return this.findChromeLinux();
        }
    }

    private static findChromeWindows(): string | null {
        const possiblePaths = [
            // Chrome stable
            path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
            path.join(process.env.PROGRAMFILES || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
            path.join(process.env['PROGRAMFILES(X86)'] || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
            // Edge
            path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
            path.join(process.env.PROGRAMFILES || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
            path.join(process.env['PROGRAMFILES(X86)'] || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
            // Chrome Beta/Dev
            path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome Beta', 'Application', 'chrome.exe'),
            path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome Dev', 'Application', 'chrome.exe'),
        ];

        for (const chromePath of possiblePaths) {
            if (this.fileExists(chromePath)) {
                return chromePath;
            }
        }

        return null;
    }

    private static findChromeMac(): string | null {
        const possiblePaths = [
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
            '/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta',
            '/Applications/Google Chrome Dev.app/Contents/MacOS/Google Chrome Dev',
            '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
            path.join(os.homedir(), 'Applications', 'Google Chrome.app', 'Contents', 'MacOS', 'Google Chrome'),
        ];

        for (const chromePath of possiblePaths) {
            if (this.fileExists(chromePath)) {
                return chromePath;
            }
        }

        return null;
    }

    private static findChromeLinux(): string | null {
        const possiblePaths = [
            '/usr/bin/google-chrome',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/google-chrome-beta',
            '/usr/bin/google-chrome-dev',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium',
            '/snap/bin/chromium',
            '/usr/bin/microsoft-edge',
            '/usr/bin/microsoft-edge-stable',
            '/usr/bin/microsoft-edge-beta',
            '/usr/bin/microsoft-edge-dev',
        ];

        for (const chromePath of possiblePaths) {
            if (this.fileExists(chromePath)) {
                return chromePath;
            }
        }

        return null;
    }

    private static fileExists(filePath: string): boolean {
        try {
            return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
        } catch {
            return false;
        }
    }
}