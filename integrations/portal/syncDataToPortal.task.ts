import Debug from 'debug'
import {
  type ApiResponse,
  type DoDataSyncResponseData,
  doDataSyncEndpoint
} from 'sunrise-cms-shared'

import { DEBUG_ENABLE_NAMESPACES, DEBUG_NAMESPACE } from '../../debug.config.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

import getSyncData from './database/getSyncData.js'

if (process.env.NODE_ENV === 'development') {
  Debug.enable(DEBUG_ENABLE_NAMESPACES)
}

const debug = Debug(`${DEBUG_NAMESPACE}:syncDataToPortal`)

async function syncDataToPortal(): Promise<void> {
  const apiKey = getConfigProperty('integrations.portal.apiKey')
  const apiUrl = getConfigProperty('integrations.portal.apiUrl')
  const syncUrl = `${apiUrl}/${apiKey}/${doDataSyncEndpoint}`

  debug('Starting sync to portal')

  const syncData = getSyncData()

  debug('Sync data retrieved', syncData)

  try {
    const syncResponse = await fetch(syncUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',

      body: JSON.stringify(syncData)
    })

    debug('Sync response received', syncResponse)

    if (!syncResponse.ok && syncResponse.status !== 403) {
      throw new Error(`Sync failed with status ${syncResponse.status}`)
    }

    const syncResult =
      (await syncResponse.json()) as ApiResponse<DoDataSyncResponseData>

    debug('Sync result', syncResult)

  } catch (error) {
    debug('Error occurred during sync', error)
  }
}

void syncDataToPortal()
