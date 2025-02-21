import assert from 'node:assert'
import fs from 'node:fs'

// skipcq: JS-C1003 - Testing functions
import * as cacheFunctions from '../helpers/functions.cache.js'
// skipcq: JS-C1003 - Testing functions
import * as sqlFilterFunctions from '../helpers/functions.sqlFilters.js'
// skipcq: JS-C1003 - Testing functions
import * as userFunctions from '../helpers/functions.user.js'

describe('functions.cache', () => {
  const badId = -3
  // eslint-disable-next-line no-secrets/no-secrets
  const badName = 'qwertyuiopasdfghjklzxcvbnm'

  before(() => {
    cacheFunctions.clearCaches()
  })

  describe('Lot Occupant Types', () => {
    it('returns Lot Occupant Types', async () => {
      cacheFunctions.clearCacheByTableName('LotOccupantTypes')

      const lotOccupantTypes = await cacheFunctions.getLotOccupantTypes()

      assert.ok(lotOccupantTypes.length > 0)

      for (const lotOccupantType of lotOccupantTypes) {
        const byId = await cacheFunctions.getLotOccupantTypeById(
          lotOccupantType.lotOccupantTypeId
        )
        assert.strictEqual(
          lotOccupantType.lotOccupantTypeId,
          byId?.lotOccupantTypeId
        )

        const byName = await cacheFunctions.getLotOccupantTypeByLotOccupantType(
          lotOccupantType.lotOccupantType
        )
        assert.strictEqual(
          lotOccupantType.lotOccupantType,
          byName?.lotOccupantType
        )
      }
    })

    it('returns undefined with a bad lotOccupantTypeId', async () => {
      const byBadId = await cacheFunctions.getLotOccupantTypeById(badId)
      assert.ok(byBadId === undefined)
    })

    it('returns undefined with a bad lotOccupantType', async () => {
      const byBadName =
        await cacheFunctions.getLotOccupantTypeByLotOccupantType(badName)
      assert.ok(byBadName === undefined)
    })
  })

  describe('Lot Statuses', () => {
    it('returns Lot Statuses', async () => {
      cacheFunctions.clearCacheByTableName('LotStatuses')

      const lotStatuses = await cacheFunctions.getLotStatuses()

      assert.ok(lotStatuses.length > 0)

      for (const lotStatus of lotStatuses) {
        const byId = await cacheFunctions.getLotStatusById(
          lotStatus.lotStatusId
        )
        assert.strictEqual(lotStatus.lotStatusId, byId?.lotStatusId)

        const byName = await cacheFunctions.getLotStatusByLotStatus(
          lotStatus.lotStatus
        )
        assert.strictEqual(lotStatus.lotStatus, byName?.lotStatus)
      }
    })

    it('returns undefined with a bad lotStatusId', async () => {
      const byBadId = await cacheFunctions.getLotStatusById(badId)
      assert.ok(byBadId === undefined)
    })

    it('returns undefined with a bad lotStatus', async () => {
      const byBadName = await cacheFunctions.getLotStatusByLotStatus(badName)
      assert.ok(byBadName === undefined)
    })
  })

  describe('Lot Types', () => {
    it('returns Lot Types', async () => {
      cacheFunctions.clearCacheByTableName('LotTypes')

      const lotTypes = await cacheFunctions.getLotTypes()

      assert.ok(lotTypes.length > 0)

      for (const lotType of lotTypes) {
        const byId = await cacheFunctions.getLotTypeById(lotType.lotTypeId)
        assert.strictEqual(lotType.lotTypeId, byId?.lotTypeId)

        const byName = await cacheFunctions.getLotTypesByLotType(
          lotType.lotType
        )
        assert.strictEqual(lotType.lotType, byName?.lotType)
      }
    })

    it('returns undefined with a bad lotTypeId', async () => {
      const byBadId = await cacheFunctions.getLotTypeById(badId)
      assert.ok(byBadId === undefined)
    })

    it('returns undefined with a bad lotType', async () => {
      const byBadName = await cacheFunctions.getLotTypesByLotType(badName)
      assert.ok(byBadName === undefined)
    })
  })

  describe('Occupancy Types', () => {
    it('returns Occupancy Types', async () => {
      cacheFunctions.clearCacheByTableName('OccupancyTypes')

      const occupancyTypes = await cacheFunctions.getOccupancyTypes()

      assert.ok(occupancyTypes.length > 0)

      for (const occupancyType of occupancyTypes) {
        const byId = await cacheFunctions.getOccupancyTypeById(
          occupancyType.occupancyTypeId
        )
        assert.strictEqual(occupancyType.occupancyTypeId, byId?.occupancyTypeId)

        const byName = await cacheFunctions.getOccupancyTypeByOccupancyType(
          occupancyType.occupancyType
        )
        assert.strictEqual(occupancyType.occupancyType, byName?.occupancyType)
      }
    })

    it('returns undefined with a bad occupancyTypeId', async () => {
      const byBadId = await cacheFunctions.getOccupancyTypeById(badId)
      assert.ok(byBadId === undefined)
    })

    it('returns undefined with a bad occupancyType', async () => {
      const byBadName = await cacheFunctions.getOccupancyTypeByOccupancyType(
        badName
      )
      assert.ok(byBadName === undefined)
    })
  })

  describe('Work Order Types', () => {
    it('returns Work Order Types', async () => {
      cacheFunctions.clearCacheByTableName('WorkOrderTypes')

      const workOrderTypes = await cacheFunctions.getWorkOrderTypes()

      assert.ok(workOrderTypes.length > 0)

      for (const workOrderType of workOrderTypes) {
        const byId = await cacheFunctions.getWorkOrderTypeById(
          workOrderType.workOrderTypeId
        )
        assert.strictEqual(workOrderType.workOrderTypeId, byId?.workOrderTypeId)
      }
    })

    it('returns undefined with a bad workOrderTypeId', async () => {
      const byBadId = await cacheFunctions.getWorkOrderTypeById(badId)
      assert.ok(byBadId === undefined)
    })
  })

  describe('Work Order Milestone Types', () => {
    it('returns Work Order Milestone Types', async () => {
      cacheFunctions.clearCacheByTableName('WorkOrderMilestoneTypes')

      const workOrderMilestoneTypes =
        await cacheFunctions.getWorkOrderMilestoneTypes()

      assert.ok(workOrderMilestoneTypes.length > 0)

      for (const workOrderMilestoneType of workOrderMilestoneTypes) {
        const byId = await cacheFunctions.getWorkOrderMilestoneTypeById(
          workOrderMilestoneType.workOrderMilestoneTypeId
        )
        assert.strictEqual(
          workOrderMilestoneType.workOrderMilestoneTypeId,
          byId?.workOrderMilestoneTypeId
        )

        const byName =
          await cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType(
            workOrderMilestoneType.workOrderMilestoneType
          )
        assert.strictEqual(
          workOrderMilestoneType.workOrderMilestoneType,
          byName?.workOrderMilestoneType
        )
      }
    })

    it('returns undefined with a bad workOrderMilestoneTypeId', async () => {
      const byBadId = await cacheFunctions.getWorkOrderMilestoneTypeById(badId)
      assert.ok(byBadId === undefined)
    })

    it('returns undefined with a bad workOrderMilestoneType', async () => {
      const byBadName =
        await cacheFunctions.getWorkOrderMilestoneTypeByWorkOrderMilestoneType(
          badName
        )
      assert.ok(byBadName === undefined)
    })
  })
})

describe('functions.sqlFilters', () => {
  describe('LotName filter', () => {
    it('returns startsWith filter', () => {
      const filter = sqlFilterFunctions.getLotNameWhereClause(
        'TEST1 TEST2',
        'startsWith',
        'l'
      )

      assert.strictEqual(filter.sqlWhereClause, " and l.lotName like ? || '%'")
      assert.strictEqual(filter.sqlParameters.length, 1)
      assert.ok(filter.sqlParameters.includes('TEST1 TEST2'))
    })

    it('returns endsWith filter', () => {
      const filter = sqlFilterFunctions.getLotNameWhereClause(
        'TEST1 TEST2',
        'endsWith',
        'l'
      )

      assert.strictEqual(filter.sqlWhereClause, " and l.lotName like '%' || ?")
      assert.strictEqual(filter.sqlParameters.length, 1)
      assert.strictEqual(filter.sqlParameters[0], 'TEST1 TEST2')
    })

    it('returns contains filter', () => {
      const filter = sqlFilterFunctions.getLotNameWhereClause(
        'TEST1 TEST2',
        '',
        'l'
      )
      assert.strictEqual(
        filter.sqlWhereClause,
        ' and instr(lower(l.lotName), ?) and instr(lower(l.lotName), ?)'
      )

      assert.ok(filter.sqlParameters.includes('test1'))
      assert.ok(filter.sqlParameters.includes('test2'))
    })

    it('handles empty filter', () => {
      const filter = sqlFilterFunctions.getLotNameWhereClause('', '')

      assert.strictEqual(filter.sqlWhereClause, '')
      assert.strictEqual(filter.sqlParameters.length, 0)
    })

    it('handles undefined filter', () => {
      const filter = sqlFilterFunctions.getLotNameWhereClause(
        undefined,
        undefined,
        'l'
      )

      assert.strictEqual(filter.sqlWhereClause, '')
      assert.strictEqual(filter.sqlParameters.length, 0)
    })
  })

  describe('OccupancyTime filter', () => {
    it('creates three different filters', () => {
      const currentFilter =
        sqlFilterFunctions.getOccupancyTimeWhereClause('current')
      assert.notStrictEqual(currentFilter.sqlWhereClause, '')

      const pastFilter = sqlFilterFunctions.getOccupancyTimeWhereClause('past')
      assert.notStrictEqual(pastFilter.sqlWhereClause, '')

      const futureFilter =
        sqlFilterFunctions.getOccupancyTimeWhereClause('future')
      assert.notStrictEqual(futureFilter, '')

      assert.notStrictEqual(
        currentFilter.sqlWhereClause,
        pastFilter.sqlWhereClause
      )
      assert.notStrictEqual(
        currentFilter.sqlWhereClause,
        futureFilter.sqlWhereClause
      )
      assert.notStrictEqual(
        pastFilter.sqlWhereClause,
        futureFilter.sqlWhereClause
      )
    })

    it('handles empty filter', () => {
      const filter = sqlFilterFunctions.getOccupancyTimeWhereClause('')
      assert.strictEqual(filter.sqlWhereClause, '')
      assert.strictEqual(filter.sqlParameters.length, 0)
    })

    it('handles undefined filter', () => {
      const filter = sqlFilterFunctions.getOccupancyTimeWhereClause(
        undefined,
        'o'
      )
      assert.strictEqual(filter.sqlWhereClause, '')
      assert.strictEqual(filter.sqlParameters.length, 0)
    })
  })

  describe('OccupantName filter', () => {
    it('returns filter', () => {
      const filter = sqlFilterFunctions.getOccupantNameWhereClause(
        'TEST1 TEST2',
        'o'
      )

      assert.strictEqual(
        filter.sqlWhereClause,
        ' and (instr(lower(o.occupantName), ?) or instr(lower(o.occupantFamilyName), ?)) and (instr(lower(o.occupantName), ?) or instr(lower(o.occupantFamilyName), ?))'
      )

      assert.ok(filter.sqlParameters.length === 4)

      assert.ok(filter.sqlParameters.includes('test1'))
      assert.ok(filter.sqlParameters.includes('test2'))
    })

    it('handles empty filter', () => {
      const filter = sqlFilterFunctions.getOccupantNameWhereClause('')

      assert.strictEqual(filter.sqlWhereClause, '')
      assert.strictEqual(filter.sqlParameters.length, 0)
    })

    it('handles undefined filter', () => {
      const filter = sqlFilterFunctions.getOccupantNameWhereClause(
        undefined,
        'o'
      )

      assert.strictEqual(filter.sqlWhereClause, '')
      assert.strictEqual(filter.sqlParameters.length, 0)
    })
  })
})

describe('functions.user', () => {
  describe('unauthenticated, no user in session', () => {
    const noUserRequest = {
      session: {}
    }

    it('can not update', () => {
      assert.strictEqual(userFunctions.userCanUpdate(noUserRequest), false)
    })

    it('is not admin', () => {
      assert.strictEqual(userFunctions.userIsAdmin(noUserRequest), false)
    })
  })

  describe('read only user, no update, no admin', () => {
    const readOnlyRequest: userFunctions.UserRequest = {
      session: {
        user: {
          userName: '*test',
          userProperties: {
            canUpdate: false,
            isAdmin: false,
            apiKey: ''
          }
        }
      }
    }

    it('can not update', () => {
      assert.strictEqual(userFunctions.userCanUpdate(readOnlyRequest), false)
    })

    it('is not admin', () => {
      assert.strictEqual(userFunctions.userIsAdmin(readOnlyRequest), false)
    })
  })

  describe('update only user, no admin', () => {
    const updateOnlyRequest: userFunctions.UserRequest = {
      session: {
        user: {
          userName: '*test',
          userProperties: {
            canUpdate: true,
            isAdmin: false,
            apiKey: ''
          }
        }
      }
    }

    it('can update', () => {
      assert.strictEqual(userFunctions.userCanUpdate(updateOnlyRequest), true)
    })

    it('is not admin', () => {
      assert.strictEqual(userFunctions.userIsAdmin(updateOnlyRequest), false)
    })
  })

  describe('admin only user, no update', () => {
    const adminOnlyRequest: userFunctions.UserRequest = {
      session: {
        user: {
          userName: '*test',
          userProperties: {
            canUpdate: false,
            isAdmin: true,
            apiKey: ''
          }
        }
      }
    }

    it('can not update', () => {
      assert.strictEqual(userFunctions.userCanUpdate(adminOnlyRequest), false)
    })

    it('is admin', () => {
      assert.strictEqual(userFunctions.userIsAdmin(adminOnlyRequest), true)
    })
  })

  describe('update admin user', () => {
    const updateAdminRequest: userFunctions.UserRequest = {
      session: {
        user: {
          userName: '*test',
          userProperties: {
            canUpdate: true,
            isAdmin: true,
            apiKey: ''
          }
        }
      }
    }

    it('can update', () => {
      assert.strictEqual(userFunctions.userCanUpdate(updateAdminRequest), true)
    })

    it('is admin', () => {
      assert.strictEqual(userFunctions.userIsAdmin(updateAdminRequest), true)
    })
  })

  describe('API key check', () => {
    it('authenticates with a valid API key', async () => {
      const apiKeysJSON: Record<string, string> = JSON.parse(
        fs.readFileSync('data/apiKeys.json', 'utf8')
      ) as Record<string, string>

      const apiKey = Object.values(apiKeysJSON)[0]

      const apiRequest: userFunctions.APIRequest = {
        params: {
          apiKey
        }
      }

      assert.strictEqual(await userFunctions.apiKeyIsValid(apiRequest), true)
    })

    it('fails to authenticate with an invalid API key', async () => {
      const apiRequest: userFunctions.APIRequest = {
        params: {
          apiKey: 'badKey'
        }
      }

      assert.strictEqual(await userFunctions.apiKeyIsValid(apiRequest), false)
    })

    it('fails to authenticate with no API key', async () => {
      const apiRequest: userFunctions.APIRequest = {
        params: {}
      }

      assert.strictEqual(await userFunctions.apiKeyIsValid(apiRequest), false)
    })
  })
})
