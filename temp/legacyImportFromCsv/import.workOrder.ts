/* eslint-disable @cspell/spellchecker, complexity, no-console */

import fs from 'node:fs'

import { dateIntegerToString, dateToString } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'
import papa from 'papaparse'

import addBurialSite from '../../database/addBurialSite.js'
import addContract, {
  type AddContractForm
} from '../../database/addContract.js'
import addWorkOrder from '../../database/addWorkOrder.js'
import addWorkOrderBurialSite from '../../database/addWorkOrderBurialSite.js'
import addWorkOrderContract from '../../database/addWorkOrderContract.js'
import addWorkOrderMilestone from '../../database/addWorkOrderMilestone.js'
import closeWorkOrder from '../../database/closeWorkOrder.js'
import getBurialSite, {
  getBurialSiteByBurialSiteName
} from '../../database/getBurialSite.js'
import getWorkOrder, {
  getWorkOrderByWorkOrderNumber
} from '../../database/getWorkOrder.js'
import reopenWorkOrder from '../../database/reopenWorkOrder.js'
import { updateBurialSiteStatus } from '../../database/updateBurialSite.js'
import { buildBurialSiteName } from '../../helpers/burialSites.helpers.js'
import { sunriseDB as databasePath } from '../../helpers/database.helpers.js'
import type { BurialSite } from '../../types/record.types.js'

import { getBurialSiteTypeId } from './data.burialSiteTypes.js'
import { cremationCemeteryKeys, getCemeteryIdByKey } from './data.cemeteries.js'
import { getCommittalTypeIdByKey } from './data.committalTypes.js'
import { getDeathAgePeriod } from './data.deathAgePeriods.js'
import { getFuneralHomeIdByKey } from './data.funeralHomes.js'
import * as importIds from './data.ids.js'
import { getIntermentContainerTypeIdByKey } from './data.intermentContainerTypes.js'
import type { WorkOrderRecord } from './recordTypes.js'
import { formatContractNumber, formatDateString, formatTimeString, user } from './utilities.js'

export async function importFromWorkOrderCSV(): Promise<void> {
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

  const database = sqlite(databasePath)
  database.pragma('journal_mode = WAL')

  try {
    for (workOrderRow of cmwkordr.data) {
      const workOrderNumber = `000000${workOrderRow.WO_WORK_ORDER}`.slice(-6)

      let workOrder = await getWorkOrderByWorkOrderNumber(workOrderNumber)

      const workOrderOpenDateString = dateIntegerToString(
        Number.parseInt(workOrderRow.WO_INITIATION_DATE, 10)
      )

      if (workOrder) {
        if (workOrder.workOrderCloseDate) {
          reopenWorkOrder(workOrder.workOrderId, user, database)
          delete workOrder.workOrderCloseDate
          delete workOrder.workOrderCloseDateString
        }
      } else {
        const workOrderId = addWorkOrder(
          {
            workOrderDescription:
              `${workOrderRow.WO_REMARK1} ${workOrderRow.WO_REMARK2} ${workOrderRow.WO_REMARK3}`.trim(),
            workOrderNumber,
            workOrderOpenDateString,
            workOrderTypeId: importIds.workOrderTypeId
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

      let burialSite: BurialSite | undefined

      if (!cremationCemeteryKeys.has(workOrderRow.WO_CEMETERY)) {
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

          const burialSiteTypeId = getBurialSiteTypeId(workOrderRow.WO_CEMETERY)

          const burialSiteKeys = addBurialSite(
            {
              burialSiteNameSegment1,
              burialSiteNameSegment2,
              burialSiteNameSegment3,
              burialSiteNameSegment4,

              cemeteryId,
              cemeterySvgId: burialSiteName.includes(',')
                ? burialSiteName.split(',')[0]
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

          // eslint-disable-next-line no-await-in-loop, require-atomic-updates
          burialSite = await getBurialSite(
            burialSiteKeys.burialSiteId,
            true,
            database
          )
        }

        const workOrderContainsBurialSite =
          workOrder?.workOrderBurialSites?.find(
            (possibleLot) =>
              possibleLot.burialSiteId === burialSite?.burialSiteId
          )

        if (!workOrderContainsBurialSite) {
          addWorkOrderBurialSite(
            {
              burialSiteId: burialSite?.burialSiteId as number,
              workOrderId: workOrder?.workOrderId as number
            },
            user,
            database
          )

          workOrder?.workOrderBurialSites?.push(burialSite as BurialSite)
        }
      }

      let contractStartDateString = workOrderOpenDateString

      if (workOrderRow.WO_INTERMENT_YR) {
        contractStartDateString = formatDateString(
          workOrderRow.WO_INTERMENT_YR,
          workOrderRow.WO_INTERMENT_MON,
          workOrderRow.WO_INTERMENT_DAY
        )
      }

      const isCremation = burialSite === undefined

      const contractType = importIds.atNeedContractType
      const funeralHomeId =
        workOrderRow.WO_FUNERAL_HOME === ''
          ? ''
          : getFuneralHomeIdByKey(workOrderRow.WO_FUNERAL_HOME, user, database)

      const committalTypeId =
        isCremation || workOrderRow.WO_COMMITTAL_TYPE === ''
          ? ''
          : getCommittalTypeIdByKey(
              workOrderRow.WO_COMMITTAL_TYPE,
              user,
              database
            )

      const intermentContainerTypeKey =
        isCremation && workOrderRow.WO_CONTAINER_TYPE === ''
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

      let funeralHour = Number.parseInt(
        workOrderRow.WO_FUNERAL_HR === '' ? '0' : workOrderRow.WO_FUNERAL_HR,
        10
      )

      if (funeralHour <= 6) {
        funeralHour += 12
      }

      const contractForm: AddContractForm = {
        contractNumber: formatContractNumber(workOrderRow.WO_WORK_ORDER),

        burialSiteId: burialSite ? burialSite.burialSiteId : '',
        contractTypeId: contractType.contractTypeId,

        contractEndDateString: '',
        contractStartDateString,

        contractTypeFieldIds: '',

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

        deceasedName: workOrderRow.WO_DECEASED_NAME,

        deceasedAddress1: workOrderRow.WO_ADDRESS,
        deceasedAddress2: '',
        deceasedCity: workOrderRow.WO_CITY,
        deceasedPostalCode: `${workOrderRow.WO_POST1} ${workOrderRow.WO_POST2}`,
        deceasedProvince: workOrderRow.WO_PROV.slice(0, 2),

        deathAge: workOrderRow.WO_AGE,
        deathAgePeriod: getDeathAgePeriod(workOrderRow.WO_PERIOD),
        deathDateString:
          workOrderRow.WO_DEATH_YR === ''
            ? ''
            : formatDateString(
                workOrderRow.WO_DEATH_YR,
                workOrderRow.WO_DEATH_MON,
                workOrderRow.WO_DEATH_DAY
              ),
        deathPlace: workOrderRow.WO_DEATH_PLACE,
        intermentContainerTypeId
      }

      // eslint-disable-next-line no-secrets/no-secrets
      /*
      if (
        contractType.contractType === 'Interment' &&
        importIds.intermentDepthContractField?.contractTypeFieldId !==
          undefined &&
        workOrderRow.WO_DEPTH !== ''
      ) {
        contractForm.contractTypeFieldIds =
          importIds.intermentDepthContractField.contractTypeFieldId.toString()

        let depth = workOrderRow.WO_DEPTH

        if (depth === 'S') {
          depth = 'Single'
        } else if (depth === 'D') {
          depth = 'Double'
        }

        contractForm[
          `fieldValue_${importIds.intermentDepthContractField.contractTypeFieldId.toString()}`
        ] = depth
      }
      */

      const contractId = addContract(contractForm, user, database)

      addWorkOrderContract(
        {
          contractId,
          workOrderId: workOrder?.workOrderId as number
        },
        user,
        database
      )

      // Milestones

      let hasIncompleteMilestones = !workOrderRow.WO_CONFIRMATION_IN
      let maxMilestoneCompletionDateString = workOrderOpenDateString

      if (importIds.acknowledgedWorkOrderMilestoneTypeId) {
        addWorkOrderMilestone(
          {
            workOrderId: workOrder?.workOrderId as number,
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
              workOrderId: workOrder?.workOrderId as number,
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
              workOrderMilestoneTypeId: importIds.deathWorkOrderMilestoneTypeId
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

        /* Funeral Hour calculated above */

        const workOrderMilestoneTimeString = formatTimeString(
          funeralHour.toString(),
          workOrderRow.WO_FUNERAL_MIN === '' ? '0' : workOrderRow.WO_FUNERAL_MIN
        )

        if (importIds.funeralWorkOrderMilestoneTypeId) {
          addWorkOrderMilestone(
            {
              workOrderId: workOrder?.workOrderId as number,
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
        workOrderRow.WO_CREMATION === 'Y' &&
        importIds.cremationWorkOrderMilestoneTypeId
      ) {
        addWorkOrderMilestone(
          {
            workOrderId: workOrder?.workOrderId as number,
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

      if (workOrderRow.WO_INTERMENT_YR) {
        const workOrderMilestoneDateString = formatDateString(
          workOrderRow.WO_INTERMENT_YR,
          workOrderRow.WO_INTERMENT_MON,
          workOrderRow.WO_INTERMENT_DAY
        )

        if (importIds.intermentWorkOrderMilestoneTypeId) {
          addWorkOrderMilestone(
            {
              workOrderId: workOrder?.workOrderId as number,
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
            workOrderId: workOrder?.workOrderId as number,

            workOrderCloseDateString: maxMilestoneCompletionDateString
          },
          user,
          database
        )
      }
    }
  } catch (error) {
    console.error(error)
    console.log(workOrderRow)
  } finally {
    database.close()
  }

  console.timeEnd('importFromWorkOrderCSV')
}
