/* eslint-disable max-lines */

import type { DatabaseSync } from 'node:sqlite'
import { debuglog } from 'node:util'

import { millisecondsInOneDay } from '@cityssm/to-millis'
import { dateToInteger, dateToString } from '@cityssm/utils-datetime'
import type { Request, Response } from 'express'
import type { OrderFormData } from 'sunrise-cms-shared'

import getBurialSite from '../../database/getBurialSite.js'
import getBurialSiteDirectionsOfArrival, {
  defaultDirectionsOfArrival
} from '../../database/getBurialSiteDirectionsOfArrival.js'
import getBurialSites from '../../database/getBurialSites.js'
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
import {
  getCachedServiceTypeById,
  getCachedServiceTypes
} from '../../helpers/cache/serviceTypes.cache.js'
import { getCachedSettingValue } from '../../helpers/cache/settings.cache.js'
import { getDatabaseConnection } from '../../helpers/database.helpers.js'
import { i18next } from '../../helpers/i18n.helpers.js'
import type { Contract } from '../../types/record.types.js'

const debug = debuglog(`${DEBUG_NAMESPACE}:handlers:contracts:new`)

function getOrderFormDateParts(orderFormData: OrderFormData): {
  birthDay?: string
  birthMonth?: string
  birthYear?: string
  deathDay?: string
  deathMonth?: string
  deathYear?: string
} {
  const birthDatePieces = orderFormData.birthDateString?.split('-') ?? []
  const deathDatePieces = orderFormData.deathDateString?.split('-') ?? []

  const returnDates: Record<string, string | undefined> = {}

  if (birthDatePieces.length === 3) {
    returnDates.birthYear = birthDatePieces[0]
    returnDates.birthMonth = birthDatePieces[1]
    returnDates.birthDay = birthDatePieces[2]
  }

  if (deathDatePieces.length === 3) {
    returnDates.deathYear = deathDatePieces[0]
    returnDates.deathMonth = deathDatePieces[1]
    returnDates.deathDay = deathDatePieces[2]
  }

  return returnDates
}

export function calculateDeathAgeFromDates(
  orderFormData: Record<string, unknown>
): {
  deathAge: number | string
  deathAgePeriod: string
} {
  const { birthDay, birthMonth, birthYear, deathDay, deathMonth, deathYear } =
    getOrderFormDateParts(orderFormData as OrderFormData)

  const birthYearNumber = Number(birthYear)
  const birthMonthNumber = Number(birthMonth)
  const birthDayNumber = Number(birthDay)
  const deathYearNumber = Number(deathYear)
  const deathMonthNumber = Number(deathMonth)
  const deathDayNumber = Number(deathDay)

  if (
    !Number.isFinite(birthYearNumber) ||
    birthYearNumber <= 0 ||
    !Number.isFinite(deathYearNumber) ||
    deathYearNumber <= 0
  ) {
    const fallbackAge = orderFormData.deathAge
    const fallbackPeriod = orderFormData.deathAgePeriod

    return {
      deathAge:
        typeof fallbackAge === 'number' || typeof fallbackAge === 'string'
          ? fallbackAge
          : '',
      deathAgePeriod: typeof fallbackPeriod === 'string' ? fallbackPeriod : ''
    }
  }

  const hasFullBirthDate =
    Number.isFinite(birthMonthNumber) &&
    Number.isFinite(birthDayNumber) &&
    birthMonthNumber >= 1 &&
    birthMonthNumber <= 12 &&
    birthDayNumber >= 1 &&
    birthDayNumber <= 31

  const hasFullDeathDate =
    Number.isFinite(deathMonthNumber) &&
    Number.isFinite(deathDayNumber) &&
    deathMonthNumber >= 1 &&
    deathMonthNumber <= 12 &&
    deathDayNumber >= 1 &&
    deathDayNumber <= 31

  if (hasFullBirthDate && hasFullDeathDate) {
    const birthDate = new Date(
      birthYearNumber,
      birthMonthNumber - 1,
      birthDayNumber
    )
    const deathDate = new Date(
      deathYearNumber,
      deathMonthNumber - 1,
      deathDayNumber
    )
    const ageInDays = Math.floor(
      (deathDate.getTime() - birthDate.getTime()) / millisecondsInOneDay
    )

    if (ageInDays <= 0) {
      return { deathAge: 0, deathAgePeriod: 'Stillborn' }
    }

    const ageInYears = Math.floor(ageInDays / 365.25)

    return ageInYears === 0
      ? { deathAge: ageInDays, deathAgePeriod: 'Days' }
      : { deathAge: ageInYears, deathAgePeriod: 'Years' }
  }

  return {
    deathAge: Math.max(0, deathYearNumber - birthYearNumber),
    deathAgePeriod: 'Years'
  }
}

export function getOrderFormServiceTypeIds(
  orderFormData: Record<string, unknown>
): number[] {
  return Object.entries(orderFormData)
    .filter(
      ([key, value]) =>
        key.startsWith('serviceTypeId-') &&
        (value === 'true' || value === true)
    )
    .map(([key]) => Number(key.replace('serviceTypeId-', '')))
    .filter((serviceTypeId) => !Number.isNaN(serviceTypeId))
}

function applySourceOrderFormToContract({
  contract,
  sourceOrderForm,
  queryBurialSiteId,
  database
}: {
  contract: Partial<Contract>
  sourceOrderForm: ReturnType<typeof getOrderForm>
  queryBurialSiteId: string | string[] | undefined
  database: DatabaseSync
}): {
  sourceOrderFormBurialSiteInfo?: { cemetery: string; burialSite: string }
} {
  if (sourceOrderForm === undefined) {
    return {}
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderFormData = sourceOrderForm.orderFormData as Record<string, any>

  const funeralHomeIdValue = orderFormData.funeralHomeId
  const cemeteryIdValue = orderFormData.cemeteryId
  const committalTypeIdValue = orderFormData.committalTypeId
  const orderFormBurialSiteName =
    typeof orderFormData.burialSiteName === 'string'
      ? orderFormData.burialSiteName.trim()
      : ''
  const orderFormCemeteryName =
    typeof orderFormData.cemeteryIdText === 'string'
      ? orderFormData.cemeteryIdText.trim()
      : ''

  contract.purchaserName = orderFormData.purchaserName ?? contract.purchaserName
  contract.purchaserAddress1 = orderFormData.purchaserAddress1 ?? ''
  contract.purchaserAddress2 = orderFormData.purchaserAddress2 ?? ''
  contract.purchaserCity = orderFormData.purchaserCity ?? ''
  contract.purchaserPostalCode = orderFormData.purchaserPostalCode ?? ''
  contract.purchaserProvince = orderFormData.purchaserProvince ?? ''
  contract.purchaserEmail = orderFormData.purchaserEmail ?? ''
  contract.purchaserPhoneNumber = orderFormData.purchaserPhoneNumber ?? ''
  contract.purchaserRelationship = orderFormData.purchaserRelationship ?? ''

  const isDeceasedSameAsPurchaser =
    orderFormData.deceasedSameAsPurchaser === true ||
    orderFormData.deceasedSameAsPurchaser === 'true'

  const orderFormDeceasedName =
    typeof orderFormData.deceasedName === 'string'
      ? orderFormData.deceasedName
      : ''
  const orderFormDeceasedAddress1 =
    typeof orderFormData.deceasedAddress1 === 'string'
      ? orderFormData.deceasedAddress1
      : ''
  const orderFormDeceasedAddress2 =
    typeof orderFormData.deceasedAddress2 === 'string'
      ? orderFormData.deceasedAddress2
      : ''
  const orderFormDeceasedCity =
    typeof orderFormData.deceasedCity === 'string'
      ? orderFormData.deceasedCity
      : ''
  const orderFormDeceasedPostalCode =
    typeof orderFormData.deceasedPostalCode === 'string'
      ? orderFormData.deceasedPostalCode
      : ''
  const orderFormDeceasedProvince =
    typeof orderFormData.deceasedProvince === 'string'
      ? orderFormData.deceasedProvince
      : ''

  contract.deceasedName = isDeceasedSameAsPurchaser
    ? (orderFormData.purchaserName ?? '')
    : orderFormDeceasedName

  contract.deceasedAddress1 = isDeceasedSameAsPurchaser
    ? (orderFormData.purchaserAddress1 ?? '')
    : orderFormDeceasedAddress1

  contract.deceasedAddress2 = isDeceasedSameAsPurchaser
    ? (orderFormData.purchaserAddress2 ?? '')
    : orderFormDeceasedAddress2

  contract.deceasedCity = isDeceasedSameAsPurchaser
    ? (orderFormData.purchaserCity ?? '')
    : orderFormDeceasedCity

  contract.deceasedPostalCode = isDeceasedSameAsPurchaser
    ? (orderFormData.purchaserPostalCode ?? '')
    : orderFormDeceasedPostalCode

  contract.deceasedProvince = isDeceasedSameAsPurchaser
    ? (orderFormData.purchaserProvince ?? '')
    : orderFormDeceasedProvince

  contract.contractTypeId =
    orderFormData.contractTypeId === undefined ||
    orderFormData.contractTypeId === ''
      ? 0
      : Number(orderFormData.contractTypeId)

  contract.contractType =
    orderFormData.contractTypeIdText ?? contract.contractType ?? ''

  contract.funeralHomeId =
    funeralHomeIdValue === undefined || funeralHomeIdValue === ''
      ? undefined
      : Number(funeralHomeIdValue)

  contract.funeralHomeName =
    (typeof orderFormData.funeralHomeName === 'string'
      ? orderFormData.funeralHomeName
      : undefined) ??
    (typeof orderFormData.funeralHomeIdText === 'string'
      ? orderFormData.funeralHomeIdText
      : undefined) ??
    contract.funeralHomeName

  contract.funeralHomeAddress1 =
    typeof orderFormData.funeralHomeAddress1 === 'string'
      ? orderFormData.funeralHomeAddress1
      : (contract.funeralHomeAddress1 ?? '')
  contract.funeralHomeAddress2 =
    typeof orderFormData.funeralHomeAddress2 === 'string'
      ? orderFormData.funeralHomeAddress2
      : (contract.funeralHomeAddress2 ?? '')
  contract.funeralHomeCity =
    typeof orderFormData.funeralHomeCity === 'string'
      ? orderFormData.funeralHomeCity
      : (contract.funeralHomeCity ?? '')
  contract.funeralHomePostalCode =
    typeof orderFormData.funeralHomePostalCode === 'string'
      ? orderFormData.funeralHomePostalCode
      : (contract.funeralHomePostalCode ?? '')
  contract.funeralHomeProvince =
    typeof orderFormData.funeralHomeProvince === 'string'
      ? orderFormData.funeralHomeProvince
      : (contract.funeralHomeProvince ?? '')

  contract.funeralDirectorName =
    typeof orderFormData.funeralDirectorName === 'string'
      ? orderFormData.funeralDirectorName
      : (contract.funeralDirectorName ?? '')

  contract.cemeteryId =
    cemeteryIdValue === undefined || cemeteryIdValue === ''
      ? undefined
      : Number(cemeteryIdValue)

  contract.cemeteryName = orderFormData.cemeteryIdText ?? contract.cemeteryName
  contract.funeralDateString = orderFormData.funeralDateString ?? ''

  const dateParts = getOrderFormDateParts(orderFormData as OrderFormData)

  contract.birthYear = dateParts.birthYear ?? ''
  contract.birthMonth = dateParts.birthMonth ?? ''
  contract.birthDay = dateParts.birthDay ?? ''
  contract.birthPlace = orderFormData.birthPlace ?? ''

  contract.deathYear = dateParts.deathYear ?? ''
  contract.deathMonth = dateParts.deathMonth ?? ''
  contract.deathDay = dateParts.deathDay ?? ''

  contract.deathAge = orderFormData.deathAge ?? ''
  contract.deathAgePeriod = orderFormData.deathAgePeriod ?? ''

  contract.deathPlace = orderFormData.deathPlace ?? ''
  contract.intermentDepthId =
    orderFormData.intermentDepthId === undefined ||
    orderFormData.intermentDepthId === ''
      ? undefined
      : Number(orderFormData.intermentDepthId)
  contract.intermentDepth =
    orderFormData.intermentDepthIdText ?? contract.intermentDepth ?? ''
  contract.intermentContainerTypeId =
    orderFormData.intermentContainerTypeId === undefined ||
    orderFormData.intermentContainerTypeId === ''
      ? undefined
      : Number(orderFormData.intermentContainerTypeId)
  contract.intermentContainerType =
    orderFormData.intermentContainerTypeIdText ??
    contract.intermentContainerType ??
    ''

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
  contract.committalType =
    (typeof orderFormData.committalTypeIdText === 'string'
      ? orderFormData.committalTypeIdText
      : undefined) ??
    contract.committalType ??
    ''
  contract.contractStartDateString =
    orderFormData.funeralDateString ?? contract.contractStartDateString
  contract.contractEndDateString = ''

  if (
    typeof orderFormData.deathAge === 'string' &&
    orderFormData.deathAge !== ''
  ) {
    const deathAge = Number(orderFormData.deathAge)
    if (!Number.isNaN(deathAge)) {
      contract.deathAge = deathAge
    }
  }

  const calculatedAge = calculateDeathAgeFromDates(orderFormData)
  if (calculatedAge.deathAge !== '' && calculatedAge.deathAgePeriod !== '') {
    contract.deathAge = calculatedAge.deathAge
    contract.deathAgePeriod = calculatedAge.deathAgePeriod
  }

  let matchingBurialSite:
    | {
        burialSiteId: number
        burialSiteName: string
        cemeteryId?: number | null
        cemeteryName?: string | null
      }
    | undefined

  if (queryBurialSiteId === undefined && orderFormBurialSiteName !== '') {
    matchingBurialSite = getBurialSites(
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

  contract.burialSiteId ??=
    queryBurialSiteId === undefined ? undefined : Number(queryBurialSiteId)

  const sourceOrderFormBurialSiteInfo =
    queryBurialSiteId === undefined &&
    matchingBurialSite === undefined &&
    (orderFormCemeteryName !== '' || orderFormBurialSiteName !== '')
      ? {
          cemetery: orderFormCemeteryName,
          burialSite: orderFormBurialSiteName
        }
      : undefined

  const serviceTypeIds = getOrderFormServiceTypeIds(orderFormData)

  if (serviceTypeIds.length > 0) {
    contract.contractServiceTypes = serviceTypeIds
      .map((serviceTypeId) => {
        const serviceTypeLabel = orderFormData[
          `serviceTypeIdText-${serviceTypeId}`
        ]
        const serviceType = getCachedServiceTypeById(serviceTypeId)

        return {
          serviceTypeId,
          serviceType:
            serviceType?.serviceType ??
            (typeof serviceTypeLabel === 'string' ? serviceTypeLabel : ''),
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
        commentDate: dateToInteger(new Date()),
        commentDateString: dateToString(new Date()),
        commentTime: 0,
        commentTimePeriodString: 'AM',
        commentTimeString: '00:00',
        recordCreate_username: 'portal'
      }
    ]
  }
  contract.sourceOrderFormId = sourceOrderForm.orderFormId

  return { sourceOrderFormBurialSiteInfo }
}

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

    const { sourceOrderFormBurialSiteInfo } =
      sourceOrderForm === undefined
        ? { sourceOrderFormBurialSiteInfo: undefined }
        : applySourceOrderFormToContract({
            contract,
            sourceOrderForm,
            queryBurialSiteId: request.query.burialSiteId as string,
            database
          })

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
        : getOrderFormServiceTypeIds(sourceOrderForm.orderFormData)

    response.render('contracts/edit', {
      headTitle: i18next.t('contracts.createNewContract', {
        lng: response.locals.lng
      }),

      contract,
      sourceOrderForm,
      sourceOrderFormBurialSiteInfo,
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
    debug(JSON.stringify(error, undefined, 2))

    response
      .status(500)
      .json({ errorMessage: 'Database error', success: false })
  } finally {
    database?.close()
  }
}
