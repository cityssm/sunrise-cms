import type axe from 'axe-core';
import 'cypress-axe';
export declare function logout(): void;
export declare function login(userName: string): void;
export declare const ajaxDelayMillis = 800;
export declare const pageLoadDelayMillis = 1200;
export declare const pdfGenerationDelayMillis = 10000;
export declare function checkA11yLog(violations: axe.Result[]): void;
