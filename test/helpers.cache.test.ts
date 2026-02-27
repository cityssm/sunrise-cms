import assert from 'node:assert'
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
  getCachedCommittalTypeById,
  getCachedCommittalTypes
} from '../helpers/cache/committalTypes.cache.js'
import {
  getCachedContractTypeByContractType,
  getCachedContractTypeById,
  getCachedContractTypes
} from '../helpers/cache/contractTypes.cache.js'
import {
  getCachedIntermentContainerTypeById,
  getCachedIntermentContainerTypes
} from '../helpers/cache/intermentContainerTypes.cache.js'
import {
  getCachedIntermentDepthById,
  getCachedIntermentDepths
} from '../helpers/cache/intermentDepths.cache.js'
import {
  getCachedServiceTypeById,
  getCachedServiceTypeByServiceType,
  getCachedServiceTypes
} from '../helpers/cache/serviceTypes.cache.js'
import {
  getCachedSetting,
  getCachedSettingValue,
  getCachedSettings
} from '../helpers/cache/settings.cache.js'
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

      assert.notStrictEqual(
        burialSiteStatuses.length,
        0,
        'Expected burial site statuses to be cached'
      )

      for (const burialSiteStatus of burialSiteStatuses) {
        const byId = getCachedBurialSiteStatusById(
          burialSiteStatus.burialSiteStatusId
        )
        assert.strictEqual(
          burialSiteStatus.burialSiteStatusId,
          byId?.burialSiteStatusId,
          'Expected burial site status ID to match'
        )

        const byName = getCachedBurialSiteStatusByBurialSiteStatus(
          burialSiteStatus.burialSiteStatus
        )
        assert.strictEqual(
          burialSiteStatus.burialSiteStatus,
          byName?.burialSiteStatus,
          'Expected burial site status to match'
        )
      }
    })

    await it('returns undefined with a bad burialSiteStatusId', () => {
      const byBadId = getCachedBurialSiteStatusById(badId)
      assert.strictEqual(byBadId, undefined, 'Expected undefined for bad burialSiteStatusId')
    })

    await it('returns undefined with a bad burialSiteStatus', () => {
      const byBadName = getCachedBurialSiteStatusByBurialSiteStatus(badName)
      assert.strictEqual(byBadName, undefined, 'Expected undefined for bad burialSiteStatus')
    })
  })

  await describe('Burial Site Types', async () => {
    await it('returns Burial Site Types', () => {
      cacheFunctions.clearCacheByTableName('BurialSiteTypes')

      const burialSiteTypes = getCachedBurialSiteTypes()

      assert.notStrictEqual(
        burialSiteTypes.length,
        0,
        'Expected burial site types to be cached'
      )

      for (const burialSiteType of burialSiteTypes) {
        const byId = getCachedBurialSiteTypeById(
          burialSiteType.burialSiteTypeId
        )

        assert.strictEqual(
          burialSiteType.burialSiteTypeId,
          byId?.burialSiteTypeId,
          'Expected burial site type ID to match'
        )

        const byName = getCachedBurialSiteTypesByBurialSiteType(
          burialSiteType.burialSiteType
        )
        assert.strictEqual(
          burialSiteType.burialSiteType,
          byName?.burialSiteType,
          'Expected burial site type to match'
        )
      }
    })

    await it('returns undefined with a bad burialSiteTypeId', () => {
      const byBadId = getCachedBurialSiteTypeById(badId)
      assert.strictEqual(byBadId, undefined, 'Expected undefined for bad burialSiteTypeId')
    })

    await it('returns undefined with a bad burialSiteType', () => {
      const byBadName = getCachedBurialSiteTypesByBurialSiteType(badName)
      assert.strictEqual(byBadName, undefined, 'Expected undefined for bad burialSiteType')
    })
  })

  await describe('Committal Types', async () => {
    await it('returns Committal Types', () => {
      cacheFunctions.clearCacheByTableName('CommittalTypes')

      const committalTypes = getCachedCommittalTypes()

      assert.notStrictEqual(
        committalTypes.length,
        0,
        'Expected committal types to be cached'
      )

      for (const committalType of committalTypes) {
        const byId = getCachedCommittalTypeById(committalType.committalTypeId)
        assert.strictEqual(
          committalType.committalTypeId,
          byId?.committalTypeId,
          'Expected committal type ID to match'
        )
      }
    })

    await it('returns undefined with a bad committalTypeId', () => {
      const byBadId = getCachedCommittalTypeById(badId)
      assert.strictEqual(byBadId, undefined, 'Expected undefined for bad committalTypeId')
    })
  })

  await describe('Contract Types', async () => {
    await it('returns Contract Types', () => {
      cacheFunctions.clearCacheByTableName('ContractTypes')

      const contractTypes = getCachedContractTypes()

      assert.notStrictEqual(
        contractTypes.length,
        0,
        'Expected contract types to be cached'
      )

      for (const contractType of contractTypes) {
        const byId = getCachedContractTypeById(contractType.contractTypeId)
        assert.strictEqual(
          contractType.contractTypeId,
          byId?.contractTypeId,
          'Expected contract type ID to match'
        )

        const byName = getCachedContractTypeByContractType(
          contractType.contractType
        )
        assert.strictEqual(
          contractType.contractType,
          byName?.contractType,
          'Expected contract type to match'
        )
      }
    })

    await it('returns undefined with a bad contractTypeId', () => {
      const byBadId = getCachedContractTypeById(badId)
      assert.strictEqual(byBadId, undefined, 'Expected undefined for bad contractTypeId')
    })

    await it('returns undefined with a bad contractType', () => {
      const byBadName = getCachedContractTypeByContractType(badName)
      assert.strictEqual(byBadName, undefined, 'Expected undefined for bad contractType')
    })
  })

  await describe('Interment Container Types', async () => {
    await it('returns Interment Container Types', () => {
      cacheFunctions.clearCacheByTableName('IntermentContainerTypes')

      const intermentContainerTypes = getCachedIntermentContainerTypes()

      assert.notStrictEqual(
        intermentContainerTypes.length,
        0,
        'Expected interment container types to be cached'
      )

      for (const intermentContainerType of intermentContainerTypes) {
        const byId = getCachedIntermentContainerTypeById(
          intermentContainerType.intermentContainerTypeId
        )
        assert.strictEqual(
          intermentContainerType.intermentContainerTypeId,
          byId?.intermentContainerTypeId,
          'Expected interment container type ID to match'
        )
      }
    })

    await it('returns undefined with a bad intermentContainerTypeId', () => {
      const byBadId = getCachedIntermentContainerTypeById(badId)
      assert.strictEqual(
        byBadId,
        undefined,
        'Expected undefined for bad intermentContainerTypeId'
      )
    })
  })

  await describe('Interment Depths', async () => {
    await it('returns Interment Depths', () => {
      cacheFunctions.clearCacheByTableName('IntermentDepths')

      const intermentDepths = getCachedIntermentDepths()

      assert.notStrictEqual(
        intermentDepths.length,
        0,
        'Expected interment depths to be cached'
      )

      for (const intermentDepth of intermentDepths) {
        const byId = getCachedIntermentDepthById(intermentDepth.intermentDepthId)
        assert.strictEqual(
          intermentDepth.intermentDepthId,
          byId?.intermentDepthId,
          'Expected interment depth ID to match'
        )
      }
    })

    await it('returns undefined with a bad intermentDepthId', () => {
      const byBadId = getCachedIntermentDepthById(badId)
      assert.strictEqual(byBadId, undefined, 'Expected undefined for bad intermentDepthId')
    })
  })

  await describe('Service Types', async () => {
    await it('returns Service Types', () => {
      cacheFunctions.clearCacheByTableName('ServiceTypes')

      const serviceTypes = getCachedServiceTypes()

      assert.notStrictEqual(
        serviceTypes.length,
        0,
        'Expected service types to be cached'
      )

      for (const serviceType of serviceTypes) {
        const byId = getCachedServiceTypeById(serviceType.serviceTypeId)
        assert.strictEqual(
          serviceType.serviceTypeId,
          byId?.serviceTypeId,
          'Expected service type ID to match'
        )

        const byName = getCachedServiceTypeByServiceType(serviceType.serviceType)
        assert.strictEqual(
          serviceType.serviceType,
          byName?.serviceType,
          'Expected service type to match'
        )
      }
    })

    await it('returns undefined with a bad serviceTypeId', () => {
      const byBadId = getCachedServiceTypeById(badId)
      assert.strictEqual(byBadId, undefined, 'Expected undefined for bad serviceTypeId')
    })

    await it('returns undefined with a bad serviceType', () => {
      const byBadName = getCachedServiceTypeByServiceType(badName)
      assert.strictEqual(byBadName, undefined, 'Expected undefined for bad serviceType')
    })
  })

  await describe('Settings', async () => {
    await it('returns Settings', () => {
      cacheFunctions.clearCacheByTableName('SunriseSettings')

      const settings = getCachedSettings()

      assert.notStrictEqual(settings.length, 0, 'Expected settings to be cached')
    })

    await it('returns a Setting by key', () => {
      const setting = getCachedSetting('aliases.externalReceiptNumber')
      assert.notStrictEqual(setting, undefined, 'Expected setting to be found by key')
      assert.strictEqual(
        setting.settingKey,
        'aliases.externalReceiptNumber',
        'Expected setting key to match'
      )
    })

    await it('returns a setting value by key', () => {
      const settingValue = getCachedSettingValue('aliases.externalReceiptNumber')
      assert.strictEqual(
        typeof settingValue,
        'string',
        'Expected setting value to be a string'
      )
    })
  })

  await describe('Work Order Types', async () => {
    await it('returns Work Order Types', () => {
      cacheFunctions.clearCacheByTableName('WorkOrderTypes')

      const workOrderTypes = getCachedWorkOrderTypes()

      assert.notStrictEqual(
        workOrderTypes.length,
        0,
        'Expected work order types to be cached'
      )

      for (const workOrderType of workOrderTypes) {
        const byId = getCachedWorkOrderTypeById(workOrderType.workOrderTypeId)
        assert.strictEqual(
          workOrderType.workOrderTypeId,
          byId?.workOrderTypeId,
          'Expected work order type ID to match'
        )
      }
    })

    await it('returns undefined with a bad workOrderTypeId', () => {
      const byBadId = getCachedWorkOrderTypeById(badId)
      assert.strictEqual(byBadId, undefined, 'Expected undefined for bad workOrderTypeId')
    })
  })

  await describe('Work Order Milestone Types', async () => {
    await it('returns Work Order Milestone Types', () => {
      cacheFunctions.clearCacheByTableName('WorkOrderMilestoneTypes')

      const workOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes()

      assert.notStrictEqual(
        workOrderMilestoneTypes.length,
        0,
        'Expected work order milestone types to be cached'
      )

      for (const workOrderMilestoneType of workOrderMilestoneTypes) {
        const byId = getCachedWorkOrderMilestoneTypeById(
          workOrderMilestoneType.workOrderMilestoneTypeId
        )
        assert.strictEqual(
          workOrderMilestoneType.workOrderMilestoneTypeId,
          byId?.workOrderMilestoneTypeId,
          'Expected work order milestone type ID to match'
        )

        const byName = getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType(
          workOrderMilestoneType.workOrderMilestoneType
        )
        assert.strictEqual(
          workOrderMilestoneType.workOrderMilestoneType,
          byName?.workOrderMilestoneType,
          'Expected work order milestone type to match'
        )
      }
    })

    await it('returns undefined with a bad workOrderMilestoneTypeId', () => {
      const byBadId = getCachedWorkOrderMilestoneTypeById(badId)
      assert.strictEqual(
        byBadId,
        undefined,
        'Expected undefined for bad workOrderMilestoneTypeId'
      )
    })

    await it('returns undefined with a bad workOrderMilestoneType', () => {
      const byBadName =
        getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType(badName)
      assert.strictEqual(
        byBadName,
        undefined,
        'Expected undefined for bad workOrderMilestoneType'
      )
    })
  })
})
