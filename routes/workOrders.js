import { Router } from 'express';
import { updateWorkOrdersGetHandler, updateWorkOrdersPostHandler } from '../handlers/permissions.js';
import handler_byWorkOrderNumber from '../handlers/workOrders-get/byWorkOrderNumber.js';
import handler_edit from '../handlers/workOrders-get/edit.js';
import handler_milestoneCalendar from '../handlers/workOrders-get/milestoneCalendar.js';
import handler_new from '../handlers/workOrders-get/new.js';
import handler_outlook from '../handlers/workOrders-get/outlook.js';
import handler_search from '../handlers/workOrders-get/search.js';
import handler_view from '../handlers/workOrders-get/view.js';
import handler_workday from '../handlers/workOrders-get/workday.js';
import handler_doAddWorkOrderBurialSite from '../handlers/workOrders-post/doAddWorkOrderBurialSite.js';
import handler_doAddWorkOrderComment from '../handlers/workOrders-post/doAddWorkOrderComment.js';
import handler_doAddWorkOrderContract from '../handlers/workOrders-post/doAddWorkOrderContract.js';
import handler_doAddWorkOrderMilestone from '../handlers/workOrders-post/doAddWorkOrderMilestone.js';
import handler_doCloseWorkdayWorkOrder from '../handlers/workOrders-post/doCloseWorkdayWorkOrder.js';
import handler_doCloseWorkOrder from '../handlers/workOrders-post/doCloseWorkOrder.js';
import handler_doCompleteWorkdayWorkOrderMilestone from '../handlers/workOrders-post/doCompleteWorkdayWorkOrderMilestone.js';
import handler_doCompleteWorkOrderMilestone from '../handlers/workOrders-post/doCompleteWorkOrderMilestone.js';
import handler_doCreateWorkOrder from '../handlers/workOrders-post/doCreateWorkOrder.js';
import handler_doDeleteWorkOrder from '../handlers/workOrders-post/doDeleteWorkOrder.js';
import handler_doDeleteWorkOrderBurialSite from '../handlers/workOrders-post/doDeleteWorkOrderBurialSite.js';
import handler_doDeleteWorkOrderComment from '../handlers/workOrders-post/doDeleteWorkOrderComment.js';
import handler_doDeleteWorkOrderContract from '../handlers/workOrders-post/doDeleteWorkOrderContract.js';
import handler_doDeleteWorkOrderMilestone from '../handlers/workOrders-post/doDeleteWorkOrderMilestone.js';
import handler_doGetWorkdayReport from '../handlers/workOrders-post/doGetWorkdayReport.js';
import handler_doGetWorkOrderMilestones from '../handlers/workOrders-post/doGetWorkOrderMilestones.js';
import handler_doReopenWorkdayWorkOrderMilestone from '../handlers/workOrders-post/doReopenWorkdayWorkOrderMilestone.js';
import handler_doReopenWorkOrder from '../handlers/workOrders-post/doReopenWorkOrder.js';
import handler_doReopenWorkOrderMilestone from '../handlers/workOrders-post/doReopenWorkOrderMilestone.js';
import handler_doSearchWorkOrders from '../handlers/workOrders-post/doSearchWorkOrders.js';
import handler_doUpdateBurialSiteStatus from '../handlers/workOrders-post/doUpdateBurialSiteStatus.js';
import handler_doUpdateWorkOrder from '../handlers/workOrders-post/doUpdateWorkOrder.js';
import handler_doUpdateWorkOrderComment from '../handlers/workOrders-post/doUpdateWorkOrderComment.js';
import handler_doUpdateWorkOrderMilestone from '../handlers/workOrders-post/doUpdateWorkOrderMilestone.js';
export const router = Router();
// Search
router.get('/', handler_search);
router.post('/doSearchWorkOrders', handler_doSearchWorkOrders);
// Milestone Calendar
router.get('/milestoneCalendar', handler_milestoneCalendar);
router.post('/doGetWorkOrderMilestones', handler_doGetWorkOrderMilestones);
// Outlook Integration
router.get('/outlook', handler_outlook);
// Workday
router.get('/workday', handler_workday);
router.post('/doGetWorkdayReport', handler_doGetWorkdayReport);
router.post('/doCompleteWorkdayWorkOrderMilestone', updateWorkOrdersPostHandler, handler_doCompleteWorkdayWorkOrderMilestone);
router.post('/doReopenWorkdayWorkOrderMilestone', updateWorkOrdersPostHandler, handler_doReopenWorkdayWorkOrderMilestone);
router.post('/doCloseWorkdayWorkOrder', updateWorkOrdersPostHandler, handler_doCloseWorkdayWorkOrder);
// New
router.get('/new', updateWorkOrdersGetHandler, handler_new);
router.post('/doCreateWorkOrder', updateWorkOrdersPostHandler, handler_doCreateWorkOrder);
// View
router.get('/byWorkOrderNumber/:workOrderNumber', handler_byWorkOrderNumber);
router.get('/:workOrderId', handler_view);
router.post('/doReopenWorkOrder', updateWorkOrdersPostHandler, handler_doReopenWorkOrder);
// Edit
router.get('/:workOrderId/edit', updateWorkOrdersGetHandler, handler_edit);
router.post('/doUpdateWorkOrder', updateWorkOrdersPostHandler, handler_doUpdateWorkOrder);
router.post('/doCloseWorkOrder', updateWorkOrdersPostHandler, handler_doCloseWorkOrder);
router.post('/doDeleteWorkOrder', updateWorkOrdersPostHandler, handler_doDeleteWorkOrder);
// Burial Site Contract
router.post('/doAddWorkOrderContract', updateWorkOrdersPostHandler, handler_doAddWorkOrderContract);
router.post('/doDeleteWorkOrderContract', updateWorkOrdersPostHandler, handler_doDeleteWorkOrderContract);
router.post('/doAddWorkOrderBurialSite', updateWorkOrdersPostHandler, handler_doAddWorkOrderBurialSite);
router.post('/doUpdateBurialSiteStatus', updateWorkOrdersPostHandler, handler_doUpdateBurialSiteStatus);
router.post('/doDeleteWorkOrderBurialSite', updateWorkOrdersPostHandler, handler_doDeleteWorkOrderBurialSite);
// Comments
router.post('/doAddWorkOrderComment', updateWorkOrdersPostHandler, handler_doAddWorkOrderComment);
router.post('/doUpdateWorkOrderComment', updateWorkOrdersPostHandler, handler_doUpdateWorkOrderComment);
router.post('/doDeleteWorkOrderComment', updateWorkOrdersPostHandler, handler_doDeleteWorkOrderComment);
// Milestones
router.post('/doAddWorkOrderMilestone', updateWorkOrdersPostHandler, handler_doAddWorkOrderMilestone);
router.post('/doUpdateWorkOrderMilestone', updateWorkOrdersPostHandler, handler_doUpdateWorkOrderMilestone);
router.post('/doCompleteWorkOrderMilestone', updateWorkOrdersPostHandler, handler_doCompleteWorkOrderMilestone);
router.post('/doReopenWorkOrderMilestone', updateWorkOrdersPostHandler, handler_doReopenWorkOrderMilestone);
router.post('/doDeleteWorkOrderMilestone', updateWorkOrdersPostHandler, handler_doDeleteWorkOrderMilestone);
export default router;
