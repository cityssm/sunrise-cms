import { config as baseConfig } from './partialConfig.js';
export const config = { ...baseConfig };
config.settings.latitudeMax = 56.85;
config.settings.latitudeMin = 41.68;
config.settings.longitudeMax = -74;
config.settings.longitudeMin = -95.15;
config.settings.fees.taxPercentageDefault = 13;
export default config;
