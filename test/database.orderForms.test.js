import assert from 'node:assert'
import { after, describe, it } from 'node:test'

import getOrderForms from '../database/getOrderForms.js'
import { getDatabaseConnection } from '../helpers/database.helpers.js'

await describe('database/orderForms', async () => {
  const database = getDatabaseConnection()

  after(() => {
    database.close()
  })

  await it('returns paged results and filters by processed status', () => {
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
      'orderforms-test-filter-processed-3'
    ]

    for (const [index, key] of insertedKeys.entries()) {
      insertOrderForm.run(
        startingId + index,
        key,
        JSON.stringify({
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
    assert.ok(pagedResult.count >= 3)
    assert.ok(pagedResult.orderForms.length <= 2)

    const processedResult = getOrderForms({ isOrderFormProcessed: true }, { limit: 10, offset: 0 })
    assert.ok(processedResult && typeof processedResult === 'object')
    assert.ok('orderForms' in processedResult)
    assert.ok(processedResult.orderForms.every((orderForm) => orderForm.isOrderFormProcessed === 1))

    const unprocessedResult = getOrderForms({ isOrderFormProcessed: false }, { limit: 10, offset: 0 })
    assert.ok(unprocessedResult && typeof unprocessedResult === 'object')
    assert.ok('orderForms' in unprocessedResult)
    assert.ok(unprocessedResult.orderForms.every((orderForm) => orderForm.isOrderFormProcessed === 0))

    database
      .prepare(`DELETE FROM OrderForms WHERE orderFormKey IN (${insertedKeys.map(() => '?').join(',')})`)
      .run(...insertedKeys)
  })
})
