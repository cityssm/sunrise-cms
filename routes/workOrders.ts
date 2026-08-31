import { Router } from 'express'

import handler_doGetRecordAuditLog from '../handlers/commonPost/doGetRecordAuditLog.js'
import {
  updateWorkOrdersGetHandler,
  updateWorkOrdersPostHandler
} from '../handlers/permissions.js'
import handler_byWorkOrderNumber from '../handlers/workOrdersGet/byWorkOrderNumber.js'
import handler_edit from '../handlers/workOrdersGet/edit.js'
import handler_ical from '../handlers/workOrdersGet/ical.js'
import handler_milestoneCalendar from '../handlers/workOrdersGet/milestoneCalendar.js'
import handler_new from '../handlers/workOrdersGet/new.js'
import handler_search from '../handlers/workOrdersGet/search.js'
import handler_view from '../handlers/workOrdersGet/view.js'
import handler_workday from '../handlers/workOrdersGet/workday.js'
import handler_doAddWorkOrderBurialSite from '../handlers/workOrdersPost/doAddWorkOrderBurialSite.js'
import handler_doAddWorkOrderComment from '../handlers/workOrdersPost/doAddWorkOrderComment.js'
import handler_doAddWorkOrderContract from '../handlers/workOrdersPost/doAddWorkOrderContract.js'
import handler_doAddWorkOrderMilestone from '../handlers/workOrdersPost/doAddWorkOrderMilestone.js'
import handler_doCloseWorkdayWorkOrder from '../handlers/workOrdersPost/doCloseWorkdayWorkOrder.js'
import handler_doCloseWorkOrder from '../handlers/workOrdersPost/doCloseWorkOrder.js'
import handler_doCompleteWorkdayWorkOrderMilestone from '../handlers/workOrdersPost/doCompleteWorkdayWorkOrderMilestone.js'
import handler_doCompleteWorkOrderMilestone from '../handlers/workOrdersPost/doCompleteWorkOrderMilestone.js'
import handler_doCreateWorkOrder from '../handlers/workOrdersPost/doCreateWorkOrder.js'
import handler_doDeleteWorkOrder from '../handlers/workOrdersPost/doDeleteWorkOrder.js'
import handler_doDeleteWorkOrderBurialSite from '../handlers/workOrdersPost/doDeleteWorkOrderBurialSite.js'
import handler_doDeleteWorkOrderComment from '../handlers/workOrdersPost/doDeleteWorkOrderComment.js'
import handler_doDeleteWorkOrderContract from '../handlers/workOrdersPost/doDeleteWorkOrderContract.js'
import handler_doDeleteWorkOrderMilestone from '../handlers/workOrdersPost/doDeleteWorkOrderMilestone.js'
import handler_doGetWorkdayReport from '../handlers/workOrdersPost/doGetWorkdayReport.js'
import handler_doGetWorkOrderMilestones from '../handlers/workOrdersPost/doGetWorkOrderMilestones.js'
import handler_doReopenWorkdayWorkOrderMilestone from '../handlers/workOrdersPost/doReopenWorkdayWorkOrderMilestone.js'
import handler_doReopenWorkOrder from '../handlers/workOrdersPost/doReopenWorkOrder.js'
import handler_doReopenWorkOrderMilestone from '../handlers/workOrdersPost/doReopenWorkOrderMilestone.js'
import handler_doSearchWorkOrders from '../handlers/workOrdersPost/doSearchWorkOrders.js'
import handler_doUpdateBurialSiteStatus from '../handlers/workOrdersPost/doUpdateBurialSiteStatus.js'
import handler_doUpdateWorkdayWorkOrderMilestoneTime from '../handlers/workOrdersPost/doUpdateWorkdayWorkOrderMilestoneTime.js'
import handler_doUpdateWorkOrder from '../handlers/workOrdersPost/doUpdateWorkOrder.js'
import handler_doUpdateWorkOrderComment from '../handlers/workOrdersPost/doUpdateWorkOrderComment.js'
import handler_doUpdateWorkOrderMilestone from '../handlers/workOrdersPost/doUpdateWorkOrderMilestone.js'
import { getConfigProperty } from '../helpers/config.helpers.js'

export default function getWorkOrdersRouter(): Router {
  const router = Router()

  // Search

  router
    .get('/', handler_search)
    .post('/doSearchWorkOrders', handler_doSearchWorkOrders)

  // Milestone Calendar

  router
    .get('/milestoneCalendar', handler_milestoneCalendar)
    .post('/doGetWorkOrderMilestones', handler_doGetWorkOrderMilestones)

  // iCalendar Integration

  router.get('/ical', handler_ical)

  // Workday

  router
    .get('/workday', handler_workday)
    .post('/doGetWorkdayReport', handler_doGetWorkdayReport)
    .post(
      '/doCompleteWorkdayWorkOrderMilestone',
      updateWorkOrdersPostHandler,
      handler_doCompleteWorkdayWorkOrderMilestone
    )
    .post(
      '/doReopenWorkdayWorkOrderMilestone',
      updateWorkOrdersPostHandler,
      handler_doReopenWorkdayWorkOrderMilestone
    )
    .post(
      '/doUpdateWorkdayWorkOrderMilestoneTime',
      updateWorkOrdersPostHandler,
      handler_doUpdateWorkdayWorkOrderMilestoneTime
    )
    .post(
      '/doCloseWorkdayWorkOrder',
      updateWorkOrdersPostHandler,
      handler_doCloseWorkdayWorkOrder
    )

  // New

  router
    .get('/new', updateWorkOrdersGetHandler, handler_new)
    .post(
      '/doCreateWorkOrder',
      updateWorkOrdersPostHandler,
      handler_doCreateWorkOrder
    )

  // View

  router.get('/byWorkOrderNumber/:workOrderNumber', handler_byWorkOrderNumber)

  router
    .get('/:workOrderId', handler_view)
    .post(
      '/doReopenWorkOrder',
      updateWorkOrdersPostHandler,
      handler_doReopenWorkOrder
    )

  // Edit

  router
    .get('/:workOrderId/edit', updateWorkOrdersGetHandler, handler_edit)
    .post(
      '/doUpdateWorkOrder',
      updateWorkOrdersPostHandler,
      handler_doUpdateWorkOrder
    )
    .post(
      '/doCloseWorkOrder',
      updateWorkOrdersPostHandler,
      handler_doCloseWorkOrder
    )
    .post(
      '/doDeleteWorkOrder',
      updateWorkOrdersPostHandler,
      handler_doDeleteWorkOrder
    )

  // Burial Site Contract

  router
    .post(
      '/doAddWorkOrderContract',
      updateWorkOrdersPostHandler,
      handler_doAddWorkOrderContract
    )
    .post(
      '/doDeleteWorkOrderContract',
      updateWorkOrdersPostHandler,
      handler_doDeleteWorkOrderContract
    )
    .post(
      '/doAddWorkOrderBurialSite',
      updateWorkOrdersPostHandler,
      handler_doAddWorkOrderBurialSite
    )
    .post(
      '/doUpdateBurialSiteStatus',
      updateWorkOrdersPostHandler,
      handler_doUpdateBurialSiteStatus
    )
    .post(
      '/doDeleteWorkOrderBurialSite',
      updateWorkOrdersPostHandler,
      handler_doDeleteWorkOrderBurialSite
    )

  // Comments

  router
    .post(
      '/doAddWorkOrderComment',
      updateWorkOrdersPostHandler,
      handler_doAddWorkOrderComment
    )
    .post(
      '/doUpdateWorkOrderComment',
      updateWorkOrdersPostHandler,
      handler_doUpdateWorkOrderComment
    )
    .post(
      '/doDeleteWorkOrderComment',
      updateWorkOrdersPostHandler,
      handler_doDeleteWorkOrderComment
    )

  // Milestones

  router
    .post(
      '/doAddWorkOrderMilestone',
      updateWorkOrdersPostHandler,
      handler_doAddWorkOrderMilestone
    )
    .post(
      '/doUpdateWorkOrderMilestone',
      updateWorkOrdersPostHandler,
      handler_doUpdateWorkOrderMilestone
    )
    .post(
      '/doCompleteWorkOrderMilestone',
      updateWorkOrdersPostHandler,
      handler_doCompleteWorkOrderMilestone
    )
    .post(
      '/doReopenWorkOrderMilestone',
      updateWorkOrdersPostHandler,
      handler_doReopenWorkOrderMilestone
    )
    .post(
      '/doDeleteWorkOrderMilestone',
      updateWorkOrdersPostHandler,
      handler_doDeleteWorkOrderMilestone
    )

  // Audit Log

  if (getConfigProperty('settings.auditLog.enabled')) {
    router.post(
      '/doGetRecordAuditLog',
      updateWorkOrdersPostHandler,
      handler_doGetRecordAuditLog('workOrder')
    )
  }

  return router
}
