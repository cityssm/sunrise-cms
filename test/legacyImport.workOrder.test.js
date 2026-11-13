import assert from 'node:assert'
import { before, describe, it } from 'node:test'

import addBurialSite from '../database/addBurialSite.js'
import addCemetery from '../database/addCemetery.js'
import addContract from '../database/addContract.js'
import deleteBurialSite from '../database/deleteBurialSite.js'
import deleteCemetery from '../database/deleteCemetery.js'
import deleteContract from '../database/deleteContract.js'
import { initializeDatabase } from '../database/initializeDatabase.js'
import { getDatabaseConnection } from '../helpers/database.helpers.js'
import * as importIds from '../temp/legacyImportFromCsv/data.ids.js'
import {
  getMatchingContractsForWorkOrderRow,
  getWorkOrderTypeIdsForRow,
  shouldAddFuneralMilestone
} from '../temp/legacyImportFromCsv/import.workOrder.js'

await describe('temp/legacyImportFromCsv/import.workOrder', async () => {
  before(() => {
    initializeDatabase()
  })

  await it('returns both work order type IDs for rows with cremation and interment', () => {
    const workOrderTypeIds = getWorkOrderTypeIdsForRow({
      WO_CREMATION: 'Y',
      WO_INTERMENT_YR: '2025'
    })

    const expectedIds = [
      importIds.cremationWorkOrderTypeId ?? 1,
      importIds.intermentWorkOrderTypeId ?? 0
    ].sort((left, right) => left - right)

    assert.deepStrictEqual(
      [...workOrderTypeIds].sort((left, right) => left - right),
      expectedIds
    )
  })

  await it('matches existing contracts by the work-order import pattern before creating a new contract', async () => {
    const database = getDatabaseConnection()
    const testUser = {
      username: 'testUser',
      userProperties: {},
      userSettings: {}
    }

    const cemeteryId = addCemetery(
      {
        cemeteryKey: 'LEGACY',
        cemeteryName: 'Legacy Cemetery',
        cemeteryDescription: '',
        parentCemeteryId: '',
        cemeteryLatitude: '',
        cemeteryLongitude: '',
        cemeterySvg: '',
        cemeteryAddress1: '',
        cemeteryAddress2: '',
        cemeteryCity: '',
        cemeteryPostalCode: '',
        cemeteryProvince: '',
        cemeteryPhoneNumber: '',
        findagraveCemeteryId: ''
      },
      testUser,
      database
    )

    const burialSiteId = addBurialSite(
      {
        cemeteryId,
        burialSiteNameSegment1: 'A',
        burialSiteNameSegment2: '1',
        burialSiteNameSegment3: '1',
        burialSiteNameSegment4: '1',
        burialSiteStatusId: 1,
        burialSiteTypeId: 1
      },
      testUser,
      database
    ).burialSiteId

    const existingContractId = addContract(
      {
        burialSiteId,
        contractTypeId: importIds.atNeedContractType.contractTypeId,
        contractStartDateString: '2025-01-15',
        funeralDirectorName: '',
        purchaserName: '',
        purchaserAddress1: '',
        purchaserAddress2: '',
        purchaserCity: '',
        purchaserPostalCode: '',
        purchaserProvince: '',
        purchaserEmail: '',
        purchaserPhoneNumber: '',
        purchaserRelationship: '',
        deceasedName: 'Legacy Deceased',
        contractNumber: 'ABC123'
      },
      testUser,
      database
    )

    try {
      const matchedContracts = await getMatchingContractsForWorkOrderRow(
        {
          WO_WORK_ORDER: '123',
          WO_INTERMENT: 'A',
          WO_INTERMENT_YR: '2025',
          WO_INTERMENT_MON: '01',
          WO_INTERMENT_DAY: '15',
          WO_DECEASED_NAME: 'Legacy Deceased',
          WO_INITIATION_DATE: '20250101',
          WO_CEMETERY: 'A',
          WO_CREMATION: 'Y'
        },
        { burialSiteId },
        database
      )

      assert.ok(
        matchedContracts.some((contract) => contract.contractId === existingContractId)
      )
    } finally {
      deleteContract(existingContractId, testUser, database)
      deleteBurialSite(burialSiteId, testUser, database)
      deleteCemetery(cemeteryId, testUser, database)
      database.close()
    }
  })

  await it('skips the funeral milestone when a related contract already includes funeral data', () => {
    assert.strictEqual(
      shouldAddFuneralMilestone([
        {
          funeralDateString: '2025-01-15'
        }
      ]),
      false
    )

    assert.strictEqual(
      shouldAddFuneralMilestone([
        {
          funeralHomeName: 'Test Funeral Home'
        }
      ]),
      false
    )

    assert.strictEqual(shouldAddFuneralMilestone([]), true)
  })
})
