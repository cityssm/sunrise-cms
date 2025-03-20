import { config as baseConfig } from './config.base.js';
export const config = Object.assign({}, baseConfig);
config.settings.provinceDefault = 'ON';
config.settings.latitudeMax = 56.85;
config.settings.latitudeMin = 41.68;
config.settings.longitudeMax = -74;
config.settings.longitudeMin = -95.15;
config.settings.fees.taxPercentageDefault = 13;
export default config;
