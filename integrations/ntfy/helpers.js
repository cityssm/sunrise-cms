import ntfyPublish from '@cityssm/ntfy-publish';
import { getConfigProperty } from '../../helpers/config.helpers.js';
const applicationName = getConfigProperty('application.applicationName');
export const ntfyIsEnabled = getConfigProperty('integrations.ntfy.integrationIsEnabled');
const ntfyServer = getConfigProperty('integrations.ntfy.server');
const ntfyTopics = getConfigProperty('integrations.ntfy.topics');
async function sendNotification(messageOptions) {
    if (!ntfyIsEnabled) {
        return false;
    }
    if (ntfyServer !== '') {
        messageOptions.server = ntfyServer;
    }
    return await ntfyPublish(messageOptions);
}
export async function sendStartupNotification() {
    const topic = ntfyTopics.startup;
    if ((topic ?? '') !== '') {
        return await sendNotification({
            message: 'The application has started successfully.',
            tags: ['arrow_up'],
            title: applicationName,
            topic: topic ?? ''
        });
    }
    return false;
}
export async function sendShutdownNotification() {
    const topic = ntfyTopics.startup;
    if ((topic ?? '') !== '') {
        return await sendNotification({
            message: 'The application is shutting down.',
            tags: ['arrow_down'],
            title: applicationName,
            topic: topic ?? ''
        });
    }
    return false;
}
