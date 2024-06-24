import { Configurator } from '@cityssm/configurator';
import { configDefaultValues } from '../data/config.defaultValues.js';
import { config } from '../data/config.js';
const configurator = new Configurator(configDefaultValues, config);
export function getConfigProperty(propertyName, fallbackValue) {
    return configurator.getConfigProperty(propertyName, fallbackValue);
}
export const keepAliveMillis = getConfigProperty('session.doKeepAlive')
    ? Math.max(getConfigProperty('session.maxAgeMillis') / 2, getConfigProperty('session.maxAgeMillis') - 10 * 60 * 1000)
    : 0;
