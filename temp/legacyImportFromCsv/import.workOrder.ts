/* cspell:disable */
/* eslint-disable complexity, max-lines, no-await-in-loop, no-console */

import fs from 'node:fs'

import { dateIntegerToString, dateToString } from '@cityssm/utils-datetime'
import papa from 'papaparse'

import addBurialSite from '../../database/addBurialSite.js'
import addContract, {
  type AddContractForm
} from '../../database/addContract.js'
import addContractServiceType from '../../database/addContractServiceType.js'
import addWorkOrder from '../../database/addWorkOrder.js'
import addWorkOrderBurialSite from '../../database/addWorkOrderBurialSite.js'
import addWorkOrderContract from '../../database/addWorkOrderContract.js'
import addWorkOrderMilestone from '../../database/addWorkOrderMilestone.js'
import closeWorkOrder from '../../database/closeWorkOrder.js'
import getBurialSite, {
  getBurialSiteByBurialSiteName
} from '../../database/getBurialSite.js'
import getContracts from '../../database/getContracts.js'
import getWorkOrder from '../../database/getWorkOrder.js'
import reopenWorkOrder from '../../database/reopenWorkOrder.js'
import { updateBurialSiteStatus } from '../../database/updateBurialSite.js'
import { buildBurialSiteName } from '../../helpers/burialSites.helpers.js'
import { getDatabaseConnection } from '../../helpers/database.helpers.js'
import type { BurialSite } from '../../types/record.types.js'

import {
  getBurialSiteTypeId,
  inGroundBurialSiteTypeId
} from './data.burialSiteTypes.js'
import { cremationCemeteryKeys, getCemeteryIdByKey } from './data.cemeteries.js'
import { getCommittalTypeIdByKey } from './data.committalTypes.js'
import { getDeathAgePeriod } from './data.deathAgePeriods.js'
import { getFuneralHomeIdByKey } from './data.funeralHomes.js'
import * as importIds from './data.ids.js'
import { getIntermentContainerTypeIdByKey } from './data.intermentContainerTypes.js'
import { getIntermentDepthIdByKey } from './data.intermentDepths.js'
import type { WorkOrderRecord } from './recordTypes.js'
import {
  formatContractNumber,
  formatDateString,
  formatTimeString,
  user
} from './utilities.js'

export function getWorkOrderTypeIdsForRow(
  workOrderRow: WorkOrderRecord
): number[] {
  const workOrderTypeIds = new Set<number>()

  if (workOrderRow.WO_CREMATION === 'Y') {
    workOrderTypeIds.add(importIds.cremationWorkOrderTypeId ?? 1)
  }

  if (
    workOrderRow.WO_CEMETERY !== '00' &&
    workOrderRow.WO_INTERMENT_YR !== '' &&
    workOrderRow.WO_INTERMENT_YR !== '0'
  ) {
    workOrderTypeIds.add(importIds.intermentWorkOrderTypeId ?? 0)
  }

  if (workOrderTypeIds.size === 0) {
    workOrderTypeIds.add(importIds.cremationWorkOrderTypeId ?? 1)
  }

  return [...workOrderTypeIds]
}

export function shouldAddFuneralMilestone(
  relatedContracts: Array<{
    funeralDate?: number | null
    funeralDateString?: string
    funeralDirectorName?: string | null
    funeralHomeId?: number | null
    funeralHomeName?: string | null
    funeralTime?: number | null
  }>
): boolean {
  return relatedContracts.every(
    (contract) =>
      !(
        (contract.funeralDate ?? 0) > 0 ||
        (contract.funeralDateString ?? '') !== '' ||
        (contract.funeralHomeId ?? 0) > 0 ||
        (contract.funeralHomeName ?? '') !== '' ||
        (contract.funeralDirectorName ?? '') !== '' ||
        (contract.funeralTime ?? 0) > 0
      )
  )
}

export async function getMatchingContractsForWorkOrderRow(
  workOrderRow: WorkOrderRecord,
  burialSite: BurialSite | undefined,
  database: Parameters<typeof getContracts>[2]
): Promise<Array<{ contractId: number }>> {
  const contractNumber = formatContractNumber(
    workOrderRow.WO_WORK_ORDER,
    '',
    workOrderRow.WO_INTERMENT
  )

  const matchedContracts = await getContracts(
    {
      contractNumber
    },
    {
      includeFees: false,
      includeInterments: false,
      includeTransactions: false,
      limit: -1,
      offset: 0
    },
    database
  )

  return matchedContracts.contracts
}

export default async function importFromWorkOrderCSV(): Promise<void> {
  console.time('importFromWorkOrderCSV')

  let workOrderRow: WorkOrderRecord | undefined

  const rawData = fs.readFileSync('./temp/CMWKORDR.csv').toString()

  const cmwkordr: papa.ParseResult<WorkOrderRecord> = papa.parse(rawData, {
    delimiter: ',',
    header: true,
    skipEmptyLines: true
  })

  for (const parseError of cmwkordr.errors) {
    console.log(parseError)
  }

  const currentDateString = dateToString(new Date())

  const database = getDatabaseConnection()
  database.exec('pragma journal_mode = WAL')

  try {
    for (workOrderRow of cmwkordr.data) {
      const workOrderNumber = `000000${workOrderRow.WO_WORK_ORDER}`.slice(-6)
      const workOrderTypeIds = getWorkOrderTypeIdsForRow(workOrderRow)

      for (const workOrderTypeId of workOrderTypeIds) {
        const isCremationWorkOrder =
          workOrderTypeId === (importIds.cremationWorkOrderTypeId ?? 1)

        const isIntermentWorkOrder =
          workOrderTypeId === (importIds.intermentWorkOrderTypeId ?? 0)

        const workOrderOpenDateString = dateIntegerToString(
          Math.trunc(Number(workOrderRow.WO_INITIATION_DATE))
        )

        const existingWorkOrder = database
          .prepare(/* sql */ `
            SELECT
              workOrderId
            FROM
              WorkOrders
            WHERE
              workOrderNumber = ?
              AND workOrderTypeId = ?
              AND recordDelete_timeMillis IS NULL
            ORDER BY
              workOrderId DESC
            LIMIT
              1
          `)
          .get(workOrderNumber, workOrderTypeId) as
          { workOrderId: number } | undefined

        let workOrder = existingWorkOrder
          ? await getWorkOrder(
              existingWorkOrder.workOrderId,
              {
                includeBurialSites: true,
                includeComments: true,
                includeMilestones: true
              },
              database
            )
          : undefined

        if (workOrder === undefined) {
          const workOrderId = addWorkOrder(
            {
              workOrderDescription:
                `${workOrderRow.WO_REMARK1} ${workOrderRow.WO_REMARK2} ${workOrderRow.WO_REMARK3}`.trim(),
              workOrderNumber,
              workOrderOpenDateString,
              workOrderTypeId,
              workOrderStatusId: importIds.enteredWorkOrderStatusId ?? 1
            },
            user,
            database
          )

          workOrder = await getWorkOrder(
            workOrderId,
            {
              includeBurialSites: true,
              includeComments: true,
              includeMilestones: true
            },
            database
          )
        }

        if (workOrder === undefined) {
          continue
        }

        if (workOrder.workOrderCloseDate) {
          reopenWorkOrder(workOrder.workOrderId, user, database)
          delete workOrder.workOrderCloseDate
          delete workOrder.workOrderCloseDateString
        }

        let burialSite: BurialSite | undefined

        if (
          isIntermentWorkOrder &&
          !cremationCemeteryKeys.has(workOrderRow.WO_CEMETERY)
        ) {
          const burialSiteNameSegment1 =
            workOrderRow.WO_BLOCK === '0' ? '' : workOrderRow.WO_BLOCK

          const burialSiteNameSegment2 =
            (workOrderRow.WO_RANGE1 === '0' ? '' : workOrderRow.WO_RANGE1) +
            (workOrderRow.WO_RANGE2 === '0' ? '' : workOrderRow.WO_RANGE2)

          const burialSiteNameSegment3 =
            (workOrderRow.WO_LOT1 === '0' ? '' : workOrderRow.WO_LOT1) +
            (workOrderRow.WO_LOT2 === '0' ? '' : workOrderRow.WO_LOT2)

          let burialSiteNameSegment4 =
            (workOrderRow.WO_GRAVE1 === '0' ? '' : workOrderRow.WO_GRAVE1) +
            (workOrderRow.WO_GRAVE2 === '0' ? '' : workOrderRow.WO_GRAVE2)

          if (burialSiteNameSegment4 === '') {
            burialSiteNameSegment4 = '1'
          }

          const burialSiteName = buildBurialSiteName(workOrderRow.WO_CEMETERY, {
            burialSiteNameSegment1,
            burialSiteNameSegment2,
            burialSiteNameSegment3,
            burialSiteNameSegment4
          })

          burialSite = await getBurialSiteByBurialSiteName(
            burialSiteName,
            true,
            database
          )

          if (burialSite) {
            updateBurialSiteStatus(
              burialSite.burialSiteId,
              importIds.occupiedBurialSiteStatusId,
              user,
              database
            )
          } else {
            const cemeteryId = getCemeteryIdByKey(
              workOrderRow.WO_CEMETERY,
              user,
              database
            )

            const burialSiteTypeId = getBurialSiteTypeId(
              workOrderRow.WO_CEMETERY
            )

            const burialSiteKeys = addBurialSite(
              {
                burialSiteNameSegment1,
                burialSiteNameSegment2,
                burialSiteNameSegment3,
                burialSiteNameSegment4,

                cemeteryId,
                cemeterySvgId: burialSiteName.includes(',')
                  ? burialSiteName.split(',', 1)[0]
                  : burialSiteName,

                burialSiteStatusId: importIds.occupiedBurialSiteStatusId,
                burialSiteTypeId,

                burialSiteImage: '',
                burialSiteLatitude: '',
                burialSiteLongitude: ''
              },
              user,
              database
            )

            // eslint-disable-next-line require-atomic-updates
            burialSite = await getBurialSite(
              burialSiteKeys.burialSiteId,
              true,
              database
            )
          }

          const workOrderContainsBurialSite =
            workOrder.workOrderBurialSites?.find(
              (possibleLot) =>
                possibleLot.burialSiteId === burialSite?.burialSiteId
            )

          if (!workOrderContainsBurialSite) {
            addWorkOrderBurialSite(
              {
                burialSiteId: burialSite?.burialSiteId as number,
                workOrderId: workOrder.workOrderId
              },
              user,
              database
            )

            workOrder.workOrderBurialSites?.push(burialSite as BurialSite)
          }
        }

        let contractStartDateString = workOrderOpenDateString

        if (isIntermentWorkOrder && workOrderRow.WO_INTERMENT_YR) {
          contractStartDateString = formatDateString(
            workOrderRow.WO_INTERMENT_YR,
            workOrderRow.WO_INTERMENT_MON,
            workOrderRow.WO_INTERMENT_DAY
          )
        }

        const contractType = importIds.atNeedContractType

        const funeralHomeId =
          workOrderRow.WO_FUNERAL_HOME === ''
            ? ''
            : getFuneralHomeIdByKey(
                workOrderRow.WO_FUNERAL_HOME,
                user,
                database
              )

        const committalTypeId =
          isCremationWorkOrder || workOrderRow.WO_COMMITTAL_TYPE === ''
            ? ''
            : getCommittalTypeIdByKey(
                workOrderRow.WO_COMMITTAL_TYPE,
                user,
                database
              )

        const intermentContainerTypeKey =
          isCremationWorkOrder && workOrderRow.WO_CONTAINER_TYPE === ''
            ? 'U'
            : workOrderRow.WO_CONTAINER_TYPE

        const intermentContainerTypeId =
          intermentContainerTypeKey === ''
            ? ''
            : getIntermentContainerTypeIdByKey(
                intermentContainerTypeKey,
                user,
                database
              )

        const intermentDepthId =
          workOrderRow.WO_DEPTH === ''
            ? ''
            : getIntermentDepthIdByKey(workOrderRow.WO_DEPTH, user, database)

        let funeralHour = Math.trunc(
          Number(
            workOrderRow.WO_FUNERAL_HR === '' ? '0' : workOrderRow.WO_FUNERAL_HR
          )
        )

        if (funeralHour <= 6) {
          funeralHour += 12
        }

        const contractForm: AddContractForm = {
          contractNumber: formatContractNumber(
            workOrderRow.WO_WORK_ORDER,
            '',
            workOrderRow.WO_INTERMENT
          ),
          contractTypeId: contractType.contractTypeId,

          contractTypeFieldIds: '',

          burialSiteId:
            isIntermentWorkOrder && burialSite ? burialSite.burialSiteId : '',

          contractEndDateString: '',
          contractStartDateString,

          funeralDirectorName: workOrderRow.WO_FUNERAL_HOME,
          funeralHomeId,

          funeralDateString:
            workOrderRow.WO_FUNERAL_YR === ''
              ? ''
              : formatDateString(
                  workOrderRow.WO_FUNERAL_YR,
                  workOrderRow.WO_FUNERAL_MON,
                  workOrderRow.WO_FUNERAL_DAY
                ),
          funeralTimeString:
            workOrderRow.WO_FUNERAL_YR === ''
              ? ''
              : formatTimeString(
                  funeralHour.toString(),
                  workOrderRow.WO_FUNERAL_MIN
                ),
          committalTypeId,

          purchaserName: '',

          purchaserAddress1: '',
          purchaserAddress2: '',
          purchaserCity: '',
          purchaserPostalCode: '',
          purchaserProvince: '',

          purchaserEmail: '',
          purchaserPhoneNumber: '',
          purchaserRelationship: '',

          deceasedName: workOrderRow.WO_DECEASED_NAME,

          deceasedAddress1: workOrderRow.WO_ADDRESS,
          deceasedAddress2: '',
          deceasedCity: workOrderRow.WO_CITY,
          deceasedPostalCode: `${workOrderRow.WO_POST1} ${workOrderRow.WO_POST2}`,
          deceasedProvince: workOrderRow.WO_PROV.slice(0, 2),

          deathAge: workOrderRow.WO_AGE,
          deathAgePeriod: getDeathAgePeriod(workOrderRow.WO_PERIOD),

          deathDay: workOrderRow.WO_DEATH_DAY,
          deathMonth: workOrderRow.WO_DEATH_MON,
          deathYear: workOrderRow.WO_DEATH_YR,

          deathPlace: workOrderRow.WO_DEATH_PLACE,

          intermentContainerTypeId,
          intermentDepthId
        }

        const existingContracts = await getMatchingContractsForWorkOrderRow(
          workOrderRow,
          burialSite,
          database
        )

        const existingContractIds = existingContracts.map(
          (contract) => contract.contractId
        )

        const contractIdsToLink =
          existingContractIds.length > 0
            ? existingContractIds
            : [addContract(contractForm, user, database)]

        if (existingContractIds.length === 0) {
          if (isIntermentWorkOrder && workOrderRow.WO_INTERMENT_YR !== '') {
            const burialSiteTypeId = getBurialSiteTypeId(
              workOrderRow.WO_CEMETERY
            )

            addContractServiceType(
              {
                contractId: contractIdsToLink[0],
                serviceTypeId:
                  burialSiteTypeId === inGroundBurialSiteTypeId
                    ? importIds.intermentServiceTypeId
                    : importIds.entombmentServiceTypeId
              },
              user,
              database
            )
          }

          if (isCremationWorkOrder && workOrderRow.WO_CREMATION === 'Y') {
            addContractServiceType(
              {
                contractId: contractIdsToLink[0],
                serviceTypeId: importIds.cremationServiceTypeId
              },
              user,
              database
            )
          }
        }

        for (const contractId of contractIdsToLink) {
          addWorkOrderContract(
            {
              contractId,
              workOrderId: workOrder.workOrderId
            },
            user,
            database
          )
        }

        const relatedContracts = await getContracts(
          {
            workOrderId: workOrder.workOrderId
          },
          {
            includeFees: false,
            includeInterments: true,
            includeTransactions: false,
            limit: -1,
            offset: 0
          },
          database
        )

        let hasIncompleteMilestones = !workOrderRow.WO_CONFIRMATION_IN
        let maxMilestoneCompletionDateString = workOrderOpenDateString

        if (importIds.acknowledgedWorkOrderMilestoneTypeId) {
          addWorkOrderMilestone(
            {
              workOrderId: workOrder.workOrderId,
              workOrderMilestoneCompletionDateString:
                workOrderRow.WO_CONFIRMATION_IN
                  ? workOrderOpenDateString
                  : undefined,
              workOrderMilestoneCompletionTimeString:
                workOrderRow.WO_CONFIRMATION_IN ? '00:00' : undefined,
              workOrderMilestoneDateString: workOrderOpenDateString,
              workOrderMilestoneDescription: '',
              workOrderMilestoneTypeId:
                importIds.acknowledgedWorkOrderMilestoneTypeId
            },
            user,
            database
          )
        }

        if (workOrderRow.WO_DEATH_YR) {
          const workOrderMilestoneDateString = formatDateString(
            workOrderRow.WO_DEATH_YR,
            workOrderRow.WO_DEATH_MON,
            workOrderRow.WO_DEATH_DAY
          )

          if (importIds.deathWorkOrderMilestoneTypeId) {
            addWorkOrderMilestone(
              {
                workOrderId: workOrder.workOrderId,
                workOrderMilestoneCompletionDateString:
                  workOrderMilestoneDateString < currentDateString
                    ? workOrderMilestoneDateString
                    : undefined,
                workOrderMilestoneCompletionTimeString:
                  workOrderMilestoneDateString < currentDateString
                    ? '00:00'
                    : undefined,
                workOrderMilestoneDateString,
                workOrderMilestoneDescription: `Death Place: ${workOrderRow.WO_DEATH_PLACE}`,
                workOrderMilestoneTypeId:
                  importIds.deathWorkOrderMilestoneTypeId
              },
              user,
              database
            )
          }

          if (workOrderMilestoneDateString > maxMilestoneCompletionDateString) {
            maxMilestoneCompletionDateString = workOrderMilestoneDateString
          }

          if (workOrderMilestoneDateString >= currentDateString) {
            hasIncompleteMilestones = true
          }
        }

        if (workOrderRow.WO_FUNERAL_YR) {
          const workOrderMilestoneDateString = formatDateString(
            workOrderRow.WO_FUNERAL_YR,
            workOrderRow.WO_FUNERAL_MON,
            workOrderRow.WO_FUNERAL_DAY
          )

          const workOrderMilestoneTimeString = formatTimeString(
            funeralHour.toString(),
            workOrderRow.WO_FUNERAL_MIN === ''
              ? '0'
              : workOrderRow.WO_FUNERAL_MIN
          )

          if (
            importIds.funeralWorkOrderMilestoneTypeId &&
            shouldAddFuneralMilestone(relatedContracts.contracts)
          ) {
            addWorkOrderMilestone(
              {
                workOrderId: workOrder.workOrderId,
                workOrderMilestoneCompletionDateString:
                  workOrderMilestoneDateString < currentDateString
                    ? workOrderMilestoneDateString
                    : undefined,
                workOrderMilestoneCompletionTimeString:
                  workOrderMilestoneDateString < currentDateString
                    ? workOrderMilestoneTimeString
                    : undefined,
                workOrderMilestoneDateString,
                workOrderMilestoneDescription: `Funeral Home: ${workOrderRow.WO_FUNERAL_HOME}`,
                workOrderMilestoneTimeString,
                workOrderMilestoneTypeId:
                  importIds.funeralWorkOrderMilestoneTypeId
              },
              user,
              database
            )
          }

          if (workOrderMilestoneDateString > maxMilestoneCompletionDateString) {
            maxMilestoneCompletionDateString = workOrderMilestoneDateString
          }

          if (workOrderMilestoneDateString >= currentDateString) {
            hasIncompleteMilestones = true
          }
        }

        if (
          isCremationWorkOrder &&
          workOrderRow.WO_CREMATION === 'Y' &&
          importIds.cremationWorkOrderMilestoneTypeId
        ) {
          addWorkOrderMilestone(
            {
              workOrderId: workOrder.workOrderId,
              workOrderMilestoneCompletionDateString:
                maxMilestoneCompletionDateString < currentDateString
                  ? maxMilestoneCompletionDateString
                  : undefined,
              workOrderMilestoneCompletionTimeString:
                maxMilestoneCompletionDateString < currentDateString
                  ? '00:00'
                  : undefined,
              workOrderMilestoneDateString: maxMilestoneCompletionDateString,
              workOrderMilestoneDescription: '',
              workOrderMilestoneTypeId:
                importIds.cremationWorkOrderMilestoneTypeId
            },
            user,
            database
          )
        }

        if (isIntermentWorkOrder && workOrderRow.WO_INTERMENT_YR) {
          const workOrderMilestoneDateString = formatDateString(
            workOrderRow.WO_INTERMENT_YR,
            workOrderRow.WO_INTERMENT_MON,
            workOrderRow.WO_INTERMENT_DAY
          )

          if (importIds.intermentWorkOrderMilestoneTypeId) {
            addWorkOrderMilestone(
              {
                workOrderId: workOrder.workOrderId,
                workOrderMilestoneCompletionDateString:
                  workOrderMilestoneDateString < currentDateString
                    ? workOrderMilestoneDateString
                    : undefined,
                workOrderMilestoneCompletionTimeString:
                  workOrderMilestoneDateString < currentDateString
                    ? '23:59'
                    : undefined,
                workOrderMilestoneDateString,
                workOrderMilestoneDescription: `Depth: ${workOrderRow.WO_DEPTH}`,
                workOrderMilestoneTypeId:
                  importIds.intermentWorkOrderMilestoneTypeId
              },
              user,
              database
            )
          }

          if (workOrderMilestoneDateString > maxMilestoneCompletionDateString) {
            maxMilestoneCompletionDateString = workOrderMilestoneDateString
          }

          if (workOrderMilestoneDateString >= currentDateString) {
            hasIncompleteMilestones = true
          }
        }

        if (!hasIncompleteMilestones) {
          closeWorkOrder(
            {
              workOrderId: workOrder.workOrderId,
              workOrderCloseDateString: maxMilestoneCompletionDateString
            },
            user,
            database
          )
        }
      }
    }

    database.exec('pragma optimize')
  } catch (error) {
    console.error(error)
    console.log(workOrderRow)
  } finally {
    database.close()
  }

  console.timeEnd('importFromWorkOrderCSV')
}
