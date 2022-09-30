import sqlite from "better-sqlite3";

import { lotOccupancyDB as databasePath } from "../../data/databasePaths.js";

import {
    dateIntegerToString,
    dateStringToInteger
} from "@cityssm/expressjs-server-js/dateTimeFns.js";

import { getWorkOrderComments } from "./getWorkOrderComments.js";
import { getLots } from "./getLots.js";
import { getLotOccupancies } from "./getLotOccupancies.js";
import { getWorkOrderMilestones } from "./getWorkOrderMilestones.js";

import type * as recordTypes from "../../types/recordTypes";

interface GetWorkOrdersFilters {
    workOrderTypeId?: number | string;
    workOrderOpenStatus?: "" | "open" | "closed";
    workOrderOpenDateString?: string;
    occupantName?: string;
    lotName?: string;
}

interface GetWorkOrdersOptions {
    limit: number;
    offset: number;
    includeLotsAndLotOccupancies?: boolean;
    includeComments?: boolean;
    includeMilestones?: boolean;
}

export const getWorkOrders = (
    filters?: GetWorkOrdersFilters,
    options?: GetWorkOrdersOptions
): {
    count: number;
    workOrders: recordTypes.WorkOrder[];
} => {
    const database = sqlite(databasePath, {
        readonly: true
    });

    database.function("userFn_dateIntegerToString", dateIntegerToString);

    let sqlWhereClause = " where w.recordDelete_timeMillis is null";
    const sqlParameters = [];

    if (filters.workOrderTypeId) {
        sqlWhereClause += " and w.workOrderTypeId = ?";
        sqlParameters.push(filters.workOrderTypeId);
    }

    if (filters.workOrderOpenStatus) {
        if (filters.workOrderOpenStatus === "open") {
            sqlWhereClause += " and w.workOrderCloseDate is null";
        } else if (filters.workOrderOpenStatus === "closed") {
            sqlWhereClause += " and w.workOrderCloseDate is not null";
        }
    }

    if (filters.workOrderOpenDateString) {
        sqlWhereClause += " and w.workOrderOpenDate = ?";
        sqlParameters.push(dateStringToInteger(filters.workOrderOpenDateString));
    }

    if (filters.occupantName) {
        const occupantNamePieces = filters.occupantName.toLowerCase().split(" ");
        for (const occupantNamePiece of occupantNamePieces) {
            sqlWhereClause +=
                " and w.workOrderId in (" +
                "select workOrderId from WorkOrderLotOccupancies where recordDelete_timeMillis is null and lotOccupancyId in (select lotOccupancyId from LotOccupancyOccupants where recordDelete_timeMillis is null and instr(lower(occupantName), ?)))";
            sqlParameters.push(occupantNamePiece);
        }
    }

    if (filters.lotName) {
        const lotNamePieces = filters.lotName.toLowerCase().split(" ");
        for (const lotNamePiece of lotNamePieces) {
            sqlWhereClause +=
                " and w.workOrderId in (" +
                "select workOrderId from WorkOrderLots where recordDelete_timeMillis is null and lotId in (select lotId from Lots oo where recordDelete_timeMillis is null and instr(lower(lotName), ?)))";
            sqlParameters.push(lotNamePiece);
        }
    }

    const count: number = database
        .prepare("select count(*) as recordCount" + " from WorkOrders w" + sqlWhereClause)
        .get(sqlParameters).recordCount;

    let workOrders: recordTypes.WorkOrder[] = [];

    if (count > 0) {
        workOrders = database
            .prepare(
                "select w.workOrderId," +
                    " w.workOrderTypeId, t.workOrderType," +
                    " w.workOrderNumber, w.workOrderDescription," +
                    " w.workOrderOpenDate, userFn_dateIntegerToString(w.workOrderOpenDate) as workOrderOpenDateString," +
                    " w.workOrderCloseDate, userFn_dateIntegerToString(w.workOrderCloseDate) as workOrderCloseDateString," +
                    " ifnull(m.workOrderMilestoneCount, 0) as workOrderMilestoneCount," +
                    " ifnull(m.workOrderMilestoneCompletionCount, 0) as workOrderMilestoneCompletionCount" +
                    " from WorkOrders w" +
                    " left join WorkOrderTypes t on w.workOrderTypeId = t.workOrderTypeId" +
                    (" left join (select workOrderId," +
                        " count(workOrderMilestoneId) as workOrderMilestoneCount," +
                        " sum(case when workOrderMilestoneCompletionDate is null then 0 else 1 end) as workOrderMilestoneCompletionCount" +
                        " from WorkOrderMilestones" +
                        " where recordDelete_timeMillis is null" +
                        " group by workOrderId) m on w.workOrderId = m.workOrderId") +
                    sqlWhereClause +
                    " order by w.workOrderOpenDate desc, w.workOrderNumber" +
                    (options ? " limit " + options.limit + " offset " + options.offset : "")
            )
            .all(sqlParameters);
    }

    if (
        options.includeComments ||
        options.includeLotsAndLotOccupancies ||
        options.includeMilestones
    ) {
        for (const workOrder of workOrders) {
            if (options.includeComments) {
                workOrder.workOrderComments = getWorkOrderComments(workOrder.workOrderId, database);
            }

            if (options.includeLotsAndLotOccupancies) {
                workOrder.workOrderLots = getLots(
                    {
                        workOrderId: workOrder.workOrderId
                    },
                    {
                        limit: -1,
                        offset: 0
                    },
                    database
                ).lots;

                workOrder.workOrderLotOccupancies = getLotOccupancies(
                    {
                        workOrderId: workOrder.workOrderId
                    },
                    {
                        limit: -1,
                        offset: 0,
                        includeOccupants: true
                    },
                    database
                ).lotOccupancies;
            }

            if (options.includeMilestones) {
                workOrder.workOrderMilestones = getWorkOrderMilestones(
                    {
                        workOrderId: workOrder.workOrderId
                    },
                    {
                        orderBy: "date"
                    },
                    database
                );
            }
        }
    }

    database.close();

    return {
        count,
        workOrders
    };
};

export default getWorkOrders;
