import type { DatabaseSync } from 'node:sqlite'

import { dateToInteger, dateToString } from '@cityssm/utils-datetime'
import Debug from 'debug'
import type { Request, Response } from 'express'

import getBurialSite from '../../database/getBurialSite.js'
import getBurialSiteDirectionsOfArrival, {
  defaultDirectionsOfArrival
} from '../../database/getBurialSiteDirectionsOfArrival.js'
import getFuneralHomes from '../../database/getFuneralHomes.js'
import getOrderForm from '../../database/getOrderForm.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'
import { getCachedCemeteries } from '../../helpers/cache/cemeteries.cache.js'
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js'
import { getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js'
import { getCachedIntermentContainerTypes } from '../../helpers/cache/intermentContainerTypes.cache.js'
import { getCachedIntermentDepths } from '../../helpers/cache/intermentDepths.cache.js'
import { getCachedSettingValue } from '../../helpers/cache/settings.cache.js'
import { getDatabaseConnection } from '../../helpers/database.helpers.js'
import { i18next } from '../../helpers/i18n.helpers.js'
import type { Contract } from '../../types/record.types.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:contracts:new`)

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  let database: DatabaseSync | undefined

  try {
    database = getDatabaseConnection()

    const startDate = new Date()

    const contract: Partial<Contract> = {
      isPreneed: false,

      contractStartDate: dateToInteger(startDate),
      contractStartDateString: dateToString(startDate),
      purchaserCity: getCachedSettingValue('defaults.city'),
      purchaserProvince: getCachedSettingValue('defaults.province')
    }

    if (request.query.burialSiteId !== undefined) {
      const burialSite = await getBurialSite(
        request.query.burialSiteId as string,
        false,
        database
      )

      if (burialSite !== undefined) {
        contract.burialSiteId = burialSite.burialSiteId
        contract.burialSiteName = burialSite.burialSiteName
        contract.cemeteryId = burialSite.cemeteryId ?? undefined
        contract.cemeteryName = burialSite.cemeteryName ?? ''
      }
    }

    const sourceOrderFormId =
      typeof request.query.orderFormId === 'string'
        ? request.query.orderFormId
        : undefined
    const sourceOrderForm =
      sourceOrderFormId === undefined
        ? undefined
        : getOrderForm(sourceOrderFormId)

    if (sourceOrderForm !== undefined) {
      const orderFormData = sourceOrderForm.orderFormData
      const funeralHomeIdValue = orderFormData.funeralHomeId
      const cemeteryIdValue = orderFormData.cemeteryId
      const committalTypeIdValue = orderFormData.committalTypeId
      const queryBurialSiteId = request.query.burialSiteId

      contract.purchaserName =
        orderFormData.purchaserName ?? contract.purchaserName
      contract.purchaserAddress1 = orderFormData.purchaserAddress1 ?? ''
      contract.purchaserAddress2 = orderFormData.purchaserAddress2 ?? ''
      contract.purchaserCity = orderFormData.purchaserCity ?? ''
      contract.purchaserPostalCode = orderFormData.purchaserPostalCode ?? ''
      contract.purchaserProvince = orderFormData.purchaserProvince ?? ''
      contract.purchaserEmail = orderFormData.purchaserEmail ?? ''
      contract.purchaserPhoneNumber = orderFormData.purchaserPhoneNumber ?? ''
      contract.purchaserRelationship = orderFormData.purchaserRelationship ?? ''
      contract.contractTypeId = Number(orderFormData.contractTypeId ?? 0)
      contract.contractType =
        orderFormData.contractTypeIdText ?? contract.contractType ?? ''
      contract.funeralHomeId =
        funeralHomeIdValue === undefined || funeralHomeIdValue === ''
          ? undefined
          : Number(funeralHomeIdValue)
      contract.funeralHomeName =
        orderFormData.funeralHomeIdText ?? contract.funeralHomeName

      contract.cemeteryId =
        cemeteryIdValue === undefined || cemeteryIdValue === ''
          ? undefined
          : Number(cemeteryIdValue)

      contract.cemeteryName =
        orderFormData.cemeteryIdText ?? contract.cemeteryName
      contract.funeralDateString = orderFormData.funeralDateString ?? ''

      contract.funeralTimeString =
        orderFormData.funeralTimeString === undefined ||
        orderFormData.funeralTimeString === ''
          ? undefined
          : orderFormData.funeralTimeString

      contract.directionOfArrival = orderFormData.directionOfArrival ?? ''
      contract.directionOfArrivalDescription =
        orderFormData.directionOfArrivalText ?? ''
      contract.committalTypeId =
        committalTypeIdValue === undefined || committalTypeIdValue === ''
          ? undefined
          : Number(committalTypeIdValue)
      contract.contractStartDateString =
        orderFormData.funeralDateString ?? contract.contractStartDateString
      contract.contractEndDateString = ''

      contract.burialSiteName =
        orderFormData.burialSiteName ?? contract.burialSiteName

      contract.burialSiteId ??=
        queryBurialSiteId === undefined ? undefined : Number(queryBurialSiteId)

      if (
        typeof orderFormData.comment === 'string' &&
        orderFormData.comment.trim() !== ''
      ) {
        contract.comment = orderFormData.comment.trim()
        contract.contractComments = [
          {
            comment: orderFormData.comment,
            commentDateString: dateToString(new Date()),
            commentTimeString: '00:00',
            recordCreate_username: 'portal'
          }
        ]
      }
      contract.sourceOrderFormId = sourceOrderForm.orderFormId
    }

    /*
     * Contract Drop Lists
     */

    const contractTypes = getCachedContractTypes()
    const funeralHomes = getFuneralHomes(false, database)
    const committalTypes = getCachedCommittalTypes()
    const intermentContainerTypes = getCachedIntermentContainerTypes()
    const intermentDepths = getCachedIntermentDepths()

    /*
     * Burial Site Drop Lists
     */

    const burialSiteStatuses = getCachedBurialSiteStatuses()
    const burialSiteTypes = getCachedBurialSiteTypes()
    const cemeteries = getCachedCemeteries()

    const burialSiteDirectionsOfArrival =
      contract.burialSiteId === undefined || contract.burialSiteId === null
        ? defaultDirectionsOfArrival
        : getBurialSiteDirectionsOfArrival(contract.burialSiteId, database)

    response.render('contracts/edit', {
      headTitle: i18next.t('contracts.createNewContract', {
        lng: response.locals.lng
      }),

      contract,

      committalTypes,
      contractTypes,
      funeralHomes,
      intermentContainerTypes,
      intermentDepths,

      burialSiteStatuses,
      burialSiteTypes,
      cemeteries,

      burialSiteDirectionsOfArrival,

      funeralDirectorNames: [],

      isCreate: true
    })
  } catch (error) {
    debug(error)
    response
      .status(500)
      .json({ errorMessage: 'Database error', success: false })
  } finally {
    database?.close()
  }
}
