"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultRecordLimit = void 0;
exports.default = getRecordUpdateLog;
const to_millis_1 = require("@cityssm/to-millis");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const database_helpers_js_1 = require("../helpers/database.helpers.js");
const maxDays = 30;
exports.defaultRecordLimit = 100;
const maxRecordLimit = 500;
function getRecordUpdateLog(filters, options, connectedDatabase) {
    const minimumMillis = Date.now() - (0, to_millis_1.daysToMillis)(maxDays);
    const database = connectedDatabase ?? (0, better_sqlite3_1.default)(database_helpers_js_1.sunriseDB, { readonly: true });
    const recordTableSql = [];
    if (filters.recordType === '' || filters.recordType === 'contract') {
        recordTableSql.push(`select 'contract' as recordType,
        case when r.recordCreate_timeMillis <= r.recordUpdate_timeMillis
          then 'create'
          else 'update' end as updateType,
        r.contractId as displayRecordId,
        r.contractId as recordId,
        t.contractType as recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName
      from Contracts r
      left join ContractTypes t on r.contractTypeId = t.contractTypeId
      where r.recordDelete_timeMillis is null
        and r.recordUpdate_timeMillis >= @minimumMillis`);
    }
    if (filters.recordType === '' ||
        filters.recordType === 'contract' ||
        filters.recordType === 'contractTransactions') {
        recordTableSql.push(`select 'contractTransactions' as recordType,
        case when r.recordCreate_timeMillis = r.recordUpdate_timeMillis
          then 'create'
          else 'update' end as updateType,
        r.contractId as displayRecordId,
        r.contractId as recordId,
        r.transactionNote as recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName
      from ContractTransactions r
      where r.recordDelete_timeMillis is null
        and r.recordUpdate_timeMillis >= @minimumMillis`);
    }
    if (filters.recordType === '' || filters.recordType === 'workOrder') {
        recordTableSql.push(`select 'workOrder' as recordType,
        case when r.recordCreate_timeMillis = r.recordUpdate_timeMillis
          then 'create'
          else 'update' end as updateType,
        workOrderNumber as displayRecordId,
        workOrderId as recordId,
        workOrderDescription as recordDescription,
        recordUpdate_timeMillis,
        recordUpdate_userName
      from WorkOrders r
      where r.recordDelete_timeMillis is null
        and r.recordUpdate_timeMillis >= @minimumMillis`);
    }
    if (filters.recordType === '' ||
        filters.recordType === 'workOrder' ||
        filters.recordType === 'workOrderMilestone') {
        recordTableSql.push(`select 'workOrderMilestone' as recordType,
        case when r.recordCreate_timeMillis = r.recordUpdate_timeMillis
          then 'create'
          else 'update' end as updateType,
        workOrderNumber as displayRecordId,
        r.workOrderId as recordId,
        case when mt.workOrderMilestoneType is null
          then ''
          else mt.workOrderMilestoneType || ' - ' end || r.workOrderMilestoneDescription as recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName
      from WorkOrderMilestones r
      left join WorkOrderMilestoneTypes mt on r.workOrderMilestoneTypeId = mt.workOrderMilestoneTypeId
      left join WorkOrders w on r.workOrderId = w.workOrderId
      where r.recordDelete_timeMillis is null
        and w.recordDelete_timeMillis is null
        and r.recordUpdate_timeMillis >= @minimumMillis`);
    }
    const limit = Math.min(options?.limit ?? exports.defaultRecordLimit, maxRecordLimit);
    const offset = options?.offset ?? 0;
    const result = database
        .prepare(`${recordTableSql.join(' union all ')}

        order by r.recordUpdate_timeMillis desc
        limit @limit offset @offset`)
        .all({
        minimumMillis,
        limit,
        offset
    });
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result;
}
