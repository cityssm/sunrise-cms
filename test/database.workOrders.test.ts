import assert from 'node:assert'
import { after, before, describe, it } from 'node:test'

import sqlite from 'better-sqlite3'

import addBurialSite from '../database/addBurialSite.js'
import addCemetery from '../database/addCemetery.js'
import addContract from '../database/addContract.js'
import addWorkOrder from '../database/addWorkOrder.js'
import addWorkOrderBurialSite from '../database/addWorkOrderBurialSite.js'
import addWorkOrderComment from '../database/addWorkOrderComment.js'
import addWorkOrderContract from '../database/addWorkOrderContract.js'
import addWorkOrderMilestone from '../database/addWorkOrderMilestone.js'
import closeWorkOrder from '../database/closeWorkOrder.js'
import completeWorkOrderMilestone from '../database/completeWorkOrderMilestone.js'
import deleteWorkOrderBurialSite from '../database/deleteWorkOrderBurialSite.js'
import deleteWorkOrderContract from '../database/deleteWorkOrderContract.js'
import getWorkOrder from '../database/getWorkOrder.js'
import getWorkOrderComments from '../database/getWorkOrderComments.js'
import getWorkOrderMilestones from '../database/getWorkOrderMilestones.js'
import { getWorkOrders, type GetWorkOrdersOptions } from '../database/getWorkOrders.js'
import reopenWorkOrder from '../database/reopenWorkOrder.js'
import reopenWorkOrderMilestone from '../database/reopenWorkOrderMilestone.js'
import updateWorkOrder from '../database/updateWorkOrder.js'
import updateWorkOrderComment from '../database/updateWorkOrderComment.js'
import updateWorkOrderMilestone from '../database/updateWorkOrderMilestone.js'
import { sunriseDB } from '../helpers/database.helpers.js'

const testUser: User = {
  userName: 'testUser',
  userProperties: {
    canUpdateCemeteries: true,
    canUpdateContracts: true,
    canUpdateWorkOrders: true,
    isAdmin: false
  },
  userSettings: {}
}

await describe('database/workOrders', async () => {
  const database = sqlite(sunriseDB, { readonly: true })

  after(() => {
    database.close()
  })

  await it('can execute getWorkOrder()', async () => {
    await getWorkOrder(1, { includeBurialSites: false, includeComments: false, includeMilestones: false }, database)
    assert.ok(true, 'getWorkOrder() executed without error')
  })

  await it('can execute getWorkOrderComments()', () => {
    getWorkOrderComments(1, database)
    assert.ok(true, 'getWorkOrderComments() executed without error')
  })

  await it('can execute getWorkOrderMilestones()', async () => {
    await getWorkOrderMilestones({ workOrderId: 1 }, { orderBy: 'date' }, database)
    assert.ok(true, 'getWorkOrderMilestones() executed without error')
  })

  await describe('can execute getWorkOrders()', async () => {
    const options: GetWorkOrdersOptions = {
      limit: 10,
      offset: 0,
      includeBurialSites: false,
      includeComments: false,
      includeMilestones: false
    }

    await it('executes without filters', async () => {
      await getWorkOrders({}, options, database)
      assert.ok(true, 'getWorkOrders() executed without filters')
    })

    await it('executes with workOrderTypeId filter', async () => {
      await getWorkOrders({ workOrderTypeId: '1' }, options, database)
      assert.ok(true, 'getWorkOrders() executed with workOrderTypeId filter')
    })

    await it('executes with workOrderOpenStatus open filter', async () => {
      await getWorkOrders({ workOrderOpenStatus: 'open' }, options, database)
      assert.ok(true, 'getWorkOrders() executed with workOrderOpenStatus open filter')
    })

    await it('executes with workOrderOpenStatus closed filter', async () => {
      await getWorkOrders({ workOrderOpenStatus: 'closed' }, options, database)
      assert.ok(true, 'getWorkOrders() executed with workOrderOpenStatus closed filter')
    })

    await it('executes with workOrderOpenDateString filter', async () => {
      await getWorkOrders({ workOrderOpenDateString: '2024-01-01' }, options, database)
      assert.ok(true, 'getWorkOrders() executed with workOrderOpenDateString filter')
    })

    await it('executes with workOrderMilestoneDateString filter', async () => {
      await getWorkOrders({ workOrderMilestoneDateString: '2024-01-01' }, options, database)
      assert.ok(true, 'getWorkOrders() executed with workOrderMilestoneDateString filter')
    })

    await it('executes with burialSiteName filter', async () => {
      await getWorkOrders({ burialSiteName: 'CEM' }, options, database)
      assert.ok(true, 'getWorkOrders() executed with burialSiteName filter')
    })

    await it('executes with cemeteryId filter', async () => {
      await getWorkOrders({ cemeteryId: '1' }, options, database)
      assert.ok(true, 'getWorkOrders() executed with cemeteryId filter')
    })

    await it('executes with contractId filter', async () => {
      await getWorkOrders({ contractId: '1' }, options, database)
      assert.ok(true, 'getWorkOrders() executed with contractId filter')
    })

    await it('executes with deceasedName filter', async () => {
      await getWorkOrders({ deceasedName: 'John Doe' }, options, database)
      assert.ok(true, 'getWorkOrders() executed with deceasedName filter')
    })

    await it('executes with funeralHomeId filter', async () => {
      await getWorkOrders({ funeralHomeId: '1' }, options, database)
      assert.ok(true, 'getWorkOrders() executed with funeralHomeId filter')
    })
  })

  await describe('Work Order Workflow', async () => {
    let burialSiteId: number
    let contractId: number
    let workOrderId: number
    let workOrderCommentId: number
    let workOrderMilestoneId: number

    before(() => {
      const cemeteryId = addCemetery(
        {
          cemeteryName: 'Work Order Test Cemetery',
          cemeteryKey: 'WOTEST',
          cemeteryDescription: '',
          parentCemeteryId: '',
          cemeteryLatitude: '',
          cemeteryLongitude: '',
          cemeterySvg: '',
          cemeteryAddress1: '',
          cemeteryAddress2: '',
          cemeteryCity: '',
          cemeteryPostalCode: '',
          cemeteryProvince: '',
          cemeteryPhoneNumber: ''
        },
        testUser
      )

      const burialSiteResult = addBurialSite(
        {
          cemeteryId,
          burialSiteTypeId: 1,
          burialSiteStatusId: 1,
          burialSiteNameSegment1: 'WO',
          burialSiteNameSegment2: '1'
        },
        testUser
      )
      burialSiteId = burialSiteResult.burialSiteId

      contractId = addContract(
        {
          contractTypeId: 1,
          burialSiteId,
          contractStartDateString: '2024-01-01',
          contractEndDateString: '',
          purchaserName: 'Work Order Test Purchaser'
        },
        testUser
      )
    })

    await it('creates a work order', () => {
      workOrderId = addWorkOrder(
        {
          workOrderTypeId: 1,
          workOrderDescription: 'Test Work Order',
          workOrderOpenDateString: '2024-01-01'
        },
        testUser
      )
      assert.notStrictEqual(workOrderId, 0, 'Expected a valid workOrderId to be returned')
    })

    await it('adds a work order comment', () => {
      workOrderCommentId = addWorkOrderComment(
        {
          workOrderId: workOrderId.toString(),
          comment: 'Test comment'
        },
        testUser
      )
      assert.notStrictEqual(
        workOrderCommentId,
        0,
        'Expected a valid workOrderCommentId to be returned'
      )
    })

    await it('adds a work order milestone', () => {
      workOrderMilestoneId = addWorkOrderMilestone(
        {
          workOrderId,
          workOrderMilestoneTypeId: 1,
          workOrderMilestoneDateString: '2024-01-15',
          workOrderMilestoneDescription: 'Test milestone'
        },
        testUser
      )
      assert.notStrictEqual(
        workOrderMilestoneId,
        0,
        'Expected a valid workOrderMilestoneId to be returned'
      )
    })

    await it('retrieves the created work order', async () => {
      const workOrder = await getWorkOrder(
        workOrderId,
        { includeBurialSites: false, includeComments: true, includeMilestones: true }
      )
      assert.notStrictEqual(workOrder, undefined, 'Expected work order to be retrievable')
      assert.strictEqual(
        workOrder?.workOrderDescription,
        'Test Work Order',
        'Expected work order description to match'
      )
    })

    await it('updates the work order comment', () => {
      const success = updateWorkOrderComment(
        {
          workOrderCommentId,
          comment: 'Updated comment',
          commentDateString: '2024-01-02',
          commentTimeString: '10:00'
        },
        testUser
      )
      assert.ok(success, 'Expected updateWorkOrderComment() to succeed')
    })

    await it('updates the work order milestone', () => {
      const success = updateWorkOrderMilestone(
        {
          workOrderMilestoneId,
          workOrderMilestoneTypeId: 1,
          workOrderMilestoneDateString: '2024-01-20',
          workOrderMilestoneDescription: 'Updated milestone'
        },
        testUser
      )
      assert.ok(success, 'Expected updateWorkOrderMilestone() to succeed')
    })

    await it('completes the work order milestone', () => {
      const success = completeWorkOrderMilestone(
        {
          workOrderMilestoneId,
          workOrderMilestoneCompletionDateString: '2024-01-20'
        },
        testUser
      )
      assert.ok(success, 'Expected completeWorkOrderMilestone() to succeed')
    })

    await it('reopens the work order milestone', () => {
      const success = reopenWorkOrderMilestone(workOrderMilestoneId, testUser)
      assert.ok(success, 'Expected reopenWorkOrderMilestone() to succeed')
    })

    await it('updates the work order', () => {
      const success = updateWorkOrder(
        {
          workOrderId: workOrderId.toString(),
          workOrderNumber: '2024-999',
          workOrderTypeId: '1',
          workOrderDescription: 'Updated Work Order',
          workOrderOpenDateString: '2024-01-01'
        },
        testUser
      )
      assert.ok(success, 'Expected updateWorkOrder() to succeed')
    })

    await it('closes the work order', () => {
      const success = closeWorkOrder(
        {
          workOrderId,
          workOrderCloseDateString: '2024-12-31'
        },
        testUser
      )
      assert.ok(success, 'Expected closeWorkOrder() to succeed')
    })

    await it('reopens the work order', () => {
      const success = reopenWorkOrder(workOrderId, testUser)
      assert.ok(success, 'Expected reopenWorkOrder() to succeed')
    })

    await it('verifies the work order is open after reopen', async () => {
      const workOrder = await getWorkOrder(workOrderId, {
        includeBurialSites: false,
        includeComments: false,
        includeMilestones: false
      })
      assert.notStrictEqual(workOrder, undefined, 'Expected work order to be retrievable')
      assert.strictEqual(
        workOrder?.workOrderCloseDate,
        null,
        'Expected work order to be open (no close date)'
      )
    })

    await it('adds a work order burial site', () => {
      const success = addWorkOrderBurialSite(
        {
          workOrderId,
          burialSiteId
        },
        testUser
      )
      assert.ok(success, 'Expected addWorkOrderBurialSite() to succeed')
    })

    await it('adds a work order contract', () => {
      const success = addWorkOrderContract(
        {
          workOrderId,
          contractId
        },
        testUser
      )
      assert.ok(success, 'Expected addWorkOrderContract() to succeed')
    })

    await it('deletes the work order burial site', () => {
      const success = deleteWorkOrderBurialSite(workOrderId, burialSiteId, testUser)
      assert.ok(success, 'Expected deleteWorkOrderBurialSite() to succeed')
    })

    await it('deletes the work order contract', () => {
      const success = deleteWorkOrderContract(workOrderId, contractId, testUser)
      assert.ok(success, 'Expected deleteWorkOrderContract() to succeed')
    })
  })
})
