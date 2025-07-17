// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @cspell/spellchecker, @typescript-eslint/no-non-null-assertion, no-console, max-lines */

import fs from 'node:fs'

import {
  type DateString,
  type TimeString,
  dateIntegerToString,
  dateToString
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'
import papa from 'papaparse'

import addBurialSite from '../../database/addBurialSite.js'
import addContract from '../../database/addContract.js'
import addContractComment from '../../database/addContractComment.js'
import addContractFee from '../../database/addContractFee.js'
import addContractTransaction from '../../database/addContractTransaction.js'
import addRelatedContract from '../../database/addRelatedContract.js'
import addWorkOrder from '../../database/addWorkOrder.js'
import addWorkOrderBurialSite from '../../database/addWorkOrderBurialSite.js'
import addWorkOrderContract from '../../database/addWorkOrderContract.js'
import addWorkOrderMilestone from '../../database/addWorkOrderMilestone.js'
import closeWorkOrder from '../../database/closeWorkOrder.js'
import getBurialSite, {
  getBurialSiteByBurialSiteName
} from '../../database/getBurialSite.js'
import getContracts from '../../database/getContracts.js'
import getWorkOrder, {
  getWorkOrderByWorkOrderNumber
} from '../../database/getWorkOrder.js'
import { initializeData } from '../../database/initializeDatabase.js'
import reopenWorkOrder from '../../database/reopenWorkOrder.js'
import { updateBurialSiteStatus } from '../../database/updateBurialSite.js'
import { buildBurialSiteName } from '../../helpers/burialSites.helpers.js'
import { sunriseDB as databasePath } from '../../helpers/database.helpers.js'
import type * as recordTypes from '../../types/record.types.js'

import { getBurialSiteTypeId } from './data.burialSiteTypes.js'
import { cremationCemeteryKeys, getCemeteryIdByKey } from './data.cemeteries.js'
import { getCommittalTypeIdByKey } from './data.committalTypes.js'
import { getDeathAgePeriod } from './data.deathAgePeriods.js'
import { getFeeIdByFeeDescription } from './data.fees.js'
import {
  getFuneralHomeIdByKey,
  initializeFuneralHomes
} from './data.funeralHomes.js'
import * as importIds from './data.ids.js'
import { getIntermentContainerTypeIdByKey } from './data.intermentContainerTypes.js'
import type {
  MasterRecord,
  PrepaidRecord,
  WorkOrderRecord
} from './recordTypes.js'

const user: User = {
  userName: 'import.unix',
  userProperties: {
    canUpdate: true,
    canUpdateWorkOrders: true,
    isAdmin: false,

    apiKey: ''
  }
}

function formatDateString(
  year: string,
  month: string,
  day: string
): DateString {
  const formattedYear = `0000${year}`.slice(-4)
  const formattedMonth = `00${month}`.slice(-2)
  const formattedDay = `00${day}`.slice(-2)

  return `${formattedYear}-${formattedMonth}-${formattedDay}` as DateString
}

function formatTimeString(hour: string, minute: string): TimeString {
  const formattedHour = `00${hour}`.slice(-2)
  const formattedMinute = `00${minute}`.slice(-2)

  return `${formattedHour}:${formattedMinute}` as TimeString
}

// eslint-disable-next-line complexity
async function importFromMasterCSV(): Promise<void> {
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

  try {
    for (masterRow of cmmaster.data) {
      const cemeteryId = getCemeteryIdByKey(masterRow.CM_CEMETERY, user)

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

        const burialSite = await getBurialSiteByBurialSiteName(burialSiteName)

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
                user
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

        if (
          preneedContractStartDateString === '' ||
          preneedContractStartDateString === '0000-00-00'
        ) {
          preneedContractStartDateString = '0001-01-01'
        }

        const purchaserPostalCode =
          `${masterRow.CM_POST1} ${masterRow.CM_POST2}`.trim()

        preneedContractId = addContract(
          {
            contractTypeId: importIds.preneedContractType.contractTypeId,
            burialSiteId: burialSiteId ?? '',
            contractStartDateString: preneedContractStartDateString,
            contractEndDateString,
            contractTypeFieldIds: '',

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
          user
        )

        if (masterRow.CM_REMARK1 !== '') {
          addContractComment(
            {
              contractId: preneedContractId,

              comment: masterRow.CM_REMARK1,
              commentDateString: preneedContractStartDateString,
              commentTimeString: '00:00'
            },
            user
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
            user
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
            user
          )
        }

        if (contractEndDateString === '') {
          updateBurialSiteStatus(
            burialSiteId ?? '',
            importIds.reservedBurialSiteStatusId,
            user
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

        if (
          deceasedContractStartDateString === '' ||
          deceasedContractStartDateString === '0000-00-00'
        ) {
          deceasedContractStartDateString = '0001-01-01'
        }

        const deceasedContractEndDateString = burialSiteId
          ? ''
          : deceasedContractStartDateString

        const contractType = burialSiteId
          ? importIds.deceasedContractType
          : importIds.cremationContractType

        const deceasedPostalCode =
          `${masterRow.CM_POST1} ${masterRow.CM_POST2}`.trim()

        const funeralHomeId =
          masterRow.CM_FUNERAL_HOME === ''
            ? ''
            : getFuneralHomeIdByKey(masterRow.CM_FUNERAL_HOME, user)

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
            : getCommittalTypeIdByKey(masterRow.CM_COMMITTAL_TYPE, user)

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
            : getIntermentContainerTypeIdByKey(intermentContainerTypeKey, user)

        deceasedContractId = addContract(
          {
            contractTypeId: contractType.contractTypeId,
            burialSiteId: burialSiteId ?? '',
            contractStartDateString: deceasedContractStartDateString,
            contractEndDateString: deceasedContractEndDateString,
            contractTypeFieldIds: '',

            committalTypeId,
            funeralHomeId,
            funeralDirectorName: masterRow.CM_FUNERAL_HOME,
            funeralDateString,

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
            deathDateString,
            deathPlace: '',
            deathAge: masterRow.CM_AGE,
            deathAgePeriod: getDeathAgePeriod(masterRow.CM_PERIOD),
            intermentContainerTypeId
          },
          user
        )

        if (preneedContractId !== undefined) {
          addRelatedContract({
            contractId: preneedContractId,
            relatedContractId: deceasedContractId
          })
        }

        if (masterRow.CM_REMARK1 !== '') {
          addContractComment(
            {
              contractId: deceasedContractId,

              comment: masterRow.CM_REMARK1,
              commentDateString: deceasedContractStartDateString,
              commentTimeString: '00:00'
            },
            user
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
            user
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
            user
          )
        }

        updateBurialSiteStatus(
          burialSiteId ?? '',
          importIds.occupiedBurialSiteStatusId,
          user
        )
      }
    }
  } catch (error) {
    console.error(error)
    console.log(masterRow)
  }

  console.timeEnd('importFromMasterCSV')
}

// eslint-disable-next-line complexity
async function importFromPrepaidCSV(): Promise<void> {
  console.time('importFromPrepaidCSV')

  let prepaidRow: PrepaidRecord | undefined

  const rawData = fs.readFileSync('./temp/CMPRPAID.csv').toString()

  const cmprpaid: papa.ParseResult<PrepaidRecord> = papa.parse(rawData, {
    delimiter: ',',
    header: true,
    skipEmptyLines: true
  })

  for (const parseError of cmprpaid.errors) {
    console.log(parseError)
  }

  try {
    for (prepaidRow of cmprpaid.data) {
      if (!prepaidRow.CMPP_PREPAID_FOR_NAME) {
        continue
      }

      let cemeteryKey = prepaidRow.CMPP_CEMETERY

      if (cemeteryKey === '.m') {
        cemeteryKey = 'HC'
      }

      let burialSite: recordTypes.BurialSite | undefined

      if (!cremationCemeteryKeys.has(cemeteryKey)) {
        const cemeteryId = getCemeteryIdByKey(cemeteryKey, user)

        const burialSiteNameSegment1 =
          prepaidRow.CMPP_BLOCK === '0' ? '' : prepaidRow.CMPP_BLOCK

        const burialSiteNameSegment2 =
          (prepaidRow.CMPP_RANGE1 === '0' ? '' : prepaidRow.CMPP_RANGE1) +
          (prepaidRow.CMPP_RANGE2 === '0' ? '' : prepaidRow.CMPP_RANGE2)

        const burialSiteNameSegment3 =
          (prepaidRow.CMPP_LOT1 === '0' ? '' : prepaidRow.CMPP_LOT1) +
          (prepaidRow.CMPP_LOT2 === '0' ? '' : prepaidRow.CMPP_LOT2)

        let burialSiteNameSegment4 =
          (prepaidRow.CMPP_GRAVE1 === '0' ? '' : prepaidRow.CMPP_GRAVE1) +
          (prepaidRow.CMPP_GRAVE2 === '0' ? '' : prepaidRow.CMPP_GRAVE2)

        if (burialSiteNameSegment4 === '') {
          burialSiteNameSegment4 = '1'
        }

        const burialSiteName = buildBurialSiteName(cemeteryKey, {
          burialSiteNameSegment1,
          burialSiteNameSegment2,
          burialSiteNameSegment3,
          burialSiteNameSegment4
        })

        burialSite = await getBurialSiteByBurialSiteName(burialSiteName)

        if (!burialSite) {
          const burialSiteTypeId = getBurialSiteTypeId(cemeteryKey)

          const burialSiteKeys = addBurialSite(
            {
              burialSiteNameSegment1,
              burialSiteNameSegment2,
              burialSiteNameSegment3,
              burialSiteNameSegment4,

              burialSiteStatusId: importIds.reservedBurialSiteStatusId,
              burialSiteTypeId,

              cemeteryId,
              cemeterySvgId: burialSiteName.includes(',')
                ? burialSiteName.split(',')[0]
                : burialSiteName,

              burialSiteLatitude: '',
              burialSiteLongitude: '',

              burialSiteImage: ''
            },
            user
          )

          burialSite = await getBurialSite(burialSiteKeys.burialSiteId)
        }
      }

      if (
        burialSite &&
        burialSite.burialSiteStatusId === importIds.availableBurialSiteStatusId
      ) {
        updateBurialSiteStatus(
          burialSite.burialSiteId,
          importIds.reservedBurialSiteStatusId,
          user
        )
      }

      const contractStartDateString = formatDateString(
        prepaidRow.CMPP_PURCH_YR,
        prepaidRow.CMPP_PURCH_MON,
        prepaidRow.CMPP_PURCH_DAY
      )

      let contractId: number

      if (burialSite) {
        const possibleContracts = await getContracts(
          {
            burialSiteId: burialSite.burialSiteId,
            contractStartDateString,
            contractTypeId: importIds.preneedContractType.contractTypeId,
            deceasedName: prepaidRow.CMPP_PREPAID_FOR_NAME
          },
          {
            includeFees: false,
            includeInterments: false,
            includeTransactions: false,
            limit: -1,
            offset: 0
          }
        )

        if (possibleContracts.contracts.length > 0) {
          contractId = possibleContracts.contracts[0].contractId!
        }
      }

      contractId ||= addContract(
        {
          burialSiteId: burialSite === undefined ? '' : burialSite.burialSiteId,
          contractTypeId: importIds.preneedContractType.contractTypeId,

          contractEndDateString: '',
          contractStartDateString,

          purchaserName: prepaidRow.CMPP_ARRANGED_BY_NAME,

          deceasedName: prepaidRow.CMPP_PREPAID_FOR_NAME,

          deceasedAddress1: prepaidRow.CMPP_ADDRESS,
          deceasedAddress2: '',
          deceasedCity: prepaidRow.CMPP_CITY,
          deceasedPostalCode: `${prepaidRow.CMPP_POSTAL1} ${prepaidRow.CMPP_POSTAL2}`,
          deceasedProvince: prepaidRow.CMPP_PROV.slice(0, 2)
        },
        user
      )

      if (prepaidRow.CMPP_FEE_GRAV_SD !== '0.0') {
        await addContractFee(
          {
            contractId,
            feeId: getFeeIdByFeeDescription('CMPP_FEE_GRAV_SD', user),
            quantity: 1,

            feeAmount: prepaidRow.CMPP_FEE_GRAV_SD,
            taxAmount: prepaidRow.CMPP_GST_GRAV_SD
          },
          user
        )
      }

      if (prepaidRow.CMPP_FEE_GRAV_DD !== '0.0') {
        await addContractFee(
          {
            contractId,
            feeId: getFeeIdByFeeDescription('CMPP_FEE_GRAV_DD', user),
            quantity: 1,

            feeAmount: prepaidRow.CMPP_FEE_GRAV_DD,
            taxAmount: prepaidRow.CMPP_GST_GRAV_DD
          },
          user
        )
      }

      if (prepaidRow.CMPP_FEE_CHAP_SD !== '0.0') {
        await addContractFee(
          {
            contractId,
            feeId: getFeeIdByFeeDescription('CMPP_FEE_CHAP_SD', user),
            quantity: 1,

            feeAmount: prepaidRow.CMPP_FEE_CHAP_SD,
            taxAmount: prepaidRow.CMPP_GST_CHAP_SD
          },
          user
        )
      }

      if (prepaidRow.CMPP_FEE_CHAP_DD !== '0.0') {
        await addContractFee(
          {
            contractId,
            feeId: getFeeIdByFeeDescription('CMPP_FEE_CHAP_DD', user),
            quantity: 1,

            feeAmount: prepaidRow.CMPP_FEE_CHAP_DD,
            taxAmount: prepaidRow.CMPP_GST_CHAP_DD
          },
          user
        )
      }

      if (prepaidRow.CMPP_FEE_ENTOMBMENT !== '0.0') {
        await addContractFee(
          {
            contractId,
            feeId: getFeeIdByFeeDescription('CMPP_FEE_ENTOMBMENT', user),
            quantity: 1,

            feeAmount: prepaidRow.CMPP_FEE_ENTOMBMENT,
            taxAmount: prepaidRow.CMPP_GST_ENTOMBMENT
          },
          user
        )
      }

      if (prepaidRow.CMPP_FEE_CREM !== '0.0') {
        await addContractFee(
          {
            contractId,
            feeId: getFeeIdByFeeDescription('CMPP_FEE_CREM', user),
            quantity: 1,

            feeAmount: prepaidRow.CMPP_FEE_CREM,
            taxAmount: prepaidRow.CMPP_GST_CREM
          },
          user
        )
      }

      if (prepaidRow.CMPP_FEE_NICHE !== '0.0') {
        await addContractFee(
          {
            contractId,
            feeId: getFeeIdByFeeDescription('CMPP_FEE_NICHE', user),
            quantity: 1,

            feeAmount: prepaidRow.CMPP_FEE_NICHE,
            taxAmount: prepaidRow.CMPP_GST_NICHE
          },
          user
        )
      }

      if (
        prepaidRow.CMPP_FEE_DISINTERMENT !== '0.0' &&
        prepaidRow.CMPP_FEE_DISINTERMENT !== '20202.02'
      ) {
        await addContractFee(
          {
            contractId,
            feeId: getFeeIdByFeeDescription('CMPP_FEE_DISINTERMENT', user),
            quantity: 1,

            feeAmount: prepaidRow.CMPP_FEE_DISINTERMENT,
            taxAmount: prepaidRow.CMPP_GST_DISINTERMENT
          },
          user
        )
      }

      const transactionAmount =
        Number.parseFloat(prepaidRow.CMPP_FEE_GRAV_SD) +
        Number.parseFloat(prepaidRow.CMPP_GST_GRAV_SD) +
        Number.parseFloat(prepaidRow.CMPP_FEE_GRAV_DD) +
        Number.parseFloat(prepaidRow.CMPP_GST_GRAV_DD) +
        Number.parseFloat(prepaidRow.CMPP_FEE_CHAP_SD) +
        Number.parseFloat(prepaidRow.CMPP_GST_CHAP_SD) +
        Number.parseFloat(prepaidRow.CMPP_FEE_CHAP_DD) +
        Number.parseFloat(prepaidRow.CMPP_GST_CHAP_DD) +
        Number.parseFloat(prepaidRow.CMPP_FEE_ENTOMBMENT) +
        Number.parseFloat(prepaidRow.CMPP_GST_ENTOMBMENT) +
        Number.parseFloat(prepaidRow.CMPP_FEE_CREM) +
        Number.parseFloat(prepaidRow.CMPP_GST_CREM) +
        Number.parseFloat(prepaidRow.CMPP_FEE_NICHE) +
        Number.parseFloat(prepaidRow.CMPP_GST_NICHE) +
        Number.parseFloat(
          prepaidRow.CMPP_FEE_DISINTERMENT === '20202.02'
            ? '0'
            : prepaidRow.CMPP_FEE_DISINTERMENT
        ) +
        Number.parseFloat(
          prepaidRow.CMPP_GST_DISINTERMENT === '20202.02'
            ? '0'
            : prepaidRow.CMPP_GST_DISINTERMENT
        )

      addContractTransaction(
        {
          contractId,
          externalReceiptNumber: '',
          transactionAmount,
          transactionDateString: contractStartDateString,
          transactionTimeString: '00:00',

          transactionNote: `Order Number: ${prepaidRow.CMPP_ORDER_NO}`
        },
        user
      )

      if (prepaidRow.CMPP_REMARK1 !== '') {
        addContractComment(
          {
            contractId,

            comment: prepaidRow.CMPP_REMARK1,
            commentDateString: contractStartDateString
          },
          user
        )
      }

      if (prepaidRow.CMPP_REMARK2 !== '') {
        addContractComment(
          {
            contractId,

            comment: prepaidRow.CMPP_REMARK2,
            commentDateString: contractStartDateString
          },
          user
        )
      }
    }
  } catch (error) {
    console.error(error)
    console.log(prepaidRow)
  }

  console.timeEnd('importFromPrepaidCSV')
}

// eslint-disable-next-line complexity
async function importFromWorkOrderCSV(): Promise<void> {
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

  try {
    for (workOrderRow of cmwkordr.data) {
      const workOrderNumber = `000000${workOrderRow.WO_WORK_ORDER}`.slice(-6)

      let workOrder = await getWorkOrderByWorkOrderNumber(workOrderNumber)

      const workOrderOpenDateString = dateIntegerToString(
        Number.parseInt(workOrderRow.WO_INITIATION_DATE, 10)
      )

      if (workOrder) {
        if (workOrder.workOrderCloseDate) {
          reopenWorkOrder(workOrder.workOrderId!, user)
          delete workOrder.workOrderCloseDate
          delete workOrder.workOrderCloseDateString
        }
      } else {
        const workOrderId = addWorkOrder(
          {
            workOrderNumber,
            workOrderTypeId: importIds.workOrderTypeId,
            workOrderDescription:
              `${workOrderRow.WO_REMARK1} ${workOrderRow.WO_REMARK2} ${workOrderRow.WO_REMARK3}`.trim(),
            workOrderOpenDateString
          },
          user
        )

        workOrder = await getWorkOrder(workOrderId, {
          includeBurialSites: true,
          includeComments: true,
          includeMilestones: true
        })
      }

      let burialSite: recordTypes.BurialSite | undefined

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

        burialSite = await getBurialSiteByBurialSiteName(burialSiteName)

        if (burialSite) {
          updateBurialSiteStatus(
            burialSite.burialSiteId,
            importIds.occupiedBurialSiteStatusId,
            user
          )
        } else {
          const cemeteryId = getCemeteryIdByKey(workOrderRow.WO_CEMETERY, user)

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
            user
          )

          burialSite = await getBurialSite(burialSiteKeys.burialSiteId)
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
            user
          )

          workOrder?.workOrderBurialSites?.push(
            burialSite as recordTypes.BurialSite
          )
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

      const contractType = burialSite
        ? importIds.deceasedContractType
        : importIds.cremationContractType

      const funeralHomeId =
        workOrderRow.WO_FUNERAL_HOME === ''
          ? ''
          : getFuneralHomeIdByKey(workOrderRow.WO_FUNERAL_HOME, user)

      const committalTypeId =
        contractType.contractType === 'Cremation' ||
        workOrderRow.WO_COMMITTAL_TYPE === ''
          ? ''
          : getCommittalTypeIdByKey(workOrderRow.WO_COMMITTAL_TYPE, user)

      const intermentContainerTypeKey =
        contractType.contractType === 'Cremation' &&
        workOrderRow.WO_CONTAINER_TYPE === ''
          ? 'U'
          : workOrderRow.WO_CONTAINER_TYPE

      const intermentContainerTypeId =
        intermentContainerTypeKey === ''
          ? ''
          : getIntermentContainerTypeIdByKey(intermentContainerTypeKey, user)

      let funeralHour = Number.parseInt(
        workOrderRow.WO_FUNERAL_HR === '' ? '0' : workOrderRow.WO_FUNERAL_HR,
        10
      )
      if (funeralHour <= 6) {
        funeralHour += 12
      }

      const contractId = addContract(
        {
          burialSiteId: burialSite ? burialSite.burialSiteId : '',
          contractTypeId: contractType.contractTypeId,

          contractEndDateString: '',
          contractStartDateString,

          funeralHomeId,
          funeralDirectorName: workOrderRow.WO_FUNERAL_HOME,

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

          deathDateString:
            workOrderRow.WO_DEATH_YR === ''
              ? ''
              : formatDateString(
                  workOrderRow.WO_DEATH_YR,
                  workOrderRow.WO_DEATH_MON,
                  workOrderRow.WO_DEATH_DAY
                ),
          deathPlace: workOrderRow.WO_DEATH_PLACE,
          deathAge: workOrderRow.WO_AGE,
          deathAgePeriod: getDeathAgePeriod(workOrderRow.WO_PERIOD),
          intermentContainerTypeId
        },
        user
      )

      addWorkOrderContract(
        {
          contractId,
          workOrderId: workOrder?.workOrderId as number
        },
        user
      )

      // Milestones

      let hasIncompleteMilestones = !workOrderRow.WO_CONFIRMATION_IN
      let maxMilestoneCompletionDateString = workOrderOpenDateString

      if (importIds.acknowledgedWorkOrderMilestoneTypeId) {
        addWorkOrderMilestone(
          {
            workOrderId: workOrder?.workOrderId as number,
            workOrderMilestoneTypeId:
              importIds.acknowledgedWorkOrderMilestoneTypeId,
            workOrderMilestoneDateString: workOrderOpenDateString,
            workOrderMilestoneDescription: '',
            workOrderMilestoneCompletionDateString:
              workOrderRow.WO_CONFIRMATION_IN
                ? workOrderOpenDateString
                : undefined,
            workOrderMilestoneCompletionTimeString:
              workOrderRow.WO_CONFIRMATION_IN ? '00:00' : undefined
          },
          user
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
              workOrderMilestoneTypeId: importIds.deathWorkOrderMilestoneTypeId,
              workOrderMilestoneDateString,
              workOrderMilestoneDescription: `Death Place: ${workOrderRow.WO_DEATH_PLACE}`,
              workOrderMilestoneCompletionDateString:
                workOrderMilestoneDateString < currentDateString
                  ? workOrderMilestoneDateString
                  : undefined,
              workOrderMilestoneCompletionTimeString:
                workOrderMilestoneDateString < currentDateString
                  ? '00:00'
                  : undefined
            },
            user
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

        let funeralHour = Number.parseInt(
          workOrderRow.WO_FUNERAL_HR === '' ? '0' : workOrderRow.WO_FUNERAL_HR,
          10
        )
        if (funeralHour <= 6) {
          funeralHour += 12
        }

        const workOrderMilestoneTimeString = formatTimeString(
          funeralHour.toString(),
          workOrderRow.WO_FUNERAL_MIN === '' ? '0' : workOrderRow.WO_FUNERAL_MIN
        )

        if (importIds.funeralWorkOrderMilestoneTypeId) {
          addWorkOrderMilestone(
            {
              workOrderId: workOrder?.workOrderId as number,
              workOrderMilestoneTypeId:
                importIds.funeralWorkOrderMilestoneTypeId,
              workOrderMilestoneDateString,
              workOrderMilestoneTimeString,
              workOrderMilestoneDescription: `Funeral Home: ${workOrderRow.WO_FUNERAL_HOME}`,
              workOrderMilestoneCompletionDateString:
                workOrderMilestoneDateString < currentDateString
                  ? workOrderMilestoneDateString
                  : undefined,
              workOrderMilestoneCompletionTimeString:
                workOrderMilestoneDateString < currentDateString
                  ? workOrderMilestoneTimeString
                  : undefined
            },
            user
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
            workOrderMilestoneTypeId:
              importIds.cremationWorkOrderMilestoneTypeId,
            workOrderMilestoneDateString: maxMilestoneCompletionDateString,
            workOrderMilestoneDescription: '',
            workOrderMilestoneCompletionDateString:
              maxMilestoneCompletionDateString < currentDateString
                ? maxMilestoneCompletionDateString
                : undefined,
            workOrderMilestoneCompletionTimeString:
              maxMilestoneCompletionDateString < currentDateString
                ? '00:00'
                : undefined
          },
          user
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
              workOrderMilestoneTypeId:
                importIds.intermentWorkOrderMilestoneTypeId,
              workOrderMilestoneDateString,
              workOrderMilestoneDescription: `Depth: ${workOrderRow.WO_DEPTH}`,
              workOrderMilestoneCompletionDateString:
                workOrderMilestoneDateString < currentDateString
                  ? workOrderMilestoneDateString
                  : undefined,
              workOrderMilestoneCompletionTimeString:
                workOrderMilestoneDateString < currentDateString
                  ? '23:59'
                  : undefined
            },
            user
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
          user
        )
      }
    }
  } catch (error) {
    console.error(error)
    console.log(workOrderRow)
  }

  console.timeEnd('importFromWorkOrderCSV')
}

function purgeConfigTables(): void {
  console.time('purgeConfigTables')

  const configTablesToPurge = [
    'CemeteryDirectionsOfArrival',
    'Cemeteries',
    'BurialSiteStatuses',
    'CommittalTypes',
    'ContractTypeFields',
    'ContractTypePrints',
    'ContractTypes',
    'IntermentContainerTypes',
    'WorkOrderMilestoneTypes',
    'WorkOrderTypes'
  ]

  const database = sqlite(databasePath)

  for (const tableName of configTablesToPurge) {
    console.log(`Purging table: ${tableName}`)
    database.prepare(`delete from ${tableName}`).run()
    database
      .prepare('delete from sqlite_sequence where name = ?')
      .run(tableName)
  }

  database.close()

  initializeData(['BurialSiteTypes', 'FeeCategories'])

  console.timeEnd('purgeConfigTables')
}

function purgeTables(): void {
  console.time('purgeTables')

  const tablesToPurge = [
    'WorkOrderMilestones',
    'WorkOrderComments',
    'WorkOrderBurialSites',
    'WorkOrderContracts',
    'WorkOrders',
    'ContractTransactions',
    'ContractFees',
    'ContractFields',
    'ContractComments',
    'ContractInterments',
    'RelatedContracts',
    'Contracts',
    'FuneralHomes',
    'BurialSiteFields',
    'BurialSiteComments',
    'BurialSites'
  ]

  const database = sqlite(databasePath)

  for (const tableName of tablesToPurge) {
    database.prepare(`delete from ${tableName}`).run()
    database
      .prepare('delete from sqlite_sequence where name = ?')
      .run(tableName)
  }

  database.close()

  console.timeEnd('purgeTables')
}

console.log(`Started ${new Date().toLocaleString()}`)
console.time('importFromCsv')

// Purge Tables
purgeTables()
purgeConfigTables()

// Initialize SSM Data
initializeFuneralHomes(user)

// Do Imports
await importFromMasterCSV()
await importFromPrepaidCSV()
await importFromWorkOrderCSV()

console.timeEnd('importFromCsv')
console.log(`Finished ${new Date().toLocaleString()}`)
