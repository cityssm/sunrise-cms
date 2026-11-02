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
import getBurialSites from '../../database/getBurialSites.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'
import { getCachedCemeteries } from '../../helpers/cache/cemeteries.cache.js'
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js'
import { getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js'
import { getCachedIntermentContainerTypes } from '../../helpers/cache/intermentContainerTypes.cache.js'
import { getCachedIntermentDepths } from '../../helpers/cache/intermentDepths.cache.js'
import {
  getCachedServiceTypeById,
  getCachedServiceTypes
} from '../../helpers/cache/serviceTypes.cache.js'
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
      const orderFormBurialSiteName =
        typeof orderFormData.burialSiteName === 'string'
          ? orderFormData.burialSiteName.trim()
          : ''
      const orderFormCemeteryName =
        typeof orderFormData.cemeteryIdText === 'string'
          ? orderFormData.cemeteryIdText.trim()
          : ''

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
      contract.contractTypeId =
        orderFormData.contractTypeId === undefined || orderFormData.contractTypeId === ''
          ? 0
          : Number(orderFormData.contractTypeId)
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

      const exactBurialSiteNameMatch =
        orderFormBurialSiteName !== '' &&
        orderFormBurialSiteName === contract.burialSiteName
      const preciseBurialSiteCandidate =
        orderFormBurialSiteName !== '' &&
        !exactBurialSiteNameMatch &&
        contract.burialSiteName !== undefined &&
        contract.burialSiteName !== ''
          ? contract.burialSiteName
          : undefined

      if (queryBurialSiteId === undefined && contract.burialSiteId === undefined) {
        const matchingBurialSite =
          orderFormBurialSiteName === ''
            ? undefined
            : getBurialSites(
                { burialSiteName: orderFormBurialSiteName },
                { limit: 1, offset: 0 },
                database
              ).burialSites.find(
                (burialSite) =>
                  burialSite.burialSiteName.trim().toLowerCase() ===
                  orderFormBurialSiteName.toLowerCase()
              )

        if (matchingBurialSite !== undefined) {
          contract.burialSiteId = matchingBurialSite.burialSiteId
          contract.burialSiteName = matchingBurialSite.burialSiteName
          contract.cemeteryId = matchingBurialSite.cemeteryId ?? contract.cemeteryId
          contract.cemeteryName =
            matchingBurialSite.cemeteryName ?? contract.cemeteryName
        }
      }

      contract.burialSiteName =
        contract.burialSiteName ??
        (orderFormBurialSiteName === '' ? undefined : orderFormBurialSiteName)

      contract.burialSiteId ??=
        queryBurialSiteId === undefined ? undefined : Number(queryBurialSiteId)

      const sourceOrderFormBurialSiteInfo =
        queryBurialSiteId === undefined &&
        contract.burialSiteId === undefined &&
        (orderFormCemeteryName !== '' || orderFormBurialSiteName !== '')
          ? [orderFormCemeteryName, orderFormBurialSiteName]
              .filter((value) => value && value.trim() !== '')
              .join(': ')
          : undefined

      if (matchingBurialSite === undefined && sourceOrderFormBurialSiteInfo !== undefined) {
        contract.burialSiteName = contract.burialSiteName ?? undefined
      }

      const serviceTypeIds: number[] = []
      for (const [key, value] of Object.entries(orderFormData)) {
        if (key.startsWith('serviceTypeId-') && value === 'true') {
          const id = Number(key.replace('serviceTypeId-', ''))
          if (!Number.isNaN(id)) {
            serviceTypeIds.push(id)
          }
        }
      }
      if (serviceTypeIds.length > 0) {
        contract.contractServiceTypes = serviceTypeIds
          .map((serviceTypeId) => {
            const serviceType = getCachedServiceTypeById(serviceTypeId)
            return {
              serviceTypeId,
              serviceType: serviceType?.serviceType ?? '',
              isAvailableOnPortal: serviceType?.isAvailableOnPortal ?? false,
              contractServiceDetails: ''
            }
          })
          .filter((serviceType) => serviceType.serviceTypeId > 0)
      }

      if (
        typeof orderFormData.comment === 'string' &&
        orderFormData.comment.trim() !== ''
      ) {
        contract.comment = orderFormData.comment.trim()
        contract.contractComments = [
          {
            contractCommentId: 0,
            comment: orderFormData.comment.trim(),
            commentDate: Number(dateToInteger(new Date())),
            commentDateString: dateToString(new Date()),
            commentTime: 0,
            commentTimePeriodString: 'AM',
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
    const serviceTypes = getCachedServiceTypes()

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

    const sourceOrderFormServiceTypeIds: number[] =
      sourceOrderForm === undefined
        ? []
        : Object.entries(sourceOrderForm.orderFormData)
            .filter(
              ([key, value]) => key.startsWith('serviceTypeId-') && value === 'true'
            )
            .map(([key]) => Number(key.replace('serviceTypeId-', '')))
            .filter((serviceTypeId) => !Number.isNaN(serviceTypeId))

    response.render('contracts/edit', {
      headTitle: i18next.t('contracts.createNewContract', {
        lng: response.locals.lng
      }),

      contract,
      sourceOrderForm,
      sourceOrderFormServiceTypeIds,

      committalTypes,
      contractTypes,
      funeralHomes,
      intermentContainerTypes,
      intermentDepths,
      serviceTypes,

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
