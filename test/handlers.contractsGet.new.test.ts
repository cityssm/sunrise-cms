/* eslint-disable node-test/no-async-describe */

import assert from 'node:assert'
import { describe, it } from 'node:test'

import type { OrderFormData } from 'sunrise-cms-shared'

import {
  calculateDeathAgeFromDates,
  getOrderFormServiceTypeIds
} from '../handlers/contractsGet/new.js'

await describe('handlers/contractsGet/new', async () => {
  await it('uses stored birthDate/deathDate values when explicit parts are absent', () => {
    const dateBasedOrderForm = {
      birthDateString: '1988-12-31',
      deathDateString: '2024-01-15',

      birthPlace: 'Toronto',
      deathPlace: 'Sault Ste. Marie'
    } satisfies Partial<OrderFormData>

    const calculatedAge = calculateDeathAgeFromDates(dateBasedOrderForm)

    assert.strictEqual(calculatedAge.deathAge, 35)
    assert.strictEqual(calculatedAge.deathAgePeriod, 'Years')
  })

  await it('includes selected service types when values are string or boolean true', () => {
    const serviceTypeIds = getOrderFormServiceTypeIds({
      'serviceTypeId-2': 'true',
      'serviceTypeId-3': true,
      'serviceTypeId-4': false,
      'serviceTypeId-5': 'false',
      submitterName: 'Test'
    })

    assert.deepStrictEqual(serviceTypeIds, [2, 3])
  })
})
