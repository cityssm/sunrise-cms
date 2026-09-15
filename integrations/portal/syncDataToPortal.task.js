import Debug from 'debug';
import { DEBUG_ENABLE_NAMESPACES, DEBUG_NAMESPACE } from '../../debug.config.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
if (process.env.NODE_ENV === 'development') {
    Debug.enable(DEBUG_ENABLE_NAMESPACES);
}
const debug = Debug(`${DEBUG_NAMESPACE}:syncDataToPortal`);
const apiKey = getConfigProperty('integrations.portal.apiKey');
const apiUrl = getConfigProperty('integrations.portal.apiUrl');
function syncDataToPortal() {
    debug('Starting sync to portal');
}
syncDataToPortal();
