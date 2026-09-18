import sqlite from 'better-sqlite3'
import type {
  DoDataSyncRequest,
  PortalBurialSiteType,
  PortalCemetery,
  PortalCommittalType,
  PortalContractType,
  PortalFuneralHome,
  PortalIntermentContainerType,
  PortalIntermentDepth,
  PortalServiceType
} from 'sunrise-cms-shared'

import { sunriseDB } from '../../../helpers/database.helpers.js'

export default function getSyncData(): DoDataSyncRequest {
  const database = sqlite(sunriseDB, { readonly: true })

  const burialSiteTypes = database
    .prepare(/* sql */ `
      SELECT
        burialSiteTypeId,
        burialSiteType
      FROM
        BurialSiteTypes
      WHERE
        recordDelete_timeMillis IS NULL
        AND isAvailableOnPortal = 1
      ORDER BY
        orderNumber,
        burialSiteType
    `)
    .all() as PortalBurialSiteType[]

  const cemeteries = database
    .prepare(/* sql */ `
      SELECT
        cemeteryId,
        cemeteryKey,
        cemeteryName,
        cemeteryAddress1,
        cemeteryAddress2,
        cemeteryCity,
        cemeteryPostalCode,
        cemeteryProvince
      FROM
        Cemeteries
      WHERE
        recordDelete_timeMillis IS NULL
        AND isAvailableOnPortal = 1
      ORDER BY
        cemeteryName
    `)
    .all() as PortalCemetery[]

  const committalTypes = database
    .prepare(/* sql */ `
      SELECT
        committalTypeId,
        committalType
      FROM
        CommittalTypes
      WHERE
        recordDelete_timeMillis IS NULL
        AND isAvailableOnPortal = 1
      ORDER BY
        orderNumber,
        committalType
    `)
    .all() as PortalCommittalType[]

  const contractTypes = database
    .prepare(/* sql */ `
      SELECT
        contractTypeId,
        contractType,
        isPreneed
      FROM
        ContractTypes
      WHERE
        recordDelete_timeMillis IS NULL
        AND isAvailableOnPortal = 1
      ORDER BY
        orderNumber,
        contractType
    `)
    .all() as PortalContractType[]

  const funeralHomes = database
    .prepare(/* sql */ `
      SELECT
        funeralHomeId,
        funeralHomeName,
        funeralHomeAddress1,
        funeralHomeAddress2,
        funeralHomeCity,
        funeralHomePostalCode,
        funeralHomeProvince,
        funeralHomePhoneNumber
      FROM
        FuneralHomes
      WHERE
        recordDelete_timeMillis IS NULL
        AND isAvailableOnPortal = 1
      ORDER BY
        funeralHomeName
    `)
    .all() as PortalFuneralHome[]

  const intermentContainerTypes = database
    .prepare(/* sql */ `
      SELECT
        intermentContainerTypeId,
        intermentContainerType
      FROM
        IntermentContainerTypes
      WHERE
        recordDelete_timeMillis IS NULL
        AND isAvailableOnPortal = 1
      ORDER BY
        orderNumber,
        intermentContainerType
    `)
    .all() as PortalIntermentContainerType[]

  const intermentDepths = database
    .prepare(/* sql */ `
      SELECT
        intermentDepthId,
        intermentDepth
      FROM
        IntermentDepths
      WHERE
        recordDelete_timeMillis IS NULL
        AND isAvailableOnPortal = 1
      ORDER BY
        orderNumber,
        intermentDepth
    `)
    .all() as PortalIntermentDepth[]

  const serviceTypes = database
    .prepare(/* sql */ `
      SELECT
        serviceTypeId,
        serviceType
      FROM
        ServiceTypes
      WHERE
        recordDelete_timeMillis IS NULL
        AND isAvailableOnPortal = 1
      ORDER BY
        orderNumber,
        serviceType
    `)
    .all() as PortalServiceType[]

  database.close()

  return {
    burialSiteTypes,
    cemeteries,
    committalTypes,
    contractTypes,
    funeralHomes,
    intermentContainerTypes,
    intermentDepths,
    serviceTypes
  }
}
