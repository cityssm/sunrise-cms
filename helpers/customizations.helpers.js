// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-unsanitized/method, unicorn/no-await-expression-member */
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { getConfigProperty } from './config.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:customizations`);
const customizationsPath = getConfigProperty('settings.customizationsPath');
let customizationsConfig;
if (customizationsPath !== '.') {
    const importPath = `../${customizationsPath}/index.js`;
    try {
        customizationsConfig = (await import(importPath))
            .default;
    }
    catch (error) {
        debug('Error loading customizations:', error);
    }
}
export function getCustomizationPdfPrintConfigs() {
    if (customizationsConfig?.prints?.pdf !== undefined) {
        return customizationsConfig.prints.pdf;
    }
    return {};
}
