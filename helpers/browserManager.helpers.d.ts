import { type Browser } from '@cityssm/pdf-puppeteer';
export interface BrowserInstallationResult {
    success: boolean;
    browser: Browser;
    error?: Error;
    message?: string;
}
export interface BrowserValidationResult {
    isAvailable: boolean;
    browser: Browser;
    error?: Error;
}
/**
 * Attempts to install a specific browser with retry logic
 */
export declare function installBrowserWithRetry(browser: Browser, maxRetries?: number): Promise<BrowserInstallationResult>;
/**
 * Attempts to validate that a browser is available
 */
export declare function validateBrowserAvailability(browser: Browser): Promise<BrowserValidationResult>;
/**
 * Installs and validates browsers based on configuration
 */
export declare function ensureBrowsersAvailable(): Promise<{
    success: boolean;
    results: BrowserInstallationResult[];
    validatedBrowser?: Browser;
}>;
/**
 * Gets the best available browser for PDF generation
 */
export declare function getBestAvailableBrowser(): Promise<Browser | null>;
/**
 * Checks if browser installation should be attempted based on settings
 */
export declare function shouldAttemptBrowserInstallation(): boolean;
