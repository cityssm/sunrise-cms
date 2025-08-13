import { type PrintConfigWithPath } from './print.helpers.js';
export declare function generatePdf(printConfig: PrintConfigWithPath, parameters: Record<string, unknown>): Promise<Uint8Array>;
export declare function closePdfPuppeteer(): Promise<void>;
