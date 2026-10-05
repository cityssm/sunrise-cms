/* eslint-disable unicorn/no-top-level-assignment-in-function */

import { minutesToMillis } from '@cityssm/to-millis'
import camelcase from 'camelcase'
import Debug from 'debug'
import exitHook from 'exit-hook'
import {
  type ApiResponse,
  type DoGetUnprocessedOrderFormsResponseData,
  type DoMarkOrderFormAsSyncedRequest,
  type DoMarkOrderFormAsSyncedResponseData,
  doGetUnprocessedOrderFormsEndpoint,
  doMarkOrderFormAsSyncedEndpoint
} from 'sunrise-cms-shared'

import { DEBUG_ENABLE_NAMESPACES, DEBUG_NAMESPACE } from '../../debug.config.js'

import { getEndpointUrl } from './api.helpers.js'
import recordOrderForm from './database/recordOrderForm.js'
import updateOrderFormSyncMillis from './database/updateOrderFormSyncMillis.js'

if (process.env.NODE_ENV === 'development') {
  Debug.enable(DEBUG_ENABLE_NAMESPACES)
}

const taskName = 'Get Unprocessed Order Forms From Portal Task'

const debug = Debug(`${DEBUG_NAMESPACE}:tasks:${camelcase(taskName)}`)

// eslint-disable-next-line unicorn/no-non-function-verb-prefix
const getFormsEndpointUrl = getEndpointUrl(doGetUnprocessedOrderFormsEndpoint)

const updateFormEndpointUrl = getEndpointUrl(doMarkOrderFormAsSyncedEndpoint)

let isRunning = false

async function getUnprocessedOrderForms(): Promise<void> {
  debug('Starting to get unprocessed order forms from portal')

  try {
    const orderFormsResponse = await fetch(getFormsEndpointUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })

    debug('Response received', orderFormsResponse)

    if (!orderFormsResponse.ok && orderFormsResponse.status !== 403) {
      throw new Error(
        `Failed to get unprocessed order forms with status ${orderFormsResponse.status}`
      )
    }

    const result =
      (await orderFormsResponse.json()) as ApiResponse<DoGetUnprocessedOrderFormsResponseData>

    debug('Unprocessed order forms retrieved', result)

    if (!result.success) {
      throw new Error(`Failed to get unprocessed order forms: ${result.error}`)
    }

    // Process the unprocessed order forms
    const unprocessedOrderForms = result.data.orderForms

    debug('Processing unprocessed order forms', unprocessedOrderForms)

    for (const orderForm of unprocessedOrderForms) {
      debug('Processing order form', orderForm)

      recordOrderForm(orderForm)

      // eslint-disable-next-line no-await-in-loop
      const updateFormResponse = await fetch(updateFormEndpointUrl, {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',

        body: JSON.stringify({
          orderFormId: orderForm.orderFormId
        } satisfies DoMarkOrderFormAsSyncedRequest)
      })

      debug('Update form response received', updateFormResponse)

      if (!updateFormResponse.ok && updateFormResponse.status !== 403) {
        throw new Error(
          `Failed to update order form with status ${updateFormResponse.status}`
        )
      }

      const updateFormResult =
        (await updateFormResponse.json()) as ApiResponse<DoMarkOrderFormAsSyncedResponseData>

      debug('Update form result', updateFormResult)

      if (!updateFormResult.success) {
        throw new Error(
          `Failed to update order form: ${updateFormResult.error}`
        )
      }

      updateOrderFormSyncMillis(
        orderForm.orderFormKey,
        updateFormResult.data.recordSync_timeMillis
      )
    }
  } catch (error) {
    debug('Error occurred while getting unprocessed order forms', error)
  }
}

await getUnprocessedOrderForms()

const intervalId = setInterval(() => {
  if (isRunning) {
    return
  }

  isRunning = true

  try {
    void getUnprocessedOrderForms()
  } finally {
    isRunning = false
  }
}, minutesToMillis(3))

exitHook(() => {
  clearInterval(intervalId)
})
