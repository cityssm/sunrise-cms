import type { DatabaseSync } from 'node:sqlite'

import { getFuneralHomes } from '../database/getFuneralHomes.js'
import { getCachedCemeteries } from '../helpers/cache/cemeteries.cache.js'
import { getCachedCommittalTypes } from '../helpers/cache/committalTypes.cache.js'
import { getCachedContractTypeById } from '../helpers/cache/contractTypes.cache.js'
import { getCachedIntermentContainerTypes } from '../helpers/cache/intermentContainerTypes.cache.js'
import { getCachedIntermentDepths } from '../helpers/cache/intermentDepths.cache.js'
import { getDatabaseConnection } from '../helpers/database.helpers.js'
import type { OrderForm } from '../types/record.types.js'

export default function getOrderForm(
  orderFormId: number | string,
  connectedDatabase?: DatabaseSync
): OrderForm | undefined {
  const database = connectedDatabase ?? getDatabaseConnection(true)

  const row = database
    .prepare(/* sql */ `
      SELECT
        orderFormId,
        orderFormKey,
        orderFormData AS orderFormDataString,
        recordCreate_ipAddress,
        recordCreate_timeMillis,
        recordSync_timeMillis,
        isOrderFormProcessed
      FROM
        OrderForms
      WHERE
        orderFormId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .get(Number(orderFormId)) as
    | (Omit<OrderForm, 'orderFormData'> & { orderFormDataString: string })
    | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }

  if (row === undefined) {
    return undefined
  }

  return {
    ...row,
    orderFormData: JSON.parse(row.orderFormDataString) as OrderForm['orderFormData']
  }
}

export function getOrderFormMismatches(orderForm: OrderForm): Array<{
  label: string
  actualId: string | number | undefined
  actualText: string | undefined
}> {
  const mismatches: Array<{
    label: string
    actualId: string | number | undefined
    actualText: string | undefined
  }> = []

  const addMismatch = (
    key: string,
    actualId: string | number | undefined,
    actualText: string | undefined,
    liveText: string | undefined
  ): void => {
    if (actualId === undefined || actualId === '' || actualId === null) {
      return
    }

    const normalizedActualText = actualText?.trim() ?? ''
    const normalizedLiveText = liveText?.trim() ?? ''

    if (normalizedActualText === '') {
      mismatches.push({ label: key, actualId, actualText: normalizedActualText })
      return
    }

    if (normalizedActualText !== normalizedLiveText) {
      mismatches.push({ label: key, actualId, actualText: normalizedActualText })
    }
  }

  const orderFormData = orderForm.orderFormData

  const contractType = getCachedContractTypeById(
    Number(orderFormData.contractTypeId ?? 0)
  )
  if (contractType !== undefined) {
    addMismatch(
      'Contract Type',
      orderFormData.contractTypeId,
      orderFormData.contractTypeIdText,
      contractType.contractType
    )
  }

  const cemetery = getCachedCemeteries().find(
    (currentCemetery) => currentCemetery.cemeteryId === Number(orderFormData.cemeteryId ?? -1)
  )
  if (cemetery !== undefined) {
    addMismatch('Cemetery', orderFormData.cemeteryId, orderFormData.cemeteryIdText, cemetery.cemeteryName)
  }

  const funeralHomes = getFuneralHomes(false)
  const funeralHome = funeralHomes.find(
    (currentFuneralHome) =>
      currentFuneralHome.funeralHomeId === Number(orderFormData.funeralHomeId ?? -1)
  )
  if (funeralHome !== undefined) {
    addMismatch(
      'Funeral Home',
      orderFormData.funeralHomeId,
      orderFormData.funeralHomeIdText,
      funeralHome.funeralHomeName
    )
  }

  const intermentContainerType = getCachedIntermentContainerTypes().find(
    (currentType) =>
      currentType.intermentContainerTypeId ===
      Number(orderFormData.intermentContainerTypeId ?? -1)
  )
  if (intermentContainerType !== undefined) {
    addMismatch(
      'Container Type',
      orderFormData.intermentContainerTypeId,
      orderFormData.intermentContainerTypeIdText,
      intermentContainerType.intermentContainerType
    )
  }

  const intermentDepth = getCachedIntermentDepths().find(
    (currentDepth) => currentDepth.intermentDepthId === Number(orderFormData.intermentDepthId ?? -1)
  )
  if (intermentDepth !== undefined) {
    addMismatch('Depth', orderFormData.intermentDepthId, orderFormData.intermentDepthIdText, intermentDepth.intermentDepth)
  }

  const committalType = getCachedCommittalTypes().find(
    (currentType) => currentType.committalTypeId === Number(orderFormData.committalTypeId ?? -1)
  )
  if (committalType !== undefined) {
    addMismatch(
      'Committal Type',
      orderFormData.committalTypeId,
      orderFormData.committalTypeIdText,
      committalType.committalType
    )
  }

  return mismatches
}
