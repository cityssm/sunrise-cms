import type axe from 'axe-core';
import 'cypress-axe';
export declare const logout: () => void;
export declare const login: (userName: string) => void;
export declare const ajaxDelayMillis = 800;
export declare const pageLoadDelayMillis = 1200;
export declare const pdfGenerationDelayMillis = 10000;
export declare function checkA11yLog(violations: axe.Result[]): void;
