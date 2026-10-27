import assert from 'node:assert'
import { after, describe, it } from 'node:test'

import getOrderForms from '../database/getOrderForms.js'
import { getDatabaseConnection } from '../helpers/database.helpers.js'

await describe('database/orderForms', async () => {
  const database = getDatabaseConnection()

  after(() => {
    database.close()
  })

  await it('returns paged results and filters by processed status, contract type, and names', () => {
    const nextIdRow = database
      .prepare('SELECT COALESCE(MAX(orderFormId), 0) AS maxOrderFormId FROM OrderForms')
      .get()

    const startingId = Number(nextIdRow.maxOrderFormId) + 1000

    const insertOrderForm = database.prepare(/* sql */ `
      INSERT INTO OrderForms (
        orderFormId,
        orderFormKey,
        orderFormData,
        recordCreate_ipAddress,
        recordCreate_timeMillis,
        recordSync_timeMillis,
        isOrderFormProcessed
      )
      VALUES
        (?, ?, ?, ?, ?, ?, ?)
    `)

    const insertedKeys = [
      'orderforms-test-filter-processed-1',
      'orderforms-test-filter-processed-2',
      'orderforms-test-filter-processed-3',
      'orderforms-test-filter-processed-4'
    ]

    for (const [index, key] of insertedKeys.entries()) {
      insertOrderForm.run(
        startingId + index,
        key,
        JSON.stringify({
          contractTypeId: 1,
          contractTypeIdText: 'Preneed Contract',
          purchaserName: `Purchaser ${index + 1}`,
          deceasedName: `Deceased ${index + 1}`
        }),
        '127.0.0.1',
        Date.now() + index,
        Date.now() + index,
        index % 2
      )
    }

    const pagedResult = getOrderForms({}, { limit: 2, offset: 0 })
    assert.ok(pagedResult && typeof pagedResult === 'object')
    assert.ok('orderForms' in pagedResult)
    assert.ok(pagedResult.count >= 4)
    assert.ok(pagedResult.orderForms.length <= 2)

    const processedResult = getOrderForms({ isOrderFormProcessed: true }, { limit: 10, offset: 0 })
    assert.ok(processedResult && typeof processedResult === 'object')
    assert.ok('orderForms' in processedResult)
    assert.ok(processedResult.orderForms.every((orderForm) => orderForm.isOrderFormProcessed === 1))

    const unprocessedResult = getOrderForms({ isOrderFormProcessed: false }, { limit: 10, offset: 0 })
    assert.ok(unprocessedResult && typeof unprocessedResult === 'object')
    assert.ok('orderForms' in unprocessedResult)
    assert.ok(unprocessedResult.orderForms.every((orderForm) => orderForm.isOrderFormProcessed === 0))

    const contractTypeResult = getOrderForms({
      contractTypeId: 1,
      contractTypeName: 'Preneed Contract'
    }, { limit: 10, offset: 0 })
    assert.ok(contractTypeResult && typeof contractTypeResult === 'object')
    assert.ok('orderForms' in contractTypeResult)
    assert.ok(contractTypeResult.orderForms.length >= 4)

    const purchaserResult = getOrderForms({ purchaserName: 'Purchaser 2' }, { limit: 10, offset: 0 })
    assert.ok(purchaserResult && typeof purchaserResult === 'object')
    assert.ok('orderForms' in purchaserResult)
    assert.ok(purchaserResult.orderForms.some((orderForm) => orderForm.orderFormData.purchaserName === 'Purchaser 2'))

    const deceasedResult = getOrderForms({ deceasedName: 'Deceased 3' }, { limit: 10, offset: 0 })
    assert.ok(deceasedResult && typeof deceasedResult === 'object')
    assert.ok('orderForms' in deceasedResult)
    assert.ok(deceasedResult.orderForms.some((orderForm) => orderForm.orderFormData.deceasedName === 'Deceased 3'))

    database
      .prepare(`DELETE FROM OrderForms WHERE orderFormKey IN (${insertedKeys.map(() => '?').join(',')})`)
      .run(...insertedKeys)
  })
})
