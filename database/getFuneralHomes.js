import { dateToInteger } from '@cityssm/utils-datetime';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { getDatabaseConnection } from '../helpers/database.helpers.js';
export default function getFuneralHomes(shouldIncludeCounts = true, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection(true);
    const currentDateNumber = dateToInteger(new Date());
    let funeralHomes;
    if (shouldIncludeCounts) {
        funeralHomes = database
            .prepare(`
        SELECT
          f.funeralHomeId,
          f.funeralHomeKey,
          f.funeralHomeName,
          f.funeralHomeAddress1,
          f.funeralHomeAddress2,
          f.funeralHomeCity,
          f.funeralHomeProvince,
          f.funeralHomePostalCode,
          f.funeralHomePhoneNumber,
          ${getConfigProperty('integrations.portal.integrationIsEnabled')
            ? 'f.isAvailableOnPortal'
            : '0 as isAvailableOnPortal'},
          COUNT(c.contractId) AS upcomingFuneralCount,
          COALESCE(openWorkOrders.openWorkOrderCount, 0) AS openWorkOrderCount
        FROM
          FuneralHomes f
          LEFT JOIN Contracts c ON f.funeralHomeId = c.funeralHomeId
          AND c.recordDelete_timeMillis IS NULL
          AND c.funeralDate >= ?
          LEFT JOIN (
            SELECT
              cw.funeralHomeId,
              COUNT(wo.workOrderId) AS openWorkOrderCount
            FROM
              Contracts cw
              INNER JOIN WorkOrderContracts wc ON cw.contractId = wc.contractId
              INNER JOIN WorkOrders wo ON wo.workOrderId = wc.workOrderId
            WHERE
              cw.recordDelete_timeMillis IS NULL
              AND wc.recordDelete_timeMillis IS NULL
              AND wo.recordDelete_timeMillis IS NULL
              AND wo.workOrderCloseDate IS NULL
            GROUP BY
              cw.funeralHomeId
          ) AS openWorkOrders ON f.funeralHomeId = openWorkOrders.funeralHomeId
        WHERE
          f.recordDelete_timeMillis IS NULL
        GROUP BY
          f.funeralHomeId,
          f.funeralHomeKey,
          f.funeralHomeName,
          f.funeralHomeAddress1,
          f.funeralHomeAddress2,
          f.funeralHomeCity,
          f.funeralHomeProvince,
          f.funeralHomePostalCode,
          f.funeralHomePhoneNumber,
          f.isAvailableOnPortal
        ORDER BY
          f.funeralHomeName,
          f.funeralHomeId
      `)
            .all(currentDateNumber);
    }
    else {
        funeralHomes = database
            .prepare(`
        SELECT
          f.funeralHomeId,
          f.funeralHomeKey,
          f.funeralHomeName,
          f.funeralHomeAddress1,
          f.funeralHomeAddress2,
          f.funeralHomeCity,
          f.funeralHomeProvince,
          f.funeralHomePostalCode,
          f.funeralHomePhoneNumber,
          ${getConfigProperty('integrations.portal.integrationIsEnabled')
            ? 'f.isAvailableOnPortal'
            : '0 as isAvailableOnPortal'}
        FROM
          FuneralHomes f
        WHERE
          f.recordDelete_timeMillis IS NULL
        ORDER BY
          f.funeralHomeName,
          f.funeralHomeId
      `)
            .all();
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return funeralHomes;
}
