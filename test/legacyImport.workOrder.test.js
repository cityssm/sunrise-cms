import assert from 'node:assert'
import { before, describe, it } from 'node:test'

import { initializeDatabase } from '../database/initializeDatabase.js'
import * as importIds from '../temp/legacyImportFromCsv/data.ids.js'
import {
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
