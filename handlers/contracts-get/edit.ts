import sqlite from 'better-sqlite3'
import Debug from 'debug'
import type { Request, Response } from 'express'

import getBurialSiteDirectionsOfArrival, {
  defaultDirectionsOfArrival
} from '../../database/getBurialSiteDirectionsOfArrival.js'
import getCemeteries from '../../database/getCemeteries.js'
import getContract from '../../database/getContract.js'
import getFuneralDirectorNamesByFuneralHomeId from '../../database/getFuneralDirectorNamesByFuneralHomeId.js'
import getFuneralHomes from '../../database/getFuneralHomes.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js'
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js'
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js'
import {
  getCachedContractTypePrintsById,
  getCachedContractTypes
} from '../../helpers/cache/contractTypes.cache.js'
import { getCachedIntermentContainerTypes } from '../../helpers/cache/intermentContainerTypes.cache.js'
import { getCachedServiceTypes } from '../../helpers/cache/serviceTypes.cache.js'
import { getCachedWorkOrderMilestoneTypes } from '../../helpers/cache/workOrderMilestoneTypes.cache.js'
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { sunriseDB } from '../../helpers/database.helpers.js'
import { userCanUpdateWorkOrders } from '../../helpers/user.helpers.js'
import { userHasConsignoCloudAccess } from '../../integrations/consignoCloud/helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:handlers:contracts:edit`)

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  let database: sqlite.Database | undefined

  try {
    database = sqlite(sunriseDB, { readonly: true })

    const contract = await getContract(request.params.contractId, database)

    if (contract === undefined) {
      response.redirect(
        `${getConfigProperty(
          'reverseProxy.urlPrefix'
        )}/contracts/?error=contractIdNotFound`
      )
      return
    }

    const contractTypePrints = getCachedContractTypePrintsById(
      contract.contractTypeId
    )

    const consignoCloudAccess = userHasConsignoCloudAccess(request.session.user)

    /*
     * Contract Drop Lists
     */

    const contractTypes = getCachedContractTypes()
    const funeralHomes = getFuneralHomes(database)
    const committalTypes = getCachedCommittalTypes()
    const intermentContainerTypes = getCachedIntermentContainerTypes()
    const serviceTypes = getCachedServiceTypes()

    /*
     * Burial Site Drop Lists
     */

    const burialSiteStatuses = getCachedBurialSiteStatuses()
    const burialSiteTypes = getCachedBurialSiteTypes()
    const cemeteries = getCemeteries(undefined, database)

    const burialSiteDirectionsOfArrival =
      contract.burialSiteId === undefined || contract.burialSiteId === null
        ? defaultDirectionsOfArrival
        : getBurialSiteDirectionsOfArrival(contract.burialSiteId, database)

    /*
     * Funeral Director Suggestions
     */

    const funeralDirectorNames =
      contract.funeralHomeId === null
        ? []
        : getFuneralDirectorNamesByFuneralHomeId(
            contract.funeralHomeId,
            database
          )

    /*
     * Work Order Drop Lists
     */

    const canUpdateWorkOrders = userCanUpdateWorkOrders(request)

    const workOrderTypes = canUpdateWorkOrders ? getCachedWorkOrderTypes() : []
    const workOrderMilestoneTypes = canUpdateWorkOrders
      ? getCachedWorkOrderMilestoneTypes()
      : []

    response.render('contracts/edit', {
      headTitle: 'Contract Update',

      contract,

      contractTypePrints,
      userHasConsignoCloudAccess: consignoCloudAccess,

      committalTypes,
      contractTypes,
      funeralHomes,
      intermentContainerTypes,
      serviceTypes,

      burialSiteStatuses,
      burialSiteTypes,
      cemeteries,

      burialSiteDirectionsOfArrival,

      funeralDirectorNames,

      workOrderMilestoneTypes,
      workOrderTypes,

      isCreate: false
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
