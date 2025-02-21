import { config as baseConfig } from './config.base.js';
export const config = Object.assign({}, baseConfig);
config.settings.contracts.provinceDefault = 'ON';
config.settings.cemeteries.provinceDefault = 'ON';
config.settings.fees.taxPercentageDefault = 13;
export default config;
