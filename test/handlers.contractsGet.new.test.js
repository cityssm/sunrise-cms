import assert from 'node:assert';
import { describe, it } from 'node:test';
import { calculateDeathAgeFromDates } from '../handlers/contractsGet/new.js';
await describe('handlers/contractsGet/new', async () => {
    await it('uses stored birthDate/deathDate values when explicit parts are absent', () => {
        const dateBasedOrderForm = {
            birthDateString: '1988-12-31',
            deathDateString: '2024-01-15',
            birthPlace: 'Toronto',
            deathPlace: 'Sault Ste. Marie'
        };
        const calculatedAge = calculateDeathAgeFromDates(dateBasedOrderForm);
        assert.strictEqual(calculatedAge.deathAge, 35);
        assert.strictEqual(calculatedAge.deathAgePeriod, 'Years');
    });
});
