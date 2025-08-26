import { Configurator } from '@cityssm/configurator';
import { secondsToMillis } from '@cityssm/to-millis';
import { config } from '../data/config.js';
import { configDefaultValues } from '../data/configDefaults.js';
const configurator = new Configurator(configDefaultValues, config);
export function getConfigProperty(propertyName, fallbackValue) {
    return configurator.getConfigProperty(propertyName, fallbackValue);
}
export default {
    getConfigProperty
};
export const keepAliveMillis = getConfigProperty('session.doKeepAlive')
    ? Math.max(getConfigProperty('session.maxAgeMillis') / 2, getConfigProperty('session.maxAgeMillis') - secondsToMillis(10))
    : 0;
