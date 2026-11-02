import assert from 'node:assert'
import { describe, it } from 'node:test'

import { calculateDeathAgeFromDates } from '../handlers/contractsGet/new.js'

await describe('handlers/contractsGet/new', async () => {
  await it('uses stored birthDate/deathDate values when explicit parts are absent', () => {
    const dateBasedOrderForm = {
      birthDate: 19881231,
      deathDate: 20240115,
      birthPlace: 'Toronto',
      deathPlace: 'Sault Ste. Marie'
    }

    const calculatedAge = calculateDeathAgeFromDates(dateBasedOrderForm)

    assert.strictEqual(calculatedAge.deathAge, 35)
    assert.strictEqual(calculatedAge.deathAgePeriod, 'Years')
  })

  await it('keeps already-populated date parts when they are explicitly set', () => {
    const explicitDateOrderForm = {
      birthDate: 19881231,
      birthYear: '1990',
      birthMonth: '1',
      birthDay: '2',
      deathDate: 20240115,
      deathYear: '2024',
      deathMonth: '1',
      deathDay: '15'
    }

    const calculatedAge = calculateDeathAgeFromDates(explicitDateOrderForm)

    assert.strictEqual(calculatedAge.deathAge, 34)
    assert.strictEqual(calculatedAge.deathAgePeriod, 'Years')
  })
})
