import { dateToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getBurialSiteDeceasedNames(burialSiteIds) {
    if (burialSiteIds.length === 0) {
        return [];
    }
    const database = sqlite(sunriseDB, { readonly: true });
    const currentDate = dateToInteger(new Date());
    try {
        // Create placeholders for the IN clause
        const placeholders = burialSiteIds.map(() => '?').join(',');
        // Get deceased names for burial sites with active contracts
        // eslint-disable-next-line sonarjs/sql-queries -- the query is parameterized and properly formatted
        const rows = database
            .prepare(/* sql */ `
        SELECT
          c.burialSiteId,
          ci.deceasedName
        FROM
          Contracts c
          INNER JOIN ContractInterments ci ON c.contractId = ci.contractId
        WHERE
          c.recordDelete_timeMillis IS NULL
          AND ci.recordDelete_timeMillis IS NULL
          AND c.burialSiteId IS NOT NULL
          AND c.burialSiteId IN (${placeholders})
          AND c.contractStartDate <= ?
          AND (
            c.contractEndDate IS NULL
            OR c.contractEndDate >= ?
          )
        ORDER BY
          c.burialSiteId,
          ci.deceasedName
      `)
            .all(...burialSiteIds, currentDate, currentDate);
        // Group deceased names by burial site
        const intermentMap = new Map();
        for (const row of rows) {
            if (!intermentMap.has(row.burialSiteId)) {
                intermentMap.set(row.burialSiteId, []);
            }
            intermentMap.get(row.burialSiteId)?.push(row.deceasedName);
        }
        return [...intermentMap.entries()].map(([burialSiteId, deceasedNames]) => ({
            burialSiteId,
            deceasedNames
        }));
    }
    finally {
        database.close();
    }
}
