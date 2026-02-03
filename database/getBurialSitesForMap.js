import { dateToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getBurialSitesForMap(cemeteryId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const currentDate = dateToInteger(new Date());
    // Get cemetery info and total burial site count
    const cemeteryInfo = database
        .prepare(/* sql */ `
      SELECT
        c.cemeteryLatitude,
        c.cemeteryLongitude,
        (
          SELECT
            count(*)
          FROM
            BurialSites
          WHERE
            cemeteryId = ?
            AND recordDelete_timeMillis IS NULL
        ) AS totalBurialSites
      FROM
        Cemeteries c
      WHERE
        c.cemeteryId = ?
        AND c.recordDelete_timeMillis IS NULL
    `)
        .get(cemeteryId, cemeteryId);
    // Get all burial sites with coordinates for the cemetery
    const burialSites = database
        .prepare(/* sql */ `
      SELECT
        b.burialSiteId,
        b.burialSiteName,
        b.burialSiteLatitude,
        b.burialSiteLongitude,
        b.cemeteryId,
        cem.cemeteryName
      FROM
        BurialSites b
        LEFT JOIN Cemeteries cem ON b.cemeteryId = cem.cemeteryId
      WHERE
        b.recordDelete_timeMillis IS NULL
        AND b.cemeteryId = ?
        AND b.burialSiteLatitude IS NOT NULL
        AND b.burialSiteLongitude IS NOT NULL
      ORDER BY
        b.burialSiteName
    `)
        .all(cemeteryId);
    // Get active and future contracts for these burial sites
    const contracts = database
        .prepare(/* sql */ `
      SELECT
        c.contractId,
        c.burialSiteId,
        c.contractStartDate,
        c.contractEndDate,
        t.contractType,
        t.isPreneed,
        group_concat(i.deceasedName, ', ') AS deceasedNames
      FROM
        Contracts c
        LEFT JOIN ContractTypes t ON c.contractTypeId = t.contractTypeId
        LEFT JOIN ContractInterments i ON c.contractId = i.contractId
      WHERE
        c.recordDelete_timeMillis IS NULL
        AND c.burialSiteId IN (
          SELECT
            burialSiteId
          FROM
            BurialSites
          WHERE
            cemeteryId = ?
        )
        AND (
          c.contractEndDate IS NULL
          OR c.contractEndDate >= ?
        )
      GROUP BY
        c.contractId,
        c.burialSiteId,
        c.contractStartDate,
        c.contractEndDate,
        t.contractType,
        t.isPreneed
      ORDER BY
        c.contractStartDate
    `)
        .all(cemeteryId, currentDate);
    // Group contracts by burial site
    const contractsByBurialSite = new Map();
    for (const contract of contracts) {
        if (!contractsByBurialSite.has(contract.burialSiteId)) {
            contractsByBurialSite.set(contract.burialSiteId, []);
        }
        contractsByBurialSite.get(contract.burialSiteId).push({
            contractId: contract.contractId,
            contractType: contract.contractType,
            isPreneed: contract.isPreneed,
            contractStartDate: contract.contractStartDate,
            contractEndDate: contract.contractEndDate,
            deceasedNames: contract.deceasedNames
                ? contract.deceasedNames.split(', ')
                : []
        });
    }
    // Attach contracts to burial sites
    for (const site of burialSites) {
        site.contracts = contractsByBurialSite.get(site.burialSiteId) ?? [];
    }
    return {
        burialSites,
        totalBurialSites: cemeteryInfo?.totalBurialSites ?? 0,
        // eslint-disable-next-line unicorn/no-null
        cemeteryLatitude: cemeteryInfo?.cemeteryLatitude ?? null,
        // eslint-disable-next-line unicorn/no-null
        cemeteryLongitude: cemeteryInfo?.cemeteryLongitude ?? null
    };
}
