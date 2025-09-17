import assert from 'node:assert'
import { after, describe, it } from 'node:test'

import sqlite from 'better-sqlite3'

import getContract from '../database/getContract.js'
import getContractAttachment from '../database/getContractAttachment.js'
import getContractAttachments from '../database/getContractAttachments.js'
import getContractComments from '../database/getContractComments.js'
import getContractFees from '../database/getContractFees.js'
import getContractFields from '../database/getContractFields.js'
import getContractInterments from '../database/getContractInterments.js'
import getContractMetadataByContractId from '../database/getContractMetadataByContractId.js'
import getContracts, {
  type GetContractsOptions
} from '../database/getContracts.js'
import getContractTransactions from '../database/getContractTransactions.js'
import getNextContractId from '../database/getNextContractId.js'
import getPreviousContractId from '../database/getPreviousContractId.js'
import { sunriseDB } from '../helpers/database.helpers.js'

await describe('database/contracts', async () => {
  const database = sqlite(sunriseDB, { readonly: true })

  after(() => {
    database.close()
  })

  await it('can execute getContract()', async () => {
    await getContract(1, database)
    assert.ok(true)
  })

  await it('can execute getContractAttachment()', () => {
    getContractAttachment(1, database)
    assert.ok(true)
  })

  await it('can execute getContractAttachments()', () => {
    getContractAttachments(1, database)
    assert.ok(true)
  })

  await it('can execute getContractComments()', () => {
    getContractComments(1, database)
    assert.ok(true)
  })

  await it('can execute getContractComments()', () => {
    getContractComments(1, database)
    assert.ok(true)
  })

  await it('can execute getContractFees()', () => {
    getContractFees(1, database)
    assert.ok(true)
  })

  await it('can execute getContractFields()', () => {
    getContractFields(1, database)
    assert.ok(true)
  })

  await it('can execute getContractInterments()', () => {
    getContractInterments(1, database)
    assert.ok(true)
  })

  await it('can execute getContractMetadataByContractId()', () => {
    getContractMetadataByContractId(1, '', database)
    assert.ok(true)
  })

  await it('can execute getContractTransactions()', async () => {
    await getContractTransactions(1, { includeIntegrations: true }, database)
    assert.ok(true)
  })

  await describe('can execute getContracts()', async () => {
    const options: GetContractsOptions = {
      limit: 10,
      offset: 0,

      includeFees: true,
      includeInterments: true,
      includeTransactions: true
    }

    await it('executes without filters', async () => {
      await getContracts({}, options, database)
      assert.ok(true)
    })

    await it('executes with burialSiteId filter', async () => {
      await getContracts({ burialSiteId: '1' }, options, database)
      assert.ok(true)
    })

    await it('executes with contractEffectiveDateString filter', async () => {
      await getContracts(
        { contractEffectiveDateString: '2023-01-01' },
        options,
        database
      )
      assert.ok(true)
    })

    await it('executes with contractStartDateString filter', async () => {
      await getContracts(
        { contractStartDateString: '2023-01-01' },
        options,
        database
      )
      assert.ok(true)
    })

    await it('executes with contractTime filter', async () => {
      await getContracts({ contractTime: 'current' }, options, database)
      assert.ok(true)
    })

    await it('executes with cemeteryId filter', async () => {
      await getContracts({ cemeteryId: '1' }, options, database)
      assert.ok(true)
    })

    await it('executes with contractTypeId filter', async () => {
      await getContracts({ contractTypeId: '1' }, options, database)
      assert.ok(true)
    })

    await it('executes with deceasedName filter', async () => {
      await getContracts({ deceasedName: 'John Doe' }, options, database)
      assert.ok(true)
    })

    await it('executes with purchaserName filter', async () => {
      await getContracts({ purchaserName: 'Jane Doe' }, options, database)
      assert.ok(true)
    })

    await it('executes with burialSiteName filter', async () => {
      await getContracts({ burialSiteName: 'CEM' }, options, database)
      assert.ok(true)
    })

    await it('executes with burialSiteTypeId filter', async () => {
      await getContracts({ burialSiteTypeId: '1' }, options, database)
      assert.ok(true)
    })

    await it('executes with funeralHomeId filter', async () => {
      await getContracts({ funeralHomeId: '1' }, options, database)
      assert.ok(true)
    })

    await it('executes with funeralTime filter', async () => {
      await getContracts({ funeralTime: 'upcoming' }, options, database)
      assert.ok(true)
    })

    await it('executes with workOrderId filter', async () => {
      await getContracts({ workOrderId: '1' }, options, database)
      assert.ok(true)
    })

    await it('executes with notWorkOrderId filter', async () => {
      await getContracts({ notWorkOrderId: '1' }, options, database)
      assert.ok(true)
    })

    await it('executes with notContractId filter', async () => {
      await getContracts({ notContractId: '1' }, options, database)
      assert.ok(true)
    })

    await it('executes with relatedContractId filter', async () => {
      await getContracts({ relatedContractId: '1' }, options, database)
      assert.ok(true)
    })

    await it('executes with notRelatedContractId filter', async () => {
      await getContracts({ notRelatedContractId: '1' }, options, database)
      assert.ok(true)
    })
  })

  await it('can execute getPreviousContractId()', () => {
    getPreviousContractId(1, database)
    assert.ok(true)
  })

  await it('can execute getNextContractId()', () => {
    getNextContractId(1, database)
    assert.ok(true)
  })
})
