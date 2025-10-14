import { dateToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getBurialSitesForMap(cemeteryId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const currentDate = dateToInteger(new Date());
    // Get all burial sites with coordinates for the cemetery
    const burialSites = database
        .prepare(`select b.burialSiteId,
        b.burialSiteName,
        b.burialSiteLatitude,
        b.burialSiteLongitude,
        b.cemeteryId,
        cem.cemeteryName
      from BurialSites b
      left join Cemeteries cem on b.cemeteryId = cem.cemeteryId
      where b.recordDelete_timeMillis is null
        and b.cemeteryId = ?
        and b.burialSiteLatitude is not null
        and b.burialSiteLongitude is not null
      order by b.burialSiteName`)
        .all(cemeteryId);
    // Get active and future contracts for these burial sites
    const contracts = database
        .prepare(`select c.contractId,
        c.burialSiteId,
        c.contractNumber,
        c.contractStartDate,
        c.contractEndDate,
        t.contractType,
        t.isPreneed,
        group_concat(i.deceasedName, ', ') as deceasedNames
      from Contracts c
      left join ContractTypes t on c.contractTypeId = t.contractTypeId
      left join ContractInterments i on c.contractId = i.contractId
      where c.recordDelete_timeMillis is null
        and c.burialSiteId in (select burialSiteId from BurialSites where cemeteryId = ?)
        and (c.contractEndDate is null or c.contractEndDate >= ?)
      group by c.contractId, c.burialSiteId, c.contractNumber, c.contractStartDate, c.contractEndDate, t.contractType, t.isPreneed
      order by c.contractStartDate`)
        .all(cemeteryId, currentDate);
    // Group contracts by burial site
    const contractsByBurialSite = new Map();
    for (const contract of contracts) {
        if (!contractsByBurialSite.has(contract.burialSiteId)) {
            contractsByBurialSite.set(contract.burialSiteId, []);
        }
        contractsByBurialSite.get(contract.burialSiteId).push({
            contractId: contract.contractId,
            contractNumber: contract.contractNumber,
            contractType: contract.contractType,
            isPreneed: contract.isPreneed,
            contractStartDate: contract.contractStartDate,
            contractEndDate: contract.contractEndDate,
            deceasedNames: contract.deceasedNames ? contract.deceasedNames.split(', ') : []
        });
    }
    // Attach contracts to burial sites
    for (const site of burialSites) {
        site.contracts = contractsByBurialSite.get(site.burialSiteId) ?? [];
    }
    return burialSites;
}
