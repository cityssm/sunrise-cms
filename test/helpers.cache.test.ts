import { before, describe, it } from 'node:test'

import * as cacheFunctions from '../helpers/cache.helpers.js'
import {
  getCachedBurialSiteStatusByBurialSiteStatus,
  getCachedBurialSiteStatusById,
  getCachedBurialSiteStatuses
} from '../helpers/cache/burialSiteStatuses.cache.js'
import {
  getCachedBurialSiteTypeById,
  getCachedBurialSiteTypes,
  getCachedBurialSiteTypesByBurialSiteType
} from '../helpers/cache/burialSiteTypes.cache.js'
import {
  getCachedContractTypeByContractType,
  getCachedContractTypeById,
  getCachedContractTypes
} from '../helpers/cache/contractTypes.cache.js'
import {
  getCachedWorkOrderMilestoneTypeById,
  getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType,
  getCachedWorkOrderMilestoneTypes
} from '../helpers/cache/workOrderMilestoneTypes.cache.js'
import {
  getCachedWorkOrderTypeById,
  getCachedWorkOrderTypes
} from '../helpers/cache/workOrderTypes.cache.js'

await describe('helpers.cache', async () => {
  const badId = -3
  // eslint-disable-next-line no-secrets/no-secrets, @cspell/spellchecker
  const badName = 'qwertyuiopasdfghjklzxcvbnm'

  before(() => {
    cacheFunctions.clearCaches()
  })

  await describe('Burial Site Statuses', async () => {
    await it('returns Burial Site Statuses', () => {
      cacheFunctions.clearCacheByTableName('BurialSiteStatuses')

      const burialSiteStatuses = getCachedBurialSiteStatuses()

      assert.ok(burialSiteStatuses.length > 0)

      for (const burialSiteStatus of burialSiteStatuses) {
        const byId = getCachedBurialSiteStatusById(
          burialSiteStatus.burialSiteStatusId
        )
        assert.strictEqual(
          burialSiteStatus.burialSiteStatusId,
          byId?.burialSiteStatusId
        )

        const byName = getCachedBurialSiteStatusByBurialSiteStatus(
          burialSiteStatus.burialSiteStatus
        )
        assert.strictEqual(
          burialSiteStatus.burialSiteStatus,
          byName?.burialSiteStatus
        )
      }
    })

    await it('returns undefined with a bad burialSiteStatusId', () => {
      const byBadId = getCachedBurialSiteStatusById(badId)
      assert.ok(byBadId === undefined)
    })

    await it('returns undefined with a bad lotStatus', () => {
      const byBadName = getCachedBurialSiteStatusByBurialSiteStatus(badName)
      assert.ok(byBadName === undefined)
    })
  })

  await describe('Burial Site Types', async () => {
    await it('returns Burial Site Types', () => {
      cacheFunctions.clearCacheByTableName('BurialSiteTypes')

      const burialSiteTypes = getCachedBurialSiteTypes()

      assert.ok(burialSiteTypes.length > 0)

      for (const burialSiteType of burialSiteTypes) {
        const byId = getCachedBurialSiteTypeById(burialSiteType.burialSiteTypeId)
        assert.strictEqual(
          burialSiteType.burialSiteTypeId,
          byId?.burialSiteTypeId
        )

        const byName = getCachedBurialSiteTypesByBurialSiteType(
          burialSiteType.burialSiteType
        )
        assert.strictEqual(
          burialSiteType.burialSiteType,
          byName?.burialSiteType
        )
      }
    })

    await it('returns undefined with a bad burialSiteTypeId', () => {
      const byBadId = getCachedBurialSiteTypeById(badId)
      assert.ok(byBadId === undefined)
    })

    await it('returns undefined with a bad lotType', () => {
      const byBadName = getCachedBurialSiteTypesByBurialSiteType(badName)
      assert.ok(byBadName === undefined)
    })
  })

  await describe('Contract Types', async () => {
    await it('returns Contract Types', () => {
      cacheFunctions.clearCacheByTableName('ContractTypes')

      const contractTypes = getCachedContractTypes()

      assert.ok(contractTypes.length > 0)

      for (const contractType of contractTypes) {
        const byId = getCachedContractTypeById(contractType.contractTypeId)
        assert.strictEqual(contractType.contractTypeId, byId?.contractTypeId)

        const byName = getCachedContractTypeByContractType(contractType.contractType)
        assert.strictEqual(contractType.contractType, byName?.contractType)
      }
    })

    await it('returns undefined with a bad contractTypeId', () => {
      const byBadId = getCachedContractTypeById(badId)
      assert.ok(byBadId === undefined)
    })

    await it('returns undefined with a bad contractType', () => {
      const byBadName = getCachedContractTypeByContractType(badName)
      assert.ok(byBadName === undefined)
    })
  })

  await describe('Work Order Types', async () => {
    await it('returns Work Order Types', () => {
      cacheFunctions.clearCacheByTableName('WorkOrderTypes')

      const workOrderTypes = getCachedWorkOrderTypes()

      assert.ok(workOrderTypes.length > 0)

      for (const workOrderType of workOrderTypes) {
        const byId = getCachedWorkOrderTypeById(workOrderType.workOrderTypeId)
        assert.strictEqual(workOrderType.workOrderTypeId, byId?.workOrderTypeId)
      }
    })

    await it('returns undefined with a bad workOrderTypeId', () => {
      const byBadId = getCachedWorkOrderTypeById(badId)
      assert.ok(byBadId === undefined)
    })
  })

  await describe('Work Order Milestone Types', async () => {
    await it('returns Work Order Milestone Types', () => {
      cacheFunctions.clearCacheByTableName('WorkOrderMilestoneTypes')

      const workOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes()

      assert.ok(workOrderMilestoneTypes.length > 0)

      for (const workOrderMilestoneType of workOrderMilestoneTypes) {
        const byId = getCachedWorkOrderMilestoneTypeById(
          workOrderMilestoneType.workOrderMilestoneTypeId
        )
        assert.strictEqual(
          workOrderMilestoneType.workOrderMilestoneTypeId,
          byId?.workOrderMilestoneTypeId
        )

        const byName = getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType(
          workOrderMilestoneType.workOrderMilestoneType
        )
        assert.strictEqual(
          workOrderMilestoneType.workOrderMilestoneType,
          byName?.workOrderMilestoneType
        )
      }
    })

    await it('returns undefined with a bad workOrderMilestoneTypeId', () => {
      const byBadId = getCachedWorkOrderMilestoneTypeById(badId)
      assert.ok(byBadId === undefined)
    })

    await it('returns undefined with a bad workOrderMilestoneType', () => {
      const byBadName =
        getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType(badName)
      assert.ok(byBadName === undefined)
    })
  })
})
