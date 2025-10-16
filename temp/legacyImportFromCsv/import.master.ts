// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @cspell/spellchecker, complexity, no-console */

import fs from 'node:fs'

import type { DateString } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'
import papa from 'papaparse'

import addBurialSite from '../../database/addBurialSite.js'
import addContract, {
  type AddContractForm
} from '../../database/addContract.js'
import addContractComment from '../../database/addContractComment.js'
import addRelatedContract from '../../database/addRelatedContract.js'
import { getBurialSiteByBurialSiteName } from '../../database/getBurialSite.js'
import { updateBurialSiteStatus } from '../../database/updateBurialSite.js'
import { buildBurialSiteName } from '../../helpers/burialSites.helpers.js'
import { sunriseDB as databasePath } from '../../helpers/database.helpers.js'

import { getBurialSiteTypeId } from './data.burialSiteTypes.js'
import { cremationCemeteryKeys, getCemeteryIdByKey } from './data.cemeteries.js'
import { getCommittalTypeIdByKey } from './data.committalTypes.js'
import { getDeathAgePeriod } from './data.deathAgePeriods.js'
import { getFuneralHomeIdByKey } from './data.funeralHomes.js'
import * as importIds from './data.ids.js'
import { getIntermentContainerTypeIdByKey } from './data.intermentContainerTypes.js'
import type { MasterRecord } from './recordTypes.js'
import { formatDateString, user } from './utilities.js'

export async function importFromMasterCSV(): Promise<void> {
  console.time('importFromMasterCSV')

  let masterRow: MasterRecord | undefined

  const rawData = fs.readFileSync('./temp/CMMASTER.csv').toString()

  const cmmaster: papa.ParseResult<MasterRecord> = papa.parse(rawData, {
    delimiter: ',',
    header: true,
    skipEmptyLines: true
  })

  for (const parseError of cmmaster.errors) {
    console.log(parseError)
  }

  const database = sqlite(databasePath)
  database.pragma('journal_mode = WAL')

  try {
    for (masterRow of cmmaster.data) {
      const cemeteryId = getCemeteryIdByKey(
        masterRow.CM_CEMETERY,
        user,
        database
      )

      let burialSiteId: number | undefined

      if (!cremationCemeteryKeys.has(masterRow.CM_CEMETERY)) {
        const burialSiteTypeId = getBurialSiteTypeId(masterRow.CM_CEMETERY)

        const burialSiteNameSegment1 =
          masterRow.CM_BLOCK === '0' ? '' : masterRow.CM_BLOCK
        const burialSiteNameSegment2 =
          (masterRow.CM_RANGE1 === '0' ? '' : masterRow.CM_RANGE1) +
          (masterRow.CM_RANGE2 === '0' ? '' : masterRow.CM_RANGE2)
        const burialSiteNameSegment3 =
          (masterRow.CM_LOT1 === '0' ? '' : masterRow.CM_LOT1) +
          (masterRow.CM_LOT2 === '0' ? '' : masterRow.CM_LOT2)

        let burialSiteNameSegment4 =
          (masterRow.CM_GRAVE1 === '0' ? '' : masterRow.CM_GRAVE1) +
          (masterRow.CM_GRAVE2 === '0' ? '' : masterRow.CM_GRAVE2)

        if (burialSiteNameSegment4 === '') {
          burialSiteNameSegment4 = '1'
        }

        const burialSiteName = buildBurialSiteName(masterRow.CM_CEMETERY, {
          burialSiteNameSegment1,
          burialSiteNameSegment2,
          burialSiteNameSegment3,
          burialSiteNameSegment4
        })

        const burialSite = await getBurialSiteByBurialSiteName(
          burialSiteName,
          true,
          database
        )

        burialSiteId =
          burialSite === undefined
            ? addBurialSite(
                {
                  burialSiteNameSegment1,
                  burialSiteNameSegment2,
                  burialSiteNameSegment3,
                  burialSiteNameSegment4,

                  burialSiteStatusId: importIds.availableBurialSiteStatusId,
                  burialSiteTypeId,

                  burialSiteImage: '',
                  cemeteryId,
                  cemeterySvgId: '',

                  burialSiteLatitude: '',
                  burialSiteLongitude: ''
                },
                user,
                database
              ).burialSiteId
            : burialSite.burialSiteId
      }

      /*
       * Preneed Record
       */

      let preneedContractStartDateString: '' | DateString
      let preneedContractId: number | undefined

      if (masterRow.CM_PRENEED_OWNER !== '' || masterRow.CM_STATUS === 'P') {
        preneedContractStartDateString = formatDateString(
          masterRow.CM_PURCHASE_YR,
          masterRow.CM_PURCHASE_MON,
          masterRow.CM_PURCHASE_DAY
        )

        let contractEndDateString: '' | DateString = ''

        if (
          masterRow.CM_INTERMENT_YR !== '' &&
          masterRow.CM_INTERMENT_YR !== '0'
        ) {
          contractEndDateString = formatDateString(
            masterRow.CM_INTERMENT_YR,
            masterRow.CM_INTERMENT_MON,
            masterRow.CM_INTERMENT_DAY
          )
        }

        // if purchase date unavailable
        if (
          preneedContractStartDateString === '0000-00-00' &&
          contractEndDateString !== ''
        ) {
          preneedContractStartDateString = contractEndDateString
        }

        // if end date unavailable
        if (
          preneedContractStartDateString === '0000-00-00' &&
          masterRow.CM_DEATH_YR !== '' &&
          masterRow.CM_DEATH_YR !== '0'
        ) {
          preneedContractStartDateString = formatDateString(
            masterRow.CM_DEATH_YR,
            masterRow.CM_DEATH_MON,
            masterRow.CM_DEATH_DAY
          )

          // if death took place, and there's no preneed end date
          if (
            contractEndDateString === '0000-00-00' ||
            contractEndDateString === ''
          ) {
            contractEndDateString = preneedContractStartDateString
          }
        }

        if (preneedContractStartDateString === '0000-00-00') {
          preneedContractStartDateString = '0001-01-01'
        }

        const purchaserPostalCode =
          `${masterRow.CM_POST1} ${masterRow.CM_POST2}`.trim()

        preneedContractId = addContract(
          {
            burialSiteId: burialSiteId ?? '',
            contractEndDateString,
            contractStartDateString: preneedContractStartDateString,
            contractTypeFieldIds: '',
            contractTypeId: importIds.preneedContractType.contractTypeId,

            purchaserName: masterRow.CM_PRENEED_OWNER,

            purchaserAddress1: masterRow.CM_ADDRESS,
            purchaserAddress2: '',
            purchaserCity: masterRow.CM_CITY,
            purchaserPostalCode,
            purchaserProvince: masterRow.CM_PROV,

            purchaserEmail: '',
            purchaserPhoneNumber: '',

            deceasedName:
              masterRow.CM_DECEASED_NAME === ''
                ? masterRow.CM_PRENEED_OWNER
                : masterRow.CM_DECEASED_NAME,

            deceasedAddress1: masterRow.CM_ADDRESS,
            deceasedAddress2: '',
            deceasedCity: masterRow.CM_CITY,
            deceasedPostalCode: purchaserPostalCode,
            deceasedProvince: masterRow.CM_PROV
          },
          user,
          database
        )

        if (masterRow.CM_REMARK1 !== '') {
          addContractComment(
            {
              contractId: preneedContractId,

              comment: masterRow.CM_REMARK1,
              commentDateString: preneedContractStartDateString,
              commentTimeString: '00:00'
            },
            user,
            database
          )
        }

        if (masterRow.CM_REMARK2 !== '') {
          addContractComment(
            {
              contractId: preneedContractId,

              comment: masterRow.CM_REMARK2,
              commentDateString: preneedContractStartDateString,
              commentTimeString: '00:00'
            },
            user,
            database
          )
        }

        if (masterRow.CM_WORK_ORDER.trim() !== '') {
          addContractComment(
            {
              contractId: preneedContractId,

              comment: `Imported Contract #${masterRow.CM_WORK_ORDER}`,
              commentDateString: preneedContractStartDateString,
              commentTimeString: '00:00'
            },
            user,
            database
          )
        }

        if (contractEndDateString === '') {
          updateBurialSiteStatus(
            burialSiteId ?? '',
            importIds.reservedBurialSiteStatusId,
            user,
            database
          )
        }
      }

      /*
       * Interment Record
       */

      let deceasedContractStartDateString: '' | DateString
      let deceasedContractId: number

      if (masterRow.CM_DECEASED_NAME !== '') {
        deceasedContractStartDateString = formatDateString(
          masterRow.CM_INTERMENT_YR,
          masterRow.CM_INTERMENT_MON,
          masterRow.CM_INTERMENT_DAY
        )

        // if interment date unavailable
        if (
          deceasedContractStartDateString === '0000-00-00' &&
          masterRow.CM_DEATH_YR !== '' &&
          masterRow.CM_DEATH_YR !== '0'
        ) {
          deceasedContractStartDateString = formatDateString(
            masterRow.CM_DEATH_YR,
            masterRow.CM_DEATH_MON,
            masterRow.CM_DEATH_DAY
          )
        }

        if (deceasedContractStartDateString === '0000-00-00') {
          deceasedContractStartDateString = '0001-01-01'
        }

        const deceasedContractEndDateString = burialSiteId
          ? ''
          : deceasedContractStartDateString

        const contractType = burialSiteId
          ? importIds.intermentContractType
          : importIds.cremationContractType

        const deceasedPostalCode =
          `${masterRow.CM_POST1} ${masterRow.CM_POST2}`.trim()

        const funeralHomeId =
          masterRow.CM_FUNERAL_HOME === ''
            ? ''
            : getFuneralHomeIdByKey(masterRow.CM_FUNERAL_HOME, user, database)

        const funeralDateString =
          masterRow.CM_FUNERAL_YR === '' || masterRow.CM_FUNERAL_YR === '0'
            ? ''
            : formatDateString(
                masterRow.CM_FUNERAL_YR,
                masterRow.CM_FUNERAL_MON,
                masterRow.CM_FUNERAL_DAY
              )

        const committalTypeId =
          contractType.contractType === 'Cremation' ||
          masterRow.CM_COMMITTAL_TYPE === ''
            ? ''
            : getCommittalTypeIdByKey(
                masterRow.CM_COMMITTAL_TYPE,
                user,
                database
              )

        const deathDateString =
          masterRow.CM_DEATH_YR === '' || masterRow.CM_DEATH_YR === '0'
            ? ''
            : formatDateString(
                masterRow.CM_DEATH_YR,
                masterRow.CM_DEATH_MON,
                masterRow.CM_DEATH_DAY
              )

        const intermentContainerTypeKey =
          masterRow.CM_CONTAINER_TYPE === '' &&
          (contractType.contractType === 'Cremation' ||
            masterRow.CM_CREMATION === 'Y')
            ? 'U'
            : masterRow.CM_CONTAINER_TYPE

        const intermentContainerTypeId =
          intermentContainerTypeKey === ''
            ? ''
            : getIntermentContainerTypeIdByKey(
                intermentContainerTypeKey,
                user,
                database
              )

        const contractForm: AddContractForm = {
          burialSiteId: burialSiteId ?? '',
          contractEndDateString: deceasedContractEndDateString,
          contractStartDateString: deceasedContractStartDateString,
          contractTypeId: contractType.contractTypeId,

          contractTypeFieldIds: '',

          committalTypeId,
          funeralDateString,
          funeralDirectorName: masterRow.CM_FUNERAL_HOME,
          funeralHomeId,

          purchaserName:
            masterRow.CM_PRENEED_OWNER === ''
              ? masterRow.CM_DECEASED_NAME
              : masterRow.CM_PRENEED_OWNER,

          purchaserAddress1: masterRow.CM_ADDRESS,
          purchaserAddress2: '',
          purchaserCity: masterRow.CM_CITY,
          purchaserPostalCode: deceasedPostalCode,
          purchaserProvince: masterRow.CM_PROV,

          purchaserEmail: '',
          purchaserPhoneNumber: '',

          deceasedName: masterRow.CM_DECEASED_NAME,

          deceasedAddress1: masterRow.CM_ADDRESS,
          deceasedAddress2: '',
          deceasedCity: masterRow.CM_CITY,
          deceasedPostalCode,
          deceasedProvince: masterRow.CM_PROV,

          birthDateString: '',
          birthPlace: '',
          deathAge: masterRow.CM_AGE,
          deathAgePeriod: getDeathAgePeriod(masterRow.CM_PERIOD),
          deathDateString,
          deathPlace: '',
          intermentContainerTypeId
        }

        if (
          contractType.contractType === 'Interment' &&
          importIds.intermentDepthContractField?.contractTypeFieldId !==
            undefined &&
          masterRow.CM_DEPTH !== ''
        ) {
          contractForm.contractTypeFieldIds =
            importIds.intermentDepthContractField.contractTypeFieldId.toString()

          let depth = masterRow.CM_DEPTH

          if (depth === 'S') {
            depth = 'Single'
          } else if (depth === 'D') {
            depth = 'Double'
          }

          contractForm[
            `fieldValue_${importIds.intermentDepthContractField.contractTypeFieldId.toString()}`
          ] = depth
        }

        deceasedContractId = addContract(contractForm, user, database)

        if (preneedContractId !== undefined) {
          addRelatedContract(
            {
              contractId: preneedContractId,
              relatedContractId: deceasedContractId
            },
            database
          )
        }

        if (masterRow.CM_REMARK1 !== '') {
          addContractComment(
            {
              contractId: deceasedContractId,

              comment: masterRow.CM_REMARK1,
              commentDateString: deceasedContractStartDateString,
              commentTimeString: '00:00'
            },
            user,
            database
          )
        }

        if (masterRow.CM_REMARK2 !== '') {
          addContractComment(
            {
              contractId: deceasedContractId,

              comment: masterRow.CM_REMARK2,
              commentDateString: deceasedContractStartDateString,
              commentTimeString: '00:00'
            },
            user,
            database
          )
        }

        if (masterRow.CM_WORK_ORDER.trim() !== '') {
          addContractComment(
            {
              contractId: deceasedContractId,

              comment: `Imported Work Order #${masterRow.CM_WORK_ORDER}`,
              commentDateString: deceasedContractStartDateString,
              commentTimeString: '00:00'
            },
            user,
            database
          )
        }

        updateBurialSiteStatus(
          burialSiteId ?? '',
          importIds.occupiedBurialSiteStatusId,
          user,
          database
        )
      }
    }
  } catch (error) {
    console.error(error)
    console.log(masterRow)
  } finally {
    database.close()
  }

  console.timeEnd('importFromMasterCSV')
}
