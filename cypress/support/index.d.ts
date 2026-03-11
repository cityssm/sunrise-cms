import type axe from 'axe-core';
import 'cypress-axe';
export declare function logout(): void;
export declare function login(userName: string): void;
export declare function getDelayMillis(): {
    ajaxDelayMillis: number;
    pageLoadDelayMillis: number;
};
export declare const pdfGenerationDelayMillis = 10000;
export declare function logAccessibilityViolations(violations: axe.Result[]): void;
