import { getConfigProperty } from '../../helpers/config.helpers.js';
const apiKey = getConfigProperty('integrations.portal.apiKey');
const apiUrl = getConfigProperty('integrations.portal.apiUrl');
export function getEndpointUrl(endpoint) {
    return `${apiUrl}/${apiKey}/${endpoint}`;
}
