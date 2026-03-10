import type axe from 'axe-core';
import 'cypress-axe';
export declare function logout(): void;
export declare function login(userName: string): void;
export declare let ajaxDelayMillis: number;
export declare let pageLoadDelayMillis: number;
export declare const pdfGenerationDelayMillis = 10000;
export declare function logAccessibilityViolations(violations: axe.Result[]): void;
export declare function checkDeadLinks(): void;
