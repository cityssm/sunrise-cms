import ntfyPublish, { type NtfyMessageOptions } from '@cityssm/ntfy-publish'

import { getConfigProperty } from '../../helpers/config.helpers.js'

const appName = getConfigProperty('application.applicationName')

export const isNtfyIntegrationEnabled = getConfigProperty(
  'integrations.ntfy.integrationIsEnabled'
)
const ntfyServer = getConfigProperty('integrations.ntfy.server')
const ntfyTopics = getConfigProperty('integrations.ntfy.topics')

// eslint-disable-next-line unicorn/consistent-boolean-name
async function sendNotification(
  messageOptions: NtfyMessageOptions
): Promise<boolean> {
  if (!isNtfyIntegrationEnabled) {
    return false
  }

  if (ntfyServer !== '') {
    messageOptions.server = ntfyServer
  }

  return await ntfyPublish(messageOptions)
}

// eslint-disable-next-line unicorn/consistent-boolean-name
export async function sendStartupNotification(): Promise<boolean> {
  const topic = ntfyTopics.startup

  if ((topic ?? '') !== '') {
    return await sendNotification({
      message: 'The application has started successfully.',
      tags: ['arrow_up'],
      title: appName,
      topic: topic ?? ''
    })
  }

  return false
}

// eslint-disable-next-line unicorn/consistent-boolean-name
export async function sendShutdownNotification(): Promise<boolean> {
  const topic = ntfyTopics.startup

  if ((topic ?? '') !== '') {
    return await sendNotification({
      message: 'The application is shutting down.',
      tags: ['arrow_down'],
      title: appName,
      topic: topic ?? ''
    })
  }

  return false
}
